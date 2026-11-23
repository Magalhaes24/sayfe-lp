// Extra numbers built from the session list: where visitors come from (channel,
// source, campaign), where they are (from the time zone, never from an IP),
// when they visit, and how engaged each group is.
import { ZONES } from "./geoData";

/* ------------------------------ traffic source ----------------------------- */

const AI = [
  [/chatgpt|openai/, "ChatGPT"],
  [/perplexity/, "Perplexity"],
  [/claude\.ai|anthropic/, "Claude"],
  [/gemini\.google|bard\.google/, "Gemini"],
  [/copilot\.microsoft|bing\.com\/chat/, "Copilot"],
  [/phind|you\.com/, "Outro assistente"]
];
const SEARCH = [
  [/google\./, "Google"],
  [/bing\./, "Bing"],
  [/duckduckgo/, "DuckDuckGo"],
  [/ecosia/, "Ecosia"],
  [/yahoo\./, "Yahoo"],
  [/brave/, "Brave"],
  [/yandex/, "Yandex"],
  [/baidu/, "Baidu"],
  [/qwant/, "Qwant"],
  [/startpage/, "Startpage"]
];
const SOCIAL = [
  [/instagram/, "Instagram"],
  [/facebook|fb\.com|(^|\.)fb\./, "Facebook"],
  [/tiktok/, "TikTok"],
  [/linkedin|lnkd/, "LinkedIn"],
  [/(^|\.)t\.co$|twitter|(^|\.)x\.com$/, "X / Twitter"],
  [/youtube|youtu\.be/, "YouTube"],
  [/pinterest/, "Pinterest"],
  [/reddit/, "Reddit"],
  [/whatsapp|wa\.me/, "WhatsApp"],
  [/telegram|(^|\.)t\.me$/, "Telegram"],
  [/threads/, "Threads"]
];
const MAIL = /(^|\.)mail\.|outlook|gmail|proton|webmail|newsletter/;
const PAID = /^(cpc|ppc|paid|paidsocial|paid-social|paid_social|display|banner|ads|ad|cpm|sponsored)$/;

const find = (table, text) => {
  const hit = table.find(([re]) => re.test(text));
  return hit ? hit[1] : null;
};

// -> { channel, source }
export function channelOf(ctx = {}) {
  const ref = (ctx.ref || "").toLowerCase();
  const us = (ctx.us || "").toLowerCase();
  const um = (ctx.um || "").toLowerCase();

  if (PAID.test(um)) return { channel: "Pago", source: us || ref || "campanha" };
  if (um === "email" || um === "newsletter" || um === "e-mail") return { channel: "Email", source: us || ref || "email" };

  const hint = `${us} ${ref}`.trim();
  if (hint) {
    const ai = find(AI, hint);
    if (ai) return { channel: "Assistentes de IA", source: ai };
    const social = find(SOCIAL, hint);
    if (social) return { channel: "Redes sociais", source: social };
    const search = find(SEARCH, hint);
    if (search) return { channel: "Pesquisa", source: search };
  }
  if (ref && /(^|\.)allercarte\.com$/.test(ref)) return { channel: "App AllerCarte", source: "allercarte.com" };
  if (ref && MAIL.test(ref)) return { channel: "Email", source: ref };
  if (ref) return { channel: "Outros sites", source: ref };
  if (us) return { channel: "Outros sites", source: us };
  return { channel: "Direto", source: "direto ou desconhecido" };
}

export const CHANNEL_HELP = {
  Direto: "Escreveram o endereço, usaram um favorito ou vieram de uma app que não diz de onde.",
  Pesquisa: "Vieram dos resultados de um motor de pesquisa (Google, Bing…).",
  "Redes sociais": "Vieram de um link no Instagram, TikTok, Facebook, LinkedIn…",
  "Assistentes de IA": "Vieram de uma resposta do ChatGPT, Perplexity, Claude, Gemini…",
  Email: "Vieram de um e-mail ou de uma newsletter.",
  Pago: "Vieram de um anúncio (a ligação tinha utm_medium=cpc, paid…).",
  "App AllerCarte": "Vieram da própria app AllerCarte para esta página.",
  "Outros sites": "Vieram de um link noutro site."
};

/* --------------------------------- places --------------------------------- */

const prettyCity = (tz) => tz.split("/").pop().replace(/_/g, " ");

export function placeOf(tz) {
  const z = tz && ZONES[tz];
  if (!z) return { cc: "", city: "Desconhecido", tz: "", lat: null, lon: null };
  return { cc: z[0], city: prettyCity(tz), tz, lat: z[1], lon: z[2] };
}

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(["pt-PT", "pt"], { type: "region" });
  } catch (e) {
    return null;
  }
})();

export const countryName = (cc) => {
  if (!cc) return "Desconhecido";
  try {
    return (regionNames && regionNames.of(cc)) || cc;
  } catch (e) {
    return cc;
  }
};

export const flag = (cc) =>
  cc && cc.length === 2
    ? String.fromCodePoint(...cc.toUpperCase().split("").map((c) => 127397 + c.charCodeAt(0)))
    : "🌐";

