'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  CheckCircle2, 
  Circle, 
  Trash2,
  Clock,
  MessageSquare,
  User,
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
  solicitante: string
  problema_reclamado: string
  solucao: string
  resolvido: 'pendente' | 'finalizado'
  planilha: 'pendente' | 'finalizado'
  status: 'pendente' | 'finalizado'
}

export default function OtherSolicitationList({ tasks, onUpdate }: { tasks: Task[], onUpdate: () => void }) {
  const supabase = createClient()
  
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(false)

  const toggleChecklist = async (task: Task, field: string) => {
    const currentValue = task[field as keyof Task]
    const newValue = currentValue === 'pendente' ? 'finalizado' : 'pendente'
    
    // Calcular novo status geral
    const checklistFields = ['resolvido', 'planilha']
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
        solicitante: editingTask.solicitante,
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
    <div key={task.id} className="relative glass-card-lite p-8 rounded-3xl border border-white/5 animate-in fade-in slide-in-from-bottom-2 duration-300 group">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
             <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                <User className="w-4 h-4 text-[#a1a1aa]" />
             </div>
             <h3 className="text-xl font-black text-white">{task.solicitante}</h3>
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

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="mt-1">
              <MessageSquare className="w-5 h-5 text-blue-400 opacity-60" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[10px] uppercase font-black text-[#52525b] tracking-wider">Problema</p>
              <p className="text-sm text-[#a1a1aa] leading-relaxed font-medium">{task.problema_reclamado}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="mt-1">
              <Lightbulb className="w-5 h-5 text-emerald-400 opacity-60" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[10px] uppercase font-black text-[#52525b] tracking-wider">Solução Aplicada</p>
              <p className="text-sm text-[#a1a1aa] leading-relaxed font-medium italic opacity-80">{task.solucao || 'Nenhuma nota registrada.'}</p>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="pt-6 border-t border-white/5">
          <p className="text-[10px] uppercase tracking-widest text-[#52525b] font-black mb-3 ml-1">Status Finalização</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'resolvido', label: 'Resolvido' },
              { id: 'planilha', label: 'Planilha' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => toggleChecklist(task, item.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-sm group ${
                  task[item.id as keyof Task] === 'finalizado'
                    ? 'bg-blue-500/10 border-blue-500/30 text-white font-bold'
                    : 'bg-transparent border-white/5 text-[#52525b] hover:border-white/20 hover:text-[#a1a1aa]'
                }`}
              >
                <span className="uppercase text-[11px] tracking-widest font-black">{item.label}</span>
                {task[item.id as keyof Task] === 'finalizado' ? (
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                ) : (
                  <Circle className="w-5 h-5 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all" />
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
          <Clock className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold">Solicitações Pendentes</h2>
          <span className="bg-white/10 px-2.5 py-1 rounded-lg text-xs font-black">{pendingTasks.length}</span>
        </div>
        <div className="flex flex-col gap-6">
          {pendingTasks.length === 0 ? (
            <div className="p-16 text-center border-2 border-dashed border-white/5 rounded-[48px] text-[#52525b] text-sm font-black uppercase tracking-widest">
              Tudo Resolvido.
            </div>
          ) : (
            pendingTasks.map(renderTaskCard)
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <h2 className="text-xl font-bold">Histórico Resolvido</h2>
          <span className="bg-white/10 px-2.5 py-1 rounded-lg text-xs font-black">{finishedTasks.length}</span>
        </div>
        <div className="flex flex-col gap-6 opacity-60 hover:opacity-80 transition-opacity">
          {finishedTasks.length === 0 ? (
            <div className="p-16 text-center border-2 border-dashed border-white/5 rounded-[48px] text-[#52525b] text-sm font-black uppercase tracking-widest">
              Sem histórico.
            </div>
          ) : (
            finishedTasks.map(renderTaskCard)
          )}
        </div>
      </div>

      {/* Pop-up Exclusão */}
      <Modal 
        isOpen={!!deletingId} 
        onClose={() => setDeletingId(null)} 
        title="Deseja realmente excluir a tarefa pendente?"
      >
        <div className="flex flex-col gap-8 pt-4">
          <div className="flex items-center gap-4 p-6 rounded-3xl bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-sm text-red-200/80 leading-relaxed">Esta ação não poderá ser desfeita. Todos os dados da solicitação serão removidos.</p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={confirmDelete}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-400 text-white font-black py-4 rounded-[28px] transition-all flex items-center justify-center gap-2 shadow-2xl shadow-red-500/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SIM, EXCLUIR'}
            </button>
            <button
              onClick={() => setDeletingId(null)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-[28px] border border-white/5 transition-all"
            >
              NÃO, MANTER
            </button>
          </div>
        </div>
      </Modal>

      {/* Pop-up Edição */}
      <Modal 
        isOpen={!!editingTask} 
        onClose={() => setEditingTask(null)} 
        title="Editar Solicitação Geral"
      >
        <form onSubmit={handleEditSave} className="flex flex-col gap-6 pt-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-black text-[#52525b]">Solicitante</label>
            <input
              type="text" required
              value={editingTask?.solicitante || ''}
              onChange={(e) => setEditingTask({...editingTask!, solicitante: e.target.value})}
              className="todo-input px-4 py-3 rounded-2xl text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-black text-[#52525b]">Problema</label>
            <textarea
              required rows={2}
              value={editingTask?.problema_reclamado || ''}
              onChange={(e) => setEditingTask({...editingTask!, problema_reclamado: e.target.value})}
              className="todo-input px-4 py-3 rounded-2xl text-sm resize-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-black text-[#52525b]">Solução</label>
            <textarea
              rows={2}
              value={editingTask?.solucao || ''}
              onChange={(e) => setEditingTask({...editingTask!, solucao: e.target.value})}
              className="todo-input px-4 py-3 rounded-2xl text-sm resize-none"
            />
          </div>
          
          <div className="flex gap-4 pt-4 border-t border-white/5">
            <button
              type="submit" disabled={loading}
              className="flex-1 bg-white text-black font-black py-4 rounded-[28px] transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : 'SALVAR ALTERAÇÕES'}
            </button>
            <button
              type="button"
              onClick={() => setEditingTask(null)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-[28px] border border-white/5"
            >
              NÃO, CANCELAR
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
