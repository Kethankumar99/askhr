import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EmployeeChat from './pages/EmployeeChat';
import HRLogin from './pages/HRLogin';
import HRRegister from './pages/HRRegister';
import HRDashboard from './pages/HRDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Employee Chat */}
        <Route path="/chat/:company" element={<EmployeeChat />} />
        
        {/* HR Pages */}
        <Route path="/hr/login" element={<HRLogin />} />
        <Route path="/hr/register" element={<HRRegister />} />
        <Route path="/hr/dashboard" element={<HRDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;