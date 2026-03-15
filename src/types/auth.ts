export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CITIZEN' | 'OPERATOR' | 'SUPERVISOR' | 'ADMIN';
  phone?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}
