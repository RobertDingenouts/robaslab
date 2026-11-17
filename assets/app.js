/* ═══════════ ROBAS LAB — site-engine (Robas × Hermes) ═══════════ */
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── 1. neural canvas-achtergrond ─────────────────────────────── */
(function net(){
  if(reduced) return;
  const c=$("#net"), x=c.getContext("2d");
  let W,H,dpr,nodes=[],mx=.5,my=.4,t=0;
  const N=()=>innerWidth<700?34:72;
  function size(){
    dpr=Math.min(devicePixelRatio||1,2);
    W=innerWidth;H=innerHeight;c.width=W*dpr;c.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0);
    nodes=Array.from({length:N()},()=>({x:Math.random()*W,y:Math.random()*H,
      vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,r:Math.random()*1.8+.6,g:Math.random()<.08}));
  }
  addEventListener("resize",size); size();
  addEventListener("pointermove",e=>{mx=e.clientX/W;my=e.clientY/H},{passive:true});
  let run=true;
  document.addEventListener("visibilitychange",()=>{run=!document.hidden;if(run)loop();});
  function loop(){
    if(!run)return;
    t++;
    x.clearRect(0,0,W,H);
    const ox=(mx-.5)*22, oy=(my-.4)*22;
    for(const n of nodes){
      n.x+=n.vx;n.y+=n.vy;
      if(n.x<-20)n.x=W+20;if(n.x>W+20)n.x=-20;
      if(n.y<-20)n.y=H+20;if(n.y>H+20)n.y=-20;
    }
    const D=innerWidth<700?110:150;
    x.lineWidth=.6;
    for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
      const a=nodes[i],b=nodes[j],dx=a.x-b.x,dy=a.y-b.y,d2=dx*dx+dy*dy;
      if(d2<D*D){const al=(1-Math.sqrt(d2)/D)*.16;
        x.strokeStyle=`rgba(148,163,190,${al})`;
        x.beginPath();x.moveTo(a.x+ox,a.y+oy);x.lineTo(b.x+ox,b.y+oy);x.stroke();}
    }
    for(const n of nodes){
      x.beginPath();
      if(n.g){const pu=1+.5*Math.sin(t*.05+n.x);
        x.fillStyle="rgba(228,52,46,.85)";x.shadowColor="#e4342e";x.shadowBlur=10*pu;}
      else{x.fillStyle="rgba(160,175,200,.5)";x.shadowBlur=0;}
      x.arc(n.x+ox,n.y+oy,n.r,0,7);x.fill();x.shadowBlur=0;
    }
    // rode kern-puls (judo-vlag knipoog) — rechts-derde, niet achter de kop
    const cx=W*.62+ox*1.6, cy=H*.4+oy*1.6, p=1+.25*Math.sin(t*.03);
    const g=x.createRadialGradient(cx,cy,0,cx,cy,90*p);
    g.addColorStop(0,"rgba(228,52,46,.20)");g.addColorStop(1,"rgba(228,52,46,0)");
    x.fillStyle=g;x.beginPath();x.arc(cx,cy,90*p,0,7);x.fill();
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ── 2. scroll: balk + header ─────────────────────────────────── */
addEventListener("scroll",()=>{
  const h=document.documentElement;
  $("#bar").style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+"%";
  $("header").classList.toggle("solid",scrollY>40);
},{passive:true});

/* ── 3. reveal on scroll ──────────────────────────────────────── */
const io=new IntersectionObserver(es=>es.forEach(e=>{
  // reveal bij intersect OF als er al voorbij gescrolld is (anchor-jumps)
  if(e.isIntersecting||e.boundingClientRect.top<0){e.target.classList.add("in");io.unobserve(e.target);}
}),{threshold:.05});
$$(".rv").forEach(el=>io.observe(el));

/* ── 3b. scroll-spy: actieve nav-link ─────────────────────────── */
(function(){
  const links=new Map($$("nav .links a").map(a=>[a.getAttribute("href").slice(1),a]));
  const spy=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){links.forEach(a=>a.classList.remove("on"));
      const a=links.get(e.target.id);if(a)a.classList.add("on");}
  }),{rootMargin:"-30% 0px -60% 0px"});
  links.forEach((a,id)=>{const s=document.getElementById(id);if(s)spy.observe(s);});
})();

/* ── 4. counters ──────────────────────────────────────────────── */
const cio=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;cio.unobserve(e.target);
  const el=e.target,to=+el.dataset.to,dur=1300,t0=performance.now(),dec=+el.dataset.dec||0;
  (function step(t){const p=Math.min((t-t0)/dur,1),v=to*(1-Math.pow(1-p,3));
    el.textContent=v.toFixed(dec);if(p<1)requestAnimationFrame(step);else el.textContent=to.toFixed(dec);})(t0);
}),{threshold:.6});
$$(".cnt").forEach(el=>cio.observe(el));

