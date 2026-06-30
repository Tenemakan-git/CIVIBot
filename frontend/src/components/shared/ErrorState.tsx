import { AlertTriangle, RotateCw } from 'lucide-react';

interface Props {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = 'Une erreur est survenue',
  description = 'Impossible de charger les données. Vérifiez votre connexion et réessayez.',
  onRetry,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
        <AlertTriangle size={22} />
      </div>
      <p className="text-lg font-medium text-gray-800">{title}</p>
      <p className="text-sm text-gray-500 max-w-sm">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RotateCw size={14} /> Réessayer
        </button>
      )}
    </div>
  );
}
