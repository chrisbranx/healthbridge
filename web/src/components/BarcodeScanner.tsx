import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineCamera, HiOutlineX, HiOutlineQrcode } from 'react-icons/hi';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setScanning(true);
    } catch {
      setError('Camera access denied. Please allow camera permissions.');
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }

  function handleManualInput(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = (e.currentTarget.elements.namedItem('barcode') as HTMLInputElement).value.trim();
    if (code) {
      stopCamera();
      onScan(code);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="relative w-full max-w-md bg-white dark:bg-secondary-800 rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="p-4 border-b border-gray-100 dark:border-secondary-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HiOutlineQrcode className="h-5 w-5 text-primary-600" />
              <h3 className="font-bold text-secondary-900 dark:text-white">Scan Barcode</h3>
            </div>
            <button onClick={() => { stopCamera(); onClose(); }} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-secondary-700">
              <HiOutlineX className="h-5 w-5 text-secondary-400" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {error ? (
              <div className="text-center py-8">
                <HiOutlineCamera className="h-12 w-12 text-red-400 mx-auto mb-3" />
                <p className="text-sm text-red-500 mb-4">{error}</p>
                <form onSubmit={handleManualInput} className="space-y-3">
                  <input type="text" name="barcode" placeholder="Enter barcode manually" className="input text-center" autoFocus />
                  <button type="submit" className="btn-primary w-full">Submit</button>
                </form>
              </div>
            ) : (
              <>
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-primary-500/50 rounded-xl">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/3 border-2 border-primary-400 rounded-lg" />
                  </div>
                </div>
                <p className="text-xs text-center text-secondary-400">Point the camera at the barcode</p>
                <div className="flex space-x-2">
                  <button onClick={() => { stopCamera(); onClose(); }} className="btn-secondary flex-1">Cancel</button>
                  <form onSubmit={handleManualInput} className="flex-1">
                    <input type="text" name="barcode" placeholder="Or type code" className="input w-full text-sm" />
                  </form>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
