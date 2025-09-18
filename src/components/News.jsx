import React, { Component } from 'react';
import NewsItem from './NewsItem';
import Spinner from './Spinner';
import SkeletonCard from './SkeletonCard';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import { getCurrentLanguage, onLanguageChange, t } from '../utils/i18n';

// *** FIX: Caches are moved outside the class to persist across component re-mounts ***
const newsCache = new Map();
const translationCache = new Map();

export class News extends Component {
  static defaultProps = {
    country: 'us',
    pageSize: 8,
    category: 'general',
  };

  static propTypes = {
    country: PropTypes.string,
    pageSize: PropTypes.number,
    category: PropTypes.string,
    setProgress: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.controller = new AbortController();
    this.state = {
      articles: [],
      translatedArticles: null,
      loading: false,
      page: 1,
      totalResults: 0,
      hasMore: true,
      error: null,
      query: '',
      source: 'all',
      language: getCurrentLanguage(),
      information: t('information'),
      informationnext: t('informationnext'),
    };
    this.queryDebounce = null;
    document.title = `${this.capitalizeFirstLetter(this.props.category)} - NewsZ`;
  }

  componentDidMount() {
    this.updateNews();

    this.unsubscribeLanguageChange = onLanguageChange(async (newLang) => {
      this.setState({ language: newLang, translatedArticles: null });

      if (newLang === 'en') {
        this.setState({ translatedArticles: null });
      } else {
        this.translateArticles(this.state.articles, newLang);
      }
    });
  }

  componentWillUnmount() {
    this.controller.abort();
    if (this.unsubscribeLanguageChange) {
      this.unsubscribeLanguageChange();
    }
    if (this.queryDebounce) clearTimeout(this.queryDebounce);
  }

