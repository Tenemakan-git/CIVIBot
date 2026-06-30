interface Source {
  id: string;
  titre: string;
  extrait: string;
}

export default function ContextPanel({ sources }: { sources: Source[] }) {
  if (!sources.length) return null;

  return (
    <aside className="w-72 border-l bg-gray-50 flex flex-col">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Sources ({sources.length})</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {sources.map((s, i) => (
          <div key={s.id} className="bg-white rounded-lg border p-3 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-xs font-bold text-orange-600 shrink-0">[{i + 1}]</span>
              <p className="text-xs font-medium text-gray-800 truncate">{s.titre}</p>
            </div>
            <p className="text-xs text-gray-500 line-clamp-3">{s.extrait}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
