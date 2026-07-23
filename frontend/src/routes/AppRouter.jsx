import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import AnnoncesPage from '../pages/AnnoncesPage';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<AnnoncesPage />} />
      <Route path="/annonces" element={<AnnoncesPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;