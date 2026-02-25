'use client'

import Image from 'next/image'

interface BentoGalleryProps {
  images: string[]
}

/**
 * Grid estático de imagens — sem animação/GSAP para evitar travamentos e facilitar deploy.
 */
export default function BentoGallery({ images }: BentoGalleryProps) {
  const displayImages = images.slice(0, 8)
  const filled = [...displayImages]
  while (filled.length < 8 && images.length > 0) {
    filled.push(...images.slice(0, 8 - filled.length))
  }

  if (filled.length === 0) {
    return null
  }

  return (
    <div className="gallery-wrap">
      <div className="gallery gallery--bento" id="gallery-8">
        {filled.map((src, index) => (
          <div key={index} className="gallery__item">
            <Image
              src={src}
              alt={`Produto ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 33vw"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
