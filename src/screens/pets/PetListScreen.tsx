import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../../config/theme';
import { RootStackParamList } from '../../types/navigation';
import { listPets, listLostPets, Pet, LostPet } from '../../services/petsService';
import { useAuth } from '../../hooks/useAuth';

type Tab = 'adoption' | 'lost';

const SPECIES_ICONS: Record<string, string> = {
  PERRO: 'paw-outline',
  GATO: 'paw-outline',
  OTRO: 'ellipsis-horizontal-circle-outline',
};

const GENDER_LABELS: Record<string, string> = {
  MACHO: '♂',
  HEMBRA: '♀',
  UNKNOWN: '—',
};

export default function PetListScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { token } = useAuth();
  const [tab, setTab] = useState<Tab>('adoption');
  const [pets, setPets] = useState<Pet[]>([]);
  const [lostPets, setLostPets] = useState<LostPet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const promise = tab === 'adoption'
      ? listPets(token).then(setPets)
      : listLostPets(token).then(setLostPets);
    promise.catch(() => {}).finally(() => setLoading(false));
  }, [tab, token]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Mascotas</Text>
          <Text style={styles.headerSub}>MuniGo • Canoas de Punta Sal</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'adoption' && styles.tabActive]}
          onPress={() => setTab('adoption')}
        >
          <Text style={[styles.tabText, tab === 'adoption' && styles.tabTextActive]}>En adopción</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'lost' && styles.tabActive]}
          onPress={() => setTab('lost')}
        >
          <Text style={[styles.tabText, tab === 'lost' && styles.tabTextActive]}>Mascotas perdidas</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.primary} />}

      {tab === 'adoption' ? (
        <FlatList
          data={pets}
          keyExtractor={p => p.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: p }) => (
            <TouchableOpacity
              style={styles.petCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('PetDetail', { petId: p.id })}
            >
              <View style={styles.petImage}>
                <Ionicons name={(SPECIES_ICONS[p.species] || 'paw-outline') as any} size={40} color="#0d9488" />
              </View>
              <View style={styles.petInfo}>
                <Text style={styles.petName}>{p.name}</Text>
                <Text style={styles.petMeta}>
                  {p.species} {GENDER_LABELS[p.gender] || ''}
                  {p.age_months ? ` • ${p.age_months}m` : ''}
                </Text>
                {p.breed && <Text style={styles.petBreed}>{p.breed}</Text>}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Ionicons name="paw-outline" size={48} color={theme.colors.border} />
                <Text style={styles.emptyText}>No hay mascotas en adopción</Text>
              </View>
            ) : null
          }
        />
      ) : (
        <FlatList
          data={lostPets}
          keyExtractor={p => p.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: p }) => (
            <View style={styles.lostCard}>
              <View style={styles.lostIcon}>
                <Ionicons name="alert-circle-outline" size={28} color="#dc2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.lostName}>{p.name || 'Sin nombre'} ({p.species})</Text>
                <Text style={styles.lostDesc} numberOfLines={2}>{p.description}</Text>
                {p.last_seen_loc && <Text style={styles.lostLoc}>📍 {p.last_seen_loc}</Text>}
                <Text style={styles.lostContact}>☎ {p.contact}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Ionicons name="search-outline" size={48} color={theme.colors.border} />
                <Text style={styles.emptyText}>Sin reportes de mascotas perdidas</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: '#1a2340',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 11, textAlign: 'center', marginTop: 1 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1, paddingVertical: 14, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: theme.colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
  tabTextActive: { color: theme.colors.primary },
  grid: { padding: 16, gap: 12 },
  petCard: {
    flex: 1, backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.large,
    borderWidth: 1, borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  petImage: {
    height: 90, backgroundColor: '#ccfbf1',
    alignItems: 'center', justifyContent: 'center',
  },
  petInfo: { padding: 10 },
  petName: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  petMeta: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
  petBreed: { fontSize: 11, color: theme.colors.textSecondary },
  listContent: { padding: 16, gap: 12 },
  lostCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.medium,
    borderWidth: 1, borderColor: '#fee2e2',
    padding: 14, flexDirection: 'row', gap: 12,
  },
  lostIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center',
  },
  lostName: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  lostDesc: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2, lineHeight: 16 },
  lostLoc: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 4 },
  lostContact: { fontSize: 12, fontWeight: '600', color: '#0d9488', marginTop: 2 },
  empty: { paddingTop: 60, alignItems: 'center', gap: 10 },
  emptyText: { fontSize: 15, color: theme.colors.textSecondary },
});
