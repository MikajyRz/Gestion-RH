import backendClient from './backendClient';

// --- DÉPARTEMENTS ---
export const getDepartements = async () => {
  const response = await backendClient.get('/api/departements');
  return response.data;
};

export const createDepartement = async (data) => {
  const response = await backendClient.post('/api/departements', data);
  return response.data;
};

export const updateDepartement = async (id, data) => {
  const response = await backendClient.put(`/api/departements/${id}`, data);
  return response.data;
};

export const deleteDepartement = async (id) => {
  const response = await backendClient.delete(`/api/departements/${id}`);
  return response.data;
};

// --- PROFILS & DIPLÔMES ---
export const getProfils = async () => {
  const response = await backendClient.get('/api/profils');
  return response.data;
};

export const createProfil = async (data) => {
  const response = await backendClient.post('/api/profils', data);
  return response.data;
};

export const updateProfil = async (id, data) => {
  const response = await backendClient.put(`/api/profils/${id}`, data);
  return response.data;
};

export const deleteProfil = async (id) => {
  const response = await backendClient.delete(`/api/profils/${id}`);
  return response.data;
};

export const getDiplomesByProfil = async (profilId) => {
  const response = await backendClient.get(`/api/profils/${profilId}/diplomes`);
  return response.data;
};

export const setDiplomesForProfil = async (profilId, diplomeIds) => {
  const response = await backendClient.post(`/api/profils/${profilId}/diplomes`, diplomeIds);
  return response.data;
};

// --- DIPLÔMES ---
export const getDiplomes = async () => {
  const response = await backendClient.get('/api/diplomes');
  return response.data;
};

export const createDiplome = async (data) => {
  const response = await backendClient.post('/api/diplomes', data);
  return response.data;
};

export const updateDiplome = async (id, data) => {
  const response = await backendClient.put(`/api/diplomes/${id}`, data);
  return response.data;
};

export const deleteDiplome = async (id) => {
  const response = await backendClient.delete(`/api/diplomes/${id}`);
  return response.data;
};

// --- CRITÈRES & TYPES DE CHAMPS ---
export const getCriteres = async () => {
  const response = await backendClient.get('/api/criteres');
  return response.data;
};

export const getTypeChamps = async () => {
  const response = await backendClient.get('/api/criteres/types-champs');
  return response.data;
};

export const createCritere = async (data) => {
  const response = await backendClient.post('/api/criteres', data);
  return response.data;
};

export const updateCritere = async (id, data) => {
  const response = await backendClient.put(`/api/criteres/${id}`, data);
  return response.data;
};

export const deleteCritere = async (id) => {
  const response = await backendClient.delete(`/api/criteres/${id}`);
  return response.data;
};

// --- RÈGLES CRITÈRES PAR PROFIL ---
export const getCriteresByProfil = async (profilId) => {
  const response = await backendClient.get(`/api/criteres/profils/${profilId}`);
  return response.data;
};

export const addCritereToProfil = async (profilId, critereProfilData) => {
  const response = await backendClient.post(`/api/criteres/profils/${profilId}`, critereProfilData);
  return response.data;
};

export const updateCritereProfilRegle = async (regleId, critereProfilData) => {
  const response = await backendClient.put(`/api/criteres/profils/regles/${regleId}`, critereProfilData);
  return response.data;
};

export const deleteCritereProfilRegle = async (regleId) => {
  const response = await backendClient.delete(`/api/criteres/profils/regles/${regleId}`);
  return response.data;
};
