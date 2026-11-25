import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {runInNewContext} from 'node:vm';
import {lagHandler} from '../backend/tilbud/index.ts';

const origin = 'https://vortexlabs.no';
const source = readFileSync('assets/app.js','utf8');
const html = Object.fromEntries(['/kjop-app/','/prosjekter/northcast/','/kontakt/'].map(path =>
  [path,readFileSync('docs'+path+'index.html','utf8')]));
const kinds = new Map([
 ['northcast-demo','Privat demonstrasjon'], ['northcast-kjop','Kjøpsinteresse'], ['northcast-info','Mer informasjon']
]);
const node = (value='') => ({
  value, checked:false, disabled:false, hidden:false, attrs:{}, handlers:{}, dataset:{},
  addEventListener(key,fn){this.handlers[key]=fn;},
  setAttribute(key,v){this.attrs[key]=v;},
  removeAttribute(key){delete this.attrs[key];},
  focus(){}
});
function simulate(url, emailStatus=200, captchaOk=true) {
  const elements = {};
  const selectors = {};
  for (const id of ['tilbudsskjema','kjopsmodell-felt','estimat','estimat-felt','kilde-felt','skjemastatus','send-knapp','skjema-sikkerhet']) selectors['#'+id]=node();
  const form=selectors['#tilbudsskjema'];
  const tjeneste=node('');
  tjeneste.options=[...html['/kontakt/'].matchAll(/<option value="([^"]*)">/g)].map(([,value])=>({value}));
  selectors['#tjeneste']=tjeneste;
  Object.assign(elements,{tjeneste,kjopsmodell:node(),estimat:selectors['#estimat-felt'],kilde:selectors['#kilde-felt'],firmanettsted:node()});
  for (const id of ['navn','bedrift','epost','telefon','nettside','tjeneste','beskrivelse']) {
    elements[id]??=node();
    selectors['#'+id+'-feil']=node();
  }
  form.elements=elements;
  form.reset=()=>Object.values(elements).forEach(e=>{e.value='';});
  form.querySelector=()=>Object.values(elements).find(e=>e.attrs['aria-invalid']==='true');
  selectors['#send-knapp'].disabled=true;
  selectors['#skjema-sikkerhet'].dataset.sitekey='test-widget';
  selectors['meta[name="skjema-endepunkt"]']={content:'https://example.com/functions/v1/tilbud'};
  let script, callback;
  const emails=[];
  const env={RESEND_API_KEY:'test-resend',TURNSTILE_SECRET_KEY:'test-captcha',TIL_EPOST:'mottaker@example.com',FRA_EPOST:'avsender@example.com'};
  const handler=lagHandler(k=>env[k],async (target,args)=>{
    if(target.includes('siteverify')) return Response.json({success:captchaOk,hostname:'vortexlabs.no',action:'kontakt'});
    emails.push(JSON.parse(args.body));
    return Response.json(emailStatus===200 ? {id:'test-id'} : {error:'test'}, {status:emailStatus});
  });
  const fetch=(endpoint,options)=>handler(new Request(endpoint,{
    ...options,headers:{...options.headers,origin}
  }));
  const document={
    referrer:'',querySelector:s=>selectors[s]??null,querySelectorAll:()=>[],createElement:()=>node(),
    head:{appendChild:n=>{script=n;}}
  };
  const window={turnstile:{
    render(element,options){callback=options.callback;callback('test-token');return 'widget';},
    reset(){callback('test-token-next');}
  }};
  runInNewContext(source,{window,document,URLSearchParams,URL,location:{search:url.search,origin},crypto,AbortSignal,fetch,
    FormData:class {constructor(f){return Object.entries(f.elements).filter(([,el])=>!el.disabled).map(([k,el])=>[k,el.value]);}}});
  script.onload();
  const selected=elements.tjeneste.value;
  for(const [key,value] of Object.entries({navn:'Eksempel Kjøper',bedrift:'Eksempel AS',epost:'kjoper@example.com',beskrivelse:'Lokal kontroll av salgsflyten.'})) elements[key].value=value;
  return {selected, emails, status:selectors['#skjemastatus'], send:()=>form.handlers.submit({preventDefault(){}})};
}
for (const page of ['/kjop-app/','/prosjekter/northcast/']) {
  const links=[...html[page].matchAll(/href="([^"]*produkt=northcast[^"]*)"/g)].map(([,href])=>new URL(href.replaceAll('&amp;','&'),origin));
  assert.deepEqual([...new Set(links.map(u=>u.searchParams.get('tjeneste')))].sort(),[...kinds.keys()].sort());
  for (const type of kinds.keys()) {
    const url=links.find(u=>u.searchParams.get('tjeneste')===type);
    test(page+' '+type,async ()=>{
      assert.equal(url.pathname,'/kontakt/');
      const form=simulate(url);
      assert.equal(form.selected,type);
      await form.send();
      assert.equal(form.emails.length,1);
      const [mail]=form.emails;
      assert.equal(mail.subject,'Northcast – '+kinds.get(type));
      assert.ok(mail.text.includes('Produkt: Northcast\nHenvendelsestype: '+kinds.get(type)));
      assert.ok(mail.text.includes('kilde: '+page));
      assert.equal(mail.reply_to,'kjoper@example.com');
      assert.deepEqual(mail.to,['mottaker@example.com']);
      assert.match(form.status.className,/\bok\b/);
    });
  }
}
test('avvist sikkerhetskontroll gir ingen e-post eller bekreftelse',async ()=>{
 const f=simulate(new URL('/kontakt/?tjeneste=northcast-demo',origin),200,false);
 await f.send();
 assert.equal(f.emails.length,0);
 assert.match(f.status.className,/\bfeil\b/);
});
test('avvist utsending gir feilmelding uten kvittering',async ()=>{
 const f=simulate(new URL('/kontakt/?tjeneste=northcast-kjop',origin),403);
 await f.send();
 assert.equal(f.emails.length,1);
 assert.match(f.status.className,/\bfeil\b/);
});
test('vanlig henvendelse beholder tidligere emne',async ()=>{
 const f=simulate(new URL('/kontakt/?tjeneste=annet',origin));
 await f.send();
 assert.equal(f.emails[0].subject,'Ny henvendelse fra vortexlabs.no');
});
test('separat tilbud om utvidelser og korrekt pris',()=>{
 const page=html['/prosjekter/northcast/'];
 assert.match(page,/499[\s ]000[\s ]kr/);
 assert.match(page,/Mulighet for en komplett digital plattform/);
 assert.match(page,/etter separat avtale og er ikke inkludert i dagens prisantydning på 499[\s ]000[\s ]kr/);
 assert.match(page,/Integrasjon mellom nettsiden og mobilappen/);
 assert.match(page,/Løsninger for kommersielle samarbeidspartnere/);
 assert.match(page,/href="\/kontakt\/\?tjeneste=northcast-demo&amp;produkt=northcast&amp;kilde=%2Fprosjekter%2Fnorthcast%2F">Kontakt oss for en uforpliktende samtale og privat demonstrasjon\./);
 assert.ok(page.indexOf('Planlagte funksjoner')>page.indexOf('Implementert i utviklingsversjonen'));
 assert.ok(page.indexOf('Mulighet for en komplett digital plattform')>page.indexOf('Dette kan inngå i en full overtakelse'));
});
