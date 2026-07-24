import backendClient from './backendClient'

export const rechercherAnnonces = async (filtres = {}) => {
  const params = new URLSearchParams();
  Object.keys(filtres).forEach((key) => {
    const val = filtres[key];
    if (val !== null && val !== undefined && val !== '') {
      // Ignorer les dates incomplètes (ex: 0002-07-21 ou 0202-07-17 pendant la saisie au clavier)
      if ((key === 'dateDebut' || key === 'dateFin') && typeof val === 'string') {
        const year = parseInt(val.split('-')[0], 10);
        if (isNaN(year) || year < 1900 || year > 2100) {
          return;
        }
      }
      params.append(key, val);
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

export const getAnnonceById = async (id) => {
  const response = await backendClient.get(`/api/annonces/${id}`);
  return response.data;
};

export const getCriteresByAnnonceId = async (id) => {
  const response = await backendClient.get(`/api/annonces/${id}/criteres`);
  return response.data;
};

export const getDiplomes = async () => {
  const response = await backendClient.get('/api/annonces/diplomes');
  return response.data;
};

export const getDiplomesExigesByAnnonceId = async (id) => {
  const response = await backendClient.get(`/api/annonces/${id}/diplomes-exiges`);
  return response.data;
};