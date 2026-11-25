/* Vortex Labs Norway – felles skript. Ingen sporing, ingen avhengigheter. */
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
      $('#kalk-tilbud').href = '/kontakt?' + q.toString();
      $('#kalk-tilbud').setAttribute('data-oppsummering', pakke.navn + (alle.length ? ' + ' + alle.map(function (id) { return tillegg[id].navn; }).join(', ') : ''));
    };
    kalk.addEventListener('change', regn);
    regn();
  }

  /* Tilbudsskjema */
  var skjema = $('#tilbudsskjema');
  if (skjema) {
    var tj = $('#tjeneste'), modellFelt = $('#kjopsmodell-felt');
    var visModell = function () { modellFelt.hidden = tj.value !== 'kjop-app' && tj.value !== 'interesseliste'; };
    if (params.get('tjeneste') && $('option[value="' + params.get('tjeneste') + '"]', tj)) tj.value = params.get('tjeneste');
    tj.addEventListener('change', visModell); visModell();

    // Estimat fra kalkulatoren
    var pakke = params.get('pakke'), est = params.get('estimat'), till = params.get('tillegg'), produkt = params.get('produkt');
    var estTekst = '';
    if (pakke) {
      estTekst = 'Valgt utgangspunkt: ' + pakke.replace(/[^a-z0-9-]/g, '');
      if (till) estTekst += '. Funksjoner: ' + till.replace(/[^a-z0-9,-]/g, '').split(',').filter(Boolean).join(', ');
      if (est && /^\d+$/.test(est)) estTekst += '. Veiledende estimat: ' + kr(+est) + ' eks. mva.';
    }
    if (produkt) estTekst = 'Interesse for app: ' + produkt.replace(/[^a-z0-9-]/g, '');
    if (estTekst) { var eb = $('#estimat'); eb.textContent = estTekst; eb.hidden = false; $('#estimat-felt').value = estTekst; }

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
    var visStatus = function (type, html) { status.className = 'skjemastatus vis ' + type; status.innerHTML = html; status.focus(); };
    var startet = Date.now();

    skjema.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = Object.keys(regler).map(sjekk).every(Boolean);
      if (!ok) { var forste = $('[aria-invalid="true"]', skjema); if (forste) forste.focus(); return; }
      if (skjema.elements.firmanettsted.value) return; // honningfelle
      var data = {};
      new FormData(skjema).forEach(function (v, k) { data[k] = String(v).trim(); });
      data.tidBrukt = Math.round((Date.now() - startet) / 1000);
      var endepunkt = (document.querySelector('meta[name="skjema-endepunkt"]') || {}).content;

      if (!endepunkt) {
        // Midlertidig: ingen server ennå. Lag en ferdig utfylt e-post.
        var tjTekst = tj.options[tj.selectedIndex].text;
        var linjer = ['Navn: ' + data.navn, 'Bedrift: ' + data.bedrift, 'E-post: ' + data.epost];
        if (data.telefon) linjer.push('Telefon: ' + data.telefon);
        if (data.nettside) linjer.push('Nettside: ' + data.nettside);
        linjer.push('Gjelder: ' + tjTekst);
        if (data.kjopsmodell) linjer.push('Kjøpsmodell: ' + $('#kjopsmodell').options[$('#kjopsmodell').selectedIndex].text);
        if (data.estimat) linjer.push(data.estimat);
        if (data.budsjett) linjer.push('Budsjett: ' + data.budsjett);
        if (data.leveringstid) linjer.push('Leveringstid: ' + data.leveringstid);
        linjer.push('', 'Beskrivelse:', data.beskrivelse);
        if (data.funksjoner) linjer.push('', 'Ønskede funksjoner:', data.funksjoner);
        var til = (document.querySelector('meta[name="skjema-epost"]') || {}).content;
        var href = 'mailto:' + til + '?subject=' + encodeURIComponent('Henvendelse: ' + tjTekst + ' – ' + data.bedrift) + '&body=' + encodeURIComponent(linjer.join('\n'));
        visStatus('ok', '<strong>Nesten ferdig.</strong> Trykk på knappen under for å sende henvendelsen fra e-postprogrammet ditt. Den er ikke sendt før du har trykket «Send» der.<p style="margin:12px 0 0"><a class="knapp mork" href="' + href + '">Åpne e-post med henvendelsen</a></p>');
        return;
      }

      send.disabled = true; send.textContent = 'Sender …';
      fetch(endepunkt, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, j: j }; }); })
        .then(function (res) {
          if (res.ok) {
            skjema.reset(); visModell();
            visStatus('ok', '<strong>Takk, henvendelsen er sendt.</strong> Vi svarer deg på e-post så raskt vi kan.');
          } else if (res.status === 429) {
            visStatus('feil', 'Du har sendt mange henvendelser på kort tid. Vent litt og prøv igjen.');
          } else {
            visStatus('feil', (res.j && res.j.feil) ? res.j.feil : 'Noe gikk galt, og henvendelsen ble ikke sendt. Prøv igjen, eller send e-post direkte.');
          }
        })
        .catch(function () { visStatus('feil', 'Vi fikk ikke kontakt med serveren, og henvendelsen ble ikke sendt. Sjekk nettet og prøv igjen.'); })
        .then(function () { send.disabled = false; send.textContent = 'Send henvendelse'; });
    });
  }
})();
