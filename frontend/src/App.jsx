import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HRLogin from './pages/HRLogin';
import HRRegister from './pages/HRRegister';
import HRDashboard from './pages/HRDashboard';
import EmployeeChat from './pages/EmployeeChat';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/hr/login" />} />
        <Route path="/hr/login" element={<HRLogin />} />
        <Route path="/hr/register" element={<HRRegister />} />
        <Route path="/hr/dashboard" element={<HRDashboard />} />
        <Route path="/chat/:company" element={<EmployeeChat />} />
      </Routes>
    </Router>
  );
}

export default App;