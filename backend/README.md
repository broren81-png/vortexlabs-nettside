# Kontaktskjema

GitHub Pages leverer nettsiden. Supabase Edge Function `vortexlabs-tilbud` validerer skjemaet og Cloudflare Turnstile. Resend formidler henvendelsen, og nettsiden bekrefter innsendingen etter at Resend har returnert en meldings-ID. Faktisk levering kontrolleres i mottakerens Gmail.

## Innstillinger i Supabase

Bruk det eksisterende HentBilen-prosjektet i Supabase (prosjektnavn HentMinBil). Legg inn koden fra `tilbud/index.ts` som Edge Function `vortexlabs-tilbud` med `verify_jwt = false`. Alle hemmelighetene for skjemaet har prefikset `VORTEX_` slik at de har egne navn i det delte prosjektet. Besøkende kan sende skjemaet uten å logge inn. Funksjonen validerer Turnstile for hver innsending.

| Innstilling | Verdi |
|---|---|
| `VORTEX_TIL_EPOST` | `broren81@gmail.com` som midlertidig mottaker. Endre bare denne hemmeligheten for å bytte mottaker senere. |
| `VORTEX_FRA_EPOST` | For produksjon brukes en adresse på et Resend-verifisert avsenderdomene. For en isolert innbokstest kan `onboarding@resend.dev` brukes hvis mottakeren er e-postadressen på Resend-kontoen. |
| `VORTEX_RESEND_API_KEY` | En Resend-nøkkel med sendetilgang. Begrens nøkkelen til avsenderdomenet når det er verifisert. |
| `VORTEX_TURNSTILE_PRODUCTION_SECRET_KEY` | Hemmelig nøkkel fra produksjonswidgeten for `vortexlabs.no`. |
| `VORTEX_TILLATT_OPPHAV` | Standardverdien er `https://vortexlabs.no`. |

Funksjonen tar bare imot mottakeradressen fra Supabase Secrets. Kundens e-postadresse valideres og settes i `Reply-To`. Ingen av de hemmelige nøklene legges i nettstedskoden eller Git.

## Avsender og DNS

Gmail er mottaker og trenger ingen DNS-endringer. Hvis Resend-kontoen allerede har et egnet verifisert avsenderdomene, bruk det. Ellers kan et eget avsendersubdomene, for eksempel `varsler.vortexlabs.no`, registreres i Resend for sending. Resend viser de eksakte oppføringene, normalt et DKIM-TXT på avsendersubdomenet og SPF-TXT og MX for Retursti på verten Resend oppgir. MX for Retursti gjelder returer fra utsending. Bruk ikke Resend til mottak på hoveddomenet. Behold de eksisterende MX-, SPF- og øvrige e-postinnstillingene for hoveddomenet hos Domeneshop. Fastsett og godkjenn eventuelle nye DNS-oppføringer separat.

Turnstile krever en Cloudflare-konto og en widget for `vortexlabs.no`. Widgeten krever ingen DNS-endring eller flytting av navnetjenere.

## Bygg og godkjent test

1. Sett den offentlige Supabase-funksjonsadressen og den offentlige Turnstile-nettstedsnøkkelen i `config/nettsted.json`. Tom konfigurasjon holder innsendingen deaktivert.
2. Kjør `node build.mjs` og `node sjekk.mjs`. For en forhåndsvisning må Turnstile-vertsnavnet og tillatt opphav samsvare med det avtalte testmiljøet.
3. Etter godkjenning, send én merket henvendelse med syntetiske data fra skjemaet. Bekreft kvitteringen i nettleseren. Finn meldingen i Gmail, kontroller mottaker, `Reply-To` og kildesiden i e-postinnholdet. En kvittering fra Resend alene teller ikke som mottak i Gmail.
4. Før ordinær aktivering brukes produksjonswidgeten og den verifiserte produksjonsavsenderen. En eventuell Resend-testavsender brukes bare til en avgrenset test.

Funksjonen begrenser forespørselsstørrelsen og frekvens per instans, avviser et utfylt honningfelt og sjekker Turnstile-token, handlingsnavn og vertsnavn for hver innsending. Resend dedupliserer nye forsøk når nettleseren gjenbruker samme innsending-ID. Personvernerklæringen omtaler leverandørene når direkte innsending er konfigurert.
