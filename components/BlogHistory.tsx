
import React, { useState } from 'react';
import { BlogHistoryItem } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface BlogHistoryProps {
    history: BlogHistoryItem[];
    onSelectBlog: (blog: BlogHistoryItem) => void;
    onDeleteBlog: (id: string) => void;
    onClose: () => void;
}

const BlogHistory: React.FC<BlogHistoryProps> = ({
    history,
    onSelectBlog,
    onDeleteBlog,
    onClose
}) => {
    const [previewBlog, setPreviewBlog] = useState<BlogHistoryItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredHistory = history.filter(blog =>
        blog.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (timestamp: number) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(timestamp));
    };

    if (previewBlog) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPreviewBlog(null)}></div>
                <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{previewBlog.title}</h2>
                            <p className="text-xs text-slate-500 mt-1">
                                {previewBlog.keyword} • {formatDate(previewBlog.createdAt)} • {previewBlog.tokenCount.toLocaleString()} tokens
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    onSelectBlog(previewBlog);
                                    setPreviewBlog(null);
                                }}
                                className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors"
                            >
                                Load to Editor
                            </button>
                            <button
                                onClick={() => setPreviewBlog(null)}
                                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8">
                        <MarkdownRenderer content={previewBlog.content} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Blog History</h2>
                            <p className="text-xs text-slate-500 mt-1">{history.length} articles generated</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                        >
                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by keyword or title..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    />
                </div>

                {/* Blog List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {filteredHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">
                                {searchTerm ? 'No matching articles found' : 'No articles generated yet'}
                            </p>
                            <p className="text-slate-400 text-xs mt-1">
                                {searchTerm ? 'Try a different search term' : 'Generated blogs will appear here'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredHistory.map(blog => (
                                <div
                                    key={blog.id}
                                    className="bg-slate-50 rounded-2xl p-5 hover:bg-slate-100 transition-colors cursor-pointer group"
                                    onClick={() => setPreviewBlog(blog)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-900 truncate mb-1">{blog.title}</h3>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                                                    {blog.keyword}
                                                </span>
                                                <span>{formatDate(blog.createdAt)}</span>
                                                <span>•</span>
                                                <span>{blog.tokenCount.toLocaleString()} tokens</span>
                                                <span>•</span>
                                                <span className="capitalize">{blog.blogStructure.replace(/-/g, ' ')}</span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                                                {blog.content.slice(0, 200).replace(/[#*\n]/g, ' ')}...
                                            </p>
                                        </div>
                                        <button
                                            onClick={e => {
                                                e.stopPropagation();
                                                if (confirm('Delete this article? This cannot be undone.')) {
                                                    onDeleteBlog(blog.id);
                                                }
                                            }}
                                            className="ml-4 w-8 h-8 rounded-lg bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                                        >
                                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlogHistory;
