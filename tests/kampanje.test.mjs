// Tester kampanjepriser (src/kampanje.mjs, config/salg.json) og den bygde siden.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { aktivKampanje, datoTekst, idagNorge, kampanjeBanner, kontrollerKampanje, prisRader, utlopTidspunkt } from '../src/kampanje.mjs';

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

test('prisraden viser åpningstilbud og skjult ordinær pris', () => {
  const { html } = prisRader({ ...produkt('northcast'), kampanje: { ...produkt('northcast').kampanje, start: '2000-01-01', slutt: '2999-12-31' } });
  assert.match(tall(html), /<span class="kampanje-merke">Åpningstilbud<\/span><\/dt><dd class="northcast-pris">150 000 kr eks\. mva\./);
  assert.match(html, /Tidsbegrenset tilbud – gjelder til og med 31\. desember/);
  assert.match(tall(html), /data-kampanje-etter="2999-12-31" hidden><dt>Prisantydning<\/dt><dd class="northcast-pris">499 000 kr eks\. mva\./);
  const utlopt = prisRader({ ...produkt('northcast'), kampanje: { ...produkt('northcast').kampanje, start: '2000-01-01', slutt: '2000-01-14' } }).html;
  assert.doesNotMatch(utlopt, /Åpningstilbud|kampanje-merke/);
  assert.match(tall(utlopt), /499 000 kr eks\. mva\./);
});

test('utløpstidspunkt er midnatt norsk tid etter sluttdato', () => {
  assert.equal(utlopTidspunkt('2026-12-11'), '2026-12-12T00:00:00+01:00');
  assert.equal(Date.parse(utlopTidspunkt('2026-12-11')), Date.parse('2026-12-11T23:00:00Z'));
  assert.equal(utlopTidspunkt('2026-07-01'), '2026-07-02T00:00:00+02:00');
});

test('kampanjestripen: merking, priser, frist, nedtelling og knapp', () => {
  const ut = (start, slutt) => kampanjeBanner([
    { produkt: { ...produkt('kalorivenn'), kampanje: { ...produkt('kalorivenn').kampanje, start, slutt } }, sti: '/prosjekter/kalorivenn/', kontakt: '/kontakt/?tjeneste=kjop-app&amp;produkt=kalorivenn' },
    { produkt: { ...produkt('northcast'), kampanje: { ...produkt('northcast').kampanje, start, slutt } }, sti: '/prosjekter/northcast/', kontakt: '/kontakt/?tjeneste=northcast-kjop&amp;produkt=northcast' },
  ]);
  const html = tall(ut('2000-01-01', '2999-12-11'));
  assert.match(html, /<span class="kampanje-merke">Åpningstilbud<\/span>/);
  assert.match(html, /Tidsbegrenset tilbud – gjelder til og med 11\. desember/);
  assert.match(html, /data-nedtelling="2999-12-12T00:00:00\+01:00"/);
  assert.match(html, /KaloriVenn<\/a><\/span>\s*<span class="kampanje-pris">100 000 kr <small>eks\. mva\.<\/small><\/span>\s*<a class="knapp prim" href="\/kontakt\/\?tjeneste=kjop-app&amp;produkt=kalorivenn">Benytt åpningstilbudet<\/a>/);
  assert.match(html, /Northcast<\/a><\/span>\s*<span class="kampanje-pris">150 000 kr/);
  assert.doesNotMatch(html, /249 000|499 000|%|før|spar/i, 'ingen førpriser eller rabattprosenter');
  assert.equal(ut('2000-01-01', '2000-01-14'), '', 'ingen stripe etter utløp');
});

