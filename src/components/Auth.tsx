"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Building, Target, ArrowRight } from "lucide-react";

interface AuthProps {
  onLogin: (user: any) => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
    area: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de login/cadastro
    const userData = {
      ...formData,
      name: formData.name || formData.email.split("@")[0] || "Usuário",
    };
    localStorage.setItem("imersa-user", JSON.stringify(userData));
    onLogin(userData);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-cyan/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-cyan/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Logo" className="w-24 h-24 mb-4 rounded-full border-2 border-brand-cyan/20 p-1 bg-brand-teal/50" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Imersa Arena</h1>
          <p className="text-brand-cyan/60 text-sm mt-1">Sua arena de treinamento em vendas</p>
        </div>

        <div className="bg-brand-teal/30 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex gap-4 mb-8 p-1 bg-brand-dark/50 rounded-2xl border border-white/5">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                isLogin ? "bg-brand-cyan text-brand-dark shadow-lg" : "text-white/50 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                !isLogin ? "bg-brand-cyan text-brand-dark shadow-lg" : "text-white/50 hover:text-white"
              }`}
            >
              Cadastro
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4"
              >
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    required
                    className="w-full bg-brand-dark/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-cyan/50 transition-colors"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="text"
                    placeholder="Empresa"
                    required
                    className="w-full bg-brand-dark/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-cyan/50 transition-colors"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <select
                    required
                    className="w-full bg-brand-dark/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white appearance-none focus:outline-none focus:border-brand-cyan/50 transition-colors"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  >
                    <option value="" disabled className="bg-brand-dark">Sua área de vendas</option>
                    <option value="SDR" className="bg-brand-dark">SDR / BDR</option>
                    <option value="Account Executive" className="bg-brand-dark">Account Executive</option>
                    <option value="Sales Manager" className="bg-brand-dark">Sales Manager</option>
                    <option value="Customer Success" className="bg-brand-dark">Customer Success</option>
                  </select>
                </div>
              </motion.div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="email"
                placeholder="E-mail"
                required
                className="w-full bg-brand-dark/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-cyan/50 transition-colors"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="password"
                placeholder="Senha"
                required
                className="w-full bg-brand-dark/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-cyan/50 transition-colors"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-cyan hover:bg-brand-cyan/90 text-brand-dark font-bold py-4 rounded-2xl flex items-center justify-center gap-2 mt-6 transition-all shadow-lg active:scale-95"
            >
              {isLogin ? "Entrar" : "Criar Conta"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-8">
          Ao continuar, você concorda com nossos Termos de Uso.
        </p>
      </motion.div>
    </div>
  );
}
