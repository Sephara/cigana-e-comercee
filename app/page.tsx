'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import InfiniteProductSlider from '@/components/InfiniteProductSlider'
import BentoGallery from '@/components/BentoGallery'
import AnimatedBackground from '@/components/AnimatedBackground'
import { useProductsList } from '@/lib/products-context'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  const {
    getFeaturedProducts,
    getBonesProducts,
    getConjuntosKitProducts,
    loading,
  } = useProductsList()

  const [galleryImages, setGalleryImages] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/gallery', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const urls = data
            .map((i: { url?: string }) => i.url)
            .filter((u): u is string => typeof u === 'string' && u.length > 0)
          setGalleryImages(urls)
        }
      })
      .catch(() => setGalleryImages([]))
  }, [])

  const featuredProducts = getFeaturedProducts()
  const bonesProducts = getBonesProducts()
  const conjuntosKitProducts = getConjuntosKitProducts()
  const hasAnyProducts =
    featuredProducts.length > 0 ||
    bonesProducts.length > 0 ||
    conjuntosKitProducts.length > 0

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section — sem animações para evitar travamento no mobile */}
        <section className="relative min-h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden px-4 py-8 md:py-12">
          <AnimatedBackground />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-0" />
          <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-6 md:gap-8 lg:gap-12">
            <div className="flex-shrink-0">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-[28rem] md:h-[28rem]">
                <Image
                  src="/LOGO ( CIGANA LUXURY STYLE ).png"
                  alt="Cigana Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div className="flex flex-col items-center lg:items-start gap-y-3 text-center lg:text-left">
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 leading-tight">
                Luxury Style - Elegância e Sofisticação
              </p>
              <Link
                href="/produtos"
                className="inline-flex items-center space-x-2 btn-gold-laminated text-black px-6 py-2.5 sm:px-8 sm:py-2 rounded-2xl text-base sm:text-lg font-semibold mt-1"
              >
                <span>Explorar Produtos</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Galeria — só aparece se houver imagens; atualiza ao mudar no admin */}
        <BentoGallery images={galleryImages} />

        {/* Produtos — só aparece se houver algum produto; seção limpa quando vazio */}
        {hasAnyProducts && (
          <section className="relative">
            <div className="container mx-auto px-4 py-8 sm:py-10 md:py-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-12 text-gold-400">
                Produtos em Destaque
              </h2>

              {featuredProducts.length > 0 && (
                <div className="mb-10 sm:mb-12 md:mb-16">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-4 md:mb-6 text-center">
                    Destaques
                  </h3>
                  {loading ? (
                    <p className="text-center text-gray-400 py-6 sm:py-8">Carregando...</p>
                  ) : (
                    <InfiniteProductSlider products={featuredProducts} />
                  )}
                </div>
              )}

              {bonesProducts.length > 0 && (
                <div className="mb-10 sm:mb-12 md:mb-16">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-4 md:mb-6 text-center">
                    Bonés
                  </h3>
                  {loading ? (
                    <p className="text-center text-gray-400 py-6 sm:py-8">Carregando...</p>
                  ) : (
                    <InfiniteProductSlider products={bonesProducts.slice(0, 6)} maxCards={6} />
                  )}
                </div>
              )}

              {conjuntosKitProducts.length > 0 && (
                <div className="mb-10 sm:mb-12 md:mb-16">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-4 md:mb-6 text-center">
                    Conjuntos e Kits
                  </h3>
                  {loading ? (
                    <p className="text-center text-gray-400 py-6 sm:py-8">Carregando...</p>
                  ) : (
                    <InfiniteProductSlider products={conjuntosKitProducts} />
                  )}
                </div>
              )}

              <div className="text-center pb-8 sm:pb-10 md:pb-12">
                <Link
                  href="/produtos"
                  className="inline-block btn-gold-laminated text-black px-6 py-2.5 sm:px-8 sm:py-3 rounded-2xl font-semibold text-sm sm:text-base"
                >
                  Ver Todos os Produtos
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* About Section */}
        <section className="bg-black/50 py-10 sm:py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-gold-400">
              Sobre a Cigana
            </h2>
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
              Somos uma marca dedicada a oferecer produtos de luxo com
              qualidade excepcional. Cada peça é cuidadosamente selecionada
              para proporcionar elegância e sofisticação aos nossos clientes.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

