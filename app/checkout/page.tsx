'use client'

import { useCart } from '@/lib/cart'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Checkout() {
  const router = useRouter()
  const { cart } = useCart()

  useEffect(() => {
    if (cart.length === 0) {
      router.replace('/carrinho')
      return
    }
    router.replace('/carrinho')
  }, [cart.length, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Redirecionando para o carrinho...</p>
    </div>
  )
}
