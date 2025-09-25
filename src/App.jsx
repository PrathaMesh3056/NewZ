import React, { Component } from 'react'
import { applyTheme, getTheme, setTheme } from './utils/theme'
import Navbar from './components/navbar';
import News from './components/News';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import NotFound from './components/NotFound';
import AiSummary from './components/AiSummary';
import Testing from './components/Testing';
import { Toaster } from './components/Toaster';
import ErrorBoundary from './components/ErrorBoundary';
import AiSearch from './components/AiSearch';
import { SpeedInsights } from "@vercel/speed-insights/react"

export default class App extends Component {
 
  pageSize = 8;
  apiKey = import.meta.env.VITE_NEWZ_APP_APIKEY
  state = {
    progress: 0,
    darkMode: false,
  };  

  componentDidMount() {
    // Centralized theme handling: default to light for now
    setTheme('light');
    applyTheme('light');
    this.setState({ darkMode: false });
  }

  applyDarkMode = (isDark) => {
    // Delegate to centralized util (kept for future re-enable)
    applyTheme(isDark ? 'dark' : 'light');
  }

  setProgress = (progress) => {
    this.setState({progress:  progress });
  }

  toggleDarkMode = () => {
    // Temporarily disabled: keep light theme
    setTheme('light');
    this.applyDarkMode(false);
    if (this.state.darkMode !== false) this.setState({ darkMode: false });
  }
  render() {

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Router>
          <Toaster />
          <Navbar darkMode={this.state.darkMode} toggleDarkMode={this.toggleDarkMode} />
          <LoadingBar
            color='#dc2626'
            progress={this.state.progress}
          />
          <ErrorBoundary>
            <Routes>
              <Route path="/search" element={<AiSearch />} />
              <Route exact path="/sports" element={<News apiKey={this.apiKey} setProgress={this.setProgress} pageSize={this.pageSize} country="us" category="sports" />} />
              <Route exact path="/science" element={<News apiKey={this.apiKey} setProgress={this.setProgress} pageSize={this.pageSize} country="us" category="science" />}/>
              <Route exact path="/general" element={<News apiKey={this.apiKey} setProgress={this.setProgress} pageSize={this.pageSize} country="us" category="general" />} />
              <Route exact path="/business" element={<News apiKey={this.apiKey} setProgress={this.setProgress} pageSize={this.pageSize} country="us" category="business" />} />
              <Route exact path="/technology" element={<News apiKey={this.apiKey} setProgress={this.setProgress} pageSize={this.pageSize} country="us" category="technology" />} />
              <Route exact path="/about" element={<About/>} />
              <Route exact path="/" element={<News apiKey={this.apiKey} setProgress={this.setProgress} pageSize={this.pageSize} country="us" category="general" />} />
              <Route path="/Contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/ai-summary" element={<AiSummary/>}/>
              {/* Backward compatibility */}
              <Route path="/newpage" element={<AiSummary/>}/>
              <Route path="/Testing" element={<Testing/>}/>
            </Routes>
          </ErrorBoundary>
          <Footer />
        </Router>
      </div>
    );
  }
}
