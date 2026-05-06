import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { MapContainer, TileLayer, GeoJSON, ZoomControl, useMap } from 'react-leaflet';
import { Search, X, ArrowRight, RotateCcw, GitCompare } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Greater Porto bounds (lat/lng) — covers the 7 municípios
const PORTO_BOUNDS = [[40.95, -8.85], [41.36, -8.30]];
const PORTO_CENTER = [41.155, -8.55];
const PORTO_ZOOM = 11;

// CARTO Dark Matter (no labels) — institutional dark, near-obsidian
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png';
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> &middot; ' +
  '&copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>';

const norm = (s) => (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const fmt = (n) => (n == null || Number.isNaN(n) ? '—' : Number(n).toLocaleString('pt-PT'));

// --- Skeleton --------------------------------------------------------------
function Skeleton() {
  return (
    <div className="absolute inset-0 grid place-items-center pointer-events-none z-[300] bg-background">
      <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 animate-pulse">
        A carregar geometria CAOP…
      </div>
    </div>
  );
}

// --- Reset / Compare buttons ----------------------------------------------
function MapButtons({ onReset, onClearCompare, hasCompare }) {
  return (
    <div className="absolute bottom-32 right-4 z-[400] flex flex-col gap-2">
      {hasCompare && (
        <button
          onClick={onClearCompare}
          title="Sair da comparação"
          className="w-9 h-9 grid place-items-center bg-background/90 backdrop-blur border border-border text-foreground/80 hover:text-primary hover:border-primary transition-colors"
        >
          <GitCompare className="w-4 h-4" />
        </button>
      )}
      <button
        onClick={onReset}
        title="Reset"
        className="w-9 h-9 grid place-items-center bg-background/90 backdrop-blur border border-border text-foreground/80 hover:text-foreground hover:border-foreground transition-colors"
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
      <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/50">{label}</span>
      <span className="font-display text-base font-black tracking-tightest text-foreground">
        {value}
        {unit && (
          <span className="text-foreground/40 text-[10px] ml-1.5 font-mono font-normal tracking-normal normal-case">
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}

// --- Side panel for one freguesia ----------------------------------------
function FreguesiaPanel({ feature, onClose, label }) {
  if (!feature) return null;
  const p = feature.properties;
  const verdePerHab = p.populacao > 0 ? Math.round((p.area_verde_m2 || 0) / p.populacao) : null;
  const initial = (p.nome || '').split(' ').slice(-1)[0].slice(0, 3).toUpperCase();

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/55">
            {label} &middot; {p.municipio}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-1 -mr-1 -mt-1 text-foreground/60 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="font-display text-2xl sm:text-3xl font-black tracking-tightest leading-[1.05] mb-6 text-foreground">
          {p.nome}
        </h3>

        <div
          className="w-[120px] h-[120px] mx-auto mb-8 border border-border flex items-center justify-center"
          style={{ background: p.cor_principal }}
        >
          {p.escudo_url ? (
            <img src={p.escudo_url} alt="" className="w-full h-full object-contain p-3" loading="lazy" />
          ) : (
            <div className="font-display text-2xl font-black tracking-tightest" style={{ color: '#FAFAF7' }}>
              {initial}
            </div>
          )}
        </div>

        <div className="space-y-0 mb-8">
          <StatRow label="População" value={fmt(p.populacao)} />
          <StatRow label="Área" value={fmt(p.area_km2)} unit="km²" />
          <StatRow label="Densidade" value={fmt(p.densidade)} unit="hab/km²" />
          <StatRow label="Escolas" value={fmt(p.num_escolas)} />
          <StatRow label="Área verde" value={fmt(p.area_verde_m2)} unit="m²" />
          <StatRow label="m² verde / hab" value={fmt(verdePerHab)} unit="m²" />
          <StatRow label="Comboios ativos" value={fmt(p.comboios_ativos)} />
        </div>

        <div className="border-t border-border pt-6 mb-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/50 mb-2">
            Câmara municipal
          </div>
          <div className="font-display text-base font-black tracking-tightest text-foreground mb-1">
            {p.camara_nome || '—'}
          </div>
          {p.camara_email && (
            <a
              href={`mailto:${p.camara_email}`}
              className="text-xs font-mono text-foreground/70 hover:text-primary transition-colors break-all"
            >
              {p.camara_email}
            </a>
          )}
        </div>

        <div className="space-y-3">
          {p.camara_url && (
            <a
              href={p.camara_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-between px-5 py-4 text-xs font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Contactar câmara <ArrowRight className="w-4 h-4" />
            </a>
          )}
          <button className="w-full inline-flex items-center justify-between px-5 py-4 text-xs font-mono uppercase tracking-widest border border-foreground/25 text-foreground hover:bg-foreground/5 transition-colors">
            Propostas para esta freguesia <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {p._todo && p._todo.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border/40 text-[10px] font-mono text-foreground/30 leading-relaxed">
            <div className="uppercase tracking-widest mb-1.5 text-foreground/40">Dados em desenvolvimento</div>
            <ul className="space-y-1">
              {p._todo.map((t, i) => <li key={i}>· {t}</li>)}
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedA, setSelectedA] = useState(null);
  const [selectedB, setSelectedB] = useState(null);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [layers, setLayers] = useState({ escolas: false, parques: false, comboios: false });
  const [resetTick, setResetTick] = useState(0);
  const [flyTarget, setFlyTarget] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/data/freguesias-porto.geojson')
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(d => { if (!cancelled) { setGeojson(d); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });
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

  return (
    <section id="map" ref={sectionRef} className="reveal-section bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
        <span className="font-mono text-xs tracking-widest uppercase text-accent">
          05 — {t('map.title') || 'Mapa'}
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black mt-3 tracking-tightest text-foreground max-w-3xl">
          A cidade <i>vista</i> por freguesia.
        </h2>
        <p className="text-foreground/60 max-w-2xl mt-3 font-body">
          {t('map.subtitle') || 'Explora a Grande Área Metropolitana do Porto.'}
          {' '}Clica numa freguesia para ver os dados. Numa segunda para comparar.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative w-full h-[60vh] min-h-[420px] max-h-[640px] bg-background border border-border overflow-hidden">
        {loading && <Skeleton />}
        {error && (
          <div className="absolute inset-0 grid place-items-center text-foreground/60 font-mono text-sm z-[400]">
            Erro a carregar dados: {error}
          </div>
        )}

        {geojson && (
          <MapContainer
            center={PORTO_CENTER}
            zoom={PORTO_ZOOM}
            minZoom={9}
            maxZoom={16}
            zoomControl={false}
            scrollWheelZoom={false}
            className="w-full h-full bs-map"
            style={{ background: '#050505' }}
          >
            <TileLayer url={TILE_URL} attribution={TILE_ATTR} subdomains="abcd" maxZoom={20} />
            <FreguesiasLayer data={geojson} onClick={handleClick} selectedDicofres={selectedDicofres} />
            <ZoomControl position="bottomright" />
            <FitBoundsOnMount bounds={PORTO_BOUNDS} options={{ padding: [40, 40] }} />
            <CtrlWheelZoom />
            <ResetController trigger={resetTick} />
            <FlyToFeature feature={flyTarget} />
          </MapContainer>
        )}

        {/* Search */}
        <div className="absolute top-4 left-4 z-[400] w-[260px] sm:w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              placeholder="Buscar freguesia…"
              className="w-full pl-9 pr-3 py-2.5 text-xs font-mono uppercase tracking-widest bg-background/95 backdrop-blur border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary"
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
                    <div className="text-[9px] font-mono uppercase tracking-widest text-foreground/40 mt-0.5">
                      {f.properties.municipio}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {searchOpen && search.trim() && matches.length === 0 && (
            <div className="mt-1 bg-background/95 backdrop-blur border border-border px-3 py-2.5 text-[10px] font-mono uppercase tracking-widest text-foreground/40">
              Sem resultados
            </div>
          )}
        </div>

        {/* Layers panel — premium glass + iOS toggles */}
        <div className="absolute top-6 right-6 z-[400] w-[220px] bg-obsidian/85 backdrop-blur-[20px] border border-white/[0.08] p-6 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)] animate-slide-in-right">
          <div className="font-mono text-[11px] uppercase tracking-[0.4em] text-eu-yellow pb-3 mb-4 border-b border-white/10">
            Camadas
          </div>
          <div className="flex flex-col gap-4">
            {[
              { key: 'escolas',  label: 'Escolas',  swatch: '#FAFAF7' },
              { key: 'parques',  label: 'Parques',  swatch: '#5C7A52' },
              { key: 'comboios', label: 'Bike Bus', swatch: '#003399' },
            ].map(opt => {
              const isOn = layers[opt.key];
              return (
                <button
                  key={opt.key}
                  type="button"
                  role="switch"
                  aria-checked={isOn}
                  aria-label={opt.label}
                  onClick={() => setLayers({ ...layers, [opt.key]: !isOn })}
                  className="w-full flex items-center gap-3 px-1 py-1 hover:bg-white/[0.03] transition-colors"
                >
                  <span
                    className={`relative inline-block flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-200 ${
                      isOn ? 'bg-eu-blue' : 'bg-white/15'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-bone transition-transform duration-200 ${
                        isOn ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </span>
                  <span aria-hidden="true" className="w-3 h-3 inline-block flex-shrink-0" style={{ background: opt.swatch }} />
                  <span className={`font-mono text-[12px] uppercase tracking-[0.3em] transition-colors ${
                    isOn ? 'text-bone' : 'text-bone/40'
                  }`}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 text-[9px] font-mono uppercase tracking-[0.5em] text-bone/35 text-center">
            Em desenvolvimento
          </div>
        </div>

        <MapButtons
          onReset={() => setResetTick(t => t + 1)}
          onClearCompare={() => setSelectedB(null)}
          hasCompare={compareOpen}
        />

        {/* Legend */}
        {stats && (
          <div className="absolute bottom-4 left-4 z-[400] bg-background/85 backdrop-blur border border-border p-4 w-[280px] sm:w-[320px]">
            <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/55 mb-3">
              Greater Porto
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="font-display text-2xl sm:text-3xl font-black tracking-tightest text-foreground leading-none">
                  {stats.freguesias}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-foreground/50 mt-1.5">Freguesias</div>
              </div>
              <div>
                <div className="font-display text-2xl sm:text-3xl font-black tracking-tightest text-foreground leading-none">
                  {stats.municipios}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-foreground/50 mt-1.5">Municípios</div>
              </div>
              <div>
                <div className="font-display text-2xl sm:text-3xl font-black tracking-tightest text-foreground leading-none">
                  {(stats.populacao / 1e6).toFixed(2)}M
                </div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-foreground/50 mt-1.5">Habitantes</div>
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
                <FreguesiaPanel feature={selectedA} onClose={closePanelA} label="Freguesia A" />
              </div>
              {compareOpen && (
                <div className="hidden lg:block lg:w-[420px] h-full overflow-hidden border-l border-border">
                  <FreguesiaPanel feature={selectedB} onClose={() => setSelectedB(null)} label="Freguesia B" />
                </div>
              )}
            </div>
          </>
        )}
        </div>

        {/* Source attribution + scroll hint — sits below the map, breathes ~70px */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pt-5 pb-10">
          <p className="text-[10px] font-mono uppercase tracking-widest text-foreground/30 leading-relaxed max-w-3xl">
            Geometria CAOP via GeoAPI.pt &middot; População: INE 2021 (parcial) + estimativas baseadas em densidade municipal &middot;
            Áreas verdes, escolas e comboios ativos: dados em desenvolvimento.
          </p>
          <div className="hidden sm:flex items-center gap-2 text-foreground/35 font-mono text-[9px] uppercase tracking-[0.4em]">
            <span>⌘ + scroll para zoom</span>
          </div>
        </div>

        {/* Scroll hint — invites the user to continue past the map */}
        <a
          href="#bikeBus"
          aria-label="Continuar para a próxima secção"
          className="scroll-indicator flex flex-col items-center gap-1 pb-8 text-foreground/35 hover:text-foreground/80 transition-colors"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.5em]">Continuar</span>
          <span aria-hidden="true" className="text-base leading-none">↓</span>
        </a>
      </div>
    </section>
  );
}
