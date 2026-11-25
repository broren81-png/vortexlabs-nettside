// Felles mal for tjeneste-, bransje- og lokale landingssider.
import { virvel, kr, hake, avslutt } from './layout.mjs';
import { PROSJEKTER } from './prosjekter.mjs';

const kontakt = (tjeneste, sti) => `/kontakt?tjeneste=${tjeneste}&amp;kilde=${encodeURIComponent(sti.replace(/\/?$/, '/'))}`;

export function landingsside(d, { pk, priser }) {
  const t = (tittel, innhold, kl = '') => `<section class="${kl}"><div class="ramme">${tittel ? `<div class="seksjonstopp fram">${tittel}</div>` : ''}${innhold}</div></section>`;
  const hode = (over, h2, lead = '') => `<span class="overtittel">${over}</span><h2>${h2}</h2>${lead ? `<p class="lead">${lead}</p>` : ''}`;
  const deler = [];

  deler.push(`<section class="hero liten">${virvel}<div class="ramme"><span class="merkelapp">${d.merkelapp}</span><h1>${d.h1}</h1><p class="ingress">${d.ingress}</p>
    ${d.fraPris ? `<p class="prisetikett">Fra-priser, eks. mva.</p><ul class="prisbrikker">${d.fraPris.map(([n, b]) => `<li>${n} fra <strong>${kr(b)}</strong></li>`).join('')}</ul><p class="liten-tekst" style="margin-bottom:22px">Endelig fastpris avtales før vi starter.</p>` : ''}
    <div class="knapper"><a class="knapp prim" href="${kontakt(d.cta.tjeneste, d.sti)}">${d.cta.knapp}</a>${d.sekundar ? `<a class="knapp sek" href="${d.sekundar[0]}">${d.sekundar[1]}</a>` : `<a class="knapp sek" href="${kontakt('nettsidevurdering', d.sti)}">Gratis nettsidevurdering</a>`}</div></div></section>`);

  if (d.utfordringer) deler.push(t(hode(d.utfordringer.over || 'Utfordringer', d.utfordringer.tittel, d.utfordringer.lead), `<div class="rutenett r3">${d.utfordringer.punkter.map(([a, b]) => `<div class="kort fram"><h3>${a}</h3><p>${b}</p></div>`).join('')}</div>`));
  if (d.hvorfor) deler.push(t('', `<div class="rutenett r2"><div class="fram">${hode(d.hvorfor.over || 'Hvorfor', d.hvorfor.tittel)}${d.hvorfor.avsnitt.map((a) => `<p class="lead" style="margin-bottom:14px">${a}</p>`).join('')}</div>${d.funksjoner ? `<div class="fram">${hode('Funksjoner', d.funksjoner.tittel)}${hake(d.funksjoner.punkter)}</div>` : ''}</div>`, 'flate'));
  else if (d.funksjoner) deler.push(t(hode('Funksjoner', d.funksjoner.tittel, d.funksjoner.lead), hake(d.funksjoner.punkter), 'flate'));
  for (const e of d.ekstra || []) deler.push(t(hode(e.over, e.tittel, e.lead), e.html, e.kl || ''));
  if (d.eksempler) deler.push(t(hode('Eksempler', d.eksempler.tittel, d.eksempler.lead), `<div class="rutenett ${d.eksempler.punkter.length === 2 ? 'r2' : 'r3'}">${d.eksempler.punkter.map(([a, b]) => `<div class="kort fram"><h3>${a}</h3><p>${b}</p></div>`).join('')}</div>`));
  if (d.priser) {
    const pakker = d.priser.pakker.map((id) => pk[id]);
    const tillegg = (d.priser.tillegg || []).map((id) => priser.tillegg.find((x) => x.id === id));
    deler.push(t(hode('Priser', d.priser.tittel, d.priser.tekst), `<div class="rutenett ${pakker.length > 2 ? 'r3' : 'r2'}">${pakker.map((p) => `<div class="kort fram"><h3>${p.navn}</h3><p class="fra" style="margin:6px 0 12px">fra ${kr(p.pris)} <small>eks. mva.</small></p>${hake(p.punkter.slice(0, 4))}</div>`).join('')}</div>
      ${tillegg.length ? `<p class="forbehold">Vanlige tillegg: ${tillegg.map((x) => `${x.navn.toLowerCase()} fra ${kr(x.pris)}`).join(', ')}. Alle priser eks. mva. Bruk <a href="/priser#kalkulator">priskalkulatoren</a> for et veiledende estimat, eller be om et konkret tilbud med fastpris.</p>` : `<p class="forbehold">Alle priser eks. mva. Se <a href="/priser">alle priser</a> eller bruk <a href="/priser#kalkulator">priskalkulatoren</a>.</p>`}`, 'flate'));
  }
  if (d.videre) deler.push(t('', `<div class="rutenett r2"><div class="fram">${hode('Neste steg', d.videre.tittel, d.videre.lead)}</div><div class="fram">${hake(d.videre.punkter)}</div></div>`));
  if (d.referanse) {
    const p = PROSJEKTER.find((x) => x.id === d.referanse.id);
    deler.push(t('', `<article class="fremhevet-prosjekt fram"><div class="fp-tekst"><span class="overtittel">${d.referanse.over || 'Fra våre egne prosjekter'}</span><h3>${p.ikon ? `<img src="${p.ikon}" alt="" width="40" height="40">` : ''}${p.navn}</h3><p>${d.referanse.tekst}</p><div class="knapper"><a class="knapp mork" href="/prosjekter/${p.id}">Se ${p.navn}-prosjektet</a></div></div>${p.bilder[0] ? `<a class="fp-bilde" href="/prosjekter/${p.id}" tabindex="-1" aria-hidden="true"><img src="${(p.bilder.find((b) => b.bred) || p.bilder[0]).src}" alt="" loading="lazy"></a>` : ''}</article>`, 'flate'));
  }
  if (d.faq) deler.push(t(hode('Spørsmål og svar', d.faqTittel || 'Ofte stilte spørsmål'), `<div class="faq smal">${d.faq.map(([q, a]) => `<details class="fram"><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`));
  if (d.relatert) deler.push(t(hode('Les også', 'Relaterte sider'), `<ul class="lenkeliste fram">${d.relatert.map(([h, n]) => `<li><a href="${h}">${n}</a></li>`).join('')}</ul>`, 'tett'));
  deler.push(avslutt(d.avslutt?.[0] || 'Klar for å komme i gang?', d.cta.knapp, d.avslutt?.[1] || 'Gratis og uforpliktende. Du får fastpris før vi starter.').replace('href="/kontakt"', `href="${kontakt(d.cta.tjeneste, d.sti)}"`));

  const jsonld = [];
  if (d.faq) jsonld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: d.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) });
  if (d.tjenesteType) jsonld.push({ '@context': 'https://schema.org', '@type': 'Service', name: d.tjenesteType, provider: { '@id': 'https://vortexlabs.no/#organisasjon' }, areaServed: { '@type': 'Country', name: 'Norge' }, ...(d.fraPris ? { offers: { '@type': 'Offer', priceCurrency: 'NOK', price: d.fraPris[0][1], description: 'Fra-pris eks. mva.' } } : {}) });

  return { sti: d.sti, tittel: d.tittel, beskrivelse: d.beskrivelse, brodsmuler: d.brodsmuler, jsonld, innhold: deler.join('\n') };
}
