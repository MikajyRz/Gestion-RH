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

export const getStatutsCandidat = async () => {
  const response = await backendClient.get('/candidats/statuts');
  return response.data;
};

export const getCandidatDetails = async (id) => {
  const response = await backendClient.get(`/candidats/${id}/details`);
  return response.data;
};

export const getCandidatDetailComplete = getCandidatDetails;

export const updateCandidatStatut = async (idCandidat, idStatut) => {
  const response = await backendClient.put(`/candidats/${idCandidat}/statut`, { idStatut });
  return response.data;
};

export const updateStatutCandidat = updateCandidatStatut;

export const getCvUrl = (cvPath) => {
  if (!cvPath) return null;
  if (cvPath.startsWith('http://') || cvPath.startsWith('https://')) return cvPath;
  const fileName = cvPath.includes('/') ? cvPath.split('/').pop() : cvPath;
  return `${API_BASE_URL}/candidats/cv/${encodeURIComponent(fileName)}`;
};

export const getTypesContrat = async () => {
  const response = await backendClient.get('/candidats/types-contrat');
  return response.data;
};

export const getOffreCandidat = async (idCandidat) => {
  const response = await backendClient.get(`/candidats/${idCandidat}/offre`);
  return response.data;
};

export const transmettreOffreEmbauche = async (idCandidat, offerPayload) => {
  const response = await backendClient.post(`/candidats/${idCandidat}/transmettre-offre`, offerPayload);
  return response.data;
};

export const validerEmbaucheDefinitive = async (idCandidat, action = 'ADMIS') => {
  const response = await backendClient.post(`/candidats/${idCandidat}/valider-embauche`, { action });
  return response.data;
};

export const getContratPdfUrl = (idCandidat) => {
  return `${API_BASE_URL}/candidats/${idCandidat}/exporter-contrat-pdf`;
};
