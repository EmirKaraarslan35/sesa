import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();

  // currentUser değiştiğinde eğer doluysa yönlendir (tekte giriş sorunu çözümü)
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSetupDB = async () => {
    try {
      if(window.confirm("İlk kurulum verileri (admin şifresi ve test bölümleri) veritabanına eklenecek. Onaylıyor musunuz?")) {
        // Admin Şifresi
        await setDoc(doc(db, "ayarlar", "admin_sifreleri"), {
          sorumlu_kayit_sifresi: "123456"
        });
        
        // Test Bölümü
        await setDoc(doc(db, "bolumler", "bolum-1"), {
          ad: "Ekstrüzyon / Film",
          kisaltma: "EKS",
          aktif: true
        });

        alert("Kurulum Başarılı! Kayıt olurken Yetkili Kayıt Kodu olarak '123456' kullanabilirsiniz.");
      }
    } catch(err) {
      console.error(err);
      alert("Hata: " + err.message + "\n\nFirestore'un aktif olduğundan ve kuralların yazmaya izin verdiğinden emin olun.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Yönlendirmeyi useEffect yapacak
    } catch (err) {
      console.error(err);
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
      
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 className="mb-3 text-center" style={{ fontSize: '1.4rem' }}>Yetkili Girişi</h2>
        
        {error && <div style={{ color: 'var(--color-status-open)', marginBottom: '1rem', textAlign: 'center', backgroundColor: '#FFEBEE', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <div className="flex items-center" style={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 'var(--border-radius)', padding: '0.5rem 1rem' }}>
              <User size={20} color="var(--color-text-muted)" style={{ marginRight: '0.8rem' }} />
              <input
                type="email"
                placeholder="E-Posta Adresi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', backgroundColor: 'transparent', padding: '0.5rem 0' }}
                required
              />
            </div>
          </div>

          <div className="input-group mb-3">
            <div className="flex items-center" style={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 'var(--border-radius)', padding: '0.5rem 1rem' }}>
              <Lock size={20} color="var(--color-text-muted)" style={{ marginRight: '0.8rem' }} />
              <input
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', backgroundColor: 'transparent', padding: '0.5rem 0' }}
                required
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Giriş Yapılıyor...' : 'Sisteme Giriş Yap'}
          </button>
        </form>
        
        <div className="text-center mt-2" style={{ marginTop: '1.5rem' }}>
          <button 
            onClick={() => navigate('/register')} 
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline', display: 'block', margin: '0 auto', marginBottom: '1rem' }}
          >
            Hesabın yok mu? Kayıt Ol (Kod Gerekli)
          </button>

          {/* SADECE GELİŞTİRME AŞAMASI İÇİN */}
          <button 
            onClick={handleSetupDB} 
            type="button"
            style={{ background: 'none', border: '1px solid #ccc', color: 'var(--color-text-muted)', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: '4px' }}
          >
            <Database size={14} /> İlk Kurulum (DB Seed)
          </button>
        </div>
      </div>
    </div>
  );
}
