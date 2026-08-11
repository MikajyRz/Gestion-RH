import React, { useState, useEffect } from 'react';
import {
  getBulletinsPaie,
  genererPaieDuMois,
  validerBulletin,
  getFeuillesTemps,
  enregistrerFeuilleTemps,
  getParametresCotisation,
  exporterBulletinPdfUrl
} from '../../services/backend/paieService';
import { getEmployes } from '../../services/backend/congeService';
import '../../styles/Backoffice.css';
import '../../styles/PaieManagementPage.css';

function PaieManagementPage() {
  const [activeTab, setActiveTab] = useState('bulletins'); // 'bulletins', 'heures_sup', 'parametres'
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filtres Période
  const currentDate = new Date();
  const [selectedMois, setSelectedMois] = useState(currentDate.getMonth() + 1);
  const [selectedAnnee, setSelectedAnnee] = useState(currentDate.getFullYear());

  // Données API
  const [bulletins, setBulletins] = useState([]);
  const [feuillesTemps, setFeuillesTemps] = useState([]);
  const [parametres, setParametres] = useState([]);
  const [employes, setEmployes] = useState([]);

  // Formulaire de saisie Heures Sup / Présence
  const [selectedEmployeId, setSelectedEmployeId] = useState('');
  const [formDataFeuille, setFormDataFeuille] = useState({
    joursTravailles: 22,
    heuresSup30: 0,
    heuresSup40: 0,
    heuresSup50: 0,
    heuresSup100: 0,
    heuresNuit: 0,
    joursAbsences: 0
  });

  useEffect(() => {
    loadData();
  }, [selectedMois, selectedAnnee]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bulletinsRes, feuillesRes, paramsRes, employesRes] = await Promise.all([
        getBulletinsPaie({ mois: selectedMois, annee: selectedAnnee }),
        getFeuillesTemps({ mois: selectedMois, annee: selectedAnnee }),
        getParametresCotisation().catch(() => []),
        getEmployes().catch(() => [])
      ]);

      setBulletins(bulletinsRes || []);
      setFeuillesTemps(feuillesRes || []);
      setParametres(paramsRes || []);
      setEmployes(employesRes || []);
    } catch (error) {
      showNotification('Erreur lors du chargement des données de paie : ' + error.message, true);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (text, isError = false) => {
    setNotification({ text, isError });
    setTimeout(() => setNotification(null), 4500);
  };

  // Génération automatique 1-Clic
  const handleGenererPaie = async () => {
    if (!window.confirm(`Lancer le calcul automatique de la paie pour ${selectedMois}/${selectedAnnee} ?`)) return;
    setActionLoading(true);
    try {
      const result = await genererPaieDuMois(selectedMois, selectedAnnee);
      showNotification(`Génération terminée avec succès ! ${result.length} bulletin(s) créé(s)/mis à jour.`, false);
      loadData();
    } catch (error) {
      showNotification('Erreur lors de la génération : ' + (error.response?.data || error.message), true);
    } finally {
      setActionLoading(false);
    }
  };

  // Validation RH du bulletin
  const handleValiderBulletin = async (idBulletin) => {
    setActionLoading(true);
    try {
      await validerBulletin(idBulletin);
      showNotification('Bulletin de paie validé par la Direction RH avec succès !', false);
      loadData();
    } catch (error) {
      showNotification('Erreur validation : ' + (error.response?.data || error.message), true);
    } finally {
      setActionLoading(false);
    }
  };

  // Soumission Feuille de Temps (Heures Sup)
  const handleSaveFeuilleTemps = async (e) => {
    e.preventDefault();
    if (!selectedEmployeId) {
      showNotification('Veuillez sélectionner un employé.', true);
      return;
    }

    setActionLoading(true);
    try {
      await enregistrerFeuilleTemps({
        employe: { id: parseInt(selectedEmployeId, 10) },
        mois: parseInt(selectedMois, 10),
        annee: parseInt(selectedAnnee, 10),
        joursTravailles: parseFloat(formDataFeuille.joursTravailles),
        heuresSup30: parseFloat(formDataFeuille.heuresSup30),
        heuresSup40: parseFloat(formDataFeuille.heuresSup40),
        heuresSup50: parseFloat(formDataFeuille.heuresSup50),
        heuresSup100: parseFloat(formDataFeuille.heuresSup100),
        heuresNuit: parseFloat(formDataFeuille.heuresNuit),
        joursAbsences: parseFloat(formDataFeuille.joursAbsences)
      });
      showNotification('Feuille de temps enregistrée et bulletin recalculé !', false);
      loadData();
    } catch (error) {
      showNotification('Erreur enregistrement heures sup : ' + (error.response?.data || error.message), true);
    } finally {
      setActionLoading(false);
    }
  };

  const formatMoney = (val) => {
    if (val === null || val === undefined) return '0,00';
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  };

  // Cumuls KPI
  const totalBrutCumul = bulletins.reduce((acc, b) => acc + parseFloat(b.salaireBrut || 0), 0);
  const totalRetenuesCumul = bulletins.reduce((acc, b) => acc + parseFloat(b.totalRetenues || 0), 0);
  const totalNetCumul = bulletins.reduce((acc, b) => acc + parseFloat(b.salaireNet || 0), 0);

  return (
    <div>
      {/* Header Page Dolibarr ERP sans icônes */}
      <div className="backoffice-banner">
        <div className="backoffice-banner-content">
          <h1>Gestion de la Paie & Rémunération</h1>
          <p>
            Module SIRH : Calcul automatique des bulletins de paie aux normes légale malgaches (CNaPS 1%, OSTIE 1%, Tranches IRSA et Heures Supplémentaires).
          </p>
        </div>
      </div>

      <div className="dashboard-container">
        {notification && (
          <div className={notification.isError ? "alert-linkedin-error" : "alert-linkedin-success"}>
            {notification.text}
          </div>
        )}

        {/* Barre de sélection Période & Action Générer */}
        <div className="bo-card bo-filters-card" style={{ marginBottom: '1.5rem' }}>
          <div className="paie-filters-bar" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="form-group-linkedin">
                <label>Mois de Paie</label>
                <select value={selectedMois} onChange={(e) => setSelectedMois(parseInt(e.target.value, 10))}>
                  <option value={1}>Janvier</option>
                  <option value={2}>Février</option>
                  <option value={3}>Mars</option>
                  <option value={4}>Avril</option>
                  <option value={5}>Mai</option>
                  <option value={6}>Juin</option>
                  <option value={7}>Juillet</option>
                  <option value={8}>Août</option>
                  <option value={9}>Septembre</option>
                  <option value={10}>Octobre</option>
                  <option value={11}>Novembre</option>
                  <option value={12}>Décembre</option>
                </select>
              </div>

              <div className="form-group-linkedin">
                <label>Année</label>
                <select value={selectedAnnee} onChange={(e) => setSelectedAnnee(parseInt(e.target.value, 10))}>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            </div>

            <button
              className="btn-linkedin-primary"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
              onClick={handleGenererPaie}
              disabled={actionLoading}
            >
              Calculer / Régénérer la Paie du Mois
            </button>
          </div>
        </div>

        {/* Cartes KPI Cumuls Paie */}
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card-linkedin">
            <div className="stat-info">
              <h4>BULLETINS GÉNÉRÉS</h4>
              <p className="stat-value">{bulletins.length}</p>
            </div>
          </div>
          <div className="stat-card-linkedin">
            <div className="stat-info">
              <h4 style={{ color: '#365f91' }}>TOTAL MASSE BRUTE</h4>
              <p className="stat-value" style={{ color: '#365f91', fontSize: '1.4rem' }}>{formatMoney(totalBrutCumul)} Ar</p>
            </div>
          </div>
          <div className="stat-card-linkedin">
            <div className="stat-info">
              <h4 style={{ color: '#dc2626' }}>TOTAL RETENUES & TAXES</h4>
              <p className="stat-value" style={{ color: '#dc2626', fontSize: '1.4rem' }}>{formatMoney(totalRetenuesCumul)} Ar</p>
            </div>
          </div>
          <div className="stat-card-linkedin">
            <div className="stat-info">
              <h4 style={{ color: '#057642' }}>TOTAL SALAIRES NETS</h4>
              <p className="stat-value" style={{ color: '#057642', fontSize: '1.4rem' }}>{formatMoney(totalNetCumul)} Ar</p>
            </div>
          </div>
        </div>

        {/* Barre des Onglets */}
        <div className="bo-card bo-filters-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className={`bo-tab-btn ${activeTab === 'bulletins' ? 'active' : ''}`}
              onClick={() => setActiveTab('bulletins')}
            >
              Registre des Bulletins de Paie ({bulletins.length})
            </button>
            <button
              className={`bo-tab-btn ${activeTab === 'heures_sup' ? 'active' : ''}`}
              onClick={() => setActiveTab('heures_sup')}
            >
              Saisie des Heures Sup & Présences
            </button>
            <button
              className={`bo-tab-btn ${activeTab === 'parametres' ? 'active' : ''}`}
              onClick={() => setActiveTab('parametres')}
            >
              Paramètres CNaPS / OSTIE / IRSA
            </button>
          </div>
        </div>

        {/* CONTENU ONGLET 1 : REGISTRE DES BULLETINS DE PAIE */}
        {activeTab === 'bulletins' && (
          <div className="bo-card">
            <h3 className="card-section-title" style={{ marginBottom: '1rem', color: '#1e293b' }}>
              Bulletins de Paie du Mois {selectedMois}/{selectedAnnee}
            </h3>

            {loading ? (
              <div className="loading-spinner-container">
                <div className="spinner"></div>
                <p>Chargement du registre de paie...</p>
              </div>
            ) : bulletins.length === 0 ? (
              <div className="empty-state-box">
                <p>Aucun bulletin de paie généré pour cette période. Cliquez sur "Calculer / Régénérer la Paie du Mois".</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table-linkedin">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Employé</th>
                      <th>Salaire de Base</th>
                      <th>Brut Total</th>
                      <th>CNaPS (1%)</th>
                      <th>OSTIE (1%)</th>
                      <th>IRSA</th>
                      <th>Salaire Net à Payer</th>
                      <th>Statut RH</th>
                      <th style={{ textAlign: 'right' }}>Actions RH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulletins.map((b) => {
                      const codeStatut = b.statut?.code;
                      let badgeClass = 'status-pill-warning';
                      if (codeStatut === 'VALIDE') badgeClass = 'status-pill-success';

                      return (
                        <tr key={b.id}>
                          <td><strong>#{b.id}</strong></td>
                          <td>
                            <strong>{b.employe?.prenom} {b.employe?.nom}</strong>
                            <br />
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>{b.employe?.matricule || 'N/A'}</span>
                          </td>
                          <td>{formatMoney(b.salaireBase)} Ar</td>
                          <td><span className="paie-brut-badge">{formatMoney(b.salaireBrut)} Ar</span></td>
                          <td>{formatMoney(b.cnapsSalarie)} Ar</td>
                          <td>{formatMoney(b.ostieSalarie)} Ar</td>
                          <td><span className="paie-deduction-badge">{formatMoney(b.totalIrsa)} Ar</span></td>
                          <td><span className="paie-net-badge">{formatMoney(b.salaireNet)} Ar</span></td>
                          <td>
                            <span className={`status-pill ${badgeClass}`}>
                              {b.statut?.libelle || codeStatut}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="action-buttons-group" style={{ justifyContent: 'flex-end', gap: '0.4rem' }}>
                              {codeStatut === 'BROUILLON' && (
                                <button
                                  className="btn-linkedin-primary-sm"
                                  style={{ backgroundColor: '#057642', borderColor: '#057642' }}
                                  onClick={() => handleValiderBulletin(b.id)}
                                  disabled={actionLoading}
                                >
                                  Valider RH
                                </button>
                              )}
                              <a
                                href={exporterBulletinPdfUrl(b.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-linkedin-secondary-sm"
                                style={{ textDecoration: 'none', display: 'inline-block' }}
                              >
                                Exporter PDF
                              </a>
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

        {/* CONTENU ONGLET 2 : SAISIE DES HEURES SUP & PRÉSENCES */}
        {activeTab === 'heures_sup' && (
          <div className="bo-card">
            <h3 className="card-section-title" style={{ marginBottom: '1.25rem', color: '#1e293b' }}>
              Saisie des Heures Supplémentaires & Absences ({selectedMois}/{selectedAnnee})
            </h3>
            <form onSubmit={handleSaveFeuilleTemps}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="form-group-linkedin">
                  <label>Sélectionner l'Employé *</label>
                  <select
                    value={selectedEmployeId}
                    onChange={(e) => setSelectedEmployeId(e.target.value)}
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
                  <label>Jours Travaillés (Normal: 22j)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formDataFeuille.joursTravailles}
                    onChange={(e) => setFormDataFeuille({ ...formDataFeuille, joursTravailles: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group-linkedin">
                  <label>Heures Sup 30%</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formDataFeuille.heuresSup30}
                    onChange={(e) => setFormDataFeuille({ ...formDataFeuille, heuresSup30: e.target.value })}
                  />
                </div>
                <div className="form-group-linkedin">
                  <label>Heures Sup 40%</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formDataFeuille.heuresSup40}
                    onChange={(e) => setFormDataFeuille({ ...formDataFeuille, heuresSup40: e.target.value })}
                  />
                </div>
                <div className="form-group-linkedin">
                  <label>Heures Sup 50%</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formDataFeuille.heuresSup50}
                    onChange={(e) => setFormDataFeuille({ ...formDataFeuille, heuresSup50: e.target.value })}
                  />
                </div>
                <div className="form-group-linkedin">
                  <label>Heures Sup 100%</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formDataFeuille.heuresSup100}
                    onChange={(e) => setFormDataFeuille({ ...formDataFeuille, heuresSup100: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="form-group-linkedin">
                  <label>Heures de Nuit (30%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formDataFeuille.heuresNuit}
                    onChange={(e) => setFormDataFeuille({ ...formDataFeuille, heuresNuit: e.target.value })}
                  />
                </div>
                <div className="form-group-linkedin">
                  <label>Jours d'Absences Non Payées</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formDataFeuille.joursAbsences}
                    onChange={(e) => setFormDataFeuille({ ...formDataFeuille, joursAbsences: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn-linkedin-primary"
                  style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }}
                  disabled={actionLoading}
                >
                  Enregistrer & Recalculer la Paie
                </button>
              </div>
            </form>
          </div>
        )}

        {/* CONTENU ONGLET 3 : PARAMÈTRES & GRILLES FISCALES */}
        {activeTab === 'parametres' && (
          <div className="bo-card">
            <h3 className="card-section-title" style={{ marginBottom: '1rem', color: '#1e293b' }}>
              Grilles des Cotisations Sociales & Barème Progressif IRSA
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <h4 style={{ color: '#365f91', marginBottom: '0.75rem' }}>Taux des Cotisations Sociales (Législation MG)</h4>
                <table className="table-linkedin">
                  <thead>
                    <tr>
                      <th>Cotisation</th>
                      <th>Taux Salarié</th>
                      <th>Plafond Salarial Assiette</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>CNaPS (Retraite & Famille)</strong></td>
                      <td>1,00%</td>
                      <td>2 800 000,00 Ar (Max 28 000 Ar)</td>
                    </tr>
                    <tr>
                      <td><strong>OSTIE (Santé & Médical)</strong></td>
                      <td>1,00%</td>
                      <td>Sans plafond (Total Brut)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 style={{ color: '#dc2626', marginBottom: '0.75rem' }}>Barème Progressif IRSA (Impôt sur les Revenus)</h4>
                <table className="table-linkedin">
                  <thead>
                    <tr>
                      <th>Tranche de Salaire Imposable (Ar)</th>
                      <th>Taux IRSA</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Jusqu'à 350 000 Ar</td>
                      <td><strong>0% (Exonéré)</strong></td>
                    </tr>
                    <tr>
                      <td>De 350 001 à 400 000 Ar</td>
                      <td><strong>5%</strong></td>
                    </tr>
                    <tr>
                      <td>De 400 001 à 500 000 Ar</td>
                      <td><strong>10%</strong></td>
                    </tr>
                    <tr>
                      <td>De 500 001 à 600 000 Ar</td>
                      <td><strong>15%</strong></td>
                    </tr>
                    <tr>
                      <td>De 600 001 à 4 000 000 Ar</td>
                      <td><strong>20%</strong></td>
                    </tr>
                    <tr>
                      <td>Plus de 4 000 000 Ar</td>
                      <td><strong>25%</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaieManagementPage;
