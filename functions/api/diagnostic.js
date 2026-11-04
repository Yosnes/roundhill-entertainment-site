/* Cloudflare Pages Function — POST /api/diagnostic
   Emails the "Where Your Week Goes" report to the visitor and a full lead
   copy to info@roundhillentertainment.com, both via Resend.

   Environment variables (Pages → Settings → Environment variables):
     RESEND_API_KEY   re_xxxxxxxx                                   required
     CONTACT_FROM     Round Hill Consulting <noreply@roundhillentertainment.com>
                      Domain must be verified in Resend.
     CONTACT_TO       info@roundhillentertainment.com               optional
     CALENDLY_URL     https://calendly.com/…                        optional
*/

const TO_DEFAULT = 'info@roundhillentertainment.com';
const FROM_DEFAULT = 'Round Hill Consulting <noreply@roundhillentertainment.com>';
const CAL_DEFAULT = 'https://calendly.com/andrew-projectfutureself/round-hill-consulting-30-min';

const NAVY = '#0F3057';
const INK = '#16181C';
const DIM = '#5A5F66';
const RULE = '#DFDDD6';
const PAPER = '#FBFAF7';

const esc = (s) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });

const barColor = (pc) => (pc >= 70 ? '#2F6F4F' : pc >= 40 ? '#B07C28' : '#A24A2E');

function areaRows(areas) {
  if (!Array.isArray(areas) || !areas.length) return '';
  return areas
    .map((a) => {
      const pc = Math.max(0, Math.min(100, Number(a.pc) || 0));
      return (
        `<tr>` +
        `<td style="padding:7px 14px 7px 0;font-size:14px;color:${INK};white-space:nowrap">${esc(a.label)}</td>` +
        `<td style="padding:7px 12px 7px 0;width:100%">` +
        `<table cellpadding="0" cellspacing="0" style="width:100%;background:#E9E7E0;border-radius:3px">` +
        `<tr><td style="width:${pc}%;height:7px;background:${barColor(pc)};border-radius:3px;font-size:0;line-height:0">&nbsp;</td>` +
        `<td style="font-size:0;line-height:0">&nbsp;</td></tr></table></td>` +
        `<td style="padding:7px 0;font-size:13px;color:${DIM};text-align:right">${pc}</td>` +
        `</tr>`
      );
    })
    .join('');
}

function shell(inner) {
  return (
    `<div style="background:#F1EFE9;padding:28px 16px">` +
    `<div style="max-width:600px;margin:0 auto;background:${PAPER};border:1px solid ${RULE};` +
    `font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK};line-height:1.6">` +
    inner +
    `</div></div>`
  );
}

const eyebrow = (t) =>
  `<p style="margin:0 0 14px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8A8F96">${esc(t)}</p>`;

const h = (t) =>
  `<h1 style="margin:0 0 16px;font-size:26px;line-height:1.2;font-weight:400;color:${NAVY}">${esc(t)}</h1>`;

const p = (t) => `<p style="margin:0 0 16px;font-size:15px;color:${DIM}">${esc(t)}</p>`;

const label = (t) =>
  `<p style="margin:26px 0 8px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8A8F96">${esc(t)}</p>`;

