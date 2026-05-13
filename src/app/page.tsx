"use client";

import { useState, useEffect } from "react";
import { personas, Persona } from "@/lib/personas";
import { Phone, CheckCircle2, AlertCircle, PlayCircle, Star, LogOut, User as UserIcon, ArrowRight, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CallModal from "@/components/CallModal";
import FeedbackReport from "@/components/FeedbackReport";
import Auth from "@/components/Auth";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem("imersa-user");
    const savedHistory = localStorage.getItem("imersa-history");
    const savedPoints = localStorage.getItem("imersa-points");
    
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedHistory) setCallHistory(JSON.parse(savedHistory));
    
    if (savedPoints) {
      const parsed = parseInt(savedPoints);
      setTotalPoints(isNaN(parsed) ? 0 : parsed);
    }
    
    setIsLoading(false);
  }, []);

  const addToHistory = (report: any) => {
    const newHistory = [report, ...callHistory].slice(0, 10);
    setCallHistory(newHistory);
    localStorage.setItem("imersa-history", JSON.stringify(newHistory));

    // Somar pontos (usando o score da call) com proteção contra NaN
    const score = parseInt(report.score) || 0;
    const currentPoints = isNaN(totalPoints) ? 0 : totalPoints;
    const newPoints = currentPoints + score;
    
    setTotalPoints(newPoints);
    localStorage.setItem("imersa-points", newPoints.toString());
  };

  const handleLogout = () => {
    localStorage.removeItem("imersa-user");
    localStorage.removeItem("imersa-points");
    setUser(null);
  };

  if (isLoading) return null;
  if (!user) return <Auth onLogin={setUser} />;

  return (
    <main className="min-h-screen bg-brand-dark text-white font-sans selection:bg-brand-cyan/30 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-[20%] w-[600px] h-[600px] bg-brand-cyan/3 rounded-full blur-[150px] -z-10" />

      {/* Navbar */}
      <nav className="border-b border-white/5 bg-brand-dark/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full border border-brand-cyan/30 bg-brand-teal/50" />
            <span className="font-bold text-xl tracking-tight hidden sm:block">Imersa Arena</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Pontuação */}
            <div className="flex items-center gap-2 px-4 py-2 bg-brand-cyan/10 border border-brand-cyan/30 rounded-full">
              <Star className="w-4 h-4 text-brand-cyan fill-brand-cyan" />
              <span className="text-sm font-black text-brand-cyan">{totalPoints.toLocaleString()} XP</span>
            </div>

            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-brand-teal/30 rounded-full border border-white/5">
              <div className="w-8 h-8 rounded-full bg-brand-cyan/20 flex items-center justify-center text-brand-cyan">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold leading-none">{user.name}</p>
                <p className="text-[10px] text-brand-cyan/60 uppercase tracking-wider">{user.area || 'Vendedor'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-red-400"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <header className="text-center mb-20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-cyan/5 rounded-full blur-[100px] -z-10" />
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 text-white"
          >
            Sua arena de <br/> treinamento em vendas.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-brand-cyan font-semibold max-w-2xl mx-auto leading-relaxed"
          >
            Domine abordagens, vença objeções e acelere sua curva de aprendizado com simulações realistas guiadas por inteligência artificial.
          </motion.p>
        </header>

        {/* Personas Grid */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-white">Escolha seu cenário</h2>
            <div className="px-4 py-1 bg-brand-cyan/20 border border-brand-cyan/40 rounded-full text-[10px] uppercase tracking-widest text-brand-cyan font-bold">
              4 Personas Ativas
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.map((persona) => (
              <motion.div
                key={persona.id}
                whileHover={{ y: -8 }}
                className="group relative bg-brand-teal/20 border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-brand-cyan/50 transition-all duration-500 shadow-2xl"
              >
                <div className="aspect-[4/5] relative">
                  <img 
                    src={persona.avatar} 
                    alt={persona.name} 
                    className="w-full h-full object-cover transition-all duration-700 scale-[1.15] group-hover:scale-[1.25] object-top"
                  />
                  
                  {/* Overlay escuro constante para legibilidade absoluta */}
                  <div className="absolute inset-0 bg-brand-dark/40 group-hover:bg-brand-dark/20 transition-colors duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-transparent opacity-100" />
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="bg-brand-dark/80 backdrop-blur-md border border-brand-cyan/40 px-3 py-1 rounded-full w-fit mb-3">
                      <p className="text-[10px] font-bold text-brand-cyan uppercase tracking-widest">{persona.role}</p>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-2 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {persona.name}
                    </h3>
                    
                    <p className="text-[13px] text-white font-bold line-clamp-3 leading-relaxed mb-6 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
                      {persona.description}
                    </p>
                    
                    <button 
                      onClick={() => {
                        setSelectedPersona(persona);
                        setIsCallOpen(true);
                      }}
                      className="w-full py-4 bg-brand-cyan text-brand-dark rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(0,0,0,0.4)] hover:shadow-brand-cyan/40 transition-all duration-300 active:scale-95"
                    >
                      Iniciar Arena
                      <PlayCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Histórico */}
        {callHistory.length > 0 && (
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-32 max-w-5xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-brand-cyan/10 rounded-xl border border-brand-cyan/20">
                <Star className="w-5 h-5 text-brand-cyan fill-brand-cyan" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Suas últimas batalhas</h2>
            </div>
            
            <div className="grid gap-3">
              {callHistory.map((call, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setSelectedReport(call)}
                  className="w-full text-left bg-brand-teal/10 border border-white/5 rounded-2xl p-5 flex items-center justify-between hover:bg-brand-teal/20 hover:border-brand-cyan/20 transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 group-hover:border-brand-cyan/30 transition-colors">
                      <img src={call.personaAvatar} alt={call.personaName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-brand-cyan transition-colors">{call.personaName}</h3>
                      <p className="text-xs text-white/40">{new Date(call.date).toLocaleDateString()} • Engajamento {call.engagement}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div className="text-3xl font-black text-white group-hover:text-brand-cyan transition-colors">{call.score}%</div>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Score</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/10 group-hover:text-brand-cyan group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </motion.section>
        )}

        {/* Ranking Global (Fictício para MVP) */}
        <section className="mt-32 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-brand-cyan/10 rounded-xl border border-brand-cyan/20">
              <Target className="w-5 h-5 text-brand-cyan" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Ranking da Arena</h2>
          </div>

          <div className="bg-brand-teal/10 border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-white/5">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-brand-cyan/60">
                <span>Posição / Vendedor</span>
                <span>Pontuação Total</span>
              </div>
            </div>
            
            <div className="divide-y divide-white/5">
              {[
                { name: "Thiago Souza", company: "SalesForce", xp: 12450, rank: 1, avatar: "https://i.pravatar.cc/150?u=thiago" },
                { name: "Beatriz M.", company: "HubSpot", xp: 10200, rank: 2, avatar: "https://i.pravatar.cc/150?u=bea" },
                { name: user.name, company: user.company, xp: totalPoints, rank: "VOCÊ", avatar: "https://i.pravatar.cc/150?u=user", isUser: true },
                { name: "Lucas Ferreira", company: "Zendesk", xp: 8900, rank: 4, avatar: "https://i.pravatar.cc/150?u=lucas" },
                { name: "Mariana Costa", company: "RD Station", xp: 7500, rank: 5, avatar: "https://i.pravatar.cc/150?u=mari" },
              ].sort((a, b) => b.xp - a.xp).map((competitor, idx) => (
                <div 
                  key={idx} 
                  className={`p-6 flex items-center justify-between transition-colors ${competitor.isUser ? 'bg-brand-cyan/10' : 'hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${
                      idx === 0 ? 'bg-yellow-500 text-brand-dark' : 
                      idx === 1 ? 'bg-slate-300 text-brand-dark' : 
                      idx === 2 ? 'bg-amber-700 text-white' : 'text-white/40'
                    }`}>
                      {idx + 1}º
                    </div>
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10">
                      <img src={competitor.avatar} alt={competitor.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className={`font-bold ${competitor.isUser ? 'text-brand-cyan' : 'text-white'}`}>
                        {competitor.name} {competitor.isUser && "(Você)"}
                      </h4>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">{competitor.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-white">{competitor.xp.toLocaleString()}</div>
                    <p className="text-[10px] text-brand-cyan font-bold uppercase tracking-widest">XP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-20 opacity-30">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 rounded-full grayscale" />
            <span className="text-sm font-bold">Imersa Arena</span>
          </div>
          <p className="text-xs">© 2026 Arena de Treinamento. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Modais */}
      <AnimatePresence>
        {isCallOpen && selectedPersona && (
          <CallModal 
            persona={selectedPersona} 
            onClose={() => setIsCallOpen(false)}
            onFeedbackComplete={(report) => addToHistory({
              ...report,
              personaName: selectedPersona.name,
              personaAvatar: selectedPersona.avatar,
              date: new Date().toISOString(),
              personaRole: selectedPersona.role 
            })}
          />
        )}

        {selectedReport && (
          <FeedbackReport 
            persona={{ 
              ...selectedReport,
              name: selectedReport.personaName, 
              role: selectedReport.personaRole, 
              avatar: selectedReport.personaAvatar 
            } as any}
            transcript={selectedReport.transcript || ""}
            duration={0} 
            onClose={() => setSelectedReport(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
