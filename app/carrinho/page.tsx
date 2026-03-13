'use client'

import { useCart } from '@/lib/cart'
import Header from '@/components/Header'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle, Loader2, Truck } from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'

const PAYMENT_TYPES = [
  { value: 'pix', label: 'PIX' },
  { value: 'cartao_credito', label: 'Cartão de crédito' },
  { value: 'cartao_debito', label: 'Cartão de débito' },
  { value: 'transferencia', label: 'Transferência bancária' },
] as const

interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

interface FreteOpcao {
  nome: string
  valor: number
  prazo: number
  dataMaxima: string | null
}

function CartContent() {
  const { cart, updateQuantity, removeFromCart, total, clearCart } = useCart()
  const [loadingCep, setLoadingCep] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    zipCode: '',
    address: '',
    addressNumber: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    paymentType: '' as string,
  })
  const [loading, setLoading] = useState(false)
  const [freteOpcoes, setFreteOpcoes] = useState<FreteOpcao[]>([])
  const [freteLoading, setFreteLoading] = useState(false)
  const [freteSelecionado, setFreteSelecionado] = useState<FreteOpcao | null>(null)

  const fetchCep = useCallback(async (cep: string) => {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) return
    setLoadingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data: ViaCepResponse = await res.json()
      if (data.erro) {
        toast.error('CEP não encontrado.')
        return
      }
      setFormData((prev) => ({
        ...prev,
        address: data.logradouro || prev.address,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
      }))
      toast.success('Endereço preenchido! Confira e informe o número.')
    } catch {
      toast.error('Erro ao buscar CEP. Tente novamente.')
    } finally {
      setLoadingCep(false)
    }
  }, [])

  const handleCepBlur = () => {
    const digits = formData.zipCode.replace(/\D/g, '')
    if (digits.length === 8) fetchCep(formData.zipCode)
  }

  useEffect(() => {
    const cep = formData.zipCode.replace(/\D/g, '')
    if (cep.length !== 8) {
      setFreteOpcoes([])
      setFreteSelecionado(null)
      return
    }
    let cancelled = false
    setFreteLoading(true)
    setFreteSelecionado(null)
    fetch(`/api/frete?cep=${cep}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (cancelled) return
        if (!res.ok || data.error) {
          const msg = data.error || `Erro ${res.status} ao calcular frete`
          toast.error(msg)
          setFreteOpcoes([])
          return
        }
        setFreteOpcoes(data.opcoes || [])
        if (data.opcoes?.length) {
          setFreteSelecionado(data.opcoes[0])
        }
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err?.message || 'Erro ao buscar frete.')
          setFreteOpcoes([])
        }
      })
      .finally(() => {
        if (!cancelled) setFreteLoading(false)
      })
    return () => { cancelled = true }
  }, [formData.zipCode])

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-24 h-24 mx-auto text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-4 text-white">
          Seu carrinho está vazio
        </h2>
        <p className="text-gray-400 mb-8">
          Adicione produtos ao carrinho para continuar.
        </p>
        <Link
          href="/produtos"
          className="inline-block btn-gold-laminated text-black px-8 py-3 rounded-2xl font-semibold"
        >
          Ver Produtos
        </Link>
      </div>
    )
  }

  const totalComFrete = total + (freteSelecionado?.valor ?? 0)

  const buildWhatsAppMessage = () => {
    const fullAddress = [
      formData.address,
      formData.addressNumber && `nº ${formData.addressNumber}`,
      formData.complement && formData.complement,
      formData.neighborhood && formData.neighborhood,
      formData.city && formData.state ? `${formData.city}/${formData.state}` : formData.city || formData.state,
      formData.zipCode && `CEP ${formData.zipCode.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2')}`,
    ]
      .filter(Boolean)
      .join(', ')
    const paymentLabel = PAYMENT_TYPES.find((p) => p.value === formData.paymentType)?.label || formData.paymentType
    const lines = [
      'Olá! Gostaria de finalizar meu pedido.',
      '',
      '*Meus dados:*',
      `Nome: ${formData.name}`,
      `Email: ${formData.email}`,
      `Telefone: ${formData.phone}`,
      `Endereço: ${fullAddress}`,
      `Forma de pagamento: ${paymentLabel}`,
      '',
      '*Pedido:*',
      ...cart.map(
        (item) =>
          `• ${item.name} x ${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}`
      ),
      '',
    ]
    if (freteSelecionado) {
      lines.push(`*Frete (${freteSelecionado.nome}):* R$ ${freteSelecionado.valor.toFixed(2).replace('.', ',')} - ${freteSelecionado.prazo} dia(s) útil(eis)`, '')
    }
    lines.push(`*Total: R$ ${totalComFrete.toFixed(2).replace('.', ',')}*`)
    return lines.join('\n')
  }

  const handleSendToWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.addressNumber ||
      !formData.neighborhood ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode ||
      !formData.paymentType
    ) {
      toast.error('Preencha todos os dados para continuar.')
      return
    }
    if (formData.zipCode.replace(/\D/g, '').length === 8 && freteOpcoes.length > 0 && !freteSelecionado) {
      toast.error('Selecione uma opção de frete.')
      return
    }

    setLoading(true)
    try {
      const text = encodeURIComponent(buildWhatsAppMessage())
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
      window.open(url, '_blank')
      toast.success('Você será redirecionado para o WhatsApp para finalizar e pagar.')
    } catch {
      // Erro já tratado no auth
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gold-400">Carrinho</h1>
        <button
          onClick={clearCart}
          className="text-gray-400 hover:text-red-400 transition-colors"
        >
          Limpar carrinho
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {cart.map((item) => (
          <div
            key={item.id}
            className="bg-black border border-gold-500/20 rounded-lg p-4 flex flex-col md:flex-row gap-4"
          >
            <div className="relative w-full md:w-32 h-32 flex-shrink-0">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="flex-grow">
              <h3 className="text-white font-semibold text-lg mb-2">
                {item.name}
              </h3>
              <p className="text-gold-400 font-bold text-xl mb-4">
                R$ {item.price.toFixed(2).replace('.', ',')}
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="bg-gold-400/20 text-gold-400 p-2 rounded hover:bg-gold-400/30 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-white font-semibold w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="bg-gold-400/20 text-gold-400 p-2 rounded hover:bg-gold-400/30 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-400 hover:text-red-500 transition-colors ml-4"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gold-400 font-bold text-xl">
                R${' '}
                {(item.price * item.quantity)
                  .toFixed(2)
                  .replace('.', ',')}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendToWhatsApp} className="space-y-6">
        <div className="bg-black border border-gold-500/20 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-white">
            Seus dados para entrega e contato
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Preencha abaixo. Você será enviado ao WhatsApp com o resumo do pedido para finalizar e pagar por lá.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Nome completo</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-400"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-400"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Telefone (WhatsApp)</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="(11) 99999-9999"
                className="w-full bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-400"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">CEP</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.zipCode}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '')
                    const formatted = v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5, 8)}` : v
                    setFormData({ ...formData, zipCode: formatted })
                  }}
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  maxLength={9}
                  className="flex-1 bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-400"
                />
                <button
                  type="button"
                  onClick={() => fetchCep(formData.zipCode)}
                  disabled={loadingCep || formData.zipCode.replace(/\D/g, '').length !== 8}
                  className="px-4 py-2 rounded-lg bg-gold-400/20 text-gold-400 font-medium hover:bg-gold-400/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 whitespace-nowrap"
                >
                  {loadingCep ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-1">Digite o CEP e clique em Buscar para preencher o endereço</p>
            </div>

            {formData.zipCode.replace(/\D/g, '').length === 8 && (
              <div className="md:col-span-2 mt-2 p-4 rounded-lg bg-gold-500/5 border border-gold-500/20">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-gold-400" />
                  Frete (Correios)
                </h3>
                {freteLoading ? (
                  <p className="text-gray-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calculando...
                  </p>
                ) : freteOpcoes.length === 0 ? (
                  <p className="text-gray-400">Nenhuma opção disponível para este CEP.</p>
                ) : (
                  <div className="space-y-2">
                    {freteOpcoes.map((op) => (
                      <label
                        key={op.nome}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                          freteSelecionado?.nome === op.nome
                            ? 'border-gold-400 bg-gold-400/10'
                            : 'border-gold-500/20 hover:border-gold-500/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="frete"
                          checked={freteSelecionado?.nome === op.nome}
                          onChange={() => setFreteSelecionado(op)}
                          className="sr-only"
                        />
                        <span className="text-white font-medium">{op.nome}</span>
                        <span className="text-gold-400">
                          R$ {op.valor.toFixed(2).replace('.', ',')} — {op.prazo} dia(s) útil(eis)
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  Cálculo de frete pelos{' '}
                  <a
                    href="https://www.correios.com.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-400 hover:underline"
                  >
                    Correios
                  </a>
                  .
                </p>
              </div>
            )}

            <div>
              <label className="block text-gray-300 mb-2">Endereço (rua, avenida)</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Preenchido pelo CEP ou digite"
                className="w-full bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-400"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Número</label>
              <input
                type="text"
                required
                value={formData.addressNumber}
                onChange={(e) =>
                  setFormData({ ...formData, addressNumber: e.target.value })
                }
                placeholder="Nº"
                className="w-full bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-400"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Complemento</label>
              <input
                type="text"
                value={formData.complement}
                onChange={(e) =>
                  setFormData({ ...formData, complement: e.target.value })
                }
                placeholder="Apto, bloco, etc. (opcional)"
                className="w-full bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-400"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Bairro</label>
              <input
                type="text"
                required
                value={formData.neighborhood}
                onChange={(e) =>
                  setFormData({ ...formData, neighborhood: e.target.value })
                }
                placeholder="Preenchido pelo CEP ou digite"
                className="w-full bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-400"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Cidade</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="Preenchido pelo CEP ou digite"
                className="w-full bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-400"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Estado (UF)</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value.toUpperCase().slice(0, 2) })
                }
                placeholder="SP"
                maxLength={2}
                className="w-full bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-400"
              />
            </div>
          </div>

            <div className="mt-4 pt-4 border-t border-gold-500/20">
              <label className="block text-gray-300 mb-2">Tipo de pagamento</label>
              <select
                required
                value={formData.paymentType}
                onChange={(e) =>
                  setFormData({ ...formData, paymentType: e.target.value })
                }
                className="w-full max-w-xs bg-black border border-gold-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-400"
              >
                <option value="">Selecione...</option>
                {PAYMENT_TYPES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
        </div>

        <div className="bg-black border border-gold-500/20 rounded-lg p-6">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-300">
              <span>Subtotal:</span>
              <span>R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            {freteSelecionado && (
              <div className="flex justify-between text-gray-300">
                <span>Frete ({freteSelecionado.nome}):</span>
                <span>R$ {freteSelecionado.valor.toFixed(2).replace('.', ',')}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gold-500/20">
              <span className="text-white text-xl font-semibold">Total:</span>
              <span className="text-gold-400 text-3xl font-bold">
                R$ {totalComFrete.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gold-laminated text-black py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            <MessageCircle className="w-6 h-6" />
            {loading ? 'Aguarde...' : 'Finalizar pelo WhatsApp'}
          </button>
          <p className="text-gray-400 text-sm mt-3 text-center">
            Você será redirecionado ao WhatsApp com seu pedido. O pagamento e a confirmação serão feitos por lá.
          </p>
        </div>
      </form>
    </div>
  )
}

export default function Carrinho() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <CartContent />
      </main>
    </div>
  )
}
