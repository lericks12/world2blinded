// Copie exacte du gros bloc <script> de w2b_v3 (4).html

  // ==================================================
  // 1. CONFIG
  // ==================================================

  /** Available services (used throughout booking and dashboard) */
  const SERVICES = [
    { id: 'copywriting',      name: 'Copywriting',          features: ['Pages de vente', 'Emails marketing', 'Scripts vidéo', 'Landing pages'] },
    { id: 'content-strategy', name: 'Stratégie de Contenu', features: ['Audit de contenu', 'Calendrier éditorial', 'SEO optimisé', 'Analytics'] },
    { id: 'web-design',       name: 'Création de Site Web', features: ['Design sur mesure', 'Développement complet', 'Responsive mobile', 'SEO optimisé'] },
    { id: 'social-media',     name: 'Réseaux Sociaux',      features: ['Posts optimisés', 'Stories engageantes', 'Publicités ciblées', 'Community'] },
  ];

  /** Available booking time slots */
  const SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  // ==================================================
  // 2. ROUTER
  // ==================================================

  /**
   * Maps URL paths to page IDs.
   * The router intercepts link clicks and shows the matching .w2b-page element.
   */
  var ROUTES = {
    'index.html':               'index',
    'index.html#services':      'index',
    'index.html#hero':          'index',
    'index.html#contact':       'index',
    'index.html#different':     'index',
    'index.html#why':           'index',
    'index.html#stats':         'index',
    'dashboard.html':           'dashboard',
    'service-copywriting.html': 'copywriting',
    'service-strategie.html':   'strategie',
    'service-siteweb.html':     'siteweb',
    'service-reseaux.html':     'reseaux',
    'reseau-reseau.html':       'reseaux',
    'reseau-reseau_html.html':  'reseaux'
  };

  /**
   * Shows the target page and hides all others.
   * Re-initializes FAQ accordions on service pages.
   * Re-applies language on index.
   * Scrolls to hash anchor if provided.
   */
  function navigate(pid, hash) {
    document.querySelectorAll('.w2b-page').forEach(function(p) {
      p.style.display = 'none';
    });

    var page = document.getElementById('pg-' + pid);
    if (!page) { page = document.getElementById('pg-index'); pid = 'index'; }
    page.style.display = 'block';
    window.scrollTo(0, 0);

    // Re-init FAQ accordion for service pages (clone nodes to remove stale listeners)
    var servicePids = ['copywriting', 'strategie', 'siteweb', 'reseaux'];
    if (servicePids.indexOf(pid) !== -1) {
      page.querySelectorAll('.faq-item').forEach(function(item) {
        var clone = item.cloneNode(true);
        item.parentNode.replaceChild(clone, item);
      });
      page.querySelectorAll('.faq-item').forEach(function(item) {
        item.addEventListener('click', function() {
          var isOpen = item.classList.contains('open');
          page.querySelectorAll('.faq-item').forEach(function(i) { i.classList.remove('open'); });
          if (!isOpen) item.classList.add('open');
        });
      });
    }

    // Re-apply language when returning to the index page
    if (pid === 'index' && window.setLang) {
      window.setLang(localStorage.getItem('w2b_lang') || window.currentLang || 'fr');
    }

    // Smooth-scroll to anchor if present
    if (hash) {
      setTimeout(function() {
        var el = page.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  /**
   * Global click interceptor (capture phase = fires before other handlers).
   * Handles both page navigation and in-page anchor scrolling.
   */
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a');
    if (!a) return;

    var href = a.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;

    href = href.replace(/^\.?\//, ''); // strip leading ./ or /

    var parts = href.split('#');
    var path  = parts[0];
    var hash  = parts[1] ? '#' + parts[1] : '';
    var pid   = ROUTES[path];

    if (pid) {
      e.preventDefault();
      e.stopPropagation();
      navigate(pid, hash);
    } else if (!path && hash) {
      // Same-page anchor scroll
      e.preventDefault();
      e.stopPropagation();
      var cur = document.querySelector('.w2b-page[style*="display:block"]') || document.getElementById('pg-index');
      if (cur) {
        var el = cur.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, true);

  // ==================================================
  // 3. NAVIGATION — scroll effects, language switcher
  // ==================================================

  /** Highlight nav border on scroll (index page only) */
  window.addEventListener('scroll', function() {
    var navEl = document.querySelector('#pg-index nav');
    if (navEl) {
      navEl.style.borderBottomColor = window.scrollY > 50
        ? 'rgba(212,175,55,0.15)'
        : 'rgba(255,255,255,0.05)';
    }
  });

  /** Language switcher — updates data-fr / data-en attributes site-wide */
  window.currentLang = 'fr';
  window.setLang = function(lang) {
    window.currentLang = lang;
    localStorage.setItem('w2b_lang', lang);

    var indexPage = document.getElementById('pg-index') || document;

    // Update active button state
    indexPage.querySelectorAll('.lang-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.textContent.trim() === lang.toUpperCase());
    });

    document.documentElement.lang = lang;

    // Swap translatable text
    indexPage.querySelectorAll('[data-fr]').forEach(function(el) {
      var text = el.getAttribute('data-' + lang);
      if (text) el.innerHTML = text;
    });

    // Update page title
    document.title = lang === 'fr'
      ? 'World2Blinded — Agence de Marketing Premium'
      : 'World2Blinded — Premium Marketing Agency';

    // Swap "3 ans" / "3 yrs" in stats
    indexPage.querySelectorAll('.stat-num').forEach(function(el) {
      if (el.textContent.trim() === '3 ans' && lang === 'en') el.textContent = '3 yrs';
      if (el.textContent.trim() === '3 yrs' && lang === 'fr') el.textContent = '3 ans';
    });
  };

  // Restore persisted language on page load
  (function() {
    var saved = localStorage.getItem('w2b_lang') || 'fr';
    window.currentLang = saved;
    window.setLang(saved);
  })();

  // Fade-in on scroll (IntersectionObserver)
  (function() {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(function(el) { obs.observe(el); });
  })();

  // ==================================================
  // 4. LOCALSTORAGE DB — data layer & seeding
  // ==================================================

  /** Simple localStorage key-value store with JSON serialization */
  const DB = {
    get: function(k) { return JSON.parse(localStorage.getItem('w2b_' + k) || 'null'); },
    set: function(k, v) { localStorage.setItem('w2b_' + k, JSON.stringify(v)); }
  };

  /** Seed default data on first run */
  function initDB() {
    if (!DB.get('users')) {
      DB.set('users', [{
        id: 'admin',
        name: 'World2Blinded',
        email: 'admin@world2blinded.com',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString()
      }]);
    }
    if (!DB.get('appointments')) DB.set('appointments', []);
    if (!DB.get('messages'))     DB.set('messages', []);
  }
  initDB();

  // ==================================================
  // 5. AUTH — login, register, Google SSO, logout
  // ==================================================

  let CU = DB.get('session'); // currently logged-in user
  let selRole = 'client';     // selected role in register form

  /** Toggle role selection in register form */
  function selectRole(r) {
    selRole = r;
    document.getElementById('roleClientBtn').classList.toggle('active', r === 'client');
    document.getElementById('roleWorkerBtn').classList.toggle('active', r === 'worker');
  }

  /** Switch between login and register views */
  function switchToRegister() {
    document.getElementById('loginSection').style.display    = 'none';
    document.getElementById('registerSection').style.display = 'block';
    document.getElementById('authDesc').textContent = 'Créez votre compte';
    clearErr();
  }
  function switchToLogin() {
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('loginSection').style.display    = 'block';
    document.getElementById('authDesc').textContent = 'Connectez-vous à votre espace client';
    clearErr();
  }

  function clearErr() { document.getElementById('authError').style.display = 'none'; }
  function showErr(m) {
    var e = document.getElementById('authError');
    e.textContent = m;
    e.style.display = 'block';
  }

  /** EmailJS helper — sends transactional emails */
  function sendEmail(templateParams) {
    emailjs.send('service_qam1ize', 'template_omzbw2t', templateParams)
      .catch(function(err) { console.warn('EmailJS error:', err); });
  }

  /** Google OAuth callback — called by GSI SDK */
  function handleGoogleLogin(response) {
    try {
      var base64  = response.credential.split('.')[1];
      var decoded = JSON.parse(atob(base64));
      var name     = decoded.name || decoded.given_name || 'Utilisateur';
      var email    = decoded.email;
      var googleId = decoded.sub;

      var users = DB.get('users') || [];
      var user  = users.find(function(u) { return u.email === email; });

      if (!user) {
        user = { id: 'g_' + googleId, name: name, email: email, password: null, role: 'client', googleId: googleId, createdAt: new Date().toISOString() };
        users.push(user);
        DB.set('users', users);
        sendEmail({ to_name: name, to_email: email, subject: 'Bienvenue chez World2Blinded !', message: 'Bonjour ' + name + ',\n\nVotre compte World2Blinded a été créé avec succès via Google. Bienvenue dans notre communauté premium !\n\nVous pouvez dès maintenant prendre un rendez-vous avec notre équipe.\n\nÀ bientôt,\nL\'équipe World2Blinded', from_name: 'World2Blinded' });
      }

      DB.set('session', user);
      CU = user;
      loadDash();
    } catch (e) {
      showErr('Erreur de connexion Google. Réessayez.');
      console.error('Google login error:', e);
    }
  }

  /** Email/password login */
  function handleLogin() {
    var email = document.getElementById('loginEmail').value.trim();
    var pw    = document.getElementById('loginPassword').value;
    if (!email || !pw) { showErr('Veuillez remplir tous les champs.'); return; }
    var u = (DB.get('users') || []).find(function(u) { return u.email === email && u.password === pw; });
    if (!u) { showErr('Email ou mot de passe incorrect.'); return; }
    DB.set('session', u); CU = u; loadDash();
  }

  /** Account creation */
  function handleRegister() {
    var name  = document.getElementById('regName').value.trim();
    var email = document.getElementById('regEmail').value.trim();
    var pw    = document.getElementById('regPassword').value;
    if (!name || !email || !pw) { showErr('Veuillez remplir tous les champs.'); return; }
    if (pw.length < 6) { showErr('Mot de passe trop court (min. 6 caractères).'); return; }
    var users = DB.get('users') || [];
    if (users.find(function(u) { return u.email === email; })) { showErr('Cet email est déjà utilisé.'); return; }
    var u = { id: 'u_' + Date.now(), name: name, email: email, password: pw, role: selRole, createdAt: new Date().toISOString() };
    users.push(u); DB.set('users', users); DB.set('session', u); CU = u;
    sendEmail({ to_name: name, to_email: email, subject: 'Bienvenue chez World2Blinded !', message: 'Bonjour ' + name + ',\n\nVotre compte World2Blinded a été créé avec succès. Bienvenue dans notre communauté premium !\n\nVous pouvez dès maintenant prendre un rendez-vous avec notre équipe.\n\nÀ bientôt,\nL\'équipe World2Blinded', from_name: 'World2Blinded' });
    loadDash();
  }

  /** Logout — clears session and returns to auth screen */
  function handleLogout() {
    DB.set('session', null);
    CU = null;
    document.getElementById('dashPage').style.display  = 'none';
    document.getElementById('authPage').style.display  = 'flex';
  }

  /** Submit forms on Enter key press */
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter') return;
    if (document.getElementById('authPage').style.display !== 'none') {
      if (document.getElementById('loginSection').style.display !== 'none') handleLogin();
      else handleRegister();
    }
  });

  // ==================================================
  // 6. DASHBOARD — layout, sidebar, panel routing
  // ==================================================

  /** Boot dashboard: show correct page, set user info, build sidebar */
  function loadDash() {
    document.getElementById('authPage').style.display = 'none';
    document.getElementById('dashPage').style.display = 'block';
    document.getElementById('navName').textContent    = CU.name;
    document.getElementById('welcomeName').textContent = CU.name.split(' ')[0];
    var rb = document.getElementById('navRoleBadge');
    rb.textContent = CU.role === 'admin' ? 'Admin' : 'Client';
    rb.className   = 'badge ' + (CU.role === 'admin' ? 'badge-admin' : 'badge-client');
    buildSidebar();
    showPanel(CU.role === 'admin' ? 'adminOverview' : 'overview');
  }

  /** Build the sidebar navigation based on user role */
  function buildSidebar() {
    var isAdmin = CU.role === 'admin';
    var items = isAdmin
      ? [
          { id: 'adminOverview', icon: '📊', label: "Vue d'ensemble" },
          { id: 'adminAppts',    icon: '📅', label: 'Rendez-vous' },
          { id: 'adminMessages', icon: '✉️', label: 'Messages', badge: true },
          { id: 'adminClients',  icon: '👥', label: 'Clients' }
        ]
      : [
          { id: 'overview',  icon: '🏠',  label: 'Accueil' },
          { id: 'projets',   icon: '📁',  label: 'Mes Projets' },
          { id: 'livrables', icon: '📦',  label: 'Mes Livrables' },
          { id: 'forfait',   icon: '⭐',  label: 'Mon Forfait' },
          { id: 'book',      icon: '📅',  label: 'Prendre RDV' },
          { id: 'myAppts',   icon: '🗓️', label: 'Mes rendez-vous' },
          { id: 'contact',   icon: '✉️',  label: 'Contact' }
        ];

    document.getElementById('dashSidebar').innerHTML = items.map(function(it) {
      var bdg = '';
      if (it.badge) {
        var n = (DB.get('messages') || []).filter(function(m) { return m.status === 'unread'; }).length;
        if (n > 0) bdg = '<span class="sidebar-unread">' + n + '</span>';
      }
      return '<div class="sidebar-nav-item" id="nav-' + it.id + '" onclick="showPanel(\'' + it.id + '\')">'
           + '<span class="nav-icon">' + it.icon + '</span><span>' + it.label + '</span>' + bdg + '</div>';
    }).join('');
  }

  /** Activate a dashboard panel and call its render function */
  function showPanel(id) {
    document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
    document.querySelectorAll('.sidebar-nav-item').forEach(function(n) { n.classList.remove('active'); });
    var panel = document.getElementById('panel-' + id);
    var nav   = document.getElementById('nav-' + id);
    if (panel) panel.classList.add('active');
    if (nav)   nav.classList.add('active');
    var renderers = {
      overview:       renderClientOverview,
      myAppts:        renderClientAppts,
      contact:        renderContactPanel,
      adminOverview:  renderAdminOverview,
      adminAppts:     renderAdminAppts,
      adminMessages:  renderAdminMsgs,
      adminClients:   renderAdminClients,
      book:           initBooking,
      projets:        renderProjets,
      livrables:      renderLivrables,
      forfait:        renderForfait
    };
    if (renderers[id]) renderers[id]();
  }

  // ── Helpers ──

  /** Returns a badge HTML string for a given status key */
  function bdg(s) {
    var map = { pending: 'badge-pending', confirmed: 'badge-confirmed', completed: 'badge-completed', cancelled: 'badge-cancelled', unread: 'badge-unread', read: 'badge-read', replied: 'badge-replied' };
    var lbl = { pending: 'En attente', confirmed: 'Confirmé', completed: 'Terminé', cancelled: 'Annulé', unread: 'Non lu', read: 'Lu', replied: 'Répondu' };
    return '<span class="badge ' + (map[s] || '') + '">' + (lbl[s] || s) + '</span>';
  }

  /** Formats an ISO date string to French locale (DD/MM/YYYY) */
  function fmt(d) {
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  /** Returns the display name for a service ID */
  function svcName(id) {
    var s = SERVICES.find(function(s) { return s.id === id; });
    return s ? s.name : id;
  }

  // ── Toast notifications ──

  var toastTimer;
  function notify(m) {
    var el = document.getElementById('toast');
    el.textContent = m;
    el.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() { el.style.display = 'none'; }, 3200);
  }

  // ── Client: Overview ──

  function renderClientOverview() {
    var appts = (DB.get('appointments') || []).filter(function(a) { return a.clientId === CU.id; });
    var msgs  = (DB.get('messages')     || []).filter(function(m) { return m.clientId === CU.id; });
    document.getElementById('clientStatsGrid').innerHTML =
      '<div class="stat-card"><div class="stat-icon">📅</div><div class="stat-num">' + appts.length + '</div><div class="stat-lbl">Rendez-vous</div></div>' +
      '<div class="stat-card"><div class="stat-icon">✅</div><div class="stat-num">' + appts.filter(function(a) { return a.status === 'confirmed'; }).length + '</div><div class="stat-lbl">Confirmés</div></div>' +
      '<div class="stat-card"><div class="stat-icon">✉️</div><div class="stat-num">' + msgs.length + '</div><div class="stat-lbl">Messages</div></div>';
    var up = appts.filter(function(a) { return a.status === 'pending' || a.status === 'confirmed'; }).slice(0, 3);
    document.getElementById('upcomingAppts').innerHTML = up.length
      ? up.map(function(a) { return '<div class="appt-card"><div class="appt-top"><div><div style="font-weight:600;">' + svcName(a.service) + '</div></div>' + bdg(a.status) + '</div><div class="appt-meta"><span>📅 ' + a.date + '</span><span>🕐 ' + a.time + '</span></div></div>'; }).join('')
      : '<div class="empty"><div class="empty-icon">📅</div><p>Aucun rendez-vous à venir. <a onclick="showPanel(\'book\')" style="color:var(--gold);cursor:pointer;">Prendre un RDV</a></p></div>';
  }

  // ==================================================
  // 7. BOOKING FLOW — calendar, time slots, confirmation
  // ==================================================

  // ── Client: Booking wizard ──

  let bk = { workerId: null, service: null, date: null, time: null };

  function initBooking() {
    bk = { workerId: null, service: null, date: null, time: null };
    renderSteps(1);
    [1, 2, 3].forEach(function(i) {
      document.getElementById('bookStep' + i).style.display = i === 1 ? 'block' : 'none';
    });
    document.getElementById('workerList').innerHTML = (DB.get('users') || [])
      .filter(function(u) { return u.role === 'admin' || u.role === 'worker'; })
      .map(function(w) {
        return '<div class="worker-btn" id="wb-' + w.id + '" onclick="selWorker(\'' + w.id + '\')">'
             + '<div class="worker-avatar">👤</div>'
             + '<div style="flex:1;text-align:left;"><div style="font-weight:600;font-size:0.88rem;">' + w.name + '</div>'
             + '<div style="font-size:0.75rem;color:var(--muted);">Expert Marketing & Stratégie</div></div>'
             + '<span style="color:var(--muted);">→</span></div>';
      }).join('');
    document.getElementById('serviceGrid').innerHTML = SERVICES
      .map(function(s) { return '<button class="service-tag" id="st-' + s.id + '" onclick="selService(\'' + s.id + '\')">' + s.name + '</button>'; })
      .join('');
    document.getElementById('step1Btn').disabled = true;
    document.getElementById('slotsSection').style.display = 'none';
  }

  function renderSteps(active) {
    var row = document.getElementById('stepsRow');
    if (!row) return;
    row.innerHTML = [1, 2, 3].map(function(n, i) {
      return (i > 0 ? '<div class="step-line ' + (active > n - 1 ? 'step-line-done' : '') + '"></div>' : '')
           + '<div class="step-num ' + (active > n ? 'step-done' : active === n ? 'step-active' : 'step-off') + '">' + n + '</div>';
    }).join('');
  }

  function selWorker(id) {
    bk.workerId = id;
    document.querySelectorAll('.worker-btn').forEach(function(b) { b.classList.remove('sel'); });
    var btn = document.getElementById('wb-' + id);
    if (btn) btn.classList.add('sel');
    checkS1();
  }

  function selService(id) {
    bk.service = id;
    document.querySelectorAll('.service-tag').forEach(function(b) { b.classList.remove('sel'); });
    var btn = document.getElementById('st-' + id);
    if (btn) btn.classList.add('sel');
    checkS1();
  }

  function checkS1() {
    document.getElementById('step1Btn').disabled = !(bk.workerId && bk.service);
  }

  function goStep(n) {
    [1, 2, 3].forEach(function(i) {
      document.getElementById('bookStep' + i).style.display = i === n ? 'block' : 'none';
    });
    renderSteps(n);
    if (n === 2) {
      bk.date = null; bk.time = null;
      document.getElementById('slotsSection').style.display = 'none';
      document.getElementById('step2Btn').disabled = true;
      initCal();
    }
    if (n === 3) renderSummary();
  }

  function renderSummary() {
    var w = (DB.get('users') || []).find(function(u) { return u.id === bk.workerId; });
    document.getElementById('bookSummary').innerHTML =
      '<div class="summary-row"><span class="key">Expert</span><span>' + (w ? w.name : '—') + '</span></div>' +
      '<div class="summary-row"><span class="key">Service</span><span>' + svcName(bk.service) + '</span></div>' +
      '<div class="summary-row"><span class="key">Date</span><span>' + bk.date + '</span></div>' +
      '<div class="summary-row"><span class="key">Heure</span><span>' + bk.time + '</span></div>';
  }

  function confirmBooking() {
    var notes = document.getElementById('bookNotes').value;
    var appts = DB.get('appointments') || [];
    var w     = (DB.get('users') || []).find(function(u) { return u.id === bk.workerId; });
    appts.push({
      id: 'a_' + Date.now(), clientId: CU.id, clientName: CU.name, clientEmail: CU.email,
      workerId: bk.workerId, workerName: w ? w.name : 'Expert',
      service: bk.service, date: bk.date, time: bk.time, notes: notes,
      status: 'pending', createdAt: new Date().toISOString()
    });
    DB.set('appointments', appts);
    document.getElementById('bookNotes').value = '';
    sendEmail({ to_name: CU.name, to_email: CU.email, subject: 'Confirmation de votre rendez-vous — World2Blinded', message: 'Bonjour ' + CU.name + ',\n\nVotre rendez-vous a bien été reçu et est en attente de confirmation.\n\n📅 Date : ' + bk.date + '\n🕐 Heure : ' + bk.time + '\n🛠 Service : ' + svcName(bk.service) + '\n\nNous vous confirmons votre rendez-vous dans les plus brefs délais.\n\nÀ bientôt,\nL\'équipe World2Blinded', from_name: 'World2Blinded' });
    notify('✅ Rendez-vous réservé avec succès !');
    showPanel('myAppts');
  }

  // ── Calendar ──

  let calYear, calMonth;

  function initCal() {
    var now = new Date();
    calYear  = now.getFullYear();
    calMonth = now.getMonth();
    renderCal();
  }

  function calPrev() { calMonth--; if (calMonth < 0)  { calMonth = 11; calYear--; } renderCal(); }
  function calNext() { calMonth++; if (calMonth > 11) { calMonth = 0;  calYear++; } renderCal(); }

  function renderCal() {
    var months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    document.getElementById('calMonthLabel').textContent = months[calMonth] + ' ' + calYear;
    var grid  = document.getElementById('calGrid');
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var firstDay    = new Date(calYear, calMonth, 1);
    var startOffset = firstDay.getDay() - 1; if (startOffset < 0) startOffset = 6;
    var daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    var html = '';
    for (var i = 0; i < startOffset; i++) html += '<div class="cal-day cal-empty"></div>';
    for (var d = 1; d <= daysInMonth; d++) {
      var date     = new Date(calYear, calMonth, d);
      var dow      = date.getDay();
      var isWeekend= dow === 0 || dow === 6;
      var isPast   = date < today;
      var ymd      = calYear + '-' + String(calMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      var isToday  = date.getTime() === today.getTime();
      var isSel    = bk.date === ymd;
      var cls = 'cal-day';
      if (isWeekend || isPast) cls += ' cal-weekend cal-disabled';
      else if (isSel)  cls += ' cal-selected';
      else if (isToday) cls += ' cal-today';
      html += '<div class="' + cls + '" ' + (!isWeekend && !isPast ? 'onclick="selectCalDay(\'' + ymd + '\')"' : '') + '>' + d + '</div>';
    }
    grid.innerHTML = html;
  }

  function selectCalDay(ymd) {
    bk.date = ymd; bk.time = null;
    renderCal();
    var parts  = ymd.split('-');
    var months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
    document.getElementById('selectedDateLabel').textContent = parts[2] + ' ' + months[parseInt(parts[1]) - 1] + ' ' + parts[0];
    document.getElementById('slotsSection').style.display = 'block';
    document.getElementById('step2Btn').disabled = true;
    renderSlots();
  }

  function renderSlots() {
    var booked = (DB.get('appointments') || [])
      .filter(function(a) { return a.date === bk.date && a.workerId === bk.workerId && a.status !== 'cancelled'; })
      .map(function(a) { return a.time; });
    document.getElementById('slotsGrid').innerHTML = SLOTS.map(function(t) {
      var isBooked = booked.indexOf(t) !== -1;
      var isSel    = bk.time === t;
      return '<button class="slot-btn' + (isBooked ? ' ' : isSel ? ' sel' : '') + '" '
           + (isBooked ? 'disabled' : '') + ' onclick="selSlot(\'' + t + '\')">' + t + '</button>';
    }).join('');
  }

  function selSlot(t) {
    bk.time = t;
    renderSlots();
    document.getElementById('step2Btn').disabled = false;
  }

  // ── Client: My appointments ──

  function renderClientAppts() {
    var appts = (DB.get('appointments') || []).filter(function(a) { return a.clientId === CU.id; }).reverse();
    var el    = document.getElementById('clientApptsList');
    if (!appts.length) { el.innerHTML = '<div class="empty"><div class="empty-icon">📅</div><p>Aucun rendez-vous pour l\'instant.</p></div>'; return; }
    el.innerHTML = appts.map(function(a) {
      return '<div class="appt-card">'
           + '<div class="appt-top"><div><div style="font-weight:600;">' + svcName(a.service) + '</div><div style="font-size:0.75rem;color:var(--muted);">avec ' + (a.workerName || 'Expert W2B') + '</div></div>' + bdg(a.status) + '</div>'
           + '<div class="appt-meta"><span>📅 ' + a.date + '</span><span>🕐 ' + a.time + '</span></div>'
           + (a.notes ? '<p style="font-size:0.82rem;color:var(--muted);background:rgba(255,255,255,0.025);padding:0.7rem;margin-bottom:0.7rem;">' + a.notes + '</p>' : '')
           + '<div class="appt-actions">' + (a.status === 'pending' ? '<button class="btn-secondary btn-sm btn-refuse" onclick="cancelAppt(\'' + a.id + '\')">Annuler</button>' : '') + '</div></div>';
    }).join('');
  }

  function cancelAppt(id) {
    var a = DB.get('appointments') || [];
    var i = a.findIndex(function(x) { return x.id === id; });
    if (i >= 0) { a[i].status = 'cancelled'; DB.set('appointments', a); }
    renderClientAppts();
    notify('Rendez-vous annulé.');
  }

  // ── Client: Messages ──

  function renderContactPanel() { renderClientMsgs(); }

  function sendMessage() {
    var sub  = document.getElementById('msgSubject').value.trim();
    var body = document.getElementById('msgBody').value.trim();
    if (!sub || !body) { notify('⚠️ Veuillez remplir tous les champs.'); return; }
    var msgs = DB.get('messages') || [];
    msgs.push({ id: 'm_' + Date.now(), clientId: CU.id, clientName: CU.name, clientEmail: CU.email, subject: sub, body: body, status: 'unread', createdAt: new Date().toISOString() });
    DB.set('messages', msgs);
    sendEmail({ to_name: 'World2Blinded', to_email: 'world2blinded@gmail.com', subject: '📩 Nouveau message client — ' + sub, message: 'Nouveau message de ' + CU.name + ' (' + CU.email + ') :\n\nSujet : ' + sub + '\n\n' + body, from_name: CU.name, reply_to: CU.email });
    document.getElementById('msgSubject').value = '';
    document.getElementById('msgBody').value    = '';
    notify('✅ Message envoyé !');
    renderClientMsgs();
    buildSidebar();
  }

  function renderClientMsgs() {
    var msgs = (DB.get('messages') || []).filter(function(m) { return m.clientId === CU.id; }).reverse();
    var el   = document.getElementById('clientMsgList');
    if (!msgs.length) { el.innerHTML = '<div class="empty"><div class="empty-icon">✉️</div><p>Aucun message envoyé.</p></div>'; return; }
    el.innerHTML = msgs.map(function(m) {
      return '<div class="msg-item ' + (m.status === 'unread' ? 'unread' : '') + '">'
           + '<div class="msg-top"><div class="msg-subject">' + m.subject + '</div>' + bdg(m.status) + '</div>'
           + '<div class="msg-body">' + m.body + '</div><div class="msg-date">' + fmt(m.createdAt) + '</div></div>';
    }).join('');
  }

  // ==================================================
  // 8. CLIENT VIEWS — overview, appointments, messages,
  //    projects, deliverables, pricing
  // ==================================================

  // ── Client: Projects ──

  function renderProjets() {
    var SVC = {
      copywriting: { icon: '✍️', name: 'Copywriting',          steps: ['Brief client', 'Recherche & analyse', 'Rédaction', 'Révisions', 'Livraison finale'] },
      strategie:   { icon: '📊', name: 'Stratégie de Contenu', steps: ['Audit de contenu', 'Analyse concurrentielle', 'Élaboration du plan', 'Création du calendrier', 'Mise en place & suivi'] },
      siteweb:     { icon: '🌐', name: 'Création de Site Web', steps: ['Wireframes', 'Design UI', 'Développement', 'Tests & QA', 'Mise en ligne'] },
      reseaux:     { icon: '📱', name: 'Réseaux Sociaux',      steps: ['Audit des comptes', 'Stratégie éditoriale', 'Création des visuels', 'Publication', 'Analyse des résultats'] }
    };
    var appts = (DB.get('appointments') || []).filter(function(a) { return a.clientId === CU.id && a.status === 'confirmed'; });
    var el    = document.getElementById('projetsGrid');
    if (!appts.length) {
      el.innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty-icon">📁</div><p>Aucun projet actif. <a onclick="showPanel(\'book\')" style="color:var(--gold);cursor:pointer;">Démarrer un projet →</a></p></div>';
      return;
    }
    el.innerHTML = appts.map(function(a) {
      var svc      = SVC[a.service] || { icon: '📋', name: a.service, steps: ['En cours'] };
      var progress = Math.min(Math.floor((Date.now() - new Date(a.date).getTime()) / (1000 * 60 * 60 * 24 * 3)) + 1, svc.steps.length - 1);
      var pct      = Math.round((progress / svc.steps.length) * 100);
      return '<div class="card" style="border-left:3px solid var(--gold);">'
           + '<div style="display:flex;align-items:center;gap:0.8rem;margin-bottom:1.2rem;"><span style="font-size:1.8rem;">' + svc.icon + '</span>'
           + '<div><div style="font-weight:700;font-size:1rem;">' + svc.name + '</div><div style="font-size:0.75rem;color:var(--muted);">Démarré le ' + fmt(a.date) + '</div></div></div>'
           + '<div style="margin-bottom:1rem;"><div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--muted);margin-bottom:0.4rem;"><span>Progression</span><span style="color:var(--gold);font-weight:600;">' + pct + '%</span></div>'
           + '<div style="height:4px;background:rgba(255,255,255,0.07);border-radius:2px;"><div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--gold-dark),var(--gold));border-radius:2px;"></div></div></div>'
           + '<div style="display:flex;flex-direction:column;gap:0.5rem;">'
           + svc.steps.map(function(s, i) {
               var col = i < progress ? 'color:var(--gold);' : i === progress ? 'color:var(--fg);font-weight:600;' : 'color:var(--muted);opacity:0.5;';
               var ic  = i < progress ? '✅' : i === progress ? '⏳' : '○';
               return '<div style="display:flex;align-items:center;gap:0.6rem;font-size:0.82rem;' + col + '"><span>' + ic + '</span>' + s + '</div>';
             }).join('')
           + '</div></div>';
    }).join('');
  }

  // ── Client: Deliverables ──

  function renderLivrables() {
    var ICONS = { copywriting: '✍️', strategie: '📊', siteweb: '🌐', reseaux: '📱' };
    var appts = (DB.get('appointments') || []).filter(function(a) { return a.clientId === CU.id && a.status === 'completed'; });
    var el    = document.getElementById('livrablesGrid');
    if (!appts.length) {
      el.innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty-icon">📦</div><p>Vos livrables apparaîtront ici une fois votre projet terminé.</p></div>';
      return;
    }
    el.innerHTML = appts.map(function(a) {
      return '<div class="card" style="display:flex;align-items:center;gap:1rem;">'
           + '<div style="width:48px;height:48px;border:1px solid rgba(212,175,55,0.3);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;">' + (ICONS[a.service] || '📄') + '</div>'
           + '<div style="flex:1;"><div style="font-weight:600;font-size:0.9rem;">' + svcName(a.service) + '</div><div style="font-size:0.75rem;color:var(--muted);">Livré le ' + fmt(a.date) + '</div></div>'
           + '<button class="btn-secondary" style="padding:0.5rem 1rem;font-size:0.65rem;" onclick="alert(\'Contactez-nous pour recevoir vos fichiers.\')">↓ TÉLÉCHARGER</button></div>';
    }).join('');
  }

  // ── Client: Pricing plans ──

  function renderForfait() {
    var F = {
      copywriting:      [{ n: 'Starter', p: '497$/mois',  f: ['3 pages de vente', '5 emails marketing', '2 révisions incluses'] }, { n: 'Pro', p: '997$/mois',  f: ['10 pages de vente', '15 emails marketing', 'Scripts vidéo', 'Révisions illimitées'] }, { n: 'Elite', p: '1997$/mois', f: ['Projets illimités', 'Stratégie complète', 'Manager dédié', 'Priorité absolue'] }],
      'content-strategy':[{ n: 'Starter', p: '397$/mois',  f: ['Audit de contenu', 'Calendrier 30 jours', '2 révisions'] }, { n: 'Pro', p: '797$/mois',  f: ['Stratégie 90 jours', 'SEO avancé', 'Reporting mensuel', 'Révisions illimitées'] }, { n: 'Elite', p: '1497$/mois', f: ['Stratégie annuelle', 'Équipe dédiée', 'Analytics avancés', 'Support prioritaire'] }],
      'web-design':      [{ n: 'Starter', p: '1497$',      f: ['Site 5 pages', 'Design sur mesure', 'Responsive', '1 an hébergement'] }, { n: 'Pro', p: '2997$',      f: ['Site 15 pages', 'E-commerce', 'SEO optimisé', 'Support 6 mois'] }, { n: 'Elite', p: '5997$',      f: ['Site illimité', 'Fonctions custom', 'Intégrations API', 'Support 1 an'] }],
      'social-media':    [{ n: 'Starter', p: '297$/mois',  f: ['2 réseaux', '12 posts/mois', 'Visuels inclus'] }, { n: 'Pro', p: '597$/mois',  f: ['4 réseaux', '30 posts/mois', 'Stories & Reels', 'Reporting hebdo'] }, { n: 'Elite', p: '997$/mois',  f: ['Réseaux illimités', 'Contenu illimité', 'Gestion communauté', 'Manager dédié'] }]
    };
    var appts   = (DB.get('appointments') || []).filter(function(a) { return a.clientId === CU.id; });
    var lastSvc = appts.length ? appts[appts.length - 1].service : null;
    var el      = document.getElementById('forfaitContent');
    if (!lastSvc || !F[lastSvc]) {
      el.innerHTML = '<div class="empty"><div class="empty-icon">⭐</div><p>Prenez un rendez-vous pour découvrir nos forfaits.</p></div>';
      return;
    }
    el.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.2rem;">'
      + F[lastSvc].map(function(f, i) {
          return '<div class="card" style="text-align:center;border:1px solid ' + (i === 1 ? 'var(--gold)' : 'rgba(212,175,55,0.1)') + ';position:relative;">'
               + (i === 1 ? '<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--gold);color:#050505;font-size:0.62rem;font-weight:700;letter-spacing:0.1em;padding:0.25rem 0.8rem;">POPULAIRE</div>' : '')
               + '<div style="font-family:\'Playfair Display\',serif;font-size:1.1rem;font-weight:700;margin-bottom:0.3rem;">' + f.n + '</div>'
               + '<div style="font-size:1.4rem;font-weight:800;color:var(--gold);margin-bottom:1rem;">' + f.p + '</div>'
               + '<ul style="list-style:none;text-align:left;font-size:0.82rem;color:var(--muted);display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.2rem;">'
               + f.f.map(function(ft) { return '<li>✓ ' + ft + '</li>'; }).join('') + '</ul>'
               + '<button class="btn-' + (i === 1 ? 'primary' : 'secondary') + ' btn-full" style="font-size:0.65rem;" onclick="showPanel(\'book\')">CHOISIR →</button></div>';
        }).join('') + '</div>';
  }

  // ==================================================
  // 9. ADMIN VIEWS — overview, appointments, messages,
  //    clients table
  // ==================================================

  // ── Admin: Overview ──

  function renderAdminOverview() {
    var appts   = DB.get('appointments') || [];
    var msgs    = DB.get('messages')     || [];
    var clients = (DB.get('users') || []).filter(function(u) { return u.role === 'client' || u.role === 'worker'; });
    document.getElementById('adminStatsGrid').innerHTML =
      '<div class="stat-card"><div class="stat-icon">👥</div><div class="stat-num">' + clients.length + '</div><div class="stat-lbl">Clients</div></div>' +
      '<div class="stat-card"><div class="stat-icon">📅</div><div class="stat-num">' + appts.filter(function(a) { return a.status === 'pending'; }).length + '</div><div class="stat-lbl">RDV en attente</div></div>' +
      '<div class="stat-card"><div class="stat-icon">✅</div><div class="stat-num">' + appts.filter(function(a) { return a.status === 'confirmed'; }).length + '</div><div class="stat-lbl">RDV confirmés</div></div>' +
      '<div class="stat-card"><div class="stat-icon">✉️</div><div class="stat-num">' + msgs.filter(function(m) { return m.status === 'unread'; }).length + '</div><div class="stat-lbl">Non lus</div></div>';
    var ra = [...appts].reverse().slice(0, 3);
    document.getElementById('adminRecentAppts').innerHTML = ra.length
      ? ra.map(function(a) { return '<div class="appt-card"><div class="appt-top"><div><strong>' + a.clientName + '</strong><div style="font-size:0.75rem;color:var(--muted);">' + svcName(a.service) + '</div></div>' + bdg(a.status) + '</div><div class="appt-meta"><span>📅 ' + a.date + '</span><span>🕐 ' + a.time + '</span></div></div>'; }).join('')
      : '<div class="empty"><div class="empty-icon">📅</div><p>Aucun rendez-vous.</p></div>';
    var rm = [...msgs].reverse().slice(0, 3);
    document.getElementById('adminRecentMsgs').innerHTML = rm.length
      ? rm.map(function(m) { return '<div class="msg-item ' + (m.status === 'unread' ? 'unread' : '') + '"><div class="msg-top"><div class="msg-sender">' + m.clientName + '</div>' + bdg(m.status) + '</div><div class="msg-subject">' + m.subject + '</div><div class="msg-body">' + m.body.substring(0, 80) + (m.body.length > 80 ? '...' : '') + '</div></div>'; }).join('')
      : '<div class="empty"><div class="empty-icon">✉️</div><p>Aucun message.</p></div>';
  }

  // ── Admin: Appointments ──

  function renderAdminAppts() {
    var appts = (DB.get('appointments') || []).reverse();
    var el    = document.getElementById('adminApptsList');
    if (!appts.length) { el.innerHTML = '<div class="empty"><div class="empty-icon">📅</div><p>Aucun rendez-vous.</p></div>'; return; }
    el.innerHTML = appts.map(function(a) {
      return '<div class="appt-card">'
           + '<div class="appt-top"><div><div style="font-weight:600;">' + a.clientName + '</div><div style="font-size:0.75rem;color:var(--muted);">' + a.clientEmail + '</div></div>' + bdg(a.status) + '</div>'
           + '<div class="appt-meta"><span>🛠 ' + svcName(a.service) + '</span><span>📅 ' + a.date + '</span><span>🕐 ' + a.time + '</span></div>'
           + (a.notes ? '<p style="font-size:0.82rem;color:var(--muted);background:rgba(255,255,255,0.025);padding:0.7rem;margin-bottom:0.75rem;">' + a.notes + '</p>' : '')
           + '<div class="appt-actions">'
           + (a.status === 'pending'   ? '<button class="btn-primary btn-sm btn-confirm"  onclick="adminSetAppt(\'' + a.id + '\',\'confirmed\')">✓ Confirmer</button><button class="btn-primary btn-sm btn-refuse" onclick="adminSetAppt(\'' + a.id + '\',\'cancelled\')">✗ Refuser</button>' : '')
           + (a.status === 'confirmed' ? '<button class="btn-primary btn-sm btn-complete" onclick="adminSetAppt(\'' + a.id + '\',\'completed\')">✓ Terminé</button>' : '')
           + '</div></div>';
    }).join('');
  }

  function adminSetAppt(id, status) {
    var a = DB.get('appointments') || [];
    var i = a.findIndex(function(x) { return x.id === id; });
    if (i >= 0) {
      a[i].status = status;
      DB.set('appointments', a);
      var appt = a[i];
      if (status === 'confirmed') {
        sendEmail({ to_name: appt.clientName, to_email: appt.clientEmail, subject: 'Votre rendez-vous est confirmé — World2Blinded', message: 'Bonjour ' + appt.clientName + ',\n\n✅ Votre rendez-vous a été confirmé !\n\n📅 Date : ' + appt.date + '\n🕐 Heure : ' + appt.time + '\n🛠 Service : ' + svcName(appt.service) + '\n\nNous avons hâte de travailler avec vous !\n\nÀ bientôt,\nL\'équipe World2Blinded', from_name: 'World2Blinded' });
      } else if (status === 'cancelled') {
        sendEmail({ to_name: appt.clientName, to_email: appt.clientEmail, subject: 'Mise à jour de votre rendez-vous — World2Blinded', message: 'Bonjour ' + appt.clientName + ',\n\nNous vous informons que votre rendez-vous du ' + appt.date + ' à ' + appt.time + ' a été annulé.\n\nN\'hésitez pas à reprendre un nouveau rendez-vous sur notre plateforme.\n\nCordialement,\nL\'équipe World2Blinded', from_name: 'World2Blinded' });
      }
    }
    renderAdminAppts();
    renderAdminOverview();
    notify('✅ Statut mis à jour.');
  }

  // ── Admin: Messages ──

  function renderAdminMsgs() {
    var msgs = (DB.get('messages') || []).reverse();
    var el   = document.getElementById('adminMsgList');
    if (!msgs.length) { el.innerHTML = '<div class="empty"><div class="empty-icon">✉️</div><p>Aucun message reçu.</p></div>'; return; }
    el.innerHTML = msgs.map(function(m) {
      return '<div class="msg-item ' + (m.status === 'unread' ? 'unread' : '') + '" onclick="markRead(\'' + m.id + '\')">'
           + '<div class="msg-top"><div><div class="msg-sender">' + m.clientName + '</div><div class="msg-email">' + m.clientEmail + '</div></div>'
           + '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.3rem;">' + bdg(m.status) + '<span class="msg-date">' + fmt(m.createdAt) + '</span></div></div>'
           + '<div class="msg-subject">' + m.subject + '</div>'
           + '<div class="msg-body">' + m.body + '</div></div>';
    }).join('');
  }

  function markRead(id) {
    var msgs = DB.get('messages') || [];
    var i    = msgs.findIndex(function(m) { return m.id === id; });
    if (i >= 0 && msgs[i].status === 'unread') { msgs[i].status = 'read'; DB.set('messages', msgs); }
    renderAdminMsgs();
    buildSidebar();
  }

  // ── Admin: Clients table ──

  function renderAdminClients() {
    var users = (DB.get('users') || []).filter(function(u) { return u.role !== 'admin'; });
    var appts = DB.get('appointments') || [];
    var el    = document.getElementById('adminClientsTable');
    if (!users.length) { el.innerHTML = '<div class="empty"><div class="empty-icon">👥</div><p>Aucun client inscrit.</p></div>'; return; }
    el.innerHTML = '<table>'
      + '<tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Inscrit le</th><th>RDV</th></tr>'
      + users.map(function(u) {
          return '<tr>'
               + '<td><strong>' + u.name + '</strong></td>'
               + '<td style="color:var(--muted);">' + u.email + '</td>'
               + '<td>' + bdg(u.role === 'worker' ? 'confirmed' : 'read') + '</td>'
               + '<td style="color:var(--muted);">' + fmt(u.createdAt) + '</td>'
               + '<td>' + appts.filter(function(a) { return a.clientId === u.id; }).length + '</td>'
               + '</tr>';
        }).join('')
      + '</table>';
  }

  // ==================================================
  // 10. INITIALIZATION
  // ==================================================


  // ── Cursor follower — assurance labels follow mouse inside #hero ──
  (function() {
    var labels = ['✓ Gratuit', '✓ Sans engagement', '✓ Réponse en 24h'];
    var el = document.createElement('div');
    el.className = 'cursor-label';
    document.body.appendChild(el);
    var idx = 0;
    var rotateTimer;
    function rotateLbl() {
      el.textContent = labels[idx % labels.length];
      idx++;
    }
    document.querySelector('#hero') && document.querySelector('#hero').addEventListener('mousemove', function(e) {
      el.style.left = e.clientX + 'px';
      el.style.top  = e.clientY + 'px';
      el.classList.add('visible');
      clearTimeout(rotateTimer);
      rotateTimer = setTimeout(function() { rotateLbl(); }, 1800);
    });
    document.querySelector('#hero') && document.querySelector('#hero').addEventListener('mouseleave', function() {
      el.classList.remove('visible');
    });
    rotateLbl();
  })();

  // Auto-load dashboard if a valid session already exists
  if (CU) loadDash();

  // ── MOD 2 : Animation compteur des chiffres résultats ──
  (function() {
    var animated = false;

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function animateCounter(el) {
      var target   = parseInt(el.getAttribute('data-count'), 10);
      var prefix   = el.getAttribute('data-prefix') || '';
      var suffix   = el.getAttribute('data-suffix') || '';
      var duration = 1800;
      var start    = null;

      // "0 mots inutiles" — pas d'animation nécessaire
      if (target === 0 && prefix === '' && suffix === '') {
        el.textContent = prefix + '0' + suffix;
        return;
      }

      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var val = Math.round(easeOut(progress) * target);
        el.textContent = prefix + val + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = prefix + target + suffix;
      }
      requestAnimationFrame(step);
    }

    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !animated) {
          animated = true;
          document.querySelectorAll('.res-number[data-count]').forEach(animateCounter);
          obs.disconnect();
        }
      });
    }, { threshold: 0.4 });

    var section = document.getElementById('resultats');
    if (section) obs.observe(section);
  })();

