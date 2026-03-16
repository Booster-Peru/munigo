import { API_BASE_URL as API_URL } from '../config/api';

export type MandadoType = 'COMPRAS' | 'TRAMITE' | 'MENSAJERIA' | 'OTRO';
export type MandadoStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'DELIVERED' | 'CANCELLED';

export interface Mandado {
  id: string;
  user_id: string;
  assignee_id: string | null;
  type: MandadoType;
  description: string;
  pickup_address: string | null;
  delivery_address: string;
  fare: number;
  status: MandadoStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

async function apiFetch(path: string, method: string, token: string, body?: object) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function createMandado(
  payload: {
    type?: MandadoType;
    description: string;
    pickup_address?: string;
    delivery_address: string;
    notes?: string;
  },
  token: string,
): Promise<Mandado> {
  const data = await apiFetch('/mandados', 'POST', token, payload);
  return data.mandado;
}

export async function getActiveMandado(token: string): Promise<Mandado | null> {
  const data = await apiFetch('/mandados/active', 'GET', token);
  return data.mandado;
}

export async function getMandadoHistory(token: string, limit = 20): Promise<Mandado[]> {
  const data = await apiFetch(`/mandados/history?limit=${limit}`, 'GET', token);
  return data.mandados;
}

export async function getMandado(id: string, token: string): Promise<Mandado> {
  const data = await apiFetch(`/mandados/${id}`, 'GET', token);
  return data.mandado;
}

export async function cancelMandado(id: string, token: string): Promise<Mandado> {
  const data = await apiFetch(`/mandados/${id}/cancel`, 'POST', token);
  return data.mandado;
}
