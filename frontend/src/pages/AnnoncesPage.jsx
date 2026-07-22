import React, { useState, useEffect } from 'react';
import {
  rechercherAnnonces,
  getDepartements,
  getProfils,
  getTypesAnnonce,
} from '../services/backend/annonceService';
import '../styles/AnnoncesPage.css';

const AnnoncesPage = () => {
  const initialFiltres = {
    motCle: '',
    idDepartement: '',
    idProfil: '',
    idTypeAnnonce: '',
    dateDebut: '',
    dateFin: '',
  };

  const [filtres, setFiltres] = useState(initialFiltres);
  const [annonces, setAnnonces] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [profils, setProfils] = useState([]);
  const [typesAnnonce, setTypesAnnonce] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger les filtres et initialiser TOUTE la liste au démarrage
    const chargerDonneesInitiales = async () => {
      try {
        const [deps, profs, types] = await Promise.all([
          getDepartements(),
          getProfils(),
          getTypesAnnonce(),
        ]);
        setDepartements(deps);
        setProfils(profs);
        setTypesAnnonce(types);

        // Affiche la liste complète par défaut
        await chargerAnnonces({});
      } catch (error) {
        console.error("Erreur d'initialisation :", error);
      } finally {
        setLoading(false);
      }
    };

    chargerDonneesInitiales();
  }, []);

  const chargerAnnonces = async (filtresAppliques) => {
    setLoading(true);
    try {
      const data = await rechercherAnnonces(filtresAppliques);
      setAnnonces(data);
    } catch (error) {
      console.error("Erreur lors de la recherche des annonces :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFiltres({ ...filtres, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    chargerAnnonces(filtres);
  };

  const handleReset = () => {
    setFiltres(initialFiltres);
    chargerAnnonces({}); // Recharge la liste complète
  };

  return (
    <div className="annonces-page">
      <header className="annonces-header">
        <h1>Trouvez votre prochaine opportunité</h1>
        <p>Parcourez nos offres d'emploi et trouvez le poste qui vous correspond.</p>
      </header>

      <div className="annonces-container">
        {/* FILTRES DE RECHERCHE */}
        <aside className="annonces-filters">
          <div className="filters-card">
            <h5>🔍 Recherche Multicritère</h5>
            <form onSubmit={handleSubmit}>
              <div className="filter-group">
                <label htmlFor="motCle">Mot-clé</label>
                <input
                  type="text"
                  id="motCle"
                  name="motCle"
                  className="filter-input"
                  placeholder="Ex: Développeur, Gardien..."
                  value={filtres.motCle}
                  onChange={handleChange}
                />
              </div>

              <div className="filter-group">
                <label htmlFor="idDepartement">Département</label>
                <select
                  id="idDepartement"
                  name="idDepartement"
                  className="filter-select"
                  value={filtres.idDepartement}
                  onChange={handleChange}
                >
                  <option value="">Tous les départements</option>
                  {departements.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="idProfil">Profil / Métier</label>
                <select
                  id="idProfil"
                  name="idProfil"
                  className="filter-select"
                  value={filtres.idProfil}
                  onChange={handleChange}
                >
                  <option value="">Tous les profils</option>
                  {profils.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="idTypeAnnonce">Type d'Annonce</label>
                <select
                  id="idTypeAnnonce"
                  name="idTypeAnnonce"
                  className="filter-select"
                  value={filtres.idTypeAnnonce}
                  onChange={handleChange}
                >
                  <option value="">Tous les types</option>
                  {typesAnnonce.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.libelle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Date de publication</label>
                <input
                  type="date"
                  name="dateDebut"
                  className="filter-input"
                  value={filtres.dateDebut}
                  onChange={handleChange}
                  style={{ marginBottom: '0.5rem' }}
                />
                <input
                  type="date"
                  name="dateFin"
                  className="filter-input"
                  value={filtres.dateFin}
                  onChange={handleChange}
                />
              </div>

              <div className="filter-actions">
                <button type="submit" className="btn btn-primary">
                  Rechercher
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleReset}>
                  Voir toutes les annonces
                </button>
              </div>
            </form>
          </div>
        </aside>

        {/* LISTE DES ANNONCES */}
        <main className="annonces-list">
          {loading ? (
            <div className="loading-indicator">Chargement des annonces...</div>
          ) : annonces.length === 0 ? (
            <div className="no-results">Aucune annonce trouvée pour ces critères.</div>
          ) : (
            <>
              <p className="results-count">
                <strong>{annonces.length}</strong> annonce(s) disponible(s)
              </p>

              {annonces.map((annonce) => (
                <article key={annonce.id} className="annonce-card">
                  <h5 className="annonce-card__title">{annonce.nomposte}</h5>
                  <div className="annonce-card__subtitle">
                    <span>
                      🏢 {annonce.departement?.nom || 'Département N/A'} • 📜 {annonce.typeannonce?.libelle || 'Type N/A'}
                    </span>
                  </div>
                  <p className="annonce-card__description">
                    {annonce.description?.length > 180
                      ? `${annonce.description.substring(0, 180)}...`
                      : annonce.description}
                  </p>
                  <footer className="annonce-card__footer">
                    <span className="annonce-card__date">
                      Publié le : {new Date(annonce.datepublication).toLocaleDateString() || 'Non précisé'}
                    </span>
                    <button className="btn annonce-card__action">Voir les détails & Postuler</button>
                  </footer>
                </article>
              ))}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AnnoncesPage;