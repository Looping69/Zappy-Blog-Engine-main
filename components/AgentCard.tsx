
import React from 'react';
import { Agent, AgentId } from '../types';

interface AgentCardProps {
  agent: Agent;
  isActive: boolean;
  isCompleted: boolean;
  isWaiting: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, isActive, isCompleted, isWaiting }) => {
  return (
    <div className={`
      relative py-1 px-1.5 rounded-lg border transition-all duration-300
      ${isActive ? 'bg-white border-orange-500 shadow-sm translate-x-1' : 'border-transparent'}
      ${isCompleted ? 'bg-orange-50/50' : ''}
      ${isWaiting ? 'opacity-40 grayscale' : ''}
    `}>
      <div className="flex items-center gap-2">
        <div className={`
          w-5 h-5 rounded flex items-center justify-center text-[10px] shrink-0
          ${isActive ? 'bg-orange-500 text-white shadow-sm shadow-orange-100 animate-pulse' : 'bg-slate-50'}
          ${isCompleted ? 'bg-orange-100 text-orange-600' : ''}
        `}>
          {isCompleted ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          ) : agent.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-[9.5px] font-bold truncate ${isActive ? 'text-orange-600' : 'text-slate-700'}`}>
            {agent.name}
          </h3>
          <p className="text-[7px] text-slate-400 font-bold uppercase tracking-tight leading-none">{agent.role}</p>
        </div>
      </div>

      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 px-1.5">
          <div className="h-[1px] w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 w-1/3 animate-[shimmer_1.5s_infinite]"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentCard;
