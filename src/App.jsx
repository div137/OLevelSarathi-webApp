import React, { lazy, Suspense, useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CookieConsent from './components/CookieConsent'
import AnnouncementPopup from './components/AnnouncementPopup'
import { initPerformanceMonitoring, registerServiceWorker, setupLazyImages } from './utils/performanceOptimization'

const Home = lazy(() => import('./pages/Home'))
const Tests = lazy(() => import('./pages/Tests'))
const PDFs = lazy(() => import('./pages/PDFs'))
const Projects = lazy(() => import('./pages/Projects'))
const QuizPage = lazy(() => import('./pages/QuizPage'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogDetail = lazy(() => import('./pages/BlogDetail'))
const AdminPanel = lazy(() => import('./pages/AdminPanel'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const Terms = lazy(() => import('./pages/Terms'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Disclaimer = lazy(() => import('./pages/Disclaimer'))
const NotFound = lazy(() => import('./pages/NotFound'))

export const ThemeContext = React.createContext()

const Loading = () => (
  <div style={{
    height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-primary)', color: 'var(--accent)',
  }}>
    <div className="loader">Loading...</div>
  </div>
)

export default function App() {
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith('/admin')

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const ScrollToTop = () => {
    const { pathname } = useLocation()
    useEffect(() => {
      window.scrollTo(0, 0)
      setupLazyImages()
    }, [pathname])
    return null
  }

  useEffect(() => {
    initPerformanceMonitoring()
    setupLazyImages()
    if (import.meta.env.PROD) {
      registerServiceWorker()
    }
  }, [])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div data-theme={theme}>
        {!isAdminPage && <Navbar />}
        <ScrollToTop />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tests" element={<Tests />} />
            <Route path="/pdfs" element={<PDFs />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/test/:testId" element={<QuizPage />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin-olevelsarathi-2026" element={<AdminPanel />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        {!isAdminPage && <Footer />}
        {!isAdminPage && <CookieConsent />}
        {!isAdminPage && <AnnouncementPopup />}
      </div>
    </ThemeContext.Provider>
  )
}
