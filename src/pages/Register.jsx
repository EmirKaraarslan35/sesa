import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, KeyRound, Building2 } from 'lucide-react';
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    adminCode: '',
    bolum_id: ''
  });
  const [bolumler, setBolumler] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Bölümleri çek
    const fetchBolumler = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "bolumler"));
        const bolumList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBolumler(bolumList);
      } catch (err) {
        console.error("Bölümler getirilemedi:", err);
      }
    };
    fetchBolumler();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Admin şifresini doğrula ve rolü belirle
      let rol = 'sorumlu';
      const ayarlarDoc = await getDoc(doc(db, "ayarlar", "admin_sifreleri"));
      const sorumluSifre = ayarlarDoc.exists() ? ayarlarDoc.data().sorumlu_kayit_sifresi : 'SESA-ADMIN-2026';
      
      if (formData.adminCode === 'SESA-PATRON-2026') {
        rol = 'admin';
      } else if (formData.adminCode === sorumluSifre) {
        rol = 'sorumlu';
      } else {
        throw new Error('Geçersiz kayıt kodu!');
      }

      // 2. Firebase Auth ile kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 3. Kullanıcı (Sorumlu/Yönetici) bilgisini Firestore'a kaydet
      await setDoc(doc(db, 'sorumlular', user.uid), {
        id: user.uid,
        ad_soyad: formData.name,
        email: formData.email,
        bolum_idler: [formData.bolum_id], 
        rol: rol,
        aktif: true,
        olusturulma_tarihi: new Date()
      });

      // 4. Başarılı olunca dashboard'a yönlendir
      navigate('/dashboard');

    } catch (err) {
      console.error(err);
      if (err.message === 'Geçersiz kayıt kodu!') {
        setError(err.message);
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Bu e-posta adresi zaten kullanılıyor.');
      } else if (err.code === 'auth/weak-password') {
        setError('Şifre en az 6 karakter olmalıdır.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Hata: Firebase Authentication panelinden Email/Password girişi aktif edilmemiş!');
      } else {
        // Hatanın tam ne olduğunu görebilmek için ekrana basıyoruz
        setError('Hata Kodu: ' + (err.code || 'Bilinmiyor') + ' | Mesaj: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
      
      <div className="card" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
        <h2 className="mb-3 text-center" style={{ fontSize: '1.4rem' }}>Sorumlu Kaydı</h2>
        
        {error && <div style={{ color: 'var(--color-status-open)', marginBottom: '1rem', textAlign: 'center', backgroundColor: '#FFEBEE', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleRegister}>
          
          <div className="input-group">
            <div className="flex items-center" style={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 'var(--border-radius)', padding: '0.5rem 1rem' }}>
              <User size={20} color="var(--color-text-muted)" style={{ marginRight: '0.8rem' }} />
              <input
                type="text"
                name="name"
                placeholder="Ad Soyad"
                value={formData.name}
                onChange={handleChange}
                style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', backgroundColor: 'transparent', padding: '0.5rem 0' }}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div className="flex items-center" style={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 'var(--border-radius)', padding: '0.5rem 1rem' }}>
              <Mail size={20} color="var(--color-text-muted)" style={{ marginRight: '0.8rem' }} />
              <input
                type="email"
                name="email"
                placeholder="E-Posta Adresi"
                value={formData.email}
                onChange={handleChange}
                style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', backgroundColor: 'transparent', padding: '0.5rem 0' }}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div className="flex items-center" style={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 'var(--border-radius)', padding: '0.5rem 1rem' }}>
              <Lock size={20} color="var(--color-text-muted)" style={{ marginRight: '0.8rem' }} />
              <input
                type="password"
                name="password"
                placeholder="Hesap Şifresi"
                value={formData.password}
                onChange={handleChange}
                style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', backgroundColor: 'transparent', padding: '0.5rem 0' }}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div className="flex items-center" style={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 'var(--border-radius)', padding: '0.5rem 1rem' }}>
              <Building2 size={20} color="var(--color-text-muted)" style={{ marginRight: '0.8rem' }} />
              <select
                name="bolum_id"
                value={formData.bolum_id}
                onChange={handleChange}
                style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', backgroundColor: 'transparent', padding: '0.5rem 0', color: formData.bolum_id ? 'var(--color-text)' : 'var(--color-text-muted)' }}
                required
              >
                <option value="" disabled>Sorumlu Olduğunuz Bölüm</option>
                {bolumler.map(b => (
                  <option key={b.id} value={b.id}>{b.ad}</option>
                ))}
                {/* Firebase'de bölüm yoksa test için statik eklendi */}
                {bolumler.length === 0 && <option value="mock-bolum-1">Hammadde (Sistemde Tanımlı Değil)</option>}
              </select>
            </div>
          </div>

          <div className="input-group mb-3">
            <div className="flex items-center" style={{ backgroundColor: '#fff', border: '1px solid var(--color-primary)', borderRadius: 'var(--border-radius)', padding: '0.5rem 1rem' }}>
              <KeyRound size={20} color="var(--color-primary)" style={{ marginRight: '0.8rem' }} />
              <input
                type="password"
                name="adminCode"
                placeholder="Yetkili Kayıt Kodu"
                value={formData.adminCode}
                onChange={handleChange}
                style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', backgroundColor: 'transparent', padding: '0.5rem 0' }}
                required
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>Sistem yöneticisinden aldığınız kodu girin.</p>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol ve Giriş Yap'}
          </button>
        </form>
        
        <div className="text-center mt-2" style={{ marginTop: '1.5rem' }}>
          <button 
            onClick={() => navigate('/login')} 
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Zaten hesabın var mı? Giriş Yap
          </button>
        </div>
      </div>
    </div>
  );
}
