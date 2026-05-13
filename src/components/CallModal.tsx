"use client";

import { useState, useEffect, useRef } from "react";
import { Persona } from "@/lib/personas";
import { Phone, PhoneOff, Mic, MicOff, Volume2, X, Loader2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FeedbackReport from "./FeedbackReport";
import Vapi from "@vapi-ai/web";

// Interface para o Vapi
const vapi = typeof window !== "undefined" ? new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "YOUR_PUBLIC_KEY") : null;

interface CallModalProps {
  persona: Persona;
  onClose: () => void;
  onFeedbackComplete?: (report: any) => void;
}

type CallStatus = "dialing" | "ringing" | "active" | "ended";

export default function CallModal({ persona, onClose, onFeedbackComplete }: CallModalProps) {
  const [status, setStatus] = useState<CallStatus>("dialing");
  const [timer, setTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [vapiStatus, setVapiStatus] = useState("inactive");
  const [transcript, setTranscript] = useState<string>("");
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Inicializar áudio apenas no cliente
    if (typeof window !== "undefined") {
      ringtoneRef.current = new Audio("/sounds/ringing.mp3");
      ringtoneRef.current.loop = true;
    }

    isMountedRef.current = true;
    if (!vapi) return;

    // Handlers do Vapi
    const onCallStart = () => {
      console.log("DEBUG: Vapi Call started");
      setVapiStatus("active");
    };

    const onMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setTranscript(prev => prev + `\n${message.role}: ${message.transcript}`);
      }
    };

    const onCallEnd = () => {
      console.log("DEBUG: Vapi Call ended from server");
      setVapiStatus("inactive");
      if (isMountedRef.current) handleEndCall();
    };

    const onError = (e: any) => {
      console.error("Vapi Error Details:", {
        message: e?.message,
        error: e,
        vapiStatus: vapiStatus,
        publicKey: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ? "CONFIGURED" : "MISSING"
      });
      // Se houver erro de ejeção ou falha de carregamento, encerramos a UI
      if (e?.message?.includes("ejection") || e?.message?.includes("ended") || e?.message?.includes("failed")) {
        handleEndCall();
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("message", onMessage);
    vapi.on("call-end", onCallEnd);
    vapi.on("error", onError);

    const sequence = async () => {
      console.log("DEBUG: Starting sequence, status:", status);
      
      // Verificação de Origem Segura (Mic precisa de localhost ou https)
      if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.protocol !== "https:") {
        console.error("ERRO: Microfone bloqueado em conexões HTTP que não sejam localhost.");
        alert("Erro de Segurança: O microfone só funciona em 'localhost' ou 'https'. Use http://localhost:3000");
        handleEndCall();
        return;
      }

      // 1. Discando (1.5s)
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (!isMountedRef.current) return;

      setStatus(prev => {
        if (prev === "ended") return prev;
        
        // Iniciar toque de telefone
        if (ringtoneRef.current) {
          ringtoneRef.current.play().catch(err => console.warn("Erro ao tocar ringtone:", err));
        }
        
        return "ringing";
      });
      
      // 2. Tocando (3s)
      await new Promise(resolve => setTimeout(resolve, 3000));
      if (!isMountedRef.current) return;
      
      setStatus(prev => {
        if (prev === "ended") return prev;
        
        // Parar toque de telefone
        if (ringtoneRef.current) {
          ringtoneRef.current.pause();
          ringtoneRef.current.currentTime = 0;
        }

        // 3. Atender (Conectar Vapi)
        try {
          if (process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY && vapi) {
            console.log("DEBUG: Starting Vapi for assistant:", persona.vapiAssistantId);
            vapi.start(persona.vapiAssistantId).catch(err => {
              if (!err?.message?.includes("already-active")) {
                console.warn("Vapi start promise failed:", err);
                // Se falhar por permissão, avisamos
                if (err?.message?.includes("NotAllowedError") || err?.message?.includes("Permission")) {
                  alert("Permissão de microfone negada. Ative o microfone no navegador.");
                }
              }
            });
          }
        } catch (err) {
          console.warn("Vapi start failed, continuing in mock mode");
        }

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setTimer(t => t + 1);
        }, 1000);

        return "active";
      });
    };

    sequence();

    return () => {
      console.log("DEBUG: CallModal Unmounting, cleaning up...");
      isMountedRef.current = false;
      
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
        ringtoneRef.current = null;
      }

      if (vapi) {
        vapi.stop();
        vapi.off("call-start", onCallStart);
        vapi.off("message", onMessage);
        vapi.off("call-end", onCallEnd);
        vapi.off("error", onError);
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [persona.vapiAssistantId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    console.log("DEBUG: handleEndCall called");
    
    // Parar ringtone se ainda estiver tocando
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }

    try {
      if (vapi) vapi.stop();
    } catch (e) {
      console.error("Error stopping Vapi:", e);
    }
    
    if (timerRef.current) {
      console.log("DEBUG: Clearing timer interval");
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setStatus("ended");
    
    setTimeout(() => {
      setShowReport(true);
    }, 1200);
  };

  const toggleMute = () => {
    if (vapi) {
      const newMute = !isMuted;
      vapi.setMuted(newMute);
      setIsMuted(newMute);
    } else {
      setIsMuted(!isMuted);
    }
  };

  if (showReport) {
    return <FeedbackReport persona={persona} duration={timer} transcript={transcript} onClose={onClose} onComplete={onFeedbackComplete} />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-800 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 relative"
      >
        {/* Decorative Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Imersa HD Voice
            </span>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-8 pt-8 pb-12 flex flex-col items-center text-center">
          <div className="relative mb-10">
            <motion.div 
              animate={status === "active" ? { 
                boxShadow: ["0 0 0 0px rgba(79, 70, 229, 0)", "0 0 0 30px rgba(79, 70, 229, 0.15)", "0 0 0 0px rgba(79, 70, 229, 0)"] 
              } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-48 h-48 rounded-[3rem] bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-7xl shadow-2xl relative z-10 border-2 border-white/20 overflow-hidden"
            >
              {persona.avatar.startsWith('http') ? (
                <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover scale-110" />
              ) : (
                persona.avatar
              )}
            </motion.div>
            {status === "ringing" && (
               <motion.div 
                animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 rounded-[3rem] bg-indigo-500/40 z-0"
               />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-1">{persona.name}</h2>
          <p className="text-indigo-400 font-semibold tracking-wide text-sm">{persona.role}</p>

          <div className="mt-8 h-16 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {status === "dialing" && (
                <motion.div key="dialing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                  <span className="text-lg font-medium">Iniciando...</span>
                </motion.div>
              )}
              {status === "ringing" && (
                <motion.div key="ringing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-white/80 text-xl font-light tracking-[0.3em] uppercase">
                  Chamando...
                </motion.div>
              )}
              {status === "active" && (
                <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                  <span className="text-4xl font-mono font-light text-white mb-4 tracking-tighter">{formatTime(timer)}</span>
                  <div className="flex items-end gap-1.5 h-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ height: [4, Math.random() * 20 + 4, 4] }}
                        transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.05 }}
                        className="w-1.5 bg-indigo-500 rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              {status === "ended" && (
                <motion.div key="ended" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-500 font-bold text-lg">
                  LIGAÇÃO ENCERRADA
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Dynamic Tips */}
        {status === "active" && (
          <div className="px-8 pb-8">
            <div className="bg-white/5 rounded-3xl p-5 border border-white/5 flex gap-4 items-start">
              <div className="bg-indigo-500/20 p-2 rounded-xl">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{persona.name.split(' ')[0]} parece estar ocupada. Tente validar o tempo dela antes de seguir com o pitch."
              </p>
            </div>
          </div>
        )}

        {/* Controls Bar */}
        <div className="px-8 pb-10 flex justify-between items-center">
          <button 
            onClick={toggleMute}
            className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/5 text-white hover:bg-white/10'}`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          <button 
            onClick={handleEndCall}
            className="w-24 h-24 rounded-[2.5rem] bg-red-600 flex items-center justify-center text-white hover:bg-red-700 transition-all shadow-[0_0_40px_rgba(220,38,38,0.3)] active:scale-95"
          >
            <PhoneOff className="w-10 h-10" />
          </button>

          <button className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all">
            <Volume2 className="w-6 h-6" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
