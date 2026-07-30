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

  const userInitial = user?.prenom ? user.prenom.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'RH');

  return (
    <div className="backoffice-shell">
      {/* SIDEBAR NAVIGATION STYLE DOLIBARR ERP */}
      <aside className="backoffice-sidebar">
        <div>
          {/* LOGO & BRANDING DOLIBARR ERP */}
          <div className="backoffice-sidebar__brand">
            <div className="brand-badge-linkedin">ERP</div>
            <div>
              <div className="brand-title-linkedin">Gestion RH</div>
              <div className="brand-subtitle-linkedin">Dolibarr RH Suite</div>
            </div>
          </div>

          {/* FICHE UTILISATEUR CONNECTÉ */}
          {user && (
            <div className="user-profile-widget-linkedin">
              <div className="user-avatar-linkedin">
                {userInitial}
              </div>
              <div className="user-info-linkedin">
                <span className="user-label-linkedin">Session active</span>
                <strong className="user-name-linkedin">
                  {user.prenom ? `${user.prenom} ${user.nom}` : user.email}
                </strong>
                <span className="user-role-badge">Administrateur RH</span>
              </div>
            </div>
          )}

          {/* SÉPARATEUR ET NAVIGATION */}
          <div className="nav-section-title">MENUS D'ADMINISTRATION</div>

          <nav className="backoffice-nav">
            <Link
              to="/backoffice/dashboard"
              className={`nav-item-linkedin ${location.pathname.includes('/dashboard') ? 'active' : ''}`}
            >
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Tableau de bord</span>
            </Link>
            <Link
              to="/backoffice/annonces"
              className={`nav-item-linkedin ${location.pathname.includes('/annonces') ? 'active' : ''}`}
            >
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>Gestion des Annonces</span>
            </Link>
            <Link
              to="/backoffice/candidats"
              className={`nav-item-linkedin ${location.pathname.includes('/candidats') ? 'active' : ''}`}
            >
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>Suivi Candidatures (ATS)</span>
            </Link>
            <Link
              to="/backoffice/qcm"
              className={`nav-item-linkedin ${location.pathname.includes('/qcm') ? 'active' : ''}`}
            >
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              <span>Tests QCM & Évaluations</span>
            </Link>
            <Link
              to="/backoffice/entretiens"
              className={`nav-item-linkedin ${location.pathname.includes('/entretiens') ? 'active' : ''}`}
            >
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Planning Entretiens</span>
            </Link>

            <div className="nav-section-title" style={{ marginTop: '1.25rem' }}>RÉFÉRENTIELS & CONFIGURATION</div>

            <Link
              to="/backoffice/referentiels"
              className={`nav-item-linkedin ${location.pathname.includes('/referentiels') ? 'active' : ''}`}
            >
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span>Référentiels Métiers</span>
            </Link>
            <Link
              to="/backoffice/criteres"
              className={`nav-item-linkedin ${location.pathname.includes('/criteres') ? 'active' : ''}`}
            >
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
              <span>Formulaires Dynamiques</span>
            </Link>

            <div className="nav-section-title" style={{ marginTop: '1.25rem' }}>LIENS EXTERNES</div>

            <Link
              to="/annonces"
              className="nav-item-linkedin nav-item-external"
            >
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              <span>Voir le Frontoffice</span>
            </Link>
          </nav>
        </div>

        <button className="btn-linkedin-logout-sidebar" onClick={handleLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Déconnexion
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
