import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, AlertCircle, Wrench, CheckCircle2, ChevronRight } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function IssuesList() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Hepsi'); // Hepsi, Açık, İşlemde, Çözüldü

  useEffect(() => {
    fetchIssues();
  }, [currentUser, filter]);

  const fetchIssues = async () => {
    if (!currentUser) return;
    
    // Kullanıcının bölümü yoksa yükleniyoru kapat
    if (!currentUser.bolum_idler || currentUser.bolum_idler.length === 0) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const bolumId = currentUser.bolum_idler[0];
      let q;
      
      // Not: orderBy kullanmak için Firestore'da composite index gerekebilir.
      // Basitlik adına şimdilik client-side sıralama yapacağız veya sadece where kullanacağız.
      if (filter === 'Hepsi') {
        q = query(collection(db, "arizalar"), where("bolum_id", "==", bolumId));
      } else {
        q = query(collection(db, "arizalar"), where("bolum_id", "==", bolumId), where("durum", "==", filter));
      }
      
      const querySnapshot = await getDocs(q);
      const issueList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Tarihe göre yeninden eskiye sırala (client-side)
      issueList.sort((a, b) => b.olusturulma_tarihi?.toMillis() - a.olusturulma_tarihi?.toMillis());
      
      setIssues(issueList);
    } catch (err) {
      console.error("Arızalar getirilirken hata:", err);
    } finally {
      setLoading(false);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Açık': return <AlertCircle size={24} color={getStatusColor(status)} />;
      case 'İşlemde': return <Wrench size={24} color={getStatusColor(status)} />;
      case 'Çözüldü': return <CheckCircle2 size={24} color={getStatusColor(status)} />;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/dashboard')} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', marginRight: '1rem' }}
          >
            <ArrowLeft size={24} />
          </button>
          <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Arıza Kayıtları</h2>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex mb-3" style={{ backgroundColor: '#E0E0E0', padding: '4px', borderRadius: '8px', overflowX: 'auto' }}>
        {['Hepsi', 'Açık', 'İşlemde', 'Çözüldü'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: filter === f ? 'var(--color-surface)' : 'transparent',
              color: filter === f ? 'var(--color-text)' : 'var(--color-text-muted)',
              fontWeight: filter === f ? 600 : 400,
              boxShadow: filter === f ? 'var(--box-shadow-sm)' : 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div>
        {loading ? (
          <div className="text-center mt-2">Arızalar yükleniyor...</div>
        ) : issues.length === 0 ? (
          <div className="card text-center text-muted mt-2">
            Bu filtreye uygun arıza kaydı bulunamadı.
          </div>
        ) : (
          issues.map(issue => (
            <div 
              key={issue.id} 
              className="card flex justify-between items-center" 
              style={{ padding: '1rem', cursor: 'pointer', borderLeft: `4px solid ${getStatusColor(issue.durum)}` }}
              onClick={() => navigate(`/issues/${issue.id}`)}
            >
              <div className="flex gap-3 items-center">
                <div style={{ backgroundColor: '#F5F5F5', padding: '0.5rem', borderRadius: '50%' }}>
                  {getStatusIcon(issue.durum)}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.1rem' }}>{issue.makine_ad}</h4>
                  <div className="flex gap-2 items-center" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    <span>{issue.makine_kod}</span>
                    <span>•</span>
                    <span>{issue.olusturulma_tarihi?.toDate().toLocaleDateString('tr-TR')}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.3rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {issue.aciklama}
                  </p>
                </div>
              </div>
              <ChevronRight size={24} color="var(--color-text-muted)" />
            </div>
          ))
        )}
      </div>

    </div>
  );
}
