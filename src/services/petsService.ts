import { API_BASE_URL as API_URL } from '../config/api';

export type PetSpecies = 'PERRO' | 'GATO' | 'OTRO';
export type PetStatus = 'AVAILABLE' | 'ADOPTED' | 'PENDING';

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: PetSpecies;
  breed: string | null;
  age_months: number | null;
  gender: string;
  description: string | null;
  photo_url: string | null;
  status: PetStatus;
  created_at: string;
}

export interface LostPet {
  id: string;
  reporter_id: string;
  name: string | null;
  species: string;
  description: string;
  last_seen_at: string | null;
  last_seen_loc: string | null;
  contact: string;
  photo_url: string | null;
  found: boolean;
  created_at: string;
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

export async function listPets(token: string, species?: string): Promise<Pet[]> {
  const q = species ? `?species=${species}` : '';
  const data = await apiFetch(`/pets${q}`, 'GET', token);
  return data.pets;
}

export async function getPet(id: string, token: string): Promise<Pet> {
  const data = await apiFetch(`/pets/${id}`, 'GET', token);
  return data.pet;
}

export async function requestAdoption(petId: string, message: string, token: string) {
  const data = await apiFetch(`/pets/${petId}/adopt`, 'POST', token, { message });
  return data.adoption;
}

export async function listLostPets(token: string): Promise<LostPet[]> {
  const data = await apiFetch('/lost', 'GET', token);
  return data.lost;
}

export async function reportLostPet(
  payload: {
    name?: string;
    species?: string;
    description: string;
    last_seen_at?: string;
    last_seen_loc?: string;
    contact: string;
    photo_url?: string;
  },
  token: string,
): Promise<LostPet> {
  const data = await apiFetch('/lost', 'POST', token, payload);
  return data.lost;
}
