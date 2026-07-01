import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';
import { useLanguage } from '../contexts/LanguageContext';
import { HiOutlinePhone, HiOutlineVideoCamera, HiOutlineX, HiOutlineMicrophone } from 'react-icons/hi';

interface VideoConsultationProps {
  roomId: string;
  patientName: string;
  onClose: () => void;
}

export default function VideoConsultation({ roomId, patientName, onClose }: VideoConsultationProps) {
  const { language } = useLanguage();
  const { socket } = useSocket();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    startCall();
    const timer = setInterval(() => setDuration(d => d + 1), 1000);
    return () => { clearInterval(timer); stopCall(); };
  }, []);

  async function startCall() {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });
      pcRef.current = pc;

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket?.emit('video:ice-candidate', { roomId, candidate: e.candidate });
        }
      };

      pc.ontrack = (e) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = e.streams[0];
          setIsConnecting(false);
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      socket?.emit('video:offer', { roomId });
    } catch (err) {
      console.error('Video call error:', err);
      setIsConnecting(false);
    }
  }

  const stopCall = useCallback(() => {
    pcRef.current?.close();
    const stream = localVideoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t: MediaStreamTrack) => t.stop());
  }, []);

  const toggleMute = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    stream?.getAudioTracks().forEach(t => t.enabled = isMuted);
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    stream?.getVideoTracks().forEach(t => t.enabled = isVideoOff);
    setIsVideoOff(!isVideoOff);
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      <div className="flex-1 relative">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        {isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary-900/80">
            <div className="text-center text-white">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg">{language === 'fr' ? 'Connexion en cours...' : 'Connecting...'}</p>
              <p className="text-sm text-secondary-400">{patientName}</p>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 right-4 w-32 h-40 rounded-xl overflow-hidden border-2 border-white shadow-lg">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        </div>

        <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/50 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-white text-sm">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="bg-secondary-900 px-6 py-4 flex items-center justify-center space-x-6">
        <button onClick={toggleMute} className={`p-4 rounded-full transition ${isMuted ? 'bg-red-600 text-white' : 'bg-secondary-700 text-white hover:bg-secondary-600'}`}>
          <HiOutlineMicrophone className="h-6 w-6" />
        </button>
        <button onClick={toggleVideo} className={`p-4 rounded-full transition ${isVideoOff ? 'bg-red-600 text-white' : 'bg-secondary-700 text-white hover:bg-secondary-600'}`}>
          <HiOutlineVideoCamera className="h-6 w-6" />
        </button>
        <button onClick={onClose} className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition">
          <HiOutlinePhone className="h-6 w-6 rotate-135" />
        </button>
      </div>
    </motion.div>
  );
}
