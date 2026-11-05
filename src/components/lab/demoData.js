// Example data for the hero demo on /lab. The restaurants are made up; the
// dishes carry the allergens they usually have. Allergen keys follow the
// order of home.allergens in translations.js, so labels come from there.
export const ALLERGEN_KEYS = [
  "gluten",
  "crustaceans",
  "eggs",
  "fish",
  "peanuts",
  "soy",
  "milk",
  "nuts",
  "celery",
  "mustard",
  "sesame",
  "sulphites",
  "lupin",
  "molluscs"
];

// Shown first in the compact chip row; the rest open from "+8".
export const QUICK_ALLERGENS = ["gluten", "milk", "eggs", "fish", "molluscs", "nuts"];

// Category index: 0 mains, 1 starters, 2 desserts (home.mock.categories).
export const RESTAURANTS = [
  {
    id: "tasca",
    name: "Tasca do Largo",
    town: "Lisboa",
    pin: { left: 26, top: 64 },
    dishes: [
      { name: "Polvo à lagareiro", price: 18.5, cat: 0, contains: ["molluscs"], confirmed: true },
      { name: "Arroz de pato", price: 14, cat: 0, contains: [], confirmed: false },
      { name: "Lulas grelhadas", price: 15.5, cat: 0, contains: ["molluscs"], traces: ["gluten"] },
      { name: "Bacalhau com natas", price: 13.9, cat: 0, contains: ["fish", "milk", "gluten"], confirmed: true },
      { name: "Caldo verde", price: 3.5, cat: 1, contains: [], confirmed: true },
      { name: "Pataniscas de bacalhau", price: 6, cat: 1, contains: ["fish", "gluten", "eggs"], confirmed: true },
      { name: "Arroz doce", price: 4, cat: 2, contains: ["milk", "eggs"], confirmed: true },
      { name: "Mousse de chocolate", price: 4.5, cat: 2, contains: ["eggs", "milk"], traces: ["nuts"] }
    ]
  },
  {
    id: "ribeira",
    name: "Marisqueira da Ribeira",
    town: "Porto",
    pin: { left: 70, top: 30 },
    dishes: [
      { name: "Arroz de marisco", price: 22, cat: 0, contains: ["crustaceans", "molluscs", "fish", "celery"], confirmed: true },
      { name: "Dourada grelhada", price: 16, cat: 0, contains: ["fish"], confirmed: true },
      { name: "Gambas ao alho", price: 12, cat: 1, contains: ["crustaceans"], traces: ["gluten"] },
      { name: "Amêijoas à Bulhão Pato", price: 14.5, cat: 1, contains: ["molluscs", "sulphites"] },
      { name: "Salada mista", price: 5, cat: 1, contains: [], confirmed: true },
      { name: "Pudim flan", price: 4, cat: 2, contains: ["eggs", "milk"] }
    ]
  },
  {
    id: "central",
    name: "Café Central",
    town: "Coimbra",
    pin: { left: 46, top: 46 },
    dishes: [
      { name: "Francesinha", price: 13, cat: 0, contains: ["gluten", "milk", "eggs", "mustard"] },
      { name: "Bitoque", price: 11, cat: 0, contains: ["eggs"], traces: ["gluten"] },
      { name: "Tosta mista", price: 4, cat: 1, contains: ["gluten", "milk"], confirmed: true },
      { name: "Sopa de legumes", price: 2.5, cat: 1, contains: ["celery"], confirmed: true },
      { name: "Pastel de nata", price: 1.4, cat: 2, contains: ["gluten", "eggs", "milk"], confirmed: true },
      { name: "Salada de fruta", price: 3, cat: 2, contains: [] }
    ]
  },
  {
    id: "patio",
    name: "O Pátio",
    town: "Faro",
    pin: { left: 80, top: 74 },
    dishes: []
  }
];

// Background pins with no menu behind them, for density on the map.
export const AMBIENT_PINS = [
  { left: 14, top: 36, tone: "warn" },
  { left: 58, top: 18, tone: "safe" },
  { left: 60, top: 78, tone: "likely" },
  { left: 88, top: 44, tone: "danger" }
];

export function dishState(dish, picked) {
  const hit = dish.contains.filter((a) => picked.includes(a));
  if (hit.length) return { tone: "danger", hit };
  const trace = (dish.traces || []).filter((a) => picked.includes(a));
  if (trace.length) return { tone: "warn", hit: trace };
  return { tone: dish.confirmed ? "safe" : "likely", hit: [] };
}

// A restaurant takes the colour of its best dish, as on the app's map.
const RANK = ["safe", "likely", "warn", "danger"];
export function restaurantTone(restaurant, picked) {
  if (!restaurant.dishes.length) return "nodata";
  const best = Math.min(
    ...restaurant.dishes.map((d) => RANK.indexOf(dishState(d, picked).tone))
  );
  return RANK[best];
}

export const DEMO_COPY = {
  pt: {
    tag: "Experimenta",
    playing: "A mostrar exemplos",
    paused: "Em pausa",
    pause: "Pausar a demonstração",
    resume: "Continuar a demonstração",
    title: "Escolhe o que evitas e vê o mapa mudar.",
    pick: "As tuas alergias",
    more: (n) => `+${n}`,
    less: "Menos",
    clear: "Limpar",
    restaurant: "Restaurante",
    example: "Restaurante de exemplo",
    onlySafe: "Só o que posso comer",
    summary: (ok, total) => `${ok} de ${total} pratos sem as tuas alergias`,
    none: "Nenhum prato desta secção serve para ti.",
    noMenu: "Ainda não há menu deste restaurante.",
    photo: "Fotografar o menu",
    state: {
      safe: "Sem as tuas alergias",
      likely: "Sem as tuas alergias, por confirmar",
      warn: (list) => `Possível contacto · ${list}`,
      danger: (list) => `Contém ${list}`
    },
    hint: "Toca num pin para veres o menu",
    locale: "pt-PT"
  },
  en: {
    tag: "Try it",
    playing: "Showing examples",
    paused: "Paused",
    pause: "Pause the demo",
    resume: "Resume the demo",
    title: "Pick what you avoid and watch the map change.",
    pick: "Your allergies",
    more: (n) => `+${n}`,
    less: "Less",
    clear: "Clear",
    restaurant: "Restaurant",
    example: "Example restaurant",
    onlySafe: "Only what I can eat",
    summary: (ok, total) => `${ok} of ${total} dishes free of your allergens`,
    none: "Nothing in this section works for you.",
    noMenu: "There's no menu for this restaurant yet.",
    photo: "Photograph the menu",
    state: {
      safe: "Free of your allergens",
      likely: "Free of your allergens, unconfirmed",
      warn: (list) => `Possible cross-contact · ${list}`,
      danger: (list) => `Contains ${list}`
    },
    hint: "Tap a pin to open its menu",
    locale: "en-GB"
  }
};
