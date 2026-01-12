import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Engins from './pages/Engins';
import GestionVGP from './pages/GestionVGP';
import Maintenances from './pages/Maintenances';
import ApparauxLevage from './pages/ApparauxLevage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Engins />} />
            <Route path="gestion" element={<GestionVGP />} />
            <Route path="maintenances" element={<Maintenances />} />
            <Route path="apparaux-levage" element={<ApparauxLevage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

