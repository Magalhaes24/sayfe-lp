import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./HeatmapPanel.css";

// The home page is rendered at the visitor's width and painted with their
// clicks, mouse attention or how far people scrolled.
const WIDTHS = { desktop: 1280, tablet: 820, mobile: 390 };
const DEVICE_LABEL = { desktop: "Desktop", tablet: "Tablet", mobile: "Telemóvel" };
const LAYERS = [
  { id: "clicks", label: "Cliques" },
  { id: "attention", label: "Atenção do rato" },
  { id: "scroll", label: "Scroll" }
];
const RES = 0.5; // the heat is drawn at half resolution and scaled up: it is blurry anyway
const CELL = 90; // hotspot grid, in page pixels

// Cold green -> yellow -> orange -> red, with its own transparency.
function buildPalette() {
  const lut = document.createElement("canvas");
  lut.width = 256;
  lut.height = 1;
  const ctx = lut.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0.0, "rgba(61,122,82,0)");
  grad.addColorStop(0.2, "rgba(61,122,82,0.35)");
  grad.addColorStop(0.45, "rgba(115,200,140,0.6)");
  grad.addColorStop(0.62, "rgba(255,214,10,0.82)");
  grad.addColorStop(0.82, "rgba(255,120,0,0.92)");
  grad.addColorStop(1.0, "rgba(220,30,30,0.96)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 1);
  return ctx.getImageData(0, 0, 256, 1).data;
}

const fmtTime = (ms) => {
  const s = Math.round(ms / 1000);
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
};

