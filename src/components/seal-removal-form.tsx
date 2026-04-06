'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Trash2, Plus, Loader2, Info } from 'lucide-react'

export default function SealRemovalForm({ onTaskAdded }: { onTaskAdded: () => void }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tecnico: '',
    cto: ''
  })
  
  // Lista dinâmica de lacres
  const [lacres, setLacres] = useState([
    { id: crypto.randomUUID(), lacre: '', cliente: '', status: 'ativo' }
  ])

  const supabase = createClient()

  const addLacreRow = () => {
    setLacres([...lacres, { id: crypto.randomUUID(), lacre: '', cliente: '', status: 'ativo' }])
  }

  const removeLacreRow = (id: string) => {
    if (lacres.length > 1) {
      setLacres(lacres.filter(row => row.id !== id))
    }
  }

  const updateLacreRow = (id: string, field: string, value: string) => {
    setLacres(lacres.map(row => row.id === id ? { ...row, [field]: value } : row))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.tecnico || !formData.cto) return

    setLoading(true)
    const { error } = await supabase.from('tasks').insert([
      {
        ...formData,
        type: 'retirada_lacre',
        lacres_data: lacres, // Salva o array JSONB
        mk_solutions: 'pendente',
        mapeamento: 'pendente',
        geosite: 'pendente',
        planilha: 'pendente',
        status: 'pendente'
      }
    ])

    if (error) {
      console.error('Erro ao salvar:', error.message)
    } else {
      setFormData({ tecnico: '', cto: '' })
      setLacres([{ id: crypto.randomUUID(), lacre: '', cliente: '', status: 'ativo' }])
      onTaskAdded()
    }
    setLoading(false)
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
          <Trash2 className="w-5 h-5 text-red-400" />
          Retirada de Lacres
        </h2>
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-[#52525b] font-bold uppercase tracking-widest">
          <Info className="w-3 h-3" />
          Múltiplos Lacres Suportados
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Dados Básicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold ml-1">CTO</label>
            <input
              type="text"
              required
              value={formData.cto}
              onChange={(e) => setFormData({ ...formData, cto: e.target.value })}
              className="todo-input px-4 py-2.5 rounded-xl text-sm"
              placeholder="Identificação CTO"
            />
          </div>
        </div>

        {/* Linhas Dinâmicas de Lacres */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] uppercase tracking-widest text-[#52525b] font-black">Detalhamento dos Lacres</p>
            <button 
              type="button"
              onClick={addLacreRow}
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-white hover:text-white/70 transition-all bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"
            >
              <Plus className="w-3 h-3" /> Adicionar Lacre
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {lacres.map((row, index) => (
              <div 
                key={row.id} 
                className={`flex flex-col md:flex-row gap-3 p-4 rounded-2xl border transition-all duration-500 ${
                  row.status === 'ativo' 
                    ? 'bg-emerald-500/5 border-emerald-500/20' 
                    : 'bg-red-500/5 border-red-500/20'
                }`}
              >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-[#52525b]">Lacre #</label>
                    <input
                      type="text"
                      required
                      value={row.lacre}
                      onChange={(e) => updateLacreRow(row.id, 'lacre', e.target.value)}
                      className="bg-black/20 border border-white/5 px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:border-white/20"
                      placeholder="Número"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1 sm:col-span-1">
                    <label className="text-[9px] uppercase font-bold text-[#52525b]">Cliente</label>
                    <input
                      type="text"
                      required
                      value={row.cliente}
                      onChange={(e) => updateLacreRow(row.id, 'cliente', e.target.value)}
                      className="bg-black/20 border border-white/5 px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:border-white/20"
                      placeholder="Nome cliente"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-[#52525b]">Status Poste</label>
                    <div className="flex gap-1 h-full">
                      <button
                        type="button"
                        onClick={() => updateLacreRow(row.id, 'status', 'ativo')}
                        className={`flex-1 text-[10px] font-black rounded-lg transition-all ${
                          row.status === 'ativo' 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-white/5 text-[#52525b] opacity-50 hover:opacity-100'
                        }`}
                      >
                        ATIVO
                      </button>
                      <button
                        type="button"
                        onClick={() => updateLacreRow(row.id, 'status', 'desativado')}
                        className={`flex-1 text-[10px] font-black rounded-lg transition-all ${
                          row.status === 'desativado' 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white/5 text-[#52525b] opacity-50 hover:opacity-100'
                        }`}
                      >
                        DESATIVADO
                      </button>
                    </div>
                  </div>
                </div>

                {lacres.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLacreRow(row.id)}
                    className="self-end md:self-center p-2 text-[#52525b] hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold text-sm hover:bg-red-400 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 mt-2 shadow-lg shadow-red-500/10"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Finalizar Lotes de Retirada'}
        </button>
      </form>
    </div>
  )
}
