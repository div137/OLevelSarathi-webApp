import { useState, useMemo } from 'react'
import { useFirebase } from '../hooks/useFirebase'
import { FiCode, FiExternalLink, FiDownload, FiFileText, FiX, FiTag, FiLoader } from 'react-icons/fi'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import { AutoAd, RelaxedAd } from '../components/GoogleAd'

/* ── Helpers for Secure Download ── */
function formatDownloadUrl(url) {
  if (!url) return ''
  let f = url.trim()
  
  // Google Drive
  if (f.includes('drive.google.com')) {
    const idMatch = f.match(/\/d\/([^/]+)/) || f.match(/id=([^&]+)/)
    if (idMatch) return `https://drive.google.com/uc?id=${idMatch[1]}&export=download`
  }
  
  // Cloudinary: Force Attachment
  if (f.includes('cloudinary.com')) {
    f = f.replace('http://', 'https://')
    const types = ['/raw/upload/', '/upload/', '/private/', '/authenticated/']
    for (const t of types) {
      if (f.includes(t) && !f.includes('fl_attachment')) {
        return f.replace(t, `${t}fl_attachment/`)
      }
    }
  }
  
  return f
}

/* ── Project Detail Modal ── */
function ProjectModal({ project, onClose }) {
  const [downloading, setDownloading] = useState(false)

  const handleDownloadClick = async () => {
    if (!project.fileUrl) return
    setDownloading(true)
    try {
      const url = formatDownloadUrl(project.fileUrl)
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${project.title || 'Project'}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(blobUrl)
      document.body.removeChild(a)
    } catch (err) {
      // Fallback for CORS
      window.open(formatDownloadUrl(project.fileUrl), '_blank')
    } finally {
      setDownloading(false)
    }
  }

  const techStack = project.techStack
    ? typeof project.techStack === 'object'
      ? Object.values(project.techStack)
      : [project.techStack]
    : []

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 720 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.2rem', flex: 1, paddingRight: 12 }}>
            {project.title}
          </h2>
          <button className="btn btn-ghost" style={{ padding: '6px 10px', flexShrink: 0 }} onClick={onClose}>
            <FiX size={16} />
          </button>
        </div>

        {/* Image */}
        {project.imageUrl && (
          <img
            src={project.imageUrl}
            alt={project.title}
            style={{ width: '100%', borderRadius: 12, marginBottom: 20, maxHeight: 280, objectFit: 'cover' }}
          />
        )}

        {/* Tech stack */}
        {techStack.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {techStack.map((t, i) => (
              <span key={i} style={{
                padding: '4px 12px', borderRadius: 100,
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.25)',
                color: '#a78bfa', fontSize: '0.8rem', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <FiTag size={10} /> {t}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {project.description && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 22, whiteSpace: 'pre-line' }}>
            {project.description.replace(/[🎯✅]/g, '')}
          </p>
        )}

        {project.price && (
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)' }}>
              ₹{project.price}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: 8 }}>one-time</span>
          </div>
        )}

        {/* App Promo / Purchase Info */}
        <div style={{ 
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)', 
          borderRadius: 18, padding: '24px', marginBottom: 24,
          textAlign: 'center', color: '#fff', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)'
        }}>
          <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>🛒</div>
          <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800 }}>Buy This Project</h4>
          <p style={{ margin: '0 0 20px', fontSize: '0.9rem', opacity: 0.9 }}>
            Project files and reports are available exclusively on our official Android Application.
          </p>
          <a 
            href="https://github.com/div137/application-olevel/raw/main/sarathi_5_0_0.apk"
            className="btn"
            style={{ 
              background: '#fff', color: 'var(--accent)', padding: '12px 24px', 
              fontSize: '0.95rem', fontWeight: 700, borderRadius: 12, width: '100%' 
            }}
          >
            Download App to Purchase
          </a>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {project.demoUrl && (
            <button 
              onClick={() => {
                const demo = project.demoUrl
                const isHtml = demo.toLowerCase().includes('<!doctype') || demo.toLowerCase().includes('<html')
                
                if (isHtml) {
                  const win = window.open('', '_blank', 'width=1000,height=800,menubar=no,status=no,toolbar=no')
                  if (win) {
                    win.document.write(`
                      <html>
                        <head>
                          <title>Project Preview - ${project.title}</title>
                          <style>
                            body { margin: 0; padding: 20px; background: #fff; color: #000; font-family: sans-serif; }
                            #demo-content { max-width: 1200px; margin: 0 auto; }
                          </style>
                        </head>
                        <body oncontextmenu="return false;">
                          <div id="demo-content">${demo}</div>
                          <script>
                            document.addEventListener('keydown', e => {
                              if (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'i' || e.key === 'j')) {
                                e.preventDefault();
                                return false;
                              }
                              if (e.key === 'F12') {
                                e.preventDefault();
                                return false;
                              }
                            });
                            document.onselectstart = () => false;
                          </script>
                        </body>
                      </html>
                    `)
                    win.document.close()
                  }
                } else {
                  window.open(demo, '_blank')
                }
              }}
              className="btn btn-ghost"
              style={{ width: '100%', height: 48, borderRadius: 12 }}
            >
              <FiExternalLink size={16} /> View Live Demo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Project Card ── */
function ProjectCard({ project, onOpen }) {
  const [hov, setHov] = useState(false)
  const techStack = project.techStack
    ? typeof project.techStack === 'object'
      ? Object.values(project.techStack)
      : [project.techStack]
    : []

  return (
    <div
      className="card"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'pointer' }}
      onClick={() => onOpen(project)}
    >
      {/* Image */}
      <div style={{ height: 190, background: 'var(--bg-card2)', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', transform: hov ? 'scale(1.06)' : 'scale(1)' }}
          />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', background: 'linear-gradient(135deg, #4caf5018, #4caf5030)' }}>
            💻
          </div>
        )}
        {/* Price badge */}
        {project.price && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(76,175,80,0.9)', backdropFilter: 'blur(6px)',
            borderRadius: 999, padding: '4px 13px',
            color: '#fff', fontWeight: 800, fontSize: '0.82rem',
          }}>
            ₹{project.price}
          </div>
        )}
        {/* Hover overlay */}
        {hov && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(76,175,80,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: '#4caf50', color: '#fff', padding: '8px 20px', borderRadius: 10, fontWeight: 800, fontSize: '0.85rem' }}>View Details →</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <h3 style={{ fontWeight: 800, lineHeight: 1.35, fontSize: '0.97rem', color: 'var(--text-primary)' }}>
          {project.title}
        </h3>
        {techStack.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {techStack.slice(0, 4).map((t, i) => (
              <span key={i} style={{ padding: '2px 9px', borderRadius: 999, background: 'rgba(76,175,80,0.12)', color: '#4caf50', fontSize: '0.72rem', fontWeight: 700 }}>{t}</span>
            ))}
            {techStack.length > 4 && <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', padding: '2px 6px' }}>+{techStack.length - 4}</span>}
          </div>
        )}
        <button
          className="btn btn-primary"
          onClick={e => { e.stopPropagation(); onOpen(project) }}
          style={{ marginTop: 'auto', width: '100%' }}
        >
          View Details <FiExternalLink size={13} />
        </button>
      </div>
    </div>
  )
}