/* ── 5. tilt op kaarten ───────────────────────────────────────── */
if(!reduced&&matchMedia("(pointer:fine)").matches){
  $$(".card,.pack,.stat").forEach(c=>{
    c.addEventListener("pointermove",e=>{
      const r=c.getBoundingClientRect(),rx=(e.clientY-r.top)/r.height-.5,rx2=(e.clientX-r.left)/r.width-.5;
      c.style.transform=`perspective(800px) rotateX(${-rx*5}deg) rotateY(${rx2*5}deg) translateY(-3px)`;
    });
    c.addEventListener("pointerleave",()=>c.style.transform="");
  });
}

/* ── 6. audio: BGM + previews + visualizer ────────────────────── */
const Audio_=(function(){
  const bgm=$("#bgm"),btn=$("#bgmBtn"),previews=$$(".trackrow button");
  let cur=null;
  function fade(a,to,ms=700){
    const from=a.volume,dt=50,steps=ms/dt,step=(to-from)/steps;let i=0;
    a.volume=to;clearInterval(a._fi);
    a._fi=setInterval(()=>{a.volume=Math.max(0,Math.min(1,from+step*++i));if(i>=steps){clearInterval(a._fi);a.volume=to;}},dt);
  }
  function stopOther(except){
    if(cur&&cur!==except){cur.pause();fade(cur,0,300);}
    cur=except&&except!==bgm?except:null;
  }
  function bgmToggle(){
    if(bgm.paused){
      stopOther(bgm);bgm.volume=0;
      const pr=bgm.play();
      if(pr)pr.then(()=>fade(bgm,.4,1500)).catch(()=>{btn.classList.remove("on");btn.setAttribute("aria-pressed","false");});
      btn.classList.add("on");btn.setAttribute("aria-pressed","true");
      $$("button.playing").forEach(b=>b.classList.remove("playing"));
    }else{fade(bgm,0,400);setTimeout(()=>{bgm.pause();btn.classList.remove("on");btn.setAttribute("aria-pressed","false")},420);}
  }
  btn.addEventListener("click",bgmToggle);
  $$("#soundCTA").forEach(b=>b.addEventListener("click",bgmToggle));
  previews.forEach(b=>b.addEventListener("click",()=>{
    const a=$("#pre"+b.dataset.p);
    if(!a)return;
    if(!a.paused){a.pause();b.classList.remove("playing");return;}
    stopOther(a);bgm.pause();btn.classList.remove("on");btn.setAttribute("aria-pressed","false");
    a.volume=0;
    const pr=a.play();
    if(pr)pr.then(()=>fade(a,.7,600)).catch(()=>b.classList.remove("playing"));
    b.classList.add("playing");
    a.onended=()=>{b.classList.remove("playing");fade(a,0,300);};
    a.ontimeupdate=()=>{const bar=b.closest(".trackrow").querySelector(".prog i");
      if(bar)bar.style.width=(a.currentTime/a.duration*100||0)+"%";};
  }));
  return {bgmToggle};
})();

/* ── 7. lightbox ──────────────────────────────────────────────── */
(function(){
  const lb=$("#lb"),fr=$("#lb .frame"),cap=$("#lb figcaption");
  let lastFocus=null;
  function open(src,type,label){
    if(type==="demo"){ // apps/game openen betrouwbaar in eigen tabblad (iframe kan opslag cros-site blokkeren)
      window.open(src,"_blank","noopener");return;
    }
    fr.querySelectorAll("video,iframe").forEach(n=>n.remove());
    let el;
    if(type==="yt"){el=document.createElement("iframe");el.src=src+(src.includes("?")?"&":"?")+"autoplay=1";el.allow="autoplay; encrypted-media; picture-in-picture";el.allowFullscreen=1;}
    else{el=document.createElement("video");el.src=src;el.controls=1;el.autoplay=1;el.playsInline=1;el.poster=el.src.replace(/\.\w+$/,".jpg").replace("film-","poster-");}
    fr.appendChild(el);cap.textContent=label||"";
    lb.classList.add("show");document.body.style.overflow="hidden";
    lastFocus=document.activeElement;lb.setAttribute("aria-hidden","false");$("#lb .x").focus();
  }
  function close(){if(!lb.classList.contains("show"))return;lb.classList.remove("show");document.body.style.overflow="";lb.setAttribute("aria-hidden","true");
    fr.querySelectorAll("video,iframe").forEach(n=>{n.remove();});
    if(lastFocus){lastFocus.focus();lastFocus=null;}}
  $$("[data-open]").forEach(el=>{el.tabIndex=0;el.setAttribute("role","button");
    el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();el.click();}});
    el.addEventListener("click",()=>open(el.dataset.open,el.dataset.type||"video",el.dataset.label));});
  $("#lb .x").addEventListener("click",close);
  lb.addEventListener("click",e=>{if(e.target===lb)close();});
  addEventListener("keydown",e=>{if(e.key==="Escape")close();});
})();

