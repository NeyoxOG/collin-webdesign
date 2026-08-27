const $=(q,c=document)=>c.querySelector(q);const $$=(q,c=document)=>[...c.querySelectorAll(q)];
$('#year').textContent=new Date().getFullYear();

const menuBtn=$('.menu-btn'),mobileNav=$('.mobile-nav');
menuBtn?.addEventListener('click',()=>{const open=menuBtn.getAttribute('aria-expanded')==='true';menuBtn.setAttribute('aria-expanded',String(!open));mobileNav.classList.toggle('open',!open);mobileNav.setAttribute('aria-hidden',String(open));});
$$('.mobile-nav a').forEach(a=>a.addEventListener('click',()=>{mobileNav.classList.remove('open');mobileNav.setAttribute('aria-hidden','true');menuBtn.setAttribute('aria-expanded','false');}));

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){const d=Number(e.target.dataset.delay||0);setTimeout(()=>e.target.classList.add('visible'),d);observer.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -50px'});$$('.reveal').forEach(el=>observer.observe(el));

if(matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
  const glow=$('.cursor-glow');window.addEventListener('pointermove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';const hero=$('.hero-visual');if(!hero)return;const r=hero.getBoundingClientRect(),x=(e.clientX-(r.left+r.width/2))/r.width,y=(e.clientY-(r.top+r.height/2))/r.height;$$('.parallax',hero).forEach(el=>{const d=Number(el.dataset.depth||10);el.style.translate=`${x*d}px ${y*d}px`;});});
}

const form=$('#requestForm'),status=$('#formStatus');
form?.addEventListener('submit',async e=>{e.preventDefault();status.className='form-status';if(!form.reportValidity())return;const btn=$('button[type=submit]',form);btn.disabled=true;btn.style.opacity='.65';status.textContent='Anfrage wird gesendet …';
  const data=Object.fromEntries(new FormData(form).entries());data.consent=Boolean(data.consent);
  try{const res=await fetch('/api/inquiry',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});const out=await res.json().catch(()=>({}));if(!res.ok)throw new Error(out.error||'Die Anfrage konnte nicht gesendet werden.');form.reset();status.textContent='Danke! Deine Anfrage wurde gespeichert.';status.classList.add('success');}
  catch(err){status.textContent=err.message||'Es ist ein Fehler aufgetreten.';status.classList.add('error');}
  finally{btn.disabled=false;btn.style.opacity='';}
});
