import backendClient from './backendClient';

export const getTypesConge = async () => {
  const response = await backendClient.get('/api/conges/types');
  return response.data;
};

export const getEmployes = async () => {
  const response = await backendClient.get('/api/conges/employes');
  return response.data;
};

export const getStatutsDemandeConge = async () => {
  const response = await backendClient.get('/api/conges/statuts');
  return response.data;
};

export const getJoursFeries = async () => {
  const response = await backendClient.get('/api/conges/jours-feries');
  return response.data;
};

export const getDemandesConge = async (params = {}) => {
  const response = await backendClient.get('/api/conges/demandes', { params });
  return response.data;
};

export const getSoldesConge = async (params = {}) => {
  const response = await backendClient.get('/api/conges/soldes', { params });
  return response.data;
};

export const calculerJoursOuvres = async (dateDebut, dateFin) => {
  const response = await backendClient.post('/api/conges/calculer-jours-ouvres', { dateDebut, dateFin });
  return response.data;
};

export const creerDemandeConge = async (payload) => {
  const response = await backendClient.post('/api/conges/demandes', payload);
  return response.data;
};

export const approuverDemandeConge = async (idDemande, payload = {}) => {
  const response = await backendClient.post(`/api/conges/demandes/${idDemande}/approuver`, payload);
  return response.data;
};

export const refuserDemandeConge = async (idDemande, commentaireRefus, idValidateurRh = null) => {
  const response = await backendClient.post(`/api/conges/demandes/${idDemande}/refuser`, {
    idValidateurRh,
    commentaireRefus
  });
  return response.data;
};
