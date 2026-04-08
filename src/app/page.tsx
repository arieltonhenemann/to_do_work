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
    <div className="flex flex-col gap-10 max-w-7xl mx-auto animate-in fade-in duration-700 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8 pb-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-white/10">
              <LayoutDashboard className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">Dashboard</h1>
          </div>
          <p className="text-[#a1a1aa] text-sm max-w-xl font-medium ml-1">
            Visão centralizada de todas as operações e controle de pendências técnicas.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-[#18181b] p-4 rounded-3xl border border-white/5 group hover:border-white/10 transition-all mb-1 shadow-xl shadow-black/20">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-white/5 group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5 text-black" />
          </div>
          <div className="pr-2">
            <p className="text-[9px] uppercase tracking-widest text-[#52525b] font-black italic">Monitoramento em Tempo Real</p>
            <p className="text-3xl font-black text-white leading-none tracking-tighter">{pendingCount} <span className="text-[10px] text-[#52525b]">ABERTOS</span></p>
          </div>
        </div>
      </div>

      {/* Cards de Acesso Rápido / Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {types.map((type) => {
          const count = tasks?.filter(t => t.type === type.id).length || 0
          return (
            <Link 
              key={type.id} 
              href={type.path}
              className="bg-[#18181b] p-5 rounded-[32px] border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.02] group flex flex-col gap-5 shadow-lg"
            >
              <div className={`p-3 rounded-2xl bg-white/5 w-fit group-hover:scale-110 transition-transform ${type.color}`}>
                <type.icon className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-extrabold text-white">{type.name}</p>
                <div className="flex items-center gap-2">
                   <div className={`w-1.5 h-1.5 rounded-full ${count > 0 ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-[#52525b]'}`} />
                   <p className="text-[9px] text-[#52525b] font-black uppercase tracking-[0.1em]">{count} PENDENTES</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Fila de Trabalho Unificada */}
      <div className="flex flex-col gap-10 mt-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase text-[#52525b]">Fila Operacional</h2>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        {pendingCount === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-zinc-800/40 rounded-[64px] flex flex-col items-center gap-6 animate-in zoom-in duration-500 bg-[#18181b]/20">
            <div className="w-20 h-20 rounded-[28px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xl font-bold text-white">Excelente! Nada pendente.</p>
              <p className="text-sm text-[#52525b] font-medium tracking-wide">Toda a operação está em dia.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {types.map((type) => {
              const typeTasks = tasks?.filter(t => t.type === type.id) || []
              if (typeTasks.length === 0) return null

              return (
                <div key={type.id} className="flex flex-col gap-6 animate-in slide-in-from-left duration-700">
                  <div className="flex items-center gap-3 px-2">
                    <div className={`p-1.5 rounded-lg bg-[#18181b] border border-white/5 ${type.color}`}>
                       <type.icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-xl font-extrabold text-white tracking-tight uppercase tracking-tighter">{type.name}</h3>
                    <div className="px-2 py-0.5 bg-white/5 text-[#52525b] text-[11px] font-black rounded-lg border border-white/5">
                      {typeTasks.length}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {typeTasks.map((task) => (
                      <Link 
                        href={type.path} 
                        key={task.id} 
                        className="bg-[#18181b] p-6 rounded-[32px] border border-white/5 hover:border-white/10 transition-all hover:shadow-2xl hover:shadow-black/60 flex flex-col gap-6 group relative overflow-hidden active:scale-[0.98]"
                      >
                        {/* Indicador de Status/Tipo (Background Sutil) */}
                        <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[70px] opacity-10 transition-opacity group-hover:opacity-20 ${type.color.replace('text-', 'bg-')}`} />

                        <div className="flex justify-between items-start z-10">
                          <div className="flex flex-col gap-1">
                            <h4 className="font-extrabold text-white text-lg tracking-tight group-hover:text-white transition-colors">
                               {task.cliente || task.solicitante || 'Lote de ' + task.tecnico}
                            </h4>
                            <span className="text-[10px] uppercase text-[#52525b] font-black tracking-widest flex items-center gap-2">
                               {type.id === 'retirada_lacre' ? (
                                 <>CTO: {task.cto} <span className="opacity-30">•</span> {task.lacres_data?.length || 0} LACRES</>
                               ) : (
                                 <>CONTRATO: {task.id.slice(0, 8)}</>
                               )}
                            </span>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                            type.color.replace('text-', 'bg-').replace('-400', '-500/10')
                          } border-white/5 ${type.color}`}>
                            {type.name}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 z-10">
                          <div className="flex flex-col gap-1.5 bg-black/20 p-3 rounded-2xl border border-white/5 group-hover:bg-black/30 transition-all">
                             <span className="text-[9px] uppercase font-black text-[#52525b] tracking-widest">Técnico Responsável</span>
                             <div className="flex items-center gap-2 text-xs text-[#a1a1aa] font-bold">
                               <User className="w-3 h-3 opacity-40 shrink-0" />
                               <span className="truncate">{task.tecnico || 'S/T'}</span>
                             </div>
                          </div>
                          <div className="flex flex-col gap-1.5 bg-black/20 p-3 rounded-2xl border border-white/5 group-hover:bg-black/30 transition-all">
                             <span className="text-[9px] uppercase font-black text-[#52525b] tracking-widest">Local / Referência</span>
                             <div className="flex items-center gap-2 text-xs text-[#a1a1aa] font-bold">
                               <MapPin className="w-3 h-3 opacity-40 shrink-0" />
                               <span className="truncate">{task.cto || 'Geral'}</span>
                             </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center z-10 pt-1">
                          <div className="flex items-center gap-2 text-[10px] text-[#52525b] font-black uppercase tracking-wider">
                             <Clock className="w-3.5 h-3.5" />
                             {new Date(task.created_at).toLocaleDateString('pt-BR')} às {new Date(task.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-white hover:translate-x-1 transition-transform">
                             GERENCIAR <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </Link>
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
