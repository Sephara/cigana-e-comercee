export interface ProductCombo {
  name: string
  price: number
}

export interface Product {
  id: string
  name: string
  price: number
  image: string
  images?: string[]
  description?: string
  fullDescription?: string
  originalPrice?: number
  combos?: ProductCombo[]
  stock?: number
}


export const allProducts: Product[] = [
  {
    id: '1',
    name: 'Produto Exclusivo 1',
    price: 299.90,
    image: '/IMG_0493.jpg',
    images: ['/IMG_0493.jpg', '/IMG_0494.jpg', '/IMG_0513.jpg'],
    description: 'Produto de luxo exclusivo',
    fullDescription: 'Este produto exclusivo combina elegância e sofisticação em cada detalhe. Fabricado com materiais de alta qualidade, oferece durabilidade e estilo incomparáveis. Perfeito para quem busca exclusividade e refinamento.',
  },
  {
    id: '2',
    name: 'Produto Exclusivo 2',
    price: 399.90,
    image: '/IMG_0494.jpg',
    images: ['/IMG_0494.jpg', '/IMG_0514.jpg', '/IMG_0526.jpg'],
    description: 'Produto de luxo exclusivo',
    fullDescription: 'Design único que reflete personalidade e bom gosto. Cada peça é cuidadosamente selecionada para garantir a máxima qualidade e satisfação. Um investimento em estilo e elegância.',
  },
  {
    id: '3',
    name: 'Produto Exclusivo 3',
    price: 499.90,
    image: '/IMG_0513.jpg',
    images: ['/IMG_0513.jpg', '/IMG_0528.jpg', '/IMG_0535.jpg'],
    description: 'Produto de luxo exclusivo',
    fullDescription: 'Sofisticação e luxo em um único produto. Criado para clientes que valorizam qualidade superior e design diferenciado. Uma escolha perfeita para momentos especiais.',
  },
  {
    id: '4',
    name: 'Produto Exclusivo 4',
    price: 349.90,
    image: '/IMG_0514.jpg',
    images: ['/IMG_0514.jpg', '/IMG_0539.jpg', '/IMG_0543.jpg'],
    description: 'Produto de luxo exclusivo',
    fullDescription: 'Elegância atemporal com toque moderno. Este produto representa o melhor em qualidade e estilo, ideal para quem busca peças únicas e exclusivas.',
  },
  {
    id: '5',
    name: 'Produto Exclusivo 5',
    price: 449.90,
    image: '/IMG_0526.jpg',
    images: ['/IMG_0526.jpg', '/IMG_0551.jpg', '/IMG_0556.jpg'],
    description: 'Produto de luxo exclusivo',
    fullDescription: 'Combinação perfeita entre tradição e inovação. Fabricado com atenção aos mínimos detalhes, este produto é sinônimo de excelência e refinamento.',
  },
  {
    id: '6',
    name: 'Produto Exclusivo 6',
    price: 379.90,
    image: '/IMG_0528.jpg',
    images: ['/IMG_0528.jpg', '/IMG_0559.jpg', '/IMG_0567.jpg'],
    description: 'Produto de luxo exclusivo',
    fullDescription: 'Design exclusivo que se destaca pela qualidade e elegância. Perfeito para quem aprecia produtos únicos e sofisticados.',
  },
  {
    id: '7',
    name: 'Produto Exclusivo 7',
    price: 429.90,
    image: '/IMG_0535.jpg',
    images: ['/IMG_0535.jpg', '/IMG_0568.jpg', '/Traiass (7).png'],
    description: 'Produto de luxo exclusivo',
    fullDescription: 'Luxo e sofisticação em cada detalhe. Este produto foi criado para clientes exigentes que buscam o melhor em qualidade e design.',
  },
  {
    id: '8',
    name: 'Produto Exclusivo 8',
    price: 329.90,
    image: '/IMG_0539.jpg',
    images: ['/IMG_0539.jpg', '/Traiass (13).png', '/IMG_0493.jpg'],
    description: 'Produto de luxo exclusivo',
    fullDescription: 'Elegância refinada com toque contemporâneo. Um produto que combina tradição e modernidade, criado para momentos especiais.',
  },
  {
    id: '9',
    name: 'Produto Exclusivo 9',
    price: 459.90,
    image: '/IMG_0543.jpg',
    images: ['/IMG_0543.jpg', '/IMG_0494.jpg', '/IMG_0513.jpg'],
    description: 'Produto de luxo exclusivo',
    fullDescription: 'Exclusividade e qualidade em um único produto. Fabricado com os melhores materiais, oferece durabilidade e estilo incomparáveis.',
  },
  {
    id: '10',
    name: 'Produto Exclusivo 10',
    price: 389.90,
    image: '/IMG_0551.jpg',
    images: ['/IMG_0551.jpg', '/IMG_0514.jpg', '/IMG_0526.jpg'],
    description: 'Produto de luxo exclusivo',
    fullDescription: 'Sofisticação e luxo em cada detalhe. Este produto representa o melhor em qualidade e estilo, ideal para quem busca peças únicas.',
  },
  {
    id: '11',
    name: 'Produto Exclusivo 11',
    price: 419.90,
    image: '/IMG_0556.jpg',
    images: ['/IMG_0556.jpg', '/IMG_0528.jpg', '/IMG_0535.jpg'],
    description: 'Produto de luxo exclusivo',
    fullDescription: 'Design único que reflete personalidade e bom gosto. Cada peça é cuidadosamente selecionada para garantir a máxima qualidade.',
  },
  {
    id: '12',
    name: 'Produto Exclusivo 12',
    price: 339.90,
    image: '/IMG_0559.jpg',
    images: ['/IMG_0559.jpg', '/IMG_0539.jpg', '/IMG_0543.jpg'],
    description: 'Produto de luxo exclusivo',
    fullDescription: 'Elegância atemporal com toque moderno. Este produto representa o melhor em qualidade e estilo, ideal para momentos especiais.',
  },
  {
    id: '13',
    name: 'Produto Exclusivo 13',
    price: 469.90,
    image: '/IMG_0567.jpg',
    images: ['/IMG_0567.jpg', '/IMG_0551.jpg', '/IMG_0556.jpg'],
    description: 'Produto de luxo exclusivo',
    fullDescription: 'Combinação perfeita entre tradição e inovação. Fabricado com atenção aos mínimos detalhes, sinônimo de excelência.',
  },
  {
    id: '14',
    name: 'Produto Exclusivo 14',
    price: 399.90,
    image: '/IMG_0568.jpg',
    images: ['/IMG_0568.jpg', '/IMG_0559.jpg', '/IMG_0567.jpg'],
    description: 'Produto de luxo exclusivo',
    fullDescription: 'Design exclusivo que se destaca pela qualidade e elegância. Perfeito para quem aprecia produtos únicos e sofisticados.',
  },
  {
    id: '15',
    name: 'Conjunto de Rédeas Premium',
    price: 119.90,
    originalPrice: 149.80,
    image: '/Traiass (7).png',
    images: ['/Traiass (7).png', '/Traiass (13).png', '/IMG_0493.jpg'],
    description: 'Conjunto de rédeas em promoção — de R$ 149,80 por R$ 119,90',
    fullDescription: 'Rédeas de altíssima qualidade para quem exige o melhor. Confeccionadas com materiais nobres, oferecem durabilidade e conforto incomparáveis. Design elegante que combina tradição equestre com sofisticação contemporânea.',
  },
  {
    id: '16',
    name: 'Conjunto de Rédeas Luxo',
    price: 119.90,
    originalPrice: 149.80,
    image: '/Traiass (13).png',
    images: ['/Traiass (13).png', '/IMG_0494.jpg', '/IMG_0513.jpg'],
    description: 'Conjunto de rédeas em promoção — de R$ 149,80 por R$ 119,90',
    fullDescription: 'Rédeas exclusivas que refletem personalidade e bom gosto. Cada peça é cuidadosamente fabricada para garantir resistência e estilo. Perfeitas para apresentações e uso no dia a dia.',
  },
  // Bones Simples - R$ 39,90
  {
    id: '17',
    name: 'Boné Simples 1',
    price: 39.90,
    image: '/bones/Simples1.jpg',
    images: ['/bones/Simples1.jpg'],
    description: 'Estilo e versatilidade por um preço acessível',
    fullDescription: 'Boné Cigana com design limpo e atemporal. Confeccionado com materiais resistentes, é a escolha perfeita para o dia a dia. Leve, confortável e com a qualidade que só a Cigana oferece.',
  },
  {
    id: '18',
    name: 'Boné Simples 2',
    price: 39.90,
    image: '/bones/Simples2.jpg',
    images: ['/bones/Simples2.jpg'],
    description: 'Estilo e versatilidade por um preço acessível',
    fullDescription: 'Boné Cigana com design limpo e atemporal. Confeccionado com materiais resistentes, é a escolha perfeita para o dia a dia. Leve, confortável e com a qualidade que só a Cigana oferece.',
  },
  {
    id: '19',
    name: 'Boné Simples 3',
    price: 39.90,
    image: '/bones/Simples3.jpg',
    images: ['/bones/Simples3.jpg'],
    description: 'Estilo e versatilidade por um preço acessível',
    fullDescription: 'Boné Cigana com design limpo e atemporal. Confeccionado com materiais resistentes, é a escolha perfeita para o dia a dia. Leve, confortável e com a qualidade que só a Cigana oferece.',
  },
  {
    id: '20',
    name: 'Boné Simples 4',
    price: 39.90,
    image: '/bones/Simples4.jpg',
    images: ['/bones/Simples4.jpg'],
    description: 'Estilo e versatilidade por um preço acessível',
    fullDescription: 'Boné Cigana com design limpo e atemporal. Confeccionado com materiais resistentes, é a escolha perfeita para o dia a dia. Leve, confortável e com a qualidade que só a Cigana oferece.',
  },
  {
    id: '21',
    name: 'Boné Simples 5',
    price: 39.90,
    image: '/bones/simples5.jpg',
    images: ['/bones/simples5.jpg'],
    description: 'Estilo e versatilidade por um preço acessível',
    fullDescription: 'Boné Cigana com design limpo e atemporal. Confeccionado com materiais resistentes, é a escolha perfeita para o dia a dia. Leve, confortável e com a qualidade que só a Cigana oferece.',
  },
  // Bones Premium - R$ 59,90
  {
    id: '22',
    name: 'Boné Premium 1',
    price: 59.90,
    image: '/bones/premiun1.jpg',
    images: ['/bones/premiun1.jpg'],
    description: 'Acabamento premium com materiais de primeira',
    fullDescription: 'Boné Premium Cigana — onde luxo encontra funcionalidade. Detalhes exclusivos, tecidos selecionados e acabamento impecável. Para quem não abre mão da sofisticação.',
  },
  {
    id: '23',
    name: 'Boné Premium 2',
    price: 59.90,
    image: '/bones/Premiun2.jpg',
    images: ['/bones/Premiun2.jpg'],
    description: 'Acabamento premium com materiais de primeira',
    fullDescription: 'Boné Premium Cigana — onde luxo encontra funcionalidade. Detalhes exclusivos, tecidos selecionados e acabamento impecável. Para quem não abre mão da sofisticação.',
  },
  {
    id: '24',
    name: 'Boné Premium 3',
    price: 59.90,
    image: '/bones/Premiun3.jpg',
    images: ['/bones/Premiun3.jpg'],
    description: 'Acabamento premium com materiais de primeira',
    fullDescription: 'Boné Premium Cigana — onde luxo encontra funcionalidade. Detalhes exclusivos, tecidos selecionados e acabamento impecável. Para quem não abre mão da sofisticação.',
  },
  {
    id: '25',
    name: 'Boné Premium 4',
    price: 59.90,
    image: '/bones/Premiun4.jpg',
    images: ['/bones/Premiun4.jpg'],
    description: 'Acabamento premium com materiais de primeira',
    fullDescription: 'Boné Premium Cigana — onde luxo encontra funcionalidade. Detalhes exclusivos, tecidos selecionados e acabamento impecável. Para quem não abre mão da sofisticação.',
  },
  // Rédea, Cabeçada e Combos
  {
    id: '26',
    name: 'Rédea Cigana',
    price: 79.90,
    image: '/IMG_0526.jpg',
    images: ['/IMG_0526.jpg', '/IMG_0551.jpg', '/IMG_0556.jpg'],
    description: 'Rédea de alta performance e durabilidade',
    fullDescription: 'Rédea Cigana — qualidade superior para cavaleiros e amazonas exigentes. Design ergonômico, materiais nobres e acabamento refinado. Resistente ao uso intenso sem perder a elegância.',
  },
  {
    id: '27',
    name: 'Cabeçada Cigana',
    price: 69.90,
    image: '/IMG_0528.jpg',
    images: ['/IMG_0528.jpg', '/IMG_0559.jpg', '/IMG_0567.jpg'],
    description: 'Cabeçada confortável com design exclusivo',
    fullDescription: 'Cabeçada Cigana — conforto e estilo para seu animal. Confeccionada com couro de primeira e ajustes precisos. Perfeita para treinos e apresentações.',
  },
  {
    id: '28',
    name: 'Conjunto Completão Cigana + Boné Simples',
    price: 159.90,
    originalPrice: 188.70,
    image: '/Traiass (7).png',
    images: ['/Traiass (7).png', '/bones/Simples1.jpg'],
    description: 'Kit: rédea + cabeçada + boné simples — de R$ 188,70 por R$ 159,90',
    fullDescription: 'Monte seu look completo com economia! O Conjunto Completão inclui rédea, cabeçada e boné simples. Tudo que você precisa com a qualidade Cigana em um único combo.',
    combos: [
      { name: 'Rédea', price: 79.9 },
      { name: 'Cabeçada', price: 69.9 },
      { name: 'Boné Simples', price: 39.9 },
    ],
  },
  {
    id: '29',
    name: 'Conjunto Completão Cigana + Boné Premium',
    price: 189.70,
    originalPrice: 209.70,
    image: '/Traiass (13).png',
    images: ['/Traiass (13).png', '/bones/premiun1.jpg'],
    description: 'Kit: rédea + cabeçada + boné premium — de R$ 209,70 por R$ 189,70',
    fullDescription: 'O melhor da Cigana em um só lugar! Rédea, cabeçada e boné premium — elegância total para quem busca o máximo em qualidade e sofisticação.',
    combos: [
      { name: 'Rédea', price: 79.9 },
      { name: 'Cabeçada', price: 69.9 },
      { name: 'Boné Premium', price: 59.9 },
    ],
  },
]

export function getProductById(id: string): Product | undefined {
  return allProducts.find((product) => product.id === id)
}

export function getFeaturedProducts(excludeId?: string): Product[] {
  return allProducts
    .filter((product) => product.id !== excludeId)
    .slice(0, 6)
}

export function getBonesProducts(): Product[] {
  return allProducts.filter(
    (p) => p.name.includes('Boné Simples') || p.name.includes('Boné Premium')
  )
}

export function getConjuntosKitProducts(): Product[] {
  return allProducts.filter(
    (p) =>
      p.name.includes('Conjunto') ||
      p.name.includes('Rédea') ||
      p.name.includes('Cabeçada')
  )
}
