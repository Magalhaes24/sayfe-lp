import React, { useState } from "react";
import { WEEKDAYS } from "./analyticsExtra";

export const PALETTE = ["#3d7a52", "#73ac84", "#e6a817", "#e0723a", "#4f7fb8", "#8e6bb8", "#c4546a", "#8a978f"];

/* A card with a title and a one-line "what is this" that is always visible. */
export function Card({ title, hint, wide, tall, children, right }) {
  return (
    <section className={`vz-card${wide ? " vz-card--wide" : ""}${tall ? " vz-card--tall" : ""}`}>
      <header className="vz-card__head">
        <div>
          <h3>{title}</h3>
          {hint && <p>{hint}</p>}
        </div>
        {right}
      </header>
      {children}
    </section>
  );
}

export const Empty = ({ text = "Ainda sem dados" }) => <p className="vz-empty">{text}</p>;

/* Up / down arrow against the previous period. */
export function Delta({ value, inverse }) {
  if (value === null || value === undefined) return null;
  if (value === 0) return <span className="vz-delta vz-delta--flat">= igual</span>;
  const good = inverse ? value < 0 : value > 0;
  return (
    <span className={`vz-delta ${good ? "vz-delta--good" : "vz-delta--bad"}`}>
      {value > 0 ? "▲" : "▼"} {Math.abs(value)}%
    </span>
  );
}

export function Kpi({ icon, label, value, delta, inverse, hint }) {
  return (
    <div className="vz-kpi" title={hint}>
      <span className="vz-kpi__icon" aria-hidden="true">{icon}</span>
      <strong>{value}</strong>
      <span className="vz-kpi__label">{label}</span>
      <Delta value={delta} inverse={inverse} />
    </div>
  );
}

/* Small line of the sessions per day. */
export function Sparkline({ rows }) {
  if (rows.length < 2) return <Empty text="Precisa de pelo menos 2 dias de dados" />;
  const max = Math.max(1, ...rows.map((r) => r.sessions));
  const w = 100;
  const h = 34;
  const pts = rows.map((r, i) => [(i / (rows.length - 1)) * w, h - 3 - (r.sessions / max) * (h - 8)]);
  const line = pts.map((p) => p.join(",")).join(" ");
  return (
    <div className="vz-spark">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label="Visitas por dia">
        <polygon points={`0,${h} ${line} ${w},${h}`} className="vz-spark__fill" />
        <polyline points={line} className="vz-spark__line" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="vz-spark__axis">
        <span>{rows[0].day}</span>
        <span>pico: {max} visitas</span>
        <span>{rows[rows.length - 1].day}</span>
      </div>
    </div>
  );
}

/* Donut with the legend next to it. */
export function Donut({ rows, center }) {
  const total = rows.reduce((a, r) => a + r.value, 0);
  if (!total) return <Empty />;
  const R = 15.9155;
  let acc = 0;
  return (
    <div className="vz-donut">
      <svg viewBox="0 0 42 42" role="img" aria-label="Distribuição">
        <circle cx="21" cy="21" r={R} className="vz-donut__bg" />
        {rows.map((r, i) => {
          const len = (r.value / total) * 100;
          const el = (
            <circle
              key={r.label}
              cx="21"
              cy="21"
              r={R}
              fill="none"
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth="5.5"
              strokeDasharray={`${len} ${100 - len}`}
              strokeDashoffset={25 - acc}
            >
              <title>{`${r.label}: ${r.value}`}</title>
            </circle>
          );
          acc += len;
          return el;
        })}
        <text x="21" y="22.5" textAnchor="middle" className="vz-donut__center">{center ?? total}</text>
      </svg>
      <ul>
        {rows.map((r, i) => (
          <li key={r.label}>
            <i style={{ background: PALETTE[i % PALETTE.length] }} />
            <span>{r.label}</span>
            <b>{Math.round((r.value / total) * 100)}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Horizontal bars; `icon` can be a function of the row. */
export function HBars({ rows, total, icon, suffix, color }) {
  if (!rows.length) return <Empty />;
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="vz-bars">
      {rows.map((r, i) => (
        <li key={r.label}>
          <span className="vz-bars__label" title={r.label}>
            {icon ? <em>{icon(r)}</em> : null}
            {r.label}
          </span>
          <span className="vz-bars__track">
            <i style={{ width: `${(r.value / max) * 100}%`, background: color || PALETTE[i % PALETTE.length] }} />
          </span>
          <span className="vz-bars__val">
            {r.value}
            {suffix || ""}
            {total ? <small> · {Math.round((r.value / total) * 100)}%</small> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* The funnel as shrinking bars with the loss between steps. */
export function FunnelViz({ steps }) {
  const top = steps[0] ? steps[0].value : 0;
  if (!top) return <Empty />;
  return (
    <ol className="vz-funnel">
      {steps.map((s, i) => {
        const w = Math.max(6, (s.value / top) * 100);
        const prev = i ? steps[i - 1].value : null;
        const lost = prev ? Math.round(((prev - s.value) / prev) * 100) : null;
        return (
          <li key={s.label}>
            <div className="vz-funnel__bar" style={{ width: `${w}%`, opacity: 1 - i * 0.08 }}>
              <span>{s.label}</span>
              <b>{s.value}</b>
            </div>
            <div className="vz-funnel__meta">
              <span>{Math.round((s.value / top) * 100)}% do total</span>
              {lost !== null && lost > 0 && <span className="vz-funnel__lost">−{lost}% face ao passo anterior</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* Weekday x hour grid: darker = more visits. */
export function HourGrid({ hours }) {
  const [tip, setTip] = useState("");
  if (!hours.max) return <Empty />;
  return (
    <div className="vz-hours">
      <div className="vz-hours__grid" role="img" aria-label="Visitas por dia da semana e hora">
        {hours.grid.map((row, d) => (
          <React.Fragment key={d}>
            <span className="vz-hours__day">{WEEKDAYS[d]}</span>
            {row.map((n, h) => (
              <i
                key={h}
                style={{ opacity: n ? 0.18 + (n / hours.max) * 0.82 : 0.06 }}
                onMouseEnter={() => setTip(`${WEEKDAYS[d]}, ${String(h).padStart(2, "0")}h: ${n} visitas`)}
                onMouseLeave={() => setTip("")}
                title={`${WEEKDAYS[d]}, ${String(h).padStart(2, "0")}h: ${n}`}
              />
            ))}
          </React.Fragment>
        ))}
        <span />
        {Array.from({ length: 24 }, (_, h) => (
          <span key={h} className="vz-hours__h">{h % 3 === 0 ? h : ""}</span>
        ))}
      </div>
      <p className="vz-hours__tip">{tip || "Passa o rato por um quadrado. Horas no relógio do visitante."}</p>
    </div>
  );
}

/* A simple tab bar. */
export function Tabs({ tabs, value, onChange }) {
  return (
    <nav className="vz-tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          className={value === t.id ? "on" : ""}
          onClick={() => onChange(t.id)}
        >
          <span aria-hidden="true">{t.icon}</span> {t.label}
        </button>
      ))}
    </nav>
  );
}
