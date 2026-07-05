'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, RotateCcw, Check } from 'lucide-react';

export default function CameraCapture({ onClose, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState('');
  const [captured, setCaptured] = useState(null);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setError('Could not access camera. Please check browser permissions.'));

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setCaptured(canvas.toDataURL('image/jpeg', 0.9));
  };

  const handleUse = () => {
    fetch(captured)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
      });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-primary to-primary-light p-4 flex items-center justify-between">
          <h3 className="text-white font-display font-bold">Take Photo</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          {error ? (
            <p className="text-red-600 text-sm text-center py-10">{error}</p>
          ) : (
            <div className="rounded-2xl overflow-hidden bg-black aspect-square flex items-center justify-center">
              {captured ? (
                <img src={captured} alt="Captured" className="w-full h-full object-cover" />
              ) : (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              )}
            </div>
          )}

          <div className="flex gap-3 mt-5">
            {captured ? (
              <>
                <button onClick={() => setCaptured(null)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-primary-200 text-primary text-sm font-medium hover:bg-primary-50 transition-colors">
                  <RotateCcw className="w-4 h-4" />
                  Retake
                </button>
                <button onClick={handleUse} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  Use Photo
                </button>
              </>
            ) : (
              <button onClick={handleCapture} disabled={!!error} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-40">
                <Camera className="w-4 h-4" />
                Capture
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
