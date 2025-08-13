(()=>{
  const $= (s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

  window.addEventListener('load',()=>{
    document.body.classList.add('loaded');
    const y=$('#y'); if(y) y.textContent=new Date().getFullYear();
  },{once:true});

  // Parallax
  const parallaxNodes=$$('[data-parallax]');
  function applyParallax(){
    const vh=innerHeight;
    parallaxNodes.forEach(el=>{
      const rect=el.getBoundingClientRect();
      const speed=parseFloat(el.dataset.speed||'0.2');
      const p=((rect.top+rect.height*.5)-vh*.5)/vh;
      const y=-p*speed*120;
      el.style.transform=`translate3d(0,${y}px,0)`;
    });
  }

  // Zooming type
  const zoomSections=$$('.bigtype');
  const io=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting) tick(entry.target);
    });
  },{threshold:Array.from({length:21},(_,i)=>i/20)});
  zoomSections.forEach(s=>io.observe(s));

  function tick(section){
    const spans=$$('[data-zoom]',section);
    const rect=section.getBoundingClientRect();
    const vh=innerHeight;
    const progress=Math.min(1,Math.max(0,(0-rect.top)/vh));
    const base=1, max=1.65;
    spans.forEach((span,i)=>{
      const local=Math.min(1,Math.max(0,progress*1.15 - i*0.03));
      const s=base+(max-base)*local;
      span.style.transform=`scale(${s}) translateZ(0)`;
      span.style.opacity=(1-local*.9).toFixed(3);
    });
  }

  // rAF loop
  let raf; function loop(){applyParallax(); zoomSections.forEach(tick); raf=requestAnimationFrame(loop)}; raf=requestAnimationFrame(loop);

  // Reduced motion
  const mq=matchMedia('(prefers-reduced-motion: reduce)');
  function onRM(){ if(mq.matches) cancelAnimationFrame(raf); else raf=requestAnimationFrame(loop) }
  mq.addEventListener?.('change',onRM);

  // Header padding for snap
  const header=$('.site-header');
  function setHeaderPad(){ document.documentElement.style.setProperty('--headerH', header.offsetHeight+'px'); }
  setHeaderPad(); addEventListener('resize', setHeaderPad);

  // Active menu highlight via section observer
  const sections=$$('[data-section]');
  const links=$$('.nav-links a');

  const secObserver=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible) return;
    const id=visible.target.getAttribute('id');
    links.forEach(a=>{
      const hit=a.getAttribute('href').replace('#','')===id;
      a.classList.toggle('active', hit);
      a.setAttribute('aria-current', hit?'true':'false');
    });
  },{threshold:[0.55,0.7,0.9]});
  sections.forEach(s=>secObserver.observe(s));

  // Smooth anchor + history
  links.forEach(a=>{
    a.addEventListener('click',e=>{
      const id=a.getAttribute('href').slice(1);
      const target=document.getElementById(id);
      if(!target) return;
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth', block:'start'});
      history.replaceState(null,'','#'+id);
    });
  });

  // Touch enhancement
  document.addEventListener('touchstart',()=>document.body.classList.add('touch'));
})();