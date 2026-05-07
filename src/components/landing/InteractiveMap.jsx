import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { MapContainer, TileLayer, GeoJSON, ZoomControl, useMap, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Search, X, ArrowRight, RotateCcw, GitCompare, Shield } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Initial view: tight crop on the AMP cluster so freguesias are the
// protagonist from the moment the section opens. Ocean / Portugal
// label / Iberian peninsula context remain loaded but live off-frame;
// they reveal as the user zooms out (or resets via the button, which
// uses these same bounds, so reset always returns here too).
const PORTO_BOUNDS = [[40.85, -9.00], [41.45, -7.85]];
const PORTO_CENTER = [41.15, -8.45];
const PORTO_ZOOM = 10;

// CARTO Dark Matter no-labels — gives subtle urban features (cities,
// roads) without competing labels. Tile layer underpins the editorial
// overlays so other-city context is visible like before.
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png';
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> &middot; ' +
  '&copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>';

// Editorial geography stack:
//   1. CARTO Dark Matter tiles below — urban context, no labels
//   2. Ocean tint donut polygon — outer rect minus the Iberian peninsula
//      hole. Filled NAVY at high opacity → ocean reads as blue, land
//      shows through tile features (cities, roads, urban density).
//   3. Portugal–Spain border polyline — faint dashed white so the eye
//      can place Porto inside Portugal vs the surrounding peninsula.
//   4. Freguesias (intact)
//   5. AMP halo + cartographic labels (Porto / Oceano Atlântico)
// Saturated water blue — the previous #0e2e5e still read as "dark
// theme detail". This is closer to a Google-Maps-style ocean: clearly
// reads as water at a glance, just darker so the editorial composition
// holds.
const NAVY_OCEAN = '#1f6dc8';

// Simplified Iberian Peninsula outline (~37 vertices, [lng, lat]).
// Used as the HOLE in the ocean donut. Low res by design.
const IBERIA_COORDS = [
  [-9.30, 42.90], [-9.00, 43.50], [-7.80, 43.55], [-6.50, 43.55],
  [-5.50, 43.45], [-4.50, 43.45], [-3.50, 43.45], [-2.50, 43.40],
  [-1.80, 43.35], [-1.40, 43.25], [-0.50, 42.95], [ 0.30, 42.85],
  [ 1.00, 42.70], [ 2.20, 42.45], [ 3.20, 42.30], [ 3.30, 41.90],
  [ 2.50, 41.55], [ 1.00, 41.10], [ 0.50, 40.50], [ 0.00, 39.50],
  [-0.30, 38.80], [-0.70, 37.90], [-1.50, 37.40], [-2.50, 36.80],
  [-4.00, 36.60], [-5.30, 36.10], [-6.30, 36.50], [-7.40, 37.10],
  [-8.50, 37.05], [-8.95, 37.05], [-9.00, 38.00], [-9.50, 38.65],
  [-9.40, 39.30], [-9.10, 40.00], [-8.85, 40.50], [-8.75, 41.00],
  [-8.75, 41.70], [-8.85, 42.00], [-8.95, 42.50], [-9.30, 42.90],
];

const OCEAN_OVERLAY = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    properties: { name: 'Atlantic + Mediterranean tint' },
    geometry: {
      type: 'Polygon',
      coordinates: [
        // Outer ring (CCW): big rectangle covering all visible map area
        [
          [-20, 30], [12, 30], [12, 48], [-20, 48], [-20, 30],
        ],
        // Inner ring (CW = reversed Iberia): the hole that lets land
        // tile features show through
        IBERIA_COORDS.slice().reverse(),
      ],
    },
  }],
};

const OCEAN_OVERLAY_STYLE = {
  fillColor: NAVY_OCEAN,
  fillOpacity: 0.88,
  color: 'rgba(255, 255, 255, 0.16)',
  weight: 0.6,
};

