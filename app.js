// ══════ PARTICLES ══════
(function(){
  const c=document.getElementById('particles'),ctx=c.getContext('2d');
  let w,h,pts=[];
  function resize(){w=c.width=innerWidth;h=c.height=innerHeight}
  function init(){pts=[];for(let i=0;i<80;i++)pts.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*2+.5})}
  function draw(){ctx.clearRect(0,0,w,h);pts.forEach((p,i)=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(108,99,255,.3)';ctx.fill();for(let j=i+1;j<pts.length;j++){const d=Math.hypot(p.x-pts[j].x,p.y-pts[j].y);if(d<150){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(108,99,255,${.08*(1-d/150)})`;ctx.stroke()}}});requestAnimationFrame(draw)}
  resize();init();draw();addEventListener('resize',()=>{resize();init()})
})();

// ══════ NAVBAR SCROLL ══════
const nav=document.querySelector('.navbar');
addEventListener('scroll',()=>{nav.classList.toggle('scrolled',scrollY>60)});

// ══════ MOBILE MENU ══════
const menuBtn=document.querySelector('.menu-toggle');
const mobileMenu=document.querySelector('.mobile-menu');
menuBtn.addEventListener('click',()=>{
  menuBtn.classList.toggle('active');
  mobileMenu.classList.toggle('active');
  document.body.style.overflow=mobileMenu.classList.contains('active')?'hidden':''
});
document.querySelectorAll('.mobile-menu a').forEach(a=>a.addEventListener('click',()=>{
  menuBtn.classList.remove('active');mobileMenu.classList.remove('active');document.body.style.overflow=''
}));

// ══════ SCROLL REVEAL ══════
const observer=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}})
},{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

// ══════ COUNT UP ══════
function countUp(el,target,suffix='',prefix='',decimal=0){
  let current=0;const step=target/60;
  const timer=setInterval(()=>{
    current+=step;if(current>=target){current=target;clearInterval(timer)}
    el.textContent=prefix+(decimal?current.toFixed(decimal):Math.floor(current))+suffix
  },25)
}
const statsObs=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{if(e.isIntersecting){
    document.querySelectorAll('[data-count]').forEach(el=>{
      countUp(el,parseFloat(el.dataset.count),el.dataset.suffix||'',el.dataset.prefix||'',parseInt(el.dataset.decimal||'0'))
    });statsObs.unobserve(e.target)
  }})
},{threshold:.3});
const statsEl=document.querySelector('.stats');
if(statsEl)statsObs.observe(statsEl);

// ══════ PAYMENT POPUP ══════
function showPayment(plan){
  document.getElementById('popup-plan').textContent=plan;
  document.querySelector('.popup-overlay').classList.add('active')
}
function closePayment(){document.querySelector('.popup-overlay').classList.remove('active')}

// ══════ SMOOTH SCROLL ══════
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{e.preventDefault();const t=document.querySelector(a.getAttribute('href'));if(t)t.scrollIntoView({behavior:'smooth'})})
});

// ══════ HERO TEXT ANIMATION ══════
(function(){
  const words=document.querySelectorAll('.hero-word');
  words.forEach((w,i)=>{
    w.style.opacity='0';w.style.transform='translateY(40px)';
    setTimeout(()=>{w.style.transition='all .6s cubic-bezier(.4,0,.2,1)';w.style.opacity='1';w.style.transform='translateY(0)'},300+i*120)
  })
})();
