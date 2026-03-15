import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../config/theme';

interface StatBadgeProps {
  label: string;
  value: string;
  color?: string;
}

export const StatBadge: React.FC<StatBadgeProps & { testID?: string }> = ({
  label,
  value,
  color = theme.colors.primary,
  testID,
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <View
        style={[styles.dot, { backgroundColor: color }]}
        testID={testID ? `${testID}-dot` : undefined}
      />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.roundness.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: theme.spacing.s,
  },
  value: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '700',
    marginRight: 4,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
});
