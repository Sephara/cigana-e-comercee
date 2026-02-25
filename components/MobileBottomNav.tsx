'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/cart'
import { Home, Package, ShoppingCart } from 'lucide-react'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { itemCount } = useCart()

  if (pathname.startsWith('/admin')) return null

  const isActive = (path: string) => pathname === path

  return (
    <nav
      className="md:hidden fixed left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-t border-gold-500/20"
      style={{
        bottom: 0,
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
        paddingTop: 12,
      }}
    >
      <div className="flex items-center justify-around h-14 px-2">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
            isActive('/') ? 'text-gold-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs mt-0.5">Home</span>
        </Link>

        <Link
          href="/carrinho"
          className="flex flex-col items-center justify-center flex-1 -mt-6"
        >
          <div className="w-14 h-14 rounded-full btn-gold-laminated flex items-center justify-center shadow-lg border-2 border-black/20 relative">
            <ShoppingCart className="w-7 h-7 text-black" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-gold-400 text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-xs mt-1 text-gray-400">Carrinho</span>
        </Link>

        <Link
          href="/produtos"
          className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
            isActive('/produtos') ? 'text-gold-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Package className="w-6 h-6" />
          <span className="text-xs mt-0.5">Produtos</span>
        </Link>
      </div>
    </nav>
  )
}
