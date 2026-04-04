'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  CheckCircle2, 
  Circle, 
  Trash2,
  Clock,
  MessageSquare,
  Lightbulb,
  Pencil,
  AlertCircle,
  Loader2
} from 'lucide-react'
import Modal from './modal'

type Task = {
  id: string
  created_at: string
  type: string
  cliente: string
  problema_reclamado: string
  solucao: string
  verificado: 'pendente' | 'finalizado'
  planilha: 'pendente' | 'finalizado'
  status: 'pendente' | 'finalizado'
}

export default function SolicitationList({ tasks, onUpdate }: { tasks: Task[], onUpdate: () => void }) {
  const supabase = createClient()
  
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(false)

  const toggleChecklist = async (task: Task, field: string) => {
    const currentValue = task[field as keyof Task]
    const newValue = currentValue === 'pendente' ? 'finalizado' : 'pendente'
    
    // Calcular novo status geral
    const checklistFields = ['verificado', 'planilha']
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
        cliente: editingTask.cliente,
        problema_reclamado: editingTask.problema_reclamado,
        solucao: editingTask.solucao
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
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-white">{task.cliente}</h3>
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

        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="mt-1">
              <MessageSquare className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-[10px] uppercase font-black text-[#52525b]">Problema Reclamado</p>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">{task.problema_reclamado}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-1">
              <Lightbulb className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-[10px] uppercase font-black text-[#52525b]">Solução</p>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">{task.solucao || 'Nenhuma solução registrada ainda.'}</p>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-2 mt-2">
          <p className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Status Solicitação</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'verificado', label: 'Verificado' },
              { id: 'planilha', label: 'Planilha' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => toggleChecklist(task, item.id)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all text-sm group ${
                  task[item.id as keyof Task] === 'finalizado'
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-500'
                    : 'bg-transparent border-white/5 text-[#52525b] hover:border-white/20 hover:text-[#a1a1aa]'
                }`}
              >
                <span>{item.label}</span>
                {task[item.id as keyof Task] === 'finalizado' ? (
                  <CheckCircle2 className="w-4 h-4 text-purple-500" />
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
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
          <Clock className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold">Solicitações Pendentes</h2>
          <span className="bg-white/10 px-2 py-0.5 rounded-md text-xs">{pendingTasks.length}</span>
        </div>
        <div className="flex flex-col gap-6">
          {pendingTasks.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-white/5 rounded-3xl text-[#52525b] text-sm">
              Sem solicitações pendentes.
            </div>
          ) : (
            pendingTasks.map(renderTaskCard)
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <h2 className="text-xl font-bold">Solicitações Finalizadas</h2>
          <span className="bg-white/10 px-2 py-0.5 rounded-md text-xs">{finishedTasks.length}</span>
        </div>
        <div className="flex flex-col gap-6 opacity-60">
          {finishedTasks.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-white/5 rounded-3xl text-[#52525b] text-sm">
              Nenhuma solicitação finalizada.
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
        title="Editar Solicitação"
      >
        <form onSubmit={handleEditSave} className="flex flex-col gap-5">
          <div className="flex flex-col gap-4">
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
              <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Problema Reclamado</label>
              <textarea
                required
                rows={3}
                value={editingTask?.problema_reclamado || ''}
                onChange={(e) => setEditingTask({...editingTask!, problema_reclamado: e.target.value})}
                className="todo-input px-3 py-2 rounded-xl text-sm resize-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold">Solução</label>
              <textarea
                rows={3}
                value={editingTask?.solucao || ''}
                onChange={(e) => setEditingTask({...editingTask!, solucao: e.target.value})}
                className="todo-input px-3 py-2 rounded-xl text-sm resize-none"
              />
            </div>
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

