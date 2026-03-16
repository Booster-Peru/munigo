import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../../config/theme';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/useAuth';
import { getOrder, Order } from '../../services/ordersService';

type NavProp = StackNavigationProp<RootStackParamList>;

export default function OrderConfirmationScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { orderId } = route.params as { orderId: string };
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getOrder(orderId, token)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [orderId, token]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator style={{ flex: 1 }} color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  const items = (order?.items || []) as Array<{ name: string; quantity: number; unit_price: number }>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pedido confirmado</Text>
        <Text style={styles.headerSub}>MuniGo • Canoas de Punta Sal</Text>
      </View>

      {/* Success */}
      <View style={styles.successSection}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={36} color="#fff" />
        </View>
        <Text style={styles.successTitle}>¡Pedido recibido!</Text>
        <Text style={styles.successSub}>El restaurante está revisando tu pedido</Text>
      </View>

      {/* Order details */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Detalle del pedido</Text>
          <Text style={styles.orderId}>#{orderId.slice(0, 8).toUpperCase()}</Text>
        </View>
        {items.map((it, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemQty}>{it.quantity}×</Text>
            <Text style={styles.itemName}>{it.name}</Text>
            <Text style={styles.itemPrice}>S/ {(it.unit_price * it.quantity).toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>S/ {Number(order?.subtotal || 0).toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Envío</Text>
          <Text style={styles.totalValue}>S/ {Number(order?.delivery_fee || 0).toFixed(2)}</Text>
        </View>
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>S/ {Number(order?.total || 0).toFixed(2)}</Text>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => navigation.replace('OrderTracking', { orderId })}
          activeOpacity={0.85}
        >
          <Text style={styles.trackBtnText}>SEGUIR MI PEDIDO</Text>
          <Ionicons name="arrow-forward" size={18} color={theme.colors.text} />
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
  header: {
    backgroundColor: '#1a2340', paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 1, letterSpacing: 0.8 },
  successSection: { alignItems: 'center', paddingVertical: 28, gap: 8 },
  successCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#059669',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  successTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  successSub: { fontSize: 13, color: theme.colors.textSecondary },
  card: {
    backgroundColor: theme.colors.surface, marginHorizontal: 16,
    borderRadius: theme.roundness.large, padding: 16,
    borderWidth: 1, borderColor: theme.colors.border, gap: 8,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  orderId: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: '600' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemQty: { fontSize: 13, fontWeight: '700', color: theme.colors.primary, width: 24 },
  itemName: { flex: 1, fontSize: 13, color: theme.colors.text },
  itemPrice: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 13, color: theme.colors.textSecondary },
  totalValue: { fontSize: 13, color: theme.colors.text, fontWeight: '600' },
  grandTotal: { marginTop: 4 },
  grandTotalLabel: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  grandTotalValue: { fontSize: 15, fontWeight: '800', color: theme.colors.primary },
  footer: { padding: 16, gap: 10 },
  trackBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: theme.colors.accent, borderRadius: theme.roundness.medium, padding: 18,
  },
  trackBtnText: { fontSize: 15, fontWeight: '800', color: theme.colors.text, letterSpacing: 0.5 },
  homeBtn: { alignItems: 'center', padding: 10 },
  homeBtnText: { fontSize: 13, color: '#0d9488', fontWeight: '600' },
});
