import React, { useState, useEffect } from 'react';
import {
  rechercherAnnonces,
  getDepartements,
  getProfils,
  getTypesAnnonce,
} from '../services/backend/annonceService';
import {
  SearchIcon,
  BuildingIcon,
  UserIcon,
  TagIcon,
  CalendarIcon,
  FilterIcon,
  XIcon,
} from '../components/common/Icons';
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
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Variable de référence pour ignorer les réponses périmées de requêtes obsolètes
  const currentSearchId = React.useRef(0);

  useEffect(() => {
    // Charger les options de filtre au démarrage
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
      } catch (error) {
        console.error("Erreur d'initialisation :", error);
      }
    };

    chargerDonneesInitiales();
  }, []);

  // Recherche instantanée automatique à chaque modification des filtres (avec debounce optimisé de 300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      chargerAnnonces(filtres);
    }, 300);

    return () => clearTimeout(timer);
  }, [filtres]);

  const chargerAnnonces = async (filtresAppliques) => {
    const searchId = ++currentSearchId.current;
    setIsSearching(true);

    try {
      const data = await rechercherAnnonces(filtresAppliques);
      // Ne mettre à jour le state que si cette réponse correspond à la toute dernière recherche demandée
      if (searchId === currentSearchId.current) {
        setAnnonces(data);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche des annonces :", error);
    } finally {
      if (searchId === currentSearchId.current) {
        setIsSearching(false);
        setInitialLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    setFiltres({ ...filtres, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFiltres(initialFiltres);
  };

  const activeFilterKeys = Object.keys(filtres).filter((key) => filtres[key] !== '');
  const activeCount = activeFilterKeys.length;

  return (
    <div className="annonces-page">
      {/* BANNIÈRE STYLE CORPORATE / LINKEDIN */}
      <header className="annonces-header linkedin-banner">
        <div className="linkedin-banner-content">
          <h1>Trouvez votre prochaine opportunité professionnelle</h1>
          <p>Explorez les offres d'emploi en direct et découvrez le poste qui vous correspond.</p>
        </div>
      </header>

      {/* BARRE DE RECHERCHE MULTICRITÈRE EN HAUT (FULL SCREEN) */}
      <section className="annonces-top-filters">
        <div className="filters-card">
          <div className="filters-card-header">
            <div className="filters-card-title">
              <FilterIcon />
              <h5>Recherche Multicritère</h5>
              {isSearching && (
                <span className="inline-search-badge" title="Recherche en cours...">
                  <span className="spinner-dot-small"></span>
                  Actualisation...
                </span>
              )}
            </div>

            {activeCount > 0 && (
              <button type="button" className="btn-reset-link" onClick={handleReset}>
                <XIcon /> Réinitialiser tout
              </button>
            )}
          </div>

          <form className="filters-horizontal-form" onSubmit={(e) => e.preventDefault()}>
            <div className="filter-group">
              <label htmlFor="motCle">
                <SearchIcon /> Mot-clé
              </label>

              <input
                type="text"
                id="motCle"
                name="motCle"
                className="filter-input"
                placeholder="Poste, compétence..."
                value={filtres.motCle}
                onChange={handleChange}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="idDepartement">
                <BuildingIcon /> Département
              </label>
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
              <label htmlFor="idProfil">
                <UserIcon /> Profil / Métier
              </label>
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
              <label htmlFor="idTypeAnnonce">
                <TagIcon /> Type d'Annonce
              </label>
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
              <label htmlFor="dateDebut">
                <CalendarIcon /> Date Début
              </label>
              <input
                type="date"
                id="dateDebut"
                name="dateDebut"
                className="filter-input"
                value={filtres.dateDebut}
                onChange={handleChange}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="dateFin">
                <CalendarIcon /> Date Fin
              </label>
              <input
                type="date"
                id="dateFin"
                name="dateFin"
                className="filter-input"
                value={filtres.dateFin}
                onChange={handleChange}
              />
            </div>
          </form>


        </div>
      </section>

      {/* LISTE DES ANNONCES */}
      <main className="annonces-list">
        {initialLoading ? (
          <div className="loading-indicator">
            <span className="spinner-dot"></span>
            Chargement des offres en cours...
          </div>
        ) : annonces.length === 0 ? (
          <div className="no-results">
            <p className="no-results-title">Aucune offre ne correspond à vos critères</p>
          </div>
        ) : (
          <>
            <div className="results-header">
              <p className="results-count">
                <strong>{annonces.length}</strong> offre{annonces.length > 1 ? 's' : ''} disponible{annonces.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className={`annonces-grid ${isSearching ? 'is-searching-grid' : ''}`}>
              {annonces.map((annonce) => (
                <article key={annonce.id} className="annonce-card linkedin-card">
                  <div className="annonce-card__header">
                    <div className="company-logo-avatar">
                      <BuildingIcon />
                    </div>
                    <div className="annonce-card__header-info">
                      <h5 className="annonce-card__title">{annonce.nomposte}</h5>
                      <span className="company-name">
                        {annonce.departement?.nom || 'Département N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="annonce-card__badges">
                    {annonce.typeannonce?.libelle && (
                      <span className="linkedin-pill type-pill">
                        <TagIcon /> {annonce.typeannonce.libelle}
                      </span>
                    )}
                    {annonce.profil?.nom && (
                      <span className="linkedin-pill profil-pill">
                        <UserIcon /> {annonce.profil.nom}
                      </span>
                    )}
                  </div>

                  <p className="annonce-card__description">
                    {annonce.description?.length > 180
                      ? `${annonce.description.substring(0, 180)}...`
                      : annonce.description}
                  </p>

                  <footer className="annonce-card__footer">
                    <span className="annonce-card__date">
                      {annonce.datepublication
                        ? `Publié le ${new Date(annonce.datepublication).toLocaleDateString('fr-FR')}`
                        : 'Date non précisée'}
                    </span>
                    <button className="btn-linkedin-action">Postuler</button>
                  </footer>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AnnoncesPage;