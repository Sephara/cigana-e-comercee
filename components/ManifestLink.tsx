'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const MANIFEST_ID = 'app-manifest-link'

/**
 * Injeta o manifest correto conforme a rota:
 * - Em /admin (exceto login) usa manifest-admin.json (start_url: /admin) para "Adicionar à tela inicial" abrir o admin.
 * - No resto do site usa manifest.json (loja).
 */
export default function ManifestLink() {
  const pathname = usePathname()

  useEffect(() => {
    let link = document.getElementById(MANIFEST_ID) as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.id = MANIFEST_ID
      link.rel = 'manifest'
      document.head.appendChild(link)
    }
    const isAdmin = pathname?.startsWith('/admin') && pathname !== '/admin/login'
    link.href = isAdmin ? '/manifest-admin.json' : '/manifest.json'
  }, [pathname])

  return null
}
