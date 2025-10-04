import React, { Component } from 'react';
import { Link } from 'react-router-dom'; // Make sure Link is imported
import NewsItem from './Newsitem';
import Spinner from './Spinner';
import SkeletonCard from './SkeletonCard';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import { getCurrentLanguage, onLanguageChange, t } from '../utils/i18n';
import apiClient from '../apiClient';

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
    };
    this.queryDebounce = null;
    document.title = `${this.capitalizeFirstLetter(this.props.category)} - NewZ`;
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
      const response = await apiClient.post('/api/translate', {
        texts: textsToTranslate,
        targetLang
      });
      const { translations } = response.data;

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

    const { page } = this.state;
    const languageParam = 'en';

    const params = new URLSearchParams({
      country, category, page, pageSize, lang: languageParam,
    });

    this.setState({ loading: true, error: null });

    try {
      const res = await apiClient.get('/api/news', {
        params: params,
        signal: this.controller.signal
      });
      const data = res.data;
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
    this.setState({ query: e.target.value });
  }

  handleSourceChange = (e) => {
    this.setState({ source: e.target.value });
  }

  capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  componentDidUpdate(prevProps) {
    if (prevProps.category !== this.props.category || prevProps.country !== this.props.country) {
      this.setState({ page: 1, articles: [], translatedArticles: null, hasMore: true }, () => {
        this.updateNews();
      });
      document.title = `${this.capitalizeFirstLetter(this.props.category)} - NewZ`;
    }
  }

  getCategoryIcon = (category) => {
    const icons = {
      general: ( <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg> ),
      business: ( <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" /></svg> ),
      technology: ( <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> ),
      sports: ( <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4" /></svg> ),
      science: ( <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg> ),
    };
    return icons[this.props.category] || icons.general;
  };

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
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        
        <div className="relative bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 pt-16">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-r from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-900 opacity-50"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div>
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg">
                    {this.getCategoryIcon(this.props.category)}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 text-sm font-medium">
                    Category
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                  {this.capitalizeFirstLetter(this.props.category)} News
                </h1>
                <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                  {t('information')}{t('informationnext')}
                </p>
                 <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span>Total: <span className="font-semibold text-gray-700 dark:text-gray-200">{this.state.totalResults.toLocaleString()}</span></span>
                    <span>Loaded: <span className="font-semibold text-gray-700 dark:text-gray-200">{this.state.articles.length}</span></span>
                    <span>Sources: <span className="font-semibold text-gray-700 dark:text-gray-200">{sources.length}</span></span>
                  </div>
                </div>
              </div>
              <div className="mt-8 lg:mt-0">
                <div className="bg-white/50 dark:bg-gray-800/30 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700 space-y-4">
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z" /></svg>
                    </span>
                    <input
                      type="text"
                      value={this.state.query}
                      onChange={this.handleQueryInput}
                      placeholder="Search headlines..."
                      aria-label="Search headlines"
                      className="w-full h-12 pl-12 pr-10 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                   <div className="relative">
                     <span className="pointer-events-none absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h18M3 12h18M3 19h18" /></svg>
                    </span>
                    <select
                      value={this.state.source}
                      onChange={this.handleSourceChange}
                      aria-label="Filter by source"
                      className="w-full h-12 pl-12 pr-10 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-red-500 appearance-none"
                    >
                      <option value="all">All sources ({sources.length})</option>
                      {sources.sort().map((s) => (
                        <option key={s} value={s}>{s} ({sourceCounts[s] || 0})</option>
                      ))}
                    </select>
                     <span className="pointer-events-none absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </div>
                  
                  {/* ================================================================== */}
                  {/* THIS IS THE NEW AI SEARCH BUTTON ADDED TO THE HOMEPAGE          */}
                  {/* ================================================================== */}
                  <Link 
                    to="/search" 
                    className="group w-full flex items-center justify-center gap-3 h-12 px-6 bg-gradient-to-br from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-red-500/40 focus:ring-4 focus:ring-red-500/50 focus:outline-none transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <span className="text-red-200">🧠</span>
                    <span>Try AI Search</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </Link>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
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

