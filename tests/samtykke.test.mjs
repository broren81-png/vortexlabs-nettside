// Tester samtykke og Google Analytics i assets/samtykke.js med et lite, falskt DOM.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const kilde = readFileSync('assets/samtykke.js', 'utf8');
const ID = 'G-VVKJ23QH0E';

function element(tag) {
  return {
    tag, attrs: {}, children: [], handlers: {}, className: '', textContent: '', innerHTML: '',
    setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k] ?? null; },
    addEventListener(k, fn) { this.handlers[k] = fn; }, appendChild(c) { this.children.push(c); c.parent = this; },
    remove() { if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = null; },
    closest() { return null; }, querySelector() { return { focus() {} }; }, focus() {},
  };
}

function last({ lagret = null, href = 'https://vortexlabs.no/', referrer = '' } = {}) {
  const lager = new Map(lagret === null ? [] : [['vl-samtykke', JSON.stringify(lagret)]]);
  const head = element('head'), body = element('body');
  const lyttere = [];
  let kapsler = { _ga: 'GA1.1.123', _ga_VVKJ23QH0E: 'GS1', annen: 'x' };
  const url = new URL(href);
  const document = {
    readyState: 'complete', referrer, title: 'Test', head, body,
    createElement: element,
    querySelector: (s) => (s.includes('gtag/js') ? head.children.find((c) => c.src && c.src.includes('gtag/js')) ?? null : null),
    querySelectorAll: () => [],
    addEventListener: (type, fn) => lyttere.push({ type, fn }),
    get cookie() { return Object.entries(kapsler).map(([k, v]) => `${k}=${v}`).join('; '); },
    set cookie(v) { const [par] = v.split(';'); const [k] = par.split('='); if (/Max-Age=0/.test(v)) delete kapsler[k.trim()]; },
  };
  const window = {};
  const localStorage = { getItem: (k) => lager.get(k) ?? null, setItem: (k, v) => lager.set(k, String(v)) };
  runInNewContext(kilde, { window, document, localStorage, location: { href: url.href, pathname: url.pathname, hostname: url.hostname, origin: url.origin }, URL, JSON, Date });
  const dl = () => JSON.parse(JSON.stringify((window.dataLayer || []).map((a) => Array.from(a))));
  const klikk = (a) => lyttere.filter((l) => l.type === 'click').forEach((l) => l.fn({ target: a }));
  const banner = () => body.children.find((c) => c.className === 'samtykke');
  const velg = (ja) => banner().handlers.click({ target: { closest: () => ({ getAttribute: () => (ja ? 'ja' : 'nei') }) } });
  const knapp = (hva) => klikk({ closest: (s) => (s === '[data-samtykke]' ? { getAttribute: () => hva } : null) });
  return { window, head, body, lager, dl, klikk, banner, velg, knapp, kapsler: () => kapsler };
}
const gtagLastet = (s) => s.head.children.some((c) => c.src && c.src.includes('googletagmanager.com/gtag/js?id=' + ID));

test('uten valg: banner vises, ingen tagg og ingen data', () => {
  const s = last();
  assert.ok(s.banner(), 'banner vises');
  assert.equal(gtagLastet(s), false);
  assert.equal(s.dl().length, 0);
  s.window.vlStatistikk('generate_lead', { tjeneste: 'annet' });
  assert.equal(s.dl().length, 0, 'hendelser sendes ikke uten samtykke');
});

test('avslag: ingen tagg, ingen data, valget lagres og banneret lukkes', () => {
  const s = last();
  s.velg(false);
  assert.equal(s.banner(), undefined);
  assert.equal(gtagLastet(s), false);
  assert.equal(s.dl().length, 0);
  assert.equal(JSON.parse(s.lager.get('vl-samtykke')).statistikk, false);
  assert.equal(s.kapsler()._ga, undefined, 'gamle GA-kapsler slettes');
});

