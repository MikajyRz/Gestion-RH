import React, { useState, useEffect, useMemo } from 'react';
import {
  getTousLesCandidats,
  getStatutsCandidat,
  getCandidatDetailComplete,
  updateStatutCandidat,
  getCvUrl
} from '../../services/backend/candidatService';
import { getAllAnnonces } from '../../services/backend/annonceService';
import '../../styles/Backoffice.css';
import '../../styles/CandidatsManagementPage.css';

function CandidatsManagementPage() {
  // Etats de données
  const [candidats, setCandidats] = useState([]);
  const [statuts, setStatuts] = useState([]);
  const [annonces, setAnnonces] = useState([]);

  // Etats d'affichage
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'liste'
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Filtres
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedAnnonceId, setSelectedAnnonceId] = useState('');
  const [selectedStatutId, setSelectedStatutId] = useState('');

  // Drag and drop state
  const [draggedCandidatId, setDraggedCandidatId] = useState(null);
  const [dragOverColumnId, setDragOverColumnId] = useState(null);

  // Modale Fiche Détallée Candidat
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCandidatId, setSelectedCandidatId] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingStatutId, setUpdatingStatutId] = useState(false);

  // Charger les données initiales
  const loadData = async () => {
    try {
      setLoading(true);
      const [candidatsData, annoncesData, backendStatuts] = await Promise.all([
        getTousLesCandidats(),
        getAllAnnonces(),
        getStatutsCandidat().catch(() => [])
      ]);

      const candList = candidatsData || [];
      setCandidats(candList);
      setAnnonces(annoncesData || []);

      // Liste des statuts par défaut de la chaîne d'évaluation RH
      const defaultStatuts = [
        { id: 1, nom: 'En attente' },
        { id: 2, nom: 'Présélectionné' },
        { id: 3, nom: 'QCM Envoyé' },
        { id: 4, nom: 'QCM Terminé' },
        { id: 5, nom: 'Entretien Planifié' },
        { id: 6, nom: 'Offre Transmise' },
        { id: 7, nom: 'Embauché' },
        { id: 8, nom: 'Refusé' }
      ];

      const statutsMap = new Map();
      // 1. Ajouter d'abord les statuts par défaut
      defaultStatuts.forEach(s => statutsMap.set(s.id, s));
      // 2. Remplacer/ajouter avec les statuts retournés par le backend
      (backendStatuts || []).forEach(s => {
        if (s && s.id) statutsMap.set(s.id, s);
      });
      // 3. Inclure tout statut associé aux candidats existants
      candList.forEach(c => {
        if (c.statut && c.statut.id) {
          statutsMap.set(c.statut.id, c.statut);
        }
      });

      // Trier tous les statuts par ID
      const allStatuts = Array.from(statutsMap.values()).sort((a, b) => a.id - b.id);
      setStatuts(allStatuts);
    } catch (err) {
      console.error('Erreur lors du chargement ATS :', err);
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

  // Filtrage combiné des candidats
  const filteredCandidats = useMemo(() => {
    return candidats.filter(c => {
      // 1. Recherche par nom, prénom, email ou intitulé de poste
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const nomComplet = `${c.nom} ${c.prenom}`.toLowerCase();
        const email = (c.compteCandidat?.email || '').toLowerCase();
        const poste = (c.annonce?.nomposte || '').toLowerCase();
        if (!nomComplet.includes(kw) && !email.includes(kw) && !poste.includes(kw)) {
          return false;
        }
      }
      // 2. Filtre Annonce / Offre
      if (selectedAnnonceId && c.annonce?.id?.toString() !== selectedAnnonceId) {
        return false;
      }
      // 3. Filtre Statut (Vue liste)
      if (selectedStatutId && c.statut?.id?.toString() !== selectedStatutId) {
        return false;
      }
      return true;
    });
  }, [candidats, searchKeyword, selectedAnnonceId, selectedStatutId]);

  // --- KANBAN DRAG AND DROP HANDLERS ---
  const handleDragStart = (e, candidatId) => {
    setDraggedCandidatId(candidatId);
    e.dataTransfer.setData('text/plain', candidatId.toString());
  };

  const handleDragOver = (e, statutId) => {
    e.preventDefault();
    setDragOverColumnId(statutId);
  };

  const handleDragLeave = () => {
    setDragOverColumnId(null);
  };

  const handleDrop = async (e, targetStatutId) => {
    e.preventDefault();
    setDragOverColumnId(null);

    const candidatIdStr = e.dataTransfer.getData('text/plain') || draggedCandidatId;
    if (!candidatIdStr) return;

    const candId = parseInt(candidatIdStr, 10);
    const candidate = candidats.find(c => c.id === candId);
    const targetStatut = statuts.find(s => s.id === targetStatutId);

    if (!candidate || candidate.statut?.id === targetStatutId) {
      return; // Aucun changement de statut
    }

    try {
      // Mise à jour optimiste dans l'UI
      setCandidats(prev => prev.map(c => c.id === candId ? { ...c, statut: targetStatut } : c));

      await updateStatutCandidat(candId, targetStatutId);
      notify(`Statut de ${candidate.prenom} ${candidate.nom} mis à jour : "${targetStatut.nom}".`);
      loadData();
    } catch (err) {
      console.error('Erreur changement de statut :', err);
      notify('Erreur lors de la mise à jour du statut.', true);
      loadData(); // Recharger en cas d'erreur
    } finally {
      setDraggedCandidatId(null);
    }
  };

  // --- FICHE DÉTAILLÉE CANDIDAT ---
  const handleOpenDetailModal = async (candidatId) => {
    setSelectedCandidatId(candidatId);
    setShowDetailModal(true);
    setLoadingDetail(true);

    try {
      const data = await getCandidatDetailComplete(candidatId);
      setDetailData(data);
    } catch (err) {
      console.error('Erreur chargement fiche candidat :', err);
      notify('Impossible de charger la fiche du candidat.', true);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleChangeStatutFromModal = async (newStatutId) => {
    if (!detailData || !detailData.candidat) return;
    try {
      setUpdatingStatutId(true);
      await updateStatutCandidat(detailData.candidat.id, newStatutId);
      notify('Statut du candidat mis à jour.');
      // Recharger la modale et la liste
      const refreshed = await getCandidatDetailComplete(detailData.candidat.id);
      setDetailData(refreshed);
      loadData();
    } catch (err) {
      notify('Erreur lors de la mise à jour du statut.', true);
    } finally {
      setUpdatingStatutId(false);
    }
  };

  // Évaluation de la conformité d'un critère exigé vs réponse candidat
  const evaluateCritereCompliance = (critereExige, criteresSaisis) => {
    if (!critereExige || !critereExige.critere) {
      return { status: 'NEUTRAL', text: 'N/A' };
    }

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
            <h1>Traitement des Candidatures (ATS)</h1>
            <p>Pilotez l'avancement des candidats avec le tableau Kanban interactif et l'analyse de conformité</p>
          </div>

          <div className="view-mode-toggle">
            <button
              className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              Vue Kanban
            </button>
            <button
              className={`view-btn ${viewMode === 'liste' ? 'active' : ''}`}
              onClick={() => setViewMode('liste')}
            >
              Vue Liste
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        {notification && (
          <div className={notification.isError ? "alert-linkedin-error" : "alert-linkedin-success"}>
            {notification.text}
          </div>
        )}

        {/* BARRE DE FILTRES ET RECHERCHE */}
        <div className="bo-card bo-filters-card">
          <div className="bo-filters-grid">
            <div className="form-group-linkedin search-input-group">
              <label>Recherche Candidat</label>
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
                                  {cand.annonce?.nomposte || 'Candidature spontanée'}
                                </p>
                              </div>
                            </div>

                            <div className="kanban-card-footer">
                              <span className="cand-date">
                                {cand.compteCandidat?.email ? cand.compteCandidat.email : 'Formulaire web'}
                              </span>
                              <button
                                className="btn-icon-view-sm"
                                title="Voir la fiche détaillée"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDetailModal(cand.id);
                                }}
                              >
                                Fiche
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
                                  Fiche
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
                Fiche Candidat :{' '}
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
                      <h4 style={{ margin: 0 }}>Profil Candidat</h4>
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
                    <h4 style={{ margin: '0 0 0.75rem 0' }}>Conformité aux Critères Exigés</h4>

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
                                      <span className="badge-status-active">Validé</span>
                                    )}
                                    {evalRes.status === 'INVALID' && (
                                      <span className="badge-status-expired" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                                        Non conforme
                                      </span>
                                    )}
                                    {evalRes.status === 'NEUTRAL' && (
                                      <span className="badge-status-expired">Information</span>
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
                    <h4 style={{ margin: '0 0 0.75rem 0' }}>Historique du Candidat (Timeline)</h4>
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
                      <h4 style={{ margin: 0 }}>Prévisualisation du CV</h4>
                      {detailData.candidat.cv && (
                        <a
                          href={getCvUrl(detailData.candidat.cv)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-linkedin-secondary-sm"
                          style={{ textDecoration: 'none' }}
                        >
                          Télécharger le PDF
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
