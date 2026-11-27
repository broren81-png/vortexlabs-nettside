/* Vortex Labs Norway – felles skript. Ingen avhengigheter. Statistikk (bare etter samtykke) ligger i samtykke.js. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var kr = function (n) { return Math.round(n).toLocaleString('nb-NO') + ' kr'; };
  var params = new URLSearchParams(location.search);

  /* Meny på mobil */
  var knapp = $('.menyknapp'), meny = $('#meny');
  if (knapp && meny) {
    knapp.addEventListener('click', function () {
      var apen = meny.classList.toggle('apen');
      knapp.setAttribute('aria-expanded', apen ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && meny.classList.contains('apen')) { meny.classList.remove('apen'); knapp.setAttribute('aria-expanded', 'false'); knapp.focus(); }
    });
  }

  /* Fram-animasjon */
  var deler = $$('.fram');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (oppf) {
      oppf.forEach(function (o) { if (o.isIntersecting) { o.target.classList.add('synlig'); obs.unobserve(o.target); } });
    }, { threshold: 0.08 });
    deler.forEach(function (d) { obs.observe(d); });
  } else { deler.forEach(function (d) { d.classList.add('synlig'); }); }

  /* Lysboks */
  var boks = $('#lysboks');
  if (boks && typeof boks.showModal === 'function') {
    var bilde = document.createElement('img'); boks.appendChild(bilde);
    $$('button.zoom').forEach(function (b) {
      b.addEventListener('click', function () {
        bilde.src = b.getAttribute('data-stort');
        var img = $('img', b); bilde.alt = img ? img.alt : '';
        boks.showModal();
      });
    });
    $('button', boks).addEventListener('click', function () { boks.close(); });
    boks.addEventListener('click', function (e) { if (e.target === boks) boks.close(); });
  } else { $$('button.zoom').forEach(function (b) { b.style.cursor = 'default'; }); }

  /* Filter på prosjekter */
  var filterknapper = $$('.filter button');
  if (filterknapper.length) {
    var velg = function (f) {
      filterknapper.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-filter') === f ? 'true' : 'false'); });
      $$('#prosjektliste .prosjekt').forEach(function (p) {
        var k = (p.getAttribute('data-kategorier') || '').split(' ');
        p.hidden = !(f === 'alle' || k.indexOf(f) !== -1);
        if (!p.hidden) p.classList.add('synlig');
      });
    };
    filterknapper.forEach(function (b) { b.addEventListener('click', function () { velg(b.getAttribute('data-filter')); }); });
    var fra = params.get('filter');
    if (fra && $('.filter button[data-filter="' + fra + '"]')) velg(fra);
  }

  /* Priskalkulator */
  var kalk = $('#kalk'), dataEl = $('#prisdata');
  if (kalk && dataEl) {
    var P = JSON.parse(dataEl.textContent);
    var pakker = {}; P.pakker.forEach(function (p) { pakker[p.id] = p; });
    var tillegg = {}; P.tillegg.forEach(function (t) { tillegg[t.id] = t; });

    var regn = function () {
      var pakke = pakker[(kalk.querySelector('input[name="pakke"]:checked') || {}).value];
      if (!pakke) return;
      var inkl = pakke.inkluderer || [];
      var valgt = [], auto = [];
      // Fjern tidligere automatiske valg; de legges til på nytt hvis de fortsatt kreves
      $$('input[name="tillegg"][data-auto="1"]', kalk).forEach(function (cb) { cb.checked = false; cb.removeAttribute('data-auto'); });
      $$('input[name="tillegg"]', kalk).forEach(function (cb) {
        var id = cb.value, tekst = $('[data-tilleggstekst="' + id + '"]', kalk);
        if (inkl.indexOf(id) !== -1) {
          cb.checked = true; cb.disabled = true; tekst.textContent = 'Inngår i ' + pakke.navn;
        } else {
          if (cb.disabled) { cb.disabled = false; cb.checked = false; }
          tekst.textContent = '+ ' + kr(tillegg[id].pris);
          if (cb.checked) valgt.push(id);
        }
      });
      // Avhengigheter: et tillegg som krever et annet, legger det til automatisk
      valgt.slice().forEach(function (id) {
        (tillegg[id].krever || []).forEach(function (k) {
          if (inkl.indexOf(k) === -1 && valgt.indexOf(k) === -1) { valgt.push(k); auto.push(k); }
        });
      });
      $$('input[name="tillegg"]', kalk).forEach(function (cb) {
        if (auto.indexOf(cb.value) !== -1) { cb.checked = true; cb.setAttribute('data-auto', '1'); $('[data-tilleggstekst="' + cb.value + '"]', kalk).textContent = '+ ' + kr(tillegg[cb.value].pris) + ' (kreves av valgt funksjon)'; }
      });
      var sum = pakke.pris, linjer = ['<li><span>' + pakke.navn + '</span><span>' + kr(pakke.pris) + '</span></li>'];
      inkl.forEach(function (id) { linjer.push('<li><span>' + tillegg[id].navn + '</span><span>Inngår</span></li>'); });
      valgt.forEach(function (id) { sum += tillegg[id].pris; linjer.push('<li><span>' + tillegg[id].navn + '</span><span>+ ' + kr(tillegg[id].pris) + '</span></li>'); });
      $('#kalk-sum').textContent = kr(sum);
      $('#kalk-inkl').textContent = 'eks. mva. · ca. ' + kr(sum * (1 + P.mva)) + ' inkl. mva.';
      $('#kalk-linjer').innerHTML = linjer.join('');

      var iv = P.individuellVurdering, varsler = [];
      var komb = iv.kombinasjoner.some(function (k) { return k.every(function (id) { return valgt.indexOf(id) !== -1 || inkl.indexOf(id) !== -1; }); });
      if (pakke.type === 'nettside' && (valgt.indexOf('admin') !== -1 || valgt.indexOf('betaling') !== -1 || valgt.indexOf('konto') !== -1)) varsler.push('Nettside med innlogging, administrasjon eller betaling nærmer seg en webapp. Vi vurderer hva som passer best.');
      if (valgt.length >= iv.maksTillegg || komb) varsler.push('Denne kombinasjonen bør vurderes individuelt. Estimatet er et utgangspunkt, og endelig pris kan bli både høyere og lavere.');
      $('#kalk-varsel').innerHTML = varsler.map(function (v) { return '<p class="varsel">' + v + '</p>'; }).join('');

      var alle = inkl.concat(valgt);
      var q = new URLSearchParams({ tjeneste: pakke.type === 'nettside' ? 'tilbud-nettside' : pakke.type === 'webapp' ? 'tilbud-webapp' : 'tilbud-app', pakke: pakke.id, tillegg: valgt.join(','), estimat: String(sum) });
      $('#kalk-tilbud').href = '/kontakt/?' + q.toString();
      $('#kalk-tilbud').setAttribute('data-oppsummering', pakke.navn + (alle.length ? ' + ' + alle.map(function (id) { return tillegg[id].navn; }).join(', ') : ''));
    };
    kalk.addEventListener('change', regn);
    regn();
  }

  /* Tilbudsskjema */
  var skjema = $('#tilbudsskjema');
  if (skjema) {
    var tj = $('#tjeneste'), modellFelt = $('#kjopsmodell-felt');
    var visModell = function () {
      modellFelt.hidden = tj.value !== 'kjop-app' && tj.value !== 'interesseliste';
      skjema.elements.kjopsmodell.disabled = modellFelt.hidden;
    };
    if (Array.from(tj.options).some(function (o) { return o.value === params.get('tjeneste'); })) tj.value = params.get('tjeneste');
    tj.addEventListener('change', visModell); visModell();

    // Estimat fra kalkulatoren
    var pakke = params.get('pakke'), est = params.get('estimat'), till = params.get('tillegg'), produkt = params.get('produkt');
    var estTekst = '', timerValgt = params.get('timer');
    if (pakke) {
      estTekst = 'Valgt utgangspunkt: ' + pakke.replace(/[^a-z0-9-]/g, '').slice(0, 60);
      if (timerValgt && /^\d{1,3}$/.test(timerValgt)) estTekst += '. Antall timer: ' + timerValgt;
      if (till) estTekst += '. Funksjoner: ' + till.replace(/[^a-z0-9,-]/g, '').slice(0, 120).split(',').filter(Boolean).join(', ');
      if (est && /^\d{1,9}$/.test(est)) estTekst += '. Veiledende estimat: ' + kr(+est) + ' eks. mva.';
    }
    if (produkt && produkt !== 'northcast') estTekst = 'Interesse for app: ' + produkt.replace(/[^a-z0-9-]/g, '').slice(0, 60);
    if (estTekst) { var eb = $('#estimat'); eb.textContent = estTekst; eb.hidden = false; $('#estimat-felt').value = estTekst; }

    // Hvilken side kunden kom fra (bare adressen på vår egen nettside, ingen sporing)
    var kilde = params.get('kilde') || '';
    var lokalSti = function (s) { return s.length <= 120 && /^\/(?:[a-z0-9-]+\/)*$/.test(s); };
    if (!lokalSti(kilde) && document.referrer) {
      var forrigeSide = new URL(document.referrer);
      kilde = forrigeSide.origin === location.origin ? forrigeSide.pathname : '';
    }
    kilde = lokalSti(kilde) && kilde !== '/kontakt/' ? kilde : '';
    $('#kilde-felt').value = kilde;

    var regler = {
      navn: function (v) { return v.trim().length < 2 ? 'Skriv inn navnet ditt.' : ''; },
      bedrift: function (v) { return v.trim().length < 2 ? 'Skriv inn bedriftsnavnet. Skriv «Privat» hvis du ikke har bedrift.' : ''; },
      epost: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Skriv inn en gyldig e-postadresse.'; },
      telefon: function (v) { return v.trim() && !/^[+\d\s()-]{5,30}$/.test(v.trim()) ? 'Telefonnummeret ser ikke riktig ut.' : ''; },
      nettside: function (v) { return v.trim() && !/^https?:\/\/\S+\.\S+/.test(v.trim()) ? 'Skriv adressen med https:// foran.' : ''; },
      tjeneste: function (v) { return v ? '' : 'Velg hva henvendelsen gjelder.'; },
      beskrivelse: function (v) { return v.trim().length < 10 ? 'Fortell oss litt om prosjektet (minst 10 tegn).' : ''; },
    };
    var sjekk = function (navn) {
      var el = skjema.elements[navn], f = regler[navn](el.value), feilEl = $('#' + navn + '-feil');
      el.setAttribute('aria-invalid', f ? 'true' : 'false');
      if (f) el.setAttribute('aria-describedby', navn + '-feil'); else el.removeAttribute('aria-describedby');
      feilEl.textContent = f; return !f;
    };
    Object.keys(regler).forEach(function (n) { skjema.elements[n].addEventListener('blur', function () { sjekk(n); }); });

    var status = $('#skjemastatus'), send = $('#send-knapp');
    var visStatus = function (type, melding) {
      status.className = 'skjemastatus vis ' + type;
      status.textContent = melding;
      status.focus();
    };
    var endepunkt = ($('meta[name="skjema-endepunkt"]') || {}).content;
    var sikkerhetsfelt = $('#skjema-sikkerhet');
    if (!endepunkt || !sikkerhetsfelt || !sikkerhetsfelt.dataset.sitekey) return;

    var widget, sikkerhetstoken = '', forrigeData, referanse;
    var script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.onload = function () {
      widget = window.turnstile.render(sikkerhetsfelt, {
        sitekey: sikkerhetsfelt.dataset.sitekey,
        action: 'kontakt',
        size: 'flexible',
        callback: function (token) { sikkerhetstoken = token; send.disabled = false; },
        'expired-callback': function () { sikkerhetstoken = ''; },
        'error-callback': function () {
          sikkerhetstoken = '';
          visStatus('feil', 'Sikkerhetskontrollen kunne ikke fullføres. Last siden på nytt og prøv igjen.');
        }
      });
    };
    script.onerror = function () { visStatus('feil', 'Sikkerhetskontrollen kunne ikke lastes. Last siden på nytt og prøv igjen.'); };
    document.head.appendChild(script);

    skjema.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (send.disabled) return;
      var ok = Object.keys(regler).map(sjekk).every(Boolean);
      if (!ok) { var forste = $('[aria-invalid="true"]', skjema); if (forste) forste.focus(); return; }
      if (!sikkerhetstoken) {
        visStatus('feil', 'Fullfør sikkerhetskontrollen og prøv igjen.');
        return;
      }
      var data = Object.fromEntries(new FormData(skjema));
      var utkast = JSON.stringify(data);
      if (utkast !== forrigeData) {
        referanse = crypto.randomUUID();
        forrigeData = utkast;
      }
      data.referanse = referanse;
      data.sikkerhetstoken = sikkerhetstoken;
      send.disabled = true;
      send.textContent = 'Sender …';
      try {
        var respons = await fetch(endepunkt, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data), signal: AbortSignal.timeout(16000)
        });
        var svar = await respons.json().catch(function () { return {}; });
        if (respons.ok && svar.ok === true) {
          // Bare tjenestekategorien sendes, aldri skjemainnhold. Ingenting sendes uten samtykke.
          if (typeof window.vlStatistikk === 'function') window.vlStatistikk('generate_lead', { tjeneste: /^[a-z0-9-]{1,40}$/.test(data.tjeneste || '') ? data.tjeneste : 'annet' });
          skjema.reset();
          $('#kilde-felt').value = kilde;
          $('#estimat').hidden = true;
          estTekst = '';
          forrigeData = undefined;
          visModell();
          visStatus('ok', 'Takk, henvendelsen er sendt. Vi svarer deg på e-post så raskt vi kan.');
        } else {
          visStatus('feil', typeof svar.feil === 'string' ? svar.feil : 'Vi kunne ikke bekrefte innsendingen. Prøv igjen.');
        }
      } catch {
        visStatus('feil', 'Vi kunne ikke bekrefte innsendingen. Sjekk nettet og prøv igjen.');
      } finally {
        sikkerhetstoken = '';
        send.textContent = 'Send henvendelse';
        window.turnstile.reset(widget);
      }
    });
  }
})();
