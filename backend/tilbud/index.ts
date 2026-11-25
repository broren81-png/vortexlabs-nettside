// Offentlig Supabase Edge Function for vortexlabs.no. Oppsett: backend/README.md.
const TJENESTER = new Set(['designforslag', 'nettsidevurdering', 'tilbud-nettside', 'modernisering', 'tilbud-app', 'tilbud-webapp', 'bedriftssystem', 'videreutvikling', 'kjop-app', 'northcast-demo', 'interesseliste', 'annet']);
const MODELLER = new Set(['', 'eierskap-selvstendig', 'eierskap-med-drift', 'partnerskap', 'lisens', 'annet', 'apen']);
const EPOST = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const KILDE = /^\/(?:[a-z0-9-]+\/)*$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAKS_BYTES = 32_768;
const VINDU = 10 * 60 * 1000;
const FELTER = {
  navn: 100, bedrift: 150, epost: 200, telefon: 30, nettside: 300, tjeneste: 40, kjopsmodell: 40,
  beskrivelse: 5000, funksjoner: 2000, budsjett: 40, leveringstid: 40, estimat: 400, kilde: 120,
} as const;

async function lesJson(req: Request) {
  if (!req.body) return null;
  const reader = req.body.getReader();
  const bytes = new Uint8Array(MAKS_BYTES);
  let lengde = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (lengde + value.byteLength > bytes.byteLength) {
        void reader.cancel().catch(() => undefined);
        return false;
      }
      bytes.set(value, lengde);
      lengde += value.byteLength;
    }
    const data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(0, lengde)));
    return data && typeof data === 'object' && !Array.isArray(data) ? data as Record<string, unknown> : null;
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export function lagHandler(env: (key: string) => string | undefined, send = fetch) {
  const opphav = env('TILLATT_OPPHAV') ?? 'https://vortexlabs.no';
  const vertsnavn = new URL(opphav).hostname;
  const fra = env('FRA_EPOST') ?? '';
  const apiNokkel = env('RESEND_API_KEY');
  const turnstile = env('TURNSTILE_SECRET_KEY');
  const treff = new Map<string, { utlop: number; antall: number }>();
  let nesteOpprydding = 0;

  return async (req: Request) => {
    const cors = new Headers({ Vary: 'Origin', 'Cache-Control': 'no-store' });
    if (req.headers.get('origin') === opphav) {
      cors.set('Access-Control-Allow-Origin', opphav);
      cors.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      cors.set('Access-Control-Allow-Headers', 'content-type');
    }
    const svar = (status: number, body: object) => Response.json(body, { status, headers: cors });
    if (!cors.has('Access-Control-Allow-Origin')) return svar(403, { feil: 'Ugyldig opphav.' });
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'POST') return svar(405, { feil: 'Bare POST er tillatt.' });
    if (req.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
      return svar(415, { feil: 'Ugyldig innholdsformat.' });
    }
    const til = env('TIL_EPOST') ?? '';
    if (!apiNokkel || !turnstile || !EPOST.test(til) || !EPOST.test(fra)) {
      return svar(503, { feil: 'Skjemaet er midlertidig utilgjengelig. Prøv igjen senere.' });
    }
    const forLang = { feil: 'Henvendelsen er for lang.' };
    if (Number(req.headers.get('content-length')) > MAKS_BYTES) return svar(413, forLang);

    // Lokal grense per funksjonsinstans. Turnstile valideres for hver innsending på tvers av instanser.
    const na = Date.now();
    if (na >= nesteOpprydding) {
      for (const [ip, verdi] of treff) if (verdi.utlop <= na) treff.delete(ip);
      nesteOpprydding = na + VINDU;
    }
    const ip = req.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim().slice(0, 64);
    if (ip) {
      let verdi = treff.get(ip);
      if (!verdi || verdi.utlop <= na) {
        if (!verdi && treff.size >= 2000) treff.delete(treff.keys().next().value!);
        verdi = { utlop: na + VINDU, antall: 0 };
        treff.set(ip, verdi);
      }
      if (++verdi.antall > 10) return svar(429, { feil: 'For mange forsøk. Vent litt før du prøver igjen.' });
    }

    const data = await lesJson(req);
    if (data === false) return svar(413, forLang);
    if (!data) return svar(400, { feil: 'Ugyldig forespørsel.' });
    if (data.firmanettsted) return svar(422, { feil: 'Innsendingen kunne ikke godkjennes.' });
    const token = data.sikkerhetstoken;
    const referanse = data.referanse;
    if (typeof token !== 'string' || !token || token.length > 2048 || typeof referanse !== 'string' || !UUID.test(referanse)) {
      return svar(422, { feil: 'Fullfør sikkerhetskontrollen og prøv igjen.' });
    }

    const felt = {} as Record<keyof typeof FELTER, string>;
    for (const navn of Object.keys(FELTER) as (keyof typeof FELTER)[]) {
      const verdi = data[navn] ?? '';
      if (typeof verdi !== 'string' || verdi.length > FELTER[navn]) {
        return svar(422, { feil: 'Et av feltene har ugyldig lengde eller format.' });
      }
      felt[navn] = verdi.trim();
    }

    const feil: Record<string, string> = {};
    if (felt.navn.length < 2) feil.navn = 'Skriv inn navnet ditt.';
    if (felt.bedrift.length < 2) feil.bedrift = 'Skriv inn bedriftsnavnet, eller skriv Privat.';
    if (!EPOST.test(felt.epost)) feil.epost = 'Skriv inn en gyldig e-postadresse.';
    if (felt.telefon && !/^[+\d\s()-]{5,30}$/.test(felt.telefon)) feil.telefon = 'Telefonnummeret ser ikke riktig ut.';
    if (felt.nettside && !/^https?:\/\/\S+\.\S+$/.test(felt.nettside)) feil.nettside = 'Skriv adressen med https:// foran.';
    if (!TJENESTER.has(felt.tjeneste)) feil.tjeneste = 'Velg hva henvendelsen gjelder.';
    if (!MODELLER.has(felt.kjopsmodell)) feil.kjopsmodell = 'Ugyldig kjøpsmodell.';
    if (felt.beskrivelse.length < 10) feil.beskrivelse = 'Fortell oss litt om prosjektet.';
    if (felt.kilde && !KILDE.test(felt.kilde)) feil.kilde = 'Ugyldig kildeside.';
    if (Object.keys(feil).length) return svar(422, { feil: Object.values(feil)[0], felt: feil });

    try {
      const kontroll = await send('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: new URLSearchParams({ secret: turnstile, response: token }),
        signal: AbortSignal.timeout(5000),
      });
      if (!kontroll.ok) throw new Error('Turnstile utilgjengelig');
      const verifisert = await kontroll.json();
      if (verifisert.success !== true || verifisert.hostname !== vertsnavn || verifisert.action !== 'kontakt') {
        return svar(422, { feil: 'Sikkerhetskontrollen utløp eller ble avvist. Prøv igjen.' });
      }

      const innhold = Object.entries(felt).filter(([, verdi]) => verdi)
        .map(([navn, verdi]) => navn + ': ' + verdi).join('\n\n');
      const epost = await send('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + apiNokkel,
          'Content-Type': 'application/json',
          'Idempotency-Key': 'kontakt/' + referanse,
        },
        body: JSON.stringify({
          from: fra, to: [til], reply_to: felt.epost,
          subject: 'Ny henvendelse fra vortexlabs.no',
          text: innhold,
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!epost.ok) throw new Error('E-post avvist');
      const mottatt = await epost.json();
      if (typeof mottatt.id !== 'string' || !mottatt.id) throw new Error('Mangler e-postkvittering');
      return svar(200, { ok: true });
    } catch {
      return svar(502, { feil: 'Vi kunne ikke bekrefte innsendingen. Prøv igjen.' });
    }
  };
}

if ('Deno' in globalThis) {
  Deno.serve(lagHandler((key) => {
    const navn = key === 'TURNSTILE_SECRET_KEY' ? 'VORTEX_TURNSTILE_PRODUCTION_SECRET_KEY' : 'VORTEX_' + key;
    return Deno.env.get(navn);
  }));
}
