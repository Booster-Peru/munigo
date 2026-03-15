import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../config/theme';
import { Filter, Search, FileX } from 'lucide-react-native';
import { reportService } from '../services/reportService';
import { Report } from '../types';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En curso',
  RESOLVED: 'Resuelto',
  REJECTED: 'Rechazado',
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'RESOLVED':
      return theme.colors.success;
    case 'IN_PROGRESS':
      return theme.colors.primary;
    case 'PENDING':
      return theme.colors.error;
    case 'REJECTED':
      return theme.colors.textSecondary;
    default:
      return theme.colors.textSecondary;
  }
};

const formatDate = (isoDate: string) => {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `Hace ${diffMin}m`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays}d`;
};

const ReportsScreen = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadReports = useCallback(async () => {
    try {
      const data = await reportService.getReports();
      setReports(data);
    } catch {
      // silently fail — could add error state
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadReports();
    }, [loadReports]),
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadReports();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Reportes</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Search size={20} color={theme.colors.textSecondary} />
        <Text style={styles.searchText}>Buscar en mis reportes...</Text>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.centered}>
          <FileX size={48} color={theme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>Sin reportes aún</Text>
          <Text style={styles.emptySubtitle}>
            Crea tu primer reporte usando el botón + en la barra inferior.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          {reports.map((report) => (
            <TouchableOpacity key={report.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryText}>{report.category}</Text>
                </View>
                <Text style={styles.dateText}>{formatDate(report.createdAt)}</Text>
              </View>
              <Text style={styles.reportTitle}>{report.description}</Text>
              <View style={styles.statusRow}>
                <View
                  style={[styles.statusDot, { backgroundColor: getStatusColor(report.status) }]}
                />
                <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                  {STATUS_LABELS[report.status] || report.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.l,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  filterButton: {
    padding: theme.spacing.s,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.l,
    paddingHorizontal: theme.spacing.m,
    height: 48,
    borderRadius: theme.roundness.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.m,
  },
  searchText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.s,
  },
  list: {
    padding: theme.spacing.l,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.large,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
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
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  dateText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  reportTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginTop: theme.spacing.m,
  },
  emptySubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.s,
    lineHeight: 20,
  },
});

export default ReportsScreen;
