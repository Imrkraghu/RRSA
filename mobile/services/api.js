import axios from 'axios';

const BASE_URL = 'http://192.168.1.189:8000'; // Replace with your actual machine IP

export const uploadReport = async (imageUri, latitude, longitude) => {
  const formData = new FormData();

  formData.append('image', {
    uri: imageUri,
    name: `road_${Date.now()}.jpg`,
    type: 'image/jpeg',
  });

  formData.append('latitude', latitude);
  formData.append('longitude', longitude);

  try {
    const response = await axios.post(`${BASE_URL}/complaints`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};