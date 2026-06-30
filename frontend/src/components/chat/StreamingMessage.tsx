import Markdown from '../shared/Markdown';

export default function StreamingMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[75%] space-y-1">
        <div className="rounded-2xl px-4 py-3 text-sm bg-gray-100 text-gray-900">
          {content ? (
            <Markdown>{content}</Markdown>
          ) : (
            <p className="text-gray-400">…</p>
          )}
        </div>
      </div>
    </div>
  );
}
