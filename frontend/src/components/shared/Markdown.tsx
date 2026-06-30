import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Rendu Markdown stylé (GFM : titres, listes, tableaux, gras, liens, code…)
 * pour les réponses de l'IA. Le HTML brut n'est pas autorisé (sécurité).
 */
const components: Components = {
  h1: ({ children }) => <h1 className="mt-3 mb-1.5 text-base font-bold first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-3 mb-1.5 text-sm font-bold first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-2.5 mb-1 text-sm font-semibold first:mt-0">{children}</h3>,
  p: ({ children }) => <p className="my-1.5 leading-relaxed first:mt-0 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="my-1.5 ml-1 list-disc space-y-1 pl-4">{children}</ul>,
  ol: ({ children }) => <ol className="my-1.5 ml-1 list-decimal space-y-1 pl-4">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-orange-600 underline underline-offset-2 hover:text-orange-700"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-3 border-gray-200" />,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-orange-200 pl-3 text-gray-600">{children}</blockquote>
  ),
  code: ({ className, children }) => {
    const isBlock = (className ?? '').includes('language-');
    if (isBlock) {
      return (
        <code className="block overflow-x-auto rounded-md bg-gray-800 p-3 font-mono text-xs text-gray-100">
          {children}
        </code>
      );
    }
    return <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-[0.85em]">{children}</code>;
  },
  pre: ({ children }) => <pre className="my-2">{children}</pre>,
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-gray-200 px-2.5 py-1.5 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => <td className="border border-gray-200 px-2.5 py-1.5 align-top">{children}</td>,
};

export default function Markdown({ children }: { children: string }) {
  return (
    <div className="text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
