# Deploy na VPS 72.61.221.227 – Passo a passo

Use este guia na ordem. Rode os blocos no **PowerShell** (no seu PC) ou **dentro da VPS** (após conectar por SSH), conforme indicado.

---

## Parte 1: Conectar na VPS

No **PowerShell** do seu PC:

```powershell
ssh root@72.61.221.227
```

(Se pedir senha, use a senha do root da Hostinger. Se usar chave, pode pedir apenas a passphrase.)

Quando aparecer o prompt `root@...`, você está **dentro da VPS**. Os comandos abaixo são para rodar **dentro da VPS**, um bloco por vez.

---

## Parte 2: Instalar Node, PM2, Nginx e PostgreSQL (na VPS)

Cole e rode (pode demorar alguns minutos):

```bash
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
apt install -y nginx postgresql postgresql-contrib
```

---

## Parte 3: Criar banco e usuário (na VPS)

Troque `SUA_SENHA_SEGURA` por uma senha forte (sem aspas na hora de rodar):

```bash
sudo -u postgres psql -c "CREATE USER cigana WITH PASSWORD 'SUA_SENHA_SEGURA';"
sudo -u postgres psql -c "CREATE DATABASE cigana OWNER cigana;"
```

Anote essa senha; você vai usar no `.env` como `DATABASE_URL`.

---

## Parte 4: Criar pasta e receber o projeto (na VPS)

**Opção A – Você tem o projeto no GitHub**

Na VPS:

```bash
apt install -y git
mkdir -p /var/www/cigana
cd /var/www/cigana
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git .
```

(Troque `SEU_USUARIO` e `SEU_REPOSITORIO` pelo seu repositório.)

**Opção B – Enviar do seu PC (sem GitHub)**

No **PowerShell no seu PC**, na pasta do projeto (onde está o `package.json`):

```powershell
scp -r .\* root@72.61.221.227:/var/www/cigana/
```

Antes disso, na **VPS**, crie a pasta:

```bash
mkdir -p /var/www/cigana
```

Depois do `scp`, volte na VPS e confira:

```bash
cd /var/www/cigana
ls -la
```

(Deve aparecer `package.json`, `prisma`, `app`, etc.)

---

## Parte 5: Arquivo .env (na VPS)

Na VPS:

```bash
cd /var/www/cigana
nano .env
```

Cole (e **ajuste** onde tiver em MAIÚSCULAS):

```env
DATABASE_URL="postgresql://cigana:SUA_SENHA_DO_BANCO@localhost:5432/cigana"
JWT_SECRET=COLE_AQUI_UM_openssl_rand_base64_32
ADMIN_EMAIL=admin@cigana.com
ADMIN_PASSWORD=SENHA_FORTE_DO_ADMIN
NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999
NODE_ENV=production
```

Para gerar um `JWT_SECRET` forte, noutro terminal na VPS:

```bash
openssl rand -base64 32
```

Copie o resultado e use em `JWT_SECRET=` no `.env`.

Salve no nano: **Ctrl+O**, Enter, **Ctrl+X**.

---

## Parte 6: Build e primeiro teste (na VPS)

**Importante:** O `next start` (e o PM2) só funcionam **depois** do build. Sempre que fizer novo deploy (git pull, scp, etc.), rode `npm run build` de novo.

```bash
cd /var/www/cigana
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run build
npm run start
```

Deixe rodando e no navegador do seu PC abra: **http://72.61.221.227:3000**  
Se a página abrir, está ok. Aperte **Ctrl+C** na VPS para parar.

---

## Parte 7: PM2 (na VPS)

**Só inicie o PM2 depois de ter rodado `npm run build` com sucesso** (Parte 6).

```bash
cd /var/www/cigana
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

(Rode o comando que o `pm2 startup` mostrar, se pedir.)  
Verificar: `pm2 status` (deve aparecer `cigana` online).

**Depois de um novo deploy (git pull, scp, etc.):** rode `npm run build` e depois `pm2 restart cigana` (ou `pm2 restart ecosystem.config.cjs`).

---

## Parte 8: Nginx (na VPS)

Criar o site (por enquanto só HTTP):

```bash
nano /etc/nginx/sites-available/cigana
```

Cole (inclua o IP e o domínio no `server_name` para o site abrir no domínio):

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

Assim o Nginx aceita pedidos tanto pelo IP quanto por **ciganarainhadacavalgada.com** e **www.ciganarainhadacavalgada.com**.

Ativar e recarregar:

```bash
ln -sf /etc/nginx/sites-available/cigana /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

Teste no navegador: **http://72.61.221.227** (ou http://seu-dominio). Deve abrir o site.

---

## Parte 9: HTTPS com Certbot (na VPS, só se tiver domínio)

Só faça isso se já tiver um domínio (ex.: `loja.seudominio.com.br`) com DNS apontando para **72.61.221.227**:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d SEU_DOMINIO_AQUI
```

Siga as perguntas (e-mail, aceitar termos). Depois acesse **https://SEU_DOMINIO_AQUI**.

---

## Resumo rápido

| Onde      | O que fazer |
|----------|-------------|
| Seu PC   | `ssh root@72.61.221.227` ou `scp` do projeto |
| Na VPS   | Instalar Node, PM2, Nginx, Postgres |
| Na VPS   | Criar banco, usuário `cigana` |
| Na VPS   | Projeto em `/var/www/cigana`, criar `.env` |
| Na VPS   | `npm install`, `prisma generate`, `db push`, `db:seed`, `build` |
| Na VPS   | `pm2 start ecosystem.config.cjs`, `pm2 save`, `pm2 startup` |
| Na VPS   | Nginx em `/etc/nginx/sites-available/cigana` e `reload` |
| Opcional | Certbot para HTTPS no domínio |

Se em algum passo der erro, copie a mensagem e o comando que rodou para conseguir debugar.

---

## Diagnóstico: site não abre no domínio

Rode estes comandos **na VPS** (um por vez) e confira:

**1. App está rodando?**
```bash
pm2 status
```
→ Deve mostrar `cigana` com status **online**. Se estiver `errored` ou `stopped`, rode `pm2 restart cigana` e depois `pm2 logs cigana --lines 30`.

**2. App responde na porta 3000?**
```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/
```
→ Deve retornar `200` ou `307`/`308`. Se der erro, o build ou o .env podem estar errados.

**3. Nginx está ativo e com o domínio no server_name?**
```bash
systemctl status nginx
cat /etc/nginx/sites-enabled/cigana
```
→ Nginx deve estar `active (running)`. No arquivo deve aparecer `server_name ... ciganarainhadacavalgada.com www.ciganarainhadacavalgada.com`. Se só tiver o IP, edite com `nano /etc/nginx/sites-available/cigana`, coloque o domínio no `server_name`, salve e rode `nginx -t` e `systemctl reload nginx`.

**4. Porta 80 aberta no firewall?**
```bash
ufw status 2>/dev/null || iptables -L INPUT -n 2>/dev/null | head -20
```
→ Se `ufw` estiver ativo, deve haver regra permitindo porta 80 (e 443 se usar HTTPS).

**5. Teste pelo domínio (na própria VPS):**
```bash
curl -I -H "Host: ciganarainhadacavalgada.com" http://127.0.0.1/
```
→ Deve retornar cabeçalhos HTTP (200 ou 301/302). Se der "connection refused", o Nginx não está escutando ou não está fazendo proxy para o app.

Depois de corrigir o que estiver errado, teste no navegador: **http://ciganarainhadacavalgada.com** (e depois configure HTTPS com Certbot).
