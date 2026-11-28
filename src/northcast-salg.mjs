import { esc, hake } from './layout.mjs';
import { prisRader, kampanjeBanner } from './kampanje.mjs';

// Norsk produkttekst. Ruter, henvendelsestyper og beløp beholdes ved oversettelse.
const tekst = {
  tittel: 'Northcast – fiskeapp og campingapp til salgs',
  beskrivelse: 'Northcast er en premium friluftsapp for fiske, camping og bobil i Europa. iOS og Android under utvikling. Se salgsvilkår og be om privat demonstrasjon.',
  ingress: 'Finn fiskeplasser, sjekk hvor du kan parkere, og se hvor gangadkomsten starter. Northcast samler kart, lokal informasjon og treff for fiskere, campere og bobilreisende.',
  intro: 'Northcast utvikles for et internasjonalt marked med hovedfokus på Europa. Vi prioriterer Norge først og bygger videre land for land.',
  funksjoner: [
    ['Interaktive kart og GPS', 'Utforsk steder i mobilkartet, velg søkesentrum selv eller bruk GPS med tillatelse. Veibeskrivelse åpnes i en ekstern kartapp.'],
    ['Fiskeplasser og fiskearter', 'Stedsopplysninger kan inneholde fiskearter. Brukeren kan søke etter sted eller art.'],
    ['Camping og bobilparkering', 'Filtrer på oppgitt bobilparkering, overnattingsmulighet og fasiliteter. Status kan være ukjent.'],
    ['Parkering og gangadkomst', 'Fiskeplassen, parkeringspunktet og starten på gangadkomsten kan vises som separate punkter.'],
    ['Brukerprofiler', 'Brukerkonto med innlogging og eget visningsnavn i treffchatten.'],
    ['Brukergenerert innhold', 'Brukere kan opprette og redigere egne steder, lagre dem privat eller sende offentlige bidrag til vurdering.'],
    ['Moderering', 'Egne verktøy for gjennomgang av offentlige stedsbidrag og treff, samt håndtering av rapporter.'],
    ['Favoritter', 'Lagre steder og finn dem igjen i en egen favorittoversikt.'],
    ['Nærhetssøk', 'Søk rundt et valgt punkt eller din posisjon med radius på 5, 10, 25 eller 50 km.'],
    ['Fisketreff og arrangementer', 'Opprett, rediger eller avlys egne treff. Andre kan se aktuelle treff og melde seg på eller av.'],
    ['Fiskeregler og lokal informasjon', 'Viser kildelenker og status for lokale opplysninger og mulige fiskekort. Brukeren kan gå videre til kilden for å sjekke gjeldende regler.'],
  ],
  planlagt: [
    'Bredere europeisk dekning med avklarte datalisenser og landspesifikke regelkilder.',
    'Nærhetsvarsler om relevante steder underveis. Foreløpig finnes aktivt nærhetssøk i appen.',
    'Integrasjon med Apple CarPlay og Android Auto.',
  ],
  overtakelse: [
    'Komplett kildekode og teknisk dokumentasjon.',
    'Merkevare og grafisk materiell som omfattes av avtalen.',
    'Overførbare immaterielle rettigheter.',
    'Nødvendig teknisk infrastruktur der den kan overføres.',
    'Teknisk overlevering med avtalt omfang.',
  ],
  support: {
    tittel: '12 måneders teknisk support inkludert',
    avsnitt: [
      'Ved kjøp av Northcast inkluderer Vortex Labs ett års teknisk support fra avtalt overtakelsesdato. Dette gir kjøperen trygghet gjennom overtakelse, lansering og det første driftsåret.',
      'Supporten omfatter teknisk veiledning, avtalt feilretting, sikkerhetsoppdateringer og mindre kompatibilitetsoppdateringer innenfor avtalte rammer.',
      'Nye funksjoner, større endringer, nettsideutvikling og eksterne driftskostnader tilbys eller dekkes separat.',
      'Supportens detaljerte omfang fastsettes i kjøpsavtalen.',
      'Etter det første året kan kjøperen velge å inngå en frivillig vedlikeholds- og supportavtale med Vortex Labs.',
      'Ingen bindingstid eller obligatoriske løpende avtaler etter supportperioden.',
    ],
  },
  digitalPlattform: {
    tittel: 'Mulighet for en komplett digital plattform',
    ingress: 'Northcast er utviklet med ambisjoner om videre vekst og internasjonal ekspansjon.',
    innledning: 'Etter kjøperens ønsker kan konseptet utvides med:',
    utvidelser: [
      'Egen profesjonell nettside med Northcasts visuelle identitet.',
      'Interaktiv, nettbasert kartløsning.',
      'Integrasjon mellom nettsiden og mobilappen.',
      'Flerspråklig innhold for internasjonale markeder.',
      'Søkemotoroptimalisering (SEO).',
      'Integrerte administrasjonsverktøy.',
      'Løsninger for kommersielle samarbeidspartnere.',
    ],
    tilbud: 'Vortex Labs kan levere en komplett digital plattform tilpasset kjøperens kommersielle ambisjoner.',
    eierskap: 'Fullt eierskap. Full frihet. Mulighet for videre vekst.',
    avgrensning: 'Nettside og ytterligere funksjonalitet tilbys etter separat avtale og er ikke inkludert i prisen som er oppgitt for Northcast.',
    sporsmal: 'Ønsker du å diskutere mulighetene?',
    kontakt: 'Kontakt oss for en uforpliktende samtale og privat demonstrasjon.',
  },
  handlinger: [
    ['northcast-demo', 'Be om privat demonstrasjon'],
    ['northcast-kjop', 'Meld kjøpsinteresse'],
    ['northcast-info', 'Be om mer informasjon'],
  ],
};

