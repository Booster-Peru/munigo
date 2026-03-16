import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { theme } from '../../config/theme';

interface ModuleCardProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  badge?: string;
}

export const ModuleCard = ({ icon, label, onPress, disabled, badge }: ModuleCardProps) => (
  <TouchableOpacity
    style={[styles.card, disabled && styles.cardDisabled]}
    onPress={onPress}
    activeOpacity={0.75}
    disabled={disabled}
  >
    <View style={styles.iconWrapper}>{icon}</View>
    <Text style={[styles.label, disabled && styles.labelDisabled]} numberOfLines={2}>
      {label}
    </Text>
    {badge && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.large,
    padding: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 90,
    justifyContent: 'center',
  },
  cardDisabled: {
    opacity: 0.5,
    backgroundColor: '#f1f5f9',
  },
  iconWrapper: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 16,
  },
  labelDisabled: {
    color: theme.colors.textSecondary,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.accent,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1e293b',
  },
});
