import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../../config/theme';
import { RootStackParamList } from '../../types/navigation';
import { listStores, Store } from '../../services/catalogService';

export default function StoreListScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listStores()
      .then(setStores)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Tiendas en Cancas</Text>
          <Text style={styles.headerSub}>MuniGo • Canoas de Punta Sal</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.primary} />}

      <FlatList
        data={stores}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('StoreProducts', { storeId: item.id })}
          >
            <View style={[styles.cardImage, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="storefront-outline" size={40} color="#2563eb" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardCategory}>{item.category}</Text>
              {item.address ? (
                <View style={styles.cardMeta}>
                  <Ionicons name="location-outline" size={13} color={theme.colors.textSecondary} />
                  <Text style={styles.cardMetaText}>{item.address}</Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="storefront-outline" size={48} color={theme.colors.border} />
              <Text style={styles.emptyText}>Sin tiendas disponibles</Text>
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
  list: { padding: 16, gap: 14 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.large,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardImage: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { padding: 14 },
  cardName: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 2 },
  cardCategory: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 6 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardMetaText: { fontSize: 12, color: theme.colors.textSecondary },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: theme.colors.textSecondary },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 16, color: theme.colors.textSecondary },
});
