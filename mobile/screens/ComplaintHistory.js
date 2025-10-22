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
  ActivityIndicator,
} from 'react-native';
import { getComplaints } from '../services/api';

const BASE_URL = 'http://192.168.1.200:8000'; // Your backend IP
const screen = Dimensions.get('window');

export default function ComplaintHistoryScreen() {
  const [complaints, setComplaints] = useState([]);
  const [selectedImagePath, setSelectedImagePath] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await getComplaints();
        if (Array.isArray(data)) {
          setComplaints(data);
        } else {
          console.warn('⚠️ Unexpected data format:', data);
        }
      } catch (error) {
        console.error('❌ Failed to fetch complaints:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const renderComplaint = ({ item }) => {
    const imageUrl = `${BASE_URL}/${item.image_path}`; // Full image path

    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => setSelectedImagePath(item.image_path)}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => console.warn('⚠️ Image failed to load:', imageUrl)}
          />
        </TouchableOpacity>

        <View style={styles.info}>
          <Text style={styles.timestamp}>
            {/* {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'No timestamp'} */}
          </Text>
          <Text style={styles.location}>
            📍 Lat: {item.latitude}, Lng: {item.longitude}
          </Text>
          <Text style={styles.status}>🛠 Status: In progress</Text>
          {/* <Text style={styles.road}>🛣 Road: {item.road_name || 'N/A'}</Text> */}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complaint History</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
      ) : complaints.length === 0 ? (
        <Text style={styles.empty}>No complaints found.</Text>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={renderComplaint}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal visible={!!selectedImagePath} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalContainer}
            onPress={() => setSelectedImagePath(null)}
            activeOpacity={1}
          >
            <Image
              source={{ uri: `${BASE_URL}/${selectedImagePath}` }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#222',
  },
  empty: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#f0f4f7',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#ccc',
  },
  info: {
    padding: 12,
  },
  timestamp: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  location: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  status: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 4,
  },
  road: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
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
