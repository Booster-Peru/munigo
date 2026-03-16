import { API_BASE_URL as API_URL } from '../config/api';

export type SOSStatus = 'ACTIVE' | 'ATTENDED' | 'RESOLVED';

export interface SOSAlert {
  id: string;
  user_id: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  type: string;
  description: string | null;
  status: SOSStatus;
  attended_by: string | null;
  attended_at: string | null;
  resolved_at: string | null;
  created_at: string;
}

export async function sendSOSAlert(
  payload: {
    latitude?: number;
    longitude?: number;
    address?: string;
    type?: string;
    description?: string;
  },
  token: string
): Promise<SOSAlert> {
  const res = await fetch(`${API_URL}/sos/alert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'SOS failed');
  return data.alert;
}

export async function getMyAlerts(token: string): Promise<SOSAlert[]> {
  const res = await fetch(`${API_URL}/sos/alerts/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data.alerts;
}
