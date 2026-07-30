import React, { useState, useEffect } from 'react';
import {
  getDepartements,
  createDepartement,
  updateDepartement,
  deleteDepartement,
  getProfils,
  createProfil,
  updateProfil,
  deleteProfil,
  getDiplomes,
  createDiplome,
  updateDiplome,
  deleteDiplome,
  getDiplomesByProfil,
  setDiplomesForProfil
} from '../../services/backend/referentielService';
import '../../styles/Backoffice.css';
import '../../styles/ReferentielsPage.css';

function ReferentielsPage() {
  const [activeTab, setActiveTab] = useState('departements'); // 'departements' | 'profils' | 'diplomes'

  // Etats des données
  const [departements, setDepartements] = useState([]);
  const [profils, setProfils] = useState([]);
  const [diplomes, setDiplomes] = useState([]);

  // Etats de chargement et retours
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Etats d'édition / création simple (Modal / Formulaire)
  const [modalType, setModalType] = useState(null); // 'DEPT' | 'PROFIL' | 'DIPLOME' | null
  const [editingItem, setEditingItem] = useState(null);
  const [formName, setFormName] = useState('');

  // Gestion de l'association des diplômes exigés à un profil
  const [selectedProfilForDiplomes, setSelectedProfilForDiplomes] = useState(null);
  const [selectedDiplomeIds, setSelectedDiplomeIds] = useState([]);
  const [savingDiplomes, setSavingDiplomes] = useState(false);

  // Charger toutes les données
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [deptData, profilsData, diplomesData] = await Promise.all([
        getDepartements(),
        getProfils(),
        getDiplomes()
      ]);
      setDepartements(deptData || []);
      setProfils(profilsData || []);
      setDiplomes(diplomesData || []);

      if (profilsData && profilsData.length > 0 && !selectedProfilForDiplomes) {
        handleSelectProfilForDiplomes(profilsData[0]);
      }
    } catch (err) {
      console.error('Erreur chargement des référentiels :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const notify = (msg, isError = false) => {
    setNotification({ text: msg, isError });
    setTimeout(() => setNotification(null), 4000);
  };

  // --- DÉPARTEMENTS ---
  const handleSaveDepartement = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      if (editingItem) {
        await updateDepartement(editingItem.id, formName.trim());
        notify(`Département "${formName}" mis à jour.`);
      } else {
        await createDepartement(formName.trim());
        notify(`Département "${formName}" créé.`);
      }
      setModalType(null);
      loadAllData();
    } catch (err) {
      notify('Erreur lors de l\'enregistrement du département.', true);
    }
  };

  const handleDeleteDepartement = async (id, nom) => {
    if (!window.confirm(`Supprimer le département "${nom}" ?`)) return;
    try {
      await deleteDepartement(id);
      notify(`Département "${nom}" supprimé.`);
      loadAllData();
    } catch (err) {
      notify('Erreur lors de la suppression.', true);
    }
  };

  // --- PROFILS ---
  const handleSaveProfil = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      if (editingItem) {
        await updateProfil(editingItem.id, formName.trim());
        notify(`Profil "${formName}" mis à jour.`);
      } else {
        await createProfil(formName.trim());
        notify(`Profil "${formName}" créé.`);
      }
      setModalType(null);
      loadAllData();
    } catch (err) {
      notify('Erreur lors de l\'enregistrement du profil.', true);
    }
  };

  const handleDeleteProfil = async (id, nom) => {
    if (!window.confirm(`Supprimer le profil "${nom}" ?`)) return;
    try {
      await deleteProfil(id);
      notify(`Profil "${nom}" supprimé.`);
      if (selectedProfilForDiplomes?.id === id) {
        setSelectedProfilForDiplomes(null);
      }
      loadAllData();
    } catch (err) {
      notify('Erreur lors de la suppression.', true);
    }
  };

  // --- DIPLÔMES ---
  const handleSaveDiplome = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      if (editingItem) {
        await updateDiplome(editingItem.id, formName.trim());
        notify(`Diplôme "${formName}" mis à jour.`);
      } else {
        await createDiplome(formName.trim());
        notify(`Diplôme "${formName}" créé.`);
      }
      setModalType(null);
      loadAllData();
    } catch (err) {
      notify('Erreur lors de l\'enregistrement du diplôme.', true);
    }
  };

  const handleDeleteDiplome = async (id, nom) => {
    if (!window.confirm(`Supprimer le diplôme "${nom}" ?`)) return;
    try {
      await deleteDiplome(id);
      notify(`Diplôme "${nom}" supprimé.`);
      loadAllData();
    } catch (err) {
      notify('Erreur lors de la suppression.', true);
    }
  };

  // --- GESTION DES DIPLÔMES EXIGÉS PAR PROFIL ---
  const handleSelectProfilForDiplomes = async (profil) => {
    setSelectedProfilForDiplomes(profil);
    try {
      const existingDiplomes = await getDiplomesByProfil(profil.id);
      const ids = (existingDiplomes || []).map(d => d.id);
      setSelectedDiplomeIds(ids);
    } catch (err) {
      console.error('Erreur chargement diplômes du profil :', err);
      setSelectedDiplomeIds([]);
    }
  };

  const handleToggleDiplomeCheckbox = (diplomeId) => {
    setSelectedDiplomeIds(prev => {
      if (prev.includes(diplomeId)) {
        return prev.filter(id => id !== diplomeId);
      } else {
        return [...prev, diplomeId];
      }
    });
  };

  const handleSaveProfilDiplomes = async () => {
    if (!selectedProfilForDiplomes) return;
    try {
      setSavingDiplomes(true);
      await setDiplomesForProfil(selectedProfilForDiplomes.id, selectedDiplomeIds);
      notify(`Diplômes exigés enregistrés pour le profil "${selectedProfilForDiplomes.nom}".`);
    } catch (err) {
      notify('Erreur lors de l\'enregistrement des diplômes exigés.', true);
    } finally {
      setSavingDiplomes(false);
    }
  };

  return (
    <div className="backoffice-page">
      {/* BANNIÈRE */}
      <div className="backoffice-banner">
        <div className="backoffice-banner-content">
          <h1>Référentiels Métiers & Structure</h1>
          <p>Gérez les départements, les profils métiers et les diplômes exigés pour l'entreprise</p>
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
            className={`bo-tab-btn ${activeTab === 'departements' ? 'active' : ''}`}
            onClick={() => setActiveTab('departements')}
          >
            Départements ({departements.length})
          </button>
          <button
            className={`bo-tab-btn ${activeTab === 'profils' ? 'active' : ''}`}
            onClick={() => setActiveTab('profils')}
          >
            Profils & Diplômes ({profils.length})
          </button>
          <button
            className={`bo-tab-btn ${activeTab === 'diplomes' ? 'active' : ''}`}
            onClick={() => setActiveTab('diplomes')}
          >
            Catalogue des Diplômes ({diplomes.length})
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner"></div>
            <p>Chargement des référentiels...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: DÉPARTEMENTS */}
            {activeTab === 'departements' && (
              <div className="bo-card">
                <div className="bo-card-header">
                  <h3>Liste des Départements</h3>
                  <button
                    className="btn-linkedin-primary"
                    style={{ width: 'auto' }}
                    onClick={() => {
                      setEditingItem(null);
                      setFormName('');
                      setModalType('DEPT');
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '5px' }}>
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Nouveau Département
                  </button>
                </div>

                <div className="bo-table-responsive">
                  <table className="bo-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>ID</th>
                        <th>Nom du Département</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departements.map(d => (
                        <tr key={d.id}>
                          <td><strong>#{d.id}</strong></td>
                          <td>{d.nom}</td>
                          <td>
                            <div className="action-buttons-group">
                              <button
                                className="btn-icon btn-icon-edit"
                                title="Modifier"
                                onClick={() => {
                                  setEditingItem(d);
                                  setFormName(d.nom);
                                  setModalType('DEPT');
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                <span>Éditer</span>
                              </button>
                              <button
                                className="btn-icon btn-icon-delete"
                                title="Supprimer"
                                onClick={() => handleDeleteDepartement(d.id, d.nom)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                <span>Suppr.</span>
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

            {/* TAB 2: PROFILS & DIPLÔMES EXIGÉS */}
            {activeTab === 'profils' && (
              <div className="grid-2-cols">
                {/* COLONNE GAUCHE: LISTE DES PROFILS */}
                <div className="bo-card">
                  <div className="bo-card-header">
                    <h3>Profils Métiers</h3>
                    <button
                      className="btn-linkedin-primary"
                      style={{ width: 'auto' }}
                      onClick={() => {
                        setEditingItem(null);
                        setFormName('');
                        setModalType('PROFIL');
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '5px' }}>
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Nouveau Profil
                    </button>
                  </div>

                  <div className="bo-table-responsive">
                    <table className="bo-table">
                      <thead>
                        <tr>
                          <th>Nom du Profil</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profils.map(p => {
                          const isSelected = selectedProfilForDiplomes?.id === p.id;
                          return (
                            <tr
                              key={p.id}
                              style={{ backgroundColor: isSelected ? '#eff6ff' : 'transparent', cursor: 'pointer' }}
                              onClick={() => handleSelectProfilForDiplomes(p)}
                            >
                              <td>
                                <strong>{p.nom}</strong>
                                {isSelected && <span className="active-tag-sm"> (Sélectionné)</span>}
                              </td>
                              <td onClick={(e) => e.stopPropagation()}>
                                <div className="action-buttons-group">
                                  <button
                                    className="btn-icon btn-icon-edit"
                                    title="Modifier"
                                    onClick={() => {
                                      setEditingItem(p);
                                      setFormName(p.nom);
                                      setModalType('PROFIL');
                                    }}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                    <span>Éditer</span>
                                  </button>
                                  <button
                                    className="btn-icon btn-icon-delete"
                                    title="Supprimer"
                                    onClick={() => handleDeleteProfil(p.id, p.nom)}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="3 6 5 6 21 6"></polyline>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                    <span>Suppr.</span>
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

                {/* COLONNE DROITE: DIPLÔMES EXIGÉS POUR LE PROFIL SÉLECTIONNÉ */}
                <div className="bo-card">
                  <div className="bo-card-header">
                    <h3>
                      Diplômes exigés pour :{' '}
                      <span style={{ color: 'var(--dolibarr-primary)' }}>
                        {selectedProfilForDiplomes ? selectedProfilForDiplomes.nom : 'Aucun profil sélectionné'}
                      </span>
                    </h3>
                  </div>

                  {!selectedProfilForDiplomes ? (
                    <div className="empty-state">
                      <p>Cliquez sur un profil métier dans la liste de gauche pour configurer ses diplômes exigés.</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                        Cochez tous les diplômes acceptés ou requis pour pouvoir postuler à ce profil :
                      </p>

                      <div className="checkboxes-list">
                        {diplomes.map(d => {
                          const checked = selectedDiplomeIds.includes(d.id);
                          return (
                            <label key={d.id} className={`checkbox-item-card ${checked ? 'checked' : ''}`}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleToggleDiplomeCheckbox(d.id)}
                              />
                              <span>{d.nom}</span>
                            </label>
                          );
                        })}
                      </div>

                      <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                        <button
                          className="btn-linkedin-primary"
                          style={{ width: 'auto' }}
                          onClick={handleSaveProfilDiplomes}
                          disabled={savingDiplomes}
                        >
                          {savingDiplomes ? 'Enregistrement...' : 'Enregistrer les diplômes exigés'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: DIPLÔMES */}
            {activeTab === 'diplomes' && (
              <div className="bo-card">
                <div className="bo-card-header">
                  <h3>Catalogue des Diplômes Reconnus</h3>
                  <button
                    className="btn-linkedin-primary"
                    style={{ width: 'auto' }}
                    onClick={() => {
                      setEditingItem(null);
                      setFormName('');
                      setModalType('DIPLOME');
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '5px' }}>
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Nouveau Diplôme
                  </button>
                </div>

                <div className="bo-table-responsive">
                  <table className="bo-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>ID</th>
                        <th>Intitulé du Diplôme</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diplomes.map(d => (
                        <tr key={d.id}>
                          <td><strong>#{d.id}</strong></td>
                          <td>{d.nom}</td>
                          <td>
                            <div className="action-buttons-group">
                              <button
                                className="btn-icon btn-icon-edit"
                                title="Modifier"
                                onClick={() => {
                                  setEditingItem(d);
                                  setFormName(d.nom);
                                  setModalType('DIPLOME');
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                <span>Éditer</span>
                              </button>
                              <button
                                className="btn-icon btn-icon-delete"
                                title="Supprimer"
                                onClick={() => handleDeleteDiplome(d.id, d.nom)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                <span>Suppr.</span>
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

      {/* MODALE D'ÉDITION / CRÉATION UNIQUE */}
      {modalType && (
        <div className="modal-backdrop">
          <div className="modal-content modal-sm">
            <div className="modal-header">
              <h2>
                {editingItem ? 'Modifier' : 'Ajouter'}{' '}
                {modalType === 'DEPT' ? 'un département' : modalType === 'PROFIL' ? 'un profil métier' : 'un diplôme'}
              </h2>
              <button className="modal-close-btn" onClick={() => setModalType(null)}>✕</button>
            </div>

            <form
              onSubmit={
                modalType === 'DEPT'
                  ? handleSaveDepartement
                  : modalType === 'PROFIL'
                  ? handleSaveProfil
                  : handleSaveDiplome
              }
              className="modal-body"
            >
              <div className="form-group-linkedin">
                <label>Nom / Intitulé *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Saisissez le nom..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div className="modal-footer" style={{ padding: '1rem 0 0 0', border: 'none', backgroundColor: 'transparent' }}>
                <button
                  type="button"
                  className="btn-linkedin-secondary"
                  onClick={() => setModalType(null)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-linkedin-primary" style={{ width: 'auto' }}>
                  {editingItem ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReferentielsPage;
