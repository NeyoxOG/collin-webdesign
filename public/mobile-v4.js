(()=>{
  const mq=matchMedia('(max-width:760px)');
  if(!mq.matches)return;
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const $=(q,c=document)=>c.querySelector(q),$$=(q,c=document)=>[...c.querySelectorAll(q)];

  document.body.classList.add('mobile-fx-ready');
  document.body.insertAdjacentHTML('afterbegin','<div class="mobile-fx-layer" aria-hidden="true"><div class="fx-grid"></div><div class="fx-aurora fx-a"></div><div class="fx-aurora fx-b"></div><div class="fx-aurora fx-c"></div><div class="fx-beam"></div><div class="fx-ring"></div></div><div class="mobile-scroll-progress" aria-hidden="true"><i></i></div>');
  const fx=$('.mobile-fx-layer');
  if(!reduce){
    const count=innerWidth<390?12:16;
    for(let i=0;i<count;i++){
      const p=document.createElement('span');p.className='fx-particle';
      p.style.left=`${Math.round(Math.random()*100)}%`;p.style.top=`${65+Math.round(Math.random()*50)}%`;
      p.style.setProperty('--dur',`${8+Math.random()*10}s`);p.style.setProperty('--delay',`${-Math.random()*12}s`);p.style.setProperty('--drift',`${-34+Math.random()*68}px`);fx.append(p);
    }
  }

  let ticking=false;
  const updateScroll=()=>{const max=Math.max(1,document.documentElement.scrollHeight-innerHeight),y=scrollY,p=Math.min(1,Math.max(0,y/max));document.documentElement.style.setProperty('--mobile-scroll',`${y}px`);document.documentElement.style.setProperty('--page-progress',p.toFixed(4));ticking=false};
  addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateScroll);ticking=true}},{passive:true});updateScroll();

  const targets=$$('main > section,.glass,.step,.feature-card,.hero-stats > div');
  if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('mobile-inview');io.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -8%'});targets.forEach(el=>io.observe(el))}else targets.forEach(el=>el.classList.add('mobile-inview'));

  const rippleTargets='.btn,button,.feature-card,.step,.chips span,.mobile-nav a';
  document.addEventListener('pointerdown',e=>{const el=e.target.closest(rippleTargets);if(!el||reduce)return;const r=el.getBoundingClientRect(),s=document.createElement('span');s.className='tap-ripple';s.style.left=`${e.clientX-r.left}px`;s.style.top=`${e.clientY-r.top}px`;if(getComputedStyle(el).position==='static')el.style.position='relative';el.style.overflow='hidden';el.append(s);setTimeout(()=>s.remove(),650)},{passive:true});

  if(location.pathname==='/'||location.pathname==='/index.html'){
    let access={};try{access=JSON.parse(localStorage.getItem('collin-project-access-v1')||'{}')}catch{}
    const secondary=access.id&&access.token?'<a href="/project/"><span class="dock-pulse"></span> Mein Projekt</a>':'<a href="#portfolio">Portfolio</a>';
    document.body.insertAdjacentHTML('beforeend',`<nav class="mobile-dock" aria-label="Schnellzugriff">${secondary}<a class="primary" href="#anfrage">Projekt anfragen <span>→</span></a></nav>`);
  }

  const hero=$('.hero-visual');
  if(hero&&!reduce){
    let startY=0;
    addEventListener('touchstart',e=>{startY=e.touches?.[0]?.clientY||0},{passive:true});
    addEventListener('touchmove',e=>{const y=e.touches?.[0]?.clientY||startY,delta=Math.max(-28,Math.min(28,(y-startY)*.08));hero.style.setProperty('--touch-shift',`${delta}px`)},{passive:true});
    addEventListener('touchend',()=>hero.style.setProperty('--touch-shift','0px'),{passive:true});
  }
})();
