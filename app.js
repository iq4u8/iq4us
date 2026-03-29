// ══════ STRIPE-STYLE MESH GRADIENT ══════
(function(){
  const c=document.getElementById('meshCanvas'),gl=c.getContext('webgl');
  if(!gl){c.style.display='none';return}
  function resize(){c.width=innerWidth;c.height=innerHeight;gl.viewport(0,0,c.width,c.height)}
  const vs=`attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}`;
  const fs=`precision highp float;uniform float t;uniform vec2 r;
  vec3 palette(float x){return .5+.5*cos(6.28*(x+vec3(.0,.33,.67)));}
  void main(){
    vec2 uv=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);
    float d=length(uv);
    float a=atan(uv.y,uv.x);
    float v=sin(d*3.-t*.4)*sin(a*2.+t*.3)*.5+.5;
    v+=sin(uv.x*2.+t*.2)*sin(uv.y*3.-t*.15)*.25;
    vec3 col=palette(v*.4+t*.02)*.12;
    col=mix(col,vec3(.031,.031,.047),smoothstep(.0,.8,d));
    gl_FragColor=vec4(col,1);
  }`;
  function compile(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s}
  const prog=gl.createProgram();
  gl.attachShader(prog,compile(gl.VERTEX_SHADER,vs));
  gl.attachShader(prog,compile(gl.FRAGMENT_SHADER,fs));
  gl.linkProgram(prog);gl.useProgram(prog);
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const pLoc=gl.getAttribLocation(prog,'p');gl.enableVertexAttribArray(pLoc);gl.vertexAttribPointer(pLoc,2,gl.FLOAT,!1,0,0);
  const tLoc=gl.getUniformLocation(prog,'t'),rLoc=gl.getUniformLocation(prog,'r');
  resize();addEventListener('resize',resize);
  (function draw(now){gl.uniform1f(tLoc,now*.001);gl.uniform2f(rLoc,c.width,c.height);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);requestAnimationFrame(draw)})(0);
})();

// ══════ NAV SCROLL ══════
const nav=document.querySelector('.nav');
addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>50));

// ══════ SCROLL REVEAL ══════
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');obs.unobserve(e.target)}})
},{threshold:.12});
document.querySelectorAll('.rv').forEach(el=>obs.observe(el));

// ══════ BENTO MOUSE GLOW ══════
document.querySelectorAll('.bento-card').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    card.style.setProperty('--mx',(e.clientX-r.left)+'px');
    card.style.setProperty('--my',(e.clientY-r.top)+'px');
    // Animated border angle
    const cx=r.left+r.width/2,cy=r.top+r.height/2;
    const angle=Math.atan2(e.clientY-cy,e.clientX-cx)*180/Math.PI+180;
    card.style.setProperty('--angle',angle+'deg');
  });
});

// ══════ COUNT UP ══════
function countUp(el,target,suffix='',prefix='',dec=0){
  let cur=0;const step=target/50;
  const timer=setInterval(()=>{cur+=step;if(cur>=target){cur=target;clearInterval(timer)}
    el.textContent=prefix+(dec?cur.toFixed(dec):Math.floor(cur))+suffix},30)
}
const mObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){
    document.querySelectorAll('[data-count]').forEach(el=>{
      countUp(el,parseFloat(el.dataset.count),el.dataset.suffix||'',el.dataset.prefix||'',parseInt(el.dataset.decimal||'0'))
    });mObs.unobserve(e.target)}})
},{threshold:.3});
const mEl=document.querySelector('.marquee');if(mEl)mObs.observe(mEl);

// ══════ PAYMENT ══════
function showPayment(plan){document.getElementById('popup-plan').textContent=plan;document.querySelector('.popup').classList.add('on')}
function closePayment(){document.querySelector('.popup').classList.remove('on')}

// ══════ SMOOTH SCROLL ══════
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{e.preventDefault();const t=document.querySelector(a.getAttribute('href'));
    if(t)t.scrollIntoView({behavior:'smooth',block:'start'})})
});

// ══════ HERO WORD REVEAL ══════
document.querySelectorAll('.hw').forEach((w,i)=>{
  w.style.opacity='0';w.style.transform='translateY(50px) rotateX(15deg)';
  setTimeout(()=>{w.style.transition='all .7s cubic-bezier(.16,1,.3,1)';w.style.opacity='1';w.style.transform='none'},200+i*100)
});

// ══════ MARQUEE DUPLICATE ══════
(function(){const track=document.querySelector('.marquee-track');
  if(track)track.innerHTML+=track.innerHTML})();
