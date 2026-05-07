import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import Login from '../pages/admin/Login';
import Register from '../pages/admin/Register';
import Dashboard from '../pages/admin/Dashboard';

import HeroSectionAdmin from '../pages/admin/HeroSectionAdmin';
import StatSectionAdmin from '../pages/admin/StatSectionAdmin';
import ResultSectionAdmin from '../pages/admin/ResultSectionAdmin';
import ProtocolSectionAdmin from '../pages/admin/ProtocolSectionAdmin';
import PackagesSectionAdmin from '../pages/admin/PackagesSectionAdmin';
import FaqsSectionAdmin from '../pages/admin/FaqsSectionAdmin';
import ClientsSectionAdmin from '../pages/admin/ClientsSectionAdmin';
import ContactSectionAdmin from '../pages/admin/ContactSectionAdmin';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/hero-section" element={<HeroSectionAdmin />} />
        <Route path="/stat-section" element={<StatSectionAdmin />} />
        <Route path="/result-section" element={<ResultSectionAdmin />} />
        <Route path="/protocol-section" element={<ProtocolSectionAdmin />} />
        <Route path="/packages-section" element={<PackagesSectionAdmin />} />
        <Route path="/faqs-section" element={<FaqsSectionAdmin />} />
        <Route path="/clients-section" element={<ClientsSectionAdmin />} />
        <Route path="/contact-section" element={<ContactSectionAdmin />} />
      </Route>
    </Routes>
  );
}
