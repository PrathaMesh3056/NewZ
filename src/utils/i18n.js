// Default language
// src/utils/i18n.js

// Default language
const DEFAULT_LANGUAGE = 'en';

// Supported languages with their display names
const LANGUAGES = {
  en: { name: 'English', nativeName: 'English' },
  hi: { name: 'Hindi', nativeName: 'हिंदी' },
  mr: { name: 'Marathi', nativeName: 'मराठी' },
  es: { name: 'Spanish', nativeName: 'Español' },
  fr: { name: 'French', nativeName: 'Français' }
};

// UI translations
const TRANSLATIONS = {
  en: {
    home: 'Home',
    general: 'General',
    business: 'Business',
    technology: 'Technology',
    sports: 'Sports',
    science: 'Science',
    about: 'About',
    readMore: 'Read full article',
    aiSummary: 'AI Summary',
    contactUs: 'Contact Us',
    noDescription: 'No description available',
    summarizing: 'Summarizing',
    share: 'Share',
    language: 'Language',
    search: 'Search',
    loading: 'Loading...',
    noResults: 'No results found',
    errorLoading: 'Error loading content',
    tryAgain: 'Try again',
    backToHome: 'Back to home',
    information:` Headlines from around the world `,
    informationnext:"Get breaking news, in-depth analysis, and expert insights delivered to you in real-time",
    news: {
      categories: {
        general: 'General',
        business: 'Business',
        technology: 'Technology',
        sports: 'Sports',
        science: 'Science',
        health: 'Health',
        entertainment: 'Entertainment'
      },
      noTitle: 'Untitled Article',
      noDescription: 'No description available',
      source: 'Source',
      publishedAt: 'Published on',
      author: 'Author',
      unknownAuthor: 'Unknown',
      loadMore: 'Load more',
      noMoreNews: 'No more news to show'
    }
  },
  hi: {
    home: 'होम',
    general: 'सामान्य',
    business: 'व्यापार',
    technology: 'तकनीक',
    sports: 'खेल',
    science: 'विज्ञान',
    about: 'हमारे बारे में',
    readMore: 'पूरा लेख पढ़ें',
    aiSummary: 'एआई सारांश',
    contactUs: 'संपर्क करें',
    noDescription: 'कोई विवरण उपलब्ध नहीं है',
    summarizing: 'सारांश बनाया जा रहा है',
    share: 'साझा करें',
    language: 'भाषा',
    search: 'खोजें',
    loading: 'लोड हो रहा है...',
    noResults: 'कोई परिणाम नहीं मिला',
    errorLoading: 'सामग्री लोड करने में त्रुटि',
    tryAgain: 'पुनः प्रयास करें',
    backToHome: 'होम पर वापस जाएं',
    information:` दुनिया भर की सुर्ख़ियाँ `,
    informationnext:"ताज़ा खबरें, गहन विश्लेषण और विशेषज्ञों की राय आपको रियल-टाइम में उपलब्ध कराई जाती हैं।",
    news: {
      categories: {
        general: 'सामान्य',
        business: 'व्यापार',
        technology: 'तकनीक',
        sports: 'खेल',
        science: 'विज्ञान',
        health: 'स्वास्थ्य',
        entertainment: 'मनोरंजन'
        
      },
      noTitle: 'शीर्षक रहित लेख',
      noDescription: 'कोई विवरण उपलब्ध नहीं',
      source: 'स्रोत',
      publishedAt: 'प्रकाशित तिथि',
      author: 'लेखक',
      unknownAuthor: 'अज्ञात',
      loadMore: 'और देखें',
      noMoreNews: 'और कोई समाचार उपलब्ध नहीं'
    }
  },
  mr: {
    home: 'मुख्यपृष्ठ',
    general: 'सर्वसाधारण',
    business: 'व्यवसाय',
    technology: 'तंत्रज्ञान',
    sports: 'खेळ',
    science: 'विज्ञान',
    about: 'बद्दल',
    readMore: 'पूर्ण लेख वाचा',
    aiSummary: 'AI सारांश',
    contactUs: 'संपर्क करा',
    noDescription: 'वर्णन उपलब्ध नाही',
    summarizing: 'सारांश तयार होत आहे',
    share: 'शेअर करा',
    language: 'भाषा',
    search: 'शोधा',
    loading: 'लोड होत आहे...',
    noResults: 'एकही परिणाम आढळला नाही',
    errorLoading: 'सामग्री लोड करताना त्रुटी',
    tryAgain: 'पुन्हा प्रयत्न करा',
    backToHome: 'मुख्यपृष्ठावर परत जा',
    information: `जगभरातील मथळे`,
    informationnext: "ताज्या बातम्या, सखोल विश्लेषण आणि तज्ञांचे विचार तुम्हाला रिअल-टाइममध्ये मिळतात.",
    news: {
      categories: {
        general: 'सर्वसाधारण',
        business: 'व्यवसाय',
        technology: 'तंत्रज्ञान',
        sports: 'खेळ',
        science: 'विज्ञान',
        health: 'आरोग्य',
        entertainment: 'मनोरंजन'
      },
      noTitle: 'शीर्षक नसलेला लेख',
      noDescription: 'वर्णन उपलब्ध नाही',
      source: 'स्रोत',
      publishedAt: 'प्रकाशित',
      author: 'लेखक',
      unknownAuthor: 'अज्ञात',
      loadMore: 'अधिक लोड करा',
      noMoreNews: 'अधिक बातम्या नाहीत'
    }
  },
  es: {
    home: 'Inicio',
    general: 'General',
    business: 'Negocios',
    technology: 'Tecnología',
    sports: 'Deportes',
    science: 'Ciencia',
    about: 'Acerca de',
    readMore: 'Leer artículo completo',
    aiSummary: 'Resumen de IA',
    contactUs: 'Contáctanos',
    noDescription: 'No hay descripción disponible',
    summarizing: 'Resumiendo',
    share: 'Compartir',
    language: 'Idioma',
    search: 'Buscar',
    loading: 'Cargando...',
    noResults: 'No se encontraron resultados',
    errorLoading: 'Error al cargar el contenido',
    tryAgain: 'Intentar de nuevo',
    backToHome: 'Volver al inicio',
    information: `titulares de todo el mundo`,
    informationnext: "Reciba noticias de última hora, análisis en profundidad y opiniones de expertos en tiempo real.",
    news: {
      categories: {
        general: 'General',
        business: 'Negocios',
        technology: 'Tecnología',
        sports: 'Deportes',
        science: 'Ciencia',
        health: 'Salud',
        entertainment: 'Entretenimiento'
      },
      noTitle: 'Artículo sin título',
      noDescription: 'No hay descripción disponible',
      source: 'Fuente',
      publishedAt: 'Publicado el',
      author: 'Autor',
      unknownAuthor: 'Desconocido',
      loadMore: 'Cargar más',
      noMoreNews: 'No hay más noticias para mostrar'
    }
  },
  fr: {
    home: 'Accueil',
    general: 'Général',
    business: 'Affaires',
    technology: 'Technologie',
    sports: 'Sports',
    science: 'Science',
    about: 'À propos',
    readMore: 'Lire l\'article complet',
    aiSummary: 'Résumé IA',
    contactUs: 'Contactez-nous',
    noDescription: 'Aucune description disponible',
    summarizing: 'Résumé en cours',
    share: 'Partager',
    language: 'Langue',
    search: 'Rechercher',
    loading: 'Chargement...',
    noResults: 'Aucun résultat trouvé',
    errorLoading: 'Erreur de chargement du contenu',
    tryAgain: 'Réessayer',
    backToHome: 'Retour à l\'accueil',
    information: `les manchettes du monde entier`,
    informationnext: "Recevez les dernières nouvelles, des analyses approfondies et des avis d'experts en temps réel.",
    news: {
      categories: {
        general: 'Général',
        business: 'Affaires',
        technology: 'Technologie',
        sports: 'Sports',
        science: 'Science',
        health: 'Santé',
        entertainment: 'Divertissement'
      },
      noTitle: 'Article sans titre',
      noDescription: 'Aucune description disponible',
      source: 'Source',
      publishedAt: 'Publié le',
      author: 'Auteur',
      unknownAuthor: 'Inconnu',
      loadMore: 'Charger plus',
      noMoreNews: 'Plus de nouvelles à afficher'
    }
  }
};

