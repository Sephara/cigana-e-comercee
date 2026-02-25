#!/bin/bash
# Rode na VPS: bash /var/www/cigana/scripts/verificar-vps.sh
# Verifica se tudo está ok para o site abrir

set -e
echo "=== Verificação VPS Cigana ==="
echo ""

echo "1. Nginx está rodando?"
if systemctl is-active --quiet nginx; then
  echo "   OK - Nginx ativo"
else
  echo "   FALHA - Nginx não está rodando. Rode: systemctl start nginx"
fi
echo ""

echo "2. Porta 80 está escutando?"
if ss -tlnp | grep -q ':80 '; then
  echo "   OK - Alguém escutando na 80"
  ss -tlnp | grep ':80 '
else
  echo "   FALHA - Nada na porta 80"
fi
echo ""

echo "3. Arquivo de site cigana existe e está ativo?"
if [ -f /etc/nginx/sites-enabled/cigana ] || [ -L /etc/nginx/sites-enabled/cigana ]; then
  echo "   OK - sites-enabled/cigana existe"
else
  echo "   FALHA - Crie o site: ln -sf /etc/nginx/sites-available/cigana /etc/nginx/sites-enabled/"
fi
echo ""

echo "4. server_name no Nginx inclui o domínio?"
if grep -q "ciganarainhadacavalgada.com" /etc/nginx/sites-available/cigana 2>/dev/null; then
  echo "   OK - Domínio no server_name"
else
  echo "   FALHA - Adicione ciganarainhadacavalgada.com e www no server_name"
fi
echo ""

echo "5. PM2 - app cigana online?"
if command -v pm2 >/dev/null 2>&1; then
  pm2 list 2>/dev/null | grep -q "cigana.*online" && echo "   OK - cigana online" || echo "   FALHA - Rode: cd /var/www/cigana && pm2 start ecosystem.config.cjs"
else
  echo "   PM2 não encontrado"
fi
echo ""

echo "6. App responde em localhost:3000?"
CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null || echo "000")
if [ "$CODE" = "200" ] || [ "$CODE" = "307" ] || [ "$CODE" = "308" ]; then
  echo "   OK - Resposta HTTP $CODE"
else
  echo "   FALHA - Código $CODE (rode: cd /var/www/cigana && npm run build && pm2 restart cigana)"
fi
echo ""

echo "7. Nginx + app (pedido com Host do domínio)?"
CODE2=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: ciganarainhadacavalgada.com" http://127.0.0.1/ 2>/dev/null || echo "000")
echo "   HTTP $CODE2 (200 = OK, 301/302 = redirect)"
echo ""

echo "=== Fim. Se tudo OK e o site não abre no navegador, o bloqueio é no FIREWALL do painel Hostinger (portas 80 e 443). ==="
