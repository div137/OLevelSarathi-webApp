import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useBlogManagement } from '../hooks/useBlogManagement'
import SEO from '../components/SEO'
import {
  FiArrowLeft, FiCalendar, FiClock, FiUser, FiTag,
  FiChevronRight, FiBookOpen, FiList, FiShare2, FiTwitter,
  FiExternalLink, FiArrowUp,
} from 'react-icons/fi'
import { AutoAd, RelaxedAd } from '../components/GoogleAd'

// ─────────────────────────────────────────────────────────────
// CSS styles injected once
// ─────────────────────────────────────────────────────────────
const BLOG_STYLES = `
  /* Layout */
  .bd-wrap   { max-width:1220px; margin:0 auto; padding:32px 20px 72px; }
  .bd-grid   { display:grid; grid-template-columns:1fr 290px; gap:36px; align-items:start; }
  @media(max-width:960px){ .bd-grid{ grid-template-columns:1fr; } .bd-sidebar{ display:none !important; } }

  /* Article typography */
  .bd-prose { font-size:1.05rem; line-height:1.88; color:var(--text-secondary); }
  .bd-prose h2 { font-size:1.55rem; font-weight:900; color:var(--text-primary); margin:40px 0 14px;
    padding-bottom:10px; border-bottom:2px solid var(--border); line-height:1.25; }
  .bd-prose h3 { font-size:1.22rem; font-weight:800; color:var(--text-primary); margin:32px 0 10px; line-height:1.3; }
  .bd-prose h4 { font-size:1.05rem; font-weight:700; color:var(--text-primary); margin:24px 0 8px; }
  .bd-prose p  { margin-bottom:18px; }
  .bd-prose ul, .bd-prose ol { margin:0 0 18px 0; padding-left:24px; }
  .bd-prose li { margin-bottom:8px; }
  .bd-prose strong { color:var(--text-primary); font-weight:700; }
  .bd-prose em { color:var(--accent); font-style:italic; }
  .bd-prose a  { color:var(--accent); text-decoration:underline; text-underline-offset:3px; }
  .bd-prose a:hover { opacity:.8; }
  .bd-prose blockquote {
    border-left:4px solid var(--accent); margin:24px 0;
    padding:14px 20px; background:var(--accent-glow);
    border-radius:0 10px 10px 0; font-style:italic;
    color:var(--text-secondary);
  }
  .bd-prose blockquote p { margin:0; }
  .bd-prose code {
    font-family:'Fira Code','Cascadia Code',monospace;
    font-size:.88em; background:var(--bg-card2);
    padding:2px 7px; border-radius:5px; color:#e879f9;
    border:1px solid var(--border);
  }
  .bd-prose pre {
    background:var(--bg-card2); border:1px solid var(--border);
    border-radius:12px; padding:20px 22px; overflow-x:auto;
    margin:20px 0; position:relative;
  }
  .bd-prose pre code {
    background:none; border:none; padding:0;
    color:#a5f3fc; font-size:.9rem; line-height:1.65;
  }
  .bd-prose img { width:100%; border-radius:12px; margin:20px 0; border:1px solid var(--border); }
  .bd-prose table { width:100%; border-collapse:collapse; margin:20px 0; font-size:.9rem; }
  .bd-prose th { background:var(--bg-card2); color:var(--text-primary); font-weight:700;
    padding:10px 14px; text-align:left; border:1px solid var(--border); }
  .bd-prose td { padding:9px 14px; border:1px solid var(--border); color:var(--text-secondary); }
  .bd-prose tr:nth-child(even) td { background:var(--bg-card2)22; }
  .bd-prose hr { border:none; border-top:2px solid var(--border); margin:32px 0; }

  /* Callout boxes created via special syntax > [!NOTE] etc */
  .bd-callout { border-radius:12px; padding:16px 20px; margin:20px 0;
    border-left:4px solid; font-size:.95rem; }
  .bd-callout-info    { background:rgba(59,130,246,.08);  border-color:#3b82f6; color:#93c5fd; }
  .bd-callout-warn    { background:rgba(245,158,11,.08); border-color:#f59e0b; color:#fcd34d; }
  .bd-callout-success { background:rgba(16,185,129,.08); border-color:#10b981; color:#6ee7b7; }
  .bd-callout-danger  { background:rgba(239,68,68,.08);  border-color:#ef4444; color:#fca5a5; }

  /* Sidebar */
  .bd-sidebar { position:sticky; top:88px; max-height:calc(100vh - 108px); overflow-y:auto;
    scrollbar-width:thin; scrollbar-color:var(--border) transparent; }
  .bd-scard { background:var(--bg-card); border:1px solid var(--border);
    border-radius:16px; overflow:hidden; margin-bottom:18px; }
  .bd-scard-head { padding:13px 16px; background:var(--bg-card2);
    border-bottom:1px solid var(--border); display:flex; align-items:center; gap:8px; }
  .bd-scat-btn { width:100%; display:flex; align-items:center; justify-content:space-between;
    padding:10px 16px; border:none; background:none; cursor:pointer;
    border-bottom:1px solid var(--border); transition:background .15s; }
  .bd-scat-btn:hover { background:var(--bg-card2); }
  .bd-spost-link { display:flex; align-items:flex-start; gap:9px; padding:9px 16px 9px 28px;
    text-decoration:none; transition:all .15s; border-left:3px solid transparent; }
  .bd-spost-link:hover { background:var(--bg-card2); }
  .bd-spost-link.current { background:var(--accent-glow); border-left-color:var(--accent); }

  /* Related cards */
  .bd-related-card { background:var(--bg-card); border:1.5px solid var(--border);
    border-radius:16px; overflow:hidden; transition:all .25s cubic-bezier(.16,1,.3,1);
    text-decoration:none; display:block; }
  .bd-related-card:hover { border-color:var(--accent); transform:translateY(-4px);
    box-shadow:0 12px 28px rgba(0,0,0,.14); }
  .bd-related-card:hover .bd-rc-img { transform:scale(1.06); }
  .bd-rc-img { width:100%; height:100%; object-fit:cover; transition:transform .4s ease; }

  /* Share buttons */
  .bd-share-btn { display:inline-flex; align-items:center; gap:6px; padding:7px 14px;
    border-radius:9px; font-size:.8rem; font-weight:700; cursor:pointer;
    border:1px solid var(--border); background:var(--bg-card2);
    color:var(--text-secondary); transition:all .2s; text-decoration:none; }
  .bd-share-btn:hover { border-color:var(--accent); color:var(--accent); background:var(--accent-glow); }

  /* Back-to-top */
  .bd-top-btn { position:fixed; bottom:28px; right:28px; z-index:500;
    width:42px; height:42px; border-radius:50%; background:var(--accent);
    color:#fff; border:none; cursor:pointer; display:flex; align-items:center;
    justify-content:center; box-shadow:0 6px 18px rgba(76,175,80,.45);
    transition:all .2s; opacity:0; pointer-events:none; }
  .bd-top-btn.visible { opacity:1; pointer-events:all; }
  .bd-top-btn:hover { transform:translateY(-3px); box-shadow:0 10px 24px rgba(76,175,80,.55); }
`

