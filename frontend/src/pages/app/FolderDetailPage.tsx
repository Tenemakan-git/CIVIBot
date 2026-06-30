import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, FileDown, CheckCircle2, Circle, AlertCircle,
  Clock, FileText, ListChecks, Flag, BadgeCheck,
} from 'lucide-react';
import { folderService, type FolderDetail } from '../../services/folder.service';
import { API_URL } from '../../lib/constants';
import ProgressBar from '../../components/shared/ProgressBar';
import { StatusBadge, DomainBadge } from '../../components/shared/StatusBadge';
import SourceCard from '../../components/shared/SourceCard';
import OfficialDocsSection from '../../components/document/OfficialDocsSection';
import CompetentServicesCard from '../../components/services/CompetentServicesCard';
import ErrorState from '../../components/shared/ErrorState';
import { Skeleton } from '../../components/shared/Skeleton';
import { timeAgo } from '../../lib/folderMeta';

export default function FolderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [downloading, setDownloading] = useState(false);

  const { data: folder, isLoading, isError, refetch } = useQuery({
    queryKey: ['folder', id],
    queryFn: () => folderService.get(id!),
    enabled: !!id,
  });

  const terminate = useMutation({
    mutationFn: () => folderService.terminate(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folder', id] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });

  const toggleDoc = useMutation({
    mutationFn: (v: { docId: string; fourni: boolean }) =>
      folderService.setDocument(id!, v.docId, v.fourni),
    onSuccess: (fresh) => {
      queryClient.setQueryData(['folder', id], fresh);
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
  });

  const downloadPdf = async () => {
    if (!id) return;
    setDownloading(true);
    try {
      const token = localStorage.getItem('civibot_token');
      const res = await fetch(`${API_URL}/folders/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dossier-civibot.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) return <DetailSkeleton />;
  if (isError || !folder) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <BackLink />
        <ErrorState
          title="Dossier introuvable"
          description="Ce dossier n'existe pas ou ne vous appartient pas."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const f = folder as FolderDetail;
  const planSteps = Array.isArray(f.plan?.steps) ? (f.plan!.steps as any[]) : [];
  const docsDone = f.documents.filter((d) => d.statut === 'fourni').length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        <BackLink />

        {/* En-tête */}
        <header className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <DomainBadge domaine={f.domaine} />
                <StatusBadge statut={f.statut} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">{f.titre}</h1>
              <p className="mt-1 text-sm text-gray-400">
                Créé {timeAgo(f.createdAt)} · mis à jour {timeAgo(f.updatedAt)}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={downloadPdf}
                disabled={downloading}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
              >
                <FileDown size={15} /> {downloading ? 'Génération…' : 'Télécharger le PDF'}
              </button>
              {f.statut !== 'termine' && (
                <button
                  onClick={() => terminate.mutate()}
                  disabled={terminate.isPending}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <Flag size={15} /> Marquer terminé
                </button>
              )}
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-gray-600">Progression</span>
              <span className="tabular-nums text-gray-500">{Math.round(f.progression)}%</span>
            </div>
            <ProgressBar value={f.progression} />
            {(f.plan?.cout || f.plan?.delai) && (
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                {f.plan?.cout && <span>💰 Coût estimé : <strong>{f.plan.cout}</strong></span>}
                {f.plan?.delai && <span>⏱️ Délai estimé : <strong>{f.plan.delai}</strong></span>}
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Colonne principale */}
          <div className="space-y-6 lg:col-span-2">
            {/* Étapes du plan */}
            {planSteps.length > 0 && (
              <Section icon={<ListChecks size={16} />} title="Étapes de la démarche">
                <ol className="space-y-3">
                  {planSteps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-semibold text-orange-600">
                        {i + 1}
                      </span>
                      <div className="text-sm text-gray-700">
                        {typeof step === 'string'
                          ? step
                          : step?.titre || step?.label || step?.description || JSON.stringify(step)}
                        {step?.description && step?.titre && (
                          <p className="mt-0.5 text-xs text-gray-500">{step.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {/* Documents requis */}
            <Section
              icon={<FileText size={16} />}
              title="Documents requis"
              count={f.documents.length ? `${docsDone}/${f.documents.length}` : undefined}
            >
              {f.documents.length === 0 ? (
                <EmptyHint text="Aucun document listé pour ce dossier." />
              ) : (
                <ul className="space-y-2">
                  {f.documents.map((d, i) => {
                    const provided = d.statut === 'fourni';
                    return (
                      <li key={d.id ?? i}>
                        <button
                          onClick={() => toggleDoc.mutate({ docId: d.id, fourni: !provided })}
                          disabled={toggleDoc.isPending}
                          title={provided ? 'Marquer comme manquant' : 'Marquer comme fourni'}
                          className="flex w-full items-center gap-3 rounded-lg border border-gray-100 px-3 py-2.5 text-left transition hover:border-orange-200 hover:bg-orange-50/40 disabled:opacity-60"
                        >
                          {provided ? (
                            <CheckCircle2 size={17} className="shrink-0 text-green-500" />
                          ) : d.statut === 'a_verifier' ? (
                            <AlertCircle size={17} className="shrink-0 text-amber-500" />
                          ) : (
                            <Circle size={17} className="shrink-0 text-gray-300" />
                          )}
                          <span className={`flex-1 text-sm ${provided ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                            {d.nom}
                            {!d.obligatoire && (
                              <span className="ml-1.5 text-xs text-gray-400">(optionnel)</span>
                            )}
                          </span>
                          <span className="text-xs font-medium text-gray-400">
                            {provided ? 'Fourni' : 'À fournir'}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Section>

            {/* Timeline */}
            <Section icon={<Clock size={16} />} title="Historique du dossier">
              {f.timeline.length === 0 ? (
                <EmptyHint text="Aucun évènement pour le moment." />
              ) : (
                <ol className="relative space-y-4 border-l border-gray-100 pl-5">
                  {f.timeline.map((t, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[1.42rem] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-orange-400" />
                      <p className="text-sm text-gray-700">{t.label}</p>
                    </li>
                  ))}
                </ol>
              )}
            </Section>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Où déposer le dossier */}
            <CompetentServicesCard domaine={f.domaine} />

            {/* Documents officiels à générer */}
            <OfficialDocsSection folderId={f.id} />

            {/* Checklists liées */}
            {f.checklists.length > 0 && (
              <Section icon={<ListChecks size={16} />} title="Checklists">
                <ul className="space-y-2">
                  {f.checklists.map((c) => (
                    <li key={c.id}>
                      <Link
                        to="/app/checklists"
                        className="block rounded-lg border border-gray-100 px-3 py-2 text-sm text-gray-700 hover:border-orange-200 hover:bg-orange-50/40"
                      >
                        {c.titre}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Sources officielles */}
            <Section icon={<BadgeCheck size={16} />} title="Sources officielles">
              {f.sources.length === 0 ? (
                <EmptyHint text="Aucune source associée." />
              ) : (
                <div className="space-y-2">
                  {f.sources.map((s, i) => (
                    <SourceCard key={i} source={s} />
                  ))}
                </div>
              )}
            </Section>
          </div>
        </div>
      </div>
    </div>
  );

  function BackLink() {
    return (
      <button
        onClick={() => navigate('/app/folders')}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft size={15} /> Mes dossiers
      </button>
    );
  }
}

function Section({
  icon, title, count, children,
}: { icon: React.ReactNode; title: string; count?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-gray-400">{icon}</span>
        <h2 className="font-semibold text-gray-800">{title}</h2>
        {count && (
          <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            {count}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-sm text-gray-400">{text}</p>;
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
      <Skeleton className="h-4 w-28" />
      <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-4">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-2 w-full" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}
