// ── SUPABASE INIT ──
const SUPA = supabase.createClient(
  'https://ziqnansjecjrnqsboapy.supabase.co',
  'sb_publishable_PfqMU3OqbfDuLU8iFLwLiA_iaBTe3Gp'
);

// EmailJS init
(function(){ emailjs.init({ publicKey: "FcUAmlDy_1iSZmOLa" }); })();

const SERVICES = [
  {id:'copywriting',      name:'Copywriting',          features:['Pages de vente','Emails marketing','Scripts vidéo','Landing pages']},
  {id:'content-strategy', name:'Stratégie de Contenu', features:['Audit de contenu','Calendrier éditorial','SEO optimisé','Analytics']},
  {id:'web-design',       name:'Création de Site Web', features:['Design sur mesure','Développement complet','Responsive mobile','SEO optimisé']},
  {id:'social-media',     name:'Réseaux Sociaux',      features:['Posts optimisés','Stories engageantes','Publicités ciblées','Community']},
];
const SLOTS = ['09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00'];

let CU = null;
let selRole = 'client';

// ── AUTH STATE LISTENER ──
SUPA.auth.onAuthStateChange(async function(event, session) {
  if (session && session.user) {
    let { data: profile } = await SUPA.from('profiles').select('*').eq('id', session.user.id).single();
    if (!profile) {
      const newProfile = {
        id: session.user.id,
        name: session.user.user_metadata.full_name || session.user.email.split('@')[0],
        email: session.user.email,
        role: session.user.email === 'admin@world2blinded.com' ? 'admin' : 'client'
      };
      await SUPA.from('profiles').insert(newProfile);
      profile = newProfile;
      sendEmail({ to_name: profile.name, to_email: profile.email, subject: 'Bienvenue chez World2Blinded !', message: 'Bonjour ' + profile.name + ',

Votre compte World2Blinded a été créé avec succès. Bienvenue dans notre communauté premium !

À bientôt,
L'équipe World2Blinded', from_name: 'World2Blinded' });
    }
    CU = profile;
    loadDash();
  } else {
    CU = null;
    document.getElementById('dashPage').style.display = 'none';
    document.getElementById('authPage').style.display = 'flex';
  }
});

function selectRole(r){ selRole=r; document.getElementById('roleClientBtn').classList.toggle('active',r==='client'); document.getElementById('roleWorkerBtn').classList.toggle('active',r==='worker'); }
function switchToRegister(){ document.getElementById('loginSection').style.display='none'; document.getElementById('registerSection').style.display='block'; document.getElementById('authDesc').textContent='Créez votre compte'; clearErr(); }
function switchToLogin(){ document.getElementById('registerSection').style.display='none'; document.getElementById('loginSection').style.display='block'; document.getElementById('authDesc').textContent='Connectez-vous à votre espace client'; clearErr(); }
function clearErr(){ document.getElementById('authError').style.display='none'; }
function showErr(m){ const e=document.getElementById('authError'); e.textContent=m; e.style.display='block'; }

// ── GOOGLE LOGIN ──
async function handleGoogleLogin() {
  const { error } = await SUPA.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } });
  if (error) showErr('Erreur Google : ' + error.message);
}

// ── EMAIL/PASSWORD LOGIN ──
async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pw = document.getElementById('loginPassword').value;
  if (!email || !pw) { showErr('Veuillez remplir tous les champs.'); return; }
  const { error } = await SUPA.auth.signInWithPassword({ email, password: pw });
  if (error) showErr('Email ou mot de passe incorrect.');
}

// ── EMAILJS HELPER ──
function sendEmail(templateParams) {
  emailjs.send('service_qam1ize', 'template_omzbw2t', templateParams).catch(function(err) { console.warn('EmailJS error:', err); });
}

// ── REGISTER ──
async function handleRegister() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pw = document.getElementById('regPassword').value;
  if (!name || !email || !pw) { showErr('Veuillez remplir tous les champs.'); return; }
  if (pw.length < 6) { showErr('Mot de passe trop court (min. 6 caractères).'); return; }
  const { error } = await SUPA.auth.signUp({ email, password: pw, options: { data: { full_name: name } } });
  if (error) showErr(error.message);
  else showErr('Vérifiez votre email pour confirmer votre compte.');
}

// ── LOGOUT ──
async function handleLogout() { await SUPA.auth.signOut(); }

// ── DASH LOADER ──
function loadDash(){
  document.getElementById('authPage').style.display='none';
  document.getElementById('dashPage').style.display='flex';
  document.getElementById('navName').textContent=CU.name;
  document.getElementById('welcomeName').textContent=CU.name.split(' ')[0];
  const rb=document.getElementById('roleBar');
  rb.textContent=CU.role==='admin'?'Admin':'Client';
  rb.className='badge '+(CU.role==='admin'?'badge-admin':'badge-client');
  buildSidebar();
  showPanel(CU.role==='admin'?'adminOverview':'overview');
}

