import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, Image,Button, StyleSheet, Text } from 'react-native';

export default function ImagePreviewScreen({ route, navigation }) {
  const { imageUri } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Captured Image</Text>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <Button title="Recapture" onPress={() => navigation.navigate('Camera')} />
    <Button title="Confirm" onPress={() => navigation.navigate('Upload')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 20,
  },
  image: {
    width: '90%',
    height: '70%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
