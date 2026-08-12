import { Outlet, Link, useLocation } from 'react-router-dom';
import { QrCode, ShieldUser } from 'lucide-react';

export default function PublicLayout() {
  const location = useLocation();
  
  return (
    <div className="app-container">
      <header className="header">
        <div className="header-left">
          <div className="header-logo">
            SESA<span>®</span>
          </div>
          <div className="header-subtitle">Flexible Packaging</div>
        </div>
        
        <nav className="header-nav">
          <Link 
            to="/" 
            className={`header-nav-item ${location.pathname === '/' || location.pathname.startsWith('/machine') ? 'active' : ''}`}
          >
            <QrCode size={18} />
            Saha Tarayıcı
          </Link>
          <Link 
            to="/login" 
            className={`header-nav-item ${location.pathname === '/login' || location.pathname === '/register' ? 'active' : ''}`}
          >
            <ShieldUser size={18} />
            Yetkili Paneli
          </Link>
        </nav>
      </header>
      
      <main className="main-content">
        <Outlet />
      </main>

      {/* Mobil alt menü - sadece telefonda görünür */}
      <nav className="bottom-nav">
        <Link 
          to="/" 
          className={`nav-item ${location.pathname === '/' || location.pathname.startsWith('/machine') ? 'active' : ''}`}
        >
          <div className="nav-icon-wrapper">
            <QrCode size={24} />
          </div>
          Saha (Tarayıcı)
        </Link>
        <Link 
          to="/login" 
          className={`nav-item ${location.pathname === '/login' || location.pathname === '/register' ? 'active' : ''}`}
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
