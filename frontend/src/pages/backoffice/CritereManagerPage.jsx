import React, { useState, useEffect } from 'react';
import {
  getCriteres,
  getTypeChamps,
  createCritere,
  updateCritere,
  deleteCritere,
  getProfils,
  getCriteresByProfil,
  addCritereToProfil,
  updateCritereProfilRegle,
  deleteCritereProfilRegle
} from '../../services/backend/referentielService';
import '../../styles/Backoffice.css';
import '../../styles/CritereManagerPage.css';

function CritereManagerPage() {
  const [activeTab, setActiveTab] = useState('rules'); // 'rules' | 'catalogue'

  // Etats catalogue des critères
  const [criteres, setCriteres] = useState([]);
  const [typeChamps, setTypeChamps] = useState([]);
  const [profils, setProfils] = useState([]);

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Modal Critère Catalogue
  const [showCritereModal, setShowCritereModal] = useState(false);
  const [editingCritere, setEditingCritere] = useState(null);
  const [critereForm, setCritereForm] = useState({ nom: '', idtypechamp: '' });

  // Formulaire Dynamique par Profil
  const [selectedProfilId, setSelectedProfilId] = useState('');
  const [profilRegles, setProfilRegles] = useState([]);
  const [loadingRegles, setLoadingRegles] = useState(false);

  // Formulaire d'ajout de règle à un profil
  const [newRegleCritereId, setNewRegleCritereId] = useState('');
  const [newRegleObligatoire, setNewRegleObligatoire] = useState(true);
  const [newRegleVarchar, setNewRegleVarchar] = useState('');
  const [newRegleDouble, setNewRegleDouble] = useState('');
  const [newRegleBool, setNewRegleBool] = useState(false);
  const [addingRegle, setAddingRegle] = useState(false);

  // Charger les données initiales
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [criteresData, typesData, profilsData] = await Promise.all([
        getCriteres(),
        getTypeChamps(),
        getProfils()
      ]);
      setCriteres(criteresData || []);
      setTypeChamps(typesData || []);
      setProfils(profilsData || []);

      if (profilsData && profilsData.length > 0) {
        setSelectedProfilId(profilsData[0].id.toString());
        loadProfilRegles(profilsData[0].id.toString());
      }
    } catch (err) {
      console.error('Erreur chargement critères :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const notify = (msg, isError = false) => {
    setNotification({ text: msg, isError });
    setTimeout(() => setNotification(null), 4000);
  };

  // Charger les règles associées au profil sélectionné
  const loadProfilRegles = async (profilId) => {
    if (!profilId) return;
    try {
      setLoadingRegles(true);
      const regles = await getCriteresByProfil(profilId);
      setProfilRegles(regles || []);
    } catch (err) {
      console.error('Erreur chargement règles du profil :', err);
      setProfilRegles([]);
    } finally {
      setLoadingRegles(false);
    }
  };

  useEffect(() => {
    if (selectedProfilId) {
      loadProfilRegles(selectedProfilId);
    }
  }, [selectedProfilId]);

  // --- CATALOGUE CRITÈRES CRUD ---
  const handleOpenCreateCritere = () => {
    setEditingCritere(null);
    setCritereForm({
      nom: '',
      idtypechamp: typeChamps[0]?.id?.toString() || ''
    });
    setShowCritereModal(true);
  };

  const handleOpenEditCritere = (critere) => {
    setEditingCritere(critere);
    setCritereForm({
      nom: critere.nom || '',
      idtypechamp: critere.typechamp?.id?.toString() || ''
    });
    setShowCritereModal(true);
  };

  const handleSubmitCritere = async (e) => {
    e.preventDefault();
    if (!critereForm.nom.trim()) return;

    try {
      if (editingCritere) {
        await updateCritere(editingCritere.id, critereForm.nom.trim(), parseInt(critereForm.idtypechamp, 10));
        notify(`Critère "${critereForm.nom}" mis à jour.`);
      } else {
        await createCritere(critereForm.nom.trim(), parseInt(critereForm.idtypechamp, 10));
        notify(`Critère "${critereForm.nom}" créé.`);
      }
      setShowCritereModal(false);
      loadInitialData();
    } catch (err) {
      notify('Erreur lors de l\'enregistrement du critère.', true);
    }
  };

  const handleDeleteCritere = async (id, nom) => {
    if (!window.confirm(`Supprimer le critère "${nom}" du catalogue ?`)) return;
    try {
      await deleteCritere(id);
      notify(`Critère "${nom}" supprimé.`);
      loadInitialData();
    } catch (err) {
      notify('Erreur lors de la suppression du critère.', true);
    }
  };

  // --- FORMULAIRES DYNAMIQUES PAR PROFIL ---
  const selectedCritereForNewRegle = criteres.find(c => c.id.toString() === newRegleCritereId);
  const selectedTypeChampLibelle = selectedCritereForNewRegle?.typechamp?.libelle?.toLowerCase() || '';

  const handleAddRegleToProfil = async (e) => {
    e.preventDefault();
    if (!selectedProfilId || !newRegleCritereId) return;

    try {
      setAddingRegle(true);
      await addCritereToProfil({
        idProfil: parseInt(selectedProfilId, 10),
        idCritere: parseInt(newRegleCritereId, 10),
        estObligatoire: newRegleObligatoire,
        valeurVarchar: newRegleVarchar.trim() || null,
        valeurDouble: newRegleDouble !== '' ? parseFloat(newRegleDouble) : null,
        valeurBool: selectedTypeChampLibelle.includes('bool') ? newRegleBool : null
      });

      notify('Critère associé au profil métier avec succès.');
      setNewRegleCritereId('');
      setNewRegleVarchar('');
      setNewRegleDouble('');
      setNewRegleBool(false);
      loadProfilRegles(selectedProfilId);
    } catch (err) {
      notify('Erreur lors de l\'association du critère au profil.', true);
    } finally {
      setAddingRegle(false);
    }
  };

  const handleToggleObligatoireRegle = async (regle) => {
    try {
      await updateCritereProfilRegle(regle.id, !regle.estobligatoire);
      notify(`Règle mise à jour (${!regle.estobligatoire ? 'Obligatoire' : 'Optionnel'}).`);
      loadProfilRegles(selectedProfilId);
    } catch (err) {
      notify('Erreur lors de la mise à jour de la règle.', true);
    }
  };

  const handleDeleteRegle = async (regleId, critereNom) => {
    if (!window.confirm(`Retirer le critère "${critereNom}" de ce profil ?`)) return;
    try {
      await deleteCritereProfilRegle(regleId);
      notify(`Critère "${critereNom}" retiré.`);
      loadProfilRegles(selectedProfilId);
    } catch (err) {
      notify('Erreur lors du retrait du critère.', true);
    }
  };

  const selectedProfilObj = profils.find(p => p.id.toString() === selectedProfilId);

  return (
    <div className="backoffice-page">
      {/* BANNIÈRE */}
      <div className="backoffice-banner">
        <div className="backoffice-banner-content">
          <h1>Formulaires Dynamiques & Critères RH</h1>
          <p>Configurez les critères d'évaluation et définissez les règles d'exigence par profil métier</p>
        </div>
      </div>

      <div className="dashboard-container">
        {notification && (
          <div className={notification.isError ? "alert-linkedin-error" : "alert-linkedin-success"}>
            {notification.text}
          </div>
        )}

        {/* ONGLETS */}
        <div className="bo-tabs-header">
          <button
            className={`bo-tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            Constructeur de Formulaires par Profil
          </button>
          <button
            className={`bo-tab-btn ${activeTab === 'catalogue' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalogue')}
          >
            Catalogue des Critères ({criteres.length})
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner"></div>
            <p>Chargement des critères...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: CONSTRUCTEUR DE FORMULAIRE PAR PROFIL */}
            {activeTab === 'rules' && (
              <div>
                {/* SÉLECTEUR DE PROFIL */}
                <div className="bo-card">
                  <div className="form-group-linkedin" style={{ maxWidth: '400px' }}>
                    <label style={{ fontSize: '1rem', fontWeight: 700 }}>
                      Choisir le profil métier à configurer :
                    </label>
                    <select
                      style={{ fontSize: '1.05rem', fontWeight: 600, padding: '0.85rem 1rem' }}
                      value={selectedProfilId}
                      onChange={(e) => setSelectedProfilId(e.target.value)}
                    >
                      {profils.map(p => (
                        <option key={p.id} value={p.id}>{p.nom}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid-2-cols">
                  {/* CRITÈRES ACTUELS DU PROFIL */}
                  <div className="bo-card">
                    <div className="bo-card-header">
                      <h3>
                        Formulaire pour :{' '}
                        <span style={{ color: '#0a66c2' }}>{selectedProfilObj?.nom}</span>
                      </h3>
                    </div>

                    {loadingRegles ? (
                      <div className="loading-spinner-container">
                        <div className="spinner-sm"></div>
                        <p>Chargement des règles...</p>
                      </div>
                    ) : profilRegles.length === 0 ? (
                      <div className="empty-state">
                        <p>Aucun critère dynamique n'est encore associé à ce profil.</p>
                      </div>
                    ) : (
                      <div className="bo-table-responsive">
                        <table className="bo-table">
                          <thead>
                            <tr>
                              <th>Critère</th>
                              <th>Type Champ</th>
                              <th>Valeur Cible</th>
                              <th>Obligatoire ?</th>
                              <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {profilRegles.map(regle => {
                              const typeLib = regle.critere?.typechamp?.libelle || 'Standard';
                              let targetValDisplay = 'Libre / Non défini';

                              if (regle.valeurdouble !== null && regle.valeurdouble !== undefined) {
                                targetValDisplay = `≥ ${regle.valeurdouble}`;
                              } else if (regle.valeurvarchar) {
                                targetValDisplay = `"${regle.valeurvarchar}"`;
                              } else if (regle.valeurbool !== null && regle.valeurbool !== undefined) {
                                targetValDisplay = regle.valeurbool ? 'Requis (Oui)' : 'Non requis';
                              }

                              return (
                                <tr key={regle.id}>
                                  <td>
                                    <strong>{regle.critere?.nom}</strong>
                                  </td>
                                  <td>
                                    <span className="badge-type">{typeLib}</span>
                                  </td>
                                  <td>
                                    <span style={{ fontWeight: 600, color: '#334155' }}>
                                      {targetValDisplay}
                                    </span>
                                  </td>
                                  <td>
                                    <button
                                      type="button"
                                      className={`btn-toggle-badge ${regle.estobligatoire ? 'is-mandatory' : 'is-optional'}`}
                                      onClick={() => handleToggleObligatoireRegle(regle)}
                                      title="Cliquer pour changer le statut d'exigence"
                                    >
                                      {regle.estobligatoire ? 'Obligatoire' : 'Optionnel'}
                                    </button>
                                  </td>
                                  <td>
                                    <div className="action-buttons-group">
                                      <button
                                        className="btn-icon btn-icon-delete"
                                        title="Retirer ce critère"
                                        onClick={() => handleDeleteRegle(regle.id, regle.critere?.nom)}
                                      >
                                        Suppr.
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

                  {/* FORMULAIRE D'AJOUT D'UN CRITÈRE */}
                  <div className="bo-card">
                    <div className="bo-card-header">
                      <h3>Ajouter un critère au profil</h3>
                    </div>

                    <form onSubmit={handleAddRegleToProfil} className="form-grid-1">
                      <div className="form-group-linkedin">
                        <label>Sélectionner le critère *</label>
                        <select
                          required
                          value={newRegleCritereId}
                          onChange={(e) => setNewRegleCritereId(e.target.value)}
                        >
                          <option value="">-- Sélectionner un critère --</option>
                          {criteres.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.nom} ({c.typechamp?.libelle || 'Standard'})
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedTypeChampLibelle.includes('nombre') && (
                        <div className="form-group-linkedin">
                          <label>Valeur cible / Seuil minimum (Nombre)</label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Ex: 3 (pour 3 ans d'expérience)"
                            value={newRegleDouble}
                            onChange={(e) => setNewRegleDouble(e.target.value)}
                          />
                        </div>
                      )}

                      {selectedTypeChampLibelle.includes('texte') && (
                        <div className="form-group-linkedin">
                          <label>Valeur cible recherchée (Texte)</label>
                          <input
                            type="text"
                            placeholder="Ex: Anglais Courant"
                            value={newRegleVarchar}
                            onChange={(e) => setNewRegleVarchar(e.target.value)}
                          />
                        </div>
                      )}

                      {selectedTypeChampLibelle.includes('bool') && (
                        <div className="form-group-linkedin">
                          <label>Valeur attendue (Booléen)</label>
                          <select
                            value={newRegleBool ? 'true' : 'false'}
                            onChange={(e) => setNewRegleBool(e.target.value === 'true')}
                          >
                            <option value="true">Oui (Obligatoire d'avoir la condition)</option>
                            <option value="false">Non (Optionnel ou non exigé)</option>
                          </select>
                        </div>
                      )}

                      <div className="form-group-linkedin">
                        <label className="checkbox-item-card checked" style={{ cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={newRegleObligatoire}
                            onChange={(e) => setNewRegleObligatoire(e.target.checked)}
                          />
                          <span>Marquer ce critère comme <strong>Obligatoire</strong> pour le candidat</span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="btn-linkedin-primary"
                        disabled={addingRegle || !newRegleCritereId}
                      >
                        {addingRegle ? 'Ajout en cours...' : 'Ajouter ce critère au profil'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CATALOGUE DES CRITÈRES */}
            {activeTab === 'catalogue' && (
              <div className="bo-card">
                <div className="bo-card-header">
                  <h3>Catalogue Général des Critères d'Évaluation</h3>
                  <button
                    className="btn-linkedin-primary"
                    style={{ width: 'auto' }}
                    onClick={handleOpenCreateCritere}
                  >
                    Nouveau Critère
                  </button>
                </div>

                <div className="bo-table-responsive">
                  <table className="bo-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>ID</th>
                        <th>Nom du Critère</th>
                        <th>Type de Champ (Saisie candidat)</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {criteres.map(c => (
                        <tr key={c.id}>
                          <td><strong>#{c.id}</strong></td>
                          <td><strong>{c.nom}</strong></td>
                          <td>
                            <span className="badge-type">
                              {c.typechamp ? c.typechamp.libelle : 'Texte'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons-group">
                              <button
                                className="btn-icon btn-icon-edit"
                                title="Modifier"
                                onClick={() => handleOpenEditCritere(c)}
                              >
                                Éditer
                              </button>
                              <button
                                className="btn-icon btn-icon-delete"
                                title="Supprimer"
                                onClick={() => handleDeleteCritere(c.id, c.nom)}
                              >
                                Suppr.
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODALE CATALOGUE CRITÈRE (CRÉATION / ÉDITION) */}
      {showCritereModal && (
        <div className="modal-backdrop">
          <div className="modal-content modal-sm">
            <div className="modal-header">
              <h2>{editingCritere ? 'Modifier le critère' : 'Nouveau Critère'}</h2>
              <button className="modal-close-btn" onClick={() => setShowCritereModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmitCritere} className="modal-body form-grid-1">
              <div className="form-group-linkedin">
                <label>Nom du critère *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Permis B, Années d'expérience..."
                  value={critereForm.nom}
                  onChange={(e) => setCritereForm({ ...critereForm, nom: e.target.value })}
                />
              </div>

              <div className="form-group-linkedin">
                <label>Type de champ pour la saisie *</label>
                <select
                  required
                  value={critereForm.idtypechamp}
                  onChange={(e) => setCritereForm({ ...critereForm, idtypechamp: e.target.value })}
                >
                  {typeChamps.map(tc => (
                    <option key={tc.id} value={tc.id}>{tc.libelle}</option>
                  ))}
                </select>
              </div>

              <div className="modal-footer" style={{ padding: '1rem 0 0 0', border: 'none', backgroundColor: 'transparent' }}>
                <button
                  type="button"
                  className="btn-linkedin-secondary"
                  onClick={() => setShowCritereModal(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-linkedin-primary" style={{ width: 'auto' }}>
                  {editingCritere ? 'Mettre à jour' : 'Créer le critère'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CritereManagerPage;
