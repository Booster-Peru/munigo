export { User } from './auth';

export type ReportStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export interface Report {
  id: string;
  userId: string;
  description: string;
  category: string;
  photoUrl: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportDTO {
  description: string;
  category: string;
  photoUri: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}
