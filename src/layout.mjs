// Felles mal: <head>, toppmeny og bunn for alle sider.
export const DOMENE = 'https://vortexlabs.no';
export const EPOST = 'broren81@gmail.com'; // byttes til post@vortexlabs.no når den er opprettet og testet
export const FIRMA = {
  merke: 'Vortex Labs Norway',
  navn: 'Martinsen Drift og Utvikling',
  form: 'enkeltpersonforetak',
  orgnr: '935 046 734',
  mva: 'NO 935 046 734 MVA',
  adresse: 'Bilittvegen 44, 2848 Skreia',
};

export const kr = (n) => n.toLocaleString('nb-NO').replace(/\s/g, ' ') + ' kr';
import { TJENESTER, BRANSJER } from './navn.mjs';
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MENY = [
  ['/tjenester', 'Tjenester'],
  ['/bransjer', 'Bransjer'],
  ['/priser', 'Priser'],
  ['/prosjekter', 'Prosjekter'],
  ['/kjop-app', 'Kjøp din egen app'],
  ['/artikler', 'Artikler'],
  ['/om-oss', 'Om oss'],
];
// Sider som hører til et menypunkt uten å ligge under adressen
const MENYGRUPPE = { '/tjenester': ['/nettsider', '/apputvikling', '/bedriftssystemer', '/vedlikehold'] };

export const virvel = `<svg class="virvel" viewBox="0 0 900 900" aria-hidden="true" focusable="false">
  <circle class="r1" cx="450" cy="450" r="420" stroke="#7BE0A8" stroke-opacity=".18" stroke-width="2" stroke-dasharray="900 1740"/>
  <circle class="r2" cx="450" cy="450" r="330" stroke="#7BE0A8" stroke-opacity=".28" stroke-width="3" stroke-dasharray="620 1450"/>
  <circle class="r3" cx="450" cy="450" r="240" stroke="#B9F2D2" stroke-opacity=".22" stroke-width="2" stroke-dasharray="400 1100"/>
  <circle class="r4" cx="450" cy="450" r="150" stroke="#7BE0A8" stroke-opacity=".35" stroke-width="4" stroke-dasharray="240 700"/>
</svg>`;

// Kanonisk adresse: GitHub Pages sender /side til /side/ med 301, så vi bruker alltid skråstrek til slutt.
export const kanonisk = (sti) => DOMENE + (sti === '/' ? '/' : sti.replace(/\/?$/, '/'));
// Legger skråstrek til slutt på interne sidelenker (ikke filer med punktum), så de ikke omdirigeres.
export const medSkraastrek = (html) => html.replace(/href="\/([a-z0-9-]+(?:\/[a-z0-9-]+)*)(?=["?#])/g, 'href="/$1/');

export function side({ sti, tittel, beskrivelse, innhold, jsonld = [], bilde = '/bilder/og.jpg', ekstraHode = '', noindex = false, brodsmuler = null }) {
  const url = kanonisk(sti);
  const under = (h, x) => x === h || x.startsWith(h + '/');
  const aktiv = (href) => (under(href, sti) || (MENYGRUPPE[href] || []).some((g) => under(g, sti)) ? ' aria-current="page"' : '');
  const smuler = brodsmuler ? [['Hjem', '/'], ...brodsmuler] : null;
  if (smuler) jsonld = [...jsonld, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: smuler.map(([n, h], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: kanonisk(h) })) }];
  const smuleHtml = smuler ? `<nav class="brodsmuler" aria-label="Brødsmuler"><div class="ramme"><ol>${smuler.map(([n, h], i) => i === smuler.length - 1 ? `<li aria-current="page">${esc(n)}</li>` : `<li><a href="${h}">${esc(n)}</a></li>`).join('')}</ol></div></nav>` : '';
  const ld = [organisasjon(), ...jsonld].map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  return `<!doctype html>
<html lang="nb" class="ingen-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(tittel)}</title>
<meta name="description" content="${esc(beskrivelse)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self' 'sha256-JS_HASH'; connect-src 'self' https://*.supabase.co; form-action 'self' mailto:; base-uri 'self'; object-src 'none'">
<meta property="og:type" content="website">
<meta property="og:locale" content="nb_NO">
<meta property="og:site_name" content="Vortex Labs Norway">
<meta property="og:title" content="${esc(tittel)}">
<meta property="og:description" content="${esc(beskrivelse)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${DOMENE}${bilde}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(tittel)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0B1511">
<link rel="icon" href="/bilder/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/assets/style.css?v=VERSJON">
<script>document.documentElement.classList.remove('ingen-js')</script>
${ekstraHode}
${ld}
</head>
<body>
<a class="hopp" href="#innhold">Hopp til innhold</a>
<header class="topp">
  <div class="ramme">
    <a class="logo" href="/"><img src="/bilder/favicon.svg" alt="" width="30" height="30">Vortex Labs Norway</a>
    <nav aria-label="Hovedmeny">
      <button class="menyknapp" type="button" aria-expanded="false" aria-controls="meny">Meny</button>
      <ul class="meny" id="meny">
        ${MENY.map(([h, t]) => `<li><a href="${h}"${aktiv(h)}>${t}</a></li>`).join('\n        ')}
        <li class="cta"><a href="/kontakt"${aktiv('/kontakt')}>Kontakt</a></li>
      </ul>
    </nav>
  </div>
</header>
<main id="innhold">
${smuleHtml}${innhold}
</main>
<footer class="bunn">
  <div class="ramme">
    <div>
      <a class="logo" href="/"><img src="/bilder/favicon.svg" alt="" width="30" height="30">Vortex Labs Norway</a>
      <p>Uavhengig utviklingsstudio fra Toten. Nettsider, mobilapper og skreddersydde bedriftssystemer for kunder i hele Norge.</p>
    </div>
    <div>
      <h2>Tjenester</h2>
      <ul>
        ${TJENESTER.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('\n        ')}
        <li><a href="/priser">Priser og priskalkulator</a></li>
      </ul>
    </div>
    <div>
      <h2>Bransjer</h2>
      <ul>
        ${BRANSJER.map(([id, t]) => `<li><a href="/bransjer/${id}">${t}</a></li>`).join('\n        ')}
        <li><a href="/nettside-toten-gjovik">Toten, Gjøvik og Innlandet</a></li>
      </ul>
    </div>
    <div>
      <h2>Selskapet</h2>
      <ul>
        <li><a href="/prosjekter">Våre prosjekter</a></li>
        <li><a href="/artikler">Artikler</a></li>
        <li><a href="/kjop-app">Kjøp din egen app</a></li>
        <li><a href="/om-oss">Om oss</a></li>
        <li><a href="/kontakt">Kontakt</a></li>
        <li><a href="/personvern">Personvern</a></li>
      </ul>
    </div>
    <div>
      <h2>Kontakt</h2>
      <ul>
        <li><a href="mailto:${EPOST}">${EPOST}</a></li>
        <li>${FIRMA.adresse}</li>
        <li>Org.nr. ${FIRMA.orgnr} MVA</li>
      </ul>
    </div>
    <div class="juridisk">
      <span>© 2026 ${FIRMA.merke} er et merkenavn for ${FIRMA.navn} (${FIRMA.form}), org.nr. ${FIRMA.orgnr} MVA.</span>
      <span>Alle bedriftspriser er oppgitt eks. mva.</span>
    </div>
  </div>
</footer>
<dialog class="lysboks" id="lysboks" aria-label="Forstørret bilde"><button type="button" aria-label="Lukk">×</button></dialog>
<script src="/assets/app.js?v=VERSJON" defer></script>
</body>
</html>
`;
}

