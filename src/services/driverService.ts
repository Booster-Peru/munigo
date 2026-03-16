import { API_BASE_URL as API_URL } from '../config/api';
import type { Trip } from './transportService';

const headers = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export async function updateLocation(
  lat: number,
  lng: number,
  isAvailable: boolean,
  token: string,
): Promise<void> {
  await fetch(`${API_URL}/v1/transport/driver/location`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify({ latitude: lat, longitude: lng, is_available: isAvailable }),
  });
}

export async function acceptTrip(tripId: string, token: string): Promise<Trip> {
  const res = await fetch(`${API_URL}/v1/transport/${tripId}/accept`, {
    method: 'PATCH',
    headers: headers(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error accepting trip');
  return data.trip;
}

export async function startTrip(tripId: string, token: string): Promise<Trip> {
  const res = await fetch(`${API_URL}/v1/transport/${tripId}/start`, {
    method: 'PATCH',
    headers: headers(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error starting trip');
  return data.trip;
}

export async function completeTrip(tripId: string, token: string): Promise<Trip> {
  const res = await fetch(`${API_URL}/v1/transport/${tripId}/complete`, {
    method: 'PATCH',
    headers: headers(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error completing trip');
  return data.trip;
}

export async function getDriverTrips(token: string, limit = 20): Promise<Trip[]> {
  const res = await fetch(`${API_URL}/v1/transport/driver/trips?limit=${limit}`, {
    headers: headers(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error fetching trips');
  return data.trips;
}
