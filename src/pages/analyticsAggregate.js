// Turns raw analytics batches into the numbers the dashboard shows.

const median = (list) => {
  if (!list.length) return 0;
  const sorted = [...list].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

const p75 = (list) => {
  if (!list.length) return 0;
  const sorted = [...list].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.75))];
};

const tally = (map, key, by = 1) => {
  map.set(key, (map.get(key) || 0) + by);
};

const top = (map, n = 8) =>
  Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, value]) => ({ label, value }));

const dayKey = (ms) => new Date(ms).toISOString().slice(0, 10);

export function aggregate(batches) {
  const sessions = new Map();
  const visitors = new Set();
  const days = new Map();
  const sectionStats = new Map();
  const clickStats = new Map();
  const rageStats = new Map();
  const vitals = {};
  const errors = new Map();
  const forms = new Map();
  const events = new Map();
  const pages = new Map();
  const langSwitches = { count: 0 };
  const clicksPts = [];
  const gridPts = [];

  batches.forEach((batch) => {
    const ctx = batch.ctx || {};
    visitors.add(batch.vid);
    let s = sessions.get(batch.sid);
    if (!s) {
      s = {
        vid: batch.vid,
        ctx,
        ts: batch.ts,
        pvs: 0,
        ms: 0,
        sd: 0,
        ck: 0,
        cta: false,
        sent: false,
        rage: 0,
        paths: new Set()
      };
      sessions.set(batch.sid, s);
    }
    s.ts = Math.min(s.ts, batch.ts);
    if (ctx.ref || ctx.us) s.ctx = ctx; // keep the context that carries the source

    const day = dayKey(batch.ts);
    const d = days.get(day) || { sessions: new Set(), pv: 0 };
    d.sessions.add(batch.sid);
    days.set(day, d);

    (batch.ev || []).forEach((e) => {
      switch (e.t) {
        case "pv":
          s.pvs += 1;
          d.pv += 1;
          s.paths.add(e.p);
          tally(pages, e.p || "/");
          break;
        case "pe":
          s.ms += e.ms || 0;
          s.sd = Math.max(s.sd, e.sd || 0);
          break;
        case "sc":
          s.sd = Math.max(s.sd, e.d || 0);
          break;
        case "sv": {
          const key = `${e.p || "/"}#${e.s}`;
          const st = sectionStats.get(key) || { path: e.p, i: e.s, labels: new Map(), sessions: new Set(), ms: 0, n: 0 };
          st.sessions.add(batch.sid);
          st.ms += e.ms || 0;
          st.n += 1;
          if (e.l) tally(st.labels, e.l);
          sectionStats.set(key, st);
          break;
        }
        case "ck": {
          s.ck += 1;
          const key = `${e.el}|${e.tx || ""}|${e.h || ""}`;
          const c = clickStats.get(key) || { el: e.el, tx: e.tx, h: e.h, k: e.k, ia: e.ia, ob: e.ob, n: 0 };
          c.n += 1;
          clickStats.set(key, c);
          if (e.ob) s.cta = true;
          if (e.p === "/" || !e.p) clicksPts.push(e);
          break;
        }
        case "rg": {
          s.rage += 1;
          tally(rageStats, e.el || "?");
          break;
        }
        case "mm":
          (e.g || []).forEach((cell) => gridPts.push({ cx: cell[0], cy: cell[1], n: cell[2], dev: e.dev }));
          break;
        case "fm": {
          const f = forms.get(e.f) || { start: 0, submit: 0, abandon: 0, last: new Map() };
          if (e.a === "start") f.start += 1;
          if (e.a === "submit") f.submit += 1;
          forms.set(e.f, f);
          break;
        }
        case "fa": {
          const f = forms.get(e.f) || { start: 0, submit: 0, abandon: 0, last: new Map() };
          f.abandon += 1;
          tally(f.last, e.fld || "?");
          forms.set(e.f, f);
          break;
        }
        case "ev":
          tally(events, e.n);
          if (e.n === "contact_sent") s.sent = true;
          break;
        case "lg":
          langSwitches.count += 1;
          break;
        case "er":
          tally(errors, e.m || "?");
          break;
        case "wv": {
          const key = `${e.n}|${e.dev || "?"}`;
          (vitals[key] = vitals[key] || []).push(e.v);
          break;
        }
        default:
      }
    });
  });

  const list = Array.from(sessions.values());
  const total = list.length;
  const engaged = list.filter((s) => s.ms >= 10000);
  const bounced = list.filter((s) => s.pvs <= 1 && s.sd < 50 && s.ck === 0 && s.ms < 10000);
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

  const sources = new Map();
  const devices = new Map();
  const os = new Map();
  const browsers = new Map();
  const langs = new Map();
  const zones = new Map();
  list.forEach((s) => {
    const c = s.ctx || {};
    tally(sources, c.us ? `${c.us}${c.um ? " / " + c.um : ""}` : c.ref || "direto");
    tally(devices, c.dev || "?");
    tally(os, c.os || "?");
    tally(browsers, c.br || "?");
    tally(langs, c.lang || "?");
    tally(zones, (c.tz || "?").split("/")[0]);
  });

  const funnel = [
    { label: "Sessões", value: total },
    { label: "Ficaram 10s+", value: engaged.length },
    { label: "Scroll 50%", value: list.filter((s) => s.sd >= 50).length },
    { label: "Scroll até ao fim", value: list.filter((s) => s.sd >= 97).length },
    { label: "Clicaram no CTA", value: list.filter((s) => s.cta).length },
    { label: "Enviaram contacto", value: list.filter((s) => s.sent).length }
  ];

  const scrollReach = [25, 50, 75, 100].map((m) => ({
    label: `${m}%`,
    value: list.filter((s) => (m === 100 ? s.sd >= 97 : s.sd >= m)).length
  }));

  const sections = Array.from(sectionStats.values())
    .map((st) => ({
      key: `${st.path}#${st.i}`,
      i: st.i,
      path: st.path,
      label: top(st.labels, 1)[0]?.label || `Secção ${st.i}`,
      reach: st.sessions.size,
      avgMs: Math.round(st.ms / Math.max(1, st.sessions.size))
    }))
    .filter((s) => s.path === "/")
    .sort((a, b) => a.i - b.i);

  // How far each session on the home page scrolled, for the scroll heatmap.
  const sdList = list.filter((s) => s.paths.has("/")).map((s) => s.sd);

  const clicks = Array.from(clickStats.values()).sort((a, b) => b.n - a.n).slice(0, 15);
  const dead = clicks.filter((c) => !c.ia).slice(0, 8);

  const vitalRows = Object.keys(vitals)
    .map((key) => {
      const [name, dev] = key.split("|");
      return { name, dev, p75: p75(vitals[key]), n: vitals[key].length };
    })
    .sort((a, b) => a.name.localeCompare(b.name) || a.dev.localeCompare(b.dev));

  const daily = Array.from(days.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, v]) => ({ day, sessions: v.sessions.size, pv: v.pv }));

  return {
    kpi: {
      visitors: visitors.size,
      sessions: total,
      pageviews: list.reduce((a, s) => a + s.pvs, 0),
      avgTime: total ? Math.round(list.reduce((a, s) => a + s.ms, 0) / total / 1000) : 0,
      medianTime: Math.round(median(list.map((s) => s.ms)) / 1000),
      bounce: pct(bounced.length),
      returning: pct(list.filter((s) => s.ctx && s.ctx.rv).length),
      ctaRate: pct(list.filter((s) => s.cta).length),
      rage: list.reduce((a, s) => a + s.rage, 0),
      langSwitches: langSwitches.count
    },
    daily,
    funnel,
    scrollReach,
    sources: top(sources),
    devices: top(devices),
    os: top(os),
    browsers: top(browsers),
    langs: top(langs),
    zones: top(zones),
    pages: top(pages),
    sections,
    clicks,
    dead,
    rage: top(rageStats),
    forms: Array.from(forms.entries()).map(([id, f]) => ({
      id,
      ...f,
      last: top(f.last, 3).map((x) => x.label).join(", ")
    })),
    events: top(events),
    errors: top(errors),
    vitals: vitalRows,
    clicksPts,
    gridPts,
    sdList
  };
}
