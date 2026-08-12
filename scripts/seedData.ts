/**
 * Shared reference data and helpers for scripts/seed.ts (emulator) and
 * scripts/seed-production.ts (real Firestore project). Keeping this in one
 * place means both scripts generate the same realistic inventory shape.
 */

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
export function daysFromNow(days: number, hour = 9, minute = 0): number {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}
export function addMinutes(millis: number, minutes: number): number {
  return millis + minutes * 60000;
}
export function picsum(seed: string, w: number, h: number): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

export interface AirportSeed {
  code: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  timezone: string;
  latitude: number;
  longitude: number;
}

export const AIRPORTS: AirportSeed[] = [
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

export interface AirlineSeed {
  code: string;
  name: string;
  country: string;
}
export const AIRLINES: AirlineSeed[] = [
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

export interface FlightRouteSeed {
  origin: string;
  destination: string;
  airline: string;
  durationMin: number;
  basePrice: number;
  hasFirst?: boolean;
  stops?: number;
}
export const FLIGHT_ROUTES: FlightRouteSeed[] = [
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

export const AIRCRAFT_SHORT = ['Airbus A320', 'Airbus A321', 'Boeing 737-800'];
export const AIRCRAFT_LONG = ['Airbus A330-300', 'Boeing 787-9', 'Airbus A350-900', 'Boeing 777-300ER'];

export function makeFares(basePrice: number, hasFirst: boolean) {
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

export const HOTELS: { name: string; city: string; country: string; star: number; type: string }[] = [
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
export const AMENITY_POOL = ['wifi', 'pool', 'parking', 'breakfast', 'gym', 'spa', 'air_conditioning', 'airport_shuttle', 'restaurant', 'bar', 'front_desk_24h'] as const;

export const SUPPLIERS = ['Voyago Direct', 'Metro Rentals', 'SunDrive Cars', 'CityLine Auto', 'Coastal Motors', 'Alpine Auto Rentals', 'Horizon Car Hire', 'Nomad Wheels', 'Prime Drive', 'EuroFleet Rentals'];

export const CARS: { make: string; model: string; category: string; transmission: string; seats: number; doors: number; fuel: string }[] = [
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
export const CAR_CITIES = ['Algiers', 'Paris', 'Dubai', 'Rome', 'Barcelona'];
export const CATEGORY_BASE_PRICE: Record<string, number> = { economy: 24, compact: 34, sedan: 46, suv: 58, luxury: 110, van: 68, electric: 52 };
export const FEATURE_POOL = ['air_conditioning', 'bluetooth', 'gps', 'child_seat_available', 'usb_charger', 'cruise_control', 'parking_sensors'] as const;

export const TRANSFER_AIRPORTS: { code: string; vehicles: { type: string; name: string; passengers: number; luggage: number; price: number }[] }[] = [
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
