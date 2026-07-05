import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus, HiOutlineGlobe, HiOutlineExclamationCircle,
  HiOutlineX, HiOutlineMap,
} from 'react-icons/hi';

interface CaseReport {
  id: string;
  disease: string;
  region: string;
  district: string;
  cases: number;
  source: string;
  date: string;
}

interface Hotspot {
  region: string;
  disease: string;
  total_cases: number;
}

interface Alert {
  id: string;
  disease: string;
  region: string;
  severity: string;
  message: string;
}

const diseases = ['Malaria', 'Cholera', 'COVID-19', 'Measles', 'Yellow Fever', 'Dengue', 'Typhoid'];

const regions = [
  'Centre', 'Littoral', 'North', 'Far North', 'Adamawa',
  'East', 'West', 'Northwest', 'Southwest', 'South',
];

const regionCoords: Record<string, { lat: number; lng: number }> = {
  'Centre': { lat: 3.8667, lng: 11.5167 },
  'Littoral': { lat: 4.0500, lng: 9.7000 },
  'North': { lat: 9.3000, lng: 13.4000 },
  'Far North': { lat: 10.5833, lng: 14.3167 },
  'Adamawa': { lat: 7.3167, lng: 13.5833 },
  'East': { lat: 4.5833, lng: 14.3667 },
  'West': { lat: 5.4667, lng: 10.4167 },
  'Northwest': { lat: 6.0000, lng: 10.1500 },
  'Southwest': { lat: 4.1333, lng: 9.2333 },
  'South': { lat: 2.9167, lng: 11.1500 },
};

const severityAlertColors: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
};

function getSeverityColor(cases: number): string {
  if (cases >= 100) return 'bg-red-500 text-white';
  if (cases >= 50) return 'bg-orange-500 text-white';
  if (cases >= 10) return 'bg-yellow-500 text-yellow-900';
  return 'bg-green-500 text-white';
}

function getSeverityLabel(cases: number): string {
  if (cases >= 100) return 'red';
  if (cases >= 50) return 'orange';
  if (cases >= 10) return 'yellow';
  return 'green';
}

