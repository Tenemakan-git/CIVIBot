import type { AgentStep, QualityInfo } from '../../stores/conversationStore';

/** Libellés « orientés utilisateur » — n'exposent pas le raisonnement interne. */
const LABELS: Record<string, string> = {
  'intent-analysis': 'Analyse de votre demande',
  knowledge: 'Recherche documentaire',
  'web-research': 'Recherche sur sources officielles',
  'knowledge-validation': 'Validation des sources',
  'knowledge-manager': 'Mise à jour de la base de connaissances',
  planning: 'Planification de la démarche',
  procedure: 'Construction de la procédure',
  checklist: 'Génération de la checklist',
  document: 'Préparation des documents',
  'official-document': 'Modèles de documents officiels',
  orientation: 'Orientation vers le service compétent',
  folder: 'Assemblage de votre dossier',
  verification: 'Vérification du dossier',
  quality: 'Contrôle qualité',
  pdf: 'Génération du PDF',
};

function StepIcon({ status }: { status: string }) {
  if (status === 'failed') {
    return <span className="text-red-500 text-xs">✕</span>;
  }
  if (status === 'partial' || status === 'needs_followup') {
    return <span className="text-amber-500 text-xs">!</span>;
  }
  return <span className="text-green-600 text-xs">✓</span>;
}

function QualityBadge({ quality }: { quality: QualityInfo }) {
  const pct =
    quality.confidence != null ? Math.round(quality.confidence * 100) : null;
  if (quality.passed) {
    return (
      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-2.5 py-1 text-xs text-green-700">
        <span>●</span>
        Réponse vérifiée{pct != null ? ` · confiance ${pct}%` : ''}
      </div>
    );
  }
  return (
    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs text-amber-700">
      <span>▲</span>
      À vérifier auprès de l'organisme officiel{pct != null ? ` · confiance ${pct}%` : ''}
    </div>
  );
}

interface Props {
  steps: AgentStep[];
  streaming: boolean;
  quality: QualityInfo | null;
}

export default function AgentTimeline({ steps, streaming, quality }: Props) {
  if (steps.length === 0 && !streaming) return null;

  return (
    <div className="rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50/70 to-white p-3.5">
      <div className="flex items-center gap-2 text-sm font-medium text-orange-700">
        {streaming ? (
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-orange-300 border-t-orange-600" />
        ) : (
          <span className="text-green-600">✓</span>
        )}
        {streaming ? 'CiviBot mobilise ses agents…' : 'Démarche traitée par les agents CiviBot'}
      </div>

      <ul className="mt-2.5 space-y-1.5">
        {steps.map((s) => (
          <li key={s.agent} className="flex items-center gap-2 text-xs text-gray-600">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white border border-gray-200">
              <StepIcon status={s.status} />
            </span>
            {LABELS[s.agent] ?? s.agent}
          </li>
        ))}
      </ul>

      {quality && <QualityBadge quality={quality} />}
    </div>
  );
}
