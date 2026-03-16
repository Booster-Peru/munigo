import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../config/theme';
import { Search } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { ModuleCard } from '../components/common/ModuleCard';
import { BannerCard } from '../components/common/BannerCard';
import { useAuth } from '../hooks/useAuth';

type HomeNavProp = StackNavigationProp<RootStackParamList>;

const MODULES = [
  {
    key: 'transport',
    label: 'Transporte',
    icon: <Ionicons name="bicycle" size={26} color={theme.colors.primary} />,
    onPress: (nav: HomeNavProp) => nav.navigate('Booking'),
  },
  {
    key: 'restaurants',
    label: 'Restaurantes',
    icon: <Ionicons name="restaurant" size={26} color="#059669" />,
    onPress: (nav: HomeNavProp) => nav.navigate('Services', { type: 'restaurantes' }),
  },
  {
    key: 'shops',
    label: 'Tiendas',
    icon: <Ionicons name="storefront" size={26} color="#7c3aed" />,
    onPress: (nav: HomeNavProp) => nav.navigate('Services', { type: 'tiendas' }),
  },
  {
    key: 'mandados',
    label: 'Te hago un favor',
    icon: <Ionicons name="bicycle-outline" size={26} color="#f59e0b" />,
    onPress: (nav: HomeNavProp) => nav.navigate('MandadosMenu'),
  },
  {
    key: 'pets',
    label: 'Mascotas',
    icon: <Ionicons name="paw" size={26} color="#ef4444" />,
    onPress: (nav: HomeNavProp) => nav.navigate('PetList'),
  },
  {
    key: 'wallet',
    label: 'Billetera',
    icon: <Ionicons name="wallet" size={26} color={theme.colors.primary} />,
    onPress: (nav: HomeNavProp) => nav.navigate('Wallet'),
  },
];

const HomeScreen = () => {
  const navigation = useNavigation<HomeNavProp>();
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] || 'Vecino';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} activeOpacity={0.7}>
          <Ionicons name="menu" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.logoPill}>
          <Text style={styles.logoText}>MuniGo</Text>
        </View>

        <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
          <Ionicons name="notifications" size={22} color={theme.colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting + location */}
        <View style={styles.greetingRow}>
          <Text style={styles.greeting}>Hola, {firstName}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={13} color={theme.colors.primary} />
            <Text style={styles.locationText}>Canoas de Punta Sal</Text>
          </View>
        </View>

        {/* Search bar */}
        <TouchableOpacity style={styles.searchBar} activeOpacity={0.8}>
          <Search size={18} color={theme.colors.textSecondary} />
          <Text style={styles.searchText}>¿Qué necesitas hoy?</Text>
        </TouchableOpacity>

        {/* Modules grid 2x3 */}
        <View style={styles.grid}>
          {MODULES.map((mod) => (
            <View key={mod.key} style={styles.gridCell}>
              <ModuleCard
                icon={mod.icon}
                label={mod.label}
                onPress={() => mod.onPress(navigation)}
              />
            </View>
          ))}
        </View>

        {/* Municipal banner */}
        <BannerCard
          title="Nuevos horarios de recolección"
          subtitle="Conoce las rutas de limpieza en tu sector."
          variant="info"
        />

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
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
  menuBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPill: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: theme.roundness.full,
  },
  logoText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bellBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  greetingRow: {
    gap: 3,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.large,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridCell: {
    width: '31%',
  },
});

export default HomeScreen;
