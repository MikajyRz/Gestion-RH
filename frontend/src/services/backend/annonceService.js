import backendClient from './backendClient'

export const rechercherAnnonces = async (filtres = {}) => {
  const params = new URLSearchParams();
  Object.keys(filtres).forEach((key) => {
    if (filtres[key] !== null && filtres[key] !== undefined && filtres[key] !== '') {
      params.append(key, filtres[key]);
    }
  });

  const response = await backendClient.get(`/api/annonces/recherche?${params.toString()}`);
  return response.data;
};

export const getDepartements = async () => {
  const response = await backendClient.get('/api/annonces/departements');
  return response.data;
};

export const getProfils = async () => {
  const response = await backendClient.get('/api/annonces/profils');
  return response.data;
};

export const getTypesAnnonce = async () => {
  const response = await backendClient.get('/api/annonces/types-annonce');
  return response.data;
};