// Turns the numbers into plain sentences a person can act on.
import { countryName, flag, WEEKDAYS } from "./analyticsExtra";

const fmtTime = (s) => (s >= 60 ? `${Math.floor(s / 60)} min ${s % 60 ? `${s % 60} s` : ""}`.trim() : `${s} s`);

// -> [{ tone: "good" | "warn" | "info", icon, title, text }]
export function insights(data, ex) {
  const k = data.kpi;
  const out = [];
  if (!k.sessions) return out;

  const mobile = ex.devices.find((d) => d.dev === "mobile");
  const desktop = ex.devices.find((d) => d.dev === "desktop");
  if (mobile && mobile.share >= 55) {
    out.push({
      tone: "info",
      icon: "📱",
      title: `${mobile.share}% vêm do telemóvel`,
      text: "A página tem de funcionar bem no ecrã pequeno primeiro. Convém testar o scroll e os botões num telemóvel real."
    });
  } else if (desktop && desktop.share >= 55) {
    out.push({
      tone: "info",
      icon: "💻",
      title: `${desktop.share}% vêm do computador`,
      text: "A maior parte vê a página num ecrã grande."
    });
  }
  if (mobile && desktop && mobile.sessions >= 5 && desktop.sessions >= 5 && Math.abs(mobile.ctaPct - desktop.ctaPct) >= 8) {
    const better = mobile.ctaPct > desktop.ctaPct ? "telemóvel" : "computador";
    const worse = better === "telemóvel" ? "computador" : "telemóvel";
    out.push({
      tone: "warn",
      icon: "⚖️",
      title: `No ${better} clicam mais em "Abrir o mapa"`,
      text: `${Math.max(mobile.ctaPct, desktop.ctaPct)}% no ${better} contra ${Math.min(mobile.ctaPct, desktop.ctaPct)}% no ${worse}. Vale a pena ver o que falha no ${worse}.`
    });
  }

  const bestChannel = [...ex.channels].filter((c) => c.sessions >= 3).sort((a, b) => b.ctaPct - a.ctaPct)[0];
  const topChannel = ex.channels[0];
  if (topChannel) {
    out.push({
      tone: "info",
      icon: "🧭",
      title: `Origem principal: ${topChannel.name} (${topChannel.share}%)`,
      text:
        bestChannel && bestChannel.name !== topChannel.name
          ? `Quem mais clica em "Abrir o mapa" vem de ${bestChannel.name} (${bestChannel.ctaPct}%). Pode compensar investir aí.`
          : "É de onde vem a maior parte das visitas."
    });
  }

  if (ex.countries.length) {
    const c = ex.countries[0];
    const place = ex.places[0];
    out.push({
      tone: "info",
      icon: flag(c.cc),
      title: `Mais visitas de ${countryName(c.cc)} (${c.share}%)`,
      text: place ? `A zona mais ativa é ${place.city}. A localização é aproximada, vem do fuso horário.` : ""
    });
  }

  if (ex.hours.best.count >= 3) {
    out.push({
      tone: "info",
      icon: "🕘",
      title: `Hora mais forte: ${WEEKDAYS[ex.hours.best.day]}, ${String(ex.hours.best.hour).padStart(2, "0")}h`,
      text: "É a hora no relógio do visitante. Bom momento para publicar ou lançar algo."
    });
  }

  if (k.bounce >= 60) {
    out.push({
      tone: "warn",
      icon: "🚪",
      title: `${k.bounce}% saem logo`,
      text: "Veem só o início e não fazem nada. Convém rever o que aparece no primeiro ecrã."
    });
  } else if (k.bounce <= 35) {
    out.push({ tone: "good", icon: "✅", title: `Só ${k.bounce}% saem logo`, text: "A maioria continua a explorar a página." });
  }

  // Biggest loss between two funnel steps.
  let worst = null;
  // The last step (a contact sent) is rare by nature, so it is left out.
  for (let i = 1; i < data.funnel.length - 1; i += 1) {
    const a = data.funnel[i - 1].value;
    const b = data.funnel[i].value;
    if (a >= 5) {
      const lost = Math.round(((a - b) / a) * 100);
      if (!worst || lost > worst.lost) worst = { lost, from: data.funnel[i - 1].label, to: data.funnel[i].label };
    }
  }
  if (worst && worst.lost >= 40) {
    out.push({
      tone: "warn",
      icon: "🪣",
      title: `Maior perda: ${worst.lost}%`,
      text: `Entre "${worst.from}" e "${worst.to}". É aqui que mais pessoas desistem.`
    });
  }

  const weak = [...data.sections].filter((s) => s.reach >= 1).sort((a, b) => a.reach - b.reach)[0];
  if (weak && data.sections.length > 2 && weak.reach / k.sessions < 0.35) {
    out.push({
      tone: "warn",
      icon: "👀",
      title: `Poucos chegam à secção ${weak.i}`,
      text: `"${weak.label}" só é vista por ${Math.round((weak.reach / k.sessions) * 100)}% das visitas. Se é importante, subir na página.`
    });
  }

  if (k.rage > 0) {
    const where = data.rage[0] ? ` Mais em "${data.rage[0].label}".` : "";
    out.push({
      tone: "warn",
      icon: "😤",
      title: `${k.rage} cliques repetidos`,
      text: `Pessoas a clicar várias vezes no mesmo sítio, sinal de que algo não responde.${where}`
    });
  }

  if (k.ctaRate >= 10) {
    out.push({
      tone: "good",
      icon: "🎯",
      title: `${k.ctaRate}% clicam em "Abrir o mapa"`,
      text: `Em ${k.sessions} visitas, ${Math.round((k.ctaRate / 100) * k.sessions)} foram para a app.`
    });
  }

  if (k.avgTime) {
    out.push({
      tone: "info",
      icon: "⏱️",
      title: `Ficam em média ${fmtTime(k.avgTime)}`,
      text: `Metade das visitas dura menos de ${fmtTime(k.medianTime)}.`
    });
  }
  return out;
}

// One sentence for the very top.
export function summary(data, ex, days) {
  const k = data.kpi;
  if (!k.sessions) return "Ainda não há visitas neste período.";
  const top = ex.channels[0];
  const dev = ex.devices[0];
  return (
    `Nos últimos ${days} dias houve ${k.sessions} visitas de ${k.visitors} pessoas` +
    (dev ? `, sobretudo de ${dev.dev === "mobile" ? "telemóvel" : dev.dev === "tablet" ? "tablet" : "computador"} (${dev.share}%)` : "") +
    (top ? `, e a maior parte veio de ${top.name.toLowerCase()}` : "") +
    `. ${k.ctaRate}% clicaram em "Abrir o mapa".`
  );
}
