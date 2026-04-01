import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/LandingPage';
import Login from './pages/Login';

function ProtectedRoute({children}) {
  const { isAuthenticated, loading } = useAuth();

  if(loading) return null;

  return isAuthenticated ? children : <Navigate to="/login"/>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Landing />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;