export const northcastHenvendelser = tekst.handlinger.map(([id, navn]) => [id, 'Northcast – ' + navn]);
const northcastKontakt = (id, kilde) => `/kontakt/?tjeneste=${id}&amp;produkt=northcast&amp;kilde=${encodeURIComponent(kilde)}`;
const kontakthandlinger = (kilde) => `<div class="knapper northcast-handlinger">${tekst.handlinger.map(([id, navn], i) =>
  `<a class="knapp ${i === 0 ? 'prim' : 'sek'}" href="${northcastKontakt(id, kilde)}">${esc(navn)}</a>`).join('')}</div>`;

export function northcastPresentasjon(produkt, detalj = false) {
  const kilde = detalj ? '/prosjekter/northcast/' : '/kjop-app/';
  const overskrift = detalj ? 'h1' : 'h3';
  return `<article class="northcast-premium">
  <div class="northcast-kopi">
    <p class="northcast-kategori">${esc(produkt.kategorinavn)}</p>
    <${overskrift}>Northcast</${overskrift}>
    <p class="northcast-lead">${esc(tekst.ingress)}</p>
    <dl class="northcast-fakta">
      ${prisRader(produkt, 'Prisantydning:').html}
      <div><dt>Plattform</dt><dd>${esc(produkt.plattform)}</dd></div>
      <div><dt>Utviklingsstatus</dt><dd>${esc(produkt.utviklingsstatus)}</dd></div>
      <div><dt>Salgsstatus</dt><dd>${esc(produkt.salgsstatusTekst)}</dd></div>
      <div><dt>Marked</dt><dd>${esc(produkt.marked)}</dd></div>
      <div><dt>Salgsmodell</dt><dd>${esc(produkt.salgsmodell)}</dd></div>
    </dl>
    <p><strong>${esc(tekst.support.tittel)}</strong></p>
    <p class="northcast-prismerknad">Selgers ønskede pris. Ingen uavhengig verdivurdering.</p>
    ${kontakthandlinger(kilde)}${detalj ? '' : '<p class="northcast-detalj"><a href="/prosjekter/northcast/">Se funksjoner, overtakelse og mulige utvidelser →</a></p>'}
  </div>
  <figure class="northcast-profil"><img src="${esc(produkt.ikon)}" width="480" height="480" alt="Northcast-profilbilde med fjell, fiske og bobil" ${detalj ? 'fetchpriority="high"' : 'loading="lazy"'}></figure>
</article>`;
}

