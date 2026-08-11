import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { currentUser, userRole, logout } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <header className="header" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <div className="header-logo" style={{ fontSize: '1.4rem' }}>
          SESA<span>®</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: 600 }}>
            {userRole === 'yonetici' ? 'Yönetici' : 'Sorumlu'}
          </span>
        </div>
      </header>
      
      <main className="main-content">
        {children ? children : <Outlet />}
      </main>
    </div>
  );
}
