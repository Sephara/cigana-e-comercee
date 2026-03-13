import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/auth'
import { CartProvider } from '@/lib/cart'
import { ProductsProvider } from '@/lib/products-context'
import MobileBottomNav from '@/components/MobileBottomNav'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import RegisterSW from '@/components/RegisterSW'
import ManifestLink from '@/components/ManifestLink'

export const metadata: Metadata = {
  title: 'Cigana Luxury Style',
  description: 'E-commerce de produtos de luxo',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cigana',
  },
  icons: {
    apple: '/LOGO ( CIGANA LUXURY STYLE ).png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#B8941E',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="pb-24 md:pb-0">
        <AuthProvider>
          <ProductsProvider>
            <CartProvider>
              <ManifestLink />
              <RegisterSW />
              {children}
              <MobileBottomNav />
              <PWAInstallPrompt />
              <Toaster position="top-right" />
            </CartProvider>
          </ProductsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

