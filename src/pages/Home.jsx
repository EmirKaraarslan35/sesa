import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { Keyboard, ArrowRight } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [scannerActive, setScannerActive] = useState(false);

  useEffect(() => {
    let html5QrCode = null;
    let isNavigating = false;
    
    if (scannerActive) {
      html5QrCode = new Html5Qrcode("qr-reader");
      
      const startScanner = async () => {
        try {
          await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            async (decodedText) => {
              if (isNavigating) return;
              isNavigating = true;
              try {
                await html5QrCode.stop();
              } catch (err) {
                console.error("Failed to stop scanner", err);
              }
              navigate(`/machine/${decodedText}`);
            },
            (err) => {}
          );
        } catch (err) {
          console.error("Kamera başlatılamadı:", err);
          alert("Kameraya erişilemedi!");
        }
      };
      
      startScanner();
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, [scannerActive, navigate]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (code.trim()) {
      navigate(`/machine/${code.toUpperCase()}`);
    }
  };

  return (
    <div className="home-grid" style={{ height: '100%' }}>
      {/* Top Half: Scanner */}
      <div className="card" style={{ 
        flex: 1, 
        backgroundColor: '#E0E0E0', 
        borderRadius: 'var(--border-radius-lg)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '300px',
        marginBottom: 0
      }}>
        {!scannerActive ? (
          <button 
            className="btn btn-primary" 
            onClick={() => setScannerActive(true)}
          >
            QR Kodu Kameraya Okutun
          </button>
        ) : (
          <div id="qr-reader" style={{ width: '100%', height: '100%' }}></div>
        )}
      </div>

      {/* Bottom Half: Manual Entry Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h3 className="mb-2" style={{ color: 'var(--color-text)', fontSize: '1.2rem' }}>
          Veya Kodu El İle Girin:
        </h3>
        
        <form onSubmit={handleManualSubmit}>
          <div className="input-group flex items-center" style={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 'var(--border-radius)', padding: '0.5rem 1rem' }}>
            <Keyboard size={24} color="var(--color-text-muted)" style={{ marginRight: '0.8rem' }} />
            <input
              type="text"
              placeholder="Örn: SESA-PRES-01"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', backgroundColor: 'transparent' }}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            <ArrowRight size={20} />
            İlerle
          </button>
        </form>
      </div>
    </div>
  );
}
