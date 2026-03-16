import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../../config/theme';
import { RootStackParamList } from '../../types/navigation';
import {
  getMandado,
  cancelMandado,
  getMandadoHistory,
  Mandado,
  MandadoStatus,
} from '../../services/mandadosService';
import { useAuth } from '../../hooks/useAuth';

const STATUS_STEPS: MandadoStatus[] = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'DELIVERED'];

const STATUS_LABELS: Record<MandadoStatus, string> = {
  PENDING: 'Buscando mandadero…',
  ACCEPTED: 'Mandadero asignado',
  IN_PROGRESS: 'En camino',
  DELIVERED: '¡Entregado!',
  CANCELLED: 'Cancelado',
};

const STATUS_ICONS: Record<MandadoStatus, string> = {
  PENDING: 'hourglass-outline',
  ACCEPTED: 'person-outline',
  IN_PROGRESS: 'bicycle-outline',
  DELIVERED: 'checkmark-circle-outline',
  CANCELLED: 'close-circle-outline',
};

export default function MandadoTrackingScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'MandadoTracking'>>();
  const { token } = useAuth();
  const { mandadoId } = route.params;

  const isHistory = mandadoId === 'history';
  const [mandado, setMandado] = useState<Mandado | null>(null);
  const [history, setHistory] = useState<Mandado[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMandado = async () => {
    if (isHistory) {
      const list = await getMandadoHistory(token);
      setHistory(list);
    } else {
      const m = await getMandado(mandadoId, token);
      setMandado(m);
      if (m.status === 'DELIVERED') {
        if (intervalRef.current) clearInterval(intervalRef.current);
        navigation.replace('MandadoSummary', { mandadoId });
      }
    }
  };

  useEffect(() => {
    fetchMandado().finally(() => setLoading(false));
    if (!isHistory) {
      intervalRef.current = setInterval(fetchMandado, 8000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [mandadoId, token]);

  const handleCancel = () => {
    Alert.alert('Cancelar mandado', '¿Seguro que deseas cancelar este mandado?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelMandado(mandadoId, token);
            navigation.navigate('Dashboard');
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
        <ActivityIndicator style={{ marginTop: 60 }} color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  // History view
  if (isHistory) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historial de Mandados</Text>
          <View style={{ width: 36 }} />
        </View>
        {history.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color={theme.colors.border} />
            <Text style={styles.emptyText}>Sin mandados previos</Text>
          </View>
        ) : (
          history.map((m) => {
            const meta = {
              PENDING: '#d97706',
              ACCEPTED: '#0d9488',
              IN_PROGRESS: '#2563eb',
              DELIVERED: '#059669',
              CANCELLED: '#dc2626',
            };
            return (
              <View key={m.id} style={styles.historyCard}>
                <View style={styles.historyRow}>
                  <Text style={styles.historyType}>{m.type}</Text>
                  <Text style={[styles.historyStatus, { color: meta[m.status] }]}>
                    {STATUS_LABELS[m.status]}
                  </Text>
                </View>
                <Text style={styles.historyDesc} numberOfLines={1}>
                  {m.description}
                </Text>
                <Text style={styles.historyFare}>S/ {Number(m.fare).toFixed(2)}</Text>
              </View>
            );
          })
        )}
      </SafeAreaView>
    );
  }

  // Tracking view
  const currentStep = mandado ? STATUS_STEPS.indexOf(mandado.status as MandadoStatus) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seguimiento</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.statusBanner}>
        <Ionicons
          name={
            (STATUS_ICONS[mandado?.status as MandadoStatus] ||
              'hourglass-outline') as React.ComponentProps<typeof Ionicons>['name']
          }
          size={28}
          color={theme.colors.primary}
        />
        <Text style={styles.statusBannerText}>
          {STATUS_LABELS[mandado?.status as MandadoStatus] || '…'}
        </Text>
      </View>

      {/* Steps */}
      <View style={styles.stepsCard}>
        {STATUS_STEPS.map((s, i) => {
          const done = i <= currentStep;
          const active = i === currentStep;
          return (
            <View key={s} style={styles.stepRow}>
              <View
                style={[styles.stepDot, done && styles.stepDotDone, active && styles.stepDotActive]}
              >
                {done && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
              <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>
                {STATUS_LABELS[s]}
              </Text>
              {i < STATUS_STEPS.length - 1 && (
                <View style={[styles.stepLine, done && styles.stepLineDone]} />
              )}
            </View>
          );
        })}
      </View>

      {mandado && (
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>{mandado.description}</Text>
          <Text style={styles.detailAddress}>📍 {mandado.delivery_address}</Text>
          <Text style={styles.detailFare}>Tarifa: S/ {Number(mandado.fare).toFixed(2)}</Text>
        </View>
      )}

      {mandado?.status === 'PENDING' && (
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelBtnText}>Cancelar mandado</Text>
        </TouchableOpacity>
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
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statusBannerText: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  stepsCard: {
    margin: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.large,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    gap: 0,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepDotDone: { backgroundColor: '#059669' },
  stepDotActive: { backgroundColor: theme.colors.primary },
  stepLine: {
    position: 'absolute',
    left: 10,
    top: 30,
    width: 2,
    height: 16,
    backgroundColor: theme.colors.border,
  },
  stepLineDone: { backgroundColor: '#059669' },
  stepLabel: { fontSize: 14, color: theme.colors.textSecondary },
  stepLabelActive: { fontWeight: '700', color: theme.colors.text },
  detailCard: {
    marginHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    gap: 6,
  },
  detailTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  detailAddress: { fontSize: 13, color: theme.colors.textSecondary },
  detailFare: { fontSize: 14, fontWeight: '700', color: theme.colors.primary },
  cancelBtn: {
    margin: 16,
    borderRadius: theme.roundness.medium,
    borderWidth: 1.5,
    borderColor: '#dc2626',
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#dc2626', fontSize: 14, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 16, color: theme.colors.textSecondary },
  historyCard: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    gap: 4,
  },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between' },
  historyType: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  historyStatus: { fontSize: 13, fontWeight: '600' },
  historyDesc: { fontSize: 12, color: theme.colors.textSecondary },
  historyFare: { fontSize: 14, fontWeight: '700', color: theme.colors.primary },
});
