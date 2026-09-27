// Atiende (nombre provisional) · landing de presentación
//
// Rendimiento (iPhone): nada trabaja si no está en pantalla. Todo lo que depende de la
// posición usa IntersectionObserver; el único cálculo por fotograma es la barra de
// progreso de «Cómo funciona», y solo mientras esa sección está a la vista.

// Enlace del calendario donde el reformista reserva la llamada de 15 minutos (Calendly del Señor, 27-09).
const BOOKING_URL = 'https://calendly.com/agusbrowncontacto/reunion-estrategica';

document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasIO = 'IntersectionObserver' in window;
const isPhone = () => window.innerWidth <= 600;

// Llama a onChange(visible) cuando el elemento entra o sale de la pantalla.
const watch = (el, onChange, rootMargin = '0px') => {
  if (!el) return;
  if (!hasIO) { onChange(true); return; }
  new IntersectionObserver((entries) => {
    for (const e of entries) onChange(e.isIntersecting);
  }, { rootMargin }).observe(el);
};

// ---------- aparición al bajar ----------
const revealEls = document.querySelectorAll('[data-reveal]');
if (hasIO && !reduceMotion) {
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

// ---------- portada: el formulario va pasando solo, solo mientras se ve ----------
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
  let timer = null;
  const show = (n) => heroScreens.forEach((s, k) => s.classList.toggle('is-active', k === n));
  const next = () => {
    h = (h + 1) % heroScreens.length;
    show(h);
    timer = setTimeout(next, h === heroScreens.length - 1 ? 3200 : 2100);
  };
  watch(heroPhone, (visible) => {
    clearTimeout(timer);
    timer = visible ? setTimeout(next, 1500) : null;
  });
}

// ---------- la onda de la llamada solo se mueve mientras se ve ----------
const callPhone = document.getElementById('callPhone');
watch(callPhone, (visible) => callPhone.classList.toggle('is-live', visible && !reduceMotion));

// ---------- cómo funciona: el paso que cruza la mitad de la pantalla manda ----------
let active = 0;
const setActive = (n) => {
  if (n === active) return;
  active = n;
  steps.forEach((s, k) => s.classList.toggle('is-active', k === n));
  screens.forEach((s, k) => s.classList.toggle('is-active', k === n));
};

if (hasIO) {
  // Una línea en la mitad de la pantalla: el paso que la toca es el activo.
  const stepIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) setActive(steps.indexOf(e.target));
    }
  }, { rootMargin: '-49% 0px -50% 0px' });
  steps.forEach((s) => stepIO.observe(s));
}

// Barra de progreso: se calcula en el scroll solo con la sección a la vista.
let storyVisible = false;
const updateRail = () => {
  const r = stepsBox.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (window.innerHeight * 0.5 - r.top) / r.height));
  railFill.style.transform = `scaleY(${p.toFixed(3)})`;
};
watch(stepsBox, (visible) => { storyVisible = visible; if (visible) updateRail(); });

// ---------- barra de navegación ----------
const nav = document.getElementById('nav');

let ticking = false;
let navScrolled = null;
const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const scrolled = window.scrollY > 12;
    if (scrolled !== navScrolled) { navScrolled = scrolled; nav.classList.toggle('scrolled', scrolled); }
    if (storyVisible) updateRail();
    ticking = false;
  });
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

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

// ---------- reservar la llamada ----------
const bookBtn = document.getElementById('bookBtn');
const bookMsg = document.getElementById('bookMsg');
if (BOOKING_URL) {
  bookBtn.href = BOOKING_URL;
} else {
  bookBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    bookMsg.textContent = 'Todavía no está configurado el enlace del calendario.';
  });
}

