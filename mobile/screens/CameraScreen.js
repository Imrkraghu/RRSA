import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import { useRef, useState, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, BackHandler, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [lastImagePath, setLastImagePath] = useState(null);
  const cameraRef = useRef(null);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Home');
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync();
      if (!photo?.uri) {
        Alert.alert('Capture failed', 'No image was captured. Please try again.');
        return;
      }

      const targetDir = FileSystem.documentDirectory + 'images/';
      const fileName = `photo_${Date.now()}.jpg`;
      const destination = `${targetDir}${fileName}`;

      await FileSystem.makeDirectoryAsync(targetDir, { intermediates: true });

      if (lastImagePath) {
        try {
          await FileSystem.deleteAsync(lastImagePath, { idempotent: true });
          console.log('🗑️ Deleted previous image:', lastImagePath);
        } catch (err) {
          console.warn('⚠️ Failed to delete previous image:', err);
        }
      }

      await FileSystem.copyAsync({ from: photo.uri, to: destination });
      setLastImagePath(destination);
      console.log('📸 Image saved to:', destination);

      navigation.reset({
        index: 0,
        routes: [{
          name: 'Preview',
          params: {
            imageUri: destination,
          },
        }],
      });
    } catch (error) {
      console.error('❌ Error saving image:', error);
      Alert.alert('Error', 'Something went wrong while capturing the image.');
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef} />
      <View style={styles.shutterContainer}>
        <TouchableOpacity style={styles.shutterButton} onPress={takePicture} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  message: { textAlign: 'center', paddingBottom: 10, color: '#fff' },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  permissionText: { color: '#fff', fontWeight: '600' },
  camera: { flex: 1 },
  shutterContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  shutterButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#007AFF',
  },
});