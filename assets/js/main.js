// Esperar a que todos los scripts se carguen completamente
window.addEventListener('load', () => {
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // GSAP setup
  gsap.registerPlugin(ScrollTrigger);

  // LENIS (smooth scroll) + sincronía con ScrollTrigger
  let lenis;
  if(!prefersReduce && typeof Lenis !== 'undefined'){
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => 1 - Math.pow(1 - t, 2),
      smoothWheel: true,
      smoothTouch: false,
    });
    
    function raf(time){
      lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // IntersectionObserver para .reveal
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: .2 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // HERO: título y subtítulo se desplazan a izquierda + zoom + blur + desaparecen
  const logo = document.getElementById('logoText');
  const sub = document.getElementById('subtitle');
  const phone = document.getElementById('phoneMock');
  const heroH2 = document.getElementById('heroH2');

  if(!prefersReduce){
    const tlHero = gsap.timeline({
      scrollTrigger: {
        trigger: document.querySelector('header.hero'),
        start: 'top top',
        end: '+=90%',
        scrub: true,
        pin: false,
      }
    });
    tlHero.fromTo([logo, sub],
      { xPercent: 0, scale: 1, filter: 'blur(0px)', opacity: 1 },
      { xPercent: -18, scale: 1.18, filter: `blur(${getComputedStyle(document.documentElement).getPropertyValue('--blur-max')})`, opacity: 0, ease: 'none' }, 0
    ).fromTo(phone,
      { xPercent: 0, opacity: 1 },
      { xPercent: 28, opacity: 0, ease: 'none' }, 0
    );
    // Animación para h2: zoom hacia adelante y transición de color a verde fluor mientras desaparece
    if(heroH2){
      // Usamos fromTo para scale y opacity, y añadimos un tween simultáneo para color
      tlHero.fromTo(heroH2,
        { xPercent: 0, scale: 1, filter: 'blur(0px)', opacity: 1, color: getComputedStyle(heroH2).color },
        { xPercent: 8, scale: 1.35, filter: `blur(${getComputedStyle(document.documentElement).getPropertyValue('--blur-max')})`, opacity: 0, ease: 'none' }, 0
      );
      // Tween separado para animar color a verde fluor (hex #7CFC00)
      tlHero.to(heroH2, { color: '#7CFC00', ease: 'none' }, 0);
    }
  }

  // SOLUCIÓN: título e imagen toolbox con fade-in/out siguiendo scroll
  if(!prefersReduce){
    gsap.utils.toArray('.fade-in-out').forEach(el => {
      gsap.fromTo(el, { opacity: 0, y: 20 }, {
        opacity: 1, y: 0,
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 20%', scrub: true }
      });
    });
  }

  // CAPÍTULO PINNED: zoom y aparición de pantallas
  if(!prefersReduce){
    const tlChapter = gsap.timeline({
      scrollTrigger: {
        trigger: document.querySelector('.chapter'),
        start: 'top top', end: '+=220%', pin: true, scrub: true,
        anticipatePin: 1
      }
    });
    tlChapter.fromTo('.mockup', { scale: .92, y: 40 }, { scale: 1.06, y: -20, ease: 'none' })
            .to('.mockup__screen', { opacity: 1, duration: 0.5 }, '<');
  }

  // HORIZONTAL SCROLL
  if(!prefersReduce){
    const panels = gsap.utils.toArray('.hpanel');
    const totalShift = -100 * (panels.length - 1);
    gsap.to('.htrack', {
      xPercent: totalShift,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hwrap',
        pin: true,
        scrub: true,
        start: 'top top',
        end: () => `+=${window.innerWidth * (panels.length - 1)}`,
        invalidateOnRefresh: true
      }
    });
  }

  // LOTTIE atada al scroll
  const lottieEl = document.getElementById('lottie');
  if(lottieEl && !prefersReduce){
    const path = lottieEl.getAttribute('data-path');
    const anim = lottie.loadAnimation({
      container: lottieEl,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path
    });
    let frames = 0;
    anim.addEventListener('DOMLoaded', () => {
      frames = anim.getDuration(true) || 180; // fallback
    });
    ScrollTrigger.create({
      trigger: lottieEl,
      start: 'top 80%', end: 'bottom 20%',
      scrub: true,
      onUpdate: (self) => {
        if(frames){
          const f = Math.floor(self.progress * (frames - 1));
          anim.goToAndStop(f, true);
        }
      }
    });
  }

  // Microgestos CTA: respiración sutil + nudge ocasional al ícono
  const ctaw = document.querySelectorAll('.cta-wiggle');
  ctaw.forEach(btn => {
    if(prefersReduce) return;
    // respiración sutil
    gsap.to(btn, { scale: 1.02, duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    const icon = btn.querySelector('.cta-icon');
    if(icon){
      const nudge = () => {
        gsap.fromTo(icon, { x: 0 }, { x: 6, duration: .28, yoyo: true, repeat: 1, ease: 'power1.inOut' });
      };
      // cada ~6–9s aleatoriamente
      const loop = () => { nudge(); setTimeout(loop, 6000 + Math.random()*3000); };
      setTimeout(loop, 3000);
      // on hover más marcado
      btn.addEventListener('mouseenter', () => gsap.to(btn, { scale: 1.05, duration: .2 }));
      btn.addEventListener('mouseleave', () => gsap.to(btn, { scale: 1.02, duration: .2 }));
    }
  });

  // Refresh al cambiar tamaño
  window.addEventListener('resize', () => ScrollTrigger.refresh());
});