import { useState, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useFirebase } from '../hooks/useFirebase'
import { FiFileText, FiDownload, FiEye, FiCalendar, FiExternalLink, FiCheck } from 'react-icons/fi'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import { AutoAd, RelaxedAd } from '../components/GoogleAd'

const formatPdfUrl = (url) => {
  if (!url) return ''
  let f = url.trim()
  if (!f.startsWith('http')) f = 'https://' + f.replace(/^\/\//, '')

  // Google Drive: View -> Preview (for iframes only)
  if (f.includes('drive.google.com')) {
    if (f.includes('/view')) return f.replace('/view', '/preview')
    const idMatch = f.match(/[?&]id=([^&]+)/) || f.match(/\/d\/([^/]+)/)
    if (idMatch) return `https://drive.google.com/file/d/${idMatch[1]}/preview`
  }
  // Dropbox: dl=0 -> raw=1
  if (f.includes('dropbox.com')) return f.replace('dl=0', 'raw=1')
  // Cloudinary: Ensure direct link
  if (f.includes('cloudinary.com')) {
    return f.replace('http://', 'https://')
  }
  
  return f
}

// URL for opening PDF directly in browser (new tab)
const formatOpenUrl = (url) => {
  if (!url) return ''
  let f = url.trim()
  if (!f.startsWith('http')) f = 'https://' + f.replace(/^\/\//, '')

  // Google Drive: use /view URL so it opens in the Drive PDF viewer
  if (f.includes('drive.google.com')) {
    const idMatch = f.match(/[?&]id=([^&]+)/) || f.match(/\/d\/([^/]+)/)
    if (idMatch) return `https://drive.google.com/file/d/${idMatch[1]}/view`
  }
  // Dropbox: raw=1 serves the file directly
  if (f.includes('dropbox.com')) return f.replace('dl=0', 'raw=1').replace('dl=1', 'raw=1')
  // Cloudinary: direct https link opens in browser
  if (f.includes('cloudinary.com')) return f.replace('http://', 'https://')

  return f
}

const formatDownloadUrl = (url) => {
  if (!url) return ''
  let f = url.trim()
  if (!f.startsWith('http')) f = 'https://' + f.replace(/^\/\//, '')

  // Google Drive: Force Download
  if (f.includes('drive.google.com')) {
    const idMatch = f.match(/[?&]id=([^&]+)/) || f.match(/\/d\/([^/]+)/)
    if (idMatch) return `https://drive.google.com/uc?id=${idMatch[1]}&export=download`
  }
  
  // Cloudinary: Force Attachment
  if (f.includes('cloudinary.com')) {
    const types = ['/raw/upload/', '/upload/', '/private/', '/authenticated/']
    for (const t of types) {
      if (f.includes(t) && !f.includes('fl_attachment')) {
        return f.replace(t, `${t}fl_attachment/`)
      }
    }
  }

  // Dropbox: dl=0 -> dl=1
  if (f.includes('dropbox.com')) return f.replace('dl=0', 'dl=1')
  
  return f
}

function PDFCard({ item }) {
  const isHidden = item.hidden === true
  const [isDownloaded, setIsDownloaded] = useState(() => {
    try { return localStorage.getItem('dl_' + (item.id || item._key)) === 'true' } catch(e) { return false }
  })

  if (isHidden) return null

  const onDownload = () => {
    try {
      setIsDownloaded(true)
      localStorage.setItem('dl_' + (item.id || item._key), 'true')
    } catch(e) {}
  }

  const handleDownloadClick = async (e) => {
    e.preventDefault()
    const url = formatDownloadUrl(item.url)
    const fileName = `${(item.title || 'Note').replace(/[^a-z0-9]/gi, '_')}.pdf`
    
    try {
      // Try to fetch as blob for perfect filename control (works if CORS is allowed)
      const resp = await fetch(url)
      if (!resp.ok) throw new Error('Network response was not ok')
      const blob = await resp.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
      onDownload()
    } catch (err) {
      // Fallback: Open in new tab if CORS blocks fetch
      console.warn('CORS blocked fetch download, falling back to direct link:', err)
      window.open(url, '_blank')
      onDownload()
    }
  }

  return (
    <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Top color banner */}
      <div style={{
        height: 6,
        background: isDownloaded
          ? 'linear-gradient(90deg, #4caf50, #2e7d32)'
          : 'linear-gradient(90deg, #66bb6a, #a5d6a7)',
      }} />

      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{
            width: 50, height: 50, borderRadius: 14,
            background: isDownloaded ? 'rgba(76,175,80,0.12)' : 'var(--bg-card2)',
            border: `2px solid ${isDownloaded ? '#4caf50' : 'var(--border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isDownloaded ? '#4caf50' : 'var(--text-muted)',
            position: 'relative', flexShrink: 0, transition: 'all 0.3s',
          }}>
            <FiFileText size={22} />
            {isDownloaded && (
              <div style={{
                position: 'absolute', top: -6, right: -6,
                background: '#4caf50', color: '#fff',
                borderRadius: '50%', width: 20, height: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--bg-card)',
              }}>
                <FiCheck size={10} strokeWidth={3} />
              </div>
            )}
          </div>
          {item.date && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <FiCalendar size={11} />{item.date}
            </span>
          )}
        </div>

        {/* Category badge */}
        {item.category && (
          <span className="badge" style={{ alignSelf: 'flex-start' }}>{item.category}</span>
        )}

        {/* Title & desc */}
        <div style={{ flex: 1 }}>
          <h3 style={{ fontWeight: 800, lineHeight: 1.4, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 7 }}>
            {item.title}
          </h3>
          {item.desc && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.65 }}>
              {item.desc}
            </p>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <a
            href="https://github.com/div137/application-olevel/raw/main/sarathi_5_0_0.apk"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            onClick={onDownload}
            style={{ flex: 1, height: 42, borderRadius: 10, gap: 7, textDecoration: 'none', fontSize: '0.85rem' }}
          >
            <FiDownload size={15} />
            {isDownloaded ? 'Downloaded ✓' : 'Download PDF'}
          </a>
        </div>
      </div>
    </div>
  )
}

/* ── Category Card ── */
function CategoryCard({ category, itemCount, onSelect, index }) {
  const color = '#34d399' // PDF accent color (Success green)
  return (
    <button
      className={`fade-up stagger-${(index%4)+1}`}
      onClick={() => onSelect(category)}
      style={{
        padding: '32px 24px', borderRadius: 20, background: 'var(--bg-card)',
        border: '1px solid var(--border)', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color
        e.currentTarget.style.boxShadow = `0 10px 30px ${color}22`
        e.currentTarget.style.transform = 'translateY(-6px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: `${color}1a`, border: `2px solid ${color}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color, transition: 'transform 0.3s'
      }}>
        <FiFileText size={32} />
      </div>
      <div>
        <h3 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 4, color: 'var(--text-primary)' }}>{category}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {itemCount} {itemCount === 1 ? 'file' : 'files'}
        </p>
      </div>
    </button>
  )
}

