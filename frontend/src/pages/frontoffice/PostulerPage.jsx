import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getAnnonceById,
  getCriteresByAnnonceId,
  getDiplomes,
  getDiplomesExigesByAnnonceId,
} from '../../services/backend/annonceService';
import { postulerAnnonce } from '../../services/backend/candidatService';
import {
  BuildingIcon,
  UserIcon,
  TagIcon,
  CalendarIcon,
  XIcon,
  UploadIcon,
  FileIcon,
} from '../../components/common/Icons';
import '../../styles/PostulerPage.css';

const PostulerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [annonce, setAnnonce] = useState(null);
  const [criteresProfil, setCriteresProfil] = useState([]);
  const [diplomes, setDiplomes] = useState([]);
  const [diplomesExiges, setDiplomesExiges] = useState([]);
  const [loadingAnnonce, setLoadingAnnonce] = useState(true);
  const [errorAnnonce, setErrorAnnonce] = useState(null);

  const fileInputRef = React.useRef(null);
  const [cvFile, setCvFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    datenaissance: '',
    adresse: '',
    cv: '',
    idDiplome: '',
  });

  const handleFileSelect = (file) => {
    if (!file) return;
    setCvFile(file);
    setFormData((prev) => ({ ...prev, cv: file.name }));
  };

  // Map des réponses aux critères : { [idCritere]: { valeurdouble, valeurvarchar, valeurbool, idDiplome } }
  const [criteresAnswers, setCriteresAnswers] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoadingAnnonce(true);
        const [dataAnnonce, dataCriteres, dataDiplomes, dataDiplomesExiges] = await Promise.all([
          getAnnonceById(id),
          getCriteresByAnnonceId(id),
          getDiplomes(),
          getDiplomesExigesByAnnonceId(id),
        ]);

        setAnnonce(dataAnnonce);
        setCriteresProfil(dataCriteres || []);
        setDiplomes(dataDiplomes || []);
        setDiplomesExiges(dataDiplomesExiges || []);
      } catch (err) {
        console.error("Erreur lors du chargement des données d'annonce :", err);
        setErrorAnnonce("Impossible de charger les détails de cette offre d'emploi.");
      } finally {
        setLoadingAnnonce(false);
      }
    };

    if (id) {
      fetchAllData();
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCriterionChange = (idCritere, field, value) => {
    setCriteresAnswers((prev) => ({
      ...prev,
      [idCritere]: {
        ...(prev[idCritere] || {}),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      // Formater la liste des critères pour le backend
      const criteresArray = Object.keys(criteresAnswers).map((idCritereStr) => ({
        idCritere: parseInt(idCritereStr, 10),
        ...criteresAnswers[idCritereStr],
      }));

      // Si le candidat a sélectionné son diplôme principal dans le formulaire, s'assurer qu'il est inclus dans les critères
      if (formData.idDiplome) {
        const diplomeCritereProfil = criteresProfil.find(
          (cp) => cp.critere?.typechamp?.libelle?.toLowerCase() === 'diplome'
        );

        const targetCritereId = diplomeCritereProfil
          ? diplomeCritereProfil.critere.id
          : (criteresProfil[0]?.critere?.id || 1);

        const existingIndex = criteresArray.findIndex((item) => item.idCritere === targetCritereId);
        if (existingIndex >= 0) {
          criteresArray[existingIndex].idDiplome = parseInt(formData.idDiplome, 10);
        } else {
          criteresArray.push({
            idCritere: targetCritereId,
            idDiplome: parseInt(formData.idDiplome, 10),
          });
        }
      }

      const payload = {
        idAnnonce: parseInt(id, 10),
        nom: formData.nom,
        prenom: formData.prenom,
        datenaissance: formData.datenaissance,
        adresse: formData.adresse,
        cv: formData.cv || `CV_${formData.nom}_${formData.prenom}.pdf`,
        criteres: criteresArray,
      };

      // Envoi multipart avec le fichier CV réel
      await postulerAnnonce(payload, cvFile);
      setSubmitted(true);
    } catch (err) {
      console.error('Erreur lors de la postulation :', err);
      setSubmitError(
        err.response?.data || "Une erreur est survenue lors de l'envoi de votre candidature."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAnnonce) {
    return (
      <div className="postuler-page-loading">
        <span className="spinner-dot"></span>
        Chargement de l'offre d'emploi et des prérequis de diplômes...
      </div>
    );
  }

  if (errorAnnonce || !annonce) {
    return (
      <div className="postuler-page-error">
        <h3>Offre introuvable</h3>
        <p>{errorAnnonce || "L'annonce demandée n'existe plus."}</p>
        <button className="btn-back-link" onClick={() => navigate('/annonces')}>
          ← Retour aux annonces
        </button>
      </div>
    );
  }

  return (
    <div className="postuler-page">
      {/* BANNIÈRE LINKEDIN PLEIN ÉCRAN */}
      <header className="postuler-header linkedin-banner">
        <div className="linkedin-banner-content">
          <Link to="/annonces" className="banner-breadcrumb-link">
            ← Retour à la liste des offres
          </Link>
          <h1>{annonce.nomposte}</h1>
          <p>
            {annonce.departement?.nom || 'Département RH'} • Candidature & Prérequis
          </p>
        </div>
      </header>

      {/* CONTENU PRINCIPAL PLEIN ÉCRAN */}
      <main className="postuler-content-container">
        <div className="postuler-layout">
          {/* COLONNE GAUCHE : DÉTAILS DE L'ANNONCE */}
          <article className="postuler-details-card linkedin-card">
            <header className="postuler-details__header">
              <div className="company-logo-avatar lg">
                <BuildingIcon size={24} />
              </div>
              <div>
                <h2 className="postuler-title">{annonce.nomposte}</h2>
                <span className="company-name text-lg">
                  {annonce.departement?.nom || 'Département RH'}
                </span>
              </div>
            </header>

          <div className="postuler-badges">
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

          <div className="postuler-dates-box">
            <div className="date-item">
              <CalendarIcon size={16} />
              <span>
                Publié le :{' '}
                <strong>
                  {annonce.datepublication
                    ? new Date(annonce.datepublication).toLocaleDateString('fr-FR')
                    : 'Non précisé'}
                </strong>
              </span>
            </div>

            {(annonce.datefin || annonce.dateFin) && (
              <div className="date-item date-limite-item">
                <CalendarIcon size={16} />
                <span>
                  Date limite de candidature :{' '}
                  <strong>
                    {new Date(annonce.datefin || annonce.dateFin).toLocaleDateString('fr-FR')}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* AFICHAGE DES DIPLÔMES EXIGÉS POUR LE PROFIL (ProfilDiplome) */}
          {diplomesExiges.length > 0 && (
            <div className="postuler-diplomes-exiges-box">
              <h4 className="diplomes-exiges-title">Diplôme(s) exigé(s) pour ce poste :</h4>
              <ul className="diplomes-exiges-list">
                {diplomesExiges.map((pd) => (
                  <li key={pd.id} className="diplome-exige-tag">
                    🎓 {pd.diplome?.nom}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="postuler-description-section">
            <h3>Description du poste</h3>
            <div className="description-content">
              {annonce.description ? (
                annonce.description.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))
              ) : (
                <p>Aucune description détaillée fournie pour ce poste.</p>
              )}
            </div>
          </div>
        </article>

        {/* COLONNE DROITE : FORMULAIRE DE CANDIDATURE */}
        <section className="postuler-form-card linkedin-card">
          <div className="form-card-header">
            <h2>Déposer votre candidature</h2>
            <p>Remplissez vos informations et répondez aux prérequis du poste.</p>
          </div>

          {submitted ? (
            <div className="postuler-success-box">
              <div className="success-icon-badge">✓</div>
              <h3>Candidature envoyée avec succès !</h3>
              <p>
                Votre dossier pour le poste de <strong>{annonce.nomposte}</strong> a bien été transmis à nos équipes RH.
              </p>
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                textAlign: 'left'
              }}>
                <strong style={{ color: '#1e40af', fontSize: '14px' }}>Compte candidat créé automatiquement :</strong>
                <p style={{ margin: '4px 0 0 0', color: '#1e3a8a', fontSize: '13px' }}>
                  <strong>Email & Mot de passe :</strong> {(formData.nom + formData.prenom).toLowerCase().replace(/[^a-z0-9]/g, '') || 'candidat'}@gmail.com
                </p>
              </div>
              <div className="success-actions" style={{ marginTop: '20px' }}>
                <button className="btn-linkedin-action" onClick={() => navigate('/annonces')}>
                  Retourner aux annonces
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="postuler-form">
              {submitError && <div className="form-error-alert">{submitError}</div>}

              {/* ZONE DE TÉLÉVERSEMENT DE CV AU DESSUS DU FORMULAIRE */}
              <div className="cv-upload-container">
                <label className="cv-upload-label">
                  Curriculum Vitae (CV) <span className="req-star">*</span>
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />

                {!cvFile && !formData.cv ? (
                  <div
                    className={`cv-dropzone ${isDragging ? 'dragging' : ''}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileSelect(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="dropzone-icon">
                      <UploadIcon size={32} />
                    </div>
                    <p className="dropzone-text">
                      <strong>Cliquez pour téléverser votre CV</strong> ou glissez-déposez le fichier ici
                    </p>
                    <span className="dropzone-hint">Formats acceptés : PDF, DOC, DOCX (Max 10 Mo)</span>
                  </div>
                ) : (
                  <div className="cv-file-selected-card">
                    <div className="file-info-left">
                      <div className="file-icon-badge">
                        <FileIcon size={22} />
                      </div>
                      <div className="file-details">
                        <span className="file-name">{cvFile ? cvFile.name : formData.cv}</span>
                        <span className="file-status">
                          {cvFile ? `${(cvFile.size / 1024).toFixed(1)} KB — Prêt` : 'Fichier attaché'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-remove-cv"
                      onClick={() => {
                        setCvFile(null);
                        setFormData((prev) => ({ ...prev, cv: '' }));
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      title="Supprimer / Changer de fichier"
                    >
                      <XIcon size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* COORDONNÉES */}
              <div className="form-section-title">
                <span>1</span> Informations du Candidat
              </div>

              <div className="form-group">
                <label htmlFor="nom">Nom *</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  required
                  placeholder="Ex: RAKOTO"
                  value={formData.nom}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="prenom">Prénom *</label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  required
                  placeholder="Ex: Jean Luc"
                  value={formData.prenom}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="datenaissance">Date de naissance</label>
                <input
                  type="date"
                  id="datenaissance"
                  name="datenaissance"
                  value={formData.datenaissance}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="adresse">Adresse / Ville</label>
                <input
                  type="text"
                  id="adresse"
                  name="adresse"
                  placeholder="Ex: Antananarivo"
                  value={formData.adresse}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="idDiplome">Diplôme le plus élevé *</label>
                <select
                  id="idDiplome"
                  name="idDiplome"
                  required
                  value={formData.idDiplome}
                  onChange={handleChange}
                >
                  <option value="">-- Sélectionnez votre diplôme --</option>
                  {diplomes.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nom}
                    </option>
                  ))}
                </select>
                {diplomesExiges.length > 0 && (
                  <span className="critere-hint highlight-hint">
                    🎓 Niveau attendu par le recruteur : <strong>{diplomesExiges.map(de => de.diplome?.nom).filter(Boolean).join(', ')}</strong>
                  </span>
                )}
              </div>

              {/* CRITÈRES & PRÉREQUIS DU POSTE */}
              {criteresProfil.length > 0 && (
                <div className="criteres-section">
                  <div className="form-section-title">
                    <span>2</span> Prérequis & Critères du Poste
                  </div>

                  {criteresProfil.map((cp) => {
                    if (!cp.critere) return null;
                    const critereId = cp.critere.id;
                    const typeLibelle = cp.critere.typechamp?.libelle?.toLowerCase() || '';

                    return (
                      <div key={cp.id} className="form-group critere-group">
                        <label className="critere-label">
                          {cp.critere.nom}
                          {cp.estobligatoire && <span className="req-star"> *</span>}
                        </label>

                        {/* Champ selon le Type de Champ */}
                        {typeLibelle === 'nombre' && (
                          <div>
                            <input
                              type="number"
                              step="any"
                              placeholder={
                                cp.valeurdouble
                                  ? `Exigence min : ${cp.valeurdouble}`
                                  : 'Saisissez un nombre'
                              }
                              value={criteresAnswers[critereId]?.valeurdouble || ''}
                              onChange={(e) =>
                                handleCriterionChange(critereId, 'valeurdouble', e.target.value)
                              }
                              required={cp.estobligatoire}
                            />
                            {cp.valeurdouble && (
                              <span className="critere-hint">
                                Exigence minimale du poste : {cp.valeurdouble}
                              </span>
                            )}
                          </div>
                        )}

                        {typeLibelle === 'diplome' && (
                          <div>
                            <select
                              value={criteresAnswers[critereId]?.idDiplome || ''}
                              onChange={(e) =>
                                handleCriterionChange(critereId, 'idDiplome', e.target.value)
                              }
                              required={cp.estobligatoire}
                            >
                              <option value="">-- Sélectionnez votre diplôme --</option>
                              {diplomes.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.nom}
                                </option>
                              ))}
                            </select>
                            {diplomesExiges.length > 0 && (
                              <span className="critere-hint">
                                Diplôme(s) attendu(s) : {diplomesExiges.map(de => de.diplome?.nom).filter(Boolean).join(', ')}
                              </span>
                            )}
                          </div>
                        )}

                        {typeLibelle === 'booleen' && (
                          <div className="radio-bool-group">
                            <label className="radio-bool-option">
                              <input
                                type="radio"
                                name={`critere_${critereId}`}
                                checked={criteresAnswers[critereId]?.valeurbool === true}
                                onChange={() =>
                                  handleCriterionChange(critereId, 'valeurbool', true)
                                }
                                required={cp.estobligatoire}
                              />
                              Oui
                            </label>
                            <label className="radio-bool-option">
                              <input
                                type="radio"
                                name={`critere_${critereId}`}
                                checked={criteresAnswers[critereId]?.valeurbool === false}
                                onChange={() =>
                                  handleCriterionChange(critereId, 'valeurbool', false)
                                }
                                required={cp.estobligatoire}
                              />
                              Non
                            </label>
                          </div>
                        )}

                        {(typeLibelle === 'texte' ||
                          (typeLibelle !== 'nombre' &&
                            typeLibelle !== 'diplome' &&
                            typeLibelle !== 'booleen')) && (
                          <input
                            type="text"
                            placeholder="Votre réponse..."
                            value={criteresAnswers[critereId]?.valeurvarchar || ''}
                            onChange={(e) =>
                              handleCriterionChange(critereId, 'valeurvarchar', e.target.value)
                            }
                            required={cp.estobligatoire}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <button type="submit" className="btn-submit-candidature" disabled={submitting}>
                {submitting ? 'Transmission en cours...' : 'Envoyer ma candidature'}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  </div>
);
};

export default PostulerPage;
