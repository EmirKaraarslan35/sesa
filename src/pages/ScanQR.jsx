import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { ArrowLeft } from 'lucide-react';

export default function ScanQR() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    let isNavigating = false;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" }, // Arka kamerayı zorunlu kıl
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (isNavigating) return;
            isNavigating = true;
            try {
              // Yönlendirmeden önce kamerayı güvenle kapat (beyaz ekran hatası çözümü)
              await html5QrCode.stop();
            } catch (err) {
              console.error("Kamera durdurulamadı", err);
            }
            navigate(`/machine/${decodedText}`);
          },
          (err) => {
            // Hatalar sürekli tetiklenir, loglamıyoruz
          }
        );
      } catch (err) {
        console.error("Kamera başlatılamadı:", err);
        setError("Kameraya erişilemedi veya cihazınızda kamera bulunmuyor.");
      }
    };

    startScanner();

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(error => {
          console.error("Failed to stop scanner on unmount. ", error);
        });
      }
    };
  }, [navigate]);

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
        <h2 className="mb-2 text-center">QR Kodu Tarayın</h2>
        <p className="color-text-muted mb-3 text-center">
          Makinenin üzerindeki QR kodu kameraya gösterin.
        </p>

        <div id="qr-reader" style={{ width: '100%', borderRadius: '8px', overflow: 'hidden' }}></div>
        
        {error && <p style={{ color: 'var(--color-status-open)', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
      </div>
    </div>
  );
}
