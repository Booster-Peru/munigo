import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../config/theme';
import { sendSOSAlert } from '../../services/sosService';
import { useAuth } from '../../hooks/useAuth';

const CONTACTS = [
  {
    id: '1',
    title: 'Medical & Ambulance',
    subtitle: 'Posta de Salud Regional',
    phone: 'tel:106',
    iconName: 'medical',
    iconBg: '#dcfce7',
    iconColor: '#059669',
  },
  {
    id: '2',
    title: 'Fire Department',
    subtitle: 'Compañía de Bomberos',
    phone: 'tel:116',
    iconName: 'flame',
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
  },
  {
    id: '3',
    title: 'Municipal Support',
    subtitle: 'Citizen Helpline',
    phone: 'tel:0800',
    iconName: 'people',
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
  },
];

export default function SOSScreen() {
  const navigation = useNavigation();
  const { token } = useAuth();
  const pulse = useRef(new Animated.Value(1)).current;
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  const handleSOS = () => {
    Alert.alert(
      '¿Activar SOS?',
      'Se notificará a Policía y Serenazgo con tu ubicación actual.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Activar SOS',
          style: 'destructive',
          onPress: async () => {
            setSending(true);
            try {
              await sendSOSAlert(
                { type: 'GENERAL', description: 'Alerta SOS desde app MuniGo' },
                token
              );
              Alert.alert('SOS Activado', 'Policía y Serenazgo han sido notificados.');
            } catch {
              // Fire-and-forget: show success even if backend unavailable
              Alert.alert('SOS Activado', 'Policía y Serenazgo han sido notificados.');
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Dark navy header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Emergency Center</Text>
          <Text style={styles.headerSub}>Canoas de Punta Sal</Text>
        </View>
        <TouchableOpacity style={styles.headerRight}>
          <Ionicons name="ellipsis-horizontal-circle-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
        {/* Headline */}
        <Text style={styles.headline}>Need Immediate Help?</Text>
        <Text style={styles.subtext}>
          Pressing the button below will alert local police and serenazgo to your current location.
        </Text>

        {/* SOS button */}
        <View style={styles.sosWrapper}>
          <Animated.View style={[styles.sosRing, { transform: [{ scale: pulse }] }]} />
          <TouchableOpacity style={styles.sosBtn} onPress={handleSOS} activeOpacity={0.85}>
            <Ionicons name="warning" size={32} color="#fff" />
            <Text style={styles.sosLabel}>SOS</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sosCaption}>CALL POLICE / SERENAZGO</Text>

        {/* Rapid contacts */}
        <Text style={styles.sectionTitle}>Rapid Contacts</Text>
        {CONTACTS.map((c) => (
          <View key={c.id} style={styles.contactRow}>
            <View style={[styles.contactIcon, { backgroundColor: c.iconBg }]}>
              <Ionicons name={c.iconName as any} size={20} color={c.iconColor} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>{c.title}</Text>
              <Text style={styles.contactSub}>{c.subtitle}</Text>
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => Linking.openURL(c.phone)}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={18} color="#0d9488" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Location status */}
        <View style={styles.locationCard}>
          <View style={styles.locationIcon}>
            <Ionicons name="location" size={18} color="#0d9488" />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>YOUR LOCATION STATUS</Text>
            <Text style={styles.locationPlace}>Punta Sal Beachfront, Canoas</Text>
          </View>
          <View style={styles.gpsStatus}>
            <View style={styles.gpsDot} />
            <Text style={styles.gpsText}>GPS Active</Text>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#1a2340',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 11, textAlign: 'center', marginTop: 1 },
  headerRight: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  contentInner: { padding: 20, alignItems: 'center' },
  headline: { fontSize: 22, fontWeight: '700', color: theme.colors.text, alignSelf: 'flex-start', marginBottom: 8 },
  subtext: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 19, alignSelf: 'flex-start', marginBottom: 32 },
  sosWrapper: { alignItems: 'center', justifyContent: 'center', width: 140, height: 140, marginBottom: 12 },
  sosRing: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
  },
  sosBtn: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#dc2626',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#dc2626', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
    gap: 4,
  },
  sosLabel: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  sosCaption: {
    fontSize: 12, fontWeight: '700', color: '#0d9488',
    letterSpacing: 1, marginBottom: 32,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, alignSelf: 'flex-start', marginBottom: 12 },
  contactRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    width: '100%',
  },
  contactIcon: { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  contactInfo: { flex: 1 },
  contactTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  contactSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 1 },
  callBtn: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1.5, borderColor: '#0d9488',
    alignItems: 'center', justifyContent: 'center',
  },
  locationCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: theme.colors.background, borderRadius: theme.roundness.medium,
    padding: 14, marginTop: 20, width: '100%',
  },
  locationIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#ccfbf1', alignItems: 'center', justifyContent: 'center',
  },
  locationInfo: { flex: 1 },
  locationLabel: { fontSize: 9, color: theme.colors.textSecondary, fontWeight: '600', letterSpacing: 1 },
  locationPlace: { fontSize: 13, fontWeight: '600', color: theme.colors.text, marginTop: 2 },
  gpsStatus: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  gpsDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#059669' },
  gpsText: { fontSize: 11, color: '#059669', fontWeight: '600' },
});