const markerColors: Record<string, string> = {
  red: '#EF4444',
  orange: '#F97316',
  yellow: '#EAB308',
  green: '#22C55E',
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function EpidemicMap() {
  const { language } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const [reports, setReports] = useState<CaseReport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [regionFilter, setRegionFilter] = useState('');
  const [newCase, setNewCase] = useState({ disease: 'Malaria', region: '', district: '', cases: 1, source: '' });
  const [googleMapsReady, setGoogleMapsReady] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState('');
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [cRes, aRes] = await Promise.all([
        api.get('/epidemic/cases'),
        api.get('/epidemic/alerts'),
      ]);

      let caseData: CaseReport[] = [];
      if (cRes.data?.cases && Array.isArray(cRes.data.cases)) {
        caseData = cRes.data.cases;
      } else if (Array.isArray(cRes.data)) {
        caseData = cRes.data;
      }
      setReports(caseData || []);

      let alertData: Alert[] = [];
      if (Array.isArray(aRes.data)) {
        alertData = aRes.data;
      } else if (aRes.data?.alerts && Array.isArray(aRes.data.alerts)) {
        alertData = aRes.data.alerts;
      }
      setAlerts(alertData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
    if (!apiKey) {
      setGoogleMapsError(language === 'fr'
        ? 'Clé API Google Maps non configurée. Définissez VITE_GOOGLE_MAPS_KEY dans votre environnement.'
        : 'Google Maps API key not configured. Set VITE_GOOGLE_MAPS_KEY in your environment.');
      return;
    }

    if (window.google?.maps) {
      setGoogleMapsReady(true);
      return;
    }

    const existing = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existing) {
      const checkReady = setInterval(() => {
        if (window.google?.maps) {
          setGoogleMapsReady(true);
          clearInterval(checkReady);
        }
      }, 200);
      return () => clearInterval(checkReady);
    }

    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + apiKey + '&libraries=places';
    script.async = true;
    script.onload = () => setGoogleMapsReady(true);
    script.onerror = () => setGoogleMapsError(language === 'fr'
      ? 'Échec du chargement de Google Maps'
      : 'Failed to load Google Maps');
    document.head.appendChild(script);
  }, [language]);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google?.maps || mapInstanceRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 7.3697, lng: 12.3547 },
      zoom: 6,
      mapTypeId: 'roadmap',
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
    });

    mapInstanceRef.current = map;
  }, []);

  useEffect(() => {
    if (googleMapsReady) {
      initMap();
    }
  }, [googleMapsReady, initMap]);

  useEffect(() => {
    if (!mapInstanceRef.current || !googleMapsReady) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const hotspotMap: Record<string, { cases: number; diseases: { name: string; cases: number; district: string }[] }> = {};

    reports.forEach(r => {
      if (regionFilter && r.region !== regionFilter) return;
      if (!hotspotMap[r.region]) {
        hotspotMap[r.region] = { cases: 0, diseases: [] };
      }
      hotspotMap[r.region].cases += r.cases;
      const existing = hotspotMap[r.region].diseases.find(d => d.name === r.disease);
      if (existing) {
        existing.cases += r.cases;
      } else {
        hotspotMap[r.region].diseases.push({ name: r.disease, cases: r.cases, district: r.district });
      }
    });

    Object.entries(hotspotMap).forEach(([region, info]) => {
      const coord = regionCoords[region];
      if (!coord) return;

      const label = getSeverityLabel(info.cases);
      const color = markerColors[label];

      const marker = new window.google.maps.Marker({
        position: coord,
        map: mapInstanceRef.current,
        title: region,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: Math.min(12 + Math.log2(info.cases + 1), 24),
        },
      });

      const infoContent = [
        '<div style="font-family:system-ui,sans-serif;padding:4px;max-width:240px;">',
        '<strong style="font-size:14px;color:#111827;">' + region + '</strong>',
        '<div style="margin-top:6px;font-size:13px;color:#374151;">',
      ];
      info.diseases.forEach(d => {
        const dColor = d.cases >= 100 ? '#EF4444' : d.cases >= 50 ? '#F97316' : d.cases >= 10 ? '#CA8A04' : '#16A34A';
        infoContent.push(
          '<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid #f3f4f6;">' +
          '<span>' + d.name + (d.district ? ' (' + d.district + ')' : '') + '</span>' +
          '<strong style="color:' + dColor + ';">' + d.cases + '</strong>' +
          '</div>'
        );
      });
      infoContent.push('</div>');
      infoContent.push(
        '<div style="margin-top:6px;font-size:12px;color:#6B7280;font-weight:600;">' +
        'Total: ' + info.cases + ' case' + (info.cases !== 1 ? 's' : '') +
        '</div>'
      );
      infoContent.push('</div>');

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent.join(''),
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [reports, regionFilter, googleMapsReady]);

  async function handleReportCase(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/epidemic/report', {
        disease: newCase.disease,
        region: newCase.region,
        district: newCase.district,
        cases_count: newCase.cases,
        source: newCase.source,
      });
      toast.success(language === 'fr' ? 'Cas signalé' : 'Case reported');
      setShowReport(false);
      setNewCase({ disease: 'Malaria', region: '', district: '', cases: 1, source: '' });
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || (language === 'fr' ? 'Erreur' : 'Error'));
    }
  }

  const hotspotsMap: Record<string, Hotspot> = {};
  reports.forEach(r => {
    const key = r.region + '-' + r.disease;
    if (hotspotsMap[key]) hotspotsMap[key].total_cases += r.cases;
    else hotspotsMap[key] = { region: r.region, disease: r.disease, total_cases: r.cases };
  });
  let hotspots = Object.values(hotspotsMap);
  if (regionFilter) hotspots = hotspots.filter(h => h.region === regionFilter);

  const availableRegions = [...new Set(reports.map(r => r.region))];
  const activeAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'high');

  const hasMap = googleMapsReady;
  const apiKeyMissing = !import.meta.env.VITE_GOOGLE_MAPS_KEY;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 lg:space-y-6 pb-4">
      <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
            {language === 'fr' ? 'Carte Épidémique' : 'Epidemic Map'}
          </h1>
          <p className="text-xs lg:text-sm text-secondary-500 dark:text-secondary-400">
            {language === 'fr' ? 'Surveillance des cas et foyers épidémiques' : 'Case surveillance and outbreak hotspots'}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowReport(true)}
          className="btn-primary text-xs lg:text-sm"
        >
          <HiOutlinePlus className="h-4 w-4 mr-1" />
          {language === 'fr' ? 'Signaler un Cas' : 'Report Case'}
        </motion.button>
      </motion.div>

      {activeAlerts.length > 0 && (
        <motion.div variants={item} className="overflow-hidden rounded-xl lg:rounded-2xl">
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={'flex-shrink-0 w-64 p-3 rounded-xl ' + (severityAlertColors[alert.severity] || 'bg-blue-500') + ' text-white'}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <HiOutlineExclamationCircle className="h-4 w-4 animate-pulse" />
                  <span className="text-xs font-bold uppercase">{alert.severity}</span>
                </div>
                <p className="text-xs font-medium">{alert.disease}</p>
                <p className="text-[10px] opacity-80">{alert.region} — {alert.message}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {availableRegions.length > 0 && (
        <motion.div variants={item} className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setRegionFilter('')}
            className={'px-3 py-1.5 rounded-xl text-xs lg:text-sm font-medium whitespace-nowrap transition-all flex items-center space-x-1 ' +
              (!regionFilter
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                : 'bg-gray-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-gray-200 dark:hover:bg-secondary-600')
            }
          >
            <HiOutlineGlobe className="h-3.5 w-3.5" />
            <span>{language === 'fr' ? 'Toutes' : 'All Regions'}</span>
          </button>
          {availableRegions.map((region) => (
            <button
              key={region}
              onClick={() => setRegionFilter(region)}
              className={'px-3 py-1.5 rounded-xl text-xs lg:text-sm font-medium whitespace-nowrap transition-all ' +
                (regionFilter === region
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                  : 'bg-gray-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-gray-200 dark:hover:bg-secondary-600')
              }
            >
              {region}
            </button>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center py-16">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-10 w-10 rounded-full border-3 border-primary-200 border-t-primary-600" />
            </div>
          ) : (
            <>
              {hasMap && (
                <motion.div
                  variants={item}
                  ref={mapRef}
                  className="w-full rounded-xl lg:rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-secondary-700"
                  style={{ height: '500px' }}
                />
              )}
              {!hasMap && googleMapsError && (
                <motion.div variants={item} className="text-center py-12 text-secondary-400 dark:text-secondary-500 bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700">
                  <HiOutlineMap className="h-14 w-14 lg:h-20 lg:w-20 mx-auto mb-4 opacity-50" />
                  {apiKeyMissing ? (
                    <>
                      <p className="text-base lg:text-lg font-medium mb-2">
                        {language === 'fr' ? 'Carte non disponible' : 'Map Unavailable'}
                      </p>
                      <p className="text-xs lg:text-sm max-w-md mx-auto">
                        {googleMapsError}
                      </p>
                    </>
                  ) : (
                    <p className="text-base lg:text-lg font-medium">
                      {googleMapsError || (language === 'fr' ? 'Chargement de la carte...' : 'Loading map...')}
                    </p>
                  )}
                </motion.div>
              )}
              {!hasMap && !googleMapsError && !apiKeyMissing && (
                <motion.div variants={item} className="text-center py-12 text-secondary-400 dark:text-secondary-500 bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700">
                  <HiOutlineMap className="h-14 w-14 lg:h-20 lg:w-20 mx-auto mb-4 opacity-50" />
                  <p className="text-base lg:text-lg font-medium">
                    {language === 'fr' ? 'Chargement de la carte...' : 'Loading map...'}
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {hotspots.length === 0 && !loading ? (
            <motion.div variants={item} className="text-center py-12 text-secondary-400 dark:text-secondary-500 bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700">
              <HiOutlineGlobe className="h-14 w-14 lg:h-16 lg:w-16 mx-auto mb-4 opacity-50" />
              <p className="text-base lg:text-lg font-medium">
                {language === 'fr' ? 'Aucun foyer signalé' : 'No hotspots reported'}
              </p>
            </motion.div>
          ) : (
            <>
              <motion.div variants={item}>
                <h3 className="text-sm font-semibold text-secondary-900 dark:text-white mb-3">
                  {language === 'fr' ? 'Foyers Actifs' : 'Active Hotspots'}
                </h3>
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                  {hotspots.map((h, i) => {
                    const maxCases = Math.max(...hotspots.map(x => x.total_cases), 1);
                    const pct = (h.total_cases / maxCases) * 100;
                    return (
                      <motion.div
                        key={h.region + '-' + h.disease}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-gray-100 dark:border-secondary-700 p-3 overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-secondary-900 dark:text-white text-xs">{h.disease}</h4>
                          <span className={'px-2 py-0.5 rounded-full text-xs font-bold ' + getSeverityColor(h.total_cases)}>
                            {h.total_cases}
                          </span>
                        </div>
                        <p className="text-[10px] text-secondary-500 dark:text-secondary-400 mb-2">{h.region}</p>
                        <div className="h-1.5 bg-gray-100 dark:bg-secondary-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: Math.min(pct, 100) + '%' }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={'h-full rounded-full ' + (
                              getSeverityLabel(h.total_cases) === 'red' ? 'bg-red-500' :
                              getSeverityLabel(h.total_cases) === 'orange' ? 'bg-orange-500' :
                              getSeverityLabel(h.total_cases) === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                            )}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div variants={item} className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 overflow-hidden">
                <div className="p-3 lg:p-4 border-b border-gray-100 dark:border-secondary-700">
                  <h3 className="font-semibold text-secondary-900 dark:text-white text-sm lg:text-base">
                    {language === 'fr' ? 'Cas Signalés' : 'Reported Cases'}
                  </h3>
                </div>
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b dark:border-secondary-700 text-secondary-500 dark:text-secondary-400 text-[10px] lg:text-xs">
                        <th className="text-left py-2.5 px-3 font-medium">{language === 'fr' ? 'Date' : 'Date'}</th>
                        <th className="text-left py-2.5 px-3 font-medium">{language === 'fr' ? 'Région' : 'Region'}</th>
                        <th className="text-left py-2.5 px-3 font-medium">{language === 'fr' ? 'Maladie' : 'Disease'}</th>
                        <th className="text-right py-2.5 px-3 font-medium">{language === 'fr' ? 'Cas' : 'Cases'}</th>
                        <th className="text-left py-2.5 px-3 font-medium">{language === 'fr' ? 'Source' : 'Source'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...reports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((r) => (
                        <tr key={r.id} className="border-b dark:border-secondary-700/50 hover:bg-secondary-50 dark:hover:bg-secondary-700/30">
                          <td className="py-2 px-3 text-secondary-600 dark:text-secondary-400 text-xs whitespace-nowrap">
                            {new Date(r.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-GB')}
                          </td>
                          <td className="py-2 px-3 dark:text-white text-xs">{r.region}{r.district ? ' / ' + r.district : ''}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
                              {r.disease}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-semibold dark:text-white">
                            <span className={'px-2 py-0.5 rounded ' + (
                              r.cases >= 100 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              r.cases >= 50 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                              r.cases >= 10 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            )}>
                              {r.cases}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-secondary-500 dark:text-secondary-400 text-xs">{r.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showReport && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowReport(false)} className="fixed inset-0 bg-black/40 z-40" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[500px] z-50 bg-white dark:bg-secondary-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-secondary-100 dark:border-secondary-700">
                <h2 className="text-lg font-bold text-secondary-900 dark:text-white">
                  {language === 'fr' ? 'Signaler un Cas' : 'Report a Case'}
                </h2>
                <button onClick={() => setShowReport(false)} className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700">
                  <HiOutlineX className="h-5 w-5 text-secondary-400" />
                </button>
              </div>
              <form onSubmit={handleReportCase} className="p-5 space-y-4">
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Maladie' : 'Disease'}</label>
                  <select className="input dark:bg-secondary-700 dark:text-white" value={newCase.disease} onChange={(e) => setNewCase({ ...newCase, disease: e.target.value })} required>
                    {diseases.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Région' : 'Region'}</label>
                  <select className="input dark:bg-secondary-700 dark:text-white" value={newCase.region} onChange={(e) => setNewCase({ ...newCase, region: e.target.value })} required>
                    <option value="">{language === 'fr' ? 'Sélectionnez une région' : 'Select a region'}</option>
                    {regions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'District' : 'District'}</label>
                  <input className="input dark:bg-secondary-700 dark:text-white" value={newCase.district} onChange={(e) => setNewCase({ ...newCase, district: e.target.value })} placeholder={language === 'fr' ? 'District spécifique' : 'Specific district'} />
                </div>
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Nombre de Cas' : 'Case Count'}</label>
                  <input type="number" className="input dark:bg-secondary-700 dark:text-white" value={newCase.cases} onChange={(e) => setNewCase({ ...newCase, cases: parseInt(e.target.value) || 1 })} min={1} required />
                </div>
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Source' : 'Source'}</label>
                  <input className="input dark:bg-secondary-700 dark:text-white" value={newCase.source} onChange={(e) => setNewCase({ ...newCase, source: e.target.value })} placeholder={language === 'fr' ? 'Hôpital, centre de santé...' : 'Hospital, health center...'} required />
                </div>
                <div className="flex space-x-2 pt-2">
                  <button type="submit" className="btn-primary flex-1 justify-center">{language === 'fr' ? 'Signaler' : 'Report'}</button>
                  <button type="button" onClick={() => setShowReport(false)} className="btn-secondary flex-1 justify-center">{language === 'fr' ? 'Annuler' : 'Cancel'}</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
