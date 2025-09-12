import React, { useCallback, useState } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, BackHandler, ActivityIndicator, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function ImagePreviewScreen({ route }) {
  const { imageUri } = route.params;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const deleteAndGoBack = async () => {
    try {
      await FileSystem.deleteAsync(imageUri, { idempotent: true });
      console.log('🗑️ Deleted image:', imageUri);
    } catch (err) {
      console.warn('⚠️ Failed to delete image:', err);
    }
    navigation.navigate('Camera');
  };

  const handleConfirm = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    try {
      const res = await axios.post('http://192.168.1.5:8000/detect/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
    } catch (error) {
      Alert.alert('Upload failed', 'Could not connect to backend.');
      console.error(error);
    } finally {
      setLoading(false);
    }
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
        <TouchableOpacity style={styles.button} onPress={handleConfirm} disabled={loading}>
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
      {loading && <ActivityIndicator size="large" color="#00ffcc" style={{ marginTop: 20 }} />}
      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>Label: {result.label}</Text>
          <Text style={styles.resultText}>Confidence: {result.confidence}</Text>
        </View>
      )}
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
  resultBox: {
    marginTop: 30,
    backgroundColor: '#222',
    padding: 16,
    borderRadius: 8,
  },
  resultText: {
    color: '#0f0',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
});