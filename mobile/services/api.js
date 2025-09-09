import axios from 'axios';

const BASE_URL = 'http://localhost:8000'; // Update if hosted remotely

export const uploadReport = async (imageUri, location) => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    name: 'road.jpg',
    type: 'image/jpeg',
  });
  formData.append('latitude', location.lat);
  formData.append('longitude', location.lon);

  return axios.post(`${BASE_URL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
