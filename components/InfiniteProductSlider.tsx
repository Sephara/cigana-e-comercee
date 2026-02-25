'use client'

import * as React from 'react'
import ProductCard from './ProductCard'
import { Product } from '@/lib/products'

interface InfiniteProductSliderProps {
  products: Product[]
  /** Se 6, mostra só 6 cards sem duplicar (recomendado para seção que trava, ex.: bonés) */
  maxCards?: 6 | 12
}

const MAX_CARDS = 12

/**
 * Carrossel horizontal com scroll nativo. Use maxCards={6} na seção de bonés para evitar travamento.
 */
export default function InfiniteProductSlider({
  products,
  maxCards = 12,
}: InfiniteProductSliderProps) {
  const list = React.useMemo(() => {
    if (products.length === 0) return []
    const base = products.slice(0, 6)
    if (maxCards === 6) return base
    if (base.length <= 2) return [...base, ...base, ...base]
    if (base.length <= 4) return [...base, ...base, ...base].slice(0, MAX_CARDS)
    return [...base, ...base].slice(0, MAX_CARDS)
  }, [products, maxCards])

  if (products.length === 0) {
    return null
  }

  return (
    <div
      className="w-[100vw] relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-x-auto overflow-y-hidden hide-scrollbar touch-pan-x"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="flex flex-nowrap gap-4 py-2 pl-4 pr-4">
        {list.map((product, index) => (
          <div
            key={`${product.id}-${index}`}
            className="flex-shrink-0 w-[280px] sm:w-[300px] [content-visibility:auto]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}
