import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import SafetyIcon from "../SafetyIcon";
import {
  ALLERGEN_KEYS,
  AMBIENT_PINS,
  DEMO_COPY,
  QUICK_ALLERGENS,
  RESTAURANTS,
  dishState,
  restaurantTone
} from "./demoData";
import "./LiveDemo.css";

// Until someone touches the demo it plays itself through these picks.
const AUTOPLAY = [
  { picked: [], at: "tasca" },
  { picked: ["gluten"], at: "tasca" },
  { picked: ["gluten", "milk"], at: "tasca" },
  { picked: ["gluten", "milk"], at: "central" },
  { picked: ["molluscs"], at: "ribeira" },
  { picked: ["molluscs"], at: "tasca" }
];
const AUTOPLAY_MS = 3200;

const isFree = (tone) => tone === "safe" || tone === "likely";

function Check() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

// Select-only combobox: arrow keys, Enter, Escape, click outside.
function RestaurantSelect({ value, onChange, picked, copy }) {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(0);
  const wrap = useRef(null);
  const listId = useId();
  const current = RESTAURANTS.find((r) => r.id === value);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (wrap.current && !wrap.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const choose = (id) => {
    onChange(id);
    setOpen(false);
  };

  const onKey = (e) => {
    if (e.key === "Escape") return setOpen(false);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setFocus(RESTAURANTS.indexOf(current));
        return;
      }
      const step = e.key === "ArrowDown" ? 1 : -1;
      setFocus((f) => (f + step + RESTAURANTS.length) % RESTAURANTS.length);
    }
    if ((e.key === "Enter" || e.key === " ") && open) {
      e.preventDefault();
      choose(RESTAURANTS[focus].id);
    }
  };

  return (
    <div className={`demo-select${open ? " is-open" : ""}`} ref={wrap}>
      <button
        type="button"
        role="combobox"
        className="demo-select__button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={copy.restaurant}
        aria-activedescendant={open ? `${listId}-${focus}` : undefined}
        onClick={() => {
          setFocus(RESTAURANTS.indexOf(current));
          setOpen((o) => !o);
        }}
        onKeyDown={onKey}
      >
        <span className={`demo-dot demo-tone--${restaurantTone(current, picked)}`} />
        <span className="demo-select__value">
          <strong>{current.name}</strong>
          <small>{current.town}</small>
        </span>
        <span className="demo-select__chev">
          <Chevron />
        </span>
      </button>
      <ul id={listId} role="listbox" className="demo-select__list" aria-label={copy.restaurant}>
        {RESTAURANTS.map((r, i) => (
          <li
            key={r.id}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={r.id === value}
            className={i === focus ? "is-focus" : undefined}
            onPointerEnter={() => setFocus(i)}
            onClick={() => choose(r.id)}
          >
            <span className={`demo-dot demo-tone--${restaurantTone(r, picked)}`} />
            <span className="demo-select__value">
              <strong>{r.name}</strong>
              <small>{r.town}</small>
            </span>
            <span className="demo-select__tick">{r.id === value && <Check />}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Segmented control; the white pill slides to the active option.
function Segmented({ items, value, onChange }) {
  const list = useRef(null);
  const [bar, setBar] = useState(null);

  useLayoutEffect(() => {
    const el = list.current && list.current.children[value];
    if (el) setBar({ x: el.offsetLeft, w: el.offsetWidth });
  }, [value, items]);

  return (
    <div className="demo-seg" role="tablist" ref={list}>
      {items.map((label, i) => (
        <button
          key={label}
          type="button"
          role="tab"
          aria-selected={i === value}
          onClick={() => onChange(i)}
        >
          {label}
        </button>
      ))}
      {bar && (
        <span
          className="demo-seg__pill"
          style={{ transform: `translateX(${bar.x}px)`, width: bar.w }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

function LiveDemo({ t, language, reduceMotion }) {
  const copy = DEMO_COPY[language] || DEMO_COPY.pt;
  const mock = t("home.mock") || {};
  const categories = mock.categories || [];
  const allergenLabels = t("home.allergens") || [];

  const label = (key) => allergenLabels[ALLERGEN_KEYS.indexOf(key)] || key;
  const name = (key) => label(key).replace(/^\S+\s/, "");

  const [picked, setPicked] = useState(AUTOPLAY[0].picked);
  const [restaurantId, setRestaurantId] = useState(AUTOPLAY[0].at);
  const [tab, setTab] = useState(0);
  const [onlySafe, setOnlySafe] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [touched, setTouched] = useState(Boolean(reduceMotion));
  const root = useRef(null);

  const [paused, setPaused] = useState(false);
  const [autoStep, setAutoStep] = useState(0);
  const stepRef = useRef(0);

  // Plays itself while on screen, until someone uses it. The pill in the top
  // bar pauses it (content that changes on its own needs a pause control).
  useEffect(() => {
    if (touched || paused) return;
    const el = root.current;
    let visible = false;
    const io =
      typeof IntersectionObserver !== "undefined" &&
      new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
      }, { threshold: 0.4 });
    if (io && el) io.observe(el);
    const id = setInterval(() => {
      if (!visible || document.hidden) return;
      const next = (stepRef.current + 1) % AUTOPLAY.length;
      stepRef.current = next;
      setAutoStep(next);
      setPicked(AUTOPLAY[next].picked);
      setRestaurantId(AUTOPLAY[next].at);
      setTab(0);
    }, AUTOPLAY_MS);
    return () => {
      clearInterval(id);
      if (io) io.disconnect();
    };
  }, [touched, paused]);

  const stop = () => {
    if (!touched) setTouched(true);
  };

  const restaurant = RESTAURANTS.find((r) => r.id === restaurantId);
  const states = useMemo(
    () => restaurant.dishes.map((d) => ({ dish: d, ...dishState(d, picked) })),
    [restaurant, picked]
  );
  const okCount = states.filter((s) => isFree(s.tone)).length;
  const toneCounts = ["safe", "likely", "warn", "danger"].map(
    (tone) => states.filter((s) => s.tone === tone).length
  );
  const inTab = states.filter((s) => s.dish.cat === tab);
  const shown = inTab.filter((s) => !onlySafe || isFree(s.tone));

  const price = (v) =>
    new Intl.NumberFormat(copy.locale, { style: "currency", currency: "EUR" }).format(v);

  const statusText = (s) => {
    const list = s.hit.map(name).join(", ");
    if (s.tone === "danger") return copy.state.danger(list);
    if (s.tone === "warn") return copy.state.warn(list);
    return copy.state[s.tone];
  };

  const toggle = (key) => {
    stop();
    setPicked((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));
  };

  const openRestaurant = (id) => {
    stop();
    setRestaurantId(id);
    setTab(0);
  };

  const chips = showAll ? ALLERGEN_KEYS : QUICK_ALLERGENS;

  return (
    <div className="demo" ref={root}>
      <div className="demo-top">
        <div className="demo-top__head">
          <span className="demo-tag">{copy.tag}</span>
          {!touched && (
            <button
              type="button"
              className={`demo-auto${paused ? " is-paused" : ""}`}
              aria-pressed={paused}
              aria-label={paused ? copy.resume : copy.pause}
              onClick={() => setPaused((v) => !v)}
            >
              <span className="demo-auto__icon" aria-hidden="true">
                {paused ? (
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M7 4.5v15l12-7.5z" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
                )}
              </span>
              {paused ? copy.paused : copy.playing}
              <span
                className="demo-auto__bar"
                key={autoStep}
                style={{ "--ms": `${AUTOPLAY_MS}ms` }}
                aria-hidden="true"
              />
            </button>
          )}
          <button
            type="button"
            className={`demo-clear${picked.length ? " is-shown" : ""}`}
            onClick={() => {
              stop();
              setPicked([]);
            }}
            tabIndex={picked.length ? undefined : -1}
            aria-hidden={!picked.length}
          >
            {copy.clear}
          </button>
        </div>
        <div className="demo-chips" role="group" aria-label={copy.pick}>
          {chips.map((key) => {
            const on = picked.includes(key);
            return (
              <button
                key={key}
                type="button"
                className={`demo-chip${on ? " is-on" : ""}`}
                aria-pressed={on}
                onClick={() => toggle(key)}
              >
                <span className="demo-chip__check">
                  <Check />
                </span>
                {label(key)}
              </button>
            );
          })}
          <button
            type="button"
            className="demo-chip demo-chip--more"
            aria-expanded={showAll}
            onClick={() => {
              stop();
              setShowAll((s) => !s);
            }}
          >
            {showAll ? copy.less : copy.more(ALLERGEN_KEYS.length - QUICK_ALLERGENS.length)}
          </button>
        </div>
      </div>

      <div className="demo-body">
        <div className="demo-map">
          <svg className="demo-map__art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <rect width="400" height="300" fill="var(--demo-land)" />
            <path d="M318 -10 C 300 60, 344 110, 330 170 S 360 260, 352 320 L 420 320 L 420 -10 Z" fill="var(--demo-water)" />
            <path d="M-10 214 C 70 200, 130 228, 200 212 S 280 182, 326 190" fill="none" stroke="var(--demo-water)" strokeWidth="12" strokeLinecap="round" />
            <ellipse cx="92" cy="92" rx="44" ry="28" fill="var(--demo-park)" />
            <rect x="200" y="238" width="68" height="40" rx="14" fill="var(--demo-park)" />
            <g stroke="var(--demo-road)" strokeLinecap="round" fill="none">
              <path d="M-10 136 L 410 112" strokeWidth="6" />
              <path d="M156 -10 L 200 310" strokeWidth="5" />
              <path d="M-10 262 C 80 252, 160 276, 300 256" strokeWidth="4" />
              <path d="M44 -10 L 72 310" strokeWidth="2.5" />
              <path d="M262 -10 L 248 310" strokeWidth="2.5" />
              <path d="M-10 58 L 310 40" strokeWidth="2.5" />
            </g>
          </svg>

          {AMBIENT_PINS.map((p, i) => (
            <span
              key={i}
              className={`demo-dotpin demo-tone--${p.tone}`}
              style={{ left: `${p.left}%`, top: `${p.top}%` }}
              aria-hidden="true"
            />
          ))}

          {RESTAURANTS.map((r) => {
            const tone = restaurantTone(r, picked);
            const active = r.id === restaurantId;
            return (
              <button
                key={r.id}
                type="button"
                className={`demo-pin demo-tone--${tone}${active ? " is-active" : ""}`}
                style={{ left: `${r.pin.left}%`, top: `${r.pin.top}%` }}
                aria-label={`${r.name}, ${r.town}`}
                aria-pressed={active}
                onClick={() => openRestaurant(r.id)}
              >
                <span className="demo-pin__head">
                  <SafetyIcon tone={tone} size={14} strokeWidth={2.6} />
                </span>
                <span className="demo-pin__name">{r.name}</span>
              </button>
            );
          })}
          <p className="demo-map__hint">{copy.hint}</p>
        </div>

        <div className="demo-menu">
          <RestaurantSelect value={restaurantId} picked={picked} copy={copy} onChange={openRestaurant} />

          {restaurant.dishes.length ? (
            <>
              <div className="demo-summary">
                <p aria-live="polite">{copy.summary(okCount, states.length)}</p>
                <div className="demo-summary__bar" aria-hidden="true">
                  {toneCounts.map((n, i) => (
                    <span
                      key={i}
                      className={`demo-tone--${["safe", "likely", "warn", "danger"][i]}`}
                      style={{ flexGrow: n }}
                    />
                  ))}
                </div>
              </div>

              <Segmented
                items={categories}
                value={tab}
                onChange={(i) => {
                  stop();
                  setTab(i);
                }}
              />

              <button
                type="button"
                role="switch"
                aria-checked={onlySafe}
                className="demo-switch"
                onClick={() => {
                  stop();
                  setOnlySafe((v) => !v);
                }}
              >
                <span>{copy.onlySafe}</span>
                <span className="demo-switch__track" aria-hidden="true">
                  <span />
                </span>
              </button>

              {/* Keyed by restaurant and tab so a new list fades in; the
                  filter collapses rows in place instead of re-mounting. */}
              <ul className="demo-dishes" key={`${restaurant.id}-${tab}`}>
                {inTab.map((s, i) => {
                  const hidden = onlySafe && !isFree(s.tone);
                  return (
                    <li
                      key={s.dish.name}
                      className={`demo-dish demo-tone--${s.tone}${hidden ? " is-hidden" : ""}`}
                      style={{ "--i": i }}
                      aria-hidden={hidden}
                    >
                      <div className="demo-dish__row">
                        <span className="demo-dish__tile">
                          <SafetyIcon tone={s.tone} size={15} />
                        </span>
                        <span className="demo-dish__body">
                          <span className="demo-dish__top">
                            <strong>{s.dish.name}</strong>
                            <span>{price(s.dish.price)}</span>
                          </span>
                          <span className="demo-dish__status">{statusText(s)}</span>
                        </span>
                      </div>
                    </li>
                  );
                })}
                <li className={`demo-dishes__empty${shown.length ? "" : " is-shown"}`}>
                  {copy.none}
                </li>
              </ul>
            </>
          ) : (
            <div className="demo-nomenu">
              <span className="demo-dish__tile demo-tone--nodata">
                <SafetyIcon tone="nodata" size={18} />
              </span>
              <p>{copy.noMenu}</p>
              <a href="https://www.allercarte.com/mapa" className="demo-nomenu__btn">
                {copy.photo}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveDemo;
