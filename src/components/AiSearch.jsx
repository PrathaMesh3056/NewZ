import React, { useState, useRef } from 'react';
import { toast } from './Toaster';

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const LoadingSpinner = () => (
    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const UpdateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1">
        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
    </svg>
);


const SourceArticle = ({ source }) => (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg ring-1 ring-gray-200 dark:ring-gray-700/50 transition-all duration-300 hover:ring-red-500/70 hover:shadow-md">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate">{source.title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{source.content}</p>
        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-red-600 hover:underline mt-2 inline-block group">
            Read Source <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </a>
    </div>
);

const AiSearch = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const controllerRef = useRef(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;

        setIsLoading(true);
        setResult(null);
        setError(null);

        if (controllerRef.current) {
            controllerRef.current.abort();
        }
        const controller = new AbortController();
        controllerRef.current = controller;

        try {
            const response = await fetch('/api/rag-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
                signal: controller.signal,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'The search failed. Please try again.');
            }

            const data = await response.json();
            setResult(data);

        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error("RAG search error:", err);
                setError(err.message);
                toast.error(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleIndexTrigger = async () => {
        toast("Indexing started. This may take a minute. Please wait before searching.");
        try {
            const response = await fetch('/api/trigger-indexing', { method: 'POST' });
            if (!response.ok) throw new Error("Failed to start indexing.");
            const data = await response.json();
            
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-800 dark:text-gray-200 pt-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-400">
                        AI-Powered News Search
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                        Ask a question and get answers based on the latest news articles.
                    </p>
                    <button 
                        onClick={handleIndexTrigger}
                        className="mt-6 text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300"
                    >
                        <UpdateIcon />
                        Update the article index
                    </button>
                </div>

                <form onSubmit={handleSearch} className="relative mb-10">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., What are the latest developments in AI regulation?"
                        className="w-full pl-6 pr-20 py-4 border-transparent rounded-full bg-white/70 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-shadow duration-300 shadow-lg"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="absolute top-1/2 right-2.5 -translate-y-1/2 flex items-center justify-center h-12 w-12 text-white bg-gradient-to-br from-red-500 to-red-600 rounded-full focus:outline-none focus:ring-4 focus:ring-red-500/50 transform transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {isLoading ? <LoadingSpinner /> : <SearchIcon />}
                    </button>
                </form>
                
                <div className="space-y-8">
                    {error && (
                        <div className="p-4 text-center text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700/60 rounded-xl">
                            <p>⚠️ {error}</p>
                        </div>
                    )}

                    {result && (
                        <div className="bg-white/50 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/50 dark:border-gray-700/50 p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">AI Answer</h2>
                            <div className="prose prose-lg prose-gray dark:prose-invert max-w-none leading-relaxed">
                                <p>{result.answer}</p>
                            </div>

                            {result.sources && result.sources.length > 0 && (
                                <>
                                    <hr className="my-6 border-gray-200 dark:border-gray-700/50" />
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Sources</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {result.sources.map((source, index) => (
                                            <SourceArticle key={index} source={source} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AiSearch;