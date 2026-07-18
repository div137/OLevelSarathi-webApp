/**
 * Static Blog Page Generator — O Level Sarathi
 * 
 * Usage: node scripts/generate-blog-pages.js
 * 
 * Fetches all published blog posts from Firebase RTDB and generates
 * fully SEO-optimized static HTML files in dist/blog/[slug].html
 * Also generates dist/blog/index.html (blog listing page)
 */

import { initializeApp } from 'firebase/app'
import { getDatabase, ref, get } from 'firebase/database'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST_BLOG = join(ROOT, 'dist', 'blog')

// ── Firebase config ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: 'AIzaSyANlX-0ZePklhDK1MAndTnla53sIeT4DJM',
  authDomain: 'tic-tic-ta.firebaseapp.com',
  databaseURL: 'https://tic-tic-ta-default-rtdb.firebaseio.com',
  projectId: 'tic-tic-ta',
  storageBucket: 'tic-tic-ta.firebasestorage.app',
  messagingSenderId: '626543464326',
  appId: '1:626543464326:web:b2e5d1665247b0bf3ce607',
}

const SITE_URL = 'https://olevelsarathi.in'
const SITE_NAME = 'O Level Sarathi'
const ADSENSE_CLIENT = 'ca-pub-7027141927778682'
const ADSENSE_SLOT_AUTO = '4071494566'
const ADSENSE_SLOT_RELAXED = '7315504925'
const LOGO_URL = `${SITE_URL}/logo.png`

// ── Content parser (mirrors BlogDetail.jsx parseContent) ─────────────────────
function parseContent(raw = '') {
  if (!raw.trim()) return ''
  if (raw.trim().startsWith('<')) return raw

  const lines = raw.split('\n')
  const out = []
  let inList = false

  lines.forEach(line => {
    const t = line.trim()
    const hMatch = t.match(/^(#{1,4})\s+(.+)/)
    if (hMatch) {
      if (inList) { out.push('</ul>'); inList = false }
      const lvl = Math.min(hMatch[1].length + 1, 5)
      const id = hMatch[2].toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      out.push(`<h${lvl} id="${id}">${hMatch[2]}</h${lvl}>`)
      return
    }
    if (/^---+$/.test(t)) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push('<hr/>')
      return
    }
    if (t.startsWith('> ')) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(`<blockquote><p>${t.slice(2)}</p></blockquote>`)
      return
    }
    if (t.startsWith('- ') || t.startsWith('* ')) {
      if (!inList) { out.push('<ul>'); inList = true }
      out.push(`<li>${t.slice(2)}</li>`)
      return
    }
    if (!t) {
      if (inList) { out.push('</ul>'); inList = false }
      return
    }
    if (inList) { out.push('</ul>'); inList = false }
    const inline = t
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
    out.push(`<p>${inline}</p>`)
  })

  if (inList) out.push('</ul>')
  return out.join('\n')
}

// ── Escape HTML for meta tags ────────────────────────────────────────────────
function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// ── Build table of contents from content headings ────────────────────────────
function buildTOC(html) {
  const items = []
  const regex = /<h([23])\s+id="([^"]+)">([^<]+)<\/h[23]>/g
  let m
  while ((m = regex.exec(html)) !== null) {
    items.push({ level: parseInt(m[1]), id: m[2], text: m[3] })
  }
  if (items.length < 2) return ''
  const tocItems = items.map(item =>
    `<li class="toc-l${item.level}"><a href="#${item.id}">${item.text}</a></li>`
  ).join('\n')
  return `
  <nav class="toc-box" aria-label="Table of Contents">
    <div class="toc-head">📋 Table of Contents</div>
    <ol>${tocItems}</ol>
  </nav>`
}

// ── Google AdSense unit HTML ──────────────────────────────────────────────────
function adUnit(slot, relaxed = false) {
  return `
  <div class="ad-wrap">
    <ins class="adsbygoogle"
      style="display:block"
      data-ad-client="${ADSENSE_CLIENT}"
      data-ad-slot="${slot}"
      ${relaxed ? 'data-ad-format="autorelaxed"' : 'data-ad-format="auto"\n      data-full-width-responsive="true"'}
    ></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
  </div>`
}

