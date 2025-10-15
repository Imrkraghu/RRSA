import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { fetchComplaints } from '../services/database';

const screen = Dimensions.get('window');

export default function ComplaintHistoryScreen() {
  const [complaints, setComplaints] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchComplaints((data) => {
      if (Array.isArray(data)) {
        setComplaints(data);
      } else {
        console.warn('⚠️ Unexpected data format:', data);
      }
    });
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setSelectedImage(item.image_path)}>
        <Image source={{ uri: item.image_path }} style={styles.imagePreview} />
      </TouchableOpacity>

      <Text style={styles.date}>{new Date(item.timestamp).toLocaleString()}</Text>
      <Text style={styles.location}>Lat: {item.latitude}, Lng: {item.longitude}</Text>
      <Text style={styles.status}>Status: In progress</Text>

      <Text style={styles.detail}>Road Name: {item.road_name || 'N/A'}</Text>
      {/* <Text style={styles.detail}>Road Type: {item.road_type || 'N/A'}</Text>
      <Text style={styles.detail}>Department: {item.department || 'N/A'}</Text>
      <Text style={styles.detail}>Anomalies: {item.anomalies_detected || 'N/A'}</Text>
      <Text style={styles.detail}>Types: {item.types || 'N/A'}</Text>
      <Text style={styles.detail}>ML Label: {item.ml_label || 'N/A'}</Text>
      <Text style={styles.detail}>Confidence: {item.confidence ?? 'N/A'}</Text> */}

      <Text style={styles.description}>Tap image to view full size</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complaint History</Text>

      {complaints.length === 0 ? (
        <Text style={styles.emptyText}>No complaints found.</Text>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalContainer}
            onPress={() => setSelectedImage(null)}
            activeOpacity={1}
          >
            <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
  },
  list: { paddingHorizontal: 16 },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  date: { fontSize: 14, color: '#666', marginTop: 8 },
  location: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  status: { fontSize: 14, color: '#007AFF', marginTop: 4 },
  detail: { fontSize: 14, color: '#444', marginTop: 4 },
  description: { fontSize: 14, color: '#444', marginTop: 8 },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: screen.width,
    height: screen.height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: screen.width * 0.9,
    height: screen.height * 0.7,
  },
});
