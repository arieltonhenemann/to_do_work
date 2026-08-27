'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  BarChart3, 
  Wrench, 
  PlusCircle, 
  ClipboardCheck, 
  Trash2, 
  Briefcase,
  LogOut
} from 'lucide-react'

const menuItems = [
  { name: 'Dashboard', icon: BarChart3, path: '/' },
  { name: 'Instalação', icon: PlusCircle, path: '/instalacao' },
  { name: 'Manutenção', icon: Wrench, path: '/manutencao' },
  { name: 'Solicitações', icon: ClipboardCheck, path: '/solicitacoes' },
  { name: 'Retirada de Lacre', icon: Trash2, path: '/retirada-lacre' },
  { name: 'Relatórios', icon: ClipboardCheck, path: '/relatorios' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ error }) => {
      setConnected(!error)
    })
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 z-50 p-6 flex flex-col gap-8 bg-[#09090b]/80 border-r border-white/5 backdrop-blur-2xl">
      <div className="flex items-center gap-3 px-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50">
          Flow Manager
        </h1>
      </div>

      <nav className="flex flex-col gap-1.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-violet-500/10 text-white font-semibold' 
                  : 'text-[#a1a1aa] hover:bg-white/5 hover:text-white hover:translate-x-0.5'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-violet-500 to-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
              )}
              <item.icon className={`w-5 h-5 transition-colors ${
                isActive ? 'text-violet-400' : 'text-[#52525b] group-hover:text-violet-400 group-hover:scale-110 transition-all'
              }`} />
              <span className="text-sm">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold text-sm"
        >
          <LogOut className="w-5 h-5" />
          Sair do Sistema
        </button>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5">
          <p className="text-[10px] text-[#52525b] uppercase tracking-widest font-bold mb-2">Status Sistema</p>
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full transition-colors ${connected ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]'}`} />
            <span className="text-xs text-[#a1a1aa]">{connected ? 'Conectado Supabase' : 'Desconectado'}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