function buildSidebar(){
  const isAdmin=CU.role==='admin';
  const items=isAdmin
    ?[{id:'adminOverview',icon:'📊',label:"Vue d'ensemble"},{id:'adminAppts',icon:'📅',label:'Rendez-vous'},{id:'adminMessages',icon:'✉️',label:'Messages'},{id:'adminClients',icon:'👥',label:'Clients'}]
    :[{id:'overview',icon:'🏠',label:'Accueil'},{id:'projets',icon:'📁',label:'Mes Projets'},{id:'livrables',icon:'📦',label:'Mes Livrables'},{id:'forfait',icon:'⭐',label:'Mon Forfait'},{id:'book',icon:'📅',label:'Prendre RDV'},{id:'myAppts',icon:'🗓️',label:'Mes rendez-vous'},{id:'contact',icon:'✉️',label:'Contact'}];
  document.getElementById('dashSidebar').innerHTML=items.map(it=>`<div class="sidebar-nav-item" id="nav-${it.id}" onclick="showPanel('${it.id}')"><span class="nav-icon">${it.icon}</span><span>${it.label}</span></div>`).join('');
}

function showPanel(id){
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav-item').forEach(n=>n.classList.remove('active'));
  const panel=document.getElementById('panel-'+id), nav=document.getElementById('nav-'+id);
  if(panel) panel.classList.add('active');
  if(nav) nav.classList.add('active');
  ({overview:renderClientOverview,myAppts:renderClientAppts,contact:renderContactPanel,adminOverview:renderAdminOverview,adminAppts:renderAdminAppts,adminMessages:renderAdminMsgs,adminClients:renderAdminClients,book:initBooking,projets:renderProjets,livrables:renderLivrables,forfait:renderForfait})[id]?.();
}

// ── MES PROJETS ──
async function renderProjets(){
  var SVC={copywriting:{icon:'✍️',name:'Copywriting',steps:['Brief client','Recherche & analyse','Rédaction','Révisions','Livraison finale']},['content-strategy']:{icon:'📊',name:'Stratégie de Contenu',steps:['Audit de contenu','Analyse concurrentielle','Élaboration du plan','Création du calendrier','Mise en place & suivi']},['web-design']:{icon:'🌐',name:'Création de Site Web',steps:['Wireframes','Design UI','Développement','Tests & QA','Mise en ligne']},['social-media']:{icon:'📱',name:'Réseaux Sociaux',steps:['Audit des comptes','Stratégie éditoriale','Création des visuels','Publication','Analyse des résultats']}};
  var el=document.getElementById('projetsGrid');
  el.innerHTML='<div style="color:var(--muted);padding:1rem;">Chargement...</div>';
  const {data:appts}=await SUPA.from('appointments').select('*').eq('client_id',CU.id).eq('status','confirmed');
  if(!appts||!appts.length){el.innerHTML='<div class="empty" style="grid-column:1/-1"><div class="empty-icon">📁</div><p>Aucun projet actif. <a onclick="showPanel('book')" style="color:var(--gold);cursor:pointer;">Démarrer un projet →</a></p></div>';return;}
  el.innerHTML=appts.map(function(a){var svc=SVC[a.service]||{icon:'📋',name:a.service,steps:['En cours']};var progress=Math.min(Math.floor((Date.now()-new Date(a.date).getTime())/(1000*60*60*24*3))+1,svc.steps.length-1);var pct=Math.round((progress/svc.steps.length)*100);return '<div class="card" style="border-left:3px solid var(--gold);"><div style="display:flex;align-items:center;gap:0.8rem;margin-bottom:1.2rem;"><span style="font-size:1.8rem;">'+svc.icon+'</span><div><div style="font-weight:700;font-size:1rem;">'+svc.name+'</div><div style="font-size:0.75rem;color:var(--muted);">Démarré le '+fmt(a.date)+'</div></div></div><div style="margin-bottom:1rem;"><div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--muted);margin-bottom:0.4rem;"><span>Progression</span><span style="color:var(--gold);font-weight:600;">'+pct+'%</span></div><div style="height:4px;background:rgba(255,255,255,0.07);border-radius:2px;"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,var(--gold-dark),var(--gold));border-radius:2px;"></div></div></div><div style="display:flex;flex-direction:column;gap:0.5rem;">'+svc.steps.map(function(s,i){var col=i<progress?'color:var(--gold);':i===progress?'color:var(--fg);font-weight:600;':'color:var(--muted);opacity:0.5;';var ic=i<progress?'✅':i===progress?'⏳':'○';return '<div style="display:flex;align-items:center;gap:0.6rem;font-size:0.82rem;'+col+'"><span>'+ic+'</span>'+s+'</div>';}).join('')+'</div></div>';}).join('');
}

