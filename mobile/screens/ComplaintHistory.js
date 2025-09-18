import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { fetchComplaints } from '../services/database';

export default function ComplaintHistoryScreen() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    fetchComplaints(setComplaints); // Load complaints from SQLite
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.date}>{new Date(item.timestamp).toLocaleDateString()}</Text>
      <Text style={styles.location}>Lat: {item.latitude}, Lng: {item.longitude}</Text>
      <Text style={styles.status}>Status: Local</Text>
      <Text style={styles.description}>Image Path: {item.imagePath}</Text>
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
});