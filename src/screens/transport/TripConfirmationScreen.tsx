import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../../config/theme';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/useAuth';
import { getActiveTrip, cancelTrip, subscribeToTrip, Trip } from '../../services/transportService';

type NavProp = StackNavigationProp<RootStackParamList>;

export default function TripConfirmationScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { tripId } = route.params as { tripId: string };
  const { token } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getActiveTrip(token)
      .then((t) => {
        setTrip(t);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const unsubscribe = subscribeToTrip(
      tripId,
      (updated) => {
        setTrip(updated);
        if (updated.status === 'accepted') {
          navigation.replace('TripTracking', { tripId });
        }
        if (updated.status === 'cancelled') {
          Alert.alert('Viaje cancelado', 'El conductor canceló el viaje.');
          navigation.goBack();
        }
      },
      () => {},
    );
    return unsubscribe;
  }, [token, tripId]);

  const handleCancel = () => {
    Alert.alert('¿Cancelar viaje?', 'Se cancelará tu solicitud.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          if (!token) return;
          try {
            await cancelTrip(tripId, token);
            navigation.goBack();
          } catch (e: unknown) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Error');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator style={{ flex: 1 }} color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Dark header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>MuniGo Transport</Text>
          <Text style={styles.headerSub}>CANOAS DE PUNTA SAL</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Route summary */}
      <View style={styles.routeCard}>
        <View style={styles.routeRow}>
          <Ionicons name="radio-button-on" size={16} color={theme.colors.primary} />
          <Text style={styles.routeLabel}>{trip?.origin_label || 'Origen'}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeRow}>
          <Ionicons name="location" size={16} color={theme.colors.accent} />
          <Text style={styles.routeLabel}>{trip?.dest_label || 'Destino'}</Text>
        </View>
      </View>

      {/* Status */}
      <View style={styles.statusCard}>
        <View style={styles.pulsingDot} />
        <View style={styles.statusInfo}>
          <Text style={styles.statusTitle}>Buscando mototaxi</Text>
          <Text style={styles.statusSub}>Conectando con conductores disponibles cerca de ti…</Text>
        </View>
      </View>

      {/* Fare */}
      <View style={styles.fareCard}>
        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Tipo de viaje</Text>
          <Text style={styles.fareValue}>{trip?.type === 'premium' ? 'Premium' : 'Standard'}</Text>
        </View>
        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Tarifa estimada</Text>
          <Text style={styles.farePrimary}>S/ {Number(trip?.fare || 0).toFixed(2)}</Text>
        </View>
        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Método de pago</Text>
          <View style={styles.paymentChip}>
            <Ionicons name="wallet-outline" size={14} color={theme.colors.primary} />
            <Text style={styles.paymentChipText}>Billetera MuniGo</Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      {/* Cancel CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.85}>
          <Ionicons name="close-circle-outline" size={20} color="#dc2626" />
          <Text style={styles.cancelText}>Cancelar solicitud</Text>
        </TouchableOpacity>
      </View>
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
  routeCard: {
    backgroundColor: theme.colors.surface,
    margin: 16,
    borderRadius: theme.roundness.medium,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: theme.colors.border,
    marginLeft: 7,
    marginVertical: 4,
  },
  routeLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#eff6ff',
    marginHorizontal: 16,
    borderRadius: theme.roundness.medium,
    padding: 16,
  },
  pulsingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.primary,
  },
  statusInfo: { flex: 1 },
  statusTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  statusSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2, lineHeight: 17 },
  fareCard: {
    backgroundColor: theme.colors.surface,
    margin: 16,
    borderRadius: theme.roundness.medium,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fareLabel: { fontSize: 13, color: theme.colors.textSecondary },
  fareValue: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  farePrimary: { fontSize: 18, fontWeight: '800', color: theme.colors.primary },
  paymentChip: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  paymentChipText: { fontSize: 13, fontWeight: '600', color: theme.colors.primary },
  footer: { padding: 16 },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#dc2626',
    borderRadius: theme.roundness.medium,
    padding: 16,
  },
  cancelText: { fontSize: 15, fontWeight: '700', color: '#dc2626' },
});
