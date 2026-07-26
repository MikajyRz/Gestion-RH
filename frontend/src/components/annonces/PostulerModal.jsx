import React, { useState } from 'react';
import { postulerAnnonce } from '../../services/backend/candidatService';
import { XIcon, BuildingIcon, UserIcon, CalendarIcon } from '../common/Icons';

const PostulerModal = ({ annonce, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    datenaissance: '',
    adresse: '',
    cv: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!annonce) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const payload = {
        idAnnonce: annonce.id,
        nom: formData.nom,
        prenom: formData.prenom,
        datenaissance: formData.datenaissance,
        adresse: formData.adresse,
        cv: formData.cv || `CV_${formData.nom}_${formData.prenom}.pdf`,
      };

      await postulerAnnonce(payload);
      setIsSubmitted(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Erreur lors de la postulation :', err);
      setErrorMsg(
        err.response?.data || 'Une erreur est survenue lors de l\'envoi de votre candidature.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container linkedin-modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div>
            <h3 className="modal-title">Postuler à l'offre</h3>
            <p className="modal-subtitle">
              <strong>{annonce.nomposte}</strong> — {annonce.departement?.nom || 'Département RH'}
            </p>
          </div>
          <button className="btn-close-modal" onClick={onClose} aria-label="Fermer">
            <XIcon size={18} />
          </button>
        </header>

        {isSubmitted ? (
          <div className="modal-success-state">
            <div className="success-icon-badge">✓</div>
            <h4>Candidature transmise avec succès !</h4>
            <p>
              Votre candidature pour le poste de <strong>{annonce.nomposte}</strong> a bien été enregistrée. Notre équipe RH étudiera votre profil sous peu.
            </p>
            <button className="btn-linkedin-action" onClick={onClose}>
              Fermer
            </button>
          </div>
        ) : (
          <form className="modal-form" onSubmit={handleSubmit}>
            {errorMsg && <div className="modal-error-alert">{errorMsg}</div>}

            <div className="form-row-2">
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
            </div>

            <div className="form-row-2">
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
                  placeholder="Ex: Antananarivo, Madagascar"
                  value={formData.adresse}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="cv">Lien ou nom du fichier CV</label>
              <input
                type="text"
                id="cv"
                name="cv"
                placeholder="Ex: cv_jean_luc_2026.pdf ou https://..."
                value={formData.cv}
                onChange={handleChange}
              />
            </div>

            <div className="modal-footer-actions">
              <button type="button" className="btn-modal-cancel" onClick={onClose} disabled={loading}>
                Annuler
              </button>
              <button type="submit" className="btn-linkedin-action" disabled={loading}>
                {loading ? 'Envoi en cours...' : 'Envoyer ma candidature'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PostulerModal;
