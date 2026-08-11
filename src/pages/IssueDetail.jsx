import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Wrench, CheckCircle2, Clock, MapPin, Hash, User, Trash2 } from 'lucide-react';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function IssueDetail() {
  const { id } = useParams();
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [sorumlular, setSorumlular] = useState({});

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    try {
      const docRef = doc(db, "arizalar", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const issueData = { id: docSnap.id, ...docSnap.data() };
        setIssue(issueData);
        
        // Geliştirme: Timeline için sorumlu isimlerini de çekebiliriz
        // Şimdilik sadece id'leri var. 
      }
    } catch (err) {
      console.error("Arıza getirilirken hata:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIssue = async () => {
    if (userRole !== 'admin') return;
    if (window.confirm("Bu arıza kaydını KALICI OLARAK SİLMEK istediğinize emin misiniz?")) {
      try {
        await deleteDoc(doc(db, "arizalar", id));
        navigate('/issues');
      } catch (err) {
        console.error("Silme hatası:", err);
        alert("Silinirken bir hata oluştu.");
      }
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!issue || issue.durum === newStatus) return;
    
    setUpdating(true);
    try {
      const docRef = doc(db, "arizalar", id);
      
      const updateData = {
        durum: newStatus,
        durum_gecmisi: [
          ...(issue.durum_gecmisi || []),
          { durum: newStatus, tarih: new Date(), sorumlu_id: currentUser.id }
        ]
      };

      if (newStatus === 'Çözüldü') {
        updateData.cozulme_tarihi = serverTimestamp();
        updateData.cozen_sorumlu_id = currentUser.id;
      } else if (issue.durum === 'Çözüldü') {
        // Çözüldüden geri alınıyorsa tarihleri temizle
        updateData.cozulme_tarihi = null;
        updateData.cozen_sorumlu_id = null;
      }

      await updateDoc(docRef, updateData);
      
      // Local state'i güncelle
      setIssue(prev => ({
        ...prev,
        ...updateData,
        cozulme_tarihi: newStatus === 'Çözüldü' ? new Date() : (issue.durum === 'Çözüldü' ? null : prev.cozulme_tarihi)
      }));
      
    } catch (err) {
      console.error("Durum güncellenirken hata:", err);
      alert("Durum güncellenemedi.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Açık': return 'var(--color-status-open)';
      case 'İşlemde': return 'var(--color-status-progress)';
      case 'Çözüldü': return 'var(--color-status-resolved)';
      default: return 'var(--color-text-muted)';
    }
  };

  if (loading) return <div className="text-center mt-2">Yükleniyor...</div>;
  if (!issue) return <div className="text-center mt-2">Arıza bulunamadı.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '2rem' }}>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/issues')} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', marginRight: '1rem' }}
          >
            <ArrowLeft size={24} />
          </button>
          <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Arıza Detayı</h2>
        </div>
        
        {userRole === 'admin' && (
          <button 
            onClick={handleDeleteIssue}
            style={{ 
              background: '#ffebee', 
              color: 'var(--color-status-open)', 
              border: 'none', 
              borderRadius: '8px', 
              padding: '0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            <Trash2 size={18} /> Sil
          </button>
        )}
      </div>

      {/* Status Card */}
      <div className="card text-center" style={{ borderTop: `6px solid ${getStatusColor(issue.durum)}` }}>
        <h3 style={{ color: getStatusColor(issue.durum), fontSize: '1.5rem', marginBottom: '0.5rem' }}>{issue.durum}</h3>
        <p className="color-text-muted" style={{ fontSize: '0.9rem' }}>
          Oluşturulma: {issue.olusturulma_tarihi?.toDate().toLocaleString('tr-TR')}
        </p>
      </div>

      {/* Status Action Buttons */}
      <div className="flex gap-2 mb-3">
        <button 
          className="btn" 
          style={{ 
            flex: 1, 
            padding: '0.8rem',
            backgroundColor: issue.durum === 'Açık' ? 'var(--color-status-open)' : '#E0E0E0',
            color: issue.durum === 'Açık' ? 'white' : 'var(--color-text-muted)',
            boxShadow: issue.durum === 'Açık' ? '0 4px 10px rgba(229, 57, 53, 0.3)' : 'none'
          }}
          onClick={() => handleStatusChange('Açık')}
          disabled={updating}
        >
          <AlertCircle size={20} /> Açık
        </button>
        <button 
          className="btn" 
          style={{ 
            flex: 1, 
            padding: '0.8rem',
            backgroundColor: issue.durum === 'İşlemde' ? 'var(--color-status-progress)' : '#E0E0E0',
            color: issue.durum === 'İşlemde' ? 'white' : 'var(--color-text-muted)',
            boxShadow: issue.durum === 'İşlemde' ? '0 4px 10px rgba(251, 192, 45, 0.3)' : 'none'
          }}
          onClick={() => handleStatusChange('İşlemde')}
          disabled={updating}
        >
          <Wrench size={20} /> İşlemde
        </button>
        <button 
          className="btn" 
          style={{ 
            flex: 1, 
            padding: '0.8rem',
            backgroundColor: issue.durum === 'Çözüldü' ? 'var(--color-status-resolved)' : '#E0E0E0',
            color: issue.durum === 'Çözüldü' ? 'white' : 'var(--color-text-muted)',
            boxShadow: issue.durum === 'Çözüldü' ? '0 4px 10px rgba(67, 160, 71, 0.3)' : 'none'
          }}
          onClick={() => handleStatusChange('Çözüldü')}
          disabled={updating}
        >
          <CheckCircle2 size={20} /> Çözüldü
        </button>
      </div>

      {/* Machine Details */}
      <div className="card">
        <h3 className="mb-2" style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Makine Bilgileri</h3>
        
        <div className="flex items-center gap-2 mb-2">
          <Hash size={20} color="var(--color-text-muted)" />
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Makine Adı</div>
            <div style={{ fontWeight: 500 }}>{issue.makine_ad} ({issue.makine_kod})</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <MapPin size={20} color="var(--color-text-muted)" />
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Bölüm</div>
            <div style={{ fontWeight: 500 }}>{issue.bolum_ad}</div>
          </div>
        </div>
      </div>

      {/* Issue Details */}
      <div className="card mb-3">
        <h3 className="mb-2" style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Arıza Açıklaması</h3>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{issue.aciklama}</p>

        {issue.foto_url && (
          <div className="mt-2">
            <h4 className="mb-1" style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Eklenen Fotoğraf</h4>
            <a href={issue.foto_url} target="_blank" rel="noopener noreferrer">
              <img 
                src={issue.foto_url} 
                alt="Arıza" 
                style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd' }} 
              />
            </a>
          </div>
        )}
      </div>

      {/* Timeline (Zaman Çizelgesi) */}
      <div className="card">
        <h3 className="mb-3" style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} /> Zaman Çizelgesi
        </h3>
        
        <div style={{ position: 'relative', paddingLeft: '1rem' }}>
          {/* Dikey Çizgi */}
          <div style={{ position: 'absolute', left: '19px', top: '10px', bottom: '10px', width: '2px', backgroundColor: '#e4e4e7' }}></div>
          
          {issue.durum_gecmisi?.map((gecmis, index) => {
            const dateObj = gecmis.tarih?.toDate ? gecmis.tarih.toDate() : new Date(gecmis.tarih);
            return (
              <div key={index} style={{ position: 'relative', marginBottom: '1.5rem', paddingLeft: '2rem' }}>
                {/* Nokta */}
                <div style={{ 
                  position: 'absolute', 
                  left: '-4px', 
                  top: '4px', 
                  width: '14px', 
                  height: '14px', 
                  borderRadius: '50%', 
                  backgroundColor: getStatusColor(gecmis.durum),
                  border: '2px solid white'
                }}></div>
                
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>
                  {dateObj.toLocaleString('tr-TR')}
                </div>
                <div style={{ fontWeight: 500 }}>
                  Durum <span style={{ color: getStatusColor(gecmis.durum) }}>{gecmis.durum}</span> olarak işaretlendi.
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
