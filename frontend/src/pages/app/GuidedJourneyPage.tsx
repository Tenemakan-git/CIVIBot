import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2, CheckCircle2, Circle, FolderOpen, MessageSquare,
  ListChecks, FileText, MapPin,
} from 'lucide-react';
import { folderService, type FolderDetail } from '../../services/folder.service';
import {
  journeyService,
  type Questionnaire,
  type QuestionnaireOption,
  type JourneyResult,
} from '../../services/journey.service';
import { DomainBadge } from '../../components/shared/StatusBadge';
import CompetentServicesCard from '../../components/services/CompetentServicesCard';

export default function GuidedJourneyPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<JourneyResult | null>(null);

  const { data: questionnaire, isLoading } = useQuery({
    queryKey: ['journey-questionnaire'],
    queryFn: () => journeyService.questionnaire(),
  });

  const byId = useMemo(() => {
    const map: Record<string, Questionnaire['questions'][number]> = {};
    questionnaire?.questions.forEach((q) => (map[q.id] = q));
    return map;
  }, [questionnaire]);

  const startSession = async () => {
    if (!questionnaire) return;
    const s = await journeyService.start();
    setSessionId(s.id);
    setCurrentId(questionnaire.start);
    setAnswered(0);
  };

  const answer = async (opt: QuestionnaireOption) => {
    if (!sessionId || !currentId) return;
    const node = byId[currentId];
    await journeyService.answer(sessionId, {
      question: node.question,
      reponse: opt.label,
      ordre: answered,
    });
    if (opt.next && byId[opt.next]) {
      setCurrentId(opt.next);
      setAnswered((n) => n + 1);
    } else {
      setGenerating(true);
      try {
        setResult(await journeyService.complete(sessionId));
      } finally {
        setGenerating(false);
      }
    }
  };

  if (generating) return <GeneratingScreen />;
  if (result) return <ResultScreen result={result} />;

  if (!sessionId) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Parcours guidé</h1>
        <p className="text-gray-600 mb-8">
          Répondez à quelques questions : CiviBot construit automatiquement votre feuille de route
          et ouvre votre dossier.
        </p>
        <button onClick={startSession} disabled={isLoading || !questionnaire}
          className="bg-orange-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-orange-700 disabled:opacity-50">
          {isLoading ? 'Chargement…' : 'Commencer le parcours'}
        </button>
      </div>
    );
  }

  const node = currentId ? byId[currentId] : undefined;
  if (!node) return <GeneratingScreen />;

  const remaining = minDepth(byId, currentId!);
  const progress = Math.round((answered / (answered + remaining)) * 100);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Question {answered + 1}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-orange-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-6">{node.question}</h2>

      <div className="space-y-3">
        {node.options.map((opt) => (
          <button key={opt.value} onClick={() => answer(opt)}
            className="w-full text-left p-4 border-2 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-colors">
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Profondeur minimale (nombre de questions restantes) de `id` jusqu'à une feuille. */
function minDepth(
  byId: Record<string, { id: string; options: QuestionnaireOption[] }>,
  id: string,
  seen: Set<string> = new Set(),
): number {
  const node = byId[id];
  if (!node || seen.has(id)) return 1;
  const nexts = node.options.map((o) => o.next).filter((n): n is string => !!n);
  if (nexts.length === 0) return 1;
  seen.add(id);
  return 1 + Math.min(...nexts.map((n) => minDepth(byId, n, seen)));
}

function GeneratingScreen() {
  const steps = [
    'Analyse de votre situation',
    'Identification de la démarche',
    'Construction de votre feuille de route',
    'Ouverture de votre dossier',
  ];
  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <Loader2 className="mx-auto mb-4 animate-spin text-orange-600" size={40} />
      <h2 className="text-xl font-bold text-gray-900 mb-2">CiviBot prépare votre feuille de route…</h2>
      <p className="text-gray-500 text-sm mb-6">Une équipe d'agents traite vos réponses.</p>
      <ul className="inline-block space-y-2 text-left">
        {steps.map((s) => (
          <li key={s} className="flex items-center gap-2 text-sm text-gray-600">
            <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-orange-200" />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResultScreen({ result }: { result: JourneyResult }) {
  const navigate = useNavigate();
  const { data: folder, isLoading } = useQuery({
    queryKey: ['folder', result.folderId],
    queryFn: () => folderService.get(result.folderId!),
    enabled: !!result.folderId,
  });

  if (!result.folderId) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center">
        <CheckCircle2 className="mx-auto mb-3 text-green-600" size={40} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Parcours terminé</h2>
        <p className="text-gray-600 mb-6">
          Posez vos questions à CiviBot pour préciser votre démarche.
        </p>
        {result.conversationId && (
          <Link to={`/app/conversations/${result.conversationId}`}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700">
            <MessageSquare size={16} /> Continuer dans le chat
          </Link>
        )}
      </div>
    );
  }

  if (isLoading || !folder) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Loader2 className="mx-auto mt-10 animate-spin text-orange-600" size={32} />
      </div>
    );
  }

  const f = folder as FolderDetail;
  const planSteps = Array.isArray(f.plan?.steps) ? (f.plan!.steps as any[]) : [];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 py-8 space-y-6">
        <header className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="text-green-600" size={30} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Votre feuille de route est prête</h1>
          <p className="mt-1 text-sm text-gray-500">
            Générée à partir de vos réponses au parcours guidé.
          </p>
        </header>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <DomainBadge domaine={f.domaine} />
            <h2 className="text-lg font-bold text-gray-900">{f.titre}</h2>
          </div>
          {(f.plan?.cout || f.plan?.delai) && (
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {f.plan?.cout && <span>💰 Coût estimé : <strong>{f.plan.cout}</strong></span>}
              {f.plan?.delai && <span>⏱️ Délai estimé : <strong>{f.plan.delai}</strong></span>}
            </div>
          )}
        </div>

        {planSteps.length > 0 && (
          <Section icon={<ListChecks size={16} />} title="Vos étapes">
            <ol className="space-y-3">
              {planSteps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-semibold text-orange-600">
                    {i + 1}
                  </span>
                  <div className="text-sm text-gray-700">
                    {typeof s === 'string' ? s : s?.titre || s?.description || JSON.stringify(s)}
                    {s?.description && s?.titre && (
                      <p className="mt-0.5 text-xs text-gray-500">{s.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {f.documents.length > 0 && (
          <Section icon={<FileText size={16} />} title="Documents à prévoir">
            <ul className="space-y-2">
              {f.documents.map((d, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  {d.statut === 'fourni'
                    ? <CheckCircle2 size={16} className="text-green-500" />
                    : <Circle size={16} className="text-gray-300" />}
                  {d.nom}
                  {!d.obligatoire && <span className="text-xs text-gray-400">(optionnel)</span>}
                </li>
              ))}
            </ul>
          </Section>
        )}

        <CompetentServicesCard domaine={f.domaine} />

        {planSteps.length === 0 && f.documents.length === 0 && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            Votre dossier est ouvert. Précisez votre besoin dans le chat pour compléter la feuille de route.
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate(`/app/folders/${result.folderId}`)}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 font-medium text-white hover:bg-orange-700"
          >
            <FolderOpen size={16} /> Ouvrir mon dossier
          </button>
          {result.conversationId && (
            <button
              onClick={() => navigate(`/app/conversations/${result.conversationId}`)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
            >
              <MessageSquare size={16} /> Continuer dans le chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-gray-400">{icon}</span>
        <h2 className="font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </section>
  );
}