test('godta: Basic Consent Mode v2 og én tagg', () => {
  const s = last({ href: 'https://vortexlabs.no/prosjekter/northcast/?utm_source=nyhetsbrev&utm_campaign=vinter&epost=ola@example.com&navn=Ola' });
  s.velg(true);
  const d = s.dl();
  assert.deepEqual(d[0], ['consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' }]);
  assert.deepEqual(d[1], ['consent', 'update', { analytics_storage: 'granted' }]);
  const config = d.find((a) => a[0] === 'config');
  assert.equal(config[1], ID);
  assert.equal(config[2].page_location, 'https://vortexlabs.no/prosjekter/northcast/?utm_source=nyhetsbrev&utm_campaign=vinter');
  assert.equal(d.find((a) => a[0] === 'set')[1].content_group, 'Northcast');
  assert.equal(config[2].allow_google_signals, false);
  assert.ok(d.some((a) => a[0] === 'event' && a[1] === 'besok_northcast'));
  assert.equal(s.head.children.filter((c) => c.src && c.src.includes('gtag/js')).length, 1);
  s.knapp('godta');
  assert.equal(s.head.children.filter((c) => c.src && c.src.includes('gtag/js')).length, 1, 'ingen dobbel tagg');
  assert.equal(s.dl().filter((a) => a[0] === 'config').length, 1, 'ingen dobbel sidevisning');
  assert.ok(!JSON.stringify(d).includes('example.com'));
});

test('lagret samtykke laster tagg direkte; referrer renses', () => {
  const s = last({ lagret: { v: 1, statistikk: true }, href: 'https://vortexlabs.no/priser/', referrer: 'https://www.google.com/search?q=ola+nordmann' });
  assert.equal(s.banner(), undefined);
  assert.ok(gtagLastet(s));
  const config = s.dl().find((a) => a[0] === 'config');
  assert.equal(config[2].page_referrer, 'https://www.google.com/search');
  assert.ok(s.dl().some((a) => a[0] === 'event' && a[1] === 'besok_tjeneste_pris'));
});

test('KaloriVenn-besøk måles', () => {
  const s = last({ lagret: { v: 1, statistikk: true }, href: 'https://vortexlabs.no/prosjekter/kalorivenn/' });
  assert.ok(s.dl().some((a) => a[0] === 'event' && a[1] === 'besok_kalorivenn'));
});

test('klikk på kontakt, e-post og telefon sendes uten adresse eller nummer', () => {
  const s = last({ lagret: { v: 1, statistikk: true }, href: 'https://vortexlabs.no/nettsider/' });
  const lenke = (href, tekst, i = 'innhold') => ({ closest: (sel) => (sel === 'a[href]' ? { getAttribute: () => href, textContent: tekst, closest: (x) => (x === '.topp' && i === 'topp' ? {} : null) } : null) });
  s.klikk(lenke('mailto:post@example.com', 'post@example.com'));
  s.klikk(lenke('tel:+4712345678', '123 45 678'));
  s.klikk(lenke('/kontakt/?tjeneste=designforslag', ' Få gratis   designforslag '));
  s.klikk(lenke('/kontakt/', 'Kontakt', 'topp'));
  s.klikk(lenke('/priser/', 'Priser'));
  const hendelser = s.dl().filter((a) => a[0] === 'event' && /^klikk_/.test(a[1]));
  assert.deepEqual(hendelser.map((a) => a[1]), ['klikk_epost', 'klikk_telefon', 'klikk_kontakt', 'klikk_kontakt']);
  assert.deepEqual(hendelser[2][2], { plassering: 'innhold', lenketekst: 'Få gratis designforslag', tjeneste: 'designforslag' });
  assert.equal(hendelser[3][2].plassering, 'toppmeny');
  assert.ok(!JSON.stringify(hendelser).match(/example\.com|12345678|123 45/));
});

test('generate_lead sendes etter samtykke', () => {
  const s = last({ lagret: { v: 1, statistikk: true }, href: 'https://vortexlabs.no/kontakt/' });
  s.window.vlStatistikk('generate_lead', { tjeneste: 'tilbud-app' });
  assert.deepEqual(s.dl().at(-1), ['event', 'generate_lead', { tjeneste: 'tilbud-app' }]);
});

test('tilbaketrekking stopper innsamling og sletter kapsler', () => {
  const s = last({ lagret: { v: 1, statistikk: true } });
  const før = s.dl().length;
  s.knapp('avsla');
  assert.equal(s.window['ga-disable-' + ID], true);
  assert.deepEqual(s.dl().at(-1), ['consent', 'update', { analytics_storage: 'denied' }]);
  assert.equal(s.kapsler()._ga, undefined);
  assert.equal(s.kapsler()._ga_VVKJ23QH0E, undefined);
  assert.equal(s.kapsler().annen, 'x', 'andre kapsler røres ikke');
  const etter = s.dl().length;
  assert.equal(etter, før + 1);
  s.window.vlStatistikk('generate_lead', { tjeneste: 'annet' });
  assert.equal(s.dl().length, etter, 'ingen hendelser etter tilbaketrekking');
  s.knapp('endre');
  assert.ok(s.banner(), 'banneret kan åpnes igjen fra bunnteksten');
});
