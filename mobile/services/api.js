import axios from 'axios';

const BASE_URL = 'http://192.168.1.200:8000';

// Upload a new complaint with image and location
export const uploadReport = async ({ imageUri, latitude, longitude, location_name }) => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    name: `photo_${Date.now()}.jpg`,
    type: 'image/jpeg',
  });
  formData.append('latitude', latitude);
  formData.append('longitude', longitude);
  formData.append('location_name', location_name);
  formData.append('timestamp', new Date().toISOString());

  try {
    const response = await axios.post(`${BASE_URL}/complaints/complaints/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    throw error;
  }
};

// Fetch all complaints from the backend
export const getComplaints = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/complaints/complaints/`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch complaints:', error.message);
    return [];
  }
};