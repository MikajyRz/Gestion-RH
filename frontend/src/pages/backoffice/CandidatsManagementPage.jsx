import React, { useState, useEffect, useMemo } from 'react';
import {
  getTousLesCandidats,
  getStatutsCandidat,
  getCandidatDetails,
  updateCandidatStatut,
  getCvUrl
} from '../../services/backend/candidatService';
import { getAllAnnonces } from '../../services/backend/annonceService';
import '../../styles/Backoffice.css';

function CandidatsManagementPage() {
  // Etats de données
  const [candidats, setCandidats] = useState([]);
  const [statuts, setStatuts] = useState([]);
  const [annonces, setAnnonces] = useState([]);

  // Etats d'interface
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'liste'
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Filtres
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedAnnonceId, setSelectedAnnonceId] = useState('');
  const [selectedStatutId, setSelectedStatutId] = useState('');
  const [selectedComplianceFilter, setSelectedComplianceFilter] = useState(''); // '' | 'VALID' | 'INVALID'

  // Modale Fiche Détaillée
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingStatutId, setUpdatingStatutId] = useState(false);

  // Drag & Drop State
  const [draggedCandidatId, setDraggedCandidatId] = useState(null);
  const [dragOverColumnId, setDragOverColumnId] = useState(null);

  // Charger toutes les données
  const loadData = async () => {
    try {
      setLoading(true);
      const [candidatsData, statutsData, annoncesData] = await Promise.all([
        getTousLesCandidats(),
        getStatutsCandidat(),
        getAllAnnonces()
      ]);
      setCandidats(candidatsData || []);
      setStatuts(statutsData || []);
      setAnnonces(annoncesData || []);
    } catch (err) {
      console.error('Erreur chargement candidatures :', err);
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

  // Traitement et filtrage des candidats
  const filteredCandidats = useMemo(() => {
    return candidats.filter(cand => {
      // Mot-clé
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const fullName = `${cand.prenom || ''} ${cand.nom || ''}`.toLowerCase();
        const email = cand.compteCandidat?.email?.toLowerCase() || '';
        const poste = cand.annonce?.nomposte?.toLowerCase() || '';
        if (!fullName.includes(kw) && !email.includes(kw) && !poste.includes(kw)) {
          return false;
        }
      }
      // Annonce
      if (selectedAnnonceId && cand.annonce?.id !== parseInt(selectedAnnonceId, 10)) {
        return false;
      }
      // Statut
      if (selectedStatutId && cand.statut?.id !== parseInt(selectedStatutId, 10)) {
        return false;
      }
      return true;
    });
  }, [candidats, searchKeyword, selectedAnnonceId, selectedStatutId]);

  // Déplacement Kanban Drag & Drop
  const handleDragStart = (e, candidatId) => {
    setDraggedCandidatId(candidatId);
    e.dataTransfer.setData('text/plain', candidatId.toString());
  };

  const handleDragOver = (e, statutId) => {
    e.preventDefault();
    setDragOverColumnId(statutId);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverColumnId(null);
  };

  const handleDrop = async (e, targetStatutId) => {
    e.preventDefault();
    setDragOverColumnId(null);
    const candidatIdStr = e.dataTransfer.getData('text/plain') || draggedCandidatId;
    if (!candidatIdStr) return;

    const candidatId = parseInt(candidatIdStr, 10);
    const candidateObj = candidats.find(c => c.id === candidatId);
    if (!candidateObj || candidateObj.statut?.id === targetStatutId) return;

    const targetStatutObj = statuts.find(s => s.id === targetStatutId);

    // Mise à jour optimiste dans l'UI
    setCandidats(prev => prev.map(c => {
      if (c.id === candidatId) {
        return { ...c, statut: targetStatutObj };
      }
      return c;
    }));

    try {
      await updateCandidatStatut(candidatId, targetStatutId);
      notify(`Statut de ${candidateObj.prenom} ${candidateObj.nom} changé vers "${targetStatutObj?.nom}".`);
      loadData();
    } catch (err) {
      console.error('Erreur mise à jour statut :', err);
      notify('Erreur lors du changement de statut.', true);
      loadData();
    } finally {
      setDraggedCandidatId(null);
    }
  };

  // Ouverture modale Fiche Détaillée
  const handleOpenDetailModal = async (candidatId) => {
    setShowDetailModal(true);
    setLoadingDetail(true);
    setDetailData(null);
    try {
      const data = await getCandidatDetails(candidatId);
      setDetailData(data);
    } catch (err) {
      console.error('Erreur détails candidat :', err);
      notify('Erreur lors de la récupération de la fiche candidat.', true);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Changement de statut depuis la modale
  const handleChangeStatutFromModal = async (newStatutId) => {
    if (!detailData || !detailData.candidat) return;
    try {
      setUpdatingStatutId(true);
      const updatedCandidat = await updateCandidatStatut(detailData.candidat.id, newStatutId);
      notify(`Statut mis à jour pour ${updatedCandidat.prenom} ${updatedCandidat.nom}.`);
      // Recharger la fiche
      const newData = await getCandidatDetails(detailData.candidat.id);
      setDetailData(newData);
      loadData();
    } catch (err) {
      notify('Erreur lors de la mise à jour du statut.', true);
    } finally {
      setUpdatingStatutId(false);
    }
  };

  // Helper analyse conformité d'un critère saisi vs exigé
  const evaluateCritereCompliance = (critereExige, criteresSaisis) => {
    if (!critereExige || !critereExige.critere) return { status: 'UNKNOWN', text: 'Non spécifié' };

    const critId = critereExige.critere.id;
    const saisi = (criteresSaisis || []).find(cs => cs.critere?.id === critId);

    if (!saisi) {
      if (critereExige.estobligatoire) {
        return { status: 'INVALID', text: 'Non renseigné (Obligatoire)' };
      }
      return { status: 'NEUTRAL', text: 'Non renseigné' };
    }

    // Type Nombre
    if (critereExige.valeurdouble !== null && critereExige.valeurdouble !== undefined) {
      const minRequired = parseFloat(critereExige.valeurdouble);
      const valCandidat = saisi.valeurdouble !== null ? parseFloat(saisi.valeurdouble) : null;

      if (valCandidat !== null && valCandidat >= minRequired) {
        return { status: 'VALID', text: `${valCandidat} (Requis: ≥ ${minRequired})` };
      }
      return { status: 'INVALID', text: `${valCandidat ?? '0'} (Insuffisant, Requis: ≥ ${minRequired})` };
    }

    // Type Booléen
    if (critereExige.valeurbool !== null && critereExige.valeurbool !== undefined) {
      if (saisi.valeurbool === critereExige.valeurbool) {
        return { status: 'VALID', text: saisi.valeurbool ? 'Oui (Conforme)' : 'Non (Conforme)' };
      }
      return { status: 'INVALID', text: saisi.valeurbool ? 'Oui (Non attendu)' : 'Non (Requis: Oui)' };
    }

    // Type Texte / Varchar
    if (critereExige.valeurvarchar) {
      const target = critereExige.valeurvarchar.toLowerCase();
      const valCand = (saisi.valeurvarchar || '').toLowerCase();
      if (valCand.includes(target) || target.includes(valCand)) {
        return { status: 'VALID', text: `"${saisi.valeurvarchar}"` };
      }
      return { status: 'NEUTRAL', text: `"${saisi.valeurvarchar}" (Cible: "${critereExige.valeurvarchar}")` };
    }

    return { status: 'VALID', text: saisi.valeurvarchar || saisi.valeurdouble || 'Renseigné' };
  };

  return (
    <div className="backoffice-page">
      {/* BANNIÈRE EN-TÊTE ATS */}
      <div className="backoffice-banner">
        <div className="backoffice-banner-content flex-between">
          <div>
            <h1>👥 Traitement des Candidatures (ATS)</h1>
            <p>Pilotez l'avancement des candidats avec le tableau Kanban interactif et l'analyse de conformité</p>
          </div>

          <div className="view-mode-toggle">
            <button
              className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              🔲 Vue Kanban
            </button>
            <button
              className={`view-btn ${viewMode === 'liste' ? 'active' : ''}`}
              onClick={() => setViewMode('liste')}
            >
              📜 Vue Liste
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        {notification && (
          <div className={notification.isError ? "alert-linkedin-error" : "alert-linkedin-success"}>
            {notification.isError ? '⚠️ ' : '✅ '} {notification.text}
          </div>
        )}

        {/* BARRE DE FILTRES ET RECHERCHE */}
        <div className="bo-card bo-filters-card">
          <div className="bo-filters-grid">
            <div className="form-group-linkedin search-input-group">
              <label>🔍 Recherche Candidat</label>
              <input
                type="text"
                placeholder="Nom, prénom, email, poste..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>

            <div className="form-group-linkedin">
              <label>Offre d'Emploi</label>
              <select value={selectedAnnonceId} onChange={(e) => setSelectedAnnonceId(e.target.value)}>
                <option value="">Toutes les annonces</option>
                {annonces.map(a => (
                  <option key={a.id} value={a.id}>{a.nomposte}</option>
                ))}
              </select>
            </div>

            {viewMode === 'liste' && (
              <div className="form-group-linkedin">
                <label>Statut Candidat</label>
                <select value={selectedStatutId} onChange={(e) => setSelectedStatutId(e.target.value)}>
                  <option value="">Tous les statuts</option>
                  {statuts.map(s => (
                    <option key={s.id} value={s.id}>{s.nom}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner"></div>
            <p>Chargement des candidatures et du pipeline ATS...</p>
          </div>
        ) : (
          <>
            {/* VUE KANBAN DRAG & DROP */}
            {viewMode === 'kanban' && (
              <div className="kanban-board-container">
                {statuts.map(st => {
                  const candidatsInStatus = filteredCandidats.filter(c => c.statut?.id === st.id);
                  const isDragOver = dragOverColumnId === st.id;

                  return (
                    <div
                      key={st.id}
                      className={`kanban-column ${isDragOver ? 'drag-over' : ''}`}
                      onDragOver={(e) => handleDragOver(e, st.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, st.id)}
                    >
                      <div className="kanban-column-header">
                        <h4>{st.nom}</h4>
                        <span className="kanban-count-badge">{candidatsInStatus.length}</span>
                      </div>

                      <div className="kanban-cards-list">
                        {candidatsInStatus.map(cand => (
                          <div
                            key={cand.id}
                            className="kanban-card"
                            draggable
                            onDragStart={(e) => handleDragStart(e, cand.id)}
                            onClick={() => handleOpenDetailModal(cand.id)}
                          >
                            <div className="kanban-card-top">
                              <div className="candidate-avatar">
                                {cand.prenom ? cand.prenom.charAt(0).toUpperCase() : 'C'}
                              </div>
                              <div>
                                <h5 className="candidate-name">
                                  {cand.prenom} {cand.nom}
                                </h5>
                                <p className="candidate-job">
                                  💼 {cand.annonce?.nomposte || 'Candidature spontanée'}
                                </p>
                              </div>
                            </div>

                            <div className="kanban-card-footer">
                              <span className="cand-date">
                                📅 {cand.compteCandidat?.email ? cand.compteCandidat.email : 'Formulaire web'}
                              </span>
                              <button
                                className="btn-icon-view-sm"
                                title="Voir la fiche détaillée"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDetailModal(cand.id);
                                }}
                              >
                                👁️ Fiche
                              </button>
                            </div>
                          </div>
                        ))}

                        {candidatsInStatus.length === 0 && (
                          <div className="kanban-empty-dropzone">
                            Faites glisser un candidat ici
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VUE LISTE TABLEAU */}
            {viewMode === 'liste' && (
              <div className="bo-card">
                <div className="bo-card-header">
                  <h3>Liste des Candidatures ({filteredCandidats.length})</h3>
                </div>

                {filteredCandidats.length === 0 ? (
                  <div className="empty-state">
                    <p className="empty-icon">📭</p>
                    <p>Aucun candidat ne correspond à vos filtres.</p>
                  </div>
                ) : (
                  <div className="bo-table-responsive">
                    <table className="bo-table">
                      <thead>
                        <tr>
                          <th>Candidat</th>
                          <th>Poste visé</th>
                          <th>Département</th>
                          <th>Email / Contact</th>
                          <th>Statut actuel</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCandidats.map(cand => (
                          <tr key={cand.id}>
                            <td>
                              <strong className="poste-title">
                                {cand.prenom} {cand.nom}
                              </strong>
                              {cand.datenaissance && (
                                <span className="poste-desc-preview">
                                  Né(e) le {cand.datenaissance}
                                </span>
                              )}
                            </td>
                            <td>{cand.annonce?.nomposte || '—'}</td>
                            <td>{cand.annonce?.departement?.nom || '—'}</td>
                            <td>{cand.compteCandidat?.email || '—'}</td>
                            <td>
                              <span className="status-pill badge-status-active">
                                {cand.statut?.nom || 'En attente'}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons-group">
                                <button
                                  className="btn-icon btn-icon-view"
                                  title="Consulter la fiche détaillée et le CV"
                                  onClick={() => handleOpenDetailModal(cand.id)}
                                >
                                  👁️ Fiche
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
          </>
        )}
      </div>

      {/* MODALE FICHE DÉTAILLÉE DU CANDIDAT (ATS SPLIT VIEW) */}
      {showDetailModal && (
        <div className="modal-backdrop">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h2>
                📄 Fiche Candidat :{' '}
                {detailData?.candidat ? `${detailData.candidat.prenom} ${detailData.candidat.nom}` : 'Chargement...'}
              </h2>
              <button className="modal-close-btn" onClick={() => setShowDetailModal(false)}>✕</button>
            </div>

            {loadingDetail || !detailData ? (
              <div className="loading-spinner-container">
                <div className="spinner"></div>
                <p>Chargement des détails et vérification de conformité...</p>
              </div>
            ) : (
              <div className="modal-body ats-split-container">
                {/* COLONNE GAUCHE: FICHE + COMPLIANCE + TIMELINE */}
                <div className="ats-col-left">
                  {/* BLOC INFO & CHANGEMENT STATUT RAPIDE */}
                  <div className="ats-box">
                    <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                      <h4 style={{ margin: 0 }}>👤 Profil Candidat</h4>
                      <div className="form-group-linkedin" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ margin: 0, fontSize: '0.85rem' }}>Statut ATS :</label>
                        <select
                          value={detailData.candidat.statut?.id || ''}
                          onChange={(e) => handleChangeStatutFromModal(parseInt(e.target.value, 10))}
                          disabled={updatingStatutId}
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                        >
                          {statuts.map(st => (
                            <option key={st.id} value={st.id}>{st.nom}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <p style={{ margin: '0.3rem 0', fontSize: '0.9rem' }}>
                      <strong>Email :</strong> {detailData.candidat.compteCandidat?.email || 'N/A'}
                    </p>
                    <p style={{ margin: '0.3rem 0', fontSize: '0.9rem' }}>
                      <strong>Adresse :</strong> {detailData.candidat.adresse || 'Non renseignée'}
                    </p>
                    <p style={{ margin: '0.3rem 0', fontSize: '0.9rem' }}>
                      <strong>Offre postulée :</strong> {detailData.candidat.annonce?.nomposte || 'Non liée'}
                    </p>
                  </div>

                  {/* VÉRIFICATION CONFORMITÉ AUX CRITÈRES EXIGÉS */}
                  <div className="ats-box">
                    <h4 style={{ margin: '0 0 0.75rem 0' }}>🎯 Conformité aux Critères Exigés</h4>

                    {detailData.criteresExiges && detailData.criteresExiges.length > 0 ? (
                      <div className="bo-table-responsive">
                        <table className="bo-table" style={{ fontSize: '0.85rem' }}>
                          <thead>
                            <tr>
                              <th>Critère</th>
                              <th>Réponse Candidat</th>
                              <th>Évaluation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detailData.criteresExiges.map(ce => {
                              const evalRes = evaluateCritereCompliance(ce, detailData.criteresSaisis);
                              return (
                                <tr key={ce.id}>
                                  <td>
                                    <strong>{ce.critere?.nom}</strong>
                                    {ce.estobligatoire && <span className="tag-obligatoire"> *</span>}
                                  </td>
                                  <td>{evalRes.text}</td>
                                  <td>
                                    {evalRes.status === 'VALID' && (
                                      <span className="badge-status-active">🟢 Validé</span>
                                    )}
                                    {evalRes.status === 'INVALID' && (
                                      <span className="badge-status-expired" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                                        🔴 Non conforme
                                      </span>
                                    )}
                                    {evalRes.status === 'NEUTRAL' && (
                                      <span className="badge-status-expired">⚪ Information</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                        Aucun critère spécifique exigé configuré pour ce poste.
                      </p>
                    )}
                  </div>

                  {/* HISTORIQUE CHRONOLOGIQUE DES STATUTS */}
                  <div className="ats-box">
                    <h4 style={{ margin: '0 0 0.75rem 0' }}>⏳ Historique du Candidat (Timeline)</h4>
                    {detailData.historique && detailData.historique.length > 0 ? (
                      <ul className="timeline-list">
                        {detailData.historique.map(h => (
                          <li key={h.id} className="timeline-item">
                            <span className="timeline-dot"></span>
                            <div className="timeline-content">
                              <strong>{h.statut?.nom}</strong>
                              <span className="timeline-date">
                                {h.datechangement ? new Date(h.datechangement).toLocaleString('fr-FR') : ''}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted" style={{ fontSize: '0.85rem' }}>Aucun historique enregistré.</p>
                    )}
                  </div>
                </div>

                {/* COLONNE DROITE: PRÉVISUALISATION CV PDF */}
                <div className="ats-col-right">
                  <div className="ats-box cv-preview-box">
                    <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                      <h4 style={{ margin: 0 }}>📄 Prévisualisation du CV</h4>
                      {detailData.candidat.cv && (
                        <a
                          href={getCvUrl(detailData.candidat.cv)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-linkedin-secondary-sm"
                          style={{ textDecoration: 'none' }}
                        >
                          📥 Télécharger le PDF
                        </a>
                      )}
                    </div>

                    {detailData.candidat.cv ? (
                      <div className="pdf-iframe-container">
                        <iframe
                          src={getCvUrl(detailData.candidat.cv)}
                          title="CV Candidat"
                          width="100%"
                          height="500px"
                          style={{ border: '1px solid #cbd5e1', borderRadius: '8px' }}
                        />
                      </div>
                    ) : (
                      <div className="empty-state">
                        <p className="empty-icon">📄</p>
                        <p>Aucun fichier CV joint par le candidat.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button className="btn-linkedin-primary" onClick={() => setShowDetailModal(false)}>
                Fermer la fiche
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidatsManagementPage;