// ── Shared CSS for all static blog pages ─────────────────────────────────────
const SHARED_CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#f4fdf0;--bg-card:#ffffff;--bg-card2:#edfae5;
    --border:rgba(74,180,74,0.18);--accent:#4caf50;--accent2:#2e7d32;
    --accent-glow:rgba(76,175,80,0.14);
    --text:#1b2e1b;--text2:#3d5c3a;--text-muted:#7aa87a;
    --radius:16px;--shadow:0 10px 40px rgba(76,175,80,0.10);
  }
  html{scroll-behavior:smooth;font-size:16px}
  body{font-family:'Sora',system-ui,sans-serif;background:var(--bg);color:var(--text);
    line-height:1.6;overflow-x:hidden;min-height:100vh}

  /* ── NAV ── */
  .site-nav{position:fixed;top:0;left:0;right:0;z-index:100;
    background:rgba(244,253,240,0.92);backdrop-filter:blur(12px);
    border-bottom:1px solid var(--border);height:64px;
    display:flex;align-items:center;padding:0 24px;gap:16px}
  .site-nav a{color:var(--text2);font-weight:600;font-size:.9rem;text-decoration:none;transition:color .2s}
  .site-nav a:hover{color:var(--accent)}
  .site-nav .logo{display:flex;align-items:center;gap:8px;font-weight:900;font-size:1.05rem;color:var(--accent);margin-right:auto}
  .site-nav .logo img{width:32px;height:32px;border-radius:8px}
  .nav-btn{padding:7px 16px;background:var(--accent);color:#fff!important;
    border-radius:8px;font-weight:700!important;font-size:.82rem!important}

  /* ── LAYOUT ── */
  .page-wrap{max-width:1220px;margin:0 auto;padding:88px 20px 72px}
  .bd-grid{display:grid;grid-template-columns:1fr 290px;gap:36px;align-items:start}
  @media(max-width:960px){.bd-grid{grid-template-columns:1fr}.bd-sidebar{display:none!important}}

  /* ── ARTICLE PROSE ── */
  .bd-prose{font-size:1.05rem;line-height:1.88;color:var(--text2)}
  .bd-prose h2{font-size:1.55rem;font-weight:900;color:var(--text);margin:40px 0 14px;
    padding-bottom:10px;border-bottom:2px solid var(--border);line-height:1.25}
  .bd-prose h3{font-size:1.22rem;font-weight:800;color:var(--text);margin:32px 0 10px;line-height:1.3}
  .bd-prose h4{font-size:1.05rem;font-weight:700;color:var(--text);margin:24px 0 8px}
  .bd-prose p{margin-bottom:18px}
  .bd-prose ul,.bd-prose ol{margin:0 0 18px 0;padding-left:24px}
  .bd-prose li{margin-bottom:8px}
  .bd-prose strong{color:var(--text);font-weight:700}
  .bd-prose em{color:var(--accent);font-style:italic}
  .bd-prose a{color:var(--accent);text-decoration:underline;text-underline-offset:3px}
  .bd-prose blockquote{border-left:4px solid var(--accent);margin:24px 0;
    padding:14px 20px;background:var(--accent-glow);border-radius:0 10px 10px 0;font-style:italic}
  .bd-prose code{font-family:'Space Mono',monospace;font-size:.88em;
    background:var(--bg-card2);padding:2px 7px;border-radius:5px;
    color:#7c3aed;border:1px solid var(--border)}
  .bd-prose pre{background:var(--bg-card2);border:1px solid var(--border);
    border-radius:12px;padding:20px 22px;overflow-x:auto;margin:20px 0}
  .bd-prose pre code{background:none;border:none;padding:0;color:#2e7d32;font-size:.9rem;line-height:1.65}
  .bd-prose img{width:100%;border-radius:12px;margin:20px 0;border:1px solid var(--border)}
  .bd-prose table{width:100%;border-collapse:collapse;margin:20px 0;font-size:.9rem}
  .bd-prose th{background:var(--bg-card2);color:var(--text);font-weight:700;
    padding:10px 14px;text-align:left;border:1px solid var(--border)}
  .bd-prose td{padding:9px 14px;border:1px solid var(--border);color:var(--text2)}
  .bd-prose tr:nth-child(even) td{background:rgba(237,250,229,.5)}
  .bd-prose hr{border:none;border-top:2px solid var(--border);margin:32px 0}
`

const SHARED_CSS_2 = `
  /* ── TOC ── */
  .toc-box{background:var(--bg-card);border:1px solid var(--border);border-radius:14px;
    padding:20px 22px;margin:28px 0;font-size:.9rem}
  .toc-head{font-weight:800;color:var(--text);margin-bottom:12px;font-size:.95rem}
  .toc-box ol{padding-left:0;list-style:none;display:flex;flex-direction:column;gap:6px}
  .toc-box li a{color:var(--text2);text-decoration:none;transition:color .2s;
    display:block;padding:3px 0;border-left:2px solid transparent;padding-left:10px}
  .toc-box li a:hover{color:var(--accent);border-left-color:var(--accent)}
  .toc-l3{padding-left:16px!important}
  .toc-l3 a{font-size:.85rem}

  /* ── HERO IMAGE ── */
  .hero-img-wrap{width:100%;aspect-ratio:16/7;border-radius:18px;overflow:hidden;
    margin-bottom:32px;border:1px solid var(--border);box-shadow:0 8px 32px rgba(0,0,0,.08)}
  .hero-img-wrap img{width:100%;height:100%;object-fit:cover}

  /* ── META ROW ── */
  .meta-row{display:flex;gap:16px;flex-wrap:wrap;font-size:.82rem;color:var(--text-muted);
    margin-bottom:28px;padding-bottom:18px;border-bottom:1px solid var(--border)}
  .meta-row span{display:inline-flex;align-items:center;gap:5px}

  /* ── TAGS ── */
  .tags-box{margin-top:36px;padding:16px 20px;background:var(--bg-card);
    border:1px solid var(--border);border-radius:14px}
  .tags-box-head{display:flex;align-items:center;gap:7px;margin-bottom:12px;
    font-weight:800;font-size:.85rem;color:var(--text)}
  .tags-wrap{display:flex;gap:8px;flex-wrap:wrap}
  .tag{background:var(--bg-card2);color:var(--text2);padding:4px 12px;
    border-radius:999px;font-size:.78rem;font-weight:600;border:1px solid var(--border)}

  /* ── SHARE ── */
  .share-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px}
  .share-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;
    border-radius:9px;font-size:.8rem;font-weight:700;cursor:pointer;
    border:1px solid var(--border);background:var(--bg-card2);
    color:var(--text2);text-decoration:none;transition:all .2s}
  .share-btn:hover{border-color:var(--accent);color:var(--accent)}

  /* ── CATEGORY BADGE ── */
  .cat-badge{display:inline-flex;align-items:center;gap:5px;margin-bottom:14px;
    font-size:.73rem;font-weight:800;color:var(--accent);background:var(--accent-glow);
    padding:4px 13px;border-radius:999px;border:1px solid rgba(76,175,80,.2)}

  /* ── AD WRAP ── */
  .ad-wrap{width:100%;margin:20px 0;overflow:hidden}

  /* ── BACK BTN ── */
  .back-btn{display:inline-flex;align-items:center;gap:7px;background:var(--bg-card);
    border:1px solid var(--border);border-radius:10px;padding:8px 16px;
    color:var(--text2);text-decoration:none;font-weight:600;font-size:.85rem;
    transition:all .2s;margin-bottom:24px}
  .back-btn:hover{border-color:var(--accent);color:var(--accent)}

  /* ── SIDEBAR ── */
  .bd-sidebar{position:sticky;top:80px;max-height:calc(100vh - 100px);
    overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--border) transparent}
  .scard{background:var(--bg-card);border:1px solid var(--border);
    border-radius:16px;overflow:hidden;margin-bottom:18px}
  .scard-head{padding:13px 16px;background:var(--bg-card2);
    border-bottom:1px solid var(--border);font-weight:800;font-size:.85rem;color:var(--text)}
  .spost{display:flex;gap:10px;padding:11px 16px;text-decoration:none;
    border-bottom:1px solid var(--border);transition:background .15s;color:inherit}
  .spost:hover{background:var(--bg-card2)}
  .spost-thumb{width:48px;height:48px;border-radius:8px;object-fit:cover;flex-shrink:0}
  .spost-thumb-ph{width:48px;height:48px;border-radius:8px;background:var(--accent-glow);
    display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0}
  .spost-title{font-size:.78rem;font-weight:600;color:var(--text);
    line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;
    -webkit-box-orient:vertical;overflow:hidden}
  .spost-date{font-size:.68rem;color:var(--text-muted);margin-top:4px}

  /* ── RELATED ── */
  .related-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:16px;margin-top:16px}
  .rel-card{background:var(--bg-card);border:1.5px solid var(--border);
    border-radius:16px;overflow:hidden;text-decoration:none;display:block;
    transition:all .25s cubic-bezier(.16,1,.3,1)}
  .rel-card:hover{border-color:var(--accent);transform:translateY(-4px);
    box-shadow:0 12px 28px rgba(0,0,0,.1)}
  .rel-img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}
  .rel-img-ph{width:100%;aspect-ratio:16/9;background:var(--accent-glow);
    display:flex;align-items:center;justify-content:center;font-size:2.4rem}
  .rel-body{padding:13px 15px}
  .rel-cat{font-size:.67rem;font-weight:800;color:var(--accent);background:var(--accent-glow);
    padding:2px 9px;border-radius:999px;display:inline-block;margin-bottom:7px}
  .rel-title{font-weight:800;font-size:.9rem;color:var(--text);line-height:1.4;
    display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

  /* ── FOOTER ── */
  .site-footer{background:var(--bg-card);border-top:1px solid var(--border);
    padding:40px 24px 24px;margin-top:60px;text-align:center}
  .footer-links{display:flex;gap:20px;justify-content:center;flex-wrap:wrap;
    margin-bottom:16px;font-size:.85rem}
  .footer-links a{color:var(--text2);text-decoration:none;transition:color .2s}
  .footer-links a:hover{color:var(--accent)}
  .footer-copy{font-size:.78rem;color:var(--text-muted)}

  /* ── BACK TO TOP ── */
  #topBtn{position:fixed;bottom:28px;right:28px;z-index:500;width:42px;height:42px;
    border-radius:50%;background:var(--accent);color:#fff;border:none;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 6px 18px rgba(76,175,80,.4);transition:all .2s;
    opacity:0;pointer-events:none;font-size:1.1rem}
  #topBtn.show{opacity:1;pointer-events:all}
  #topBtn:hover{transform:translateY(-3px)}
