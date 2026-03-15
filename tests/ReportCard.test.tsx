import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ReportCard } from '../src/components/reports/ReportCard';

describe('ReportCard', () => {
  const mockReport = {
    id: '1',
    title: 'Bache en la calle principal',
    category: 'Vialidad',
    status: 'Pendiente',
    date: '2023-11-01',
    votes: 12,
  };

  it('renders report details correctly', () => {
    const { getByText } = render(<ReportCard report={mockReport} />);
    
    expect(getByText('Bache en la calle principal')).toBeTruthy();
    expect(getByText('Vialidad')).toBeTruthy();
    expect(getByText('Pendiente')).toBeTruthy();
    expect(getByText('2023-11-01')).toBeTruthy();
    expect(getByText('12 apoyos')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <ReportCard report={mockReport} onPress={onPressMock} />
    );
    
    // The main TouchableOpacity is the card itself
    const card = getByTestId('report-card');
    fireEvent.press(card);
    
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('applies correct status colors for Resolved status', () => {
    const resolvedReport = { ...mockReport, status: 'Resuelto' };
    const { getByText } = render(<ReportCard report={resolvedReport} />);
    
    const statusText = getByText('Resuelto');
    expect(statusText.props.style).toContainEqual({ color: '#10B981' });
  });

  it('applies correct status colors for non-Resolved status', () => {
    const { getByText } = render(<ReportCard report={mockReport} />);
    
    const statusText = getByText('Pendiente');
    expect(statusText.props.style).toContainEqual({ color: '#F59E0B' });
  });
});
