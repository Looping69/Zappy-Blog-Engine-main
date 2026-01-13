
import React, { useState, useEffect } from 'react';
import { AgentConfigs, AgentConfig, AgentId, DEFAULT_AGENT_CONFIG, ContentConfig, DEFAULT_CONTENT_CONFIG } from '../types';
import AgentSettingsTab from './AgentSettingsTab';
import ContentSettingsTab from './ContentSettingsTab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedAgentConfigs: AgentConfigs;
  savedContentConfig: ContentConfig;
  onSave: (agents: AgentConfigs, content: ContentConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  savedAgentConfigs,
  savedContentConfig,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'agents' | 'content' | 'integrations'>('agents');
  const [agentConfigs, setAgentConfigs] = useState<AgentConfigs>(savedAgentConfigs);
  const [contentConfig, setContentConfig] = useState<ContentConfig>(savedContentConfig);

  useEffect(() => {
    if (isOpen) {
      setAgentConfigs(savedAgentConfigs);
      setContentConfig(savedContentConfig);
    }
  }, [isOpen, savedAgentConfigs, savedContentConfig]);

  const handleAgentConfigChange = (agentId: AgentId, config: AgentConfig) => {
    setAgentConfigs(prev => ({ ...prev, [agentId]: config }));
  };

  const handleResetAgent = (agentId: AgentId) => {
    setAgentConfigs(prev => ({ ...prev, [agentId]: { ...DEFAULT_AGENT_CONFIG } }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-[fadeIn_0.3s_ease-out] flex flex-col md:flex-row h-[600px]">

        {/* Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-6 flex flex-col">
          <h3 className="text-lg font-black text-slate-900 mb-6">Settings</h3>
          <div className="space-y-2 flex-1">
            <button
              onClick={() => setActiveTab('agents')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3
               ${activeTab === 'agents' ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${activeTab === 'agents' ? 'bg-orange-500 text-white' : 'bg-slate-200'}`}>🤖</div>
              Agent Tuning
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3
               ${activeTab === 'content' ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${activeTab === 'content' ? 'bg-purple-500 text-white' : 'bg-slate-200'}`}>📝</div>
              Blog Structure
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3
               ${activeTab === 'integrations' ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${activeTab === 'integrations' ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>🔌</div>
              Integrations
            </button>
          </div>

          {/* Integration Status */}
          <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2">Integrations</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-[10px] text-emerald-600 font-medium">Sanity CMS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-[10px] text-emerald-600 font-medium">Airtable</span>
              </div>
            </div>
            <p className="text-[9px] text-emerald-500 mt-2">Configured via .env</p>
          </div>

          <button onClick={onClose} className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Close</button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {activeTab === 'agents' ? 'Agent Fine-Tuning' : 'Blog Structure'}
          </h2>
          <p className="text-xs text-slate-500 mb-6 font-medium">
            {activeTab === 'agents'
              ? 'Customize each agent\'s behavior, tone, and parameters.'
              : 'Choose how your blog posts are structured.'}
          </p>

          {activeTab === 'agents' ? (
            <AgentSettingsTab
              agentConfigs={agentConfigs}
              onConfigChange={handleAgentConfigChange}
              onResetAgent={handleResetAgent}
            />
          ) : activeTab === 'content' ? (
            <ContentSettingsTab
              contentConfig={contentConfig}
              onConfigChange={setContentConfig}
            />
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🔌</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">External Services</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Configure where your content is published.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Sanity Project ID</label>
                      <input type="text" placeholder="wtjw9zfb" disabled className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs opacity-50 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Airtable Base ID</label>
                      <input type="text" placeholder="appghuNf3jVHWoOJ6" disabled className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs opacity-50 cursor-not-allowed" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-white border border-slate-200 rounded-xl">
                      <h5 className="text-[10px] font-black text-slate-900 uppercase mb-3 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[8px]">W</span>
                        WordPress REST API
                      </h5>
                      <input type="text" placeholder="https://yourblog.com" className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs mb-2" />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Username" className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs" />
                        <input type="password" placeholder="Application Password" className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs" />
                      </div>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 rounded-xl">
                      <h5 className="text-[10px] font-black text-slate-900 uppercase mb-3 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-[8px]">S</span>
                        Shopify Admin API
                      </h5>
                      <input type="text" placeholder="shop-name.myshopify.com" className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs mb-2" />
                      <input type="password" placeholder="Access Token" className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <h4 className="text-[10px] font-black text-orange-700 uppercase mb-3">API Providers</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white border border-orange-100 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-orange-400 uppercase">Serp Intelligence</p>
                      <p className="text-[10px] font-bold text-slate-900">Core Feature Active</p>
                    </div>
                    <div className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[8px] font-black uppercase">Internal</div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-orange-400 mb-1">Nano Banana Key (Images)</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-white border border-orange-100 rounded-lg px-3 py-2 text-xs" />
                  </div>
                  <div className="mt-2 text-slate-400 text-[10px] font-medium col-span-2">
                    <p className="mb-2 uppercase tracking-wider font-bold">Multi-LLM Powerhouse Keys</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">Anthropic (Claude)</label>
                        <input type="password" placeholder="sk-ant-..." className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">OpenAI (GPT-4o)</label>
                        <input type="password" placeholder="sk-..." className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">Perplexity (Research)</label>
                        <input type="password" placeholder="pplx-..." className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end gap-3">
            <button
              onClick={() => {
                setAgentConfigs(savedAgentConfigs);
                setContentConfig(savedContentConfig);
              }}
              className="px-5 py-2.5 text-slate-500 font-bold text-xs hover:bg-slate-50 rounded-xl transition-colors"
            >
              Reset All
            </button>
            <button
              onClick={() => onSave(agentConfigs, contentConfig)}
              className="px-8 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
