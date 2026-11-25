# SEO-rapport: utvidelse av vortexlabs.no

Branch `seo-utvidelse`, bygget 25.11.2026. Ikke publisert.

## Hva som er gjort

- **Fra 17 til 53 sider** (52 i sitemap, pluss 404-siden): 9 nye tjenestesider, 11 bransjesider, 12 artikler, én lokal side og oversiktssider for tjenester, bransjer og artikler.
- **Meny:** Tjenester, Bransjer, Priser, Prosjekter, Kjøp din egen app, Artikler og Om oss, pluss Kontakt. Undersidene nås fra oversiktssidene og fra bunnteksten.
- **Brødsmuler** på alle undersider, med strukturert data (BreadcrumbList).
- **Strukturert data:** foretaket (ProfessionalService) på alle sider, Service på tjeneste- og bransjesider, FAQPage der det er spørsmål og svar, Article på artiklene.
- **Skjemaet** tar vare på hvilken side kunden kom fra (`kilde`), enten fra lenken eller fra forrige side på vortexlabs.no. Ingen informasjonskapsler eller sporing.
- **Nytt tilbud i skjemaet:** «Gratis vurdering av eksisterende nettside».

## Valg for å unngå at sidene konkurrerer med hverandre

| Tema i bestillingen | Løsning |
|---|---|
| Rimelige bedriftsnettsider | Dekkes av `/nettsider/` (utvidet med lenker), ingen ny side |
| Mobiloptimalisering | Slått sammen med `/tjenester/modernisering-av-nettside/` |
| Kjøp av ferdigutviklede apper | Dekkes av `/kjop-app/` (utvidet med artikkellenker) |
| Småbedrifter (bransje) | Forsiden er rettet mot småbedrifter. Bransjeoversikten lenker dit |
| iPhone / Android | Egne sider om App Store og Google Play, skilt fra `/apputvikling/` |

## Ærlighet i innholdet

- Ingen oppdiktede kunder. Bare HentBilen (egen virksomhet), KaloriVenn, Sjåførsiden og Northcast (egne prosjekter) brukes som referanser.
- Bransjesider uten egen erfaring sier det rett ut, for eksempel håndverkere og bygg og anlegg.
- Ingen løfter om plassering i Google, inntekter eller avkastning.
- Fakta om Apple, Google og ehandelsloven har lenke til kilden. Avgiftene oppgis ikke som tall, fordi de endres. Leseren sendes til kilden.
- Fagdøra nevnes ikke noe sted (sjekkes automatisk).

## Tekniske kontroller (`node sjekk.mjs`)

Ingen feil. Sjekker én h1 per side, unike titler og beskrivelser, canonical, sitemap opp mot canonical, robots.txt, interne lenker, alt-tekster, delingsbilder, gyldig JSON-LD, sider uten innlenker og Fagdøra. Alle 53 sidene er i tillegg testet på 375 px uten horisontal scrolling. Bransjesidene deler høyst 14 % tekst (målt med 5-ordssekvenser), tjenestesidene 9 % og artiklene 3 %.

## Mangler og videre arbeid

- Artiklene er 250–410 ord. De gir konkrete svar, men kan bygges ut over tid.
- Ingen Search Console-data ennå. Sitemap ble sendt inn 25.11, og ny sitemap blir lest automatisk.
- Northcast har fortsatt ingen ekte skjermbilder.
- Kontaktskjemaet sender fortsatt via e-postprogrammet til serverfunksjonen er i drift.

## URL-oversikt

