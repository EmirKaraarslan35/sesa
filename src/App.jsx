import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import MachineInfo from './pages/MachineInfo';
import Success from './pages/Success';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MachineManager from './pages/MachineManager';
import IssuesList from './pages/IssuesList';
import IssueDetail from './pages/IssueDetail';
import Settings from './pages/Settings';
import UserManager from './pages/UserManager';
import './index.css';

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/machine/:code" element={<MachineInfo />} />
        <Route path="/success" element={<Success />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/machines" element={<MachineManager />} />
        <Route path="/issues" element={<IssuesList />} />
        <Route path="/issues/:id" element={<IssueDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/users" element={<UserManager />} />
      </Route>
    </Routes>
  );
}

export default App;