`

// ── Shared <head> block ───────────────────────────────────────────────────────
function buildHead({ title, description, keywords, canonical, ogImage, schema, author = SITE_NAME }) {
  const pageTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
  const schemaArr = Array.isArray(schema) ? schema : schema ? [schema] : []
  return `
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover,maximum-scale=5"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>${esc(pageTitle)}</title>
  <meta name="description" content="${esc(description)}"/>
  <meta name="keywords" content="${esc(keywords || '')}"/>
  <meta name="author" content="${esc(author)}"/>
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"/>
  <link rel="canonical" href="${esc(canonical)}"/>
  <link rel="alternate" hreflang="en" href="${esc(canonical)}"/>
  <link rel="alternate" hreflang="hi" href="${esc(canonical)}"/>
  <link rel="alternate" hreflang="x-default" href="${esc(canonical)}"/>

  <meta property="og:type" content="article"/>
  <meta property="og:url" content="${esc(canonical)}"/>
  <meta property="og:title" content="${esc(pageTitle)}"/>
  <meta property="og:description" content="${esc(description)}"/>
  <meta property="og:image" content="${esc(ogImage || LOGO_URL)}"/>
  <meta property="og:site_name" content="${SITE_NAME}"/>
  <meta property="og:locale" content="en_IN"/>

  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${esc(pageTitle)}"/>
  <meta name="twitter:description" content="${esc(description)}"/>
  <meta name="twitter:image" content="${esc(ogImage || LOGO_URL)}"/>

  <link rel="icon" type="image/png" href="/logo.png"/>
  <link rel="apple-touch-icon" href="/logo.png"/>
  <link rel="manifest" href="/manifest.json"/>
  <meta name="theme-color" content="#4caf50"/>

  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=Space+Mono:wght@400;700&display=swap" media="print" onload="this.media='all'"/>
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=Space+Mono:wght@400;700&display=swap"/></noscript>

  <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com"/>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>

  ${schemaArr.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n  ')}

  <style>
    ${SHARED_CSS}
    ${SHARED_CSS_2}
  </style>`
}

// ── Shared nav + footer HTML ──────────────────────────────────────────────────
const NAV_HTML = `
  <nav class="site-nav" role="navigation" aria-label="Main navigation">
    <a href="/" class="logo" aria-label="${SITE_NAME} Home">
      <img src="/logo.png" alt="${SITE_NAME} Logo" width="32" height="32"/>
      <span>O Level Sarathi</span>
    </a>
    <a href="/tests">Tests</a>
    <a href="/pdfs">PDFs</a>
    <a href="/blog" class="nav-btn">Blog</a>
  </nav>`

const FOOTER_HTML = `
  <footer class="site-footer" role="contentinfo">
    <nav class="footer-links" aria-label="Footer navigation">
      <a href="/">Home</a>
      <a href="/tests">Mock Tests</a>
      <a href="/pdfs">PDF Notes</a>
      <a href="/blog">Blog</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
      <a href="/privacy">Privacy Policy</a>
      <a href="/terms">Terms</a>
    </nav>
    <p class="footer-copy">&copy; ${new Date().getFullYear()} O Level Sarathi. All rights reserved. | NIELIT O Level Free Preparation Platform</p>
  </footer>`

const TOP_BTN_SCRIPT = `
  <button id="topBtn" aria-label="Back to top" onclick="window.scrollTo({top:0,behavior:'smooth'})">&#8679;</button>
  <script>
    window.addEventListener('scroll',function(){
      var btn=document.getElementById('topBtn');
      if(window.scrollY>400){btn.classList.add('show')}else{btn.classList.remove('show')}
    },{passive:true});
  </script>`

// ── Generate single post HTML ─────────────────────────────────────────────────
function generatePostPage(post, allPosts) {
  const slug = post.slug || post.id
  const canonical = `${SITE_URL}/blog/${slug}`
  const bodyHtml = parseContent(post.content || '')
  const toc = buildTOC(bodyHtml)

  // Related posts — same category first, fallback to latest
  const related = allPosts
    .filter(p => (p.slug || p.id) !== slug && p.category === post.category)
    .slice(0, 4)
  const toShow = related.length >= 2
    ? related
    : allPosts.filter(p => (p.slug || p.id) !== slug).slice(0, 4)

  // Latest 5 for sidebar
  const latest = allPosts.slice(0, 5)

  // JSON-LD schemas
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.image || LOGO_URL,
    datePublished: post.createdAt || new Date().toISOString(),
    dateModified: post.updatedAt || post.createdAt || new Date().toISOString(),
    author: { '@type': 'Person', name: post.author || SITE_NAME },
    publisher: {
      '@type': 'Organization', name: SITE_NAME, url: SITE_URL,
      logo: { '@type': 'ImageObject', url: LOGO_URL }
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    keywords: post.keywords || '',
    articleSection: post.category || 'General',
    url: canonical,
    wordCount: (post.content || '').split(/\s+/).length,
    inLanguage: 'en-IN',
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
    ]
  }

  const shareUrl = encodeURIComponent(canonical)
  const shareTitle = encodeURIComponent(post.title)

  // Sidebar HTML
  const sidebarHtml = `
    <aside class="bd-sidebar" aria-label="Sidebar">
      <div class="scard">
        <div class="scard-head">📰 Latest Posts</div>
        ${latest.map(p => {
          const pSlug = p.slug || p.id
          const isCur = pSlug === slug
          return `<a href="/blog/${pSlug}" class="spost" ${isCur ? 'aria-current="page"' : ''}>
            ${p.image
              ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" class="spost-thumb" loading="lazy"/>`
              : `<div class="spost-thumb-ph">✍️</div>`}
            <div>
              <div class="spost-title" style="${isCur ? 'color:var(--accent);font-weight:700' : ''}">${esc(p.title)}</div>
              ${p.date ? `<div class="spost-date">${esc(p.date)}</div>` : ''}
            </div>
          </a>`
        }).join('')}
      </div>
    </aside>`

  // Related posts HTML
  const relatedHtml = toShow.length > 0 ? `
    <section style="margin-top:52px" aria-label="Related posts">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:22px">
        <div style="width:4px;height:26px;border-radius:3px;background:linear-gradient(180deg,var(--accent),rgba(76,175,80,.35))"></div>
        <div>
          <h2 style="font-weight:900;font-size:1.1rem;color:var(--text);margin:0">
            ${related.length >= 2 ? `More in &ldquo;${esc(post.category)}&rdquo;` : 'You May Also Like'}
          </h2>
          <p style="font-size:.75rem;color:var(--text-muted);margin-top:2px">
            ${related.length >= 2 ? 'Same category ke aur articles' : 'Latest published blogs'}
          </p>
        </div>
      </div>
      <div class="related-grid">
        ${toShow.map(p => `
          <a href="/blog/${esc(p.slug || p.id)}" class="rel-card">
            ${p.image
              ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" class="rel-img" loading="lazy"/>`
              : `<div class="rel-img-ph">✍️</div>`}
            <div class="rel-body">
              ${p.category ? `<span class="rel-cat">${esc(p.category)}</span>` : ''}
              <div class="rel-title">${esc(p.title)}</div>
              <div style="display:flex;justify-content:space-between;align-items:center;font-size:.7rem;color:var(--text-muted);margin-top:8px">
                <span>${esc(p.date || '')}</span>
                <span style="color:var(--accent);font-weight:700">Read ›</span>
              </div>
            </div>
          </a>`).join('')}
      </div>
    </section>` : ''

  const tagsHtml = post.keywords ? `
    <div class="tags-box" aria-label="Tags">
      <div class="tags-box-head">🏷️ Tags</div>
      <div class="tags-wrap">
        ${post.keywords.split(',').map(kw => `<span class="tag">${esc(kw.trim())}</span>`).join('')}
      </div>
    </div>` : ''

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  ${buildHead({
    title: post.title,
    description: post.excerpt || post.title,
    keywords: post.keywords,
    canonical,
    ogImage: post.image,
    schema: [articleSchema, breadcrumbSchema],
    author: post.author || SITE_NAME,
  })}
</head>
<body>
  ${NAV_HTML}

  <main class="page-wrap" id="main-content">

    <!-- Back + Share row -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0;flex-wrap:wrap;gap:10px">
      <a href="/blog" class="back-btn" aria-label="Back to all blogs">&#8592; All Blogs</a>
      <div class="share-row" aria-label="Share this post">
        <a href="https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}"
          target="_blank" rel="noopener noreferrer" class="share-btn" aria-label="Share on Twitter">
          🐦 Twitter
        </a>
        <a href="https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}"
          target="_blank" rel="noopener noreferrer" class="share-btn" aria-label="Share on WhatsApp">
          💬 WhatsApp
        </a>
        <button class="share-btn" onclick="navigator.clipboard&&navigator.clipboard.writeText('${canonical}').then(function(){alert('Link copied!')})" aria-label="Copy link">
          🔗 Copy Link
        </button>
      </div>
    </div>

    <!-- 2-col grid -->
    <div class="bd-grid" style="margin-top:20px">

      <!-- LEFT: Article -->
      <div style="min-width:0">
        <article itemscope itemtype="https://schema.org/BlogPosting">
          <meta itemprop="datePublished" content="${esc(post.createdAt || '')}"/>
          <meta itemprop="dateModified" content="${esc(post.updatedAt || post.createdAt || '')}"/>

          ${post.category ? `<span class="cat-badge" aria-label="Category: ${esc(post.category)}">🏷️ ${esc(post.category)}</span>` : ''}

          <h1 itemprop="headline" style="font-size:clamp(1.55rem,4.5vw,2.5rem);font-weight:900;line-height:1.18;margin-bottom:16px;color:var(--text);letter-spacing:-.02em">
            ${esc(post.title)}
          </h1>

          ${post.excerpt ? `
          <p style="font-size:1.05rem;color:var(--text-muted);line-height:1.7;margin-bottom:18px;border-left:3px solid var(--accent);padding-left:14px;font-style:italic" itemprop="description">
            ${esc(post.excerpt)}
          </p>` : ''}

          <div class="meta-row">
            ${post.author ? `<span>👤 <span itemprop="author">${esc(post.author)}</span></span>` : ''}
            ${post.date ? `<span>📅 <time itemprop="datePublished" datetime="${esc(post.createdAt || '')}">${esc(post.date)}</time></span>` : ''}
            ${post.readTime ? `<span>⏱️ ${esc(post.readTime)}</span>` : ''}
            ${post.category ? `<span>📂 ${esc(post.category)}</span>` : ''}
          </div>

          ${post.image ? `
          <div class="hero-img-wrap">
            <img src="${esc(post.image)}" alt="${esc(post.title)}" itemprop="image" loading="eager" fetchpriority="high" width="900" height="394"/>
          </div>` : ''}

          <!-- Ad — top of article -->
          ${adUnit(ADSENSE_SLOT_AUTO)}

          ${toc}

          <!-- Article body -->
          <div class="bd-prose" itemprop="articleBody">
            ${bodyHtml}
          </div>

          ${tagsHtml}
        </article>

        <!-- Ad — after article -->
        ${adUnit(ADSENSE_SLOT_RELAXED, true)}

        ${relatedHtml}
      </div>

      <!-- RIGHT: Sidebar -->
      ${sidebarHtml}

    </div>
  </main>

  ${FOOTER_HTML}
  ${TOP_BTN_SCRIPT}
</body>
</html>`
}

// ── Generate blog listing page ────────────────────────────────────────────────
function generateListingPage(posts) {
  const canonical = `${SITE_URL}/blog`

  const listingSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${SITE_NAME} Blog`,
    description: 'O Level exam tips, NIELIT O Level study guides, Python tutorials, CCC preparation strategies.',
    url: canonical,
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL,
      logo: { '@type': 'ImageObject', url: LOGO_URL } },
    blogPost: posts.slice(0, 10).map(p => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `${SITE_URL}/blog/${p.slug || p.id}`,
      datePublished: p.createdAt || '',
      image: p.image || LOGO_URL,
      description: p.excerpt || p.title,
    }))
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: canonical },
    ]
  }

  // Group posts by category
  const categories = [...new Set(posts.map(p => p.category || 'General'))]

  const cardsHtml = posts.map((post, i) => {
    const slug = post.slug || post.id
    return `
    <a href="/blog/${esc(slug)}" class="post-card" style="animation-delay:${(i % 4) * 0.07}s"
      aria-label="Read: ${esc(post.title)}">
      <article>
        <div class="card-img-wrap">
          ${post.image
            ? `<img src="${esc(post.image)}" alt="${esc(post.title)}" loading="lazy" class="card-img"/>`
            : `<div class="card-img-ph">✍️</div>`}
          ${post.category ? `<span class="card-cat">${esc(post.category)}</span>` : ''}
        </div>
        <div class="card-body">
          <div class="card-meta">
            ${post.date ? `<span>📅 ${esc(post.date)}</span>` : ''}
            ${post.readTime ? `<span>⏱️ ${esc(post.readTime)}</span>` : ''}
          </div>
          <h2 class="card-title">${esc(post.title)}</h2>
          ${post.excerpt ? `<p class="card-excerpt">${esc(post.excerpt)}</p>` : ''}
          <div class="card-footer">
            <span class="card-author">By ${esc(post.author || 'Admin')}</span>
            <span class="card-read">Read More ›</span>
          </div>
        </div>
      </article>
    </a>`
  }).join('')

  const listingCSS = `
    .blog-hero{text-align:center;margin-bottom:60px}
    .hero-badge{display:inline-block;margin-bottom:16px;padding:4px 13px;border-radius:100px;
      font-size:11px;font-weight:700;letter-spacing:.05em;background:var(--accent-glow);
      color:var(--accent);border:1px solid rgba(76,175,80,.3);text-transform:uppercase}
    .hero-h1{font-size:clamp(1.8rem,5vw,2.8rem);font-weight:900;margin-bottom:16px;
      letter-spacing:-.02em;color:var(--text)}
    .hero-desc{color:var(--text2);font-size:1.05rem;max-width:640px;margin:0 auto 24px;line-height:1.7}
    .hero-info{margin:0 auto;max-width:800px;padding:20px 24px;background:var(--bg-card);
      border-radius:14px;border:1px solid var(--border);line-height:1.8;
      color:var(--text2);text-align:left;font-size:.95rem}
    .hero-info p{margin-bottom:14px}
    .hero-info p:last-child{margin-bottom:0}

    /* Category filter */
    .cat-filter{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:32px;justify-content:center}
    .cat-btn{padding:6px 16px;border-radius:999px;border:1px solid var(--border);
      background:var(--bg-card);color:var(--text2);font-size:.82rem;font-weight:700;
      cursor:pointer;transition:all .2s;text-decoration:none}
    .cat-btn:hover,.cat-btn.active{background:var(--accent);color:#fff;border-color:var(--accent)}

    /* Post grid */
    .posts-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:24px}
    .post-card{text-decoration:none;color:inherit;display:block;
      background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);
      overflow:hidden;transition:transform .28s cubic-bezier(.16,1,.3,1),
      box-shadow .28s cubic-bezier(.16,1,.3,1),border-color .25s;
      animation:fadeUp .55s cubic-bezier(.16,1,.3,1) both}
    .post-card:hover{border-color:rgba(74,180,74,.45);
      box-shadow:0 8px 32px rgba(76,175,80,.15);transform:translateY(-5px) scale(1.012)}
    .card-img-wrap{height:200px;overflow:hidden;position:relative;flex-shrink:0}
    .card-img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
    .post-card:hover .card-img{transform:scale(1.08)}
    .card-img-ph{height:200px;background:linear-gradient(135deg,rgba(76,175,80,.13),rgba(76,175,80,.25));
      display:flex;align-items:center;justify-content:center;font-size:3rem}
    .card-cat{position:absolute;top:12px;left:14px;font-size:.7rem;font-weight:800;
      color:#fff;background:var(--accent);padding:3px 10px;border-radius:999px;letter-spacing:.04em}
    .card-body{padding:20px 22px;display:flex;flex-direction:column;gap:10px}
    .card-meta{display:flex;gap:12px;font-size:.75rem;color:var(--text-muted)}
    .card-title{font-size:1.05rem;font-weight:800;line-height:1.4;color:var(--text);
      display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .card-excerpt{color:var(--text2);font-size:.85rem;line-height:1.6;
      display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .card-footer{display:flex;align-items:center;justify-content:space-between;
      padding-top:12px;border-top:1px solid var(--border);margin-top:auto}
    .card-author{font-size:.72rem;color:var(--text-muted)}
    .card-read{color:var(--accent);font-weight:800;font-size:.82rem}
    @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  `

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  ${buildHead({
    title: 'O Level Exam Blog | NIELIT O Level Tips & Guide',
    description: 'O Level exam tips, NIELIT O Level study guides, Python tutorials, CCC preparation strategies aur IT career guidance. OLevelSarathi.in ka official blog — regular updates ke saath.',
    keywords: 'O Level exam blog, O Level tips, NIELIT O Level guide, OLevelSarathi blog, O Level preparation, M3-R5 Python tips, CCC guide, O Level exam 2026, NIELIT study tips',
    canonical,
    schema: [listingSchema, breadcrumbSchema],
  })}
  <style>${listingCSS}</style>
