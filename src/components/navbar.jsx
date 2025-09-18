import React, { Component } from 'react'; 
import { Link } from 'react-router-dom';
import { t, getCurrentLanguage, getSupportedLanguages } from '../utils/i18n.js';

export default class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentLanguage: getCurrentLanguage(),
      languages: getSupportedLanguages(),
      isMobileMenuOpen: false,
      isLanguageMenuOpen: false,
    };
    this.languageMenuRef = React.createRef();
  }

  toggleMobileMenu = () => {
    this.setState(prevState => ({ isMobileMenuOpen: !prevState.isMobileMenuOpen }));
  };

  closeMobileMenu = () => {
    this.setState({ isMobileMenuOpen: false });
  };

  handleLanguageChange = (langCode) => {
    this.setState({ 
        currentLanguage: langCode,
        isLanguageMenuOpen: false,
        isMobileMenuOpen: false,
    });
    localStorage.setItem('preferredLanguage', langCode);
    window.dispatchEvent(new Event('languageChanged'));
  };

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleClickOutside = (event) => {
    // CORRECTED: Fixed typo from 'languageMenuref' to 'languageMenuRef'
    if (this.languageMenuRef.current && !this.languageMenuRef.current.contains(event.target)) {
      this.setState({ isLanguageMenuOpen: false });
    }
  };

  render() {
    const { currentLanguage, languages, isMobileMenuOpen, isLanguageMenuOpen } = this.state;
    
    return (
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-sm border-b border-gray-200 dark:border-gray-800 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link className="flex items-center space-x-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2" to="/">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">NewZ</span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {/* --- NEW: AI Search Link --- */}
              <Link className="text-gray-700 dark:text-gray-300 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 flex items-center gap-1" to="/search">
                <span className="text-blue-500">✨</span> AI Search
              </Link>
              <Link className="text-gray-700 dark:text-gray-300 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2" to="/general">{t('general')}</Link>
              <Link className="text-gray-700 dark:text-gray-300 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2" to="/business">{t('business')}</Link>
              <Link className="text-gray-700 dark:text-gray-300 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2" to="/technology">{t('technology')}</Link>
              <Link className="text-gray-700 dark:text-gray-300 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2" to="/sports">{t('sports')}</Link>
              <Link className="text-gray-700 dark:text-gray-300 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2" to="/science">{t('science')}</Link>
              <Link className="text-gray-700 dark:text-gray-300 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2" to="/about">{t('about')}</Link>
              
              <div className="relative" ref={this.languageMenuRef}>
                <button 
                  onClick={() => this.setState(prevState => ({ isLanguageMenuOpen: !prevState.isLanguageMenuOpen }))}
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  aria-label={t('language')}
                  aria-haspopup="true"
                  aria-expanded={isLanguageMenuOpen}
                >
                  <span className="mr-1">🌐</span>
                  <span className="hidden sm:inline">{languages.find(lang => lang.code === currentLanguage)?.nativeName || currentLanguage}</span>
                  <svg className={`ml-1 w-4 h-4 transition-transform duration-200 ${isLanguageMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isLanguageMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => this.handleLanguageChange(lang.code)}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                          currentLanguage === lang.code 
                            ? 'bg-red-100 text-red-700 dark:bg-gray-700 dark:text-red-400' 
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        {lang.nativeName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="md:hidden ml-2">
              <button 
                onClick={this.toggleMobileMenu}
                className="text-gray-700 dark:text-gray-300 hover:text-red-600 p-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="flex flex-col space-y-2">
                {/* --- NEW: AI Search Link for Mobile --- */}
                <Link className="text-gray-700 dark:text-gray-300 hover:text-red-600 px-3 py-2 text-base font-medium transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 flex items-center gap-2" to="/search" onClick={this.closeMobileMenu}>
                  <span className="text-blue-500">✨</span> AI Search
                </Link>
                <Link className="text-gray-700 dark:text-gray-300 hover:text-red-600 px-3 py-2 text-base font-medium transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500" to="/general" onClick={this.closeMobileMenu}>{t('general')}</Link>
                <Link className="text-gray-700 dark:text-gray-300 hover:text-red-600 px-3 py-2 text-base font-medium transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500" to="/business" onClick={this.closeMobileMenu}>{t('business')}</Link>
                <Link className="text-gray-700 dark:text-gray-300 hover:text-red-600 px-3 py-2 text-base font-medium transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500" to="/technology" onClick={this.closeMobileMenu}>{t('technology')}</Link>
                <Link className="text-gray-700 dark:text-gray-300 hover:text-red-600 px-3 py-2 text-base font-medium transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500" to="/sports" onClick={this.closeMobileMenu}>{t('sports')}</Link>
                <Link className="text-gray-700 dark:text-gray-300 hover:text-red-600 px-3 py-2 text-base font-medium transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500" to="/science" onClick={this.closeMobileMenu}>{t('science')}</Link>
                <Link className="text-gray-700 dark:text-gray-300 hover:text-red-600 px-3 py-2 text-base font-medium transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500" to="/about" onClick={this.closeMobileMenu}>{t('about')}</Link>
                
                <div className="px-3 pt-4 pb-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('language')}</p>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => this.handleLanguageChange(lang.code)}
                        className={`px-3 py-1 text-sm rounded transition-colors duration-150 ${
                          currentLanguage === lang.code
                            ? 'bg-red-600 text-white shadow'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {lang.nativeName}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }
}

