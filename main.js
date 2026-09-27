// Atiende (nombre provisional) · landing de presentación

// Número de WhatsApp que recibe las solicitudes: solo dígitos, con prefijo de país (34...).
// PENDIENTE: el Señor tiene que pasarlo.
const WHATSAPP = '';
const MARCA = 'Atiende';

document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isPhone = () => window.innerWidth <= 600;

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

// ---------- pantallas del recorrido ----------
const steps = [...document.querySelectorAll('.step')];
const screens = [...document.querySelectorAll('#storyPhone [data-screen]')];
const stepsBox = document.getElementById('steps');
const railFill = document.getElementById('railFill');

const copyScreen = (k) => {
  const copy = screens[k].cloneNode(true);
  copy.removeAttribute('data-screen');
  return copy;
};

// En teléfonos no hay móvil fijo: cada paso lleva una copia de su pantalla (la muestra el CSS a ≤600 px).
steps.forEach((step, k) => {
  if (!screens[k]) return;
  const mini = document.createElement('div');
  mini.className = 'phone step-phone';
  mini.innerHTML = '<div class="phone-notch" aria-hidden="true"></div>';
  const copy = copyScreen(k);
  copy.classList.add('is-active');
  mini.appendChild(copy);
  step.querySelector(':scope > div').appendChild(mini);
});

// ---------- portada: el formulario va pasando solo ----------
const heroPhone = document.getElementById('heroPhone');
const sent = heroPhone.querySelector('[data-hero="sent"]');
const heroScreens = [1, 2, 3, 4].map((k) => {
  const copy = copyScreen(k);
  copy.classList.remove('is-active');
  heroPhone.insertBefore(copy, sent);
  return copy;
});
heroScreens.push(sent);
if (!reduceMotion) {
  let h = heroScreens.length - 1;
  const show = (n) => heroScreens.forEach((s, k) => s.classList.toggle('is-active', k === n));
  const next = () => {
    h = (h + 1) % heroScreens.length;
    show(h);
    setTimeout(next, h === heroScreens.length - 1 ? 3200 : 2100);
  };
  setTimeout(next, 1800);
}

// ---------- el paso activo cambia la pantalla del móvil fijo ----------
let active = 0;
const setActive = (n) => {
  if (n === active) return;
  active = n;
  steps.forEach((s, k) => s.classList.toggle('is-active', k === n));
  screens.forEach((s, k) => s.classList.toggle('is-active', k === n));
};

const updateStory = () => {
  // El paso activo es el que cruza la mitad de la pantalla.
  const line = window.innerHeight * 0.5;
  let current = 0;
  steps.forEach((s, k) => { if (s.getBoundingClientRect().top < line) current = k; });
  setActive(current);

  const r = stepsBox.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (line - r.top) / r.height));
  railFill.style.height = (p * 100).toFixed(1) + '%';
};

// ---------- se puede tocar: opciones y «Siguiente» ----------
document.addEventListener('click', (ev) => {
  const opt = ev.target.closest('.screen .opt');
  if (opt) {
    const group = opt.closest('.single, .multi');
    if (group && group.classList.contains('single')) {
      group.querySelectorAll('.opt').forEach((o) => o.classList.toggle('sel', o === opt));
    } else {
      opt.classList.toggle('sel');
    }
    return;
  }
  const nextBtn = ev.target.closest('[data-next]');
  if (nextBtn) {
    const holder = nextBtn.closest('[data-idx]');
    const target = holder && steps[Number(holder.dataset.idx) + 1];
    if (target) {
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: isPhone() ? 'start' : 'center' });
    }
  }
});

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

// ---------- formulario de contacto → WhatsApp ----------
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