</head>
<body>
  ${NAV_HTML}

  <main class="page-wrap" id="main-content">

    <!-- Hero -->
    <div class="blog-hero">
      <span class="hero-badge">✍️ O Level Blog</span>
      <h1 class="hero-h1">O Level Sarathi — ब्लॉग और अध्ययन मार्गदर्शिका</h1>
      <p class="hero-desc">NIELIT O Level परीक्षा, CCC, Python और IT करियर से जुड़े विशेषज्ञ लेख — नियमित अपडेट के साथ।</p>
      <div class="hero-info">
        <p>O Level Sarathi के ब्लॉग में आपका स्वागत है। यह ब्लॉग NIELIT O Level परीक्षा की तैयारी, CCC, ADCA और IT क्षेत्र में करियर मार्गदर्शन के लिए आपका सबसे विश्वसनीय स्रोत है। यहाँ M1-R5 से M4-R5 तक के सभी मॉड्यूल के लिए विशेषज्ञ-लिखित लेख मिलेंगे।</p>
        <p>Python एल्गोरिदम, IoT परियोजना सेटअप, वेब डेवलपमेंट, डेटाबेस प्रबंधन और NIELIT परीक्षा के नवीनतम पैटर्न — सभी विषयों पर गहन जानकारी पाएँ।</p>
      </div>
    </div>

    <!-- Ad top -->
    <div style="max-width:900px;margin:0 auto 40px">${adUnit(ADSENSE_SLOT_AUTO)}</div>

    <!-- Category filter -->
    ${categories.length > 1 ? `
    <div class="cat-filter" role="navigation" aria-label="Filter by category">
      <a href="/blog" class="cat-btn active">All Posts (${posts.length})</a>
      ${categories.map(cat => {
        const count = posts.filter(p => (p.category || 'General') === cat).length
        return `<span class="cat-btn" data-cat="${esc(cat)}">${esc(cat)} (${count})</span>`
      }).join('')}
    </div>` : ''}

    <!-- Posts grid -->
    <div class="posts-grid" id="posts-grid">
      ${cardsHtml}
    </div>

    <!-- Ad bottom -->
    <div style="max-width:900px;margin:40px auto 0">${adUnit(ADSENSE_SLOT_AUTO)}</div>

  </main>

  ${FOOTER_HTML}
  ${TOP_BTN_SCRIPT}

  <script>
    // Category filter
    document.querySelectorAll('[data-cat]').forEach(function(btn){
      btn.addEventListener('click',function(){
        document.querySelectorAll('.cat-btn').forEach(function(b){b.classList.remove('active')});
        btn.classList.add('active');
        var cat=btn.getAttribute('data-cat');
        document.querySelectorAll('.post-card').forEach(function(card){
          var cardCat=card.querySelector('.card-cat');
          var match=cardCat&&cardCat.textContent.trim()===cat;
          card.style.display=match?'block':'none';
        });
      });
    });
    document.querySelectorAll('.cat-btn:not([data-cat])').forEach(function(btn){
      btn.addEventListener('click',function(){
        document.querySelectorAll('.cat-btn').forEach(function(b){b.classList.remove('active')});
        btn.classList.add('active');
        document.querySelectorAll('.post-card').forEach(function(card){card.style.display='block'});
      });
    });
  </script>