// ---------- el panel por dentro: simulación ----------
// Se mueve solo mientras se ve; en cuanto el visitante toca algo, manda él.
const app = document.getElementById('app');
if (app) {
  const tabs = [...app.querySelectorAll('.app-tab')];
  const views = [...app.querySelectorAll('.app-view')];
  const toast = document.getElementById('appToast');
  const badge = document.getElementById('appBadge');
  const arrival = app.querySelector('[data-arrive]');
  const arrivalSt = app.querySelector('[data-arrive-st]');
  const calNew = document.getElementById('calNew');
  const timelineItems = [...app.querySelectorAll('#clTimeline li')];
  const counters = [...app.querySelectorAll('[data-count]')];
  const resumen = app.querySelector('[data-view="resumen"]');
  const later = [];
  const clearLater = () => { while (later.length) clearTimeout(later.pop()); };
  const after = (ms, fn) => later.push(setTimeout(fn, ms));

  let toastTimer = null;
  const say = (text) => {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  };

  const playTimeline = () => {
    if (reduceMotion) { timelineItems.forEach((li) => li.classList.add('in')); return; }
    timelineItems.forEach((li) => li.classList.remove('in'));
    timelineItems.forEach((li, k) => after(150 + k * 260, () => li.classList.add('in')));
  };

  const playResumen = () => {
    if (reduceMotion) return;
    resumen.classList.add('play-out');
    counters.forEach((c) => { c.textContent = '0'; });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      resumen.classList.remove('play-out');
      const t0 = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - t0) / 900);
        const e = 1 - Math.pow(1 - p, 3);
        counters.forEach((c) => { c.textContent = String(Math.round(Number(c.dataset.count) * e)); });
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }));
  };

  const show = (name) => {
    tabs.forEach((t) => {
      const on = t.dataset.tab === name;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    views.forEach((v) => v.classList.toggle('is-on', v.dataset.view === name));
    if (name === 'cliente') playTimeline();
    if (name === 'resumen') playResumen();
  };

  // Estado de partida de la historia: la solicitud de Javier aún no ha llegado.
  const reset = () => {
    arrival.classList.add('is-hidden');
    arrivalSt.textContent = 'Por confirmar';
    arrivalSt.className = 'st new';
    badge.textContent = '2';
    calNew.classList.add('pend');
  };

  const story = [
    { wait: 1500, fn: () => { reset(); show('solicitudes'); } },
    { wait: 3000, fn: () => {
      arrival.classList.remove('is-hidden');
      badge.textContent = '3';
      say('Nueva solicitud · Javier P. · cocina · 5 fotos');
    } },
    { wait: 1800, fn: () => show('calendario') },
    { wait: 3400, fn: () => {
      calNew.classList.remove('pend');
      arrivalSt.textContent = 'Confirmada';
      arrivalSt.className = 'st ok';
      say('Visita confirmada · a Javier le llega el aviso por WhatsApp');
    } },
    { wait: 5200, fn: () => show('cliente') },
    { wait: 5200, fn: () => show('resumen') },
  ];

  let idx = 0;
  let timer = null;
  let userControl = false;
  const run = () => {
    story[idx].fn();
    timer = setTimeout(() => { idx = (idx + 1) % story.length; run(); }, story[idx].wait);
  };
  const start = () => { if (!userControl && !timer && !reduceMotion) run(); };
  const stop = () => { clearTimeout(timer); timer = null; };
  const takeControl = () => { userControl = true; stop(); clearLater(); };

  watch(app, (visible) => (visible ? start() : stop()), '-15% 0px -15% 0px');
  tabs.forEach((t) => t.addEventListener('click', () => { takeControl(); show(t.dataset.tab); }));
  app.querySelectorAll('[data-open]').forEach((el) => {
    const open = () => { takeControl(); show(el.dataset.open); };
    el.addEventListener('click', open);
    el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') open(); });
  });
  if (reduceMotion) timelineItems.forEach((li) => li.classList.add('in'));
}

// ---------- portada: el nombre de su empresa en todos los ejemplos ----------
// Solo cambia el texto en su pantalla; no se envía nada.
const DEMO = 'Reformas García';
const DEMO_SLUG = 'reformasgarcia';
const STOP = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e']);
const initials = (name) => {
  const words = name.split(' ').filter((w) => w && !STOP.has(w.toLowerCase()));
  if (!words.length) return 'RG';
  const letters = words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[1][0];
  return letters.toUpperCase();
};
const slug = (name) => name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Todos los textos de ejemplo con el nombre (incluidas las copias de las pantallas), recogidos una vez.
const nameNodes = [];
const walker = document.createTreeWalker(document.getElementById('contenido'), NodeFilter.SHOW_TEXT);
for (let n = walker.nextNode(); n; n = walker.nextNode()) {
  if (n.nodeValue.includes(DEMO) || n.nodeValue.includes(DEMO_SLUG)) nameNodes.push({ node: n, tpl: n.nodeValue });
}
const avatars = [...document.querySelectorAll('.avatar')].filter((a) => a.textContent.trim() === 'RG');

const setBusiness = (raw) => {
  const name = raw.trim().replace(/\s+/g, ' ') || DEMO;
  const nameSlug = slug(name) || DEMO_SLUG;
  for (const { node, tpl } of nameNodes) node.nodeValue = tpl.split(DEMO).join(name).split(DEMO_SLUG).join(nameSlug);
  const ini = name === DEMO ? 'RG' : initials(name);
  avatars.forEach((a) => { a.textContent = ini; });
};

const tryForm = document.getElementById('tryForm');
const tryName = document.getElementById('tryName');
tryName.addEventListener('input', () => setBusiness(tryName.value));
tryForm.addEventListener('submit', (ev) => {
  ev.preventDefault();
  tryName.blur();
  // En el móvil el teléfono de ejemplo queda debajo: lo acercamos para que vea su formulario.
  const r = heroPhone.getBoundingClientRect();
  if (r.top > window.innerHeight * 0.6 || r.bottom < 0) {
    heroPhone.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }
});
