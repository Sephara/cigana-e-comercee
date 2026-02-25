# Cigana Luxury Style - E-commerce

E-commerce moderno desenvolvido com Next.js, Firebase e TypeScript.

## 🚀 Funcionalidades

- ✅ Sistema de autenticação (cadastro e login)
- ✅ Catálogo de produtos com busca e filtros
- ✅ Carrinho de compras
- ✅ Checkout completo
- ✅ Design moderno com background preto e detalhes dourados
- ✅ Responsivo para mobile e desktop

## 📦 Instalação

1. Instale as dependências:
```bash
npm install --legacy-peer-deps
```

2. Configure o Firebase:
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Ative Authentication (Email/Password)
   - Ative Firestore Database
   - Copie as credenciais para `.env.local`

3. Crie o arquivo `.env.local` baseado em `.env.local.example`:
```bash
cp .env.local.example .env.local
```

4. Preencha as variáveis de ambiente no `.env.local` com suas credenciais do Firebase.

5. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

6. Acesse [http://localhost:3000](http://localhost:3000)

## 🎨 Estrutura do Projeto

- `app/` - Páginas e rotas do Next.js
- `components/` - Componentes reutilizáveis
- `lib/` - Configurações e contextos (Firebase, Auth, Cart)
- `public/` - Imagens e assets estáticos

## 📝 Páginas

- `/` - Home com produtos em destaque
- `/produtos` - Catálogo completo de produtos
- `/carrinho` - Carrinho de compras
- `/checkout` - Finalização de pedido
- `/login` - Login e cadastro

## 🔧 Tecnologias

- Next.js 14
- React 18
- TypeScript
- Firebase (Auth e Firestore)
- Tailwind CSS
- React Hot Toast





