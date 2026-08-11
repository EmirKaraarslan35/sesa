import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Users, Trash2, Edit2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function UserManager() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [bolumler, setBolumler] = useState([]);
  const [loading, setLoading] = useState(true);

  // Düzenleme state'i
  const [editingUserId, setEditingUserId] = useState(null);
  const [editBolumId, setEditBolumId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Bölümleri çek
      const bSnap = await getDocs(collection(db, "bolumler"));
      const bList = bSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setBolumler(bList);

      // Kullanıcıları (sorumlular) çek
      const uSnap = await getDocs(collection(db, "sorumlular"));
      const uList = uSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(uList);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBolumAd = (bolumIdler) => {
    if (!bolumIdler || bolumIdler.length === 0) return 'Bölüm Yok';
    const b = bolumler.find(x => x.id === bolumIdler[0]);
    return b ? b.ad : 'Bilinmeyen Bölüm';
  };

  const handleDelete = async (userId, userRole) => {
    if (userRole === 'admin') {
      alert("Yöneticiler (Admin) silinemez!");
      return;
    }
    if (window.confirm('Bu personeli sistemden silmek istediğinize emin misiniz? (Geçmiş işlemleri kalır, ancak giriş yapamaz)')) {
      try {
        await deleteDoc(doc(db, "sorumlular", userId));
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        console.error("Silme hatası:", error);
        alert("Silinirken bir hata oluştu.");
      }
    }
  };

  const handleEditClick = (user) => {
    if (user.rol === 'admin') {
      alert("Yöneticilerin (Admin) bölümü değiştirilemez.");
      return;
    }
    setEditingUserId(user.id);
    setEditBolumId(user.bolum_idler?.[0] || '');
  };

  const handleSaveEdit = async (userId) => {
    try {
      await updateDoc(doc(db, "sorumlular", userId), {
        bolum_idler: [editBolumId]
      });
      setUsers(users.map(u => u.id === userId ? { ...u, bolum_idler: [editBolumId] } : u));
      setEditingUserId(null);
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      alert("Güncellenirken hata oluştu.");
    }
  };

  if (currentUser?.rol !== 'admin') {
    return (
      <div className="card text-center" style={{ marginTop: '2rem' }}>
        <ShieldAlert size={48} color="var(--color-status-open)" style={{ margin: '0 auto 1rem' }} />
        <h2>Erişim Engellendi</h2>
        <p>Bu sayfayı sadece sistem yöneticileri (Admin) görebilir.</p>
      </div>
    );
  }

  if (loading) return <div className="text-center mt-2">Yükleniyor...</div>;

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <button 
            onClick={() => navigate('/dashboard')} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', marginRight: '0.5rem', display: 'flex', alignItems: 'center' }}
          >
            <ArrowLeft size={24} />
          </button>
          <Users color="var(--color-primary)" /> Personel Yönetimi
        </h2>
      </div>

      <div className="card">
        {users.map(user => (
          <div key={user.id} style={{ 
            borderBottom: '1px solid #eee', 
            padding: '1rem 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div className="flex justify-between items-center">
              <div>
                <strong style={{ fontSize: '1.1rem' }}>{user.ad_soyad}</strong>
                {user.rol === 'admin' && (
                  <span style={{ 
                    marginLeft: '8px', 
                    fontSize: '0.7rem', 
                    backgroundColor: '#1a1a1a', 
                    color: '#facc15', 
                    padding: '2px 6px', 
                    borderRadius: '4px' 
                  }}>ADMİN</span>
                )}
              </div>
              <div className="flex gap-2">
                {user.rol !== 'admin' && (
                  <>
                    <button 
                      onClick={() => editingUserId === user.id ? handleSaveEdit(user.id) : handleEditClick(user)}
                      className="btn" 
                      style={{ padding: '0.4rem', backgroundColor: editingUserId === user.id ? 'var(--color-status-resolved)' : '#f0f0f0', color: editingUserId === user.id ? 'white' : 'inherit' }}
                    >
                      {editingUserId === user.id ? 'Kaydet' : <Edit2 size={16} />}
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id, user.rol)}
                      className="btn" 
                      style={{ padding: '0.4rem', backgroundColor: '#ffebee', color: 'var(--color-status-open)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              {user.email}
            </div>

            {editingUserId === user.id ? (
              <select 
                value={editBolumId} 
                onChange={(e) => setEditBolumId(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', marginTop: '0.5rem' }}
              >
                <option value="" disabled>Bölüm Seçin</option>
                {bolumler.map(b => (
                  <option key={b.id} value={b.id}>{b.ad}</option>
                ))}
              </select>
            ) : (
              <div style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 500 }}>
                Bölüm: {getBolumAd(user.bolum_idler)}
              </div>
            )}
            
          </div>
        ))}
      </div>
    </div>
  );
}
