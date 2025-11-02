import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import * as FileSystem from 'expo-file-system/legacy';
import { uploadReport } from '../services/api';

const screenWidth = Dimensions.get('window').width;
const imageDisplaySize = screenWidth - 32;

export default function ComplaintScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const {
    imageUri,
    annotatedUri,
    latitude,
    longitude,
    roadConfidence,
    detections = [],
    allDetections = [],
    roadDetections = [],
    roadDetected,
    metadataPath,
  } = route.params ?? {};

  const [imageSize, setImageSize] = useState({ width: 640, height: 640 });
  const [uploading, setUploading] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [timestamp, setTimestamp] = useState(new Date().toISOString());

  useEffect(() => {
  // ✅ Image size logic
  const uri = imageUri;
  if (uri) {
    Image.getSize(
      uri,
      (width, height) => {
        setImageSize({ width, height });
      },
      (error) => console.warn('Failed to get image size:', error)
    );
  }

  // ✅ Location name logic
  if (!latitude || !longitude) {
    setLocationName('Coordinates missing');
    return;
  }

  const fetchLocationName = async () => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RRSA-MobileApp/1.0 rohit.hanuai@gmail.com',
        },
      });
      const data = await response.json();
      console.log('Location API response:', data);

      if (data?.display_name) {
        setLocationName(data.display_name);
      } else {
        setLocationName('Unknown location');
      }
    } catch (error) {
      console.error('Error fetching location name:', error);
      setLocationName('Error fetching location');
    }
  };

  fetchLocationName();
}, [imageUri, annotatedUri, latitude, longitude]);

  // Added block: Calculate rendered image size and offset due to "contain" resizeMode
  const displayAR = 1; // container is square: imageDisplaySize x imageDisplaySize
  const imageAR = (imageSize.width || 1) / (imageSize.height || 1);

  let renderedImageWidth = imageDisplaySize;
  let renderedImageHeight = imageDisplaySize;
  let xOffset = 0;
  let yOffset = 0;

  if (imageAR > displayAR) {
    // image is wider than container aspect ratio
    renderedImageWidth = imageDisplaySize;
    renderedImageHeight = renderedImageWidth / imageAR;
    yOffset = (imageDisplaySize - renderedImageHeight) / 2;
  } else {
    // image is taller than or equal to container aspect ratio
    renderedImageHeight = imageDisplaySize;
    renderedImageWidth = renderedImageHeight * imageAR;
    xOffset = (imageDisplaySize - renderedImageWidth) / 2;
  }

  // Adjust scale factors based on rendered size, not container size
  const scaleX = renderedImageWidth / (imageSize.width || 1);
  const scaleY = renderedImageHeight / (imageSize.height || 1);

  const sourceDetections = detections && detections.length ? detections : allDetections;

  const normalizedAnomalies = (sourceDetections || [])
    .filter(d => d.classId !== 111)
    .map((det) => {
      const [x1 = 0, y1 = 0, x2 = 0, y2 = 0] = det.box || [];
      const imgW = imageSize.width || 1;
      const imgH = imageSize.height || 1;
      const cx = (x1 + x2) / 2 / imgW;
      const cy = (y1 + y2) / 2 / imgH;
      const w = (x2 - x1) / imgW;
      const h = (y2 - y1) / imgH;
      return {
        label: det.label,
        confidence: parseFloat((det.confidence).toFixed(6)),
        classId: det.classId,
        x: parseFloat(cx.toFixed(6)),
        y: parseFloat(cy.toFixed(6)),
        w: parseFloat(w.toFixed(6)),
        h: parseFloat(h.toFixed(6)),
        box: det.box,
      };
    });

  const anomalyDetections = (allDetections || []).filter(d => d.classId !== 111);

  const handleSubmit = async () => {
    const timestamp = new Date().toISOString();

    try {
      // Sync to backend
      const result = await uploadReport({
         imageUri,
        latitude,
        longitude,
        timestamp,
        location_name: locationName, // ✅ Injected here
        anomalies_detected: anomalyDetections.length.toString(),
        anomalies: anomalyDetections, // ✅ Add this line
            });

      console.log('✅ Synced to backend:', result);
      navigation.navigate('ComplaintSuccess');
    } catch (error) {
      console.error('❌ Error registering complaint:', error);
      Alert.alert('Error', 'Failed to register complaint.');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel',
      'Are you sure you want to discard this report?',
      [
        { text: 'Keep', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  const handleViewMetadata = async () => {
    if (!metadataPath) {
      Alert.alert('No Metadata', 'Metadata file not found');
      return;
    }
    try {
      const content = await FileSystem.readAsStringAsync(metadataPath);
      const metadata = JSON.parse(content);
      Alert.alert('Annotation Metadata', JSON.stringify(metadata, null, 2), [{ text: 'Close' }]);
    } catch (err) {
      Alert.alert('Error', 'Could not read metadata file');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Road Condition Report</Text>

      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: annotatedUri || imageUri }}
          style={[styles.image, { width: imageDisplaySize, height: imageDisplaySize }]}
          resizeMode="contain"
        />
        {Array.isArray(allDetections) && allDetections.length > 0 && (
          <Svg height={imageDisplaySize} width={imageDisplaySize} style={styles.svgOverlay}>
            {allDetections.map((det, idx) => {
              const [x1 = 0, y1 = 0, x2 = 0, y2 = 0] = det.box || [];
              // Apply offsets and scaling here to correct box position
              const x = x1 * scaleX + xOffset;
              const y = y1 * scaleY + yOffset;
              const width = Math.max((x2 - x1) * scaleX, 1);
              const height = Math.max((y2 - y1) * scaleY, 1);
              const isRoad = det.classId === 111;
              const boxColor = isRoad ? '#00FF00' : '#FF5252';
              const labelBg = isRoad ? '#003300' : '#333333';
              const labelText = `${det.label} ${(det.confidence * 100).toFixed(0)}%`;
              const labelWidth = Math.min(width, 140);
              const labelY = Math.max(y - 24, 0);
              return (
                <React.Fragment key={idx}>
                  <Rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    stroke={boxColor}
                    strokeWidth="2"
                    fill="none"
                    rx="2"
                    ry="2"
                  />
                  <Rect x={x} y={labelY} width={labelWidth} height={24} fill={labelBg} rx="2" ry="2" />
                  <SvgText x={x + 4} y={Math.max(labelY + 16, 14)} fill="#fff" fontSize="12" fontWeight="bold">
                    {labelText}
                  </SvgText>
                </React.Fragment>
              );
            })}
          </Svg>
        )}
      </View>

      {/* The rest of your UI code below remains completely unchanged */}

      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>📊 Analysis Summary</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Road Detected</Text>
          <Text style={styles.value}>{roadDetected ? '✅ Yes' : '❌ No'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Road Confidence</Text>
          <Text style={styles.value}>{roadConfidence != null ? `${(roadConfidence * 100).toFixed(1)}%` : 'N/A'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Anomalies Detected</Text>
          <Text style={styles.value}>{sourceDetections?.filter(d => d.classId !== 111).length ?? 0}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Total Objects</Text>
          <Text style={styles.value}>{allDetections?.length ?? 0}</Text>
        </View>

        <View style={styles.row}>
         <Text style={styles.location}>
  📍    Location: {item.location_name || 'Unknown'}
        </Text>
        <Text style={styles.coordinates}>
          🧭 Lat: {item.latitude}, Lng: {item.longitude}
        </Text>
        </View>
      </View>

      {normalizedAnomalies.length > 0 && (
        <View style={styles.detectionsList}>
          <Text style={styles.listTitle}>🔍 Detected Anomalies</Text>
          {normalizedAnomalies.map((det, idx) => (
            <View key={idx} style={styles.detectionItem}>
              <View style={styles.detectionLabelContainer}>
                <Text style={styles.detectionLabel}>
                  {idx + 1}. {det.label}
                </Text>
              </View>
              <Text style={styles.detectionConfidence}>{(det.confidence * 100).toFixed(1)}%</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel} disabled={uploading}>
          <Text style={styles.buttonTextCancel}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton, uploading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={uploading}
        >
          {uploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator color="#fff" style={{ marginRight: 8 }} size="small" />
              <Text style={styles.buttonText}>Uploading...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Submit Report</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#000', textAlign: 'center' },
  imageWrapper: { position: 'relative', marginBottom: 24, alignSelf: 'center' },
  image: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#eaeaea',
  },
  svgOverlay: { position: 'absolute', top: 0, left: 0 },
  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    elevation: 3,
  },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },
  label: { fontWeight: '600', fontSize: 14, color: '#555', flex: 1 },
  value: { fontSize: 14, color: '#007AFF', fontWeight: '600', flex: 1, textAlign: 'right' },
  detectionsList: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 3 },
  listTitle: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 12 },
  detectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginVertical: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  detectionLabelContainer: { flex: 1 },
  detectionLabel: { fontSize: 13, fontWeight: '500', color: '#333' },
  detectionConfidence: { fontSize: 13, fontWeight: '600', color: '#007AFF', marginLeft: 8 },
  buttonContainer: { flexDirection: 'row', gap: 12, marginTop: 16 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  cancelButton: { backgroundColor: '#e0e0e0', borderWidth: 1, borderColor: '#999' },
  submitButton: { backgroundColor: '#007AFF' },
  buttonDisabled: { opacity: 0.6 },
  uploadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  buttonTextCancel: { fontSize: 16, fontWeight: '600', color: '#333' },
});