</body>
</html>`
}

// ── Main: fetch posts & write files ──────────────────────────────────────────
async function main() {
  console.log('🚀 Static Blog Generator — O Level Sarathi\n')

  // Init Firebase
  const app = initializeApp(firebaseConfig)
  const db = getDatabase(app)

  console.log('📡 Fetching posts from Firebase RTDB...')
  const snapshot = await get(ref(db, 'blogs'))
  const raw = snapshot.val()

  if (!raw) {
    console.log('⚠️  No blog posts found in Firebase. Exiting.')
    process.exit(0)
  }

  // Parse + sort by createdAt descending
  const posts = Object.keys(raw)
    .map(key => ({ id: key, ...raw[key] }))
    .filter(p => p.title)                           // skip incomplete entries
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  console.log(`✅ Found ${posts.length} posts\n`)

  // Ensure dist/blog directory exists
  if (!existsSync(DIST_BLOG)) {
    mkdirSync(DIST_BLOG, { recursive: true })
    console.log('📁 Created dist/blog/')
  }

  let generated = 0
  let errors = 0
  const successfulSlugs = []  // track which posts were generated successfully

  // Generate each post page
  for (const post of posts) {
    const slug = post.slug || post.id
    if (!slug) { console.warn(`  ⚠️  Skipping post with no slug: ${post.title}`); continue }

    try {
      const html = generatePostPage(post, posts)
      const filePath = join(DIST_BLOG, `${slug}.html`)
      writeFileSync(filePath, html, 'utf8')
      console.log(`  ✅ /blog/${slug}.html  — "${post.title}"`)
      generated++
      successfulSlugs.push({ id: post.id, slug })
    } catch (err) {
      console.error(`  ❌ Failed: ${slug} — ${err.message}`)
      errors++
    }
  }

  // Generate blog listing page
  try {
    const listingHtml = generateListingPage(posts)
    writeFileSync(join(DIST_BLOG, 'index.html'), listingHtml, 'utf8')
    console.log('\n  ✅ /blog/index.html  — Blog listing page')
    generated++
  } catch (err) {
    console.error(`  ❌ Failed: blog/index.html — ${err.message}`)
    errors++
  }

  // ── Update Firebase RTDB via REST API: mark each post as staticDeployed ──
  if (successfulSlugs.length > 0) {
    console.log('\n📝 Updating Firebase RTDB — staticDeployed flags...')
    const deployedAt = new Date().toISOString()
    const RTDB_URL = 'https://tic-tic-ta-default-rtdb.firebaseio.com'

    for (const { id, slug } of successfulSlugs) {
      try {
        const updateData = {
          staticDeployed: true,
          staticDeployedAt: deployedAt,
          staticUrl: `${SITE_URL}/blog/${slug}`,
        }
        // Use Firebase REST API with PATCH (partial update)
        const res = await fetch(
          `${RTDB_URL}/blogs/${id}.json`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
          }
        )
        if (res.ok) {
          console.log(`  ✅ Marked: ${slug}`)
        } else {
          const err = await res.text()
          console.warn(`  ⚠️  RTDB update failed for ${slug}: ${err}`)
        }
      } catch (err) {
        console.warn(`  ⚠️  RTDB update error for ${slug}: ${err.message}`)
      }
    }
    console.log('✅ Firebase RTDB updated!\n')
  }

  console.log(`\n📊 Summary: ${generated} files generated, ${errors} errors`)
  console.log('🎉 Done! Run firebase deploy to publish.\n')
  process.exit(0)
}

main().catch(err => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})
