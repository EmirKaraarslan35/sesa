import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { Keyboard, ArrowRight, QrCode, Camera } from 'lucide-react';

// QR veya barkod iceriginden makine kodunu cikaran yardimci fonksiyon
function extractMachineCode(rawText) {
  // Eger bir URL ise (/ icerir), en sondaki parcayi al
  // Ornegin: https://emirkaraarslan35.github.io/machine/MKN-8081 -> MKN-8081
  if (rawText.includes('/')) {
    const parts = rawText.split('/').filter(p => p.length > 0);
    return parts[parts.length - 1];
  }
  return rawText.trim();
}

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
              const machineCode = extractMachineCode(decodedText);
              navigate(`/machine/${machineCode}`);
            },
            (err) => {}
          );
        } catch (err) {
          console.error("Kamera baslatilmadi:", err);
          alert("Kameraya erisilemedi!");
          setScannerActive(false);
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
    <div className="home-grid" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.5rem' }}>
      {/* QR Tarayici */}
      <div className="card" style={{ 
        flex: 1, 
        backgroundColor: scannerActive ? '#000' : '#E8E8E8', 
        borderRadius: 'var(--border-radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '280px',
        marginBottom: 0,
        position: 'relative'
      }}>
        {!scannerActive ? (
          <div style={{ textAlign: 'center' }}>
            <Camera size={48} color="#999" style={{ marginBottom: '1rem' }} />
            <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              QR kodu taramak icin kamerayi acin
            </p>
            <button 
              className="btn btn-primary" 
              onClick={() => setScannerActive(true)}
            >
              <QrCode size={20} />
              Kamerayi Ac
            </button>
          </div>
        ) : (
          <div id="qr-reader" style={{ width: '100%', height: '100%' }}></div>
        )}
      </div>

      {/* Manuel Kod Girisi */}
      <div className="card" style={{ marginBottom: 0 }}>
        <h3 style={{ color: 'var(--color-text)', fontSize: '1.1rem', marginBottom: '1rem' }}>
          Veya Kodu El ile Girin
        </h3>
        
        <form onSubmit={handleManualSubmit}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: 'var(--border-radius)', padding: '0.6rem 1rem' }}>
            <Keyboard size={22} color="var(--color-text-muted)" style={{ marginRight: '0.8rem', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Orn: SESA-PRES-01"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', backgroundColor: 'transparent' }}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            <ArrowRight size={20} />
            Ilerle
          </button>
        </form>
      </div>
    </div>
  );
}
