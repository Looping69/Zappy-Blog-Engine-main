
import React from 'react';
import {
    BlogStructure,
    BLOG_STRUCTURES,
    ContentConfig
} from '../types';

interface ContentSettingsTabProps {
    contentConfig: ContentConfig;
    onConfigChange: (config: ContentConfig) => void;
}

const ContentSettingsTab: React.FC<ContentSettingsTabProps> = ({
    contentConfig,
    onConfigChange
}) => {
    const selectedStructure = BLOG_STRUCTURES.find(s => s.id === contentConfig.blogStructure);

    return (
        <div className="space-y-6">
            {/* Structure Selection */}
            <div>
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">
                    Blog Structure Template
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BLOG_STRUCTURES.map(structure => (
                        <button
                            key={structure.id}
                            onClick={() => onConfigChange({ ...contentConfig, blogStructure: structure.id })}
                            className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md
                ${contentConfig.blogStructure === structure.id
                                    ? 'border-orange-500 bg-orange-50 shadow-sm'
                                    : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">{structure.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-bold text-slate-900 block">{structure.name}</span>
                                    <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                                        {structure.description}
                                    </span>
                                </div>
                                {contentConfig.blogStructure === structure.id && (
                                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Template Preview */}
            {selectedStructure && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                        <span>{selectedStructure.icon}</span>
                        <span className="text-xs font-bold text-slate-700">{selectedStructure.name} Template</span>
                    </div>
                    <div className="p-4">
                        <pre className="text-[11px] text-slate-600 font-mono whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100 max-h-48 overflow-y-auto">
                            {selectedStructure.template}
                        </pre>
                    </div>
                </div>
            )}

            {/* Custom Instructions */}
            <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                    Additional Structure Instructions
                    <span className="font-normal normal-case tracking-normal text-slate-400 ml-2">(Optional)</span>
                </label>
                <textarea
                    value={contentConfig.customStructureInstructions}
                    onChange={e => onConfigChange({ ...contentConfig, customStructureInstructions: e.target.value })}
                    placeholder="e.g., Always include a 'Key Takeaways' box at the top, limit sections to 300 words each..."
                    className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-orange-500 transition-colors"
                />
            </div>

            {/* Quick Tips */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                    <span className="text-lg">💡</span>
                    <div>
                        <p className="text-xs font-bold text-blue-900 mb-1">Pro Tips</p>
                        <ul className="text-[11px] text-blue-700 space-y-1">
                            <li>• <strong>Listicle</strong> works great for SEO and social sharing</li>
                            <li>• <strong>Q&A</strong> format helps capture featured snippets in search</li>
                            <li>• <strong>Comparison</strong> is ideal for decision-making content</li>
                            <li>• <strong>Myth-Busting</strong> drives engagement and shares</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentSettingsTab;
