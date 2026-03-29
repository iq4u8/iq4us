// ══════ WEBGL MESH GRADIENT ══════
(function(){
  const c=document.getElementById('meshCanvas');
  if(!c)return;
  const gl=c.getContext('webgl');
  if(!gl){c.style.background='radial-gradient(ellipse at 30% 20%,rgba(139,92,246,.08),transparent 50%),radial-gradient(ellipse at 70% 80%,rgba(34,211,238,.06),transparent 50%)';return}
  function resize(){c.width=innerWidth;c.height=innerHeight;gl.viewport(0,0,c.width,c.height)}
  const vs='attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}';
  const fs=`precision highp float;uniform float t;uniform vec2 r;
  void main(){
    vec2 uv=gl_FragCoord.xy/r;
    float v=sin(uv.x*4.+t*.3)*sin(uv.y*3.-t*.2)*.5+.5;
    v+=sin(length(uv-vec2(.3,.7))*6.-t*.4)*.15;
    v+=sin(length(uv-vec2(.7,.3))*5.+t*.35)*.12;
    vec3 c1=vec3(.545,.361,.965);vec3 c2=vec3(.133,.827,.933);vec3 c3=vec3(.925,.282,.612);
    vec3 col=mix(mix(c1,c2,v),c3,sin(v*3.14)*.3+.1)*.1;
    col=mix(col,vec3(.024,.024,.059),1.-smoothstep(0.,.6,v*.5));
    gl_FragColor=vec4(col,1.);
  }`;
  function mkShader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s}
  const prog=gl.createProgram();
  gl.attachShader(prog,mkShader(gl.VERTEX_SHADER,vs));
  gl.attachShader(prog,mkShader(gl.FRAGMENT_SHADER,fs));
  gl.linkProgram(prog);gl.useProgram(prog);
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const pL=gl.getAttribLocation(prog,'p');gl.enableVertexAttribArray(pL);gl.vertexAttribPointer(pL,2,gl.FLOAT,!1,0,0);
  const tL=gl.getUniformLocation(prog,'t'),rL=gl.getUniformLocation(prog,'r');
  resize();addEventListener('resize',resize);
  !function draw(now){gl.uniform1f(tL,now*.001);gl.uniform2f(rL,c.width,c.height);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);requestAnimationFrame(draw)}(0);
})();

// ══════ NAV ══════
const nav=document.querySelector('.nav');
window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>50));

// Mobile menu
const mBtn=document.querySelector('.mobile-toggle');
const mMenu=document.querySelector('.mobile-menu');
if(mBtn&&mMenu){
  mBtn.onclick=()=>{mMenu.classList.toggle('open');document.body.style.overflow=mMenu.classList.contains('open')?'hidden':''};
  mMenu.querySelectorAll('a').forEach(a=>a.onclick=()=>{mMenu.classList.remove('open');document.body.style.overflow=''});
}

// ══════ SCROLL REVEAL ══════
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');obs.unobserve(e.target)}})
},{threshold:.1});
document.querySelectorAll('.rv').forEach(el=>obs.observe(el));

// ══════ COUNT UP ══════
function countUp(el,target,suffix,prefix,dec){
  let cur=0;const step=target/50;
  const t=setInterval(()=>{cur+=step;if(cur>=target){cur=target;clearInterval(t)}
    el.textContent=prefix+(dec?cur.toFixed(dec):Math.floor(cur))+suffix},30)
}
const sObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){
    document.querySelectorAll('[data-count]').forEach(el=>{
      countUp(el,parseFloat(el.dataset.count),el.dataset.suffix||'',el.dataset.prefix||'',parseInt(el.dataset.decimal||'0'))
    });sObs.unobserve(e.target)}})
},{threshold:.3});
const sEl=document.querySelector('.stats');if(sEl)sObs.observe(sEl);

// ══════ PAYMENT POPUP ══════
function showPayment(plan){document.getElementById('popup-plan').textContent=plan;document.querySelector('.popup').classList.add('on')}
function closePayment(){document.querySelector('.popup').classList.remove('on')}

// ══════ SMOOTH SCROLL ══════
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{e.preventDefault();const t=document.querySelector(a.getAttribute('href'));
    if(t)t.scrollIntoView({behavior:'smooth'})})
});

// ══════ HERO WORDS ══════
document.querySelectorAll('.hw').forEach((w,i)=>{
  w.style.opacity='0';w.style.transform='translateY(40px)';
  setTimeout(()=>{w.style.transition='all .6s cubic-bezier(.16,1,.3,1)';w.style.opacity='1';w.style.transform='none'},300+i*100)
});
