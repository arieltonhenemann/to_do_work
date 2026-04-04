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
    <div className="flex flex-col gap-10 max-w-7xl mx-auto animate-in fade-in duration-1000">
      <div className="flex flex-col gap-4 border-b border-white/5 pb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/5 rounded-3xl border border-white/10 shadow-2xl relative group">
            <ExternalLink className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-500" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">
              Demais Solicitações
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              <p className="text-[#52525b] text-[10px] font-black uppercase tracking-[.3em]">
                Módulo de Gestão de Demandas Gerais
              </p>
            </div>
          </div>
        </div>
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
