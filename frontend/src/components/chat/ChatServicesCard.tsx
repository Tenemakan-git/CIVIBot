import { Link } from 'react-router-dom';
import { MapPin, Navigation, Clock, Phone, ArrowRight } from 'lucide-react';
import { typeMeta } from '../../services/serviceDirectory.service';
import type { ChatServicePoint } from '../../stores/conversationStore';

/** Carte affichée dans le chat : où se rendre pour la démarche en cours. */
export default function ChatServicesCard({
  services,
  located,
}: {
  services: ChatServicePoint[];
  located: boolean;
}) {
  if (services.length === 0) return null;
  const top = services.slice(0, 3);

  return (
    <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-white p-3.5">
      <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
        <MapPin size={15} />
        {located ? 'Le bureau le plus proche de vous' : 'Où vous rendre'}
      </div>

      <ul className="mt-2.5 space-y-2">
        {top.map((p, i) => {
          const meta = typeMeta(p.type);
          return (
            <li
              key={p.id}
              className="rounded-lg border border-gray-100 bg-white px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white"
                  style={{ background: meta.color }}
                >
                  {meta.label}
                </span>
                <span className="text-sm font-medium text-gray-800">{p.nom}</span>
                {located && i === 0 && typeof p.distanceKm === 'number' && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                    <Navigation size={9} /> ~{p.distanceKm} km
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                {p.adresse}, {p.ville}
              </p>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-gray-400">
                {p.horaires && (
                  <span className="inline-flex items-center gap-1">
                    <Clock size={10} /> {p.horaires}
                  </span>
                )}
                {p.telephone && (
                  <a
                    href={`tel:${p.telephone}`}
                    className="inline-flex items-center gap-1 hover:text-emerald-700"
                  >
                    <Phone size={10} /> {p.telephone}
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <Link
        to="/app/services"
        className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900"
      >
        Voir la carte complète <ArrowRight size={13} />
      </Link>
    </div>
  );
}
