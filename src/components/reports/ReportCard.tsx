import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../config/theme';
import { Clock, TrendingUp, ChevronRight } from 'lucide-react-native';

interface ReportCardProps {
  report: {
    id: string;
    title: string;
    category: string;
    status: string;
    date: string;
    votes: number;
  };
  onPress?: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onPress }) => {
  const isResolved = report.status === 'Resuelto';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={onPress}
      testID="report-card"
    >
      <View style={styles.header}>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryTagText}>{report.category}</Text>
        </View>
        <View
          style={[styles.statusTag, { backgroundColor: isResolved ? '#10B98120' : '#F59E0B20' }]}
        >
          <Text style={[styles.statusTagText, { color: isResolved ? '#10B981' : '#F59E0B' }]}>
            {report.status}
          </Text>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {report.title}
      </Text>

      <View style={styles.footer}>
        <View style={styles.meta}>
          <Clock size={12} stroke={theme.colors.textSecondary} />
          <Text style={styles.metaText}>{report.date}</Text>
        </View>
        <View style={styles.votesContainer}>
          <TrendingUp size={12} stroke={theme.colors.primary} />
          <Text style={styles.votesText}>{report.votes} apoyos</Text>
        </View>
        <ChevronRight size={18} stroke={theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.large,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.s,
  },
  categoryTag: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.l,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  votesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  votesText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
