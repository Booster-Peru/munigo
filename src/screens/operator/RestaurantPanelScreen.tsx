import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../config/theme';
import { useAuth } from '../../hooks/useAuth';
import { getOperatorPendingOrders, transitionOrder, Order, OrderStatus } from '../../services/ordersService';

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  PENDING:    { label: 'Pendiente',      color: '#d97706', bg: '#fef3c7' },
  ACCEPTED:   { label: 'Aceptado',       color: '#0d9488', bg: '#ccfbf1' },
  PREPARING:  { label: 'Preparando',     color: '#2563eb', bg: '#dbeafe' },
  READY:      { label: 'Listo',          color: '#059669', bg: '#dcfce7' },
  DELIVERING: { label: 'En camino',      color: '#7c3aed', bg: '#ede9fe' },
  DELIVERED:  { label: 'Entregado',      color: '#64748b', bg: '#f1f5f9' },
  CANCELLED:  { label: 'Cancelado',      color: '#dc2626', bg: '#fee2e2' },
};

const NEXT_ACTION: Partial<Record<OrderStatus, { action: 'accept'|'preparing'|'ready'|'delivering'|'delivered'; label: string }>> = {
  PENDING:    { action: 'accept',    label: 'Aceptar' },
  ACCEPTED:   { action: 'preparing', label: 'Empezar a preparar' },
  PREPARING:  { action: 'ready',     label: 'Marcar listo' },
  READY:      { action: 'delivering',label: 'Enviar a delivery' },
  DELIVERING: { action: 'delivered', label: 'Confirmar entrega' },
};

function OrderCard({ order, onAdvance }: { order: Order; onAdvance: (o: Order) => void }) {
  const meta = STATUS_META[order.status];
  const next = NEXT_ACTION[order.status];
  const items = (order.items || []) as Array<{ name: string; quantity: number }>;

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderCardHeader}>
        <Text style={styles.orderCardId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
          <Text style={[styles.statusBadgeText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>
      <View style={styles.orderItems}>
        {items.map((it, i) => (
          <Text key={i} style={styles.orderItemText}>
            {it.quantity}× {it.name}
          </Text>
        ))}
      </View>
      <View style={styles.orderCardFooter}>
        <Text style={styles.orderTotal}>S/ {Number(order.total).toFixed(2)}</Text>
        {next && (
          <TouchableOpacity
            style={styles.advanceBtn}
            onPress={() => onAdvance(order)}
            activeOpacity={0.85}
          >
            <Text style={styles.advanceBtnText}>{next.label}</Text>
            <Ionicons name="arrow-forward" size={14} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// NOTE: In production the operator's source_id comes from their profile.
// For now we use a placeholder that should be replaced once the operator
// profile endpoint is available.
const DEMO_SOURCE_ID = '00000000-0000-0000-0000-000000000000';

export default function RestaurantPanelScreen() {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    if (!token) return;
    getOperatorPendingOrders(DEMO_SOURCE_ID, token)
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const handleAdvance = async (order: Order) => {
    if (!token) return;
    const next = NEXT_ACTION[order.status];
    if (!next) return;
    Alert.alert(next.label, `¿Confirmar: "${next.label}" para pedido #${order.id.slice(0,8).toUpperCase()}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          try {
            const updated = await transitionOrder(order.id, next.action, token);
            setOrders(prev => prev.map(o => o.id === updated.id ? updated : o)
              .filter(o => !['DELIVERED','CANCELLED'].includes(o.status)));
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Panel del restaurante</Text>
          <Text style={styles.headerSub}>Pedidos en tiempo real</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchOrders}>
          <Ionicons name="refresh-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Summary bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{orders.filter(o => o.status === 'PENDING').length}</Text>
          <Text style={styles.summaryLabel}>Pendientes</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{orders.filter(o => ['ACCEPTED','PREPARING'].includes(o.status)).length}</Text>
          <Text style={styles.summaryLabel}>En cocina</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{orders.filter(o => ['READY','DELIVERING'].includes(o.status)).length}</Text>
          <Text style={styles.summaryLabel}>En camino</Text>
        </View>
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.primary} />}

      <FlatList
        data={orders}
        keyExtractor={o => o.id}
        renderItem={({ item }) => <OrderCard order={item} onAdvance={handleAdvance} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={48} color={theme.colors.border} />
              <Text style={styles.emptyTitle}>Sin pedidos activos</Text>
              <Text style={styles.emptySub}>Los nuevos pedidos aparecerán aquí</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: '#1a2340', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 11, textAlign: 'center', marginTop: 1 },
  refreshBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  summaryBar: {
    flexDirection: 'row', backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    paddingVertical: 12,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '800', color: theme.colors.text },
  summaryLabel: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2, fontWeight: '600' },
  summaryDivider: { width: 1, backgroundColor: theme.colors.border },
  list: { padding: 16, gap: 12 },
  orderCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.roundness.medium,
    padding: 14, borderWidth: 1, borderColor: theme.colors.border, gap: 10,
  },
  orderCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderCardId: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  statusBadge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  orderItems: { gap: 3 },
  orderItemText: { fontSize: 13, color: theme.colors.text },
  orderCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotal: { fontSize: 16, fontWeight: '800', color: theme.colors.primary },
  advanceBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: theme.colors.accent, borderRadius: theme.roundness.medium,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  advanceBtnText: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  emptySub: { fontSize: 13, color: theme.colors.textSecondary },
});
