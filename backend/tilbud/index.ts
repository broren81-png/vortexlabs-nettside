// Supabase Edge Function: tar imot tilbudsskjemaet på vortexlabs.no og sender det på e-post via Resend.
// IKKE satt i drift. Se backend/README.md for hva som må godkjennes og settes opp først.
//
// Hemmeligheter (settes med `supabase secrets set`, aldri i nettsiden):
//   RESEND_API_KEY   – nøkkel fra resend.com
//   TIL_EPOST        – mottaker, f.eks. post@vortexlabs.no når den finnes
//   FRA_EPOST        – avsender på et verifisert domene, f.eks. skjema@vortexlabs.no
//   TILLATT_OPPHAV   – https://vortexlabs.no

const OPPHAV = Deno.env.get('TILLATT_OPPHAV') ?? 'https://vortexlabs.no';
const cors = { 'Access-Control-Allow-Origin': OPPHAV, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'content-type', Vary: 'Origin' };
const svar = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

// Enkel ratebegrensning per IP i minnet (nullstilles når funksjonen startes på nytt). 5 per 10 minutter.
const treff = new Map<string, number[]>();
const VINDU = 10 * 60 * 1000, MAKS = 5;
function forMange(ip: string) {
  const na = Date.now();
  const liste = (treff.get(ip) ?? []).filter((t) => na - t < VINDU);
  liste.push(na);
  treff.set(ip, liste);
  return liste.length > MAKS;
}

const TJENESTER = new Set(['designforslag', 'tilbud-nettside', 'tilbud-app', 'tilbud-webapp', 'bedriftssystem', 'videreutvikling', 'kjop-app', 'interesseliste', 'annet']);
const MODELLER = new Set(['', 'eierskap-selvstendig', 'eierskap-med-drift', 'partnerskap', 'lisens', 'annet', 'apen']);
const tekst = (v: unknown, maks: number) => (typeof v === 'string' ? v.trim().slice(0, maks) : '');
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'POST') return svar(405, { feil: 'Bare POST er tillatt.' });
  if (req.headers.get('origin') !== OPPHAV) return svar(403, { feil: 'Ugyldig opphav.' });
  if (Number(req.headers.get('content-length') ?? 0) > 20000) return svar(413, { feil: 'Henvendelsen er for lang.' });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'ukjent';
  if (forMange(ip)) return svar(429, { feil: 'Du har sendt mange henvendelser på kort tid. Vent litt og prøv igjen.' });

  let d: Record<string, unknown>;
  try { d = await req.json(); } catch { return svar(400, { feil: 'Ugyldig forespørsel.' }); }

  // Spamvern: honningfelt og for rask utfylling
  if (tekst(d.firmanettsted, 200)) return svar(200, { ok: true });
  if (typeof d.tidBrukt === 'number' && d.tidBrukt < 3) return svar(200, { ok: true });

  const f = {
    navn: tekst(d.navn, 100), bedrift: tekst(d.bedrift, 150), epost: tekst(d.epost, 200), telefon: tekst(d.telefon, 30),
    nettside: tekst(d.nettside, 300), tjeneste: tekst(d.tjeneste, 40), kjopsmodell: tekst(d.kjopsmodell, 40),
    beskrivelse: tekst(d.beskrivelse, 5000), funksjoner: tekst(d.funksjoner, 2000), budsjett: tekst(d.budsjett, 40),
    leveringstid: tekst(d.leveringstid, 40), estimat: tekst(d.estimat, 400),
  };
  const feil: Record<string, string> = {};
  if (f.navn.length < 2) feil.navn = 'Skriv inn navnet ditt.';
  if (f.bedrift.length < 2) feil.bedrift = 'Skriv inn bedriftsnavnet.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.epost)) feil.epost = 'Skriv inn en gyldig e-postadresse.';
  if (f.telefon && !/^[+\d\s()-]{5,30}$/.test(f.telefon)) feil.telefon = 'Telefonnummeret ser ikke riktig ut.';
  if (f.nettside && !/^https?:\/\/\S+\.\S+/.test(f.nettside)) feil.nettside = 'Skriv adressen med https:// foran.';
  if (!TJENESTER.has(f.tjeneste)) feil.tjeneste = 'Velg hva henvendelsen gjelder.';
  if (!MODELLER.has(f.kjopsmodell)) feil.kjopsmodell = 'Ugyldig kjøpsmodell.';
  if (f.beskrivelse.length < 10) feil.beskrivelse = 'Fortell oss litt om prosjektet.';
  if (Object.keys(feil).length) return svar(422, { feil: Object.values(feil)[0], felt: feil });

  const linjer = Object.entries(f).filter(([, v]) => v).map(([k, v]) => `<tr><th align="left" valign="top">${esc(k)}</th><td>${esc(v).replace(/\n/g, '<br>')}</td></tr>`).join('');
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: Deno.env.get('FRA_EPOST'), to: [Deno.env.get('TIL_EPOST')], reply_to: f.epost,
      subject: `Henvendelse: ${f.tjeneste} – ${f.bedrift}`,
      html: `<p>Ny henvendelse fra vortexlabs.no</p><table cellpadding="6">${linjer}</table>`,
    }),
  });
  if (!r.ok) return svar(502, { feil: 'Henvendelsen kunne ikke sendes akkurat nå. Prøv igjen, eller send e-post direkte.' });
  return svar(200, { ok: true });
});
