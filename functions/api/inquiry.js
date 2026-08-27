import{ensureSchema}from'../_lib/db.js';
const clean=(v,n=3000)=>String(v??'').trim().slice(0,n);
const arr=v=>Array.isArray(v)?v.map(x=>clean(x,80)).filter(Boolean).slice(0,12):[];
export async function onRequestPost({request,env}){
  if(!env.SESSION_SECRET)return Response.json({error:'Server-Konfiguration unvollständig: SESSION_SECRET fehlt.'},{status:503});
  try{await ensureSchema(env)}catch(e){return Response.json({error:e?.message==='DB_BINDING_MISSING'?'Datenbank-Binding DB fehlt.':'Datenbank konnte nicht initialisiert werden.'},{status:503})}
  let b;try{b=await request.json()}catch{return Response.json({error:'Ungültige Anfrage.'},{status:400})}
  if(b.company_website)return Response.json({ok:true});
  const name=clean(b.name,80),email=clean(b.email,120),phone=clean(b.phone,60),project=clean(b.project_type,80),pages=clean(b.pages_name,60),domain=clean(b.domain_help,30),message=clean(b.message,3000);
  if(!name||!email||!project||!message||b.consent!==true)return Response.json({error:'Bitte fülle alle Pflichtfelder aus.'},{status:400});
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return Response.json({error:'Bitte gib eine gültige E-Mail-Adresse ein.'},{status:400});
  const ip=request.headers.get('CF-Connecting-IP')||'unknown',ipHash=await hash(ip+env.SESSION_SECRET),tenMinAgo=new Date(Date.now()-10*60*1000).toISOString();
  const recent=await env.DB.prepare('SELECT COUNT(*) AS c FROM inquiries WHERE ip_hash=? AND created_at>?').bind(ipHash,tenMinAgo).first();
  if((recent?.c||0)>=4)return Response.json({error:'Zu viele Anfragen in kurzer Zeit. Bitte versuche es später erneut.'},{status:429});
  const details={
    contact_preference:clean(b.contact_preference,40),
    business_name:clean(b.business_name,120),
    current_website:clean(b.current_website,220),
    goal:clean(b.goal,1000),
    target_group:clean(b.target_group,500),
    style:clean(b.style,80),
    colors:clean(b.colors,200),
    page_scope:clean(b.page_scope,80),
    content_ready:clean(b.content_ready,80),
    deadline:clean(b.deadline,40),
    features:arr(b.features)
  };
  const id=crypto.randomUUID(),created=new Date().toISOString(),token=randomToken(),tokenHash=await hash(token+env.SESSION_SECRET);
  await env.DB.prepare('INSERT INTO inquiries(id,name,email,phone,project_type,pages_name,domain_help,message,details_json,chat_token_hash,created_at,status,ip_hash) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(id,name,email,phone,project,pages,domain,message,JSON.stringify(details),tokenHash,created,'new',ipHash).run();
  await env.DB.prepare('INSERT INTO messages(id,inquiry_id,sender,body,created_at) VALUES(?,?,?,?,?)')
    .bind(crypto.randomUUID(),id,'system','Deine Anfrage ist angekommen. In diesem Projektchat kannst du jederzeit Ergänzungen senden und Antworten von Collin lesen.',created).run();
  return Response.json({ok:true,id,chat_url:`/chat/?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`},{headers:{'cache-control':'no-store'}})
}
function randomToken(){const a=crypto.getRandomValues(new Uint8Array(24));return [...a].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function hash(v){const a=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));return [...new Uint8Array(a)].map(x=>x.toString(16).padStart(2,'0')).join('')}
