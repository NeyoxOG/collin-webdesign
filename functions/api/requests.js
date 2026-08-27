import{verifySession}from'../_lib/auth.js';
import{ensureSchema}from'../_lib/db.js';
async function authed(request,env){return verifySession(request,env.SESSION_SECRET)}
const deny=()=>Response.json({error:'Nicht autorisiert.'},{status:401,headers:{'cache-control':'no-store'}});
async function ready(env){if(!env.SESSION_SECRET)return Response.json({error:'SESSION_SECRET fehlt.'},{status:503});try{await ensureSchema(env);return null}catch(e){return Response.json({error:e?.message==='DB_BINDING_MISSING'?'Datenbank-Binding DB fehlt.':'Datenbank konnte nicht initialisiert werden.'},{status:503})}}
const allowed=new Set(['requested','confirmed','in_progress','design','done','rejected']);
const statusMessages={requested:'Der Projektstatus wurde auf „Anfrage eingegangen“ gesetzt.',confirmed:'Auftrag bestätigt ✓ Deine Anfrage wurde angenommen. Wir können mit der Umsetzung starten.',in_progress:'Dein Auftrag ist jetzt in Bearbeitung.',design:'Deine Website befindet sich aktuell in der Design- und Umsetzungsphase.',done:'Fertig ✓ Dein Auftrag wurde als abgeschlossen markiert.',rejected:'Die Anfrage wurde aktuell nicht angenommen. Bei Fragen kannst du weiterhin den Projektchat nutzen.'};
export async function onRequestGet({request,env}){const err=await ready(env);if(err)return err;if(!await authed(request,env))return deny();const{results}=await env.DB.prepare("SELECT i.id,i.name,i.email,i.phone,i.project_type,i.pages_name,i.domain_help,i.message,i.details_json,i.created_at,i.status,i.project_status,i.status_note,i.confirmed_at,i.updated_at,(SELECT COUNT(*) FROM messages m WHERE m.inquiry_id=i.id) AS message_count FROM inquiries i ORDER BY i.created_at DESC LIMIT 200").all();return Response.json({requests:results},{headers:{'cache-control':'no-store'}})}
export async function onRequestPatch({request,env}){const err=await ready(env);if(err)return err;if(!await authed(request,env))return deny();let b;try{b=await request.json()}catch{return Response.json({error:'Ungültige Anfrage.'},{status:400})}if(!b.id)return Response.json({error:'ID fehlt.'},{status:400});
  if(b.project_status){
    const next=String(b.project_status),note=String(b.status_note||'').trim().slice(0,500);if(!allowed.has(next))return Response.json({error:'Ungültiger Projektstatus.'},{status:400});
    const current=await env.DB.prepare('SELECT project_status FROM inquiries WHERE id=?').bind(b.id).first();if(!current)return Response.json({error:'Anfrage nicht gefunden.'},{status:404});
    const now=new Date().toISOString();
    await env.DB.prepare("UPDATE inquiries SET project_status=?,status_note=?,updated_at=?,confirmed_at=CASE WHEN ?='confirmed' AND confirmed_at IS NULL THEN ? ELSE confirmed_at END,status='read' WHERE id=?").bind(next,note,now,next,now,b.id).run();
    if(current.project_status!==next){const text=statusMessages[next]+(note?`\n\nHinweis: ${note}`:'');await env.DB.prepare('INSERT INTO messages(id,inquiry_id,sender,body,created_at) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),b.id,'system',text,now).run()}
    return Response.json({ok:true,project_status:next,updated_at:now},{headers:{'cache-control':'no-store'}})
  }
  await env.DB.prepare('UPDATE inquiries SET status=? WHERE id=?').bind(b.status==='read'?'read':'new',b.id).run();return Response.json({ok:true})}
export async function onRequestDelete({request,env}){const err=await ready(env);if(err)return err;if(!await authed(request,env))return deny();const b=await request.json();if(!b.id)return Response.json({error:'ID fehlt.'},{status:400});await env.DB.batch([env.DB.prepare('DELETE FROM messages WHERE inquiry_id=?').bind(b.id),env.DB.prepare('DELETE FROM inquiries WHERE id=?').bind(b.id)]);return Response.json({ok:true})}
