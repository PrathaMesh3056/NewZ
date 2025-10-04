import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Search, RefreshCw, Loader2, ExternalLink, Sparkles, TrendingUp, Newspaper, Clock, CheckCircle2 } from 'lucide-react';

// Mock API client - replace with your actual implementation
const apiClient = {
  post: async (url, data, config) => {
    // This is a placeholder - replace with your actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            answer: "This is a mock response. Please connect your actual API.",
            sources: []
          }
        });
      }, 1000);
    });
  }
};

// --- UI SUB-COMPONENTS ---

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="group relative p-6 bg-surface-elevated rounded-2xl border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-xl hover:shadow-accent/10">
    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--search-gradient-from))] to-[hsl(var(--search-gradient-to))] flex items-center justify-center mb-4 shadow-lg shadow-accent/25 group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);

const SourceArticle = ({ source }) => (
  <div className="group relative p-6 bg-surface-elevated rounded-2xl border border-border transition-all duration-300 hover:border-accent/50 hover:shadow-xl hover:shadow-accent/10">
    <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--surface-highlight))] to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--search-gradient-from))] to-[hsl(var(--search-gradient-to))] flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/20">
          <Newspaper className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-base mb-2 line-clamp-2">{source.title}</h4>
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">{source.content}</p>
      <a 
        href={source.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-hover transition-colors duration-200"
      >
        Read Full Article 
        <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
      </a>
    </div>
  </div>
);

const InitialStatePrompt = () => (
  <div className="space-y-8">
    <div className="text-center p-16 bg-surface-glass backdrop-blur-sm rounded-3xl border border-border/50 shadow-xl">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[hsl(var(--search-gradient-from))] to-[hsl(var(--search-gradient-to))] mb-6 shadow-2xl shadow-accent/30">
        <Search className="h-10 w-10 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-3">Ready to Search</h3>
      <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
        Enter your query above to get intelligent answers based on the latest news articles and verified sources.
      </p>
    </div>

    {/* Feature Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <FeatureCard 
        icon={TrendingUp}
        title="Real-Time Data"
        description="Access the most current news articles and trending topics from trusted sources."
      />
      <FeatureCard 
        icon={CheckCircle2}
        title="Verified Sources"
        description="Every answer is backed by credible sources with direct links for verification."
      />
      <FeatureCard 
        icon={Clock}
        title="Instant Results"
        description="Get comprehensive answers in seconds with our advanced search technology."
      />
    </div>

    {/* Popular Searches */}
    <div className="bg-surface-elevated rounded-3xl border border-border p-8">
      <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-accent" />
        Popular Searches
      </h4>
      <div className="flex flex-wrap gap-3">
        {[
          "Latest AI developments",
          "Climate change news",
          "Technology trends 2025",
          "Global economic outlook",
          "Health and wellness updates",
          "Space exploration"
        ].map((search, idx) => (
          <button
            key={idx}
            className="px-5 py-2.5 rounded-xl bg-muted hover:bg-accent/10 border border-border hover:border-accent/50 text-sm font-medium text-foreground hover:text-accent transition-all duration-300 hover:shadow-lg hover:shadow-accent/10"
          >
            {search}
          </button>
        ))}
      </div>
    </div>
  </div>
);

const SearchResultsSkeleton = () => (
  <div className="bg-surface-glass backdrop-blur-sm rounded-3xl border border-border/50 p-8 md:p-10 animate-pulse shadow-xl">
    <div className="h-8 bg-muted/50 rounded-xl w-1/4 mb-8"></div>
    <div className="space-y-4 mb-8">
      <div className="h-5 bg-muted/50 rounded-lg w-full"></div>
      <div className="h-5 bg-muted/50 rounded-lg w-full"></div>
      <div className="h-5 bg-muted/50 rounded-lg w-5/6"></div>
      <div className="h-5 bg-muted/50 rounded-lg w-4/6"></div>
    </div>
    <hr className="my-8 border-border/50" />
    <div className="h-7 bg-muted/50 rounded-xl w-1/5 mb-6"></div>
    <div className="space-y-5">
      <div className="h-32 bg-muted/30 rounded-2xl"></div>
      <div className="h-32 bg-muted/30 rounded-2xl"></div>
      <div className="h-32 bg-muted/30 rounded-2xl"></div>
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
      const response = await apiClient.post('/api/rag-search', { query }, {
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
    toast("Indexing started. This may take a minute. Please wait before searching.");
    try {
      await apiClient.post('/api/trigger-indexing', {});
      toast.success("Article index updated successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 text-foreground relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[hsl(var(--search-gradient-from))] to-[hsl(var(--search-gradient-to))] rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[hsl(var(--search-gradient-to))] to-[hsl(var(--search-gradient-end))] rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 mb-6 shadow-lg shadow-accent/10">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="text-sm font-semibold text-accent">Intelligent Search Engine</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--search-gradient-from))] via-[hsl(var(--search-gradient-to))] to-[hsl(var(--search-gradient-end))]">
              Advanced News
            </span>
            <br />
            <span className="text-foreground">Search Platform</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ask questions and receive comprehensive, verified answers sourced from the latest news articles worldwide.
          </p>
          
          <button
            onClick={handleIndexTrigger}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors duration-300 group mt-6 px-4 py-2 rounded-lg hover:bg-accent/5"
          >
            <RefreshCw className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
            Update article database
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative mb-16">
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., What are the latest developments in AI regulation?"
              className="w-full pl-16 pr-28 py-6 text-lg border-2 border-border rounded-3xl bg-surface-glass backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300 shadow-2xl hover:shadow-3xl focus:shadow-accent/20"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center justify-center h-14 w-14 bg-gradient-to-br from-[hsl(var(--search-gradient-from))] to-[hsl(var(--search-gradient-to))] rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 transform transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-xl shadow-[hsl(var(--shadow-glow))]"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <Search className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
        </form>

        {/* Results Section */}
        <div className="space-y-10">
          {isLoading && <SearchResultsSkeleton />}

          {error && !isLoading && (
            <div className="p-6 text-center bg-destructive/10 border-2 border-destructive/30 rounded-3xl shadow-lg">
              <p className="text-base text-destructive font-semibold">⚠️ {error}</p>
            </div>
          )}

          {!isLoading && !result && !error && <InitialStatePrompt />}
          
          {result && !isLoading && (
            <div className="bg-surface-glass backdrop-blur-sm rounded-3xl border border-border/50 p-8 md:p-12 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-10 bg-gradient-to-b from-[hsl(var(--search-gradient-from))] to-[hsl(var(--search-gradient-to))] rounded-full shadow-lg shadow-accent/30" />
                <h2 className="text-3xl font-bold text-foreground">Answer</h2>
              </div>
              <div className="prose prose-xl dark:prose-invert max-w-none mb-12">
                <p className="text-foreground/90 leading-relaxed text-lg">{result.answer}</p>
              </div>

              {result.sources && result.sources.length > 0 && (
                <>
                  <hr className="my-10 border-border/50" />
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-2 h-8 bg-gradient-to-b from-[hsl(var(--search-gradient-from))] to-[hsl(var(--search-gradient-to))] rounded-full shadow-lg shadow-accent/30" />
                    <h3 className="text-2xl font-bold text-foreground">Verified Sources</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {result.sources.map((source, index) => (
                      <SourceArticle key={index} source={source} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by advanced search technology • Updated in real-time
          </p>
        </div>
      </div>
    </div>
  );
};

export default AiSearch;
