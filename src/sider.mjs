import { side, virvel, kr, esc, hake, ikon, telefon, nettleser, avslutt, FIRMA, EPOST, DOMENE } from './layout.mjs';
import { PROSJEKTER, KATEGORINAVN } from './prosjekter.mjs';
import { northcastHenvendelser, northcastPresentasjon, northcastProsjektside } from './northcast-salg.mjs';
import { kalorivennPresentasjon, kalorivennSalgsvilkar } from './kalorivenn-salg.mjs';

export function lagSider(priser, salg, nettsted) {
  const northcast = salg.produkter.find((p) => p.id === 'northcast' && p.godkjentForSalg === true);
  const kalorivenn = salg.produkter.find((p) => p.id === 'kalorivenn' && p.godkjentForSalg === true);
  const g = Object.fromEntries(priser.grunntyper.map((t) => [t.id, t.pris]));
  const pk = Object.fromEntries(priser.pakker.map((p) => [p.id, p]));
  const sider = [];
  const legg = (s) => sider.push(s);

  const fraPriser = `<p class="prisetikett">Fra-priser, eks. mva.</p><ul class="prisbrikker" aria-label="Fra-priser eks. mva.">
    <li>Nettsider fra <strong>${kr(g.nettside)}</strong></li>
    <li>Webapper fra <strong>${kr(g.webapp)}</strong></li>
    <li>Mobilapper fra <strong>${kr(g.mobilapp)}</strong></li>
  </ul><p class="liten-tekst">Endelig fastpris avtales før vi starter.</p>`;

  const pakkekort = (ider) => `<div class="pakker">${ider.map((id) => {
    const p = pk[id];
    return `<article class="pakke${p.fremhevet ? ' fremhevet' : ''} fram">
      ${p.fremhevet ? '<span class="etikett">Mest valgt</span>' : ''}
      <h3>${p.navn}</h3>
      <div class="fra">fra ${kr(p.pris)} <small>eks. mva.</small></div>
      ${hake(p.punkter)}
      <a class="knapp ${p.fremhevet ? 'prim' : 'omriss'}" href="/kontakt?tjeneste=${p.type === 'nettside' ? 'tilbud-nettside' : p.type === 'webapp' ? 'tilbud-webapp' : 'tilbud-app'}&amp;pakke=${p.id}">Be om tilbud på ${p.navn}</a>
    </article>`;
  }).join('')}</div>`;

  const forbehold = `<p class="forbehold">Prisene er fra-priser eks. mva. Endelig fastpris settes etter at vi har gått gjennom behovet ditt, og avtales før vi starter. Eksterne tjenester, avgifter til App Store og Google Play, hosting og større integrasjoner kan komme i tillegg. Vi kan ikke love at en app blir godkjent i App Store eller Google Play, men vi hjelper deg gjennom prosessen.</p>`;

  const prosjektkort = (p) => {
    const forste = p.bilder.find((b) => b.bred) || p.bilder[0];
    const bilde = forste
      ? `<div class="bilde" style="--farge-lys: var(--${p.farge}-lys)"><img src="${forste.src}" alt="" loading="lazy"></div>`
      : `<div class="bilde ikonbilde" style="--farge-lys: var(--${p.farge}-lys)">${p.ikon ? `<img src="${p.ikon}" alt="" loading="lazy">` : ''}</div>`;
    return `<a class="prosjekt fram" href="/prosjekter/${p.id}" data-kategorier="${p.kategorier.join(' ')}">
      ${bilde}
      <div class="tekst">
        <div class="brikker"><span class="brikke status">${p.status}</span><span class="brikke">${p.type}</span>${p.kategorier.map((k) => `<span class="brikke">${KATEGORINAVN[k]}</span>`).join('')}</div>
        <h3>${p.navn}</h3>
        <p>${p.kort}</p>
      </div>
    </a>`;
  };

  const prosess = `<ol class="steg">
    <li><h3>Du forteller om behovet</h3><p>En uforpliktende prat om hva du trenger, hvem det er for og hva det skal oppnå.</p></li>
    <li><h3>Vi avklarer og lager et forslag</h3><p>Vi går gjennom funksjonene sammen og lager et forslag til løsning og design.</p></li>
    <li><h3>Du får fastpris</h3><p>Et konkret tilbud med avtalt fastpris før noe arbeid starter.</p></li>
    <li><h3>Vi utvikler og viser underveis</h3><p>Du ser løsningen jevnlig og kan gi tilbakemeldinger mens den bygges.</p></li>
    <li><h3>Testing og levering</h3><p>Løsningen testes og leveres, og vi hjelper med domene eller publisering.</p></li>
    <li><h3>Drift og vedlikehold</h3><p>Etter avtale kan vi holde løsningen oppdatert og videreutvikle den.</p></li>
  </ol>`;

  const hvorforMer = `<div class="rutenett r3">
    <div class="kort fram"><div class="ikon">${ikon.verktoy}</div><h3>Moderne verktøy</h3><p>Vi bruker moderne utviklingsverktøy og effektive arbeidsprosesser, slik at mer av budsjettet går til selve løsningen.</p></div>
    <div class="kort fram"><div class="ikon">${ikon.prat}</div><h3>Direkte kontakt</h3><p>Du snakker direkte med utvikleren. Ingen prosjektledere eller mellomledd som må betales.</p></div>
    <div class="kort fram"><div class="ikon">${ikon.pris}</div><h3>Fastpris før oppstart</h3><p>Du vet hva det koster før vi starter. Endringer underveis avtales og prises før de gjøres.</p></div>
  </div>`;

  /* ---------- Forside ---------- */
  legg({
    sti: '/', tittel: 'Nettsider, apper og bedriftssystemer for småbedrifter | Vortex Labs Norway', bilde: '/bilder/og.jpg',
    beskrivelse: `Nettsider fra ${kr(g.nettside)}, webapper fra ${kr(g.webapp)} og mobilapper fra ${kr(g.mobilapp)} eks. mva. for norske småbedrifter. Studio fra Toten med fastpris og levering i hele Norge.`,
    innhold: `
<section class="hero forside">${virvel}
  <div class="ramme hero-grid">
    <div>
      <span class="merkelapp">Uavhengig utviklingsstudio fra Toten</span>
      <h1>Nettsider, apper og <em>bedriftssystemer</em> for småbedrifter</h1>
      <p class="ingress">Fra første idé til ferdig løsning, med fastpris og direkte kontakt med utvikleren. Vi holder til på Toten og leverer i hele Norge.</p>
      <div class="knapper">
        <a class="knapp prim" href="/kontakt?tjeneste=designforslag">Få gratis designforslag</a>
        <a class="knapp sek" href="/prosjekter">Se våre prosjekter</a>
      </div>
      <p class="snarvei">Trenger du app eller system? <a href="/apputvikling">Apputvikling</a> · <a href="/bedriftssystemer">Bedriftssystemer</a> · <a href="/kontakt?tjeneste=annet">Fortell om prosjektet</a></p>
      ${fraPriser}
    </div>
    <div class="hero-visuell" aria-hidden="true">
      <div class="nettleser"><div class="linje"><i></i><i></i><i></i><span>hentbilen.no</span></div><img src="/bilder/hb-forside.webp" alt="" width="1200" height="750"></div>
      <div class="telefon"><img src="/bilder/kv-idag.webp" alt="" width="560" height="1218"></div>
    </div>
  </div>
</section>
<div class="stripe"><div class="ramme"><ul>
  <li><strong>Norsk utvikling</strong>Laget på Toten, for kunder i hele Norge</li>
  <li><strong>Fastpris før oppstart</strong>Du vet hva det koster</li>
  <li><strong>Direkte kontakt</strong>Du snakker med utvikleren</li>
  <li><strong>Gratis designforslag</strong>Uforpliktende første skisse</li>
</ul></div></div>

<section>
  <div class="ramme">
    <div class="seksjonstopp fram"><span class="overtittel">Tjenester</span><h2>Det vi lager for bedrifter</h2><p class="lead">Fra en enkel bedriftsnettside til et komplett system for ordre, sjåfører og kunder.</p></div>
    <div class="rutenett r3">
      <a class="kort lenke fram" href="/nettsider"><div class="ikon">${ikon.nett}</div><h3>Nettsider</h3><p>Raske, mobiltilpassede bedriftsnettsider som er lette å finne på Google.</p><span class="fra">fra ${kr(g.nettside)} <small>eks. mva.</small></span><span class="mer">Les om nettsider →</span></a>
      <a class="kort lenke fram" href="/apputvikling"><div class="ikon">${ikon.app}</div><h3>Mobilapper</h3><p>Apper for iPhone og Android, med hjelp til publisering i App Store og Google Play.</p><span class="fra">fra ${kr(g.mobilapp)} <small>eks. mva.</small></span><span class="mer">Les om apputvikling →</span></a>
      <a class="kort lenke fram" href="/bedriftssystemer"><div class="ikon">${ikon.system}</div><h3>Webapper og bedriftssystemer</h3><p>Booking, ordrehåndtering, kundeportaler og interne verktøy, tilpasset din drift.</p><span class="fra">fra ${kr(g.webapp)} <small>eks. mva.</small></span><span class="mer">Les om bedriftssystemer →</span></a>
    </div>
  </div>
</section>

<section class="flate">
  <div class="ramme">
    <div class="seksjonstopp fram"><span class="overtittel">Prosjekter</span><h2>Vi bygger og driver våre egne løsninger</h2><p class="lead">Den beste måten å vise hva vi kan, er å vise hva vi har laget. Dette er egne prosjekter og produkter, ikke kundeoppdrag.</p></div>
    <article class="fremhevet-prosjekt fram">
      <div class="fp-tekst">
        <div class="brikker"><span class="brikke status">I drift</span><span class="brikke">Egen virksomhet</span><span class="brikke">Nettside</span><span class="brikke">Bedriftssystem</span></div>
        <h3><img src="/bilder/hentbilen.png" alt="" width="40" height="40">HentBilen</h3>
        <p>Biltransporttjenesten vi driver selv. Kunden får et prisestimat og sender transportforespørselen på nettsiden. Forespørselen havner i et internt system for tilbud og oppdrag, og sjåføren følger oppdraget i en egen sjåførportal på mobilen.</p>
        <div class="knapper"><a class="knapp mork" href="/prosjekter/hentbilen">Se HentBilen-prosjektet</a><a class="knapp omriss" href="https://hentbilen.no" rel="noopener">Besøk hentbilen.no</a></div>
      </div>
      <a class="fp-bilde" href="/prosjekter/hentbilen" tabindex="-1" aria-hidden="true"><img src="/bilder/hb-kalkulator.webp" alt="" width="1200" height="750" loading="lazy"></a>
    </article>
    <div class="prosjekter" style="margin-top:20px">${['kalorivenn', 'dagsbudsjett'].map((id) => prosjektkort(PROSJEKTER.find((p) => p.id === id))).join('')}
      <a class="prosjekt fram" href="/kjop-app"><div class="bilde ikonbilde" style="--farge-lys: var(--mynte-lys)"><img src="/bilder/favicon.svg" alt="" loading="lazy"></div><div class="tekst"><div class="brikker"><span class="brikke status">Salgskatalog</span></div><h3>Kjøp din egen app</h3><p>Ferdigutviklede apper og digitale produkter for deg som vil bli appeier uten å være programmerer.</p></div></a>
    </div>
    <p style="margin-top:24px"><a class="knapp omriss" href="/prosjekter">Se alle prosjektene</a></p>
  </div>
</section>

<section>
  <div class="ramme">
    <div class="seksjonstopp fram"><span class="overtittel">Hvorfor oss</span><h2>Hvorfor betale mer enn nødvendig?</h2><p class="lead">Et lite studio med moderne verktøy og direkte kommunikasjon har lavere kostnader enn et stort byrå. Det betyr ikke at vi alltid er billigst, men at du får mye for pengene.</p></div>
    ${hvorforMer}
  </div>
</section>

<section class="mork">
  <div class="ramme">
    <div class="seksjonstopp fram"><span class="overtittel">Slik jobber vi</span><h2>Fra idé til ferdig løsning</h2></div>
    ${prosess}
  </div>
</section>

<section>
  <div class="ramme">
    <div class="rutenett r2">
      <div class="fram"><span class="overtittel">Kjøp din egen app</span><h2>Hvorfor starte fra bunnen av?</h2><p class="lead">Kjøp en ferdigutviklet app og start din egen digitale virksomhet. Velg mellom salgsklare produkter, allerede publiserte apper og etablerte digitale konsepter. Bli appeier, på dine premisser.</p><p style="margin-top:20px" class="knapper"><a class="knapp mork" href="/kjop-app">Se salgskatalogen</a><a class="knapp omriss" href="/kontakt?tjeneste=interesseliste">Interesseliste</a></p></div>
      <div class="kort fram"><h3>Gratis designforslag til nettside</h3><p>Fortell oss om bedriften din, så lager vi et uforpliktende, innledende designforslag. Forslaget er en visuell skisse av hvordan nettsiden kan se ut, ikke en ferdig nettside.</p><p style="margin-top:18px"><a class="knapp prim" href="/kontakt?tjeneste=designforslag">Få gratis designforslag</a></p></div>
    </div>
  </div>
</section>
${avslutt('Har du en idé?', 'Fortell oss om prosjektet ditt', 'Vi svarer så snart vi kan, og første samtale er gratis og uforpliktende.')}`,
  });

  /* ---------- Nettsider ---------- */
  legg({
    sti: '/nettsider', tittel: 'Nettside til bedrift og småbedrifter fra 4 990 kr | Vortex Labs Norway',
    beskrivelse: `Bedriftsnettside for småbedrifter fra ${kr(g.nettside)} eks. mva.: mobiltilpasset design, kontaktskjema og SEO. Gratis designforslag, fastpris og levering i hele Norge.`,
    innhold: `
<section class="hero liten">${virvel}<div class="ramme hero-grid">
  <div><span class="merkelapp">Nettsider</span><h1>Bedriftsnettside for <em>småbedrifter</em></h1>
  <p class="ingress">En profesjonell nettside som ser bra ut på mobil, er lett å finne på Google og får kundene til å ta kontakt. Fra ${kr(g.nettside)} eks. mva.</p>
  <div class="knapper"><a class="knapp prim" href="/kontakt?tjeneste=designforslag">Få gratis designforslag</a><a class="knapp sek" href="/priser">Se alle priser</a></div></div>
  <div class="hero-visuell">${nettleser('/bilder/hb-forside.webp', 'Eksempel: forsiden vi har laget for HentBilen', 'hentbilen.no')}</div>
</div></section>
<section><div class="ramme">
  <div class="seksjonstopp fram"><span class="overtittel">Pakker</span><h2>Hva koster en nettside?</h2><p class="lead">To faste utgangspunkt. Trenger du noe annet, lager vi en pris som passer.</p></div>
  ${pakkekort(['nettside-start', 'nettside-business'])}
  ${forbehold}
</div></section>
<section class="flate"><div class="ramme rutenett r2">
  <div class="fram"><span class="overtittel">Det du får</span><h2>En nettside som jobber for deg</h2>
  ${hake(['Design som passer bedriften din, ikke en ferdig mal', 'Rask og mobiltilpasset, med god lesbarhet', 'Grunnleggende søkemotoroptimalisering: titler, beskrivelser, struktur og sitemap', 'Kontaktskjema som sender henvendelser til deg', 'Hjelp med domene og publisering', 'Mulighet for vedlikeholdsavtale fra ' + kr(priser.vedlikehold.nettside.pris) + ' per måned'])}</div>
  <div class="fram"><span class="overtittel">Eksempel</span><h2>Nettside for transportfirma</h2><p class="lead">For HentBilen har vi laget en bedriftsnettside med egne landingssider for ulike typer transport, og en priskalkulator som gir kunden et estimat med en gang.</p><p style="margin-top:18px"><a class="knapp omriss" href="/prosjekter/hentbilen">Se HentBilen-prosjektet</a></p></div>
</div></section>
<section class="tett"><div class="ramme"><div class="seksjonstopp fram"><span class="overtittel">Les også</span><h2>Mer om dette</h2></div><ul class="lenkeliste fram">${[['/tjenester/modernisering-av-nettside', 'Modernisering og mobiltilpasning'], ['/tjenester/nettside-med-booking', 'Nettside med booking'], ['/tjenester/nettside-med-priskalkulator', 'Nettside med priskalkulator'], ['/tjenester/sokemotoroptimalisering', 'Søkemotoroptimalisering'], ['/bransjer', 'Nettsider for din bransje'], ['/artikler/hva-koster-en-nettside', 'Hva koster en nettside?']].map(([h, n]) => `<li><a href="${h}">${n}</a></li>`).join('')}</ul></div></section>
${avslutt('Vil du se hvordan nettsiden din kan bli?', 'Få gratis designforslag', 'Uforpliktende og gratis. Du får en visuell skisse før du bestemmer deg.')}`,
  });

  /* ---------- Apputvikling ---------- */
  legg({
    sti: '/apputvikling', tittel: 'Utvikling av mobilapp for iPhone og Android | Vortex Labs Norway',
    beskrivelse: `Vi utvikler mobilapper for iPhone og Android fra ${kr(g.mobilapp)} eks. mva. Apputvikling i Norge med fastpris, egne apper i App Store og hjelp med publisering.`,
    innhold: `
<section class="hero liten">${virvel}<div class="ramme hero-grid">
  <div><span class="merkelapp">Apputvikling</span><h1>Utvikling av mobilapp for <em>iPhone og Android</em></h1>
  <p class="ingress">Vi lager apper for iOS og Android med én felles kodebase, og hjelper deg med publisering i App Store og Google Play. Fra ${kr(g.mobilapp)} eks. mva.</p>
  <div class="knapper"><a class="knapp prim" href="/kontakt?tjeneste=tilbud-app">Be om tilbud på app</a><a class="knapp sek" href="/priser#kalkulator">Beregn pris</a></div></div>
  <div class="telefoner" aria-hidden="true"><div class="telefon a"><img src="/bilder/db-idag.webp" alt="" width="560" height="1218"></div><div class="telefon b"><img src="/bilder/kv-kjoleskap.webp" alt="" width="560" height="1218"></div></div>
</div></section>
<section><div class="ramme">
  <div class="seksjonstopp fram"><span class="overtittel">Pakker</span><h2>Hva koster det å lage en app?</h2><p class="lead">Prisen avhenger av hva appen skal gjøre. Her er tre utgangspunkt, og i <a href="/priser#kalkulator">priskalkulatoren</a> kan du sette sammen din egen.</p></div>
  ${pakkekort(['app-start', 'app-business', 'app-premium'])}
  ${forbehold}
</div></section>
<section class="flate"><div class="ramme rutenett r2">
  <div class="fram"><span class="overtittel">Erfaring</span><h2>Vi har egne apper i App Store</h2><p class="lead">KaloriVenn er vår egen app, publisert i App Store med abonnement, kjøp i appen og flere språk. Vi kjenner prosessen fra utvikling til godkjenning.</p><p style="margin-top:18px"><a class="knapp omriss" href="/prosjekter/kalorivenn">Se KaloriVenn</a></p></div>
  <div class="fram"><span class="overtittel">Publisering</span><h2>Dette trenger du for å publisere</h2>
  ${hake(['En utviklerkonto hos Apple (årlig avgift) og Google (engangsavgift) i bedriftens navn', 'Personvernerklæring og butikktekster, som vi hjelper deg med', 'Skjermbilder og ikon, som vi lager', 'Apple og Google gjør sin egen gjennomgang. Vi kan ikke love godkjenning, men vi hjelper deg hele veien'])}</div>
</div></section>
<section class="tett"><div class="ramme"><div class="seksjonstopp fram"><span class="overtittel">Les også</span><h2>Mer om dette</h2></div><ul class="lenkeliste fram">${[['/apputvikling/iphone', 'iPhone-app og App Store'], ['/apputvikling/android', 'Android-app og Google Play'], ['/artikler/hva-koster-det-a-lage-en-app', 'Hva koster det å lage en app?'], ['/artikler/webapp-eller-mobilapp', 'Webapp eller mobilapp?'], ['/kjop-app', 'Kjøp en ferdig app']].map(([h, n]) => `<li><a href="${h}">${n}</a></li>`).join('')}</ul></div></section>
${avslutt()}`,
  });

  /* ---------- Bedriftssystemer ---------- */
  legg({
    sti: '/bedriftssystemer', tittel: 'Skreddersydde webapper, kundeportaler og booking | Vortex Labs Norway',
    beskrivelse: `Skreddersydde webapper fra ${kr(g.webapp)} eks. mva.: kundeportaler, bookingløsninger, ordrehåndtering og sjåførportaler for norske bedrifter. Se HentBilen som eksempel.`,
    innhold: `
<section class="hero liten">${virvel}<div class="ramme hero-grid">
  <div><span class="merkelapp">Webapper og bedriftssystemer</span><h1>Webapper, kundeportaler, booking og <em>ordrehåndtering</em></h1>
  <p class="ingress">Når standardprogrammer ikke passer, lager vi et system som gjør det. Webapper fra ${kr(g.webapp)} eks. mva. Større systemer prises etter avtale.</p>
  <div class="knapper"><a class="knapp prim" href="/kontakt?tjeneste=bedriftssystem">Fortell om behovet</a><a class="knapp sek" href="/prosjekter?filter=bedriftssystem">Se eksempler</a></div></div>
  <div class="hero-visuell">${nettleser('/bilder/hb-kalkulator.webp', 'Eksempel: priskalkulator og bestilling for HentBilen', 'hentbilen.no/bestill')}</div>
</div></section>
<section><div class="ramme">
  <div class="seksjonstopp fram"><span class="overtittel">Eksempler</span><h2>Skreddersydde bedriftssystemer</h2><p class="lead">Pris etter avtale. Her er noe av det vi kan lage:</p></div>
  <div class="rutenett r3">
    ${[['Bookingløsninger', 'Timebestilling og ressursplanlegging med bekreftelser.'], ['Ordre- og oppdragshåndtering', 'Fra forespørsel til tilbud, oppdrag og fakturagrunnlag.'], ['Sjåførportaler', 'Mobile oppdragskort, bilder og digital signatur ved levering.'], ['Kundeportaler', 'Innlogging for kunder med status, dokumenter og historikk.'], ['Digitale skjemaer', 'Erstatt papir og e-post med strukturerte skjemaer.'], ['Priskalkulatorer', 'Gi kundene et prisestimat med en gang, på nettsiden din.'], ['Automatisering', 'La systemet gjøre rutinearbeidet: varsler, eksport og oppfølging.'], ['Interne administrasjonssystemer', 'Kunderegister, oppfølging og oversikt i ett verktøy.'], ['AI-integrasjoner', 'Lesing av dokumenter, forslag og tekst der det gir reell nytte.']].map(([t, b]) => `<div class="kort fram"><h3>${t}</h3><p>${b}</p></div>`).join('')}
  </div>
</div></section>
<section class="flate"><div class="ramme rutenett r2">
  <div class="fram"><span class="overtittel">Webapp</span><h2>Webapp fra ${kr(g.webapp)}</h2>${hake(pk.webapp.punkter)}<p style="margin-top:20px"><a class="knapp prim" href="/kontakt?tjeneste=tilbud-webapp&amp;pakke=webapp">Be om tilbud på webapp</a></p></div>
  <div class="fram"><span class="overtittel">I bruk hos oss selv</span><h2>Systemer vi driver selv</h2><p class="lead">HentBilen drives med et system vi har laget selv, med oppdrag, sjåførportal og fakturagrunnlag. Sjåførsiden er en portal med flere brukerroller og matching.</p><p style="margin-top:18px" class="knapper"><a class="knapp omriss" href="/prosjekter/hentbilen">HentBilen</a><a class="knapp omriss" href="/prosjekter/sjaforsiden">Sjåførsiden</a></p></div>
</div></section>
<section class="tett"><div class="ramme"><div class="seksjonstopp fram"><span class="overtittel">Les også</span><h2>Mer om dette</h2></div><ul class="lenkeliste fram">${[['/tjenester/kundeportal', 'Kundeportaler'], ['/tjenester/administrasjonssystem', 'Administrasjonssystemer'], ['/tjenester/ai-losninger', 'AI-løsninger'], ['/bransjer/transport', 'Systemer for transportfirmaer'], ['/artikler/digitalisere-liten-bedrift', 'Hvordan digitalisere en liten bedrift?']].map(([h, n]) => `<li><a href="${h}">${n}</a></li>`).join('')}</ul></div></section>
${avslutt()}`,
  });

  /* ---------- Priser ---------- */
  const faq = [
    ['Hva koster en nettside?', `En enkel bedriftsnettside starter på ${kr(pk['nettside-start'].pris)} eks. mva., og en større nettside med flere sider på ${kr(pk['nettside-business'].pris)}. Du får fastpris før vi starter.`],
    ['Hva koster det å lage en app?', `En enkel mobilapp for iOS og Android starter på ${kr(pk['app-start'].pris)} eks. mva. Apper med innlogging, database og administrasjon starter på ${kr(pk['app-business'].pris)}. Bruk priskalkulatoren for et estimat.`],
    ['Er prisene faste?', 'Prisene på nettsiden er fra-priser. Etter at vi har gått gjennom behovet ditt, får du et konkret tilbud med fastpris før vi starter. Endringer underveis avtales og prises før de gjøres.'],
    ['Hvor lang tid tar det?', 'Det avhenger av omfanget. En enkel nettside går raskere enn en app med mange funksjoner. Du får en tidsplan sammen med tilbudet.'],
    ['Hvem eier løsningen?', 'Eierskap og rettigheter avtales skriftlig i tilbudet før vi starter, slik at det er klart hva du får.'],
    ['Hva med hosting og domene?', 'Vi hjelper deg med domene og hosting. Kostnader til domene, hosting og andre eksterne tjenester betaler du direkte til leverandøren, eller de avtales i tilbudet.'],
    ['Trenger jeg vedlikeholdsavtale?', `Nei, men det er lurt for apper og systemer som må holdes oppdatert. Vedlikehold starter på ${kr(priser.vedlikehold.nettside.pris)} per måned for nettsider. Omfanget avtales skriftlig.`],
    ['Hjelper dere med å publisere appen?', 'Ja. Du trenger egne utviklerkontoer hos Apple og Google, og så hjelper vi deg med resten. Apple og Google gjør sin egen gjennomgang, så vi kan ikke love godkjenning.'],
    ['Hva er gratis designforslag?', 'Et uforpliktende, innledende visuelt konsept for nettsiden din. Det er ikke en ferdig nettside, men en skisse som viser retningen før du bestemmer deg.'],
  ];
  legg({
    sti: '/priser', tittel: 'Priser på nettside, webapp og app – priskalkulator | Vortex Labs Norway',
    beskrivelse: 'Se fra-priser på nettsider, webapper og mobilapper, og bruk priskalkulatoren for et veiledende estimat. Alle priser eks. mva. med fastpris før oppstart.',
    jsonld: [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }],
    ekstraHode: `<script type="application/json" id="prisdata">${JSON.stringify(priser)}</script>`,
    innhold: `
<section class="hero liten">${virvel}<div class="ramme"><span class="merkelapp">Priser</span><h1>Tydelige priser, <em>fastpris før oppstart</em></h1>
<p class="ingress">Alle priser er fra-priser eks. mva. Du får et konkret tilbud med fastpris før vi starter.</p>
<div class="knapper"><a class="knapp prim" href="#kalkulator">Beregn pris</a><a class="knapp sek" href="/kontakt">Be om tilbud</a></div></div></section>
<section><div class="ramme">
  <div class="seksjonstopp fram"><span class="overtittel">Nettsider og webapp</span><h2>Nettsider og webapper</h2></div>
  ${pakkekort(['nettside-start', 'nettside-business', 'webapp'])}
  <div class="seksjonstopp fram" style="margin-top:64px"><span class="overtittel">Mobilapper</span><h2>Mobilapper for iOS og Android</h2></div>
  ${pakkekort(['app-start', 'app-business', 'app-premium'])}
  <div class="kort fram" style="margin-top:20px"><h3>Skreddersydde bedriftssystemer</h3><p>Booking, ordrehåndtering, sjåfør- og kundeportaler, automatisering og AI-integrasjoner. Pris etter avtale.</p><p style="margin-top:14px"><a class="knapp mork" href="/kontakt?tjeneste=bedriftssystem">Fortell om behovet</a></p></div>
  ${forbehold}
</div></section>
<section class="flate" id="kalkulator"><div class="ramme">
  <div class="seksjonstopp fram"><span class="overtittel">Priskalkulator</span><h2>Hva vil prosjektet ditt koste?</h2><p class="lead">Velg type løsning og funksjoner, så ser du et veiledende estimat med en gang.</p></div>
  <form class="kalkulator" id="kalk" novalidate>
    <div class="kalk-del">
      <h3>1. Velg utgangspunkt</h3>
      <div class="valg" role="radiogroup" aria-label="Utgangspunkt">
        ${priser.pakker.map((p, i) => `<label><input type="radio" name="pakke" value="${p.id}"${i === 0 ? ' checked' : ''}><span><strong>${p.navn}</strong><small>fra ${kr(p.pris)}</small></span></label>`).join('')}
      </div>
      <h3>2. Legg til funksjoner</h3>
      <div class="valg">
        ${priser.tillegg.map((t) => `<label><input type="checkbox" name="tillegg" value="${t.id}"><span><strong>${t.navn}</strong><small data-tilleggstekst="${t.id}">+ ${kr(t.pris)}</small></span></label>`).join('')}
      </div>
      <noscript><p>Kalkulatoren trenger JavaScript. Du kan likevel <a href="/kontakt">be om tilbud</a>.</p></noscript>
    </div>
    <aside class="resultat" aria-live="polite">
      <span class="overtittel">Veiledende estimat</span>
      <div class="sum" id="kalk-sum">–</div>
      <div id="kalk-inkl" style="color:rgba(255,255,255,.6);font-size:.9rem"></div>
      <ul id="kalk-linjer"></ul>
      <div id="kalk-varsel"></div>
      <p class="merknad">Dette er et veiledende prisestimat eks. mva., ikke et bindende tilbud. Endelig pris fastsettes etter gjennomgang av prosjektet.</p>
      <a class="knapp prim" id="kalk-tilbud" href="/kontakt" style="width:100%">Få et konkret tilbud</a>
    </aside>
  </form>
</div></section>
<section><div class="ramme smal faq">
  <div class="seksjonstopp fram"><span class="overtittel">Spørsmål og svar</span><h2>Ofte stilte spørsmål</h2></div>
  ${faq.map(([q, a]) => `<details class="fram"><summary>${q}</summary><p>${a}</p></details>`).join('')}
</div></section>
${avslutt('Klar for et konkret tilbud?', 'Be om tilbud', 'Fortell oss hva du trenger, så får du fastpris før vi starter.')}`,
  });

  /* ---------- Prosjekter ---------- */
  legg({
    sti: '/prosjekter', tittel: 'Våre prosjekter – apper, nettsider og bedriftssystemer | Vortex Labs Norway',
    beskrivelse: 'Se apper, nettsider og bedriftssystemer vi har utviklet: KaloriVenn, Dagsbudsjett, Northcast, Sjåførsiden og HentBilen.',
    innhold: `
<section class="hero liten">${virvel}<div class="ramme"><span class="merkelapp">Våre prosjekter</span><h1>Dette har vi <em>laget selv</em></h1>
<p class="ingress">Egne produkter, egen virksomhet og tekniske utviklingsprosjekter. Ingen av disse er kundeoppdrag, og vi merker hvert prosjekt med hva det er og hvor langt det har kommet.</p></div></section>
<section><div class="ramme">
  <div class="filter" role="group" aria-label="Filtrer prosjekter">
    <button type="button" data-filter="alle" aria-pressed="true">Alle</button>
    <button type="button" data-filter="mobilapp" aria-pressed="false">Mobilapper</button>
    <button type="button" data-filter="nettside" aria-pressed="false">Nettsider</button>
    <button type="button" data-filter="bedriftssystem" aria-pressed="false">Bedriftssystemer</button>
  </div>
  <div class="prosjekter" id="prosjektliste">${PROSJEKTER.map(prosjektkort).join('')}</div>
</div></section>
${avslutt()}`,
  });

  for (const p of PROSJEKTER) {
    if (p.id === 'northcast' && northcast) {
      legg(northcastProsjektside(northcast));
      continue;
    }
    const brede = p.bilder.filter((b) => b.bred);
    const mobil = p.bilder.filter((b) => !b.bred);
    const kalorivennSalg = p.id === 'kalorivenn' && kalorivenn;
    const galleri = p.manglerBilder
      ? `<div class="mangler fram"><strong>Skjermbilder kommer.</strong> ${p.navn} er under utvikling, og vi viser skjermbilder når appen er klar for det.</div>`
      : `${brede.length ? `<div class="galleri bred">${brede.map((b, i) => `<figure class="fram">${nettleser(b.src, b.alt, b.adresse)}<figcaption>${b.tekst}</figcaption></figure>${mobil[i] ? `<figure class="fram">${telefon(mobil[i].src, mobil[i].alt)}<figcaption>${mobil[i].tekst}</figcaption></figure>` : ''}`).join('')}</div>`
        : `<div class="galleri">${mobil.map((b) => `<figure class="fram">${telefon(b.src, b.alt)}<figcaption>${b.tekst}</figcaption></figure>`).join('')}</div>`}`;
    legg({
      sti: '/prosjekter/' + p.id,
      tittel: (kalorivennSalg ? 'KaloriVenn – kostholdsapp til salgs' : p.tittel) + ' | Vortex Labs Norway',
      beskrivelse: kalorivennSalg ? 'Kjøp KaloriVenn, en publisert kostholdsapp med matregistrering, kvitteringslesing og middagsplan. Se skjermbilder, pris og salgsvilkår.' : p.beskrivelse,
      bilde: p.ogBilde,
      innhold: `
${kalorivennSalg ? `<section class="tett"><div class="ramme">
  <p><a href="/kjop-app/#kalorivenn">← Apper til salgs</a></p>
  ${kalorivennPresentasjon(kalorivenn, p, true)}
  <p>${p.lenker.filter(([href]) => !href.startsWith('https://apps.apple.com/')).map(([href, navn]) => `<a href="${esc(href)}">${esc(navn)}</a>`).join(' · ')}</p>
</div></section>` : `<section class="hero liten">${virvel}<div class="ramme">
  <p style="margin:0 0 14px"><a href="/prosjekter" style="color:rgba(255,255,255,.7)">← Alle prosjekter</a></p>
  <div class="case-hode">${p.ikon ? `<img src="${p.ikon}" alt="${p.navn}-ikon" width="72" height="72">` : ''}<div><span class="merkelapp">${p.type} · ${p.status}</span></div></div>
  <h1>${p.h1 || p.navn}</h1><p class="ingress">${p.ingress}</p>
  ${p.lenker.length || p.cta ? `<div class="knapper">${p.lenker.map(([h, t], i) => `<a class="knapp ${i === 0 ? 'prim' : 'sek'}" href="${h}" rel="noopener">${t}</a>`).join('')}${p.cta ? `<a class="knapp sek" href="${p.cta.lenke}">Få en lignende løsning</a>` : ''}</div>` : ''}
</div></section>`}
<section><div class="ramme">${galleri}</div></section>${kalorivennSalg ? '\n' + kalorivennSalgsvilkar : ''}
<section class="flate"><div class="ramme rutenett r2">
  <div class="fram"><span class="overtittel">Funksjoner</span><h2>Hva ${p.navn} gjør</h2>${hake(p.funksjoner)}<p class="forbehold">${p.personvern}</p></div>
  <div class="fram"><span class="overtittel">Teknisk</span><h2>Utfordringer vi har løst</h2>${p.utfordringer.map(([t, b]) => `<div class="utfordring" style="margin-bottom:18px"><h3 style="margin:0 0 4px">${t}</h3><p style="margin:0;color:var(--dempet)">${b}</p></div>`).join('')}</div>
</div></section>
${p.flyt ? `<section><div class="ramme"><div class="seksjonstopp fram"><span class="overtittel">Slik henger det sammen</span><h2>${p.flyt.tittel}</h2><p class="lead">${p.flyt.ingress}</p></div><ol class="steg">${p.flyt.steg.map(([t, b]) => `<li class="fram"><h3>${t}</h3><p>${b}</p></li>`).join('')}</ol></div></section>` : ''}
<section class="tett"><div class="ramme"><div class="fram"><span class="overtittel">For din bedrift</span><h2>Dette kan vi lage for deg</h2></div><div class="rutenett r4" style="margin-top:20px">${p.leverer.map((l) => `<div class="kort fram"><p style="color:var(--tekst);font-weight:600">${l}</p></div>`).join('')}</div></div></section>
${p.cta ? avslutt(p.cta.tittel, p.cta.knapp, p.cta.tekst).replace('href="/kontakt"', 'href="' + p.cta.lenke + '"') : avslutt()}`,
    });
  }

  /* ---------- Kjøp din egen app (salgskatalog) ---------- */
  const tilSalgs = salg.produkter.filter((p) => p.godkjentForSalg === true && p !== northcast && p !== kalorivenn);
  const kommende = (salg.kommende || []).filter((k) => k.visSomKommende === true);
  const prisTekst = (pr) => pr.type === 'fastpris' ? `Fastpris ${kr(pr.belop)} eks. mva.` : pr.type === 'prisantydning' ? `Prisantydning ${kr(pr.belop)} eks. mva.` : pr.type === 'bud' ? 'Gi bud' : 'Pris på forespørsel';
  const salgsstatusTekst = { tilgjengelig: 'Tilgjengelig', reservert: 'Reservert', solgt: 'Solgt' };
  const kjopLenke = (p) => `/kontakt?tjeneste=kjop-app&amp;produkt=${encodeURIComponent(p.id)}`;
  const produktkort = (p) => `<a class="prosjekt fram" href="/kjop-app/${p.id}" data-kategorier="${p.kategori}">
      ${p.skjermbilder && p.skjermbilder[0] ? `<div class="bilde"><img src="${p.skjermbilder[0].src}" alt="" loading="lazy"></div>` : `<div class="bilde ikonbilde"><img src="${p.ikon}" alt="" loading="lazy"></div>`}
      <div class="tekst">
        <div class="brikker"><span class="brikke status">${salg.kategorier[p.kategori].navn}</span><span class="brikke">${salgsstatusTekst[p.salgsstatus] || ''}</span></div>
        <h3>${esc(p.navn)}</h3><p>${esc(p.kort)}</p>
        <p style="font-weight:700;color:var(--tekst);margin-top:6px">${prisTekst(p.pris)}</p>
      </div></a>`;
  const katalog = tilSalgs.length
    ? `<div class="filter" role="group" aria-label="Filtrer katalogen"><button type="button" data-filter="alle" aria-pressed="true">Alle</button>${Object.entries(salg.kategorier).map(([k, c]) => `<button type="button" data-filter="${k}" aria-pressed="false">${c.navn}</button>`).join('')}</div><div class="prosjekter" id="prosjektliste">${tilSalgs.map(produktkort).join('')}</div>`
    : (northcast || kalorivenn) ? '' : `<div class="mangler fram"><strong>Ingen apper er lagt ut for salg akkurat nå.</strong> Hvert produkt godkjennes for salg enkeltvis. Meld deg på interesselista, så tar vi kontakt når en app som passer for deg blir tilgjengelig.</div>`;
  legg({
    sti: '/kjop-app', tittel: 'Kjøp en ferdigutviklet app – apper til salgs | Vortex Labs Norway',
    beskrivelse: kalorivenn ? 'Se apper til salgs hos Vortex Labs, inkludert kostholdsappen KaloriVenn og Northcast for fiske, camping og friluftsliv.' : 'Vil du kjøpe en mobilapp eller digital plattform? Se apper til salgs hos Vortex Labs, inkludert Northcast for fiske, camping og friluftsliv.',
    innhold: `
<section class="hero liten">${virvel}<div class="ramme"><span class="merkelapp">Kjøp din egen app</span><h1>Apper og digitale plattformer <em>til salgs</em></h1>
<p class="ingress">Vil du kjøpe en ferdigutviklet app eller overta en mobilapp du kan videreutvikle? Se hvilke produkter som er til salgs, hva som følger med og hvordan du kan få en demonstrasjon.</p>
<div class="knapper"><a class="knapp prim" href="#katalog">Se katalogen</a><a class="knapp sek" href="/kontakt?tjeneste=interesseliste">Meld deg på interesselista</a></div></div></section>
<section><div class="ramme">
  <div class="seksjonstopp fram"><span class="overtittel">Bli appeier – på dine premisser</span><h2>Din app. Ditt eierskap. Dine inntekter.</h2><p class="lead">Ønsker du å eie og drive din egen app? Hos Vortex Labs kan du kjøpe ferdigutviklede digitale produkter og velge hvor mye du ønsker å håndtere selv. Vi kan stå for det tekniske, eller du kan overta hele løsningen. Du trenger ikke være programmerer.</p></div>
  <div class="rutenett r3">
    ${Object.values(salg.kategorier).map((c, i) => `<div class="kort fram"><div class="ikon">${([ikon.app, ikon.nett, ikon.pris][i] || ikon.app)}</div><h3>${c.navn}</h3><p>${c.tekst}</p></div>`).join('')}
  </div>
</div></section>
<section class="flate" id="katalog"><div class="ramme">
  <div class="seksjonstopp fram"><span class="overtittel">Salgskatalog</span><h2>Apper til salgs</h2><p class="lead">Vi utvikler egne digitale produkter med tanke på videresalg. Bare produkter som er godkjent for salg vises her. Prisen kan være fastpris, prisantydning, bud eller pris på forespørsel.</p></div>
  ${northcast ? northcastPresentasjon(northcast) : ''}${kalorivenn ? '\n  ' + kalorivennPresentasjon(kalorivenn, PROSJEKTER.find((p) => p.id === kalorivenn.id)) : ''}${katalog ? '\n  ' + katalog : ''}
</div></section>
<section id="modeller"><div class="ramme">
  <div class="seksjonstopp fram"><span class="overtittel">Kjøpsmodeller</span><h2>Velg hvor mye du vil håndtere selv</h2><p class="lead">Hver app kan ha én eller flere kjøpsmodeller. Du er ikke låst til noen tjenester: rettigheter, priser, driftsavtaler og eventuelle inntektsfordelinger avtales individuelt.</p></div>
  <div class="rutenett r3">${Object.values(salg.kjopsmodeller).map((m) => `<div class="kort fram"><h3>${m.navn}</h3><p>${m.tekst}</p></div>`).join('')}</div>
</div></section>
<section class="flate"><div class="ramme rutenett r2">
  <div class="fram"><span class="overtittel">Ved fullt eierskap</span><h2>Dette overtar du</h2>
  ${hake(['Kildekoden', 'Egenutviklede immaterielle rettigheter', 'Merkevare, navn og logo', 'Dokumentasjon', 'Relevante tekniske eiendeler', 'Appbutikkoppføringer, domener og tredjepartstjenester, der det er mulig og avtalt'])}
  <p class="forbehold">Overdragelsen skjer etter en skriftlig avtale. Du bestemmer selv priser, abonnementer, markedsføring, drift og videreutvikling. Ved et fullstendig salg tar vi ingen provisjon av fremtidige inntekter, og det er ingen obligatorisk vedlikeholdsavtale. Frivillig support, drift og videreutvikling kan kjøpes separat.</p></div>
  <div class="fram"><span class="overtittel">Ærlig om inntekter</span><h2>Ingen garantier</h2><p class="lead">En app er en mulighet, ikke en garanti. Vi lover ingen inntekter, lønnsomhet eller avkastning. For apper med inntekter viser vi bare tall som kan dokumenteres for kjøperen, med kilde og periode.</p></div>
</div></section>
<section id="interesseliste"><div class="ramme">
  <div class="seksjonstopp fram"><span class="overtittel">Interesseliste</span><h2>Kommende apper</h2><p class="lead">Vi utvikler stadig nye produkter. Meld interesse før de er ferdige, så hører du fra oss først.</p></div>
  ${kommende.length ? `<div class="rutenett r3" style="margin-bottom:24px">${kommende.map((k) => `<div class="kort fram"><span class="brikke status">Forventet ${esc(k.forventet || 'senere')}</span><h3 style="margin-top:12px">${esc(k.navn)}</h3><p>${esc(k.kort)}</p><p style="margin-top:14px"><a class="knapp omriss" href="/kontakt?tjeneste=interesseliste&amp;produkt=${encodeURIComponent(k.id)}">Meld interesse</a></p></div>`).join('')}</div>` : ''}
  <p class="fram"><a class="knapp prim" href="/kontakt?tjeneste=interesseliste">Meld deg på interesselista</a></p>
</div></section>
<section class="tett"><div class="ramme"><div class="seksjonstopp fram"><span class="overtittel">Les mer</span><h2>Artikler om å kjøpe og eie en app</h2></div><ul class="lenkeliste fram"><li><a href="/artikler/kjope-ferdigutviklet-app">Hvordan kjøpe en ferdigutviklet app?</a></li><li><a href="/artikler/eie-app-uten-a-programmere">Kan jeg eie en app uten å programmere?</a></li><li><a href="/artikler/tjene-penger-pa-egen-app">Hvordan tjene penger på en egen app?</a></li></ul></div></section>
${avslutt('Vil du bli appeier?', 'Meld interesse', 'Fortell oss hva du ser etter. Du binder deg ikke til noe.').replace('href="/kontakt"', 'href="/kontakt?tjeneste=kjop-app"')}`,
  });

  for (const p of tilSalgs) {
    const d = p.kategori === 'inntekter' && p.dokumentasjon;
    legg({
      sti: '/kjop-app/' + p.id, tittel: `${p.navn} – app til salgs | Vortex Labs Norway`, beskrivelse: p.kort,
      innhold: `
<section class="hero liten">${virvel}<div class="ramme">
  <p style="margin:0 0 14px"><a href="/kjop-app#katalog" style="color:rgba(255,255,255,.7)">← Salgskatalogen</a></p>
  <div class="case-hode"><img src="${p.ikon}" alt="" width="72" height="72"><span class="merkelapp">${salg.kategorier[p.kategori].navn} · ${salgsstatusTekst[p.salgsstatus] || ''}</span></div>
  <h1>${esc(p.navn)}</h1><p class="ingress">${esc(p.beskrivelse || p.kort)}</p>
  <div class="knapper">${p.salgsstatus !== 'solgt' ? `<a class="knapp prim" href="${kjopLenke(p)}">${p.pris.type === 'bud' ? 'Gi bud' : 'Meld interesse'}</a>` : ''}${p.demo ? `<a class="knapp sek" href="${esc(p.demo)}" rel="noopener">Se demo</a>` : ''}</div>
</div></section>
${p.skjermbilder && p.skjermbilder.length ? `<section><div class="ramme"><div class="galleri">${p.skjermbilder.map((b) => `<figure class="fram">${telefon(b.src, b.alt)}</figure>`).join('')}</div></div></section>` : ''}
<section class="flate"><div class="ramme rutenett r2">
  <div class="fram"><span class="overtittel">Funksjoner</span><h2>Hva appen gjør</h2>${hake((p.funksjoner || []).map(esc))}</div>
  <div class="kort fram"><h3>Salgsinformasjon</h3><dl style="display:grid;gap:10px;margin:14px 0 0">
    <div><dt style="color:var(--dempet);font-size:.85rem">Pris</dt><dd style="margin:0;font-weight:700">${prisTekst(p.pris)}</dd></div>
    <div><dt style="color:var(--dempet);font-size:.85rem">Utviklingsstatus</dt><dd style="margin:0">${esc(p.utviklingsstatus || '')}</dd></div>
    <div><dt style="color:var(--dempet);font-size:.85rem">Forretningsmodell</dt><dd style="margin:0">${esc(p.forretningsmodell || 'Avtales med kjøper')}</dd></div>
    <div><dt style="color:var(--dempet);font-size:.85rem">Kjøpsalternativer</dt><dd style="margin:0">${p.kjopsmodeller.map((m) => salg.kjopsmodeller[m].navn).join(', ')}</dd></div>
    ${d ? `<div><dt style="color:var(--dempet);font-size:.85rem">Dokumenterte tall (${esc(d.periode)})</dt><dd style="margin:0">${esc(d.brukere)} brukere, ${esc(d.inntekter)} i inntekter. Kilde: ${esc(d.kilde)}. Tidligere resultater er ingen garanti for fremtidige inntekter.</dd></div>` : ''}
    ${p.inkluderer ? `<div><dt style="color:var(--dempet);font-size:.85rem">Ved fullt eierskap inngår</dt><dd style="margin:0">${p.inkluderer.map(esc).join(', ')}</dd></div>` : ''}
  </dl></div>
</div></section>
${avslutt('Interessert i ' + esc(p.navn) + '?', p.pris.type === 'bud' ? 'Gi bud' : 'Meld interesse', 'Uforpliktende. Alle vilkår avtales individuelt.').replace('href="/kontakt"', 'href="' + kjopLenke(p) + '"')}`,
    });
  }

  /* ---------- Vedlikehold ---------- */
  const v = priser.vedlikehold;
  legg({
    sti: '/vedlikehold', tittel: `Drift og vedlikehold av nettside og app fra ${kr(v.nettside.pris)}/mnd | Vortex Labs Norway`,
    beskrivelse: `Vedlikeholdsavtale for nettsider fra ${kr(v.nettside.pris)} per måned og for apper fra ${kr(v.app[0].pris)} per måned eks. mva. Oppdateringer, sikkerhet og feilretting etter avtale.`,
    innhold: `
<section class="hero liten">${virvel}<div class="ramme"><span class="merkelapp">Drift og vedlikehold</span><h1>Hold løsningen <em>trygg og oppdatert</em></h1>
<p class="ingress">Nettsider og apper må vedlikeholdes for å fortsette å virke. Med en vedlikeholdsavtale tar vi oss av det tekniske, innenfor et omfang vi avtaler på forhånd.</p></div></section>
<section><div class="ramme">
  <div class="pakker">
    <article class="pakke fram"><h3>Nettside</h3><div class="fra">fra ${kr(v.nettside.pris)} <small>per måned eks. mva.</small></div>${hake(['Tekniske oppdateringer', 'Sikkerhetsvedlikehold', 'Feilretting', 'Teknisk support'])}<a class="knapp omriss" href="/kontakt?tjeneste=videreutvikling">Spør om vedlikehold</a></article>
    ${v.app.map((a, i) => `<article class="pakke${i === 1 ? ' fremhevet' : ''} fram">${i === 1 ? '<span class="etikett">Mest valgt</span>' : ''}<h3>${a.navn}</h3><div class="fra">fra ${kr(a.pris)} <small>per måned eks. mva.</small></div>${hake(i === 0 ? ['Tekniske oppdateringer', 'Sikkerhetsvedlikehold', 'Feilretting'] : i === 1 ? ['Alt i Basis', 'Overvåking etter avtale', 'Teknisk support', 'Oppdatering for nye iOS- og Android-versjoner'] : ['Alt i Business', 'Videreutvikling etter avtale', 'Høyere prioritet', 'Utvidet omfang etter avtale'])}<a class="knapp ${i === 1 ? 'prim' : 'omriss'}" href="/kontakt?tjeneste=videreutvikling">Spør om vedlikehold</a></article>`).join('')}
  </div>
</div></section>
<section class="flate"><div class="ramme smal">
  <div class="fram"><span class="overtittel">Avgrensninger</span><h2>Hva avtalen dekker, og ikke dekker</h2>
  ${hake(['Omfanget avtales skriftlig for hver avtale, og arbeid ut over det avtalte faktureres etter avtale.', 'Avtalen dekker ikke ubegrenset arbeid, support eller videreutvikling.', 'Nye funksjoner prises separat.', 'Eksterne driftskostnader, som hosting, domener, databaser og tredjepartstjenester, kommer i tillegg.', 'Avtalen gjelder løsninger vi har laget eller har gått gjennom og godkjent.'])}</div>
</div></section>
${avslutt('Har du en løsning som trenger vedlikehold?', 'Ta kontakt', 'Også hvis noen andre har laget den. Vi ser på den og gir deg et tilbud.')}`,
  });

  /* ---------- Om oss ---------- */
  legg({
    sti: '/om-oss', tittel: 'Om Vortex Labs Norway – uavhengig utviklingsstudio fra Toten',
    beskrivelse: 'Vortex Labs Norway er et uavhengig utviklingsstudio på Skreia på Toten som lager nettsider, apper og bedriftssystemer for kunder i hele Norge.',
    innhold: `
<section class="hero liten">${virvel}<div class="ramme"><span class="merkelapp">Om oss</span><h1>Et lite studio <em>med store idéer</em></h1>
<p class="ingress">Vortex Labs Norway er et uavhengig utviklingsstudio på Skreia på Toten. Vi lager egne apper og digitale produkter, og vi lager løsninger for bedrifter i hele Norge.</p></div></section>
<section><div class="ramme rutenett r2">
  <div class="fram"><span class="overtittel">Hvem vi er</span><h2>Utvikleren du snakker med</h2><p class="lead">Bak Vortex Labs står Glenn Raymond Martinsen, som også er daglig leder. Når du tar kontakt, snakker du med den som faktisk utvikler løsningen din.</p><p class="lead" style="margin-top:14px">Vi driver også egne tjenester og produkter, som biltransporttjenesten HentBilen og appene KaloriVenn og Dagsbudsjett. Det betyr at vi kjenner hverdagen til en liten bedrift, og vet hva som faktisk er nyttig.</p></div>
  <div class="kort fram"><h3>Foretaksopplysninger</h3><dl style="display:grid;gap:10px;margin:14px 0 0">
    <div><dt style="color:var(--dempet);font-size:.85rem">Merkenavn</dt><dd style="margin:0">${FIRMA.merke}</dd></div>
    <div><dt style="color:var(--dempet);font-size:.85rem">Foretak</dt><dd style="margin:0">${FIRMA.navn} (${FIRMA.form})</dd></div>
    <div><dt style="color:var(--dempet);font-size:.85rem">Organisasjonsnummer</dt><dd style="margin:0">${FIRMA.orgnr}, registrert i Merverdiavgiftsregisteret</dd></div>
    <div><dt style="color:var(--dempet);font-size:.85rem">Adresse</dt><dd style="margin:0">${FIRMA.adresse}</dd></div>
    <div><dt style="color:var(--dempet);font-size:.85rem">E-post</dt><dd style="margin:0"><a href="mailto:${EPOST}">${EPOST}</a></dd></div>
  </dl></div>
</div></section>
<section class="flate"><div class="ramme">
  <div class="seksjonstopp fram"><span class="overtittel">Slik jobber vi</span><h2>Enkelt, ærlig og effektivt</h2></div>
  ${hvorforMer}
</div></section>
${avslutt()}`,
  });

  /* ---------- Kontakt ---------- */
  const skjemaKlart = Boolean(nettsted.skjemaEndepunkt && nettsted.turnstileNokkel);
  const tjenester = [
    ['designforslag', 'Gratis designforslag til nettside'], ['nettsidevurdering', 'Gratis vurdering av eksisterende nettside'], ['tilbud-nettside', 'Tilbud på nettside'], ['tilbud-app', 'Tilbud på mobilapp'],
    ['tilbud-webapp', 'Tilbud på webapp'], ['bedriftssystem', 'Skreddersydd bedriftssystem'], ['videreutvikling', 'Videreutvikling av eksisterende løsning'],
    ['kjop-app', 'Kjøp din egen app'], ...(northcast ? northcastHenvendelser : []), ['interesseliste', 'Interesseliste for kommende apper'], ['annet', 'Annet'],
  ];
  legg({
    sti: '/kontakt', tittel: 'Kontakt oss – få tilbud eller gratis designforslag | Vortex Labs Norway',
    beskrivelse: 'Fortell oss om prosjektet ditt og få et konkret tilbud med fastpris, eller et gratis og uforpliktende designforslag til nettsiden din.',
    skjemaOpphav: skjemaKlart ? new URL(nettsted.skjemaEndepunkt).origin : '',
    ekstraHode: skjemaKlart ? `<meta name="skjema-endepunkt" content="${esc(nettsted.skjemaEndepunkt)}">` : '',
    innhold: `
<section class="hero liten">${virvel}<div class="ramme"><span class="merkelapp">Kontakt</span><h1>Fortell oss om <em>prosjektet ditt</em></h1>
<p class="ingress">Fyll ut skjemaet, så svarer vi så raskt vi kan. Det er gratis og uforpliktende. Du kan også sende e-post til <a href="mailto:${EPOST}" style="color:var(--mynte)">${EPOST}</a>.</p></div></section>
<section><div class="ramme smal">
  <form class="skjema" id="tilbudsskjema" method="post" novalidate>
    <div class="estimatboks" id="estimat" hidden></div>
    <div class="felt"><label for="navn">Navn</label><input id="navn" name="navn" autocomplete="name" required maxlength="100"><span class="feil" id="navn-feil"></span></div>
    <div class="felt"><label for="bedrift">Bedriftsnavn</label><input id="bedrift" name="bedrift" autocomplete="organization" required maxlength="150"><span class="feil" id="bedrift-feil"></span></div>
    <div class="felt"><label for="epost">E-post</label><input id="epost" name="epost" type="email" autocomplete="email" required maxlength="200"><span class="feil" id="epost-feil"></span></div>
    <div class="felt"><label for="telefon">Telefonnummer <small>(valgfritt)</small></label><input id="telefon" name="telefon" type="tel" autocomplete="tel" maxlength="30"><span class="feil" id="telefon-feil"></span></div>
    <div class="felt hel"><label for="nettside">Eksisterende nettside <small>(valgfritt)</small></label><input id="nettside" name="nettside" type="url" placeholder="https://" maxlength="300"><span class="feil" id="nettside-feil"></span></div>
    <div class="felt hel"><label for="tjeneste">Hva gjelder det?</label><select id="tjeneste" name="tjeneste" required><option value="">Velg</option>${tjenester.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select><span class="feil" id="tjeneste-feil"></span></div>
    <div class="felt hel" id="kjopsmodell-felt" hidden><label for="kjopsmodell">Hvilken kjøpsmodell er du interessert i?</label><select id="kjopsmodell" name="kjopsmodell"><option value="">Velg</option>${Object.entries(salg.kjopsmodeller).map(([k, m]) => `<option value="${k}">${m.navn}</option>`).join('')}<option value="apen">Jeg er åpen for ulike løsninger</option></select></div>
    <div class="felt hel"><label for="beskrivelse">Beskrivelse av prosjektet</label><textarea id="beskrivelse" name="beskrivelse" required maxlength="5000" placeholder="Hva trenger du, og hvem er det for?"></textarea><span class="feil" id="beskrivelse-feil"></span></div>
    <div class="felt hel"><label for="funksjoner">Ønskede funksjoner <small>(valgfritt)</small></label><textarea id="funksjoner" name="funksjoner" maxlength="2000" style="min-height:90px"></textarea></div>
    <div class="felt"><label for="budsjett">Budsjett <small>(valgfritt)</small></label><select id="budsjett" name="budsjett"><option value="">Vet ikke ennå</option><option>Under 10 000 kr</option><option>10 000–30 000 kr</option><option>30 000–60 000 kr</option><option>60 000–100 000 kr</option><option>Over 100 000 kr</option></select></div>
    <div class="felt"><label for="leveringstid">Ønsket leveringstid <small>(valgfritt)</small></label><select id="leveringstid" name="leveringstid"><option value="">Ingen hast</option><option>Innen 1 måned</option><option>1–3 måneder</option><option>3–6 måneder</option><option>Senere</option></select></div>
    <div class="honning" aria-hidden="true"><label for="firmanettsted">La dette feltet stå tomt</label><input id="firmanettsted" name="firmanettsted" tabindex="-1" autocomplete="off"></div>
    <input type="hidden" name="estimat" id="estimat-felt"><input type="hidden" name="kilde" id="kilde-felt">
    <p class="felt hel" style="color:var(--dempet);font-size:.9rem;margin:0">Vi bruker opplysningene bare til å svare på henvendelsen din og eventuelt lage et tilbud. Les mer i <a href="/personvern">personvernerklæringen</a>.</p>
    ${skjemaKlart ? `<div class="felt hel" id="skjema-sikkerhet" data-sitekey="${esc(nettsted.turnstileNokkel)}"></div><noscript><p class="felt hel">Slå på JavaScript for å sende via skjemaet.</p></noscript>` : '<p class="felt hel">Direkte innsending er midlertidig utilgjengelig.</p>'}
    <div class="felt hel"><button class="knapp prim" type="submit" id="send-knapp" disabled>Send henvendelse</button></div>
    <div class="skjemastatus" id="skjemastatus" role="status" tabindex="-1"></div>
  </form>
</div></section>`,
  });

  /* ---------- Personvern ---------- */
  legg({
    sti: '/personvern', tittel: 'Personvernerklæring for vortexlabs.no | Vortex Labs Norway',
    beskrivelse: 'Slik behandler Vortex Labs Norway personopplysninger når du bruker vortexlabs.no og sender oss en henvendelse.',
    innhold: `
<section class="hero liten"><div class="ramme"><span class="merkelapp">Personvern</span><h1>Personvernerklæring</h1><p class="ingress">For nettsiden vortexlabs.no og henvendelser til oss. Sist oppdatert ${nettsted.personvernDato}.</p></div></section>
<section><div class="ramme smal prosa">
  <h2>Behandlingsansvarlig</h2><p>${FIRMA.navn} (${FIRMA.form}), org.nr. ${FIRMA.orgnr}, ${FIRMA.adresse}. Merkenavn: ${FIRMA.merke}. E-post: <a href="mailto:${EPOST}">${EPOST}</a>.</p>
  <h2>Hva vi samler inn</h2><p>Når du sender en henvendelse, behandler vi det du skriver inn: navn, bedriftsnavn, e-post, og eventuelt telefonnummer, nettside, beskrivelse av prosjektet, budsjett og ønsket leveringstid. Hvis du har brukt priskalkulatoren, følger valgene og estimatet med. Lenken til siden du kom fra, kan følge med henvendelsen.</p>
  <h2>Hvorfor</h2><p>Vi bruker opplysningene til å svare på henvendelsen og eventuelt lage et tilbud. Grunnlaget er vår berettigede interesse i å svare på henvendelser, eller tiltak før en eventuell avtale (personvernforordningen art. 6 nr. 1 bokstav f og b).</p>
  <h2>Hvor lenge</h2><p>Henvendelser som ikke fører til en avtale, slettes senest 12 måneder etter siste kontakt. Blir det en avtale, oppbevares opplysningene så lenge avtalen varer og så lenge regnskapsloven krever det.</p>
  <h2>Hvem som får tilgang</h2><p>Henvendelser sendes til oss via e-post. ${skjemaKlart ? 'Supabase tar imot skjemaet og Resend formidler e-posten. Cloudflare Turnstile behandler tekniske opplysninger for å beskytte skjemaet mot spam.' : ''} Nettsiden ligger hos GitHub Pages, som behandler teknisk informasjon som IP-adresse for å levere siden. Skrifttypene hentes fra Google Fonts.</p>
  <h2>Informasjonskapsler og sporing</h2><p>Nettsiden bruker ingen analyseverktøy, sporing eller annonser${skjemaKlart ? '. Sikkerhetskontrollen kan bruke nødvendige informasjonskapsler.' : ' og setter ingen informasjonskapsler.'}</p>
  <h2>Dine rettigheter</h2><p>Du kan be om innsyn, retting og sletting av opplysningene dine ved å sende e-post til oss. Du kan også klage til <a href="https://www.datatilsynet.no">Datatilsynet</a>.</p>
  <h2>Våre apper</h2><p>Hver app har sin egen personvernerklæring. For KaloriVenn: <a href="https://kalorivenn.expo.app/personvern.html">kalorivenn.expo.app/personvern.html</a>.</p>
</div></section>`,
  });

  /* ---------- 404 ---------- */
  legg({
    sti: '/404', fil: '404.html', tittel: 'Fant ikke siden | Vortex Labs Norway', beskrivelse: 'Siden finnes ikke.', ikkeISitemap: true, noindex: true,
    innhold: `<section class="hero liten">${virvel}<div class="ramme"><span class="merkelapp">404</span><h1>Fant ikke siden</h1><p class="ingress">Siden du leter etter finnes ikke, eller den er flyttet.</p><div class="knapper"><a class="knapp prim" href="/">Til forsiden</a><a class="knapp sek" href="/kontakt">Kontakt oss</a></div></div></section>`,
  });

  return sider;
}
