import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../../config/theme';
import { RootStackParamList } from '../../types/navigation';

type ServiceType = 'restaurantes' | 'tiendas';

const CONFIG: Record<
  ServiceType,
  {
    title: string;
    filters: string[];
    items: Array<{
      id: string;
      name: string;
      category: string;
      time: string;
      delivery: string;
      rating: number;
      recommended?: boolean;
      iconName: string;
      iconBg: string;
      iconColor: string;
    }>;
  }
> = {
  restaurantes: {
    title: 'Restaurantes en Cancas',
    filters: ['Destacados', 'Comida de mar', 'Criollo', 'Rápida', 'Postres'],
    items: [
      {
        id: '1',
        name: 'Frutos del Mar',
        category: 'Comida de mar • Cevichería',
        time: '25-35 min',
        delivery: 'S/ 3.00',
        rating: 4.8,
        recommended: true,
        iconName: 'fish-outline',
        iconBg: '#d1fae5',
        iconColor: '#059669',
      },
      {
        id: '2',
        name: 'El Buen Sabor',
        category: 'Criollo • Almuerzos',
        time: '20-30 min',
        delivery: 'S/ 2.50',
        rating: 4.6,
        iconName: 'restaurant-outline',
        iconBg: '#fef3c7',
        iconColor: '#d97706',
      },
      {
        id: '3',
        name: 'Pizzería El Faro',
        category: 'Rápida • Pizza • Pastas',
        time: '35-45 min',
        delivery: 'S/ 4.00',
        rating: 4.2,
        iconName: 'pizza-outline',
        iconBg: '#fee2e2',
        iconColor: '#dc2626',
      },
    ],
  },
  tiendas: {
    title: 'Tiendas en Cancas',
    filters: ['Todos', 'Supermercados', 'Bodegas', 'Farmacias', 'Tecnología'],
    items: [
      {
        id: '1',
        name: 'SIAR Supermarket',
        category: 'Supermercado',
        time: '20-40 min',
        delivery: 'S/ 3.00',
        rating: 4.7,
        recommended: true,
        iconName: 'storefront-outline',
        iconBg: '#eff6ff',
        iconColor: '#2563eb',
      },
      {
        id: '2',
        name: 'Cancaslandia',
        category: 'Bodega',
        time: '25-45 min',
        delivery: 'S/ 2.50',
        rating: 4.5,
        iconName: 'bag-handle-outline',
        iconBg: '#f0fdf4',
        iconColor: '#059669',
      },
    ],
  },
};

export default function ServicesScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const serviceType: ServiceType =
    (route.params as { type?: ServiceType } | undefined)?.type ?? 'restaurantes';
  const config = CONFIG[serviceType];
  const [activeFilter, setActiveFilter] = useState(config.filters[0]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{config.title}</Text>
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
        {config.filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Place list */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {config.items.map((place) => (
          <TouchableOpacity
            key={place.id}
            style={styles.placeCard}
            activeOpacity={0.85}
            onPress={() =>
              serviceType === 'restaurantes'
                ? navigation.navigate('RestaurantMenu', { restaurantId: place.id })
                : navigation.navigate('StoreProducts', { storeId: place.id })
            }
          >
            {/* Image placeholder */}
            <View style={[styles.placeImage, { backgroundColor: place.iconBg }]}>
              <Ionicons
                name={place.iconName as React.ComponentProps<typeof Ionicons>['name']}
                size={40}
                color={place.iconColor}
              />
              {place.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Recomendado</Text>
                </View>
              )}
            </View>

            {/* Info row */}
            <View style={styles.placeInfo}>
              <View style={styles.placeTopRow}>
                <Text style={styles.placeName}>{place.name}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={13} color="#f59e0b" />
                  <Text style={styles.ratingText}>{place.rating}</Text>
                </View>
              </View>
              <Text style={styles.placeCategory}>{place.category}</Text>
              <View style={styles.placeMeta}>
                <Ionicons name="time-outline" size={13} color={theme.colors.textSecondary} />
                <Text style={styles.placeMetaText}>{place.time}</Text>
                <View style={styles.dot} />
                <Ionicons name="bicycle-outline" size={13} color={theme.colors.textSecondary} />
                <Text style={styles.placeMetaText}>{place.delivery} envío</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
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
  headerSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 1,
  },
  searchBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  filterBar: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    maxHeight: 52,
  },
  filterContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  filterTextActive: {
    color: '#fff',
  },
  list: { flex: 1, padding: 16 },
  placeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.large,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  placeImage: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#0d9488',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  recommendedText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  placeInfo: {
    padding: 14,
  },
  placeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  placeName: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  placeCategory: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  placeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  placeMetaText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.textSecondary,
    marginHorizontal: 2,
  },
});