function clientEmail(d, calUrl) {
  const first = String(d.name || '').split(' ')[0];
  return shell(
    `<div style="padding:34px 36px 8px">` +
      eyebrow('Where your week goes · your report') +
      h(d.verdict_head || 'Your operations report') +
      p(`${first ? first + ', t' : 'T'}hanks for working through the diagnostic. Here is where your week is going.`) +
      `<table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid ${RULE};background:#fff;margin:6px 0 4px">` +
      `<tr>` +
      `<td style="padding:18px 20px;border-right:1px solid ${RULE}">` +
      `<p style="margin:0;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#8A8F96">Score</p>` +
      `<p style="margin:6px 0 0;font-size:30px;line-height:1;color:${NAVY}">${esc(d.score)}<span style="font-size:14px;color:#8A8F96"> /100</span></p>` +
      `<p style="margin:6px 0 0;font-size:13px;color:${DIM}">${esc(d.band)}</p></td>` +
      `<td style="padding:18px 20px;border-right:1px solid ${RULE}">` +
      `<p style="margin:0;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#8A8F96">Manual hours / wk</p>` +
      `<p style="margin:6px 0 0;font-size:30px;line-height:1;color:${NAVY}">${esc(d.weekly_manual_hours)}</p></td>` +
      `<td style="padding:18px 20px">` +
      `<p style="margin:0;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#8A8F96">Recoverable</p>` +
      `<p style="margin:6px 0 0;font-size:30px;line-height:1;color:#1B7F58">${esc(d.recoverable_hours)}</p></td>` +
      `</tr></table>` +
      (d.verdict_body ? label('The read') + p(d.verdict_body) : '') +
      (Array.isArray(d.areas) && d.areas.length
        ? label('Operations map') +
          `<table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:6px">${areaRows(d.areas)}</table>`
        : '') +
      (d.first_target
        ? label('Start here') +
          `<p style="margin:0 0 8px;font-size:17px;color:${INK}">${esc(d.first_target)}</p>` +
          (d.first_target_body ? p(d.first_target_body) : '')
        : '') +
      (d.verdict_move ? label('First move') + p(d.verdict_move) : '') +
      (d.verdict_unlock ? label('What that unlocks') + p(d.verdict_unlock) : '') +
      `<div style="border-top:1px solid ${RULE};margin-top:26px;padding:26px 0 30px">` +
      `<p style="margin:0 0 16px;font-size:15px;color:${INK}">Want to go through this on a call? Thirty minutes, no deck and no jargon.</p>` +
      `<a href="${esc(calUrl)}" style="display:inline-block;background:${NAVY};color:${PAPER};text-decoration:none;font-size:15px;padding:13px 24px;border-radius:2px">Book a 30-minute call</a>` +
      `</div>` +
      `</div>` +
      `<div style="border-top:1px solid ${RULE};padding:16px 36px;font-size:12px;color:#8A8F96">` +
      `Round Hill Entertainment LLC d/b/a Round Hill Consulting · ` +
      `<a href="mailto:${TO_DEFAULT}" style="color:#8A8F96">${TO_DEFAULT}</a></div>`
  );
}

function clientText(d, calUrl) {
  const L = [];
  L.push('WHERE YOUR WEEK GOES — YOUR REPORT');
  L.push('');
  if (d.verdict_head) L.push(d.verdict_head);
  L.push('');
  L.push(`Score: ${d.score}/100 (${d.band})`);
  L.push(`Manual hours per week: ${d.weekly_manual_hours}`);
  L.push(`Recoverable: ${d.recoverable_hours}`);
  if (d.verdict_body) L.push('', 'THE READ', d.verdict_body);
  if (Array.isArray(d.areas) && d.areas.length) {
    L.push('', 'OPERATIONS MAP');
    d.areas.forEach((a) => L.push(`  ${a.label}: ${a.pc}`));
  }
  if (d.first_target) {
    L.push('', 'START HERE', d.first_target);
    if (d.first_target_body) L.push(d.first_target_body);
  }
  if (d.verdict_move) L.push('', 'FIRST MOVE', d.verdict_move);
  if (d.verdict_unlock) L.push('', 'WHAT THAT UNLOCKS', d.verdict_unlock);
  L.push('', `Book a 30-minute call: ${calUrl}`);
  L.push('', 'Round Hill Entertainment LLC d/b/a Round Hill Consulting');
  return L.join('\n');
}