export function northcastProsjektside(produkt) {
  return {
    sti: produkt.prosjektsti,
    tittel: tekst.tittel + ' | Vortex Labs Norway',
    beskrivelse: tekst.beskrivelse,
    bilde: produkt.ikon,
    innhold: `${kampanjeBanner([{ produkt, sti: '', kontakt: northcastKontakt('northcast-kjop', '/prosjekter/northcast/') }])}
<section class="tett"><div class="ramme">
  <p><a href="/kjop-app/">← Apper til salgs</a></p>
  ${northcastPresentasjon(produkt, true)}
</div></section>
<section class="flate"><div class="ramme">
  <div class="seksjonstopp"><h2>Implementert i utviklingsversjonen</h2><p class="lead">${esc(tekst.intro)} Funksjonene finnes i utviklingskoden. Lansering og full verifisering på telefon gjenstår.</p></div>
  <div class="rutenett r3">${tekst.funksjoner.map(([navn, detalj]) => `<article class="kort"><h3>${esc(navn)}</h3><p>${esc(detalj)}</p></article>`).join('')}</div>
</div></section>
<section class="tett"><div class="ramme rutenett r2">
  <div><h2>Planlagte funksjoner og utvidelser</h2>${hake(tekst.planlagt.map(esc))}</div>
  <div><h2>Privat demonstrasjon</h2><p>Vi viser utviklingsversjonen og går gjennom funksjoner, teknisk oppsett og hva som gjenstår før lansering.</p></div>
</div></section>
<section class="flate"><div class="ramme rutenett r2">
  <div><h2>Dette kan inngå i en full overtakelse</h2>${hake(tekst.overtakelse.map(esc))}</div>
  <div><h2>Drift og teknisk overlevering</h2><p>Kjøper kan eie og drive produktet selv. Videreutvikling tilbys som en valgfri tjeneste.</p><p>Før en avtale går vi gjennom rettigheter, tredjepartslisenser og tekniske avhengigheter, blant annet kart- og datakilder, skytjenester og utviklerkontoer. Oppgjør og overdragelse skjer etter skriftlig avtale.</p></div>
</div></section>
<section class="tett" aria-labelledby="northcast-support"><div class="ramme">
  <article class="kort">
    <h2 id="northcast-support">${esc(tekst.support.tittel)}</h2>
    ${tekst.support.avsnitt.map((avsnitt) => `<p>${esc(avsnitt)}</p>`).join('\n    ')}
  </article>
</div></section>
<section class="tett"><div class="ramme">
  <article class="kort">
    <h2>${esc(tekst.digitalPlattform.tittel)}</h2>
    <p>${esc(tekst.digitalPlattform.ingress)}</p>
    <p>${esc(tekst.digitalPlattform.innledning)}</p>
    ${hake(tekst.digitalPlattform.utvidelser.map(esc))}
    <p>${esc(tekst.digitalPlattform.tilbud)}</p>
    <p><strong>${esc(tekst.digitalPlattform.eierskap)}</strong></p>
    <p>${esc(tekst.digitalPlattform.avgrensning)}</p>
    <p><strong>${esc(tekst.digitalPlattform.sporsmal)} <a href="${northcastKontakt('northcast-demo', '/prosjekter/northcast/')}">${esc(tekst.digitalPlattform.kontakt)}</a></strong></p>
  </article>
</div></section>
<section class="tett"><div class="ramme">
  <h2>Interessert i Northcast?</h2>
  ${kontakthandlinger('/prosjekter/northcast/')}
</div></section>`,
  };
}
