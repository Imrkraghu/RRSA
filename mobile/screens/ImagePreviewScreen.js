import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function ImagePreviewScreen({ route }) {
  const { imageUri } = route.params;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [location, setLocation] = useState(null);

  // 🔄 Fetch location in background
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('⚠️ Location permission denied');
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        const latitude = loc.coords.latitude.toFixed(5);
        const longitude = loc.coords.longitude.toFixed(5);
        console.log(`📍 Location fetched: ${latitude}, ${longitude}`);
        setLocation({ latitude, longitude });
      } catch (err) {
        console.warn('⚠️ Failed to fetch location:', err);
      }
    };

    fetchLocation();
  }, []);

  const deleteAndGoBack = async () => {
    try {
      await FileSystem.deleteAsync(imageUri, { idempotent: true });
      console.log('🗑️ Deleted image:', imageUri);
    } catch (err) {
      console.warn('⚠️ Failed to delete image:', err);
    }

    setResult(null);
    setLoading(false);

    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Camera' }],
      });
    }, 300);
  };

  const handleConfirm = async () => {
  setLoading(true);

  const sendToBackend = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // wait for file system to settle

      const info = await FileSystem.getInfoAsync(imageUri);
      if (!info.exists || info.size === 0) {
        Alert.alert('Invalid image', 'The image file is missing or empty.');
        console.warn('⚠️ Image file not found or empty:', imageUri);
        return false;
      }

      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });

      console.log('📤 Attempting to send image to backend:', imageUri);

      const res = await axios.post('http://192.168.1.189:8000/detect/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 5000,
      });

      const { label, confidence } = res.data;
      console.log('✅ Backend response:', res.data);
      setResult({ label, confidence });

      if (label === 'road') {
        navigation.navigate('Complaint', {
          imageUri,
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null,
          anomaliesDetected: 1,
          types: [label],
          confidence,
        });
      } else {
        Alert.alert('Not a road', 'The image does not appear to be a road. Please try again.', [
          { text: 'Retake', onPress: deleteAndGoBack },
        ]);
      }

      return true;
    } catch (error) {
      console.warn('❌ First attempt failed:', error.message);
      return false;
    }
  };

  const success = await sendToBackend();

  if (!success) {
    console.log('🔁 Retrying image upload...');
    const retrySuccess = await sendToBackend();

    if (!retrySuccess) {
      Alert.alert('Upload failed', 'Could not connect to backend after retry.');
    }
  }

  setLoading(false);
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
    }, [imageUri])
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