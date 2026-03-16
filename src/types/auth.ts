export interface User {
  id: string;
  fullName: string;
  email: string;
  dni: string;
  role: 'CITIZEN' | 'DRIVER' | 'OPERATOR' | 'SUPER_ADMIN';
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}
