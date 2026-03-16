import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../../config/theme';
import { RootStackParamList } from '../../types/navigation';

type NavProp = StackNavigationProp<RootStackParamList>;

export default function OrderDeliveredScreen() {
  const navigation = useNavigation<NavProp>();
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!rating) {
      Alert.alert('Calificación requerida', 'Selecciona una calificación.');
      return;
    }
    setSubmitted(true);
    setTimeout(() => navigation.navigate('Dashboard'), 1200);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pedido entregado</Text>
        <Text style={styles.headerSub}>CANOAS DE PUNTA SAL</Text>
      </View>

      {/* Success */}
      <View style={styles.successSection}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={40} color="#fff" />
        </View>
        <Text style={styles.successTitle}>¡Buen provecho!</Text>
        <Text style={styles.successSub}>Tu pedido fue entregado correctamente</Text>
      </View>

      {/* Rating */}
      <View style={styles.ratingCard}>
        <Text style={styles.ratingTitle}>¿Cómo estuvo tu pedido?</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.8}>
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color={star <= rating ? theme.colors.accent : theme.colors.border}
              />
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Text style={styles.ratingHint}>
            {['', '😞 Muy malo', '😕 Malo', '😐 Regular', '😊 Bueno', '🤩 Excelente'][rating]}
          </Text>
        )}
      </View>

      <View style={{ flex: 1 }} />

      <View style={styles.footer}>
        {submitted ? (
          <View style={styles.ctaBtn}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.text} />
            <Text style={styles.ctaText}>¡Gracias por calificar!</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.ctaBtn} onPress={handleSubmit} activeOpacity={0.85}>
            <Text style={styles.ctaText}>ENVIAR CALIFICACIÓN</Text>
            <Ionicons name="arrow-forward" size={18} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.skipText}>Omitir</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: '#1a2340',
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 1, letterSpacing: 0.8 },
  successSection: { alignItems: 'center', paddingVertical: 36, gap: 10 },
  successCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successTitle: { fontSize: 24, fontWeight: '800', color: theme.colors.text },
  successSub: { fontSize: 14, color: theme.colors.textSecondary },
  ratingCard: { alignItems: 'center', gap: 14, marginTop: 8 },
  ratingTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  starsRow: { flexDirection: 'row', gap: 10 },
  ratingHint: { fontSize: 16, color: theme.colors.textSecondary },
  footer: { padding: 16, gap: 10 },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.roundness.medium,
    padding: 18,
  },
  ctaText: { fontSize: 15, fontWeight: '800', color: theme.colors.text, letterSpacing: 0.5 },
  skipBtn: { alignItems: 'center', padding: 10 },
  skipText: { fontSize: 13, color: theme.colors.textSecondary },
});
