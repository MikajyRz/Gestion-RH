import React, { useState, useEffect } from 'react';
import {
  getAllQcmTests,
  createQcmTest,
  updateQcmTest,
  deleteQcmTest,
  getQuestionsForTest,
  addQuestionToTest,
  deleteQuestion,
  getResultatsCandidats,
  getDetailsReponsesCandidat,
  getCandidatsQcmEnvoye,
  getTestForCandidat,
  soumettreQcmCandidat
} from '../../services/backend/qcmService';
import { getProfils } from '../../services/backend/referentielService';
import '../../styles/Backoffice.css';

function QcmManagementPage() {
  const [activeTab, setActiveTab] = useState('tests'); // 'tests' | 'results' | 'passation'

  // Data states
  const [tests, setTests] = useState([]);
  const [profils, setProfils] = useState([]);
  const [resultatsCandidats, setResultatsCandidats] = useState([]);
  const [candidatsQcmEnvoye, setCandidatsQcmEnvoye] = useState([]);

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Selected Test for questions editor
  const [selectedTest, setSelectedTest] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Modals
  const [showTestModal, setShowTestModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [testForm, setTestForm] = useState({ nom: '', idprofil: '' });

  // Add Question Modal
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questionPoints, setQuestionPoints] = useState(2);
  const [choices, setChoices] = useState([
    { texte: '', estcorrect: true },
    { texte: '', estcorrect: false },
    { texte: '', estcorrect: false }
  ]);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  // Candidate Details Modal
  const [showResultDetailModal, setShowResultDetailModal] = useState(false);
  const [selectedCandidateResult, setSelectedCandidateResult] = useState(null);
  const [candidateAnswersDetail, setCandidateAnswersDetail] = useState([]);
  const [loadingAnswersDetail, setLoadingAnswersDetail] = useState(false);

  // PASSATION & CORRECTION QCM STATES
  const [selectedCandQcm, setSelectedCandQcm] = useState(null);
  const [candTestPayload, setCandTestPayload] = useState(null); // { test, candidat, questions }
  const [userAnswers, setUserAnswers] = useState({}); // { idQuestion: idChoix }
  const [loadingCandTest, setLoadingCandTest] = useState(false);
  const [submittingQcmSession, setSubmittingQcmSession] = useState(false);

  // Submission Result Modal
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionResult, setCorrectionResult] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [testsData, profilsData, resultatsData, cQcmEnvoye] = await Promise.all([
        getAllQcmTests(),
        getProfils(),
        getResultatsCandidats(),
        getCandidatsQcmEnvoye()
      ]);
      setTests(testsData || []);
      setProfils(profilsData || []);
      setResultatsCandidats(resultatsData || []);
      setCandidatsQcmEnvoye(cQcmEnvoye || []);

      if (testsData && testsData.length > 0 && !selectedTest) {
        handleSelectTest(testsData[0]);
      }
    } catch (err) {
      console.error('Erreur chargement QCM :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const notify = (msg, isError = false) => {
    setNotification({ text: msg, isError });
    setTimeout(() => setNotification(null), 4000);
  };

  // Sélectionner un test pour voir ses questions
  const handleSelectTest = async (test) => {
    setSelectedTest(test);
    try {
      setLoadingQuestions(true);
      const questions = await getQuestionsForTest(test.id);
      setTestQuestions(questions || []);
    } catch (err) {
      console.error('Erreur chargement questions :', err);
      setTestQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // --- 1. GESTION DES TESTS ---
  const handleOpenCreateTest = () => {
    setEditingTest(null);
    setTestForm({
      nom: '',
      idprofil: profils[0]?.id?.toString() || ''
    });
    setShowTestModal(true);
  };

  const handleOpenEditTest = (test) => {
    setEditingTest(test);
    setTestForm({
      nom: test.nom || '',
      idprofil: test.profil?.id?.toString() || ''
    });
    setShowTestModal(true);
  };

  const handleSubmitTest = async (e) => {
    e.preventDefault();
    if (!testForm.nom.trim()) return;

    const payload = {
      nom: testForm.nom.trim(),
      profil: testForm.idprofil ? { id: parseInt(testForm.idprofil, 10) } : null
    };

    try {
      if (editingTest) {
        await updateQcmTest(editingTest.id, payload);
        notify(`Test QCM "${testForm.nom}" mis à jour.`);
      } else {
        const created = await createQcmTest(payload);
        notify(`Test QCM "${testForm.nom}" créé.`);
        handleSelectTest(created);
      }
      setShowTestModal(false);
      loadData();
    } catch (err) {
      notify('Erreur lors de l\'enregistrement du test.', true);
    }
  };

  const handleDeleteTest = async (id, nom) => {
    if (!window.confirm(`Supprimer le questionnaire "${nom}" ?`)) return;
    try {
      await deleteQcmTest(id);
      notify(`Test QCM "${nom}" supprimé.`);
      if (selectedTest?.id === id) {
        setSelectedTest(null);
        setTestQuestions([]);
      }
      loadData();
    } catch (err) {
      notify('Erreur lors de la suppression du test.', true);
    }
  };

  // --- 2. GESTION DES QUESTIONS ET CHOIX ---
  const handleOpenAddQuestion = () => {
    if (!selectedTest) {
      alert('Veuillez d\'abord sélectionner ou créer un test QCM.');
      return;
    }
    setQuestionText('');
    setQuestionPoints(2);
    setChoices([
      { texte: '', estcorrect: true },
      { texte: '', estcorrect: false },
      { texte: '', estcorrect: false }
    ]);
    setShowQuestionModal(true);
  };

  const handleChoiceTextChange = (index, text) => {
    const nextChoices = [...choices];
    nextChoices[index].texte = text;
    setChoices(nextChoices);
  };

  const handleSetCorrectChoice = (correctIndex) => {
    const nextChoices = choices.map((c, i) => ({
      ...c,
      estcorrect: i === correctIndex
    }));
    setChoices(nextChoices);
  };

  const handleAddChoiceField = () => {
    setChoices([...choices, { texte: '', estcorrect: false }]);
  };

  const handleRemoveChoiceField = (index) => {
    if (choices.length <= 2) {
      alert('Une question doit comporter au moins 2 choix de réponse.');
      return;
    }
    const filtered = choices.filter((_, i) => i !== index);
    if (!filtered.some(c => c.estcorrect)) {
      filtered[0].estcorrect = true;
    }
    setChoices(filtered);
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const validChoices = choices.filter(c => c.texte.trim() !== '');
    if (validChoices.length < 2) {
      alert('Veuillez remplir au moins 2 choix de réponse.');
      return;
    }

    if (!validChoices.some(c => c.estcorrect)) {
      alert('Veuillez cocher au moins une bonne réponse.');
      return;
    }

    const payload = {
      question: questionText.trim(),
      points: parseInt(questionPoints, 10) || 1,
      numero: testQuestions.length + 1,
      choix: validChoices
    };

    try {
      setSubmittingQuestion(true);
      await addQuestionToTest(selectedTest.id, payload);
      notify('Nouvelle question ajoutée au test QCM.');
      setShowQuestionModal(false);
      handleSelectTest(selectedTest);
    } catch (err) {
      notify('Erreur lors de l\'ajout de la question.', true);
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Supprimer cette question ?')) return;
    try {
      await deleteQuestion(questionId);
      notify('Question supprimée.');
      handleSelectTest(selectedTest);
    } catch (err) {
      notify('Erreur lors de la suppression de la question.', true);
    }
  };

  // --- 3. DÉTAILS DES RÉSULTATS D'UN CANDIDAT ---
  const handleOpenCandidateResultsDetail = async (res) => {
    setSelectedCandidateResult(res);
    setShowResultDetailModal(true);
    setLoadingAnswersDetail(true);
    try {
      const details = await getDetailsReponsesCandidat(res.idCandidat);
      setCandidateAnswersDetail(details || []);
    } catch (err) {
      console.error('Erreur détails réponses :', err);
    } finally {
      setLoadingAnswersDetail(false);
    }
  };

  // --- 4. PASSATION & CORRECTION AUTOMATIQUE DES QCM (STATUT 'QCM ENVOYÉ') ---
  const handleSelectCandidateForPassation = async (candidatId) => {
    if (!candidatId) {
      setSelectedCandQcm(null);
      setCandTestPayload(null);
      setUserAnswers({});
      return;
    }

    const candObj = candidatsQcmEnvoye.find(c => c.id === parseInt(candidatId, 10));
    setSelectedCandQcm(candObj);
    setUserAnswers({});

    try {
      setLoadingCandTest(true);
      const testData = await getTestForCandidat(candidatId);
      setCandTestPayload(testData);
    } catch (err) {
      console.error('Erreur test candidat :', err);
      notify('Impossible de charger le test QCM pour ce candidat.', true);
      setCandTestPayload(null);
    } finally {
      setLoadingCandTest(false);
    }
  };

  const handleSelectUserAnswer = (questionId, choixId) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: choixId
    }));
  };

  const handleSubmitAndCorrectQcm = async (e) => {
    e.preventDefault();
    if (!selectedCandQcm || !candTestPayload || !candTestPayload.test) return;

    const questions = candTestPayload.questions || [];
    const answeredCount = Object.keys(userAnswers).length;

    if (answeredCount < questions.length) {
      if (!window.confirm(`Vous avez répondu à ${answeredCount} sur ${questions.length} questions. Soumettre quand même ?`)) {
        return;
      }
    }

    const reponsesPayload = Object.keys(userAnswers).map(qId => ({
      idQuestion: parseInt(qId, 10),
      idChoix: userAnswers[qId] ? parseInt(userAnswers[qId], 10) : null
    }));

    const payload = {
      idCandidat: selectedCandQcm.id,
      idTest: candTestPayload.test.id,
      reponses: reponsesPayload
    };

    try {
      setSubmittingQcmSession(true);
      const res = await soumettreQcmCandidat(payload);
      setCorrectionResult(res);
      setShowCorrectionModal(true);
      notify(`QCM corrigé ! Score : ${res.scoreObtenu}/${res.scoreMax} (${res.pourcentage}%). Statut candidat -> QCM Terminé.`);

      // Réinitialiser la vue de passation et recharger les listes
      setSelectedCandQcm(null);
      setCandTestPayload(null);
      setUserAnswers({});
      loadData();
    } catch (err) {
      console.error('Erreur soumission QCM :', err);
      notify('Erreur lors de la soumission du QCM.', true);
    } finally {
      setSubmittingQcmSession(false);
    }
  };

  return (
    <div className="backoffice-page">
      {/* BANNIÈRE */}
      <div className="backoffice-banner">
        <div className="backoffice-banner-content">
          <h1>📝 Tests QCM & Évaluations Techniques</h1>
          <p>Administrez les banques de questionnaires, faites passer les tests aux candidats (statut "QCM Envoyé") et consultez les corrections automatiques</p>
        </div>
      </div>

      <div className="dashboard-container">
        {notification && (
          <div className={notification.isError ? "alert-linkedin-error" : "alert-linkedin-success"}>
            {notification.isError ? '⚠️ ' : '✅ '} {notification.text}
          </div>
        )}

        {/* ONGLETS */}
        <div className="bo-tabs-header">
          <button
            className={`bo-tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
            onClick={() => setActiveTab('tests')}
          >
            🧩 Banques de Tests QCM ({tests.length})
          </button>
          <button
            className={`bo-tab-btn ${activeTab === 'passation' ? 'active' : ''}`}
            onClick={() => setActiveTab('passation')}
          >
            📝 Passation & Correction (Statut "QCM Envoyé" : {candidatsQcmEnvoye.length})
          </button>
          <button
            className={`bo-tab-btn ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            📊 Résultats & Notes Candidats ({resultatsCandidats.length})
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner"></div>
            <p>Chargement des évaluations techniques...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: BANQUES DE TESTS ET ÉDITEUR */}
            {activeTab === 'tests' && (
              <div className="grid-2-cols">
                {/* COLONNE GAUCHE: LISTE DES TESTS QCM */}
                <div className="bo-card">
                  <div className="bo-card-header">
                    <h3>Questionnaires Disponibles</h3>
                    <button
                      className="btn-linkedin-primary"
                      style={{ width: 'auto' }}
                      onClick={handleOpenCreateTest}
                    >
                      ➕ Nouveau Test QCM
                    </button>
                  </div>

                  <div className="bo-table-responsive">
                    <table className="bo-table">
                      <thead>
                        <tr>
                          <th>Intitulé du Test</th>
                          <th>Profil Métier</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tests.map(t => {
                          const isSelected = selectedTest?.id === t.id;
                          return (
                            <tr
                              key={t.id}
                              style={{ backgroundColor: isSelected ? '#eff6ff' : 'transparent', cursor: 'pointer' }}
                              onClick={() => handleSelectTest(t)}
                            >
                              <td>
                                <strong>{t.nom}</strong>
                                {isSelected && <span className="active-tag-sm"> (Sélectionné)</span>}
                              </td>
                              <td>{t.profil ? t.profil.nom : 'Tous profils'}</td>
                              <td onClick={(e) => e.stopPropagation()}>
                                <div className="action-buttons-group">
                                  <button
                                    className="btn-icon btn-icon-edit"
                                    title="Modifier"
                                    onClick={() => handleOpenEditTest(t)}
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="btn-icon btn-icon-delete"
                                    title="Supprimer"
                                    onClick={() => handleDeleteTest(t.id, t.nom)}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* COLONNE DROITE: ÉDITEUR DE QUESTIONS DU TEST SÉLECTIONNÉ */}
                <div className="bo-card">
                  <div className="bo-card-header">
                    <h3>
                      📋 Questions du test :{' '}
                      <span style={{ color: '#0a66c2' }}>{selectedTest ? selectedTest.nom : 'Aucun test sélectionné'}</span>
                    </h3>
                    {selectedTest && (
                      <button
                        className="btn-linkedin-primary"
                        style={{ width: 'auto' }}
                        onClick={handleOpenAddQuestion}
                      >
                        ➕ Ajouter une Question
                      </button>
                    )}
                  </div>

                  {!selectedTest ? (
                    <div className="empty-state">
                      <p className="empty-icon">👈</p>
                      <p>Cliquez sur un test QCM dans la liste de gauche pour en afficher les questions.</p>
                    </div>
                  ) : loadingQuestions ? (
                    <div className="loading-spinner-container">
                      <div className="spinner-sm"></div>
                      <p>Chargement des questions du questionnaire...</p>
                    </div>
                  ) : testQuestions.length === 0 ? (
                    <div className="empty-state">
                      <p className="empty-icon">❓</p>
                      <p>Ce questionnaire ne contient encore aucune question.</p>
                      <button className="btn-linkedin-secondary" onClick={handleOpenAddQuestion} style={{ marginTop: '1rem' }}>
                        ➕ Ajouter la première question
                      </button>
                    </div>
                  ) : (
                    <div className="questions-editor-list">
                      {testQuestions.map((q, idx) => (
                        <div key={q.id} className="question-card-item">
                          <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a' }}>
                              Question {idx + 1} : {q.question}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span className="badge-points">{q.points} point(s)</span>
                              <button
                                className="btn-icon btn-icon-delete"
                                title="Supprimer la question"
                                onClick={() => handleDeleteQuestion(q.id)}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          <ul className="choices-preview-list">
                            {(q.choix || []).map(ch => (
                              <li key={ch.id} className={ch.estcorrect ? 'correct-choice' : ''}>
                                {ch.estcorrect ? '✅ ' : '⚪ '} {ch.texte}
                                {ch.estcorrect && <span className="correct-tag"> (Bonne réponse)</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: PASSATION & CORRECTION AUTOMATIQUE DES QCM (STATUT 'QCM ENVOYÉ') */}
            {activeTab === 'passation' && (
              <div className="bo-card">
                <div className="bo-card-header">
                  <h3>📝 Passation et Correction des QCM (Candidats au statut "QCM Envoyé")</h3>
                </div>

                {/* SÉLECTION DU CANDIDAT ÉLIGIBLE */}
                <div className="form-group-linkedin" style={{ maxWidth: '600px', marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '1rem', fontWeight: 700 }}>
                    🎯 Choisir un candidat ayant le statut "QCM Envoyé" ({candidatsQcmEnvoye.length} éligibles) :
                  </label>
                  <select
                    value={selectedCandQcm?.id || ''}
                    onChange={(e) => handleSelectCandidateForPassation(e.target.value)}
                  >
                    <option value="">-- Sélectionner un candidat éligible --</option>
                    {candidatsQcmEnvoye.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.prenom} {c.nom} — ({c.annonce?.nomposte || 'Offre d\'emploi'})
                      </option>
                    ))}
                  </select>
                </div>

                {loadingCandTest ? (
                  <div className="loading-spinner-container">
                    <div className="spinner"></div>
                    <p>Chargement du questionnaire QCM associé au candidat...</p>
                  </div>
                ) : !selectedCandQcm ? (
                  <div className="empty-state">
                    <p className="empty-icon">👥</p>
                    <p>Sélectionnez un candidat dans la liste déroulante ci-dessus pour démarrer le test QCM.</p>
                  </div>
                ) : !candTestPayload || !candTestPayload.test ? (
                  <div className="empty-state">
                    <p className="empty-icon">⚠️</p>
                    <p>Aucun test QCM n'est encore configuré pour le poste de ce candidat.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitAndCorrectQcm} className="qcm-test-taking-container">
                    {/* EN-TÊTE DU TEST */}
                    <div className="qcm-test-taking-header">
                      <div>
                        <h2>📋 {candTestPayload.test.nom}</h2>
                        <p style={{ margin: 0, color: '#64748b' }}>
                          Candidat : <strong>{selectedCandQcm.prenom} {selectedCandQcm.nom}</strong> | Poste :{' '}
                          <strong>{selectedCandQcm.annonce?.nomposte || '—'}</strong>
                        </p>
                      </div>
                      <div className="qcm-progress-badge">
                        Répondu : {Object.keys(userAnswers).length} / {candTestPayload.questions.length} questions
                      </div>
                    </div>

                    {/* QUESTIONS & CHOIX MULTIPLES */}
                    <div className="qcm-questions-taking-list">
                      {candTestPayload.questions.map((q, idx) => (
                        <div key={q.id} className="qcm-question-card">
                          <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                            <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>
                              Question {idx + 1} : {q.question}
                            </h4>
                            <span className="badge-points">{q.points} pt(s)</span>
                          </div>

                          <div className="qcm-choices-taking-group">
                            {(q.choix || []).map(c => {
                              const isChecked = userAnswers[q.id] === c.id;
                              return (
                                <label
                                  key={c.id}
                                  className={`qcm-choice-taking-label ${isChecked ? 'selected' : ''}`}
                                >
                                  <input
                                    type="radio"
                                    name={`q_${q.id}`}
                                    checked={isChecked}
                                    onChange={() => handleSelectUserAnswer(q.id, c.id)}
                                  />
                                  <span>{c.texte}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* BOUTON SOUMISSION & CORRECTION */}
                    <div className="qcm-submit-footer">
                      <button
                        type="submit"
                        className="btn-linkedin-primary"
                        style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
                        disabled={submittingQcmSession}
                      >
                        {submittingQcmSession ? 'Correction en cours...' : '✅ Soumettre et Corriger le QCM'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 3: CONSULTATION DES RÉSULTATS CANDIDATS */}
            {activeTab === 'results' && (
              <div className="bo-card">
                <div className="bo-card-header">
                  <h3>Résultats et Notes des Candidats aux QCM</h3>
                </div>

                {resultatsCandidats.length === 0 ? (
                  <div className="empty-state">
                    <p className="empty-icon">📊</p>
                    <p>Aucun candidat n'a encore passé de test QCM.</p>
                  </div>
                ) : (
                  <div className="bo-table-responsive">
                    <table className="bo-table">
                      <thead>
                        <tr>
                          <th>Candidat</th>
                          <th>Poste visé</th>
                          <th>Questionnaire</th>
                          <th>Score obtenu</th>
                          <th>Pourcentage</th>
                          <th>Appréciation</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultatsCandidats.map((res, index) => {
                          const isPassed = res.pourcentage >= 50.0;
                          return (
                            <tr key={index}>
                              <td>
                                <strong>{res.nomCandidat}</strong>
                                <span className="poste-desc-preview">{res.email}</span>
                              </td>
                              <td>{res.nomPoste || '—'}</td>
                              <td>{res.nomTest}</td>
                              <td>
                                <strong style={{ fontSize: '1.05rem' }}>
                                  {res.scoreObtenu} / {res.scoreMax} pts
                                </strong>
                              </td>
                              <td>
                                <span className={`status-pill ${isPassed ? 'badge-status-active' : 'badge-status-expired'}`}>
                                  {res.pourcentage}%
                                </span>
                              </td>
                              <td>
                                {isPassed ? (
                                  <span style={{ color: '#166534', fontWeight: 600 }}>🟢 Compétences Validées</span>
                                ) : (
                                  <span style={{ color: '#dc2626', fontWeight: 600 }}>🔴 Insuffisant</span>
                                )}
                              </td>
                              <td>
                                <div className="action-buttons-group">
                                  <button
                                    className="btn-icon btn-icon-view"
                                    title="Consulter les réponses détaillées"
                                    onClick={() => handleOpenCandidateResultsDetail(res)}
                                  >
                                    👁️ Réponses
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* MODALE CRÉATION / ÉDITION TEST QCM */}
      {showTestModal && (
        <div className="modal-backdrop">
          <div className="modal-content modal-sm">
            <div className="modal-header">
              <h2>{editingTest ? '✏️ Modifier le test QCM' : '➕ Nouveau Test QCM'}</h2>
              <button className="modal-close-btn" onClick={() => setShowTestModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmitTest} className="modal-body form-grid-1">
              <div className="form-group-linkedin">
                <label>Titre du questionnaire *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: QCM - Évaluation Java & Spring Boot"
                  value={testForm.nom}
                  onChange={(e) => setTestForm({ ...testForm, nom: e.target.value })}
                />
              </div>

              <div className="form-group-linkedin">
                <label>Profil Métier associé</label>
                <select
                  value={testForm.idprofil}
                  onChange={(e) => setTestForm({ ...testForm, idprofil: e.target.value })}
                >
                  <option value="">Tous les profils / Général</option>
                  {profils.map(p => (
                    <option key={p.id} value={p.id}>{p.nom}</option>
                  ))}
                </select>
              </div>

              <div className="modal-footer" style={{ padding: '1rem 0 0 0', border: 'none', backgroundColor: 'transparent' }}>
                <button
                  type="button"
                  className="btn-linkedin-secondary"
                  onClick={() => setShowTestModal(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-linkedin-primary" style={{ width: 'auto' }}>
                  {editingTest ? 'Mettre à jour' : 'Créer le test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE Saisie Question & Choix */}
      {showQuestionModal && (
        <div className="modal-backdrop">
          <div className="modal-content modal-md">
            <div className="modal-header">
              <h2>➕ Ajouter une question au test QCM</h2>
              <button className="modal-close-btn" onClick={() => setShowQuestionModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmitQuestion} className="modal-body form-grid-1">
              <div className="form-group-linkedin">
                <label>Intitulé de la question *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Quelle annotation Spring Boot permet de créer une API REST ?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                />
              </div>

              <div className="form-group-linkedin">
                <label>Nombre de points *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={questionPoints}
                  onChange={(e) => setQuestionPoints(e.target.value)}
                />
              </div>

              <div className="form-group-linkedin">
                <label style={{ fontWeight: 700 }}>Réponses possibles (Cochez le bouton radio pour définir la BONNE réponse) :</label>
                {choices.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="radio"
                      name="correctChoiceRadio"
                      checked={c.estcorrect}
                      onChange={() => handleSetCorrectChoice(i)}
                      title="Définir comme la bonne réponse"
                      style={{ width: '20px', height: '20px', accentColor: '#166534', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      placeholder={`Choix ${i + 1}`}
                      value={c.texte}
                      onChange={(e) => handleChoiceTextChange(i, e.target.value)}
                      style={{ flex: 1 }}
                    />
                    {choices.length > 2 && (
                      <button
                        type="button"
                        className="btn-icon btn-icon-delete"
                        onClick={() => handleRemoveChoiceField(i)}
                        title="Supprimer ce choix"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  className="btn-linkedin-secondary-sm"
                  onClick={handleAddChoiceField}
                  style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
                >
                  ➕ Ajouter une option de réponse
                </button>
              </div>

              <div className="modal-footer" style={{ padding: '1rem 0 0 0', border: 'none', backgroundColor: 'transparent' }}>
                <button
                  type="button"
                  className="btn-linkedin-secondary"
                  onClick={() => setShowQuestionModal(false)}
                  disabled={submittingQuestion}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-linkedin-primary"
                  style={{ width: 'auto' }}
                  disabled={submittingQuestion}
                >
                  {submittingQuestion ? 'Enregistrement...' : 'Enregistrer la question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE DÉTAIL DES RÉPONSES DU CANDIDAT */}
      {showResultDetailModal && selectedCandidateResult && (
        <div className="modal-backdrop">
          <div className="modal-content modal-md">
            <div className="modal-header">
              <h2>📄 Réponses détaillées : {selectedCandidateResult.nomCandidat}</h2>
              <button className="modal-close-btn" onClick={() => setShowResultDetailModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="details-dates-box" style={{ marginBottom: '1.25rem' }}>
                <p><strong>Test :</strong> {selectedCandidateResult.nomTest}</p>
                <p>
                  <strong>Score final :</strong>{' '}
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: selectedCandidateResult.pourcentage >= 50 ? '#166534' : '#dc2626' }}>
                    {selectedCandidateResult.scoreObtenu} / {selectedCandidateResult.scoreMax} points ({selectedCandidateResult.pourcentage}%)
                  </span>
                </p>
              </div>

              {loadingAnswersDetail ? (
                <div className="loading-spinner-container">
                  <div className="spinner-sm"></div>
                  <p>Chargement des réponses du candidat...</p>
                </div>
              ) : candidateAnswersDetail.length === 0 ? (
                <div className="empty-state">
                  <p>Aucune réponse détaillée trouvée.</p>
                </div>
              ) : (
                <div className="bo-table-responsive">
                  <table className="bo-table">
                    <thead>
                      <tr>
                        <th>Question</th>
                        <th>Choix Candidat</th>
                        <th>Bonne Réponse</th>
                        <th>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidateAnswersDetail.map(ans => (
                        <tr key={ans.id}>
                          <td><strong>{ans.question}</strong></td>
                          <td>
                            <span style={{ color: ans.estCorrect ? '#166534' : '#dc2626', fontWeight: 600 }}>
                              {ans.choixSelectionne}
                            </span>
                          </td>
                          <td>
                            <span style={{ color: '#166534', fontWeight: 600 }}>
                              {ans.bonneReponse}
                            </span>
                          </td>
                          <td>
                            <strong>{ans.pointsObtenus} / {ans.pointsQuestion} pt(s)</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-linkedin-primary" onClick={() => setShowResultDetailModal(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE RÉSULTAT CORRECTION AUTOMATIQUE SOUMISSION */}
      {showCorrectionModal && correctionResult && (
        <div className="modal-backdrop">
          <div className="modal-content modal-sm" style={{ textAlign: 'center' }}>
            <div className="modal-header">
              <h2>🎉 Correction Automatique Effectuée</h2>
              <button className="modal-close-btn" onClick={() => setShowCorrectionModal(false)}>✕</button>
            </div>

            <div className="modal-body" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                {correctionResult.pourcentage >= 50 ? '🟢' : '🔴'}
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>
                {correctionResult.candidat?.prenom} {correctionResult.candidat?.nom}
              </h3>
              <p className="text-muted" style={{ margin: '0 0 1rem 0' }}>
                Poste : {correctionResult.candidat?.annonce?.nomposte || '—'}
              </p>

              <div className="details-dates-box" style={{ padding: '1rem', borderRadius: '10px' }}>
                <p style={{ margin: '0.2rem 0', fontSize: '1rem' }}>
                  Score obtenu :{' '}
                  <strong style={{ fontSize: '1.25rem', color: correctionResult.pourcentage >= 50 ? '#166534' : '#dc2626' }}>
                    {correctionResult.scoreObtenu} / {correctionResult.scoreMax} pts
                  </strong>
                </p>
                <p style={{ margin: '0.2rem 0', fontSize: '1.1rem', fontWeight: 700 }}>
                  Taux de réussite : {correctionResult.pourcentage}%
                </p>
              </div>

              <div style={{ marginTop: '1.25rem', padding: '0.75rem', backgroundColor: '#dcfce7', borderRadius: '8px', border: '1px solid #86efac', color: '#166534', fontWeight: 600, fontSize: '0.9rem' }}>
                ✅ Le statut du candidat est passé automatiquement à <strong>"QCM Terminé"</strong> !
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button
                className="btn-linkedin-primary"
                onClick={() => {
                  setShowCorrectionModal(false);
                  setActiveTab('results');
                }}
              >
                Voir la liste des résultats 📊
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QcmManagementPage;
