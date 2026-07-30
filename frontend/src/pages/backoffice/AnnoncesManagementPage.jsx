import React, { useState, useEffect, useMemo } from 'react';
import {
  getAllAnnonces,
  getDepartements,
  getProfils,
  getTypesAnnonce,
  createAnnonce,
  updateAnnonce,
  deleteAnnonce,
  getCriteresByAnnonceId,
  getDiplomesExigesByAnnonceId
} from '../../services/backend/annonceService';
import '../../styles/Backoffice.css';
import '../../styles/AnnoncesManagementPage.css';

function AnnoncesManagementPage() {
  // Etats des données
  const [annonces, setAnnonces] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [profils, setProfils] = useState([]);
  const [typesAnnonce, setTypesAnnonce] = useState([]);

  // Etats de chargement et erreurs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Etats de recherche et filtres
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedProfil, setSelectedProfil] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('');

  // Etats des modales
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAnnonce, setEditingAnnonce] = useState(null); // null = mode création
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsAnnonce, setDetailsAnnonce] = useState(null);
  const [detailsCriteres, setDetailsCriteres] = useState([]);
  const [detailsDiplomes, setDetailsDiplomes] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAnnonce, setDeletingAnnonce] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Formulaire state
  const [formData, setFormData] = useState({
    nomposte: '',
    description: '',
    datedebut: '',
    datefin: '',
    datepublication: new Date().toISOString().split('T')[0],
    iddepartement: '',
    idprofil: '',
    idtypeannonce: ''
  });

  // Charger les données initiales
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [annoncesData, deptsData, profilsData, typesData] = await Promise.all([
        getAllAnnonces(),
        getDepartements(),
        getProfils(),
        getTypesAnnonce()
      ]);
      setAnnonces(annoncesData || []);
      setDepartements(deptsData || []);
      setProfils(profilsData || []);
      setTypesAnnonce(typesData || []);
    } catch (err) {
      console.error('Erreur chargement des annonces :', err);
      setError('Impossible de charger la liste des annonces backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const notifySuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Calcul du statut d'une annonce
  const getAnnonceStatus = (annonce) => {
    const today = new Date().toISOString().split('T')[0];
    if (annonce.datedebut && annonce.datedebut > today) {
      return { label: 'À venir', css: 'badge-status-upcoming' };
    }
    if (annonce.datefin && annonce.datefin < today) {
      return { label: 'Expirée', css: 'badge-status-expired' };
    }
    return { label: 'Active', css: 'badge-status-active' };
  };

  // Filtrage combiné des annonces
  const filteredAnnonces = useMemo(() => {
    return annonces.filter(a => {
      // 1. Recherche mots-clés
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchTitle = a.nomposte?.toLowerCase().includes(kw);
        const matchDesc = a.description?.toLowerCase().includes(kw);
        if (!matchTitle && !matchDesc) return false;
      }
      // 2. Filtre Département
      if (selectedDept && a.departement?.id?.toString() !== selectedDept) {
        return false;
      }
      // 3. Filtre Profil
      if (selectedProfil && a.profil?.id?.toString() !== selectedProfil) {
        return false;
      }
      // 4. Filtre Type d'annonce
      if (selectedType && a.typeannonce?.id?.toString() !== selectedType) {
        return false;
      }
      // 5. Filtre Statut
      if (selectedStatut) {
        const statusObj = getAnnonceStatus(a);
        if (selectedStatut === 'ACTIVE' && statusObj.label !== 'Active') return false;
        if (selectedStatut === 'UPCOMING' && statusObj.label !== 'À venir') return false;
        if (selectedStatut === 'EXPIRED' && statusObj.label !== 'Expirée') return false;
      }
      return true;
    });
  }, [annonces, searchKeyword, selectedDept, selectedProfil, selectedType, selectedStatut]);

  // Statistiques calculées
  const stats = useMemo(() => {
    let active = 0, upcoming = 0, expired = 0;
    annonces.forEach(a => {
      const st = getAnnonceStatus(a);
      if (st.label === 'Active') active++;
      else if (st.label === 'À venir') upcoming++;
      else if (st.label === 'Expirée') expired++;
    });
    return { total: annonces.length, active, upcoming, expired };
  }, [annonces]);

  // Ouverture modale Création
  const handleOpenCreateModal = () => {
    setEditingAnnonce(null);
    setFormData({
      nomposte: '',
      description: '',
      datedebut: '',
      datefin: '',
      datepublication: new Date().toISOString().split('T')[0],
      iddepartement: departements[0]?.id?.toString() || '',
      idprofil: profils[0]?.id?.toString() || '',
      idtypeannonce: typesAnnonce[0]?.id?.toString() || ''
    });
    setShowFormModal(true);
  };

  // Ouverture modale Édition
  const handleOpenEditModal = (annonce) => {
    setEditingAnnonce(annonce);
    setFormData({
      nomposte: annonce.nomposte || '',
      description: annonce.description || '',
      datedebut: annonce.datedebut || '',
      datefin: annonce.datefin || '',
      datepublication: annonce.datepublication || new Date().toISOString().split('T')[0],
      iddepartement: annonce.departement?.id?.toString() || '',
      idprofil: annonce.profil?.id?.toString() || '',
      idtypeannonce: annonce.typeannonce?.id?.toString() || ''
    });
    setShowFormModal(true);
  };

  // Soumission Formulaire (Créer / Modifier)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.nomposte.trim()) return;

    const payload = {
      nomposte: formData.nomposte.trim(),
      description: formData.description.trim(),
      datedebut: formData.datedebut || null,
      datefin: formData.datefin || null,
      datepublication: formData.datepublication || null,
      departement: formData.iddepartement ? { id: parseInt(formData.iddepartement, 10) } : null,
      profil: formData.idprofil ? { id: parseInt(formData.idprofil, 10) } : null,
      typeannonce: formData.idtypeannonce ? { id: parseInt(formData.idtypeannonce, 10) } : null
    };

    try {
      setActionLoading(true);
      if (editingAnnonce) {
        await updateAnnonce(editingAnnonce.id, payload);
        notifySuccess(`L'annonce "${formData.nomposte}" a bien été mise à jour.`);
      } else {
        await createAnnonce(payload);
        notifySuccess(`La nouvelle annonce "${formData.nomposte}" a été créée avec succès.`);
      }
      setShowFormModal(false);
      loadData();
    } catch (err) {
      console.error('Erreur enregistrement annonce :', err);
      alert('Une erreur est survenue lors de l\'enregistrement de l\'annonce.');
    } finally {
      setActionLoading(false);
    }
  };

  // Ouverture modale Détails
  const handleOpenDetailsModal = async (annonce) => {
    setDetailsAnnonce(annonce);
    setShowDetailsModal(true);
    setLoadingDetails(true);
    setDetailsCriteres([]);
    setDetailsDiplomes([]);

    try {
      const [criteres, diplomes] = await Promise.all([
        getCriteresByAnnonceId(annonce.id),
        getDiplomesExigesByAnnonceId(annonce.id)
      ]);
      setDetailsCriteres(criteres || []);
      setDetailsDiplomes(diplomes || []);
    } catch (err) {
      console.error('Erreur chargement détails annonce :', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Confirmation Suppression
  const handleOpenDeleteModal = (annonce) => {
    setDeletingAnnonce(annonce);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingAnnonce) return;
    try {
      setActionLoading(true);
      await deleteAnnonce(deletingAnnonce.id);
      notifySuccess(`L'annonce "${deletingAnnonce.nomposte}" a été supprimée.`);
      setShowDeleteModal(false);
      setDeletingAnnonce(null);
      loadData();
    } catch (err) {
      console.error('Erreur lors de la suppression :', err);
      alert('Une erreur est survenue lors de la suppression de l\'annonce.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="backoffice-page">
      {/* BANNIÈRE EN-TÊTE */}
      <div className="backoffice-banner">
        <div className="backoffice-banner-content flex-between">
          <div>
            <h1>Gestion des Annonces</h1>
            <p>Créez, modifiez et gérez les offres d'emploi diffusées pour l'entreprise</p>
          </div>
          <button className="btn-linkedin-action-header" onClick={handleOpenCreateModal}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Nouvelle Annonce</span>
          </button>
        </div>
      </div>

      <div className="dashboard-container">
        {/* MESSAGES DE SUCCÈS OU D'ERREUR */}
        {successMessage && (
          <div className="alert-linkedin-success">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="alert-linkedin-error">
            {error}
          </div>
        )}

        {/* CARTES DE STATISTIQUES */}
        <div className="stats-grid">
          <div className="stat-card-linkedin">
            <div className="stat-info">
              <h4>Total des annonces</h4>
              <p className="stat-value">{stats.total}</p>
            </div>
          </div>

          <div className="stat-card-linkedin">
            <div className="stat-info">
              <h4>Annonces actives</h4>
              <p className="stat-value">{stats.active}</p>
            </div>
          </div>

          <div className="stat-card-linkedin">
            <div className="stat-info">
              <h4>À venir</h4>
              <p className="stat-value">{stats.upcoming}</p>
            </div>
          </div>

          <div className="stat-card-linkedin">
            <div className="stat-info">
              <h4>Expirées</h4>
              <p className="stat-value">{stats.expired}</p>
            </div>
          </div>
        </div>

        {/* BARRE DE RECHERCHE ET FILTRES */}
        <div className="bo-card bo-filters-card">
          <div className="bo-filters-grid">
            <div className="form-group-linkedin search-input-group">
              <label>Recherche</label>
              <input
                type="text"
                placeholder="Titre du poste, mots-clés..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>

            <div className="form-group-linkedin">
              <label>Département</label>
              <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                <option value="">Tous les départements</option>
                {departements.map(d => (
                  <option key={d.id} value={d.id}>{d.nom}</option>
                ))}
              </select>
            </div>

            <div className="form-group-linkedin">
              <label>Profil requis</label>
              <select value={selectedProfil} onChange={(e) => setSelectedProfil(e.target.value)}>
                <option value="">Tous les profils</option>
                {profils.map(p => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
            </div>

            <div className="form-group-linkedin">
              <label>Type d'annonce</label>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <option value="">Tous les types</option>
                {typesAnnonce.map(t => (
                  <option key={t.id} value={t.id}>{t.libelle}</option>
                ))}
              </select>
            </div>

            <div className="form-group-linkedin">
              <label>Statut</label>
              <select value={selectedStatut} onChange={(e) => setSelectedStatut(e.target.value)}>
                <option value="">Tous les statuts</option>
                <option value="ACTIVE">Actives</option>
                <option value="UPCOMING">À venir</option>
                <option value="EXPIRED">Expirées</option>
              </select>
            </div>
          </div>

          {(searchKeyword || selectedDept || selectedProfil || selectedType || selectedStatut) && (
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <button
                className="btn-linkedin-secondary-sm btn-reset-filters"
                onClick={() => {
                  setSearchKeyword('');
                  setSelectedDept('');
                  setSelectedProfil('');
                  setSelectedType('');
                  setSelectedStatut('');
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
                <span>Réinitialiser les filtres</span>
              </button>
            </div>
          )}
        </div>

        {/* TABLEAU DES ANNONCES */}
        <div className="bo-card">
          <div className="bo-card-header">
            <h3>Liste des Offres d'Emploi ({filteredAnnonces.length})</h3>
          </div>

          {loading ? (
            <div className="loading-spinner-container">
              <div className="spinner"></div>
              <p>Chargement des annonces en cours...</p>
            </div>
          ) : filteredAnnonces.length === 0 ? (
            <div className="empty-state">
              <p>Aucune annonce ne correspond à vos critères.</p>
            </div>
          ) : (
            <div className="bo-table-responsive">
              <table className="bo-table">
                <thead>
                  <tr>
                    <th>Intitulé du poste</th>
                    <th>Département</th>
                    <th>Profil</th>
                    <th>Type</th>
                    <th>Publication</th>
                    <th>Période d'activité</th>
                    <th>Statut</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnnonces.map(annonce => {
                    const status = getAnnonceStatus(annonce);
                    return (
                      <tr key={annonce.id}>
                        <td>
                          <strong className="poste-title">{annonce.nomposte}</strong>
                          {annonce.description && (
                            <p className="poste-desc-preview">
                              {annonce.description.substring(0, 75)}
                              {annonce.description.length > 75 ? '...' : ''}
                            </p>
                          )}
                        </td>
                        <td>{annonce.departement ? annonce.departement.nom : '—'}</td>
                        <td>{annonce.profil ? annonce.profil.nom : '—'}</td>
                        <td>
                          <span className="badge-type">
                            {annonce.typeannonce ? annonce.typeannonce.libelle : 'Standard'}
                          </span>
                        </td>
                        <td>{annonce.datepublication || '—'}</td>
                        <td>
                          {annonce.datedebut ? (
                            <span style={{ fontSize: '0.85rem' }}>
                              Du {annonce.datedebut} {annonce.datefin ? `au ${annonce.datefin}` : ''}
                            </span>
                          ) : 'Non précisée'}
                        </td>
                        <td>
                          <span className={`status-pill ${status.css}`}>
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons-group">
                            <button
                              className="btn-icon btn-icon-view"
                              title="Voir les détails de l'annonce"
                              onClick={() => handleOpenDetailsModal(annonce)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                              <span>Détails</span>
                            </button>
                            <button
                              className="btn-icon btn-icon-edit"
                              title="Modifier l'annonce"
                              onClick={() => handleOpenEditModal(annonce)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                              <span>Éditer</span>
                            </button>
                            <button
                              className="btn-icon btn-icon-delete"
                              title="Supprimer l'annonce"
                              onClick={() => handleOpenDeleteModal(annonce)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          )}
        </div>
      </div>

      {/* MODALE FORMULAIRE (CRÉATION / ÉDITION) */}
      {showFormModal && (
        <div className="modal-backdrop">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <div className="details-title-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ab4d6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <h2>{editingAnnonce ? `Modifier l'annonce : ${editingAnnonce.nomposte}` : 'Créer une nouvelle annonce'}</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setShowFormModal(false)} aria-label="Fermer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="modal-body form-grid-2">
              <div className="form-group-linkedin full-width">
                <label>Nom du poste *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Développeur Fullstack Java / React"
                  value={formData.nomposte}
                  onChange={(e) => setFormData({ ...formData, nomposte: e.target.value })}
                />
              </div>

              <div className="form-group-linkedin">
                <label>Département</label>
                <select
                  value={formData.iddepartement}
                  onChange={(e) => setFormData({ ...formData, iddepartement: e.target.value })}
                >
                  <option value="">Sélectionnez un département</option>
                  {departements.map(d => (
                    <option key={d.id} value={d.id}>{d.nom}</option>
                  ))}
                </select>
              </div>

              <div className="form-group-linkedin">
                <label>Profil Requis</label>
                <select
                  value={formData.idprofil}
                  onChange={(e) => setFormData({ ...formData, idprofil: e.target.value })}
                >
                  <option value="">Sélectionnez un profil</option>
                  {profils.map(p => (
                    <option key={p.id} value={p.id}>{p.nom}</option>
                  ))}
                </select>
              </div>

              <div className="form-group-linkedin">
                <label>Type d'annonce</label>
                <select
                  value={formData.idtypeannonce}
                  onChange={(e) => setFormData({ ...formData, idtypeannonce: e.target.value })}
                >
                  <option value="">Sélectionnez un type</option>
                  {typesAnnonce.map(t => (
                    <option key={t.id} value={t.id}>{t.libelle}</option>
                  ))}
                </select>
              </div>

              <div className="form-group-linkedin">
                <label>Date de publication</label>
                <input
                  type="date"
                  value={formData.datepublication}
                  onChange={(e) => setFormData({ ...formData, datepublication: e.target.value })}
                />
              </div>

              <div className="form-group-linkedin">
                <label>Date de début</label>
                <input
                  type="date"
                  value={formData.datedebut}
                  onChange={(e) => setFormData({ ...formData, datedebut: e.target.value })}
                />
              </div>

              <div className="form-group-linkedin">
                <label>Date de fin (Limite de candidature)</label>
                <input
                  type="date"
                  value={formData.datefin}
                  onChange={(e) => setFormData({ ...formData, datefin: e.target.value })}
                />
              </div>

              <div className="form-group-linkedin full-width">
                <label>Description détaillée du poste</label>
                <textarea
                  rows={6}
                  placeholder="Responsabilités, missions principales, compétences recherchées, conditions de travail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="modal-footer full-width">
                <button
                  type="button"
                  className="btn-linkedin-secondary"
                  onClick={() => setShowFormModal(false)}
                  disabled={actionLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-linkedin-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Enregistrement...' : (editingAnnonce ? 'Mettre à jour' : 'Publier l\'annonce')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE DÉTAILS D'UNE ANNONCE */}
      {showDetailsModal && detailsAnnonce && (
        <div className="modal-backdrop">
          <div className="modal-content modal-md details-modal-content">
            <div className="modal-header">
              <div className="details-title-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a66c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                <h2>{detailsAnnonce.nomposte}</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setShowDetailsModal(false)} aria-label="Fermer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="modal-body details-body">
              {/* Statut & Badges principaux */}
              <div className="details-header-badges">
                {(() => {
                  const status = getAnnonceStatus(detailsAnnonce);
                  return (
                    <span className={`status-pill ${status.css}`}>
                      {status.label}
                    </span>
                  );
                })()}
                {detailsAnnonce.departement && (
                  <span className="badge-dept">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                      <line x1="9" y1="6" x2="9" y2="6.01"></line>
                      <line x1="15" y1="6" x2="15" y2="6.01"></line>
                      <line x1="9" y1="10" x2="9" y2="10.01"></line>
                      <line x1="15" y1="10" x2="15" y2="10.01"></line>
                      <line x1="9" y1="14" x2="9" y2="14.01"></line>
                      <line x1="15" y1="14" x2="15" y2="14.01"></line>
                      <line x1="9" y1="18" x2="15" y2="18"></line>
                    </svg>
                    {detailsAnnonce.departement.nom}
                  </span>
                )}
                {detailsAnnonce.profil && (
                  <span className="badge-profil">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    {detailsAnnonce.profil.nom}
                  </span>
                )}
                {detailsAnnonce.typeannonce && (
                  <span className="badge-type-pill">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="4" y1="9" x2="20" y2="9"></line>
                      <line x1="4" y1="15" x2="20" y2="15"></line>
                      <line x1="10" y1="3" x2="8" y2="21"></line>
                      <line x1="16" y1="3" x2="14" y2="21"></line>
                    </svg>
                    {detailsAnnonce.typeannonce.libelle}
                  </span>
                )}
              </div>

              {/* Grid des dates importantes */}
              <div className="details-dates-grid">
                <div className="date-card">
                  <div className="date-icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  <div className="date-info">
                    <span className="date-label">Publication</span>
                    <strong className="date-value">{detailsAnnonce.datepublication || 'Non précisée'}</strong>
                  </div>
                </div>

                <div className="date-card">
                  <div className="date-icon-box green">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div className="date-info">
                    <span className="date-label">Début de candidature</span>
                    <strong className="date-value">{detailsAnnonce.datedebut || 'Immédaiate'}</strong>
                  </div>
                </div>

                <div className="date-card">
                  <div className="date-icon-box orange">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                      <path d="M8 14h.01"></path>
                      <path d="M12 14h.01"></path>
                      <path d="M16 14h.01"></path>
                    </svg>
                  </div>
                  <div className="date-info">
                    <span className="date-label">Limite de candidature</span>
                    <strong className="date-value">{detailsAnnonce.datefin || 'Illimitée'}</strong>
                  </div>
                </div>
              </div>

              {/* Description de l'offre */}
              <div className="details-section">
                <div className="details-section-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                  <h4>Description du poste</h4>
                </div>
                <div className="details-desc-box">
                  {detailsAnnonce.description ? detailsAnnonce.description : <em className="text-muted">Aucune description fournie pour cette offre.</em>}
                </div>
              </div>

              {/* Critères et Diplômes */}
              {loadingDetails ? (
                <div className="loading-spinner-container">
                  <div className="spinner-sm"></div>
                  <p>Chargement des critères et diplômes exigés...</p>
                </div>
              ) : (
                <div className="details-grid-2">
                  <div className="details-section">
                    <div className="details-section-title">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                      </svg>
                      <h4>Critères exigés</h4>
                    </div>
                    {detailsCriteres.length === 0 ? (
                      <div className="empty-details-card">Aucun critère configuré.</div>
                    ) : (
                      <div className="criteres-chip-list">
                        {detailsCriteres.map(c => (
                          <div key={c.id} className="critere-chip-item">
                            <div className="critere-name">
                              <strong>{c.critere?.nom || 'Critère'}</strong>
                              {c.estobligatoire && (
                                <span className="tag-obligatoire">
                                  ★ Obligatoire
                                </span>
                              )}
                            </div>
                            <div className="critere-value">
                              {c.valeurvarchar || c.valeurdouble || (c.valeurbool !== null ? (c.valeurbool ? 'Oui' : 'Non') : 'Non spécifié')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="details-section">
                    <div className="details-section-title">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                      </svg>
                      <h4>Diplômes requis</h4>
                    </div>
                    {detailsDiplomes.length === 0 ? (
                      <div className="empty-details-card">Aucun diplôme spécifique requis.</div>
                    ) : (
                      <div className="diplomes-chip-list">
                        {detailsDiplomes.map(d => (
                          <div key={d.id} className="diplome-chip-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a66c2" strokeWidth="2">
                              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                            </svg>
                            <span>{d.diplome?.nom || 'Diplôme non spécifié'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-linkedin-secondary" onClick={() => setShowDetailsModal(false)}>
                Fermer
              </button>
              <button
                className="btn-linkedin-primary"
                onClick={() => {
                  setShowDetailsModal(false);
                  handleOpenEditModal(detailsAnnonce);
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <span>Modifier cette annonce</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE CONFIRMATION DE SUPPRESSION */}
      {showDeleteModal && deletingAnnonce && (
        <div className="modal-backdrop">
          <div className="modal-content modal-sm">
            <div className="modal-header">
              <div className="details-title-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <h2>Confirmation de suppression</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setShowDeleteModal(false)} aria-label="Fermer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer définitivement l'annonce <strong>"{deletingAnnonce.nomposte}"</strong> ?</p>
              <p className="text-danger-sm">Cette action est irréversible.</p>
            </div>

            <div className="modal-footer">
              <button
                className="btn-linkedin-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
              >
                Annuler
              </button>
              <button
                className="btn-linkedin-danger"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
              >
                {actionLoading ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnnoncesManagementPage;
