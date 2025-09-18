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
    fetchComplaints(setComplaints);
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.date}>{new Date(item.timestamp).toLocaleDateString()}</Text>
      <Text style={styles.location}>Lat: {item.latitude}, Lng: {item.longitude}</Text>
      <Text style={styles.status}>Status: Local</Text>

      <TouchableOpacity onPress={() => setSelectedImage(item.imagePath)}>
        <Image source={{ uri: item.imagePath }} style={styles.imagePreview} />
      </TouchableOpacity>

      <Text style={styles.description}>Tap image to view full size</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complaint History</Text>
      <FlatList
        data={complaints}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      <Modal visible={!!selectedImage} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalContainer} onPress={() => setSelectedImage(null)}>
            <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2', paddingTop: 40 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  list: { paddingHorizontal: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  date: { fontSize: 14, color: '#666' },
  location: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  status: { fontSize: 14, color: '#007AFF', marginTop: 4 },
  description: { fontSize: 14, color: '#444', marginTop: 8 },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginTop: 10,
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
