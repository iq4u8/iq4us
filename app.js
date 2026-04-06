// ══════ ANIMATED MESH BACKGROUND (WebGL) ══════
(function(){
  var c=document.getElementById('meshBg');
  if(!c)return;
  var gl=c.getContext('webgl');
  if(!gl){
    c.style.background='#000000';
    return;
  }
  function resize(){c.width=window.innerWidth;c.height=window.innerHeight;gl.viewport(0,0,c.width,c.height)}
  var vsrc='attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}';
  var fsrc=[
    'precision highp float;',
    'uniform float t;uniform vec2 r;',
    'void main(){',
    '  vec2 uv=gl_FragCoord.xy/r;',
    '  float v=0.0;',
    '  v+=sin(uv.x*3.5+t*0.25)*sin(uv.y*2.8-t*0.18)*0.5;',
    '  v+=sin(length(uv-vec2(0.3,0.7))*5.0-t*0.35)*0.2;',
    '  v+=sin(length(uv-vec2(0.7,0.2))*4.5+t*0.3)*0.18;',
    '  v+=sin((uv.x+uv.y)*2.0+t*0.15)*0.12;',
    '  gl_FragColor=vec4(0.0,0.0,0.0,1.0);',
    '}'
  ].join('\n');
  function mk(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;}
  var prog=gl.createProgram();
  gl.attachShader(prog,mk(gl.VERTEX_SHADER,vsrc));
  gl.attachShader(prog,mk(gl.FRAGMENT_SHADER,fsrc));
  gl.linkProgram(prog);gl.useProgram(prog);
  var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  var pL=gl.getAttribLocation(prog,'p');gl.enableVertexAttribArray(pL);gl.vertexAttribPointer(pL,2,gl.FLOAT,false,0,0);
  var tL=gl.getUniformLocation(prog,'t');
  var rL=gl.getUniformLocation(prog,'r');
  resize();
  window.addEventListener('resize',resize);
  function draw(now){
    gl.uniform1f(tL,now*0.001);
    gl.uniform2f(rL,c.width,c.height);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

// ══════ NAV SCROLL ══════
var nav=document.querySelector('.nav');
window.addEventListener('scroll',function(){
  nav.classList.toggle('scrolled',window.scrollY>50);
});

// ══════ HAMBURGER + BUBBLE MENU + PUSH DOWN ══════
var hamBtn=document.getElementById('hamBtn');
var bubbleMenu=document.getElementById('bubbleMenu');
if(hamBtn&&bubbleMenu){
  hamBtn.addEventListener('click',function(){
    var isOpen=hamBtn.classList.toggle('active');
    bubbleMenu.classList.toggle('open');
    // Push page content down smoothly
    document.body.classList.toggle('menu-open',isOpen);
  });
  // Close menu when a bubble is clicked
  var bubbles=bubbleMenu.querySelectorAll('.bubble');
  for(var i=0;i<bubbles.length;i++){
    bubbles[i].addEventListener('click',function(){
      hamBtn.classList.remove('active');
      bubbleMenu.classList.remove('open');
      document.body.classList.remove('menu-open');
    });
  }
  // Close on scroll
  window.addEventListener('scroll',function(){
    if(bubbleMenu.classList.contains('open')){
      hamBtn.classList.remove('active');
      bubbleMenu.classList.remove('open');
      document.body.classList.remove('menu-open');
    }
  });
}

// ══════ SCROLL REVEAL ══════
var obs=new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(e.isIntersecting){e.target.classList.add('vis');obs.unobserve(e.target);}
  });
},{threshold:0.1});
var rvEls=document.querySelectorAll('.rv');
for(var i=0;i<rvEls.length;i++){obs.observe(rvEls[i]);}

// ══════ COUNT UP ══════
function countUp(el,target,suffix,prefix,dec){
  var cur=0;var step=target/50;
  var timer=setInterval(function(){
    cur+=step;if(cur>=target){cur=target;clearInterval(timer);}
    el.textContent=prefix+(dec?cur.toFixed(dec):Math.floor(cur))+suffix;
  },30);
}
var sObs=new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(e.isIntersecting){
      var els=document.querySelectorAll('[data-count]');
      for(var i=0;i<els.length;i++){
        var el=els[i];
        countUp(el,parseFloat(el.dataset.count),el.dataset.suffix||'',el.dataset.prefix||'',parseInt(el.dataset.decimal||'0'));
      }
      sObs.unobserve(e.target);
    }
  });
},{threshold:0.3});
var statsEl=document.querySelector('.stats');
if(statsEl){sObs.observe(statsEl);}

// ══════ PAYMENT ══════
function showPayment(plan){
  document.getElementById('popup-plan').textContent=plan;
  document.querySelector('.popup').classList.add('on');
}
function closePayment(){
  document.querySelector('.popup').classList.remove('on');
}

// ══════ SMOOTH SCROLL ══════
var smoothLinks=document.querySelectorAll('a[href^="#"]');
for(var i=0;i<smoothLinks.length;i++){
  smoothLinks[i].addEventListener('click',function(e){
    e.preventDefault();
    var t=document.querySelector(this.getAttribute('href'));
    if(t){t.scrollIntoView({behavior:'smooth'});}
    if(bubbleMenu&&bubbleMenu.classList.contains('open')){
      hamBtn.classList.remove('active');
      bubbleMenu.classList.remove('open');
      document.body.classList.remove('menu-open');
    }
  });
}

// ══════ HERO WORD ANIMATION ══════
var words=document.querySelectorAll('.hw');
for(var i=0;i<words.length;i++){
  (function(w,idx){
    w.style.opacity='0';
    w.style.transform='translateY(40px)';
    setTimeout(function(){
      w.style.transition='all .6s cubic-bezier(.16,1,.3,1)';
      w.style.opacity='1';
      w.style.transform='none';
    },300+idx*100);
  })(words[i],i);
}
