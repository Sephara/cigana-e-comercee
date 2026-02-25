'use client'

import React, { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showFab, setShowFab] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    setIsStandalone(standalone)

    if (standalone) return

    const ua = window.navigator.userAgent
    const ios = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document)
    setIsIOS(!!ios)

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    if (isMobile) {
      setShowFab(true)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setShowPopup(false)
      setDeferredPrompt(null)
    }
    setShowPopup(false)
  }

  if (!showFab || isStandalone) return null

  return (
    <>
      {/* Botão flutuante */}
      <button
        type="button"
        onClick={() => setShowPopup(true)}
        className="md:hidden fixed bottom-24 right-4 z-[60] w-14 h-14 rounded-full btn-gold-laminated shadow-lg border-2 border-black/20 flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform"
        aria-label="Baixar app"
      >
        <Download className="w-7 h-7" />
      </button>

      {/* Popup com instruções */}
      {showPopup && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[100] md:hidden"
            onClick={() => setShowPopup(false)}
            aria-hidden
          />
          <div className="fixed left-4 right-4 top-1/2 -translate-y-1/2 z-[101] md:hidden">
            <div className="bg-black border border-gold-500/40 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between p-4 border-b border-gold-500/20">
                <p className="text-white font-semibold text-lg">Baixar app Cigana</p>
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="p-2 text-gray-500 hover:text-white rounded-full"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto">
                {isIOS ? (
                  <div className="text-gray-300 text-sm space-y-3">
                    <p>No iPhone ou iPad (Safari):</p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-400">
                      <li>Toque no ícone <strong className="text-gold-400">Compartilhar</strong> (quadrado com seta para cima) na barra do navegador.</li>
                      <li>Role e toque em <strong className="text-gold-400">Adicionar à Tela de Início</strong>.</li>
                      <li>Toque em <strong className="text-gold-400">Adicionar</strong> no canto superior direito.</li>
                    </ol>
                  </div>
                ) : deferredPrompt ? (
                  <div className="space-y-4">
                    <p className="text-gray-400 text-sm">
                      Instale o app para acessar mais rápido pela tela inicial.
                    </p>
                    <button
                      type="button"
                      onClick={handleInstall}
                      className="w-full btn-gold-laminated text-black py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Baixar agora
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-300 text-sm space-y-3">
                    <p>No Android (Chrome):</p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-400">
                      <li>Toque no menu do Chrome (três pontinhos <strong className="text-gold-400">⋮</strong> no canto superior direito).</li>
                      <li>Toque em <strong className="text-gold-400">Adicionar à tela inicial</strong> ou <strong className="text-gold-400">Instalar app</strong>.</li>
                      <li>Confirme em <strong className="text-gold-400">Instalar</strong> ou <strong className="text-gold-400">Adicionar</strong>.</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
