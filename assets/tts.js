/* TTS-pagina: reveal, equalizer-band, één clip tegelijk afspelen */
const qa=(s,r=document)=>[...r.querySelectorAll(s)];

const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}
}),{threshold:.1});
qa('.rv').forEach(el=>{io.observe(el); if(el.getBoundingClientRect().top<0) el.classList.add('in')});

const band=document.querySelector('.waveband');
if(band){
  for(let i=0;i<44;i++){
    const b=document.createElement('i');
    b.style.setProperty('--d',(i*0.07).toFixed(2)+'s');
    b.style.animationDuration=(2.0+(i%7)*0.21).toFixed(2)+'s';
    band.appendChild(b);
  }
}

const auds=qa('audio');
auds.forEach(a=>a.addEventListener('play',()=>auds.forEach(o=>{if(o!==a&&!o.paused)o.pause()})));
