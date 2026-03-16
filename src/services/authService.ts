import { AuthResponse, User } from '../types/auth';
import { API_BASE_URL } from '../config/api';

let currentUser: User | null = null;
let currentAccessToken = '';
let currentRefreshToken = '';

const parseError = async (response: Response) => {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || 'Error inesperado del servidor';
  } catch {
    return 'Error inesperado del servidor';
  }
};

const toAuthResponse = (payload: {
  user: User;
  accessToken: string;
  refreshToken?: string;
}): AuthResponse => ({
  user: payload.user,
  token: payload.accessToken,
  refreshToken: payload.refreshToken,
});

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    const data = (await response.json()) as {
      user: User;
      accessToken: string;
      refreshToken?: string;
    };

    currentUser = data.user;
    currentAccessToken = data.accessToken;
    currentRefreshToken = data.refreshToken || '';
    return toAuthResponse(data);
  },

  register: async (
    fullName: string,
    email: string,
    password: string,
    dni: string,
  ): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/v1/auth/register`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ fullName, email, password, dni }),
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    const data = (await response.json()) as {
      user: User;
      accessToken: string;
      refreshToken?: string;
    };

    currentUser = data.user;
    currentAccessToken = data.accessToken;
    currentRefreshToken = data.refreshToken || '';
    return toAuthResponse(data);
  },

  logout: async (): Promise<void> => {
    if (currentRefreshToken) {
      await fetch(`${API_BASE_URL}/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      }).catch(() => undefined);
    }

    currentUser = null;
    currentAccessToken = '';
    currentRefreshToken = '';
  },

  getCurrentUser: (): User | null => currentUser,
  getAccessToken: () => currentAccessToken,
  getRefreshToken: () => currentRefreshToken,
};
