import backendClient from './backendClient';

export const getBulletinsPaie = async (params = {}) => {
  const response = await backendClient.get('/api/paie/bulletins', { params });
  return response.data;
};

export const getBulletinById = async (id) => {
  const response = await backendClient.get(`/api/paie/bulletins/${id}`);
  return response.data;
};

export const genererPaieDuMois = async (mois, annee) => {
  const response = await backendClient.post('/api/paie/generer', null, {
    params: { mois, annee }
  });
  return response.data;
};

export const validerBulletin = async (id, idValidateur = null) => {
  const response = await backendClient.post(`/api/paie/bulletins/${id}/valider`, { idValidateur });
  return response.data;
};

export const getFeuillesTemps = async (params = {}) => {
  const response = await backendClient.get('/api/paie/feuilles-temps', { params });
  return response.data;
};

export const enregistrerFeuilleTemps = async (payload) => {
  const response = await backendClient.post('/api/paie/feuilles-temps', payload);
  return response.data;
};

export const getParametresCotisation = async () => {
  const response = await backendClient.get('/api/paie/parametres');
  return response.data;
};

export const exporterBulletinPdfUrl = (id) => {
  return `http://localhost:8081/api/paie/bulletins/${id}/pdf`;
};
