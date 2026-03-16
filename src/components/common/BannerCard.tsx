import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../config/theme';

interface BannerCardProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  variant?: 'primary' | 'accent' | 'info';
}

export const BannerCard = ({ title, subtitle, onPress, variant = 'primary' }: BannerCardProps) => {
  const bgColor =
    variant === 'accent'
      ? theme.colors.accent
      : variant === 'info'
        ? '#eff6ff'
        : theme.colors.primary;

  const textColor =
    variant === 'accent' ? '#1e293b' : variant === 'info' ? theme.colors.primary : '#fff';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: bgColor }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
      disabled={!onPress}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: textColor, opacity: 0.8 }]} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {onPress && <Text style={[styles.cta, { color: textColor }]}>Ver más →</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.roundness.large,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  cta: {
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 0,
  },
});
