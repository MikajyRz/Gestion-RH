import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const backendClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const postulerAnnonce = async (candidatureData) => {
  const response = await backendClient.post('/candidats/postuler', candidatureData);
  return response.data;
};

export const getTousLesCandidats = async () => {
  const response = await backendClient.get('/candidats');
  return response.data;
};
