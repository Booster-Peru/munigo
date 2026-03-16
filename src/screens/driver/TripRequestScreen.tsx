import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../../config/theme';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/useAuth';
import { acceptTrip } from '../../services/driverService';
import { cancelTrip } from '../../services/transportService';

type NavProp = StackNavigationProp<RootStackParamList>;

export default function TripRequestScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { tripId } = route.params as { tripId: string };
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await acceptTrip(tripId, token);
      navigation.replace('TripTracking', { tripId });
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo aceptar el viaje');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!token) return;
    try {
      await cancelTrip(tripId, token);
    } catch {
      /* silent */
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nueva solicitud</Text>
        <Text style={styles.headerSub}>Canoas de Punta Sal</Text>
      </View>

      {/* Route card */}
      <View style={styles.routeCard}>
        <View style={styles.routeRow}>
          <View style={styles.routeIconOrigin}>
            <Ionicons name="radio-button-on" size={14} color={theme.colors.primary} />
          </View>
          <Text style={styles.routeLabel}>Plaza de Armas Canoas</Text>
        </View>
        <View style={styles.routeConnector}>
          <View style={styles.routeDots}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.routeDot} />
            ))}
          </View>
        </View>
        <View style={styles.routeRow}>
          <View style={styles.routeIconDest}>
            <Ionicons name="location" size={14} color={theme.colors.accent} />
          </View>
          <Text style={styles.routeLabel}>Playa Punta Sal</Text>
        </View>
      </View>

      {/* Fare info */}
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Ionicons name="cash-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.infoLabel}>TARIFA</Text>
          <Text style={styles.infoValue}>S/ 5.00</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.infoLabel}>RECOGIDA</Text>
          <Text style={styles.infoValue}>~3 min</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Ionicons name="navigate-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.infoLabel}>DISTANCIA</Text>
          <Text style={styles.infoValue}>2.4 km</Text>
        </View>
      </View>

      {/* Payment method */}
      <View style={styles.paymentRow}>
        <Ionicons name="wallet-outline" size={18} color={theme.colors.primary} />
        <Text style={styles.paymentText}>Pago: Billetera MuniGo</Text>
      </View>

      <View style={{ flex: 1 }} />

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={handleReject}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Ionicons name="close" size={22} color="#dc2626" />
          <Text style={styles.rejectText}>Rechazar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={handleAccept}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.text} />
          ) : (
            <>
              <Ionicons name="checkmark" size={22} color={theme.colors.text} />
              <Text style={styles.acceptText}>Aceptar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: '#1a2340',
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  routeCard: {
    backgroundColor: theme.colors.surface,
    margin: 16,
    borderRadius: theme.roundness.medium,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeIconOrigin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeIconDest: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  routeConnector: { paddingLeft: 13, paddingVertical: 4 },
  routeDots: { gap: 4 },
  routeDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: theme.colors.border },
  infoGrid: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.medium,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoItem: { flex: 1, alignItems: 'center', gap: 6 },
  infoDivider: { width: 1, backgroundColor: theme.colors.border },
  infoLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 1,
  },
  infoValue: { fontSize: 16, fontWeight: '800', color: theme.colors.text },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#eff6ff',
    borderRadius: theme.roundness.medium,
    padding: 12,
  },
  paymentText: { fontSize: 13, fontWeight: '600', color: theme.colors.primary },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#dc2626',
    borderRadius: theme.roundness.medium,
    padding: 18,
  },
  rejectText: { fontSize: 15, fontWeight: '700', color: '#dc2626' },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.roundness.medium,
    padding: 18,
  },
  acceptText: { fontSize: 15, fontWeight: '800', color: theme.colors.text },
});
