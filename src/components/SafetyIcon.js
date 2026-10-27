import React from "react";

// Same lucide glyphs the besayfe app draws on map pins and dish tiles.
const SHIELD =
  "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z";

const GLYPHS = {
  safe: [<path key="s" d={SHIELD} />, <path key="c" d="m9 12 2 2 4-4" />],
  likely: [<path key="s" d={SHIELD} />],
  warn: [
    <path key="t" d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />,
    <path key="l" d="M12 9v4" />,
    <path key="d" d="M12 17h.01" />
  ],
  danger: [<path key="a" d="M18 6 6 18" />, <path key="b" d="m6 6 12 12" />],
  nodata: [
    <circle key="c" cx="12" cy="12" r="10" />,
    <path key="q" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />,
    <path key="d" d="M12 17h.01" />
  ]
};

// Dish states in the app's menu map onto the same five glyphs.
const ALIASES = { caution: "warn" };

function SafetyIcon({ tone, size = 16, strokeWidth = 2.2 }) {
  const glyph = GLYPHS[ALIASES[tone] || tone];
  if (!glyph) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {glyph}
    </svg>
  );
}

export default SafetyIcon;
