import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../../config/theme';
import { RootStackParamList } from '../../types/navigation';
import { createMandado, MandadoType } from '../../services/mandadosService';
import { useAuth } from '../../hooks/useAuth';

const TYPE_LABELS: Record<MandadoType, string> = {
  COMPRAS: 'Compras',
  TRAMITE: 'Trámite',
  MENSAJERIA: 'Mensajería',
  OTRO: 'Otro mandado',
};

const FARES: Record<MandadoType, string> = {
  COMPRAS: 'S/ 8.00',
  TRAMITE: 'S/ 10.00',
  MENSAJERIA: 'S/ 6.00',
  OTRO: 'S/ 8.00',
};

export default function MandadoRequestScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'MandadoRequest'>>();
  const { token } = useAuth();
  const { type } = route.params;

  const [description, setDescription] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Falta información', 'Describe el mandado que necesitas');
      return;
    }
    if (!deliveryAddress.trim()) {
      Alert.alert('Falta información', 'Indica la dirección de entrega');
      return;
    }
    setLoading(true);
    try {
      const mandado = await createMandado(
        {
          type,
          description: description.trim(),
          pickup_address: pickupAddress.trim() || undefined,
          delivery_address: deliveryAddress.trim(),
          notes: notes.trim() || undefined,
        },
        token,
      );
      navigation.replace('MandadoConfirmation', { mandadoId: mandado.id });
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{TYPE_LABELS[type]}</Text>
          <Text style={styles.headerSub}>Tarifa: {FARES[type]}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.fieldLabel}>¿Qué necesitas? *</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Ej: Comprar 2 kg de arroz y 1 lt de aceite en la bodega de la esquina"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />

          <Text style={styles.fieldLabel}>Dirección de recogida (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Jr. Los Pinos 123, Cancas"
            placeholderTextColor={theme.colors.textSecondary}
            value={pickupAddress}
            onChangeText={setPickupAddress}
          />

          <Text style={styles.fieldLabel}>Dirección de entrega *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Av. Principal 456, Cancas"
            placeholderTextColor={theme.colors.textSecondary}
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
          />

          <Text style={styles.fieldLabel}>Notas adicionales</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Instrucciones especiales para el mandadero..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />

          <View style={styles.fareCard}>
            <Ionicons name="wallet-outline" size={20} color={theme.colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.fareLabel}>Costo del mandado</Text>
              <Text style={styles.fareNote}>Pago con Billetera MuniGo al completarse</Text>
            </View>
            <Text style={styles.fareAmount}>{FARES[type]}</Text>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.text} />
            ) : (
              <Text style={styles.submitBtnText}>SOLICITAR MANDADO</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 11, textAlign: 'center', marginTop: 1 },
  content: { padding: 20, gap: 6 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.colors.text,
  },
  inputMultiline: { minHeight: 90, paddingTop: 12 },
  fareCard: {
    backgroundColor: '#eff6ff',
    borderRadius: theme.roundness.medium,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    marginTop: 16,
  },
  fareLabel: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  fareNote: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 1 },
  fareAmount: { fontSize: 18, fontWeight: '800', color: theme.colors.primary },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.roundness.medium,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: { fontSize: 15, fontWeight: '800', color: theme.colors.text },
});
