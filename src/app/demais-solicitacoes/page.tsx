'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import OtherSolicitationForm from '@/components/other-solicitation-form'
import OtherSolicitationList from '@/components/other-solicitation-list'
import { ExternalLink, Loader2, Target } from 'lucide-react'

export default function OtherSolicitationPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('type', 'demais_solicitacoes')
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
          <div className="p-2 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20">
            <ExternalLink className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Demais Solicitações</h1>
        </div>
        <p className="text-[#a1a1aa] text-sm max-w-2xl ml-1">
          Gerenciamento de demandas gerais e solicitações diversas que não se enquadram nas categorias técnicas principais.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-16">
        <OtherSolicitationForm onTaskAdded={fetchTasks} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-white/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              </div>
            </div>
            <p className="text-[10px] text-[#52525b] uppercase tracking-[0.4em] font-black animate-pulse">
              Carregando Fluxo Geral...
            </p>
          </div>
        ) : (
          <OtherSolicitationList tasks={tasks} onUpdate={fetchTasks} />
        )}
      </div>
    </div>
  )
}
