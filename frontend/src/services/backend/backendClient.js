import axios from 'axios';

// Spécifier explicitement l'URL complète du Backend Spring Boot
export const backendClient = axios.create({
  baseURL: 'http://localhost:8081', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default backendClient;