test('bygd side: åpningstilbudet vises på forsiden, i katalogen og på produktsidene', () => {
  const sider = [['/', ['kalorivenn', 'northcast']], ['/kjop-app/', ['kalorivenn', 'northcast']], ['/prosjekter/kalorivenn/', ['kalorivenn']], ['/prosjekter/northcast/', ['northcast']]];
  const pris = { kalorivenn: '100 000', northcast: '150 000' };
  for (const [sti, ids] of sider) {
    const side = tall(readFileSync('docs' + sti + 'index.html', 'utf8'));
    const banner = (side.match(/<section class="kampanjebanner"[\s\S]*?<\/section>/) || [''])[0];
    if (!ids.some((id) => aktivKampanje(produkt(id)))) { assert.equal(banner, '', sti); continue; }
    assert.ok(side.indexOf('kampanjebanner') < side.indexOf('<h1'), `${sti}: stripen står før h1`);
    assert.match(banner, /Tidsbegrenset tilbud – gjelder til og med 11\. desember/, sti);
    assert.match(banner, /data-nedtelling="2026-12-12T00:00:00\+01:00"/, sti);
    assert.equal((banner.match(/Benytt åpningstilbudet/g) || []).length, ids.length, sti);
    for (const id of ids) assert.match(banner, new RegExp(`${pris[id]} kr <small>eks\\. mva\\.`), `${sti} ${id}`);
    assert.doesNotMatch(banner.replace(/href="[^"]*"/g, ''), /249 000|499 000|%|før|spar/i, `${sti}: ingen førpriser eller rabattprosenter`);
    for (const m of banner.matchAll(/href="(\/kontakt\/[^"]*)"/g)) assert.match(m[1], new RegExp('kilde=' + encodeURIComponent(sti).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'), sti);
  }
  for (const [sti, kamp] of [['/prosjekter/northcast/', '150 000'], ['/prosjekter/kalorivenn/', '100 000']]) {
    const side = tall(readFileSync('docs' + sti + 'index.html', 'utf8'));
    if (aktivKampanje(produkt(sti.includes('northcast') ? 'northcast' : 'kalorivenn'))) assert.match(side, new RegExp(`Åpningstilbud</span></dt><dd class="northcast-pris">${kamp} kr eks\\. mva\\.`), sti);
  }
});

function kjorAppJs(naa, { nedtelling = null } = {}) {
  const kilde = readFileSync('assets/app.js', 'utf8');
  const kamp = { hidden: false, getAttribute: () => '2026-12-11' };
  const etter = { hidden: true, getAttribute: () => '2026-12-11' };
  const tekst = { textContent: '' };
  const ned = nedtelling && { hidden: true, getAttribute: () => nedtelling, querySelector: () => tekst };
  const document = {
    querySelector: () => null, addEventListener() {},
    querySelectorAll: (s) => (s === '[data-kampanje-slutt]' ? [kamp] : s === '[data-kampanje-etter]' ? [etter] : s === '[data-nedtelling]' && ned ? [ned] : []),
  };
  const t = Date.parse(naa);
  class FastDato extends Date { constructor(...a) { super(...(a.length ? a : [t])); } static now() { return t; } }
  let intervall = null;
  runInNewContext(kilde, { window: {}, document, URLSearchParams, location: { search: '' }, Intl, Date: FastDato, setInterval: (f) => { intervall = f; return 1; }, clearInterval: () => { intervall = null; } });
  return { kamp, etter, ned, tekst, intervall };
}

test('app.js bytter til ordinær pris etter sluttdato', () => {
  const siste = kjorAppJs('2026-12-11T21:00:00Z');
  assert.deepEqual([siste.kamp.hidden, siste.etter.hidden], [false, true], 'siste kampanjedag i Norge');
  const etter = kjorAppJs('2026-12-11T23:30:00Z');
  assert.deepEqual([etter.kamp.hidden, etter.etter.hidden], [true, false], 'dagen etter i Norge');
});

test('nedtellingen viser dager, timer og minutter og fjerner kampanjen ved utløp', () => {
  const r = kjorAppJs('2026-11-28T10:00:00Z', { nedtelling: '2026-12-12T00:00:00+01:00' });
  assert.equal(r.ned.hidden, false);
  assert.equal(r.tekst.textContent, '13 dager, 13 timer og 0 minutter');
  assert.ok(r.intervall, 'oppdateres jevnlig');
  const kort = kjorAppJs('2026-12-11T22:00:30Z', { nedtelling: '2026-12-12T00:00:00+01:00' });
  assert.equal(kort.tekst.textContent, '0 dager, 1 time og 0 minutter');
  const en = kjorAppJs('2026-12-10T21:59:00Z', { nedtelling: '2026-12-12T00:00:00+01:00' });
  assert.equal(en.tekst.textContent, '1 dag, 1 time og 1 minutt');
  const ute = kjorAppJs('2026-12-11T23:00:00Z', { nedtelling: '2026-12-12T00:00:00+01:00' });
  assert.deepEqual([ute.kamp.hidden, ute.etter.hidden, ute.ned.hidden], [true, false, true]);
});
