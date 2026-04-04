'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

type Todo = {
  id: string
  title: string
  is_completed: boolean
  created_at: string
}

export default function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    setLoading(true)
    const { data, error } = await supabase
      .from('todos')
      .insert([{ title: newTodo, is_completed: false }])
      .select()

    if (error) {
      console.error('Erro ao adicionar:', error.message)
    } else if (data) {
      setTodos([data[0], ...todos])
      setNewTodo('')
    }
    setLoading(false)
  }

  const toggleTodo = async (id: string, is_completed: boolean) => {
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: !is_completed })
      .eq('id', id)

    if (error) {
      console.error('Erro ao atualizar:', error.message)
    } else {
      setTodos(
        todos.map((t) =>
          t.id === id ? { ...t, is_completed: !is_completed } : t
        )
      )
    }
  }

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id)

    if (error) {
      console.error('Erro ao excluir:', error.message)
    } else {
      setTodos(todos.filter((t) => t.id !== id))
    }
  }

  return (
    <div className="w-full max-w-md glass-card p-8 rounded-2xl flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Tarefas</h1>
        <p className="text-xs text-[#a1a1aa] uppercase tracking-widest font-medium">Daily Workflow</p>
      </div>

      <form onSubmit={addTodo} className="flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="O que precisa ser feito?"
          className="flex-1 todo-input px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-[#52525b]"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black px-5 py-2.5 rounded-xl font-semibold hover:bg-[#e4e4e7] transition-all text-sm active:scale-95 disabled:opacity-50"
        >
          {loading ? '...' : 'Add'}
        </button>
      </form>

      <div className="flex flex-col gap-2 mt-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {todos.length === 0 ? (
          <p className="text-center text-sm text-[#52525b] py-8">Nenhuma tarefa por aqui ainda.</p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-[#18181b]/50 transition-all group border border-transparent hover:border-[#27272a] animate-in slide-in-from-bottom-2 duration-300"
            >
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={todo.is_completed}
                  onChange={() => toggleTodo(todo.id, todo.is_completed)}
                  className="peer w-5 h-5 opacity-0 absolute cursor-pointer"
                />
                <div className="w-5 h-5 border-2 border-[#27272a] rounded-md flex items-center justify-center peer-checked:bg-white peer-checked:border-white transition-all">
                  {todo.is_completed && (
                    <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span
                className={`flex-1 text-sm transition-all ${
                  todo.is_completed ? 'text-[#52525b] line-through' : 'text-[#fafafa]'
                }`}
              >
                {todo.title}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-neutral-800 rounded-lg text-[#52525b] hover:text-red-400 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
