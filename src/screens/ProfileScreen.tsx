import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../config/theme';
import {
  Settings,
  Edit2,
  LogOut,
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../hooks/useAuth';

const ProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth();

  const menuItems = [
    { icon: Bell, title: 'Notificaciones', color: '#3B82F6' },
    { icon: Shield, title: 'Seguridad y Privacidad', color: '#10B981' },
    { icon: HelpCircle, title: 'Ayuda y Soporte', color: '#F59E0B' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Cuenta</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Settings size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarPlaceholder}>JD</Text>
            </View>
            <TouchableOpacity style={styles.editBadge}>
              <Edit2 size={12} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>Juan De la Cruz</Text>
          <Text style={styles.userEmail}>juan.cruz@gmail.com</Text>
          <TouchableOpacity style={styles.completeProfileButton}>
            <Text style={styles.completeProfileText}>Perfil verificado</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <View style={[styles.menuIconContainer, { backgroundColor: item.color + '10' }]}>
                <item.icon size={20} color={item.color} />
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
              <ChevronRight size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await logout();
            navigation.navigate('Welcome');
          }}
        >
          <LogOut size={20} color={theme.colors.error} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>MuniGo v1.0.0</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.l,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  iconButton: {
    padding: theme.spacing.s,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  content: {
    padding: theme.spacing.l,
  },
  profileCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.large,
    padding: theme.spacing.l,
    alignItems: 'center',
    marginBottom: theme.spacing.l,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.m,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    ...theme.typography.h1,
    color: '#FFF',
    fontSize: 32,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.text,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.surface,
  },
  userName: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  userEmail: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.m,
  },
  completeProfileButton: {
    backgroundColor: theme.colors.success + '15',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: 6,
    borderRadius: 100,
  },
  completeProfileText: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: theme.spacing.l,
  },
  sectionTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.m,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.roundness.medium,
    marginBottom: theme.spacing.s,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  menuItemText: {
    flex: 1,
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.error + '10',
    padding: theme.spacing.m,
    borderRadius: theme.roundness.medium,
    marginTop: theme.spacing.m,
    gap: 10,
  },
  logoutText: {
    ...theme.typography.body,
    color: theme.colors.error,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
});

export default ProfileScreen;
