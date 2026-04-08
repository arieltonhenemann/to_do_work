'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  CheckCircle2, 
  Circle, 
  User, 
  MapPin, 
  Package, 
  Lock, 
  Trash2,
  Clock,
  ArrowRight,
  Pencil,
  X,
  AlertCircle,
  Loader2,
  Clipboard,
  Check,
  Hexagon,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react'
import Modal from './modal'

type Task = {
  id: string
  created_at: string
  type: string
  tecnico: string
  cto: string
  cliente: string
  lacre: string
  portas_livres: string
  equipamento: string
  observacoes?: string
  mk_solutions: 'pendente' | 'finalizado'
  geosite: 'pendente' | 'finalizado'
  mapeamento: 'pendente' | 'finalizado'
  sincronizacao: 'pendente' | 'finalizado'
  planilha: 'pendente' | 'finalizado'
  status: 'pendente' | 'finalizado'
}

export default function InstallationList({ tasks, onUpdate }: { tasks: Task[], onUpdate: () => void }) {
  const supabase = createClient()
  
  // Estados para Modais
  const [statusFilter, setStatusFilter] = useState<'pendente' | 'finalizado'>('pendente')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [infoTask, setInfoTask] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggleChecklist = async (task: Task, field: string) => {
    const currentValue = task[field as keyof Task]
    const newValue = currentValue === 'pendente' ? 'finalizado' : 'pendente'
    
    // Calcular novo status geral
    const checklistFields = ['mk_solutions', 'geosite', 'mapeamento', 'sincronizacao', 'planilha']
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
      geosite: 'finalizado',
      mapeamento: 'finalizado',
      sincronizacao: 'finalizado',
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

  const confirmDelete = async () => {
    if (!deletingId) return
    setLoading(true)
    const { error } = await supabase.from('tasks').delete().eq('id', deletingId)
    if (error) {
      console.error('Erro ao excluir:', error.message)
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
        cliente: editingTask.cliente,
        cto: editingTask.cto,
        lacre: editingTask.lacre,
        portas_livres: editingTask.portas_livres,
        equipamento: editingTask.equipamento,
        observacoes: editingTask.observacoes
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = searchTerm === '' || (
      t.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tecnico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.cto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.lacre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.equipamento?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const matchesStatus = t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const renderTaskCard = (task: Task) => {
    return (
      <div 
        key={task.id} 
        className="group relative bg-[#18181b] rounded-3xl border border-white/5 p-6 transition-all hover:shadow-2xl hover:shadow-black/40 hover:border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Lado Esquerdo: Info Principal */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Header do Card */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6 text-[#a1a1aa]" />
                </div>
                <div className="flex flex-col">
                   <h3 className="text-lg font-bold text-white group-hover:text-white transition-colors">
                     {task.cliente || 'Sem Nome'}
                   </h3>
                   <div className="flex items-center gap-2 mt-1">
                     <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-blue-500/20">
                       INSTALAÇÃO
                     </span>
                     <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                       task.status === 'pendente' 
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                     }`}>
                       {task.status}
                     </span>
                   </div>
                </div>
              </div>
            </div>

            {/* Grid de Informações */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-[#52525b] tracking-widest">ID / Contrato</span>
                <span className="text-sm font-medium text-[#a1a1aa] truncate">{task.id.slice(0, 8)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-[#52525b] tracking-widest">Técnico</span>
                <span className="text-sm font-medium text-[#a1a1aa] truncate">{task.tecnico}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-[#52525b] tracking-widest">CTO / PON</span>
                <span className="text-sm font-medium text-[#a1a1aa] truncate">{task.cto || '-'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-[#52525b] tracking-widest">Lacre</span>
                <span className="text-sm font-medium text-[#a1a1aa] truncate">{task.lacre || '-'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-[#52525b] tracking-widest">Portas</span>
                <span className="text-sm font-medium text-[#a1a1aa] truncate">{task.portas_livres || '-'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-[#52525b] tracking-widest">Equipamento</span>
                <span className="text-sm font-medium text-[#a1a1aa] truncate">{task.equipamento || '-'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-[#52525b] tracking-widest">Data</span>
                <span className="text-sm font-medium text-[#a1a1aa] truncate">
                  {new Date(task.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Observações */}
            {task.observacoes && (
              <div className="flex flex-col gap-2 bg-white/5 p-4 rounded-2xl border border-white/5 mx-1 animate-in fade-in slide-in-from-top-1 duration-500">
                <div className="flex items-center gap-2 text-[#52525b]">
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#52525b]">Informações Extras</span>
                </div>
                <p className="text-xs text-[#a1a1aa] leading-relaxed italic line-clamp-2">
                  "{task.observacoes}"
                </p>
              </div>
            )}
          </div>

          {/* Divisor Vertical (Apenas Desktop) */}
          <div className="hidden lg:block w-px bg-white/5" />

          {/* Lado Direito: Checklist (Sempre Visível) */}
          <div className="lg:w-72 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-black text-[#52525b] tracking-tighter mb-1">PROTOCOLO DE ATIVAÇÃO</span>
            <div className="flex flex-col gap-2">
              {[
                { id: 'mk_solutions', label: 'Mk Solutions' },
                { id: 'geosite', label: 'Geosite' },
                { id: 'mapeamento', label: 'Mapeamento' },
                { id: 'sincronizacao', label: 'Sincronização' },
                { id: 'planilha', label: 'Planilha' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={(e) => { e.stopPropagation(); toggleChecklist(task, item.id); }}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs group/item ${
                    task[item.id as keyof Task] === 'finalizado'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-[#18181b] border-white/5 text-[#52525b] hover:border-white/10 hover:text-[#a1a1aa]'
                  }`}
                >
                  <span className="font-semibold">{item.label}</span>
                  {task[item.id as keyof Task] === 'finalizado' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-white/10 group-hover/item:border-white/20" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Ações (Flutuantes ou Canto Superior) */}
          <div className="flex lg:flex-col items-center gap-2 lg:justify-start">
            <button 
              onClick={(e) => { e.stopPropagation(); setEditingTask(task); }}
              className="flex-1 lg:flex-none p-3 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white rounded-2xl border border-cyan-500/20 transition-all flex items-center justify-center gap-2 text-xs font-bold"
              title="Editar"
            >
              <Pencil className="w-4 h-4" />
              <span className="lg:hidden">Editar</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setDeletingId(task.id); }}
              className="flex-1 lg:flex-none p-3 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-2xl border border-rose-500/20 transition-all flex items-center justify-center gap-2 text-xs font-bold"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
              <span className="lg:hidden">Excluir</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setInfoTask(task); }}
              className="flex-1 lg:flex-none p-3 bg-white/5 text-[#52525b] hover:bg-white hover:text-black rounded-2xl border border-white/5 transition-all flex items-center justify-center gap-2 text-xs font-bold"
              title="Copiar"
            >
              <Clipboard className="w-4 h-4" />
              <span className="lg:hidden">Copiar</span>
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
          <label className="text-xs font-bold text-[#52525b] ml-1 uppercase tracking-widest">Buscar:</label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b] group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="ID, Técnico, Cliente, Lacre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#09090b] border border-white/5 text-white pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/5 focus:bg-[#18181b] focus:border-white/10 transition-all placeholder:text-[#52525b] text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
          <label className="text-xs font-bold text-[#52525b] ml-1 uppercase tracking-widest">Status:</label>
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
              Finalizados
            </button>
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="flex flex-col gap-6 min-h-[400px]">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#18181b]/50 rounded-3xl border border-white/5 border-dashed gap-4">
            <div className="p-4 bg-white/5 rounded-full">
               <AlertCircle className="w-8 h-8 text-[#52525b]" />
            </div>
            <div className="text-center">
              <p className="text-white font-bold">Nenhuma ordem encontrada</p>
              <p className="text-[#52525b] text-sm">Tente ajustar seus termos de busca ou filtros.</p>
            </div>
          </div>
        ) : (
          filteredTasks.map(renderTaskCard)
        )}
      </div>

      {/* Pop-up de Confirmação de Exclusão */}
      <Modal 
        isOpen={!!deletingId} 
        onClose={() => setDeletingId(null)} 
        title="Confirmar Exclusão"
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <p className="text-sm text-red-200">Deseja realmente excluir a tarefa pendente?</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={confirmDelete}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sim, Excluir'}
            </button>
            <button
              onClick={() => setDeletingId(null)}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-2xl transition-all border border-white/5"
            >
              Não, Voltar
            </button>
          </div>
        </div>
      </Modal>

      {/* Pop-up de Edição */}
      <Modal 
        isOpen={!!editingTask} 
        onClose={() => setEditingTask(null)} 
        title="Editar Instalação"
      >
        <form onSubmit={handleEditSave} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Técnico</label>
              <input
                type="text"
                required
                value={editingTask?.tecnico || ''}
                onChange={(e) => setEditingTask({...editingTask!, tecnico: e.target.value})}
                className="todo-input px-3 py-2 rounded-xl text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Cliente</label>
              <input
                type="text"
                required
                value={editingTask?.cliente || ''}
                onChange={(e) => setEditingTask({...editingTask!, cliente: e.target.value})}
                className="todo-input px-3 py-2 rounded-xl text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold">CTO</label>
              <input
                type="text"
                value={editingTask?.cto || ''}
                onChange={(e) => setEditingTask({...editingTask!, cto: e.target.value})}
                className="todo-input px-3 py-2 rounded-xl text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Lacre</label>
              <input
                type="text"
                value={editingTask?.lacre || ''}
                onChange={(e) => setEditingTask({...editingTask!, lacre: e.target.value})}
                className="todo-input px-3 py-2 rounded-xl text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Portas</label>
              <input
                type="text"
                value={editingTask?.portas_livres || ''}
                onChange={(e) => setEditingTask({...editingTask!, portas_livres: e.target.value})}
                className="todo-input px-3 py-2 rounded-xl text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Equipamento</label>
              <input
                type="text"
                value={editingTask?.equipamento || ''}
                onChange={(e) => setEditingTask({...editingTask!, equipamento: e.target.value})}
                className="todo-input px-3 py-2 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Observações</label>
            <textarea
              rows={3}
              value={editingTask?.observacoes || ''}
              onChange={(e) => setEditingTask({...editingTask!, observacoes: e.target.value})}
              className="todo-input px-3 py-2 rounded-xl text-sm resize-none"
              placeholder="Descreva observações adicionais..."
            />
          </div>
          
          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-white hover:bg-[#e4e4e7] text-black font-bold py-3 rounded-2xl transition-all shadow-lg shadow-white/10 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : 'Salvar Alterações'}
            </button>
            <button
              type="button"
              onClick={() => setEditingTask(null)}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-2xl transition-all border border-white/5"
            >
              Não, Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Pop-up de Informações Rápidas */}
      <Modal 
        isOpen={!!infoTask} 
        onClose={() => setInfoTask(null)} 
        title="Informações da Instalação"
      >
        <div className="flex flex-col gap-6">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-4 text-center">
            <p className="text-xl font-mono text-white tracking-tight break-all leading-relaxed">
              LACRE: {infoTask?.lacre || 'N/A'} // PON: {infoTask?.cto || 'N/A'} // {infoTask?.equipamento || 'N/A'}
            </p>
          </div>
          
          <button
            onClick={() => copyToClipboard(`LACRE: ${infoTask?.lacre || ''} // PON: ${infoTask?.cto || ''} // ${infoTask?.equipamento || ''}`)}
            className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
              copied 
                ? 'bg-emerald-500 text-white' 
                : 'bg-white text-black hover:bg-[#e4e4e7]'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                Copiado!
              </>
            ) : (
              <>
                <Clipboard className="w-5 h-5" />
                Copiar Informações
              </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  )
}

