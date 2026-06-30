import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock, Wallet, ListChecks, FileText, Search } from 'lucide-react';
import { api } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';
import { SkeletonList } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import EmptyState from '../../components/shared/EmptyState';

interface Procedure {
  id: string;
  titre: string;
  description: string;
  cout?: string | null;
  delai?: string | null;
  categorie?: { nom?: string; domaine?: { slug?: string } };
  steps?: unknown[];
  documents?: unknown[];
}

const TABS = [
  { id: 'etat-civil', label: 'État civil' },
  { id: 'creation-entreprise', label: "Création d'entreprise" },
] as const;
type TabId = (typeof TABS)[number]['id'];

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('etat-civil');
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['procedures-public'],
    queryFn: () => api.get('/procedures').then((r) => r.data),
  });
  const all = data as Procedure[];

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of TABS) counts[t.id] = all.filter((p) => p.categorie?.domaine?.slug === t.id).length;
    return counts;
  }, [all]);

  const inDomain = useMemo(
    () => all.filter((p) => p.categorie?.domaine?.slug === activeTab),
    [all, activeTab],
  );

  // Catégories présentes dans le domaine actif (dérivées des procédures).
  const categories = useMemo(() => {
    const names = new Set<string>();
    for (const p of inDomain) if (p.categorie?.nom) names.add(p.categorie.nom);
    return Array.from(names).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [inDomain]);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inDomain.filter((p) => {
      if (category !== 'all' && p.categorie?.nom !== category) return false;
      if (!q) return true;
      return (
        p.titre.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q)
      );
    });
  }, [inDomain, category, search]);

  const selectTab = (id: TabId) => {
    setActiveTab(id);
    setCategory('all');
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <PageHeader
          title="Ressources"
          description="Toutes les procédures officielles, expliquées étape par étape."
        />

        {/* Onglets par domaine, avec compteurs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => selectTab(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 text-xs tabular-nums ${
                  activeTab === tab.id ? 'bg-white/25 text-white' : 'bg-white text-gray-500'
                }`}
              >
                {tabCounts[tab.id] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <SkeletonList count={4} />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <>
            {/* Recherche */}
            <div className="relative mb-4">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une procédure…"
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* Sous-filtres par catégorie */}
            {categories.length > 1 && (
              <div className="mb-5 flex flex-wrap gap-2">
                <button
                  onClick={() => setCategory('all')}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    category === 'all' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  Toutes
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      category === c ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {list.length === 0 ? (
              <EmptyState
                title={search ? 'Aucun résultat' : 'Aucune procédure disponible'}
                description={
                  search
                    ? `Aucune procédure ne correspond à « ${search} ».`
                    : 'Les procédures de ce domaine apparaîtront ici.'
                }
              />
            ) : (
              <div className="space-y-3">
                {list.map((proc) => {
                  const steps = proc.steps?.length ?? 0;
                  const docs = proc.documents?.length ?? 0;
                  return (
                    <Link
                      key={proc.id}
                      to={`/app/resources/${proc.id}`}
                      className="group block rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1.5">
                          {proc.categorie?.nom && (
                            <span className="inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                              {proc.categorie.nom}
                            </span>
                          )}
                          <h3 className="font-semibold text-gray-800">{proc.titre}</h3>
                          <p className="line-clamp-2 text-sm text-gray-500">{proc.description}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-xs text-gray-400">
                            {proc.delai && (
                              <span className="flex items-center gap-1">
                                <Clock size={12} /> {proc.delai}
                              </span>
                            )}
                            {proc.cout && (
                              <span className="flex items-center gap-1">
                                <Wallet size={12} /> {proc.cout}
                              </span>
                            )}
                            {steps > 0 && (
                              <span className="flex items-center gap-1">
                                <ListChecks size={12} /> {steps} étape{steps > 1 ? 's' : ''}
                              </span>
                            )}
                            {docs > 0 && (
                              <span className="flex items-center gap-1">
                                <FileText size={12} /> {docs} document{docs > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight
                          size={18}
                          className="mt-1 shrink-0 text-gray-300 transition-colors group-hover:text-orange-400"
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
