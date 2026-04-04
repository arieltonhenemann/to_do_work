'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Lock, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    setError(null)

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    })

    if (updateError) {
      setError('Erro ao atualizar senha: ' + updateError.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-700">
        <div className="glass-card p-10 rounded-[48px] border border-white/5 shadow-2xl">
          <div className="flex flex-col items-center gap-6 mb-10">
            <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-2xl shadow-white/10">
              <Lock className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">Redefinir Senha</h1>
          </div>

          {!success ? (
            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-xs text-red-200 font-bold">{error}</p>
                </div>
              )}

              <div className="flex flex-col gap-1.5 group">
                <label className="text-[10px] uppercase font-black text-[#52525b] ml-1 tracking-widest">Nova Senha</label>
                <input
                  type="password" required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="todo-input px-5 py-4 rounded-2xl text-sm bg-white/5 border-white/5 outline-none hover:border-white/10"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex flex-col gap-1.5 group">
                <label className="text-[10px] uppercase font-black text-[#52525b] ml-1 tracking-widest">Confirmar Nova Senha</label>
                <input
                  type="password" required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="todo-input px-5 py-4 rounded-2xl text-sm bg-white/5 border-white/5 outline-none hover:border-white/10"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full bg-white text-black py-4 rounded-[28px] font-black text-sm hover:bg-[#e4e4e7] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 mt-4 shadow-2xl shadow-white/10"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>ATUALIZAR SENHA <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-6 py-4 animate-in zoom-in">
              <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white mb-2">Senha Alterada!</p>
                <p className="text-sm text-[#a1a1aa]">Você será redirecionado para o login em instantes...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
