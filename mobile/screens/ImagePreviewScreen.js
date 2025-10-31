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
import * as FileSystem from 'expo-file-system/legacy';
import * as Location from 'expo-location';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { runInference } from '../utils/tflite';
import { Asset } from 'expo-asset';


export default function ImagePreviewScreen({ route }) {
  const { imageUri } = route.params;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);

  // Fetch location on mount
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('⚠️ Location permission denied');
          return;
        }
        
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude.toFixed(5),
          longitude: loc.coords.longitude.toFixed(5),
        });
        console.log('✅ Location fetched');
      } catch (err) {
        console.warn('❌ Failed to fetch location:', err);
        // Continue without location
      }
    };
    
    fetchLocation();
  }, []);

  // Handle recapture
  const handleRecapture = useCallback(async () => {
    try {
      await FileSystem.deleteAsync(imageUri, { idempotent: true });
      console.log('✅ Image deleted');
    } catch (err) {
      console.warn('⚠️ Failed to delete image:', err);
    }
    navigation.reset({ index: 0, routes: [{ name: 'Camera' }] });
  }, [imageUri, navigation]);

  // Handle confirm - Run inference with proper error handling
  const handleConfirm = useCallback(async () => {
    // Prevent double tap
    if (loading) return;

    setLoading(true);
    console.log('🔄 Confirm button pressed - Starting inference...');

    try {
      // Run inference with image URI (not base64)
      const imageUri = Asset.fromModule(require('../assets/images/8.jpeg')).uri;
      const result = await runInference(imageUri);
      
      console.log('✅ Inference complete');

      // Check if result is valid
      if (!result || typeof result !== 'object') {
        console.error('❌ Invalid inference result:', result);
        setLoading(false);
        Alert.alert(
          'Processing Error',
          'Could not process image. Please try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      const { roadDetection, anomalies = [], success } = result;

      // No road detected
      if (!success || !roadDetection) {
        setLoading(false);
        console.log('⚠️ No road detected - showing alert');
        Alert.alert(
          'No Road Detected',
          'Please retake the image with a clear view of the road.',
          [
            {
              text: 'Retake',
              onPress: handleRecapture,
              style: 'default',
            },
          ]
        );
        return;
      }

      // Road detected - proceed to Complaint screen
      console.log('✅ Road detected successfully');
      console.log(`   - Road confidence: ${roadDetection.confidence.toFixed(3)}`);
      console.log(`   - Anomalies found: ${anomalies.length}`);

        navigation.navigate('Complaint', {
      imageUri,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      roadConfidence: parseFloat(roadDetection.confidence.toFixed(3)),
      anomalies: anomalies.map(a => ({
        label: a.label,
        confidence: parseFloat(a.confidence.toFixed(3)),
        box: a.box
      })),
      detections: [roadDetection, ...anomalies], // ✅ pass all boxes
      totalDetections: 1 + anomalies.length
    });


    } catch (err) {
      setLoading(false);
      console.error('❌ Processing error:', err.message);
      
      // Check if it's a bitmap error
      if (err.message && err.message.includes('bitmap')) {
        Alert.alert(
          'Image Error',
          'Could not load the image. Please try retaking the photo.',
          [
            { text: 'Retake', onPress: handleRecapture, style: 'default' }
          ]
        );
      } else {
        Alert.alert(
          'Processing Failed',
          'An error occurred while processing the image. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  }, [loading, imageUri, location, navigation, handleRecapture]);

  // Handle back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (loading) return true; // Prevent back while loading
        handleRecapture();
        return true;
      };
      
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );
      
      return () => subscription.remove();
    }, [loading, handleRecapture])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Captured Image</Text>
      
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        onError={(error) => console.warn('Image load error:', error.error)}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.recaptureBtn]}
          onPress={handleRecapture}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>{loading ? '...' : 'Recapture'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.confirmBtn,
            loading && styles.buttonDisabled
          ]}
          onPress={handleConfirm}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Processing...' : 'Confirm'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ffcc" />
          <Text style={styles.loadingText}>Analyzing image...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 16,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '65%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00ffcc',
    marginBottom: 30,
    backgroundColor: '#1a1a1a',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recaptureBtn: {
    backgroundColor: '#666',
  },
  confirmBtn: {
    backgroundColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#00ffcc',
    fontSize: 14,
    fontWeight: '500',
  },
});
