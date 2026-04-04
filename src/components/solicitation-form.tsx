'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ClipboardCheck, Loader2 } from 'lucide-react'

export default function SolicitationForm({ onTaskAdded }: { onTaskAdded: () => void }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    cliente: '',
    problema_reclamado: '',
    solucao: ''
  })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.cliente || !formData.problema_reclamado) return

    setLoading(true)
    const { error } = await supabase.from('tasks').insert([
      {
        ...formData,
        type: 'solicitacao',
        verificado: 'pendente',
        planilha: 'pendente',
        status: 'pendente'
      }
    ])

    if (error) {
      console.error('Erro ao salvar:', error.message)
    } else {
      setFormData({
        cliente: '',
        problema_reclamado: '',
        solucao: ''
      })
      onTaskAdded()
    }
    setLoading(false)
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
        <ClipboardCheck className="w-5 h-5 text-purple-400" />
        Nova Solicitação
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold ml-1">Cliente</label>
          <input
            type="text"
            required
            value={formData.cliente}
            onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
            className="todo-input px-4 py-2.5 rounded-xl text-sm"
            placeholder="Nome do cliente solicitante"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold ml-1">Problema Reclamado</label>
          <textarea
            required
            rows={3}
            value={formData.problema_reclamado}
            onChange={(e) => setFormData({ ...formData, problema_reclamado: e.target.value })}
            className="todo-input px-4 py-2.5 rounded-xl text-sm resize-none"
            placeholder="Descreva o problema relatado..."
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold ml-1">Solução</label>
          <textarea
            rows={3}
            value={formData.solucao}
            onChange={(e) => setFormData({ ...formData, solucao: e.target.value })}
            className="todo-input px-4 py-2.5 rounded-xl text-sm resize-none"
            placeholder="Anotações sobre a solução..."
          />
        </div>

        <div className="md:col-span-2 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-purple-400 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Registrar Solicitação'}
          </button>
        </div>
      </form>
    </div>
  )
}
