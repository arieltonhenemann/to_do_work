'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import SealRemovalForm from '@/components/seal-removal-form'
import SealRemovalList from '@/components/seal-removal-list'
import { Trash2, Loader2, Info } from 'lucide-react'

export default function SealRemovalPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('type', 'retirada_lacre')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar tarefas:', error.message)
    } else {
      setTasks(data || [])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col gap-2 border-b border-white/5 pb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500 rounded-lg shadow-lg shadow-red-500/20">
            <Trash2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Retirada de Lacre</h1>
        </div>
        <p className="text-[#a1a1aa] text-sm max-w-2xl ml-1 font-medium">
          Módulo especializado para remoção de lacres em massa e gerenciamento de lotes pendentes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <SealRemovalForm onTaskAdded={fetchTasks} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-white/20" />
            <p className="text-[10px] text-[#52525b] uppercase tracking-[0.2em] font-black">Sincronizando Retidaras...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2 px-2 text-[10px] text-[#52525b] font-bold uppercase tracking-widest">
              <Info className="w-3 h-3" />
              <span>DICA: Clique no status (ATIVO/DESATIVADO) para alternar rapidamente as cores.</span>
            </div>
            <SealRemovalList tasks={tasks} onUpdate={fetchTasks} />
          </div>
        )}
      </div>
    </div>
  )
}
