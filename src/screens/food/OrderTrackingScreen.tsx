import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../../config/theme';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/useAuth';
import { getOrder, cancelOrder, Order, OrderStatus } from '../../services/ordersService';

type NavProp = StackNavigationProp<RootStackParamList>;

const STEPS: Array<{ status: OrderStatus; label: string; icon: string }> = [
  { status: 'PENDING', label: 'Pedido recibido', icon: 'receipt-outline' },
  { status: 'ACCEPTED', label: 'Aceptado', icon: 'checkmark-circle-outline' },
  { status: 'PREPARING', label: 'En preparación', icon: 'flame-outline' },
  { status: 'READY', label: 'Listo para envío', icon: 'bag-check-outline' },
  { status: 'DELIVERING', label: 'En camino', icon: 'bicycle-outline' },
  { status: 'DELIVERED', label: '¡Entregado!', icon: 'home-outline' },
];

const STATUS_ORDER: OrderStatus[] = [
  'PENDING',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'DELIVERING',
  'DELIVERED',
];

export default function OrderTrackingScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { orderId } = route.params as { orderId: string };
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = () => {
    if (!token) return;
    getOrder(orderId, token)
      .then((o) => {
        setOrder(o);
        if (o.status === 'DELIVERED') navigation.replace('OrderDelivered', { orderId });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 8000); // poll every 8s
    return () => clearInterval(interval);
  }, [token, orderId]);

  const handleCancel = () => {
    Alert.alert('¿Cancelar pedido?', 'Solo puedes cancelar mientras el pedido está pendiente.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Cancelar pedido',
        style: 'destructive',
        onPress: async () => {
          if (!token) return;
          try {
            await cancelOrder(orderId, token);
            navigation.navigate('Dashboard');
          } catch (e: unknown) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Error');
          }
        },
      },
    ]);
  };

  const currentIdx = STATUS_ORDER.indexOf(order?.status || 'PENDING');

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator style={{ flex: 1 }} color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Estado del pedido</Text>
          <Text style={styles.headerSub}>#{orderId.slice(0, 8).toUpperCase()}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* ETA card */}
      <View style={styles.etaCard}>
        <Ionicons name="time-outline" size={22} color={theme.colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.etaLabel}>TIEMPO ESTIMADO</Text>
          <Text style={styles.etaValue}>25 – 35 min</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchOrder}>
          <Ionicons name="refresh-outline" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Progress steps */}
      <View style={styles.stepsCard}>
        {STEPS.map((step, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx;
          return (
            <View key={step.status} style={styles.stepRow}>
              <View style={styles.stepLeft}>
                <View
                  style={[
                    styles.stepCircle,
                    done && styles.stepCircleDone,
                    active && styles.stepCircleActive,
                  ]}
                >
                  <Ionicons
                    name={step.icon as React.ComponentProps<typeof Ionicons>['name']}
                    size={16}
                    color={done ? '#fff' : theme.colors.border}
                  />
                </View>
                {i < STEPS.length - 1 && (
                  <View
                    style={[
                      styles.stepConnector,
                      done && i < currentIdx && styles.stepConnectorDone,
                    ]}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  done && styles.stepLabelDone,
                  active && styles.stepLabelActive,
                ]}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      {order?.status === 'PENDING' && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.85}>
            <Ionicons name="close-circle-outline" size={20} color="#dc2626" />
            <Text style={styles.cancelText}>Cancelar pedido</Text>
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
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 11, textAlign: 'center', marginTop: 1 },
  etaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#eff6ff',
    margin: 16,
    borderRadius: theme.roundness.medium,
    padding: 14,
  },
  etaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
  },
  etaValue: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  refreshBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  stepsCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    borderRadius: theme.roundness.large,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  stepLeft: { alignItems: 'center', width: 32 },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  stepCircleDone: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  stepCircleActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  stepConnector: { width: 2, height: 24, backgroundColor: theme.colors.border, marginTop: 2 },
  stepConnectorDone: { backgroundColor: theme.colors.primary },
  stepLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    paddingTop: 6,
    flex: 1,
    paddingBottom: 16,
  },
  stepLabelDone: { color: theme.colors.text },
  stepLabelActive: { fontWeight: '700', color: theme.colors.primary },
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
