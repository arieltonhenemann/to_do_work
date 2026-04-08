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
    <div className="flex flex-col gap-8 max-w-7xl mx-auto animate-in fade-in duration-700 min-h-screen">
      <div className="flex flex-col gap-2 border-b border-white/5 pb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-white/10">
            <ExternalLink className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Demais Solicitações</h1>
        </div>
        <p className="text-[#a1a1aa] text-sm max-w-2xl ml-1">
          Gerenciamento de fluxos gerais e demandas diversas. Organize e acompanhe solicitações que não se enquadram em categorias técnicas específicas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Formulário de Cadastro */}
        <OtherSolicitationForm onTaskAdded={fetchTasks} />

        {/* Listagem Separada por Status */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-white/20" />
            <p className="text-[#52525b] text-xs uppercase tracking-widest font-bold">Carregando fluxo geral...</p>
          </div>
        ) : (
          <OtherSolicitationList tasks={tasks} onUpdate={fetchTasks} />
        )}
      </div>
    </div>
  )
}
