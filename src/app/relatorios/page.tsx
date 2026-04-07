'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  FileSpreadsheet, 
  Calendar, 
  Download, 
  Loader2, 
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import * as XLSX from 'xlsx'

type Task = any // Usando any para facilitar o mapeamento de tipos dinâmicos no Excel

const TASK_TYPES = [
  { id: 'instalacao', label: 'Instalação' },
  { id: 'manutencao', label: 'Manutenção' },
  { id: 'solicitacao', label: 'Solicitações' },
  { id: 'retirada_lacre', label: 'Retirada de Lacre' },
  { id: 'demais_solicitacoes', label: 'Demais Solicitações' }
]

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState('todos')
  const [selectedTypes, setSelectedTypes] = useState<string[]>(TASK_TYPES.map(t => t.id))
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const supabase = createClient()

  const fetchTasksForReport = async () => {
    setLoading(true)
    setHasSearched(true)
    
    let query = supabase
      .from('tasks')
      .select('*')
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`)
      .in('type', selectedTypes)
    
    if (statusFilter !== 'todos') {
      query = query.eq('status', statusFilter)
    }

    const { data, error } = await query.order('created_at', { ascending: true })

    if (error) {
      console.error('Erro ao buscar relatórios:', error.message)
    } else {
      setTasks(data || [])
    }
    setLoading(false)
  }

  const exportToExcel = () => {
    if (tasks.length === 0) return

    // Mapear os dados para um formato amigável ao Excel
    const formattedData = tasks.map(t => {
      const baseData = {
        'ID': t.id,
        'Data Criação': new Date(t.created_at).toLocaleString('pt-BR'),
        'Tipo': t.type.toUpperCase(),
        'Status Geral': t.status.toUpperCase(),
        'Técnico': t.tecnico || t.solicitante || 'N/A',
        'Cliente/Solicitante': t.cliente || t.solicitante || 'N/A',
        'CTO': t.cto || 'N/A',
        'Lacre/Equipamento': t.lacre || t.equipamento || 'N/A',
        'Checklist': `Mk: ${t.mk_solutions}, Geosite: ${t.geosite}, Planilha: ${t.planilha}`
      }

      // Tratamento especial para Retirada de Lacre (JSONB)
      if (t.type === 'retirada_lacre' && t.lacres_data) {
        const details = t.lacres_data.map((l: any) => 
          `[Lacre: ${l.lacre}, Cliente: ${l.cliente}, Status: ${l.status}]`
        ).join(' | ')
        return { ...baseData, 'Detalhes Lacres': details }
      }

      return baseData
    })

    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório Geral')

    // Gerar o arquivo e baixar
    XLSX.writeFile(workbook, `Relatorio_Tecnico_${startDate}_a_${endDate}.xlsx`)
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col gap-2 border-b border-white/5 pb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/20">
            <FileSpreadsheet className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Relatórios</h1>
        </div>
        <p className="text-[#a1a1aa] text-sm max-w-2xl ml-1 font-medium">
          Gere planilhas detalhadas para controle técnico e auditoria. Filtre as ordens de serviço por tipo de tarefa, período e status.
        </p>
      </div>

      {/* Filtros */}
      <div className="glass-card p-8 rounded-[40px] border border-white/5 flex flex-col md:flex-row items-end gap-6 shadow-2xl">
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-[10px] uppercase font-black text-[#52525b] ml-1 tracking-widest flex items-center gap-2">
            <Calendar className="w-3 h-3" /> Data Inicial
          </label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="todo-input px-5 py-3.5 rounded-2xl text-sm transition-all focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <label className="text-[10px] uppercase font-black text-[#52525b] ml-1 tracking-widest flex items-center gap-2">
            <Calendar className="w-3 h-3" /> Data Final
          </label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="todo-input px-5 py-3.5 rounded-2xl text-sm transition-all focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <label className="text-[10px] uppercase font-black text-[#52525b] ml-1 tracking-widest flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3" /> Status
          </label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="todo-input px-5 py-3.5 rounded-2xl text-sm transition-all focus:ring-4 focus:ring-emerald-500/10 bg-black/20"
          >
            <option value="todos">TUDO (PEND. & FIN.)</option>
            <option value="pendente">SOMENTE PENDENTES</option>
            <option value="finalizado">SOMENTE FINALIZADOS</option>
          </select>
        </div>

        <button 
          onClick={fetchTasksForReport}
          disabled={loading || selectedTypes.length === 0}
          className="bg-white text-black h-[52px] px-8 rounded-2xl font-black text-xs hover:bg-[#e4e4e7] transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          GERAR RELATÓRIO
        </button>
      </div>

      {/* Seleção de Tipos */}
      <div className="flex flex-col gap-4 -mt-2">
         <div className="flex items-center justify-between px-2">
            <label className="text-[10px] uppercase font-black text-[#52525b] tracking-widest flex items-center gap-2">
              SELECIONE AS CATEGORIAS
            </label>
            <div className="flex gap-4">
              <button 
                onClick={() => setSelectedTypes(TASK_TYPES.map(t => t.id))}
                className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest"
              >
                Selecionar Tudo
              </button>
              <button 
                onClick={() => setSelectedTypes([])}
                className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest"
              >
                Limpar Tudo
              </button>
            </div>
         </div>
         <div className="flex flex-wrap gap-2.5">
            {TASK_TYPES.map((type) => {
              const isSelected = selectedTypes.includes(type.id)
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedTypes(prev => 
                      isSelected ? prev.filter(t => t !== type.id) : [...prev, type.id]
                    )
                  }}
                  className={`px-6 py-3 rounded-2xl text-xs font-black transition-all border ${
                    isSelected 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/5' 
                      : 'bg-white/5 border-white/5 text-[#52525b] hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  {type.label.toUpperCase()}
                </button>
              )
            })}
         </div>
         {selectedTypes.length === 0 && (
           <p className="text-[10px] text-red-500 font-bold animate-pulse ml-2">Selecione pelo menos um tipo para buscar.</p>
         )}
      </div>

      {/* Resultados e Botão Exportar */}
      {hasSearched && (
        <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-6 duration-700">
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                 <CheckCircle2 className={`w-5 h-5 ${tasks.length > 0 ? 'text-emerald-500' : 'text-[#52525b]'}`} />
                 <span className="text-sm font-bold text-white">
                   {tasks.length > 0 ? `${tasks.length} registros encontrados neste período` : 'Nenhum dado encontrado para estas datas'}
                 </span>
              </div>
              
              {tasks.length > 0 && (
                <button 
                  onClick={exportToExcel}
                  className="flex items-center gap-3 bg-emerald-500 text-white font-black px-8 py-4 rounded-[28px] text-xs hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                >
                   <Download className="w-4 h-4" />
                   EXPORTAR PARA EXCEL (.XLSX)
                </button>
              )}
           </div>

           {tasks.length === 0 ? (
             <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[48px] flex flex-col items-center gap-4 bg-white/[0.01]">
                <AlertCircle className="w-12 h-12 text-[#52525b]" />
                <p className="text-sm text-[#52525b] font-black uppercase tracking-widest leading-relaxed">
                  Tente alterar as datas acima <br/> para visualizar o histórico de campo.
                </p>
             </div>
           ) : (
             <div className="bg-white/5 p-6 rounded-[40px] border border-white/5 overflow-hidden">
                <table className="w-full text-left">
                   <thead>
                      <tr className="text-[10px] uppercase font-black text-[#52525b] tracking-widest border-b border-white/5">
                         <th className="pb-4 px-2">Data</th>
                         <th className="pb-4 px-2">Tipo</th>
                         <th className="pb-4 px-2">Técnico</th>
                         <th className="pb-4 px-2">Cliente</th>
                         <th className="pb-4 px-2">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                     {tasks.slice(0, 10).map((t) => (
                         <tr key={t.id} className="text-sm text-[#a1a1aa] font-medium hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 px-2 text-xs">{new Date(t.created_at).toLocaleDateString('pt-BR')}</td>
                            <td className="py-4 px-2 lowercase italic opacity-60 text-xs">
                              {TASK_TYPES.find(type => type.id === t.type)?.label || t.type}
                            </td>
                            <td className="py-4 px-2">{t.tecnico || t.solicitante || 'N/A'}</td>
                            <td className="py-4 px-2 text-white font-bold">{t.cliente || t.solicitante || 'N/A'}</td>
                            <td className="py-4 px-2">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${t.status === 'finalizado' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                 {t.status.toUpperCase()}
                              </span>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
                {tasks.length > 10 && (
                  <p className="text-[10px] text-[#52525b] font-black uppercase mt-6 text-center italic">
                    Exibindo apenas os primeiros 10 registros... O Excel conterá todos os {tasks.length} itens.
                  </p>
                )}
             </div>
           )}
        </div>
      )}
    </div>
  )
}
