(()=>{
  if(!matchMedia('(max-width:760px)').matches)return;
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const $=q=>document.querySelector(q);

  // Visual-only mobile background. No navigation, form or layout elements are modified here.
  if(!$('.mobile-fx-layer')){
    document.body.insertAdjacentHTML('afterbegin','<div class="mobile-fx-layer" aria-hidden="true"><div class="fx-grid"></div><div class="fx-aurora fx-a"></div><div class="fx-aurora fx-b"></div><div class="fx-aurora fx-c"></div><div class="fx-beam"></div><div class="fx-ring"></div></div><div class="mobile-scroll-progress" aria-hidden="true"><i></i></div>');
  }

  const fx=$('.mobile-fx-layer');
  if(fx&&!reduce&&!fx.querySelector('.fx-particle')){
    const count=innerWidth<390?8:10;
    for(let i=0;i<count;i++){
      const p=document.createElement('span');
      p.className='fx-particle';
      p.style.left=`${Math.round(Math.random()*100)}%`;
      p.style.top=`${68+Math.round(Math.random()*35)}%`;
      p.style.setProperty('--dur',`${11+Math.random()*8}s`);
      p.style.setProperty('--delay',`${-Math.random()*10}s`);
      p.style.setProperty('--drift',`${-24+Math.random()*48}px`);
      fx.appendChild(p);
    }
  }

  let ticking=false;
  const update=()=>{
    const root=document.documentElement;
    const y=window.scrollY||root.scrollTop||0;
    const max=Math.max(1,root.scrollHeight-window.innerHeight);
    root.style.setProperty('--mobile-scroll',`${y}px`);
    root.style.setProperty('--page-progress',Math.min(1,Math.max(0,y/max)).toFixed(4));
    ticking=false;
  };
  window.addEventListener('scroll',()=>{
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(update);
  },{passive:true});
  window.addEventListener('resize',update,{passive:true});
  update();
})();
