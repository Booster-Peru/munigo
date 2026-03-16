import { API_BASE_URL as API_URL } from '../config/api';

export type TripType = 'standard' | 'premium';

export type TripStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface Trip {
  id: string;
  citizen_id: string;
  driver_id: string | null;
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  origin_label: string | null;
  dest_label: string | null;
  type: TripType;
  status: TripStatus;
  fare: number;
  created_at: string;
  updated_at: string;
}

export interface RequestTripParams {
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  origin_label?: string;
  dest_label?: string;
  type?: TripType;
}

const headers = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export async function requestTrip(params: RequestTripParams, token: string): Promise<Trip> {
  const res = await fetch(`${API_URL}/v1/transport/request`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error requesting trip');
  return data.trip;
}

export async function getActiveTrip(token: string): Promise<Trip | null> {
  const res = await fetch(`${API_URL}/v1/transport/active`, {
    headers: headers(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error fetching active trip');
  return data.trip;
}

export async function getTripHistory(token: string, limit = 20, offset = 0): Promise<Trip[]> {
  const res = await fetch(`${API_URL}/v1/transport/history?limit=${limit}&offset=${offset}`, {
    headers: headers(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error fetching history');
  return data.trips;
}

export async function cancelTrip(tripId: string, token: string): Promise<Trip> {
  const res = await fetch(`${API_URL}/v1/transport/${tripId}/cancel`, {
    method: 'PATCH',
    headers: headers(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error cancelling trip');
  return data.trip;
}

export function subscribeToTrip(
  tripId: string,
  onUpdate: (trip: Trip) => void,
  onLocation: (lat: number, lng: number) => void,
): () => void {
  const wsUrl = API_URL.replace(/^http/, 'ws');
  const ws = new WebSocket(`${wsUrl}/v1/transport/track?tripId=${tripId}`);

  ws.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data);
      if (msg.type === 'trip_update') onUpdate(msg.trip);
      if (msg.type === 'driver_location') onLocation(msg.latitude, msg.longitude);
    } catch {
      /* ignore */
    }
  };

  return () => ws.close();
}
