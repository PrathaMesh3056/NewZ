

import React, { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "./Toaster";
import { getCurrentLanguage, getSupportedLanguages } from "../utils/i18n";

const IconPlay = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const IconStop = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="12" height="12"></rect></svg>;
const IconCopy = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconX = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
const IconLinkedIn = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 21.5h-5v-13h5v13zM4 6.5C2.5 6.5 1.5 5.3 1.5 4s1-2.5 2.5-2.5c1.6 0 2.5 1.2 2.5 2.5s-1 2.5-2.5 2.5zm11.5 6c-1 0-2 1-2 2v7h-5v-13h5V10s1.6-1.5 4-1.5c3 0 5 2.2 5 6.3v6.7h-5v-7.4c0-1.7-.5-2.9-2-2.9z" /></svg>;

const summaryCache = new Map();

const ArticleCard = ({ title, imageUrl, description, newsUrl, source }) => (
  <div className="lg:sticky lg:top-24">
    <div className="w-full bg-white dark:bg-gray-800/50 shadow-md rounded-2xl p-6 ring-1 ring-gray-200 dark:ring-gray-700">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 mb-4">{title}</h1>
      <div className="relative w-full overflow-hidden rounded-xl aspect-video">
        <img
          src={imageUrl || "/Newz_logo.png"}
          alt={`${title} — image from ${source || "Unknown source"}`}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      </div>
      <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm leading-6">{description}</p>
      <a
        href={newsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-red-600 hover:underline font-semibold"
      >
        Read full article →
      </a>
    </div>
  </div>
);

const LanguageSelector = ({ onSelectLanguage }) => {
  const languages = getSupportedLanguages();
  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Select a language for the summary</h3>
      <div className="flex flex-wrap justify-center gap-4">
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => onSelectLanguage(lang.code)}
            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            {lang.nativeName}
          </button>
        ))}
      </div>
    </div>
  );
};

const SummaryActions = ({ onPlay, onCopy, isPlaying, isAudioLoading, copied, summary, newsUrl }) => {
  const text = encodeURIComponent(summary?.event || "");
  const url = encodeURIComponent(newsUrl || window.location.href);

  const buttonClass = "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors";

  return (
    <div className="flex items-center gap-2">
      <button onClick={onPlay} className={buttonClass} title="Play summary">
        {isAudioLoading ? "⏳️" : isPlaying ? <IconStop /> : <IconPlay />}
        {isAudioLoading ? "Loading..." : isPlaying ? "Stop" : "Listen"}
      </button>
      <button onClick={onCopy} className={buttonClass} title={copied ? "Copied!" : "Copy summary"}>
        {copied ? <IconCheck /> : <IconCopy />}
        {copied ? "Copied" : "Copy"}
      </button>
      <a href={`https://twitter.com/intent/tweet?text=${text}&url=${url}`} target="_blank" rel="noopener noreferrer" className={buttonClass} title="Share summary on X">
        <IconX /> Share
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`} target="_blank" rel="noopener noreferrer" className={buttonClass} title="Share summary on LinkedIn">
        <IconLinkedIn /> Share
      </a>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400">
    <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="text-sm font-medium mt-4">Analyzing article with AI...</p>
    <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="my-4 p-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/30 text-red-800 dark:text-red-300 flex items-center justify-between">
    <span className="font-medium">⚠️ {error}</span>
    <button onClick={onRetry} className="text-sm font-semibold hover:underline">Retry</button>
  </div>
);

const QuickInsights = ({ insights, confidence, getSentimentClasses }) => {
  const { chip } = getSentimentClasses(insights.sentiment);
  const insightsList = [
    { icon: '⏱', label: 'Read Time', value: `${insights.readTime} | Word count: ${insights.wordCount}` },
    { icon: '🌍', label: 'Relevance', value: insights.relevance },
    { icon: '🧭', label: 'Bias Check', value: insights.bias },
    { icon: '🔮', label: 'Next Steps', value: insights.next },
    { icon: '🧩', label: 'Context', value: insights.context },
    { icon: '✅', label: 'AI Confidence', value: typeof confidence === 'number' ? `${confidence}%` : '—' },
  ];

  const renderList = () => (
    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 mt-3">
      {insightsList.map(item => (
        <li key={item.label}>
          {item.icon} <span className="font-semibold text-gray-700 dark:text-gray-200">{item.label}:</span> {item.value}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="mt-6">
      <div className="hidden sm:block p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl ring-1 ring-gray-200 dark:ring-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          ⚡ Quick Insights
          <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ${chip}`}>
            {insights.sentiment || 'Neutral'}
          </span>
        </h3>
        {renderList()}
      </div>
      <details className="sm:hidden p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl ring-1 ring-gray-200 dark:ring-gray-700">
        <summary className="text-sm font-semibold text-gray-700 dark:text-gray-200 cursor-pointer">⚡ Quick Insights</summary>
        {renderList()}
      </details>
    </div>
  );
};

