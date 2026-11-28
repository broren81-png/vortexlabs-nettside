// Tester kampanjepriser (src/kampanje.mjs, config/salg.json) og den bygde siden.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { aktivKampanje, datoTekst, idagNorge, kontrollerKampanje, prisRader } from '../src/kampanje.mjs';

const salg = JSON.parse(readFileSync('config/salg.json', 'utf8'));
const produkt = (id) => salg.produkter.find((p) => p.id === id);
const tall = (s) => s.replace(/[\s  ]/g, ' ');

test('åpningskampanjen har riktige priser og 14 dagers periode', () => {
  for (const [id, belop, ordinaer] of [['kalorivenn', 100000, 249000], ['northcast', 150000, 499000]]) {
    const p = produkt(id);
    kontrollerKampanje(p);
    assert.equal(p.kampanje.belop, belop);
    assert.equal(p.pris.belop, ordinaer, 'ordinær prisantydning er uendret');
    assert.equal(p.kampanje.start, '2026-11-28');
    assert.equal(p.kampanje.slutt, '2026-12-11');
    const dager = (Date.parse(p.kampanje.slutt) - Date.parse(p.kampanje.start)) / 864e5 + 1;
    assert.equal(dager, 14);
  }
});

test('kampanjen gjelder bare innenfor perioden', () => {
  const p = produkt('kalorivenn');
  assert.equal(aktivKampanje(p, '2026-11-27'), null);
  assert.ok(aktivKampanje(p, '2026-11-28'));
  assert.ok(aktivKampanje(p, '2026-12-11'));
  assert.equal(aktivKampanje(p, '2026-12-12'), null);
  assert.equal(datoTekst('2026-12-11'), '11. desember 2026');
  assert.equal(idagNorge(new Date('2026-12-11T22:59:00Z')), '2026-12-11');
  assert.equal(idagNorge(new Date('2026-12-11T23:01:00Z')), '2026-12-12');
});

test('ugyldig kampanje stopper bygget', () => {
  assert.throws(() => kontrollerKampanje({ id: 'x', kampanje: { navn: 'K', belop: 1, start: '2026-12-11', slutt: '2026-11-28' } }));
  assert.throws(() => kontrollerKampanje({ id: 'x', kampanje: { navn: 'K', belop: -5, start: '2026-11-28', slutt: '2026-12-11' } }));
});

test('prisraden viser kampanjepris og skjult ordinær pris', () => {
  const { html } = prisRader({ ...produkt('northcast'), kampanje: { ...produkt('northcast').kampanje, start: '2000-01-01', slutt: '2999-12-31' } });
  assert.match(tall(html), /Åpningskampanje<\/dt><dd class="northcast-pris">150 000 kr eks\. mva\./);
  assert.match(tall(html), /data-kampanje-etter="2999-12-31" hidden><dt>Prisantydning<\/dt><dd class="northcast-pris">499 000 kr eks\. mva\./);
  const utlopt = prisRader({ ...produkt('northcast'), kampanje: { ...produkt('northcast').kampanje, start: '2000-01-01', slutt: '2000-01-14' } }).html;
  assert.doesNotMatch(utlopt, /Åpningskampanje/);
  assert.match(tall(utlopt), /499 000 kr eks\. mva\./);
});

test('bygd side: kampanjen vises når den er aktiv på byggedatoen', () => {
  for (const [sti, id, kamp] of [['/prosjekter/northcast/', 'northcast', '150 000'], ['/prosjekter/kalorivenn/', 'kalorivenn', '100 000'], ['/kjop-app/', 'northcast', '150 000'], ['/kjop-app/', 'kalorivenn', '100 000']]) {
    const side = tall(readFileSync('docs' + sti + 'index.html', 'utf8'));
    if (aktivKampanje(produkt(id))) {
      assert.match(side, new RegExp(`Åpningskampanje</dt><dd class="northcast-pris">${kamp} kr eks\\. mva\\.`), sti);
      assert.match(side, /Gjelder fra 28\. november 2026 til og med 11\. desember 2026/, sti);
    } else assert.doesNotMatch(side, /Åpningskampanje/, sti);
  }
});

test('app.js bytter til ordinær pris etter sluttdato', () => {
  const kilde = readFileSync('assets/app.js', 'utf8');
  const kjor = (naa) => {
    const kamp = { hidden: false, getAttribute: () => '2026-12-11' };
    const etter = { hidden: true, getAttribute: () => '2026-12-11' };
    const document = { querySelector: () => null, querySelectorAll: (s) => (s === '[data-kampanje-slutt]' ? [kamp] : s === '[data-kampanje-etter]' ? [etter] : []), addEventListener() {} };
    class FastDato extends Date { constructor(...a) { super(...(a.length ? a : [naa])); } }
    runInNewContext(kilde, { window: {}, document, URLSearchParams, location: { search: '' }, Intl, Date: FastDato });
    return [kamp.hidden, etter.hidden];
  };
  assert.deepEqual(kjor('2026-12-11T21:00:00Z'), [false, true], 'siste kampanjedag i Norge');
  assert.deepEqual(kjor('2026-12-11T23:30:00Z'), [true, false], 'dagen etter i Norge');
});