/* ── Main Projects Page ── */
export default function Projects() {
  const { data, loading } = useFirebase('Projects')
  const [selected, setSelected] = useState(null)
  const [search,   setSearch]   = useState('')

  const filtered = (data || []).filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <SEO 
        title="O Level Practical Projects | NIELIT O Level Exam Projects Free — OLevelSarathi"
        description="NIELIT O Level practical projects aur source code free download — M1-R5 IT Tools, M2-R5 Web Design, M3-R5 Python, M4-R5 IoT. O Level exam ke liye step-by-step project guides. OLevelSarathi.in"
        keywords="O Level projects, O Level practical projects, NIELIT O Level projects free, M3-R5 Python project, M2-R5 web design project, M4-R5 IoT project, OLevelSarathi projects, O Level exam practical, NIELIT practical exam solutions, O Level source code"
        canonical="https://olevelsarathi.in/projects"
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "NIELIT O-Level Practical Projects & Solutions Collection",
          "description": "Comprehensive collection of practical projects, source code, and assignments for NIELIT O-Level modules.",
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": filtered.slice(0, 5).map((p, i) => ({
              "@type": "ListItem",
              "position": i + 1,
              "name": p.title
            }))
          }
        }}
      />
      <Breadcrumbs />
      <div className="fade-up">
        <span className="badge" style={{ background: 'rgba(251,191,36,0.1)', color: 'var(--warning)', borderColor: 'rgba(251,191,36,0.3)' }}>
          💻 Projects
        </span>
        <h1 className="section-title" style={{ marginTop: 10 }}>वास्तविक परियोजनाएँ</h1>
        <p className="section-sub">उद्योग-स्तरीय परियोजना प्रस्तुतियाँ देखें, डाउनलोड करें और उनसे सीखें।</p>
        <div style={{ margin:'20px 0', padding:'20px 24px', background:'var(--bg-card)', borderRadius:14, border:'1px solid var(--border)', lineHeight:1.8, color:'var(--text-secondary)', fontSize:'0.95rem' }}>
          <p style={{ marginBottom:14 }}>O Level की प्रायोगिक परीक्षा केवल सिद्धांत जानने से उत्तीर्ण नहीं होती — वास्तविक व्यावहारिक अभ्यास आवश्यक है। यहाँ उपलब्ध परियोजनाएँ वास्तविक NIELIT प्रायोगिक परीक्षा के अनुसार तैयार की गई हैं। प्रत्येक परियोजना में स्रोत कोड, रिपोर्ट प्रारूप और प्रस्तुति दिशानिर्देश शामिल हैं। शुरुआती स्तर के उदाहरणों से लेकर उन्नत कार्यान्वयन तक — सब कुछ चरणबद्ध तरीके से समझाया गया है।</p>
          <p>Python में एक बुनियादी कैलकुलेटर बनाना हो, HTML/CSS से उत्तरदायी वेबपेज डिज़ाइन करनी हो, LibreOffice में डेटा प्रबंधन परियोजना बनानी हो, या IoT के लिए सरल सेंसर सर्किट डिज़ाइन करनी हो — हर चीज़ का उदाहरण यहाँ मिलेगा। इन परियोजनाओं का गंभीरता से अभ्यास करें — परीक्षक वही देखता है जो आप व्यावहारिक रूप से कर सकते हैं, केवल याद किया हुआ नहीं।</p>
        </div>
        {/* Ad after intro */}
        <AutoAd />
      </div>

      <input
        className="search-bar"
        placeholder="🔍 Search projects..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="grid-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card skeleton" style={{ display: 'flex', flexDirection: 'column', height: 320, borderRadius: 20 }}>
              <div className="skeleton" style={{ height: 180, border: 'none', borderRadius: 0 }}></div>
              <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                <div className="skeleton" style={{ width: '80%', height: 20, borderRadius: 4, border: 'none' }}></div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div className="skeleton" style={{ width: 50, height: 20, borderRadius: 100, border: 'none' }}></div>
                  <div className="skeleton" style={{ width: 60, height: 20, borderRadius: 100, border: 'none' }}></div>
                </div>
                <div className="skeleton" style={{ width: '100%', height: 36, borderRadius: 12, marginTop: 'auto', border: 'none' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FiCode size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
          <h3>No projects found</h3>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(p => (
            <ProjectCard key={p.id || p._key} project={p} onOpen={setSelected} />
          ))}
        </div>
      )}

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}

      {/* Ad — bottom of projects */}
      <RelaxedAd />
    </div>
  )
}