const Feedback = ({ onFeedback, feedbackSent }) => (
  <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
    <span>Was this useful?</span>
    <button onClick={() => onFeedback(true)} disabled={feedbackSent} className="px-2.5 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">👍 Yes</button>
    <button onClick={() => onFeedback(false)} disabled={feedbackSent} className="px-2.5 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">👎 No</button>
  </div>
);

const LanguageDropdown = ({ currentLanguage, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const otherLanguages = getSupportedLanguages().filter(lang => lang.code !== currentLanguage);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (otherLanguages.length === 0) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
        Translate
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            {otherLanguages.map(lang => (
              <a
                key={lang.code}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSelect(lang.code);
                  setIsOpen(false);
                }}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {lang.nativeName}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


// --- Main AiSummary Component ---

const AiSummary = () => {
  const { articleId } = useParams();
  const location = useLocation();
  const [article, setArticle] = useState(location.state || null);
  const [summary, setSummary] = useState({ event: "", background: "" });
  const [insights, setInsights] = useState({
    sentiment: "Neutral", readTime: "30s", context: "General news", relevance: "General interest",
    bias: "Balanced", next: "Watch for follow-ups", wordCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [model, setModel] = useState(null);
  const [copied, setCopied] = useState(false);
  const [confidence, setConfidence] = useState(null);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const [languageSelected, setLanguageSelected] = useState(!!location.state?.language);
  const [selectedLanguage, setSelectedLanguage] = useState(location.state?.language || getCurrentLanguage());

  const controllerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef(null);

  const { title, description, imageUrl, author, date, source, newsUrl, shouldSummarize, language: initialLanguage } = article || {};

  useEffect(() => {
    if (!article && articleId) {
      const fetchArticleData = async () => {
        try {
          const response = await fetch(`/api/articles/${articleId}`);
          if (!response.ok) {
            throw new Error("Article not found. Please check the URL.");
          }
          const articleData = await response.json();
          setArticle(articleData);
        } catch (err) {
          console.error("Failed to fetch article data:", err);
          setError(err.message || "Could not load the article data.");
        }
      };
      fetchArticleData();
    }
  }, [articleId, article]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = title ? `${title} — Newz` : "AI Summary — Newz";

    if (initialLanguage && shouldSummarize && description) {
      generateSummary(initialLanguage);
    }

    return () => controllerRef.current?.abort();
  }, [title, initialLanguage, shouldSummarize, description]);


  const handlePlay = async () => {
    try {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
        return;
      }
      setIsAudioLoading(true);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          summary: summary.event || "No summary available",
          language: selectedLanguage,
        }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.oncanplay = () => {
        setIsAudioLoading(false);
        audio.play().then(() => setIsPlaying(true)).catch(err => {
          console.error("Error playing audio:", err);
          toast.error("Could not play audio");
          setIsAudioLoading(false);
        });
      };
      audio.onerror = () => {
        console.error("Audio playback error");
        toast.error("Error playing audio");
        setIsAudioLoading(false);
      };
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
    } catch (err) {
      console.error("Error in TTS:", err);
      toast.error("Could not load audio");
      setIsAudioLoading(false);
    }
  };

  // <--- MODIFIED: This function now has improved error handling --->
  const generateSummary = async (language) => {
    if (!description) return;

    const cacheKey = `${description.substring(0, 100)}-${language}`;
    if (summaryCache.has(cacheKey)) {
      const cached = summaryCache.get(cacheKey);
      setSummary(cached.summary);
      setInsights(cached.insights);
      return;
    }

    setLoading(true);
    setError(null);

    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: description, language: language }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || `Failed to generate summary (Status: ${res.status})`);
      }

      const data = await res.json();
      const summaryData = {
        event: data?.summary?.trim() || "No summary available",
        background: data?.background?.trim() || "",
      };
      const insightsData = {
        sentiment: data?.sentiment || "Neutral", readTime: data?.readTime || "30s",
        context: data?.context || "General news", relevance: data?.relevance || "General interest",
        bias: data?.bias || "Balanced", next: data?.next || "Watch for follow-ups",
        wordCount: data?.wordCount || (summaryData.event ? summaryData.event.split(/\s+/).length : 0)
      };

      summaryCache.set(cacheKey, { summary: summaryData, insights: insightsData });
      setSummary(summaryData);
      setInsights(insightsData);
      setModel(data?.model || null);
      setConfidence(data?.confidence || null);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Error generating summary:", err);
        setError(err.message);
        toast.error("Failed to generate summary.");
      }
    } finally {
      if (controllerRef.current === controller) {
        setLoading(false);
        controllerRef.current = null;
      }
    }
  };

  const handleLanguageSelect = (languageCode) => {
    setSelectedLanguage(languageCode);
    setLanguageSelected(true);
    generateSummary(languageCode);
  };

  const getSentimentClasses = (s) => {
    const v = (s || "").toLowerCase();
    if (v.includes("pos")) return { chip: "bg-green-100 text-green-800 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/20" };
    if (v.includes("neg")) return { chip: "bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20" };
    return { chip: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600" };
  };

  const extractEntities = (text) => {
    if (!text) return [];
    const matches = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/g) || [];
    return Array.from(new Set(matches)).slice(0, 3);
  };

  const highlightText = (text, entities) => {
    if (!text) return null;
    let parts = [text];
    parts = parts.flatMap((p) => String(p).split(/(\b\d+[\d,.]*\b)/g).map((seg, i) =>
      /\b\d+[\d,.]*\b/.test(seg) ? <strong className="font-bold text-blue-600 dark:text-blue-400" key={`n-${i}`}>{seg}</strong> : seg
    ));
    entities.forEach((e, idx) => {
      parts = parts.flatMap((p) => typeof p === 'string'
        ? p.split(new RegExp(`(${e.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`, 'g')).map((seg, i) =>
          seg === e ? <strong className="font-semibold text-gray-900 dark:text-gray-100" key={`e-${idx}-${i}`}>{seg}</strong> : seg
        )
        : [p]
      );
    });
    return parts;
  };

  const handleCopy = async () => {
    const text = [summary.event, summary.background].filter(Boolean).join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Summary copied to clipboard");
    } catch {
      toast.error("Could not copy summary");
    }
  };

  const sendFeedback = async (useful) => {
    if (feedbackSent) return;
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, url: newsUrl, useful: !!useful })
      });
      setFeedbackSent(true);
      toast.success(useful ? 'Thanks for your feedback! 👍' : 'Thanks for your feedback! 👎');
    } catch {
      toast.error('Could not send feedback');
    }
  };

  if (!article) {
    return (
      <div className="p-6 text-center text-gray-600 dark:text-gray-400 mt-20">
        {error ?
          `⚠️ ${error}` :
          "Loading article details..."
        }
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-1">
          <ArticleCard
            title={title}
            imageUrl={imageUrl}
            description={description}
            newsUrl={newsUrl}
            source={source}
          />
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800/50 shadow-lg rounded-2xl p-6 ring-1 ring-gray-200 dark:ring-gray-700">
            {!languageSelected ? (
              <LanguageSelector onSelectLanguage={handleLanguageSelect} />
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                        <span className="text-blue-600">✨</span>
                        <span>AI Summary</span>
                        {model && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20">{model}</span>}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                        AI-generated summary. May contain inaccuracies. Please verify important information.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <SummaryActions
                        onPlay={handlePlay}
                        onCopy={handleCopy}
                        isPlaying={isPlaying}
                        isAudioLoading={isAudioLoading}
                        copied={copied}
                        summary={summary}
                        newsUrl={newsUrl}
                      />
                      <LanguageDropdown
                        currentLanguage={selectedLanguage}
                        onSelect={handleLanguageSelect}
                      />
                    </div>
                </div>

                {error && <ErrorState error={error} onRetry={() => generateSummary(selectedLanguage)} />}

                {loading ? <LoadingState /> : (
                  (summary.event || summary.background) ? (
                    <div className="space-y-6">
                      {summary.event && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">📰 The Main Event</h3>
                          <div className="mt-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 leading-relaxed ring-1 ring-gray-200 dark:ring-gray-700">
                            {highlightText(summary.event, extractEntities(description || ""))}
                          </div>
                        </div>
                      )}
                      {summary.background && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">📚 Background & Context</h3>
                          <div className="mt-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 leading-relaxed ring-1 ring-gray-200 dark:ring-gray-700">
                            {highlightText(summary.background, extractEntities(description || ""))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                      <p>No summary available for this article.</p>
                    </div>
                  )
                )}

                {!loading && (summary.event || summary.background) && (
                  <>
                    <QuickInsights insights={insights} confidence={confidence} getSentimentClasses={getSentimentClasses} />
                    <Feedback onFeedback={sendFeedback} feedbackSent={feedbackSent} />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiSummary;
