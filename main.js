// Atiende (nombre provisional) · landing de presentación

// Número de WhatsApp que recibe las solicitudes: solo dígitos, con prefijo de país (34...).
// PENDIENTE: el Señor tiene que pasarlo.
const WHATSAPP = '';
const MARCA = 'Atiende';

document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- aparición al bajar ----------
const revealEls = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('in'));
}

// ---------- barra de navegación ----------
const nav = document.getElementById('nav');
const onScrollNav = () => nav.classList.toggle('scrolled', window.scrollY > 12);
onScrollNav();

// ---------- chat de la portada ----------
const heroItems = [...document.querySelectorAll('#heroChat [data-seq]')];
if (reduceMotion) {
  heroItems.forEach((el) => el.classList.add('on'));
} else {
  let i = 0;
  const tick = () => {
    if (i < heroItems.length) {
      heroItems[i].classList.add('on');
      i += 1;
      setTimeout(tick, i === heroItems.length ? 3800 : 1100);
    } else {
      heroItems.forEach((el) => el.classList.remove('on'));
      i = 0;
      setTimeout(tick, 700);
    }
  };
  setTimeout(tick, 600);
}

// ---------- cómo funciona: el paso activo cambia la pantalla ----------
const steps = [...document.querySelectorAll('.step')];
const screens = [...document.querySelectorAll('#storyPhone [data-screen]')];
const stepsBox = document.getElementById('steps');
const railFill = document.getElementById('railFill');
let active = 0;

const setActive = (n) => {
  if (n === active) return;
  active = n;
  steps.forEach((s, k) => s.classList.toggle('is-active', k === n));
  screens.forEach((s, k) => s.classList.toggle('is-active', k === n));
};

const updateStory = () => {
  // El paso activo es el que cruza la línea de lectura (55% de la pantalla en el móvil, 50% en el ordenador).
  const line = window.innerHeight * (window.innerWidth <= 900 ? 0.62 : 0.5);
  let current = 0;
  steps.forEach((s, k) => { if (s.getBoundingClientRect().top < line) current = k; });
  setActive(current);

  const r = stepsBox.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (line - r.top) / r.height));
  railFill.style.height = (p * 100).toFixed(1) + '%';
};

// ---------- botón fijo en el móvil ----------
const mobileCta = document.getElementById('mobileCta');
const hero = document.querySelector('.hero');
const finalSec = document.getElementById('probar');
const updateMobileCta = () => {
  const pastHero = hero.getBoundingClientRect().bottom < 80;
  const atForm = finalSec.getBoundingClientRect().top < window.innerHeight;
  mobileCta.classList.toggle('show', pastHero && !atForm);
};

let ticking = false;
const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    onScrollNav();
    updateStory();
    updateMobileCta();
    ticking = false;
  });
};
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
updateStory();
updateMobileCta();

// ---------- formulario → WhatsApp ----------
const form = document.getElementById('form');
const msg = document.getElementById('formMsg');

form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  msg.textContent = '';
  const data = new FormData(form);
  const nombre = String(data.get('nombre') || '').trim();
  const empresa = String(data.get('empresa') || '').trim();

  let firstBad = null;
  for (const [name, value] of [['nombre', nombre], ['empresa', empresa]]) {
    const input = form.elements[name];
    const bad = value.length < 2;
    input.setAttribute('aria-invalid', bad ? 'true' : 'false');
    if (bad && !firstBad) firstBad = input;
  }
  if (firstBad) {
    msg.textContent = 'Falta tu nombre o el de tu empresa.';
    firstBad.focus();
    return;
  }

  if (!WHATSAPP) {
    msg.textContent = 'Todavía no está configurado el número de WhatsApp.';
    return;
  }

  const texto = [
    `Hola, quiero probar ${MARCA}.`,
    `Nombre: ${nombre}`,
    `Empresa: ${empresa}`,
    `Web o ficha de Google: ${data.get('web')}`,
    `Llamadas que no puedo coger a la semana: ${data.get('llamadas')}`,
  ].join('\n');

  window.location.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
});
