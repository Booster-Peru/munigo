import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../../config/theme';
import { RootStackParamList } from '../../types/navigation';
import { listRestaurants, Restaurant } from '../../services/catalogService';

type NavProp = StackNavigationProp<RootStackParamList>;

const FILTERS = ['Todos', 'Comida de mar', 'Criollo', 'Rápida', 'Postres'];

const ICON_MAP: Record<string, { name: string; bg: string; color: string }> = {
  'Comida de mar': { name: 'fish-outline', bg: '#d1fae5', color: '#059669' },
  Criollo: { name: 'restaurant-outline', bg: '#fef3c7', color: '#d97706' },
  Rápida: { name: 'pizza-outline', bg: '#fee2e2', color: '#dc2626' },
  Postres: { name: 'ice-cream-outline', bg: '#fce7f3', color: '#db2777' },
  default: { name: 'restaurant-outline', bg: '#eff6ff', color: '#2563eb' },
};

function RestaurantCard({ r, onPress }: { r: Restaurant; onPress: () => void }) {
  const icon = ICON_MAP[r.category] || ICON_MAP.default;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.cardImage, { backgroundColor: icon.bg }]}>
        <Ionicons
          name={icon.name as React.ComponentProps<typeof Ionicons>['name']}
          size={44}
          color={icon.color}
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{r.category}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardName}>{r.name}</Text>
          <View style={styles.ratingChip}>
            <Ionicons name="star" size={12} color={theme.colors.accent} />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
        </View>
        {r.description ? (
          <Text style={styles.cardDesc} numberOfLines={1}>
            {r.description}
          </Text>
        ) : null}
        <View style={styles.cardMeta}>
          <Ionicons name="time-outline" size={13} color={theme.colors.textSecondary} />
          <Text style={styles.cardMetaText}>25-35 min</Text>
          <View style={styles.metaDot} />
          <Ionicons name="bicycle-outline" size={13} color={theme.colors.textSecondary} />
          <Text style={styles.cardMetaText}>S/ 3.00 envío</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function RestaurantListScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const initCategory = (route.params as { category?: string } | undefined)?.category;

  const [activeFilter, setActiveFilter] = useState(initCategory || 'Todos');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const cat = activeFilter === 'Todos' ? undefined : activeFilter;
    listRestaurants(cat)
      .then(setRestaurants)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [activeFilter]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Restaurantes en Cancas</Text>
          <Text style={styles.headerSub}>MuniGo • Canoas de Punta Sal</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <Ionicons name="search-outline" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, activeFilter === f && styles.chipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.primary} />}

      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="warning-outline" size={18} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={restaurants}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <RestaurantCard
            r={item}
            onPress={() => navigation.navigate('RestaurantMenu', { restaurantId: item.id })}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="restaurant-outline" size={48} color={theme.colors.border} />
              <Text style={styles.emptyText}>Sin restaurantes en esta categoría</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, textAlign: 'center' },
  headerSub: { fontSize: 11, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 1 },
  searchBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  filterBar: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    maxHeight: 52,
  },
  filterContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f1f5f9' },
  chipActive: { backgroundColor: theme.colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
  chipTextActive: { color: '#fff' },
  list: { padding: 16, gap: 14 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.large,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardImage: { height: 130, alignItems: 'center', justifyContent: 'center' },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardBody: { padding: 14, gap: 4 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  ratingChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  cardDesc: { fontSize: 12, color: theme.colors.textSecondary },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  cardMetaText: { fontSize: 12, color: theme.colors.textSecondary },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: theme.colors.textSecondary },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    backgroundColor: '#fee2e2',
    borderRadius: theme.roundness.medium,
    padding: 12,
  },
  errorText: { color: '#dc2626', fontSize: 13 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 14, color: theme.colors.textSecondary },
});
