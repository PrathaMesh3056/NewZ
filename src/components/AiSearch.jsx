import React, { useState, useRef } from 'react';
import { toast } from './Toaster';
import apiClient from '../apiClient';
import { Search, RefreshCw, Loader2, ExternalLink, Sparkles, TrendingUp, Newspaper, Clock, CheckCircle2 } from 'lucide-react';

// --- UI SUB-COMPONENTS (From the new design) ---

const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="group relative p-6 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 hover:border-red-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-4 shadow-lg shadow-red-500/25 group-hover:scale-110 transition-transform duration-300">
                <Icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
        </div>
    </div>
);

const SourceArticle = ({ source }) => (
    <div className="group relative p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 transition-all duration-300 hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/10">
        <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
                <Newspaper className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-base mb-1 line-clamp-2 group-hover:text-red-600">{source.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">{source.content}</p>
                <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors duration-200"
                >
                    Read Full Article 
                    <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
            </div>
        </div>
    </div>
);

const InitialStatePrompt = () => (
    <div className="space-y-8">
        <div className="text-center p-12 bg-white/50 dark:bg-gray-800/20 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 mb-6 shadow-2xl shadow-red-500/30">
                <Search className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Ready to Search</h3>
            <p className="text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                Enter your query above to get intelligent answers based on the latest news articles.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard icon={TrendingUp} title="Real-Time Data" description="Access the most current news articles and trending topics from trusted sources." />
            <FeatureCard icon={CheckCircle2} title="Verified Sources" description="Every answer is backed by credible sources with direct links for verification." />
            <FeatureCard icon={Clock} title="Instant Results" description="Get comprehensive answers in seconds with our advanced search technology." />
        </div>
    </div>
);

const SearchResultsSkeleton = () => (
    <div className="bg-white/50 dark:bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-10 animate-pulse shadow-xl">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-xl w-1/3 mb-8"></div>
        <div className="space-y-4 mb-8">
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded-lg w-full"></div>
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded-lg w-5/6"></div>
        </div>
        <hr className="my-8 border-gray-200/50 dark:border-gray-700/50" />
        <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded-xl w-1/4 mb-6"></div>
        <div className="space-y-5">
            <div className="h-32 bg-gray-200 dark:bg-gray-700/50 rounded-2xl"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700/50 rounded-2xl"></div>
        </div>
    </div>
);

// --- MAIN COMPONENT ---
const AiSearch = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const controllerRef = useRef(null);

    const handleSearch = async (e, searchQuery = query) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim() || isLoading) return;

        setQuery(searchQuery);
        setIsLoading(true);
        setResult(null);
        setError(null);

        if (controllerRef.current) {
            controllerRef.current.abort();
        }
        const controller = new AbortController();
        controllerRef.current = controller;

        try {
            const response = await apiClient.post('/api/rag-search', { query: searchQuery }, {
                signal: controller.signal,
            });
            setResult(response.data);
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error("RAG search error:", err);
                const errorMessage = err.response?.data?.error || err.message || "An unexpected error occurred.";
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleIndexTrigger = async () => {
        toast("Indexing started. This may take a minute.");
        try {
            await apiClient.post('/api/trigger-indexing');
            toast.success("Article index updated successfully!");
        } catch (err) {
            toast.error(err.message);
        }
    };

    const popularSearches = [
        "Latest AI developments",
        "Climate change news",
        "Technology trends 2025",
        "Global economic outlook",
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-white dark:from-gray-900 dark:via-black dark:to-gray-900 text-gray-800 dark:text-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-red-500 to-red-600 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2"></div>
            </div>

            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-400">
                            Advanced News
                        </span>
                        <br />
                        <span className="text-gray-900 dark:text-gray-100">Search Platform</span>
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Ask questions and receive comprehensive, verified answers sourced from the latest news articles worldwide.
                    </p>
                    <button
                        onClick={handleIndexTrigger}
                        className="group inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors duration-300 mt-4"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Update article database
                    </button>
                </div>

                <form onSubmit={handleSearch} className="relative mb-16">
                    <div className="relative max-w-3xl mx-auto">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                            <Search className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., What are the latest developments in AI regulation?"
                            className="w-full pl-16 pr-24 py-5 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all duration-300 shadow-lg hover:shadow-2xl focus:shadow-red-500/20"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !query.trim()}
                            className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center justify-center h-14 w-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-500/50 transform transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-xl shadow-red-500/30"
                        >
                            {isLoading ? (
                                <Loader2 className="h-6 w-6 text-white animate-spin" />
                            ) : (
                                <Search className="h-6 w-6 text-white" />
                            )}
                        </button>
                    </div>
                </form>

                <div className="space-y-10">
                    {isLoading && <SearchResultsSkeleton />}
                    {error && !isLoading && (
                        <div className="p-6 text-center bg-red-100/50 dark:bg-red-900/20 border-2 border-red-300/50 dark:border-red-700/30 rounded-3xl shadow-lg">
                            <p className="text-base text-red-700 dark:text-red-300 font-semibold">⚠️ {error}</p>
                        </div>
                    )}
                    {!isLoading && !result && !error && (
                        <>
                            <InitialStatePrompt />
                            <div className="bg-white/50 dark:bg-gray-800/20 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-red-500"/>
                                    Or try a popular search:
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    {popularSearches.map((searchTerm, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSearch(null, searchTerm)}
                                            className="px-4 py-2 rounded-full bg-gray-100 hover:bg-red-100 dark:bg-gray-700/50 dark:hover:bg-red-900/50 border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200"
                                        >
                                            {searchTerm}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                    {result && !isLoading && (
                        <div className="bg-white/50 dark:bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-12 shadow-2xl">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-2 h-10 bg-gradient-to-b from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/30" />
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Answer</h2>
                            </div>
                            <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{result.answer}</p>
                            </div>

                            {result.sources && result.sources.length > 0 && (
                                <>
                                    <hr className="my-10 border-gray-200 dark:border-gray-700/50" />
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/30" />
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Verified Sources</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

