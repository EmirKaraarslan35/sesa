import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, Mail, Wrench, ArrowRight, LogOut, Users } from 'lucide-react';

export default function Dashboard() {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      <div className="flex justify-between items-center mb-3">
        <div>
          <ShieldAlert size={48} color="var(--color-text-muted)" style={{ marginBottom: '0.5rem' }} />
          <h2 style={{ fontSize: '1.4rem' }}>SESA Kontrol Paneline Hoş Geldiniz</h2>
          <p className="color-text-muted" style={{ fontSize: '0.9rem' }}>
            {currentUser?.email} {userRole ? `(${userRole === 'sorumlu' ? 'Bölüm Sorumlusu' : 'Admin'})` : ''}
          </p>
        </div>
        <button 
          onClick={handleLogout} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-status-open)', padding: '0.5rem' }}
          title="Çıkış Yap"
        >
          <LogOut size={24} />
        </button>
      </div>

      <div 
        className="card" 
        style={{ backgroundColor: 'var(--color-primary-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        onClick={() => navigate('/machines')}
      >
        <div className="flex items-center gap-4">
          <Wrench size={28} color="var(--color-text)" />
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>SESA Makinelerini Yönet</h3>
            <p className="color-text-muted" style={{ fontSize: '0.9rem' }}>Makine ekle veya sil</p>
          </div>
        </div>
        <ArrowRight size={24} color="var(--color-text)" />
      </div>

      <div 
        className="card" 
        style={{ backgroundColor: '#E0E0E0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        onClick={() => navigate('/settings')}
      >
        <div className="flex items-center gap-4">
          <Mail size={28} color="var(--color-text)" />
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>Sistem Mail Ayarları</h3>
            <p className="color-text-muted" style={{ fontSize: '0.9rem' }}>Otomatik mail robotu ayarları</p>
          </div>
        </div>
        <ArrowRight size={24} color="var(--color-text)" />
      </div>

      <div 
        className="card" 
        style={{ backgroundColor: '#E0E0E0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}
        onClick={() => navigate('/issues')}
      >
        <div className="flex items-center gap-4">
          <ShieldAlert size={28} color="var(--color-text)" />
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>Arıza Kayıtları</h3>
            <p className="color-text-muted" style={{ fontSize: '0.9rem' }}>Gelen arızaları yönetin</p>
          </div>
        </div>
        <ArrowRight size={24} color="var(--color-text)" />
      </div>

      {userRole === 'admin' && (
        <div 
          className="card" 
          style={{ backgroundColor: '#1a1a1a', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          onClick={() => navigate('/users')}
        >
          <div className="flex items-center gap-4">
            <Users size={28} color="#facc15" />
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem', color: '#facc15' }}>Personel Yönetimi</h3>
              <p style={{ fontSize: '0.9rem', color: '#a1a1aa', margin: 0 }}>Sorumlu ekle, düzenle veya sil</p>
            </div>
          </div>
          <ArrowRight size={24} color="#facc15" />
        </div>
      )}

    </div>
  );
}
