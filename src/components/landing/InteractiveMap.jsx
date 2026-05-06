import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { Layers, School, TreePine, Route, Building2 } from 'lucide-react';

const portoCenter = [41.1579, -8.6291];

// Sample data points
const schools = [
  { name: 'EB1 da Constituição', lat: 41.1620, lng: -8.6050, type: 'public' },
  { name: 'EB1 de Lordelo do Ouro', lat: 41.1530, lng: -8.6470, type: 'public' },
  { name: 'Colégio Luso-Francês', lat: 41.1680, lng: -8.6250, type: 'private' },
  { name: 'EB1 de Ramalde', lat: 41.1700, lng: -8.6400, type: 'public' },
  { name: 'EB1 de Cedofeita', lat: 41.1550, lng: -8.6200, type: 'public' },
  { name: 'Escola Básica do Covelo', lat: 41.1490, lng: -8.5950, type: 'public' },
];

const parks = [
  { name: 'Parque da Cidade', lat: 41.1650, lng: -8.6750, size: 83, color: '#4ADE80' },
  { name: 'Jardim de Serralves', lat: 41.1590, lng: -8.6590, size: 18, color: '#4ADE80' },
  { name: 'Jardim do Morro', lat: 41.1370, lng: -8.6110, size: 4, color: '#4ADE80' },
  { name: 'Parque de S. Roque', lat: 41.1500, lng: -8.6350, size: 12, color: '#4ADE80' },
];

const bikeBusRoutes = [
  { name: 'Comboio da Foz', lat: 41.1510, lng: -8.6700, families: 25 },
  { name: 'Comboio de Paranhos', lat: 41.1750, lng: -8.6100, families: 18 },
  { name: 'Comboio de Matosinhos', lat: 41.1830, lng: -8.6900, families: 32 },
];

const councils = [
  { name: 'Câmara Municipal do Porto', lat: 41.1496, lng: -8.6109, email: 'geral@cm-porto.pt' },
  { name: 'Câmara de Matosinhos', lat: 41.1825, lng: -8.6885, email: 'geral@cm-matosinhos.pt' },
  { name: 'Câmara de Vila Nova de Gaia', lat: 41.1239, lng: -8.6118, email: 'geral@cm-gaia.pt' },
  { name: 'Câmara da Maia', lat: 41.2356, lng: -8.6200, email: 'geral@cm-maia.pt' },
];

export default function InteractiveMap() {
  const { t } = useI18n();
  const ref = useScrollReveal();
  const [layers, setLayers] = useState({
    schools: true, parks: true, bikeBus: true, councils: false,
  });

  const toggleLayer = (key) => setLayers(prev => ({ ...prev, [key]: !prev[key] }));

  const layerConfig = [
    { key: 'schools', icon: School, label: t('map.layers.schools'), color: '#0F3D5C' },
    { key: 'parks', icon: TreePine, label: t('map.layers.parks'), color: '#4ADE80' },
    { key: 'bikeBus', icon: Route, label: t('map.layers.bikeBus'), color: '#38BDF8' },
    { key: 'councils', icon: Building2, label: t('map.layers.councils'), color: '#1B5E3F' },
  ];

  return (
    <section id="map" ref={ref} className="reveal-section py-24 sm:py-32 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="font-mono text-xs tracking-widest uppercase text-primary">
            04 — {t('map.title')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold mt-4 tracking-tight">
            {t('map.title')}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl">
            {t('map.subtitle')}
          </p>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-border shadow-xl">
          {/* Layer controls */}
          <div className="absolute top-4 right-4 z-[1000] bg-card/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-lg">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-mono font-medium text-foreground">Layers</span>
            </div>
            <div className="space-y-1.5">
              {layerConfig.map(layer => {
                const Icon = layer.icon;
                return (
                  <button
                    key={layer.key}
                    onClick={() => toggleLayer(layer.key)}
                    className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs transition-all ${
                      layers[layer.key]
                        ? 'bg-primary/10 text-foreground'
                        : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-sm border transition-all"
                      style={{
                        backgroundColor: layers[layer.key] ? layer.color : 'transparent',
                        borderColor: layer.color,
                      }}
                    />
                    <Icon className="w-3.5 h-3.5" />
                    <span>{layer.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <MapContainer
            center={portoCenter}
            zoom={12}
            style={{ height: '600px', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            {layers.schools && schools.map((s, i) => (
              <CircleMarker
                key={`school-${i}`}
                center={[s.lat, s.lng]}
                radius={7}
                pathOptions={{
                  color: '#0F3D5C',
                  fillColor: s.type === 'public' ? '#0F3D5C' : '#38BDF8',
                  fillOpacity: 0.8,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="font-body">
                    <p className="font-semibold text-sm">{s.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{s.type}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {layers.parks && parks.map((p, i) => (
              <CircleMarker
                key={`park-${i}`}
                center={[p.lat, p.lng]}
                radius={Math.max(8, Math.sqrt(p.size) * 3)}
                pathOptions={{
                  color: '#1B5E3F',
                  fillColor: '#4ADE80',
                  fillOpacity: 0.4,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="font-body">
                    <p className="font-semibold text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.size} ha</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {layers.bikeBus && bikeBusRoutes.map((r, i) => (
              <CircleMarker
                key={`bus-${i}`}
                center={[r.lat, r.lng]}
                radius={10}
                pathOptions={{
                  color: '#38BDF8',
                  fillColor: '#38BDF8',
                  fillOpacity: 0.6,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="font-body">
                    <p className="font-semibold text-sm">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.families} famílias</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {layers.councils && councils.map((c, i) => (
              <CircleMarker
                key={`council-${i}`}
                center={[c.lat, c.lng]}
                radius={12}
                pathOptions={{
                  color: '#1B5E3F',
                  fillColor: '#1B5E3F',
                  fillOpacity: 0.7,
                  weight: 3,
                }}
              >
                <Popup>
                  <div className="font-body">
                    <p className="font-semibold text-sm">{c.name}</p>
                    <a href={`mailto:${c.email}`} className="text-xs text-blue-600 underline">{c.email}</a>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Council directory */}
        {layers.councils && (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {councils.map((c, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                <p className="font-medium text-sm text-foreground">{c.name}</p>
                <a href={`mailto:${c.email}`} className="text-xs font-mono text-primary hover:underline mt-1 block">
                  {c.email}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}