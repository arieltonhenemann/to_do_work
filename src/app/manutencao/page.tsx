'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import MaintenanceForm from '@/components/maintenance-form'
import MaintenanceList from '@/components/maintenance-list'
import { Wrench, Loader2 } from 'lucide-react'

export default function MaintenancePage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('type', 'manutencao')
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
          <div className="p-2 bg-amber-500 rounded-lg">
            <Wrench className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Manutenção</h1>
        </div>
        <p className="text-[#a1a1aa] text-sm max-w-2xl ml-1">
          Histórico e registro de manutenções preventivas e corretivas em campo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <MaintenanceForm onTaskAdded={fetchTasks} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-white/20" />
            <p className="text-[#52525b] text-xs uppercase tracking-widest font-bold">Buscando manutenções...</p>
          </div>
        ) : (
          <MaintenanceList tasks={tasks} onUpdate={fetchTasks} />
        )}
      </div>
    </div>
  )
}
