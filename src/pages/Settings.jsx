import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="flex items-center mb-3">
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', marginRight: '1rem' }}
        >
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Mail Ayarları</h2>
      </div>

      <div className="card text-center" style={{ marginTop: '2rem' }}>
        <SettingsIcon size={48} color="var(--color-text-muted)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
        <h3 style={{ marginBottom: '0.5rem' }}>Yapım Aşamasında</h3>
        <p className="color-text-muted">
          Bu sayfa Faz 5'te kodlanacak olan otomatik mail (Nodemailer/Firebase Functions) entegrasyonu içindir.
        </p>
      </div>
    </div>
  );
}
