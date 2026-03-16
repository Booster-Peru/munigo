import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../config/theme';
import { useAuth } from '../../hooks/useAuth';

const TRANSACTIONS = [
  { id: '1', type: 'DEBIT', description: 'Pago Mototaxi', amount: -4.50, time: 'Hoy, 10:45 AM', icon: 'bicycle-outline', iconBg: '#fee2e2', iconColor: '#dc2626' },
  { id: '2', type: 'CREDIT', description: 'Recarga MuniGo', amount: 50.00, time: 'Ayer, 03:20 PM', icon: 'add-circle-outline', iconBg: '#dcfce7', iconColor: '#059669' },
  { id: '3', type: 'DEBIT', description: 'Pedido Restaurante', amount: -28.50, time: '13/03, 01:10 PM', icon: 'restaurant-outline', iconBg: '#fee2e2', iconColor: '#dc2626' },
  { id: '4', type: 'CREDIT', description: 'Recarga MuniGo', amount: 30.00, time: '10/03, 11:00 AM', icon: 'add-circle-outline', iconBg: '#dcfce7', iconColor: '#059669' },
];

export default function WalletScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [autoRecharge, setAutoRecharge] = React.useState(false);
  const balance = 125.40;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.logoPill}>
          <Text style={styles.logoText}>MuniGo</Text>
        </View>
        <TouchableOpacity style={styles.helpBtn}>
          <Ionicons name="help-circle-outline" size={22} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.locationSub}>CANOAS DE PUNTA SAL</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceCardHeader}>
            <View>
              <Text style={styles.balanceLabel}>Saldo disponible</Text>
              <Text style={styles.balanceAmount}>S/ {balance.toFixed(2)}</Text>
            </View>
            <Ionicons name="wallet" size={28} color="rgba(255,255,255,0.4)" />
          </View>
          <View style={styles.userRow}>
            <Text style={styles.userLabel}>USUARIO</Text>
            <Text style={styles.userName}>{user?.fullName || 'Juan Pérez Mendoza'}</Text>
            <Switch
              value={autoRecharge}
              onValueChange={setAutoRecharge}
              trackColor={{ false: 'rgba(255,255,255,0.3)', true: theme.colors.accent }}
              thumbColor="#fff"
              style={styles.userSwitch}
            />
          </View>
        </View>

        <View style={styles.content}>
          {/* Withdraw button */}
          <TouchableOpacity
            style={styles.withdrawBtn}
            onPress={() => Alert.alert('Retirar', 'Solicitar retiro a cuenta bancaria')}
            activeOpacity={0.8}
          >
            <Ionicons name="business-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.withdrawText}>Retirar a mi cuenta bancaria</Text>
          </TouchableOpacity>
          <Text style={styles.withdrawNote}>Las transferencias se realizan a cuentas registradas.</Text>

          {/* Recharge button — YELLOW as in Stitch */}
          <TouchableOpacity
            style={styles.rechargeBtn}
            onPress={() => Alert.alert('Recargar', 'Conectar con Culqi')}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle" size={20} color={theme.colors.text} />
            <Text style={styles.rechargeText}>Recargar saldo</Text>
          </TouchableOpacity>

          {/* Mis tarjetas */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis tarjetas</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>+ Gestionar</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.cardRow} activeOpacity={0.8}>
            <View style={styles.cardRowLeft}>
              <View style={styles.visaBadge}>
                <Text style={styles.visaText}>VISA</Text>
              </View>
              <View>
                <Text style={styles.cardTitle}>Visa Débito</Text>
                <Text style={styles.cardSub}>••• 1234</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Movimientos recientes */}
          <View style={[styles.sectionHeader, { marginTop: 20 }]}>
            <Text style={styles.sectionTitle}>Movimientos recientes</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>Ver todo</Text>
            </TouchableOpacity>
          </View>
          {TRANSACTIONS.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View style={[styles.txIcon, { backgroundColor: tx.iconBg }]}>
                <Ionicons name={tx.icon as any} size={18} color={tx.iconColor} />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txDesc}>{tx.description}</Text>
                <Text style={styles.txTime}>{tx.time}</Text>
              </View>
              <Text style={[styles.txAmount, tx.type === 'CREDIT' ? styles.txCredit : styles.txDebit]}>
                {tx.amount > 0 ? '+' : ''}S/ {Math.abs(tx.amount).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={{ height: 24 }} />
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
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  logoPill: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: theme.roundness.full,
  },
  logoText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  helpBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  locationSub: {
    textAlign: 'center',
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 1,
    paddingVertical: 6,
    backgroundColor: theme.colors.surface,
  },
  balanceCard: {
    backgroundColor: theme.colors.primary,
    margin: 16,
    borderRadius: theme.roundness.large,
    padding: 20,
    gap: 16,
  },
  balanceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 4 },
  balanceAmount: { color: '#fff', fontSize: 36, fontWeight: '800' },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', letterSpacing: 1, marginRight: 8 },
  userName: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 },
  userSwitch: { transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] },
  content: { paddingHorizontal: 16 },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderRadius: theme.roundness.medium,
    padding: 14,
    marginBottom: 6,
  },
  withdrawText: { color: theme.colors.primary, fontSize: 14, fontWeight: '600', flex: 1 },
  withdrawNote: { color: theme.colors.textSecondary, fontSize: 11, marginBottom: 14 },
  rechargeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.roundness.medium,
    padding: 16,
    marginBottom: 20,
  },
  rechargeText: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  sectionAction: { fontSize: 13, color: theme.colors.primary, fontWeight: '600' },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.medium,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  visaBadge: {
    backgroundColor: '#1a1f71',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  visaText: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  cardSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 1 },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 12,
  },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, fontWeight: '500', color: theme.colors.text },
  txTime: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '700' },
  txCredit: { color: '#059669' },
  txDebit: { color: '#dc2626' },
});