// ── MES LIVRABLES ──
async function renderLivrables(){
  var ICONS={copywriting:'✍️',['content-strategy']:'📊',['web-design']:'🌐',['social-media']:'📱'};
  var el=document.getElementById('livrablesGrid');
  el.innerHTML='<div style="color:var(--muted);padding:1rem;">Chargement...</div>';
  const {data:appts}=await SUPA.from('appointments').select('*').eq('client_id',CU.id).eq('status','completed');
  if(!appts||!appts.length){el.innerHTML='<div class="empty" style="grid-column:1/-1"><div class="empty-icon">📦</div><p>Vos livrables apparaîtront ici une fois votre projet terminé.</p></div>';return;}
  el.innerHTML=appts.map(function(a){return '<div class="card" style="display:flex;align-items:center;gap:1rem;"><div style="width:48px;height:48px;border:1px solid rgba(212,175,55,0.3);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;">'+(ICONS[a.service]||'📄')+'</div><div style="flex:1;"><div style="font-weight:600;font-size:0.9rem;">'+svcName(a.service)+'</div><div style="font-size:0.75rem;color:var(--muted);">Livré le '+fmt(a.date)+'</div></div><button class="btn-secondary" style="padding:0.5rem 1rem;font-size:0.65rem;" onclick="alert('Contactez-nous pour recevoir vos fichiers.')">↓ TÉLÉCHARGER</button></div>';}).join('');
}

// ── MON FORFAIT ──
async function renderForfait(){
  var F={copywriting:[{n:'Starter',p:'497$/mois',f:['3 pages de vente','5 emails marketing','2 révisions incluses']},{n:'Pro',p:'997$/mois',f:['10 pages de vente','15 emails marketing','Scripts vidéo','Révisions illimitées']},{n:'Elite',p:'1997$/mois',f:['Projets illimités','Stratégie complète','Manager dédié','Priorité absolue']}],['content-strategy']:[{n:'Starter',p:'397$/mois',f:['Audit de contenu','Calendrier 30 jours','2 révisions']},{n:'Pro',p:'797$/mois',f:['Stratégie 90 jours','SEO avancé','Reporting mensuel','Révisions illimitées']},{n:'Elite',p:'1497$/mois',f:['Stratégie annuelle','Équipe dédiée','Analytics avancés','Support prioritaire']}],['web-design']:[{n:'Starter',p:'1497$',f:['Site 5 pages','Design sur mesure','Responsive','1 an hébergement']},{n:'Pro',p:'2997$',f:['Site 15 pages','E-commerce','SEO optimisé','Support 6 mois']},{n:'Elite',p:'5997$',f:['Site illimité','Fonctions custom','Intégrations API','Support 1 an']}],['social-media']:[{n:'Starter',p:'297$/mois',f:['2 réseaux','12 posts/mois','Visuels inclus']},{n:'Pro',p:'597$/mois',f:['4 réseaux','30 posts/mois','Stories & Reels','Reporting hebdo']},{n:'Elite',p:'997$/mois',f:['Réseaux illimités','Contenu illimité','Gestion communauté','Manager dédié']}]};
  var el=document.getElementById('forfaitContent');
  const {data:appts}=await SUPA.from('appointments').select('*').eq('client_id',CU.id);
  var lastSvc=appts&&appts.length?appts[appts.length-1].service:null;
  if(!lastSvc||!F[lastSvc]){el.innerHTML='<div class="empty"><div class="empty-icon">⭐</div><p>Prenez un rendez-vous pour découvrir nos forfaits.</p></div>';return;}
  el.innerHTML='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.2rem;">'+F[lastSvc].map(function(f,i){return '<div class="card" style="text-align:center;border:1px solid '+(i===1?'var(--gold)':'rgba(212,175,55,0.1)')+';position:relative;">'+(i===1?'<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--gold);color:#050505;font-size:0.62rem;font-weight:700;letter-spacing:0.1em;padding:0.25rem 0.8rem;">POPULAIRE</div>':'')+'<div style="font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;margin-bottom:0.3rem;">'+f.n+'</div><div style="font-size:1.4rem;font-weight:800;color:var(--gold);margin-bottom:1rem;">'+f.p+'</div><ul style="list-style:none;text-align:left;font-size:0.82rem;color:var(--muted);display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.2rem;">'+f.f.map(function(ft){return '<li>✓ '+ft+'</li>';}).join('')+'</ul><button class="btn-'+(i===1?'primary':'secondary')+' btn-full" style="font-size:0.65rem;" onclick="showPanel('book')">CHOISIR →</button></div>';}).join('')+'</div>';
}

