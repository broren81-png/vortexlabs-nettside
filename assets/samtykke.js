/* Vortex Labs Norway – samtykke til statistikk og Google Analytics 4.
 *
 * Basic Consent Mode v2: Google-taggen lastes ikke, og ingenting sendes til Google,
 * før besøkende har trykket «Godta statistikk». Avslag og tilbaketrekking stopper all
 * innsamling. Valget lagres bare lokalt i nettleseren (localStorage, ingen informasjonskapsel).
 *
 * Det sendes aldri navn, e-post, telefonnummer eller skjemainnhold til Analytics.
 * Adressen og forrige side renses for alle URL-parametere utenom UTM-parametere
 * og et fåtall ikke-personlige parametere nettsiden selv bruker.
 */
(function () {
  'use strict';
  var MALINGS_ID = 'G-VVKJ23QH0E';
  var NOKKEL = 'vl-samtykke';
  var VERSJON = 1;
  var lastet = false;

  /* ---------- Lagret valg ---------- */
  var lesValg = function () {
    try {
      var v = JSON.parse(localStorage.getItem(NOKKEL) || 'null');
      return v && v.v === VERSJON && typeof v.statistikk === 'boolean' ? v.statistikk : null;
    } catch (e) { return null; }
  };
  var lagreValg = function (statistikk) {
    try { localStorage.setItem(NOKKEL, JSON.stringify({ v: VERSJON, statistikk: statistikk, dato: new Date().toISOString().slice(0, 10) })); } catch (e) { /* privat modus o.l. */ }
  };

  /* ---------- Rensing av adresser ---------- */
  // UTM-parametere fra kampanjer, og nettsidens egne parametere (ingen personopplysninger).
  var TILLATT = /^(utm_(source|medium|campaign|term|content|id|source_platform|creative_format|marketing_tactic)|tjeneste|pakke|produkt|filter|kilde)$/;
  var rensUrl = function (adresse, beholdParametere) {
    try {
      var u = new URL(adresse, location.href);
      if (!/^https?:$/.test(u.protocol)) return '';
      var ut = new URL(u.origin + u.pathname);
      if (beholdParametere) u.searchParams.forEach(function (verdi, navn) {
        if (TILLATT.test(navn) && verdi.length <= 100 && !/@/.test(verdi)) ut.searchParams.append(navn, verdi);
      });
      return ut.href;
    } catch (e) { return ''; }
  };

  /* ---------- Innholdsgrupper ---------- */
  var sti = location.pathname;
  var gruppe = (function () {
    if (/\/northcast(\/|$)/.test(sti)) return 'Northcast';
    if (/\/kalorivenn(\/|$)/.test(sti)) return 'KaloriVenn';
    if (/^\/priser(\/|$)/.test(sti)) return 'Priser';
    if (/^\/(tjenester|nettsider|apputvikling|bedriftssystemer|vedlikehold|nettside-toten-gjovik)(\/|$)/.test(sti)) return 'Tjenester';
    if (/^\/kjop-app(\/|$)/.test(sti)) return 'Kjøp app';
    if (/^\/prosjekter(\/|$)/.test(sti)) return 'Prosjekter';
    if (/^\/artikler(\/|$)/.test(sti)) return 'Artikler';
    if (/^\/bransjer(\/|$)/.test(sti)) return 'Bransjer';
    if (/^\/kontakt(\/|$)/.test(sti)) return 'Kontakt';
    return sti === '/' ? 'Forside' : 'Annet';
  })();

  /* ---------- Google Analytics ---------- */
  window.dataLayer = window.dataLayer || [];
  var gtag = function () { window.dataLayer.push(arguments); };

  var startAnalytics = function () {
    window['ga-disable-' + MALINGS_ID] = false;
    if (lastet) { gtag('consent', 'update', { analytics_storage: 'granted' }); return; }
    lastet = true;
    // Hindrer dobbel innlasting hvis en annen Google-tagg mot samme ID finnes.
    if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return;
    gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
    gtag('consent', 'update', { analytics_storage: 'granted' });
    gtag('set', { allow_google_signals: false, allow_ad_personalization_signals: false, content_group: gruppe });
    gtag('js', new Date());
    var forrige = document.referrer ? rensUrl(document.referrer, false) : '';
    var oppsett = {
      page_location: rensUrl(location.href, true),
      page_title: document.title,
      cookie_expires: 60 * 60 * 24 * 395, // 13 måneder
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    };
    if (forrige) oppsett.page_referrer = forrige;
    gtag('config', MALINGS_ID, oppsett);
    // Egne hendelser for besøk på nøkkelsider (sidevisningen kommer fra config).
    if (gruppe === 'Northcast') gtag('event', 'besok_northcast');
    if (gruppe === 'KaloriVenn') gtag('event', 'besok_kalorivenn');
    if (gruppe === 'Tjenester' || gruppe === 'Priser') gtag('event', 'besok_tjeneste_pris');
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MALINGS_ID;
    document.head.appendChild(s);
  };

  var slettGaKapsler = function () {
    var verter = ['', location.hostname, '.' + location.hostname.replace(/^www\./, '')];
    document.cookie.split(';').forEach(function (c) {
      var navn = c.split('=')[0].trim();
      if (!/^_ga(_|$)|^_gid$|^_gat/.test(navn)) return;
      verter.forEach(function (v) {
        document.cookie = navn + '=; Max-Age=0; path=/' + (v ? '; domain=' + v : '');
      });
    });
  };

  var stoppAnalytics = function () {
    window['ga-disable-' + MALINGS_ID] = true;
    if (lastet) gtag('consent', 'update', { analytics_storage: 'denied' });
    slettGaKapsler();
  };

  // Brukes av app.js for vellykket skjemainnsending. Sender bare når samtykke er gitt.
  var maal = function (hendelse, parametere) {
    if (!lastet || lesValg() !== true) return;
    gtag('event', hendelse, parametere || {});
  };
  window.vlStatistikk = maal;

  /* ---------- Klikk på kontaktknapper, e-post og telefon ---------- */
  var plassering = function (el) {
    if (el.closest('.topp')) return 'toppmeny';
    if (el.closest('.bunn')) return 'bunntekst';
    return 'innhold';
  };
  document.addEventListener('click', function (e) {
    if (!lastet) return;
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/^mailto:/i.test(href)) return maal('klikk_epost', { plassering: plassering(a) });
    if (/^tel:/i.test(href)) return maal('klikk_telefon', { plassering: plassering(a) });
    var u;
    try { u = new URL(href, location.href); } catch (x) { return; }
    if (u.origin !== location.origin || !/^\/kontakt\/?$/.test(u.pathname) || /^\/kontakt\/?$/.test(location.pathname)) return;
    var tjeneste = u.searchParams.get('tjeneste') || '';
    maal('klikk_kontakt', {
      plassering: plassering(a),
      lenketekst: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100),
      tjeneste: /^[a-z0-9-]{1,40}$/.test(tjeneste) ? tjeneste : '(ingen)',
    });
  }, true);

  /* ---------- Samtykkebanner ---------- */
  var banner;
  var lukkBanner = function () { if (banner) { banner.remove(); banner = null; } };
  var oppdaterStatus = function () {
    var valg = lesValg();
    Array.prototype.forEach.call(document.querySelectorAll('[data-samtykke-status]'), function (el) {
      el.textContent = valg === true ? 'Du har godtatt statistikk.' : valg === false ? 'Du har avslått statistikk.' : 'Du har ikke tatt stilling til statistikk ennå.';
    });
  };
  var velg = function (statistikk) {
    lagreValg(statistikk);
    lukkBanner();
    oppdaterStatus();
    if (statistikk) startAnalytics(); else stoppAnalytics();
  };
  var visBanner = function (fokus) {
    if (banner) { if (fokus) banner.querySelector('button').focus(); return; }
    banner = document.createElement('section');
    banner.className = 'samtykke';
    banner.setAttribute('aria-label', 'Samtykke til statistikk');
    banner.innerHTML =
      '<p><strong>Får vi måle besøket?</strong> Med ditt samtykke bruker vi Google Analytics til statistikk om hvordan nettsiden brukes. Vi bruker det ikke til annonser. <a href="/personvern/#statistikk">Les mer</a></p>' +
      '<div class="samtykke-valg"><button type="button" class="knapp omriss" data-valg="nei">Avslå</button><button type="button" class="knapp omriss" data-valg="ja">Godta statistikk</button></div>';
    banner.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-valg]');
      if (b) velg(b.getAttribute('data-valg') === 'ja');
    });
    document.body.appendChild(banner);
    if (fokus) banner.querySelector('button').focus();
  };

  // Knapper for å endre valget (bunntekst og personvernsiden).
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-samtykke]') : null;
    if (!b) return;
    var hva = b.getAttribute('data-samtykke');
    if (hva === 'endre') visBanner(true);
    else if (hva === 'godta') velg(true);
    else if (hva === 'avsla') velg(false);
  });

  var start = function () {
    var valg = lesValg();
    oppdaterStatus();
    if (valg === true) startAnalytics();
    else if (valg === null) visBanner(false);
    else slettGaKapsler();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