export default function HeatmapPanel({ data, totalSessions }) {
  const [dev, setDev] = useState("desktop");
  const [layer, setLayer] = useState("clicks");
  const [radius, setRadius] = useState(28);
  const [opacity, setOpacity] = useState(0.85);
  const [showSections, setShowSections] = useState(true);
  const [showSpots, setShowSpots] = useState(true);
  const [frameH, setFrameH] = useState(2400);
  const [secRects, setSecRects] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [avail, setAvail] = useState(900);

  const wrap = useRef(null);
  const frame = useRef(null);
  const canvas = useRef(null);
  const timers = useRef([]);

  const width = WIDTHS[dev];
  const scale = Math.min(1, avail / width);

  // Fit the page to the space it has, instead of scrolling sideways.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return undefined;
    const update = () => setAvail(Math.max(280, el.clientWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ---------------------------- the page itself ---------------------------- */

  const measure = useCallback(() => {
    const doc = frame.current && frame.current.contentDocument;
    if (!doc || !doc.documentElement) return;
    if (!doc.getElementById("hm-force")) {
      const style = doc.createElement("style");
      style.id = "hm-force";
      // Show what normally fades in on scroll, freeze motion, and keep fixed bars out of the way.
      style.textContent =
        ".st-reveal,[data-depth-p],.mx-rise{opacity:1!important;transform:none!important}" +
        "*,*::before,*::after{animation:none!important;transition:none!important}" +
        // Only the site bar: a bare `header` also matched each section's own <header>,
        // which dropped the headings out of the layout and let cards cover them.
        "header.lxh,.lxh__announce,.acb{position:absolute!important}" +
        ".d3-stack__card{position:relative!important;top:auto!important;transform:none!important}";
      doc.head.appendChild(style);
    }
    doc.querySelectorAll("img[loading=lazy]").forEach((img) => {
      img.loading = "eager";
    });
    const h = Math.max(doc.documentElement.scrollHeight, 800);
    setFrameH(h);

    // Where each section sits, in the same order the tracker numbers them.
    const root = doc.querySelector("[data-page-root]") || doc.body;
    const nodes = Array.from(root.querySelectorAll("main section, section")).slice(0, 40);
    setSecRects(
      nodes.map((n, index) => {
        const r = n.getBoundingClientRect();
        return { i: index + 1, top: r.top + (doc.defaultView.scrollY || 0), height: r.height };
      })
    );
  }, []);

  const onFrameLoad = useCallback(() => {
    setLoaded(true);
    timers.current.forEach(clearTimeout);
    // The page keeps growing while images and fonts arrive.
    timers.current = [0, 500, 1500, 3500, 6000].map((ms) => setTimeout(measure, ms));
  }, [measure]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const changeDevice = (d) => {
    if (d === dev) return;
    setLoaded(false); // the page is reloaded at the new width
    setDev(d);
  };

  /* ------------------------------- the data -------------------------------- */

  const points = useMemo(() => {
    if (layer === "clicks") {
      return data.clicksPts
        .filter((p) => p.dev === dev)
        .map((p) => ({
          x: (p.x / 1000) * width,
          // Scale by page height so a taller or shorter render still lines up.
          y: p.ph ? (p.y / p.ph) * frameH : p.y,
          w: 1
        }));
    }
    if (layer === "attention") {
      return data.gridPts
        .filter((p) => p.dev === dev)
        .map((p) => ({ x: ((p.cx + 0.5) / 50) * width, y: p.cy * 100 + 50, w: Math.min(p.n, 14) / 3 }));
    }
    return [];
  }, [data, dev, layer, width, frameH]);

  const reachAt = useCallback(
    (depth) => {
      const list = data.sdList || [];
      if (!list.length) return 0;
      return list.filter((sd) => sd >= depth).length / list.length;
    },
    [data]
  );

  const hotspots = useMemo(() => {
    if (!points.length) return [];
    const cells = new Map();
    points.forEach((p) => {
      const key = `${Math.floor(p.x / CELL)}:${Math.floor(p.y / CELL)}`;
      const c = cells.get(key) || { x: 0, y: 0, n: 0 };
      c.x += p.x * p.w;
      c.y += p.y * p.w;
      c.n += p.w;
      cells.set(key, c);
    });
    // Greedy pick: take the busiest cell, then skip its neighbours, so one hot
    // area shows up as one numbered zone instead of six.
    const top = [];
    Array.from(cells.values())
      .sort((a, b) => b.n - a.n)
      .forEach((c) => {
        if (top.length >= 6) return;
        const cx = c.x / c.n;
        const cy = c.y / c.n;
        if (top.some((t) => Math.hypot(t.x - cx, t.y - cy) < CELL * 2.2)) return;
        top.push({ x: cx, y: cy, n: Math.round(c.n) });
      });
    const total = points.reduce((a, p) => a + p.w, 0);
    return top.map((s, k) => {
      const sec = secRects.find((r) => s.y >= r.top && s.y <= r.top + r.height);
      const info = sec && data.sections.find((x) => x.i === sec.i);
      return {
        ...s,
        k: k + 1,
        pct: Math.round((s.n / total) * 100),
        section: info ? info.label : sec ? `Secção ${sec.i}` : "Fora das secções"
      };
    });
  }, [points, secRects, data]);

  /* -------------------------------- drawing -------------------------------- */

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const cw = Math.max(1, Math.round(width * RES));
    const ch = Math.max(1, Math.round(frameH * RES));
    el.width = cw;
    el.height = ch;
    const ctx = el.getContext("2d");
    ctx.clearRect(0, 0, cw, ch);
    const palette = buildPalette();

    if (layer === "scroll") {
      // One colour per row, written straight into the pixels: no overlapping bands, no stripes.
      const img = ctx.createImageData(cw, ch);
      for (let y = 0; y < ch; y += 1) {
        const depth = Math.min(100, (y / ch) * 100);
        const r = reachAt(depth >= 100 ? 97 : depth);
        const idx = Math.round(Math.max(0, Math.min(1, r)) * 255);
        const o = idx * 4;
        for (let x = 0; x < cw; x += 1) {
          const i = (y * cw + x) * 4;
          img.data[i] = palette[o];
          img.data[i + 1] = palette[o + 1];
          img.data[i + 2] = palette[o + 2];
          img.data[i + 3] = palette[o + 3];
        }
      }
      ctx.putImageData(img, 0, 0);
      return;
    }
    if (!points.length) return;

    const shade = document.createElement("canvas");
    shade.width = cw;
    shade.height = ch;
    const sctx = shade.getContext("2d");
    const r = radius * RES;
    points.forEach((p) => {
      const x = p.x * RES;
      const y = p.y * RES;
      const g = sctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(0,0,0,${Math.min(0.5, 0.2 * p.w)})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      sctx.fillStyle = g;
      sctx.fillRect(x - r, y - r, r * 2, r * 2);
    });

    const img = sctx.getImageData(0, 0, cw, ch);
    // Scale to the busiest areas, so a handful of clicks is as readable as thousands.
    const hist = new Uint32Array(256);
    for (let i = 3; i < img.data.length; i += 4) hist[img.data[i]] += 1;
    let seen = 0;
    const nonZero = img.data.length / 4 - hist[0];
    let p98 = 255;
    for (let v = 1; v < 256; v += 1) {
      seen += hist[v];
      if (seen >= nonZero * 0.98) {
        p98 = v;
        break;
      }
    }
    const gain = 255 / Math.max(p98, 24);
    for (let i = 0; i < img.data.length; i += 4) {
      const a = img.data[i + 3];
      if (!a) continue;
      const idx = Math.min(255, Math.round(a * gain));
      img.data[i] = palette[idx * 4];
      img.data[i + 1] = palette[idx * 4 + 1];
      img.data[i + 2] = palette[idx * 4 + 2];
      img.data[i + 3] = palette[idx * 4 + 3];
    }
    ctx.putImageData(img, 0, 0);
  }, [points, layer, radius, width, frameH, reachAt]);

  const noData =
    (layer === "scroll" && !(data.sdList || []).length) || (layer !== "scroll" && !points.length);

  const sectionStats = (i) => data.sections.find((s) => s.i === i);

  return (
    <div className="hm">
      <div className="hm__controls">
        <div className="hm__group" role="group" aria-label="Dispositivo">
          {Object.keys(WIDTHS).map((d) => (
            <button key={d} type="button" className={dev === d ? "on" : ""} onClick={() => changeDevice(d)}>
              {DEVICE_LABEL[d]}
            </button>
          ))}
        </div>
        <div className="hm__group" role="group" aria-label="Camada">
          {LAYERS.map((l) => (
            <button key={l.id} type="button" className={layer === l.id ? "on" : ""} onClick={() => setLayer(l.id)}>
              {l.label}
            </button>
          ))}
        </div>
        <label className="hm__slider">
          Raio
          <input
            type="range"
            min="14"
            max="70"
            value={radius}
            disabled={layer === "scroll"}
            onChange={(e) => setRadius(Number(e.target.value))}
          />
        </label>
        <label className="hm__slider">
          Opacidade
          <input
            type="range"
            min="30"
            max="100"
            value={Math.round(opacity * 100)}
            onChange={(e) => setOpacity(Number(e.target.value) / 100)}
          />
        </label>
        <label className="hm__check">
          <input type="checkbox" checked={showSections} onChange={(e) => setShowSections(e.target.checked)} />
          Secções
        </label>
        <label className="hm__check">
          <input
            type="checkbox"
            checked={showSpots}
            disabled={layer === "scroll"}
            onChange={(e) => setShowSpots(e.target.checked)}
          />
          Zonas quentes
        </label>
      </div>

      <div className="hm__body">
        <div className="hm__view" ref={wrap}>
          <div className="hm__scroll">
            <div className="hm__box" style={{ width: width * scale, height: frameH * scale }}>
              <div className="hm__stage" style={{ width, height: frameH, transform: `scale(${scale})` }}>
                <iframe
                  key={dev}
                  ref={frame}
                  title="Página inicial"
                  src="/?_hm=1"
                  width={width}
                  height={frameH}
                  onLoad={onFrameLoad}
                />
                <canvas ref={canvas} style={{ width, height: frameH, opacity }} />

                {showSections &&
                  secRects.map((r) => {
                    const st = sectionStats(r.i);
                    return (
                      <div key={r.i} className="hm__sec" style={{ top: r.top, height: r.height }}>
                        {/* The site's own header covers the first 110px; keep the label clear of it. */}
                        <span style={{ top: Math.max(8, 118 - r.top) }}>
                          #{r.i}
                          {st
                            ? ` · ${st.label} · ${Math.round((st.reach / Math.max(1, totalSessions)) * 100)}% viram · ${fmtTime(st.avgMs)}`
                            : ""}
                        </span>
                      </div>
                    );
                  })}

                {layer === "scroll" &&
                  [0, 25, 50, 75, 100].map((d) => (
                    <div key={d} className="hm__tick" style={{ top: `${Math.min(d, 99.5)}%` }}>
                      {d}% · {Math.round(reachAt(d >= 100 ? 97 : d) * 100)}% chegam
                    </div>
                  ))}

                {showSpots &&
                  layer !== "scroll" &&
                  hotspots.map((s) => (
                    <div key={s.k} className="hm__spot" style={{ left: s.x, top: s.y }} title={`${s.n} (${s.pct}%)`}>
                      {s.k}
                    </div>
                  ))}

                {(!loaded || noData) && (
                  <div className="hm__note">
                    {!loaded
                      ? "A carregar a página…"
                      : layer === "scroll"
                        ? "Ainda sem dados de scroll."
                        : `Ainda sem ${layer === "clicks" ? "cliques" : "movimentos do rato"} em ${DEVICE_LABEL[dev].toLowerCase()}.`}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="hm__side">
          <div className="hm__legend" aria-hidden="true">
            <i />
            <span>{layer === "scroll" ? "poucos chegam" : "pouca"}</span>
            <span>{layer === "scroll" ? "todos veem" : "muita"}</span>
          </div>
          <p className="hm__count">
            {layer === "scroll"
              ? `${(data.sdList || []).length} sessões`
              : `${points.reduce((a, p) => a + p.w, 0).toFixed(0)} ${layer === "clicks" ? "cliques" : "amostras"}`}
            {" · "}
            {DEVICE_LABEL[dev]} {width}px
          </p>

          {layer !== "scroll" && hotspots.length > 0 && (
            <>
              <h4>Zonas mais quentes</h4>
              <ol className="hm__list">
                {hotspots.map((s) => (
                  <li key={s.k}>
                    <b>{s.k}</b>
                    <span>
                      {s.section}
                      <em>
                        {s.n} · {s.pct}%
                      </em>
                    </span>
                  </li>
                ))}
              </ol>
            </>
          )}

          {layer === "scroll" && (data.sdList || []).length > 0 && (
            <>
              <h4>Onde as pessoas ficam</h4>
              <ol className="hm__list hm__list--plain">
                {[25, 50, 75, 100].map((d) => (
                  <li key={d}>
                    <b>{d}%</b>
                    <span>
                      da página
                      <em>{Math.round(reachAt(d >= 100 ? 97 : d) * 100)}% chegam aqui</em>
                    </span>
                  </li>
                ))}
              </ol>
            </>
          )}
          <p className="hm__hint">
            A posição vem do ecrã de cada visitante e a página é desenhada à largura escolhida: nos cliques, a altura
            ajusta-se à da página; o resto pode desviar-se um pouco.
          </p>
        </aside>
      </div>
    </div>
  );
}
