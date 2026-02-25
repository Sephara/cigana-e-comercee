# Deploy Cigana na VPS Hostinger – Guia em ordem

Siga **exatamente** esta ordem. O site só abre se **firewall (painel)** + **Nginx** + **app** estiverem certos.

---

## Parte A: Firewall no painel Hostinger (obrigatório)

Se as portas 80 e 443 não estiverem liberadas aqui, o site **nunca** abre no navegador (timeout).

1. Acesse o **painel da Hostinger** → seu **VPS**.
2. Abra **Regras de firewall** (ou Firewall).
3. Garanta **3 regras de Aceitar** (e que venham **antes** de qualquer regra “Drop”):
   - **Aceitar** | **TCP** | **22**  | Fonte: Any  (SSH)
   - **Aceitar** | **TCP** | **80**  | Fonte: Any  (HTTP)
   - **Aceitar** | **TCP** | **443** | Fonte: Any  (HTTPS)
4. Clique em **Sincronizar** para aplicar no servidor.
5. Espere 1–2 minutos.

Sem isso, mesmo com Nginx e app certos, o navegador dá **timeout**.

---

## Parte B: Na VPS – Nginx

Conecte por SSH (ou pelo **Console** do painel, se o SSH não abrir):

```bash
ssh root@72.61.221.227
```

### B.1 Criar/atualizar o site

Se você tem o projeto no PC, pode copiar o config do Nginx que está no repositório:

**No seu PC (PowerShell, na pasta do projeto):**

```powershell
scp deploy/nginx-cigana.conf root@72.61.221.227:/tmp/
```

**Na VPS:**

```bash
cp /tmp/nginx-cigana.conf /etc/nginx/sites-available/cigana
```

Se não conseguir usar SCP, crie o arquivo na mão:

```bash
nano /etc/nginx/sites-available/cigana
```

Cole isto (e nada mais no bloco `server`):

```nginx
server {
    listen 80;
    server_name 72.61.221.227 ciganarainhadacavalgada.com www.ciganarainhadacavalgada.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Salve: **Ctrl+O**, Enter, **Ctrl+X**.

### B.2 Ativar e recarregar

```bash
ln -sf /etc/nginx/sites-available/cigana /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

Se `nginx -t` der erro, corrija o arquivo antes de recarregar.

---

## Parte C: Na VPS – App (Next.js + PM2)

```bash
cd /var/www/cigana
```

### C.1 Dependências e banco

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
```

(Se já tiver feito antes, pode pular o que não for necessário.)

### C.2 Build (obrigatório)

```bash
npm run build
```

Espere terminar. Sem isso o `next start` não sobe direito.

### C.3 PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

(Rode o comando que o `pm2 startup` mostrar, se pedir.)

---

## Parte D: Verificação na VPS

Rode o script que está no projeto:

```bash
bash /var/www/cigana/scripts/verificar-vps.sh
```

- Se tudo aparecer **OK**, o servidor está pronto.
- Se algo der **FALHA**, corrija o que o script indicar (Nginx, PM2, build, etc.).

---

## Parte E: Testar no navegador

1. Abra **http://ciganarainhadacavalgada.com** (com **http://**).
2. Se não abrir, no **PowerShell no seu PC** rode:
   ```powershell
   Test-NetConnection -ComputerName 72.61.221.227 -Port 80
   ```
   - **TcpTestSucceeded : True** → porta 80 está aberta; pode ser cache/DNS. Tente em janela anônima ou outro navegador.
   - **False / Timeout** → o bloqueio é no **firewall do painel**. Confira a Parte A e **Sincronizar** de novo.

---

## Resumo rápido

| Onde | O que fazer |
|------|-------------|
| **Painel Hostinger** | Firewall: Aceitar TCP 22, 80, 443 → **Sincronizar** |
| **VPS** | Nginx: `sites-available/cigana` com o server acima → `nginx -t` → `systemctl reload nginx` |
| **VPS** | App: `npm run build` → `pm2 start ecosystem.config.cjs` → `pm2 save` |
| **VPS** | `bash /var/www/cigana/scripts/verificar-vps.sh` |
| **Navegador** | **http://ciganarainhadacavalgada.com** |

---

## Depois que o site abrir (HTTPS)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d ciganarainhadacavalgada.com -d www.ciganarainhadacavalgada.com
```

No `.env` da VPS você pode adicionar `FORCE_HTTPS=true` e restaurar o middleware com redirect para HTTPS quando quiser forçar SSL.
