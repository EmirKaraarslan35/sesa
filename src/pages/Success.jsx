import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Success() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', textAlign: 'center', paddingTop: '2rem' }}>
      <div className="card">
        <CheckCircle2 size={64} color="var(--color-status-resolved)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
        <h2 className="mb-2" style={{ color: 'var(--color-status-resolved)' }}>Bildirim Alındı!</h2>
        <p className="color-text-muted mb-3" style={{ fontSize: '1.1rem' }}>
          Arıza kaydınız başarıyla oluşturuldu ve ilgili bölüm sorumlusuna iletildi.
        </p>
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
          onClick={() => navigate('/')}
        >
          Ana Sayfaya Dön
        </button>
      </div>
    </div>
  );
}
