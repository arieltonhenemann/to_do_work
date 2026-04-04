'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import InstallationForm from '@/components/installation-form'
import InstallationList from '@/components/installation-list'
import { PlusCircle, Loader2 } from 'lucide-react'

export default function InstallationPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('type', 'instalacao')
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
          <div className="p-2 bg-white rounded-lg">
            <PlusCircle className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Instalações</h1>
        </div>
        <p className="text-[#a1a1aa] text-sm max-w-2xl ml-1">
          Gerenciamento completo de ordens de serviço de instalação. Preencha os campos técnicos e monitore o checklist de protocolos de ativação.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Formulário de Cadastro */}
        <InstallationForm onTaskAdded={fetchTasks} />

        {/* Listagem Separada por Status */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-white/20" />
            <p className="text-[#52525b] text-xs uppercase tracking-widest font-bold">Carregando ordens...</p>
          </div>
        ) : (
          <InstallationList tasks={tasks} onUpdate={fetchTasks} />
        )}
      </div>
    </div>
  )
}
