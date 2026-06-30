import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MessageSquarePlus, Map, FolderOpen, FileText,
  ArrowRight, CheckCircle2, Clock,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useConversationStore } from '../../stores/conversationStore';
import { folderService, type FolderSummary } from '../../services/folder.service';
import ProgressBar from '../../components/shared/ProgressBar';
import { StatusBadge, DomainBadge } from '../../components/shared/StatusBadge';
import { SkeletonList } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import EmptyState from '../../components/shared/EmptyState';
import { timeAgo } from '../../lib/folderMeta';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { setActiveConversation, setMessages } = useConversationStore();

  const { data: folders = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['folders'],
    queryFn: folderService.list,
  });

  const startConversation = () => {
    setActiveConversation(null);
    setMessages([]);
    navigate('/app/conversations');
  };

  const active = (folders as FolderSummary[]).filter((f) => f.statut !== 'termine');
  const done = (folders as FolderSummary[]).filter((f) => f.statut === 'termine');
  const inProgress = active.slice(0, 4);

  const QUICK = [
    {
      label: 'Nouvelle démarche', desc: 'Décrivez votre besoin à CiviBot',
      icon: <MessageSquarePlus size={20} />, onClick: startConversation,
      cls: 'from-orange-500 to-orange-600',
    },
    {
      label: 'Parcours guidé', desc: 'Laissez-vous accompagner pas à pas',
      icon: <Map size={20} />, onClick: () => navigate('/app/journey'),
      cls: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'Mes documents', desc: 'Centralisez vos pièces justificatives',
      icon: <FileText size={20} />, onClick: () => navigate('/app/documents'),
      cls: 'from-indigo-500 to-indigo-600',
    },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        {/* En-tête */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour {user?.prenom || ''} 👋
          </h1>
          <p className="mt-1 text-gray-500">
            Voici un aperçu de vos démarches administratives.
          </p>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {QUICK.map((q) => (
            <button
              key={q.label}
              onClick={q.onClick}
              className="group flex flex-col items-start gap-3 rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white ${q.cls}`}>
                {q.icon}
              </span>
              <div>
                <p className="font-semibold text-gray-800">{q.label}</p>
                <p className="mt-0.5 text-sm text-gray-500">{q.desc}</p>
              </div>
              <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-orange-600 opacity-0 transition-opacity group-hover:opacity-100">
                Commencer <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>

        {/* Statistiques */}
        {!isLoading && !isError && (folders as FolderSummary[]).length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <StatCard icon={<FolderOpen size={18} />} label="Dossiers" value={(folders as FolderSummary[]).length} tone="text-orange-600 bg-orange-50" />
            <StatCard icon={<Clock size={18} />} label="En cours" value={active.length} tone="text-amber-600 bg-amber-50" />
            <StatCard icon={<CheckCircle2 size={18} />} label="Terminés" value={done.length} tone="text-green-600 bg-green-50" />
          </div>
        )}

        {/* Dossiers en cours */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Dossiers en cours</h2>
            <Link to="/app/folders" className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline">
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <SkeletonList count={3} />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : inProgress.length === 0 ? (
            <EmptyState
              title="Aucun dossier en cours"
              description="Lancez une démarche : une équipe d'agents IA construit votre dossier automatiquement."
              action={
                <button onClick={startConversation} className="mt-2 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
                  <MessageSquarePlus size={16} /> Démarrer une démarche
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {inProgress.map((f) => (
                <Link
                  key={f.id}
                  to={`/app/folders/${f.id}`}
                  className="block rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="font-medium text-gray-800 line-clamp-1">{f.titre}</p>
                    <StatusBadge statut={f.statut} />
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <DomainBadge domaine={f.domaine} />
                    <span className="text-xs text-gray-400">Maj {timeAgo(f.updatedAt)}</span>
                  </div>
                  <ProgressBar value={f.progression} showLabel />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>{icon}</span>
      <div>
        <p className="text-2xl font-bold leading-none text-gray-900">{value}</p>
        <p className="mt-1 text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
