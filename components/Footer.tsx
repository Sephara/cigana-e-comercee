import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gold-500/20 mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-gold-400 text-xl font-bold mb-4">CIGANA</h3>
            <p className="text-gray-400">
              Luxury Style - Produtos de alta qualidade para você.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-gold-400">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/produtos"
                  className="text-gray-400 hover:text-gold-400"
                >
                  Produtos
                </Link>
              </li>
              <li>
                <Link
                  href="/carrinho"
                  className="text-gray-400 hover:text-gold-400"
                >
                  Carrinho
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <p className="text-gray-400">Email: contato@cigana.com</p>
            <p className="text-gray-400">Telefone: (00) 0000-0000</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gold-500/20 text-center text-gray-400">
          <p>&copy; 2024 Cigana Luxury Style. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}





