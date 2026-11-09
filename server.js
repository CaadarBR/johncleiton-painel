const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const USER = 'JOHN', PASS = 'j3031321';
const AUTHVAL = 'ok-' + Buffer.from(USER + ':' + PASS).toString('base64');
const DATA_DIR = '/data';
const DATA_FILE = path.join(DATA_DIR, 'produtos.json');
const SEED = path.join(__dirname, 'produtos.json');

function load() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch (e) {
    try { const s = JSON.parse(fs.readFileSync(SEED, 'utf8')); save(s); return s; }
    catch (e2) { return []; }
  }
}
function save(list) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}
const esc = s => String(s == null ? '' : s).replace(/[<>"']/g, c => ({ '<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
// benef pode ter <b> proposital — nao escapar

app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  const c = {}; (req.headers.cookie || '').split(';').forEach(p => { const i = p.indexOf('='); if (i > 0) c[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); });
  req.cookies = c; req.isAdminHost = (req.hostname || '').startsWith('painel'); req.authed = c.jcp === AUTHVAL; next();
});

// ---------- CSS compartilhado (marca navy/ciano) ----------
const HEAD = `<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>:root{--navy:#1C3E63;--ink:#0D1F35;--cyan:#3DA9D4;--cyan-d:#2f93bd;--slate:#93A1AD;--card:#15304c;--card-b:#244a73;--white:#f6f9fc;--mut:#9fb2c6}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}body{margin:0;background:radial-gradient(1200px 620px at 50% -10%,#234a73 0%,var(--ink) 55%);color:var(--white);font-family:Inter,sans-serif;line-height:1.5;min-height:100vh}
.wrap{max-width:560px;margin:0 auto;padding:30px 16px 60px}h1{font-family:'Playfair Display',serif;font-weight:800;margin:0 0 4px}
.tag{color:var(--cyan);font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:2px}
.card{background:linear-gradient(180deg,var(--card),#122940);border:1px solid var(--card-b);border-radius:16px;padding:16px;margin-bottom:14px;position:relative}
input,textarea{width:100%;background:#0f2338;border:1px solid var(--card-b);color:var(--white);border-radius:10px;padding:11px;margin:6px 0;font-size:15px;font-family:Inter}
label{font-size:12px;color:var(--mut);font-weight:600}
.btn{background:linear-gradient(135deg,var(--cyan),var(--cyan-d));color:#04202e;border:none;border-radius:11px;padding:13px;font-weight:800;font-size:15px;cursor:pointer;width:100%}
.btn.del{background:#3a2330;color:#ffb3b3;border:1px solid #5a3444;width:auto;padding:8px 14px;font-weight:700}
.pill{position:absolute;top:-10px;left:16px;background:var(--cyan);color:#04202e;font-size:11px;font-weight:800;padding:3px 10px;border-radius:20px}
.pnome{font-weight:800;font-size:16px}.benef{color:var(--mut);font-size:13px;margin:6px 0 10px}
.preco{font-size:20px;font-weight:800}.preco s{color:var(--slate);font-size:13px;margin-right:7px}.preco .off{background:rgba(61,169,212,.16);color:var(--cyan);font-size:11px;font-weight:700;padding:2px 7px;border-radius:6px;margin-left:7px}
.cta{display:block;background:linear-gradient(135deg,var(--cyan),var(--cyan-d));color:#04202e;text-decoration:none;text-align:center;font-weight:800;padding:14px;border-radius:12px;margin-top:4px}
.cod{text-align:center;color:var(--mut);font-size:12px;margin-top:8px}.cod b{color:#fff;background:rgba(255,255,255,.06);padding:2px 7px;border-radius:5px}
.mono{width:84px;height:84px;border-radius:50%;margin:0 auto 14px;background:linear-gradient(135deg,var(--navy),var(--ink));display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-weight:800;font-size:36px;border:2.5px solid var(--cyan)}
.foot{color:var(--slate);font-size:11.5px;text-align:center;margin-top:28px}a{color:var(--cyan)}</style></head>`;

// ---------- CATALOGO publico ----------
function renderCatalogo() {
  const list = load();
  const cards = list.map(p => `<div class="card">${p.destaque ? '<div class="pill">🔥 TOP escolha</div>' : ''}
    <div class="pnome">${p.emoji || '🛒'} ${esc(p.nome)}</div>
    <div class="benef">${p.benef || ''}</div>
    <div class="preco">${p.precoDe ? '<s>R$ ' + esc(p.precoDe) + '</s>' : ''}R$ ${esc(p.preco)}${p.off ? '<span class="off">' + esc(p.off) + '</span>' : ''}</div>
    <a class="cta" href="${esc(p.link)}" target="_blank" rel="noopener">Ver no Mercado Livre →</a>
    ${p.codigo ? '<div class="cod">ou busca no ML pelo código <b>' + esc(p.codigo) + '</b></div>' : ''}</div>`).join('');
  return `<!doctype html><html lang="pt-BR"><title>John Cleiton — Indicações</title>${HEAD}<body><div class="wrap">
    <div style="text-align:center;margin-bottom:8px"><div class="mono">JC</div><div class="tag">Indicações do John</div>
    <h1>O que eu uso e aprovo</h1><div style="color:var(--mut);font-size:14px;max-width:420px;margin:8px auto 0">Produtos que eu testo e aprovo — segurança, tech e qualidade. 👇</div></div>
    ${cards || '<div class="card">Em breve indicações 😉</div>'}
    <div class="foot">Alguns links são de afiliado — se você compra por aqui, ajuda sem pagar nada a mais. 🙏<br>© John Cleiton · MCZ</div></div></body></html>`;
}

