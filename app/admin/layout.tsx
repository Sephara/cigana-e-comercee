'use client'

import { useAuth } from '@/lib/auth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LogOut, Package, Home, LayoutDashboard, Menu, X, ShoppingCart, Tag, LayoutGrid } from 'lucide-react'

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
    <div
      className="min-h-screen min-h-[100dvh] bg-black flex flex-col fixed inset-0 w-full overflow-hidden md:static md:min-h-0 md:overflow-visible"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)', paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}
    >
      <header
        className="flex-shrink-0 z-40 border-b border-gold-500/20 bg-black/95 backdrop-blur-sm px-4 py-4 md:px-6 md:py-4 flex items-center justify-between md:sticky md:top-0 min-h-[56px] md:min-h-0"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 16px), 16px)' }}
      >
        <Link
          href="/admin"
          className="text-lg md:text-xl font-bold text-gold-400 flex items-center gap-2 min-w-0 touch-manipulation"
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
            href="/admin/galeria"
            className="text-gray-400 hover:text-gold-400 flex items-center gap-2"
          >
            <LayoutGrid className="w-4 h-4" />
            Galeria
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

        {/* Mobile: botão menu (área de toque >= 44px) */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-gray-400 hover:text-gold-400 hover:bg-white/5 touch-manipulation cursor-pointer"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile: menu drawer */}
      {menuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-40"
            style={{ top: 0 }}
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <nav className="md:hidden fixed left-0 right-0 bottom-0 z-50 bg-black border-t border-gold-500/20 overflow-y-auto"
            style={{ top: 'calc(max(env(safe-area-inset-top), 16px) + 56px)' }}
          >
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
                href="/admin/galeria"
                className={`${navLink} ${isActive('/admin/galeria') ? 'text-gold-400 bg-gold-500/10' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <LayoutGrid className="w-5 h-5" />
                Galeria
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

      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 overscroll-none">{children}</main>
    </div>
  )
}
