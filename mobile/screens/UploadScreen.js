import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { uploadReport } from '../services/api';

export default function ComplaintScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { imageUri, latitude, longitude } = route.params;

  const [locationName, setLocationName] = useState('Fetching...');

  useEffect(() => {
    const fetchLocationName = async () => {
      if (!latitude || !longitude) {
        setLocationName('Coordinates missing');
        return;
      }

      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'RRSA-MobileApp/1.0 rohit.hanuai@gmail.com',
          },
        });
        const data = await response.json();
        console.log('Location API response:', data);

        setLocationName(data?.display_name || 'Unknown location');
      } catch (error) {
        console.error('Error fetching location name:', error);
        setLocationName('Error fetching location');
      }
    };

    fetchLocationName();
  }, [latitude, longitude]);

  const handleRegisterComplaint = async () => {
    try {
      const result = await uploadReport({
        imageUri,
        latitude,
        longitude,
        locationName,
      });

      console.log('✅ Synced to backend:', result);
      navigation.navigate('ComplaintSuccess');
    } catch (error) {
      console.error('❌ Error registering complaint:', error);
      Alert.alert('Error', 'Failed to register complaint.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />

      <View style={styles.infoBlock}>
        <InfoRow label="Latitude" value={latitude} />
        <InfoRow label="Longitude" value={longitude} />
        <InfoRow label="Location Name" value={locationName} />
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