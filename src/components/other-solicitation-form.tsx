'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send, Loader2, MessageSquare, User, Lightbulb } from 'lucide-react'

export default function OtherSolicitationForm({ onTaskAdded }: { onTaskAdded: () => void }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    solicitante: '',
    problema_reclamado: '',
    solucao: ''
  })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.solicitante || !formData.problema_reclamado) return

    setLoading(true)
    const { error } = await supabase.from('tasks').insert([
      {
        ...formData,
        type: 'demais_solicitacoes',
        resolvido: 'pendente',
        planilha: 'pendente',
        status: 'pendente'
      }
    ])

    if (error) {
      console.error('Erro ao salvar:', error.message)
    } else {
      setFormData({ solicitante: '', problema_reclamado: '', solucao: '' })
      onTaskAdded()
    }
    setLoading(false)
  }

  return (
    <div className="glass-card p-8 rounded-3xl border border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-white/5 rounded-xl border border-white/10">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white">Nova Solicitação Geral</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5 group">
          <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-black ml-1 flex items-center gap-2 group-focus-within:text-white transition-colors">
            <User className="w-3 h-3" /> Solicitante
          </label>
          <input
            type="text"
            required
            value={formData.solicitante}
            onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })}
            className="todo-input px-5 py-3 rounded-2xl text-sm transition-all focus:ring-2 focus:ring-white/10 bg-white/5 border-white/5 hover:border-white/10"
            placeholder="Nome de quem solicitou"
          />
        </div>

        <div className="flex flex-col gap-1.5 group">
          <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-black ml-1 flex items-center gap-2 group-focus-within:text-white transition-colors">
            <MessageSquare className="w-3 h-3" /> Problema
          </label>
          <textarea
            required
            rows={3}
            value={formData.problema_reclamado}
            onChange={(e) => setFormData({ ...formData, problema_reclamado: e.target.value })}
            className="todo-input px-5 py-3 rounded-2xl text-sm transition-all focus:ring-2 focus:ring-white/10 resize-none bg-white/5 border-white/5 hover:border-white/10"
            placeholder="Descreva o problema reclamado..."
          />
        </div>

        <div className="flex flex-col gap-1.5 group">
          <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-black ml-1 flex items-center gap-2 group-focus-within:text-white transition-colors">
            <Lightbulb className="w-3 h-3" /> Solução (Se houver)
          </label>
          <textarea
            rows={2}
            value={formData.solucao}
            onChange={(e) => setFormData({ ...formData, solucao: e.target.value })}
            className="todo-input px-5 py-3 rounded-2xl text-sm transition-all focus:ring-2 focus:ring-white/10 resize-none bg-white/5 border-white/5 hover:border-white/10"
            placeholder="Solução aplicada ou nota técnica..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black py-4 rounded-2xl font-black text-sm hover:bg-[#e4e4e7] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 mt-2 shadow-xl shadow-white/5"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <>
              <Send className="w-4 h-4" />
              REGISTRAR SOLICITAÇÃO
            </>
          )}
        </button>
      </form>
    </div>
  )
}
