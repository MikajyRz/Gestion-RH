import React, { useState, useEffect, useMemo } from 'react';
import {
  getAllEntretiens,
  getStatutsEntretien,
  getCandidatsEligiblesEntretien,
  createEntretien,
  updateEntretienStatut,
  evaluerEntretien,
  deleteEntretien
} from '../../services/backend/entretienService';
import { getAllAnnonces } from '../../services/backend/annonceService';
import { getResultatsCandidats } from '../../services/backend/qcmService';
import { updateCandidatStatut } from '../../services/backend/candidatService';
import '../../styles/Backoffice.css';
import '../../styles/EntretiensManagementPage.css';

function EntretiensManagementPage() {
  const [activeView, setActiveView] = useState('calendar'); // 'calendar' | 'agenda' | 'liste' | 'ranking'

  // Data states
  const [entretiens, setEntretiens] = useState([]);
  const [statuts, setStatuts] = useState([]);
  const [candidatsQcmTermine, setCandidatsQcmTermine] = useState([]);
  const [annonces, setAnnonces] = useState([]);
  const [qcmResultats, setQcmResultats] = useState([]);

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // État du mois affiché dans le calendrier (par défaut mois actuel)
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  // Filtres
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatutId, setSelectedStatutId] = useState('');
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'UPCOMING' | 'PAST'
  const [selectedRankingAnnonceId, setSelectedRankingAnnonceId] = useState('');

  // Modale Planification
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    idCandidat: '',
    dateheure: new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  });
  const [scheduling, setScheduling] = useState(false);

  // Modale Évaluation
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [selectedEntretienForEval, setSelectedEntretienForEval] = useState(null);
  const [evalNote, setEvalNote] = useState(15);
  const [evalAppreciation, setEvalAppreciation] = useState('');
  const [submittingEval, setSubmittingEval] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entretiensData, statutsData, candidatsEligibles, annoncesData, qcmResultatsData] = await Promise.all([
        getAllEntretiens(),
        getStatutsEntretien(),
        getCandidatsEligiblesEntretien(),
        getAllAnnonces(),
        getResultatsCandidats()
      ]);
      setEntretiens(entretiensData || []);
      setStatuts(statutsData || []);
      setAnnonces(annoncesData || []);
      setQcmResultats(qcmResultatsData || []);

      const listEligibles = candidatsEligibles || [];
      setCandidatsQcmTermine(listEligibles);

      if (listEligibles.length > 0) {
        setScheduleForm(prev => ({ ...prev, idCandidat: listEligibles[0].id.toString() }));
      } else {
        setScheduleForm(prev => ({ ...prev, idCandidat: '' }));
      }
    } catch (err) {
      console.error('Erreur chargement entretiens :', err);
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

  // Navigation du calendrier mensuel
  const handlePrevMonth = () => {
    setCurrentCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleTodayMonth = () => {
    setCurrentCalendarDate(new Date());
  };

  // Filtrage des entretiens
  const filteredEntretiens = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return entretiens.filter(e => {
      // Mot clé
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const candName = `${e.candidat?.prenom || ''} ${e.candidat?.nom || ''}`.toLowerCase();
        const jobName = (e.candidat?.annonce?.nomposte || '').toLowerCase();
        if (!candName.includes(kw) && !jobName.includes(kw)) return false;
      }

      // Statut
      if (selectedStatutId && e.statut?.id?.toString() !== selectedStatutId) {
        return false;
      }

      // Date Filter
      if (e.dateheure) {
        const eDateStr = e.dateheure.split('T')[0];
        if (dateFilter === 'TODAY' && eDateStr !== todayStr) return false;
        if (dateFilter === 'UPCOMING' && eDateStr < todayStr) return false;
        if (dateFilter === 'PAST' && eDateStr >= todayStr) return false;
      }

      return true;
    });
  }, [entretiens, searchKeyword, selectedStatutId, dateFilter]);

  // Calcul du classement et score combiné (40% QCM + 60% Entretien) pour chaque offre
  const rankedCandidates = useMemo(() => {
    let evaluatedList = entretiens.filter(e => e.resultat != null && e.candidat != null);

    if (selectedRankingAnnonceId) {
      evaluatedList = evaluatedList.filter(e => e.candidat.annonce?.id?.toString() === selectedRankingAnnonceId);
    }

    const items = evaluatedList.map(e => {
      const cand = e.candidat;
      const noteEntretien = e.resultat.note || 0;

      const qcmRes = qcmResultats.find(q => q.idCandidat === cand.id || q.email === cand.compteCandidat?.email);
      const pourcentageQcm = qcmRes ? qcmRes.pourcentage : 0;
      const noteQcmSur20 = Math.round((pourcentageQcm / 100.0) * 20.0 * 10.0) / 10.0;

      // Score combiné : 40% QCM + 60% Entretien
      const scoreGlobal = Math.round(((noteQcmSur20 * 0.40) + (noteEntretien * 0.60)) * 10.0) / 10.0;

      return {
        entretienId: e.id,
        candidat: cand,
        annonce: cand.annonce,
        noteEntretien,
        appreciation: e.resultat.appreciation,
        pourcentageQcm,
        noteQcmSur20,
        scoreGlobal
      };
    });

    items.sort((a, b) => b.scoreGlobal - a.scoreGlobal);

    return items;
  }, [entretiens, qcmResultats, selectedRankingAnnonceId]);

  // Statistiques calculées
  const stats = useMemo(() => {
    let pending = 0, completed = 0, cancelled = 0;
    entretiens.forEach(e => {
      if (e.resultat != null) completed++;
      else if (e.statut?.nom?.toLowerCase().includes('annul')) cancelled++;
      else pending++;
    });
    return { total: entretiens.length, pending, completed, cancelled };
  }, [entretiens]);

  // Construction de la grille du calendrier mensuel (7 colonnes)
  const calendarGridDays = useMemo(() => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDayOfMonth.getDay() - 1; // 0 = Lundi, 6 = Dimanche
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const totalDaysInMonth = lastDayOfMonth.getDate();
    const days = [];

    // Jours du mois précédent
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, d);
      const dateStr = prevDate.toISOString().split('T')[0];
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
        events: []
      });
    }

    // Jours du mois actuel
    const todayStr = new Date().toISOString().split('T')[0];
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const monthStr = (month + 1).toString().padStart(2, '0');
      const dayStr = d.toString().padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;

      const dayEvents = filteredEntretiens.filter(e => e.dateheure && e.dateheure.startsWith(dateStr));

      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        events: dayEvents
      });
    }

    // Completer avec les jours du mois suivant pour boucler la grille à 35 ou 42 cases
    const totalCells = days.length > 35 ? 42 : 35;
    const remainingCells = totalCells - days.length;
    for (let d = 1; d <= remainingCells; d++) {
      const nextDate = new Date(year, month + 1, d);
      const dateStr = nextDate.toISOString().split('T')[0];
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
        events: []
      });
    }

    return days;
  }, [currentCalendarDate, filteredEntretiens]);

  // Groupement des entretiens par date pour la Vue Agenda
  const agendaGroupedByDate = useMemo(() => {
    const map = {};
    filteredEntretiens.forEach(e => {
      if (e.dateheure) {
        const dateKey = e.dateheure.split('T')[0];
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(e);
      }
    });
    return map;
  }, [filteredEntretiens]);

  // Ouverture modale Planification
  const handleOpenScheduleModal = (defaultDateStr = null) => {
    let initialDateHeure = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
    if (defaultDateStr) {
      initialDateHeure = `${defaultDateStr}T10:00`;
    }

    setScheduleForm({
      idCandidat: candidatsQcmTermine[0]?.id?.toString() || '',
      dateheure: initialDateHeure
    });
    setShowScheduleModal(true);
  };

  const handleSubmitSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleForm.idCandidat || !scheduleForm.dateheure) return;

    try {
      setScheduling(true);
      await createEntretien(parseInt(scheduleForm.idCandidat, 10), scheduleForm.dateheure);
      notify('Entretien planifié avec succès.');
      setShowScheduleModal(false);
      loadData();
    } catch (err) {
      notify('Erreur lors de la planification de l\'entretien.', true);
    } finally {
      setScheduling(false);
    }
  };

  // Changement de statut rapide entretien
  const handleChangeStatut = async (idEntretien, newStatutId) => {
    try {
      await updateEntretienStatut(idEntretien, newStatutId);
      notify('Statut de l\'entretien mis à jour.');
      loadData();
    } catch (err) {
      notify('Erreur lors de la mise à jour du statut.', true);
    }
  };

  // Mise à jour directe du statut candidat (ex: Embaucher, Offre transmise, Refuser)
  const handleUpdateCandidatStatutDirect = async (candidatId, newStatutId, statutLibelle) => {
    try {
      await updateCandidatStatut(candidatId, newStatutId);
      notify(`Statut du candidat mis à jour vers "${statutLibelle}".`);
      loadData();
    } catch (err) {
      notify('Erreur lors de la mise à jour du statut candidat.', true);
    }
  };

  // Évaluation d'un entretien
  const handleOpenEvalModal = (entretien) => {
    setSelectedEntretienForEval(entretien);
    setEvalNote(entretien.resultat?.note || 15);
    setEvalAppreciation(entretien.resultat?.appreciation || '');
    setShowEvalModal(true);
  };

  const handleSubmitEval = async (e) => {
    e.preventDefault();
    if (!selectedEntretienForEval) return;

    if (evalNote < 1 || evalNote > 20) {
      alert('La note doit être comprise entre 1 et 20.');
      return;
    }

    try {
      setSubmittingEval(true);
      await evaluerEntretien(selectedEntretienForEval.id, parseInt(evalNote, 10), evalAppreciation.trim());
      notify(`Évaluation enregistrée pour le candidat (Note: ${evalNote}/20). Statut passé à "Terminé".`);
      setShowEvalModal(false);
      loadData();
    } catch (err) {
      notify('Erreur lors de l\'enregistrement de l\'évaluation.', true);
    } finally {
      setSubmittingEval(false);
    }
  };

  const handleDeleteEntretien = async (id, name) => {
    if (!window.confirm(`Annuler / Supprimer le rendez-vous d'entretien avec ${name} ?`)) return;
    try {
      await deleteEntretien(id);
      notify('Entretien supprimé.');
      loadData();
    } catch (err) {
      notify('Erreur lors de la suppression.', true);
    }
  };

  const monthTitleFormatted = currentCalendarDate.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric'
  }).toUpperCase();

  return (
    <div className="backoffice-page">
      {/* BANNIÈRE */}
      <div className="backoffice-banner">
        <div className="backoffice-banner-content flex-between">
          <div>
            <h1>Planning & Conduite des Entretiens</h1>
            <p>Orchestrez les rendez-vous RH, saisissez les évaluations et classez les meilleurs candidats par offre</p>
          </div>
          <button className="btn-linkedin-action-header" onClick={() => handleOpenScheduleModal()}>
            Planifier un Entretien
          </button>
        </div>
      </div>

      <div className="dashboard-container">
        {notification && (
          <div className={notification.isError ? "alert-linkedin-error" : "alert-linkedin-success"}>
            {notification.text}
          </div>
        )}

        {/* CARTES KPI */}
        <div className="stats-grid">
          <div className="stat-card-linkedin">
            <div className="stat-info">
              <h4>Total Entretiens</h4>
              <p className="stat-value">{stats.total}</p>
            </div>
          </div>

          <div className="stat-card-linkedin">
            <div className="stat-info">
              <h4>À venir / En cours</h4>
              <p className="stat-value">{stats.pending}</p>
            </div>
          </div>

          <div className="stat-card-linkedin">
            <div className="stat-info">
              <h4>Évalués / Terminés</h4>
              <p className="stat-value">{stats.completed}</p>
            </div>
          </div>

          <div className="stat-card-linkedin">
            <div className="stat-info">
              <h4>Annulés</h4>
              <p className="stat-value">{stats.cancelled}</p>
            </div>
          </div>
        </div>

        {/* BARRE DE FILTRES & SWITCHER DE VUE */}
        <div className="bo-card bo-filters-card">
          <div className="flex-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className={`bo-tab-btn ${activeView === 'calendar' ? 'active' : ''}`}
                onClick={() => setActiveView('calendar')}
              >
                Vue Calendrier Mensuel
              </button>
              <button
                className={`bo-tab-btn ${activeView === 'agenda' ? 'active' : ''}`}
                onClick={() => setActiveView('agenda')}
              >
                Vue Cartes Agenda
              </button>
              <button
                className={`bo-tab-btn ${activeView === 'liste' ? 'active' : ''}`}
                onClick={() => setActiveView('liste')}
              >
                Vue Liste
              </button>
              <button
                className={`bo-tab-btn ${activeView === 'ranking' ? 'active' : ''}`}
                onClick={() => setActiveView('ranking')}
              >
                Classement par Offre & Décision
              </button>
            </div>

            {activeView !== 'ranking' && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className={`btn-linkedin-secondary-sm ${dateFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setDateFilter('ALL')}
                >
                  Tous
                </button>
                <button
                  className={`btn-linkedin-secondary-sm ${dateFilter === 'TODAY' ? 'active' : ''}`}
                  onClick={() => setDateFilter('TODAY')}
                >
                  Aujourd'hui
                </button>
                <button
                  className={`btn-linkedin-secondary-sm ${dateFilter === 'UPCOMING' ? 'active' : ''}`}
                  onClick={() => setDateFilter('UPCOMING')}
                >
                  À venir
                </button>
                <button
                  className={`btn-linkedin-secondary-sm ${dateFilter === 'PAST' ? 'active' : ''}`}
                  onClick={() => setDateFilter('PAST')}
                >
                  Passés
                </button>
              </div>
            )}
          </div>

          {activeView !== 'ranking' && (
            <div className="bo-filters-grid">
              <div className="form-group-linkedin search-input-group">
                <label>Recherche Candidat ou Poste</label>
                <input
                  type="text"
                  placeholder="Nom du candidat, poste..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>

              <div className="form-group-linkedin">
                <label>Statut Entretien</label>
                <select value={selectedStatutId} onChange={(e) => setSelectedStatutId(e.target.value)}>
                  <option value="">Tous les statuts</option>
                  {statuts.map(s => (
                    <option key={s.id} value={s.id}>{s.nom}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner"></div>
            <p>Chargement du planning d'entretiens...</p>
          </div>
        ) : (
          <>
            {/* VUE 1: VRAI CALENDRIER INTERACTIF MENSUEL */}
            {activeView === 'calendar' && (
              <div className="bo-card full-calendar-card">
                {/* EN-TÊTE DU CALENDRIER AVEC NAVIGATION */}
                <div className="calendar-header-nav">
                  <div className="calendar-month-title">
                    <h3>{monthTitleFormatted}</h3>
                  </div>

                  <div className="calendar-nav-buttons">
                    <button className="btn-linkedin-secondary-sm" onClick={handlePrevMonth} title="Mois précédent">
                      Précédent
                    </button>
                    <button className="btn-linkedin-secondary-sm" onClick={handleTodayMonth}>
                      Aujourd'hui
                    </button>
                    <button className="btn-linkedin-secondary-sm" onClick={handleNextMonth} title="Mois suivant">
                      Suivant
                    </button>
                  </div>
                </div>

                {/* GRILLE DU CALENDRIER (7 COLONNES: LUN À DIM) */}
                <div className="full-calendar-grid">
                  {/* EN-TÊTES DES JOURS DE LA SEMAINE */}
                  {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(dayName => (
                    <div key={dayName} className="calendar-weekday-header">
                      {dayName}
                    </div>
                  ))}

                  {/* CASES DES JOURS DU MOIS */}
                  {calendarGridDays.map((cell, idx) => (
                    <div
                      key={idx}
                      className={`calendar-day-cell ${!cell.isCurrentMonth ? 'other-month' : ''} ${cell.isToday ? 'today-cell' : ''}`}
                      onClick={() => handleOpenScheduleModal(cell.dateStr)}
                    >
                      <div className="cell-day-number">
                        <span>{cell.dayNumber}</span>
                        {cell.isToday && <span className="today-badge">Auj.</span>}
                      </div>

                      <div className="cell-events-container">
                        {cell.events.map(ev => {
                          const timeStr = ev.dateheure ? ev.dateheure.split('T')[1].substring(0, 5) : '00:00';
                          const isEvaluated = ev.resultat != null;
                          const isCancelled = ev.statut?.nom?.toLowerCase().includes('annul');

                          let chipClass = 'chip-upcoming';
                          if (isEvaluated) chipClass = 'chip-completed';
                          else if (isCancelled) chipClass = 'chip-cancelled';

                          return (
                            <div
                              key={ev.id}
                              className={`event-chip ${chipClass}`}
                              title={`Cliquez pour évaluer ou modifier : ${ev.candidat?.prenom} ${ev.candidat?.nom}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEvalModal(ev);
                              }}
                            >
                              <span className="chip-time">{timeStr}</span>
                              <span className="chip-name">
                                {ev.candidat ? `${ev.candidat.prenom} ${ev.candidat.nom.charAt(0)}.` : 'Candidat'}
                              </span>
                              {isEvaluated && (
                                <span className="chip-score">({ev.resultat.note}/20)</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VUE 2: VUE AGENDA GROUPÉE PAR DATE */}
            {activeView === 'agenda' && (
              <div>
                {Object.keys(agendaGroupedByDate).length === 0 ? (
                  <div className="bo-card empty-state">
                    <p>Aucun entretien ne correspond à vos critères de recherche.</p>
                  </div>
                ) : (
                  Object.keys(agendaGroupedByDate).sort().map(dateKey => {
                    const listForDate = agendaGroupedByDate[dateKey];
                    const dateFormatted = new Date(dateKey).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });

                    return (
                      <div key={dateKey} className="agenda-day-group">
                        <div className="agenda-day-header">
                          {dateFormatted.toUpperCase()} ({listForDate.length} rendez-vous)
                        </div>

                        <div className="agenda-cards-grid">
                          {listForDate.map(ent => {
                            const timeStr = ent.dateheure ? ent.dateheure.split('T')[1].substring(0, 5) : '00:00';
                            const hasResult = ent.resultat != null;

                            return (
                              <div key={ent.id} className="agenda-interview-card">
                                <div className="agenda-card-time">
                                  Heure : {timeStr}
                                </div>

                                <div className="agenda-card-body">
                                  <h4>
                                    {ent.candidat ? `${ent.candidat.prenom} ${ent.candidat.nom}` : 'Candidat inconnu'}
                                  </h4>
                                  <p className="agenda-job-title">
                                    {ent.candidat?.annonce?.nomposte || 'Offre d\'emploi'}
                                  </p>

                                  <div className="flex-between" style={{ marginTop: '0.75rem' }}>
                                    <select
                                      value={ent.statut?.id || 1}
                                      onChange={(e) => handleChangeStatut(ent.id, parseInt(e.target.value, 10))}
                                      className="select-status-inline"
                                    >
                                      {statuts.map(s => (
                                        <option key={s.id} value={s.id}>{s.nom}</option>
                                      ))}
                                    </select>

                                    {hasResult ? (
                                      <span className="badge-score-pill">
                                        Note : {ent.resultat.note} / 20
                                      </span>
                                    ) : (
                                      <span className="badge-status-upcoming">Non évalué</span>
                                    )}
                                  </div>

                                  {hasResult && ent.resultat.appreciation && (
                                    <div className="agenda-appreciation-box">
                                      <em>"{ent.resultat.appreciation}"</em>
                                    </div>
                                  )}

                                  <div className="agenda-card-actions">
                                    <button
                                      className="btn-linkedin-primary-sm"
                                      onClick={() => handleOpenEvalModal(ent)}
                                    >
                                      {hasResult ? 'Modifier l\'évaluation' : 'Saisir la note (sur 20)'}
                                    </button>
                                    <button
                                      className="btn-icon btn-icon-delete"
                                      title="Supprimer l'entretien"
                                      onClick={() => handleDeleteEntretien(ent.id, `${ent.candidat?.prenom} ${ent.candidat?.nom}`)}
                                    >
                                      Suppr.
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* VUE 3: VUE LISTE CHRONOLOGIQUE */}
            {activeView === 'liste' && (
              <div className="bo-card">
                <div className="bo-card-header">
                  <h3>Liste des Entretiens Planifiés ({filteredEntretiens.length})</h3>
                </div>

                {filteredEntretiens.length === 0 ? (
                  <div className="empty-state">
                    <p>Aucun entretien ne correspond à vos filtres.</p>
                  </div>
                ) : (
                  <div className="bo-table-responsive">
                    <table className="bo-table">
                      <thead>
                        <tr>
                          <th>Date & Heure</th>
                          <th>Candidat</th>
                          <th>Poste</th>
                          <th>Statut Entretien</th>
                          <th>Note sur 20</th>
                          <th>Appréciation RH</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEntretiens.map(ent => {
                          const dateObj = ent.dateheure ? new Date(ent.dateheure) : null;
                          const dateFormatted = dateObj ? dateObj.toLocaleString('fr-FR') : 'Non définie';
                          return (
                            <tr key={ent.id}>
                              <td>
                                <strong>{dateFormatted}</strong>
                              </td>
                              <td>
                                <strong>{ent.candidat ? `${ent.candidat.prenom} ${ent.candidat.nom}` : '—'}</strong>
                              </td>
                              <td>{ent.candidat?.annonce?.nomposte || '—'}</td>
                              <td>
                                <select
                                  value={ent.statut?.id || 1}
                                  onChange={(e) => handleChangeStatut(ent.id, parseInt(e.target.value, 10))}
                                  className="select-status-inline"
                                >
                                  {statuts.map(s => (
                                    <option key={s.id} value={s.id}>{s.nom}</option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                {ent.resultat?.note != null ? (
                                  <strong style={{ fontSize: '1.05rem', color: ent.resultat.note >= 10 ? '#057642' : '#c00000' }}>
                                    {ent.resultat.note} / 20
                                  </strong>
                                ) : (
                                  <span className="text-muted">En attente</span>
                                )}
                              </td>
                              <td>
                                {ent.resultat?.appreciation ? (
                                  <span style={{ fontSize: '0.85rem' }}>{ent.resultat.appreciation}</span>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                              <td>
                                <div className="action-buttons-group">
                                  <button
                                    className="btn-icon btn-icon-edit"
                                    title="Saisir / Modifier l'évaluation"
                                    onClick={() => handleOpenEvalModal(ent)}
                                  >
                                    Évaluer
                                  </button>
                                  <button
                                    className="btn-icon btn-icon-delete"
                                    title="Supprimer"
                                    onClick={() => handleDeleteEntretien(ent.id, `${ent.candidat?.prenom} ${ent.candidat?.nom}`)}
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
            )}

            {/* VUE 4: CLASSEMENT DES CANDIDATS PAR OFFRE D'EMPLOI & DÉCISION FINALE */}
            {activeView === 'ranking' && (
              <div className="bo-card">
                <div className="bo-card-header flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3>Classement et Comparatif des Candidats par Offre</h3>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                      Calcul du score combiné (40% QCM Technique + 60% Entretien RH) pour sélectionner le meilleur profil
                    </p>
                  </div>

                  <div className="form-group-linkedin" style={{ margin: 0, minWidth: '280px' }}>
                    <select
                      value={selectedRankingAnnonceId}
                      onChange={(e) => setSelectedRankingAnnonceId(e.target.value)}
                      style={{ padding: '0.6rem 1rem', fontSize: '0.95rem' }}
                    >
                      <option value="">Toutes les offres d'emploi ({annonces.length})</option>
                      {annonces.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.nomposte} ({a.departement?.nom || 'Département'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {rankedCandidates.length === 0 ? (
                  <div className="empty-state">
                    <p>Aucun candidat évalué ne correspond à cette offre d'emploi.</p>
                  </div>
                ) : (
                  <div className="bo-table-responsive">
                    <table className="bo-table">
                      <thead>
                        <tr>
                          <th style={{ width: '100px' }}>Rang</th>
                          <th>Candidat</th>
                          <th>Offre / Poste</th>
                          <th>Note QCM (/20)</th>
                          <th>Note Entretien (/20)</th>
                          <th>Score Global /20</th>
                          <th>Appréciation Recruteur</th>
                          <th>Statut Actuel</th>
                          <th style={{ textAlign: 'right' }}>Décision RH</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rankedCandidates.map((item, index) => {
                          const rank = index + 1;
                          const isBest = rank === 1;
                          const candStatutNom = item.candidat.statut?.nom || 'En cours';
                          const candStatutId = item.candidat.statut?.id;

                          let candBadgeClass = 'badge-status-neutral';
                          if (candStatutId === 8 || candStatutNom.toLowerCase().includes('refus')) candBadgeClass = 'badge-status-expired';
                          else if (candStatutId === 7 || candStatutNom.toLowerCase().includes('embauch') || candStatutNom.toLowerCase().includes('admis')) candBadgeClass = 'badge-status-active';
                          else if (candStatutId === 6 || candStatutNom.toLowerCase().includes('offre')) candBadgeClass = 'badge-status-info';
                          else if (candStatutId === 5 || candStatutNom.toLowerCase().includes('entretien')) candBadgeClass = 'badge-status-upcoming';

                          let scoreBadgeClass = 'badge-status-active';
                          if (item.scoreGlobal < 10) scoreBadgeClass = 'badge-status-expired';
                          else if (item.scoreGlobal < 14) scoreBadgeClass = 'badge-status-upcoming';

                          return (
                            <tr key={item.candidat.id} style={{ backgroundColor: isBest ? '#f0fdf4' : 'transparent' }}>
                              <td>
                                <span style={{
                                  fontWeight: 800,
                                  fontSize: isBest ? '1.1rem' : '0.95rem',
                                  color: isBest ? '#057642' : '#475569'
                                }}>
                                  #{rank} {isBest && '(Meilleur)'}
                                </span>
                              </td>
                              <td>
                                <strong>{item.candidat.prenom} {item.candidat.nom}</strong>
                                <span className="poste-desc-preview">
                                  {item.candidat.compteCandidat?.email || '—'}
                                </span>
                              </td>
                              <td>{item.annonce?.nomposte || '—'}</td>
                              <td>
                                <strong>{item.noteQcmSur20} / 20</strong>
                                <span className="text-muted" style={{ fontSize: '0.8rem', display: 'block' }}>
                                  ({item.pourcentageQcm}%)
                                </span>
                              </td>
                              <td>
                                <strong>{item.noteEntretien} / 20</strong>
                              </td>
                              <td>
                                <span className={`status-pill ${scoreBadgeClass}`} style={{ fontSize: '1rem', fontWeight: 700 }}>
                                  {item.scoreGlobal} / 20
                                </span>
                              </td>
                              <td>
                                {item.appreciation ? (
                                  <em style={{ fontSize: '0.85rem' }}>"{item.appreciation}"</em>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                              <td>
                                <span className={`status-pill ${candBadgeClass}`}>
                                  {candStatutNom}
                                </span>
                              </td>
                              <td>
                                <div className="action-buttons-group" style={{ justifyContent: 'flex-end', gap: '0.35rem' }}>
                                  <button
                                    className="btn-icon btn-icon-view"
                                    title="Proposer une offre au candidat"
                                    onClick={() => handleUpdateCandidatStatutDirect(item.candidat.id, 6, 'Offre Transmise')}
                                  >
                                    <span>Offre</span>
                                  </button>
                                  <button
                                    className="btn-icon btn-icon-edit"
                                    style={{ backgroundColor: '#365f91', borderColor: '#2a4b73', color: '#ffffff' }}
                                    title="Embaucher directement ce candidat"
                                    onClick={() => handleUpdateCandidatStatutDirect(item.candidat.id, 7, 'Admis / Embauché')}
                                  >
                                    <span>Embaucher</span>
                                  </button>
                                  <button
                                    className="btn-icon btn-icon-delete"
                                    title="Refuser ce candidat"
                                    onClick={() => handleUpdateCandidatStatutDirect(item.candidat.id, 8, 'Refusé')}
                                  >
                                    <span>Refuser</span>
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

      {/* MODALE DE PLANIFICATION D'ENTRETIEN */}
      {showScheduleModal && (
        <div className="modal-backdrop">
          <div className="modal-content modal-sm">
            <div className="modal-header">
              <h2>Planifier un Rendez-vous d'Entretien</h2>
              <button className="modal-close-btn" onClick={() => setShowScheduleModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmitSchedule} className="modal-body form-grid-1">
              <div className="form-group-linkedin">
                <label>Sélectionner le candidat (Statut "QCM Terminé" uniquement) *</label>
                <select
                  required
                  value={scheduleForm.idCandidat}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, idCandidat: e.target.value })}
                >
                  <option value="">-- Sélectionner un candidat éligible --</option>
                  {candidatsQcmTermine.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.prenom} {c.nom} — ({c.annonce?.nomposte || 'Sans poste'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group-linkedin">
                <label>Date et Heure du rendez-vous *</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleForm.dateheure}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, dateheure: e.target.value })}
                />
              </div>

              <div className="modal-footer" style={{ padding: '1rem 0 0 0', border: 'none', backgroundColor: 'transparent' }}>
                <button
                  type="button"
                  className="btn-linkedin-secondary"
                  onClick={() => setShowScheduleModal(false)}
                  disabled={scheduling}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-linkedin-primary" style={{ width: 'auto' }} disabled={scheduling}>
                  {scheduling ? 'Planification...' : 'Planifier le rendez-vous'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE DE SAISIE DE L'ÉVALUATION RH (NOTE SUR 20 & APPRÉCIATION) */}
      {showEvalModal && selectedEntretienForEval && (
        <div className="modal-backdrop">
          <div className="modal-content modal-md">
            <div className="modal-header">
              <h2>
                Évaluation RH :{' '}
                {selectedEntretienForEval.candidat
                  ? `${selectedEntretienForEval.candidat.prenom} ${selectedEntretienForEval.candidat.nom}`
                  : ''}
              </h2>
              <button className="modal-close-btn" onClick={() => setShowEvalModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmitEval} className="modal-body form-grid-1">
              <div className="details-dates-box" style={{ marginBottom: '1rem' }}>
                <p>
                  <strong>Poste :</strong> {selectedEntretienForEval.candidat?.annonce?.nomposte || 'Non spécifié'}
                </p>
                <p>
                  <strong>Date de l'entretien :</strong>{' '}
                  {new Date(selectedEntretienForEval.dateheure).toLocaleString('fr-FR')}
                </p>
              </div>

              <div className="form-group-linkedin">
                <label style={{ fontSize: '1rem', fontWeight: 700 }}>
                  Note attribuée (sur 20) : <span style={{ color: '#0a66c2', fontSize: '1.3rem' }}>{evalNote} / 20</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={evalNote}
                  onChange={(e) => setEvalNote(parseInt(e.target.value, 10))}
                  style={{ width: '100%', cursor: 'pointer', margin: '0.5rem 0' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[10, 12, 14, 15, 16, 17, 18, 20].map(val => (
                    <button
                      key={val}
                      type="button"
                      className={`btn-linkedin-secondary-sm ${evalNote === val ? 'active' : ''}`}
                      onClick={() => setEvalNote(val)}
                    >
                      {val} / 20
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group-linkedin">
                <label style={{ fontWeight: 700 }}>Appréciation globale du recruteur *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Compétences techniques, posture, points forts, axes d'amélioration, avis général sur l'embauche..."
                  value={evalAppreciation}
                  onChange={(e) => setEvalAppreciation(e.target.value)}
                />
              </div>

              <div className="modal-footer" style={{ padding: '1rem 0 0 0', border: 'none', backgroundColor: 'transparent' }}>
                <button
                  type="button"
                  className="btn-linkedin-secondary"
                  onClick={() => setShowEvalModal(false)}
                  disabled={submittingEval}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-linkedin-primary" style={{ width: 'auto' }} disabled={submittingEval}>
                  {submittingEval ? 'Enregistrement...' : 'Valider l\'évaluation (Passer à Terminé)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EntretiensManagementPage;
