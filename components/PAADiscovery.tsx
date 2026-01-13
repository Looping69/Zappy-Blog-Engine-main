
import React, { useState } from 'react';
import { SERPData, PAAQuestion } from '../types';

interface PAADiscoveryProps {
    isOpen: boolean;
    onClose: () => void;
    data: SERPData | null;
    isLoading: boolean;
    onLaunchBulk: (keywords: string[]) => void;
}

const PAADiscovery: React.FC<PAADiscoveryProps> = ({
    isOpen,
    onClose,
    data,
    isLoading,
    onLaunchBulk
}) => {
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

    if (!isOpen) return null;

    const toggleQuestion = (question: string) => {
        setSelectedQuestions(prev =>
            prev.includes(question)
                ? prev.filter(q => q !== question)
                : [...prev, question]
        );
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col animate-[slideIn_0.3s_ease-out]">

                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">People Also Ask Discovery</h2>
                        <p className="text-sm text-slate-500 font-medium">Select questions to generate bulk blogs.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Scanning SERP Data...</p>
                        </div>
                    ) : data ? (
                        <div className="space-y-8">
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-wider mb-1">Search Volume</p>
                                    <p className="text-xl font-black text-slate-900">{data.keywordMetrics?.volume.toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wider mb-1">Avg CPC</p>
                                    <p className="text-xl font-black text-slate-900">${data.keywordMetrics?.cpc}</p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-wider mb-1">Questions Found</p>
                                    <p className="text-xl font-black text-slate-900">{data.questions.length}</p>
                                </div>
                            </div>

                            {/* Questions Queue */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Knowledge Gaps Found</h3>
                                {data.questions.map((q, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => toggleQuestion(q.question)}
                                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4
                                            ${selectedQuestions.includes(q.question)
                                                ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                                                : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center border-2 transition-colors
                                            ${selectedQuestions.includes(q.question) ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-200 text-transparent'}`}>
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-900 mb-1">{q.question}</p>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{q.snippet}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-slate-400 font-medium">No PAA data available. Try searching for a medical topic.</div>
                    )}
                </div>

                <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-500">
                        {selectedQuestions.length} questions selected for bulk generation
                    </p>
                    <button
                        disabled={selectedQuestions.length === 0}
                        onClick={() => {
                            onLaunchBulk(selectedQuestions);
                            onClose();
                        }}
                        className="px-10 py-4 bg-orange-500 text-white font-black rounded-2xl shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs"
                    >
                        Launch 1-Click Bulk Creator
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PAADiscovery;
