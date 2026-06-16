// Arcane Hive - interactions
(function () {
  'use strict';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav ---------- */
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.nav-burger');
  addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', scrollY > 24);
  }, { passive: true });
  nav.classList.toggle('scrolled', scrollY > 24);

  /* ---------- dark mode toggle ---------- */
  const toggle = document.querySelector('.theme-toggle');
  function applyTheme(dark) {
    document.documentElement.classList.toggle('dark', dark);
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    dispatchEvent(new CustomEvent('ah-theme', { detail: { dark } }));
  }
  toggle.addEventListener('click', () => {
    const dark = !document.documentElement.classList.contains('dark');
    localStorage.setItem('ah-theme', dark ? 'dark' : 'light');
    applyTheme(dark);
  });
  applyTheme(document.documentElement.classList.contains('dark'));

  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('.nav-mobile a').forEach(a =>
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }));

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion) {
    revealEls.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---------- counter ---------- */
  document.querySelectorAll('.stat-count').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    if (reduceMotion) { el.textContent = target; return; }
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      (function step(now) {
        const p = Math.min((now - t0) / 900, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }, { threshold: 0.6 });
    io.observe(el);
  });

  /* ---------- 3D tilt on service cards ---------- */
  if (!reduceMotion && matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.tilt').forEach(card => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 7}deg) rotateX(${py * -7}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    /* magnetic buttons */
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.28}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- efficiency audit ---------- */
  const AUDIT = {
    retail: {
      concerns: [
        ['stock',   'Scattered stock & manual inventory', 'এলোমেলো স্টক'],
        ['orders',  'Slow, error-prone orders & billing', 'অর্ডারে ভুল ও দেরি'],
        ['online',  'Customers can’t find us online', 'অনলাইনে উপস্থিতি নেই']
      ],
      title: 'Software Development: Retail Modernization',
      body: 'We build systems that solve the unorganized nature of retail: complex inventory management, localized logistics, and a seamless shopping experience for the Bangladeshi consumer. We turn scattered stock into a streamlined digital storefront, proven with Bongshal.com, a high-traffic online bike parts shop.'
    },
    factory: {
      concerns: [
        ['theft',   'Theft & shrinkage in the warehouse', 'গুদামে চুরি'],
        ['energy',  'Electricity costs keep climbing', 'বিদ্যুৎ খরচ বাড়ছে'],
        ['visibility', 'No real visibility into the floor', 'ফ্লোরে নজরদারি নেই']
      ],
      title: 'IoT Solutions: Smart Monitoring',
      body: 'Smart monitoring for warehouses and factories, built to prevent theft and optimize energy usage. We treat your digital infrastructure with the same respect you treat your physical assets: secure, updated, and fast, always.'
    },
    service: {
      concerns: [
        ['missed',  'Calls go unanswered at peak hours', 'পিক আওয়ারে কল মিস'],
        ['overhead','Operator team overhead is too heavy', 'অপারেটর খরচ বেশি'],
        ['slow',    'Slow responses are losing customers', 'ধীর সাড়া, ক্রেতা হারাচ্ছি']
      ],
      title: 'AI Integration: Call Center Automation',
      body: 'Our AI-based call center automation tool provides reliable, instant call handling, drastically improving response times while significantly reducing the overhead costs of large-scale operator teams.'
    }
  };

  const auditBox = document.querySelector('.audit-box');
  if (auditBox) {
    const step1 = auditBox.querySelector('[data-step="1"]');
    const step2 = auditBox.querySelector('[data-step="2"]');
    const step2Opts = step2.querySelector('.audit-opts');
    const result = auditBox.querySelector('.audit-result');
    let sector = null;

    step1.querySelectorAll('.audit-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        sector = btn.dataset.sector;
        step1.querySelectorAll('.audit-opt').forEach(b => b.classList.toggle('picked', b === btn));
        step2Opts.innerHTML = '';
        AUDIT[sector].concerns.forEach(([key, label, bn]) => {
          const b = document.createElement('button');
          b.className = 'audit-opt';
          b.innerHTML = `${label}<span class="bn">${bn}</span>`;
          b.addEventListener('click', () => showResult(label));
          step2Opts.appendChild(b);
        });
        step1.hidden = true;
        step2.hidden = false;
      });
    });

    function showResult(concernLabel) {
      const data = AUDIT[sector];
      result.querySelector('.audit-r-title').textContent = data.title;
      result.querySelector('.audit-r-body').textContent =
        `You said: “${concernLabel}.” ` + data.body;
      step2.hidden = true;
      result.hidden = false;
    }

    auditBox.querySelector('.audit-reset').addEventListener('click', () => {
      result.hidden = true;
      step2.hidden = true;
      step1.hidden = false;
      sector = null;
      step1.querySelectorAll('.audit-opt').forEach(b => b.classList.remove('picked'));
    });
  }

  /* ---------- contact form (mailto handoff) ---------- */
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('#f-name');
      const phone = form.querySelector('#f-phone');
      const sector = form.querySelector('#f-sector');
      let firstBad = null;

      [[name, name.value.trim().length > 1], [phone, /[0-9+\-\s]{6,}/.test(phone.value.trim())]]
        .forEach(([input, ok]) => {
          const err = input.closest('.field').querySelector('.field-err');
          input.setAttribute('aria-invalid', String(!ok));
          err.hidden = ok;
          if (!ok && !firstBad) firstBad = input;
        });

      if (firstBad) { firstBad.focus(); return; }

      const subject = encodeURIComponent('Callback request from ' + name.value.trim());
      const body = encodeURIComponent(
        `Name: ${name.value.trim()}\nPhone: ${phone.value.trim()}\nBusiness sector: ${sector.value || 'Not specified'}\n\nPlease call me back to discuss optimizing my operations.`
      );
      location.href = `mailto:contact@arcanehive.com?subject=${subject}&body=${body}`;
      form.querySelector('.form-done').hidden = false;
    });
  }
})();
