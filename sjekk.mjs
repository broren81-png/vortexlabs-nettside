// Kvalitetssjekk av den bygde nettsiden i docs/. Kjør etter `node build.mjs`: `node sjekk.mjs`
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const UT = 'docs', DOMENE = 'https://vortexlabs.no';
const feil = [], advarsler = [];
const filer = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? filer(p) : [p]; });
const html = filer(UT).filter((f) => f.endsWith('.html'));
const finnes = (sti) => {
  const ren = decodeURI(sti.split(/[?#]/)[0]);
  const p = join(UT, ren);
  return existsSync(p) && statSync(p).isFile() || existsSync(join(p, 'index.html'));
};

const titler = new Map(), beskrivelser = new Map(), kanoniske = new Set();
for (const f of html) {
  const s = readFileSync(f, 'utf8');
  const navn = '/' + relative(UT, f).replace(/\\/g, '/');
  const forventet = DOMENE + navn.replace(/index\.html$/, '');
  const er404 = navn === '/404.html';

  const h1 = (s.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) feil.push(`${navn}: ${h1} h1 (skal være 1)`);
  const tittel = (s.match(/<title>([^<]*)<\/title>/) || [])[1];
  if (!tittel) feil.push(`${navn}: mangler <title>`);
  else { if (titler.has(tittel)) feil.push(`${navn}: samme tittel som ${titler.get(tittel)}`); titler.set(tittel, navn); if (tittel.length > 75) advarsler.push(`${navn}: tittelen er ${tittel.length} tegn`); }
  const besk = (s.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  if (!besk) feil.push(`${navn}: mangler metabeskrivelse`);
  else { if (beskrivelser.has(besk)) feil.push(`${navn}: samme beskrivelse som ${beskrivelser.get(besk)}`); beskrivelser.set(besk, navn); if (besk.length > 170) advarsler.push(`${navn}: beskrivelsen er ${besk.length} tegn`); }

  const kan = (s.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  if (er404) { if (!/name="robots" content="noindex"/.test(s)) feil.push('404: mangler noindex'); }
  else if (kan !== forventet) feil.push(`${navn}: canonical ${kan} ≠ ${forventet}`);
  else kanoniske.add(kan);

  const og = (s.match(/<meta property="og:image" content="https:\/\/vortexlabs\.no([^"]*)"/) || [])[1];
  if (!og || !finnes(og)) feil.push(`${navn}: og:image mangler eller finnes ikke (${og})`);

  for (const m of s.matchAll(/<img\b[^>]*>/g)) if (!/\balt="/.test(m[0])) feil.push(`${navn}: bilde uten alt: ${m[0].slice(0, 80)}`);
  for (const m of s.matchAll(/(?:href|src|data-stort)="(\/[^"]*)"/g)) {
    const l = m[1];
    if (!finnes(l)) feil.push(`${navn}: brutt lenke ${l}`);
    else if (/^\/[a-z0-9-/]+[a-z0-9-](?:[?#]|$)/.test(l) && !l.split(/[?#]/)[0].endsWith('/')) advarsler.push(`${navn}: lenke uten skråstrek ${l}`);
  }
  for (const m of s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { feil.push(`${navn}: ugyldig JSON-LD`); } }
  if (/fagd[øo]r/i.test(s)) feil.push(`${navn}: nevner Fagdøra`);
}

const sitemap = readFileSync(join(UT, 'sitemap.xml'), 'utf8');
const iSitemap = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
for (const u of iSitemap) if (!kanoniske.has(u)) feil.push(`sitemap: ${u} er ikke en kanonisk side`);
for (const u of kanoniske) if (!iSitemap.includes(u)) feil.push(`sitemap mangler ${u}`);
if (!/Sitemap: https:\/\/vortexlabs\.no\/sitemap\.xml/.test(readFileSync(join(UT, 'robots.txt'), 'utf8'))) feil.push('robots.txt peker ikke til sitemap');
if (/Disallow: \/\s/.test(readFileSync(join(UT, 'robots.txt'), 'utf8'))) feil.push('robots.txt stenger hele nettstedet');

const store = filer(join(UT, 'bilder')).filter((f) => statSync(f).size > 150_000);
for (const f of store) advarsler.push(`stort bilde: ${f} (${Math.round(statSync(f).size / 1024)} kB)`);

console.log(`Sjekket ${html.length} sider og ${iSitemap.length} URL-er i sitemap.`);
advarsler.forEach((a) => console.log('ADVARSEL', a));
feil.forEach((f) => console.log('FEIL', f));
if (feil.length) { console.log(`${feil.length} feil.`); process.exit(1); } else console.log('Ingen feil.');
