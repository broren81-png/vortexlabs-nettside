// Tidsavgrensede kampanjepriser for apper til salgs (config/salg.json: produkt.kampanje).
// Kampanjeprisen vises bare fra og med start til og med slutt. assets/app.js skjuler den
// automatisk etter sluttdato, så siden faller tilbake til ordinær prisantydning uten nytt bygg.
import { esc, kr } from './layout.mjs';

const MANEDER = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
export const datoTekst = (iso) => { const [a, m, d] = iso.split('-').map(Number); return `${d}. ${MANEDER[m - 1]} ${a}`; };
const ISO = /^\d{4}-\d{2}-\d{2}$/;

// Dagens dato i Norge (byggetidspunkt).
export const idagNorge = (naa = new Date()) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Oslo' }).format(naa);

export function kontrollerKampanje(produkt) {
  const k = produkt.kampanje;
  if (!k) return;
  if (!ISO.test(k.start) || !ISO.test(k.slutt) || k.start > k.slutt) throw new Error(`${produkt.id}: ugyldig kampanjeperiode`);
  if (!Number.isInteger(k.belop) || k.belop <= 0) throw new Error(`${produkt.id}: ugyldig kampanjepris`);
  if (!k.navn) throw new Error(`${produkt.id}: kampanjen mangler navn`);
}

// Kampanjen gjelder på byggedatoen (og er ikke utløpt).
export const aktivKampanje = (produkt, idag = idagNorge()) => {
  const k = produkt.kampanje;
  return k && k.start <= idag && idag <= k.slutt ? k : null;
};

// Prisrader i faktaboksen. Med aktiv kampanje: kampanjepris og periode, og ordinær prisantydning
// skjult til kampanjen er over.
export function prisRader(produkt, etikett = 'Prisantydning') {
  const ordinaer = `${kr(produkt.pris.belop)} eks. mva.`;
  const k = aktivKampanje(produkt);
  if (!k) return { html: `<div><dt>${etikett}</dt><dd class="northcast-pris">${ordinaer}</dd></div>`, gjeldende: ordinaer };
  return {
    html: `<div class="kampanje-fakta" data-kampanje-slutt="${k.slutt}"><dt><span class="kampanje-merke">${esc(k.navn)}</span></dt><dd class="northcast-pris">${kr(k.belop)} eks. mva.</dd><dd class="kampanje-periode">${fristTekst(k)}</dd></div>
      <div data-kampanje-etter="${k.slutt}" hidden><dt>${etikett}</dt><dd class="northcast-pris">${ordinaer}</dd></div>`,
    gjeldende: `${kr(k.belop)} eks. mva.`,
  };
}

const kortDato = (iso) => datoTekst(iso).replace(/ \d{4}$/, '');
export const fristTekst = (k) => `Tidsbegrenset tilbud – gjelder til og med ${kortDato(k.slutt)}`;

// Tidspunktet kampanjen utløper: midnatt norsk tid etter sluttdatoen, med riktig tidssoneforskyvning.
export function utlopTidspunkt(slutt) {
  const d = new Date(slutt + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  const dag = d.toISOString().slice(0, 10);
  const del = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Oslo', timeZoneName: 'longOffset' }).formatToParts(new Date(dag + 'T00:00:00Z')).find((p) => p.type === 'timeZoneName');
  const forskyvning = (del ? del.value.replace('GMT', '') : '') || '+00:00';
  return `${dag}T00:00:00${forskyvning}`;
}

// Kampanjestripe øverst på siden. tilbud: [{ produkt, sti, kontakt }]. Tom streng uten aktiv kampanje.
export function kampanjeBanner(tilbud) {
  const aktive = tilbud.filter((t) => t.produkt && aktivKampanje(t.produkt));
  if (!aktive.length) return '';
  const k = aktivKampanje(aktive[0].produkt);
  const slutt = aktive.map((t) => t.produkt.kampanje.slutt).sort().at(-1);
  return `<section class="kampanjebanner" data-kampanje-slutt="${slutt}" aria-label="${esc(k.navn)}">
  <div class="ramme">
    <div class="kampanje-info">
      <span class="kampanje-merke">${esc(k.navn)}</span>
      <p class="kampanje-frist">${fristTekst(k)}</p>
      <p class="kampanje-nedtelling" data-nedtelling="${utlopTidspunkt(slutt)}" hidden>Utløper om <span></span></p>
    </div>
    <ul class="kampanje-tilbud">
      ${aktive.map((t) => `<li data-kampanje-slutt="${t.produkt.kampanje.slutt}">
        <span class="kampanje-produkt">${t.sti ? `<a href="${t.sti}">${esc(t.produkt.navn)}</a>` : esc(t.produkt.navn)}</span>
        <span class="kampanje-pris">${kr(t.produkt.kampanje.belop)} <small>eks. mva.</small></span>
        <a class="knapp prim" href="${t.kontakt}">Benytt åpningstilbudet</a>
      </li>`).join('\n      ')}
    </ul>
  </div>
</section>`;
}
