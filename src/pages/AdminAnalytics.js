import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { aggregate } from "./analyticsAggregate";
import { setIgnoreSelf } from "../analytics/tracker";
import Seo from "../components/Seo";
import "./Admin.css";
import "./AdminAnalytics.css";

const ADMIN_EMAIL = "franciscomagalhaes04@gmail.com";
const MAX_BATCHES = 4000;
const WIDTHS = { desktop: 1280, tablet: 820, mobile: 390 };

const fmtTime = (s) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);

function Bars({ rows, total }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="aa-bars">
      {rows.map((r) => (
        <li key={r.label}>
          <span className="aa-bars__label" title={r.label}>{r.label}</span>
          <span className="aa-bars__track"><i style={{ width: `${(r.value / max) * 100}%` }} /></span>
          <span className="aa-bars__val">
            {r.value}{total ? ` · ${Math.round((r.value / total) * 100)}%` : ""}
          </span>
        </li>
      ))}
      {!rows.length && <li className="aa-empty">Sem dados</li>}
    </ul>
  );
}

function Card({ title, children, wide }) {
  return (
    <section className={`aa-card${wide ? " aa-card--wide" : ""}`}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function Daily({ rows }) {
  if (!rows.length) return <p className="aa-empty">Sem dados</p>;
  const max = Math.max(1, ...rows.map((r) => r.sessions));
  const w = 100 / rows.length;
  return (
    <svg className="aa-daily" viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label="Sessões por dia">
      {rows.map((r, i) => {
        const h = (r.sessions / max) * 34;
        return (
          <g key={r.day}>
            <rect x={i * w + w * 0.12} y={36 - h} width={w * 0.76} height={Math.max(h, 0.5)} rx="0.6" />
            <title>{`${r.day}: ${r.sessions} sessões, ${r.pv} páginas`}</title>
          </g>
        );
      })}
    </svg>
  );
}

function Heatmap({ data }) {
  const [dev, setDev] = useState("desktop");
  const [kind, setKind] = useState("clicks");
  const [height, setHeight] = useState(3000);
  const frame = useRef(null);
  const canvas = useRef(null);
  const width = WIDTHS[dev];

  const points = useMemo(() => {
    if (kind === "clicks") {
      return data.clicksPts
        .filter((p) => p.dev === dev)
        .map((p) => ({ x: (p.x / 1000) * width, y: p.y, w: 1, r: 26 }));
    }
    return data.gridPts
      .filter((p) => p.dev === dev)
      .map((p) => ({ x: ((p.cx + 0.5) / 50) * width, y: p.cy * 100 + 50, w: Math.min(p.n, 12) / 3, r: 46 }));
  }, [data, dev, kind, width]);

  const measure = useCallback(() => {
    const doc = frame.current && frame.current.contentDocument;
    if (!doc || !doc.documentElement) return;
    // Show everything that normally fades in on scroll, so clicks line up with visible content.
    if (!doc.getElementById("aa-force")) {
      const style = doc.createElement("style");
      style.id = "aa-force";
      style.textContent =
        ".st-reveal,[data-depth-p],.mx-rise{opacity:1!important;transform:none!important;animation:none!important}" +
        "header,.acb{position:absolute!important}";
      doc.head.appendChild(style);
    }
    setHeight(Math.max(doc.documentElement.scrollHeight, 800));
  }, []);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    el.width = width;
    el.height = height;
    const ctx = el.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    if (!points.length) return;

    const shade = document.createElement("canvas");
    shade.width = width;
    shade.height = height;
    const sctx = shade.getContext("2d");
    points.forEach((p) => {
      const g = sctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `rgba(0,0,0,${Math.min(0.5, 0.18 * p.w)})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      sctx.fillStyle = g;
      sctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    });

    const lut = document.createElement("canvas");
    lut.width = 256;
    lut.height = 1;
    const lctx = lut.getContext("2d");
    const grad = lctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0.0, "rgba(61,122,82,0)");
    grad.addColorStop(0.25, "rgba(115,172,132,0.55)");
    grad.addColorStop(0.5, "rgba(255,214,10,0.8)");
    grad.addColorStop(0.75, "rgba(255,120,0,0.9)");
    grad.addColorStop(1.0, "rgba(220,30,30,0.95)");
    lctx.fillStyle = grad;
    lctx.fillRect(0, 0, 256, 1);
    const palette = lctx.getImageData(0, 0, 256, 1).data;

    const img = sctx.getImageData(0, 0, width, height);
    for (let i = 0; i < img.data.length; i += 4) {
      const a = img.data[i + 3];
      if (!a) continue;
      img.data[i] = palette[a * 4];
      img.data[i + 1] = palette[a * 4 + 1];
      img.data[i + 2] = palette[a * 4 + 2];
      img.data[i + 3] = palette[a * 4 + 3];
    }
    ctx.putImageData(img, 0, 0);
  }, [points, width, height]);

  return (
    <div className="aa-heat">
      <div className="aa-heat__bar">
        {Object.keys(WIDTHS).map((d) => (
          <button key={d} type="button" className={dev === d ? "on" : ""} onClick={() => setDev(d)}>{d}</button>
        ))}
        <span className="aa-sep" />
        <button type="button" className={kind === "clicks" ? "on" : ""} onClick={() => setKind("clicks")}>Cliques</button>
        <button type="button" className={kind === "attention" ? "on" : ""} onClick={() => setKind("attention")}>Atenção do rato</button>
        <em>{points.length} pontos</em>
      </div>
      <div className="aa-heat__scroll">
        <div className="aa-heat__stage" style={{ width, height }}>
          <iframe
            ref={frame}
            title="Página inicial"
            src="/?_hm=1"
            width={width}
            height={height}
            onLoad={() => {
              measure();
              window.setTimeout(measure, 1200);
              window.setTimeout(measure, 3000);
            }}
          />
          <canvas ref={canvas} />
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [days, setDays] = useState(30);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  const load = useCallback(async (range) => {
    setLoading(true);
    setError("");
    try {
      const from = Date.now() - range * 86400000;
      const snap = await getDocs(
        query(collection(db, "analytics_batches"), where("ts", ">=", from), orderBy("ts", "desc"), limit(MAX_BATCHES))
      );
      setRows(snap.docs.map((d) => d.data()));
    } catch (err) {
      console.error("Analytics load failed:", err);
      setError("Não foi possível carregar os dados. Confirma as regras do Firestore.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIgnoreSelf(true); // the owner's browser never counts as a visitor
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/admin", { replace: true });
        return;
      }
      const token = await user.getIdTokenResult();
      const ok = token?.claims?.admin === true || (user.email && user.email.toLowerCase() === ADMIN_EMAIL);
      if (!ok) {
        await signOut(auth);
        navigate("/admin", { replace: true });
        return;
      }
      setReady(true);
    });
  }, [navigate]);

  useEffect(() => {
    if (ready) load(days);
  }, [ready, days, load]);

  const data = useMemo(() => aggregate(rows), [rows]);
  const k = data.kpi;
  const funnelTop = data.funnel[0]?.value || 1;

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(rows, null, 1)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `allercarte-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="admin-dashboard aa">
      <Seo title="Analytics" canonicalPath="/admin/analytics" siteName="AllerCarte" noindex />
      <div className="admin-dashboard-header">
        <h2>Analytics</h2>
        <div className="admin-dashboard-actions">
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Período">
            <option value={7}>7 dias</option>
            <option value={30}>30 dias</option>
            <option value={90}>90 dias</option>
            <option value={395}>13 meses</option>
          </select>
          <button className="admin-refresh" onClick={() => load(days)} disabled={loading}>
            {loading ? "A carregar…" : "Atualizar"}
          </button>
          <button className="admin-refresh" onClick={exportJson} disabled={!rows.length}>Exportar JSON</button>
          <button className="logout-btn" onClick={() => navigate("/admin/dashboard")}>Voltar</button>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
      {rows.length >= MAX_BATCHES && (
        <p className="aa-note">Mostrados os {MAX_BATCHES} lotes mais recentes; escolhe um período mais curto para ver tudo.</p>
      )}

      <div className="aa-kpis">
        {[
          ["Visitantes", k.visitors],
          ["Sessões", k.sessions],
          ["Páginas vistas", k.pageviews],
          ["Tempo médio", fmtTime(k.avgTime)],
          ["Taxa de saída", `${k.bounce}%`],
          ["Voltam", `${k.returning}%`],
          ["Cliques no CTA", `${k.ctaRate}%`],
          ["Cliques repetidos", k.rage],
          ["Mudanças de língua", k.langSwitches]
        ].map(([label, value]) => (
          <div className="aa-kpi" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="aa-grid">
        <Card title="Sessões por dia" wide><Daily rows={data.daily} /></Card>

        <Card title="Funil">
          <Bars
            rows={data.funnel.map((f) => ({ ...f, label: `${f.label} (${Math.round((f.value / funnelTop) * 100)}%)` }))}
          />
        </Card>
        <Card title="Profundidade de scroll"><Bars rows={data.scrollReach} total={k.sessions} /></Card>

        <Card title="Origem do tráfego"><Bars rows={data.sources} total={k.sessions} /></Card>
        <Card title="Dispositivos"><Bars rows={data.devices} total={k.sessions} /></Card>
        <Card title="Sistema"><Bars rows={data.os} total={k.sessions} /></Card>
        <Card title="Navegador"><Bars rows={data.browsers} total={k.sessions} /></Card>
        <Card title="Língua"><Bars rows={data.langs} total={k.sessions} /></Card>
        <Card title="Região (fuso)"><Bars rows={data.zones} total={k.sessions} /></Card>

        <Card title="Secções da página inicial" wide>
          <table className="aa-table">
            <thead><tr><th>#</th><th>Secção</th><th>Sessões que viram</th><th>Tempo médio</th></tr></thead>
            <tbody>
              {data.sections.map((s) => (
                <tr key={s.key}>
                  <td>{s.i}</td><td>{s.label}</td>
                  <td>{s.reach} ({Math.round((s.reach / Math.max(1, k.sessions)) * 100)}%)</td>
                  <td>{fmtTime(Math.round(s.avgMs / 1000))}</td>
                </tr>
              ))}
              {!data.sections.length && <tr><td colSpan={4} className="aa-empty">Sem dados</td></tr>}
            </tbody>
          </table>
        </Card>

        <Card title="Mais clicados" wide>
          <table className="aa-table">
            <thead><tr><th>Elemento</th><th>Texto</th><th>Destino</th><th>Cliques</th></tr></thead>
            <tbody>
              {data.clicks.map((c, i) => (
                <tr key={i}><td>{c.k || c.el}</td><td>{c.tx}</td><td>{c.h}</td><td>{c.n}</td></tr>
              ))}
              {!data.clicks.length && <tr><td colSpan={4} className="aa-empty">Sem dados</td></tr>}
            </tbody>
          </table>
        </Card>

        <Card title="Cliques onde nada acontece"><Bars rows={data.dead.map((c) => ({ label: c.el, value: c.n }))} /></Card>
        <Card title="Cliques repetidos (frustração)"><Bars rows={data.rage} /></Card>

        <Card title="Formulários">
          <table className="aa-table">
            <thead><tr><th>Form</th><th>Iniciados</th><th>Enviados</th><th>Abandonos</th><th>Último campo</th></tr></thead>
            <tbody>
              {data.forms.map((f) => (
                <tr key={f.id}><td>{f.id}</td><td>{f.start}</td><td>{f.submit}</td><td>{f.abandon}</td><td>{f.last}</td></tr>
              ))}
              {!data.forms.length && <tr><td colSpan={5} className="aa-empty">Sem dados</td></tr>}
            </tbody>
          </table>
        </Card>
        <Card title="Eventos"><Bars rows={data.events} /></Card>

        <Card title="Desempenho (p75)">
          <table className="aa-table">
            <thead><tr><th>Métrica</th><th>Dispositivo</th><th>p75</th><th>Amostras</th></tr></thead>
            <tbody>
              {data.vitals.map((v) => (
                <tr key={v.name + v.dev}><td>{v.name}</td><td>{v.dev}</td><td>{v.p75}{v.name === "CLS" ? "" : " ms"}</td><td>{v.n}</td></tr>
              ))}
              {!data.vitals.length && <tr><td colSpan={4} className="aa-empty">Sem dados</td></tr>}
            </tbody>
          </table>
        </Card>
        <Card title="Erros de JavaScript"><Bars rows={data.errors} /></Card>

        <Card title="Mapa de calor da página inicial" wide>
          <Heatmap data={data} />
        </Card>
      </div>
    </div>
  );
}
