'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/cart'
import { ShoppingCart } from 'lucide-react'

export default function Header() {
  const { itemCount } = useCart()

  return (
    <header className="hidden md:block sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gold-500/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="relative w-16 h-16">
              <Image
                src="/LOGO ( CIGANA LUXURY STYLE ).png"
                alt="Cigana Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-white hover:text-gold-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/produtos"
              className="text-white hover:text-gold-400 transition-colors"
            >
              Produtos
            </Link>
            <Link
              href="/carrinho"
              className="relative text-white hover:text-gold-400 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
