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
    <div className="glass-card p-6 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Wrench className="w-5 h-5 text-amber-500" />
        Nova Manutenção
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold ml-1">Técnico</label>
          <input
            type="text"
            required
            value={formData.tecnico}
            onChange={(e) => setFormData({ ...formData, tecnico: e.target.value })}
            className="todo-input px-4 py-2.5 rounded-xl text-sm"
            placeholder="Nome do técnico"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold ml-1">Cliente</label>
          <input
            type="text"
            required
            value={formData.cliente}
            onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
            className="todo-input px-4 py-2.5 rounded-xl text-sm"
            placeholder="Nome do cliente"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold ml-1">Tipo de Manutenção</label>
          <input
            type="text"
            value={formData.tipo_manutencao}
            onChange={(e) => setFormData({ ...formData, tipo_manutencao: e.target.value })}
            className="todo-input px-4 py-2.5 rounded-xl text-sm"
            placeholder="Ex: Preventiva, Corretiva, etc."
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold ml-1">Equipamento</label>
          <input
            type="text"
            value={formData.equipamento}
            onChange={(e) => setFormData({ ...formData, equipamento: e.target.value })}
            className="todo-input px-4 py-2.5 rounded-xl text-sm"
            placeholder="Modelo/Série"
          />
        </div>

        <div className="md:col-span-2 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 text-black py-3 rounded-xl font-bold text-sm hover:bg-amber-400 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cadastrar Manutenção'}
          </button>
        </div>
      </form>
    </div>
  )
}
