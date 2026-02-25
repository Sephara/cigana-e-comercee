'use client'

import { useAuth } from '@/lib/auth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LogOut, Package, Home, LayoutDashboard, Menu, X, ShoppingCart, Tag } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading && !pathname?.includes('/admin/login')) {
      if (!user) {
        router.push('/admin/login')
      } else if (user.role !== 'admin') {
        router.push('/')
      }
    }
  }, [user, loading, router, pathname])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-gold-400">Carregando...</p>
      </div>
    )
  }

  if (!pathname?.includes('/admin/login') && (!user || user.role !== 'admin')) {
    return null
  }

  if (pathname?.includes('/admin/login')) {
    return <>{children}</>
  }

  const navLink = "flex items-center gap-3 py-3 px-4 rounded-xl text-gray-300 hover:bg-white/5 hover:text-gold-400 transition-colors"
  const isActive = (path: string) => pathname === path

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <header className="sticky top-0 z-40 border-b border-gold-500/20 bg-black/95 backdrop-blur-sm px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
        <Link
          href="/admin"
          className="text-lg md:text-xl font-bold text-gold-400 flex items-center gap-2 min-w-0"
        >
          <Package className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
          <span className="truncate">Admin Cigana</span>
        </Link>

        {/* Desktop: nav horizontal */}
        <nav className="hidden md:flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="text-gray-400 hover:text-gold-400 flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/produtos"
            className="text-gray-400 hover:text-gold-400 flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Produtos
          </Link>
          <Link
            href="/admin/vendas"
            className="text-gray-400 hover:text-gold-400 flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Vendas
          </Link>
          <Link
            href="/admin/categorias"
            className="text-gray-400 hover:text-gold-400 flex items-center gap-2"
          >
            <Tag className="w-4 h-4" />
            Categorias
          </Link>
          <Link
            href="/"
            className="text-gray-400 hover:text-gold-400 flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Ver Loja
          </Link>
          <span className="text-gray-500 text-sm max-w-[120px] truncate" title={user?.email}>{user?.email}</span>
          <button
            onClick={() => logout().then(() => router.push('/admin/login'))}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </nav>

        {/* Mobile: botão menu */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden p-2 rounded-xl text-gray-400 hover:text-gold-400 hover:bg-white/5 touch-manipulation"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile: menu drawer */}
      {menuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-40 top-14"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <nav className="md:hidden fixed top-14 left-0 right-0 bottom-0 z-50 bg-black border-t border-gold-500/20 overflow-y-auto">
            <div className="p-4 space-y-1">
              <Link
                href="/admin/dashboard"
                className={`${navLink} ${isActive('/admin/dashboard') ? 'text-gold-400 bg-gold-500/10' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
              <Link
                href="/admin/produtos"
                className={`${navLink} ${isActive('/admin/produtos') ? 'text-gold-400 bg-gold-500/10' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <Package className="w-5 h-5" />
                Produtos
              </Link>
              <Link
                href="/admin/vendas"
                className={`${navLink} ${isActive('/admin/vendas') ? 'text-gold-400 bg-gold-500/10' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5" />
                Vendas
              </Link>
              <Link
                href="/admin/categorias"
                className={`${navLink} ${isActive('/admin/categorias') ? 'text-gold-400 bg-gold-500/10' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <Tag className="w-5 h-5" />
                Categorias
              </Link>
              <Link
                href="/"
                className={navLink}
                onClick={() => setMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                Ver Loja
              </Link>
              <div className="border-t border-gold-500/20 mt-4 pt-4">
                <p className="px-4 py-2 text-gray-500 text-sm truncate" title={user?.email}>
                  {user?.email}
                </p>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    logout().then(() => router.push('/admin/login'))
                  }}
                  className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sair
                </button>
              </div>
            </div>
          </nav>
        </>
      )}

      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  )
}
