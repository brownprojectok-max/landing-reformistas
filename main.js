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