/* ── Main PDFs Page ── */
export default function PDFs() {
  const { data, loading } = useFirebase('Notifications')
  const location = useLocation()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [search, setSearch] = useState('')

  // Read ?cat= URL param — set category on mount / URL change
  useEffect(() => {
    const p = new URLSearchParams(location.search)
    const cat = p.get('cat') || p.get('category')
    if (cat) setSelectedCategory(decodeURIComponent(cat))
  }, [location.search])

  const categoriesList = useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    // Allow seeing all categories even if hidden for troubleshooting
    return [...new Set(data.map(d => d.category?.trim()).filter(Boolean))]
  }, [data])

  const categoryCounts = useMemo(() => {
    const counts = {}
    categoriesList.forEach(cat => {
      counts[cat] = (data || []).filter(d => d.category?.trim().toLowerCase() === cat.toLowerCase()).length
    })
    return counts
  }, [data, categoriesList])

  const filtered = (data || []).filter(item => {
    if (!selectedCategory) return false
    const itemCat = item.category?.trim().toLowerCase() || ''
    const selCat  = selectedCategory.trim().toLowerCase()
    const matchCat    = itemCat === selCat
    const matchSearch = item.title?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  if (loading) {
    return (
      <div className="page">
        <div className="fade-up">
          <div className="badge skeleton" style={{ width: 140, height: 28, border: 'none' }}></div>
          <div className="section-title skeleton" style={{ marginTop: 16, width: '40%', height: 48, borderRadius: 8 }}></div>
          <div className="section-sub skeleton" style={{ width: '60%', height: 24, borderRadius: 8, marginTop: 8 }}></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginTop: 40 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card skeleton" style={{ padding: '32px 24px', height: 180, borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div className="skeleton" style={{ width: 64, height: 64, borderRadius: 16 }}></div>
              <div className="skeleton" style={{ width: '50%', height: 20, borderRadius: 4 }}></div>
              <div className="skeleton" style={{ width: '30%', height: 16, borderRadius: 4 }}></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Category Selection View
  if (!selectedCategory) {
    return (
      <div className="page">
        <SEO 
          title="O Level PDF Notes Free Download | NIELIT O Level Material — OLevelSarathi"
          description="NIELIT O Level PDF notes free download — M1-R5, M2-R5, M3-R5, M4-R5 aur CCC. Previous year solved papers, chapter-wise notes, MCQ sets Hindi aur English mein. OLevelSarathi.in par 2026 syllabus ke according."
          keywords="O Level PDF notes, O Level notes download, NIELIT O Level PDF, M1-R5 PDF, M2-R5 PDF, M3-R5 Python PDF, M4-R5 IoT PDF, CCC notes PDF, OLevelSarathi, O Level exam material free, NIELIT study material download"
          canonical="https://olevelsarathi.in/pdfs"
        />
        <Breadcrumbs />
        <div className="fade-up">
          <span className="badge" style={{ background: 'rgba(52,211,153,0.12)', color: 'var(--success)', borderColor: 'rgba(52,211,153,0.3)' }}>
            📄 Study Notes
          </span>
          <h1 className="section-title" style={{ marginTop: 10 }}>विषय चुनें</h1>
          <p className="section-sub">उच्च-गुणवत्ता की अध्ययन सामग्री डाउनलोड करने और पढ़ने के लिए एक विषय चुनें।</p>
          <div style={{ margin:'20px 0', padding:'20px 24px', background:'var(--bg-card)', borderRadius:14, border:'1px solid var(--border)', lineHeight:1.8, color:'var(--text-secondary)', fontSize:'0.95rem' }}>
            <p style={{ marginBottom:14 }}>परीक्षा की तैयारी में PDF नोट्स की अपनी अलग भूमिका होती है। जब इंटरैक्टिव नोट्स पढ़ने का समय न हो, या परीक्षा से एक रात पहले त्वरित पुनरावृत्ति करनी हो — तब PDF सबसे काम आता है। यहाँ उपलब्ध सभी PDF विशेष रूप से NIELIT की परीक्षा के पैटर्न के अनुसार बनाए गए हैं। प्रत्येक PDF में महत्वपूर्ण परिभाषाएँ, सूत्र, संक्षिप्त तरीके और बार-बार पूछे जाने वाले विषय संकलित हैं।</p>
            <p>M1-R5 के नेटवर्किंग शब्दों से लेकर M3-R5 के Python सिंटैक्स कार्ड तक, CCC के MS Office शॉर्टकट से लेकर पिछले वर्षों के हल किए गए प्रश्नपत्रों तक — सब कुछ एक क्लिक में डाउनलोड करें। फ़ोन पर सेव करें और बिना इंटरनेट के भी पढ़ें। अपना विषय चुनें और अपनी तैयारी को अगले स्तर पर ले जाएँ।</p>
          </div>
          {/* Ad after intro */}
          <AutoAd />
          <RelaxedAd />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginTop: 40 }}>
          {categoriesList.length > 0 ? (
            categoriesList.map((cat, i) => (
              <CategoryCard key={cat} category={cat} itemCount={categoryCounts[cat] || 0} onSelect={setSelectedCategory} index={i} />
            ))
          ) : (
            <div className="empty-state fade-in" style={{ gridColumn: '1 / -1' }}>
              <FiFileText size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
              <h3>No categories available</h3>
              <p>Notes will appear here once they are added.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Items List View
  return (
    <div className="page">
      <SEO 
        title={`${selectedCategory} PDF Notes Download | O Level Sarathi`}
        description={`${selectedCategory} ke PDF notes download karein — O Level exam ke liye complete study material. OLevelSarathi.in par free available.`}
        keywords={`${selectedCategory} PDF notes, ${selectedCategory} notes download, O Level ${selectedCategory}, NIELIT O Level notes, OLevelSarathi, O Level exam material`}
        canonical={`https://olevelsarathi.in/pdfs?category=${selectedCategory}`}
      />
      <div className="fade-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <button onClick={() => { setSelectedCategory(null); setSearch('') }}
            style={{
              background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer',
              fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
              transition: 'transform 0.2s', padding: '6px 0',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateX(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
          >
            ← Back to Subjects
          </button>
          
          <button 
            onClick={() => { localStorage.removeItem('fb_cache_Notifications'); window.location.reload() }}
            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: 8, background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            🔄 Sync Data
          </button>
        </div>
        <h1 className="section-title" style={{ marginTop: 10 }}>{selectedCategory}</h1>
        <p className="section-sub">
          इस विषय के नोट्स डाउनलोड करें और पढ़ें।
          <span style={{ fontSize: '0.7rem', opacity: 0.5, marginLeft: 10 }}>({filtered.length} नोट्स उपलब्ध)</span>
        </p>
      </div>

      <div className="fade-up stagger-1">
        <input className="search-bar" placeholder="🔍 Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state fade-in">
          <FiFileText size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
          <h3>No notes found</h3>
          <p>{search ? 'Try a different search term.' : 'No notes available in this subject yet.'}</p>
        </div>
      ) : (
        <>
          <div className="grid-3">
            {filtered.map(item => (
              <PDFCard key={item.id || item._key} item={item} />
            ))}
          </div>

          {filtered.length > 3 && (
            <div className="fade-up" style={{ marginTop: 40 }}>
              <h2 style={{ marginBottom: 12, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedCategory} के और नोट्स</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: 760, marginBottom: 24 }}>
                पूरे पाठ्यक्रम का अध्ययन करने के लिए इस विषय की शेष PDF सामग्री भी देखें।
              </p>
              <div className="grid-3">
                {filtered.slice(0, 3).map(item => (
                  <PDFCard key={`suggestion-${item.id || item._key}`} item={item} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
