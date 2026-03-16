import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../../config/theme';
import { RootStackParamList } from '../../types/navigation';
import { MandadoType } from '../../services/mandadosService';

const TYPES: Array<{
  type: MandadoType;
  label: string;
  desc: string;
  fare: string;
  icon: string;
  bg: string;
  color: string;
}> = [
  {
    type: 'COMPRAS',
    label: 'Compras',
    desc: 'Recoge productos de tiendas',
    fare: 'S/ 8',
    icon: 'cart-outline',
    bg: '#eff6ff',
    color: '#2563eb',
  },
  {
    type: 'TRAMITE',
    label: 'Trámite',
    desc: 'Gestiona documentos y pagos',
    fare: 'S/ 10',
    icon: 'document-text-outline',
    bg: '#fef3c7',
    color: '#d97706',
  },
  {
    type: 'MENSAJERIA',
    label: 'Mensajería',
    desc: 'Envía paquetes y sobres',
    fare: 'S/ 6',
    icon: 'mail-outline',
    bg: '#f0fdf4',
    color: '#059669',
  },
  {
    type: 'OTRO',
    label: 'Otro mandado',
    desc: 'Encargos personalizados',
    fare: 'S/ 8',
    icon: 'ellipsis-horizontal-circle-outline',
    bg: '#fdf4ff',
    color: '#7c3aed',
  },
];

export default function MandadosMenuScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Mandados</Text>
          <Text style={styles.headerSub}>Te hago un favor • MuniGo</Text>
        </View>
        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => navigation.navigate('MandadoTracking', { mandadoId: 'history' })}
        >
          <Ionicons name="time-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>¿Qué necesitas?</Text>
        <Text style={styles.sectionSub}>
          Nuestros mandaderos locales realizan tus encargos en Canoas de Punta Sal
        </Text>

        {TYPES.map((t) => (
          <TouchableOpacity
            key={t.type}
            style={styles.typeCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('MandadoRequest', { type: t.type })}
          >
            <View style={[styles.typeIcon, { backgroundColor: t.bg }]}>
              <Ionicons
                name={t.icon as React.ComponentProps<typeof Ionicons>['name']}
                size={28}
                color={t.color}
              />
            </View>
            <View style={styles.typeInfo}>
              <Text style={styles.typeLabel}>{t.label}</Text>
              <Text style={styles.typeDesc}>{t.desc}</Text>
            </View>
            <View style={styles.typeFare}>
              <Text style={styles.typeFareAmount}>{t.fare}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            El mandadero llega en 15–30 min. Pagas al completarse el mandado con tu Billetera
            MuniGo.
          </Text>
        </View>
      </ScrollView>
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
  historyBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 11, textAlign: 'center', marginTop: 1 },
  content: { padding: 20, gap: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginBottom: 4 },
  sectionSub: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18, marginBottom: 8 },
  typeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  typeIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeInfo: { flex: 1 },
  typeLabel: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  typeDesc: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  typeFare: { alignItems: 'flex-end', gap: 2 },
  typeFareAmount: { fontSize: 15, fontWeight: '800', color: theme.colors.primary },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: theme.roundness.medium,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 10,
    marginTop: 8,
  },
  infoText: { flex: 1, fontSize: 13, color: '#1e3a5f', lineHeight: 18 },
});