| URL | Søketema (tittel) | H1 | Interne innlenker |
|---|---|---|---|
| `/` | Nettsider, apper og bedriftssystemer for småbedrifter | Nettsider, apper og bedriftssystemer for småbedrifter | 156 |
| `/apputvikling/` | Utvikling av mobilapp for iPhone og Android | Utvikling av mobilapp for iPhone og Android | 63 |
| `/apputvikling/android/` | Utvikling av Android-app og publisering i Google Play | Android-app i Google Play | 56 |
| `/apputvikling/iphone/` | Utvikling av iPhone-app og publisering i App Store | iPhone-app i App Store | 57 |
| `/artikler/` | Artikler om nettsider, apper og digitalisering | Artikler om nettsider, apper og digitalisering | 116 |
| `/artikler/digitalisere-liten-bedrift/` | Hvordan digitalisere en liten bedrift? Praktisk guide | Hvordan digitalisere en liten bedrift? | 4 |
| `/artikler/drift-og-vedlikehold-av-app/` | Hva koster drift og vedlikehold av en app? | Hva koster drift og vedlikehold av en app? | 4 |
| `/artikler/eie-app-uten-a-programmere/` | Kan jeg eie en app uten å kunne programmere? | Kan jeg eie en app uten å kunne programmere? | 3 |
| `/artikler/hva-bor-en-bedriftsnettside-inneholde/` | Hva bør en bedriftsnettside inneholde? Sjekkliste | Hva bør en moderne bedriftsnettside inneholde? | 5 |
| `/artikler/hva-koster-det-a-lage-en-app/` | Hva koster det å lage en app? iPhone og Android | Hva koster det å lage en app? | 5 |
| `/artikler/hva-koster-en-nettside/` | Hva koster en nettside i 2026? Priser forklart | Hva koster en nettside i 2026? | 4 |
| `/artikler/kjope-ferdigutviklet-app/` | Hvordan kjøpe en ferdigutviklet app? Steg for steg | Hvordan kjøpe en ferdigutviklet app? | 4 |
| `/artikler/nar-bor-bedriften-fornye-nettsiden/` | Når bør bedriften fornye nettsiden? 7 tegn | Når bør bedriften fornye nettsiden? | 3 |
| `/artikler/publisere-app-i-app-store/` | Hvordan publisere en app i App Store? Steg for steg | Hvordan publisere en app i App Store? | 2 |
| `/artikler/tjene-penger-pa-egen-app/` | Hvordan tjene penger på en egen app? | Hvordan tjene penger på en egen app? | 3 |
| `/artikler/webapp-eller-mobilapp/` | Webapp eller mobilapp? Forskjellen forklart | Hva er forskjellen på en webapp og en mobilapp? | 4 |
| `/artikler/wordpress-wix-eller-skreddersydd/` | WordPress, Wix eller skreddersydd nettside? | WordPress, Wix eller skreddersydd nettside? | 3 |
| `/bedriftssystemer/` | Skreddersydde webapper, kundeportaler og booking | Webapper, kundeportaler, booking og ordrehåndtering | 62 |
| `/bransjer/` | Nettsider og apper for ulike bransjer | Løsninger tilpasset bransjen din | 65 |
| `/bransjer/bilverksted/` | Nettside for bilverksted med timebestilling | Nettside for bilverksted med timebestilling | 54 |
| `/bransjer/bygg-og-anlegg/` | Nettside og digitale verktøy for bygg og anlegg | Nettside og verktøy for bygg og anlegg | 55 |
| `/bransjer/camping/` | Nettside for campingplass med booking og flere språk | Nettside for campingplasser | 54 |
| `/bransjer/enkeltpersonforetak/` | Nettside for enkeltpersonforetak – rimelig og enkel | Nettside for enkeltpersonforetak | 54 |
| `/bransjer/frisor/` | Nettside for frisør med timebestilling | Nettside for frisør med timebestilling | 54 |
| `/bransjer/handverkere/` | Nettside for rørlegger, elektriker og snekker | Nettside for håndverkere | 54 |
| `/bransjer/lag-og-foreninger/` | Nettside for lag og foreninger – enkel og rimelig | Nettside for lag og foreninger | 53 |
| `/bransjer/renhold/` | Nettside for renholdsbedrift med prisberegning | Nettside for renholdsbedrifter | 54 |
| `/bransjer/restaurant/` | Nettside for restaurant og kafé med bordbestilling | Nettside for restauranter og kafeer | 54 |
| `/bransjer/transport/` | Nettside for transportfirma med prisberegning | Nettside og systemer for transportfirmaer | 57 |
| `/bransjer/treningssenter/` | Nettside for treningssenter med timeplan og påmelding | Nettside og app for treningssentre | 55 |
| `/kjop-app/` | Kjøp en ferdigutviklet app – apper til salgs | Hvorfor starte fra bunnen av? | 165 |
| `/kontakt/` | Kontakt oss – få tilbud eller gratis designforslag | Fortell oss om prosjektet ditt | 220 |
| `/nettside-toten-gjovik/` | Nettside og app på Toten, Gjøvik og i Innlandet | Nettsider og apper på Toten, Gjøvik og i Innlandet | 55 |
| `/nettsider/` | Nettside til bedrift og småbedrifter fra 4 990 kr | Bedriftsnettside for småbedrifter | 66 |
| `/om-oss/` | Om Vortex Labs Norway – uavhengig utviklingsstudio fra Toten | Et lite studio med store idéer | 105 |
| `/personvern/` | Personvernerklæring for vortexlabs.no | Personvernerklæring | 53 |
| `/priser/` | Priser på nettside, webapp og app – priskalkulator | Tydelige priser, fastpris før oppstart | 138 |
| `/prosjekter/` | Våre prosjekter – apper, nettsider og bedriftssystemer | Dette har vi laget selv | 117 |
| `/prosjekter/dagsbudsjett/` | Dagsbudsjett – mobilapp for personlig økonomi | Dagsbudsjett | 2 |
| `/prosjekter/hentbilen/` | HentBilen: nettside og sjåførportal for transportfirma | HentBilen – nettside og sjåførportal for transportbransjen | 20 |
| `/prosjekter/kalorivenn/` | KaloriVenn – mobilapp for kosthold og matregistrering | KaloriVenn | 12 |
| `/prosjekter/northcast/` | Northcast – kartapp for fiske og camping i Norden | Northcast | 3 |
| `/prosjekter/sjaforsiden/` | Sjåførsiden – bedriftsportal for yrkessjåfører | Sjåførsiden | 4 |
| `/tjenester/` | Tjenester – nettsider, apper og bedriftssystemer | Alt vi lager, samlet på ett sted | 65 |
| `/tjenester/administrasjonssystem/` | Administrasjonssystem for ordre og oppdrag | Administrasjonssystem for ordre og oppdrag | 58 |
| `/tjenester/ai-losninger/` | AI-løsninger for bedrifter – praktisk og nyttig | AI-løsninger som gir nytte | 55 |
| `/tjenester/kundeportal/` | Kundeportal for bedrifter – innlogging for kundene | Kundeportal for dine kunder | 56 |
| `/tjenester/modernisering-av-nettside/` | Modernisering av nettside og mobiltilpasning | Modernisering av nettside, tilpasset mobil | 57 |
| `/tjenester/nettside-med-booking/` | Nettside med bookingsystem og timebestilling | Nettside med bookingsystem | 61 |
| `/tjenester/nettside-med-priskalkulator/` | Nettside med priskalkulator for bedrifter | Nettside med priskalkulator | 56 |
| `/tjenester/sokemotoroptimalisering/` | Søkemotoroptimalisering (SEO) for bedriftsnettsider | Søkemotoroptimalisering for bedriftsnettsider | 57 |
| `/vedlikehold/` | Drift og vedlikehold av nettside og app fra 390 kr/mnd | Hold løsningen trygg og oppdatert | 56 |