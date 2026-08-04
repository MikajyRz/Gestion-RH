import React, { useState, useEffect } from 'react';
import {
  getTypesConge,
  getStatutsDemandeConge,
  getDemandesConge,
  getSoldesConge,
  getEmployes,
  calculerJoursOuvres,
  creerDemandeConge,
  approuverDemandeConge,
  refuserDemandeConge
} from '../../services/backend/congeService';
import '../../styles/Backoffice.css';
import '../../styles/CongesManagementPage.css';

function CongesManagementPage() {
  const [activeTab, setActiveTab] = useState('attente'); // 'attente', 'toutes', 'soldes', 'nouvelle'
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Données API
  const [typesConge, setTypesConge] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [soldes, setSoldes] = useState([]);
  const [employes, setEmployes] = useState([]);

  // Modale de Refus
  const [showRefusalModal, setShowRefusalModal] = useState(false);
  const [selectedDemandeForRefusal, setSelectedDemandeForRefusal] = useState(null);
  const [refusalComment, setRefusalComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Formulaire de Nouvelle Demande
  const [formData, setFormData] = useState({
    idEmploye: '',
    idTypeConge: '',
    dateDebut: '',
    dateFin: '',
    motif: ''
  });
  const [calculatingDays, setCalculatingDays] = useState(false);
  const [calculatedJours, setCalculatedJours] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [typesRes, demandesRes, soldesRes, employesRes] = await Promise.all([
        getTypesConge(),
        getDemandesConge(),
        getSoldesConge(),
        getEmployes().catch(() => [])
      ]);

      setTypesConge(typesRes || []);
      setDemandes(demandesRes || []);
      setSoldes(soldesRes || []);
      setEmployes(employesRes || []);
    } catch (error) {
      showNotification('Erreur lors du chargement des congés: ' + (error.message || ''), true);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (text, isError = false) => {
    setNotification({ text, isError });
    setTimeout(() => setNotification(null), 4500);
  };

  // Recalculer les jours ouvrés dès que les dates changent
  useEffect(() => {
    if (formData.dateDebut && formData.dateFin) {
      if (new Date(formData.dateDebut) > new Date(formData.dateFin)) {
        setCalculatedJours(0);
        return;
      }
      setCalculatingDays(true);
      calculerJoursOuvres(formData.dateDebut, formData.dateFin)
        .then(res => setCalculatedJours(res.nombreJours || 0))
        .catch(() => setCalculatedJours(0))
        .finally(() => setCalculatingDays(false));
    } else {
      setCalculatedJours(0);
    }
  }, [formData.dateDebut, formData.dateFin]);

  // Actions RH : Approuver
  const handleApprouver = async (idDemande) => {
    if (!window.confirm('Confirmer l\'approbation de cette demande de congé par les RH ?')) return;
    setActionLoading(true);
    try {
      await approuverDemandeConge(idDemande);
      showNotification('Demande de congé approuvée avec succès et solde mis à jour !', false);
      fetchInitialData();
    } catch (error) {
      showNotification('Erreur lors de l\'approbation : ' + (error.response?.data || error.message), true);
    } finally {
      setActionLoading(false);
    }
  };

  // Actions RH : Ouvrir Modale Refus
  const handleOpenRefusalModal = (demande) => {
    setSelectedDemandeForRefusal(demande);
    setRefusalComment('');
    setShowRefusalModal(true);
  };

  // Actions RH : Confirmer Refus
  const handleConfirmRefusal = async () => {
    if (!refusalComment.trim()) {
      showNotification('Veuillez indiquer un motif de refus.', true);
      return;
    }
    setActionLoading(true);
    try {
      await refuserDemandeConge(selectedDemandeForRefusal.id, refusalComment);
      showNotification('La demande de congé a été refusée.', false);
      setShowRefusalModal(false);
      fetchInitialData();
    } catch (error) {
      showNotification('Erreur lors du refus : ' + (error.response?.data || error.message), true);
    } finally {
      setActionLoading(false);
    }
  };

  // Soumission Formulaire Nouvelle Demande
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.idEmploye || !formData.idTypeConge || !formData.dateDebut || !formData.dateFin) {
      showNotification('Veuillez remplir tous les champs obligatoires.', true);
      return;
    }
    if (calculatedJours <= 0) {
      showNotification('La période choisie ne contient aucun jour ouvré travaillé.', true);
      return;
    }

    setActionLoading(true);
    try {
      await creerDemandeConge(formData);
      showNotification('Demande de congé enregistrée avec succès !', false);
      setFormData({ idEmploye: '', idTypeConge: '', dateDebut: '', dateFin: '', motif: '' });
      setActiveTab('attente');
      fetchInitialData();
    } catch (error) {
      showNotification('Erreur création demande : ' + (error.response?.data || error.message), true);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtrage des demandes
  const demandesEnAttente = demandes.filter(d => d.statut && d.statut.code === 'EN_ATTENTE');
  const demandesApprouvees = demandes.filter(d => d.statut && d.statut.code === 'APPROUVE');
  const demandesRefusees = demandes.filter(d => d.statut && d.statut.code === 'REFUSE');

  return (
    <div>
      {/* Header Page Dolibarr ERP */}
      <div className="backoffice-banner">
        <div className="backoffice-banner-content">
          <h1>Gestion des Congés & Absences</h1>
          <p>
            Module SIRH : Validation RH des demandes, suivi des soldes annuels et décompte automatique des jours ouvrés.
          </p>
        </div>
      </div>

      <div className="dashboard-container">
        {notification && (
          <div className={notification.isError ? "alert-linkedin-error" : "alert-linkedin-success"}>
            {notification.text}
          </div>
        )}

        {/* Cartes KPI Dolibarr ERP */}
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card-linkedin">
            <div className="stat-info">
              <h4>TOTAL DEMANDES</h4>
              <p className="stat-value">{demandes.length}</p>
            </div>
          </div>
          <div className="stat-card-linkedin">
            <div className="stat-info">
              <h4 style={{ color: '#d97706' }}>EN ATTENTE VALIDATION RH</h4>
              <p className="stat-value" style={{ color: '#d97706' }}>{demandesEnAttente.length}</p>
            </div>
          </div>
          <div className="stat-card-linkedin">
            <div className="stat-info">
              <h4 style={{ color: '#057642' }}>DEMANDES APPROUVÉES</h4>
              <p className="stat-value" style={{ color: '#057642' }}>{demandesApprouvees.length}</p>
            </div>
          </div>
          <div className="stat-card-linkedin">
            <div className="stat-info">
              <h4 style={{ color: '#dc2626' }}>DEMANDES REFUSÉES</h4>
              <p className="stat-value" style={{ color: '#dc2626' }}>{demandesRefusees.length}</p>
            </div>
          </div>
        </div>

        {/* Barre des Onglets Dolibarr ERP sans icônes */}
        <div className="bo-card bo-filters-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className={`bo-tab-btn ${activeTab === 'attente' ? 'active' : ''}`}
              onClick={() => setActiveTab('attente')}
            >
              En Attente Validation ({demandesEnAttente.length})
            </button>
            <button
              className={`bo-tab-btn ${activeTab === 'toutes' ? 'active' : ''}`}
              onClick={() => setActiveTab('toutes')}
            >
              Historique & Toutes Demandes ({demandes.length})
            </button>
            <button
              className={`bo-tab-btn ${activeTab === 'soldes' ? 'active' : ''}`}
              onClick={() => setActiveTab('soldes')}
            >
              Soldes de Congés par Employé
            </button>
            <button
              className={`bo-tab-btn ${activeTab === 'nouvelle' ? 'active' : ''}`}
              onClick={() => setActiveTab('nouvelle')}
            >
              + Nouvelle Demande
            </button>
          </div>
        </div>

        {/* CONTENU ONGLET 1 : DEMANDES EN ATTENTE (VALIDATION RH) */}
        {activeTab === 'attente' && (
          <div className="bo-card">
            <h3 className="card-section-title" style={{ marginBottom: '1rem', color: '#1e293b' }}>
              Demandes en attente d'approbation par les RH
            </h3>
            {loading ? (
              <div className="loading-spinner-container">
                <div className="spinner"></div>
                <p>Chargement des demandes de congés...</p>
              </div>
            ) : demandesEnAttente.length === 0 ? (
              <div className="empty-state-box">
                <p>Aucune demande de congé en attente de validation RH pour le moment.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table-linkedin">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Employé</th>
                      <th>Type de Congé</th>
                      <th>Date Début</th>
                      <th>Date Fin</th>
                      <th>Jours Ouvrés</th>
                      <th>Motif</th>
                      <th>Date Demande</th>
                      <th style={{ textAlign: 'right' }}>Décision RH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demandesEnAttente.map((item) => (
                      <tr key={item.id}>
                        <td><strong>#{item.id}</strong></td>
                        <td>
                          <strong>{item.employe?.prenom} {item.employe?.nom}</strong>
                          <br />
                          <span className="text-muted" style={{ fontSize: '0.8rem' }}>{item.employe?.email}</span>
                        </td>
                        <td>
                          <span className="badge-type-conge">{item.typeConge?.libelle}</span>
                        </td>
                        <td>{item.dateDebut}</td>
                        <td>{item.dateFin}</td>
                        <td>
                          <span className="days-counter-badge">
                            {item.nombreJours} jour(s)
                          </span>
                        </td>
                        <td><em>"{item.motif || 'Aucun motif'}"</em></td>
                        <td>{item.dateDemande ? new Date(item.dateDemande).toLocaleDateString('fr-FR') : '—'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="action-buttons-group" style={{ justifyContent: 'flex-end', gap: '0.4rem' }}>
                            <button
                              className="btn-linkedin-primary-sm"
                              style={{ backgroundColor: '#057642', borderColor: '#057642' }}
                              title="Approuver la demande de congé"
                              onClick={() => handleApprouver(item.id)}
                              disabled={actionLoading}
                            >
                              Approuver
                            </button>
                            <button
                              className="btn-icon btn-icon-delete"
                              title="Refuser la demande avec motif"
                              onClick={() => handleOpenRefusalModal(item)}
                              disabled={actionLoading}
                            >
                              Refuser
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CONTENU ONGLET 2 : HISTORIQUE & TOUTES LES DEMANDES */}
        {activeTab === 'toutes' && (
          <div className="bo-card">
            <h3 className="card-section-title" style={{ marginBottom: '1rem', color: '#1e293b' }}>
              Historique global des demandes de congés
            </h3>
            {loading ? (
              <div className="loading-spinner-container">
                <div className="spinner"></div>
                <p>Chargement du registre des congés...</p>
              </div>
            ) : demandes.length === 0 ? (
              <div className="empty-state-box">
                <p>Aucune demande de congé enregistrée dans la base de données.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table-linkedin">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Employé</th>
                      <th>Type de Congé</th>
                      <th>Période</th>
                      <th>Durée</th>
                      <th>Statut RH</th>
                      <th>Validateur RH</th>
                      <th>Commentaire / Motif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demandes.map((item) => {
                      const codeStatut = item.statut?.code;
                      let badgeClass = 'status-pill-gray';
                      if (codeStatut === 'EN_ATTENTE') badgeClass = 'status-pill-warning';
                      if (codeStatut === 'APPROUVE') badgeClass = 'status-pill-success';
                      if (codeStatut === 'REFUSE') badgeClass = 'status-pill-danger';

                      return (
                        <tr key={item.id}>
                          <td><strong>#{item.id}</strong></td>
                          <td>
                            <strong>{item.employe?.prenom} {item.employe?.nom}</strong>
                            <br />
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>{item.employe?.email}</span>
                          </td>
                          <td>{item.typeConge?.libelle}</td>
                          <td>
                            {item.dateDebut} ➔ {item.dateFin}
                          </td>
                          <td>
                            <span className="days-counter-badge">{item.nombreJours} j</span>
                          </td>
                          <td>
                            <span className={`status-pill ${badgeClass}`}>
                              {item.statut?.libelle || codeStatut}
                            </span>
                          </td>
                          <td>
                            {item.validateurRh ? `${item.validateurRh.prenom} ${item.validateurRh.nom}` : '—'}
                          </td>
                          <td>
                            {codeStatut === 'REFUSE' && item.commentaireRefus ? (
                              <span style={{ color: '#dc2626', fontSize: '0.85rem' }}>Refus : {item.commentaireRefus}</span>
                            ) : (
                              <em>{item.motif || '—'}</em>
                            )}
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

        {/* CONTENU ONGLET 3 : SOLDES DE CONGÉS PAR EMPLOYÉ */}
        {activeTab === 'soldes' && (
          <div className="bo-card">
            <h3 className="card-section-title" style={{ marginBottom: '1rem', color: '#1e293b' }}>
              Tableau des Soldes de Congés par Employé
            </h3>
            {loading ? (
              <div className="loading-spinner-container">
                <div className="spinner"></div>
                <p>Chargement des soldes de congés...</p>
              </div>
            ) : soldes.length === 0 ? (
              <div className="empty-state-box">
                <p>Aucun solde de congé initialisé dans la base de données.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table-linkedin">
                  <thead>
                    <tr>
                      <th>Employé</th>
                      <th>Type de Congé</th>
                      <th>Année</th>
                      <th>Jours Acquis</th>
                      <th>Jours Pris</th>
                      <th>Jours Restants</th>
                      <th>Consommation du Solde</th>
                    </tr>
                  </thead>
                  <tbody>
                    {soldes.map((s) => {
                      const acquis = parseFloat(s.joursAcquis || 0);
                      const pris = parseFloat(s.joursPris || 0);
                      const restants = parseFloat(s.joursRestants || 0);
                      const pctPris = acquis > 0 ? Math.min(100, Math.round((pris / acquis) * 100)) : 0;

                      return (
                        <tr key={s.id}>
                          <td>
                            <strong>{s.employe?.prenom} {s.employe?.nom}</strong>
                            <br />
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>{s.employe?.email}</span>
                          </td>
                          <td>
                            <span className="badge-type-conge">{s.typeConge?.libelle}</span>
                          </td>
                          <td><strong>{s.annee}</strong></td>
                          <td><strong style={{ color: '#2563eb' }}>{acquis} j</strong></td>
                          <td><strong style={{ color: '#d97706' }}>{pris} j</strong></td>
                          <td>
                            <strong style={{ color: restants <= 3 ? '#dc2626' : '#057642', fontSize: '1.05rem' }}>
                              {restants} j
                            </strong>
                          </td>
                          <td style={{ minWidth: '160px' }}>
                            <div className="progress-bar-container">
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${pctPris}%`,
                                  backgroundColor: pctPris > 80 ? '#dc2626' : pctPris > 50 ? '#d97706' : '#057642'
                                }}
                              />
                            </div>
                            <span className="progress-bar-label">{pctPris}% consommé ({pris}/{acquis})</span>
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

        {/* CONTENU ONGLET 4 : NOUVELLE DEMANDE DE CONGÉ */}
        {activeTab === 'nouvelle' && (
          <div className="bo-card">
            <h3 className="card-section-title" style={{ marginBottom: '1.25rem', color: '#1e293b' }}>
              Soumettre une nouvelle demande de congé
            </h3>
            <form onSubmit={handleFormSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="form-group-linkedin">
                  <label>Sélectionner l'Employé *</label>
                  <select
                    value={formData.idEmploye}
                    onChange={(e) => setFormData({ ...formData, idEmploye: e.target.value })}
                    required
                  >
                    <option value="">-- Choisir un employé --</option>
                    {employes.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.prenom} {emp.nom} ({emp.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-linkedin">
                  <label>Type de Congé *</label>
                  <select
                    value={formData.idTypeConge}
                    onChange={(e) => setFormData({ ...formData, idTypeConge: e.target.value })}
                    required
                  >
                    <option value="">-- Choisir le type de congé --</option>
                    {typesConge.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.libelle} {t.estRemunere ? '(Rémunéré)' : '(Non Rémunéré)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="form-group-linkedin">
                  <label>Date de Début *</label>
                  <input
                    type="date"
                    value={formData.dateDebut}
                    onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group-linkedin">
                  <label>Date de Fin *</label>
                  <input
                    type="date"
                    value={formData.dateFin}
                    onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Aperçu du Calcul des Jours Ouvrés */}
              {formData.dateDebut && formData.dateFin && (
                <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', backgroundColor: '#e8f8f0', borderRadius: '4px', border: '1px solid #27ae60' }}>
                  <span style={{ fontWeight: 700, color: '#1e7e34', fontSize: '0.9rem' }}>
                    {calculatingDays ? 'Calcul des jours ouvrés en cours...' : `Durée calculée : ${calculatedJours} jour(s) ouvré(s) (hors WE et jours fériés)`}
                  </span>
                </div>
              )}

              <div className="form-group-linkedin" style={{ marginBottom: '1.5rem' }}>
                <label>Motif de l'absence</label>
                <textarea
                  rows="3"
                  placeholder="Raison du congé ou précisions complémentaires..."
                  value={formData.motif}
                  onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn-linkedin-primary"
                  style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }}
                  disabled={actionLoading || calculatedJours <= 0}
                >
                  Enregistrer la Demande de Congé
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODALE DE REFUS DE CONGÉ */}
        {showRefusalModal && selectedDemandeForRefusal && (
          <div className="modal-overlay-backdrop">
            <div className="modal-card-container" style={{ maxWidth: '500px' }}>
              <div className="modal-header">
                <h3>Refuser la demande de congé</h3>
                <button className="modal-close-btn" onClick={() => setShowRefusalModal(false)}>×</button>
              </div>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <p>
                  Demande de <strong>{selectedDemandeForRefusal.employe?.prenom} {selectedDemandeForRefusal.employe?.nom}</strong>
                  <br />
                  Période : {selectedDemandeForRefusal.dateDebut} ➔ {selectedDemandeForRefusal.dateFin} ({selectedDemandeForRefusal.nombreJours} jours)
                </p>
                <div className="form-group-linkedin" style={{ marginTop: '1rem' }}>
                  <label>Motif obligatoire du refus RH *</label>
                  <textarea
                    rows="3"
                    placeholder="Expliquer la raison du refus (ex: Période d'activité intense, chevauchement d'équipe...)"
                    value={refusalComment}
                    onChange={(e) => setRefusalComment(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ padding: '1rem 1.25rem', justifyContent: 'space-between' }}>
                <button className="btn-linkedin-secondary" onClick={() => setShowRefusalModal(false)}>
                  Annuler
                </button>
                <button
                  className="btn-linkedin-primary"
                  style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                  onClick={handleConfirmRefusal}
                  disabled={actionLoading}
                >
                  Confirmer le Refus RH
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CongesManagementPage;
