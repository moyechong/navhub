// 实时时钟
function updateClock() {
    const now = new Date();
    const timeEl = document.getElementById('live-time');
    const dateEl = document.getElementById('live-date');
    if (timeEl) {
        timeEl.textContent = now.toLocaleTimeString('zh-CN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });
    }
    if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('zh-CN', {
            month: '2-digit', day: '2-digit', weekday: 'short'
        });
    }
}
setInterval(updateClock, 1000);
updateClock();

// 搜索功能
const searchInput = document.getElementById('search-input');
const engineTabs = document.querySelectorAll('.engine-tab');
let activeEngine = 'https://www.baidu.com/s?wd=';

engineTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        engineTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeEngine = tab.dataset.engine;
        searchInput.focus();
    });
});

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const q = searchInput.value.trim();
        if (q) window.open(activeEngine + encodeURIComponent(q), '_blank');
    }
});

// 主题切换
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
});

// Canvas 粒子背景
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];
let mouse = { x: null, y: null };

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 2 + 0.5;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // 鼠标排斥
        if (mouse.x != null) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 150) {
                const force = (150 - dist) / 150;
                this.x += dx * force * 0.02;
                this.y += dy * force * 0.02;
            }
        }
    }
    draw() {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        ctx.fillStyle = isLight ? `rgba(99,102,241,${0.15})` : `rgba(255,255,255,${0.12})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const count = Math.min(Math.floor(width * height / 15000), 80);
    for (let i = 0; i < count; i++) particles.push(new Particle());
}

function drawLines() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < maxDist) {
                const alpha = (1 - dist / maxDist) * (isLight ? 0.08 : 0.12);
                ctx.strokeStyle = isLight ? `rgba(99,102,241,${alpha})` : `rgba(255,255,255,${alpha})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => { resize(); initParticles(); });
window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

resize();
initParticles();
animate();

// 搜索框快捷键 /
document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
    }
});
