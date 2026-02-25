'use client'

import { useState, useEffect } from 'react'
import { Tag, Plus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

type Category = { id: string; name: string }

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories', { credentials: 'include' })
      if (!res.ok) throw new Error('Erro')
      const data = await res.json()
      setCategories(data)
    } catch {
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) {
      toast.error('Digite o nome da categoria')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao criar')
      toast.success('Categoria criada!')
      setNewName('')
      fetchCategories()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar categoria')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Tag className="w-6 h-6 text-gold-400" />
        Categorias
      </h1>
      <p className="text-gray-400 text-sm mb-6">
        Crie categorias para organizar os produtos. Ao adicionar um produto, você poderá escolher uma dessas categorias.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nome da nova categoria"
          className="flex-1 bg-black border border-gold-500/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400"
        />
        <button
          type="submit"
          disabled={submitting}
          className="btn-gold-laminated text-black px-6 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          Criar
        </button>
      </form>

      {loading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gold-500/30 p-8 text-center text-gray-500">
          Nenhuma categoria ainda. Crie a primeira acima.
        </div>
      ) : (
        <ul className="space-y-2">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 p-4 rounded-xl bg-black/50 border border-gold-500/20"
            >
              <Tag className="w-5 h-5 text-gold-400 flex-shrink-0" />
              <span className="text-white font-medium">{c.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
