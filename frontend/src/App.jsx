import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { DashboardView } from './views/DashboardView';
import { AuthView } from './views/AuthView';
import { ComplaintsView } from './views/ComplaintsView';
import { BookingsView } from './views/BookingsView';
import { NoticesView } from './views/NoticesView';
import { PaymentsView } from './views/PaymentsView';
import { PollsView } from './views/PollsView';
import { ServiceRequestsView } from './views/ServiceRequestsView';
import { VisitorsView } from './views/VisitorsView';
import { VehiclesView } from './views/VehiclesView';
import { MaintenanceView } from './views/MaintenanceView';
import { BylawsView } from './views/BylawsView';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthView />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardView />} />
        <Route path="complaints" element={<ComplaintsView />} />
        <Route path="bookings" element={<BookingsView />} />
        <Route path="notices" element={<NoticesView />} />
        <Route path="payments" element={<PaymentsView />} />
        <Route path="polls" element={<PollsView />} />
        <Route path="service-requests" element={<ServiceRequestsView />} />
        <Route path="visitors" element={<VisitorsView />} />
        <Route path="vehicles" element={<VehiclesView />} />
        <Route path="maintenance" element={<MaintenanceView />} />
        <Route path="bylaws" element={<BylawsView />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
