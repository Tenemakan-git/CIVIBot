import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, ArrowRight } from 'lucide-react';
import {
  serviceDirectoryService,
  typeMeta,
} from '../../services/serviceDirectory.service';

/** Carte « Où déposer » du dossier : services compétents pour le domaine. */
export default function CompetentServicesCard({ domaine }: { domaine: string }) {
  const { data: points = [], isLoading } = useQuery({
    queryKey: ['services-card', domaine],
    queryFn: () => serviceDirectoryService.find({ domaine, limit: 3 }),
  });

  if (isLoading || points.length === 0) return null;

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-gray-400">
          <MapPin size={16} />
        </span>
        <h2 className="font-semibold text-gray-800">Où déposer votre dossier</h2>
      </div>

      <ul className="space-y-2">
        {points.map((p) => {
          const meta = typeMeta(p.type);
          return (
            <li
              key={p.id}
              className="rounded-lg border border-gray-100 px-3 py-2.5"
            >
              <div className="mb-0.5 flex items-center gap-2">
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white"
                  style={{ background: meta.color }}
                >
                  {meta.label}
                </span>
                <span className="text-sm font-medium text-gray-800">{p.nom}</span>
              </div>
              <p className="text-xs text-gray-500">
                {p.adresse}, {p.ville}
                {p.horaires ? ` · ${p.horaires}` : ''}
              </p>
            </li>
          );
        })}
      </ul>

      <Link
        to="/app/services"
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-800"
      >
        Voir la carte complète <ArrowRight size={14} />
      </Link>
    </section>
  );
}
