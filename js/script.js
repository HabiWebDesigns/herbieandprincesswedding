'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
const store=(k,v)=>{try{return v===undefined?sessionStorage.getItem(k):sessionStorage.setItem(k,v)}catch(e){}};

/* ========== EDIT ME ========== */
// Countdown target (Philippine time). Change the time to your ceremony time.
const WEDDING_DATE=new Date('2027-04-10T16:00:00+08:00');
// Love story: i = chapter symbol, c = accent colour, ph = photo path (e.g. 'assets/story1.jpg'), m = longer story shown when tapped.
const STORY=[
 {y:'2007',t:'Where It All Began',s:'We first became classmates in Grade 2.',m:'Two little kids in one classroom, with no idea that the person at the next desk would become forever.',i:'✎',c:'#c9a24d',ph:'assets/2007.jpg'},
 {y:'Grade 7',t:'Reconnecting',s:'Our paths crossed again.',m:'Years later, fate quietly brought us back into each other’s world.',i:'❦',c:'#b8a35e',ph:''},
 {y:'Grade 8',t:'Getting Closer',s:'We talked more, and slowly grew closer.',m:'Conversations got longer, and friendship began to feel like something more.',i:'✉',c:'#d1a98a',ph:'assets/Grade8.jpg'},
 {y:'November 6, 2018',t:'The Beginning of Us',s:'We became M.U. — and Herbie began courting Princess.',m:'The day everything changed: a mutual understanding, and the start of a beautiful courtship.',i:'❀',c:'#c9956c',ph:'assets/NewBeginning.jpg'},
 {y:'January 6, 2022',t:'Officially Together',s:'We officially became a couple.',m:'After the waiting and the courting, we finally made it official.',i:'♡',c:'#c27e72',ph:'assets/Together.jpg'},
 {y:'November 16, 2025',t:'Forever Begins',s:'Herbie proposed to Princess.',m:'One question, one yes, and a lifetime of tomorrows.',i:'◈',c:'#b8933a',ph:'assets/proposal.jpg'},
 {y:'April 10, 2027',t:'Our Forever',s:'The day we begin our married life together.',m:'And now we invite you to be part of the happiest chapter yet. ♡',i:'✦',c:'#a97f2f',ph:'assets/Wedding.PNG'}];
// Gallery: set src to 'assets/photo1.jpg' etc. Empty = elegant placeholder.
const PHOTOS=[{src:'',cap:'Engagement'},{src:'',cap:'Together'},{src:'',cap:'Pre-wedding'},{src:'assets/proposal.jpg',cap:'The proposal'},{src:'',cap:'Golden hour'},{src:'',cap:'Always'},{src:'',cap:'Forever'}];
// RSVP: plug a backend in here later (Google Sheets, Formspree, Firebase…).
async function submitRSVP(data){console.info('RSVP',data);return{ok:true}}
/* ============================== */

