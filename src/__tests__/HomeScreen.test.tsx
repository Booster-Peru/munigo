import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

// Mocking hooks or external libraries if necessary
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mocking icon library to avoid rendering issues in tests
jest.mock('lucide-react-native', () => ({
  Bell: 'Bell',
  Search: 'Search',
  MapPin: 'MapPin',
  TrendingUp: 'TrendingUp',
  CheckCircle2: 'CheckCircle2',
  Clock: 'Clock',
  Plus: 'Plus',
  Zap: 'Zap',
  ChevronRight: 'ChevronRight',
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: jest.fn(),
    });
    (useAuth as jest.Mock).mockReturnValue({
      user: { name: 'Test User' },
    });
  });

  it('renders correctly with user name', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Hola, Test User')).toBeTruthy();
    expect(getByText('Ciudad Satélite, MX')).toBeTruthy();
  });

  it('renders stats badges', () => {
    const { getByText, getAllByText } = render(<HomeScreen />);
    expect(getByText('Reportes')).toBeTruthy();
    expect(getByText('Resueltos')).toBeTruthy();
    expect(getAllByText('En curso').length).toBeGreaterThan(0);
  });
});
