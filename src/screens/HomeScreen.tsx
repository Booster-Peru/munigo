import React from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, DashboardParamList } from '../types/navigation';
import { theme } from '../config/theme';
import {
  Bell,
  Search,
  MapPin,
  TrendingUp,
  CheckCircle2,
  Clock,
  Plus,
  Zap,
} from 'lucide-react-native';
import { ImageBackground } from 'react-native';
import { ReportCard } from '../components/reports/ReportCard';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatBadge } from '../components/common/StatBadge';
import { useAuth } from '../hooks/useAuth';
import heroImage from '../assets/images/hero.png';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<DashboardParamList, 'Main'>,
  StackNavigationProp<RootStackParamList>
>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();

  const stats = [
    { label: 'Reportes', value: '12', icon: MapPin, color: '#3B82F6' },
    { label: 'Resueltos', value: '8', icon: CheckCircle2, color: '#10B981' },
    { label: 'En curso', value: '4', icon: Clock, color: '#F59E0B' },
  ];

  const recentReports = [
    {
      id: '1',
      title: 'Bache profundo en Av. Central',
      category: 'Infraestructura',
      status: 'En curso',
      date: 'Hace 2 horas',
      votes: 24,
    },
    {
      id: '2',
      title: 'Luminaria fundida',
      category: 'Servicios',
      status: 'Resuelto',
      date: 'Ayer',
      votes: 12,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Hero Section with Image Background */}
      <ImageBackground
        source={heroImage}
        style={styles.heroBackground}
        imageStyle={styles.heroImage}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Hola, {user?.name || 'Invitado'}</Text>
              <View style={styles.locationContainer}>
                <MapPin size={14} color={theme.colors.accent} />
                <Text style={styles.locationText}>Ciudad Satélite, MX</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
              <Bell size={22} color="white" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>Mejora tu comunidad hoy</Text>
          <Text style={styles.heroSubtitle}>Reporta incidencias y mantente informado.</Text>
        </View>
      </ImageBackground>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        {/* Glassmorphism Search Bar */}
        <View style={styles.stickyHeader}>
          <TouchableOpacity style={styles.searchBar} activeOpacity={0.9}>
            <Search size={20} color={theme.colors.textSecondary} />
            <Text style={styles.searchText}>Buscar reportes o categorías...</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions / Stats */}
        <View style={styles.badgeContainer}>
          {stats.map((stat, index) => (
            <StatBadge key={index} label={stat.label} value={stat.value} color={stat.color} />
          ))}
        </View>

        {/* Categories Section */}
        <View style={styles.sectionContainer}>
          <SectionHeader title="Categorías" onPress={() => {}} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContent}
          >
            {['Vialidad', 'Servicios', 'Seguridad', 'Limpieza', 'Parques'].map((cat, i) => (
              <TouchableOpacity key={i} style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Reports */}
        <View style={styles.sectionContainer}>
          <SectionHeader
            title="Reportes recientes"
            onPress={() => navigation.navigate('Reports')}
          />
          <View style={styles.reportsList}>
            {recentReports.map((report) => (
              <ReportCard key={report.id} report={report} onPress={() => {}} />
            ))}
          </View>
        </View>

        {/* Community Impact Card */}
        <View style={styles.impactCard}>
          <View style={styles.impactContent}>
            <View style={styles.impactHeader}>
              <Zap size={16} color="white" fill="white" />
              <Text style={styles.impactTitle}>Tu impacto social</Text>
            </View>
            <Text style={styles.impactSubtitle}>
              Has ayudado a resolver 3 problemas en tu zona.
            </Text>
            <TouchableOpacity style={styles.impactButton}>
              <Text style={styles.impactButtonText}>Ver mis logros</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.impactIconCircle}>
            <TrendingUp size={32} color="white" />
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('CreateReport')}
      >
        <Plus size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  heroBackground: {
    height: 280,
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.xl,
  },
  heroImage: {
    opacity: 0.6,
  },
  heroOverlay: {
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.m,
  },
  heroTitle: {
    ...theme.typography.h1,
    color: 'white',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.m,
  },
  greeting: {
    ...theme.typography.h3,
    color: 'white',
    fontWeight: '700',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accent,
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  stickyHeader: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.m,
    paddingBottom: theme.spacing.s,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: theme.spacing.m,
    height: 52,
    borderRadius: theme.roundness.large,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  searchText: {
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.s,
    ...theme.typography.body,
    fontSize: 14,
  },
  sectionContainer: {
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.xl,
  },
  badgeContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.l,
    gap: theme.spacing.s,
    marginTop: theme.spacing.s,
    marginBottom: theme.spacing.xl,
  },
  reportsList: {
    marginTop: theme.spacing.s,
    gap: theme.spacing.m,
  },
  categoriesScroll: {
    marginTop: theme.spacing.s,
    marginHorizontal: -theme.spacing.l,
  },
  categoriesContent: {
    paddingHorizontal: theme.spacing.l,
    gap: theme.spacing.s,
  },
  categoryChip: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.roundness.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipText: {
    color: theme.colors.text,
    ...theme.typography.caption,
    fontWeight: '600',
  },
  impactCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.roundness.large,
    padding: theme.spacing.l,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.l,
    marginTop: theme.spacing.m,
    overflow: 'hidden',
  },
  impactContent: {
    flex: 1,
    zIndex: 1,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  impactTitle: {
    ...theme.typography.h3,
    color: 'white',
    fontWeight: '700',
  },
  impactSubtitle: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: theme.spacing.m,
  },
  impactButton: {
    backgroundColor: 'white',
    paddingHorizontal: theme.spacing.l,
    paddingVertical: 10,
    borderRadius: theme.roundness.medium,
    alignSelf: 'flex-start',
  },
  impactButtonText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  impactIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -20,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
});

export default HomeScreen;