/* ---------- Floral frame: built to fit the viewport on all 4 edges ---------- */
const frame=$('#frame');let fn=0;
function buildFrame(){
 const W=innerWidth,H=innerHeight,s=W<700?.6:Math.min(1,Math.max(.75,W/1400));
 const it=(id,x,y,w,r,sw)=>{const h=id=='leaf'?w*.48:w;return`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r})"><use href="#${id}" x="${-w/2}" y="${-h/2}" width="${w}" height="${h}"${sw&&!RM?` class="sw" style="animation-delay:-${fn++%7}s"`:''}/></g>`};
 const edges=[[W,(u,v)=>[u,v],90],[W,(u,v)=>[u,H-v],-90],[H,(u,v)=>[v,u],0],[H,(u,v)=>[W-v,u],180]];
 let o='';
 edges.forEach(([L,f,b])=>{
  const c=150*s,vy=u=>11*s+Math.sin(u/(70*s))*7*s;let d='',e='',k=0;
  for(let u=c;u<=L-c;u+=12*s)d+=(d?'L':'M')+f(u,vy(u)).map(n=>n.toFixed(0)).join(' ');
  for(let u=c;u<=L-c;u+=36*s,k++){
   const v=vy(u),[x,y]=f(u,v);
   e+=it('leaf',x,y,32*s,b+(k%2?42:-42));
   if(k%3==1)e+=it('bloom',...f(u,v+14*s),24*s,k*40,k%2);
   if(k%8==4)e+=it('rose',...f(u,v+16*s),46*s,k*25,1);
  }
  o+=`<path class="vine" pathLength="1" d="${d}"/>`+e;
 });
 [[0,0,0],[W,0,90],[W,H,180],[0,H,270]].forEach(([cx,cy,a])=>{
  const P=(g,r)=>[cx+Math.cos(g*Math.PI/180)*r*s,cy+Math.sin(g*Math.PI/180)*r*s];
  for(let k=0;k<8;k++){const g=a+6+k*11.5;o+=it('leaf',...P(g,62),80*s,g)}
  for(let k=0;k<4;k++){const g=a+14+k*20;o+=it('leaf',...P(g,105),64*s,g+(k%2?15:-15))}
  o+=it('rose',...P(a+16,92),78*s,a+20)+it('rose',...P(a+74,92),78*s,a-20,1)+it('rose',...P(a+45,40),120*s,a*2,1);
  o+=it('bloom',...P(a+45,112),44*s,a,1)+it('bloom',...P(a+30,70),30*s,a+10)+it('bloom',...P(a+62,70),30*s,a);
 });
 frame.setAttribute('viewBox',`0 0 ${W} ${H}`);frame.innerHTML=o;
}
let rz;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{buildFrame();size()},200)});

/* ---------- Gold sparkles, floating petals, click blooms (single light canvas) ---------- */
const cv=$('#fx'),cx=cv.getContext('2d');let PT=[],W=0,H=0,raf=0;
function size(){cv.width=W=innerWidth;cv.height=H=innerHeight}
function spawn(n){for(let i=0;i<n;i++)PT.push({x:Math.random()*W,y:Math.random()*H,p:Math.random()<.45,r:1+Math.random()*2.4,vx:(Math.random()-.3)*.5,vy:.25+Math.random()*.5,a:Math.random()*6,va:(Math.random()-.5)*.04,t:Math.random()*6})}
function burst(x,y){if(RM)return;for(let i=0;i<16;i++)PT.push({x,y,b:1,l:1,p:i%2,r:2+Math.random()*3,vx:(Math.random()-.5)*6,vy:(Math.random()-.9)*5,a:Math.random()*6,va:.1,t:0});loop()}
function loop(){
 cancelAnimationFrame(raf);cx.clearRect(0,0,W,H);
 for(const q of PT){
  q.x+=q.vx;q.y+=q.vy;q.a+=q.va;q.t+=.04;
  if(q.b){q.vy+=.12;q.l-=.018;if(q.l<=0){q.dead=1;continue}}
  else{if(q.y>H+20){q.y=-20;q.x=Math.random()*W}if(q.x>W+20)q.x=-20;if(q.x<-20)q.x=W+20}
  cx.globalAlpha=Math.max(0,q.b?q.l:.45+Math.sin(q.t)*.4);
  cx.fillStyle=q.p?'rgba(236,205,150,.95)':'#e2bb5c';cx.beginPath();
  q.p?cx.ellipse(q.x,q.y,q.r*2.2,q.r*1.2,q.a,0,7):cx.arc(q.x,q.y,q.r,0,7);cx.fill();
 }
 PT=PT.filter(q=>!q.dead);
 if(!document.hidden)raf=requestAnimationFrame(loop);
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!RM)loop()});
addEventListener('pointerdown',e=>burst(e.clientX,e.clientY));

