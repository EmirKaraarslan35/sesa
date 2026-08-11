import { Outlet, Link, useLocation } from 'react-router-dom';
import { QrCode, ShieldUser } from 'lucide-react';

export default function PublicLayout() {
  const location = useLocation();
  
  return (
    <div className="app-container">
      <header className="header">
        <div className="header-logo">
          SESA<span>®</span>
        </div>
        <div className="header-subtitle">Flexible Packaging</div>
      </header>
      
      <main className="main-content">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        <Link 
          to="/" 
          className={`nav-item ${location.pathname !== '/login' ? 'active' : ''}`}
        >
          <div className="nav-icon-wrapper">
            <QrCode size={24} />
          </div>
          Saha (Tarayıcı)
        </Link>
        <Link 
          to="/login" 
          className={`nav-item ${location.pathname === '/login' ? 'active' : ''}`}
        >
          <div className="nav-icon-wrapper">
            <ShieldUser size={24} />
          </div>
          Yetkili Paneli
        </Link>
      </nav>
    </div>
  );
}
