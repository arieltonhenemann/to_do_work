'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Wrench, Loader2 } from 'lucide-react'

export default function MaintenanceForm({ onTaskAdded }: { onTaskAdded: () => void }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tecnico: '',
    cliente: '',
    tipo_manutencao: '',
    equipamento: ''
  })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.cliente || !formData.tecnico) return

    setLoading(true)
    const { error } = await supabase.from('tasks').insert([
      {
        ...formData,
        type: 'manutencao',
        mk_solutions: 'pendente',
        planilha: 'pendente',
        status: 'pendente'
      }
    ])

    if (error) {
      console.error('Erro ao salvar:', error.message)
    } else {
      setFormData({
        tecnico: '',
        cliente: '',
        tipo_manutencao: '',
        equipamento: ''
      })
      onTaskAdded()
    }
    setLoading(false)
  }

  return (
    <div className="bg-[#18181b] p-8 rounded-[32px] border border-white/5 animate-in fade-in slide-in-from-top-4 duration-500 shadow-xl shadow-black/20">
      <h2 className="text-xl font-extrabold mb-8 flex items-center gap-3 text-white">
        <div className="p-2 bg-white rounded-lg">
          <Wrench className="w-5 h-5 text-black" />
        </div>
        Nova Manutenção
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-black ml-1">Técnico</label>
          <input
            type="text"
            required
            value={formData.tecnico}
            onChange={(e) => setFormData({ ...formData, tecnico: e.target.value })}
            className="w-full bg-[#09090b] border border-white/5 text-white px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/5 focus:bg-[#18181b] focus:border-white/10 transition-all placeholder:text-[#52525b] text-sm"
            placeholder="Nome do técnico"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-black ml-1">Cliente</label>
          <input
            type="text"
            required
            value={formData.cliente}
            onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
            className="w-full bg-[#09090b] border border-white/5 text-white px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/5 focus:bg-[#18181b] focus:border-white/10 transition-all placeholder:text-[#52525b] text-sm"
            placeholder="Nome do cliente"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-black ml-1">Tipo de Manutenção</label>
          <input
            type="text"
            value={formData.tipo_manutencao}
            onChange={(e) => setFormData({ ...formData, tipo_manutencao: e.target.value })}
            className="w-full bg-[#09090b] border border-white/5 text-white px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/5 focus:bg-[#18181b] focus:border-white/10 transition-all placeholder:text-[#52525b] text-sm"
            placeholder="Ex: Preventiva, Corretiva"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-black ml-1">Equipamento</label>
          <input
            type="text"
            value={formData.equipamento}
            onChange={(e) => setFormData({ ...formData, equipamento: e.target.value })}
            className="w-full bg-[#09090b] border border-white/5 text-white px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/5 focus:bg-[#18181b] focus:border-white/10 transition-all placeholder:text-[#52525b] text-sm"
            placeholder="Modelo/Série"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-4 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-4 rounded-2xl font-bold text-sm hover:bg-[#e4e4e7] transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-white/5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                <Wrench className="w-4 h-4" />
                Cadastrar Manutenção
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
