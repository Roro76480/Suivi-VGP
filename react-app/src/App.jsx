import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Engins from './pages/Engins';
import GestionVGP from './pages/GestionVGP';
import Maintenances from './pages/Maintenances';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="engins" element={<Engins />} />
          <Route path="gestion" element={<GestionVGP />} />
          <Route path="maintenances" element={<Maintenances />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
