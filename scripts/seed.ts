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
import {
  AIRPORTS, AIRLINES, FLIGHT_ROUTES, AIRCRAFT_SHORT, AIRCRAFT_LONG, makeFares,
  HOTELS, AMENITY_POOL, SUPPLIERS, CARS, CAR_CITIES, CATEGORY_BASE_PRICE, FEATURE_POOL,
  TRANSFER_AIRPORTS, randomInt, pick, round2, daysFromNow, addMinutes, picsum,
} from './seedData';

process.env.FIRESTORE_EMULATOR_HOST ||= 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST ||= 'localhost:9099';

if (!process.env.FIRESTORE_EMULATOR_HOST.includes('localhost') && !process.env.FIRESTORE_EMULATOR_HOST.includes('127.0.0.1')) {
  throw new Error('Refusing to seed a non-local Firestore host. This script is for the emulator only.');
}

initializeApp({ projectId: 'voyago-demo' });
const db = getFirestore();
const auth = getAuth();

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
  const supplierRefs: Record<string, FirebaseFirestore.DocumentReference> = {};
  for (const name of SUPPLIERS) {
    const ref = db.collection('carSuppliers').doc();
    supplierRefs[name] = ref;
    await ref.set({ name, logoUrl: null, rating: round2(randomInt(35, 49) / 10), createdAt: now, updatedAt: now });
  }

  // ---- Cars ----
  console.log('Creating cars…');
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
