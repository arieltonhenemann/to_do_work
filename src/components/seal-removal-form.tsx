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
    <div className="bg-[#18181b] p-8 rounded-[32px] border border-white/5 animate-in fade-in slide-in-from-top-4 duration-500 shadow-xl shadow-black/20">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-extrabold flex items-center gap-3 text-white">
          <div className="p-2 bg-white rounded-lg">
            <Trash2 className="w-5 h-5 text-black" />
          </div>
          Retirada de Lacres
        </h2>
        
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-[#52525b] font-black uppercase tracking-widest">
          <Info className="w-3 h-3 text-red-500" />
          Múltiplos Lacres Suportados
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Dados Básicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-black ml-1">Técnico Responsável</label>
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
            <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-black ml-1">Célula / CTO</label>
            <input
              type="text"
              required
              value={formData.cto}
              onChange={(e) => setFormData({ ...formData, cto: e.target.value })}
              className="w-full bg-[#09090b] border border-white/5 text-white px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/5 focus:bg-[#18181b] focus:border-white/10 transition-all placeholder:text-[#52525b] text-sm"
              placeholder="Identificação da CTO"
            />
          </div>
        </div>

        {/* Linhas Dinâmicas de Lacres */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] uppercase tracking-widest text-[#52525b] font-black italic">Detalhamento dos Lacres no Lote</p>
            <button 
              type="button"
              onClick={addLacreRow}
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-white hover:bg-white/5 px-4 py-2 rounded-xl border border-white/10 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-red-500" /> ADICIONAR LACRE
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {lacres.map((row) => (
              <div 
                key={row.id} 
                className={`flex flex-col md:flex-row gap-4 p-5 rounded-[24px] border transition-all duration-500 shadow-lg ${
                  row.status === 'ativo' 
                    ? 'bg-emerald-500/[0.03] border-emerald-500/20 shadow-emerald-500/5' 
                    : 'bg-red-500/[0.03] border-red-500/20 shadow-red-500/5'
                }`}
              >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="flex flex-col gap-1.5 sm:col-span-3">
                    <label className="text-[9px] uppercase font-black text-[#52525b] ml-1">Lacre #</label>
                    <input
                      type="text"
                      required
                      value={row.lacre}
                      onChange={(e) => updateLacreRow(row.id, 'lacre', e.target.value)}
                      className="bg-[#09090b]/50 border border-white/5 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-all"
                      placeholder="Nº Lacre"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-5">
                    <label className="text-[9px] uppercase font-black text-[#52525b] ml-1">Cliente Vinculado</label>
                    <input
                      type="text"
                      required
                      value={row.cliente}
                      onChange={(e) => updateLacreRow(row.id, 'cliente', e.target.value)}
                      className="bg-[#09090b]/50 border border-white/5 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-all"
                      placeholder="Nome do cliente"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-4">
                    <label className="text-[9px] uppercase font-black text-[#52525b] ml-1">Status Final</label>
                    <div className="flex gap-1 h-full">
                      <button
                        type="button"
                        onClick={() => updateLacreRow(row.id, 'status', 'ativo')}
                        className={`flex-1 text-[9px] font-black rounded-xl transition-all border ${
                          row.status === 'ativo' 
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20' 
                            : 'bg-white/5 text-[#52525b] border-transparent hover:border-white/5'
                        }`}
                      >
                        ATIVO
                      </button>
                      <button
                        type="button"
                        onClick={() => updateLacreRow(row.id, 'status', 'desativado')}
                        className={`flex-1 text-[9px] font-black rounded-xl transition-all border ${
                          row.status === 'desativado' 
                            ? 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/20' 
                            : 'bg-white/5 text-[#52525b] border-transparent hover:border-white/5'
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
                    className="self-end md:self-center p-3 text-[#52525b] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
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
          className="w-full bg-white text-black py-4 rounded-2xl font-bold text-sm hover:bg-[#e4e4e7] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 mt-2 shadow-xl shadow-white/5"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : (
            <>
              <Trash2 className="w-5 h-5" />
              FINALIZAR LOTE DE RETIRADA
            </>
          )}
        </button>
      </form>
    </div>
  )
}
