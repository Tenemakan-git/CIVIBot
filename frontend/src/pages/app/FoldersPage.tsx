import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FolderOpen,
  Search,
  Plus,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Layers,
} from 'lucide-react';
import { folderService, type FolderSummary } from '../../services/folder.service';
import PageHeader from '../../components/shared/PageHeader';
import ProgressBar from '../../components/shared/ProgressBar';
import { StatusBadge, DomainBadge } from '../../components/shared/StatusBadge';
import { SkeletonList } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import EmptyState from '../../components/shared/EmptyState';
import { timeAgo, domainMeta } from '../../lib/folderMeta';

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'active', label: 'En cours' },
  { key: 'termine', label: 'Terminés' },
] as const;
type FilterKey = (typeof FILTERS)[number]['key'];

const SORTS = [
  { key: 'recent', label: 'Plus récents' },
  { key: 'progress', label: 'Progression' },
  { key: 'alpha', label: 'Alphabétique' },
] as const;
type SortKey = (typeof SORTS)[number]['key'];

function matchesFilter(f: FolderSummary, filter: FilterKey): boolean {
  if (filter === 'active') return f.statut !== 'termine';
  if (filter === 'termine') return f.statut === 'termine';
  return true;
}

/** Bouton « Nouvelle démarche » (réutilisé dans l'en-tête et l'état vide). */
function NewJourneyButton({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/app/conversations"
      className={`inline-flex items-center gap-2 rounded-full bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-700 ${className}`}
    >
      <Plus size={16} />
      Nouvelle démarche
    </Link>
  );
}

function StatCard({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tint: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tint}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-none text-gray-900 tabular-nums">{value}</p>
        <p className="mt-1 truncate text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function FoldersPage() {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sort, setSort] = useState<SortKey>('recent');
  const [search, setSearch] = useState('');

  const {
    data: folders = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['folders'],
    queryFn: folderService.list,
  });

  const all = folders as FolderSummary[];

  // Statistiques de synthèse (sur l'ensemble des dossiers).
  const stats = useMemo(() => {
    const total = all.length;
    const termine = all.filter((f) => f.statut === 'termine').length;
    const enCours = total - termine;
    const avg = total
      ? Math.round(all.reduce((sum, f) => sum + (f.progression ?? 0), 0) / total)
      : 0;
    return { total, termine, enCours, avg };
  }, [all]);

  // Recherche (titre + domaine), puis comptage par filtre, puis tri.
  const searched = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (f) =>
        f.titre.toLowerCase().includes(q) ||
        domainMeta(f.domaine).label.toLowerCase().includes(q),
    );
  }, [all, search]);

  const counts = useMemo(
    () => ({
      all: searched.length,
      active: searched.filter((f) => matchesFilter(f, 'active')).length,
      termine: searched.filter((f) => matchesFilter(f, 'termine')).length,
    }),
    [searched],
  );

  const list = useMemo(() => {
    const filtered = searched.filter((f) => matchesFilter(f, filter));
    const sorted = [...filtered];
    if (sort === 'recent') {
      sorted.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    } else if (sort === 'progress') {
      sorted.sort((a, b) => (b.progression ?? 0) - (a.progression ?? 0));
    } else {
      sorted.sort((a, b) => a.titre.localeCompare(b.titre, 'fr'));
    }
    return sorted;
  }, [searched, filter, sort]);

  const hasFolders = all.length > 0;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <PageHeader
          title="Mes dossiers"
          description="Chaque démarche lancée avec CiviBot devient un dossier suivi."
          action={hasFolders ? <NewJourneyButton /> : undefined}
        />

        {isLoading ? (
          <SkeletonList count={4} />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !hasFolders ? (
          <EmptyState
            title="Aucun dossier pour l'instant"
            description="Lancez votre première démarche avec CiviBot : elle apparaîtra ici, suivie de bout en bout."
            action={<NewJourneyButton className="mt-1" />}
          />
        ) : (
          <>
            {/* Synthèse */}
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                icon={<Layers size={17} />}
                tint="bg-gray-100 text-gray-600"
                label="Dossiers"
                value={stats.total}
              />
              <StatCard
                icon={<Loader2 size={17} />}
                tint="bg-orange-50 text-orange-600"
                label="En cours"
                value={stats.enCours}
              />
              <StatCard
                icon={<CheckCircle2 size={17} />}
                tint="bg-purple-50 text-purple-600"
                label="Terminés"
                value={stats.termine}
              />
              <StatCard
                icon={<FolderOpen size={17} />}
                tint="bg-emerald-50 text-emerald-600"
                label="Progression moy."
                value={`${stats.avg}%`}
              />
            </div>

            {/* Barre d'outils : recherche + tri */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un dossier…"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-xs text-gray-500">
                  Trier&nbsp;:
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtres avec compteurs */}
            <div className="mb-5 flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    filter === f.key
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                  <span
                    className={`rounded-full px-1.5 text-xs tabular-nums ${
                      filter === f.key ? 'bg-white/25 text-white' : 'bg-white text-gray-500'
                    }`}
                  >
                    {counts[f.key]}
                  </span>
                </button>
              ))}
            </div>

            {/* Liste */}
            {list.length === 0 ? (
              <EmptyState
                title={search ? 'Aucun résultat' : 'Aucun dossier dans ce filtre'}
                description={
                  search
                    ? `Aucun dossier ne correspond à « ${search} ».`
                    : 'Essayez un autre filtre.'
                }
              />
            ) : (
              <div className="space-y-3">
                {list.map((f) => (
                  <Link
                    key={f.id}
                    to={`/app/folders/${f.id}`}
                    className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                      <FolderOpen size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium text-gray-800">{f.titre}</p>
                        <StatusBadge statut={f.statut} />
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <DomainBadge domaine={f.domaine} />
                        <span className="text-xs text-gray-400">Maj {timeAgo(f.updatedAt)}</span>
                      </div>
                      <ProgressBar value={f.progression} showLabel className="mt-2.5" />
                    </div>
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-gray-300 transition-colors group-hover:text-orange-400"
                    />
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
