import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../../config/theme';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/useAuth';
import { getRestaurant, Restaurant, MenuItem } from '../../services/catalogService';
import { placeOrder, OrderItem } from '../../services/ordersService';

type NavProp = StackNavigationProp<RootStackParamList>;
type CartMap = Record<string, { item: MenuItem; qty: number }>;

export default function RestaurantMenuScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { restaurantId } = route.params as { restaurantId: string };
  const { token } = useAuth();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartMap>({});
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    getRestaurant(restaurantId)
      .then(({ restaurant: r, menu: m }) => {
        setRestaurant(r);
        setMenu(m);
      })
      .catch((e) => Alert.alert('Error', e.message))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: { item, qty: (prev[item.id]?.qty || 0) + 1 },
    }));
  }, []);

  const removeFromCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const current = prev[item.id]?.qty || 0;
      if (current <= 1) {
        const n = { ...prev };
        delete n[item.id];
        return n;
      }
      return { ...prev, [item.id]: { item, qty: current - 1 } };
    });
  }, []);

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((s, { item, qty }) => s + item.price * qty, 0);
  const cartCount = cartItems.reduce((s, { qty }) => s + qty, 0);

  // Group menu by category for SectionList
  const sections = menu.reduce<Array<{ title: string; data: MenuItem[] }>>((acc, item) => {
    const section = acc.find((s) => s.title === item.category);
    if (section) section.data.push(item);
    else acc.push({ title: item.category, data: [item] });
    return acc;
  }, []);

  const handleOrder = async () => {
    if (!token) {
      Alert.alert('Error', 'Inicia sesión primero');
      return;
    }
    if (!cartCount) {
      Alert.alert('Carrito vacío', 'Agrega al menos un item');
      return;
    }

    setPlacing(true);
    try {
      const items: OrderItem[] = cartItems.map(({ item, qty }) => ({
        item_id: item.id,
        name: item.name,
        quantity: qty,
        unit_price: item.price,
      }));
      const order = await placeOrder(
        {
          source_type: 'RESTAURANT',
          source_id: restaurantId,
          items,
          delivery_address: 'Canoas de Punta Sal',
        },
        token,
      );
      setCart({});
      navigation.navigate('OrderConfirmation', { orderId: order.id });
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Error');
    } finally {
      setPlacing(false);
    }
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {restaurant?.name || '...'}
          </Text>
          <Text style={styles.headerSub}>
            {restaurant?.category} · {restaurant?.open_time}–{restaurant?.close_time}
          </Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        renderItem={({ item }) => {
          const qty = cart[item.id]?.qty || 0;
          return (
            <View style={styles.menuItem}>
              <View style={styles.menuItemInfo}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.menuItemDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
                <Text style={styles.menuItemPrice}>S/ {Number(item.price).toFixed(2)}</Text>
              </View>
              <View style={styles.menuItemActions}>
                {qty > 0 ? (
                  <View style={styles.qtyRow}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(item)}>
                      <Ionicons name="remove" size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{qty}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(item)}>
                      <Ionicons name="add" size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => addToCart(item)}
                    disabled={!item.is_available}
                  >
                    <Ionicons
                      name="add"
                      size={20}
                      color={item.is_available ? theme.colors.primary : theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        ListFooterComponent={<View style={{ height: cartCount > 0 ? 100 : 20 }} />}
      />

      {/* Cart CTA */}
      {cartCount > 0 && (
        <View style={styles.cartBar}>
          <View style={styles.cartInfo}>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
            <Text style={styles.cartLabel}>Ver pedido</Text>
          </View>
          <Text style={styles.cartTotal}>S/ {(cartTotal + 3).toFixed(2)}</Text>
          <TouchableOpacity style={styles.cartBtn} onPress={handleOrder} disabled={placing}>
            {placing ? (
              <ActivityIndicator color={theme.colors.text} size="small" />
            ) : (
              <>
                <Text style={styles.cartBtnText}>PEDIR</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.text} />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  headerSub: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 1 },
  list: { paddingBottom: 20 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: theme.colors.background,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: 12,
  },
  menuItemInfo: { flex: 1, gap: 3 },
  menuItemName: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  menuItemDesc: { fontSize: 12, color: theme.colors.textSecondary, lineHeight: 17 },
  menuItemPrice: { fontSize: 15, fontWeight: '700', color: theme.colors.primary, marginTop: 4 },
  menuItemActions: { alignItems: 'center' },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2340',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 24,
    gap: 12,
  },
  cartInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  cartLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },
  cartTotal: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '700' },
  cartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: theme.roundness.medium,
  },
  cartBtnText: { fontSize: 14, fontWeight: '800', color: theme.colors.text },
});
