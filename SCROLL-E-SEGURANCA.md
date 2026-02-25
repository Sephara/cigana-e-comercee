# Scroll e Segurança – o que travava e o que foi aplicado

## O que travava o scroll (animação)

1. **BentoGallery (GSAP ScrollTrigger)**  
   O `pin: galleryElement.parentElement` mantinha a seção fixa na tela enquanto a animação rodava (`end: '+=100%'`), o que dava sensação de scroll “travado”.  
   **Ajuste:** o pin foi removido. A animação agora usa apenas `scrub: true` com `start: 'top 80%'` e `end: 'top 20%'`, ou seja, a transição do grid acontece conforme o usuário rola a página, sem prender o scroll.

2. **`.gallery-wrap` (globals.css)**  
   Tem `overflow: hidden` e `height: 100vh`. Isso só afeta o bloco da galeria (uma “janela” de uma tela), não o `body`. O scroll da página em si não é bloqueado por isso; não foi necessário alterar.

3. **Mobile (globals.css)**  
   Em `@media (max-width: 767px)` só se esconde a scrollbar (`scrollbar-width: none`), sem `overflow: hidden` no `html`/`body`. Não trava o scroll.

---

## Segurança aplicada para deploy (HTTPS e rotas)

### Middleware (`middleware.ts`)

- **HTTPS em produção**  
  Se a requisição chegar em HTTP em produção, há redirecionamento 301 para a mesma URL em HTTPS (usa `x-forwarded-proto` quando atrás de proxy).

- **Headers de segurança (em produção)**  
  - `Strict-Transport-Security` (HSTS): 1 ano, includeSubDomains, preload  
  - `X-Frame-Options: DENY`  
  - `X-Content-Type-Options: nosniff`  
  - `Referrer-Policy: strict-origin-when-cross-origin`  
  - `Permissions-Policy`: câmera, microfone e geolocalização desabilitados  
  - `X-XSS-Protection: 1; mode=block` (também em dev)

- **Proteção de rotas /admin**  
  Qualquer acesso a `/admin` ou `/admin/*` (exceto `/admin/login`) sem cookie `auth-token` é redirecionado para `/admin/login`. O parâmetro `from` na URL de login guarda a rota original (pode ser usado para redirecionar após login).

O cookie de sessão continua sendo marcado com `secure: true` em produção em `lib/auth-server.ts` (já existente).

---

## Resumo

| Item                         | Antes                         | Depois                                      |
|-----------------------------|-------------------------------|---------------------------------------------|
| Scroll na animação Bento    | Pin travava a rolagem         | Sem pin; animação só com scrub              |
| HTTP em produção            | Sem redirect                  | Redirect 301 para HTTPS                     |
| Headers de segurança        | Não configurados              | HSTS, X-Frame-Options, nosniff, etc.        |
| Rotas /admin sem login      | Só checagem no layout (client)| Redirect no middleware + layout (client)    |