// ─────────────────────────────────────────────────────────────
// Content parser — plain text + # headings + - lists + HTML pass-through
// ─────────────────────────────────────────────────────────────
function parseContent(raw = '') {
  if (!raw.trim()) return ''
  // If it already looks like HTML, pass through directly
  if (raw.trim().startsWith('<')) return raw

  const lines = raw.split('\n')
  const out   = []
  let inList  = false

  lines.forEach(line => {
    const t = line.trim()

    // Headings
    const hMatch = t.match(/^(#{1,4})\s+(.+)/)
    if (hMatch) {
      if (inList) { out.push('</ul>'); inList = false }
      const lvl = Math.min(hMatch[1].length + 1, 5)
      out.push(`<h${lvl}>${hMatch[2]}</h${lvl}>`)
      return
    }
    // Horizontal rule
    if (/^---+$/.test(t)) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push('<hr/>')
      return
    }
    // Blockquote
    if (t.startsWith('> ')) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(`<blockquote><p>${t.slice(2)}</p></blockquote>`)
      return
    }
    // Unordered list
    if (t.startsWith('- ') || t.startsWith('* ')) {
      if (!inList) { out.push('<ul>'); inList = true }
      out.push(`<li>${t.slice(2)}</li>`)
      return
    }
    // Empty line
    if (!t) {
      if (inList) { out.push('</ul>'); inList = false }
      return
    }
    // Paragraph
    if (inList) { out.push('</ul>'); inList = false }
    // Inline: **bold**, *italic*, `code`
    const inline = t
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,     '<em>$1</em>')
      .replace(/`(.+?)`/g,       '<code>$1</code>')
    out.push(`<p>${inline}</p>`)
  })

  if (inList) out.push('</ul>')
  return out.join('\n')
}

