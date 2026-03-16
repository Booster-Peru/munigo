import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { theme } from '../../config/theme';
import { RootStackParamList } from '../../types/navigation';
import { getPet, requestAdoption, Pet } from '../../services/petsService';
import { useAuth } from '../../hooks/useAuth';

const SPECIES_COLORS: Record<string, { bg: string; color: string }> = {
  PERRO: { bg: '#ccfbf1', color: '#0d9488' },
  GATO: { bg: '#ede9fe', color: '#7c3aed' },
  OTRO: { bg: '#fef3c7', color: '#d97706' },
};

export default function PetDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'PetDetail'>>();
  const { token } = useAuth();
  const { petId } = route.params;

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [adopting, setAdopting] = useState(false);

  useEffect(() => {
    getPet(petId, token)
      .then(setPet)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [petId, token]);

  const handleAdopt = () => {
    if (!pet) return;
    Alert.alert(
      'Solicitar adopción',
      `¿Deseas iniciar el proceso de adopción para ${pet.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Solicitar',
          onPress: async () => {
            setAdopting(true);
            try {
              await requestAdoption(petId, `Me interesa adoptar a ${pet.name}`, token);
              Alert.alert('¡Listo!', 'Tu solicitud fue enviada. El refugio se comunicará contigo pronto.');
            } catch (e: any) {
              Alert.alert('Error', e.message);
            } finally {
              setAdopting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator style={{ marginTop: 60 }} color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  const speciesStyle = SPECIES_COLORS[pet?.species || 'OTRO'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{pet?.name || 'Mascota'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: speciesStyle.bg }]}>
          <Ionicons name="paw-outline" size={72} color={speciesStyle.color} />
          <View style={styles.speciesBadge}>
            <Text style={[styles.speciesBadgeText, { color: speciesStyle.color }]}>{pet?.species}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.petName}>{pet?.name}</Text>
          {pet?.breed && <Text style={styles.petBreed}>{pet.breed}</Text>}

          <View style={styles.metaRow}>
            {pet?.age_months != null && (
              <View style={styles.metaChip}>
                <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.metaChipText}>{pet.age_months} meses</Text>
              </View>
            )}
            <View style={styles.metaChip}>
              <Ionicons name="male-female-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.metaChipText}>{pet?.gender || '—'}</Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: '#dcfce7' }]}>
              <Text style={[styles.metaChipText, { color: '#059669', fontWeight: '700' }]}>DISPONIBLE</Text>
            </View>
          </View>

          {pet?.description && (
            <View style={styles.descCard}>
              <Text style={styles.descLabel}>Sobre {pet.name}</Text>
              <Text style={styles.descText}>{pet.description}</Text>
            </View>
          )}

          <View style={styles.infoCard}>
            <Ionicons name="heart-outline" size={20} color="#dc2626" />
            <Text style={styles.infoCardText}>
              Adoptar una mascota es un compromiso de vida. El proceso incluye una visita de verificación del refugio.
            </Text>
          </View>
        </View>
      </ScrollView>

      {pet?.status === 'AVAILABLE' && (
        <View style={styles.ctaBar}>
          <TouchableOpacity
            style={[styles.ctaBtn, adopting && { opacity: 0.7 }]}
            onPress={handleAdopt}
            disabled={adopting}
            activeOpacity={0.85}
          >
            {adopting
              ? <ActivityIndicator color={theme.colors.text} />
              : <>
                  <Ionicons name="heart" size={18} color={theme.colors.text} />
                  <Text style={styles.ctaBtnText}>SOLICITAR ADOPCIÓN</Text>
                </>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  avatar: {
    height: 200, alignItems: 'center', justifyContent: 'center',
  },
  speciesBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: '#fff', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  speciesBadgeText: { fontSize: 12, fontWeight: '700' },
  infoSection: { padding: 20, gap: 12 },
  petName: { fontSize: 26, fontWeight: '800', color: theme.colors.text },
  petBreed: { fontSize: 14, color: theme.colors.textSecondary },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#f1f5f9', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  metaChipText: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '600' },
  descCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.medium,
    borderWidth: 1, borderColor: theme.colors.border,
    padding: 14, gap: 6,
  },
  descLabel: { fontSize: 13, fontWeight: '700', color: theme.colors.textSecondary },
  descText: { fontSize: 14, color: theme.colors.text, lineHeight: 20 },
  infoCard: {
    backgroundColor: '#fff1f2', borderRadius: theme.roundness.medium,
    flexDirection: 'row', alignItems: 'flex-start',
    padding: 14, gap: 10,
  },
  infoCardText: { flex: 1, fontSize: 13, color: '#7f1d1d', lineHeight: 18 },
  ctaBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1, borderTopColor: theme.colors.border,
    padding: 16,
  },
  ctaBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.roundness.medium, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  ctaBtnText: { fontSize: 15, fontWeight: '800', color: theme.colors.text },
});
