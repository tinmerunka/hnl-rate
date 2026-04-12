import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import Clubs from './pages/dashboard/Clubs';
import Matches from './pages/dashboard/Matches';
import Players from './pages/dashboard/Players';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function DashboardRoute({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login"              element={<Login />} />
          <Route path="/dashboard"          element={<DashboardRoute><Dashboard /></DashboardRoute>} />
          <Route path="/dashboard/clubs"    element={<DashboardRoute><Clubs /></DashboardRoute>} />
          <Route path="/dashboard/matches"  element={<DashboardRoute><Matches /></DashboardRoute>} />
          <Route path="/dashboard/players"  element={<DashboardRoute><Players /></DashboardRoute>} />
          <Route path="*"                   element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
