
const API_BASE = 'https://evidzone-love.hf.space';
const WS_BASE = 'wss://evidzone-love.hf.space';

// UTM cleanup
(function () { const u = new URL(location); if (u.searchParams.has('utm_source')) { u.search = ''; history.replaceState(null, '', u.pathname + u.hash) } })();

// Particles
(function () {
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div'); p.className = 'particle';
        p.style.left = Math.random() * 100 + '%'; p.style.top = Math.random() * 100 + '%';
        p.style.animation = `rise ${10 + Math.random() * 20}s linear infinite`;
        p.style.animationDelay = -Math.random() * 20 + 's';
        document.body.appendChild(p);
    }
})();

// API Helper
async function api(e, o = {}) {
    const t = localStorage.getItem('token');
    o.headers = { ...o.headers || {}, 'Content-Type': 'application/json' };
    if (t) o.headers['x-auth-token'] = t;
    const r = await fetch(API_BASE + e, o);
    if (r.status === 401) { logout(); throw new Error('Auth'); }
    return r;
}

function logout() {
    localStorage.removeItem('token');
    location.href = '/';
}

function showLogin() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('lp').style.display = 'flex';
}

function closeAlert() { document.getElementById('alertBar').classList.remove('sh') }

// Auth Logic
async function doAuth(e) {
    e.preventDefault();
    const u = document.getElementById('aU').value, p = document.getElementById('aP').value, m = document.getElementById('aErr'), b = document.getElementById('aB');
    if (!document.getElementById('agreeTC').checked) return alert('Please agree to Terms & Privacy Policy');
    m.style.display = 'none'; b.disabled = true; b.textContent = 'Wait...';
    try {
        const r = await api('/api/' + (b.dataset.mode || 'login'), { method: 'POST', body: JSON.stringify({ username: u, password: p }) });
        const d = await r.json();
        if (d.success) {
            if (d.pending) {
                document.getElementById('lp').style.display = 'none';
                document.getElementById('pendingPage').style.display = 'flex';
            } else if (d.token) {
                localStorage.setItem('token', d.token);
                location.href = '/browse/';
            } else {
                alert(d.message || 'Success');
                if (b.dataset.mode === 'signup') { b.dataset.mode = 'login'; b.textContent = 'Login'; document.querySelector('.ts button:first-child').click(); }
            }
        } else { m.textContent = d.error || 'Failed'; m.style.display = 'block'; }
    } catch (err) { m.textContent = 'Connection failed'; m.style.display = 'block'; }
    b.disabled = false; b.textContent = b.dataset.mode === 'signup' ? 'Sign Up' : 'Login';
}

function stab(m) {
    document.getElementById('aB').dataset.mode = m;
    document.getElementById('aB').textContent = m === 'login' ? 'Login' : 'Sign Up';
    document.querySelectorAll('.ts button').forEach(b => b.classList.toggle('a', b.textContent.toLowerCase().replace(' ', '') === m));
    document.getElementById('aErr').style.display = 'none';
    if (m === 'signup') document.getElementById('tcBox').classList.add('sh'); else document.getElementById('tcBox').classList.remove('sh');
}