  async translateArticles(articlesToTranslate, targetLang) {
    if (!articlesToTranslate || articlesToTranslate.length === 0) return;

    this.setState({ loading: true, error: null });

    const textsToTranslate = articlesToTranslate.flatMap(a => [a.title || '', a.description || '']);

    const cacheKey = `${articlesToTranslate.map(a => a.url).join('')}-${targetLang}`;
    if (translationCache.has(cacheKey)) {
        this.setState({ translatedArticles: translationCache.get(cacheKey), loading: false });
        return;
    }

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: textsToTranslate, targetLang }),
      });

      if (!response.ok) {
        throw new Error('Translation service failed');
      }

      const { translations } = await response.json();

      const newTranslatedArticles = articlesToTranslate.map((article, index) => ({
        ...article,
        title: translations[index * 2] || article.title,
        description: translations[index * 2 + 1] || article.description,
      }));

      translationCache.set(cacheKey, newTranslatedArticles);
      this.setState({ translatedArticles: newTranslatedArticles, loading: false });

    } catch (error) {
      console.error("Translation error:", error);
      this.setState({ error: 'Failed to translate articles.', loading: false });
    }
  }

  async updateNews(isLoadMore = false) {
    const { country, category, pageSize } = this.props;
    const cacheKey = `${category}-${country}`;

    if (!isLoadMore && this.state.page === 1 && newsCache.has(cacheKey)) {
        const cachedData = newsCache.get(cacheKey);
        this.setState({
            articles: cachedData.articles,
            totalResults: cachedData.totalResults,
            hasMore: cachedData.articles.length < cachedData.totalResults,
            loading: false,
        });
        this.props.setProgress?.(100);

        if (this.state.language !== 'en') {
            this.translateArticles(cachedData.articles, this.state.language);
        }
        return;
    }

    if (!isLoadMore) {
        this.controller.abort();
        this.controller = new AbortController();
        this.props.setProgress?.(10);
    }

    const { page, query, source } = this.state;
    const envBase = import.meta.env.VITE_API_BASE;
    const baseUrl = envBase || '/api';
    const languageParam = 'en';

    const params = new URLSearchParams({
      country, category, page, pageSize, lang: languageParam,
      ...(query && { q: query }),
      ...(source !== 'all' && { sources: source })
    });

    const url = `${baseUrl}/news?${params.toString()}`;

    this.setState({ loading: true, error: null });

    try {
      const res = await fetch(url, { signal: this.controller.signal });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (this.controller.signal.aborted) return;

      if (!data.articles || data.articles.length === 0) {
        this.setState({ hasMore: false, loading: false });
        return;
      }

      this.setState(prevState => {
        const newArticles = page === 1 ? data.articles : [...prevState.articles, ...data.articles];

        if (page === 1) {
            newsCache.set(cacheKey, { articles: newArticles, totalResults: data.totalResults });
        }

        if (this.state.language !== 'en') {
          this.translateArticles(newArticles, this.state.language);
        }

        return {
          articles: newArticles,
          totalResults: data.totalResults || 0,
          loading: false,
          hasMore: newArticles.length < (data.totalResults || 0),
          error: null,
        }
      });

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error fetching news:", error);
        this.setState({ error: 'Failed to load news. Please try again later.', loading: false, hasMore: false });
      }
    } finally {
      if (!this.controller.signal.aborted) {
        this.props.setProgress?.(100);
      }
    }
  }

  fetchMoreData = () => {
    this.setState(
      prevState => ({ page: prevState.page + 1 }),
      () => {
        this.updateNews(true);
      }
    );
  };

  handleQueryInput = (e) => {
    const value = e.target.value;
    this.setState({ query: value });
    if (this.queryDebounce) clearTimeout(this.queryDebounce);
    this.queryDebounce = setTimeout(() => {
      try { localStorage.setItem('newz.query', value); } catch {}
    }, 300);
  }

  handleSourceChange = (e) => {
    const value = e.target.value;
    this.setState({ source: value });
    try { localStorage.setItem('newz.source', value); } catch {}
  }

  capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  componentDidUpdate(prevProps) {
    if (prevProps.category !== this.props.category || prevProps.country !== this.props.country) {
      this.setState({ page: 1, articles: [], translatedArticles: null, hasMore: true }, () => {
        this.updateNews();
      });
      document.title = `${this.capitalizeFirstLetter(this.props.category)} - NewsZ`;
    }
  }

  getCategoryIcon = (category) => {
    const icons = {
      general: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      business: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
        </svg>
      ),
      technology: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      sports: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4" />
        </svg>
      ),
      science: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    };
    return icons[category] || icons.general;
  };
  getCategoryTheme = (category) => {
    const map = {
      general: { bg: 'bg-gray-50', text: 'text-gray-700', ring: 'ring-gray-200' },
      business: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
      technology: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100' },
      sports: { bg: 'bg-orange-50', text: 'text-orange-600', ring: 'ring-orange-100' },
      science: { bg: 'bg-teal-50', text: 'text-teal-600', ring: 'ring-teal-100' },
    };
    return map[category] || map.general;
  }

  render() {
    const articlesToDisplay = this.state.translatedArticles || this.state.articles;

    const q = this.state.query.trim().toLowerCase();
    const src = this.state.source;
    const sourceCounts = articlesToDisplay.reduce((acc, a) => {
      const n = a.source?.name; if (!n) return acc; acc[n] = (acc[n] || 0) + 1; return acc;
    }, {});
    const filtered = articlesToDisplay.filter(a => {
      const matchesText = !q || (
        (a.title || '').toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q)
      );
      const matchesSource = src === 'all' || (a.source?.name === src);
      return matchesText && matchesSource;
    });

    const sources = Array.from(new Set(articlesToDisplay.map(a => a.source?.name).filter(Boolean)));

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-b from-white to-gray-50 border-b border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center mb-6">
                {(() => {
                  const theme = this.getCategoryTheme(this.props.category);
                  return (
                    <div className={`w-14 h-14 rounded-full ${theme.bg} ${theme.text} ring-1 ${theme.ring} shadow-sm flex items-center justify-center`}>
                      <span className="sr-only">Category icon</span>
                      <span className="[&>svg]:w-7 [&>svg]:h-7">
                        {this.getCategoryIcon(this.props.category)}
                      </span>
                    </div>
                  );
                })()}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                {this.capitalizeFirstLetter(this.props.category)} News
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6">
              {t('information')}
              {t('informationnext')}
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <div className="relative w-full sm:w-80">
                  <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z"/></svg>
                  </span>
                  <input
                    type="text"
                    value={this.state.query}
                    onChange={this.handleQueryInput}
                    placeholder="Search headlines..."
                    aria-label="Search headlines"
                    className="w-full h-10 pl-9 pr-8 border border-gray-200 rounded-md bg-white text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {this.state.query && (
                    <button
                      type="button"
                      onClick={() => this.setState({ query: '' })}
                      aria-label="Clear search"
                      className="absolute inset-y-0 right-0 pr-2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  )}
                </div>
                <div className="relative w-full sm:w-64">
                  <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h18M3 12h18M3 19h18"/></svg>
                  </span>
                  <select
                    value={this.state.source}
                    onChange={this.handleSourceChange}
                    aria-label="Filter by source"
                    className="w-full h-10 pl-9 pr-8 border border-blue-200 hover:border-blue-300 focus:border-blue-400 rounded-md bg-white text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm"
                  >
                    <option value="all">All sources ({sources.length})</option>
                    <optgroup label="A–M">
                      {sources
                        .slice()
                        .sort((a, b) => a.localeCompare(b))
                        .filter((s) => (s?.[0] || 'A').toUpperCase() <= 'M')
                        .map((s) => (
                          <option key={s} value={s}>{s} ({sourceCounts[s] || 0})</option>
                        ))}
                    </optgroup>
                    <optgroup label="N–Z">
                      {sources
                        .slice()
                        .sort((a, b) => a.localeCompare(b))
                        .filter((s) => (s?.[0] || 'N').toUpperCase() >= 'N')
                        .map((s) => (
                          <option key={s} value={s}>{s} ({sourceCounts[s] || 0})</option>
                        ))}
                    </optgroup>
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                  </span>
                </div>
              </div>
              <div className="mt-4 text-xs text-blue-700">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                    <span className="font-medium">Total:</span> {this.state.totalResults.toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                    <span className="font-medium">Loaded:</span> {this.state.articles.length}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                    <span className="font-medium">Sources:</span> {sources.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {this.state.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {this.state.error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {this.state.loading && this.state.articles.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: this.props.pageSize }).map((_, i) => (
                <SkeletonCard key={`skeleton-${i}`} />
              ))}
            </div>
          )}

          <InfiniteScroll
            dataLength={filtered.length}
            next={this.fetchMoreData}
            hasMore={this.state.hasMore}
            loader={
              <div className="col-span-full flex justify-center py-6">
                <Spinner />
              </div>
            }
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filtered.map((element, index) => (
              <div key={element.url + index} className="h-full">
                <NewsItem
                  title={element.title || ""}
                  description={element.description || ""}
                  imageUrl={element.urlToImage || "/fallback.png"}
                  newsUrl={element.url}
                  author={element.author}
                  date={element.publishedAt}
                  source={element.source?.name}
                  category={this.props.category}
                  // *** ADDED: Pass the current language to NewsItem ***
                  currentLanguage={this.state.language}
                />
              </div>
            ))}
          </InfiniteScroll>

          {!this.state.hasMore && this.state.articles.length > 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">You've reached the end!</h3>
              <p className="text-gray-500 text-sm">
                Check back later for more updates on {this.props.category} news.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default News;