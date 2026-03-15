import { CreateReportDTO, Report } from '../types';
import { API_BASE_URL } from '../config/api';
import { authService } from './authService';

interface ApiReport {
  id: string;
  userId: string;
  category: string;
  description: string;
  photos: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: Report['status'];
  createdAt: string;
  updatedAt: string;
}

const parseError = async (response: Response) => {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || 'No se pudo procesar la solicitud';
  } catch {
    return 'No se pudo procesar la solicitud';
  }
};

const mapToReport = (payload: ApiReport): Report => ({
  id: payload.id,
  userId: payload.userId,
  category: payload.category,
  description: payload.description,
  photoUrl: payload.photos[0] || '',
  location: payload.location,
  status: payload.status,
  createdAt: payload.createdAt,
  updatedAt: payload.updatedAt,
});

const authHeaders = (): Record<string, string> => {
  const token = authService.getAccessToken();
  const user = authService.getCurrentUser();
  const headers: Record<string, string> = {};
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }
  if (user?.id) {
    headers['x-user-id'] = user.id;
  }
  return headers;
};

export const reportService = {
  createReport: async (data: CreateReportDTO): Promise<Report> => {
    const response = await fetch(`${API_BASE_URL}/v1/reports`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({
        category: data.category,
        description: data.description,
        location: data.location,
        photos: [data.photoUri],
      }),
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    const payload = (await response.json()) as ApiReport;
    return mapToReport(payload);
  },

  getReports: async (): Promise<Report[]> => {
    const user = authService.getCurrentUser();
    const query = user?.id ? `?userId=${encodeURIComponent(user.id)}` : '';
    const response = await fetch(`${API_BASE_URL}/v1/reports${query}`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        ...authHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    const payload = (await response.json()) as { items: ApiReport[] };
    return payload.items.map(mapToReport);
  },

  getReportById: async (id: string): Promise<Report | undefined> => {
    const response = await fetch(`${API_BASE_URL}/v1/reports/${id}`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        ...authHeaders(),
      },
    });

    if (response.status === 404) {
      return undefined;
    }

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    const payload = (await response.json()) as ApiReport;
    return mapToReport(payload);
  },
};
