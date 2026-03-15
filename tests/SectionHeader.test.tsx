import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SectionHeader } from '../src/components/common/SectionHeader';

describe('SectionHeader', () => {
  it('renders title correctly', () => {
    const { getByText } = render(<SectionHeader title="Test Title" />);
    expect(getByText('Test Title')).toBeTruthy();
  });

  it('renders "Ver todos" button when onPress is provided', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <SectionHeader title="Test Title" onPress={onPressMock} />
    );
    
    const button = getByText('Ver todos');
    expect(button).toBeTruthy();
    
    fireEvent.press(button);
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('renders custom button text when provided', () => {
    const { getByText } = render(
      <SectionHeader title="Test Title" onPress={() => {}} seeAllText="More" />
    );
    expect(getByText('More')).toBeTruthy();
  });

  it('does not render button when onPress is not provided', () => {
    const { queryByText } = render(<SectionHeader title="Test Title" />);
    expect(queryByText('Ver todos')).toBeNull();
  });
});
