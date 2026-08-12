/**
 * Adds realistic sample inventory (airports, airlines, flights, hotels,
 * cars, transfers) to the REAL Firestore project — no service-account key
 * needed. This authenticates with the Firebase Auth **client** SDK using
 * your own Voyago admin email/password (the same login your admin
 * dashboard uses), then writes through the Firestore **client** SDK. Since
 * `firestore.rules` already grants `allow write: if isAdmin()` on the
 * inventory collections, and your account already has `role: "admin"` in
 * Firestore, those writes are allowed — no elevated credential of any kind
 * is generated or stored. Your password is only ever read locally by this
 * process to sign in; it is never written to disk or logged.
 *
 * This script is intentionally separate from scripts/seed.ts (the emulator
 * seeder):
 *  - It NEVER deletes anything. It only adds documents. Your real `users`,
 *    `bookings`, `coupons`, `reviews`, `notifications`, and `settings`
 *    collections are never touched.
 *  - It creates no Firebase Auth users — it only writes Firestore inventory
 *    documents that the existing search/results/details pages already know
 *    how to read (same collections, same field shapes as scripts/seed.ts).
 *  - Airports and airlines use their IATA code as the document ID, so
 *    re-running the script is safe for those two collections (it just
 *    overwrites the same docs). Flights/hotels/cars/transfers use
 *    auto-generated IDs, so the script refuses to run a second time unless
 *    you pass --force, to avoid creating duplicate inventory.
 *
 * Usage — just one command, no setup:
 *   npm run seed:production
 * You'll be prompted for your Voyago admin email and password (hidden as
 * you type). Reads Firebase project config from .env.local, the same file
 * the app itself uses.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as readline from 'node:readline';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, limit, query, setDoc } from 'firebase/firestore';
import {
  AIRPORTS, AIRLINES, FLIGHT_ROUTES, AIRCRAFT_SHORT, AIRCRAFT_LONG, makeFares,
  HOTELS, AMENITY_POOL, SUPPLIERS, CARS, CAR_CITIES, CATEGORY_BASE_PRICE, FEATURE_POOL,
  TRANSFER_AIRPORTS, randomInt, pick, round2, daysFromNow, addMinutes, picsum,
} from './seedData';

const EXPECTED_PROJECT_ID = 'voyago-7c088';
const force = process.argv.includes('--force');

// ───────────────────────────── .env.local ─────────────────────────────
function loadEnvLocal(): Record<string, string> {
  const path = resolve(process.cwd(), '.env.local');
  if (!existsSync(path)) return {};
  const env: Record<string, string> = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}
const fileEnv = loadEnvLocal();
function envVar(key: string): string | undefined {
  return process.env[key] ?? fileEnv[key];
}

// ───────────────────────────── prompts ─────────────────────────────
function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolvePromise) => rl.question(question, (answer) => { rl.close(); resolvePromise(answer.trim()); }));
}

// Char codes for the control keys we care about, spelled out numerically so
// no unprintable bytes need to live in this source file.
const CHAR_CODE_ENTER_LF = 10; // \n
const CHAR_CODE_ENTER_CR = 13; // \r
const CHAR_CODE_CTRL_C = 3;
const CHAR_CODE_EOF = 4; // Ctrl+D
const CHAR_CODE_BACKSPACE = 127; // DEL, what most terminals send for Backspace
const CHAR_CODE_BACKSPACE_ALT = 8; // \b, some terminals send this instead

/** Prompts on the same line, masking input as it's typed. Falls back to a plain prompt in non-interactive terminals. */
function promptHidden(question: string): Promise<string> {
  if (!process.stdin.isTTY) return prompt(question);
  return new Promise((resolvePromise) => {
    process.stdout.write(question);
    let input = '';
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    function onData(char: string) {
      const code = char.charCodeAt(0);
      if (code === CHAR_CODE_ENTER_LF || code === CHAR_CODE_ENTER_CR || code === CHAR_CODE_EOF) {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', onData);
        process.stdout.write('\n');
        resolvePromise(input);
        return;
      }
      if (code === CHAR_CODE_CTRL_C) {
        process.stdout.write('\n');
        process.exit(1);
      }
      if (code === CHAR_CODE_BACKSPACE || code === CHAR_CODE_BACKSPACE_ALT) {
        input = input.slice(0, -1);
        return;
      }
      input += char;
    }
    stdin.on('data', onData);
  });
}

