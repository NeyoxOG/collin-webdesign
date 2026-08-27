const enc=new TextEncoder();
const b64url=buf=>btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
async function hmac(value,secret){const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return b64url(await crypto.subtle.sign('HMAC',key,enc.encode(value)))}
export async function createSession(username,secret){const exp=Date.now()+12*60*60*1000;const payload=btoa(JSON.stringify({u:username,e:exp,n:crypto.randomUUID()})).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');return `${payload}.${await hmac(payload,secret)}`}
export async function verifySession(request,secret){const raw=request.headers.get('cookie')||'';const token=raw.split(';').map(v=>v.trim()).find(v=>v.startsWith('cj_session='))?.slice(11);if(!token||!secret)return false;const [p,s]=token.split('.');if(!p||!s)return false;if((await hmac(p,secret))!==s)return false;try{const json=JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/')));return json.u==='Collin'&&Number(json.e)>Date.now()}catch{return false}}
export async function sha256(value){return new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(value)))}
export function safeEqual(a,b){if(a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a[i]^b[i];return x===0}
