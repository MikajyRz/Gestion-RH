import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { backofficeAuthService } from '../../services/backofficeAuthService';
import '../../styles/Backoffice.css';

function BackofficeLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = backofficeAuthService.getUser();

  const handleLogout = () => {
    backofficeAuthService.logout();
    navigate('/backoffice');
  };

  return (
    <div className="backoffice-shell">
      {/* SIDEBAR NAVIGATION STYLE LINKEDIN CORPORATE */}
      <aside className="backoffice-sidebar">
        <div>
          <div className="backoffice-sidebar__brand">
            <div className="brand-badge">RH</div>
            <div className="brand-title">Backoffice RH</div>
          </div>

          {user && (
            <div style={{
              margin: '1rem 0 0.5rem 0',
              padding: '0.75rem',
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
              border: '1px solid #bfdbfe'
            }}>
              <span style={{ fontSize: '0.8rem', color: '#1e40af', display: 'block', fontWeight: '600' }}>
                Connecté en tant que :
              </span>
              <strong style={{ fontSize: '0.9rem', color: '#1e3a8a' }}>
                {user.prenom ? `${user.prenom} ${user.nom}` : user.email}
              </strong>
            </div>
          )}

          <nav className="backoffice-nav">
            <Link
              to="/backoffice/dashboard"
              className={`nav-item-linkedin ${location.pathname.includes('/dashboard') ? 'active' : ''}`}
            >
              📊 Tableau de bord
            </Link>
            <Link
              to="/backoffice/annonces"
              className={`nav-item-linkedin ${location.pathname.includes('/annonces') ? 'active' : ''}`}
            >
              📢 Gestion des Annonces
            </Link>
            <Link
              to="/backoffice/candidats"
              className={`nav-item-linkedin ${location.pathname.includes('/candidats') ? 'active' : ''}`}
            >
              👥 Suivi Candidatures (ATS)
            </Link>
            <Link
              to="/backoffice/referentiels"
              className={`nav-item-linkedin ${location.pathname.includes('/referentiels') ? 'active' : ''}`}
            >
              🏢 Référentiels Métiers
            </Link>
            <Link
              to="/backoffice/criteres"
              className={`nav-item-linkedin ${location.pathname.includes('/criteres') ? 'active' : ''}`}
            >
              ⚙️ Formulaires Dynamiques
            </Link>
            <Link
              to="/annonces"
              className="nav-item-linkedin"
            >
              🌐 Voir le Frontoffice
            </Link>
          </nav>
        </div>

        <button className="btn-linkedin-logout" onClick={handleLogout}>
          🚪 Déconnexion
        </button>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="backoffice-main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default BackofficeLayout;