function leadEmail(d) {
  const answers = Array.isArray(d.answers)
    ? d.answers
        .filter((a) => a && a.answer)
        .map(
          (a) =>
            `<tr><td style="padding:6px 16px 6px 0;font-size:13px;color:${DIM};vertical-align:top">${esc(a.question)}</td>` +
            `<td style="padding:6px 0;font-size:13px;color:${INK};vertical-align:top">${esc(a.answer)}</td></tr>`
        )
        .join('')
    : '';

  return shell(
    `<div style="padding:30px 34px 34px">` +
      eyebrow('New diagnostic lead') +
      `<h1 style="margin:0 0 4px;font-size:24px;font-weight:400;color:${NAVY}">${esc(d.name)}</h1>` +
      `<p style="margin:0 0 20px;font-size:15px;color:${DIM}">${esc(d.company) || '—'}</p>` +
      `<table cellpadding="0" cellspacing="0" style="margin-bottom:22px">` +
      `<tr><td style="padding:3px 16px 3px 0;font-size:13px;color:#8A8F96">Email</td><td style="font-size:14px"><a href="mailto:${esc(d.email)}" style="color:${NAVY}">${esc(d.email)}</a></td></tr>` +
      `<tr><td style="padding:3px 16px 3px 0;font-size:13px;color:#8A8F96">Phone</td><td style="font-size:14px">${esc(d.phone) || '—'}</td></tr>` +
      `<tr><td style="padding:3px 16px 3px 0;font-size:13px;color:#8A8F96">SMS consent</td><td style="font-size:14px">${d.sms_consent ? 'Yes' : 'No'}</td></tr>` +
      `<tr><td style="padding:3px 16px 3px 0;font-size:13px;color:#8A8F96">Score</td><td style="font-size:14px"><strong>${esc(d.score)}/100</strong> · ${esc(d.band)}</td></tr>` +
      `<tr><td style="padding:3px 16px 3px 0;font-size:13px;color:#8A8F96">Manual hrs/wk</td><td style="font-size:14px">${esc(d.weekly_manual_hours)} · recoverable ${esc(d.recoverable_hours)}</td></tr>` +
      `<tr><td style="padding:3px 16px 3px 0;font-size:13px;color:#8A8F96">Weakest</td><td style="font-size:14px">${esc(d.weakest_area)}</td></tr>` +
      `<tr><td style="padding:3px 16px 3px 0;font-size:13px;color:#8A8F96">First target</td><td style="font-size:14px">${esc(d.first_target)}</td></tr>` +
      `</table>` +
      (Array.isArray(d.areas) && d.areas.length
        ? label('Operations map') +
          `<table cellpadding="0" cellspacing="0" style="width:100%">${areaRows(d.areas)}</table>`
        : '') +
      (answers
        ? label('Every answer') + `<table cellpadding="0" cellspacing="0" style="width:100%">${answers}</table>`
        : '') +
      `</div>`
  );
}

async function send(env, body) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

export async function onRequestPost({ request, env }) {
  let d;
  try {
    d = await request.json();
  } catch {
    return json(400, { error: 'Bad request' });
  }

  const name = String(d.name || '').trim().slice(0, 120);
  const email = String(d.email || '').trim().slice(0, 200);
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json(400, { error: 'Name and a valid email are both needed.' });
  }
  if (!env.RESEND_API_KEY) return json(500, { error: 'Mail is not configured.' });

  const from = env.CONTACT_FROM || FROM_DEFAULT;
  const to = env.CONTACT_TO || TO_DEFAULT;
  const cal = env.CALENDLY_URL || CAL_DEFAULT;
  const data = { ...d, name, email };

  const results = await Promise.allSettled([
    send(env, {
      from,
      to: [email],
      reply_to: to,
      subject: `Your operations report — ${data.score}/100`,
      html: clientEmail(data, cal),
      text: clientText(data, cal)
    }),
    send(env, {
      from,
      to: [to],
      reply_to: email,
      subject: `Diagnostic — ${name}${data.company ? ', ' + data.company : ''} — ${data.score}/100 (${data.band})`,
      html: leadEmail(data)
    })
  ]);

  results.forEach((r, i) => {
    if (r.status === 'rejected') console.error(i === 0 ? 'client email failed' : 'lead email failed', r.reason);
  });

  // The visitor's report unlocks regardless; report partial failure honestly.
  const ok = results.every((r) => r.status === 'fulfilled');
  return json(ok ? 200 : 207, { ok, sent: results.map((r) => r.status === 'fulfilled') });
}

export const onRequestGet = () => json(405, { error: 'Method not allowed' });
