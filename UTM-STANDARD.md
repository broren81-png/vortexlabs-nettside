# UTM-standard for vortexlabs.no

Gjelder alle lenker til vortexlabs.no fra markedsføring: Facebook, LinkedIn, e-post og åpningskampanjen. Google Analytics (G-VVKJ23QH0E) leser parameterne når besøkende har godtatt statistikk. Nettsiden sender bare UTM-parametere og egne ikke-personlige parametere videre til Analytics (se `assets/samtykke.js`).

## Regler

1. **Bare små bokstaver, tall og bindestrek.** Ingen mellomrom, æ/ø/å eller store bokstaver: `apningskampanje`, ikke `Åpningskampanje`. GA skiller mellom `facebook` og `Facebook`.
2. **Alltid tre faste parametere:** `utm_source`, `utm_medium`, `utm_campaign`. `utm_content` brukes for å skille annonser eller lenker i samme kampanje. `utm_term` brukes bare for betalte søkeord.
3. **Aldri personopplysninger** i parameterne: ingen navn, e-postadresser, telefonnumre eller kunde-ID-er.
4. **Lenk til riktig landingsside med skråstrek til slutt**, for eksempel `https://vortexlabs.no/nettsider/`. Da unngås en omdirigering som kan miste parametere.
5. **Ikke bruk UTM på interne lenker** på vortexlabs.no. Det starter en ny økt og ødelegger kildedataene.
6. Før kampanjen loggføres hver lenke i tabellen nederst.

## Faste verdier

| Kanal | utm_source | utm_medium |
|---|---|---|
| Facebook, organisk innlegg | `facebook` | `social` |
| Facebook, betalt annonse | `facebook` | `paid-social` |
| Instagram, organisk | `instagram` | `social` |
| LinkedIn, organisk innlegg | `linkedin` | `social` |
| LinkedIn, betalt annonse | `linkedin` | `paid-social` |
| E-post / nyhetsbrev | `nyhetsbrev` (eller navnet på utsendelsen) | `email` |
| Personlig e-post fra Glenn | `epost-direkte` | `email` |
| QR-kode på trykksak | `trykk` | `qr` |

`utm_medium` følger Googles standardnavn (`social`, `paid-social`, `email`), slik at trafikken havner i riktig standardkanalgruppe i GA4.

**`utm_campaign`:** `<tema>-<år>-<måned>`, for eksempel `apningskampanje-2026-12`, `kjop-app-2027-01`, `nettside-tilbud-2027-02`.

**`utm_content`:** hva lenken er, for eksempel `video-1`, `bilde-karusell`, `knapp-topp`, `signatur`.

## Ferdige eksempler for åpningskampanjen

```
https://vortexlabs.no/?utm_source=facebook&utm_medium=social&utm_campaign=apningskampanje-2026-12&utm_content=innlegg-1
https://vortexlabs.no/?utm_source=facebook&utm_medium=paid-social&utm_campaign=apningskampanje-2026-12&utm_content=annonse-a
https://vortexlabs.no/nettsider/?utm_source=linkedin&utm_medium=social&utm_campaign=apningskampanje-2026-12&utm_content=innlegg-nettsider
https://vortexlabs.no/kjop-app/?utm_source=linkedin&utm_medium=social&utm_campaign=apningskampanje-2026-12&utm_content=innlegg-kjop-app
https://vortexlabs.no/kontakt/?tjeneste=designforslag&utm_source=nyhetsbrev&utm_medium=email&utm_campaign=apningskampanje-2026-12&utm_content=knapp-designforslag
```

Kontaktlenker kan ha `tjeneste=` først for å forhåndsvelge tjeneste i skjemaet. Gyldige verdier: `designforslag`, `nettsidevurdering`, `tilbud-nettside`, `tilbud-app`, `tilbud-webapp`, `bedriftssystem`, `videreutvikling`, `kjop-app`, `interesseliste`, `annet`.

## Slik ser du resultatene i GA4

- **Rapporter → Anskaffelse → Trafikkanskaffelse:** velg dimensjonen «Økt – kampanje» eller «Økt – kilde/medium».
- **Leads per kampanje:** samme rapport, med nøkkelhendelsen `generate_lead` som beregning.
- Besøkende som avslår statistikk, telles ikke. Tallene viser derfor bare dem som har samtykket.
- Kampanjen registreres bare hvis besøkende godtar statistikk på landingssiden. Godtar de først på en senere side, regnes besøket som direkte trafikk.

## Lenkelogg

| Dato | Kanal | Landingsside | utm_campaign | utm_content | Kommentar |
|---|---|---|---|---|---|
| | | | | | |
