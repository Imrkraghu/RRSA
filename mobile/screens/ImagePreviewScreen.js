import React, { useCallback } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function ImagePreviewScreen({ route }) {
  const { imageUri } = route.params;
  const navigation = useNavigation();

  const deleteAndGoBack = async () => {
    try {
      await FileSystem.deleteAsync(imageUri, { idempotent: true });
      console.log('🗑️ Deleted image:', imageUri);
    } catch (err) {
      console.warn('⚠️ Failed to delete image:', err);
    }
    navigation.navigate('Camera');
  };

  const handleConfirm = () => {
    navigation.navigate('Upload', { imageUri });
  };

  const handleRecapture = () => {
    deleteAndGoBack();
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        deleteAndGoBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Captured Image</Text>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={handleRecapture}>
          <Text style={styles.buttonText}>Recapture</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleConfirm}>
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  title: { color: '#fff', fontSize: 20, marginBottom: 20 },
  image: {
    width: '90%',
    height: '70%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});