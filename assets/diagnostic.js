/* Round Hill Consulting — Where Your Week Goes diagnostic */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     PASTE YOUR GOHIGHLEVEL INBOUND WEBHOOK URL HERE.
     Until it is set, the diagnostic still works end to end — it just
     does not send the lead anywhere.
  ------------------------------------------------------------------ */
  var GHL_WEBHOOK_URL = '';

  var STORE = 'rhc-diagnostic-v1';

  var AREAS = {
    time:      'Your time and capacity',
    leads:     'Leads and sales follow-up',
    comms:     'Customer communication',
    delivery:  'Project and team coordination',
    admin:     'Admin and financial flow',
    readiness: 'AI and automation readiness'
  };

  var PARTS = [
    'Your week and your capacity',
    'Leads, sales and follow-up',
    'Communication and customer experience',
    'Delivery, projects and team coordination',
    'Admin, finance and reporting',
    'AI and automation readiness'
  ];

  var Q = [
    { p:0, a:'time', t:'In a typical week, how many hours do you personally spend on repetitive admin, follow-up, coordination, or updating information?',
      o:['Less than 3 hours','3\u20136 hours','7\u201310 hours','11\u201315 hours','More than 15 hours'], hrs:[2,4.5,8.5,13,17] },
    { p:0, a:'time', t:'How often do important tasks rely on you remembering to do them?',
      o:['Rarely','Occasionally','About half the time','Often','Almost always'] },
    { p:0, a:'time', t:'When you take a day away from the business, what usually happens?',
      o:['Work continues normally','A few questions wait for me','Things slow down noticeably','I come back to a backlog or problems','The business largely pauses'] },
    { p:0, a:'time', t:'How confident are you that you know where your time goes each week?',
      o:['Very confident','Mostly confident','Somewhat confident','Not very confident','I am constantly reacting'] },

    { p:1, a:'leads', t:'How quickly does a new enquiry typically receive a meaningful response?',
      o:['Within 15 minutes','Within an hour','The same business day','Within 1\u20132 days','It varies or some are missed'] },
    { p:1, a:'leads', t:'How consistently do you follow up on quotes, proposals, or enquiries that do not convert immediately?',
      o:['Every opportunity has a clear follow-up process','Usually, with occasional gaps','We follow up when we remember','It depends how busy we are','There is no dependable process'] },
    { p:1, a:'leads', t:'Where is your current lead and customer information kept?',
      o:['One organised system everyone uses','Mostly one system, with a few workarounds','Several spreadsheets, inboxes, and tools','Mostly in email, texts, or notes','I often have to search for it'] },
    { p:1, a:'leads', t:'How clear is your view of which leads are active, waiting, won, or lost?',
      o:['Always clear','Mostly clear','Clear only after checking several places','Often unclear','We do not reliably track it'] },

    { p:2, a:'comms', t:'How are customer questions, requests, and updates captured and handled?',
      o:['One clear process with prompt ownership','Usually organised','Managed across several channels','Often dependent on individual memory','Messages are sometimes missed'] },
    { p:2, a:'comms', t:'How often do customers need to chase you for an update?',
      o:['Rarely','Occasionally','A few times each month','Weekly','Frequently'] },
    { p:2, a:'comms', t:'How much time does your team spend answering the same routine questions or sending similar updates?',
      o:['Very little','A little','Several hours a week','A significant amount of time','It is a major drain'] },
    { p:2, a:'comms', t:'Are customer communications consistent regardless of who responds?',
      o:['Yes, very consistent','Mostly','Sometimes','Rarely','No defined standard'] },

    { p:3, a:'delivery', t:'How clearly can everyone see the current status, next step, and owner for active work?',
      o:['Completely clear in one place','Mostly clear','Clear only for some work','Often unclear','We rely on messages and memory'] },
    { p:3, a:'delivery', t:'How often do tasks or handoffs slip because someone assumed someone else was handling them?',
      o:['Rarely','Occasionally','Monthly','Weekly','Frequently'] },
    { p:3, a:'delivery', t:'How is information from a completed job, customer conversation, or site visit shared with the team?',
      o:['Captured consistently in a shared workflow','Usually shared well','Shared manually, with occasional gaps','Spread across texts, calls, and notes','Often stays with the person who handled it'] },
    { p:3, a:'delivery', t:'How much time is spent each week chasing updates from customers, suppliers, subcontractors, or team members?',
      o:['Less than an hour','1\u20133 hours','4\u20136 hours','7\u201310 hours','More than 10 hours'], hrs:[0.5,2,5,8.5,12] },

    { p:4, a:'admin', t:'How are documents, photos, estimates, invoices, and job records organised?',
      o:['Structured and easy to find','Mostly organised','Organised differently by different people','Spread across multiple places','Finding things is routinely difficult'] },
    { p:4, a:'admin', t:'How much manual re-entry of the same information happens between tools, spreadsheets, email, or forms?',
      o:['Almost none','A little','A few times each day','Constantly','I am not sure, but it feels excessive'] },
    { p:4, a:'admin', t:'How promptly are invoices, payment reminders, and required paperwork sent?',
      o:['Consistently on time','Mostly on time','Delayed during busy periods','Often delayed','There is a recurring backlog'], inv:true },
    { p:4, a:'admin', t:'Can you quickly see the operational numbers you need to make decisions?',
      o:['Yes, in minutes','Usually','With some manual work','Only after significant effort','Not reliably'] },

    { p:5, a:'readiness', t:'Which best describes your current use of AI or automation?',
      o:['It is already embedded in several workflows','We use it in a few useful places','We have experimented, but not systematically','We use it occasionally for ad hoc tasks','We have not started'] },
    { p:5, a:'readiness', t:'How repeatable are your key processes?',
      o:['Clearly documented and followed','Mostly consistent','Consistent in places','Different each time or by person','We have not defined them'] },
    { p:5, a:'readiness', t:'Do you have a clear owner for improving operations and adopting better systems?',
      o:['Yes, with dedicated time','Yes, but limited time','Informally','It usually falls to me when there is a problem','No one owns it'] },
    { p:5, a:'readiness', t:'If you recovered 5\u201310 hours each week, where would you put that capacity?',
      o:['Sales and growth','Better customer service','Higher-quality delivery','Team development','Personal time or strategic planning'], unscored:true }
  ];

  var TARGETS = {
    leadresp: { label:'Lead response and quote follow-up',
      body:'A workflow here acknowledges every enquiry the moment it lands, captures the details you need, alerts the right person, and keeps following up on quotes that have gone quiet \u2014 without depending on anyone remembering.' },
    updates: { label:'Customer status updates',
      body:'A workflow here sends the update before the customer asks for it. Fewer chase calls, less repeated explaining, and a customer experience that stays consistent no matter who is on the job.' },
    handoffs: { label:'Internal job handoffs',
      body:'A workflow here makes the next step and its owner explicit at every handover, so work stops stalling in the gap between two people who each thought the other had it.' },
    invoices: { label:'Invoice and payment follow-up',
      body:'A workflow here issues invoices on completion and chases the ones that age, which shortens the gap between finishing work and being paid for it.' },
    docs: { label:'Admin and document flow',
      body:'A workflow here files documents, photos and job records where they belong the first time, and stops the same information being typed into three different places.' }
  };

  var VERDICTS = {
    strong: { band:'Strong', head:'You have a solid operating foundation',
      body:'Your business is more organised than most. Core processes are reasonably visible, and the work does not depend entirely on one person\u2019s memory. The opportunity now is friction: the small repetitive tasks, follow-ups and handoffs that still take real time out of your week.',
      move:'Identify one recurring workflow with high volume \u2014 new-enquiry responses, quote follow-up, project updates, or invoice reminders \u2014 and automate it without disturbing what already works.',
      unlock:'3\u20136 hours per week of recovered capacity, stronger consistency, and faster customer response.' },
    exposed: { band:'Exposed', head:'The business works, but a lot of it still runs on manual effort',
      body:'You have processes, and they hold up on a normal week. They are more vulnerable during busy periods, when handoffs are missed or you become the default coordinator. Information sits across inboxes, texts, spreadsheets and people\u2019s heads, which is where time quietly turns into lost revenue.',
      move:'Standardise the handoff at one key stage of the customer journey \u2014 lead to quote, quote to job, job to invoice, or completion to review \u2014 and automate the routine communication around it.',
      unlock:'6\u201312 hours per week of recovered capacity, fewer dropped balls, and a more dependable customer experience.' },
    pressure: { band:'Under pressure', head:'Too much of the business is running through you',
      body:'Your team is working hard. The constraint is not effort \u2014 it is that coordination, follow-up and decisions all route through one person, and that does not scale with the work coming in. AI will not fix everything at once, but the right first workflow takes pressure off quickly and gives you something repeatable to build on.',
      move:'Start with the highest-frequency task that keeps interrupting you \u2014 usually lead response, job updates, collecting information, internal coordination, or invoice follow-up. Fix one workflow properly, then extend it.',
      unlock:'10+ hours per week of recovered owner capacity, better visibility, and a business that needs less constant intervention.' }
  };

  var ASSUMPTIONS = {
    conservative: { auto:0.25, red:0.30, pts:1 },
    expected:     { auto:0.40, red:0.50, pts:2 },
    ambitious:    { auto:0.60, red:0.70, pts:3 }
  };

  var state = { answers:{}, idx:0, unlocked:false, result:null };
  var el = {};
  var $ = function (id) { return document.getElementById(id); };

  /* ---------------- persistence ---------------- */
  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify({ answers:state.answers, idx:state.idx, unlocked:state.unlocked }));
    } catch (e) {}
  }
  function load() {
    try {
      var raw = localStorage.getItem(STORE);
      if (!raw) return;
      var d = JSON.parse(raw);
      if (d && d.answers) {
        state.answers = d.answers;
        state.idx = typeof d.idx === 'number' ? d.idx : 0;
        state.unlocked = !!d.unlocked;
      }
    } catch (e) {}
  }

  function answeredCount() {
    var n = 0;
    for (var i = 0; i < Q.length; i++) if (state.answers[i] != null) n++;
    return n;
  }

  /* ---------------- scoring ---------------- */
  function score() {
    var areaSum = {}, areaMax = {}, total = 0, max = 0;
    for (var k in AREAS) { areaSum[k] = 0; areaMax[k] = 0; }

    for (var i = 0; i < Q.length; i++) {
      var q = Q[i];
      if (q.unscored) continue;
      var v = state.answers[i];
      if (v == null) v = 2;
      var pts = 4 - v;
      areaSum[q.a] += pts; areaMax[q.a] += 4;
      total += pts; max += 4;
    }

    var areas = [];
    for (var key in AREAS) {
      var pc = areaMax[key] ? Math.round(areaSum[key] / areaMax[key] * 100) : 0;
      areas.push({ key:key, label:AREAS[key], pc:pc });
    }
    var overall = Math.round(total / max * 100);

    var band = overall >= 70 ? 'strong' : (overall >= 40 ? 'exposed' : 'pressure');

    /* manual hours: personal admin (Q1) + team chasing (Q16) */
    var h1 = Q[0].hrs[state.answers[0] != null ? state.answers[0] : 2];
    var h2 = Q[15].hrs[state.answers[15] != null ? state.answers[15] : 2];
    var hours = h1 + h2;

    /* weakest operational area picks the first target */
    var ops = areas.filter(function (a) { return a.key !== 'time' && a.key !== 'readiness'; });
    ops.sort(function (a, b) { return a.pc - b.pc; });
    var weakest = ops[0].key;
    var target = weakest === 'leads' ? 'leadresp'
              : weakest === 'comms' ? 'updates'
              : weakest === 'delivery' ? 'handoffs'
              : (state.answers[18] != null && state.answers[18] >= 3) ? 'invoices' : 'docs';

    var a = ASSUMPTIONS.expected;
    var recover = hours * a.auto * a.red;

    return { areas:areas, overall:overall, band:band, hours:hours, ownerHours:h1,
             target:target, weakest:ops[0].label, recover:recover };
  }

  /* ---------------- quiz ---------------- */
  function renderQuestion() {
    var q = Q[state.idx];
    var pct = Math.round(answeredCount() / Q.length * 100);

    el.progFill.style.width = pct + '%';
    el.progNum.textContent = (state.idx + 1) + ' / ' + Q.length;
    el.part.textContent = 'Part ' + (q.p + 1) + ' \u00b7 ' + PARTS[q.p];
    el.qtext.textContent = q.t;

    el.opts.innerHTML = '';
    var chosen = state.answers[state.idx];
    q.o.forEach(function (label, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dx-opt' + (chosen === i ? ' is-on' : '');
      b.setAttribute('data-i', i);
      b.innerHTML = '<span class="dx-key">' + (i + 1) + '</span><span>' + label + '</span>';
      b.addEventListener('click', function () { choose(i); });
      el.opts.appendChild(b);
    });

    el.back.disabled = state.idx === 0;
    el.skip.style.visibility = q.unscored ? 'hidden' : 'visible';
  }

  function choose(i) {
    state.answers[state.idx] = i;
    save();
    var nodes = el.opts.querySelectorAll('.dx-opt');
    for (var n = 0; n < nodes.length; n++) nodes[n].classList.toggle('is-on', n === i);
    setTimeout(next, 200);
  }

  function next() {
    if (state.idx >= Q.length - 1) { finish(); return; }
    state.idx++; save(); renderQuestion();
  }
  function back() {
    if (state.idx === 0) return;
    state.idx--; save(); renderQuestion();
  }

  function show(name) {
    ['intro', 'quiz', 'results'].forEach(function (k) {
      el[k].hidden = (k !== name);
    });
    window.scrollTo({ top:0, behavior:'smooth' });
  }

  /* ---------------- results ---------------- */
  function finish() {
    state.result = score();
    renderResults();
    show('results');
    save();
  }

  function fmtHours(h) {
    var lo = Math.max(1, Math.round(h - 2)), hi = Math.round(h + 2);
    return lo + '\u2013' + hi;
  }
  function round1(n) { return (Math.round(n * 10) / 10).toString(); }
  function money(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function renderResults() {
    var r = state.result, v = VERDICTS[r.band];

    /* gauge */
    var L = 376.99;
    $('dxArc').setAttribute('stroke-dasharray', (L * r.overall / 100) + ' ' + L);
    $('dxArc').setAttribute('stroke', r.band === 'strong' ? '#2F6F4F' : r.band === 'exposed' ? '#B07C28' : '#A24A2E');
    $('dxScore').textContent = r.overall;
    $('dxBandLabel').textContent = v.band;
    $('dxBandLabel').className = 'dx-band-label is-' + r.band;

    $('dxVerdictH').textContent = v.head;
    $('dxVerdictP').textContent = v.body;

    $('dxLeak').textContent = fmtHours(r.hours) + ' hrs';
    $('dxTarget').textContent = TARGETS[r.target].label;
    $('dxCapacity').textContent = round1(r.recover) + ' hrs';

    /* operations map */
    var map = $('dxMap');
    map.innerHTML = '';
    r.areas.forEach(function (a) {
      var st = a.pc >= 70 ? 'strong' : a.pc >= 40 ? 'exposed' : 'pressure';
      var row = document.createElement('div');
      row.className = 'dx-maprow';
      row.innerHTML =
        '<span class="dx-mapdot is-' + st + '" aria-hidden="true"></span>' +
        '<span class="dx-maplabel">' + a.label + '</span>' +
        '<span class="dx-track"><span class="dx-fill is-' + st + '" style="width:' + a.pc + '%"></span></span>' +
        '<span class="dx-mapval">' + a.pc + '</span>';
      map.appendChild(row);
    });

    /* insight + matrix */
    $('dxInsightH').textContent = 'Your biggest opportunity is ' + TARGETS[r.target].label.toLowerCase() + '.';
    $('dxInsightP').textContent = TARGETS[r.target].body;
    var chips = document.querySelectorAll('[data-opp]');
    for (var c = 0; c < chips.length; c++) {
      chips[c].classList.toggle('is-rec', chips[c].getAttribute('data-opp') === r.target);
    }

    /* before / after */
    var after = Math.max(0, r.hours - r.recover);
    $('dxToday').textContent = round1(r.hours);
    $('dxAfterHrs').textContent = round1(after);
    $('dxSaved').textContent = round1(r.recover);
    $('dxBarToday').style.width = '100%';
    $('dxBarAfter').style.width = (after / r.hours * 100) + '%';
    $('dxMonth').textContent = round1(r.recover * 4.33);
    $('dxYear').textContent = Math.round(r.recover * 52);
    $('dxDays').textContent = Math.round(r.recover * 52 / 8);

    $('dxNextTarget').textContent = TARGETS[r.target].label;
    $('dxNextP').textContent = TARGETS[r.target].body;
    $('dxWeakest').textContent = r.weakest.toLowerCase();

    /* calculator prefill */
    $('cHours').value = round1(r.hours);
    calc();

    applyLock();
  }

  function applyLock() {
    var locked = !state.unlocked;
    var wrap = $('dxLocked');
    wrap.hidden = !locked;
    $('dxFull').hidden = locked;
  }

  /* ---------------- gate ---------------- */
  function submitGate(e) {
    e.preventDefault();
    var f = e.target;
    var name = f.name_.value.trim(), email = f.email.value.trim();
    var msg = $('dxGateMsg');
    if (!name || !email) { msg.textContent = 'Name and email are both needed to send the report.'; return; }
    if (f.phone.value.trim() && !f.consent.checked) {
      msg.textContent = 'Please tick the consent box, or leave the phone field blank.'; return;
    }

    var btn = f.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Sending\u2026';
    msg.textContent = '';

    var r = state.result;
    var payload = {
      source: 'Where Your Week Goes diagnostic',
      name: name, email: email, phone: f.phone.value.trim(),
      company: f.company.value.trim(),
      sms_consent: f.consent.checked,
      score: r.overall, band: VERDICTS[r.band].band,
      weekly_manual_hours: r.hours,
      recoverable_hours: Math.round(r.recover * 10) / 10,
      first_target: TARGETS[r.target].label,
      weakest_area: r.weakest,
      area_scores: r.areas.reduce(function (o, a) { o[a.label] = a.pc; return o; }, {}),
      answers: Q.map(function (q, i) {
        return { question: q.t, answer: state.answers[i] != null ? q.o[state.answers[i]] : null };
      })
    };

    post(payload).then(function () {
      state.unlocked = true; save(); applyLock();
      var top = $('dxFull').getBoundingClientRect().top + window.pageYOffset - 20;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }).catch(function () {
      /* never trap the user behind our own plumbing */
      state.unlocked = true; save(); applyLock();
    });
  }

  function post(payload) {
    if (!GHL_WEBHOOK_URL) return Promise.resolve();
    var body = JSON.stringify(payload);
    return fetch(GHL_WEBHOOK_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body
    }).catch(function () {
      /* retry as a simple request when CORS preflight is refused */
      return fetch(GHL_WEBHOOK_URL, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: body
      });
    });
  }

  /* ---------------- ROI calculator ---------------- */
  function num(id) {
    var v = parseFloat($(id).value);
    return isNaN(v) ? 0 : v;
  }

  function calc() {
    var a = ASSUMPTIONS[$('cAssume').value] || ASSUMPTIONS.expected;
    var hours = num('cHours');
    var rate = num('cRate');
    var weekly = hours * a.auto * a.red;
    var labour = weekly * rate * 52;

    var leadsOn = $('cLeadsOn').checked;
    var enq = num('cEnq'), conv = num('cConv'), pts = num('cPts'),
        job = num('cJob'), margin = num('cMargin');
    var wins = 0, gp = 0, leadsKnown = leadsOn && enq > 0 && conv > 0;
    if (leadsKnown) {
      wins = enq * (pts / 100);
      gp = wins * job * (margin / 100) * 12;
    }

    var oneTime = num('cOneTime'), monthly = num('cMonthly');
    var annualValue = labour + gp;
    var netFirstYear = annualValue - oneTime - (monthly * 12);
    var invest = oneTime + monthly * 12;
    var roi = invest > 0 ? (netFirstYear / invest * 100) : 0;
    var monthlyNet = annualValue / 12 - monthly;
    var payback = monthlyNet > 0 ? oneTime / monthlyNet : null;

    $('oTime').textContent = round1(weekly) + ' hrs';
    $('oLabour').textContent = money(labour);
    $('oGp').textContent = leadsKnown ? money(gp) : 'Track this first';
    $('oGp').className = 'dx-outval' + (leadsKnown ? '' : ' is-soft');
    $('oPayback').textContent = payback ? round1(payback) + ' mo' : 'Not covered';
    $('oNet').textContent = money(netFirstYear);
    $('oRoi').textContent = Math.round(roi) + '%';
    $('oLeads').textContent = leadsKnown
      ? (Math.round(wins * 10) / 10) + ' \u2013 ' + (Math.round(wins * 1.5 * 10) / 10) + ' per month'
      : 'Enter your enquiry volume and conversion rate to estimate this.';

    $('oAssumeText').textContent =
      round1(a.auto * 100) + '% of that work is automatable, and automation removes ' +
      round1(a.red * 100) + '% of the manual time in it. Time is valued at ' + money(rate) +
      ' per hour. ' + (leadsKnown
        ? 'Revenue uses gross profit, not turnover: ' + pts + ' extra percentage points of conversion on ' + enq +
          ' enquiries a month, at ' + money(job) + ' per job and ' + margin + '% margin.'
        : 'No revenue effect is included, because conversion data was not entered.');

    drawChart(oneTime, monthly, annualValue / 12);
  }

  function drawChart(oneTime, monthly, monthlyValue) {
    var svg = $('dxChart');
    if (!svg) return;
    var W = 560, H = 170, padL = 6, padR = 6, padT = 14, padB = 26;
    var months = 12;
    var inv = [], val = [], maxY = 1;
    for (var m = 0; m <= months; m++) {
      var i = oneTime + monthly * m, v = monthlyValue * m;
      inv.push(i); val.push(v);
      maxY = Math.max(maxY, i, v);
    }
    var x = function (m) { return padL + (W - padL - padR) * (m / months); };
    var y = function (n) { return H - padB - (H - padT - padB) * (n / maxY); };

    var pInv = inv.map(function (n, m) { return x(m) + ',' + y(n); }).join(' ');
    var pVal = val.map(function (n, m) { return x(m) + ',' + y(n); }).join(' ');

    var cross = null;
    for (var k = 1; k <= months; k++) { if (val[k] >= inv[k]) { cross = k; break; } }

    var ticks = '';
    [0, 3, 6, 9, 12].forEach(function (m) {
      ticks += '<text x="' + x(m) + '" y="' + (H - 8) + '" class="dx-ct" text-anchor="middle">' + (m === 0 ? '0' : 'M' + m) + '</text>';
    });

    svg.innerHTML =
      '<line x1="' + padL + '" y1="' + y(0) + '" x2="' + (W - padR) + '" y2="' + y(0) + '" stroke="#DFDDD6"/>' +
      ticks +
      '<polyline points="' + pInv + '" fill="none" stroke="#A9A69C" stroke-width="1.75" stroke-dasharray="4 4"/>' +
      '<polyline points="' + pVal + '" fill="none" stroke="#2F6F4F" stroke-width="2.25"/>' +
      (cross ? '<line x1="' + x(cross) + '" y1="' + padT + '" x2="' + x(cross) + '" y2="' + y(0) + '" stroke="#0F3057" stroke-width="1" stroke-dasharray="3 3"/>' +
               '<circle cx="' + x(cross) + '" cy="' + y(val[cross]) + '" r="4" fill="#0F3057"/>' +
               '<text x="' + x(cross) + '" y="' + (padT - 2) + '" class="dx-ct" text-anchor="middle" fill="#0F3057">payback</text>'
             : '');
  }

  /* ---------------- boot ---------------- */
  function init() {
    el.intro = $('dxIntro'); el.quiz = $('dxQuiz'); el.results = $('dxResults');
    el.progFill = $('dxProgFill'); el.progNum = $('dxProgNum');
    el.part = $('dxPart'); el.qtext = $('dxQText'); el.opts = $('dxOpts');
    el.back = $('dxBack'); el.skip = $('dxSkip'); el.qcard = $('dxQCard');

    load();

    $('dxStart').addEventListener('click', function () {
      state.idx = 0; renderQuestion(); show('quiz');
    });

    el.back.addEventListener('click', back);
    el.skip.addEventListener('click', next);

    $('dxRestart').addEventListener('click', function () {
      state.answers = {}; state.idx = 0; state.unlocked = false; save();
      show('intro');
    });

    $('dxGate').addEventListener('submit', submitGate);

    ['cHours','cRate','cAssume','cEnq','cConv','cPts','cJob','cMargin','cOneTime','cMonthly'].forEach(function (id) {
      $(id).addEventListener('input', calc);
      $(id).addEventListener('change', calc);
    });
    $('cLeadsOn').addEventListener('change', function () {
      $('cLeadFields').hidden = !this.checked;
      calc();
    });
    document.querySelectorAll('[data-rate]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('[data-rate]').forEach(function (x) { x.classList.remove('is-on'); });
        this.classList.add('is-on');
        $('cRate').value = this.getAttribute('data-rate');
        calc();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (el.quiz.hidden) return;
      if (e.key >= '1' && e.key <= '5') {
        var i = parseInt(e.key, 10) - 1;
        if (i < Q[state.idx].o.length) { choose(i); e.preventDefault(); }
      } else if (e.key === 'ArrowLeft') { back(); }
      else if (e.key === 'ArrowRight') { next(); }
    });

    /* resume state */
    var done = answeredCount();
    if (done === Q.length) {
      $('dxIntroResume').hidden = false;
      $('dxResumeNote').textContent = 'You have completed this before. Your results are saved.';
      $('dxResume').textContent = 'See my results';
      $('dxResume').addEventListener('click', finish);
    } else if (done > 0) {
      $('dxIntroResume').hidden = false;
      $('dxResumeNote').textContent = 'You answered ' + done + ' of ' + Q.length + ' questions last time.';
      $('dxResume').addEventListener('click', function () { renderQuestion(); show('quiz'); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
