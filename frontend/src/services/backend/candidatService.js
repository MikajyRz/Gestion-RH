import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const backendClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Envoie la candidature avec upload réel du fichier CV.
 * @param {Object} candidatureData - Les données JSON de la candidature (nom, prenom, idAnnonce, criteres, etc.)
 * @param {File|null} cvFile - Le fichier CV sélectionné par le candidat (optionnel)
 */
export const postulerAnnonce = async (candidatureData, cvFile = null) => {
  const formData = new FormData();

  // Le JSON de la candidature est envoyé comme un Blob avec le bon Content-Type
  const candidatureBlob = new Blob([JSON.stringify(candidatureData)], {
    type: 'application/json',
  });
  formData.append('candidature', candidatureBlob);

  // Ajout du fichier CV si présent
  if (cvFile) {
    formData.append('cvFile', cvFile);
  }

  const response = await axios.post(`${API_BASE_URL}/candidats/postuler`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getTousLesCandidats = async () => {
  const response = await backendClient.get('/candidats');
  return response.data;
};
