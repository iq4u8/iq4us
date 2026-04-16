// ══════ MATRIX DIGITAL RAIN BACKGROUND ══════
(function(){
  var c = document.getElementById('meshBg');
  if(!c) return;
  var ctx = c.getContext('2d');
  if(!ctx){ c.style.background='#000'; return; }

  var CHARS = '01';
  var FONT_SIZE = 11;
  var CHAR_STEP = FONT_SIZE + 3;
  var COL_GAP = 30;
  var ACTIVE_RATIO = 0.25;

  var streams = [];

  function resize(){
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    initStreams();
  }

  function getChar(){ return CHARS[Math.floor(Math.random()*CHARS.length)]; }

  function initStreams(){
    streams = [];
    var totalCols = Math.floor(c.width / COL_GAP);
    for(var i = 0; i < totalCols; i++){
      if(Math.random() > ACTIVE_RATIO) continue;
      streams.push(createStream(i * COL_GAP + COL_GAP/2, true));
    }
  }

  function createStream(x, randomStart){
    var trailLen = 4 + Math.floor(Math.random() * 8);
    // vanishAt = how far down (0-1 of screen height) this stream disappears
    // some go full height, some vanish midway
    var vanishAt = 0.3 + Math.random() * 0.7; // 30%-100% of screen
    var chars = [];
    for(var i = 0; i < trailLen; i++) chars.push(getChar());
    return {
      x: x,
      y: randomStart ? -Math.random() * c.height : -trailLen * CHAR_STEP,
      speed: 0.3 + Math.random() * 0.5,
      trailLen: trailLen,
      chars: chars,
      vanishY: c.height * vanishAt,
      charTimer: 0,
      charInterval: 5 + Math.random() * 10,
      waiting: false,
      waitTimer: 0
    };
  }

  function respawn(s){
    s.trailLen = 4 + Math.floor(Math.random() * 8);
    s.chars = [];
    for(var i = 0; i < s.trailLen; i++) s.chars.push(getChar());
    s.y = -s.trailLen * CHAR_STEP - Math.random() * 200;
    s.speed = 0.3 + Math.random() * 0.5;
    s.vanishY = c.height * (0.3 + Math.random() * 0.7);
    s.waiting = false;
    s.waitTimer = 0;
  }

  var lastTime = 0;

  function draw(now){
    var dt = Math.min((now - lastTime) / 16.67, 3);
    lastTime = now;

    // CLEAR canvas fully — NO fade overlay = NO water trails
    ctx.clearRect(0, 0, c.width, c.height);

    for(var i = 0; i < streams.length; i++){
      var s = streams[i];

      if(s.waiting){
        s.waitTimer -= dt;
        if(s.waitTimer <= 0) respawn(s);
        continue;
      }

      s.y += s.speed * dt;

      // Flip a random char sometimes
      s.charTimer += dt;
      if(s.charTimer >= s.charInterval){
        s.charTimer = 0;
        s.chars[Math.floor(Math.random() * s.chars.length)] = getChar();
        s.charInterval = 5 + Math.random() * 10;
      }

      // Check if head reached vanish point — start fading
      var headY = s.y;
      var fadeProgress = headY > s.vanishY ? Math.min((headY - s.vanishY) / (s.trailLen * CHAR_STEP), 1) : 0;
      var streamAlpha = 1 - fadeProgress; // 1 = fully visible, 0 = gone

      if(streamAlpha <= 0){
        s.waiting = true;
        s.waitTimer = 20 + Math.random() * 80;
        continue;
      }

      // Draw chars
      for(var j = 0; j < s.trailLen; j++){
        var cy = s.y - j * CHAR_STEP;
        if(cy < -FONT_SIZE || cy > c.height + FONT_SIZE) continue;

        // Tail fade: head=bright, tail=dim
        var tailFade = 1 - (j / s.trailLen);
        tailFade = tailFade * tailFade;

        var alpha = tailFade * streamAlpha * 0.6;
        if(alpha < 0.01) continue;

        var r, g, b;
        if(j === 0){
          r = 180; g = 210; b = 255;
          alpha = Math.min(streamAlpha * 0.8, 0.8);
        } else if(j === 1){
          r = 120; g = 170; b = 245;
        } else {
          r = 40 + Math.floor(tailFade * 30);
          g = 70 + Math.floor(tailFade * 50);
          b = 160 + Math.floor(tailFade * 60);
        }

        ctx.save();
        if(j === 0){
          ctx.shadowColor = 'rgba(120,170,255,0.5)';
          ctx.shadowBlur = 8;
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgb('+r+','+g+','+b+')';
        ctx.font = FONT_SIZE + 'px "Courier New",monospace';
        ctx.fillText(s.chars[j], s.x, cy);
        ctx.restore();
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
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
