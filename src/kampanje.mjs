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
    html: `<div data-kampanje-slutt="${k.slutt}"><dt>${esc(k.navn)}</dt><dd class="northcast-pris">${kr(k.belop)} eks. mva.</dd><dd class="kampanje-periode">Gjelder fra ${datoTekst(k.start)} til og med ${datoTekst(k.slutt)}</dd></div>
      <div data-kampanje-etter="${k.slutt}" hidden><dt>${etikett}</dt><dd class="northcast-pris">${ordinaer}</dd></div>`,
    gjeldende: `${kr(k.belop)} eks. mva.`,
  };
}