function organisasjon() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': DOMENE + '/#organisasjon',
    name: FIRMA.merke,
    legalName: FIRMA.navn,
    url: DOMENE + '/',
    email: EPOST,
    logo: DOMENE + '/bilder/favicon.svg',
    vatID: 'NO935046734MVA',
    taxID: '935046734',
    address: { '@type': 'PostalAddress', streetAddress: 'Bilittvegen 44', postalCode: '2848', addressLocality: 'Skreia', addressCountry: 'NO' },
    areaServed: { '@type': 'Country', name: 'Norge' },
    knowsAbout: ['Nettsider', 'Apputvikling', 'Webapplikasjoner', 'Bedriftssystemer'],
  };
}

// Gjenbrukbare biter
export const telefon = (src, alt, kl = '') =>
  `<div class="telefon ${kl}"><button class="zoom" type="button" data-stort="${src}" aria-label="Forstørr: ${esc(alt)}"><img src="${src}" alt="${esc(alt)}" width="560" height="1218" loading="lazy"></button></div>`;

export const nettleser = (src, alt, adresse, b = 1200, h = 750) =>
  `<div class="nettleser"><div class="linje" aria-hidden="true"><i></i><i></i><i></i><span>${esc(adresse)}</span></div><button class="zoom" type="button" data-stort="${src}" aria-label="Forstørr: ${esc(alt)}"><img src="${src}" alt="${esc(alt)}" width="${b}" height="${h}" loading="lazy"></button></div>`;

export const avslutt = (tittel = 'Har du en lignende idé? Vi kan utvikle den for deg.', knapp = 'Fortell oss om prosjektet ditt', tekst = 'Gratis og uforpliktende første samtale, og fastpris før vi starter.') =>
  `<section class="tett"><div class="ramme"><div class="avslutt fram"><div><h2>${tittel}</h2><p>${tekst}</p></div><a class="knapp prim" href="/kontakt">${knapp}</a></div></div></section>`;

export const hake = (punkter) => `<ul class="hake">${punkter.map((p) => `<li>${p}</li>`).join('')}</ul>`;

export const ikon = {
  nett: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/></svg>',
  app: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/></svg>',
  system: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h7"/><circle cx="18" cy="16" r="3"/></svg>',
  verktoy: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/></svg>',
  pris: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12l-8 8-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
  prat: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
  norge: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20l6-12 4 7 3-4 5 9z"/></svg>',
  design: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19l7-7 3 3-7 7z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18z"/><circle cx="11" cy="11" r="2"/></svg>',
};
