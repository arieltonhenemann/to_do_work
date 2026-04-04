'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { 
  BarChart3, 
  Wrench, 
  PlusCircle, 
  ClipboardCheck, 
  Trash2, 
  ExternalLink,
  Briefcase,
  LogOut
} from 'lucide-react'

const menuItems = [
  { name: 'Dashboard', icon: BarChart3, path: '/' },
  { name: 'Instalação', icon: PlusCircle, path: '/instalacao' },
  { name: 'Manutenção', icon: Wrench, path: '/manutencao' },
  { name: 'Solicitações', icon: ClipboardCheck, path: '/solicitacoes' },
  { name: 'Retirada de Lacre', icon: Trash2, path: '/retirada-lacre' },
  { name: 'Demais Solicitações', icon: ExternalLink, path: '/demais-solicitacoes' },
  { name: 'Relatórios', icon: ClipboardCheck, path: '/relatorios' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 z-50 p-6 flex flex-col gap-8 bg-[#09090b]/50 border-r border-white/5 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-2">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-black" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">
          Flow Manager
        </h1>
      </div>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-white text-black font-semibold shadow-lg shadow-white/10' 
                  : 'text-[#a1a1aa] hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-black' : 'group-hover:scale-110 transition-transform'}`} />
              <span className="text-sm">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <button 
        onClick={handleLogout}
        className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm"
      >
        <LogOut className="w-5 h-5" />
        Sair do Sistema
      </button>

      <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
        <p className="text-[10px] text-[#52525b] uppercase tracking-widest font-bold mb-1">Status Sistema</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-[#a1a1aa]">Conectado Supabase</span>
        </div>
      </div>
    </aside>
  )
}
