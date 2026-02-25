# Revisão para deploy – Cigana

Resumo do que foi verificado e do que pode melhorar antes de colocar em produção.

---

## ✅ O que já está ok

- **Build**: `npm run build` conclui sem erros.
- **Variáveis de ambiente**: `env.example` documenta `DATABASE_URL`, `JWT_SECRET`, `ADMIN_*`, `NEXT_PUBLIC_WHATSAPP_NUMBER`.
- **Auth em produção**: Cookie com `secure: true` quando `NODE_ENV === 'production'`.
- **Admin**: Rotas protegidas por token e checagem de `role === 'admin'`.
- **APIs**: Uso de `credentials: 'include'` nas chamadas autenticadas.

---

## 🔧 Ajustes já feitos no código

1. **`.gitignore`**  
   `.env.example` foi removido do ignore para poder ser versionado e servir de referência no deploy.

2. **`lib/auth-server.ts`**  
   Em produção, se `JWT_SECRET` não estiver definido, a aplicação lança erro ao subir (evita usar chave padrão em produção).

3. **`next.config.js`**  
   `images.domains` (deprecated) foi trocado por `remotePatterns`, permitindo imagens de qualquer `https` e de `localhost` em desenvolvimento.

---

## 📋 Checklist antes do deploy

### 1. Variáveis no ambiente de produção

Configurar no painel da plataforma (Vercel, Railway, etc.):

| Variável | Obrigatório | Observação |
|----------|------------|------------|
| `DATABASE_URL` | Sim | URL do Postgres (ou Prisma Accelerate). |
| `JWT_SECRET` | Sim | String longa e aleatória (ex.: `openssl rand -base64 32`). |
| `ADMIN_EMAIL` | Não | Padrão: `admin@cigana.com`. |
| `ADMIN_PASSWORD` | Não | Padrão: `admin123` – **altere em produção**. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Não | Número com DDI (ex.: `5511999999999`). |

Não commitar `.env` ou `.env.local`; usar só as variáveis no painel do provedor.

### 2. Banco de dados

- Se usar **Prisma Accelerate**: `DATABASE_URL` deve ser a URL do Accelerate (o projeto já usa `accelerateUrl` em `lib/db.ts` e no seed).
- Se usar **Postgres “direto”**: trocar para `new PrismaClient()` (sem `accelerateUrl`) em `lib/db.ts` e no `prisma/seed.ts`, e usar a URL de conexão direta do banco.
- Após o primeiro deploy: rodar no ambiente de produção (ou em um job de build):
  - `npx prisma generate`
  - `npx prisma db push` (ou `prisma migrate deploy`, se passar a usar migrations).
- Criar admin e categorias: `npm run db:seed` (com as variáveis de produção carregadas, ou configurar um script/job que rode o seed uma vez).

### 3. Imagens de produtos

- Hoje está `unoptimized: true`; imagens são servidas sem otimização do Next.
- Se as imagens forem URLs externas (CDN, storage), o domínio deve estar em `remotePatterns` em `next.config.js` (já há um padrão `https` para qualquer host).
- Se forem arquivos em `/public`, não é necessário mudar nada além do que já está.

### 4. Prisma: migrations (recomendado para produção)

- O projeto usa apenas `prisma db push` (não há pasta `migrations`).
- Para deploy repetível e histórico de alterações, vale criar o primeiro migration e usar em produção:
  - `npx prisma migrate dev --name init` (local, com banco de dev).
  - No deploy/produção: `npx prisma migrate deploy` em vez de `db push`.

### 5. Senha do admin

- O seed usa `ADMIN_PASSWORD` ou `admin123`.
- Em produção, defina `ADMIN_PASSWORD` com uma senha forte e não use a padrão.

### 6. HTTPS e domínio

- Manter o site em HTTPS (a maioria dos hosts já faz).
- Cookie de auth já usa `secure: true` em produção.

### 7. README (opcional)

- Um `README.md` com:
  - requisitos (Node, Postgres ou Accelerate),
  - cópia das variáveis do `env.example`,
  - e passos para rodar local e para deploy (build, migrate/seed),
  facilita para você e para quem for fazer o deploy.

---

## Onde fazer deploy

- **Vercel**: Next.js é nativo; configurar `DATABASE_URL`, `JWT_SECRET` e demais env; no Build Command manter `next build`; no deploy, rodar `prisma generate` (e, se usar migrations, `prisma migrate deploy`) em um step de build ou em um job separado.
- **Railway / Render / Fly.io**: Definir as mesmas variáveis; usar `npm run build` e `npm run start`; rodar migrations/seed conforme a documentação de cada um.

Se disser em qual plataforma vai fazer o primeiro deploy (ex.: Vercel ou Railway), dá para detalhar os passos nela.
