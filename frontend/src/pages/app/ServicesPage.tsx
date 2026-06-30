import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Phone, Clock, ExternalLink, Search, Route } from 'lucide-react';
import {
  serviceDirectoryService,
  typeMeta,
  type ServicePoint,
} from '../../services/serviceDirectory.service';
import { SkeletonList } from '../../components/shared/Skeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';

const DOMAINE_FILTERS = [
  { key: '', label: 'Tous' },
  { key: 'etat_civil', label: 'État civil' },
  { key: 'creation_entreprise', label: 'Création d’entreprise' },
];
const TYPE_FILTERS = [
  { key: '', label: 'Tous' },
  { key: 'mairie', label: 'Mairies' },
  { key: 'tribunal', label: 'Tribunaux' },
  { key: 'cepici', label: 'CEPICI' },
  { key: 'prefecture', label: 'Préfectures' },
];

// Marqueur en HTML pur (divIcon) — évite le problème d'assets d'icônes Leaflet.
const pin = (color: string, active = false) =>
  L.divIcon({
    className: '',
    html: `<div style="background:${color};width:${active ? 24 : 18}px;height:${active ? 24 : 18}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
    iconSize: active ? [24, 24] : [18, 18],
    iconAnchor: active ? [12, 24] : [9, 18],
    popupAnchor: [0, active ? -20 : -16],
  });

export default function ServicesPage() {
  const [domaine, setDomaine] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const mapRef = useRef<L.Map | null>(null);
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  const {
    data: points = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['services', domaine, type, coords],
    queryFn: () =>
      serviceDirectoryService.find({
        domaine: domaine || undefined,
        type: type || undefined,
        lat: coords?.lat,
        lng: coords?.lng,
        limit: 50,
      }),
  });

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return points;
    return points.filter((p) =>
      [p.nom, p.ville, p.commune, p.adresse, p.region]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q)),
    );
  }, [points, search]);

  const locateMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const focusPoint = (p: ServicePoint) => {
    setSelectedId(p.id);
    mapRef.current?.flyTo([p.latitude, p.longitude], 14, { duration: 0.8 });
    // Ouvre le popup une fois le vol lancé.
    setTimeout(() => markerRefs.current[p.id]?.openPopup(), 250);
  };

  const center = useMemo<[number, number]>(
    () => (coords ? [coords.lat, coords.lng] : [7.54, -5.55]),
    [coords],
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <MapPin size={20} className="text-orange-600" /> Où déposer vos dossiers
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Mairies, tribunaux et guichets CEPICI compétents en Côte d’Ivoire.
            </p>
          </div>
          <button
            onClick={locateMe}
            disabled={locating}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
          >
            <Navigation size={15} /> {locating ? 'Localisation…' : 'Près de moi'}
          </button>
        </header>

        {/* Recherche + Filtres */}
        <div className="space-y-2">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou ville…"
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <FilterRow items={DOMAINE_FILTERS} value={domaine} onChange={setDomaine} />
          <FilterRow items={TYPE_FILTERS} value={type} onChange={setType} />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Liste */}
          <div className="space-y-2.5">
            {isLoading ? (
              <SkeletonList count={4} />
            ) : isError ? (
              <ErrorState onRetry={() => refetch()} />
            ) : list.length === 0 ? (
              <EmptyState
                title={search ? 'Aucun résultat' : 'Aucun service'}
                description={
                  search
                    ? `Aucun service ne correspond à « ${search} ».`
                    : 'Aucun service pour ces filtres.'
                }
              />
            ) : (
              <>
                <p className="px-0.5 text-xs font-medium text-gray-400">
                  {list.length} service{list.length > 1 ? 's' : ''}
                  {coords ? ' · triés par distance' : ''}
                </p>
                {list.map((p) => (
                  <ServiceCard
                    key={p.id}
                    point={p}
                    selected={selectedId === p.id}
                    onSelect={() => focusPoint(p)}
                  />
                ))}
                <p className="pt-2 text-xs text-gray-400">
                  Données indicatives — vérifiez horaires et adresses auprès des services.
                </p>
              </>
            )}
          </div>

          {/* Carte */}
          <div className="h-[420px] overflow-hidden rounded-2xl border border-gray-100 shadow-sm lg:sticky lg:top-6">
            <MapContainer
              ref={mapRef}
              center={center}
              zoom={coords ? 11 : 6}
              scrollWheelZoom
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {coords && (
                <Marker position={[coords.lat, coords.lng]} icon={pin('#ef4444')}>
                  <Popup>Vous êtes ici</Popup>
                </Marker>
              )}
              {list.map((p) => (
                <Marker
                  key={p.id}
                  position={[p.latitude, p.longitude]}
                  icon={pin(typeMeta(p.type).color, selectedId === p.id)}
                  ref={(el) => {
                    markerRefs.current[p.id] = el;
                  }}
                  eventHandlers={{ click: () => setSelectedId(p.id) }}
                >
                  <Popup>
                    <strong>{p.nom}</strong>
                    <br />
                    {p.adresse}, {p.ville}
                    {typeof p.distanceKm === 'number' && (
                      <>
                        <br />~{p.distanceKm} km
                      </>
                    )}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterRow({
  items,
  value,
  onChange,
}: {
  items: { key: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onChange(it.key)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            value === it.key
              ? 'border-orange-600 bg-orange-600 text-white'
              : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300'
          }`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

function ServiceCard({
  point,
  selected,
  onSelect,
}: {
  point: ServicePoint;
  selected: boolean;
  onSelect: () => void;
}) {
  const meta = typeMeta(point.type);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`;
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition-all hover:border-orange-200 hover:shadow-md ${
        selected ? 'border-orange-300 ring-2 ring-orange-100' : 'border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
              style={{ background: meta.color }}
            >
              {meta.emoji} {meta.label}
            </span>
            {typeof point.distanceKm === 'number' && (
              <span className="text-xs font-medium text-gray-400">
                ~{point.distanceKm} km
              </span>
            )}
          </div>
          <p className="font-medium text-gray-800">{point.nom}</p>
          <p className="text-sm text-gray-500">
            {point.adresse}, {point.ville}
          </p>
        </div>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        {point.horaires && (
          <span className="inline-flex items-center gap-1">
            <Clock size={12} /> {point.horaires}
          </span>
        )}
        {point.telephone && (
          <a
            href={`tel:${point.telephone}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 hover:text-orange-600"
          >
            <Phone size={12} /> {point.telephone}
          </a>
        )}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 font-medium text-orange-600 hover:underline"
        >
          <Route size={12} /> Itinéraire
        </a>
        {point.url && (
          <a
            href={point.url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 hover:text-orange-600"
          >
            <ExternalLink size={12} /> Site officiel
          </a>
        )}
      </div>
    </div>
  );
}