/* ---------- Flow: intro → envelope → invitation ---------- */
const body=document.body,intro=$('#intro'),env=$('#envelope');
let phase=0;
function toEnvelope(){
 if(phase)return;phase=1;store('hp-intro','1');
 env.hidden=false;intro.classList.add('out');
 requestAnimationFrame(()=>requestAnimationFrame(()=>env.classList.add('in')));
 setTimeout(()=>intro.remove(),1600);
}
function openInvite(){
 if(phase>1)return;phase=2;store('hp-open','1');
 $('#env').classList.add('open');
 setTimeout(()=>env.classList.add('leave'),RM?0:2600);
 setTimeout(showMain,RM?0:3800);
}
function showMain(){
 env.remove();$('#main').hidden=$('#nav').hidden=$('#music').hidden=false;
 body.classList.remove('locked');scrollTo(0,0);
 requestAnimationFrame(()=>$('#main').classList.add('show'));
 initMain();
 if(!$('#music').dataset.hinted){$('#music').dataset.hinted=1;toast('Tap ♪ to play our song')}
}
function start(){
 buildFrame();size();if(!RM)spawn(W<700?16:34);loop();
 requestAnimationFrame(()=>frame.classList.add('show'));
 if(store('hp-open')){intro.remove();env.remove();showMain();return}
 if(store('hp-intro')||RM){intro.remove();env.hidden=false;phase=1;requestAnimationFrame(()=>env.classList.add('in'))}
 else{body.classList.add('go');intro.classList.add('go');setTimeout(toEnvelope,6800);}
 setTimeout(()=>{if(!phase)toEnvelope()},9500); // failsafe: intro can never get stuck
}
$('#skip').onclick=toEnvelope;$('#open').onclick=$('#seal').onclick=openInvite;

