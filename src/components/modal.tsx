'use client'

import { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Overlay - Sem fechar ao clicar (conforme pedido) */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg glass-card p-6 sm:p-8 rounded-[32px] border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-white leading-tight">
              {title}
            </h2>
            <div className="h-1 w-12 bg-white rounded-full mt-2" />
          </div>

          <div className="text-[#a1a1aa]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
