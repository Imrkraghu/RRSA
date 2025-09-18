import React from 'react';
import { View,Text,Image,StyleSheet,TouchableOpacity,ScrollView,Alert, } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { uploadReport } from '../services/api';
import { getDB, initDB, insertComplaint } from '../services/database';

export default function ComplaintScreen() {
  const route = useRoute();
  const {
    imageUri,
    latitude,
    longitude,
    roadName,
    roadType,
    department,
    numPictures,
    anomaliesDetected,
    types,
  } = route.params;

  const handleRegisterComplaint = async () => {
    const timestamp = new Date().toISOString();

    try {
      // Send to backend
      // add more data variables in this 
      const result = await initDB(imageUri, latitude, longitude);

      // Save locally
      insertComplaint(imageUri, latitude, longitude, timestamp);

      Alert.alert('Success', 'Complaint registered successfully!');
      console.log('Server response:', result);
    } catch (error) {
      console.error('Error registering complaint:', error);
      Alert.alert('Error', 'Failed to register complaint.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />

      <View style={styles.infoBlock}>
        <InfoRow label="Latitude" value={latitude} />
        <InfoRow label="Longitude" value={longitude} />
        <InfoRow label="Road Name" value={roadName} />
        <InfoRow label="Road Type" value={roadType} />
        <InfoRow label="Department" value={department} />
        <InfoRow label="No. Pictures" value={numPictures?.toString()} />
        <InfoRow label="Anomalies Detected" value={anomaliesDetected?.toString()} />
        <InfoRow label="Types" value={Array.isArray(types) ? types.join(', ') : types} />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegisterComplaint}>
        <Text style={styles.buttonText}>Register Complaint</Text>
      </TouchableOpacity>
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
  container: {
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoBlock: {
    width: '100%',
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#555',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});