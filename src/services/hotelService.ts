import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Hotel, HotelInput, Room, RoomInput } from '@/types/hotel';
import { mapDoc, mapDocs } from './firestoreUtils';

const hotelsCol = () => collection(db, 'hotels');
const roomsCol = (hotelId: string) => collection(db, 'hotels', hotelId, 'rooms');

export interface HotelSearchQuery {
  destination: string;
  sort?: 'price' | 'rating';
}

export async function searchHotels({ destination, sort = 'price' }: HotelSearchQuery): Promise<Hotel[]> {
  const citySearch = destination.trim().toLowerCase();
  if (!citySearch) return [];
  const field = sort === 'rating' ? 'reviewScore' : 'pricePerNight';
  const dir = sort === 'rating' ? 'desc' : 'asc';
  const snap = await getDocs(query(hotelsCol(), where('citySearch', '==', citySearch), orderBy(field, dir)));
  return mapDocs<Hotel>(snap);
}

export async function listHotels(max = 100): Promise<Hotel[]> {
  const snap = await getDocs(query(hotelsCol(), orderBy('name')));
  return mapDocs<Hotel>(snap).slice(0, max);
}

export async function getHotel(id: string): Promise<Hotel | null> {
  const snap = await getDoc(doc(db, 'hotels', id));
  return snap.exists() ? mapDoc<Hotel>(snap) : null;
}

export async function createHotel(input: HotelInput): Promise<string> {
  const now = Date.now();
  const ref = await addDoc(hotelsCol(), {
    ...input,
    citySearch: input.city.trim().toLowerCase(),
    reviewScore: 0,
    reviewCount: 0,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateHotel(id: string, input: Partial<HotelInput>): Promise<void> {
  const patch: Record<string, unknown> = { ...input, updatedAt: Date.now() };
  if (input.city) patch.citySearch = input.city.trim().toLowerCase();
  await updateDoc(doc(db, 'hotels', id), patch);
}

export async function deleteHotel(id: string): Promise<void> {
  await deleteDoc(doc(db, 'hotels', id));
}

export async function listRooms(hotelId: string): Promise<Room[]> {
  const snap = await getDocs(query(roomsCol(hotelId), orderBy('pricePerNight')));
  return mapDocs<Room>(snap);
}

export async function getRoom(hotelId: string, roomId: string): Promise<Room | null> {
  const snap = await getDoc(doc(db, 'hotels', hotelId, 'rooms', roomId));
  return snap.exists() ? mapDoc<Room>(snap) : null;
}

export async function createRoom(hotelId: string, input: RoomInput): Promise<string> {
  const now = Date.now();
  const ref = await addDoc(roomsCol(hotelId), { ...input, hotelId, createdAt: now, updatedAt: now });
  return ref.id;
}

export async function updateRoom(hotelId: string, roomId: string, input: Partial<RoomInput>): Promise<void> {
  await updateDoc(doc(db, 'hotels', hotelId, 'rooms', roomId), { ...input, updatedAt: Date.now() });
}

export async function deleteRoom(hotelId: string, roomId: string): Promise<void> {
  await deleteDoc(doc(db, 'hotels', hotelId, 'rooms', roomId));
}
