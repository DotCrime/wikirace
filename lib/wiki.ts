export type Page={pageid:number;title:string;extract?:string;ns?:number;pageprops?:Record<string,string>;missing?:boolean;redirect?:boolean};
export type Article=Page & {html:string;revid:number};
export async function api(params:Record<string,string>):Promise<any>{
 const q=new URLSearchParams(params);
 let r:Response;
 try{r=await fetch('/api/wiki?'+q,{signal:AbortSignal.timeout(22000)});if(!r.ok)throw Error();}
 catch{r=await fetch('https://de.wikipedia.org/w/api.php?'+q+'&format=json&formatversion=2&origin=*',{signal:AbortSignal.timeout(18000)});}
 if(!r.ok) throw Error('Wikipedia ist gerade nicht erreichbar. Bitte versuche es erneut.');
 const d:any=await r.json();if(d.error)throw Error(d.error.info||'Der Artikel konnte nicht geladen werden.');return d;
}
export async function resolve(title:string){const d=await api({action:'query',titles:title,redirects:'1',prop:'pageprops|extracts',ppprop:'disambiguation',exintro:'1',explaintext:'1',exsentences:'2'});const p=d.query?.pages?.[0];if(!p||p.missing||p.ns!==0)throw Error('Dieser Link führt zu keinem verfügbaren Wikipedia-Artikel.');return p as Page;}
export async function randomPair(){for(let i=0;i<5;i++){const d=await api({action:'query',generator:'random',grnnamespace:'0',grnlimit:'8',grnfilterredir:'nonredirects',prop:'pageprops|extracts',ppprop:'disambiguation',exintro:'1',explaintext:'1',exsentences:'2'});const pages=(d.query?.pages||[]).filter((p:Page)=>p.ns===0&&!p.missing&&!p.redirect&&!p.pageprops?.hasOwnProperty('disambiguation'));if(pages.length>=2)return pages.slice(0,2) as Page[];}throw Error('Keine passende Kombination gefunden. Bitte erneut würfeln.');}
export async function search(q:string){const d=await api({action:'query',generator:'search',gsrsearch:q,gsrnamespace:'0',gsrlimit:'7',prop:'pageprops',ppprop:'disambiguation'});return (d.query?.pages||[]).filter((p:Page)=>!p.pageprops?.hasOwnProperty('disambiguation')) as Page[];}
export async function article(title:string):Promise<Article>{const p=await resolve(title);const d=await api({action:'parse',pageid:String(p.pageid),prop:'text|revid|links',disableeditsection:'1',disablelimitreport:'1'});return {...p,html:sanitize(d.parse.text,p.title,new Set(d.parse.links.filter((l:any)=>l.ns===0&&l.exists).map((l:any)=>l.title))),revid:d.parse.revid};}
export function wikiUrl(title:string){return 'https://de.wikipedia.org/wiki/'+encodeURIComponent(title.replaceAll(' ','_'));}
function sanitize(raw:string,title:string,links:Set<string>){
 const doc=new DOMParser().parseFromString(raw,'text/html');
 doc.querySelectorAll('script,style,iframe,object,embed,form,input,button,link,meta,.mw-editsection,.navbox,.metadata,.noprint').forEach(e=>e.remove());
 const tags=new Set('P DIV SPAN A B STRONG I EM U S SMALL SUP SUB H2 H3 H4 H5 H6 UL OL LI DL DT DD BLOCKQUOTE TABLE THEAD TBODY TFOOT TR TD TH CAPTION IMG FIGURE FIGCAPTION BR HR ABBR CODE PRE SECTION MATH'.split(' '));
 function clean(n:Node):Node{
 if(n.nodeType===3)return document.createTextNode(n.textContent||'');
 const el=n as Element;if(n.nodeType!==1)return document.createTextNode('');
 if(!tags.has(el.tagName)){const f=document.createDocumentFragment();el.childNodes.forEach(c=>f.appendChild(clean(c)));return f;}
 const out=document.createElement(el.tagName.toLowerCase());
 for(const k of ['id','colspan','rowspan','title','alt'])if(el.hasAttribute(k))out.setAttribute(k,el.getAttribute(k)!);
 if(el.tagName==='IMG'){
 try{const u=new URL(el.getAttribute('src')||'',wikiUrl(title));if(u.protocol==='https:'&&u.hostname==='upload.wikimedia.org'){out.setAttribute('src',u.href);out.setAttribute('loading','lazy');if(el.hasAttribute('width'))out.setAttribute('width',el.getAttribute('width')!);}else return document.createTextNode('');}catch{return document.createTextNode('');}
 }
 if(el.tagName==='A'){
 try{const href=el.getAttribute('href')||'';const u=new URL(href,wikiUrl(title));let t=u.pathname.startsWith('/wiki/')?decodeURIComponent(u.pathname.slice(6)).replaceAll('_',' '):'';
 if(href.startsWith('#')||(u.hostname==='de.wikipedia.org'&&t===title&&u.hash)){out.setAttribute('href',u.hash);out.setAttribute('data-anchor',decodeURIComponent(u.hash.slice(1)));}
 else if(u.hostname==='de.wikipedia.org'&&links.has(t)){out.setAttribute('href','#');out.setAttribute('data-article',t);if(u.hash)out.setAttribute('data-section',decodeURIComponent(u.hash.slice(1)));}
 else {out.setAttribute('class','disabled-link');out.setAttribute('title','Dieser Link ist während der Runde nicht verfügbar.');if(el.querySelector('img')){out.setAttribute('data-credit',u.href);}}
 }catch{}
 }
 el.childNodes.forEach(c=>out.appendChild(clean(c)));return out;
 }
 const root=document.createElement('div');doc.body.childNodes.forEach(c=>root.appendChild(clean(c)));return root.innerHTML;
}
