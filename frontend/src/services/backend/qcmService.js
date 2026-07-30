import backendClient from './backendClient';

// --- GESTION DES TESTS QCM ---
export const getAllQcmTests = async () => {
  const response = await backendClient.get('/api/qcm/tests');
  return response.data;
};

export const createQcmTest = async (testData) => {
  const response = await backendClient.post('/api/qcm/tests', testData);
  return response.data;
};

export const updateQcmTest = async (id, testData) => {
  const response = await backendClient.put(`/api/qcm/tests/${id}`, testData);
  return response.data;
};

export const deleteQcmTest = async (id) => {
  const response = await backendClient.delete(`/api/qcm/tests/${id}`);
  return response.data;
};

// --- GESTION DES QUESTIONS ET CHOIX ---
export const getQuestionsForTest = async (idTest) => {
  const response = await backendClient.get(`/api/qcm/tests/${idTest}/questions`);
  return response.data;
};

export const addQuestionToTest = async (idTest, questionData) => {
  const response = await backendClient.post(`/api/qcm/tests/${idTest}/questions`, questionData);
  return response.data;
};

export const deleteQuestion = async (idQuestion) => {
  const response = await backendClient.delete(`/api/qcm/questions/${idQuestion}`);
  return response.data;
};

// --- CONSULTATION DES RÉSULTATS ---
export const getResultatsCandidats = async () => {
  const response = await backendClient.get('/api/qcm/resultats/candidats');
  return response.data;
};

export const getDetailsReponsesCandidat = async (idCandidat) => {
  const response = await backendClient.get(`/api/qcm/resultats/candidats/${idCandidat}`);
  return response.data;
};

// --- EXÉCUTION & CORRECTION AUTOMATIQUE DES QCM ---
export const getCandidatsQcmEnvoye = async () => {
  const response = await backendClient.get('/api/qcm/candidats-eligible');
  return response.data;
};

export const getTestForCandidat = async (idCandidat) => {
  const response = await backendClient.get(`/api/qcm/candidat/${idCandidat}/test`);
  return response.data;
};

export const soumettreQcmCandidat = async (payload) => {
  const response = await backendClient.post('/api/qcm/soumettre', payload);
  return response.data;
};