/* ---------- Main page ---------- */
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),3200)}
let inited=0;
function initMain(){
 if(inited++)return;
 // Story timeline
 const tl=$('#timeline');
 STORY.forEach((c,n)=>{
  const a=document.createElement('article');a.className='ms reveal';a.dataset.i=c.i;a.style.setProperty('--c',c.c);
  a.innerHTML=`<button aria-expanded="false" aria-controls="m${n}"><div class="ph" style="${c.ph?`background-image:url('${c.ph}')`:''}"></div><div><span class="y">${c.y}</span><h3>${c.t}</h3><p>${c.s}</p><div class="more"><p id="m${n}">${c.m}</p></div><span class="tap">Tap to discover</span></div></button>`;
  if(c.ph){const photo=new Image();photo.onload=()=>$('.ph',a).style.aspectRatio=`${photo.naturalWidth}/${photo.naturalHeight}`;photo.src=c.ph}
  const b=$('button',a);b.onclick=()=>{const o=b.getAttribute('aria-expanded')=='true';$$('.ms>button').forEach(x=>x.setAttribute('aria-expanded','false'));b.setAttribute('aria-expanded',!o);if(!o)burst(b.getBoundingClientRect().left+40,b.getBoundingClientRect().top+30)};
  tl.append(a);
 });
 // Gallery + lightbox
 const gal=$('#gal'),lb=$('#lb');let cur=0;
 PHOTOS.forEach((p,i)=>{const f=document.createElement('figure');f.className='reveal';f.tabIndex=0;f.setAttribute('role','button');f.setAttribute('aria-label','Open photo: '+p.cap);
  f.innerHTML=`<div class="ph" style="${p.src?`background-image:url('${p.src}')`:''}"></div><figcaption>${p.cap}</figcaption>`;
  f.onclick=()=>show(i);f.onkeydown=e=>{if(e.key=='Enter'||e.key==' '){e.preventDefault();show(i)}};gal.append(f)});
 function show(i){cur=(i+PHOTOS.length)%PHOTOS.length;const p=PHOTOS[cur],im=$('#lb-img');im.style.backgroundImage=p.src?`url('${p.src}')`:'';im.textContent='' ;$('#lb-cap').textContent=p.cap;lb.hidden=false;$('.x',lb).focus()}
 $('.x',lb).onclick=()=>lb.hidden=true;$('.pv',lb).onclick=()=>show(cur-1);$('.nx',lb).onclick=()=>show(cur+1);
 lb.onclick=e=>{if(e.target==lb)lb.hidden=true};
 addEventListener('keydown',e=>{if(lb.hidden)return;if(e.key=='Escape')lb.hidden=true;if(e.key=='ArrowLeft')show(cur-1);if(e.key=='ArrowRight')show(cur+1)});
 // Scroll reveal + active nav
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
 $$('.reveal').forEach(e=>io.observe(e));
 const links=$$('#nav li a'),so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(l=>l.classList.toggle('on',l.hash=='#'+e.target.id))}),{rootMargin:'-45% 0px -50% 0px'});
 $$('main section').forEach(s=>so.observe(s));
 // Golden thread fills as you scroll
 let tick=0;addEventListener('scroll',()=>{if(tick)return;tick=requestAnimationFrame(()=>{tick=0;const r=tl.getBoundingClientRect();tl.style.setProperty('--p',Math.min(1,Math.max(0,(innerHeight*.6-r.top)/r.height)))})},{passive:true});
 // Nav
 const nav=$('#nav'),bg=$('#burger');
 bg.onclick=()=>{const o=nav.classList.toggle('open');bg.setAttribute('aria-expanded',o);body.classList.toggle('locked',o)};
 links.forEach(l=>l.onclick=()=>{nav.classList.remove('open');bg.setAttribute('aria-expanded',false);body.classList.remove('locked')});
 // Countdown
 const p2=n=>String(n).padStart(2,'0');
 (function cd(){
  const ms=WEDDING_DATE-Date.now();
  if(ms<=0){$('.cd').hidden=true;$('#cd-done').hidden=false;return}
  const s=Math.floor(ms/1e3);
  $('#cd-d').textContent=String(Math.floor(s/86400)).padStart(3,'0');$('#cd-h').textContent=p2(Math.floor(s/3600)%24);$('#cd-m').textContent=p2(Math.floor(s/60)%60);$('#cd-s').textContent=p2(s%60);
  setTimeout(cd,1000);
 })();
 // Music (user-initiated only; never autoplays)
 const au=new Audio('assets/wedding-song.mp3'),mb=$('#music');au.loop=true;au.preload='none';
 mb.onclick=()=>{
  if(au.paused)au.play().then(()=>{mb.setAttribute('aria-pressed',true);mb.setAttribute('aria-label','Pause background music')}).catch(()=>toast('Add your song as assets/wedding-song.mp3'));
  else{au.pause();mb.setAttribute('aria-pressed',false);mb.setAttribute('aria-label','Play background music')}
 };
 // RSVP
 const form=$('#form'),att=()=>form.attend.value;
 const err=(el,m)=>{const g=el.closest('fieldset,label:not(.rad)');$('.err',g).textContent=m;(el.tagName?el:el[0]).classList.toggle('bad',!!m);return!m};
 form.onchange=()=>{form.guests.disabled=att()=='no'};
 form.onsubmit=async e=>{
  e.preventDefault();
  const ok=[err(form.elements['name'],form.elements['name'].value.trim().length<2?'Please enter your full name.':''),
   err(form.email,/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.value)?'':'Please enter a valid email address.'),
   err(form.attend[0],att()?'':'Please let us know if you can attend.')];
  if(ok.includes(false)){$('.bad',form)?.focus();return}
  const btn=$('.btn',form);btn.disabled=true;btn.textContent='Sending…';
  const d=Object.fromEntries(new FormData(form));
  try{const r=await submitRSVP(d);if(!r.ok)throw 0;form.hidden=true;$('#thanks').hidden=false;burst(innerWidth/2,innerHeight/2)}
  catch{btn.disabled=false;btn.textContent='Send RSVP';toast('Something went wrong. Please try again.')}
 };
}

start();
