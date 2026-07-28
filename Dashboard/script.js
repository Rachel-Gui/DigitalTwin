const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-header nav');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

const metricObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting || entry.target.dataset.animating === 'true') return;
    entry.target.dataset.animating = 'true';
    entry.target.classList.remove('is-animating');
    void entry.target.offsetWidth;
    entry.target.classList.add('is-animating');
    entry.target.querySelectorAll('[data-count]').forEach((counter) => {
      const target = Number(counter.dataset.count);
      counter.textContent = '0';
      const started = performance.now();
      const animate = (now) => {
        const progress = Math.min((now - started) / 1600, 1);
        counter.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) requestAnimationFrame(animate);
        else window.setTimeout(() => { entry.target.dataset.animating = 'false'; }, 500);
      };
      requestAnimationFrame(animate);
    });
  });
}, { threshold: 0.2 });

const metricStack = document.querySelector('.metric-stack');
if (metricStack) metricObserver.observe(metricStack);

const vrUrl = `${window.location.protocol}//${window.location.hostname}:3000/`;
document.querySelectorAll('[data-vr-link]').forEach((link) => {
  link.href = vrUrl;
});