// Portugal–Spain border, north → south, [lng, lat]. Hand-traced low
// resolution — enough to anchor "Porto is in Portugal" without atlas
// precision.
const PORTUGAL_SPAIN_BORDER = [
  [-8.88, 41.87],   // N coast — Caminha / Vigo
  [-8.20, 42.05],
  [-7.40, 41.85],
  [-6.55, 41.95],
  [-6.20, 41.55],
  [-7.05, 41.10],
  [-6.85, 40.40],
  [-6.95, 39.85],
  [-7.25, 39.55],
  [-7.40, 39.10],
  [-7.30, 38.50],
  [-7.00, 38.20],
  [-6.95, 37.80],
  [-7.40, 37.20],   // Algarve / Atlantic
];

// Andrew's monotone-chain convex hull. Used to wrap a faint white halo
// around the AMP cluster so the eye reads "this is Greater Porto" at a
// glance, against the surrounding peninsula.
function convexHull(points) {
  if (!points || points.length < 3) return points || [];
  const pts = points.slice().sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]));
  const cross = (O, A, B) => (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

// Cartographic labels via Leaflet divIcon — non-interactive, styled in
// index.css under .bs-map-label-{ocean,porto}. Built per render so they
// follow the active i18n locale.
const escapeHtml = (s) => String(s || '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));
const buildOceanIcon = (label) => L.divIcon({
  className: '',
  html: `<span class="bs-map-label bs-map-label-ocean">${escapeHtml(String(label).toUpperCase())}</span>`,
  iconSize: [220, 24],
  iconAnchor: [110, 12],
});
// Atlas-style country label — tracked uppercase, faint white. Used for
// PORTUGAL and ESPAÑA so the eye anchors the cluster geographically.
// "PORTO" as a city label is gone (the cluster + halo already say it).
const buildCountryIcon = (label) => L.divIcon({
  className: '',
  html: `<span class="bs-map-label bs-map-label-country">${escapeHtml(String(label).toUpperCase())}</span>`,
  iconSize: [240, 32],
  iconAnchor: [120, 16],
});
const OCEAN_LABEL_POS    = [40.30, -9.40];
const PORTUGAL_LABEL_POS = [39.80, -8.15];   // Google-style geographic center
const SPAIN_LABEL_POS    = [41.20, -7.10];   // (kept for future revival)

const norm = (s) => (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const fmt = (n) => (n == null || Number.isNaN(n) ? '—' : Number(n).toLocaleString('pt-PT'));

// --- Skeleton --------------------------------------------------------------
function Skeleton({ label }) {
  return (
    <div className="absolute inset-0 grid place-items-center pointer-events-none z-[300] bg-background">
      <div className="font-mono text-[13px] uppercase tracking-[0.18em] text-foreground/85 animate-pulse">
        {label}
      </div>
    </div>
  );
}

// --- Reset / Compare buttons ----------------------------------------------
function MapButtons({ onReset, onClearCompare, hasCompare, resetLabel, exitCompareLabel }) {
  return (
    <div className="absolute bottom-32 right-4 z-[400] flex flex-col gap-2">
      {hasCompare && (
        <button
          onClick={onClearCompare}
          title={exitCompareLabel}
          aria-label={exitCompareLabel}
          className="w-9 h-9 grid place-items-center bg-background/90 backdrop-blur border border-border text-foreground hover:text-primary hover:border-primary transition-colors"
        >
          <GitCompare className="w-4 h-4" />
        </button>
      )}
      <button
        onClick={onReset}
        title={resetLabel}
        aria-label={resetLabel}
        className="w-9 h-9 grid place-items-center bg-background/90 backdrop-blur border border-border text-foreground hover:text-foreground hover:border-foreground transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
}

function ResetController({ trigger }) {
  const map = useMap();
  useEffect(() => {
    if (trigger > 0) {
      map.flyToBounds(PORTO_BOUNDS, { padding: [40, 40], duration: 0.6 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);
  return null;
}

function FlyToFeature({ feature }) {
  const map = useMap();
  useEffect(() => {
    if (!feature) return;
    const c = feature.properties.centroide;
    if (Array.isArray(c) && c.length === 2) {
      // GeoAPI.pt centroide is [lng, lat]
      map.flyTo([c[1], c[0]], 13, { duration: 0.6 });
    }
  }, [feature, map]);
  return null;
}

// Fit Greater Porto into the (possibly resized) container on mount
function FitBoundsOnMount({ bounds, options }) {
  const map = useMap();
  const ranRef = useRef(false);
  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    map.fitBounds(bounds, options);
  }, [map, bounds, options]);
  return null;
}

// Scroll wheel zoom only when ⌘ / Ctrl is held — page scroll wins by default.
// Capture-phase wheel listener toggles Leaflet's scrollWheelZoom enable/disable
// before Leaflet's own (bubble-phase) listener fires for that same wheel tick.
function CtrlWheelZoom() {
  const map = useMap();
  useEffect(() => {
    map.scrollWheelZoom.disable();
    const container = map.getContainer();
    const onWheel = (e) => {
      const wantsZoom = e.ctrlKey || e.metaKey;
      if (wantsZoom && !map.scrollWheelZoom.enabled()) map.scrollWheelZoom.enable();
      if (!wantsZoom && map.scrollWheelZoom.enabled()) map.scrollWheelZoom.disable();
    };
    container.addEventListener('wheel', onWheel, { capture: true, passive: true });
    return () => container.removeEventListener('wheel', onWheel, { capture: true });
  }, [map]);
  return null;
}

// --- Stat row inside panel ------------------------------------------------
function StatRow({ label, value, unit }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border/40 py-2.5">
      <span className="font-mono text-[13px] uppercase tracking-[0.18em] font-medium text-foreground">{label}</span>
      <span className="font-display text-base font-black tracking-tightest text-foreground">
        {value}
        {unit && (
          <span className="text-foreground text-[13px] ml-1.5 font-mono font-normal tracking-normal normal-case">
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}

// --- Brasão (heraldic shield) — image with skeleton + onError fallback ----
function Brasao({ src, name, dicofre, t }) {
  const [status, setStatus] = useState(src ? 'loading' : 'missing');

  // {0}-style placeholder substitution for the i18n strings
  const fmtName = (key) => String((t && t(key)) || '').replace('{0}', name);

  if (!src || status === 'missing') {
    // Elegant fallback: outlined Shield icon + DICOFRE in mono
    return (
      <div
        className="group w-[120px] h-[120px] mx-auto mb-2 flex flex-col items-center justify-center transition-transform duration-200 hover:scale-[1.05]"
        style={{ padding: 16 }}
        aria-label={fmtName('map.brasaoMissingAria')}
      >
        <Shield
          className="w-10 h-10 text-foreground"
          strokeWidth={1.25}
        />
        <p className="mt-2 font-mono text-[13px] tracking-[0.18em] text-foreground">
          {dicofre}
        </p>
      </div>
    );
  }

  return (
    <div
      className="group relative w-[120px] h-[120px] mx-auto mb-2 transition-transform duration-200 hover:scale-[1.05]"
      style={{ padding: 16 }}
    >
      {/* Soft glow behind dark brasões so they don't disappear on obsidian */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 60%)',
        }}
      />
      {/* Skeleton shimmer while loading */}
      {status === 'loading' && (
        <div
          aria-hidden="true"
          className="absolute inset-4 animate-pulse"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        />
      )}
      <img
        src={src}
        alt={fmtName('map.brasaoAlt')}
        loading="lazy"
        decoding="async"
        className="relative w-full h-full object-contain"
        style={{
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
          opacity: status === 'loaded' ? 1 : 0,
          transition: 'opacity 0.4s ease-out',
        }}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('missing')}
      />
    </div>
  );
}

// --- Side panel for one freguesia ----------------------------------------
function FreguesiaPanel({ feature, onClose, label, brasoesMap, t }) {
  if (!feature) return null;
  const p = feature.properties;
  const verdePerHab = p.populacao > 0 ? Math.round((p.area_verde_m2 || 0) / p.populacao) : null;
  const brasaoEntry = brasoesMap?.[p.dicofre] || null;
  const brasaoSrc = brasaoEntry?.brasao || null;

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="font-mono text-[13px] uppercase tracking-[0.18em] font-medium text-accent">
            {label} &middot; {p.municipio}
          </div>
          <button
            onClick={onClose}
            aria-label={t('map.tooltip.close')}
            className="p-1 -mr-1 -mt-1 text-foreground hover:text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="font-display text-2xl sm:text-3xl font-black tracking-tightest leading-[1.05] mb-6 text-foreground">
          {p.nome}
        </h3>

        <Brasao src={brasaoSrc} name={p.nome} dicofre={p.dicofre} t={t} />

        {brasaoEntry?.attribution && (
          <p className="text-center font-mono text-[13px] uppercase tracking-[0.18em] text-foreground mb-6">
            {brasaoEntry.attribution}
          </p>
        )}
        {!brasaoEntry?.attribution && <div className="mb-6" />}

        <div className="space-y-0 mb-8">
          <StatRow label={t('map.panel.stats.populacao')} value={fmt(p.populacao)} />
          <StatRow label={t('map.panel.stats.area')} value={fmt(p.area_km2)} unit="km²" />
          <StatRow label={t('map.panel.stats.densidade')} value={fmt(p.densidade)} unit={t('map.panel.stats.densidadeUnit')} />
          <StatRow label={t('map.panel.stats.escolas')} value={fmt(p.num_escolas)} />
          <StatRow label={t('map.panel.stats.areaVerde')} value={fmt(p.area_verde_m2)} unit="m²" />
          <StatRow label={t('map.panel.stats.verdePerHab')} value={fmt(verdePerHab)} unit="m²" />
          <StatRow label={t('map.panel.stats.comboios')} value={fmt(p.comboios_ativos)} />
        </div>

        {p.jf_nome && (
          <div className="border-t border-border pt-6 mb-6">
            <div className="font-mono text-[13px] uppercase tracking-[0.18em] font-medium text-foreground mb-2">
              {t('map.panel.junta')}
            </div>
            <div className="font-display text-base font-black tracking-tightest text-foreground mb-1 leading-tight">
              {p.jf_nome}
            </div>
            {p.jf_email && (
              <a
                href={`mailto:${p.jf_email}`}
                className="text-[13px] font-mono text-foreground/95 hover:text-primary transition-colors break-all block"
              >
                {p.jf_email}
              </a>
            )}
            {p.jf_url && (
              <a
                href={p.jf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] font-mono text-foreground/90 hover:text-primary transition-colors break-all block mt-0.5"
              >
                {p.jf_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            )}
          </div>
        )}

        <div className="border-t border-border pt-6 mb-6">
          <div className="font-mono text-[13px] uppercase tracking-[0.18em] font-medium text-foreground mb-2">
            {t('map.panel.camara')}
          </div>
          <div className="font-display text-base font-black tracking-tightest text-foreground mb-1">
            {p.camara_nome || '—'}
          </div>
          {p.camara_email && (
            <a
              href={`mailto:${p.camara_email}`}
              className="text-[13px] font-mono text-foreground/95 hover:text-primary transition-colors break-all"
            >
              {p.camara_email}
            </a>
          )}
        </div>

        <div className="space-y-3">
          {p.jf_email && (
            <a
              href={`mailto:${p.jf_email}`}
              className="w-full inline-flex items-center justify-between px-5 py-4 text-[13px] font-mono uppercase tracking-[0.18em] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t('map.panel.contactJunta')} <ArrowRight className="w-4 h-4" />
            </a>
          )}
          {p.camara_url && (
            <a
              href={p.camara_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-between px-5 py-4 text-[13px] font-mono uppercase tracking-[0.18em] border border-foreground/25 text-foreground hover:bg-foreground/5 transition-colors"
            >
              {t('map.panel.contactCamara')} <ArrowRight className="w-4 h-4" />
            </a>
          )}
          <button className="w-full inline-flex items-center justify-between px-5 py-4 text-[13px] font-mono uppercase tracking-[0.18em] border border-foreground/25 text-foreground hover:bg-foreground/5 transition-colors">
            {t('map.panel.proposals')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {p._todo && p._todo.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border/40 text-[13px] font-mono text-foreground leading-relaxed">
            <div className="uppercase tracking-[0.18em] mb-1.5 text-foreground/85">{t('map.panel.todoLabel')}</div>
            <ul className="space-y-1">
              {p._todo.map((todoItem, i) => <li key={i}>· {todoItem}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// --- GeoJSON layer with imperative style updates --------------------------
function FreguesiasLayer({ data, onClick, selectedDicofres }) {
  const ref = useRef(null);
  const selectedRef = useRef(selectedDicofres);
  selectedRef.current = selectedDicofres;

  useEffect(() => {
    const layer = ref.current;
    if (!layer) return;
    layer.eachLayer((sub) => {
      const p = sub.feature.properties;
      const isSelected = selectedDicofres.includes(p.dicofre);
      sub.setStyle({
        fillColor: p.cor_principal,
        fillOpacity: 0.6,
        color: isSelected ? '#003399' : '#FAFAF7',
        weight: isSelected ? 3 : 1.5,
        opacity: 1,
      });
    });
  }, [selectedDicofres]);

  const styleFn = useCallback((feature) => ({
    fillColor: feature.properties.cor_principal,
    fillOpacity: 0.6,
    color: '#FAFAF7',
    weight: 1.5,
    opacity: 1,
  }), []);

  const onEachFeature = useCallback((feature, layer) => {
    layer.on({
      mouseover: (e) => {
        const p = e.target.feature.properties;
        const sel = selectedRef.current.includes(p.dicofre);
        e.target.setStyle({ fillOpacity: 0.9, color: '#003399', weight: sel ? 3 : 2 });
        e.target.bringToFront();
      },
      mouseout: (e) => {
        const p = e.target.feature.properties;
        const sel = selectedRef.current.includes(p.dicofre);
        e.target.setStyle({
          fillColor: p.cor_principal,
          fillOpacity: 0.6,
          color: sel ? '#003399' : '#FAFAF7',
          weight: sel ? 3 : 1.5,
        });
      },
      click: () => onClick(feature),
      dblclick: (e) => {
        e.originalEvent && e.originalEvent.stopPropagation();
        onClick(feature, true);
      },
    });
    layer.bindTooltip(
      `<div class="bs-tt"><div class="bs-tt-eyebrow">${feature.properties.municipio}</div><div class="bs-tt-name">${feature.properties.nome}</div></div>`,
      { sticky: true, direction: 'top', offset: [0, -6], opacity: 1, className: 'bs-tooltip' }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <GeoJSON ref={ref} data={data} style={styleFn} onEachFeature={onEachFeature} />;
}

// --- Main component -------------------------------------------------------
export default function InteractiveMap() {
  const { t } = useI18n();
  const sectionRef = useScrollReveal();
  const [geojson, setGeojson] = useState(null);
  const [brasoesMap, setBrasoesMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedA, setSelectedA] = useState(null);
  const [selectedB, setSelectedB] = useState(null);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [resetTick, setResetTick] = useState(0);
  const [flyTarget, setFlyTarget] = useState(null);

  // Localized cartographic label icons — rebuilt when locale changes
  const oceanIcon    = useMemo(() => buildOceanIcon(t('map.labels.ocean')), [t]);
  const portugalIcon = useMemo(() => buildCountryIcon(t('map.labels.portugal')), [t]);

  useEffect(() => {
    let cancelled = false;
    fetch('/data/freguesias-porto.geojson')
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(d => { if (!cancelled) { setGeojson(d); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  // Brasões map (DICOFRE -> { brasao, attribution }). Loaded lazily once;
  // panel falls back to the Shield/DICOFRE placeholder if the entry is null.
  useEffect(() => {
    let cancelled = false;
    fetch('/data/freguesias-brasoes.json')
      .then(r => (r.ok ? r.json() : {}))
      .then(d => { if (!cancelled) setBrasoesMap(d); })
      .catch(() => { if (!cancelled) setBrasoesMap({}); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (selectedB) setSelectedB(null);
        else if (selectedA) setSelectedA(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedA, selectedB]);

  const handleClick = useCallback((feature, fly = false) => {
    if (fly) setFlyTarget(feature);
    setSelectedA(prevA => {
      // First click → A
      if (!prevA) return feature;
      // Same as A → toggle off (and promote B if any)
      if (prevA.properties.dicofre === feature.properties.dicofre) {
        setSelectedB(prevB => null);
        return null;
      }
      // Different → set as B (or toggle B off if same)
      setSelectedB(prevB => {
        if (prevB && prevB.properties.dicofre === feature.properties.dicofre) return null;
        return feature;
      });
      return prevA;
    });
  }, []);

  const matches = useMemo(() => {
    if (!geojson || !search.trim()) return [];
    const q = norm(search);
    return geojson.features
      .filter(f => norm(f.properties.nome).includes(q) || norm(f.properties.municipio).includes(q))
      .slice(0, 8);
  }, [geojson, search]);

  const stats = useMemo(() => {
    if (!geojson) return null;
    const munis = new Set(geojson.features.map(f => f.properties.municipio));
    const totalPop = geojson.features.reduce((s, f) => s + (f.properties.populacao || 0), 0);
    return { freguesias: geojson.features.length, municipios: munis.size, populacao: totalPop };
  }, [geojson]);

  const selectedDicofres = useMemo(() => [
    selectedA?.properties.dicofre,
    selectedB?.properties.dicofre,
  ].filter(Boolean), [selectedA, selectedB]);

  const selectFromSearch = (f) => {
    setSearch('');
    setSearchOpen(false);
    setFlyTarget(f);
    handleClick(f);
  };

  const closePanelA = () => {
    setSelectedA(selectedB || null);
    setSelectedB(null);
  };

  const compareOpen = !!selectedB;
  const panelOpen = !!selectedA;

  // Convex hull of all freguesia ring vertices → the AMP halo polyline.
  // [lng, lat] in input/output; we flip to [lat, lng] for Leaflet rendering.
  const ampHullLatLng = useMemo(() => {
    if (!geojson?.features?.length) return null;
    const points = [];
    for (const f of geojson.features) {
      const g = f.geometry;
      if (!g) continue;
      if (g.type === 'Polygon') {
        for (const ring of g.coordinates) for (const pt of ring) points.push([pt[0], pt[1]]);
      } else if (g.type === 'MultiPolygon') {
        for (const poly of g.coordinates) for (const ring of poly) for (const pt of ring) points.push([pt[0], pt[1]]);
      }
    }
    const hull = convexHull(points);
    if (hull.length < 3) return null;
    const closed = [...hull, hull[0]];
    return closed.map(([lng, lat]) => [lat, lng]);
  }, [geojson]);

  return (
    <section id="map" ref={sectionRef} className="reveal-section bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
        <span className="font-mono text-[13px] tracking-[0.18em] font-medium uppercase text-accent">
          05 — {t('map.title')}
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black mt-3 tracking-tightest text-foreground max-w-3xl">
          {t('map.headline.pre')}<i>{t('map.headline.accent')}</i>{t('map.headline.post')}
        </h2>
        <p className="text-foreground text-base sm:text-lg max-w-2xl mt-4 font-body leading-relaxed">
          {t('map.subtitle')}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative w-full h-[60vh] min-h-[420px] max-h-[640px] bg-background border border-border overflow-hidden">
        {loading && <Skeleton label={t('map.skeleton')} />}
        {error && (
          <div className="absolute inset-0 grid place-items-center text-foreground/95 font-mono text-sm z-[400]">
            {t('map.errorPrefix')} {error}
          </div>
        )}

        {geojson && (
          <MapContainer
            center={PORTO_CENTER}
            zoom={PORTO_ZOOM}
            minZoom={8}
            maxZoom={16}
            zoomControl={false}
            scrollWheelZoom={false}
            className="w-full h-full bs-map"
            style={{ background: NAVY_OCEAN }}
          >
            {/* CARTO tiles — urban context (cities, roads) under everything */}
            <TileLayer url={TILE_URL} attribution={TILE_ATTR} subdomains="abcd" maxZoom={20} />

            {/* Ocean tint donut — paints the Atlantic + Mediterranean blue
                while letting tile features show through on land. */}
            <GeoJSON
              data={OCEAN_OVERLAY}
              style={() => OCEAN_OVERLAY_STYLE}
              interactive={false}
            />

            {/* Portugal–Spain border (faint dashed white) — anchors Porto
                inside Portugal and lets the eye distinguish the two
                countries on land. */}
            <Polyline
              positions={PORTUGAL_SPAIN_BORDER.map(([lng, lat]) => [lat, lng])}
              pathOptions={{
                color: 'rgba(255, 255, 255, 0.45)',
                weight: 1,
                dashArray: '4 5',
                interactive: false,
              }}
            />

            <FreguesiasLayer data={geojson} onClick={handleClick} selectedDicofres={selectedDicofres} />

            {/* AMP halo removed — the colored cluster reads as Porto
                on its own; the halo was always going to feel like a
                frame around it. Convex-hull computation kept above in
                case we ever want to revive a different treatment. */}

            {/* Cartographic labels — atlas-style country names + ocean.
                The cluster + halo say "this is Porto"; the country
                labels do the geography ("we're in Portugal, that's
                Spain"). */}
            <Marker
              position={OCEAN_LABEL_POS}
              icon={oceanIcon}
              interactive={false}
              keyboard={false}
            />
            <Marker
              position={PORTUGAL_LABEL_POS}
              icon={portugalIcon}
              interactive={false}
              keyboard={false}
            />

            <ZoomControl position="bottomright" />
            <FitBoundsOnMount bounds={PORTO_BOUNDS} options={{ padding: [20, 20] }} />
            <CtrlWheelZoom />
            <ResetController trigger={resetTick} />
            <FlyToFeature feature={flyTarget} />
          </MapContainer>
        )}

        {/* Search */}
        <div className="absolute top-4 left-4 z-[400] w-[260px] sm:w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/85 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              placeholder={t('map.searchPlaceholder')}
              className="w-full pl-9 pr-3 py-2.5 text-[13px] font-mono uppercase tracking-[0.18em] bg-background/95 backdrop-blur border border-border text-foreground placeholder:text-foreground/85 focus:outline-none focus:border-primary"
            />
          </div>
          {searchOpen && search.trim() && matches.length > 0 && (
            <ul className="mt-1 bg-background/95 backdrop-blur border border-border max-h-[300px] overflow-y-auto shadow-xl">
              {matches.map(f => (
                <li key={f.properties.dicofre}>
                  <button
                    onMouseDown={() => selectFromSearch(f)}
                    className="w-full px-3 py-2.5 text-left hover:bg-primary/30 transition-colors border-b border-border/30 last:border-b-0"
                  >
                    <div className="font-display font-black tracking-tightest text-sm text-foreground leading-tight">
                      {f.properties.nome}
                    </div>
                    <div className="text-[13px] font-mono uppercase tracking-[0.18em] text-foreground/85 mt-0.5">
                      {f.properties.municipio}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {searchOpen && search.trim() && matches.length === 0 && (
            <div className="mt-1 bg-background/95 backdrop-blur border border-border px-3 py-2.5 text-[13px] font-mono uppercase tracking-[0.18em] text-foreground/85">
              {t('map.noResults')}
            </div>
          )}
        </div>

        <MapButtons
          onReset={() => setResetTick(prev => prev + 1)}
          onClearCompare={() => setSelectedB(null)}
          hasCompare={compareOpen}
          resetLabel={t('map.controls.reset')}
          exitCompareLabel={t('map.controls.exitCompare')}
        />

        {/* Legend */}
        {stats && (
          <div className="absolute bottom-4 left-4 z-[400] bg-background/85 backdrop-blur border border-border p-4 w-[280px] sm:w-[320px]">
            <div className="font-mono text-[13px] uppercase tracking-[0.18em] font-medium text-accent mb-3">
              {t('map.legend.region')}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="font-display text-2xl sm:text-3xl font-black tracking-tightest text-foreground leading-none">
                  {stats.freguesias}
                </div>
                <div className="font-mono text-[13px] uppercase tracking-[0.18em] font-medium text-foreground mt-1.5">{t('map.legend.parishes')}</div>
              </div>
              <div>
                <div className="font-display text-2xl sm:text-3xl font-black tracking-tightest text-foreground leading-none">
                  {stats.municipios}
                </div>
                <div className="font-mono text-[13px] uppercase tracking-[0.18em] font-medium text-foreground mt-1.5">{t('map.legend.municipalities')}</div>
              </div>
              <div>
                <div className="font-display text-2xl sm:text-3xl font-black tracking-tightest text-foreground leading-none">
                  {(stats.populacao / 1e6).toFixed(2)}M
                </div>
                <div className="font-mono text-[13px] uppercase tracking-[0.18em] font-medium text-foreground mt-1.5">{t('map.legend.inhabitants')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Side panel(s) — desktop side-right, mobile bottom-sheet */}
        {(panelOpen || compareOpen) && (
          <>
            <div
              className="fixed inset-0 bg-background/60 z-[450] lg:hidden"
              onClick={closePanelA}
            />
            <div
              className={`fixed lg:absolute z-[500] left-0 right-0 bottom-0 lg:left-auto lg:top-0 h-[80vh] lg:h-full ${compareOpen ? 'lg:w-[840px]' : 'lg:w-[420px]'} w-full bg-background border-t lg:border-t-0 lg:border-l border-border animate-fade-in-up flex flex-row overflow-hidden`}
            >
              <div className="w-full lg:w-[420px] h-full overflow-hidden">
                <FreguesiaPanel feature={selectedA} onClose={closePanelA} label={t('map.slot.a')} brasoesMap={brasoesMap} t={t} />
              </div>
              {compareOpen && (
                <div className="hidden lg:block lg:w-[420px] h-full overflow-hidden border-l border-border">
                  <FreguesiaPanel feature={selectedB} onClose={() => setSelectedB(null)} label={t('map.slot.b')} brasoesMap={brasoesMap} t={t} />
                </div>
              )}
            </div>
          </>
        )}
        </div>

        {/* Source attribution + scroll hint — sits below the map, breathes ~70px */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pt-5 pb-10">
          <p className="text-[13px] font-mono uppercase tracking-[0.18em] text-foreground leading-relaxed max-w-3xl">
            {t('map.attribution')}
          </p>
          <div className="hidden sm:flex items-center gap-2 text-foreground font-mono text-[13px] uppercase tracking-[0.4em]">
            <span>{t('map.zoomHint')}</span>
          </div>
        </div>

        {/* Scroll hint — invites the user to continue past the map */}
        <a
          href="#bikeBus"
          aria-label={t('map.continueAria')}
          className="scroll-indicator flex flex-col items-center gap-1 pb-8 text-foreground hover:text-foreground transition-colors"
        >
          <span className="font-mono text-[13px] uppercase tracking-[0.5em]">{t('map.continue')}</span>
          <span aria-hidden="true" className="text-base leading-none">↓</span>
        </a>
      </div>
    </section>
  );
}
