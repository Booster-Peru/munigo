import { API_BASE_URL } from '../config/api';

export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  user_id: string;
  source_type: 'RESTAURANT' | 'STORE';
  source_id: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  delivery_address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const h = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export async function placeOrder(
  params: {
    source_type: 'RESTAURANT' | 'STORE';
    source_id: string;
    items: OrderItem[];
    delivery_address?: string;
    notes?: string;
  },
  token: string,
): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/v1/orders`, {
    method: 'POST',
    headers: h(token),
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error placing order');
  return data.order;
}

export async function getActiveOrder(token: string): Promise<Order | null> {
  const res = await fetch(`${API_BASE_URL}/v1/orders/active`, { headers: h(token) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error fetching order');
  return data.order;
}

export async function getOrderHistory(token: string, limit = 20): Promise<Order[]> {
  const res = await fetch(`${API_BASE_URL}/v1/orders/history?limit=${limit}`, {
    headers: h(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error fetching history');
  return data.orders;
}

export async function getOrder(id: string, token: string): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/v1/orders/${id}`, { headers: h(token) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error fetching order');
  return data.order;
}

export async function cancelOrder(id: string, token: string): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/v1/orders/${id}/cancel`, {
    method: 'POST',
    headers: h(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error cancelling order');
  return data.order;
}

// Operator transitions
export async function transitionOrder(
  id: string,
  action: 'accept' | 'preparing' | 'ready' | 'delivering' | 'delivered',
  token: string,
): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/v1/orders/${id}/${action}`, {
    method: 'PATCH',
    headers: h(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error updating order');
  return data.order;
}

export async function getOperatorPendingOrders(sourceId: string, token: string): Promise<Order[]> {
  const res = await fetch(`${API_BASE_URL}/v1/orders/operator/pending?source_id=${sourceId}`, {
    headers: h(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error fetching orders');
  return data.orders;
}
