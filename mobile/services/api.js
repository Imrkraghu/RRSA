import axios from 'axios';

const BASE_URL = 'http://192.168.1.189:8000'; // Replace with your actual machine IP

export const uploadReport = async ({
  imageUri,
  latitude,
  longitude,
  timestamp,
  road_name,
  road_type,
  department,
  anomalies_detected,
  types,
  ml_label,
  confidence,
}) => {
  const formData = new FormData();

  formData.append('image', {
    uri: imageUri,
    name: `road_${Date.now()}.jpg`,
    type: 'image/jpeg',
  });

  formData.append('latitude', latitude);
  formData.append('longitude', longitude);
  formData.append('timestamp', timestamp);
  formData.append('road_name', road_name);
  formData.append('road_type', road_type);
  formData.append('department', department);
  formData.append('anomalies_detected', anomalies_detected);
  formData.append('types', types);
  formData.append('ml_label', ml_label);
  formData.append('confidence', confidence);

  try {
    const response = await axios.post(`${BASE_URL}/complaints/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    throw error;
  }
};