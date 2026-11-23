import React, { useMemo, useState } from "react";
import { aggregate } from "./analyticsAggregate";
import { change, CHANNEL_HELP, extra, flag } from "./analyticsExtra";
import { insights, summary } from "./analyticsInsights";
import { Card, Donut, Empty, FunnelViz, HBars, HourGrid, Kpi, PALETTE, Sparkline, Tabs } from "./ChartParts";
import WorldMap from "./WorldMap";
import HeatmapPanel from "./HeatmapPanel";
import "./AnalyticsView.css";

const fmtTime = (s) => (s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`);

const TABS = [
  { id: "resumo", icon: "✨", label: "Resumo" },
  { id: "origem", icon: "🧭", label: "De onde vêm" },
  { id: "comportamento", icon: "👆", label: "O que fazem" },
  { id: "dispositivos", icon: "📱", label: "Dispositivos" },
  { id: "tecnico", icon: "🛠️", label: "Técnico" }
];

const CHANNEL_ICON = {
  Direto: "🔗",
  Pesquisa: "🔎",
  "Redes sociais": "💬",
  "Assistentes de IA": "🤖",
  Email: "✉️",
  Pago: "💶",
  "App AllerCarte": "🗺️",
  "Outros sites": "🌐"
};
const DEVICE_LABEL = { mobile: "Telemóvel", tablet: "Tablet", desktop: "Computador" };
const OS_LABEL = { windows: "Windows", macos: "macOS", ios: "iOS", android: "Android", linux: "Linux", other: "Outro" };
const BROWSER_LABEL = { chrome: "Chrome", safari: "Safari", firefox: "Firefox", edge: "Edge", opera: "Opera", other: "Outro" };

// Core Web Vitals: good / needs work thresholds.
const VITALS = {
  LCP: { label: "Carregamento do conteúdo principal (LCP)", good: 2500, ok: 4000, unit: "ms", help: "Quanto demora a aparecer o maior elemento da página." },
  FCP: { label: "Primeiro conteúdo visível (FCP)", good: 1800, ok: 3000, unit: "ms", help: "Quanto demora a aparecer qualquer coisa." },
  CLS: { label: "Estabilidade visual (CLS)", good: 0.1, ok: 0.25, unit: "", help: "Se a página salta enquanto carrega. Quanto menor, melhor." },
  FID: { label: "Resposta ao primeiro toque (FID)", good: 100, ok: 300, unit: "ms", help: "Quanto demora a reagir ao primeiro clique ou toque." },
  TTFB: { label: "Resposta do servidor (TTFB)", good: 800, ok: 1800, unit: "ms", help: "Quanto demora o site a começar a responder." }
};

const rate = (v, t) => (v <= t.good ? "good" : v <= t.ok ? "ok" : "bad");
const RATE_TEXT = { good: "Bom", ok: "A melhorar", bad: "Fraco" };

export default function AnalyticsView({ rows, prevRows = [], days }) {
  const [tab, setTab] = useState("resumo");
  const data = useMemo(() => aggregate(rows), [rows]);
  const prev = useMemo(() => aggregate(prevRows), [prevRows]);
  const ex = useMemo(() => extra(data.sessionList), [data]);
  const tips = useMemo(() => insights(data, ex), [data, ex]);
  const k = data.kpi;
  const pk = prev.kpi;
  const hasPrev = prevRows.length > 0;
  const d = (key) => (hasPrev ? change(k[key], pk[key]) : null);

  const channelRows = ex.channels.map((c) => ({ label: c.name, value: c.sessions, ...c }));
  const deviceRows = ex.devices.map((x) => ({ label: DEVICE_LABEL[x.dev] || x.dev, value: x.sessions }));
  const newRet = [
    { label: "Primeira visita", value: ex.visits.first },
    { label: "Segunda visita", value: ex.visits.second },
    { label: "3 a 5 visitas", value: ex.visits.few },
    { label: "6 ou mais", value: ex.visits.many }
  ].filter((r) => r.value);

  return (
    <div className="av">
      <div className="av__hero">
        <p className="av__summary">{summary(data, ex, days)}</p>
        {hasPrev && <p className="av__compare">As setas comparam com os {days} dias anteriores.</p>}
      </div>

      <div className="vz-kpis">
        <Kpi icon="👥" label="Pessoas" value={k.visitors} delta={d("visitors")} hint="Navegadores diferentes que visitaram." />
        <Kpi icon="🖱️" label="Visitas" value={k.sessions} delta={d("sessions")} hint="Cada vez que alguém abre o site conta uma visita." />
        <Kpi icon="📄" label="Páginas vistas" value={k.pageviews} delta={d("pageviews")} />
        <Kpi icon="⏱️" label="Tempo médio" value={fmtTime(k.avgTime)} delta={d("avgTime")} hint="Tempo com a página aberta e à vista." />
        <Kpi icon="🎯" label={'Clicam em "Abrir o mapa"'} value={`${k.ctaRate}%`} delta={d("ctaRate")} hint="Das visitas, quantas foram para a app." />
        <Kpi icon="🚪" label="Saem logo" value={`${k.bounce}%`} delta={d("bounce")} inverse hint="Veem só o início, não fazem scroll nem clicam." />
        <Kpi icon="🔁" label="Já cá tinham vindo" value={`${k.returning}%`} delta={d("returning")} />
      </div>

      {tips.length > 0 && (
        <div className="av__tips">
          {tips.map((t, i) => (
            <article key={i} className={`av-tip av-tip--${t.tone}`}>
              <span className="av-tip__icon" aria-hidden="true">{t.icon}</span>
              <div>
                <h4>{t.title}</h4>
                {t.text && <p>{t.text}</p>}
              </div>
            </article>
          ))}
        </div>
      )}

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "resumo" && (
        <div className="vz-grid">
          <Card title="Visitas por dia" hint="Cada ponto é um dia. Os picos costumam seguir uma publicação ou uma campanha." wide>
            <Sparkline rows={data.daily} />
          </Card>
          <Card title="Do primeiro olhar ao clique" hint="Quantas pessoas chegam a cada passo. Mostra onde se perde gente." wide>
            <FunnelViz steps={data.funnel} />
          </Card>
          <Card title="Quando visitam" hint="Dia da semana e hora, no relógio de quem visita. Mais escuro = mais visitas." wide>
            <HourGrid hours={ex.hours} />
          </Card>
          <Card title="Que dispositivo usam">
            <Donut rows={deviceRows} center={k.sessions} />
          </Card>
          <Card title="É a primeira vez?" hint="Quantas vezes a mesma pessoa já tinha visitado.">
            <Donut rows={newRet} center={`${k.returning}%`} />
          </Card>
          <Card title="De onde chegam" hint="O tipo de ligação que as trouxe ao site.">
            <HBars rows={channelRows} total={k.sessions} icon={(r) => CHANNEL_ICON[r.label]} />
          </Card>
        </div>
      )}

      {tab === "origem" && (
        <div className="vz-grid">
          <Card
            title="Mapa das visitas"
            hint="Localização aproximada, tirada do fuso horário do visitante. Nunca guardamos o IP, por isso não é exata."
            wide
            tall
          >
            {ex.places.length ? <WorldMap places={ex.places} total={k.sessions} /> : <Empty text="Ainda sem visitas com localização" />}
            <p className="vz-note">
              {ex.knownShare}% das visitas têm fuso horário conhecido. A cidade é a que dá nome ao fuso (por exemplo Lisboa para todo o
              fuso de Portugal continental), por isso mostra a região, não a rua.
            </p>
          </Card>

          <Card title="Países" hint="Ordenados pelo número de visitas.">
            <HBars
              rows={ex.countries.slice(0, 10).map((c) => ({ label: c.name, value: c.sessions, cc: c.cc }))}
              total={k.sessions}
              icon={(r) => flag(r.cc)}
            />
          </Card>
          <Card title="Cidades (aproximadas)" hint="Pelo nome do fuso horário.">
            <HBars
              rows={ex.places.slice(0, 10).map((p) => ({ label: p.city, value: p.sessions, cc: p.cc }))}
              total={k.sessions}
              icon={(r) => flag(r.cc)}
            />
          </Card>

          <Card title="Que tipo de entrada é melhor" hint="Por cada origem: quantos ficam, quantos clicam em “Abrir o mapa” e quantos escrevem." wide>
            {ex.channels.length ? (
              <table className="vz-table">
                <thead>
                  <tr>
                    <th>Origem</th>
                    <th>Visitas</th>
                    <th>Ficam 10 s ou mais</th>
                    <th>Clicam em “Abrir o mapa”</th>
                    <th>Escrevem a contactar</th>
                  </tr>
                </thead>
                <tbody>
                  {ex.channels.map((c, i) => (
                    <tr key={c.name} title={CHANNEL_HELP[c.name]}>
                      <td>
                        <span className="vz-dot" style={{ background: PALETTE[i % PALETTE.length] }} />
                        {CHANNEL_ICON[c.name]} {c.name}
                      </td>
                      <td>
                        {c.sessions} <small>({c.share}%)</small>
                      </td>
                      <td><Meter value={c.engagedPct} /></td>
                      <td><Meter value={c.ctaPct} strong /></td>
                      <td>{c.sent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Empty />
            )}
          </Card>

          <Card title="Origens em detalhe" hint="O site ou rede concreta de onde vieram.">
            <HBars
              rows={ex.sources.slice(0, 10).map((s) => ({ label: s.source, value: s.sessions, channel: s.channel }))}
              total={k.sessions}
              icon={(r) => CHANNEL_ICON[r.channel]}
            />
          </Card>
          <Card title="Campanhas" hint="Vem de utm_campaign nas ligações que partilhas. Sem campanha, fica vazio.">
            <HBars rows={ex.campaigns.map((c) => ({ label: c.label, value: c.sessions }))} total={k.sessions} />
          </Card>
          <Card title="Página por onde entram" hint="A primeira página que viram.">
            <HBars rows={ex.landing.map((c) => ({ label: c.label, value: c.sessions }))} total={k.sessions} />
          </Card>
        </div>
      )}

      {tab === "comportamento" && (
        <div className="vz-grid">
          <Card title="Até onde fazem scroll" hint="Percentagem das visitas que chegou a cada ponto da página.">
            <HBars rows={data.scrollReach.map((r) => ({ label: `${r.label} da página`, value: r.value }))} total={k.sessions} color="#3d7a52" />
          </Card>
          <Card title="Quanto tempo ficam" hint="Tempo com a página à vista, por visita.">
            <HBars rows={ex.durations} total={k.sessions} />
          </Card>

          <Card title="Secções da página" hint="Quantas visitas chegaram a cada secção e quanto tempo lá ficaram." wide>
            {data.sections.length ? (
              <table className="vz-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Secção</th>
                    <th>Quem chega</th>
                    <th>Tempo médio</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sections.map((s) => (
                    <tr key={s.key}>
                      <td>{s.i}</td>
                      <td>{s.label}</td>
                      <td><Meter value={Math.round((s.reach / Math.max(1, k.sessions)) * 100)} strong /></td>
                      <td>{fmtTime(Math.round(s.avgMs / 1000))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Empty />
            )}
          </Card>

          <Card title="O que mais clicam" hint="Botões e ligações mais usados." wide>
            {data.clicks.length ? (
              <table className="vz-table">
                <thead>
                  <tr>
                    <th>Elemento</th>
                    <th>Texto</th>
                    <th>Vai para</th>
                    <th>Cliques</th>
                  </tr>
                </thead>
                <tbody>
                  {data.clicks.slice(0, 10).map((c, i) => (
                    <tr key={i}>
                      <td>{c.k || c.el}</td>
                      <td>{c.tx}</td>
                      <td>{c.h}</td>
                      <td><b>{c.n}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Empty />
            )}
          </Card>

          <Card title="Cliques que não fazem nada" hint="Cliques em sítios que não são botões. Podem mostrar o que as pessoas esperam que seja clicável.">
            <HBars rows={data.dead.map((c) => ({ label: c.el, value: c.n }))} color="#e0723a" />
          </Card>
          <Card title="Frustração" hint="Cliques repetidos no mesmo sítio, sinal de que algo não responde.">
            <HBars rows={data.rage} color="#c4546a" />
          </Card>

          <Card title="Formulários" hint="Quantas pessoas começam, enviam ou desistem. Só registamos o campo tocado, nunca o texto.">
            {data.forms.length ? (
              <table className="vz-table">
                <thead>
                  <tr>
                    <th>Formulário</th>
                    <th>Começaram</th>
                    <th>Enviaram</th>
                    <th>Desistiram</th>
                  </tr>
                </thead>
                <tbody>
                  {data.forms.map((f) => (
                    <tr key={f.id}>
                      <td>{f.id}</td>
                      <td>{f.start}</td>
                      <td>{f.submit}</td>
                      <td>
                        {f.abandon} {f.last && <small>(último campo: {f.last})</small>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Empty />
            )}
          </Card>
          <Card title="Ações especiais" hint="Eventos que marcámos, como um contacto enviado.">
            <HBars rows={data.events} />
          </Card>

          <Card title="Mapa de calor da página inicial" hint="Onde clicam, por onde passa o rato e até onde fazem scroll, sobre a própria página." wide>
            <HeatmapPanel data={data} totalSessions={k.sessions} />
          </Card>
        </div>
      )}

      {tab === "dispositivos" && (
        <div className="vz-grid">
          <Card title="Telemóvel, tablet ou computador" hint="E quanto cada um clica em “Abrir o mapa”.">
            <Donut rows={deviceRows} center={k.sessions} />
            <table className="vz-table vz-table--tight">
              <tbody>
                {ex.devices.map((x) => (
                  <tr key={x.dev}>
                    <td>{DEVICE_LABEL[x.dev] || x.dev}</td>
                    <td>{x.sessions} visitas</td>
                    <td><Meter value={x.ctaPct} strong /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card title="Sistema">
            <HBars rows={data.os.map((r) => ({ ...r, label: OS_LABEL[r.label] || r.label }))} total={k.sessions} />
          </Card>
          <Card title="Navegador">
            <HBars rows={data.browsers.map((r) => ({ ...r, label: BROWSER_LABEL[r.label] || r.label }))} total={k.sessions} />
          </Card>
          <Card title="Largura do ecrã" hint="Útil para saber que tamanhos testar.">
            <HBars rows={ex.widths.filter((r) => r.value)} total={k.sessions} />
          </Card>
          <Card title="Língua do navegador">
            <HBars rows={data.langs.map((r) => ({ ...r, label: (r.label || "?").toUpperCase() }))} total={k.sessions} />
          </Card>
          <Card title="Mudaram de língua no site" hint="Quantas vezes alguém usou o seletor PT/EN.">
            <p className="vz-big">{k.langSwitches}</p>
          </Card>
        </div>
      )}

      {tab === "tecnico" && (
        <div className="vz-grid">
          <Card title="Velocidade do site" hint="Medido nos aparelhos de quem visita. Verde é bom." wide>
            {data.vitals.length ? (
              <div className="vz-vitals">
                {data.vitals.map((v) => {
                  const t = VITALS[v.name];
                  if (!t) return null;
                  const r = rate(v.p75, t);
                  return (
                    <div key={v.name + v.dev} className={`vz-vital vz-vital--${r}`} title={t.help}>
                      <b>{v.name === "CLS" ? v.p75 : `${v.p75} ${t.unit}`}</b>
                      <span>{t.label}</span>
                      <em>
                        {DEVICE_LABEL[v.dev] || v.dev} · {RATE_TEXT[r]} · {v.n} medições
                      </em>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty />
            )}
          </Card>
          <Card title="Erros no site" hint="Erros que apareceram no navegador de quem visita." wide>
            <HBars rows={data.errors} color="#c4546a" />
          </Card>
        </div>
      )}
    </div>
  );
}

// A number with a small bar behind it.
function Meter({ value, strong }) {
  return (
    <span className="vz-meter">
      <span className="vz-meter__track">
        <i style={{ width: `${Math.min(100, value)}%`, background: strong ? "#3d7a52" : "#a9cfb5" }} />
      </span>
      <b>{value}%</b>
    </span>
  );
}
