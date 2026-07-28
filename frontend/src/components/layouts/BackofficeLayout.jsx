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
      {/* SIDEBAR NAVIGATION STYLE LINKEDIN CORPORATE */}
      <aside className="backoffice-sidebar">
        <div>
          {/* LOGO & BRANDING LINKEDIN */}
          <div className="backoffice-sidebar__brand">
            <div className="brand-badge-linkedin">in</div>
            <div>
              <div className="brand-title-linkedin">Gestion RH</div>
              <div className="brand-subtitle-linkedin">Talent Solutions</div>
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
              <span>Tableau de bord</span>
            </Link>
            <Link
              to="/backoffice/annonces"
              className={`nav-item-linkedin ${location.pathname.includes('/annonces') ? 'active' : ''}`}
            >
              <span>Gestion des Annonces</span>
            </Link>
            <Link
              to="/backoffice/candidats"
              className={`nav-item-linkedin ${location.pathname.includes('/candidats') ? 'active' : ''}`}
            >
              <span>Suivi Candidatures (ATS)</span>
            </Link>
            <Link
              to="/backoffice/qcm"
              className={`nav-item-linkedin ${location.pathname.includes('/qcm') ? 'active' : ''}`}
            >
              <span>Tests QCM & Évaluations</span>
            </Link>
            <Link
              to="/backoffice/entretiens"
              className={`nav-item-linkedin ${location.pathname.includes('/entretiens') ? 'active' : ''}`}
            >
              <span>Planning Entretiens</span>
            </Link>

            <div className="nav-section-title" style={{ marginTop: '1.25rem' }}>RÉFÉRENTIELS & CONFIGURATION</div>

            <Link
              to="/backoffice/referentiels"
              className={`nav-item-linkedin ${location.pathname.includes('/referentiels') ? 'active' : ''}`}
            >
              <span>Référentiels Métiers</span>
            </Link>
            <Link
              to="/backoffice/criteres"
              className={`nav-item-linkedin ${location.pathname.includes('/criteres') ? 'active' : ''}`}
            >
              <span>Formulaires Dynamiques</span>
            </Link>

            <div className="nav-section-title" style={{ marginTop: '1.25rem' }}>LIENS EXTERNES</div>

            <Link
              to="/annonces"
              className="nav-item-linkedin nav-item-external"
            >
              <span>Voir le Frontoffice</span>
            </Link>
          </nav>
        </div>

        <button className="btn-linkedin-logout-sidebar" onClick={handleLogout}>
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
