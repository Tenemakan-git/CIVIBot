import { ExternalLink, ShieldCheck } from 'lucide-react';

interface Source {
  organisme: string;
  url?: string | null;
  titre?: string | null;
}

/** Affiche une source officielle de façon claire et vérifiable. */
export default function SourceCard({ source }: { source: Source }) {
  const host = source.url ? safeHost(source.url) : null;
  const body = (
    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-orange-300 hover:bg-orange-50/40">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
        <ShieldCheck size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-800">
          {source.titre || source.organisme}
        </p>
        <p className="truncate text-xs text-gray-500">
          {source.organisme}
          {host ? ` · ${host}` : ''}
        </p>
      </div>
      {source.url && <ExternalLink size={14} className="mt-1 shrink-0 text-gray-400" />}
    </div>
  );

  if (!source.url) return body;
  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer" className="block">
      {body}
    </a>
  );
}

function safeHost(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}
