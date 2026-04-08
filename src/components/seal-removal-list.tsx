'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  CheckCircle2, 
  Circle, 
  User, 
  Trash2,
  Clock,
  MapPin,
  Pencil,
  AlertCircle,
  Loader2,
  Plus,
  Hexagon,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Clipboard,
  Check
} from 'lucide-react'
import Modal from './modal'

type LacreEntry = {
  id: string
  lacre: string
  cliente: string
  status: 'ativo' | 'desativado'
}

type Task = {
  id: string
  created_at: string
  type: string
  tecnico: string
  cto: string
  lacres_data: LacreEntry[]
  mk_solutions: 'pendente' | 'finalizado'
  mapeamento: 'pendente' | 'finalizado'
  geosite: 'pendente' | 'finalizado'
  planilha: 'pendente' | 'finalizado'
  status: 'pendente' | 'finalizado'
}

export default function SealRemovalList({ tasks, onUpdate }: { tasks: Task[], onUpdate: () => void }) {
  const supabase = createClient()
  
  const [statusFilter, setStatusFilter] = useState<'pendente' | 'finalizado'>('pendente')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [quickInfoTask, setQuickInfoTask] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleChecklist = async (task: Task, field: string) => {
    const currentValue = task[field as keyof Task]
    const newValue = currentValue === 'pendente' ? 'finalizado' : 'pendente'
    
    const checklistFields = ['mk_solutions', 'mapeamento', 'geosite', 'planilha']
    const updatedValues = { ...task, [field]: newValue }
    const allFinished = checklistFields.every(f => updatedValues[f as keyof Task] === 'finalizado')
    const newOverallStatus = allFinished ? 'finalizado' : 'pendente'

    const { error } = await supabase
      .from('tasks')
      .update({ [field]: newValue, status: newOverallStatus })
      .eq('id', task.id)

    if (error) {
      console.error('Erro ao atualizar:', error.message)
    } else {
      onUpdate()
    }
  }

  const finishAllItems = async (task: Task) => {
    const checklistFields = {
      mk_solutions: 'finalizado',
      mapeamento: 'finalizado',
      geosite: 'finalizado',
      planilha: 'finalizado',
      status: 'finalizado'
    }

    const { error } = await supabase
      .from('tasks')
      .update(checklistFields)
      .eq('id', task.id)

    if (error) {
      console.error('Erro ao finalizar todos:', error.message)
    } else {
      onUpdate()
    }
  }

  const confirmDeleteTask = async () => {
    if (!deletingId) return
    setLoading(true)
    const { error } = await supabase.from('tasks').delete().eq('id', deletingId)
    if (error) {
      console.error('Erro ao excluir tarefa:', error.message)
    } else {
      onUpdate()
      setDeletingId(null)
    }
    setLoading(false)
  }

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask) return
    
    setLoading(true)
    const { error } = await supabase
      .from('tasks')
      .update({
        tecnico: editingTask.tecnico,
        cto: editingTask.cto,
        lacres_data: editingTask.lacres_data
      })
      .eq('id', editingTask.id)

    if (error) {
      console.error('Erro ao editar:', error.message)
    } else {
      onUpdate()
      setEditingTask(null)
    }
    setLoading(false)
  }

  const updateSingleLacre = async (task: Task, lacreId: string, action: 'delete' | 'toggleStatus') => {
    let newLacresData = [...task.lacres_data]
    
    if (action === 'delete') {
      if (newLacresData.length <= 1) return alert('Pelo menos um lacre deve permanecer.')
      newLacresData = newLacresData.filter(l => l.id !== lacreId)
    } else if (action === 'toggleStatus') {
      newLacresData = newLacresData.map(l => 
        l.id === lacreId ? { ...l, status: l.status === 'ativo' ? 'desativado' : 'ativo' } : l
      )
    }

    const { error } = await supabase
      .from('tasks')
      .update({ lacres_data: newLacresData })
      .eq('id', task.id)

    if (error) console.error('Erro ao atualizar lacre:', error.message)
    else onUpdate()
  }

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = !searchTerm || 
      t.tecnico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.cto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.lacres_data.some(l => l.lacre.toLowerCase().includes(searchTerm.toLowerCase()) || l.cliente.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesSearch && t.status === statusFilter
  })

  const renderTaskCard = (task: Task) => {
    return (
      <div 
        key={task.id} 
        className="group relative bg-[#18181b] rounded-3xl border border-white/5 p-6 transition-all hover:shadow-2xl hover:shadow-black/40 hover:border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Lado Esquerdo: Info e Conteúdo */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Header do Card */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform">
                  <Trash2 className="w-6 h-6 text-[#a1a1aa]" />
                </div>
                <div className="flex flex-col">
                   <h3 className="text-lg font-bold text-white group-hover:text-white transition-colors">
                     {task.tecnico || 'Sem Técnico'}
                   </h3>
                   <div className="flex items-center gap-2 mt-1">
                     <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider rounded-md border border-red-500/20">
                       LOTE: {task.cto}
                     </span>
                     <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                       task.status === 'pendente' 
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                     }`}>
                       {task.status === 'pendente' ? 'Pendente' : 'Arquivado'}
                     </span>
                     <span className="px-2 py-0.5 bg-white/5 text-[#52525b] text-[10px] font-bold uppercase tracking-wider rounded-md border border-white/5">
                        {task.lacres_data.length} LACRES
                     </span>
                   </div>
                </div>
              </div>
            </div>

            {/* Listagem de Lacres Interna (Mini) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
               {task.lacres_data.map((lacre) => (
                 <div key={lacre.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                   lacre.status === 'ativo' 
                    ? 'bg-emerald-500/5 border-emerald-500/10' 
                    : 'bg-red-500/5 border-red-500/10'
                 }`}>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-white truncate max-w-[200px]">
                        Cliente: {lacre.cliente} - Lacre: {lacre.lacre}
                      </span>
                    </div>
                   <button 
                     onClick={(e) => { e.stopPropagation(); updateSingleLacre(task, lacre.id, 'toggleStatus'); }}
                     className={`text-[8px] font-black px-2 py-1 rounded-md border transition-all ${
                        lacre.status === 'ativo' 
                          ? 'bg-emerald-500 text-white border-emerald-400' 
                          : 'bg-red-500 text-white border-red-400'
                     }`}
                   >
                     {lacre.status === 'ativo' ? 'ATIVO' : 'OFF'}
                   </button>
                 </div>
               ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-4 text-[10px] font-bold text-[#52525b] uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {new Date(task.created_at).toLocaleDateString('pt-BR')} às {new Date(task.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center gap-1.5">
                  <Hexagon className="w-3 h-3" />
                  ID: {task.id.slice(0, 8)}
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setQuickInfoTask(task); }}
                className="flex items-center gap-1.5 text-[9px] font-black text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 transition-all"
              >
                <Clipboard className="w-3.5 h-3.5 text-red-500" /> COPIAR LOTE
              </button>
            </div>
          </div>

          {/* Divisor Vertical */}
          <div className="hidden lg:block w-px bg-white/5" />

          {/* Lado Direito: Checklist */}
          <div className="lg:w-64 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-black text-[#52525b] tracking-tighter mb-1">PROTOCOLO DE DESATIVAÇÃO</span>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {[
                { id: 'mk_solutions', label: 'Mk Sol.' },
                { id: 'mapeamento', label: 'Mapeam.' },
                { id: 'geosite', label: 'Geosite' },
                { id: 'planilha', label: 'Planilha' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={(e) => { e.stopPropagation(); toggleChecklist(task, item.id); }}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all text-[11px] group/item ${
                    task[item.id as keyof Task] === 'finalizado'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-[#18181b] border-white/5 text-[#52525b] hover:border-white/10 hover:text-[#a1a1aa]'
                  }`}
                >
                  <span className="font-bold uppercase">{item.label}</span>
                  {task[item.id as keyof Task] === 'finalizado' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-white/10 group-hover/item:border-white/20" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Ações */}
          <div className="flex lg:flex-col items-center gap-2 lg:justify-start">
            <button 
              onClick={(e) => { e.stopPropagation(); setEditingTask(task); }}
              className="flex-1 lg:flex-none p-3 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white rounded-2xl border border-cyan-500/20 transition-all flex items-center justify-center gap-2 text-xs font-bold"
              title="Editar"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setDeletingId(task.id); }}
              className="flex-1 lg:flex-none p-3 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-2xl border border-rose-500/20 transition-all flex items-center justify-center gap-2 text-xs font-bold"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full mt-2">
      {/* Search and Filter Header */}
      <div className="flex flex-col md:flex-row gap-4 items-end bg-[#18181b] p-6 rounded-3xl border border-white/5 shadow-xl">
        <div className="flex-1 flex flex-col gap-2 w-full">
          <label className="text-xs font-bold text-[#52525b] ml-1 uppercase tracking-widest">Buscar Retiradas:</label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b] group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="Pesquisar por técnico, CTO, cliente ou lotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#09090b] border border-white/5 text-white pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/5 focus:bg-[#18181b] focus:border-white/10 transition-all placeholder:text-[#52525b] text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
          <label className="text-xs font-bold text-[#52525b] ml-1 uppercase tracking-widest">Filtro de Lotes:</label>
          <div className="flex p-1 bg-[#09090b] rounded-2xl border border-white/5">
            <button
              onClick={() => setStatusFilter('pendente')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                statusFilter === 'pendente' 
                  ? 'bg-[#18181b] text-white shadow-xl border border-white/5' 
                  : 'text-[#52525b] hover:text-[#a1a1aa]'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setStatusFilter('finalizado')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                statusFilter === 'finalizado' 
                  ? 'bg-[#18181b] text-white shadow-xl border border-white/5' 
                  : 'text-[#52525b] hover:text-[#a1a1aa]'
              }`}
            >
              Arquivadas
            </button>
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="flex flex-col gap-4 min-h-[400px]">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#18181b]/50 rounded-3xl border border-white/5 border-dashed gap-4">
            <div className="p-4 bg-white/5 rounded-full">
               <AlertCircle className="w-8 h-8 text-[#52525b]" />
            </div>
            <div className="text-center">
              <p className="text-white font-bold">Nenhum lote encontrado</p>
              <p className="text-[#52525b] text-sm">Tente ajustar seus termos de busca ou filtros.</p>
            </div>
          </div>
        ) : (
          filteredTasks.map(renderTaskCard)
        )}
      </div>

      <Modal isOpen={!!deletingId} onClose={() => setDeletingId(null)} title="Excluir Lote">
        <div className="flex flex-col gap-6">
          <p className="text-[#a1a1aa]">Tem certeza que deseja excluir este lote de retirada? Esta ação apagará todos os lacres vinculados.</p>
          <div className="flex gap-4">
            <button onClick={() => setDeletingId(null)} className="flex-1 py-3 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all">Cancelar</button>
            <button onClick={confirmDeleteTask} className="flex-1 py-3 rounded-2xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20">Excluir Lote</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!editingTask} onClose={() => setEditingTask(null)} title="Editar Lote">
        <form onSubmit={handleEditSave} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#52525b] ml-1 uppercase">Técnico</label>
              <input type="text" value={editingTask?.tecnico || ''} onChange={(e) => setEditingTask({...editingTask!, tecnico: e.target.value})} className="bg-[#09090b] border border-white/5 text-white px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/5" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#52525b] ml-1 uppercase">CTO</label>
              <input type="text" value={editingTask?.cto || ''} onChange={(e) => setEditingTask({...editingTask!, cto: e.target.value})} className="bg-[#09090b] border border-white/5 text-white px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/5" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
             <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#52525b] uppercase">Lista de Lacres</p>
                <button type="button" onClick={() => setEditingTask({...editingTask!, lacres_data: [...editingTask!.lacres_data, { id: crypto.randomUUID(), lacre: '', cliente: '', status: 'ativo' }]})} className="text-[10px] font-black bg-white group hover:bg-red-500 hover:text-white text-black px-3 py-1 rounded-lg transition-all">
                  + ADICIONAR
                </button>
             </div>
             <div className="max-h-[240px] overflow-y-auto pr-2 flex flex-col gap-2">
                {editingTask?.lacres_data.map((l, i) => (
                  <div key={l.id} className="grid grid-cols-12 gap-2 bg-[#09090b] p-3 rounded-2xl border border-white/5">
                    <input className="col-span-5 bg-white/5 rounded-lg px-2 py-1.5 text-xs text-white border border-transparent focus:border-white/10 outline-none" placeholder="Lacre" value={l.lacre} onChange={(e) => {
                      const newData = [...editingTask.lacres_data]; newData[i].lacre = e.target.value; setEditingTask({...editingTask, lacres_data: newData});
                    }} />
                    <input className="col-span-6 bg-white/5 rounded-lg px-2 py-1.5 text-xs text-white border border-transparent focus:border-white/10 outline-none" placeholder="Cliente" value={l.cliente} onChange={(e) => {
                      const newData = [...editingTask.lacres_data]; newData[i].cliente = e.target.value; setEditingTask({...editingTask, lacres_data: newData});
                    }} />
                    <button type="button" onClick={() => {
                      const newData = editingTask.lacres_data.filter((_, idx) => idx !== i); setEditingTask({...editingTask, lacres_data: newData});
                    }} className="col-span-1 text-red-500 hover:scale-110 flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
             </div>
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={() => setEditingTask(null)} className="flex-1 py-3 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all">Cancelar</button>
            <button type="submit" className="flex-1 py-3 rounded-2xl bg-white text-black font-bold hover:bg-[#e4e4e7] transition-all shadow-lg">Salvar Lote</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!quickInfoTask} onClose={() => setQuickInfoTask(null)} title="Copiar Lote">
        <div className="flex flex-col gap-6">
          <div className="bg-[#09090b] p-6 rounded-3xl border border-white/5 max-h-[300px] overflow-y-auto">
             <div className="flex flex-col gap-1 font-mono text-xs text-[#a1a1aa]">
                {quickInfoTask?.lacres_data.map((l, idx) => (
                  <div key={l.id}>{idx + 1}. Cliente: {l.cliente} - Lacre: {l.lacre}</div>
                ))}
             </div>
          </div>
          <button
            onClick={() => {
              const text = quickInfoTask?.lacres_data.map(l => `Cliente: ${l.cliente} - Lacre: ${l.lacre}`).join('\n') || ''
              copyToClipboard(text)
            }}
            className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
              copied ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-[#e4e4e7]'
            }`}
          >
            {copied ? <CheckCircle2 className="w-5 h-5" /> : <Clipboard className="w-5 h-5" />}
            {copied ? 'COPIADO COM SUCESSO!' : 'COPIAR LISTA PARA CLIPBOARD'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
