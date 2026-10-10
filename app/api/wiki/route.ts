import { NextRequest } from 'next/server';
export async function GET(req: NextRequest) {
 const p=req.nextUrl.searchParams;
 const params=new URLSearchParams({format:'json',formatversion:'2',origin:'*'});
 const allowed=['action','titles','pageids','redirects','prop','exintro','explaintext','exsentences','generator','grnnamespace','grnlimit','grnfilterredir','gsrsearch','gsrnamespace','gsrlimit','pageid','disableeditsection','disablelimitreport','ppprop'];
 for(const k of allowed) if(p.has(k)) params.set(k,p.get(k)!);
 if(!['query','parse'].includes(params.get('action')||'')) return Response.json({error:{info:'Ungültige Anfrage'}},{status:400});
 try {
 const r=await fetch('https://de.wikipedia.org/w/api.php?'+params,{headers:{'User-Agent':'WikiRace/1.0 (educational Wikipedia navigation game; https://wikirace.toyshark.chatgpt.site)'},signal:AbortSignal.timeout(18000)});
 if(!r.ok) throw new Error('Wikipedia antwortet momentan nicht.');
 return new Response(await r.text(),{headers:{'Content-Type':'application/json','Cache-Control':params.has('generator')?'no-store':'public, max-age=120'}});
 } catch {return Response.json({error:{info:'Wikipedia ist gerade nicht erreichbar. Bitte versuche es erneut.'}},{status:502});}
}
