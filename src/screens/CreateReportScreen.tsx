import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { theme } from '../config/theme';
import { Camera, MapPin, ArrowLeft, Send, Trash2, Image as ImageIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { pickImage, takePhoto, getCurrentLocation } from '../utils/device';
import { reportService } from '../services/reportService';

const CreateReportScreen = () => {
  const navigation = useNavigation();
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Vialidad', 'Alumbrado', 'Seguridad', 'Limpieza', 'Parques', 'Otros'];
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  useEffect(() => {
    handleGetLocation();
  }, []);

  const handleTakePhoto = async () => {
    try {
      const uri = await takePhoto();
      if (uri) setPhoto(uri);
    } catch (error: unknown) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handlePickImage = async () => {
    try {
      const uri = await pickImage();
      if (uri) setPhoto(uri);
    } catch (error: unknown) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleGetLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
    } catch {
      Alert.alert('Ubicación', 'No se pudo obtener la ubicación automáticamente.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
  };

  const handleSubmit = async () => {
    if (!photo) {
      Alert.alert('Falta información', 'Por favor, incluye una foto como evidencia.');
      return;
    }
    if (!location) {
      Alert.alert('Falta información', 'Necesitamos tu ubicación para procesar el reporte.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Falta información', 'Por favor, describe brevemente el incidente.');
      return;
    }

    setIsSubmitting(true);
    try {
      await reportService.createReport({
        description,
        category: selectedCategory,
        photoUri: photo,
        location: location,
      });

      Alert.alert(
        'Reporte Enviado',
        'Tu reporte ha sido registrado exitosamente. Los técnicos municipales lo revisarán pronto.',
        [{ text: 'Excelente', onPress: () => navigation.goBack() }],
      );
    } catch {
      Alert.alert('Error', 'No se pudo enviar el reporte en este momento. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Nuevo Reporte</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>Evidencia Fotográfica</Text>

          {photo ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photoPreview} />
              <TouchableOpacity style={styles.removePhotoButton} onPress={handleRemovePhoto}>
                <Trash2 size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoOptions}>
              <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
                <Camera size={32} color={theme.colors.primary} />
                <Text style={styles.photoButtonText}>Cámara</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoButton} onPress={handlePickImage}>
                <ImageIcon size={32} color={theme.colors.primary} />
                <Text style={styles.photoButtonText}>Galería</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.label}>Ubicación</Text>
          <TouchableOpacity
            style={styles.locationContainer}
            onPress={handleGetLocation}
            disabled={isLoadingLocation}
          >
            <MapPin size={20} color={theme.colors.primary} />
            <Text style={styles.locationText}>
              {isLoadingLocation
                ? 'Obteniendo ubicación...'
                : location?.address || 'Seleccionar ubicación'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Categoría</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.categoryItem, selectedCategory === cat && styles.categoryItemActive]}
              >
                <Text
                  style={[
                    styles.categoryItemText,
                    selectedCategory === cat && styles.categoryItemTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={styles.input}
            placeholder="Describe el problema (ej: bache profundo, luminaria apagada...)"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Send size={20} color="#FFF" />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  content: {
    padding: theme.spacing.l,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.s,
    marginTop: theme.spacing.m,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1,
  },
  photoOptions: {
    flexDirection: 'row',
    gap: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  photoButton: {
    flex: 1,
    height: 100,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoButtonText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  photoContainer: {
    height: 200,
    width: '100%',
    borderRadius: theme.roundness.large,
    overflow: 'hidden',
    marginBottom: theme.spacing.m,
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.roundness.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.m,
  },
  locationText: {
    marginLeft: 10,
    color: theme.colors.text,
    ...theme.typography.body,
    flex: 1,
  },
  categoryList: {
    flexDirection: 'row',
    marginBottom: theme.spacing.m,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 10,
    backgroundColor: theme.colors.surface,
  },
  categoryItemActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryItemText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  categoryItemTextActive: {
    color: '#FFF',
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.medium,
    padding: theme.spacing.m,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 120,
    textAlignVertical: 'top',
  },
  footer: {
    padding: theme.spacing.l,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: theme.roundness.medium,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
});

export default CreateReportScreen;
