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
  Loader2
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
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
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

  const pendingTasks = tasks.filter(t => t.status === 'pendente')
  const finishedTasks = tasks.filter(t => t.status === 'finalizado')

  const renderTaskCard = (task: Task) => (
    <div key={task.id} className="relative glass-card-lite p-6 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col gap-4">
        {/* Header: Cliente e Técnico */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{task.cliente}</h3>
            <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
              <User className="w-3 h-3" />
              <span>Técnico: {task.tecnico}</span>
            </div>
          </div>
          <div className="flex gap-1.5 shadow-xl shadow-black/20 bg-black/40 p-1.5 rounded-xl border border-white/5">
            {task.status === 'pendente' && (
              <button 
                onClick={() => setEditingTask(task)}
                className="p-2 hover:bg-white/10 text-[#a1a1aa] hover:text-white rounded-lg transition-all"
                title="Editar"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={() => setDeletingId(task.id)}
              className="p-2 hover:bg-red-500/10 text-[#52525b] hover:text-red-400 rounded-lg transition-all"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mt-1">
          <div className="flex items-center gap-2 text-xs text-[#a1a1aa] bg-white/5 p-2 rounded-lg">
            <MapPin className="w-3 h-3" />
            <span>CTO: {task.cto || '-'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#a1a1aa] bg-white/5 p-2 rounded-lg">
            <Lock className="w-3 h-3" />
            <span>Lacre: {task.lacre || '-'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#a1a1aa] bg-white/5 p-2 rounded-lg">
            <Package className="w-3 h-3" />
            <span>Equip: {task.equipamento || '-'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#a1a1aa] bg-white/5 p-2 rounded-lg">
            <ArrowRight className="w-3 h-3" />
            <span>Portas: {task.portas_livres || '-'}</span>
          </div>
        </div>

        {/* Observações */}
        {task.observacoes && (
          <div className="flex flex-col gap-1 bg-white/5 p-3 rounded-xl border border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Observações</p>
            <p className="text-xs text-[#a1a1aa] whitespace-pre-wrap leading-relaxed">{task.observacoes}</p>
          </div>
        )}

        {/* Checklist */}
        <div className="space-y-2 mt-2">
          <p className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Protocolos e Sistemas</p>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'mk_solutions', label: 'Mk Solutions' },
              { id: 'geosite', label: 'Geosite' },
              { id: 'mapeamento', label: 'Mapeamento' },
              { id: 'sincronizacao', label: 'Sincronização' },
              { id: 'planilha', label: 'Planilha' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => toggleChecklist(task, item.id)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all text-sm group ${
                  task[item.id as keyof Task] === 'finalizado'
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-transparent border-white/5 text-[#52525b] hover:border-white/20 hover:text-[#a1a1aa]'
                }`}
              >
                <span>{item.label}</span>
                {task[item.id as keyof Task] === 'finalizado' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Circle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Rodapé: Data/Hora */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
          <Clock className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Criado em: {new Date(task.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-12 w-full">
      {/* Coluna Pendentes */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
          <Clock className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-bold">Instalações Pendentes</h2>
          <span className="bg-white/10 px-2 py-0.5 rounded-md text-xs">{pendingTasks.length}</span>
        </div>
        <div className="flex flex-col gap-6">
          {pendingTasks.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-white/5 rounded-3xl text-[#52525b] text-sm">
              Nenhuma instalação pendente.
            </div>
          ) : (
            pendingTasks.map(renderTaskCard)
          )}
        </div>
      </div>

      {/* Coluna Finalizadas */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <h2 className="text-xl font-bold">Finalizadas</h2>
          <span className="bg-white/10 px-2 py-0.5 rounded-md text-xs">{finishedTasks.length}</span>
        </div>
        <div className="flex flex-col gap-6 opacity-60 hover:opacity-100 transition-opacity duration-500">
          {finishedTasks.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-white/5 rounded-3xl text-[#52525b] text-sm">
              Nenhuma tarefa finalizada ainda.
            </div>
          ) : (
            finishedTasks.map(renderTaskCard)
          )}
        </div>
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
    </div>
  )
}

