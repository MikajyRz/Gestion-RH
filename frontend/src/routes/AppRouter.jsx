import { Routes, Route } from 'react-router-dom';
import FrontofficeLayout from '../components/layouts/FrontofficeLayout';
import HomePage from '../pages/HomePage';
import AnnoncesPage from '../pages/AnnoncesPage';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Frontoffice : Portail Candidat Public */}
      <Route element={<FrontofficeLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/annonces" element={<AnnoncesPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;