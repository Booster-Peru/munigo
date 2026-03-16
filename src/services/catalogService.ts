import { API_BASE_URL } from '../config/api';

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  description: string | null;
  photo_url: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  open_time: string;
  close_time: string;
  is_active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  is_available: boolean;
  category: string;
}

export interface Store {
  id: string;
  name: string;
  category: string;
  description: string | null;
  photo_url: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  stock: number;
  category: string;
}

export async function listRestaurants(category?: string): Promise<Restaurant[]> {
  const params = category ? `?category=${encodeURIComponent(category)}` : '';
  const res = await fetch(`${API_BASE_URL}/v1/catalog/restaurants${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error loading restaurants');
  return data.restaurants;
}

export async function getRestaurant(
  id: string,
): Promise<{ restaurant: Restaurant; menu: MenuItem[] }> {
  const res = await fetch(`${API_BASE_URL}/v1/catalog/restaurants/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error loading restaurant');
  return data;
}

export async function listStores(category?: string): Promise<Store[]> {
  const params = category ? `?category=${encodeURIComponent(category)}` : '';
  const res = await fetch(`${API_BASE_URL}/v1/catalog/stores${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error loading stores');
  return data.stores;
}

export async function getStore(id: string): Promise<{ store: Store; products: Product[] }> {
  const res = await fetch(`${API_BASE_URL}/v1/catalog/stores/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error loading store');
  return data;
}
