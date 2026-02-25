'use client'

import { useAuth } from '@/lib/auth'
import Header from '@/components/Header'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function LoginContent() {
  const { signIn, signUp } = useAuth()
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password)
      } else {
        await signUp(formData.email, formData.password, formData.name)
      }
      router.push('/')
    } catch (error) {
      // Error já é tratado no auth context
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-black border border-gold-500/20 rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-gold-400">
          {isLogin ? 'Entrar' : 'Criar Conta'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-300 mb-2">Nome</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-400"
              />
            </div>
          )}
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
            className="w-full btn-gold-laminated text-black py-3 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            {loading
              ? 'Carregando...'
              : isLogin
              ? 'Entrar'
              : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setFormData({ email: '', password: '', name: '' })
            }}
            className="text-gold-400 hover:text-gold-500 transition-colors"
          >
            {isLogin
              ? 'Não tem conta? Criar conta'
              : 'Já tem conta? Entrar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <LoginContent />
      </main>
    </div>
  )
}

