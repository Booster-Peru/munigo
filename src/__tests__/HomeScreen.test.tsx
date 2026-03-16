import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
  Search: 'Search',
  Bell: 'Bell',
  MapPin: 'MapPin',
  Plus: 'Plus',
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: jest.fn(),
    });
    (useAuth as jest.Mock).mockReturnValue({
      user: { fullName: 'Test User' },
    });
  });

  it('renders greeting with first name', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Hola, Test')).toBeTruthy();
  });

  it('renders module grid labels', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Transporte')).toBeTruthy();
    expect(getByText('Restaurantes')).toBeTruthy();
    expect(getByText('Billetera')).toBeTruthy();
  });

  it('renders location text', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Canoas de Punta Sal')).toBeTruthy();
  });
});
