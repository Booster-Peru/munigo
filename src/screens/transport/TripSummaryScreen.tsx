import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../../config/theme';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/useAuth';
import { getActiveTrip, Trip } from '../../services/transportService';

type NavProp = StackNavigationProp<RootStackParamList>;

export default function TripSummaryScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { tripId } = route.params as { tripId: string };
  const { token } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!token) return;
    // Fetch the specific trip by falling back to history
    getActiveTrip(token).then(setTrip).catch(() => {});
  }, [token]);

  const handleRate = (stars: number) => {
    setRating(stars);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Calificación requerida', 'Por favor selecciona una calificación.');
      return;
    }
    setSubmitted(true);
    setTimeout(() => navigation.navigate('Dashboard'), 1200);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Dark header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Viaje completado</Text>
          <Text style={styles.headerSub}>CANOAS DE PUNTA SAL</Text>
        </View>
      </View>

      {/* Success icon */}
      <View style={styles.successSection}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={40} color="#fff" />
        </View>
        <Text style={styles.successTitle}>¡Llegaste a tu destino!</Text>
        <Text style={styles.successSub}>Gracias por usar MuniGo Transport</Text>
      </View>

      {/* Fare card */}
      <View style={styles.fareCard}>
        <Text style={styles.fareLabel}>Total cobrado</Text>
        <Text style={styles.fareAmount}>S/ {Number(trip?.fare || 0).toFixed(2)}</Text>
        <View style={styles.paymentRow}>
          <Ionicons name="wallet-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.paymentText}>Billetera MuniGo</Text>
        </View>
      </View>

      {/* Trip details */}
      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Ionicons name="radio-button-on" size={16} color={theme.colors.primary} />
          <Text style={styles.detailText}>{trip?.origin_label || 'Origen'}</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailRow}>
          <Ionicons name="location" size={16} color={theme.colors.accent} />
          <Text style={styles.detailText}>{trip?.dest_label || 'Destino'}</Text>
        </View>
      </View>

      {/* Rating */}
      <View style={styles.ratingCard}>
        <Text style={styles.ratingTitle}>¿Cómo fue tu viaje?</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => handleRate(star)} activeOpacity={0.8}>
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={36}
                color={star <= rating ? theme.colors.accent : theme.colors.border}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ flex: 1 }} />

      {/* CTA */}
      <View style={styles.footer}>
        {submitted ? (
          <View style={styles.ctaBtn}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.text} />
            <Text style={styles.ctaText}>¡Gracias por calificar!</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.ctaBtn} onPress={handleSubmit} activeOpacity={0.85}>
            <Text style={styles.ctaText}>ENVIAR CALIFICACIÓN</Text>
            <Ionicons name="arrow-forward" size={18} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.historyBtn} onPress={() => navigation.navigate('TripHistory')}>
          <Text style={styles.historyText}>Ver historial de viajes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: '#1a2340',
    paddingHorizontal: 16, paddingVertical: 14,
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 11, textAlign: 'center', letterSpacing: 0.8, marginTop: 1 },
  successSection: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 8,
  },
  successCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#059669',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  successTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  successSub: { fontSize: 14, color: theme.colors.textSecondary },
  fareCard: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: 16,
    borderRadius: theme.roundness.large,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  fareLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  fareAmount: { color: '#fff', fontSize: 38, fontWeight: '800' },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  paymentText: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  detailsCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16, marginTop: 14,
    borderRadius: theme.roundness.medium,
    padding: 14,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailDivider: { width: 2, height: 16, backgroundColor: theme.colors.border, marginLeft: 7, marginVertical: 3 },
  detailText: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  ratingCard: {
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  ratingTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  starsRow: { flexDirection: 'row', gap: 8 },
  footer: { padding: 16, gap: 10 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.roundness.medium, padding: 18,
  },
  ctaText: { fontSize: 15, fontWeight: '800', color: theme.colors.text, letterSpacing: 0.5 },
  historyBtn: { alignItems: 'center', padding: 10 },
  historyText: { fontSize: 13, color: '#0d9488', fontWeight: '600' },
});
