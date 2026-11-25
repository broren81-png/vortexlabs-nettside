// Nye sider: tjenester, bransjer, artikler, lokal side og oversiktssider.
import { virvel, kr, esc, hake, avslutt, ikon } from '../layout.mjs';
import { landingsside } from '../landing.mjs';
import { TJENESTER, BRANSJER } from '../navn.mjs';
import { tjenesteSider } from './tjenester.mjs';
import { bransjeSider } from './bransjer.mjs';
import { artikler } from './artikler.mjs';

const PUBLISERT = '2026-11-25';
const datoTekst = '25. november 2026';

export function utvidelse(priser) {
  const g = Object.fromEntries(priser.grunntyper.map((x) => [x.id, x.pris]));
  const pk = Object.fromEntries(priser.pakker.map((p) => [p.id, p]));
  const t = (id) => kr(priser.tillegg.find((x) => x.id === id).pris);
  const v = priser.vedlikehold;
  const ctx = { g, pk, t, v, kr, priser };
  const sider = [];

  const tjenester = tjenesteSider(ctx);
  const bransjer = bransjeSider(ctx);
  for (const d of [...tjenester, ...bransjer]) sider.push(landingsside(d, ctx));

  /* Lokal side */
  sider.push(landingsside({
    sti: '/nettside-toten-gjovik', tjenesteType: 'Nettsider og apputvikling på Toten, Gjøvik og i Innlandet',
    tittel: 'Nettside og app på Toten, Gjøvik og i Innlandet | Vortex Labs Norway',
    beskrivelse: 'Utviklingsstudio på Skreia på Toten som lager nettsider, apper og bedriftssystemer for bedrifter på Toten, Gjøvik og i Innlandet, og i resten av Norge.',
    brodsmuler: [['Toten, Gjøvik og Innlandet', '/nettside-toten-gjovik']],
    merkelapp: 'Skreia, Østre Toten', h1: 'Nettsider og apper <em>på Toten, Gjøvik og i Innlandet</em>',
    ingress: 'Vortex Labs Norway holder til på Skreia i Østre Toten. For bedrifter i nærheten betyr det at du kan møte utvikleren ansikt til ansikt. For resten av landet jobber vi like godt over telefon og video.',
    fraPris: [['Nettsider', g.nettside], ['Webapper', g.webapp], ['Mobilapper', g.mobilapp]],
    cta: { knapp: 'Avtal et møte', tjeneste: 'annet' }, sekundar: ['/kontakt?tjeneste=designforslag', 'Få gratis designforslag'],
    utfordringer: { over: 'Lokalt', tittel: 'Fordelen med en utvikler i nærheten', punkter: [
      ['Møte når det trengs', 'For bedrifter på Toten, Gjøvik, Raufoss, Hamar og omegn kan vi møtes for å gå gjennom behovet eller vise løsningen underveis.'],
      ['Kjenner det lokale næringslivet', 'Vi driver selv tjenester i Innlandet, og vet hvordan hverdagen er for små bedrifter her.'],
      ['Samme pris i hele landet', 'Prisene våre er de samme uansett hvor du holder til. Lokale møter koster ikke ekstra innenfor rimelig avstand.'],
    ] },
    hvorfor: { over: 'Hele Norge', tittel: 'Vi leverer også i resten av Norge', avsnitt: [
      'Nettsider og apper kan lages uten at vi sitter i samme rom. Vi bruker video, skjermdeling og en testversjon du kan åpne på nettet, slik at du kan følge arbeidet uansett hvor du er.',
      'Vår egen tjeneste HentBilen har kunder i hele landet, og KaloriVenn har brukere i flere land.',
    ] },
    funksjoner: { tittel: 'Hva vi lager', punkter: ['Bedriftsnettsider og modernisering', 'Nettsider med booking og priskalkulator', 'Apper for iPhone og Android', 'Kundeportaler og administrasjonssystemer', 'Søkemotoroptimalisering og Google Bedriftsprofil', 'Drift og vedlikehold'] },
    referanse: { id: 'hentbilen', tekst: 'HentBilen er biltransporttjenesten vi driver fra Toten, med nettside, priskalkulator og internt system for oppdrag og sjåfører.' },
    faq: [
      ['Har dere kontor?', 'Vi holder til i Bilittvegen 44 på Skreia. Ta kontakt på forhånd, så avtaler vi tid og sted for et møte.'],
      ['Jobber dere bare med lokale bedrifter?', 'Nei. Vi leverer i hele Norge. Lokale bedrifter har i tillegg muligheten til å møtes fysisk.'],
      ['Kan dere hjelpe med Google Bedriftsprofil?', 'Ja. For lokale bedrifter er en oppdatert bedriftsprofil på Google viktig, og vi kobler den til nettsiden.'],
    ],
    relatert: [['/nettsider', 'Nettsider for bedrifter'], ['/bransjer', 'Bransjer vi lager løsninger for'], ['/om-oss', 'Om oss']],
  }, ctx));

  /* Artikler */
  const art = artikler(ctx);
  for (const a of art) {
    const sti = '/artikler/' + a.id;
    sider.push({
      sti, tittel: a.tittel + ' | Vortex Labs Norway', beskrivelse: a.beskrivelse,
      brodsmuler: [['Artikler', '/artikler'], [a.h1.replace(/\?$/, '?'), sti]],
      jsonld: [{ '@context': 'https://schema.org', '@type': 'Article', headline: a.h1, description: a.beskrivelse, datePublished: PUBLISERT, dateModified: PUBLISERT, inLanguage: 'nb', author: { '@id': 'https://vortexlabs.no/#organisasjon' }, publisher: { '@id': 'https://vortexlabs.no/#organisasjon' }, mainEntityOfPage: 'https://vortexlabs.no' + sti + '/' }],
      innhold: `
<section class="hero liten">${virvel}<div class="ramme"><span class="merkelapp">${a.kategori}</span><h1>${a.h1}</h1><p class="ingress">${a.ingress}</p><p class="meta">Publisert ${datoTekst} · Vortex Labs Norway</p></div></section>
<section><div class="ramme artikkel">
  <div class="oppsummert"><strong>Kort oppsummert</strong>${hake(a.oppsummert)}</div>
  ${a.seksjoner.map(([h, html]) => `<h2>${h}</h2>${html}`).join('\n  ')}
  ${a.kilder ? `<h2>Kilder</h2><ul class="kilder">${a.kilder.map(([u, n]) => `<li><a href="${u}" rel="noopener">${n}</a></li>`).join('')}</ul>` : ''}
  <h2>Les også</h2><ul class="lenkeliste">${a.relatert.map(([h, n]) => `<li><a href="${h}">${n}</a></li>`).join('')}</ul>
</div></section>
${avslutt(a.cta.tekst, a.cta.knapp, 'Gratis og uforpliktende.').replace('href="/kontakt"', `href="/kontakt?tjeneste=${a.cta.tjeneste}&amp;kilde=${encodeURIComponent(sti + '/')}"`)}`,
    });
  }

  /* Oversikt: artikler */
  const kategorier = [...new Set(art.map((a) => a.kategori))];
  sider.push({
    sti: '/artikler', tittel: 'Artikler om nettsider, apper og digitalisering | Vortex Labs Norway',
    beskrivelse: 'Nyttige artikler om hva nettsider og apper koster, hvordan man kjøper og eier en app, og hvordan små bedrifter kan digitalisere. Fra Vortex Labs Norway.',
    brodsmuler: [['Artikler', '/artikler']],
    innhold: `
<section class="hero liten">${virvel}<div class="ramme"><span class="merkelapp">Kunnskapssenter</span><h1>Artikler om nettsider, <em>apper og digitalisering</em></h1><p class="ingress">Konkrete svar på spørsmål vi ofte får, med våre egne priser og erfaringer.</p></div></section>
${kategorier.map((k) => `<section class="tett"><div class="ramme"><h2>${k}</h2><div class="rutenett r3">${art.filter((a) => a.kategori === k).map((a) => `<a class="kort lenke fram" href="/artikler/${a.id}"><h3>${a.h1}</h3><p>${esc(a.beskrivelse)}</p><span class="mer">Les artikkelen →</span></a>`).join('')}</div></div></section>`).join('')}
${avslutt()}`,
  });

  /* Oversikt: tjenester */
  const tj = (h) => tjenester.find((d) => d.sti === h);
  const grupper = [
    ['Nettsider', ikon.nett, [['/nettsider', 'Nettsider for bedrifter', `Profesjonelle bedriftsnettsider fra ${kr(g.nettside)}.`], ...['/tjenester/modernisering-av-nettside', '/tjenester/nettside-med-booking', '/tjenester/nettside-med-priskalkulator', '/tjenester/sokemotoroptimalisering'].map((h) => [h, TJENESTER.find((x) => x[0] === h)[1], tj(h).beskrivelse])]],
    ['Apper', ikon.app, [['/apputvikling', 'Apputvikling', `Apper for iPhone og Android fra ${kr(g.mobilapp)}.`], ...['/apputvikling/iphone', '/apputvikling/android'].map((h) => [h, TJENESTER.find((x) => x[0] === h)[1], tj(h).beskrivelse]), ['/kjop-app', 'Kjøp en ferdig app', 'Ferdigutviklede apper og digitale produkter til salgs.']]],
    ['Bedriftssystemer', ikon.system, [['/bedriftssystemer', 'Webapper og bedriftssystemer', `Skreddersydde systemer fra ${kr(g.webapp)}.`], ...['/tjenester/kundeportal', '/tjenester/administrasjonssystem', '/tjenester/ai-losninger'].map((h) => [h, TJENESTER.find((x) => x[0] === h)[1], tj(h).beskrivelse])]],
    ['Drift', ikon.verktoy, [['/vedlikehold', 'Drift og vedlikehold', `Vedlikehold fra ${kr(v.nettside.pris)} per måned.`]]],
  ];
  sider.push({
    sti: '/tjenester', tittel: 'Tjenester – nettsider, apper og bedriftssystemer | Vortex Labs Norway',
    beskrivelse: 'Oversikt over alt vi lager: bedriftsnettsider, booking og priskalkulator, apper for iPhone og Android, kundeportaler, administrasjonssystemer, AI og vedlikehold.',
    brodsmuler: [['Tjenester', '/tjenester']],
    innhold: `
<section class="hero liten">${virvel}<div class="ramme"><span class="merkelapp">Tjenester</span><h1>Alt vi lager, <em>samlet på ett sted</em></h1><p class="ingress">Fra en enkel bedriftsnettside til apper og systemer for hele driften. Alle priser er fra-priser eks. mva., med fastpris før oppstart.</p><div class="knapper"><a class="knapp prim" href="/kontakt?tjeneste=designforslag">Få gratis designforslag</a><a class="knapp sek" href="/priser">Se priser</a></div></div></section>
${grupper.map(([n, ik, liste]) => `<section class="tett"><div class="ramme"><h2 style="display:flex;align-items:center;gap:12px"><span class="ikon" style="margin:0">${ik}</span>${n}</h2><div class="rutenett r3">${liste.map(([h, tit, b]) => `<a class="kort lenke fram" href="${h}"><h3>${tit}</h3><p>${esc(b)}</p><span class="mer">Les mer →</span></a>`).join('')}</div></div></section>`).join('')}
${avslutt()}`,
  });

  /* Oversikt: bransjer */
  sider.push({
    sti: '/bransjer', tittel: 'Nettsider og apper for ulike bransjer | Vortex Labs Norway',
    beskrivelse: 'Nettsider, apper og systemer tilpasset bransjen din: transport, håndverk, bilverksted, bygg og anlegg, renhold, frisør, restaurant, trening, foreninger og camping.',
    brodsmuler: [['Bransjer', '/bransjer']],
    innhold: `
<section class="hero liten">${virvel}<div class="ramme"><span class="merkelapp">Bransjer</span><h1>Løsninger <em>tilpasset bransjen din</em></h1><p class="ingress">Hver bransje har sine egne behov. Her ser du hva vi kan lage for din. Vi viser bare til prosjekter vi faktisk har gjort, og forteller ærlig når vi ikke har levert til en bransje før.</p></div></section>
<section><div class="ramme"><div class="rutenett r3">
  ${bransjer.map((b) => `<a class="kort lenke fram" href="${b.sti}"><h3>${BRANSJER.find((x) => '/bransjer/' + x[0] === b.sti)[1]}</h3><p>${esc(b.beskrivelse)}</p><span class="mer">Les mer →</span></a>`).join('')}
  <a class="kort lenke fram" href="/"><h3>Småbedrifter</h3><p>Nettsider, apper og bedriftssystemer for norske småbedrifter, uansett bransje.</p><span class="mer">Til forsiden →</span></a>
  <a class="kort lenke fram" href="/nettside-toten-gjovik"><h3>Toten, Gjøvik og Innlandet</h3><p>Lokal utvikler på Skreia, for bedrifter i Innlandet og resten av landet.</p><span class="mer">Les mer →</span></a>
</div></div></section>
${avslutt('Finner du ikke bransjen din?', 'Fortell oss om bedriften', 'Vi lager løsninger for de fleste bransjer. Fortell oss hva du trenger.')}`,
  });

  return sider;
}
