import { NextRequest, NextResponse } from 'next/server'

const TOKEN_BASE = 'https://api.correios.com.br/token'
const PRECO_BASE = 'https://api.correios.com.br/preco/v1'
const PRAZO_BASE = 'https://api.correios.com.br/prazo'

const SERVICOS = [
  { coProduto: '03298', nome: 'Pac' },
  { coProduto: '03220', nome: 'Sedex' },
] as const

type TokenCache = { token: string; expiraEm: string }

let tokenCache: TokenCache | null = null

function getBasicAuth(): string {
  const user = process.env.CORREIOS_USER
  const pass = process.env.CORREIOS_PASSWORD
  if (!user || !pass) throw new Error('CORREIOS_USER ou CORREIOS_PASSWORD não configurados')
  return Buffer.from(`${user}:${pass}`, 'utf8').toString('base64')
}

async function getToken(): Promise<string> {
  const now = new Date()
  const marginMs = 30 * 60 * 1000
  if (tokenCache && new Date(tokenCache.expiraEm).getTime() - marginMs > now.getTime()) {
    return tokenCache.token
  }

  const cartao = process.env.CORREIOS_CARTAO
  const contrato = process.env.CORREIOS_CONTRATO
  const dr = process.env.CORREIOS_DR ? parseInt(process.env.CORREIOS_DR, 10) : undefined
  if (!cartao || !contrato) throw new Error('CORREIOS_CARTAO ou CORREIOS_CONTRATO não configurados')

  const url = `${TOKEN_BASE}/v1/autentica/cartaopostagem`
  // URI final: https://api.correios.com.br/token/v1/autentica/cartaopostagem
  const body = JSON.stringify({
    numero: cartao,
    contrato,
    ...(dr !== undefined && !isNaN(dr) && { dr }),
  })
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Basic ${getBasicAuth()}`,
    },
    body,
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Token Correios: ${res.status} ${errText}`)
  }
  const data = (await res.json()) as { token?: string; expiraEm?: string }
  if (!data.token) throw new Error('Resposta da API Token sem campo token')
  tokenCache = { token: data.token, expiraEm: data.expiraEm || '' }
  return data.token
}

export async function GET(request: NextRequest) {
  try {
    const cepOrigem = process.env.CEP_ORIGEM?.replace(/\D/g, '')
    const cepDestino = request.nextUrl.searchParams.get('cep')?.replace(/\D/g, '')
    const pesoParam = request.nextUrl.searchParams.get('peso')
    const peso = pesoParam ? Math.max(1, parseInt(pesoParam, 10)) : parseInt(process.env.PESO_PADRAO_GRAMAS || '500', 10)

    if (!cepOrigem || cepOrigem.length !== 8) {
      return NextResponse.json(
        { error: 'CEP_ORIGEM não configurado ou inválido (8 dígitos)' },
        { status: 500 }
      )
    }
    if (!cepDestino || cepDestino.length !== 8) {
      return NextResponse.json(
        { error: 'Informe o parâmetro cep (8 dígitos)' },
        { status: 400 }
      )
    }

    const token = await getToken()
    const opcoes: { nome: string; valor: number; prazo: number; dataMaxima: string | null }[] = []

    for (const svc of SERVICOS) {
      let valor: number | null = null
      let prazo: number | null = null
      let dataMaxima: string | null = null

      try {
        const precoUrl = `${PRECO_BASE}/nacional/${svc.coProduto}?cepOrigem=${cepOrigem}&cepDestino=${cepDestino}&psObjeto=${peso}&tpObjeto=2&comprimento=20&largura=20&altura=20`
        const precoRes = await fetch(precoUrl, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        })
        if (precoRes.ok) {
          const precoData = (await precoRes.json()) as { pcFinal?: string; txErro?: string }
          if (precoData.pcFinal && !precoData.txErro) {
            valor = parseFloat(precoData.pcFinal.replace(',', '.')) || 0
          }
        }
      } catch {
        // ignora
      }

      try {
        const prazoUrl = `${PRAZO_BASE}/v1/nacional/${svc.coProduto}?cepOrigem=${cepOrigem}&cepDestino=${cepDestino}`
        const prazoRes = await fetch(prazoUrl, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        })
        if (prazoRes.ok) {
          const prazoData = (await prazoRes.json()) as {
            prazoEntrega?: number | string
            dataMaxima?: string
            txErro?: string
          }
          if (prazoData.prazoEntrega != null && prazoData.prazoEntrega !== '' && !prazoData.txErro) {
            const p = Number(prazoData.prazoEntrega)
            if (!Number.isNaN(p)) prazo = p
            dataMaxima = prazoData.dataMaxima || null
          }
        }
      } catch {
        // ignora
      }

      if (valor != null || prazo != null) {
        opcoes.push({
          nome: svc.nome,
          valor: valor ?? 0,
          prazo: prazo ?? 0,
          dataMaxima,
        })
      }
    }

    return NextResponse.json({ opcoes })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erro ao calcular frete'
    console.error('[API frete]', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
