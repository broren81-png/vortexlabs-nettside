# Serverfunksjon for tilbudsskjemaet (ikke i drift)

Nettsiden ligger på GitHub Pages, som bare kan levere statiske filer. Tilbudsskjemaet trenger derfor en liten serverfunksjon. Den ligger klar i `tilbud/index.ts` (Supabase Edge Function), men er **ikke satt i drift**.

Til den er i drift, lager skjemaet en ferdig utfylt e-post til `broren81@gmail.com` som kunden sender selv. Det står tydelig at henvendelsen ikke er sendt før kunden har trykket «Send» i e-postprogrammet.

## Dette må godkjennes og settes opp først

1. **E-post:** opprett `post@vortexlabs.no` hos Domeneshop og test at den virker.
2. **Resend:** opprett konto og bekreft domenet vortexlabs.no (DNS-poster i Domeneshop). Gratisplanen holder for et kontaktskjema.
3. **Supabase:** bruk et **eget** prosjekt for Vortex Labs (ikke KaloriVenn eller andre apper sitt prosjekt). Gratisplanen holder.
4. Sett hemmelighetene: `supabase secrets set RESEND_API_KEY=… TIL_EPOST=post@vortexlabs.no FRA_EPOST=skjema@vortexlabs.no TILLATT_OPPHAV=https://vortexlabs.no`
5. Sett i drift: `supabase functions deploy tilbud --no-verify-jwt`
6. Legg funksjonens URL i `config/nettsted.json` → `skjemaEndepunkt`, kjør `node build.mjs`, og test innsending.

Funksjonen har servervalidering, honningfelt, tidssperre, ratebegrensning (5 per 10 minutter per IP), begrenset størrelse, sjekk av opphav, og ingen hemmeligheter i nettsiden.
