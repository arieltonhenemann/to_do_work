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
    <div className="bg-[#18181b] p-8 rounded-[32px] border border-white/5 animate-in fade-in slide-in-from-top-4 duration-500 shadow-xl shadow-black/20">
      <h2 className="text-xl font-extrabold mb-8 flex items-center gap-3 text-white">
        <div className="p-2 bg-white rounded-lg">
          <ClipboardCheck className="w-5 h-5 text-black" />
        </div>
        Nova Solicitação
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-black ml-1">Cliente</label>
          <input
            type="text"
            required
            value={formData.cliente}
            onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
            className="w-full bg-[#09090b] border border-white/5 text-white px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/5 focus:bg-[#18181b] focus:border-white/10 transition-all placeholder:text-[#52525b] text-sm"
            placeholder="Nome do cliente solicitante"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-black ml-1">Problema Reclamado</label>
          <textarea
            required
            rows={4}
            value={formData.problema_reclamado}
            onChange={(e) => setFormData({ ...formData, problema_reclamado: e.target.value })}
            className="w-full bg-[#09090b] border border-white/5 text-white px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/5 focus:bg-[#18181b] focus:border-white/10 transition-all placeholder:text-[#52525b] text-sm resize-none"
            placeholder="Descreva o problema relatado pelo cliente..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-black ml-1">Solução (Opcional)</label>
          <textarea
            rows={4}
            value={formData.solucao}
            onChange={(e) => setFormData({ ...formData, solucao: e.target.value })}
            className="w-full bg-[#09090b] border border-white/5 text-white px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/5 focus:bg-[#18181b] focus:border-white/10 transition-all placeholder:text-[#52525b] text-sm resize-none"
            placeholder="Caso já exista, registre a solução aplicada..."
          />
        </div>

        <div className="md:col-span-2 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-4 rounded-2xl font-bold text-sm hover:bg-[#e4e4e7] transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-white/5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                <ClipboardCheck className="w-4 h-4" />
                Registrar Solicitação
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
