
import React, { useState } from 'react';
import {
    AgentId,
    AGENTS,
    AgentConfig,
    AgentConfigs,
    ToneModifier,
    PriorityMode,
    DEFAULT_AGENT_CONFIG
} from '../types';

interface AgentSettingsTabProps {
    agentConfigs: AgentConfigs;
    onConfigChange: (agentId: AgentId, config: AgentConfig) => void;
    onResetAgent: (agentId: AgentId) => void;
}

const TONE_OPTIONS: { value: ToneModifier; label: string; desc: string }[] = [
    { value: 'clinical', label: 'Clinical', desc: 'Professional medical terminology' },
    { value: 'friendly', label: 'Friendly', desc: 'Warm, patient-focused tone' },
    { value: 'concise', label: 'Concise', desc: 'Brief, to-the-point responses' },
    { value: 'detailed', label: 'Detailed', desc: 'Comprehensive explanations' },
    { value: 'custom', label: 'Custom', desc: 'Use custom instructions below' }
];

const PRIORITY_OPTIONS: { value: PriorityMode; label: string; icon: string }[] = [
    { value: 'speed', label: 'Speed', icon: '⚡' },
    { value: 'balanced', label: 'Balanced', icon: '⚖️' },
    { value: 'quality', label: 'Quality', icon: '💎' }
];

