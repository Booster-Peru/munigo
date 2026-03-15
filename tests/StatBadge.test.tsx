import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StatBadge } from '../src/components/common/StatBadge';
import { theme } from '../src/config/theme';

describe('StatBadge', () => {
  const defaultProps = {
    label: 'Reports',
    value: '12',
  };

  it('renders label and value correctly', () => {
    const { getByText } = render(<StatBadge {...defaultProps} />);
    
    expect(getByText('Reports')).toBeTruthy();
    expect(getByText('12')).toBeTruthy();
  });

  it('uses default color for dot if not provided', () => {
    const { getByTestId } = render(
      <StatBadge {...defaultProps} testID="stat-badge" />
    );
    const dot = getByTestId('stat-badge-dot');
    expect(dot.props.style).toContainEqual({ backgroundColor: theme.colors.primary });
  });

  it('applies custom color to dot', () => {
    const customColor = '#FF0000';
    const { getByTestId } = render(
      <StatBadge {...defaultProps} color={customColor} testID="stat-badge" />
    );
    const dot = getByTestId('stat-badge-dot');
    expect(dot.props.style).toContainEqual({ backgroundColor: customColor });
  });
});