// ── HELPERS ──
function bdg(s){const map={pending:'badge-pending',confirmed:'badge-confirmed',completed:'badge-completed',cancelled:'badge-cancelled',unread:'badge-unread',read:'badge-read',replied:'badge-replied'};const lbl={pending:'En attente',confirmed:'Confirmé',completed:'Terminé',cancelled:'Annulé',unread:'Non lu',read:'Lu',replied:'Répondu'};return `<span class="badge ${map[s]||''}">${lbl[s]||s}</span>`;}
function fmt(d){return new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'});}
function svcName(id){return SERVICES.find(s=>s.id===id)?.name||id;}

// ── CLIENT OVERVIEW ──
async function renderClientOverview(){
  const {data:appts}=await SUPA.from('appointments').select('*').eq('client_id',CU.id);
  const {data:msgs}=await SUPA.from('messages').select('*').eq('client_id',CU.id);
  const a=appts||[],m=msgs||[];
  document.getElementById('clientStatsGrid').innerHTML=`<div class="stat-card"><div class="stat-icon">📅</div><div class="stat-num">${a.length}</div><div class="stat-lbl">Rendez-vous</div></div><div class="stat-card"><div class="stat-icon">✅</div><div class="stat-num">${a.filter(x=>x.status==='confirmed').length}</div><div class="stat-lbl">Confirmés</div></div><div class="stat-card"><div class="stat-icon">✉️</div><div class="stat-num">${m.length}</div><div class="stat-lbl">Messages</div></div>`;
  const up=a.filter(x=>x.status==='pending'||x.status==='confirmed').slice(0,3);
  document.getElementById('upcomingAppts').innerHTML=up.length?up.map(x=>`<div class="appt-card"><div class="appt-top"><div><div style="font-weight:600;">${svcName(x.service)}</div></div>${bdg(x.status)}</div><div class="appt-meta"><span>📅 ${x.date}</span><span>🕐 ${x.time}</span></div></div>`).join(''):`<div class="empty"><div class="empty-icon">📅</div><p>Aucun rendez-vous à venir. <a onclick="showPanel('book')" style="color:var(--gold);cursor:pointer;">Prendre un RDV</a></p></div>`;
}

// ── BOOKING ──
let bk={workerId:null,service:null,date:null,time:null};
async function initBooking(){
  bk={workerId:null,service:null,date:null,time:null};
  renderSteps(1);
  [1,2,3].forEach(i=>document.getElementById('bookStep'+i).style.display=i===1?'block':'none');
  document.getElementById('workerList').innerHTML=`<div class="worker-btn" onclick="selWorker('admin-expert')"><div class="worker-avatar">👤</div><div style="flex:1;text-align:left;"><div style="font-weight:600;font-size:0.88rem;">World2Blinded</div><div style="font-size:0.75rem;color:var(--muted);">Expert Copywriting & Stratégie</div></div><span style="color:var(--muted);">→</span></div>`;
  document.getElementById('serviceGrid').innerHTML=SERVICES.map(s=>`<button class="service-tag" id="st-${s.id}" onclick="selService('${s.id}')">${s.name}</button>`).join('');
  document.getElementById('step1Btn').disabled=true;
  document.getElementById('slotsSection').style.display='none';
}
function renderSteps(active){const row=document.getElementById('stepsRow');if(!row)return;row.innerHTML=[1,2,3].map((n,i)=>`${i>0?`<div class="step-line ${active>n-1?'step-line-done':''}"></div>`:''}<div class="step-num ${active>n?'step-done':active===n?'step-active':'step-off'}">${n}</div>`).join('');}
function selWorker(id){bk.workerId=id;document.querySelector('.worker-btn')?.classList.add('sel');checkS1();}
function selService(id){bk.service=id;document.querySelectorAll('.service-tag').forEach(b=>b.classList.remove('sel'));document.getElementById('st-'+id)?.classList.add('sel');checkS1();}
function checkS1(){document.getElementById('step1Btn').disabled=!(bk.workerId&&bk.service);}

// ── CALENDAR ──
let calYear,calMonth;
function initCal(){const now=new Date();calYear=now.getFullYear();calMonth=now.getMonth();renderCal();}
function calPrev(){calMonth--;if(calMonth<0){calMonth=11;calYear--;}renderCal();}
function calNext(){calMonth++;if(calMonth>11){calMonth=0;calYear++;}renderCal();}
function renderCal(){
  const months=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  document.getElementById('calMonthLabel').textContent=months[calMonth]+' '+calYear;
  const grid=document.getElementById('calGrid');
  const today=new Date();today.setHours(0,0,0,0);
  const firstDay=new Date(calYear,calMonth,1);
  let startOffset=firstDay.getDay()-1;if(startOffset<0)startOffset=6;
  const daysInMonth=new Date(calYear,calMonth+1,0).getDate();
  let html='';
  for(let i=0;i<startOffset;i++)html+='<div class="cal-day cal-empty"></div>';
  for(let d=1;d<=daysInMonth;d++){
    const date=new Date(calYear,calMonth,d);const dow=date.getDay();
    const isWeekend=dow===0||dow===6;const isPast=date<today;
    const ymd=calYear+'-'+String(calMonth+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const isToday=date.getTime()===today.getTime();const isSel=bk.date===ymd;
    let cls='cal-day';
    if(isWeekend||isPast)cls+=' cal-weekend cal-disabled';
    else if(isSel)cls+=' cal-selected';
    else if(isToday)cls+=' cal-today';
    html+=`<div class="${cls}" ${(!isWeekend&&!isPast)?`onclick="selectCalDay('${ymd}')"`:''}>${d}</div>`;
  }
  grid.innerHTML=html;
}
function selectCalDay(ymd){bk.date=ymd;bk.time=null;renderCal();const[y,m,d]=ymd.split('-');const months=['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];document.getElementById('selectedDateLabel').textContent=d+' '+months[parseInt(m)-1]+' '+y;document.getElementById('slotsSection').style.display='block';document.getElementById('step2Btn').disabled=true;renderSlots();}
function renderSlots(){document.getElementById('slotsGrid').innerHTML=SLOTS.map(t=>`<button class="slot-btn${bk.time===t?' sel':''}" onclick="selSlot('${t}')">${t}</button>`).join('');}
function selSlot(t){bk.time=t;renderSlots();document.getElementById('step2Btn').disabled=false;}
function goStep(n){[1,2,3].forEach(i=>document.getElementById('bookStep'+i).style.display=i===n?'block':'none');renderSteps(n);if(n===2){bk.date=null;bk.time=null;document.getElementById('slotsSection').style.display='none';document.getElementById('step2Btn').disabled=true;initCal();}if(n===3)renderSummary();}
function renderSummary(){document.getElementById('bookSummary').innerHTML=`<div class="summary-row"><span class="key">Expert</span><span>World2Blinded</span></div><div class="summary-row"><span class="key">Service</span><span>${svcName(bk.service)}</span></div><div class="summary-row"><span class="key">Date</span><span>${bk.date}</span></div><div class="summary-row"><span class="key">Heure</span><span>${bk.time}</span></div>`;}

async function confirmBooking(){
  const notes=document.getElementById('bookNotes').value;
  const {error}=await SUPA.from('appointments').insert({client_id:CU.id,client_name:CU.name,client_email:CU.email,worker_name:'World2Blinded',service:bk.service,date:bk.date,time:bk.time,notes,status:'pending'});
  if(error){notify('⚠️ Erreur lors de la réservation.');return;}
  document.getElementById('bookNotes').value='';
  sendEmail({to_name:CU.name,to_email:CU.email,subject:'Confirmation de votre rendez-vous — World2Blinded',message:'Bonjour '+CU.name+',

Votre rendez-vous a bien été reçu.

📅 Date : '+bk.date+'
🕐 Heure : '+bk.time+'
🛠 Service : '+svcName(bk.service)+'

Nous vous confirmons votre rendez-vous dans les plus brefs délais.

À bientôt,
L'équipe World2Blinded',from_name:'World2Blinded'});
  notify('✅ Rendez-vous réservé avec succès !');showPanel('myAppts');
}

// ── CLIENT APPOINTMENTS ──
async function renderClientAppts(){
  const {data:appts}=await SUPA.from('appointments').select('*').eq('client_id',CU.id).order('created_at',{ascending:false});
  const el=document.getElementById('clientApptsList');
  if(!appts||!appts.length){el.innerHTML='<div class="empty"><div class="empty-icon">📅</div><p>Aucun rendez-vous pour l'instant.</p></div>';return;}
  el.innerHTML=appts.map(a=>`<div class="appt-card"><div class="appt-top"><div><div style="font-weight:600;">${svcName(a.service)}</div><div style="font-size:0.75rem;color:var(--muted);">avec ${a.worker_name||'Expert W2B'}</div></div>${bdg(a.status)}</div><div class="appt-meta"><span>📅 ${a.date}</span><span>🕐 ${a.time}</span></div>${a.notes?`<p style="font-size:0.82rem;color:var(--muted);background:rgba(255,255,255,0.025);padding:0.7rem;margin-bottom:0.7rem;">${a.notes}</p>`:''}<div class="appt-actions">${a.status==='pending'?`<button class="btn-secondary btn-sm btn-refuse" onclick="cancelAppt('${a.id}')">Annuler</button>`:''}</div></div>`).join('');
}
async function cancelAppt(id){await SUPA.from('appointments').update({status:'cancelled'}).eq('id',id);renderClientAppts();notify('Rendez-vous annulé.');}

// ── CLIENT MESSAGES ──
function renderContactPanel(){renderClientMsgs();}
async function sendMessage(){
  const sub=document.getElementById('msgSubject').value.trim(),body=document.getElementById('msgBody').value.trim();
  if(!sub||!body){notify('⚠️ Veuillez remplir tous les champs.');return;}
  const {error}=await SUPA.from('messages').insert({client_id:CU.id,client_name:CU.name,client_email:CU.email,subject:sub,body,status:'unread'});
  if(error){notify('⚠️ Erreur lors de l'envoi.');return;}
  sendEmail({to_name:'World2Blinded',to_email:'contact@world2blinded.com',subject:'📩 Nouveau message client — '+sub,message:'Nouveau message de '+CU.name+' ('+CU.email+') :

Sujet : '+sub+'

'+body,from_name:CU.name,reply_to:CU.email});
  document.getElementById('msgSubject').value='';document.getElementById('msgBody').value='';
  notify('✅ Message envoyé !');renderClientMsgs();
}
async function renderClientMsgs(){
  const {data:msgs}=await SUPA.from('messages').select('*').eq('client_id',CU.id).order('created_at',{ascending:false});
  const el=document.getElementById('clientMsgList');
  if(!msgs||!msgs.length){el.innerHTML='<div class="empty"><div class="empty-icon">✉️</div><p>Aucun message envoyé.</p></div>';return;}
  el.innerHTML=msgs.map(m=>`<div class="msg-item"><div class="msg-top"><div class="msg-subject">${m.subject}</div>${bdg(m.status)}</div><div class="msg-body">${m.body}</div><div class="msg-date">${fmt(m.created_at)}</div></div>`).join('');
}

// ── ADMIN OVERVIEW ──
async function renderAdminOverview(){
  const {data:appts}=await SUPA.from('appointments').select('*');
  const {data:msgs}=await SUPA.from('messages').select('*');
  const {data:clients}=await SUPA.from('profiles').select('*').neq('role','admin');
  const a=appts||[],m=msgs||[],c=clients||[];
  document.getElementById('adminStatsGrid').innerHTML=`<div class="stat-card"><div class="stat-icon">👥</div><div class="stat-num">${c.length}</div><div class="stat-lbl">Clients</div></div><div class="stat-card"><div class="stat-icon">📅</div><div class="stat-num">${a.filter(x=>x.status==='pending').length}</div><div class="stat-lbl">RDV en attente</div></div><div class="stat-card"><div class="stat-icon">✅</div><div class="stat-num">${a.filter(x=>x.status==='confirmed').length}</div><div class="stat-lbl">RDV confirmés</div></div><div class="stat-card"><div class="stat-icon">✉️</div><div class="stat-num">${m.filter(x=>x.status==='unread').length}</div><div class="stat-lbl">Non lus</div></div>`;
  const ra=[...a].reverse().slice(0,3);
  document.getElementById('adminRecentAppts').innerHTML=ra.length?ra.map(x=>`<div class="appt-card"><div class="appt-top"><div><strong>${x.client_name}</strong><div style="font-size:0.75rem;color:var(--muted);">${svcName(x.service)}</div></div>${bdg(x.status)}</div><div class="appt-meta"><span>📅 ${x.date}</span><span>🕐 ${x.time}</span></div></div>`).join(''):'<div class="empty"><div class="empty-icon">📅</div><p>Aucun rendez-vous.</p></div>';
  const rm=[...m].reverse().slice(0,3);
  document.getElementById('adminRecentMsgs').innerHTML=rm.length?rm.map(x=>`<div class="msg-item ${x.status==='unread'?'unread':''}"><div class="msg-top"><div class="msg-sender">${x.client_name}</div>${bdg(x.status)}</div><div class="msg-subject">${x.subject}</div><div class="msg-body">${x.body.substring(0,80)}${x.body.length>80?'...':''}</div></div>`).join(''):'<div class="empty"><div class="empty-icon">✉️</div><p>Aucun message.</p></div>';
}

// ── ADMIN APPOINTMENTS ──
async function renderAdminAppts(){
  const {data:appts}=await SUPA.from('appointments').select('*').order('created_at',{ascending:false});
  const el=document.getElementById('adminApptsList');
  if(!appts||!appts.length){el.innerHTML='<div class="empty"><div class="empty-icon">📅</div><p>Aucun rendez-vous.</p></div>';return;}
  el.innerHTML=appts.map(a=>`<div class="appt-card"><div class="appt-top"><div><div style="font-weight:600;">${a.client_name}</div><div style="font-size:0.75rem;color:var(--muted);">${a.client_email}</div></div>${bdg(a.status)}</div><div class="appt-meta"><span>🛠 ${svcName(a.service)}</span><span>📅 ${a.date}</span><span>🕐 ${a.time}</span></div>${a.notes?`<p style="font-size:0.82rem;color:var(--muted);background:rgba(255,255,255,0.025);padding:0.7rem;margin-bottom:0.75rem;">${a.notes}</p>`:''}<div class="appt-actions">${a.status==='pending'?`<button class="btn-primary btn-sm btn-confirm" onclick="adminSetAppt('${a.id}','confirmed')">✓ Confirmer</button><button class="btn-primary btn-sm btn-refuse" onclick="adminSetAppt('${a.id}','cancelled')">✗ Refuser</button>`:''}${a.status==='confirmed'?`<button class="btn-primary btn-sm btn-complete" onclick="adminSetAppt('${a.id}','completed')">✓ Terminé</button>`:''}</div></div>`).join('');
}
async function adminSetAppt(id,status){
  const {data}=await SUPA.from('appointments').update({status}).eq('id',id).select().single();
  if(data){
    if(status==='confirmed')sendEmail({to_name:data.client_name,to_email:data.client_email,subject:'Votre rendez-vous est confirmé — World2Blinded',message:'Bonjour '+data.client_name+',

✅ Votre rendez-vous a été confirmé !

📅 Date : '+data.date+'
🕐 Heure : '+data.time+'
🛠 Service : '+svcName(data.service)+'

Nous avons hâte de travailler avec vous !

À bientôt,
L'équipe World2Blinded',from_name:'World2Blinded'});
    if(status==='cancelled')sendEmail({to_name:data.client_name,to_email:data.client_email,subject:'Mise à jour de votre rendez-vous — World2Blinded',message:'Bonjour '+data.client_name+',

Votre rendez-vous du '+data.date+' à '+data.time+' a été annulé.

N'hésitez pas à reprendre un nouveau rendez-vous.

Cordialement,
L'équipe World2Blinded',from_name:'World2Blinded'});
  }
  renderAdminAppts();renderAdminOverview();notify('✅ Statut mis à jour.');
}

// ── ADMIN MESSAGES ──
async function renderAdminMsgs(){
  const {data:msgs}=await SUPA.from('messages').select('*').order('created_at',{ascending:false});
  const el=document.getElementById('adminMsgList');
  if(!msgs||!msgs.length){el.innerHTML='<div class="empty"><div class="empty-icon">✉️</div><p>Aucun message reçu.</p></div>';return;}
  el.innerHTML=msgs.map(m=>`<div class="msg-item ${m.status==='unread'?'unread':''}" onclick="markRead('${m.id}')"><div class="msg-top"><div><div class="msg-sender">${m.client_name}</div><div class="msg-email">${m.client_email}</div></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.3rem;">${bdg(m.status)}<span class="msg-date">${fmt(m.created_at)}</span></div></div><div class="msg-subject">${m.subject}</div><div class="msg-body">${m.body}</div></div>`).join('');
}
async function markRead(id){await SUPA.from('messages').update({status:'read'}).eq('id',id).eq('status','unread');renderAdminMsgs();}

// ── ADMIN CLIENTS ──
async function renderAdminClients(){
  const {data:users}=await SUPA.from('profiles').select('*').neq('role','admin');
  const {data:appts}=await SUPA.from('appointments').select('*');
  const el=document.getElementById('adminClientsTable');
  if(!users||!users.length){el.innerHTML='<div class="empty"><div class="empty-icon">👥</div><p>Aucun client inscrit.</p></div>';return;}
  el.innerHTML=`<table><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Inscrit le</th><th>RDV</th></tr>${users.map(u=>`<tr><td><strong>${u.name}</strong></td><td style="color:var(--muted);">${u.email}</td><td>${bdg('read')}</td><td style="color:var(--muted);">${fmt(u.created_at)}</td><td>${(appts||[]).filter(a=>a.client_id===u.id).length}</td></tr>`).join('')}</table>`;
}

// ── TOAST ──
let toastT;
function notify(m){const el=document.getElementById('toast');el.textContent=m;el.style.display='block';clearTimeout(toastT);toastT=setTimeout(()=>el.style.display='none',3200);}

// ── KEYBOARD ──
document.addEventListener('keydown',e=>{
  if(e.key!=='Enter') return;
  if(document.getElementById('authPage').style.display!=='none'){
    if(document.getElementById('loginSection').style.display!=='none') handleLogin();
    else handleRegister();
  }
});

/* ==================== INDEX JS ==================== */
(function() {
  // ── COUNTERS ──
  function animateCounters() {
    document.querySelectorAll('.stat-number[data-target]').forEach(function(el) {
      var target = parseInt(el.getAttribute('data-target'));
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 2000;
      var step = target / (duration / 16);
      var current = 0;
      var timer = setInterval(function() {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = Math.floor(current) + suffix;
      }, 16);
    });
  }
  var statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) { animateCounters(); statsObserver.disconnect(); }
    });
  }, { threshold: 0.3 });
  var statsSection = document.getElementById('stats');
  if (statsSection) statsObserver.observe(statsSection);

  // ── FADE IN ──
  var fadeObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(function(el) { fadeObserver.observe(el); });

  // ── LANGUAGE SWITCHER ──
  window.currentLang = localStorage.getItem('w2b_lang') || 'fr';

  window.setLang = function(lang) {
    window.currentLang = lang;
    localStorage.setItem('w2b_lang', lang);
    document.querySelectorAll('[data-fr]').forEach(function(el) {
      el.textContent = lang === 'fr' ? el.getAttribute('data-fr') : el.getAttribute('data-en');
    });
    var btn = document.getElementById('langBtn');
    if (btn) btn.textContent = lang === 'fr' ? 'EN' : 'FR';
  };

  window.toggleLang = function() {
    window.setLang(window.currentLang === 'fr' ? 'en' : 'fr');
  };

  // Apply saved language on load
  window.setLang(window.currentLang);

  // ── MOBILE MENU ──
  var burger = document.getElementById('burger');
  var navLinks = document.querySelector('.nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', function() {
      navLinks.classList.toggle('open');
      burger.classList.toggle('open');
    });
  }

  // ── FAQ (index page) ──
  document.querySelectorAll('#pg-index .faq-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('#pg-index .faq-item').forEach(function(i) { i.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });

})();

/* ==================== ROUTER ==================== */
var ROUTES = {
  "index.html":               "index",
  "index.html#services":      "index",
  "index.html#hero":          "index",
  "index.html#contact":       "index",
  "index.html#different":     "index",
  "index.html#why":           "index",
  "index.html#stats":         "index",
  "dashboard.html":           "dashboard",
  "service-copywriting.html": "copywriting",
  "service-strategie.html":   "strategie",
  "service-siteweb.html":     "siteweb",
  "service-reseaux.html":     "reseaux",
  "reseau-reseau.html":       "reseaux",
  "reseau-reseau_html.html":  "reseaux"
};

function navigate(pid, hash) {
  document.querySelectorAll(".w2b-page").forEach(function(p) { p.style.display = "none"; });
  var page = document.getElementById("pg-" + pid);
  if (!page) { page = document.getElementById("pg-index"); pid = "index"; }
  page.style.display = "block";
  window.scrollTo(0, 0);

  var servicePids = ["copywriting", "strategie", "siteweb", "reseaux"];
  if (servicePids.indexOf(pid) !== -1) {
    page.querySelectorAll(".faq-item").forEach(function(item) {
      var clone = item.cloneNode(true);
      item.parentNode.replaceChild(clone, item);
    });
    page.querySelectorAll(".faq-item").forEach(function(item) {
      item.addEventListener("click", function() {
        var isOpen = item.classList.contains("open");
        page.querySelectorAll(".faq-item").forEach(function(i) { i.classList.remove("open"); });
        if (!isOpen) item.classList.add("open");
      });
    });
  }

  // When going back to index, re-apply current language and fade-ins
  if (pid === "index" && window.setLang) {
    window.setLang(localStorage.getItem('w2b_lang') || window.currentLang || "fr");
    // Re-observe fade-in elements
    var fadeObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('#pg-index .fade-in').forEach(function(el) { fadeObserver.observe(el); });
  }

  if (hash) {
    setTimeout(function() {
      var el = page.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }
}

document.addEventListener("click", function(e) {
  var a = e.target.closest("a");
  if (!a) return;
  var href = a.getAttribute("href");
  if (!href || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("tel")) return;

  href = href.replace(/^\.?\//, "");
  var parts = href.split("#");
  var path  = parts[0];
  var hash  = parts[1] ? "#" + parts[1] : "";
  var pid   = ROUTES[path];

  if (pid) {
    e.preventDefault();
    e.stopPropagation();
    navigate(pid, hash);
  } else if (!path && hash) {
    e.preventDefault();
    e.stopPropagation();
    var cur = document.querySelector(".w2b-page[style*='display: block'], .w2b-page[style*='display:block']");
    if (cur) {
      var el = cur.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }
}, true);
