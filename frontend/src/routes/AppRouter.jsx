import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/frontoffice/HomePage';
import AnnoncesPage from '../pages/frontoffice/AnnoncesPage';
import PostulerPage from '../pages/frontoffice/PostulerPage';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<AnnoncesPage />} />
      <Route path="/annonces" element={<AnnoncesPage />} />
      <Route path="/annonces/:id/postuler" element={<PostulerPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;