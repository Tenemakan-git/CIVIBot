import { statusMeta, domainMeta } from '../../lib/folderMeta';

export function StatusBadge({ statut }: { statut: string }) {
  const m = statusMeta(statut);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${m.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

export function DomainBadge({ domaine }: { domaine: string }) {
  const m = domainMeta(domaine);
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${m.cls}`}>
      {m.label}
    </span>
  );
}
