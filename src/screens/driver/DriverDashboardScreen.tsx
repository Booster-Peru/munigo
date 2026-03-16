import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../config/theme';

const RECENT_TRIPS = [
  {
    id: '1',
    destination: 'Plaza de Armas',
    time: '13:45',
    distance: '2.4 km',
    fare: 7.0,
    icon: 'location-outline',
  },
  {
    id: '2',
    destination: 'Hotel Punta Sal',
    time: '13:45',
    distance: '5.1 km',
    fare: 12.5,
    icon: 'business-outline',
  },
  {
    id: '3',
    destination: 'Rest. El Velero',
    time: '12:30',
    distance: '1.8 km',
    fare: 6.0,
    icon: 'restaurant-outline',
  },
];

export default function DriverDashboardScreen() {
  const { user, logout } = useAuth();
  const [isAvailable, setIsAvailable] = useState(false);

  const todayEarnings = RECENT_TRIPS.reduce((sum, t) => sum + t.fare, 0);

  const handleToggle = () => {
    if (!isAvailable) {
      Alert.alert('Activar servicio', '¿Empezar a recibir solicitudes de mototaxi?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Activar', onPress: () => setIsAvailable(true) },
      ]);
    } else {
      setIsAvailable(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Dark header card — matches Stitch */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color="#fff" />
          </View>
          {/* Info */}
          <View style={styles.headerInfo}>
            <Text style={styles.driverName}>{user?.fullName || 'Carlos Mendoza'}</Text>
            <View style={styles.statusRow}>
              <View
                style={[styles.statusDot, isAvailable ? styles.dotOnline : styles.dotOffline]}
              />
              <Text
                style={[
                  styles.statusText,
                  isAvailable ? styles.statusOnline : styles.statusOffline,
                ]}
              >
                {isAvailable ? 'Disponible' : 'No disponible'}
              </Text>
              <Text style={styles.driverId}> ID: 45293</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellBtn}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Earnings */}
        <View style={styles.earningsRow}>
          <View>
            <Text style={styles.earningsLabel}>Ganancias de hoy</Text>
            <Text style={styles.earningsAmount}>S/ {todayEarnings.toFixed(2)}</Text>
            <View style={styles.earningsTrend}>
              <Ionicons name="trending-up" size={14} color="#4ade80" />
              <Text style={styles.trendText}>+15.2% vs ayer</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="bicycle" size={18} color="rgba(255,255,255,0.7)" />
              <Text style={styles.statLabel}>VIAJES</Text>
              <Text style={styles.statValue}>{RECENT_TRIPS.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={18} color={theme.colors.accent} />
              <Text style={styles.statLabel}>RATING</Text>
              <Text style={styles.statValue}>4.9</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Recent trips */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimos viajes</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        {RECENT_TRIPS.map((trip) => (
          <View key={trip.id} style={styles.tripRow}>
            <View style={styles.tripIcon}>
              <Ionicons
                name={trip.icon as React.ComponentProps<typeof Ionicons>['name']}
                size={18}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.tripInfo}>
              <Text style={styles.tripDest}>{trip.destination}</Text>
              <Text style={styles.tripMeta}>
                {trip.time} · {trip.distance}
              </Text>
            </View>
            <View style={styles.tripRight}>
              <Text style={styles.tripFare}>S/ {trip.fare.toFixed(2)}</Text>
              <Text style={styles.completedBadge}>Completado</Text>
            </View>
          </View>
        ))}

        {/* Municipal notice */}
        <View style={styles.noticeBanner}>
          <Ionicons name="information-circle" size={18} color={theme.colors.primary} />
          <Text style={styles.noticeText}>
            <Text style={{ fontWeight: '700' }}>Recordatorio Municipal: </Text>
            Renovación de permisos disponible en el portal municipal.
          </Text>
        </View>

        {/* ACTIVAR SERVICIO — YELLOW as in Stitch */}
        <TouchableOpacity
          style={[styles.activateBtn, isAvailable && styles.activateBtnOff]}
          onPress={handleToggle}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isAvailable ? 'power' : 'power'}
            size={20}
            color={isAvailable ? '#dc2626' : theme.colors.text}
          />
          <Text style={[styles.activateBtnText, isAvailable && styles.activateBtnTextOff]}>
            {isAvailable ? 'DESACTIVAR SERVICIO' : 'ACTIVAR SERVICIO'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom nav — 4 tabs: Inicio, Pagos, Rutas, Perfil */}
      <View style={styles.bottomNav}>
        {[
          { icon: 'grid', label: 'Inicio', active: true },
          { icon: 'receipt-outline', label: 'Pagos', active: false },
          { icon: 'map-outline', label: 'Rutas', active: false },
          { icon: 'person-outline', label: 'Perfil', active: false },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.label}
            style={styles.navTab}
            onPress={() =>
              tab.label === 'Perfil' &&
              Alert.alert('Cerrar sesión', '¿Cerrar sesión?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Salir', style: 'destructive', onPress: logout },
              ])
            }
          >
            <Ionicons
              name={tab.icon as React.ComponentProps<typeof Ionicons>['name']}
              size={22}
              color={tab.active ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text style={[styles.navLabel, tab.active && styles.navLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerCard: {
    backgroundColor: '#1a2340',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerInfo: { flex: 1 },
  driverName: { color: '#fff', fontSize: 17, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  dotOnline: { backgroundColor: '#4ade80' },
  dotOffline: { backgroundColor: '#94a3b8' },
  statusText: { fontSize: 13, fontWeight: '500' },
  statusOnline: { color: '#4ade80' },
  statusOffline: { color: '#94a3b8' },
  driverId: { fontSize: 11, color: '#94a3b8' },
  bellBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  earningsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  earningsLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 4 },
  earningsAmount: { color: '#fff', fontSize: 32, fontWeight: '800' },
  earningsTrend: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  trendText: { color: '#4ade80', fontSize: 12, fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: 20 },
  statItem: { alignItems: 'center', gap: 3 },
  statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '600', letterSpacing: 1 },
  statValue: { color: '#fff', fontSize: 22, fontWeight: '800' },
  content: { flex: 1, padding: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  seeAll: { fontSize: 13, color: '#0d9488', fontWeight: '600' },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tripIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripInfo: { flex: 1 },
  tripDest: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  tripMeta: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  tripRight: { alignItems: 'flex-end' },
  tripFare: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  completedBadge: { fontSize: 11, color: '#059669', fontWeight: '600', marginTop: 2 },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#eff6ff',
    borderRadius: theme.roundness.medium,
    padding: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  noticeText: { flex: 1, fontSize: 12, color: theme.colors.text, lineHeight: 17 },
  activateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.roundness.medium,
    padding: 18,
  },
  activateBtnOff: { backgroundColor: '#fee2e2' },
  activateBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  activateBtnTextOff: { color: '#dc2626' },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingVertical: 8,
    paddingBottom: 16,
  },
  navTab: { flex: 1, alignItems: 'center', gap: 3 },
  navLabel: { fontSize: 10, color: theme.colors.textSecondary, fontWeight: '600' },
  navLabelActive: { color: theme.colors.primary },
});
