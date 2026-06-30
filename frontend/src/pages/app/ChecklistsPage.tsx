import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Check, ListChecks, CheckCircle2 } from 'lucide-react';
import { checklistService } from '../../services/checklist.service';
import PageHeader from '../../components/shared/PageHeader';
import ProgressBar from '../../components/shared/ProgressBar';
import { SkeletonList } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import EmptyState from '../../components/shared/EmptyState';
import { timeAgo } from '../../lib/folderMeta';

interface ChecklistItem {
  id: string;
  texte: string;
  coche: boolean;
}
interface Checklist {
  id: string;
  titre: string;
  createdAt?: string;
  items: ChecklistItem[];
}

function progressOf(cl: Checklist) {
  const total = cl.items.length;
  const done = cl.items.filter((i) => i.coche).length;
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0, complete: total > 0 && done === total };
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
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tint}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-none text-gray-900 tabular-nums">{value}</p>
        <p className="mt-1 truncate text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function ChecklistsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [titre, setTitre] = useState('');
  const [itemsText, setItemsText] = useState('');

  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['checklists'],
    queryFn: checklistService.list,
  });
  const checklists = data as Checklist[];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['checklists'] });

  const createMutation = useMutation({
    mutationFn: () => checklistService.create(titre.trim(), itemsText.split('\n').map((s) => s.trim()).filter(Boolean)),
    onSuccess: () => {
      invalidate();
      setShowCreate(false);
      setTitre('');
      setItemsText('');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ checklistId, itemId, coche }: { checklistId: string; itemId: string; coche: boolean }) =>
      checklistService.toggleItem(checklistId, itemId, coche),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: checklistService.remove,
    onSuccess: invalidate,
  });

  const stats = useMemo(() => {
    const total = checklists.reduce((s, c) => s + c.items.length, 0);
    const done = checklists.reduce((s, c) => s + c.items.filter((i) => i.coche).length, 0);
    return {
      lists: checklists.length,
      done,
      total,
      pct: total ? Math.round((done / total) * 100) : 0,
    };
  }, [checklists]);

  const pendingItemCount = itemsText.split('\n').filter((l) => l.trim()).length;

  const CreateForm = (
    <div className="mb-6 space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <input
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        placeholder="Titre de la checklist"
        autoFocus
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
      />
      <textarea
        value={itemsText}
        onChange={(e) => setItemsText(e.target.value)}
        placeholder="Un élément par ligne…"
        rows={4}
        className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {pendingItemCount > 0 ? `${pendingItemCount} élément${pendingItemCount > 1 ? 's' : ''}` : 'Aucun élément'}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowCreate(false);
              setTitre('');
              setItemsText('');
            }}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={() => createMutation.mutate()}
            disabled={!titre.trim() || createMutation.isPending}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Création…' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <PageHeader
          title="Mes checklists"
          description="Suivez vos démarches étape par étape, en cochant ce qui est fait."
          action={
            !isLoading && !isError && checklists.length > 0 && !showCreate ? (
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-700"
              >
                <Plus size={16} /> Nouvelle checklist
              </button>
            ) : undefined
          }
        />

        {isLoading ? (
          <SkeletonList count={3} />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : checklists.length === 0 ? (
          showCreate ? (
            CreateForm
          ) : (
            <EmptyState
              title="Aucune checklist"
              description="Créez votre première checklist pour suivre une démarche pas à pas."
              action={
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-1 inline-flex items-center gap-2 rounded-full bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-700"
                >
                  <Plus size={16} /> Nouvelle checklist
                </button>
              }
            />
          )
        ) : (
          <>
            {/* Synthèse */}
            <div className="mb-5 grid grid-cols-3 gap-3">
              <StatCard icon={<ListChecks size={17} />} tint="bg-gray-100 text-gray-600" label="Checklists" value={stats.lists} />
              <StatCard
                icon={<CheckCircle2 size={17} />}
                tint="bg-green-50 text-green-600"
                label="Éléments faits"
                value={`${stats.done}/${stats.total}`}
              />
              <StatCard icon={<Check size={17} />} tint="bg-orange-50 text-orange-600" label="Progression" value={`${stats.pct}%`} />
            </div>

            {showCreate && CreateForm}

            <div className="space-y-4">
              {checklists.map((cl) => {
                const p = progressOf(cl);
                return (
                  <div key={cl.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="mb-2.5 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-semibold text-gray-800">{cl.titre}</h3>
                          {p.complete && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
                              <CheckCircle2 size={11} /> Terminée
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {p.done}/{p.total} fait{p.done > 1 ? 's' : ''}
                          {cl.createdAt ? ` · créée ${timeAgo(cl.createdAt)}` : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm(`Supprimer la checklist « ${cl.titre} » ?`)) deleteMutation.mutate(cl.id);
                        }}
                        className="shrink-0 rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                        aria-label="Supprimer la checklist"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <ProgressBar value={p.pct} showLabel className="mb-3" />

                    {cl.items.length === 0 ? (
                      <p className="py-2 text-center text-xs text-gray-400">Cette checklist est vide.</p>
                    ) : (
                      <div className="space-y-0.5">
                        {cl.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => toggleMutation.mutate({ checklistId: cl.id, itemId: item.id, coche: !item.coche })}
                            className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-gray-50"
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                                item.coche ? 'border-green-500 bg-green-500' : 'border-gray-300'
                              }`}
                            >
                              {item.coche && <Check size={12} className="text-white" />}
                            </span>
                            <span className={`text-sm ${item.coche ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                              {item.texte}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
