/* ═══ ROBAS MUZIEK — player, video-modal, reveal ═══ */
"use strict";
const $=(s)=>document.querySelector(s),$$=(s)=>[...document.querySelectorAll(s)];

/* reveal */
(function(){
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting||e.boundingClientRect.top<0){e.target.classList.add("in");io.unobserve(e.target);}
  }),{threshold:.05});
  $$(".rv").forEach(el=>io.observe(el));
})();

/* video-modal */
(function(){
  const lb=$("#lb"),fr=$("#lb .frame"),cap=$("#lb figcaption");
  function open(id,label){
    fr.innerHTML="";
    const el=document.createElement("iframe");
    el.src="https://www.youtube-nocookie.com/embed/"+id+"?autoplay=1";
    el.allow="autoplay; encrypted-media; picture-in-picture";el.allowFullscreen=1;
    fr.appendChild(el);cap.textContent=label||"";
    lb.classList.add("show");document.body.style.overflow="hidden";
  }
  function close(){lb.classList.remove("show");document.body.style.overflow="";fr.innerHTML="";}
  $$("[data-yt]").forEach(el=>el.addEventListener("click",()=>open(el.dataset.yt,el.dataset.label)));
  $("#lb .x").addEventListener("click",close);
  lb.addEventListener("click",e=>{if(e.target===lb)close();});
  addEventListener("keydown",e=>{if(e.key==="Escape")close();});
})();

/* audio-speler: één tegelijk, balkje vult */
(function(){
  const au=new Audio();au.preload="none";
  let cur=null;
  $$(".prow").forEach(row=>{
    const bar=row.querySelector(".pbar u"),t=row.querySelector(".ptime"),
          src=row.dataset.src,total=parseInt(row.dataset.dur||"0",10);
    row.addEventListener("click",()=>{
      if(cur===row&&!au.paused){au.pause();row.classList.remove("on");cur=null;return;}
      if(cur){cur.classList.remove("on");cur.querySelector(".pbar u").style.width="0";}
      cur=row;row.classList.add("on");
      au.src=src;au.volume=.85;
      const p=au.play();if(p)p.catch(()=>{row.classList.remove("on");cur=null;});
    });
    au.addEventListener("timeupdate",()=>{
      if(cur!==row)return;
      if(total)bar.style.width=Math.min(100,au.currentTime/total*100)+"%";
      const s=Math.floor(au.currentTime);
      t.textContent=Math.floor(s/60)+":"+String(s%60).padStart(2,"0");
    });
    au.addEventListener("ended",()=>{if(cur===row){row.classList.remove("on");bar.style.width="0";cur=null;}});
  });
})();
