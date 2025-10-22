import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ComplaintSuccessScreen() {
  const navigation = useNavigation();

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const handleGoHistory = () => {
    navigation.navigate('ComplaintHistory');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/success.png')} // Make sure this image exists in your assets folder
        style={styles.image}
      />
      <Text style={styles.title}>Complaint Registered</Text>
      <Text style={styles.subtitle}>
        Your report has been successfully submitted and synced. Thank you for helping improve road safety!
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleGoHome}>
        <Text style={styles.buttonText}>Go to Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleGoHistory}>
        <Text style={styles.buttonText}>Check History</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
