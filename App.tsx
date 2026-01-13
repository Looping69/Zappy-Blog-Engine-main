
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  BlogState,
  AgentId,
  AGENTS,
  AgentResponse,
  AgentConfigs,
  getDefaultAgentConfigs,
  ContentConfig,
  DEFAULT_CONTENT_CONFIG,
  BlogHistoryItem
} from './types';
import { geminiService } from './services/geminiService';
import {
  publishToSanity,
  publishToAirtable,
  publishToWordPress,
  publishToShopify,
  saveToNeonBackend
} from './services/integrationService';
import AgentCard from './components/AgentCard';
import MarkdownRenderer from './components/MarkdownRenderer';
import SettingsModal from './components/SettingsModal';
import BlogHistory from './components/BlogHistory';
import { searchService } from './services/searchService';
import { imageService } from './services/imageService';
import { audioService } from './services/audioService';
import PAADiscovery from './components/PAADiscovery.tsx';
import SEOAnalysisWidget from './components/SEOAnalysisWidget.tsx';

const App: React.FC = () => {
  const [state, setState] = useState<BlogState>({
    keyword: '',
    activeAgents: [],
    history: [],
    finalPost: null,
    isGenerating: false,
    error: null,
    totalTokens: 0
  });

  // Settings State with Persistence
  const [agentConfigs, setAgentConfigs] = useState<AgentConfigs>(() => {
    const saved = localStorage.getItem('zappy_agent_configs');
    return saved ? JSON.parse(saved) : getDefaultAgentConfigs();
  });

  const [contentConfig, setContentConfig] = useState<ContentConfig>(() => {
    const saved = localStorage.getItem('zappy_content_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONTENT_CONFIG;
  });

  const [blogHistory, setBlogHistory] = useState<BlogHistoryItem[]>(() => {
    const saved = localStorage.getItem('zappy_blog_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPAAOpen, setIsPAAOpen] = useState(false);
  const [serpData, setSerpData] = useState<any>(null);
  const [isSearchingPAA, setIsSearchingPAA] = useState(false);
  const [podcastUrl, setPodcastUrl] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.history, state.activeAgents]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('zappy_agent_configs', JSON.stringify(agentConfigs));
  }, [agentConfigs]);

  useEffect(() => {
    localStorage.setItem('zappy_content_config', JSON.stringify(contentConfig));
  }, [contentConfig]);

  useEffect(() => {
    localStorage.setItem('zappy_blog_history', JSON.stringify(blogHistory));
  }, [blogHistory]);

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const runOrchestrator = async (keyword: string) => {
    if (!keyword.trim()) return;

    setState(prev => ({
      ...prev,
      keyword,
      isGenerating: true,
      error: null,
      history: [],
      finalPost: null,
      activeAgents: [],
      totalTokens: 0
    }));

    let currentContext = "";

    try {
      // 0. Search Intelligence (Real-time SERP Data)
      setNotification({ message: 'Fetching SERP Intelligence...', type: 'success' });
      const serpIntelligence = await searchService.getFullIntelligence(keyword);
      setSerpData({ questions: serpIntelligence.paa, keywordMetrics: serpIntelligence.metrics });

      const searchContext = `
[REAL-TIME SEARCH INTELLIGENCE]
ORGANIC COMPETITORS:
${serpIntelligence.organic}

PEOPLE ALSO ASK:
${serpIntelligence.paa.map(q => `- ${q.question}`).join('\n')}
      `;

      // 1. Researcher
      setState(prev => ({ ...prev, activeAgents: [AgentId.RESEARCHER] }));
      const research = await geminiService.runAgentTask(AgentId.RESEARCHER, keyword, searchContext, agentConfigs[AgentId.RESEARCHER]);
      const researchResponse: AgentResponse = {
        agentId: AgentId.RESEARCHER,
        content: research.content,
        timestamp: Date.now(),
        usage: research.usage
      };
      currentContext += `\n\n[RESEARCH REPORT]\n${research.content}`;
      setState(prev => ({
        ...prev,
        history: [researchResponse],
        totalTokens: prev.totalTokens + research.usage.totalTokens
      }));

      // 2. Writer
      setState(prev => ({ ...prev, activeAgents: [AgentId.WRITER] }));
      const draft = await geminiService.runAgentTask(AgentId.WRITER, keyword, currentContext, agentConfigs[AgentId.WRITER], contentConfig);
      const draftResponse: AgentResponse = {
        agentId: AgentId.WRITER,
        content: draft.content,
        timestamp: Date.now(),
        usage: draft.usage
      };
      currentContext += `\n\n[INITIAL DRAFT]\n${draft.content}`;
      setState(prev => ({
        ...prev,
        history: [researchResponse, draftResponse],
        totalTokens: prev.totalTokens + draft.usage.totalTokens
      }));

      // 3. Parallel Agents (Compliance, Enhancer, SEO)
      setState(prev => ({ ...prev, activeAgents: [AgentId.COMPLIANCE, AgentId.ENHANCER, AgentId.SEO] }));
      const parallelTask = async (id: AgentId) => {
        const result = await geminiService.runAgentTask(id, keyword, currentContext, agentConfigs[id]);
        return {
          agentId: id,
          content: result.content,
          timestamp: Date.now(),
          usage: result.usage
        };
      };

      const parallelResults = await Promise.all([
        parallelTask(AgentId.COMPLIANCE),
        parallelTask(AgentId.ENHANCER),
        parallelTask(AgentId.SEO)
      ]);

      const parallelTokens = parallelResults.reduce((acc, curr) => acc + (curr.usage?.totalTokens || 0), 0);
      const updatedHistory = [researchResponse, draftResponse, ...parallelResults];

      setState(prev => ({
        ...prev,
        history: updatedHistory,
        totalTokens: prev.totalTokens + parallelTokens
      }));

      parallelResults.forEach(res => {
        const agentName = AGENTS.find(a => a.id === res.agentId)?.name || res.agentId;
        currentContext += `\n\n[FEEDBACK FROM ${agentName.toUpperCase()}]\n${res.content}`;
      });

      // 4. Editor
      setState(prev => ({ ...prev, activeAgents: [AgentId.EDITOR] }));
      const final = await geminiService.runAgentTask(AgentId.EDITOR, keyword, currentContext, agentConfigs[AgentId.EDITOR]);
      const finalResponse: AgentResponse = {
        agentId: AgentId.EDITOR,
        content: final.content,
        timestamp: Date.now(),
        usage: final.usage
      };

      // 5. Post-Processing (Images & Audio)
      if (contentConfig.generateImages) {
        setNotification({ message: 'Generating Nano Banana Visuals...', type: 'success' });
        const imagePrompt = `Conceptual medical illustration for ${keyword}: ${final.content.substring(0, 100)}`;
        const imageUrl = await imageService.generateImage(imagePrompt);
        final.content = `![Header Image](${imageUrl})\n\n${final.content}`;
      }

      if (contentConfig.podCastEnabled) {
        setNotification({ message: 'Synthesizing Podcast...', type: 'success' });
        const audioUrl = await audioService.generatePodcast(final.content);
        setPodcastUrl(audioUrl);
      }

      setState(prev => ({
        ...prev,
        history: [...updatedHistory, finalResponse],
        finalPost: final.content,
        totalTokens: prev.totalTokens + final.usage.totalTokens
      }));

      // Save to blog history
      // ... same logic
      const title = final.content.match(/^# (.*$)/m)?.[1] || `Blog: ${keyword}`;
      const newHistoryItem: BlogHistoryItem = {
        id: Date.now().toString(),
        keyword,
        title,
        content: final.content,
        createdAt: Date.now(),
        tokenCount: state.totalTokens + final.usage.totalTokens,
        blogStructure: contentConfig.blogStructure
      };
      setBlogHistory(prev => [newHistoryItem, ...prev]);

      // Persistent Secret Backend Save
      saveToNeonBackend(keyword, title, final.content, state.totalTokens + final.usage.totalTokens)
        .catch(err => console.error('Silent Backend Save Failed:', err));

    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message || "System failure." }));
    } finally {
      setState(prev => ({ ...prev, isGenerating: false, activeAgents: [] }));
    }
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const keyword = formData.get('keyword') as string;
    runOrchestrator(keyword);
  };

  const reset = () => {
    setState({ keyword: '', activeAgents: [], history: [], finalPost: null, isGenerating: false, error: null, totalTokens: 0 });
    setPodcastUrl(null);
  };

  const extractTitle = (content: string) => {
    const match = content.match(/^# (.*$)/m);
    return match ? match[1] : 'Zappy Medical Post';
  };

  const handlePAASearch = async (keyword: string) => {
    if (!keyword.trim()) return;
    setIsSearchingPAA(true);
    setIsPAAOpen(true);
    try {
      const data = await searchService.getPAAAndMetrics(keyword);
      setSerpData(data);
    } catch (err) {
      setNotification({ message: 'Search failed', type: 'error' });
    } finally {
      setIsSearchingPAA(false);
    }
  };

  const handleBulkGeneration = async (keywords: string[]) => {
    setNotification({ message: `Starting bulk queue for ${keywords.length} topics`, type: 'success' });
    for (const kw of keywords) {
      await runOrchestrator(kw);
      // Optional: Add a small delay between jobs
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    setNotification({ message: 'Bulk generation complete!', type: 'success' });
  };

  const handlePublish = async (type: 'sanity' | 'airtable' | 'wordpress' | 'shopify') => {
    if (!state.finalPost) return;
    const title = extractTitle(state.finalPost);

    try {
      if (type === 'sanity') {
        await publishToSanity(title, state.finalPost);
      } else if (type === 'airtable') {
        await publishToAirtable(title, state.finalPost);
      } else if (type === 'wordpress') {
        await publishToWordPress(title, state.finalPost);
      } else if (type === 'shopify') {
        await publishToShopify(title, state.finalPost);
      }
      setNotification({ message: `Successfully published to ${type.charAt(0).toUpperCase() + type.slice(1)}!`, type: 'success' });
    } catch (err: any) {
      setNotification({ message: err.message || 'Publish failed', type: 'error' });
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#FDFCFB] overflow-hidden relative">
      {/* Notifications */}
      {notification && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-[slideInTop_0.3s_ease-out]
          ${notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          <span className="text-xl">{notification.type === 'success' ? '✅' : '⚠️'}</span>
          <span className="font-bold text-sm">{notification.message}</span>
        </div>
      )}

      {/* Sidebar Dashboard */}
      <aside className="w-80 flex-shrink-0 border-r border-slate-100 bg-white flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 pb-2 flex items-center gap-3 cursor-pointer group" onClick={reset}>
          <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-100 transition-transform group-hover:scale-105">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-none">Zappy</h1>
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Blog Engine</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div>
            <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Feature Matrix</h3>
            <div className="px-4 space-y-3">
              {/* AKA Framework */}
              <button
                onClick={() => setContentConfig(prev => ({ ...prev, akaFrameworkEnabled: !prev.akaFrameworkEnabled }))}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${contentConfig.akaFrameworkEnabled ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'}`}
              >
                <div className="flex items-center gap-2 text-left">
                  <span className="text-sm">🎖️</span>
                  <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase">AKA Framework</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Authority</p>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${contentConfig.akaFrameworkEnabled ? 'bg-orange-500' : 'bg-slate-200'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${contentConfig.akaFrameworkEnabled ? 'translate-x-4' : ''}`} />
                </div>
              </button>

              {/* Local SEO */}
              <div className={`rounded-2xl border transition-all ${contentConfig.localSEO.enabled ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100'}`}>
                <button
                  onClick={() => setContentConfig(prev => ({ ...prev, localSEO: { ...prev.localSEO, enabled: !prev.localSEO.enabled } }))}
                  className="w-full flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-2 text-left">
                    <span className="text-sm">📍</span>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 uppercase">Local SEO</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Geo-Target</p>
                    </div>
                  </div>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${contentConfig.localSEO.enabled ? 'bg-orange-500' : 'bg-slate-200'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${contentConfig.localSEO.enabled ? 'translate-x-4' : ''}`} />
                  </div>
                </button>
                {contentConfig.localSEO.enabled && (
                  <div className="px-3 pb-3 space-y-2">
                    <input
                      type="text"
                      value={contentConfig.localSEO.service}
                      onChange={e => setContentConfig(prev => ({ ...prev, localSEO: { ...prev.localSEO, service: e.target.value } }))}
                      placeholder="Service (e.g. Dental)"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px]"
                    />
                    <input
                      type="text"
                      value={contentConfig.localSEO.city}
                      onChange={e => setContentConfig(prev => ({ ...prev, localSEO: { ...prev.localSEO, city: e.target.value } }))}
                      placeholder="City (e.g. Austin)"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px]"
                    />
                  </div>
                )}
              </div>

              {/* Advanced Controls */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setContentConfig(prev => ({ ...prev, generateImages: !prev.generateImages }))}
                  className={`flex flex-col items-center p-2 rounded-xl border transition-all ${contentConfig.generateImages ? 'bg-orange-100 border-orange-300' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                >
                  <span className="text-[14px]">🍌</span>
                  <span className="text-[7.5px] font-black uppercase mt-1 leading-none">Images</span>
                </button>
                <button
                  onClick={() => setContentConfig(prev => ({ ...prev, podCastEnabled: !prev.podCastEnabled }))}
                  className={`flex flex-col items-center p-2 rounded-xl border transition-all ${contentConfig.podCastEnabled ? 'bg-orange-100 border-orange-300' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                >
                  <span className="text-[14px]">🎙️</span>
                  <span className="text-[7.5px] font-black uppercase mt-1 leading-none">Audio</span>
                </button>
                <button
                  onClick={() => setContentConfig(prev => ({ ...prev, autoPost: !prev.autoPost }))}
                  className={`flex flex-col items-center p-2 rounded-xl border transition-all ${contentConfig.autoPost ? 'bg-orange-100 border-orange-300' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                >
                  <span className="text-[14px]">📮</span>
                  <span className="text-[7.5px] font-black uppercase mt-1 leading-none">Auto</span>
                </button>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-50 mx-4 my-2" />

          <div>
            <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Neural Pipeline</h3>
            <div className="space-y-0.5">
              {AGENTS.map(agent => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isActive={state.activeAgents.includes(agent.id)}
                  isCompleted={state.history.some(h => h.agentId === agent.id)}
                  isWaiting={!state.activeAgents.includes(agent.id) && !state.history.some(h => h.agentId === agent.id)}
                />
              ))}
            </div>
          </div>

          {(state.isGenerating || state.finalPost) && (
            <div className="space-y-4">
              <div className="px-4 py-6 rounded-3xl bg-orange-50/50 border border-orange-100">
                <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-3">Generation Stats</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-bold text-orange-600">{Math.round((state.history.length / AGENTS.length) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-orange-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${(state.history.length / AGENTS.length) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-orange-100/50 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-xs text-orange-600 font-black">
                      TOK
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Total Tokens</p>
                      <p className="text-sm font-bold text-slate-900 font-mono">
                        {state.totalTokens.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {(state.activeAgents.includes(AgentId.SEO) || state.history.find(h => h.agentId === AgentId.SEO)) && (
                <div className="px-1">
                  <SEOAnalysisWidget
                    analysis={(() => {
                      const seoContent = state.history.find(h => h.agentId === AgentId.SEO)?.content;
                      if (!seoContent) return undefined;
                      try {
                        const jsonMatch = seoContent.match(/\{[\s\S]*\}/);
                        return jsonMatch ? JSON.parse(jsonMatch[0]) : undefined;
                      } catch (e) {
                        console.error("Failed to parse SEO JSON:", e);
                        return { score: 0, optimizationTips: ["Analysis unavailable"], suggestedKeywords: [] };
                      }
                    })()}
                    isGenerating={state.activeAgents.includes(AgentId.SEO)}
                  />
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-50 flex flex-col gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center text-[10px]">⚡</div>
            <div className="flex-1">
              <p className="text-[9px] font-bold text-slate-900">High-Speed Engine</p>
              <p className="text-[8px] text-slate-400 font-medium tracking-tight">Parallel Consensus v2.4</p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group"
          >
            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-slate-900 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div className="flex-1 text-left">
              <p className="text-[9px] font-bold text-slate-900">Settings</p>
              <p className="text-[8px] text-slate-400 font-medium tracking-tight">Config</p>
            </div>
          </button>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:text-emerald-700 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="flex-1 text-left">
              <p className="text-[9px] font-bold text-slate-900">History</p>
              <p className="text-[8px] text-slate-400 font-medium tracking-tight">{blogHistory.length} articles</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        {/* Top Header Navigation */}
        <header className="sticky top-0 z-40 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-12">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400">Project /</span>
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
              {state.keyword || 'Medical Content Hub'}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={reset} className="text-xs font-bold text-slate-500 hover:text-orange-500 transition-colors">History</button>
            <button onClick={reset} className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-slate-200">New Post</button>
          </div>
        </header>

        <div className="flex-1 p-12 max-w-5xl mx-auto w-full">
          {!state.isGenerating && !state.finalPost ? (
            <div className="mt-20 text-center animate-[fadeIn_0.5s_ease-out]">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                6 Specialized Medical Agents
              </div>
              <h2 className="text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tighter">
                Generate expert blogs with <br />
                <span className="text-orange-500 italic">Zappy precision.</span>
              </h2>
              <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                Enter your medical topic and watch our neural pipeline collaborate across research, accuracy, and optimization in real-time.
              </p>

              <form onSubmit={handleStart} className="max-w-2xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-white border-2 border-slate-100 rounded-2xl flex items-center p-2 shadow-xl">
                  <input
                    type="text"
                    name="keyword"
                    placeholder="e.g. Cognitive effects of intermittent fasting..."
                    required
                    className="flex-1 pl-6 pr-4 py-4 outline-none text-lg font-medium placeholder:text-slate-300"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-black transition-all flex items-center gap-2 shadow-lg shadow-orange-200 uppercase tracking-wider text-xs active:scale-95"
                    >
                      Launch
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7" /></svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePAASearch((document.getElementsByName('keyword')[0] as HTMLInputElement).value)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-6 py-4 rounded-xl font-black transition-all flex items-center gap-2 uppercase tracking-wider text-xs active:scale-95 border border-slate-200"
                    >
                      {isSearchingPAA ? 'Searching...' : 'PAA Discover'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="pb-32">
              {state.isGenerating && !state.finalPost ? (
                <div className="space-y-8">
                  <div className="bg-orange-500 p-12 rounded-[40px] text-white shadow-2xl shadow-orange-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12 scale-150">
                      <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-black mb-2">Processing: {state.keyword}</h2>
                      <p className="text-orange-100 text-sm font-bold uppercase tracking-widest">Parallel Neural Synthesis in Progress</p>
                      <div className="mt-8 flex gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className={`h-1.5 w-full rounded-full ${i < state.history.length ? 'bg-white' : 'bg-white/20 animate-pulse'}`}></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {state.history.map((item, idx) => {
                    const agent = AGENTS.find(a => a.id === item.agentId);
                    return (
                      <div key={idx} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden animate-[slideIn_0.4s_ease-out] group hover:border-orange-200 transition-colors">
                        <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{agent?.icon}</span>
                            <div>
                              <span className="font-black text-slate-900 block text-[10px] uppercase tracking-widest">{agent?.name}</span>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">{agent?.role}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {item.usage && (
                              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-slate-100 shadow-sm">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tokens</span>
                                <span className="text-[10px] font-bold text-slate-600 font-mono">{item.usage.totalTokens.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="h-6 w-px bg-slate-200"></div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase">Neural_Log v{idx + 1}.0</span>
                          </div>
                        </div>
                        <div className="p-8">
                          <div className="text-slate-600 whitespace-pre-wrap text-sm max-h-[300px] overflow-y-auto font-mono bg-slate-50 p-6 rounded-2xl border border-slate-100 custom-scrollbar leading-relaxed">
                            {item.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </div>
              ) : state.finalPost && (
                <div className="bg-white p-12 md:p-20 rounded-[52px] shadow-[0_32px_80px_rgba(0,0,0,0.06)] border border-slate-100 animate-[fadeIn_0.8s_ease-out] relative">
                  <div className="mb-12 flex items-center justify-between">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-orange-50 text-orange-700 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-orange-100">
                      <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse shadow-sm"></span>
                      Clinical Grade Publication
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handlePublish('wordpress')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-500 hover:text-white transition-colors text-xs font-bold border border-blue-100"
                      >
                        WP
                      </button>
                      <button
                        onClick={() => handlePublish('shopify')}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-500 hover:text-white transition-colors text-xs font-bold border border-emerald-100"
                      >
                        Shopify
                      </button>
                      <button
                        onClick={() => handlePublish('sanity')}
                        className="flex items-center gap-2 px-4 py-2 bg-[#F03E2F]/10 text-[#F03E2F] rounded-xl hover:bg-[#F03E2F] hover:text-white transition-colors text-xs font-bold"
                      >
                        Sanity
                      </button>
                      <button
                        onClick={() => handlePublish('airtable')}
                        className="flex items-center gap-2 px-4 py-2 bg-[#FCB400]/10 text-[#e6a200] rounded-xl hover:bg-[#FCB400] hover:text-white transition-colors text-xs font-bold"
                      >
                        Airtable
                      </button>
                    </div>
                  </div>

                  {podcastUrl && (
                    <div className="mb-12 p-6 bg-slate-50 rounded-3xl border border-slate-200 flex items-center gap-6">
                      <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-xl animate-pulse">🎙️</div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">AI Podcast Version</p>
                        <audio controls src={podcastUrl} className="w-full h-8" />
                      </div>
                    </div>
                  )}

                  <div className="max-w-4xl mx-auto mb-12">
                    <MarkdownRenderer content={state.finalPost} />
                  </div>

                  <div className="mt-24 pt-12 border-t border-slate-100 flex flex-col md:flex-row gap-10 items-center justify-between no-print">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl">🎖️</div>
                      <div>
                        <p className="text-base font-black text-slate-900 leading-tight">Zappy Authority Suite</p>
                        <p className="text-xs text-slate-400 font-medium">Verified by 6 Medical Agents • {state.totalTokens > 0 && `${state.totalTokens.toLocaleString()} tokens`}</p>
                      </div>
                    </div>
                    <button
                      onClick={reset}
                      className="bg-slate-900 hover:bg-orange-500 text-white px-12 py-5 rounded-2xl font-black transition-all shadow-xl hover:-translate-y-1 uppercase tracking-widest text-xs"
                    >
                      New Content Mission
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        savedAgentConfigs={agentConfigs}
        savedContentConfig={contentConfig}
        onSave={(newAgentConfigs, newContentConfig) => {
          setAgentConfigs(newAgentConfigs);
          setContentConfig(newContentConfig);
          setNotification({ message: 'Settings saved successfully', type: 'success' });
          setIsSettingsOpen(false);
        }}
      />

      <PAADiscovery
        isOpen={isPAAOpen}
        onClose={() => setIsPAAOpen(false)}
        data={serpData}
        isLoading={isSearchingPAA}
        onLaunchBulk={handleBulkGeneration}
      />

      {isHistoryOpen && (
        <BlogHistory
          history={blogHistory}
          onSelectBlog={(blog) => {
            setState(prev => ({
              ...prev,
              keyword: blog.keyword,
              finalPost: blog.content,
              history: [],
              error: null
            }));
            setIsHistoryOpen(false);
            setNotification({ message: `Loaded "${blog.title}"`, type: 'success' });
          }}
          onDeleteBlog={(id) => {
            setBlogHistory(prev => prev.filter(b => b.id !== id));
            setNotification({ message: 'Article deleted', type: 'success' });
          }}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes slideIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInTop { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>
    </div>
  );
};

export default App;
