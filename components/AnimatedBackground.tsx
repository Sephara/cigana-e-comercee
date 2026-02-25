'use client'

import Image from 'next/image'

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <Image
        src="/background.jpg"
        alt="Background"
        fill
        className="object-cover opacity-80"
        priority
        quality={90}
      />
      {/* Overlay dourado sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-gold-400/30 via-gold-400/10 to-gold-400/30 mix-blend-soft-light" />
      {/* Efeito de brilho dourado nas bordas */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-gold-400/5" />
      {/* Overlay preto para contraste */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  )
}
