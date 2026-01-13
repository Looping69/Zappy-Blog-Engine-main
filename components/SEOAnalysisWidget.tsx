
import React from 'react';
import { SEOAnalysis } from '../types';

interface SEOAnalysisWidgetProps {
    analysis?: SEOAnalysis;
    isGenerating: boolean;
}

const SEOAnalysisWidget: React.FC<SEOAnalysisWidgetProps> = ({ analysis, isGenerating }) => {
    if (isGenerating || (!analysis && !isGenerating)) {
        return (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 animate-pulse">
                <div className="w-16 h-2 bg-slate-200 rounded-full mb-3"></div>
                <div className="w-full h-12 bg-slate-200 rounded-xl"></div>
            </div>
        );
    }

    const { score, optimizationTips, suggestedKeywords } = analysis;

    const getScoreColor = (s: number) => {
        if (s >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (s >= 50) return 'text-orange-600 bg-orange-50 border-orange-100';
        return 'text-red-600 bg-red-50 border-red-100';
    };

    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SEO Audit</h3>
                <div className={`px-2 py-0.5 rounded-lg border font-black text-[10px] ${getScoreColor(score)}`}>
                    {score}/100
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-wider mb-2">Tips</h4>
                    <ul className="space-y-1.5">
                        {(optimizationTips || []).slice(0, 3).map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-600 leading-tight">
                                <span className="text-orange-500 shrink-0">🚀</span>
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>

                {suggestedKeywords && suggestedKeywords.length > 0 && (
                    <div>
                        <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-wider mb-2">Keywords</h4>
                        <div className="flex flex-wrap gap-1.5">
                            {(suggestedKeywords || []).slice(0, 5).map((kw, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-100 rounded text-[9px] font-bold">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SEOAnalysisWidget;
