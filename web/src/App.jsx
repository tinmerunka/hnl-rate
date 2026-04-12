<<<<<<< Updated upstream
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/LandingPage';
import Login from './pages/Login';
=======
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/LandingPage';
import Login from './pages/Login';
import Clubs from './pages/Clubs';

function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}
>>>>>>> Stashed changes

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
<<<<<<< Updated upstream
=======
        <Route
          path="/klubovi"
          element={
            <AdminRoute>
              <Clubs />
            </AdminRoute>
          }
        />
>>>>>>> Stashed changes
      </Routes>
    </BrowserRouter>
  );
}

<<<<<<< Updated upstream
export default App;
=======
export default App;
>>>>>>> Stashed changes