// ─────────────────────────────────────────────────────────────
// Right Sidebar
// ─────────────────────────────────────────────────────────────
function Sidebar({ blogs, currentBlog }) {
  const [openCat, setOpenCat] = useState(currentBlog?.category || null)

  const grouped = useMemo(() => {
    return blogs.reduce((acc, b) => {
      const cat = b.category || 'General'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(b)
      return acc
    }, {})
  }, [blogs])

  const cats = Object.keys(grouped).sort()

  return (
    <aside className="bd-sidebar">
      {/* Category browser card */}
      <div className="bd-scard">
        <div className="bd-scard-head">
          <FiList size={14} style={{ color:'var(--accent)' }}/>
          <span style={{ fontWeight:800, fontSize:'.85rem', color:'var(--text-primary)' }}>
            Browse by Category
          </span>
        </div>

        {cats.map(cat => {
          const isOpen = openCat === cat
          const posts  = grouped[cat]
          return (
            <div key={cat}>
              <button className="bd-scat-btn" onClick={() => setOpenCat(isOpen ? null : cat)}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:8,height:8,borderRadius:'50%',background:isOpen?'var(--accent)':'var(--text-muted)',transition:'background .2s',flexShrink:0 }}/>
                  <span style={{ fontWeight:700,fontSize:'.82rem',color:isOpen?'var(--accent)':'var(--text-secondary)' }}>{cat}</span>
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                  <span style={{ fontSize:'.68rem',fontWeight:700,color:'var(--text-muted)',background:'var(--bg-primary)',padding:'1px 7px',borderRadius:999,border:'1px solid var(--border)' }}>
                    {posts.length}
                  </span>
                  <FiChevronRight size={12} style={{ color:'var(--text-muted)',transform:isOpen?'rotate(90deg)':'none',transition:'transform .2s' }}/>
                </div>
              </button>

              {isOpen && posts.map(post => {
                const cur = (post.slug||post.id) === (currentBlog?.slug||currentBlog?.id)
                return (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug||post.id}`}
                    className={`bd-spost-link${cur?' current':''}`}
                  >
                    <FiBookOpen size={11} style={{ color:cur?'var(--accent)':'var(--text-muted)',marginTop:3,flexShrink:0 }}/>
                    <span style={{
                      fontSize:'.77rem',lineHeight:1.45,
                      color:cur?'var(--accent)':'var(--text-secondary)',
                      fontWeight:cur?700:500,
                      display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'
                    }}>{post.title}</span>
                  </Link>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Latest posts card */}
      <div className="bd-scard">
        <div className="bd-scard-head">
          <FiBookOpen size={14} style={{ color:'var(--accent)' }}/>
          <span style={{ fontWeight:800,fontSize:'.85rem',color:'var(--text-primary)' }}>Latest Posts</span>
        </div>
        {blogs.slice(0,5).map(post => {
          const cur = (post.slug||post.id) === (currentBlog?.slug||currentBlog?.id)
          return (
            <Link
              key={post.id}
              to={`/blog/${post.slug||post.id}`}
              style={{
                display:'flex',gap:10,padding:'11px 16px',textDecoration:'none',
                borderBottom:'1px solid var(--border)',transition:'background .15s',
                background: cur ? 'var(--accent-glow)' : 'transparent',
              }}
              onMouseEnter={e=>{ if(!cur) e.currentTarget.style.background='var(--bg-card2)' }}
              onMouseLeave={e=>{ if(!cur) e.currentTarget.style.background='transparent' }}
            >
              {post.image
                ? <img src={post.image} alt={post.title} style={{ width:48,height:48,borderRadius:8,objectFit:'cover',flexShrink:0 }}/>
                : <div style={{ width:48,height:48,borderRadius:8,background:'var(--accent-glow)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'1.2rem' }}>✍️</div>
              }
              <div>
                <div style={{ fontSize:'.78rem',fontWeight:cur?700:600,color:cur?'var(--accent)':'var(--text-primary)',lineHeight:1.4,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden' }}>
                  {post.title}
                </div>
                {post.date && <div style={{ fontSize:'.68rem',color:'var(--text-muted)',marginTop:4 }}>{post.date}</div>}
              </div>
            </Link>
          )
        })}
      </div>
    </aside>
  )
}

// ─────────────────────────────────────────────────────────────
// Related post card
// ─────────────────────────────────────────────────────────────
function RelatedCard({ post }) {
  return (
    <Link to={`/blog/${post.slug||post.id}`} className="bd-related-card">
      <div style={{ height:150,overflow:'hidden',background:'var(--bg-card2)',display:'flex',alignItems:'center',justifyContent:'center' }}>
        {post.image
          ? <img src={post.image} alt={post.title} className="bd-rc-img"/>
          : <span style={{ fontSize:'2.4rem' }}>✍️</span>
        }
      </div>
      <div style={{ padding:'13px 15px' }}>
        {post.category && (
          <span style={{ fontSize:'.67rem',fontWeight:800,color:'var(--accent)',background:'var(--accent-glow)',padding:'2px 9px',borderRadius:999,display:'inline-block',marginBottom:7 }}>
            {post.category}
          </span>
        )}
        <h3 style={{ fontWeight:800,fontSize:'.9rem',color:'var(--text-primary)',lineHeight:1.4,marginBottom:7,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden' }}>
          {post.title}
        </h3>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'.7rem',color:'var(--text-muted)' }}>
          <span>{post.date||''}</span>
          <span style={{ color:'var(--accent)',fontWeight:700,display:'flex',alignItems:'center',gap:3 }}>
            Read <FiChevronRight size={11}/>
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─────────────────────────────────────────────────────────────
// Main BlogDetail
// ─────────────────────────────────────────────────────────────
export default function BlogDetail() {
  const { slug }  = useParams()
  const navigate  = useNavigate()
  const { blogs } = useBlogManagement()

  const [blog, setBlog]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    if (blogs.length > 0) {
      const found = blogs.find(b => b.slug === slug || b.id === slug)
      setBlog(found || null)
      setLoading(false)
    }
  }, [slug, blogs])

  useEffect(() => { window.scrollTo(0,0) }, [slug])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive:true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Loading skeleton ──
  if (loading) return (
    <div style={{ paddingTop:100, maxWidth:900, margin:'0 auto', padding:'100px 20px 60px' }}>
      {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height:i===1?48:20,borderRadius:8,marginBottom:16,width:i===2?'55%':i===3?'35%':'100%' }}/>)}
      <div className="skeleton" style={{ height:320,borderRadius:16,marginTop:24 }}/>
    </div>
  )

  // ── Not found ──
  if (!blog) return (
    <div style={{ paddingTop:100,minHeight:'70vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16,textAlign:'center',padding:'100px 20px' }}>
      <span style={{ fontSize:'4rem' }}>📄</span>
      <h1 style={{ fontSize:'1.8rem',fontWeight:900 }}>Blog Not Found</h1>
      <p style={{ color:'var(--text-secondary)' }}>Ye post exist nahi karta ya delete ho gaya।</p>
      <button onClick={() => navigate('/blog')} className="btn btn-primary">← Back to Blog</button>
    </div>
  )

  // ── SEO schema ──
  const schema = {
    '@context':'https://schema.org', '@type':'BlogPosting',
    headline: blog.title,
    description: blog.excerpt || blog.title,
    image: blog.image,
    datePublished: blog.createdAt || new Date().toISOString(),
    dateModified:  blog.updatedAt || blog.createdAt || new Date().toISOString(),
    author: { '@type':'Person', name: blog.author || 'O Level Sarathi' },
    publisher: { '@type':'Organization', name:'O Level Sarathi', url:'https://olevelsarathi.in',
      logo: { '@type':'ImageObject', url:'https://olevelsarathi.in/logo.png' } },
    mainEntityOfPage: { '@type':'WebPage', '@id': blog.canonical || `https://olevelsarathi.in/blog/${slug}` },
    keywords: blog.keywords,
    articleSection: blog.category,
  }

  // Related posts
  const related = blogs
    .filter(b => b.category === blog.category && (b.slug||b.id) !== slug)
    .slice(0,4)
  const toShow = related.length >= 2 ? related
    : blogs.filter(b => (b.slug||b.id) !== slug).slice(0,4)

  const bodyHtml = parseContent(blog.content)

  const shareUrl   = typeof window !== 'undefined' ? window.location.href : `https://olevelsarathi.in/blog/${slug}`
  const shareTitle = encodeURIComponent(blog.title)

  return (
    <main style={{ paddingTop:70, minHeight:'100vh' }}>
      <style>{BLOG_STYLES}</style>

      <SEO
        title={`${blog.title} | O Level Sarathi`}
        description={blog.excerpt || blog.title}
        keywords={blog.keywords}
        canonical={blog.canonical || `https://olevelsarathi.in/blog/${slug}`}
        ogImage={blog.image}
        schema={schema}
      />

      <div className="bd-wrap">

        {/* ── Back bar ── */}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:10 }}>
          <button onClick={() => navigate('/blog')}
            style={{ display:'inline-flex',alignItems:'center',gap:7,background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,padding:'8px 16px',color:'var(--text-secondary)',cursor:'pointer',fontWeight:600,fontSize:'.85rem',transition:'all .2s' }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)' }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)' }}
          >
            <FiArrowLeft size={14}/> All Blogs
          </button>
          {/* Share buttons */}
          <div style={{ display:'flex',gap:8 }}>
            <a href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank" rel="noopener noreferrer" className="bd-share-btn">
              <FiTwitter size={13}/> Twitter
            </a>
            <button className="bd-share-btn"
              onClick={() => navigator.clipboard?.writeText(shareUrl).then(()=>alert('Link copied!'))}
            >
              <FiShare2 size={13}/> Copy Link
            </button>
          </div>
        </div>

        {/* ── Main 2-col grid ── */}
        <div className="bd-grid">

          {/* LEFT: Article */}
          <div style={{ minWidth:0 }}>
            <article>
              {/* Category badge */}
              {blog.category && (
                <span style={{ display:'inline-flex',alignItems:'center',gap:5,marginBottom:14,fontSize:'.73rem',fontWeight:800,color:'var(--accent)',background:'var(--accent-glow)',padding:'4px 13px',borderRadius:999,border:'1px solid var(--accent)33' }}>
                  <FiTag size={11}/> {blog.category}
                </span>
              )}

              {/* Title */}
              <h1 style={{ fontSize:'clamp(1.55rem,4.5vw,2.5rem)',fontWeight:900,lineHeight:1.18,marginBottom:16,color:'var(--text-primary)',letterSpacing:'-.02em' }}>
                {blog.title}
              </h1>

              {/* Excerpt */}
              {blog.excerpt && (
                <p style={{ fontSize:'1.05rem',color:'var(--text-muted)',lineHeight:1.7,marginBottom:18,borderLeft:'3px solid var(--accent)',paddingLeft:14,fontStyle:'italic' }}>
                  {blog.excerpt}
                </p>
              )}

              {/* Meta row */}
              <div style={{ display:'flex',gap:16,flexWrap:'wrap',fontSize:'.82rem',color:'var(--text-muted)',marginBottom:28,paddingBottom:18,borderBottom:'1px solid var(--border)' }}>
                {blog.author   && <span style={{ display:'flex',alignItems:'center',gap:5 }}><FiUser size={13}/>{blog.author}</span>}
                {blog.date     && <span style={{ display:'flex',alignItems:'center',gap:5 }}><FiCalendar size={13}/>{blog.date}</span>}
                {blog.readTime && <span style={{ display:'flex',alignItems:'center',gap:5 }}><FiClock size={13}/>{blog.readTime}</span>}
                {blog.category && <span style={{ display:'flex',alignItems:'center',gap:5 }}><FiTag size={13}/>{blog.category}</span>}
              </div>

              {/* Hero image */}
              {blog.image && (
                <div style={{ width:'100%',aspectRatio:'16/7',borderRadius:18,overflow:'hidden',marginBottom:32,border:'1px solid var(--border)',boxShadow:'0 8px 32px rgba(0,0,0,.12)' }}>
                  <img src={blog.image} alt={blog.title} style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
                </div>
              )}

              <AutoAd/>

              {/* Body content */}
              <div className="bd-prose" dangerouslySetInnerHTML={{ __html: bodyHtml }} style={{ marginTop:24 }}/>

              {/* Keywords */}
              {blog.keywords && (
                <div style={{ marginTop:36,padding:'16px 20px',background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:14 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:12 }}>
                    <FiTag size={14} style={{ color:'var(--accent)' }}/>
                    <span style={{ fontWeight:800,fontSize:'.85rem',color:'var(--text-primary)' }}>Tags</span>
                  </div>
                  <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                    {blog.keywords.split(',').map((kw,i) => (
                      <span key={i} style={{ background:'var(--bg-card2)',color:'var(--text-secondary)',padding:'4px 12px',borderRadius:999,fontSize:'.78rem',fontWeight:600,border:'1px solid var(--border)' }}>
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>

            <RelaxedAd/>

            {/* Related posts */}
            {toShow.length > 0 && (
              <section style={{ marginTop:52 }}>
                <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:22 }}>
                  <div style={{ width:4,height:26,borderRadius:3,background:'linear-gradient(180deg,var(--accent),var(--accent)55)' }}/>
                  <div>
                    <h2 style={{ fontWeight:900,fontSize:'1.1rem',color:'var(--text-primary)',margin:0 }}>
                      {related.length>=2 ? `More in "${blog.category}"` : 'You May Also Like'}
                    </h2>
                    <p style={{ fontSize:'.75rem',color:'var(--text-muted)',marginTop:2 }}>
                      {related.length>=2 ? 'Same category ke aur articles' : 'Latest published blogs'}
                    </p>
                  </div>
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:16 }}>
                  {toShow.map(post => <RelatedCard key={post.id} post={post}/>)}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT: Sidebar */}
          <Sidebar blogs={blogs} currentBlog={blog}/>

        </div>
      </div>

      {/* Back to top */}
      <button className={`bd-top-btn${showTop?' visible':''}`}
        onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}
        aria-label="Back to top"
      >
        <FiArrowUp size={18}/>
      </button>
    </main>
  )
}