const AgentSettingsTab: React.FC<AgentSettingsTabProps> = ({
    agentConfigs,
    onConfigChange,
    onResetAgent
}) => {
    const [selectedAgent, setSelectedAgent] = useState<AgentId>(AgentId.RESEARCHER);
    const [expandedSection, setExpandedSection] = useState<string | null>('model');

    const currentConfig = agentConfigs[selectedAgent];
    const currentAgentInfo = AGENTS.find(a => a.id === selectedAgent)!;

    const updateConfig = (updates: Partial<AgentConfig>) => {
        onConfigChange(selectedAgent, { ...currentConfig, ...updates });
    };

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <div className="space-y-6">
            {/* Agent Selector Tabs */}
            <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-xl">
                {AGENTS.map(agent => (
                    <button
                        key={agent.id}
                        onClick={() => setSelectedAgent(agent.id)}
                        className={`flex-1 min-w-[80px] px-3 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5
              ${selectedAgent === agent.id
                                ? 'bg-white shadow-sm text-slate-900'
                                : 'text-slate-500 hover:bg-white/50'}`}
                    >
                        <span>{agent.icon}</span>
                        <span className="hidden sm:inline truncate">{agent.name.split(' ')[0]}</span>
                    </button>
                ))}
            </div>

            {/* Agent Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{currentAgentInfo.icon}</span>
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm">{currentAgentInfo.name}</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{currentAgentInfo.role}</p>
                    </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${currentConfig.enabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {currentConfig.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={currentConfig.enabled}
                            onChange={e => updateConfig({ enabled: e.target.checked })}
                            className="sr-only"
                        />
                        <div className={`w-10 h-5 rounded-full transition-colors ${currentConfig.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${currentConfig.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </div>
                    </div>
                </label>
            </div>

            {/* Model Parameters Section */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                    onClick={() => toggleSection('model')}
                    className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between hover:bg-slate-100 transition-colors"
                >
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                        <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-[10px]">⚙️</span>
                        Model Parameters
                    </span>
                    <span className={`transition-transform ${expandedSection === 'model' ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {expandedSection === 'model' && (
                    <div className="p-4 space-y-5">
                        {/* Temperature */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Temperature</label>
                                <span className="text-xs font-mono font-bold text-orange-600">{currentConfig.temperature.toFixed(2)}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.05"
                                value={currentConfig.temperature}
                                onChange={e => updateConfig({ temperature: parseFloat(e.target.value) })}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                                <span>Precise</span>
                                <span>Creative</span>
                            </div>
                        </div>

                        {/* Top K */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Top K</label>
                                <span className="text-xs font-mono font-bold text-orange-600">{currentConfig.topK}</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                step="1"
                                value={currentConfig.topK}
                                onChange={e => updateConfig({ topK: parseInt(e.target.value) })}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                                <span>Focused</span>
                                <span>Diverse</span>
                            </div>
                        </div>

                        {/* Top P */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Top P (Nucleus)</label>
                                <span className="text-xs font-mono font-bold text-orange-600">{currentConfig.topP.toFixed(2)}</span>
                            </div>
                            <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.05"
                                value={currentConfig.topP}
                                onChange={e => updateConfig({ topP: parseFloat(e.target.value) })}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                        </div>

                        {/* Max Tokens */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Max Output Tokens</label>
                                <span className="text-xs font-mono font-bold text-orange-600">{currentConfig.maxOutputTokens.toLocaleString()}</span>
                            </div>
                            <input
                                type="range"
                                min="256"
                                max="8192"
                                step="256"
                                value={currentConfig.maxOutputTokens}
                                onChange={e => updateConfig({ maxOutputTokens: parseInt(e.target.value) })}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                                <span>Short</span>
                                <span>Long</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tone & Style Section */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                    onClick={() => toggleSection('tone')}
                    className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between hover:bg-slate-100 transition-colors"
                >
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                        <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded flex items-center justify-center text-[10px]">🎨</span>
                        Tone & Style
                    </span>
                    <span className={`transition-transform ${expandedSection === 'tone' ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {expandedSection === 'tone' && (
                    <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {TONE_OPTIONS.map(tone => (
                                <button
                                    key={tone.value}
                                    onClick={() => updateConfig({ toneModifier: tone.value })}
                                    className={`p-3 rounded-xl border-2 text-left transition-all
                    ${currentConfig.toneModifier === tone.value
                                            ? 'border-orange-500 bg-orange-50'
                                            : 'border-slate-200 hover:border-slate-300'}`}
                                >
                                    <span className="text-xs font-bold block">{tone.label}</span>
                                    <span className="text-[9px] text-slate-400">{tone.desc}</span>
                                </button>
                            ))}
                        </div>

                        {currentConfig.toneModifier === 'custom' && (
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                                    Custom Tone Instructions
                                </label>
                                <textarea
                                    value={currentConfig.customToneInstruction}
                                    onChange={e => updateConfig({ customToneInstruction: e.target.value })}
                                    placeholder="e.g., Write in a reassuring tone suitable for anxious patients..."
                                    className="w-full h-20 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Custom Prompt Section */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                    onClick={() => toggleSection('prompt')}
                    className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between hover:bg-slate-100 transition-colors"
                >
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                        <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center text-[10px]">📝</span>
                        Custom System Prompt
                        {currentConfig.customSystemPrompt && (
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[8px] font-black">ACTIVE</span>
                        )}
                    </span>
                    <span className={`transition-transform ${expandedSection === 'prompt' ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {expandedSection === 'prompt' && (
                    <div className="p-4">
                        <p className="text-[10px] text-slate-500 mb-3">
                            Override the default system prompt. Leave empty to use the built-in agent prompt.
                        </p>
                        <textarea
                            value={currentConfig.customSystemPrompt}
                            onChange={e => updateConfig({ customSystemPrompt: e.target.value })}
                            placeholder={`Default prompt for ${currentAgentInfo.name}:\n${currentAgentInfo.description}`}
                            className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono resize-none focus:outline-none focus:border-orange-500 transition-colors"
                        />
                    </div>
                )}
            </div>

            {/* Priority Mode */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Priority</span>
                <div className="flex-1 flex gap-2">
                    {PRIORITY_OPTIONS.map(priority => (
                        <button
                            key={priority.value}
                            onClick={() => updateConfig({ priority: priority.value })}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all
                ${currentConfig.priority === priority.value
                                    ? 'bg-slate-900 text-white shadow-lg'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
                        >
                            <span>{priority.icon}</span>
                            <span>{priority.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Reset Button */}
            <button
                onClick={() => onResetAgent(selectedAgent)}
                className="w-full py-3 text-slate-500 text-xs font-bold hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset {currentAgentInfo.name} to Defaults
            </button>
        </div>
    );
};

export default AgentSettingsTab;
