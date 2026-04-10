import { Link } from "react-router-dom";
import { TrustPolicySnippet } from "../../lib/trustContent";

type PolicySnippetGridProps = {
  snippets: TrustPolicySnippet[];
  className?: string;
};

export function PolicySnippetGrid({ snippets, className = "" }: PolicySnippetGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${className}`}>
      {snippets.map((snippet) => (
        <div key={snippet.id} className="rounded-sm border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-1">{snippet.title}</h3>
          <p className="text-sm text-gray-600">{snippet.text}</p>
          {snippet.href && (
            snippet.href.startsWith("mailto:") ? (
              <a href={snippet.href} className="inline-block mt-2 text-sm font-semibold text-teal-700 hover:underline">
                Contact support
              </a>
            ) : (
              <Link to={snippet.href} className="inline-block mt-2 text-sm font-semibold text-teal-700 hover:underline">
                Learn more
              </Link>
            )
          )}
        </div>
      ))}
    </div>
  );
}

