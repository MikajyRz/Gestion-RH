import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import BackofficeLayout from '../components/layouts/BackofficeLayout';
import BackofficeLogin from '../pages/backoffice/BackofficeLogin';
import DashboardPage from '../pages/backoffice/DashboardPage';
import AnnoncesManagementPage from '../pages/backoffice/AnnoncesManagementPage';
import ReferentielsPage from '../pages/backoffice/ReferentielsPage';
import CritereManagerPage from '../pages/backoffice/CritereManagerPage';

import HomePage from '../pages/frontoffice/HomePage';
import AnnoncesPage from '../pages/frontoffice/AnnoncesPage';
import PostulerPage from '../pages/frontoffice/PostulerPage';

import { backofficeAuthService } from '../services/backofficeAuthService';

const ProtectedBackofficeRoute = () => {
  if (!backofficeAuthService.isAuthenticated()) {
    return <Navigate to="/backoffice" replace />;
  }

  return <BackofficeLayout />;
};

export const AppRouter = () => {
  return (
    <Routes>
      {/* Frontoffice Routes */}
      <Route path="/" element={<AnnoncesPage />} />
      <Route path="/annonces" element={<AnnoncesPage />} />
      <Route path="/annonces/:id/postuler" element={<PostulerPage />} />
      <Route path="/home" element={<HomePage />} />

      {/* Backoffice Login */}
      <Route path="/backoffice" element={<BackofficeLogin />} />

      {/* Protected Backoffice Routes */}
      <Route path="/backoffice" element={<ProtectedBackofficeRoute />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="annonces" element={<AnnoncesManagementPage />} />
        <Route path="referentiels" element={<ReferentielsPage />} />
        <Route path="criteres" element={<CritereManagerPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;