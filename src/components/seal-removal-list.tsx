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
  Plus
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
  status: 'pendente' | 'finalizado'
}

export default function SealRemovalList({ tasks, onUpdate }: { tasks: Task[], onUpdate: () => void }) {
  const supabase = createClient()
  
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(false)

  const toggleChecklist = async (task: Task, field: string) => {
    const currentValue = task[field as keyof Task]
    const newValue = currentValue === 'pendente' ? 'finalizado' : 'pendente'
    
    const checklistFields = ['mk_solutions', 'mapeamento', 'geosite']
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

  // Modificar um lacre individual dentro de uma tarefa (exclusão ou edição rápida)
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

  const pendingTasks = tasks.filter(t => t.status === 'pendente')
  const finishedTasks = tasks.filter(t => t.status === 'finalizado')

  const renderTaskCard = (task: Task) => (
    <div key={task.id} className="relative glass-card-lite p-6 rounded-3xl border border-white/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col gap-6">
        {/* Header Task */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold text-white leading-none">CTO: {task.cto}</h3>
            <div className="flex items-center gap-2 text-xs text-[#a1a1aa] font-medium">
              <User className="w-3 h-3" />
              <span>Técnico: {task.tecnico}</span>
            </div>
          </div>
          <div className="flex gap-2 bg-black/40 p-2 rounded-2xl border border-white/5 shadow-2xl">
            {task.status === 'pendente' && (
              <button 
                onClick={() => setEditingTask(task)}
                className="p-2 hover:bg-white/10 text-[#a1a1aa] hover:text-white rounded-lg transition-all"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={() => setDeletingId(task.id)}
              className="p-2 hover:bg-red-500/10 text-[#52525b] hover:text-red-400 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lista Dinâmica de Lacres (Sets) */}
        <div className="flex flex-col gap-2.5">
          <p className="text-[10px] uppercase tracking-widest text-[#52525b] font-black ml-1 mb-1">Conjunto de Lacres</p>
          {task.lacres_data.map((lacre) => (
            <div 
              key={lacre.id} 
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 group ${
                lacre.status === 'ativo' 
                ? 'bg-emerald-500/5 border-emerald-500/20' 
                : 'bg-red-500/5 border-red-500/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-6 rounded-full ${lacre.status === 'ativo' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{lacre.cliente}</span>
                  <span className="text-[10px] text-[#a1a1aa] font-bold">Lacre: {lacre.lacre}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                 <button 
                  onClick={() => updateSingleLacre(task, lacre.id, 'toggleStatus')}
                  className={`text-[9px] font-black px-3 py-1.5 rounded-full transition-all border ${
                    lacre.status === 'ativo' 
                    ? 'bg-emerald-500 text-white border-emerald-400' 
                    : 'bg-red-500 text-white border-red-400'
                  }`}
                >
                  {lacre.status === 'ativo' ? 'ATIVO' : 'DESATIVADO'}
                </button>
                
                {task.status === 'pendente' && (
                  <button 
                    onClick={() => updateSingleLacre(task, lacre.id, 'delete')}
                    className="p-2 opacity-0 group-hover:opacity-100 text-[#52525b] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Checklist final */}
        <div className="pt-4 border-t border-white/5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'mk_solutions', label: 'Mk Sol.' },
              { id: 'mapeamento', label: 'Mapeam.' },
              { id: 'geosite', label: 'Geosite' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => toggleChecklist(task, item.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all gap-2 ${
                  task[item.id as keyof Task] === 'finalizado'
                    ? 'bg-red-500/10 border-red-500/20 text-white font-bold'
                    : 'bg-transparent border-white/5 text-[#52525b] hover:border-white/10'
                }`}
              >
                <span className="text-[9px] uppercase tracking-tighter">{item.label}</span>
                {task[item.id as keyof Task] === 'finalizado' ? (
                  <CheckCircle2 className="w-4 h-4 text-red-500" />
                ) : (
                  <Circle className="w-4 h-4" />
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
          <Clock className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-bold">Retiradas Pendentes</h2>
          <span className="bg-white/10 px-2 py-0.5 rounded-md text-xs">{pendingTasks.length}</span>
        </div>
        <div className="flex flex-col gap-6">
          {pendingTasks.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-white/5 rounded-[40px] text-[#52525b] text-sm">
              Sem retiradas para processar.
            </div>
          ) : (
            pendingTasks.map(renderTaskCard)
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <h2 className="text-xl font-bold">Lotes Arquivados</h2>
          <span className="bg-white/10 px-2 py-0.5 rounded-md text-xs">{finishedTasks.length}</span>
        </div>
        <div className="flex flex-col gap-6 opacity-60">
          {finishedTasks.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-white/5 rounded-[40px] text-[#52525b] text-sm">
              Histórico vazio.
            </div>
          ) : (
            finishedTasks.map(renderTaskCard)
          )}
        </div>
      </div>

      {/* Pop-up de Exclusão Tarefa Inteira */}
      <Modal 
        isOpen={!!deletingId} 
        onClose={() => setDeletingId(null)} 
        title="Apagar Tarefa Completa"
      >
        <div className="flex flex-col gap-6 text-center py-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <p className="text-lg text-white font-bold">Deseja realmente excluir a tarefa pendente?</p>
          <p className="text-sm text-[#a1a1aa]">Ao confirmar, todos os lacres deste conjunto serão apagados permanentemente.</p>
          
          <div className="flex gap-4 mt-4">
            <button
              onClick={confirmDeleteTask}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-400 text-white font-black py-4 rounded-[24px] transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sim, Excluir Tudo'}
            </button>
            <button
              onClick={() => setDeletingId(null)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-[24px] border border-white/5 transition-all"
            >
              Não, Manter
            </button>
          </div>
        </div>
      </Modal>

      {/* Pop-up de Edição Completa */}
      <Modal 
        isOpen={!!editingTask} 
        onClose={() => setEditingTask(null)} 
        title="Ajustar Retirada"
      >
        <form onSubmit={handleEditSave} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[#52525b]">Técnico</label>
              <input
                type="text" required
                value={editingTask?.tecnico || ''}
                onChange={(e) => setEditingTask({...editingTask!, tecnico: e.target.value})}
                className="todo-input px-3 py-2 rounded-xl text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[#52525b]">CTO</label>
              <input
                type="text" required
                value={editingTask?.cto || ''}
                onChange={(e) => setEditingTask({...editingTask!, cto: e.target.value})}
                className="todo-input px-3 py-2 rounded-xl text-sm"
              />
            </div>
          </div>
          
          {/* Edição da lista de lacres no modal */}
          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase font-black text-[#52525b]">Editar Lista de Lacres</p>
                <button 
                  type="button"
                  onClick={() => setEditingTask({...editingTask!, lacres_data: [...editingTask!.lacres_data, { id: crypto.randomUUID(), lacre: '', cliente: '', status: 'ativo' }]})}
                  className="flex items-center gap-1 text-[9px] font-black bg-white/5 px-2 py-1 rounded-md"
                >
                  <Plus className="w-3 h-3" /> ADICIONAR
                </button>
             </div>
             
             <div className="max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-2">
                {editingTask?.lacres_data.map((l, i) => (
                  <div key={l.id} className="bg-black/40 p-3 rounded-2xl border border-white/5 flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        className="todo-input px-2 py-1.5 rounded-lg text-xs" 
                        placeholder="Lacre" value={l.lacre}
                        onChange={(e) => {
                          const newL = [...editingTask.lacres_data];
                          newL[i].lacre = e.target.value;
                          setEditingTask({...editingTask, lacres_data: newL});
                        }}
                      />
                      <input 
                        className="todo-input px-2 py-1.5 rounded-lg text-xs" 
                        placeholder="Cliente" value={l.cliente}
                        onChange={(e) => {
                          const newL = [...editingTask.lacres_data];
                          newL[i].cliente = e.target.value;
                          setEditingTask({...editingTask, lacres_data: newL});
                        }}
                      />
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/5">
            <button
              type="submit" disabled={loading}
              className="flex-1 bg-white hover:bg-[#e4e4e7] text-black font-black py-4 rounded-[24px] flex items-center justify-center gap-2 shadow-2xl shadow-white/10"
            >
               {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SALVAR TODAS AS ALTERAÇÕES'}
            </button>
            <button
              type="button"
              onClick={() => setEditingTask(null)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-[24px] border border-white/5"
            >
              CANCELAR
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
