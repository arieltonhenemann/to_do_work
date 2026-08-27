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
  CheckCircle2,
  ArrowRight
} from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetMessage, setResetMessage] = useState<string | null>(null)
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
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[150px] animate-gradient" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/8 rounded-full blur-[150px] animate-gradient" style={{ animationDelay: '4s' }} />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-violet-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="glass-card-accent p-10 rounded-[48px] relative overflow-hidden">
          <div className="flex flex-col items-center gap-6 mb-10">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Briefcase className="w-8 h-8 text-white" />
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

            {resetMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-xs text-emerald-200 font-bold leading-tight">{resetMessage}</p>
              </div>
            )}

            <div className="flex flex-col gap-1.5 group">
              <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-black ml-1 flex items-center gap-2 group-focus-within:text-violet-400 transition-colors">
                <Mail className="w-3 h-3" /> E-mail Profissional
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="todo-input px-5 py-4 rounded-2xl text-sm transition-all focus:ring-4 focus:ring-violet-500/15 bg-white/5 border-white/5 outline-none hover:border-white/10"
                placeholder="seu@email.com"
              />
            </div>

            <div className="flex flex-col gap-1.5 group">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-black flex items-center gap-2 group-focus-within:text-violet-400 transition-colors">
                  <Lock className="w-3 h-3" /> Senha Segura
                </label>
                <button 
                  type="button"
                  onClick={async () => {
                    if (!email) {
                      setError('Por favor, digite seu e-mail primeiro.')
                      return
                    }
                    setResetMessage(null)
                    const { error } = await supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
                    })
                    if (error) setError('Erro: ' + error.message)
                    else setResetMessage('E-mail de redefinição enviado com sucesso! Verifique sua caixa de entrada.')
                  }}
                  className="text-[9px] font-black text-violet-400/50 hover:text-violet-400 transition-colors uppercase tracking-widest"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="todo-input px-5 py-4 rounded-2xl text-sm transition-all focus:ring-4 focus:ring-violet-500/15 bg-white/5 border-white/5 outline-none hover:border-white/10"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-4 rounded-[28px] font-black text-sm hover:from-violet-500 hover:to-indigo-500 transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 mt-4 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
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
