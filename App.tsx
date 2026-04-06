/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { locations } from './data';
import { LocationFeature, Category } from './types';

// Fix Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Pink Icon
const pinkIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="w-4 h-4 bg-brand border-2 border-white rounded-full shadow-lg"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Map Controller to handle flying to locations
function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.flyTo(center, zoom, {
    duration: 1.5,
    easeLinearity: 0.25
  });
  return null;
}

const CATEGORIES: { label: string, value: Category }[] = [
  { label: 'All', value: 'all' },
  { label: 'Relaxation', value: 'spaces for relaxation' },
  { label: 'Sports', value: 'sports and fitness spaces' },
  { label: 'Dining', value: 'healthy dining options' },
  { label: 'Mental Health', value: 'mental health counseling services' },
  { label: 'Medical', value: 'the campus clinic' },
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [mapCenter, setMapCenter] = useState<[number, number]>([31.2886, 121.5085]);
  const [mapZoom, setMapZoom] = useState(16);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchesCategory = activeCategory === 'all' || loc.category === activeCategory;
      const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loc.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  const handleLocationClick = useCallback((loc: LocationFeature) => {
    setMapCenter([loc.coordinates[1], loc.coordinates[0]]);
    setMapZoom(18);
    setSelectedLocationId(loc.id);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-1/3 lg:w-1/4 h-[40vh] md:h-full bg-white/80 backdrop-blur-md z-20 shadow-xl border-r border-pink-100 flex flex-col">
        <div className="p-6 lg:p-8">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tracking-tight text-brand mb-1"
          >
            TONGJI HEALTH MAP
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[10px] font-medium text-pink-400 uppercase tracking-widest mb-6"
          >
            Nurturing Wellness @ Siping Campus
          </motion.p>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-pink-50/50 border border-pink-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all placeholder:text-pink-300"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-[10px] font-semibold transition-all border ${
                  activeCategory === cat.value 
                    ? 'bg-brand text-white border-brand shadow-sm' 
                    : 'bg-pink-50 text-pink-500 border-pink-100 hover:bg-pink-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location List */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-8 pb-8 sidebar-scroll space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredLocations.map((loc) => (
              <motion.div
                key={loc.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => handleLocationClick(loc)}
                className={`group p-4 rounded-2xl bg-white border transition-all cursor-pointer ${
                  selectedLocationId === loc.id 
                    ? 'border-brand shadow-md ring-1 ring-brand/20' 
                    : 'border-pink-50 hover:border-pink-200 hover:shadow-lg'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-pink-400 uppercase tracking-wider">
                    {loc.category}
                  </span>
                  <h3 className={`font-bold text-sm transition-colors ${
                    selectedLocationId === loc.id ? 'text-brand' : 'text-slate-800 group-hover:text-brand'
                  }`}>
                    {loc.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {loc.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredLocations.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-pink-300 text-sm">No locations found...</p>
            </div>
          )}
        </div>
      </aside>

      {/* Map Container */}
      <main className="flex-1 h-[60vh] md:h-full p-4 md:p-6 bg-primary relative">
        <div className="w-full h-full shadow-2xl border border-pink-100 rounded-2xl overflow-hidden relative z-10">
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            scrollWheelZoom={true}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            <MapController center={mapCenter} zoom={mapZoom} />
            
            {filteredLocations.map((loc) => (
              <Marker 
                key={loc.id} 
                position={[loc.coordinates[1], loc.coordinates[0]]}
                icon={pinkIcon}
                eventHandlers={{
                  click: () => setSelectedLocationId(loc.id),
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-1 max-w-[200px]">
                    <h3 className="font-bold text-brand text-xs mb-1">{loc.name}</h3>
                    <p className="text-[10px] leading-relaxed text-slate-600">{loc.description}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-pink-100 text-pink-500 rounded text-[8px] font-bold uppercase">
                      {loc.category}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Floating Zoom Controls (Optional, Leaflet has built-in but we can style our own) */}
          <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
            <button 
              onClick={() => setMapZoom(prev => Math.min(prev + 1, 19))}
              className="w-10 h-10 bg-white border border-pink-100 rounded-xl shadow-lg flex items-center justify-center text-brand hover:bg-pink-50 transition-colors font-bold text-xl"
            >
              +
            </button>
            <button 
              onClick={() => setMapZoom(prev => Math.max(prev - 1, 10))}
              className="w-10 h-10 bg-white border border-pink-100 rounded-xl shadow-lg flex items-center justify-center text-brand hover:bg-pink-50 transition-colors font-bold text-xl"
            >
              −
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