// ───────────────────────────────── main ─────────────────────────────────
async function main() {
  const projectId = envVar('VITE_FIREBASE_PROJECT_ID');
  if (projectId !== EXPECTED_PROJECT_ID) {
    console.error(
      `Refusing to run: .env.local's VITE_FIREBASE_PROJECT_ID is "${projectId ?? '(missing)'}", expected "${EXPECTED_PROJECT_ID}".\n` +
        'This guards against accidentally seeding the wrong Firebase project.',
    );
    process.exit(1);
  }

  const firebaseConfig = {
    apiKey: envVar('VITE_FIREBASE_API_KEY'),
    authDomain: envVar('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId,
    messagingSenderId: envVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: envVar('VITE_FIREBASE_APP_ID'),
  };
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.appId) {
    console.error('Missing Firebase config in .env.local (apiKey/authDomain/appId). Copy .env.example to .env.local first.');
    process.exit(1);
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log(`Seeding sample inventory into the REAL Firestore project "${EXPECTED_PROJECT_ID}".\n`);
  console.log('Sign in with your Voyago ADMIN account (the same login your admin dashboard uses).\n');

  const email = envVar('VOYAGO_ADMIN_EMAIL') ?? (await prompt('Admin email: '));
  const password = envVar('VOYAGO_ADMIN_PASSWORD') ?? (await promptHidden('Admin password: '));

  let uid: string;
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    uid = cred.user.uid;
  } catch (error) {
    console.error('\nSign-in failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }

  const profileSnap = await getDoc(doc(db, 'users', uid));
  if (!profileSnap.exists() || profileSnap.data().role !== 'admin') {
    console.error(
      "\nSigned in successfully, but this account's Firestore profile does not have role: \"admin\".\n" +
        'Only admin accounts are allowed to write inventory data under the current Firestore rules — sign in with your admin account instead.',
    );
    await signOut(auth);
    process.exit(1);
  }
  console.log(`Signed in as ${email} (confirmed admin).\n`);

  const existingFlights = await getDocs(query(collection(db, 'flights'), limit(1)));
  if (!existingFlights.empty && !force) {
    console.error(
      'The "flights" collection already has data. Re-running would create duplicate inventory.\n' +
        'Pass --force if you really want to add another full batch on top of what exists:\n' +
        '  npm run seed:production -- --force',
    );
    await signOut(auth);
    process.exit(1);
  }

  const now = Date.now();

  // ---- Airports (deterministic IDs — safe to re-run) ----
  console.log(`Upserting ${AIRPORTS.length} airports…`);
  for (const a of AIRPORTS) {
    await setDoc(doc(db, 'airports', a.code), { ...a, createdAt: now, updatedAt: now }, { merge: true });
  }

  // ---- Airlines (deterministic IDs — safe to re-run) ----
  console.log(`Upserting ${AIRLINES.length} airlines…`);
  for (const a of AIRLINES) {
    await setDoc(doc(db, 'airlines', a.code), { ...a, logoUrl: null, createdAt: now, updatedAt: now }, { merge: true });
  }

  // ---- Flights ----
  // Fixed day offsets (rather than random ones) so the flight search form's
  // own default departure date (today + 14 days — see FlightSearchForm.tsx)
  // reliably matches at least one seeded flight per route on the first try,
  // instead of requiring the visitor to guess a random date.
  console.log('Creating flights…');
  const FLIGHT_DAY_OFFSETS = [7, 14, 21, 28];
  let flightCount = 0;
  for (const route of FLIGHT_ROUTES) {
    const airline = AIRLINES.find((a) => a.code === route.airline)!;
    for (const dayOffset of FLIGHT_DAY_OFFSETS) {
      const departureHour = randomInt(6, 21);
      const departureTime = daysFromNow(dayOffset, departureHour, pick([0, 15, 30, 45]));
      const arrivalTime = addMinutes(departureTime, route.durationMin);
      const flightNumber = `${route.airline}${randomInt(100, 1999)}`;
      const ref = doc(collection(db, 'flights'));
      await setDoc(ref, {
        airlineId: route.airline,
        airlineCode: route.airline,
        airlineName: airline.name,
        flightNumber,
        originCode: route.origin,
        destinationCode: route.destination,
        departureTime,
        arrivalTime,
        durationMinutes: route.durationMin,
        stops: route.stops ?? 0,
        layoverAirportCodes: [],
        aircraft: route.durationMin > 300 ? pick(AIRCRAFT_LONG) : pick(AIRCRAFT_SHORT),
        price: round2(route.basePrice),
        fares: makeFares(route.basePrice, Boolean(route.hasFirst)),
        baggageChecked: route.durationMin > 300 ? '2 x 23kg' : '1 x 23kg',
        baggageCabin: '1 x 8kg',
        cancellationPolicy: 'Free cancellation up to 48 hours before departure. Fare rules apply after.',
        status: 'scheduled',
        createdAt: now,
        updatedAt: now,
      });
      flightCount++;
    }
  }
  console.log(`  created ${flightCount} flights (${FLIGHT_ROUTES.length} routes × ${FLIGHT_DAY_OFFSETS.length} dates each: +${FLIGHT_DAY_OFFSETS.join('/+')} days from today)`);

  // ---- Hotels + Rooms ----
  console.log('Creating hotels and rooms…');
  for (const h of HOTELS) {
    const amenities = [...new Set([...AMENITY_POOL].sort(() => Math.random() - 0.5).slice(0, randomInt(5, 9)))];
    const breakfastIncluded = Math.random() > 0.4;
    const freeCancellation = Math.random() > 0.3;
    const basePrice = h.star * randomInt(28, 42) + randomInt(-10, 20);
    const hotelRef = doc(collection(db, 'hotels'));
    await setDoc(hotelRef, {
      name: h.name,
      description: `A ${h.star}-star ${h.type} in the heart of ${h.city}, offering comfortable stays for business and leisure travelers alike.`,
      city: h.city,
      citySearch: h.city.toLowerCase(),
      country: h.country,
      address: `${randomInt(1, 200)} ${pick(['Main Street', 'Central Avenue', 'Harbor Road', 'Old Town Square', 'Riverside Boulevard'])}, ${h.city}`,
      latitude: round2(randomInt(-60, 60) + Math.random()),
      longitude: round2(randomInt(-120, 120) + Math.random()),
      starRating: h.star,
      reviewScore: round2(randomInt(72, 96) / 10),
      reviewCount: randomInt(24, 860),
      propertyType: h.type,
      amenities,
      images: [picsum(`voyago-hotel-${hotelRef.id}-1`, 900, 600), picsum(`voyago-hotel-${hotelRef.id}-2`, 900, 600), picsum(`voyago-hotel-${hotelRef.id}-3`, 900, 600)],
      pricePerNight: round2(basePrice),
      breakfastIncluded,
      freeCancellation,
      createdAt: now,
      updatedAt: now,
    });

    const roomTypes = [
      { name: 'Classic Double Room', guests: 2, bed: '1 queen bed', sqm: 22, priceMult: 1 },
      { name: 'Deluxe Suite', guests: 3, bed: '1 king bed + sofa bed', sqm: 38, priceMult: 1.7 },
    ];
    for (const rt of roomTypes) {
      const roomRef = doc(collection(db, 'hotels', hotelRef.id, 'rooms'));
      await setDoc(roomRef, {
        hotelId: hotelRef.id,
        name: rt.name,
        description: `${rt.name} with ${rt.bed.toLowerCase()}, ideal for up to ${rt.guests} guests.`,
        maxGuests: rt.guests,
        bedType: rt.bed,
        sizeSqm: rt.sqm,
        images: [picsum(`voyago-room-${roomRef.id}-1`, 800, 533), picsum(`voyago-room-${roomRef.id}-2`, 800, 533)],
        amenities: amenities.slice(0, 4),
        breakfastIncluded,
        freeCancellation,
        pricePerNight: round2(basePrice * rt.priceMult),
        totalUnits: randomInt(2, 6),
        createdAt: now,
        updatedAt: now,
      });
    }
  }
  console.log(`  created ${HOTELS.length} hotels with ${HOTELS.length * 2} rooms`);

  // ---- Car suppliers ----
  console.log('Creating car suppliers…');
  const supplierIds: Record<string, string> = {};
  for (const name of SUPPLIERS) {
    const ref = doc(collection(db, 'carSuppliers'));
    supplierIds[name] = ref.id;
    await setDoc(ref, { name, logoUrl: null, rating: round2(randomInt(35, 49) / 10), createdAt: now, updatedAt: now });
  }

  // ---- Cars ----
  console.log('Creating cars…');
  for (const c of CARS) {
    const city = pick(CAR_CITIES);
    const supplierName = pick(SUPPLIERS);
    const priceBase = CATEGORY_BASE_PRICE[c.category] + randomInt(-6, 10);
    const carRef = doc(collection(db, 'cars'));
    await setDoc(carRef, {
      supplierId: supplierIds[supplierName],
      supplierName,
      make: c.make,
      model: c.model,
      category: c.category,
      transmission: c.transmission,
      seats: c.seats,
      doors: c.doors,
      fuelType: c.fuel,
      mileagePolicy: Math.random() > 0.5 ? 'Unlimited mileage' : '200 km/day included, €0.25/km after',
      images: [picsum(`voyago-car-${carRef.id}-1`, 800, 533), picsum(`voyago-car-${carRef.id}-2`, 800, 533)],
      pickupCity: city,
      pickupCitySearch: city.toLowerCase(),
      pickupLocation: `${city} Airport`,
      features: [...new Set([...FEATURE_POOL].sort(() => Math.random() - 0.5).slice(0, randomInt(3, 6)))],
      pricePerDay: round2(priceBase),
      depositAmount: round2(priceBase * 6),
      minDriverAge: c.category === 'luxury' ? 25 : 21,
      totalUnits: randomInt(2, 6),
      createdAt: now,
      updatedAt: now,
    });
  }
  console.log(`  created ${CARS.length} cars across ${SUPPLIERS.length} suppliers`);

  // ---- Transfers ----
  console.log('Creating airport transfers…');
  let transferCount = 0;
  for (const group of TRANSFER_AIRPORTS) {
    const airport = AIRPORTS.find((a) => a.code === group.code)!;
    for (const v of group.vehicles) {
      const ref = doc(collection(db, 'transfers'));
      await setDoc(ref, {
        airportCode: group.code,
        airportName: airport.name,
        city: airport.city,
        vehicleType: v.type,
        vehicleName: v.name,
        image: picsum(`voyago-transfer-${ref.id}`, 800, 533),
        maxPassengers: v.passengers,
        maxLuggage: v.luggage,
        meetAndGreet: v.type !== 'standard' || Math.random() > 0.4,
        freeCancellation: Math.random() > 0.25,
        pricePerTrip: round2(v.price),
        maxDistanceKm: randomInt(35, 80),
        totalUnits: randomInt(3, 10),
        createdAt: now,
        updatedAt: now,
      });
      transferCount++;
    }
  }
  console.log(`  created ${transferCount} transfers`);

  await signOut(auth);

  console.log('\nDone. Nothing else was touched — your users, bookings, coupons, reviews, notifications, and settings are unchanged.');
  console.log(`Summary: ${AIRPORTS.length} airports, ${AIRLINES.length} airlines, ${flightCount} flights, ${HOTELS.length} hotels (${HOTELS.length * 2} rooms), ${CARS.length} cars, ${SUPPLIERS.length} car suppliers, ${transferCount} transfers.`);
  console.log('\nTry these on the live site (public, no login needed):');
  console.log('  Flights: from ALG to CDG, departure date today+7/14/21/28');
  console.log('  Hotels: destination "Paris", "Barcelona", "Dubai", "Rome", or "Istanbul"');
  console.log('  Cars: pick-up location "Paris", "Dubai", "Rome", "Barcelona", or "Algiers"');
  console.log('  Transfers: pickup airport "CDG", "DXB", "FCO", "BCN", or "IST"');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\nSeeding failed:', error);
    process.exit(1);
  });
