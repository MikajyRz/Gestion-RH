import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { backofficeAuthService } from '../../services/backofficeAuthService';
import '../../styles/Backoffice.css';
import '../../styles/BackofficeLogin.css';

const BackofficeLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [motdepasse, setMotdepasse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await backofficeAuthService.login(email, motdepasse);
      navigate('/backoffice/dashboard');
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backoffice-login-wrapper">
      <div className="backoffice-login-card">
        <div className="backoffice-login-card__header">
          <div className="backoffice-login-card__logo">
            in
          </div>
          <h2>Administration RH</h2>
          <p>Espace sécurisé - Connexion au Backoffice</p>
        </div>

        <div className="backoffice-login-card__body">
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b42318',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="backoffice-login-form">
            <div className="form-group-linkedin">
              <label htmlFor="login-email">Adresse Email Utilisateur RH</label>
              <input
                id="login-email"
                type="email"
                placeholder="Ex: admin@gestionrh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group-linkedin">
              <label htmlFor="login-password">Mot de passe</label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={motdepasse}
                onChange={(e) => setMotdepasse(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-linkedin-primary" disabled={loading} style={{ marginTop: '10px' }}>
              {loading ? 'Connexion en cours...' : 'Se connecter au Backoffice'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <small style={{ color: '#64748b' }}>Système de Gestion RH © 2026</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackofficeLogin;