/* ── 8. showcase-filters ──────────────────────────────────────── */
$$(".chip").forEach(ch=>ch.addEventListener("click",()=>{
  $$(".chip").forEach(c=>{c.classList.toggle("on",c===ch);c.setAttribute("aria-pressed",String(c===ch));});
  const f=ch.dataset.filter;
  $$(".card[data-tags]").forEach(c=>{
    const hit=f==="all"||c.dataset.tags.split(" ").includes(f);
    c.style.display=hit?"":"none";
  });
}));

/* ── 9. mail-templates per pakket ─────────────────────────────── */
(function(){
  const mail="robaslab@gmail.com";
  const T={
    info:["Info — Robas Lab","Beste Robert,\n\nIk ben nieuwsgierig naar wat lokale AI voor mij kan betekenen.\n\nKort over mij/mijn organisatie:\n— \n\nGraag (vrijblijvend) een demo of uitleg.\n\nGroeten,"],
    service:["Service — lokale AI-setup","Beste Robert,\n\nIk wil hulp bij mijn (lokale) AI-setup.\n\nWat heb ik nu:\n— \nWat wil ik erreichen:\n— \n\nGroeten,"],
    freelance:["Freelance — projectaanvraag","Beste Robert,\n\nIk wil een project laten bouwen.\n\nProject in korte lijnen:\n— \nGewenste periode:\n— \n\nGroeten,"],
    sollic:["Sollicitatie — Robert Dingenouts","Beste Robert,\n\nNaar aanleiding van uw showcase op robaslab.nl nodigen wij u graag uit voor een gesprek.\n\nOver de functie/rol:\n— \n\nGroeten,"]
  };
  $$("[data-ask]").forEach(a=>{const t=T[a.dataset.ask];if(!t)return;
    a.href=`mailto:${mail}?subject=${encodeURIComponent(t[0])}&body=${encodeURIComponent(t[1])}`;});
})();

/* ── 10. e-mail kopiëren ──────────────────────────────────────── */
$$("[data-copy]").forEach(b=>b.addEventListener("click",async()=>{
  try{await navigator.clipboard.writeText(b.dataset.copy);toast("E-mail gekopieerd ✓");}
  catch{location.href="mailto:"+b.dataset.copy;}
}));
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");
  clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove("show"),2200);}

/* ── 11. jaartal ──────────────────────────────────────────────── */
$("#yy").textContent=new Date().getFullYear();

/* ── 12. hero-terminal: typelog ───────────────────────────────── */
(function(){
  const el=$("#tlog"); if(!el) return;
  const LINES=[
    ["b","$ strata serve qwen3.8-flash-next --dflash2"],
    ["em","✓ model geladen · UD-IQ3_XXS · KV Q8 · ctx 262K"],
    ["s","→ agent-run: beehive.html"],
    ["","  ⚙ 100 builds · 1,18 uur · 8,77M tokens (99% cache)"],
    ["em","✓ 261 t/s decode · 0 cloud-API's"],
    ["b","$ "]
  ];
  if(reduced){el.innerHTML=LINES.map(([c,t])=>c&&c!=""?`<${c}>${t}</${c}>`:t).join("\n");return;}
  let li=0,ci=0,html="";
  function tick(){
    if(li>=LINES.length){el.innerHTML=html+'<span class="cursor"></span>';return;}
    const [cls,txt]=LINES[li];
    if(ci<txt.length){
      ci++;
      const cur=html+(cls?`<${cls}>${txt.slice(0,ci)}</${cls}>`:txt.slice(0,ci))+'<span class="cursor"></span>';
      el.innerHTML=cur;
      setTimeout(tick,ci<3?60:16);
    }else{
      html+=cls?`<${cls}>${txt}</${cls}>`:txt; html+="\n";
      li++;ci=0;
      setTimeout(tick,li===LINES.length-1?500:260);
    }
  }
  setTimeout(tick,900);
})();
