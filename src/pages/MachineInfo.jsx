import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, AlertCircle } from 'lucide-react';
import { sendIssueEmail } from '../utils/emailService';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
// import imageCompression from 'browser-image-compression'; // İleride eklenecek

export default function MachineInfo() {
  const { code } = useParams();
  const navigate = useNavigate();
  
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMachine = async () => {
      setLoading(true);
      try {
        // Gerçek veritabanından makineyi bul
        const q = query(collection(db, "makineler"), where("kod", "==", code));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Bu koda ait makine bulunamadı.');
        } else {
          // İlk eşleşen makineyi al
          const machineData = querySnapshot.docs[0].data();
          setMachine({ id: querySnapshot.docs[0].id, ...machineData });
        }
      } catch (err) {
        console.error("Makine getirilirken hata:", err);
        setError('Makine bilgileri alınırken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchMachine();
  }, [code]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. Dosyayı okuyup resim (Image) objesine çeviriyoruz
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // 2. Fotoğrafı çok küçültmek için Canvas kullanıyoruz (WhatsApp mantığı)
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 800; // Maksimum 800px
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // 3. Kaliteyi %60'a düşürerek metin formatına (Base64) çevir
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
          
          setPhotoPreview(compressedDataUrl);
          setPhoto(compressedDataUrl); // File objesi yerine direkt sıkıştırılmış metni tutuyoruz
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Lütfen arıza açıklaması girin.');
      return;
    }

    setSubmitting(true);
    try {
      let photoUrl = null;

      // Fotoğraf Base64 formatında metin olarak hazır, storage'a yüklemeye gerek yok
      if (photo) {
        photoUrl = photo;
      }

      // Arızayı Firestore'a kaydet
      const arizaData = {
        makine_id: machine.id,
        makine_kod: machine.kod,
        makine_ad: machine.ad,
        bolum_id: machine.bolum_id,
        bolum_ad: machine.bolum_ad || 'Bilinmiyor', // Normalde bolumler koleksiyonundan çekilir veya denormalize edilir
        aciklama: description,
        foto_url: photoUrl,
        durum: "Açık",
        olusturulma_tarihi: serverTimestamp(),
        cozulme_tarihi: null,
        cozen_sorumlu_id: null,
        durum_gecmisi: [
          { durum: "Açık", tarih: new Date(), sorumlu_id: null }
        ]
      };
      
      await addDoc(collection(db, "arizalar"), arizaData);

      // E-POSTA GÖNDERİMİ (Sorumluları Bul ve Mail At)
      try {
        const qSorumlular = query(collection(db, "sorumlular"), where("bolum_idler", "array-contains", machine.bolum_id));
        const sorumlularSnapshot = await getDocs(qSorumlular);
        
        sorumlularSnapshot.forEach((doc) => {
          const sorumlu = doc.data();
          if (sorumlu.email) {
            // Arka planda mail at (bekletmeye gerek yok, asenkron çalışsın)
            sendIssueEmail(arizaData, sorumlu.email);
          }
        });
      } catch (mailErr) {
        console.error("Mail atılacak sorumlular bulunurken hata:", mailErr);
      }

      // Başarılı sayfasına yönlendir
      navigate('/success');
    } catch (err) {
      console.error("Arıza kaydedilirken hata:", err);
      alert('Arıza kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-2">Makine bilgileri yükleniyor...</div>;
  }

  if (error) {
    return (
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        <div className="card text-center">
          <AlertCircle size={48} color="var(--color-status-open)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
          <h2 className="mb-2">Hata</h2>
          <p className="color-text-muted mb-3">{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Ana Sayfaya Dön</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <button 
        className="btn mb-2" 
        style={{ padding: '0.5rem', background: 'transparent', color: 'var(--color-secondary)' }}
        onClick={() => navigate('/')}
      >
        <ArrowLeft size={20} />
        Vazgeç
      </button>

      {/* Makine Bilgi Kartı */}
      <div className="card mb-3" style={{ borderLeft: '4px solid var(--color-primary)' }}>
        <p className="color-text-muted mb-1" style={{ fontSize: '0.9rem', fontWeight: 600 }}>MAKİNE BİLGİSİ</p>
        <h2 className="mb-1">{machine.ad}</h2>
        <div className="flex justify-between items-center">
          <div>
            <span style={{ color: 'var(--color-secondary)', fontWeight: 500 }}>Kod:</span> {machine.kod}
          </div>
          <div>
            {/* TODO: Bölüm adı veritabanından gelecek, şimdilik statik bir değer varsa gösteriyoruz */}
            <span style={{ color: 'var(--color-secondary)', fontWeight: 500 }}>Bölüm:</span> {machine.bolum_ad || "Belirtilmemiş"}
          </div>
        </div>
      </div>

      {/* Arıza Bildirim Formu */}
      <div className="card">
        <h3 className="mb-2">Arıza Bildir</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="description">Arıza Açıklaması (Zorunlu)</label>
            <textarea
              id="description"
              className="input-field"
              rows="4"
              placeholder="Makinedeki sorunu kısaca açıklayın..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="input-group">
            <label className="input-label">Fotoğraf (Opsiyonel)</label>
            
            {!photoPreview ? (
              <div style={{ 
                border: '2px dashed #ccc', 
                borderRadius: '8px', 
                padding: '2rem', 
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: '#f9f9f9'
              }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <Camera size={32} color="var(--color-secondary-light)" />
                  <span style={{ color: 'var(--color-secondary)' }}>Kamerayı aç veya fotoğraf seç</span>
                </label>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <img 
                  src={photoPreview} 
                  alt="Önizleme" 
                  style={{ width: '100%', borderRadius: '8px', maxHeight: '300px', objectFit: 'cover' }} 
                />
                <button 
                  type="button"
                  className="btn btn-secondary"
                  style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', padding: '0.5rem' }}
                  onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                >
                  Sil
                </button>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary mt-2" 
            style={{ width: '100%' }}
            disabled={submitting}
          >
            {submitting ? 'Gönderiliyor...' : 'Arıza Bildirimini Gönder'}
          </button>
        </form>
      </div>
    </div>
  );
}
