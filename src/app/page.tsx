import { createClient } from '@/utils/supabase/server'
import { 
  PlusCircle, 
  Wrench, 
  ClipboardCheck, 
  Trash2, 
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

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'pendente')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar tarefas:', error.message)
  }

  const pendingCount = tasks?.length || 0

  const types = [
    { id: 'instalacao', name: 'Instalação', icon: PlusCircle, color: 'text-blue-400', glow: 'glow-blue', bg: 'bg-blue-500/10', border: 'border-blue-500/20', path: '/instalacao' },
    { id: 'manutencao', name: 'Manutenção', icon: Wrench, color: 'text-amber-400', glow: 'glow-amber', bg: 'bg-amber-500/10', border: 'border-amber-500/20', path: '/manutencao' },
    { id: 'solicitacao', name: 'Solicitações', icon: ClipboardCheck, color: 'text-violet-400', glow: 'glow-violet', bg: 'bg-violet-500/10', border: 'border-violet-500/20', path: '/solicitacoes' },
    { id: 'retirada_lacre', name: 'Retirada de Lacre', icon: Trash2, color: 'text-rose-400', glow: 'glow-rose', bg: 'bg-rose-500/10', border: 'border-rose-500/20', path: '/retirada-lacre' },
  ]

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto animate-in fade-in duration-700 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl shadow-lg shadow-violet-500/20">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">Dashboard</h1>
          </div>
          <p className="text-[#a1a1aa] text-sm max-w-xl font-medium ml-1">
            Visão centralizada de todas as operações e controle de pendências técnicas.
          </p>
        </div>
        
        <div className="flex items-center gap-4 glass-card-accent p-4 rounded-3xl group hover:glow-violet-sm transition-all duration-300">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div className="pr-2">
            <p className="text-[9px] uppercase tracking-widest text-[#52525b] font-black italic">Monitoramento em Tempo Real</p>
            <p className="text-3xl font-black text-white leading-none tracking-tighter">{pendingCount} <span className="text-[10px] text-violet-400 font-bold">ABERTOS</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {types.map((type) => {
          const count = tasks?.filter(t => t.type === type.id).length || 0
          return (
            <Link 
              key={type.id} 
              href={type.path}
              className="gradient-border bg-[#18181b] p-5 rounded-3xl border border-white/5 hover:border-white/10 transition-all duration-300 group flex flex-col gap-5 shadow-lg hover:shadow-2xl hover:shadow-black/40 relative overflow-hidden"
            >
              <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${type.bg}`} />
              
              <div className={`p-3 rounded-2xl ${type.bg} ${type.border} border w-fit group-hover:scale-110 transition-transform duration-300`}>
                <type.icon className={`w-5 h-5 ${type.color}`} />
              </div>
              <div className="flex flex-col gap-2 z-10">
                <p className="text-sm font-extrabold text-white">{type.name}</p>
                <div className="flex items-center gap-2">
                   <div className={`w-1.5 h-1.5 rounded-full transition-all ${count > 0 ? `${type.bg.replace('/10', '/30')} ${type.color} animate-glow` : 'bg-[#3f3f46]'}`} />
                   <p className="text-[9px] text-[#52525b] font-black uppercase tracking-[0.1em]">{count} PENDENTES</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="flex flex-col gap-10 mt-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase text-[#52525b]">Fila Operacional</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
        </div>

        {pendingCount === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-violet-500/10 rounded-[64px] flex flex-col items-center gap-6 animate-in zoom-in duration-500 bg-violet-500/[0.02]">
            <div className="w-20 h-20 rounded-[28px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center glow-emerald">
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
                    <div className={`p-1.5 rounded-lg ${type.bg} ${type.border} border`}>
                       <type.icon className={`w-4 h-4 ${type.color}`} />
                    </div>
                    <h3 className="text-xl font-extrabold text-white tracking-tight uppercase">{type.name}</h3>
                    <div className={`px-2.5 py-1 ${type.bg} ${type.color} text-[11px] font-black rounded-lg border ${type.border}`}>
                      {typeTasks.length}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {typeTasks.map((task) => (
                      <Link 
                        href={type.path} 
                        key={task.id} 
                        className="gradient-border bg-[#18181b] p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-black/60 flex flex-col gap-6 group relative overflow-hidden active:scale-[0.98]"
                      >
                        <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[70px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${type.bg.replace('/10', '/30')}`} />

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
                          <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${type.bg} ${type.border} ${type.color}`}>
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
                          <div className="flex items-center gap-2 text-[10px] font-black text-violet-400 group-hover:translate-x-1 transition-transform">
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
