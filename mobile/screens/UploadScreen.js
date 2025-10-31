import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { uploadReport } from '../services/api';

const screenWidth = Dimensions.get('window').width;

export default function UploadScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const {
    imageUri,
    latitude,
    longitude,
    roadConfidence,
    anomalies = [],
    detections = [],
  } = route.params;

  const [uploading, setUploading] = useState(false);
  const [imageSize, setImageSize] = useState({ width: screenWidth - 32, height: 300 });

  // Dynamically calculate image height based on aspect ratio
  useEffect(() => {
    if (imageUri) {
      Image.getSize(
        imageUri,
        (width, height) => {
          const maxWidth = screenWidth - 32;
          const ratio = height / width;
          setImageSize({
            width: maxWidth,
            height: maxWidth * ratio,
          });
        },
        (err) => console.warn('Image size fetch failed:', err)
      );
    }
  }, [imageUri]);

  const handleSubmit = async () => {
    if (uploading) return;
    setUploading(true);

    try {
      const payload = {
        imageUri,
        latitude,
        longitude,
        roadConfidence,
        anomalies,
      };

      const result = await uploadReport(payload);
      console.log('✅ Successfully uploaded:', result);
      setUploading(false);
      navigation.replace('ComplaintSuccess');
    } catch (error) {
      setUploading(false);
      Alert.alert(
        'Upload Failed',
        'Could not send data to backend. Please try again.',
        [{ text: 'Retry', onPress: handleSubmit }]
      );
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Upload',
      'Are you sure you want to discard this report?',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.title}>Review & Submit Report</Text>

      {/* Responsive Image */}
      <View
        style={[
          styles.imageWrapper,
          { width: imageSize.width, height: imageSize.height },
        ]}
      >
        <Image
          source={{ uri: imageUri }}
          style={[styles.image, { width: imageSize.width, height: imageSize.height }]}
          resizeMode="contain"
          onError={(error) => console.warn('Image load error:', error)}
        />

        {/* Bounding boxes */}
        {detections.map((det, idx) => {
          const left = det.x - det.w / 2;
          const top = det.y - det.h / 2;

          return (
            <View
              key={idx}
              style={[
                styles.box,
                {
                  left: left * imageSize.width,
                  top: top * imageSize.height,
                  width: det.w * imageSize.width,
                  height: det.h * imageSize.height,
                  borderColor: det.label === 'Road' ? '#00FF00' : '#FF0000',
                },
              ]}
            />
          );
        })}
      </View>

      {/* Report Info */}
      <View style={styles.infoBlock}>
        <Text style={styles.sectionTitle}>📍 Location</Text>
        <InfoRow label="Latitude" value={latitude || 'N/A'} />
        <InfoRow label="Longitude" value={longitude || 'N/A'} />

        <Text style={styles.sectionTitle}>🛣️ Road Analysis</Text>
        <InfoRow
          label="Road Confidence"
          value={roadConfidence ? `${(roadConfidence * 100).toFixed(1)}%` : 'N/A'}
        />

        <Text style={styles.sectionTitle}>🚨 Detected Damages</Text>
        {anomalies.length > 0 ? (
          anomalies.map((a, idx) => (
            <InfoRow
              key={idx}
              label={a.label}
              value={`${(a.confidence * 100).toFixed(1)}%`}
            />
          ))
        ) : (
          <Text style={styles.noAnomaly}>No damages detected</Text>
        )}

        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>
            Total Detections:{' '}
            <Text style={styles.summaryValue}>{1 + anomalies.length}</Text>
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          disabled={uploading}
        >
          <Text style={styles.buttonTextCancel}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.submitButton,
            uploading && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={uploading}
          activeOpacity={0.8}
        >
          {uploading ? (
            <>
              <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Uploading...</Text>
            </>
          ) : (
            <Text style={styles.buttonText}>Submit Report</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const InfoRow = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  imageWrapper: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 24,
    backgroundColor: '#eaeaea',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    borderRadius: 12,
  },
  box: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 4,
  },
  infoBlock: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 3,
  },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },
  label: { fontWeight: '600', fontSize: 14, color: '#555', flex: 1 },
  value: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  noAnomaly: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  summaryBox: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  summaryText: { fontSize: 14, color: '#555', fontWeight: '600' },
  summaryValue: { color: '#007AFF', fontWeight: '700' },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#999',
  },
  submitButton: { backgroundColor: '#007AFF' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  buttonTextCancel: { fontSize: 16, fontWeight: '600', color: '#333' },
});
