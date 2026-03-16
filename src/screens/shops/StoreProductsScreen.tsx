import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SectionList, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../../config/theme';
import { RootStackParamList } from '../../types/navigation';
import { getStore, Store, Product } from '../../services/catalogService';
import { placeOrder } from '../../services/ordersService';
import { useAuth } from '../../hooks/useAuth';

type CartItem = { product: Product; qty: number };
type CartMap = Record<string, CartItem>;

function groupByCategory(products: Product[]): Array<{ title: string; data: Product[] }> {
  const map: Record<string, Product[]> = {};
  for (const p of products) {
    const cat = p.category || 'General';
    if (!map[cat]) map[cat] = [];
    map[cat].push(p);
  }
  return Object.entries(map).map(([title, data]) => ({ title, data }));
}

export default function StoreProductsScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'StoreProducts'>>();
  const { token } = useAuth();
  const { storeId } = route.params;

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [cart, setCart] = useState<CartMap>({});

  useEffect(() => {
    getStore(storeId)
      .then(({ store: s, products: p }) => {
        setStore(s);
        setProducts(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [storeId]);

  const cartTotal = Object.values(cart).reduce((s, ci) => s + ci.qty * Number(ci.product.price), 0);
  const cartCount = Object.values(cart).reduce((s, ci) => s + ci.qty, 0);

  const inc = useCallback((p: Product) => {
    setCart(prev => ({
      ...prev,
      [p.id]: { product: p, qty: (prev[p.id]?.qty || 0) + 1 },
    }));
  }, []);

  const dec = useCallback((p: Product) => {
    setCart(prev => {
      const cur = prev[p.id]?.qty || 0;
      if (cur <= 1) {
        const next = { ...prev };
        delete next[p.id];
        return next;
      }
      return { ...prev, [p.id]: { product: p, qty: cur - 1 } };
    });
  }, []);

  const handleOrder = async () => {
    if (cartCount === 0 || !store) return;
    setPlacing(true);
    try {
      const items = Object.values(cart).map(ci => ({
        item_id: ci.product.id,
        name: ci.product.name,
        unit_price: Number(ci.product.price),
        quantity: ci.qty,
      }));
      const order = await placeOrder(
        { source_id: storeId, source_type: 'STORE', items, delivery_address: 'Mi dirección' },
        token
      );
      navigation.navigate('OrderConfirmation', { orderId: order.id });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator style={{ marginTop: 60 }} color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  const sections = groupByCategory(products);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{store?.name || 'Tienda'}</Text>
          <Text style={styles.headerSub}>{store?.category}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={p => p.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: cartCount > 0 ? 90 : 24 }}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item: p }) => {
          const qty = cart[p.id]?.qty || 0;
          return (
            <View style={styles.productRow}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{p.name}</Text>
                {p.description ? <Text style={styles.productDesc}>{p.description}</Text> : null}
                <Text style={styles.productPrice}>S/ {Number(p.price).toFixed(2)}</Text>
              </View>
              <View style={styles.qtyControl}>
                {qty > 0 ? (
                  <>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => dec(p)}>
                      <Ionicons name="remove" size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{qty}</Text>
                  </>
                ) : null}
                <TouchableOpacity style={[styles.qtyBtn, styles.qtyBtnAdd]} onPress={() => inc(p)}>
                  <Ionicons name="add" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {cartCount > 0 && (
        <View style={styles.cartBar}>
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartCount}</Text>
          </View>
          <Text style={styles.cartBarText}>Ver pedido</Text>
          <Text style={styles.cartBarTotal}>S/ {cartTotal.toFixed(2)}</Text>
          <TouchableOpacity style={styles.cartCta} onPress={handleOrder} disabled={placing}>
            {placing
              ? <ActivityIndicator size="small" color={theme.colors.text} />
              : <Text style={styles.cartCtaText}>PEDIR</Text>
            }
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
  sectionHeader: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.textSecondary },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  productInfo: { flex: 1, marginRight: 12 },
  productName: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  productDesc: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2, lineHeight: 16 },
  productPrice: { fontSize: 14, fontWeight: '700', color: theme.colors.primary, marginTop: 4 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 15,
    borderWidth: 1.5, borderColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnAdd: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  qtyText: { fontSize: 15, fontWeight: '700', color: theme.colors.text, minWidth: 20, textAlign: 'center' },
  cartBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#1a2340',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    gap: 10,
  },
  cartBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10, minWidth: 22, height: 22,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: { color: theme.colors.text, fontSize: 12, fontWeight: '700' },
  cartBarText: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '600' },
  cartBarTotal: { color: '#fff', fontSize: 14, fontWeight: '700' },
  cartCta: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8, paddingHorizontal: 18, paddingVertical: 8,
  },
  cartCtaText: { color: theme.colors.text, fontSize: 13, fontWeight: '800' },
});
