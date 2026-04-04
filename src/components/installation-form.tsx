'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Loader2 } from 'lucide-react'

export default function InstallationForm({ onTaskAdded }: { onTaskAdded: () => void }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tecnico: '',
    cto: '',
    cliente: '',
    lacre: '',
    portas_livres: '',
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
        type: 'instalacao',
        mk_solutions: 'pendente',
        geosite: 'pendente',
        mapeamento: 'pendente',
        sincronizacao: 'pendente',
        planilha: 'pendente',
        status: 'pendente'
      }
    ])

    if (error) {
      console.error('Erro ao salvar:', error.message)
    } else {
      setFormData({
        tecnico: '',
        cto: '',
        cliente: '',
        lacre: '',
        portas_livres: '',
        equipamento: ''
      })
      onTaskAdded()
    }
    setLoading(false)
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Plus className="w-5 h-5 text-white" />
        Nova Instalação
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold ml-1">CTO</label>
          <input
            type="text"
            value={formData.cto}
            onChange={(e) => setFormData({ ...formData, cto: e.target.value })}
            className="todo-input px-4 py-2.5 rounded-xl text-sm"
            placeholder="Identificação CTO"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold ml-1">Lacre</label>
          <input
            type="text"
            value={formData.lacre}
            onChange={(e) => setFormData({ ...formData, lacre: e.target.value })}
            className="todo-input px-4 py-2.5 rounded-xl text-sm"
            placeholder="Número do lacre"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold ml-1">Portas Livres</label>
          <input
            type="text"
            value={formData.portas_livres}
            onChange={(e) => setFormData({ ...formData, portas_livres: e.target.value })}
            className="todo-input px-4 py-2.5 rounded-xl text-sm"
            placeholder="Qtd portas"
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

        <div className="md:col-span-2 lg:col-span-3 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3 rounded-xl font-bold text-sm hover:bg-[#e4e4e7] transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cadastrar Instalação'}
          </button>
        </div>
      </form>
    </div>
  )
}
