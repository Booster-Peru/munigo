import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../../config/theme';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/useAuth';
import { getActiveTrip, cancelTrip, subscribeToTrip, Trip } from '../../services/transportService';
import { startTrip, completeTrip } from '../../services/driverService';

type NavProp = StackNavigationProp<RootStackParamList>;

export default function TripTrackingScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { tripId } = route.params as { tripId: string };
  const { token, user } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  useEffect(() => {
    if (!token) return;
    getActiveTrip(token)
      .then(setTrip)
      .catch(() => {});

    const unsubscribe = subscribeToTrip(
      tripId,
      (updated) => {
        setTrip(updated);
        if (updated.status === 'completed') {
          navigation.replace('TripSummary', { tripId });
        }
        if (updated.status === 'cancelled') {
          Alert.alert('Viaje cancelado', 'El viaje fue cancelado.');
          navigation.navigate('Dashboard');
        }
      },
      () => {},
    );
    return unsubscribe;
  }, [token, tripId]);

  const statusLabel = trip?.status === 'in_progress' ? 'Viaje en curso' : 'Conductor en camino';
  const statusColor = trip?.status === 'in_progress' ? '#059669' : theme.colors.primary;

  const handleCancel = () => {
    if (trip?.status === 'in_progress') {
      Alert.alert('No disponible', 'No se puede cancelar un viaje en curso.');
      return;
    }
    Alert.alert('¿Cancelar viaje?', 'El conductor ha sido asignado.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Cancelar de todas formas',
        style: 'destructive',
        onPress: async () => {
          if (!token) return;
          await cancelTrip(tripId, token);
          navigation.navigate('Dashboard');
        },
      },
    ]);
  };

  // Driver actions (only shown for DRIVER role)
  const isDriver = user?.role === 'DRIVER';
  const handleDriverAction = async () => {
    if (!token || !trip) return;
    try {
      if (trip.status === 'accepted') {
        const updated = await startTrip(tripId, token);
        setTrip(updated);
      } else if (trip.status === 'in_progress') {
        await completeTrip(tripId, token);
        navigation.replace('TripSummary', { tripId });
      }
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Error');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Dark header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Seguimiento en vivo</Text>
          <Text style={styles.headerSub}>CANOAS DE PUNTA SAL</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Map placeholder */}
      <View style={styles.mapArea}>
        <Animated.View style={[styles.driverDot, { transform: [{ scale: pulse }] }]} />
        <View style={styles.mapLabel}>
          <Ionicons name="bicycle" size={22} color={theme.colors.primary} />
          <Text style={styles.mapLabelText}>Conductor en ruta</Text>
        </View>
      </View>

      {/* Status banner */}
      <View style={[styles.statusBanner, { borderLeftColor: statusColor }]}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
      </View>

      {/* Driver info card */}
      <View style={styles.driverCard}>
        <View style={styles.driverAvatar}>
          <Ionicons name="person" size={26} color="#fff" />
        </View>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>Conductor asignado</Text>
          <View style={styles.driverMeta}>
            <Ionicons name="star" size={13} color={theme.colors.accent} />
            <Text style={styles.driverRating}>4.9</Text>
            <Text style={styles.driverPlate}> · ABC-123</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => Linking.openURL('tel:+51987654321')}
          activeOpacity={0.8}
        >
          <Ionicons name="call" size={20} color="#0d9488" />
        </TouchableOpacity>
      </View>

      {/* Fare info */}
      <View style={styles.fareRow}>
        <View style={styles.fareItem}>
          <Text style={styles.fareItemLabel}>DESTINO</Text>
          <Text style={styles.fareItemValue}>{trip?.dest_label || 'Destino'}</Text>
        </View>
        <View style={styles.fareDivider} />
        <View style={styles.fareItem}>
          <Text style={styles.fareItemLabel}>TARIFA</Text>
          <Text style={styles.fareItemValue}>S/ {Number(trip?.fare || 0).toFixed(2)}</Text>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      {/* Driver action button */}
      {isDriver && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.driverActionBtn}
            onPress={handleDriverAction}
            activeOpacity={0.85}
          >
            <Text style={styles.driverActionText}>
              {trip?.status === 'accepted' ? 'INICIAR VIAJE' : 'COMPLETAR VIAJE'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      )}

      {/* Citizen cancel */}
      {!isDriver && trip?.status !== 'in_progress' && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.85}>
            <Text style={styles.cancelText}>Cancelar viaje</Text>
          </TouchableOpacity>
        </View>
      )}
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
  mapArea: {
    height: 200,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  driverDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mapLabelText: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#f0fdf4',
    borderRadius: theme.roundness.medium,
    padding: 12,
    borderLeftWidth: 4,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 14, fontWeight: '700' },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.medium,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a2340',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  driverMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  driverRating: { fontSize: 13, color: theme.colors.text, fontWeight: '600', marginLeft: 3 },
  driverPlate: { fontSize: 12, color: theme.colors.textSecondary },
  callBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.medium,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  fareItem: { flex: 1, alignItems: 'center' },
  fareItemLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
  },
  fareItemValue: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginTop: 3 },
  fareDivider: { width: 1, height: 32, backgroundColor: theme.colors.border },
  footer: { padding: 16 },
  driverActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.roundness.medium,
    padding: 18,
  },
  driverActionText: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.medium,
    padding: 16,
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: theme.colors.textSecondary },
});
