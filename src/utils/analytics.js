export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined') return
  if (window.gtag) {
    window.gtag('event', name, params)
  }
  if (import.meta.env.DEV) {
    console.debug('[analytics]', name, params)
  }
}

export const events = {
  testStarted: (testId, title) => trackEvent('test_started', { test_id: testId, test_title: title }),
  testCompleted: (testId, score) => trackEvent('test_completed', { test_id: testId, score_percent: score }),
  chapterRead: (module) => trackEvent('chapter_read', { module }),
  ctaClicked: (label) => trackEvent('cta_clicked', { label }),
  pdfDownloaded: (title) => trackEvent('pdf_downloaded', { title }),
  searchUsed: (query) => trackEvent('search_used', { search_term: query }),
}
