import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ManualCode() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Lütfen bir makine kodu girin.');
      return;
    }
    // Burada ileride Firestore'dan kodu kontrol edeceğiz
    // Şimdilik mock olarak yönlendirelim
    navigate(`/machine/${code.toUpperCase()}`);
  };

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <button 
        className="btn mb-2" 
        style={{ padding: '0.5rem', background: 'transparent', color: 'var(--color-secondary)' }}
        onClick={() => navigate('/')}
      >
        <ArrowLeft size={20} />
        Geri Dön
      </button>

      <div className="card">
        <h2 className="mb-2">Makine Kodu Girin</h2>
        <p className="color-text-muted mb-3">
          Makinenin üzerindeki etikette yazan kodu (örn: EKS-0001) aşağıya girin.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="machineCode">Makine Kodu</label>
            <input
              id="machineCode"
              type="text"
              className="input-field"
              placeholder="Örn: EKS-0001"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
            />
          </div>
          
          {error && <p style={{ color: 'var(--color-status-open)', marginBottom: '1rem' }}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Devam Et
          </button>
        </form>
      </div>
    </div>
  );
}
