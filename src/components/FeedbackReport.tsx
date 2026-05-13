"use client";

import { useState, useEffect, useRef } from "react";
import { Persona } from "@/lib/personas";
import { CheckCircle2, XCircle, TrendingUp, Award, ArrowRight, RefreshCw, Home, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface FeedbackReportProps {
  persona: Persona;
  duration: number;
  transcript: string;
  onClose: () => void;
  onComplete?: (report: any) => void;
}

interface AnalysisData {
  score: number;
  engagement: string;
  strengths: string[];
  weaknesses: string[];
  expertTip: string;
}

export default function FeedbackReport({ persona, duration, transcript, onClose, onComplete }: FeedbackReportProps) {
  const [loading, setLoading] = useState(!transcript && !onComplete);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<boolean>(false);
  const analysisStarted = useRef(false);

  async function getAnalysis() {
    setError(false);
    setLoading(true);
    try {
      const response = await fetch("/api/analyze-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          personaName: persona.name,
          personaRole: persona.role,
        }),
      });
      
      if (!response.ok) throw new Error("Falha na análise");
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Erro ao carregar análise:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  // Efeito para notificar a conclusão apenas quando os dados estiverem prontos
  useEffect(() => {
    if (data && onComplete && !loading && !error) {
      onComplete(data);
    }
  }, [data, loading, error, onComplete]);

  useEffect(() => {
    if (typeof (persona as any).score !== 'undefined') {
      setData(persona as any);
      setLoading(false);
      return;
    }

    if (analysisStarted.current) return;
    analysisStarted.current = true;

    if (transcript) {
      getAnalysis();
    } else {
      const fallback = {
        score: 0,
        engagement: "Nenhuma",
        strengths: ["Chamada muito curta para análise"],
        weaknesses: ["Nenhuma interação capturada"],
        expertTip: "Tente falar um pouco mais na próxima vez para que a IA possa analisar seu pitch."
      };
      setData(fallback);
      setLoading(false);
    }
  }, [transcript, persona]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center p-4 bg-brand-dark/95 backdrop-blur-xl">
        <Loader2 className="w-12 h-12 text-brand-cyan animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white">Analisando sua performance...</h2>
        <p className="text-brand-cyan/60">Nossa IA está revisando os pontos chave da conversa.</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center p-4 bg-brand-dark/95 backdrop-blur-xl text-center">
        <div className="bg-red-500/20 p-4 rounded-full mb-6">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Ops! A análise falhou</h2>
        <p className="text-white/60 mb-8 max-w-md">Não conseguimos processar o feedback desta vez. Pode ter sido uma oscilação na rede ou na API da OpenAI.</p>
        <div className="flex gap-4">
          <button onClick={() => { analysisStarted.current = false; getAnalysis(); }} className="px-8 py-3 bg-brand-cyan text-brand-dark font-bold rounded-xl hover:scale-105 transition-transform">
            Tentar Novamente
          </button>
          <button onClick={onClose} className="px-8 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors">
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[60] flex items-start justify-center p-4 bg-brand-dark/95 backdrop-blur-xl overflow-y-auto pt-10 pb-20"
    >
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-white/10 overflow-hidden my-auto">
        {/* Header Report */}
        <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Award className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Relatório de Desempenho</h2>
            <p className="text-indigo-100">Simulação finalizada com {persona.name}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-8 bg-slate-50 border-b">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Duração</p>
            <p className="text-2xl font-bold text-slate-900">{formatTime(duration)}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Engajamento</p>
            <p className={`text-2xl font-bold ${data?.engagement === 'Alta' ? 'text-green-600' : data?.engagement === 'Média' ? 'text-blue-600' : 'text-orange-600'}`}>
              {data?.engagement || "N/A"}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Score Imersa</p>
            <div className="flex items-center gap-1">
              <p className="text-2xl font-bold text-indigo-600">{data?.score || 0}</p>
              <span className="text-sm text-slate-400">/ 100</span>
            </div>
          </div>
        </div>

        {/* Analysis */}
        <div className="p-8 space-y-8">
          {/* Positivos */}
          <section>
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
              <CheckCircle2 className="text-green-500 w-5 h-5" />
              Pontos Fortes
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data?.strengths.map((item, i) => (
                <li key={i} className="flex gap-3 p-3 bg-green-50 rounded-xl border border-green-100 text-sm text-green-800">
                  <div className="mt-0.5">•</div>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Negativos / Melhoria */}
          <section>
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
              <XCircle className="text-red-500 w-5 h-5" />
              Oportunidades de Melhoria
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data?.weaknesses.map((item, i) => (
                <li key={i} className="flex gap-3 p-3 bg-red-50 rounded-xl border border-red-100 text-sm text-red-800">
                  <div className="mt-0.5">•</div>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Dica de Expert */}
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex gap-4">
            <div className="bg-indigo-600 text-white p-3 rounded-xl h-fit">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-indigo-900 mb-1">Dica Personalizada</h4>
              <p className="text-sm text-indigo-800 leading-relaxed">
                {data?.expertTip}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-slate-50 border-t flex flex-col sm:flex-row gap-4 justify-between items-center">
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </button>

          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Menu Principal
            </button>
            <button className="flex-1 sm:flex-none px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
              Próxima Persona
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
