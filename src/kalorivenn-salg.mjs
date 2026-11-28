import { esc } from './layout.mjs';
import { prisRader } from './kampanje.mjs';

const appStore = 'https://apps.apple.com/no/app/kalorivenn/id6830372881?l=nb';

export function kalorivennPresentasjon(produkt, prosjekt, detalj = false) {
  const prosjektsti = produkt.prosjektsti + '/';
  const kilde = encodeURIComponent(detalj ? prosjektsti : '/kjop-app/');
  const overskrift = detalj ? 'h1' : 'h3';
  const tittel = detalj ? 'KaloriVenn – din inngang til digitalt produkteierskap' : produkt.navn;

  return `<article class="northcast-premium" id="kalorivenn"${detalj ? '' : ' style="margin-top:20px"'}>
  <div class="northcast-kopi">
    <p class="northcast-kategori">Publisert kostholdsapp til salgs</p>
    <${overskrift}>${esc(tittel)}</${overskrift}>
    <p class="northcast-lead">KaloriVenn kobler sammen det du kjøper, det du har i kjøleskapet og det du spiser. Les inn en kvittering for å fylle det digitale kjøleskapet, planlegg ukas middager og logg måltider med kalorier og næringsinnhold.</p>
    <dl class="northcast-fakta">
      ${prisRader(produkt).html}
      <div><dt>iPhone og iPad</dt><dd>Publisert i App Store</dd></div>
      <div><dt>Android</dt><dd>Under testing</dd></div>
      <div><dt>Salgsmodell</dt><dd>${esc(produkt.salgsmodell)}</dd></div>
    </dl>
    <p><strong>12 måneders avgrenset teknisk support inkludert</strong></p>
    <div class="knapper northcast-handlinger">
      <a class="knapp prim" href="/kontakt/?tjeneste=kjop-app&amp;produkt=kalorivenn&amp;kilde=${kilde}">Meld kjøpsinteresse</a>
      <a class="knapp sek" href="${appStore}">Se appen i App Store</a>
    </div>${detalj ? '' : `\n    <p class="northcast-detalj"><a href="${prosjektsti}">Se skjermbilder, funksjoner og salgsvilkår →</a></p>`}
  </div>
  <figure class="northcast-profil"><img src="${esc(prosjekt.ikon)}" width="256" height="256" alt="KaloriVenn-logo" ${detalj ? 'fetchpriority="high"' : 'loading="lazy"'}></figure>
</article>`;
}

export const kalorivennSalgsvilkar = `<section class="flate"><div class="ramme rutenett r2">
  <article class="kort">
    <h2>Hva skiller KaloriVenn ut?</h2>
    <p>En kvittering kan fylle kjøleskapet i appen. Derfra kan du registrere mat du bruker, få middagsforslag basert på det du har med Premium og legge ingredienser fra ukas middagsplan i handlelista. Med Premium Familie kan husstanden dele både handlelista og middagsplanen.</p>
    <p>KaloriVenn er innstegsmodellen for kjøpere som vil overta et publisert produkt med en etablert abonnementsmodell. Appen kan passe for treningssentre, personlige trenere og andre som vil bygge videre på et produkt for matregistrering og planlegging.</p>
  </article>
  <article class="kort">
    <h2>Overtakelse og teknisk support</h2>
    <p>Omfanget av teknisk support avtales ved kjøp. Supportperioden på 12 måneder starter ved overtakelse. Kjøper kan drive appen selv eller inngå en frivillig avtale med Vortex Labs om videre teknisk drift og utvikling.</p>
    <p>Overføring av kildekode, merkevare, App Store-oppføring, RevenueCat, abonnementer og eventuelle brukerdata avklares i avtalen med hensyn til personvern og leverandørenes vilkår.</p>
    <p>Vortex Labs fortsetter å drive, markedsføre og videreutvikle appen mens den er til salgs.</p>
  </article>
</div></section>`;
