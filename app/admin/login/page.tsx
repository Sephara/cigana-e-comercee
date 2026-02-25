'use client'

import { useAuth } from '@/lib/auth'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const { signIn } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await signIn(formData.email, formData.password)
      if (user?.role !== 'admin') {
        toast.error('Acesso negado. Use uma conta de administrador.')
        setLoading(false)
        return
      }
      // Pequeno delay para o contexto de auth atualizar antes do layout verificar
      setTimeout(() => {
        router.push('/admin/dashboard')
        router.refresh()
      }, 50)
    } catch {
      // Toast já tratado no signIn
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        <div className="bg-black border border-gold-500/20 rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-gold-400">
            Admin — Entrar
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-400"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Senha</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold-laminated text-black py-3 rounded-2xl font-semibold disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
