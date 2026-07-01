import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { doctorsApi } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  HiOutlineOfficeBuilding, HiOutlinePhone, HiOutlineLocationMarker,
  HiOutlineStar, HiOutlineChevronRight, HiOutlineHeart,
  HiOutlineGlobe, HiOutlineSearch
} from 'react-icons/hi';
import 'leaflet/dist/leaflet.css';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const greenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const goldIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapBounds({ clinics }: { clinics: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (clinics.length > 0) {
      const bounds = L.latLngBounds(
        clinics.filter(c => c.latitude && c.longitude).map(c => [c.latitude, c.longitude])
      );
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [clinics, map]);
  return null;
}

interface HospitalMapProps {
  onSelectClinic?: (clinic: any) => void;
  selectedClinicId?: string;
  compact?: boolean;
}

export default function HospitalMap({ onSelectClinic, selectedClinicId, compact }: HospitalMapProps) {
  const { language } = useLanguage();
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClinic, setSelectedClinic] = useState<any>(null);
  const [recommended, setRecommended] = useState<string | null>(null);

  useEffect(() => {
    loadClinics();
  }, []);

  async function loadClinics() {
    try {
      const { data } = await doctorsApi.clinics();
      setClinics(data || []);
    } catch (err) {
      console.error('Failed to load clinics:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = clinics.filter((c: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name?.toLowerCase().includes(q) ||
      c.region?.toLowerCase().includes(q) ||
      c.district?.toLowerCase().includes(q);
  });

  const handleSelect = (clinic: any) => {
    setSelectedClinic(clinic);
    if (onSelectClinic) onSelectClinic(clinic);
  };

  const defaultCenter: [number, number] = clinics.length > 0 && clinics[0].latitude
    ? [clinics[0].latitude, clinics[0].longitude]
    : [3.848, 11.502]; // Yaoundé center

  return (
    <div className={`${compact ? 'h-full' : 'h-full'} flex flex-col`}>
      {!compact && (
        <div className="mb-4">
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'fr' ? 'Rechercher un hôpital...' : 'Search hospitals...'}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex-1 skeleton rounded-2xl" />
      ) : clinics.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-secondary-50 dark:bg-secondary-800 rounded-2xl">
          <div className="text-center">
            <HiOutlineOfficeBuilding className="h-10 w-10 text-secondary-300 mx-auto mb-2" />
            <p className="text-sm text-secondary-400">{language === 'fr' ? 'Aucun hôpital trouvé' : 'No hospitals found'}</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
          <div className={`${compact ? 'hidden' : 'flex'} flex-col lg:w-80 order-2 lg:order-1 overflow-hidden rounded-2xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800`}>
            <div className="p-3 border-b border-secondary-100 dark:border-secondary-700">
              <p className="text-xs font-bold text-secondary-600 dark:text-secondary-300 uppercase tracking-wider">
                {language === 'fr' ? 'Hôpitaux' : 'Hospitals'}
                <span className="ml-1 text-primary-500">({filtered.length})</span>
              </p>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-secondary-100 dark:divide-secondary-700">
              {filtered.map((clinic: any) => {
                const isSelected = selectedClinic?.id === clinic.id || selectedClinicId === clinic.id;
                const isRecommended = recommended === clinic.id;
                return (
                  <motion.button
                    key={clinic.id}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                    onClick={() => handleSelect(clinic)}
                    className={`w-full text-left p-3.5 transition-colors ${
                      isSelected ? 'bg-primary-50 dark:bg-primary-900/20 border-l-2 border-primary-500' : ''
                    } ${isRecommended ? 'bg-gradient-to-r from-yellow-50 to-white dark:from-yellow-900/10 dark:to-transparent' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isRecommended ? 'bg-yellow-100 text-yellow-600' : 'bg-primary-100 text-primary-600'
                      }`}>
                        {isRecommended ? (
                          <HiOutlineStar className="h-4 w-4" />
                        ) : (
                          <HiOutlineOfficeBuilding className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <p className="font-semibold text-sm text-secondary-900 dark:text-white truncate">{clinic.name}</p>
                          {isRecommended && (
                            <span className="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-bold uppercase">
                              {language === 'fr' ? 'Recommandé' : 'Recommended'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5 flex items-center space-x-1">
                          <HiOutlineLocationMarker className="h-3 w-3 shrink-0" />
                          <span className="truncate">{clinic.address || clinic.district}, {clinic.region}</span>
                        </p>
                        {clinic.phone && (
                          <p className="text-xs text-secondary-400 flex items-center space-x-1 mt-0.5">
                            <HiOutlinePhone className="h-3 w-3 shrink-0" />
                            <span>{clinic.phone}</span>
                          </p>
                        )}
                      </div>
                      <HiOutlineChevronRight className={`h-4 w-4 mt-1 transition-colors ${
                        isSelected ? 'text-primary-500' : 'text-secondary-300'
                      }`} />
                    </div>
                  </motion.button>
                );
              })}
              {filtered.length === 0 && (
                <div className="p-6 text-center text-sm text-secondary-400">
                  {language === 'fr' ? 'Aucun résultat' : 'No results found'}
                </div>
              )}
            </div>
          </div>

          <div className={`flex-1 rounded-2xl overflow-hidden border border-secondary-200 dark:border-secondary-700 z-10 ${compact ? 'h-64' : ''}`}>
            <MapContainer
              center={defaultCenter}
              zoom={7}
              className="h-full w-full"
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapBounds clinics={filtered} />
              {filtered.map((clinic: any) => (
                <Marker
                  key={clinic.id}
                  position={[clinic.latitude, clinic.longitude]}
                  icon={selectedClinic?.id === clinic.id || selectedClinicId === clinic.id ? goldIcon : recommended === clinic.id ? greenIcon : DefaultIcon}
                  eventHandlers={{ click: () => handleSelect(clinic) }}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <div className="flex items-center space-x-2 mb-1">
                        <HiOutlineOfficeBuilding className="h-4 w-4 text-primary-600" />
                        <p className="font-bold text-sm">{clinic.name}</p>
                      </div>
                      <p className="text-xs text-secondary-500 flex items-center space-x-1">
                        <HiOutlineLocationMarker className="h-3 w-3" />
                        <span>{clinic.address || clinic.district}</span>
                      </p>
                      {clinic.phone && (
                        <p className="text-xs text-secondary-500 flex items-center space-x-1 mt-0.5">
                          <HiOutlinePhone className="h-3 w-3" />
                          <span>{clinic.phone}</span>
                        </p>
                      )}
                      <button
                        onClick={() => {
                          setRecommended(clinic.id);
                          handleSelect(clinic);
                        }}
                        className="mt-2 text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                      >
                        <HiOutlineHeart className="h-3 w-3" />
                        <span>{language === 'fr' ? 'Recommander au patient' : 'Recommend to patient'}</span>
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}
