import { createClient } from '@/utils/supabase/server'
import { 
  PlusCircle, 
  Wrench, 
  ClipboardCheck, 
  Trash2, 
  ExternalLink,
  Clock,
  ArrowRight,
  User,
  MapPin,
  CheckCircle2,
  LayoutDashboard
} from 'lucide-react'
import Link from 'next/link'

export default async function Dashboard() {
  const supabase = await createClient()

  // Busca todas as tarefas pendentes de todas as categorias
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'pendente')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar tarefas:', error.message)
  }

  const pendingCount = tasks?.length || 0

  // Definição dos tipos na ORDEM SOLICITADA
  const types = [
    { id: 'instalacao', name: 'Instalação', icon: PlusCircle, color: 'text-blue-400', path: '/instalacao' },
    { id: 'manutencao', name: 'Manutenção', icon: Wrench, color: 'text-amber-400', path: '/manutencao' },
    { id: 'solicitacao', name: 'Solicitações', icon: ClipboardCheck, color: 'text-purple-400', path: '/solicitacoes' },
    { id: 'retirada_lacre', name: 'Retirada de Lacre', icon: Trash2, color: 'text-red-400', path: '/retirada-lacre' },
    { id: 'demais_solicitacoes', name: 'Demais Solicitações', icon: ExternalLink, color: 'text-emerald-400', path: '/demais-solicitacoes' },
  ]

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-lg shadow-white/10">
              <LayoutDashboard className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">Dashboard</h1>
          </div>
          <p className="text-[#a1a1aa] text-sm max-w-xl font-medium ml-1">
            Visão geral de todas as operações em campo e controle de pendências.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 group hover:border-white/20 transition-all mb-1">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-white/10 group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5 text-black" />
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-[#52525b] font-black">Pendências Totais</p>
            <p className="text-2xl font-black text-white leading-none">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Cards Rápidos de Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {types.map((type) => {
          const count = tasks?.filter(t => t.type === type.id).length || 0
          return (
            <Link 
              key={type.id} 
              href={type.path}
              className="glass-card-lite p-5 rounded-2xl border border-white/5 hover:border-white/20 transition-all group flex flex-col gap-4"
            >
              <div className={`p-3 rounded-xl bg-white/5 w-fit group-hover:scale-110 transition-transform ${type.color}`}>
                <type.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">{type.name}</p>
                <div className="flex items-center gap-2">
                   <div className={`w-1.5 h-1.5 rounded-full ${count > 0 ? 'bg-amber-500 animate-pulse' : 'bg-[#52525b]'}`} />
                   <p className="text-[10px] text-[#52525b] font-black uppercase tracking-widest">{count} PENDENTES</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Fila de Trabalho AGRUPADA */}
      <div className="flex flex-col gap-12 mt-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white/50">Fluxo de Trabalho</h2>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        {pendingCount === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[48px] flex flex-col items-center gap-6 animate-in zoom-in duration-500">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xl font-bold text-white">Sem tarefas pendentes no momento!</p>
              <p className="text-sm text-[#52525b] font-medium tracking-wide">Tudo em dia com a operação de campo.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {types.map((type) => {
              const typeTasks = tasks?.filter(t => t.type === type.id) || []
              
              if (typeTasks.length === 0) return null

              return (
                <div key={type.id} className="flex flex-col gap-6 animate-in slide-in-from-left duration-700">
                  <div className="flex items-center gap-3 px-1">
                    <div className={`p-1.5 rounded-lg bg-white/5 ${type.color}`}>
                       <type.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{type.name}</h3>
                    <span className="bg-white/5 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest border border-white/5">
                      {typeTasks.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {typeTasks.map((task) => (
                      <div key={task.id} className="glass-card-lite p-6 rounded-3xl border border-white/5 hover:bg-white/[0.03] transition-all flex flex-col gap-6 group relative overflow-hidden">
                        {/* Background Decorativo */}
                        <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full blur-[60px] opacity-20 ${type.color.replace('text-', 'bg-')}`} />

                        <div className="flex justify-between items-start z-10">
                          <div className="flex flex-col gap-1">
                            <h4 className="font-black text-white text-lg tracking-tight leading-none">
                               {task.cliente || task.solicitante}
                            </h4>
                            <p className="text-[10px] uppercase text-[#52525b] font-black tracking-[0.2em]">Identificado</p>
                          </div>
                          <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                            type.color.replace('text-', 'bg-').replace('-400', '-500/10')
                          } ${type.color.replace('-400', '-500/30')} ${type.color}`}>
                            {type.name}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs z-10">
                          <div className="flex items-center gap-2 text-[#a1a1aa] font-medium bg-black/40 p-2.5 rounded-xl border border-white/5">
                            <User className="w-3.5 h-3.5 opacity-50" />
                            <span>{task.tecnico || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#a1a1aa] font-medium bg-black/40 p-2.5 rounded-xl border border-white/5">
                            <MapPin className="w-3.5 h-3.5 opacity-50" />
                            <span className="truncate">{task.cto || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 z-10">
                          <div className="h-px bg-white/5 w-full" />
                          <div className="flex justify-between items-center">
                            <Link 
                              href={type.path} 
                              className="text-[11px] uppercase tracking-[0.2em] font-black text-white flex items-center gap-2 hover:gap-3 transition-all"
                            >
                              Ver Detalhes <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            <div className="flex items-center gap-1.5 opacity-30 text-[10px] font-bold text-[#a1a1aa] uppercase tracking-tighter">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(task.created_at).toLocaleString('pt-BR', { 
                                day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
