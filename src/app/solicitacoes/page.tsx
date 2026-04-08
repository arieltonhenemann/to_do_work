'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import SolicitationForm from '@/components/solicitation-form'
import SolicitationList from '@/components/solicitation-list'
import { ClipboardCheck, Loader2 } from 'lucide-react'

export default function SolicitationPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('type', 'solicitacao')
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
            <ClipboardCheck className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Solicitações</h1>
        </div>
        <p className="text-[#a1a1aa] text-sm max-w-2xl ml-1">
          Gerenciamento de chamados técnicos e solicitações de clientes. Acompanhe o registro de problemas e as soluções aplicadas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Formulário de Cadastro */}
        <SolicitationForm onTaskAdded={fetchTasks} />

        {/* Listagem Separada por Status */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-white/20" />
            <p className="text-[#52525b] text-xs uppercase tracking-widest font-bold">Carregando solicitações...</p>
          </div>
        ) : (
          <SolicitationList tasks={tasks} onUpdate={fetchTasks} />
        )}
      </div>
    </div>
  )
}
