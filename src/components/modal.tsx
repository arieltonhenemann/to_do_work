'use client'

import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
    }
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Overlay - Sem fechar ao clicar (conforme pedido) */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg glass-card p-8 rounded-[40px] border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 hover:bg-white/10 text-[#a1a1aa] hover:text-white rounded-2xl transition-all z-10 border border-transparent hover:border-white/5"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
              {title}
            </h2>
            <div className="h-1.5 w-12 bg-white rounded-full" />
          </div>

          <div className="text-[#a1a1aa]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
