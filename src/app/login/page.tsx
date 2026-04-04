'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Briefcase, 
  Mail, 
  Lock, 
  Loader2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError('E-mail ou senha incorretos. Verifique suas credenciais.')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="glass-card p-10 rounded-[48px] border border-white/5 shadow-2xll relative overflow-hidden">
          {/* Logo e Título */}
          <div className="flex flex-col items-center gap-6 mb-10">
            <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-2xl shadow-white/10 group">
              <Briefcase className="w-8 h-8 text-black" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-black tracking-tight text-white mb-2 italic uppercase">
                Flow Manager
              </h1>
              <p className="text-[#a1a1aa] text-sm font-medium tracking-wide">
                Acesse sua conta técnica para continuar.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-xs text-red-200 font-bold leading-tight">{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-1.5 group">
              <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-black ml-1 flex items-center gap-2 group-focus-within:text-white transition-colors">
                <Mail className="w-3 h-3" /> E-mail Profissional
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="todo-input px-5 py-4 rounded-2xl text-sm transition-all focus:ring-4 focus:ring-white/5 bg-white/5 border-white/5 outline-none hover:border-white/10"
                placeholder="seu@email.com"
              />
            </div>

            <div className="flex flex-col gap-1.5 group">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-black flex items-center gap-2 group-focus-within:text-white transition-colors">
                  <Lock className="w-3 h-3" /> Senha Segura
                </label>
                <button 
                  type="button"
                  onClick={async () => {
                    if (!email) return alert('Por favor, digite seu e-mail primeiro.')
                    const { error } = await supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
                    })
                    if (error) alert('Erro: ' + error.message)
                    else alert('E-mail de redefinição enviado com sucesso! Verifique sua caixa de entrada.')
                  }}
                  className="text-[9px] font-black text-white/30 hover:text-white transition-colors uppercase tracking-widest"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="todo-input px-5 py-4 rounded-2xl text-sm transition-all focus:ring-4 focus:ring-white/5 bg-white/5 border-white/5 outline-none hover:border-white/10"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-4 rounded-[28px] font-black text-sm hover:bg-[#e4e4e7] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 mt-4 shadow-2xl shadow-white/10"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  LOGIN <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] text-[#52525b] font-black uppercase tracking-[0.3em]">
              Sistema de Fluxo Técnico v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
