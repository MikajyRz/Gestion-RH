import backendClient from './backendClient';

export const getAllEntretiens = async () => {
  const response = await backendClient.get('/api/entretiens');
  return response.data;
};

export const getStatutsEntretien = async () => {
  const response = await backendClient.get('/api/entretiens/statuts');
  return response.data;
};

export const getCandidatsEligiblesEntretien = async () => {
  const response = await backendClient.get('/api/entretiens/candidats-eligible');
  return response.data;
};

export const createEntretien = async (idCandidatOrData, dateheure) => {
  const payload = typeof idCandidatOrData === 'object'
    ? idCandidatOrData
    : { idCandidat: idCandidatOrData, dateheure };
  const response = await backendClient.post('/api/entretiens', payload);
  return response.data;
};

export const updateEntretienStatut = async (id, idStatut) => {
  const response = await backendClient.put(`/api/entretiens/${id}/statut`, { idStatut });
  return response.data;
};

export const evaluerEntretien = async (id, note, appreciation) => {
  const response = await backendClient.post(`/api/entretiens/${id}/evaluation`, { note, appreciation });
  return response.data;
};

export const deleteEntretien = async (id) => {
  const response = await backendClient.delete(`/api/entretiens/${id}`);
  return response.data;
};
