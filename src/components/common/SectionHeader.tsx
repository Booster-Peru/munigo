import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../config/theme';

interface SectionHeaderProps {
  title: string;
  onPress?: () => void;
  seeAllText?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  onPress,
  seeAllText = 'Ver todos',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {onPress && (
        <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
          <Text style={styles.seeAllText}>{seeAllText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: theme.spacing.m,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  seeAllText: {
    color: theme.colors.primary,
    ...theme.typography.caption,
    fontWeight: '600',
  },
});
