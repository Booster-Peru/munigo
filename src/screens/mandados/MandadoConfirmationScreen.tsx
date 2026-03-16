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

const TYPE_LABELS: Record<string, string> = {
  COMPRAS: 'Compras',
  TRAMITE: 'Trámite',
  MENSAJERIA: 'Mensajería',
  OTRO: 'Mandado',
};

export default function MandadoConfirmationScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'MandadoConfirmation'>>();
  const { token } = useAuth();
  const { mandadoId } = route.params;

  const [mandado, setMandado] = useState<Mandado | null>(null);
  const [loading, setLoading] = useState(true);

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
        <Text style={styles.title}>¡Mandado solicitado!</Text>
        <Text style={styles.sub}>Buscando un mandadero cerca de ti…</Text>

        {mandado && (
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tipo</Text>
              <Text style={styles.detailValue}>{TYPE_LABELS[mandado.type] || mandado.type}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Descripción</Text>
              <Text style={[styles.detailValue, { flex: 1, textAlign: 'right' }]}>
                {mandado.description}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Entrega en</Text>
              <Text style={styles.detailValue}>{mandado.delivery_address}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tarifa</Text>
              <Text style={[styles.detailValue, { color: theme.colors.primary }]}>
                S/ {Number(mandado.fare).toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => navigation.navigate('MandadoTracking', { mandadoId })}
          activeOpacity={0.85}
        >
          <Text style={styles.trackBtnText}>SEGUIR MI MANDADO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.homeBtnText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 24, fontWeight: '800', color: theme.colors.text },
  sub: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 8 },
  detailCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.large,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  detailLabel: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '600' },
  detailValue: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  separator: { height: 1, backgroundColor: theme.colors.border },
  trackBtn: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.roundness.medium,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  trackBtnText: { fontSize: 15, fontWeight: '800', color: theme.colors.text },
  homeBtn: { paddingVertical: 10 },
  homeBtnText: { fontSize: 14, color: theme.colors.textSecondary, fontWeight: '600' },
});
