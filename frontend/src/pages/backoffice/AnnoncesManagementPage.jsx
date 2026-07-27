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
      console.error('Erreur lors du chargement des données :', err);
      setError('Impossible de charger la liste des annonces et des références.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Affichage temporaire des messages de succès
  const notifySuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  // Helper statut annonce
  const getAnnonceStatus = (annonce) => {
    const today = new Date().toISOString().split('T')[0];
    if (annonce.datefin && annonce.datefin < today) {
      return { code: 'EXPIRED', label: 'Expirée', css: 'badge-status-expired' };
    }
    if (annonce.datedebut && annonce.datedebut > today) {
      return { code: 'UPCOMING', label: 'À venir', css: 'badge-status-upcoming' };
    }
    return { code: 'ACTIVE', label: 'Active', css: 'badge-status-active' };
  };

  // Annonces filtrées et statistiques
  const filteredAnnonces = useMemo(() => {
    return annonces.filter(item => {
      // Mot-clé
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchTitle = item.nomposte?.toLowerCase().includes(kw);
        const matchDesc = item.description?.toLowerCase().includes(kw);
        if (!matchTitle && !matchDesc) return false;
      }
      // Département
      if (selectedDept && item.departement?.id !== parseInt(selectedDept, 10)) {
        return false;
      }
      // Profil
      if (selectedProfil && item.profil?.id !== parseInt(selectedProfil, 10)) {
        return false;
      }
      // Type annonce
      if (selectedType && item.typeannonce?.id !== parseInt(selectedType, 10)) {
        return false;
      }
      // Statut
      if (selectedStatut) {
        const status = getAnnonceStatus(item).code;
        if (status !== selectedStatut) return false;
      }

      return true;
    });
  }, [annonces, searchKeyword, selectedDept, selectedProfil, selectedType, selectedStatut]);

  const stats = useMemo(() => {
    let active = 0;
    let expired = 0;
    let upcoming = 0;

    annonces.forEach(a => {
      const st = getAnnonceStatus(a).code;
      if (st === 'ACTIVE') active++;
      else if (st === 'EXPIRED') expired++;
      else if (st === 'UPCOMING') upcoming++;
    });

    return { total: annonces.length, active, expired, upcoming };
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
      iddepartement: departements[0]?.id || '',
      idprofil: profils[0]?.id || '',
      idtypeannonce: typesAnnonce[0]?.id || ''
    });
    setShowFormModal(true);
  };

  // Ouverture modale Edition
  const handleOpenEditModal = (annonce) => {
    setEditingAnnonce(annonce);
    setFormData({
      nomposte: annonce.nomposte || '',
      description: annonce.description || '',
      datedebut: annonce.datedebut || '',
      datefin: annonce.datefin || '',
      datepublication: annonce.datepublication || new Date().toISOString().split('T')[0],
      iddepartement: annonce.departement?.id || '',
      idprofil: annonce.profil?.id || '',
      idtypeannonce: annonce.typeannonce?.id || ''
    });
    setShowFormModal(true);
  };

  // Soumission Formulaire (Créer / Modifier)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.nomposte.trim()) {
      alert('Le nom du poste est obligatoire.');
      return;
    }

    const payload = {
      nomposte: formData.nomposte,
      description: formData.description,
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
            <h1>📢 Gestion des Annonces</h1>
            <p>Créez, modifiez et gérez les offres d'emploi diffusées pour l'entreprise</p>
          </div>
          <button className="btn-linkedin-action-header" onClick={handleOpenCreateModal}>
            ➕ Nouvelle Annonce
          </button>
        </div>
      </div>

      <div className="dashboard-container">
        {/* MESSAGES DE SUCCÈS OU D'ERREUR */}
        {successMessage && (
          <div className="alert-linkedin-success">
            ✅ {successMessage}
          </div>
        )}
        {error && (
          <div className="alert-linkedin-error">
            ⚠️ {error}
          </div>
        )}

        {/* CARTES DE STATISTIQUES */}
        <div className="stats-grid">
          <div className="stat-card-linkedin">
            <div className="stat-icon-wrapper">📋</div>
            <div className="stat-info">
              <h4>Total des annonces</h4>
              <p className="stat-value">{stats.total}</p>
            </div>
          </div>

          <div className="stat-card-linkedin">
            <div className="stat-icon-wrapper active-icon">🟢</div>
            <div className="stat-info">
              <h4>Annonces actives</h4>
              <p className="stat-value">{stats.active}</p>
            </div>
          </div>

          <div className="stat-card-linkedin">
            <div className="stat-icon-wrapper upcoming-icon">⏳</div>
            <div className="stat-info">
              <h4>À venir</h4>
              <p className="stat-value">{stats.upcoming}</p>
            </div>
          </div>

          <div className="stat-card-linkedin">
            <div className="stat-icon-wrapper expired-icon">🔴</div>
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
              <label>🔍 Recherche</label>
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
                className="btn-linkedin-secondary-sm"
                onClick={() => {
                  setSearchKeyword('');
                  setSelectedDept('');
                  setSelectedProfil('');
                  setSelectedType('');
                  setSelectedStatut('');
                }}
              >
                🔄 Réinitialiser les filtres
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
              <p className="empty-icon">📭</p>
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
                              title="Voir les détails"
                              onClick={() => handleOpenDetailsModal(annonce)}
                            >
                              👁️
                            </button>
                            <button
                              className="btn-icon btn-icon-edit"
                              title="Modifier"
                              onClick={() => handleOpenEditModal(annonce)}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-icon btn-icon-delete"
                              title="Supprimer"
                              onClick={() => handleOpenDeleteModal(annonce)}
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
          )}
        </div>
      </div>

      {/* MODALE FORMULAIRE (CRÉATION / ÉDITION) */}
      {showFormModal && (
        <div className="modal-backdrop">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h2>{editingAnnonce ? `✏️ Modifier l'annonce : ${editingAnnonce.nomposte}` : '➕ Créer une nouvelle annonce'}</h2>
              <button className="modal-close-btn" onClick={() => setShowFormModal(false)}>✕</button>
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
          <div className="modal-content modal-md">
            <div className="modal-header">
              <h2>📄 Détails de l'annonce : {detailsAnnonce.nomposte}</h2>
              <button className="modal-close-btn" onClick={() => setShowDetailsModal(false)}>✕</button>
            </div>

            <div className="modal-body details-body">
              <div className="details-header-badges">
                <span className="badge-dept">🏢 Département : {detailsAnnonce.departement?.nom || 'N/A'}</span>
                <span className="badge-profil">👤 Profil : {detailsAnnonce.profil?.nom || 'N/A'}</span>
                <span className="badge-type">📌 Type : {detailsAnnonce.typeannonce?.libelle || 'Standard'}</span>
              </div>

              <div className="details-dates-box">
                <p><strong>📅 Date de publication :</strong> {detailsAnnonce.datepublication || 'Non précisée'}</p>
                <p><strong>🏁 Période de candidature :</strong> Du {detailsAnnonce.datedebut || 'N/A'} au {detailsAnnonce.datefin || 'Illimitée'}</p>
              </div>

              <div className="details-section">
                <h4>📝 Description de l'offre</h4>
                <div className="details-desc-text">
                  {detailsAnnonce.description ? detailsAnnonce.description : <em>Aucune description fournie.</em>}
                </div>
              </div>

              {loadingDetails ? (
                <div className="loading-spinner-container">
                  <div className="spinner-sm"></div>
                  <p>Chargement des critères et diplômes exigés...</p>
                </div>
              ) : (
                <>
                  <div className="details-section">
                    <h4>🎯 Critères requis pour le profil</h4>
                    {detailsCriteres.length === 0 ? (
                      <p className="text-muted">Aucun critère spécifique configuré pour ce profil.</p>
                    ) : (
                      <ul className="details-list">
                        {detailsCriteres.map(c => (
                          <li key={c.id}>
                            <strong>{c.critere?.nom} :</strong>{' '}
                            {c.valeurvarchar || c.valeurdouble || (c.valeurbool !== null ? (c.valeurbool ? 'Oui' : 'Non') : 'Non spécifié')}
                            {c.estobligatoire && <span className="tag-obligatoire"> (Obligatoire)</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="details-section">
                    <h4>🎓 Diplômes exigés</h4>
                    {detailsDiplomes.length === 0 ? (
                      <p className="text-muted">Aucun diplôme spécifique requis pour ce profil.</p>
                    ) : (
                      <ul className="details-list">
                        {detailsDiplomes.map(d => (
                          <li key={d.id}>🎓 {d.diplome?.nom}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-linkedin-primary" onClick={() => setShowDetailsModal(false)}>
                Fermer
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
              <h2>⚠️ Confirmation de suppression</h2>
              <button className="modal-close-btn" onClick={() => setShowDeleteModal(false)}>✕</button>
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
