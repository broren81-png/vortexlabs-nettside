// Bygger nettsiden til docs/ (som GitHub Pages publiserer). Ingen avhengigheter: `node build.mjs`.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lagSider } from './src/sider.mjs';
import { DOMENE } from './src/layout.mjs';

const rot = dirname(fileURLToPath(import.meta.url));
const ut = join(rot, 'docs');
const json = (f) => JSON.parse(readFileSync(join(rot, f), 'utf8'));

const priser = json('config/priser.json');
const salg = json('config/salg.json');
const nettsted = json('config/nettsted.json');

// Enkel kontroll av prisfilen
for (const p of priser.pakker) {
  if (!Number.isInteger(p.pris) || p.pris <= 0) throw new Error('Ugyldig pris for ' + p.id);
  for (const i of p.inkluderer) if (!priser.tillegg.some((t) => t.id === i)) throw new Error(`${p.id} inkluderer ukjent tillegg ${i}`);
}
for (const t of priser.tillegg) for (const k of t.krever || []) if (!priser.tillegg.some((x) => x.id === k)) throw new Error(`${t.id} krever ukjent ${k}`);
for (const p of salg.produkter) {
  for (const m of p.kjopsmodeller) if (!salg.kjopsmodeller[m]) throw new Error(`${p.id}: ukjent kjøpsmodell ${m}`);
  if (!salg.kategorier[p.kategori]) throw new Error(`${p.id}: ukjent kategori ${p.kategori}`);
  if (!['fastpris', 'prisantydning', 'bud', 'forespørsel'].includes(p.pris.type)) throw new Error(`${p.id}: ukjent pristype`);
  if (p.dokumentasjon && p.kategori !== 'inntekter') throw new Error(`${p.id}: dokumenterte tall er bare for kategorien inntekter`);
  if (p.godkjentForSalg && p.kategori === 'inntekter' && !(p.dokumentasjon && p.dokumentasjon.kilde)) throw new Error(`${p.id}: apper med inntekter må ha dokumentasjon med kilde`);
}

mkdirSync(ut, { recursive: true });
for (const f of readdirSync(ut)) rmSync(join(ut, f), { recursive: true, force: true });
cpSync(join(rot, 'assets'), join(ut, 'assets'), { recursive: true });
cpSync(join(rot, 'bilder'), join(ut, 'bilder'), { recursive: true });
cpSync(join(rot, 'CNAME'), join(ut, 'CNAME'));
writeFileSync(join(ut, '.nojekyll'), '');

const versjon = createHash('sha256').update(readFileSync(join(rot, 'assets/style.css'))).update(readFileSync(join(rot, 'assets/app.js'))).digest('hex').slice(0, 10);
const inline = "document.documentElement.classList.remove('ingen-js')";
const jsHash = createHash('sha256').update(inline).digest('base64');

import { side } from './src/layout.mjs';
const sider = lagSider(priser, salg, nettsted);
const urler = [];
for (const s of sider) {
  let html = side(s).replaceAll('VERSJON', versjon).replace('JS_HASH', jsHash);
  const fil = s.fil ? join(ut, s.fil) : join(ut, s.sti === '/' ? 'index.html' : s.sti.slice(1) + '/index.html');
  mkdirSync(dirname(fil), { recursive: true });
  writeFileSync(fil, html);
  if (!s.ikkeISitemap) urler.push(DOMENE + (s.sti === '/' ? '/' : s.sti));
}

const idag = new Date().toISOString().slice(0, 10);
writeFileSync(join(ut, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urler.map((u) => `  <url><loc>${u}</loc><lastmod>${idag}</lastmod></url>`).join('\n')}\n</urlset>\n`);
writeFileSync(join(ut, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${DOMENE}/sitemap.xml\n`);

console.log(`Bygget ${sider.length} sider til docs/ (versjon ${versjon}).`);
