import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import AdminRoutes from './AdminRoutes';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tbp-admin/*" element={<AdminRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}
