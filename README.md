# vortexlabs.no

Nettsiden for Vortex Labs Norway (Martinsen Drift og Utvikling, org.nr. 935 046 734 MVA).

Statisk nettside uten avhengigheter. Kilden ligger i `src/`, `assets/`, `bilder/` og `config/`. `node build.mjs` bygger alt til `docs/`, som GitHub Pages skal publisere.

| Fil | Hva |
|---|---|
| `config/priser.json` | Alle priser, pakker, tillegg og vedlikehold. Brukes av sidene og priskalkulatoren. |
| `config/salg.json` | Salgskatalogen «Kjøp din egen app». Bare produkter med `godkjentForSalg: true` vises. |
| `config/nettsted.json` | Offentlig skjemaendepunkt, offentlig Turnstile-nettstedsnøkkel og dato for personvernerklæringen. |
| `src/prosjekter.mjs` | Porteføljen. Bare funksjoner som finnes i prosjektene. |
| `src/sider.mjs` | Innholdet på alle sidene. |
| `backend/` | Serverfunksjon og produksjonsoppsett for tilbudsskjemaet. |

Kvalitetssjekk etter bygging: `node sjekk.mjs` (titler, h1, canonical, sitemap, lenker, alt-tekster, delingsbilder).

Endre en pris eller legg ut en app: rediger `config/`, kjør `node build.mjs`, se over `docs/` lokalt (`python -m http.server` i `docs/`), og commit.
