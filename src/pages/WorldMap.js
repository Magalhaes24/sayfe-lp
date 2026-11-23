import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { countryName, flag } from "./analyticsExtra";

// Bubbles on a light world map: one per city (taken from the visitor's time
// zone, so it is a rough place, never an exact one). Bigger = more visits.
export default function WorldMap({ places, total }) {
  const host = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);

  useEffect(() => {
    if (!host.current || map.current) return undefined;
    map.current = L.map(host.current, { worldCopyJump: true, minZoom: 1, zoomControl: true, scrollWheelZoom: false }).setView([30, 10], 2);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 10
    }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    return () => {
      map.current.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !layer.current) return;
    layer.current.clearLayers();
    const pts = places.filter((p) => p.lat !== null && p.lon !== null);
    if (!pts.length) return;
    const max = Math.max(...pts.map((p) => p.sessions));
    pts.forEach((p) => {
      const r = 7 + Math.sqrt(p.sessions / max) * 26;
      const m = L.circleMarker([p.lat, p.lon], {
        radius: r,
        color: "#2f6a44",
        weight: 1.5,
        fillColor: "#3d7a52",
        fillOpacity: 0.55
      });
      m.bindTooltip(
        `<strong>${flag(p.cc)} ${p.city}</strong><br>${countryName(p.cc)}<br>${p.sessions} visitas` +
          (total ? ` · ${Math.round((p.sessions / total) * 100)}%` : "") +
          `<br>${p.ctaPct}% clicam em “Abrir o mapa”`,
        { direction: "top" }
      );
      m.addTo(layer.current);
    });
    if (pts.length === 1) map.current.setView([pts[0].lat, pts[0].lon], 5);
    else map.current.fitBounds(L.latLngBounds(pts.map((p) => [p.lat, p.lon])).pad(0.3), { maxZoom: 6 });
  }, [places, total]);

  return <div className="vz-map" ref={host} />;
}
