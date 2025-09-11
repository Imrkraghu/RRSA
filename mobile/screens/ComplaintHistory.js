import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const complaints = [
  {
    id: '1',
    date: '2025-09-10',
    location: 'Sector 52, Chandigarh',
    status: 'Resolved',
    description: 'Large pothole near bus stop',
  },
  {
    id: '2',
    date: '2025-09-08',
    location: 'Phase 7, Mohali',
    status: 'Pending',
    description: 'Cracked road surface near school gate',
  },
  {
    id: '3',
    date: '2025-09-05',
    location: 'Sector 70, Mohali',
    status: 'In Progress',
    description: 'Water-logged pothole near traffic light',
  },
];

export default function ComplaintHistoryScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.date}>{item.date}</Text>
      <Text style={styles.location}>{item.location}</Text>
      <Text style={styles.status}>Status: {item.status}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complaint History</Text>
      <FlatList
        data={complaints}
        keyExtractor={(item) => item.id}
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
