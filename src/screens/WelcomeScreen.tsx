import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../config/theme';
import { Button } from '../components/common/Button';

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

const WelcomeScreen = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>MuniGo</Text>
              <View style={styles.logoDot} />
            </View>
            <Text style={styles.tagline}>Gestiona tu ciudad de forma inteligente</Text>
          </View>

          <View style={styles.features}>
            <FeatureItem
              icon="📍"
              title="Reportes Ciudadanos"
              description="Reporta baches, luces apagadas y más en segundos."
            />
            <FeatureItem
              icon="📄"
              title="Trámites Digitales"
              description="Realiza pagos y solicitudes desde tu móvil."
            />
          </View>

          <View style={styles.footer}>
            <Button
              title="Crear cuenta"
              variant="primary"
              onPress={() => navigation.navigate('Register')}
            />
            <Button
              title="Iniciar sesión"
              variant="ghost"
              onPress={() => navigation.navigate('Login')}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const FeatureItem = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIconContainer}>
      <Text style={styles.featureIcon}>{icon}</Text>
    </View>
    <View style={styles.featureTextContainer}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: theme.spacing.xxl,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logo: {
    ...theme.typography.h1,
    fontSize: 44,
    color: theme.colors.text,
    letterSpacing: -1.5,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: 4,
  },
  tagline: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.s,
    maxWidth: '80%',
    lineHeight: 24,
  },
  features: {
    gap: theme.spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.m,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.roundness.medium,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    gap: theme.spacing.s,
  },
});

export default WelcomeScreen;
