/* Round Hill Consulting — homepage motion */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };

  /* scroll reveal */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* hero transcript */
  var scenarios = [
    { label: 'Incoming call · Tue 9:14 AM', note: 'Owner is on a roof. He finds out at lunch.',
      lines: [
        ['Caller', "Hi, I've got a leak over the garage. Can someone come look at it this week?"],
        ['Assistant', 'Sorry to hear that. I can have someone out Thursday at 10 or Friday at 2. Which works better?'],
        ['Caller', 'Thursday at 10 is good.'],
        ['Assistant', 'Great. Can I get your name, the address, and the best phone and email to reach you?'],
        ['Caller', 'Dana Morales, 412 Alder Street. 503-555-0142, dana.m@gmail.com.'],
        ['Assistant', "Thanks Dana. You're booked for Thursday at 10 at 412 Alder Street. A confirmation text is on its way. Is there anything else?"]],
      actions: ['Estimate booked · Thu 10:00', 'Contact created in CRM', 'Confirmation text sent'] },
    { label: 'Incoming call · Sat 7:52 AM', note: 'All three vans are on jobs. Nobody missed the call.',
      lines: [
        ['Caller', 'Our water heater is leaking all over the floor. How fast can you get here?'],
        ['Assistant', 'I can get a technician to you today between noon and 2. Shall I lock that in?'],
        ['Caller', 'Yes please, as soon as you can.'],
        ['Assistant', 'Can I get your name, the address, and a phone number for the technician?'],
        ['Caller', 'Mark Chen, 88 Vista Court. 503-555-0177.'],
        ['Assistant', "You're on the schedule for today, noon to 2, Mark. A text with the technician's name is on its way."]],
      actions: ['Same-day job booked', 'Dispatcher notified', 'Confirmation text sent'] },
    { label: 'Incoming call · Mon 4:31 PM', note: 'Crew lead was running a mower. Quote request captured anyway.',
      lines: [
        ['Caller', 'Do you do weekly maintenance for a half-acre lot in Glendale?'],
        ['Assistant', 'We do. I can set up a walkthrough for a quote, Wednesday at 8 or Thursday at 3.'],
        ['Caller', 'Wednesday at 8 works.'],
        ['Assistant', 'Perfect. Your name, the property address, and the best phone and email?'],
        ['Caller', 'Priya Patel, 1520 Verdugo Road. 818-555-0139, priya@example.com.'],
        ['Assistant', "Booked for Wednesday at 8, Priya. You'll get a text with the details and a reminder the evening before."]],
      actions: ['Walkthrough booked · Wed 8:00', 'Lead tagged: maintenance', 'Reminder scheduled'] }
  ];
  var body = $('txBody'), acts = $('txActions'), label = $('txLabel'), note = $('txNote');
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function lineEl(who, text, typing) {
    var d = document.createElement('div');
    d.className = 'tx-line' + (who === 'Assistant' ? ' ai' : '');
    d.innerHTML = '<b>' + who + '</b><p><span></span>' + (typing ? '<i class="caret" aria-hidden="true"></i>' : '') + '</p>';
    d.querySelector('span').textContent = text;
    return d;
  }
  function chip(text) {
    var s = document.createElement('span');
    s.className = 'chip-done';
    s.innerHTML = '<span aria-hidden="true">\u2713</span>';
    s.appendChild(document.createTextNode(text));
    return s;
  }
  async function runTranscript() {
    if (!body) return;
    var k = 0;
    while (true) {
      var sc = scenarios[k % scenarios.length]; k++;
      label.textContent = sc.label; note.textContent = sc.note;
      body.innerHTML = ''; acts.innerHTML = '';
      if (reduce) {
        sc.lines.forEach(function (l) { body.appendChild(lineEl(l[0], l[1])); });
        sc.actions.forEach(function (a) { acts.appendChild(chip(a)); });
        await sleep(9000); continue;
      }
      await sleep(900);
      for (var i = 0; i < sc.lines.length; i++) {
        var who = sc.lines[i][0], text = sc.lines[i][1];
        await sleep(who === 'Caller' ? 550 : 400);
        var el = lineEl(who, '', true); body.appendChild(el);
        var span = el.querySelector('span');
        for (var c = 1; c <= text.length; c++) { span.textContent = text.slice(0, c); await sleep(who === 'Caller' ? 28 : 16); }
        el.querySelector('.caret').remove();
      }
      for (var a = 0; a < sc.actions.length; a++) { await sleep(600); acts.appendChild(chip(sc.actions[a])); }
      await sleep(5500);
    }
  }
  runTranscript();

  /* shared tick */
  var t = 0;
  var week = $('week'), weekTitle = $('weekTitle'), weekHours = $('weekHours');
  var before = [[45, 55], [55, 45], [40, 60], [60, 40], [50, 50]];
  function drawWeek(after) {
    if (!week) return;
    var cols = week.querySelectorAll('.week-col');
    for (var i = 0; i < cols.length; i++) {
      var ad = before[i][0], wk = before[i][1];
      cols[i].querChildren = null;
      cols[i].querySelector('.adm').style.height = (after ? Math.round(ad * .3) : ad) + '%';
      cols[i].querySelector('.wrk').style.height = wk + '%';
      cols[i].querySelector('.ai').style.height = (after ? Math.round(ad * .7) : 0) + '%';
    }
    weekTitle.textContent = after ? 'The same week, busywork handed off' : 'A typical week';
    weekHours.textContent = after ? '\u2248 14 hrs back' : '\u2248 20 hrs on admin';
  }
  var tasks = document.querySelectorAll('.task');
  function drawTasks(step) {
    for (var i = 0; i < tasks.length; i++) {
      var done = i < step, now = i === step;
      tasks[i].className = 'task' + (done ? ' is-done' : now ? ' is-now' : '');
      tasks[i].querySelector('b').textContent = done ? '\u2713' : now ? '\u00b7' : '\u25cb';
      tasks[i].querySelector('span').textContent = done ? 'done' : now ? 'working' : 'queued';
    }
  }
  var dash = [
    { stage: ['Framing in progress', 'Framing done', 'Framing done', 'Inspection passed'], next: ['Next: framing', 'Next: inspection Tue', 'Next: inspection Tue', 'Next: electrical'], pct: [40, 55, 55, 70], hot: 1 },
    { stage: ['Permit pending', 'Permit pending', 'Permit approved', 'Demo scheduled'], next: ['Next: city review', 'Next: city review', 'Next: demo Mon', 'Next: demo Mon'], pct: [15, 15, 25, 30], hot: 2 },
    { stage: ['Tear-off complete', 'Tear-off complete', 'Tear-off complete', 'Tear-off complete'], next: ['Next: underlayment', 'Next: underlayment', 'Next: underlayment', 'Next: underlayment'], pct: [60, 60, 60, 60], hot: -1 },
    { stage: ['Quote sent', 'Quote sent', 'Quote sent', 'Quote accepted'], next: ['Follow-up Fri', 'Follow-up Fri', 'Follow-up Fri', 'Next: deposit'], pct: [5, 5, 5, 10], hot: 3 }
  ];
  var stamps = ['Updated from text \u00b7 just now', 'Updated from voice \u00b7 2 min ago', 'Updated from text \u00b7 4 min ago', 'Updated from voice \u00b7 just now'];
  var jt = document.querySelectorAll('.jtile'), stamp = $('dashStamp');
  function drawDash(s) {
    for (var i = 0; i < jt.length; i++) {
      var d = dash[i];
      jt[i].classList.toggle('hot', d.hot === s);
      jt[i].querySelector('.bar i').style.width = d.pct[s] + '%';
      jt[i].querySelector('.stage').textContent = d.stage[s];
      jt[i].querySelector('.next').textContent = d.next[s];
    }
    if (stamp) stamp.textContent = stamps[s];
  }
  function tick() {
    drawWeek(Math.floor(t / 6) % 2 === 1);
    drawTasks(t % 8);
    drawDash(Math.floor(t / 4) % 4);
    t++;
  }
  if (reduce) { drawWeek(true); drawTasks(4); drawDash(1); }
  else { tick(); setInterval(tick, 700); }

  /* count-up */
  var metrics = $('metrics');
  if (metrics) {
    var nums = metrics.querySelectorAll('[data-count]');
    var run = function () {
      var t0 = performance.now(), D = 1300;
      var f = function (now) {
        var p = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - p, 3);
        nums.forEach(function (n) { n.textContent = Math.round(+n.getAttribute('data-count') * e); });
        if (p < 1) requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    };
    if ('IntersectionObserver' in window && !reduce) {
      var mo = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { run(); mo.disconnect(); } }, { threshold: 0.3 });
      mo.observe(metrics);
    } else nums.forEach(function (n) { n.textContent = n.getAttribute('data-count'); });
  }

  /* newsletter */
  var nf = $('newsForm');
  if (nf) nf.addEventListener('submit', function (e) {
    if (!nf.getAttribute('action')) { e.preventDefault(); nf.querySelector('button').textContent = 'Subscribed'; nf.querySelector('input').value = ''; }
  });
})();
