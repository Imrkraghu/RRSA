import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomePage({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Road Reporter</Text>
      <Button title="Go to Camera" onPress={() => navigation.navigate('Camera')} />
      <Button title="Upload Image" onPress={() => navigation.navigate('Upload')} />
      <Button title="View Result" onPress={() => navigation.navigate('Result')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
});
