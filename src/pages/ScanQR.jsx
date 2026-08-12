import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { ArrowLeft } from 'lucide-react';

function extractMachineCode(rawText) {
  if (rawText.includes('/')) {
    const parts = rawText.split('/').filter(p => p.length > 0);
    return parts[parts.length - 1];
  }
  return rawText.trim();
}

export default function ScanQR() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    let isNavigating = false;

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
              console.error("Kamera durdurulamadi", err);
            }
            const machineCode = extractMachineCode(decodedText);
            navigate(`/machine/${machineCode}`);
          },
          (err) => {}
        );
      } catch (err) {
        console.error("Kamera baslatilmadi:", err);
        setError("Kameraya erisilemedi veya cihazinizda kamera bulunmuyor.");
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
        style={{ padding: '0.5rem', background: 'transparent', color: 'var(--color-text-muted)' }}
        onClick={() => navigate('/')}
      >
        <ArrowLeft size={20} />
        Geri Don
      </button>

      <div className="card">
        <h2 className="mb-2 text-center">QR Kodu Tarayin</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
          Makinenin uzerindeki QR kodu kameraya gosterin.
        </p>

        <div id="qr-reader" style={{ width: '100%', borderRadius: '8px', overflow: 'hidden' }}></div>
        
        {error && <p style={{ color: 'var(--color-status-open)', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
      </div>
    </div>
  );
}