// ---------- ADMIN ----------
function renderLogin(err) {
  return `<!doctype html><html lang="pt-BR"><title>Painel — Login</title>${HEAD}<body><div class="wrap" style="max-width:380px">
    <div style="text-align:center;margin-bottom:14px"><div class="mono">JC</div><h1 style="font-size:22px">Painel</h1><div class="tag">Indicações do John</div></div>
    ${err ? '<div class="card" style="border-color:#5a3444;color:#ffb3b3">Usuário ou senha errados.</div>' : ''}
    <form method="post" action="/login"><label>Usuário</label><input name="user" autocapitalize="off"><label>Senha</label><input name="pass" type="password">
    <button class="btn" style="margin-top:10px">Entrar</button></form></div></body></html>`;
}
function renderAdmin(msg) {
  const list = load();
  const items = list.map((p, i) => `<div class="card"><div class="pnome">${p.emoji || '🛒'} ${esc(p.nome)}</div>
    <div class="preco" style="font-size:16px">R$ ${esc(p.preco)}${p.off ? '<span class="off">' + esc(p.off) + '</span>' : ''}</div>
    <div style="margin-top:8px"><a href="${esc(p.link)}" target="_blank" style="font-size:12px">${esc(p.link).slice(0,40)}…</a></div>
    <form method="post" action="/api/del" style="margin-top:10px"><input type="hidden" name="i" value="${i}"><button class="btn del">🗑 remover</button></form></div>`).join('');
  return `<!doctype html><html lang="pt-BR"><title>Painel</title>${HEAD}<body><div class="wrap">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><h1 style="font-size:24px">Painel</h1><a href="/logout" style="font-size:13px">sair</a></div>
    <div class="tag" style="margin-bottom:14px">Gerencie o catálogo · <a href="https://indico.johncleiton.com" target="_blank">ver no ar →</a></div>
    ${msg ? '<div class="card" style="border-color:#2f6e3a;color:#b6f0c0">' + msg + '</div>' : ''}
    <div class="card"><div class="pnome" style="margin-bottom:8px">➕ Adicionar produto</div>
    <form method="post" action="/api/add">
      <label>Emoji</label><input name="emoji" placeholder="📷" value="🛒">
      <label>Nome</label><input name="nome" required placeholder="Nome do produto">
      <label>Benefícios (pode usar &lt;b&gt;)</label><textarea name="benef" rows="3" placeholder="o que é bom nele"></textarea>
      <label>Preço de (riscado, opcional)</label><input name="precoDe" placeholder="649">
      <label>Preço</label><input name="preco" required placeholder="566">
      <label>Desconto (opcional)</label><input name="off" placeholder="12% OFF">
      <label>Link de afiliado</label><input name="link" required placeholder="https://meli.la/...">
      <label>Código ML (opcional)</label><input name="codigo" placeholder="YASZHY-A8KK">
      <button class="btn" style="margin-top:10px">Salvar produto</button></form></div>
    <div class="tag" style="margin:22px 2px 10px">No catálogo (${list.length})</div>
    ${items || '<div class="card">Nenhum produto ainda.</div>'}</div></body></html>`;
}

// ---------- ROTAS ----------
app.post('/login', (req, res) => {
  if (req.body.user === USER && req.body.pass === PASS) {
    res.setHeader('Set-Cookie', `jcp=${AUTHVAL}; Path=/; HttpOnly; Max-Age=2592000; SameSite=Lax`);
    return res.redirect('/');
  }
  res.send(renderLogin(true));
});
app.get('/logout', (req, res) => { res.setHeader('Set-Cookie', 'jcp=; Path=/; Max-Age=0'); res.redirect('/'); });
app.post('/api/add', (req, res) => {
  if (!req.authed) return res.redirect('/');
  const b = req.body, list = load();
  list.unshift({ emoji: b.emoji || '🛒', nome: b.nome, benef: b.benef || '', precoDe: b.precoDe || '', preco: b.preco, off: b.off || '', link: b.link, codigo: b.codigo || '', destaque: list.length === 0 });
  save(list); res.send(renderAdmin('✅ Produto adicionado! Já tá no ar no indico.johncleiton.com'));
});
app.post('/api/del', (req, res) => {
  if (!req.authed) return res.redirect('/');
  const list = load(); const i = parseInt(req.body.i, 10);
  if (i >= 0 && i < list.length) { list.splice(i, 1); save(list); }
  res.send(renderAdmin('🗑 Removido.'));
});
app.get('/', (req, res) => {
  if (req.isAdminHost) return res.send(req.authed ? renderAdmin() : renderLogin(false));
  res.send(renderCatalogo());
});
app.get('/produtos.json', (req, res) => res.json(load()));
app.get('/health', (req, res) => res.send('ok'));

app.listen(80, () => console.log('painel on :80'));
