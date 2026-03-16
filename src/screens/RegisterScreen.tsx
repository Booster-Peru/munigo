import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../config/theme';
import { Button } from '../components/common/Button';
import { Mail, Lock, User, ArrowLeft, CreditCard } from 'lucide-react-native';
import { Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !dni) {
      Alert.alert('Error', 'Por favor completa todos los campos (Nombre, Email, DNI y Contraseña)');
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password, dni);
      Alert.alert('Registro exitoso', 'Tu cuenta ha sido creada correctamente', [
        {
          text: 'Continuar',
          onPress: () => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Dashboard' }],
              }),
            );
          },
        },
      ]);
    } catch (error: unknown) {
      Alert.alert(
        'Error de registro',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <ArrowLeft stroke={theme.colors.text} size={24} />
              </TouchableOpacity>
              <Text style={styles.title}>Crea tu cuenta</Text>
              <Text style={styles.subtitle}>Sé parte de la transformación de tu ciudad</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <User color={theme.colors.textSecondary} size={20} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre completo"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Mail color={theme.colors.textSecondary} size={20} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <CreditCard color={theme.colors.textSecondary} size={20} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="DNI"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={dni}
                  onChangeText={setDni}
                  keyboardType="numeric"
                  maxLength={8}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Lock color={theme.colors.textSecondary} size={20} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <Text style={styles.terms}>
                Al registrarte, aceptas nuestros{' '}
                <Text style={styles.termsLink}>Términos de Servicio</Text> y{' '}
                <Text style={styles.termsLink}>Política de Privacidad</Text>.
              </Text>

              <Button
                title="Registrarme"
                variant="primary"
                onPress={handleRegister}
                loading={isLoading}
                style={styles.submitButton}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.l,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  form: {
    gap: theme.spacing.m,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 56,
  },
  inputIcon: {
    paddingHorizontal: theme.spacing.m,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    paddingRight: theme.spacing.m,
  },
  terms: {
    color: theme.colors.textSecondary,
    ...theme.typography.caption,
    textAlign: 'center',
    marginTop: theme.spacing.s,
    lineHeight: 18,
  },
  termsLink: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: theme.spacing.l,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xxxl,
  },
  footerText: {
    color: theme.colors.textSecondary,
    ...theme.typography.body,
  },
  footerLink: {
    color: theme.colors.primary,
    ...theme.typography.body,
    fontWeight: '700',
  },
});

export default RegisterScreen;
