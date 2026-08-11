/**
 * Seeds the Firebase Local Emulator Suite with realistic demo data.
 *
 * Usage: start the emulators (`npm run emulators`) in one terminal, then in
 * another run `npm run seed`. Safe to re-run — it clears its own collections
 * and demo auth users first, so the result is always a clean, consistent
 * dataset. Never run against a production project (see the env var guard
 * below).
 */
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

process.env.FIRESTORE_EMULATOR_HOST ||= 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST ||= 'localhost:9099';

if (!process.env.FIRESTORE_EMULATOR_HOST.includes('localhost') && !process.env.FIRESTORE_EMULATOR_HOST.includes('127.0.0.1')) {
  throw new Error('Refusing to seed a non-local Firestore host. This script is for the emulator only.');
}

initializeApp({ projectId: 'voyago-demo' });
const db = getFirestore();
const auth = getAuth();

// ───────────────────────────── helpers ─────────────────────────────
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
function daysFromNow(days: number, hour = 9, minute = 0): number {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}
function addMinutes(millis: number, minutes: number): number {
  return millis + minutes * 60000;
}
function picsum(seed: string, w: number, h: number): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

async function clearCollection(name: string): Promise<void> {
  const snap = await db.collection(name).get();
  const batchSize = 400;
  for (let i = 0; i < snap.docs.length; i += batchSize) {
    const batch = db.batch();
    snap.docs.slice(i, i + batchSize).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

async function clearHotelRooms(hotelIds: string[]): Promise<void> {
  for (const hotelId of hotelIds) {
    const snap = await db.collection('hotels').doc(hotelId).collection('rooms').get();
    await Promise.all(snap.docs.map((d) => d.ref.delete()));
  }
}

async function resetDemoAuthUsers(emails: string[]): Promise<void> {
  for (const email of emails) {
    try {
      const user = await auth.getUserByEmail(email);
      await auth.deleteUser(user.uid);
    } catch {
      // no existing user with this email — nothing to clean up
    }
  }
}

// ───────────────────────────── reference data ─────────────────────────────
interface AirportSeed {
  code: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  timezone: string;
  latitude: number;
  longitude: number;
}

const AIRPORTS: AirportSeed[] = [
  { code: 'ALG', name: 'Houari Boumediene Airport', city: 'Algiers', country: 'Algeria', countryCode: 'DZ', timezone: 'Africa/Algiers', latitude: 36.691, longitude: 3.2154 },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', countryCode: 'FR', timezone: 'Europe/Paris', latitude: 49.0097, longitude: 2.5479 },
  { code: 'ORY', name: 'Paris Orly Airport', city: 'Paris', country: 'France', countryCode: 'FR', timezone: 'Europe/Paris', latitude: 48.7233, longitude: 2.3794 },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', countryCode: 'GB', timezone: 'Europe/London', latitude: 51.47, longitude: -0.4543 },
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', countryCode: 'US', timezone: 'America/New_York', latitude: 40.6413, longitude: -73.7781 },
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', countryCode: 'US', timezone: 'America/Los_Angeles', latitude: 33.9416, longitude: -118.4085 },
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', timezone: 'Asia/Dubai', latitude: 25.2532, longitude: 55.3657 },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Türkiye', countryCode: 'TR', timezone: 'Europe/Istanbul', latitude: 41.2753, longitude: 28.7519 },
  { code: 'FCO', name: 'Leonardo da Vinci–Fiumicino Airport', city: 'Rome', country: 'Italy', countryCode: 'IT', timezone: 'Europe/Rome', latitude: 41.8003, longitude: 12.2389 },
  { code: 'BCN', name: 'Barcelona–El Prat Airport', city: 'Barcelona', country: 'Spain', countryCode: 'ES', timezone: 'Europe/Madrid', latitude: 41.2974, longitude: 2.0833 },
  { code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas Airport', city: 'Madrid', country: 'Spain', countryCode: 'ES', timezone: 'Europe/Madrid', latitude: 40.4983, longitude: -3.5676 },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', timezone: 'Europe/Amsterdam', latitude: 52.3105, longitude: 4.7683 },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', countryCode: 'DE', timezone: 'Europe/Berlin', latitude: 50.0379, longitude: 8.5622 },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', countryCode: 'DE', timezone: 'Europe/Berlin', latitude: 48.3538, longitude: 11.7861 },
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', countryCode: 'CH', timezone: 'Europe/Zurich', latitude: 47.4647, longitude: 8.5492 },
  { code: 'GVA', name: 'Geneva Airport', city: 'Geneva', country: 'Switzerland', countryCode: 'CH', timezone: 'Europe/Zurich', latitude: 46.2381, longitude: 6.1089 },
  { code: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria', countryCode: 'AT', timezone: 'Europe/Vienna', latitude: 48.1103, longitude: 16.5697 },
  { code: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'Belgium', countryCode: 'BE', timezone: 'Europe/Brussels', latitude: 50.901, longitude: 4.4844 },
  { code: 'LIS', name: 'Humberto Delgado Airport', city: 'Lisbon', country: 'Portugal', countryCode: 'PT', timezone: 'Europe/Lisbon', latitude: 38.7813, longitude: -9.1359 },
  { code: 'ATH', name: 'Athens International Airport', city: 'Athens', country: 'Greece', countryCode: 'GR', timezone: 'Europe/Athens', latitude: 37.9364, longitude: 23.9445 },
  { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', countryCode: 'EG', timezone: 'Africa/Cairo', latitude: 30.1219, longitude: 31.4056 },
  { code: 'CMN', name: 'Mohammed V International Airport', city: 'Casablanca', country: 'Morocco', countryCode: 'MA', timezone: 'Africa/Casablanca', latitude: 33.3675, longitude: -7.59 },
  { code: 'TUN', name: 'Tunis–Carthage International Airport', city: 'Tunis', country: 'Tunisia', countryCode: 'TN', timezone: 'Africa/Tunis', latitude: 36.851, longitude: 10.2272 },
  { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', countryCode: 'QA', timezone: 'Asia/Qatar', latitude: 25.2731, longitude: 51.6081 },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', countryCode: 'SG', timezone: 'Asia/Singapore', latitude: 1.3644, longitude: 103.9915 },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', countryCode: 'TH', timezone: 'Asia/Bangkok', latitude: 13.69, longitude: 100.7501 },
  { code: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan', countryCode: 'JP', timezone: 'Asia/Tokyo', latitude: 35.5494, longitude: 139.7798 },
  { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', countryCode: 'AU', timezone: 'Australia/Sydney', latitude: -33.9399, longitude: 151.1753 },
  { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', countryCode: 'CA', timezone: 'America/Toronto', latitude: 43.6777, longitude: -79.6248 },
  { code: 'GRU', name: 'São Paulo/Guarulhos International Airport', city: 'São Paulo', country: 'Brazil', countryCode: 'BR', timezone: 'America/Sao_Paulo', latitude: -23.4356, longitude: -46.4731 },
];

interface AirlineSeed {
  code: string;
  name: string;
  country: string;
}
const AIRLINES: AirlineSeed[] = [
  { code: 'AH', name: 'Air Algérie', country: 'Algeria' },
  { code: 'AF', name: 'Air France', country: 'France' },
  { code: 'BA', name: 'British Airways', country: 'United Kingdom' },
  { code: 'LH', name: 'Lufthansa', country: 'Germany' },
  { code: 'KL', name: 'KLM Royal Dutch Airlines', country: 'Netherlands' },
  { code: 'EK', name: 'Emirates', country: 'United Arab Emirates' },
  { code: 'QR', name: 'Qatar Airways', country: 'Qatar' },
  { code: 'TK', name: 'Turkish Airlines', country: 'Türkiye' },
  { code: 'IB', name: 'Iberia', country: 'Spain' },
  { code: 'AZ', name: 'ITA Airways', country: 'Italy' },
  { code: 'LX', name: 'Swiss International Air Lines', country: 'Switzerland' },
  { code: 'OS', name: 'Austrian Airlines', country: 'Austria' },
  { code: 'TP', name: 'TAP Air Portugal', country: 'Portugal' },
  { code: 'SQ', name: 'Singapore Airlines', country: 'Singapore' },
  { code: 'DL', name: 'Delta Air Lines', country: 'United States' },
];

interface FlightRouteSeed {
  origin: string;
  destination: string;
  airline: string;
  durationMin: number;
  basePrice: number;
  hasFirst?: boolean;
  stops?: number;
}
const FLIGHT_ROUTES: FlightRouteSeed[] = [
  { origin: 'ALG', destination: 'CDG', airline: 'AH', durationMin: 150, basePrice: 145 },
  { origin: 'CDG', destination: 'ALG', airline: 'AH', durationMin: 155, basePrice: 150 },
  { origin: 'CDG', destination: 'JFK', airline: 'AF', durationMin: 495, basePrice: 420, hasFirst: true, stops: 0 },
  { origin: 'LHR', destination: 'JFK', airline: 'BA', durationMin: 470, basePrice: 380, hasFirst: true },
  { origin: 'DXB', destination: 'LHR', airline: 'EK', durationMin: 440, basePrice: 410, hasFirst: true, stops: 1 },
  { origin: 'IST', destination: 'CDG', airline: 'TK', durationMin: 225, basePrice: 180 },
  { origin: 'FCO', destination: 'BCN', airline: 'AZ', durationMin: 110, basePrice: 95 },
  { origin: 'MAD', destination: 'LIS', airline: 'IB', durationMin: 75, basePrice: 75 },
  { origin: 'AMS', destination: 'FRA', airline: 'KL', durationMin: 70, basePrice: 90 },
  { origin: 'DOH', destination: 'SIN', airline: 'QR', durationMin: 425, basePrice: 460, hasFirst: true, stops: 1 },
  { origin: 'CDG', destination: 'BCN', airline: 'AF', durationMin: 95, basePrice: 110 },
  { origin: 'LHR', destination: 'DXB', airline: 'EK', durationMin: 425, basePrice: 405, hasFirst: true },
];

const AIRCRAFT_SHORT = ['Airbus A320', 'Airbus A321', 'Boeing 737-800'];
const AIRCRAFT_LONG = ['Airbus A330-300', 'Boeing 787-9', 'Airbus A350-900', 'Boeing 777-300ER'];

function makeFares(basePrice: number, hasFirst: boolean) {
  const economySeats = randomInt(38, 62);
  const premiumSeats = randomInt(10, 20);
  const businessSeats = randomInt(8, 16);
  const fares: Record<string, { price: number; seatsAvailable: number }> = {
    economy: { price: round2(basePrice), seatsAvailable: economySeats },
    premium_economy: { price: round2(basePrice * 1.6), seatsAvailable: premiumSeats },
    business: { price: round2(basePrice * 3.2), seatsAvailable: businessSeats },
  };
  if (hasFirst) {
    fares.first = { price: round2(basePrice * 5), seatsAvailable: randomInt(4, 8) };
  }
  return fares;
}

// ───────────────────────────────── main ─────────────────────────────────
async function main() {
  console.log('Seeding Voyago demo data into the Firebase Local Emulator Suite…\n');

  console.log('Clearing previous seed data…');
  await Promise.all(
    ['airports', 'airlines', 'flights', 'cars', 'carSuppliers', 'transfers', 'bookings', 'reviews', 'coupons', 'notifications', 'settings'].map(
      clearCollection,
    ),
  );
  const existingHotels = await db.collection('hotels').get();
  await clearHotelRooms(existingHotels.docs.map((d) => d.id));
  await clearCollection('hotels');

  const demoEmails = ['admin@voyago.example', 'sofia.martins@example.com', 'karim.haddad@example.com'];
  await resetDemoAuthUsers(demoEmails);
  const existingUsers = await db.collection('users').get();
  await Promise.all(existingUsers.docs.map((d) => d.ref.delete()));

  const now = Date.now();

  // ---- Airports ----
  console.log(`Creating ${AIRPORTS.length} airports…`);
  const airportRefs: Record<string, FirebaseFirestore.DocumentReference> = {};
  for (const a of AIRPORTS) {
    const ref = db.collection('airports').doc();
    airportRefs[a.code] = ref;
    await ref.set({ ...a, createdAt: now, updatedAt: now });
  }

  // ---- Airlines ----
  console.log(`Creating ${AIRLINES.length} airlines…`);
  const airlineRefs: Record<string, FirebaseFirestore.DocumentReference> = {};
  for (const a of AIRLINES) {
    const ref = db.collection('airlines').doc();
    airlineRefs[a.code] = ref;
    await ref.set({ ...a, logoUrl: null, createdAt: now, updatedAt: now });
  }

  // ---- Flights (2 dates per route) ----
  console.log('Creating flights…');
  let flightCount = 0;
  const namedFlightIds: Record<string, string> = {};
  for (const route of FLIGHT_ROUTES) {
    const airline = AIRLINES.find((a) => a.code === route.airline)!;
    for (const dayOffset of [randomInt(4, 12), randomInt(18, 35)]) {
      const departureHour = randomInt(6, 21);
      const departureTime = daysFromNow(dayOffset, departureHour, pick([0, 15, 30, 45]));
      const arrivalTime = addMinutes(departureTime, route.durationMin);
      const flightNumber = `${route.airline}${randomInt(100, 1999)}`;
      const ref = db.collection('flights').doc();
      await ref.set({
        airlineId: airlineRefs[route.airline].id,
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
      if (route.origin === 'ALG' && route.destination === 'CDG' && !namedFlightIds.algCdg) namedFlightIds.algCdg = ref.id;
      if (route.origin === 'CDG' && route.destination === 'ALG' && !namedFlightIds.cdgAlg) namedFlightIds.cdgAlg = ref.id;
    }
  }
  console.log(`  created ${flightCount} flights`);

  // ---- Hotels + Rooms ----
  console.log('Creating hotels and rooms…');
  const HOTELS: { name: string; city: string; country: string; star: number; type: string }[] = [
    { name: 'Le Marais Boutique Hotel', city: 'Paris', country: 'France', star: 4, type: 'hotel' },
    { name: 'Champs-Élysées Grand Hotel', city: 'Paris', country: 'France', star: 5, type: 'hotel' },
    { name: 'Gothic Quarter Suites', city: 'Barcelona', country: 'Spain', star: 4, type: 'apartment' },
    { name: 'Barceloneta Beach Hotel', city: 'Barcelona', country: 'Spain', star: 4, type: 'resort' },
    { name: 'Marina Bay Towers Hotel', city: 'Dubai', country: 'United Arab Emirates', star: 5, type: 'hotel' },
    { name: 'Downtown Oasis Hotel', city: 'Dubai', country: 'United Arab Emirates', star: 4, type: 'hotel' },
    { name: 'Trastevere Charme Hotel', city: 'Rome', country: 'Italy', star: 4, type: 'hotel' },
    { name: 'Colosseo View Hotel', city: 'Rome', country: 'Italy', star: 3, type: 'hotel' },
    { name: 'Bosphorus Palace Hotel', city: 'Istanbul', country: 'Türkiye', star: 5, type: 'hotel' },
    { name: 'Sultanahmet Heritage Hotel', city: 'Istanbul', country: 'Türkiye', star: 4, type: 'hotel' },
    { name: 'Midtown Skyline Hotel', city: 'New York', country: 'United States', star: 4, type: 'hotel' },
    { name: 'Brooklyn Loft Hotel', city: 'New York', country: 'United States', star: 3, type: 'apartment' },
    { name: 'Casbah View Hotel', city: 'Algiers', country: 'Algeria', star: 4, type: 'hotel' },
    { name: 'Alger Centre Business Hotel', city: 'Algiers', country: 'Algeria', star: 3, type: 'hotel' },
    { name: 'Retiro Park Hotel', city: 'Madrid', country: 'Spain', star: 4, type: 'hotel' },
    { name: 'Canal House Hotel', city: 'Amsterdam', country: 'Netherlands', star: 4, type: 'hotel' },
    { name: 'Ringstrasse Grand Hotel', city: 'Vienna', country: 'Austria', star: 5, type: 'hotel' },
    { name: 'Kensington Garden Hotel', city: 'London', country: 'United Kingdom', star: 4, type: 'hotel' },
    { name: 'Alfama Hillside Hotel', city: 'Lisbon', country: 'Portugal', star: 4, type: 'hotel' },
    { name: 'Plaka Village Hotel', city: 'Athens', country: 'Greece', star: 3, type: 'hotel' },
  ];
  const AMENITY_POOL = ['wifi', 'pool', 'parking', 'breakfast', 'gym', 'spa', 'air_conditioning', 'airport_shuttle', 'restaurant', 'bar', 'front_desk_24h'] as const;

  const namedHotelIds: Record<string, string> = {};
  for (const h of HOTELS) {
    const amenities = [...new Set([...AMENITY_POOL].sort(() => Math.random() - 0.5).slice(0, randomInt(5, 9)))];
    const breakfastIncluded = Math.random() > 0.4;
    const freeCancellation = Math.random() > 0.3;
    const basePrice = h.star * randomInt(28, 42) + randomInt(-10, 20);
    const hotelRef = db.collection('hotels').doc();
    await hotelRef.set({
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
    if (h.city === 'Paris' && !namedHotelIds.paris) namedHotelIds.paris = hotelRef.id;

    const roomTypes = [
      { name: 'Classic Double Room', guests: 2, bed: '1 queen bed', sqm: 22, priceMult: 1 },
      { name: 'Deluxe Suite', guests: 3, bed: '1 king bed + sofa bed', sqm: 38, priceMult: 1.7 },
    ];
    for (const rt of roomTypes) {
      const roomRef = hotelRef.collection('rooms').doc();
      await roomRef.set({
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
      if (h.city === 'Paris' && rt.name === 'Classic Double Room' && !namedHotelIds.parisRoom) {
        namedHotelIds.parisRoom = roomRef.id;
      }
    }
  }
  console.log(`  created ${HOTELS.length} hotels with ${HOTELS.length * 2} rooms`);

  // ---- Car suppliers ----
  console.log('Creating car suppliers…');
  const SUPPLIERS = ['Voyago Direct', 'Metro Rentals', 'SunDrive Cars', 'CityLine Auto', 'Coastal Motors', 'Alpine Auto Rentals', 'Horizon Car Hire', 'Nomad Wheels', 'Prime Drive', 'EuroFleet Rentals'];
  const supplierRefs: Record<string, FirebaseFirestore.DocumentReference> = {};
  for (const name of SUPPLIERS) {
    const ref = db.collection('carSuppliers').doc();
    supplierRefs[name] = ref;
    await ref.set({ name, logoUrl: null, rating: round2(randomInt(35, 49) / 10), createdAt: now, updatedAt: now });
  }

  // ---- Cars ----
  console.log('Creating cars…');
  const CARS: { make: string; model: string; category: string; transmission: string; seats: number; doors: number; fuel: string }[] = [
    { make: 'Fiat', model: 'Panda', category: 'economy', transmission: 'manual', seats: 4, doors: 4, fuel: 'petrol' },
    { make: 'Renault', model: 'Clio', category: 'economy', transmission: 'manual', seats: 5, doors: 4, fuel: 'petrol' },
    { make: 'Opel', model: 'Corsa', category: 'economy', transmission: 'manual', seats: 5, doors: 4, fuel: 'petrol' },
    { make: 'Kia', model: 'Picanto', category: 'economy', transmission: 'manual', seats: 4, doors: 4, fuel: 'petrol' },
    { make: 'Volkswagen', model: 'Golf', category: 'compact', transmission: 'manual', seats: 5, doors: 4, fuel: 'petrol' },
    { make: 'Ford', model: 'Focus', category: 'compact', transmission: 'automatic', seats: 5, doors: 4, fuel: 'diesel' },
    { make: 'Toyota', model: 'Corolla', category: 'compact', transmission: 'automatic', seats: 5, doors: 4, fuel: 'hybrid' },
    { make: 'Peugeot', model: '308', category: 'compact', transmission: 'manual', seats: 5, doors: 4, fuel: 'diesel' },
    { make: 'Skoda', model: 'Octavia', category: 'sedan', transmission: 'automatic', seats: 5, doors: 4, fuel: 'diesel' },
    { make: 'Volkswagen', model: 'Passat', category: 'sedan', transmission: 'automatic', seats: 5, doors: 4, fuel: 'diesel' },
    { make: 'Toyota', model: 'Camry', category: 'sedan', transmission: 'automatic', seats: 5, doors: 4, fuel: 'hybrid' },
    { make: 'BMW', model: '3 Series', category: 'sedan', transmission: 'automatic', seats: 5, doors: 4, fuel: 'petrol' },
    { make: 'Nissan', model: 'Qashqai', category: 'suv', transmission: 'automatic', seats: 5, doors: 4, fuel: 'petrol' },
    { make: 'Volkswagen', model: 'Tiguan', category: 'suv', transmission: 'automatic', seats: 5, doors: 4, fuel: 'diesel' },
    { make: 'Toyota', model: 'RAV4', category: 'suv', transmission: 'automatic', seats: 5, doors: 4, fuel: 'hybrid' },
    { make: 'Jeep', model: 'Compass', category: 'suv', transmission: 'automatic', seats: 5, doors: 4, fuel: 'diesel' },
    { make: 'Mercedes-Benz', model: 'E-Class', category: 'luxury', transmission: 'automatic', seats: 5, doors: 4, fuel: 'diesel' },
    { make: 'BMW', model: '5 Series', category: 'luxury', transmission: 'automatic', seats: 5, doors: 4, fuel: 'petrol' },
    { make: 'Audi', model: 'A6', category: 'luxury', transmission: 'automatic', seats: 5, doors: 4, fuel: 'diesel' },
    { make: 'Mercedes-Benz', model: 'S-Class', category: 'luxury', transmission: 'automatic', seats: 5, doors: 4, fuel: 'petrol' },
    { make: 'Volkswagen', model: 'Transporter', category: 'van', transmission: 'manual', seats: 9, doors: 4, fuel: 'diesel' },
    { make: 'Mercedes-Benz', model: 'Vito', category: 'van', transmission: 'automatic', seats: 8, doors: 4, fuel: 'diesel' },
    { make: 'Tesla', model: 'Model 3', category: 'electric', transmission: 'automatic', seats: 5, doors: 4, fuel: 'electric' },
    { make: 'Nissan', model: 'Leaf', category: 'electric', transmission: 'automatic', seats: 5, doors: 4, fuel: 'electric' },
    { make: 'Renault', model: 'Zoe', category: 'electric', transmission: 'automatic', seats: 5, doors: 4, fuel: 'electric' },
  ];
  const CAR_CITIES = ['Algiers', 'Paris', 'Dubai', 'Rome', 'Barcelona'];
  const CATEGORY_BASE_PRICE: Record<string, number> = { economy: 24, compact: 34, sedan: 46, suv: 58, luxury: 110, van: 68, electric: 52 };
  const FEATURE_POOL = ['air_conditioning', 'bluetooth', 'gps', 'child_seat_available', 'usb_charger', 'cruise_control', 'parking_sensors'] as const;

  let namedCarId = '';
  for (const c of CARS) {
    const city = pick(CAR_CITIES);
    const supplierName = pick(SUPPLIERS);
    const priceBase = CATEGORY_BASE_PRICE[c.category] + randomInt(-6, 10);
    const carRef = db.collection('cars').doc();
    await carRef.set({
      supplierId: supplierRefs[supplierName].id,
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
    if (!namedCarId) namedCarId = carRef.id;
  }
  console.log(`  created ${CARS.length} cars across ${SUPPLIERS.length} suppliers`);

  // ---- Transfers ----
  console.log('Creating airport transfers…');
  const TRANSFER_AIRPORTS: { code: string; vehicles: { type: string; name: string; passengers: number; luggage: number; price: number }[] }[] = [
    { code: 'ALG', vehicles: [
      { type: 'standard', name: 'Sedan or similar', passengers: 3, luggage: 2, price: 28 },
      { type: 'business', name: 'Mercedes E-Class or similar', passengers: 3, luggage: 2, price: 48 },
      { type: 'van', name: 'Mercedes Vito or similar', passengers: 7, luggage: 6, price: 55 },
    ] },
    { code: 'CDG', vehicles: [
      { type: 'standard', name: 'Sedan or similar', passengers: 3, luggage: 2, price: 65 },
      { type: 'business', name: 'Mercedes E-Class or similar', passengers: 3, luggage: 2, price: 95 },
      { type: 'luxury', name: 'Mercedes S-Class or similar', passengers: 3, luggage: 2, price: 165 },
    ] },
    { code: 'DXB', vehicles: [
      { type: 'standard', name: 'Sedan or similar', passengers: 3, luggage: 2, price: 42 },
      { type: 'business', name: 'BMW 5 Series or similar', passengers: 3, luggage: 2, price: 75 },
      { type: 'van', name: 'Toyota Hiace or similar', passengers: 8, luggage: 7, price: 68 },
    ] },
    { code: 'FCO', vehicles: [
      { type: 'standard', name: 'Sedan or similar', passengers: 3, luggage: 2, price: 58 },
      { type: 'van', name: 'Mercedes Vito or similar', passengers: 7, luggage: 6, price: 82 },
    ] },
    { code: 'BCN', vehicles: [
      { type: 'standard', name: 'Sedan or similar', passengers: 3, luggage: 2, price: 45 },
      { type: 'business', name: 'Audi A6 or similar', passengers: 3, luggage: 2, price: 72 },
    ] },
    { code: 'IST', vehicles: [
      { type: 'standard', name: 'Sedan or similar', passengers: 3, luggage: 2, price: 38 },
      { type: 'business', name: 'Mercedes E-Class or similar', passengers: 3, luggage: 2, price: 62 },
      { type: 'van', name: 'Mercedes Vito or similar', passengers: 7, luggage: 6, price: 58 },
    ] },
    { code: 'LHR', vehicles: [
      { type: 'standard', name: 'Sedan or similar', passengers: 3, luggage: 2, price: 78 },
      { type: 'luxury', name: 'Mercedes S-Class or similar', passengers: 3, luggage: 2, price: 195 },
    ] },
    { code: 'JFK', vehicles: [
      { type: 'standard', name: 'Sedan or similar', passengers: 3, luggage: 2, price: 88 },
      { type: 'van', name: 'Chevrolet Suburban or similar', passengers: 6, luggage: 6, price: 120 },
    ] },
  ];
  let namedTransferId = '';
  let transferCount = 0;
  for (const group of TRANSFER_AIRPORTS) {
    const airport = AIRPORTS.find((a) => a.code === group.code)!;
    for (const v of group.vehicles) {
      const ref = db.collection('transfers').doc();
      await ref.set({
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
      if (group.code === 'CDG' && v.type === 'business' && !namedTransferId) namedTransferId = ref.id;
    }
  }
  console.log(`  created ${transferCount} transfers`);

  // ---- Coupons ----
  console.log('Creating coupons…');
  const COUPONS = [
    { code: 'WELCOME10', type: 'percentage', value: 10, minimumAmount: 0, services: ['all'], days: 365, limit: 1000 },
    { code: 'SAVE20', type: 'fixed', value: 20, minimumAmount: 200, services: ['hotel'], days: 90, limit: 500 },
    { code: 'ROADTRIP15', type: 'percentage', value: 15, minimumAmount: 0, services: ['car'], days: 120, limit: 300 },
    { code: 'SKYFAST', type: 'fixed', value: 15, minimumAmount: 100, services: ['flight'], days: 60, limit: 200 },
  ] as const;
  for (const c of COUPONS) {
    await db.collection('coupons').add({
      code: c.code,
      type: c.type,
      value: c.value,
      minimumAmount: c.minimumAmount,
      expirationDate: daysFromNow(c.days),
      usageLimit: c.limit,
      usageCount: 0,
      applicableServices: [...c.services],
      active: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  // ---- Settings ----
  console.log('Creating platform settings…');
  await db.collection('settings').doc('general').set({
    siteName: 'Voyago',
    supportEmail: 'support@voyago.example',
    supportPhone: '+1 (555) 019-2028',
    defaultCurrency: 'EUR',
    maintenanceMode: false,
    updatedAt: now,
  });

  // ---- Users ----
  console.log('Creating demo users…');
  async function createUser(email: string, password: string, firstName: string, lastName: string, role: 'user' | 'admin') {
    const userRecord = await auth.createUser({ email, password, displayName: `${firstName} ${lastName}`, emailVerified: true });
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      firstName,
      lastName,
      email,
      phone: null,
      photoURL: null,
      country: null,
      role,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });
    return userRecord.uid;
  }

  const adminUid = await createUser('admin@voyago.example', 'Voyago123!', 'Voyago', 'Admin', 'admin');
  const sofiaUid = await createUser('sofia.martins@example.com', 'Voyago123!', 'Sofia', 'Martins', 'user');
  const karimUid = await createUser('karim.haddad@example.com', 'Voyago123!', 'Karim', 'Haddad', 'user');

  // ---- Sample bookings, reviews, favorites, notifications ----
  console.log('Creating sample bookings, reviews, favorites, and notifications…');

  async function addBooking(input: {
    userId: string;
    bookingType: 'flight' | 'hotel' | 'car' | 'transfer';
    itemId: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    startDate: number;
    endDate: number;
    guests: number;
    customerInfo: { firstName: string; lastName: string; email: string; phone: string };
    details: Record<string, unknown>;
    basePrice: number;
  }) {
    const taxes = round2(input.basePrice * 0.1);
    const fees = 6;
    const total = round2(input.basePrice + taxes + fees);
    const ref = db.collection('bookings').doc();
    await ref.set({
      userId: input.userId,
      bookingType: input.bookingType,
      itemId: input.itemId,
      status: input.status,
      paymentStatus: input.status === 'cancelled' ? 'refunded' : 'paid',
      startDate: input.startDate,
      endDate: input.endDate,
      guests: input.guests,
      customerInfo: input.customerInfo,
      details: input.details,
      pricing: { basePrice: round2(input.basePrice), taxes, fees, discount: 0, total, currency: 'EUR' },
      couponCode: null,
      bookingReference: `TRV-2026-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      specialRequests: null,
      cancellationReason: input.status === 'cancelled' ? 'Change of travel plans' : null,
      createdAt: now,
      updatedAt: now,
    });
    return ref.id;
  }

  const sofia = { firstName: 'Sofia', lastName: 'Martins', email: 'sofia.martins@example.com', phone: '+351 912 345 678' };
  const karim = { firstName: 'Karim', lastName: 'Haddad', email: 'karim.haddad@example.com', phone: '+213 550 123 456' };

  if (namedHotelIds.paris && namedHotelIds.parisRoom) {
    await addBooking({
      userId: sofiaUid,
      bookingType: 'hotel',
      itemId: namedHotelIds.parisRoom,
      status: 'confirmed',
      startDate: daysFromNow(20, 15, 0),
      endDate: daysFromNow(23, 11, 0),
      guests: 2,
      customerInfo: sofia,
      details: { hotelId: namedHotelIds.paris, hotelName: 'Le Marais Boutique Hotel', roomId: namedHotelIds.parisRoom, roomName: 'Classic Double Room', checkIn: daysFromNow(20, 15, 0), checkOut: daysFromNow(23, 11, 0), nights: 3, rooms: 1, primaryGuestName: 'Sofia Martins' },
      basePrice: 96 * 3,
    });
  }

  let completedFlightBookingId = '';
  if (namedFlightIds.algCdg) {
    completedFlightBookingId = await addBooking({
      userId: sofiaUid,
      bookingType: 'flight',
      itemId: namedFlightIds.algCdg,
      status: 'completed',
      startDate: now - 20 * 86400000,
      endDate: now - 20 * 86400000,
      guests: 1,
      customerInfo: sofia,
      details: {
        tripType: 'oneway', cabin: 'economy', outboundFlightId: namedFlightIds.algCdg, returnFlightId: null,
        passengers: [{ firstName: 'Sofia', lastName: 'Martins', dateOfBirth: '1992-04-11', nationality: 'Portuguese', passportNumber: 'P1234567' }],
      },
      basePrice: 145,
    });
  }

  if (namedCarId) {
    await addBooking({
      userId: sofiaUid,
      bookingType: 'car',
      itemId: namedCarId,
      status: 'cancelled',
      startDate: daysFromNow(9, 10, 0),
      endDate: daysFromNow(12, 10, 0),
      guests: 1,
      customerInfo: sofia,
      details: { carId: namedCarId, carName: 'Rental car', pickupLocation: 'Algiers Airport', dropoffLocation: 'Algiers Airport', pickupAt: daysFromNow(9, 10, 0), dropoffAt: daysFromNow(12, 10, 0), driverAge: 34, driverName: 'Sofia Martins' },
      basePrice: 34 * 3,
    });
  }

  if (namedTransferId) {
    await addBooking({
      userId: karimUid,
      bookingType: 'transfer',
      itemId: namedTransferId,
      status: 'confirmed',
      startDate: daysFromNow(20, 14, 0),
      endDate: daysFromNow(20, 16, 0),
      guests: 2,
      customerInfo: karim,
      details: { transferId: namedTransferId, vehicleName: 'Mercedes E-Class or similar', pickupAddress: 'Charles de Gaulle Airport, Terminal 2E', dropoffAddress: '12 Rue de Rivoli, Paris', flightNumber: 'AH1042', passengers: 2, luggage: 2, childSeatRequired: false },
      basePrice: 95,
    });
  }

  let completedHotelBookingId = '';
  if (namedHotelIds.paris && namedHotelIds.parisRoom) {
    completedHotelBookingId = await addBooking({
      userId: karimUid,
      bookingType: 'hotel',
      itemId: namedHotelIds.parisRoom,
      status: 'completed',
      startDate: now - 40 * 86400000,
      endDate: now - 37 * 86400000,
      guests: 2,
      customerInfo: karim,
      details: { hotelId: namedHotelIds.paris, hotelName: 'Le Marais Boutique Hotel', roomId: namedHotelIds.parisRoom, roomName: 'Classic Double Room', checkIn: now - 40 * 86400000, checkOut: now - 37 * 86400000, nights: 3, rooms: 1, primaryGuestName: 'Karim Haddad' },
      basePrice: 96 * 3,
    });
  }

  // Reviews (id == bookingId, matching security-rule design)
  if (completedFlightBookingId && namedFlightIds.algCdg) {
    await db.collection('reviews').doc(completedFlightBookingId).set({
      userId: sofiaUid,
      userName: 'Sofia Martins',
      userPhotoURL: null,
      bookingId: completedFlightBookingId,
      itemType: 'flight',
      itemId: namedFlightIds.algCdg,
      rating: 5,
      title: 'Smooth and on time',
      comment: 'Boarding was quick and the flight departed right on schedule. Would book again.',
      createdAt: now - 18 * 86400000,
    });
  }
  if (completedHotelBookingId && namedHotelIds.parisRoom) {
    await db.collection('reviews').doc(completedHotelBookingId).set({
      userId: karimUid,
      userName: 'Karim Haddad',
      userPhotoURL: null,
      bookingId: completedHotelBookingId,
      itemType: 'hotel',
      itemId: namedHotelIds.parisRoom,
      rating: 4,
      title: 'Great location, small room',
      comment: 'Walking distance to everything in Le Marais. Room was a little snug but very clean and quiet.',
      createdAt: now - 35 * 86400000,
    });
  }

  // Favorites
  if (namedHotelIds.paris) {
    await db.collection('users').doc(sofiaUid).collection('favorites').add({ itemType: 'hotel', itemId: namedHotelIds.paris, createdAt: now });
  }
  if (namedCarId) {
    await db.collection('users').doc(karimUid).collection('favorites').add({ itemType: 'car', itemId: namedCarId, createdAt: now });
  }

  // Notifications
  await db.collection('notifications').add({ userId: sofiaUid, title: 'Booking confirmed', message: 'Your hotel booking in Paris is confirmed.', type: 'booking_confirmed', read: false, relatedBookingId: null, createdAt: now });
  await db.collection('notifications').add({ userId: karimUid, title: 'Transfer scheduled', message: 'Your airport transfer is scheduled for pickup.', type: 'reminder', read: false, relatedBookingId: null, createdAt: now });

  console.log('\nDone. Demo accounts (password: Voyago123!):');
  console.log('  Admin  — admin@voyago.example');
  console.log('  User   — sofia.martins@example.com');
  console.log('  User   — karim.haddad@example.com');
  console.log(`\nAdmin uid: ${adminUid}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
