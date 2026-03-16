import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../config/theme';
import { useAuth } from '../../hooks/useAuth';
import { getTripHistory, Trip } from '../../services/transportService';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: 'Completado', color: '#059669', bg: '#dcfce7' },
  cancelled: { label: 'Cancelado', color: '#dc2626', bg: '#fee2e2' },
  in_progress: { label: 'En curso', color: '#2563eb', bg: '#dbeafe' },
  accepted: { label: 'Aceptado', color: '#0d9488', bg: '#ccfbf1' },
  pending: { label: 'Buscando', color: '#d97706', bg: '#fef3c7' },
};

function TripRow({ trip }: { trip: Trip }) {
  const status = STATUS_LABELS[trip.status] || {
    label: trip.status,
    color: '#64748b',
    bg: '#f1f5f9',
  };
  const date = new Date(trip.created_at);
  const formatted = date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={styles.tripRow}>
      <View style={styles.tripIcon}>
        <Ionicons name="bicycle" size={18} color={theme.colors.primary} />
      </View>
      <View style={styles.tripInfo}>
        <Text style={styles.tripDest} numberOfLines={1}>
          {trip.dest_label || 'Destino'}
        </Text>
        <Text style={styles.tripMeta}>
          {formatted} · {trip.type === 'premium' ? 'Premium' : 'Standard'}
        </Text>
      </View>
      <View style={styles.tripRight}>
        <Text style={styles.tripFare}>S/ {Number(trip.fare).toFixed(2)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
    </View>
  );
}

export default function TripHistoryScreen() {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getTripHistory(token)
      .then(setTrips)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Historial de viajes</Text>
          <Text style={styles.headerSub}>CANOAS DE PUNTA SAL</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.primary} />}

      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="warning-outline" size={20} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && trips.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="bicycle-outline" size={48} color={theme.colors.border} />
          <Text style={styles.emptyTitle}>Sin viajes aún</Text>
          <Text style={styles.emptySub}>Tus viajes aparecerán aquí.</Text>
        </View>
      )}

      <FlatList
        data={trips}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => <TripRow trip={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: '#1a2340',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  headerSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.8,
    marginTop: 1,
  },
  list: { padding: 16 },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tripIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripInfo: { flex: 1 },
  tripDest: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  tripMeta: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  tripRight: { alignItems: 'flex-end', gap: 4 },
  tripFare: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  statusBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  statusText: { fontSize: 10, fontWeight: '700' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    backgroundColor: '#fee2e2',
    borderRadius: theme.roundness.medium,
    padding: 14,
  },
  errorText: { color: '#dc2626', fontSize: 13 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  emptySub: { fontSize: 13, color: theme.colors.textSecondary },
});