/* ---------------------------------- time ---------------------------------- */

const formatters = new Map();
const DAYS = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

function localParts(ts, tz) {
  let f = formatters.get(tz || "UTC");
  if (!f) {
    try {
      f = new Intl.DateTimeFormat("en-GB", { timeZone: tz || "UTC", weekday: "short", hour: "2-digit", hourCycle: "h23" });
    } catch (e) {
      f = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", hour: "2-digit", hourCycle: "h23" });
    }
    formatters.set(tz || "UTC", f);
  }
  const parts = f.formatToParts(new Date(ts));
  const day = DAYS[(parts.find((p) => p.type === "weekday") || {}).value] ?? 0;
  const hour = Number((parts.find((p) => p.type === "hour") || {}).value) || 0;
  return { day, hour };
}

export const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

/* --------------------------------- extras --------------------------------- */

const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

const DURATIONS = [
  ["Menos de 10 s", 0, 10],
  ["10 a 30 s", 10, 30],
  ["30 s a 1 min", 30, 60],
  ["1 a 3 min", 60, 180],
  ["Mais de 3 min", 180, Infinity]
];

const WIDTHS = [
  ["Até 400 px", 0, 400],
  ["400 a 800 px", 400, 800],
  ["800 a 1200 px", 800, 1200],
  ["1200 a 1600 px", 1200, 1600],
  ["Mais de 1600 px", 1600, Infinity]
];

export function extra(list) {
  const total = list.length;
  const channels = new Map();
  const sources = new Map();
  const campaigns = new Map();
  const landing = new Map();
  const countries = new Map();
  const places = new Map();
  const devices = new Map();
  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  const durations = DURATIONS.map(([label]) => ({ label, value: 0 }));
  const widths = WIDTHS.map(([label]) => ({ label, value: 0 }));
  const visits = { first: 0, second: 0, few: 0, many: 0 };
  let known = 0;
  let returning = 0;

  const bump = (map, key, s) => {
    const row = map.get(key) || { sessions: 0, engaged: 0, cta: 0, sent: 0, ms: 0 };
    row.sessions += 1;
    if (s.ms >= 10000) row.engaged += 1;
    if (s.cta) row.cta += 1;
    if (s.sent) row.sent += 1;
    row.ms += s.ms;
    map.set(key, row);
    return row;
  };

  list.forEach((s) => {
    const c = s.ctx || {};
    const { channel, source } = channelOf(c);
    bump(channels, channel, s);
    bump(sources, `${channel}|${source}`, s);
    if (c.uc) bump(campaigns, c.uc, s);
    bump(landing, c.lp || "/", s);

    const place = placeOf(c.tz);
    if (place.cc) {
      known += 1;
      bump(countries, place.cc, s);
      const row = bump(places, place.tz, s);
      row.place = place;
    }
    bump(devices, c.dev || "desktop", s);

    const when = localParts(s.ts, c.tz);
    grid[when.day][when.hour] += 1;

    const secs = s.ms / 1000;
    durations[DURATIONS.findIndex(([, lo, hi]) => secs >= lo && secs < hi)].value += 1;
    const w = c.vw || 0;
    widths[WIDTHS.findIndex(([, lo, hi]) => w >= lo && w < hi)].value += 1;

    const vc = c.vc || 1;
    if (c.rv) returning += 1;
    if (vc <= 1) visits.first += 1;
    else if (vc === 2) visits.second += 1;
    else if (vc <= 5) visits.few += 1;
    else visits.many += 1;
  });

  const rows = (map, keyName = "label") =>
    Array.from(map.entries())
      .map(([key, r]) => ({
        [keyName]: key,
        ...r,
        share: pct(r.sessions, total),
        engagedPct: pct(r.engaged, r.sessions),
        ctaPct: pct(r.cta, r.sessions),
        avgMs: r.sessions ? Math.round(r.ms / r.sessions) : 0
      }))
      .sort((a, b) => b.sessions - a.sessions);

  let best = { day: 0, hour: 0, count: 0 };
  let max = 0;
  grid.forEach((row, d) =>
    row.forEach((n, h) => {
      if (n > max) max = n;
      if (n > best.count) best = { day: d, hour: h, count: n };
    })
  );

  return {
    channels: rows(channels, "name"),
    sources: rows(sources, "key").map((r) => {
      const [channel, source] = r.key.split("|");
      return { ...r, channel, source };
    }),
    campaigns: rows(campaigns).slice(0, 8),
    landing: rows(landing).slice(0, 8),
    countries: rows(countries, "cc").map((r) => ({ ...r, name: countryName(r.cc) })),
    places: rows(places, "tz").map((r) => ({ ...r.place, ...r, label: r.place.city })),
    knownShare: pct(known, total),
    devices: rows(devices, "dev"),
    hours: { grid, max, best },
    durations,
    widths,
    visits,
    returningPct: pct(returning, total)
  };
}

// Percentage change between two periods; null when there is nothing to compare.
export function change(now, before) {
  if (!before) return null;
  return Math.round(((now - before) / before) * 100);
}
