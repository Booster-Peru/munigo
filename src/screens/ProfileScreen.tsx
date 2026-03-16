import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { theme } from '../config/theme';

const ACTIVITY_ITEMS = [
  { icon: 'bicycle-outline', label: 'Historial de viajes', iconBg: '#eff6ff', iconColor: '#2563eb' },
  { icon: 'bag-handle-outline', label: 'Mis pedidos', iconBg: '#fff7ed', iconColor: '#f97316' },
  { icon: 'paw-outline', label: 'Mis adopciones', iconBg: '#f0fdf4', iconColor: '#059669' },
  { icon: 'help-circle-outline', label: 'Soporte y Ayuda', iconBg: '#fefce8', iconColor: '#ca8a04' },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const initials = user?.fullName
    ?.split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'US';

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoPill}>
          <Text style={styles.logoText}>MuniGo</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="create-outline" size={22} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user?.fullName || 'Usuario MuniGo'}</Text>
          <Text style={styles.userContact}>{user?.email || 'usuario@munigo.pe'}</Text>
        </View>

        <View style={styles.content}>
          {/* Método de pago */}
          <Text style={styles.sectionTitle}>Método de pago</Text>
          <TouchableOpacity style={styles.paymentRow} activeOpacity={0.8}>
            <View style={styles.visaBadge}>
              <Text style={styles.visaText}>VISA</Text>
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Visa **** 1234</Text>
              <Text style={styles.paymentSub}>Expira en 09/26</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Mi Actividad */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Mi Actividad</Text>
          {ACTIVITY_ITEMS.map((item) => (
            <TouchableOpacity key={item.label} style={styles.activityRow} activeOpacity={0.8}>
              <View style={[styles.activityIcon, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
              </View>
              <Text style={styles.activityLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}

          {/* Términos */}
          <TouchableOpacity style={styles.termsRow}>
            <Text style={styles.termsText}>Términos y condiciones</Text>
          </TouchableOpacity>

          {/* Cerrar sesión */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>MuniGo v1.0.0 — Canoas de Punta Sal, Tumbes</Text>
        </View>
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
  logoPill: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: theme.roundness.full,
  },
  logoText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  profileCard: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 4,
    borderRadius: theme.roundness.large,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: '700' },
  userName: { color: '#fff', fontSize: 20, fontWeight: '700' },
  userContact: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  content: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.medium,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  visaBadge: {
    backgroundColor: '#1a1f71',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  visaText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  paymentInfo: { flex: 1 },
  paymentTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  paymentSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 1 },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: theme.colors.text },
  termsRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  termsText: { fontSize: 13, color: theme.colors.textSecondary },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fee2e2',
    borderRadius: theme.roundness.medium,
    padding: 16,
    marginTop: 20,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#dc2626' },
  versionText: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
    color: theme.colors.textSecondary,
    fontSize: 11,
  },
});