// Get current language from localStorage or use default
const getCurrentLanguage = () => {
  try {
    return localStorage.getItem('preferredLanguage') || DEFAULT_LANGUAGE;
  } catch (e) {
    return DEFAULT_LANGUAGE;
  }
};

// Translate a key to the current language
const t = (key, params = {}) => {
  const lang = getCurrentLanguage();
  
  // Handle nested keys (e.g., 'news.categories.technology')
  const keys = key.split('.');
  let result = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANGUAGE];
  
  for (const k of keys) {
    if (result && result[k] !== undefined) {
      result = result[k];
    } else {
      // If the key doesn't exist in the current language, try the default language
      const defaultResult = TRANSLATIONS[DEFAULT_LANGUAGE];
      const defaultValue = keys.reduce((obj, k) => obj && obj[k], defaultResult);
      result = defaultValue !== undefined ? defaultValue : key;
      break;
    }
  }
  
  // Handle simple string replacements if params are provided
  if (typeof result === 'string' && Object.keys(params).length > 0) {
    return Object.entries(params).reduce(
      (str, [k, v]) => str.replace(new RegExp(`{{${k}}}`, 'g'), v),
      result
    );
  }
  
  return result;
};

// Get all supported languages
const getSupportedLanguages = () => {
  return Object.entries(LANGUAGES).map(([code, { name, nativeName }]) => ({
    code,
    name,
    nativeName
  }));
};

// Add event listener for language changes
const onLanguageChange = (callback) => {
  const handler = () => callback(getCurrentLanguage());
  window.addEventListener('languageChanged', handler);
  return () => window.removeEventListener('languageChanged', handler);
};

export {
  getCurrentLanguage,
  getSupportedLanguages,
  t,
  onLanguageChange,
  
  DEFAULT_LANGUAGE
};