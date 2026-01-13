import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

// Counter for unique keys
let keyCounter = 0;
const getUniqueKey = (prefix: string) => `${prefix}-${keyCounter++}`;

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const parseLine = (line: string, lineIndex: number) => {
    // Handle Bold (**text**) and Italics (*text*)
    let parts: (string | React.ReactNode)[] = [line];

    // Bold
    parts = parts.flatMap((part, partIdx) => {
      if (typeof part !== 'string') return part;
      const subParts = part.split(/(\*\*.*?\*\*)/);
      return subParts.map((sub, subIdx) =>
        sub.startsWith('**') && sub.endsWith('**')
          ? <strong key={getUniqueKey(`b-${lineIndex}-${partIdx}-${subIdx}`)} className="font-bold text-slate-900">{sub.slice(2, -2)}</strong>
          : sub
      );
    });

    // Italics (*text*)
    parts = parts.flatMap((part, partIdx) => {
      if (typeof part !== 'string') return part;
      const subParts = part.split(/(\*.*?\*)/);
      return subParts.map((sub, subIdx) =>
        sub.startsWith('*') && sub.endsWith('*')
          ? <em key={getUniqueKey(`i-${lineIndex}-${partIdx}-${subIdx}`)} className="italic">{sub.slice(1, -1)}</em>
          : sub
      );
    });

    return parts;
  };

  const renderContent = () => {
    // Reset key counter on each render
    keyCounter = 0;

    return content.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={`line-${i}`} className="h-4" />;

      if (trimmed.startsWith('# ')) {
        return <h1 key={`line-${i}`} className="text-4xl md:text-5xl font-extrabold mb-8 text-slate-900 serif leading-tight">{parseLine(trimmed.slice(2), i)}</h1>;
      }
      if (trimmed.startsWith('## ')) {
        return <h2 key={`line-${i}`} className="text-2xl md:text-3xl font-bold mt-12 mb-6 text-slate-800 border-b border-slate-100 pb-3">{parseLine(trimmed.slice(3), i)}</h2>;
      }
      if (trimmed.startsWith('### ')) {
        return <h3 key={`line-${i}`} className="text-xl font-bold mt-8 mb-4 text-slate-700">{parseLine(trimmed.slice(4), i)}</h3>;
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return <li key={`line-${i}`} className="ml-6 mb-3 list-disc text-slate-700 leading-relaxed pl-2">{parseLine(trimmed.slice(2), i)}</li>;
      }
      if (trimmed.match(/^\d+\./)) {
        return <li key={`line-${i}`} className="ml-6 mb-3 list-decimal text-slate-700 leading-relaxed pl-2">{parseLine(trimmed.replace(/^\d+\. /, ''), i)}</li>;
      }
      if (trimmed.startsWith('> ')) {
        return <blockquote key={`line-${i}`} className="border-l-4 border-emerald-500 pl-6 py-2 my-6 italic text-slate-600 bg-emerald-50/30 rounded-r-lg">{parseLine(trimmed.slice(2), i)}</blockquote>;
      }

      const imgMatch = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        return <img key={`line-${i}`} src={imgMatch[2]} alt={imgMatch[1]} className="w-full h-auto rounded-[32px] shadow-2xl my-12 object-cover border-4 border-white ring-1 ring-slate-100" />;
      }

      return <p key={`line-${i}`} className="mb-6 text-slate-700 leading-relaxed text-lg md:text-xl font-normal">{parseLine(line, i)}</p>;
    });
  };

  return (
    <div className="max-w-none">
      {renderContent()}
    </div>
  );
};

export default MarkdownRenderer;