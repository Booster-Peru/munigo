import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../../config/theme';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/useAuth';
import { requestTrip } from '../../services/transportService';

type TripType = 'standard' | 'premium';

const TRIP_OPTIONS = [
  {
    id: 'standard' as TripType,
    label: 'Standard',
    subtitle: 'Económico · 3 min de espera',
    price: 'S/ 5.00',
  },
  {
    id: 'premium' as TripType,
    label: 'Premium',
    subtitle: 'Extra espacio · 5 min de espera',
    price: 'S/ 8.00',
  },
];

export default function BookingScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { token } = useAuth();
  const [selected, setSelected] = useState<TripType>('standard');
  const [requesting, setRequesting] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>MuniGo Transport</Text>
          <Text style={styles.headerSub}>CANOAS DE PUNTA SAL</Text>
        </View>
        <TouchableOpacity style={styles.infoBtn}>
          <Ionicons name="information-circle-outline" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Map placeholder */}
      <View style={styles.mapArea}>
        <View style={styles.mapContent}>
          <View style={styles.originPin}>
            <Ionicons name="radio-button-on" size={16} color={theme.colors.primary} />
            <Text style={styles.pinLabel}>Plaza de Armas Canoas</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.destPin}>
            <Ionicons name="location" size={16} color={theme.colors.accent} />
            <Text style={styles.pinLabel}>Playa Punta Sal</Text>
          </View>
        </View>
        <View style={styles.mapZoom}>
          <TouchableOpacity style={styles.zoomBtn}>
            <Text style={styles.zoomText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomBtn}>
            <Text style={styles.zoomText}>−</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Booking panel */}
      <ScrollView style={styles.panel} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Elige tu Mototaxi</Text>

        {TRIP_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            style={[styles.optionCard, selected === opt.id && styles.optionCardSelected]}
            onPress={() => setSelected(opt.id)}
            activeOpacity={0.85}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="bicycle" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionLabel}>{opt.label}</Text>
              <Text style={styles.optionSub}>{opt.subtitle}</Text>
            </View>
            <View style={styles.optionRight}>
              <Text style={styles.optionPrice}>{opt.price}</Text>
              {selected === opt.id && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#0d9488"
                  style={{ marginTop: 4 }}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Payment + coupon row */}
        <View style={styles.payRow}>
          <TouchableOpacity style={styles.payLeft} activeOpacity={0.8}>
            <Ionicons name="wallet-outline" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.payText}>Billetera MuniGo</Text>
            <Ionicons name="chevron-down" size={14} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.payDivider} />
          <TouchableOpacity style={styles.couponBtn} activeOpacity={0.8}>
            <Ionicons name="pricetag-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.couponText}>Añadir Cupón</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* CTA — YELLOW as in Stitch */}
        <TouchableOpacity
          style={styles.ctaBtn}
          activeOpacity={0.85}
          disabled={requesting}
          onPress={async () => {
            if (!token) {
              Alert.alert('Error', 'Sesión no válida');
              return;
            }
            setRequesting(true);
            try {
              const trip = await requestTrip(
                {
                  origin_lat: -3.982,
                  origin_lng: -80.958,
                  dest_lat: -3.9755,
                  dest_lng: -80.951,
                  origin_label: 'Plaza de Armas Canoas',
                  dest_label: 'Playa Punta Sal',
                  type: selected,
                },
                token,
              );
              navigation.navigate('TripConfirmation', { tripId: trip.id });
            } catch (e: unknown) {
              Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo crear el viaje');
            } finally {
              setRequesting(false);
            }
          }}
        >
          {requesting ? (
            <ActivityIndicator color={theme.colors.text} />
          ) : (
            <>
              <Text style={styles.ctaText}>SOLICITAR MOTOTAXI</Text>
              <Ionicons name="arrow-forward" size={18} color={theme.colors.text} />
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 20 }} />
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
    fontSize: 10,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.8,
    marginTop: 1,
  },
  infoBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  mapArea: {
    height: 200,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContent: { alignItems: 'center', gap: 6 },
  originPin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  routeLine: { width: 2, height: 28, backgroundColor: theme.colors.primary, opacity: 0.3 },
  destPin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  pinLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.text },
  mapZoom: {
    position: 'absolute',
    right: 12,
    top: '50%',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  zoomBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  zoomText: { fontSize: 18, fontWeight: '600', color: theme.colors.text },
  panel: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 14 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: theme.roundness.medium,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    marginBottom: 10,
    backgroundColor: theme.colors.surface,
    gap: 12,
  },
  optionCardSelected: { borderColor: theme.colors.primary, backgroundColor: '#eff6ff' },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionInfo: { flex: 1 },
  optionLabel: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  optionSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  optionRight: { alignItems: 'flex-end' },
  optionPrice: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  payRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  payLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  payText: { fontSize: 13, color: theme.colors.textSecondary, flex: 1 },
  payDivider: { width: 1, height: 20, backgroundColor: theme.colors.border, marginHorizontal: 12 },
  couponBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  couponText: { fontSize: 13, color: theme.colors.textSecondary },
  divider: { height: 1, backgroundColor: theme.colors.border, marginBottom: 16 },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.roundness.medium,
    padding: 18,
  },
  ctaText: { fontSize: 16, fontWeight: '800', color: theme.colors.text, letterSpacing: 0.5 },
});
