import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../../config/theme';
import { RootStackParamList } from '../../types/navigation';
import { getMandado, Mandado } from '../../services/mandadosService';
import { useAuth } from '../../hooks/useAuth';

export default function MandadoSummaryScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'MandadoSummary'>>();
  const { token } = useAuth();
  const { mandadoId } = route.params;

  const [mandado, setMandado] = useState<Mandado | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    getMandado(mandadoId, token)
      .then(setMandado)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mandadoId, token]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator style={{ marginTop: 60 }} color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={48} color="#fff" />
        </View>
        <Text style={styles.title}>¡Mandado entregado!</Text>
        <Text style={styles.sub}>Tu encargo llegó con éxito</Text>

        {mandado && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tipo</Text>
              <Text style={styles.summaryValue}>{mandado.type}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tarifa pagada</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                S/ {Number(mandado.fare).toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.ratingTitle}>¿Cómo estuvo el servicio?</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((s) => (
            <TouchableOpacity key={s} onPress={() => setRating(s)}>
              <Ionicons
                name={s <= rating ? 'star' : 'star-outline'}
                size={36}
                color={s <= rating ? '#f59e0b' : theme.colors.border}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => navigation.navigate('Dashboard')}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaBtnText}>ENVIAR CALIFICACIÓN</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: { fontSize: 24, fontWeight: '800', color: theme.colors.text },
  sub: { fontSize: 14, color: theme.colors.textSecondary },
  summaryCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.large,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  summaryLabel: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '600' },
  summaryValue: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  divider: { height: 1, backgroundColor: theme.colors.border },
  ratingTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginTop: 8 },
  stars: { flexDirection: 'row', gap: 8 },
  ctaBtn: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.roundness.medium,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  ctaBtnText: { fontSize: 15, fontWeight: '800', color: theme.colors.text },
});
