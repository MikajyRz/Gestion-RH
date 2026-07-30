import React, { useState, useEffect } from 'react';
import { rechercherAnnonces } from '../../services/backend/annonceService';
import { backendClient } from '../../services/backend/backendClient';
import '../../styles/Backoffice.css';
import '../../styles/DashboardPage.css';

const DashboardPage = () => {
  const [annoncesCount, setAnnoncesCount] = useState(0);
  const [candidats, setCandidats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [annoncesData, candidatsRes] = await Promise.all([
          rechercherAnnonces(),
          backendClient.get('/api/candidats').catch(() => ({ data: [] }))
        ]);

        setAnnoncesCount(annoncesData.length || 0);
        setCandidats(candidatsRes.data || []);
      } catch (err) {
        console.error("Erreur chargement dashboard :", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="backoffice-page">
      {/* BANNIÈRE STYLE LINKEDIN CORPORATE */}
      <header className="backoffice-banner">
        <div className="backoffice-banner-content">
          <h1>Tableau de bord - Administration RH</h1>
          <p>Vue d'ensemble de la gestion des annonces, des candidatures et du suivi de recrutement.</p>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <div className="dashboard-container">
        {/* CARTES DE STATISTIQUES */}
        <div className="stats-grid">
          <div className="stat-card-linkedin">
            <div className="stat-info">
              <h4>Offres actives</h4>
              <p className="stat-value">{annoncesCount}</p>
            </div>
          </div>

          <div className="stat-card-linkedin">
            <div className="stat-info">
              <h4>Candidatures reçues</h4>
              <p className="stat-value">{candidats.length}</p>
            </div>
          </div>

          <div className="stat-card-linkedin">
            <div className="stat-info">
              <h4>Entretiens prévus</h4>
              <p className="stat-value">1</p>
            </div>
          </div>

          <div className="stat-card-linkedin">
            <div className="stat-info">
              <h4>Postes à pourvoir</h4>
              <p className="stat-value">3</p>
            </div>
          </div>
        </div>

        {/* TABLE DES CANDIDATURES RÉCENTES */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem 1.75rem',
          border: '1px solid #e0e0e0',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Dernières Candidatures Reçues
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Mise à jour en temps réel
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#0a66c2' }}>
              Chargement des candidatures...
            </div>
          ) : candidats.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              Aucune candidature enregistrée pour le moment.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Candidat</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Poste Visé</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Statut</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Fichier CV</th>
                  </tr>
                </thead>
                <tbody>
                  {candidats.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem' }}>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#0f172a' }}>
                        {c.nom} {c.prenom}
                      </td>
                      <td style={{ padding: '1rem', color: '#334155' }}>
                        {c.annonce?.nomposte || 'Offre Générale'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          backgroundColor: '#eff6ff',
                          color: '#0a66c2',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          {c.statut?.nom || 'En attente'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#0a66c2' }}>
                        {c.cv ? c.cv.split('/').pop() : 'CV non joint'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
