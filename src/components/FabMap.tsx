import { useEffect, useRef } from "react";
import L from "leaflet";
import { Link } from "@tanstack/react-router";
import type { Facility } from "@/lib/facility-types";
import { pressureBucket, formatCapex, statusColor } from "@/lib/facility-types";
import { createRoot, type Root } from "react-dom/client";

function radiusFor(capex: number | null): number {
  if (capex == null) return 10;
  // log scale: log10(capex). $100M => ~8, $1B => ~12, $20B => ~18
  const v = Math.log10(Math.max(capex, 1e6));
  return Math.max(6, Math.min(22, (v - 6) * 4 + 6));
}

function PopupContent({ f }: { f: Facility }) {
  const b = pressureBucket(f.pressure_score);
  const s = f.pressure_score ?? 0.5;
  return (
    <div className="space-y-2 min-w-[220px]">
      <div>
        <div className="text-xs font-semibold text-foreground">{f.facility_name}</div>
        <div className="text-[11px] text-muted-foreground">
          {f.company} · {f.region_state ? `${f.region_state}, ` : ""}{f.country}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{
            background: `${statusColor(f.status)}20`,
            color: statusColor(f.status),
          }}
        >
          {f.status}
        </span>
        <span className="text-[10px] text-muted-foreground">{formatCapex(f.capex_usd)}</span>
      </div>
      <div>
        <div className="flex items-baseline justify-between text-[10px] mb-1">
          <span className="text-muted-foreground uppercase tracking-wide">Pressure</span>
          <span className="font-mono">{s.toFixed(2)} · {b.label}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${s * 100}%`, background: b.hex }} />
        </div>
      </div>
      {f.delay_status && f.delay_status !== "On Schedule" && (
        <div className="text-[10px] text-amber">Delay: {f.delay_status}</div>
      )}
      <Link
        to="/facilities"
        search={{ focus: f.facility_id }}
        className="inline-block w-full rounded bg-teal/15 text-teal px-2 py-1.5 text-center text-[11px] font-semibold hover:bg-teal/25 transition"
      >
        View Full Profile →
      </Link>
    </div>
  );
}

export function FabMap({ facilities }: { facilities: Facility[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const rootsRef = useRef<Root[]>([]);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, {
      worldCopyJump: true,
      zoomControl: true,
      attributionControl: true,
    }).setView([28, 20], 2);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    return () => {
      rootsRef.current.forEach((r) => r.unmount());
      rootsRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    rootsRef.current.forEach((r) => r.unmount());
    rootsRef.current = [];

    facilities.forEach((f) => {
      const isDelayed = f.delay_status === "Delayed >1yr" || f.delay_status === "Stalled";
      const isCancelled = f.delay_status === "Cancelled" || f.status === "Cancelled";
      const b = pressureBucket(f.pressure_score);

      let marker: L.Layer;
      if (isCancelled) {
        const icon = L.divIcon({
          className: "",
          html: `<div style="color:#6b7280;font-weight:900;font-size:22px;line-height:1;text-shadow:0 0 4px rgba(0,0,0,0.8);">✕</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        marker = L.marker([f.latitude, f.longitude], { icon });
      } else {
        const r = radiusFor(f.capex_usd);
        const cm = L.circleMarker([f.latitude, f.longitude], {
          radius: r,
          color: "#0f1117",
          weight: 1.5,
          fillColor: b.hex,
          fillOpacity: 0.85,
        });
        marker = cm;
        if (isDelayed) {
          // add a pulsing white ring via divIcon overlay
          const pulseIcon = L.divIcon({
            className: "",
            html: `<div class="pulse-marker" style="width:${r * 2 + 4}px;height:${r * 2 + 4}px;border:2px solid rgba(255,255,255,0.9);"></div>`,
            iconSize: [r * 2 + 4, r * 2 + 4],
            iconAnchor: [r + 2, r + 2],
          });
          L.marker([f.latitude, f.longitude], { icon: pulseIcon, interactive: false }).addTo(layer);
        }
      }

      // Render popup with React for consistent styling
      const container = document.createElement("div");
      const root = createRoot(container);
      root.render(<PopupContent f={f} />);
      rootsRef.current.push(root);
      marker.bindPopup(container, { minWidth: 240, closeButton: true });
      marker.addTo(layer);
    });
  }, [facilities]);

  return <div ref={ref} className="h-full w-full" />;
}
