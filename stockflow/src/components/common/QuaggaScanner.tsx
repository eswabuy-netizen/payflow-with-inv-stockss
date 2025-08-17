import React, { useEffect, useRef, useState } from 'react';
import Quagga from '@ericblade/quagga2';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

interface QuaggaScannerProps {
  onDetected: (code: string) => void;
  onClose: () => void;
}

const QuaggaScanner: React.FC<QuaggaScannerProps> = ({ onDetected, onClose }) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Barcode validation function
  const isValidBarcode = (code: string): boolean => {
    // Remove any non-digit characters for validation
    const cleanCode = code.replace(/\D/g, '');
    
    // Check for common barcode lengths
    const validLengths = [8, 12, 13, 14]; // EAN-8, UPC-A, EAN-13, GTIN-14
    if (!validLengths.includes(cleanCode.length)) {
      return false;
    }

    // Basic checksum validation for EAN-13
    if (cleanCode.length === 13) {
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(cleanCode[i]) * (i % 2 === 0 ? 1 : 3);
      }
      const checksum = (10 - (sum % 10)) % 10;
      return checksum === parseInt(cleanCode[12]);
    }

    return true;
  };

  useEffect(() => {
    if (scannerRef.current) {
      setIsInitializing(true);
      setError(null);

      // Get viewport dimensions for responsive camera constraints
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate responsive camera dimensions
      const isMobile = viewportWidth < 768;
      const cameraWidth = isMobile ? Math.min(viewportWidth - 40, 320) : 640;
      const cameraHeight = isMobile ? Math.min(viewportHeight * 0.4, 240) : 480;

      Quagga.init({
        inputStream: {
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: {
            facingMode: 'environment',
            width: { min: cameraWidth * 0.8, ideal: cameraWidth, max: cameraWidth * 1.2 },
            height: { min: cameraHeight * 0.8, ideal: cameraHeight, max: cameraHeight * 1.2 },
          },
        },
        decoder: {
          readers: [
            'ean_reader',
            'ean_8_reader',
            'upc_reader',
            'upc_e_reader',
            'code_128_reader',
            'code_39_reader',
            'code_39_vin_reader',
            'codabar_reader',
            'i2of5_reader',
            '2of5_reader',
            'code_93_reader',
          ],
          multiple: false,
        },
        locate: true,
        frequency: 10,
      }, (err) => {
        setIsInitializing(false);
        if (err) {
          console.error('Quagga init error:', err);
          setError('Failed to initialize camera. Please check camera permissions and try again.');
          return;
        }
        
        Quagga.start();
      });

      Quagga.onDetected(handleDetected);
      Quagga.onProcessed(handleProcessed);

      return () => {
        Quagga.offDetected(handleDetected);
        Quagga.offProcessed(handleProcessed);
        Quagga.stop();
      };
    }
  }, []);

  const handleProcessed = (result: any) => {
    if (result) {
      const drawingCanvas = Quagga.canvas.dom.overlay;
      const drawingCtx = drawingCanvas.getContext('2d');
      
      if (!drawingCtx) return;
      
      if (result.boxes) {
        const width = drawingCanvas.getAttribute('width');
        const height = drawingCanvas.getAttribute('height');
        
        if (width && height) {
          drawingCtx.clearRect(0, 0, parseInt(width), parseInt(height));
        }
        
        result.boxes.filter((box: any) => box !== result.box).forEach((box: any) => {
          Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: 'green', lineWidth: 2 });
        });
      }

      if (result.box) {
        Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: 'blue', lineWidth: 2 });
      }

      if (result.codeResult && result.codeResult.code) {
        Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
      }
    }
  };

  const handleDetected = (result: any) => {
    if (result && result.codeResult && result.codeResult.code && !isProcessing) {
      const code = result.codeResult.code.trim();
      
      // Validate barcode
      if (!isValidBarcode(code)) {
        setError('Invalid barcode format detected. Please try again.');
        setTimeout(() => setError(null), 3000);
        return;
      }

      setIsProcessing(true);
      setLastScannedCode(code);
      
      // Add a small delay to show the success state
      setTimeout(() => {
        onDetected(code);
        Quagga.stop();
      }, 500);
    }
  };

  const handleClose = () => {
    Quagga.stop();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 relative w-full max-w-sm sm:max-w-md flex flex-col items-center max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10 p-1"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        
        <h3 className="mb-4 text-base sm:text-lg font-semibold text-gray-900 dark:text-white text-center">
          Scan Product Barcode
        </h3>
        
        {isInitializing && (
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Initializing camera...</span>
          </div>
        )}

        {error && (
          <div className="flex items-start mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg w-full">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</span>
          </div>
        )}

        {lastScannedCode && !error && (
          <div className="flex items-start mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg w-full">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-green-600 dark:text-green-400">
              Barcode detected: {lastScannedCode}
            </span>
          </div>
        )}

        <div 
          ref={scannerRef} 
          className="w-full max-w-[280px] sm:max-w-[320px] h-[200px] sm:h-[240px] rounded border-2 border-gray-300 dark:border-gray-700 overflow-hidden relative"
        >
          {/* Scanning overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-24 sm:w-48 sm:h-32 border-2 border-blue-500 rounded-lg">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center w-full">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
            Align the barcode within the blue frame
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Supported formats: EAN-8, EAN-13, UPC-A, Code 128, Code 39
          </p>
        </div>

        {isProcessing && (
          <div className="mt-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-green-600"></div>
            <span className="ml-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuaggaScanner; 