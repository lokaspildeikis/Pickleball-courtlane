import React, { useState } from 'react';
import { optimizeProduct, OptimizationResult } from '../../lib/gemini';
import { Sparkles, Check, X, Loader2, Edit2 } from 'lucide-react';

interface AIOptimizerProps {
  originalTitle: string;
  originalDescription: string;
  originalTags: string[];
  onApply: (optimized: OptimizationResult) => void;
}

const AIOptimizer: React.FC<AIOptimizerProps> = ({ 
  originalTitle, 
  originalDescription, 
  originalTags,
  onApply 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<OptimizationResult | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOptimize = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await optimizeProduct(originalTitle, originalDescription, originalTags);
      setSuggestion(result);
      setIsOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to optimize product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (suggestion) {
      onApply(suggestion);
      setIsOpen(false);
    }
  };

  if (!isOpen && !isLoading) {
    return (
      <button
        onClick={handleOptimize}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full font-medium transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95"
      >
        <Sparkles className="w-4 h-4" />
        <span>Suggest listing copy</span>
      </button>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/90 dark:bg-slate-900/90 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <p className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
              Writing suggestions…
            </p>
          </div>
        </div>
      )}

      {isOpen && suggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/10">
            {/* Header */}
            <div className="p-8 border-b dark:border-white/5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-indigo-500" />
                  Luxury Optimization Preview
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Refined for the Courtlane aesthetic.</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 grid md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto">
              {/* Original */}
              <div className="space-y-6 opacity-60 grayscale-[50%]">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Current Listing</span>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">{originalTitle}</h4>
                  <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic line-clamp-6">
                    {originalDescription}
                  </div>
                </div>
              </div>

              {/* Optimized */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">Suggested version</span>
                  <button 
                    onClick={() => setEditMode(!editMode)}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-500 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    {editMode ? 'Finish Editing' : 'Refine Manually'}
                  </button>
                </div>
                
                <div className="space-y-4">
                  {editMode ? (
                    <input
                      className="w-full text-xl font-bold bg-slate-50 dark:bg-white/5 border border-indigo-500/30 rounded-xl p-3 focus:outline-none focus:ring-2 ring-indigo-500/20"
                      value={suggestion.title}
                      onChange={(e) => setSuggestion({ ...suggestion, title: e.target.value })}
                    />
                  ) : (
                    <h4 className="text-xl font-bold text-indigo-900 dark:text-white leading-tight">
                      {suggestion.title}
                    </h4>
                  )}

                  {editMode ? (
                    <textarea
                      className="w-full h-64 text-sm bg-slate-50 dark:bg-white/5 border border-indigo-500/30 rounded-xl p-4 focus:outline-none focus:ring-2 ring-indigo-500/20 leading-relaxed"
                      value={suggestion.description}
                      onChange={(e) => setSuggestion({ ...suggestion, description: e.target.value })}
                    />
                  ) : (
                    <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {suggestion.description}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    {suggestion.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full border border-indigo-100 dark:border-indigo-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t dark:border-white/5 flex gap-4 justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 rounded-2xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleApply}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                Apply to listing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIOptimizer;
