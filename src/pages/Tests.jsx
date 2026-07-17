import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useFirebase } from '../hooks/useFirebase'
import { FiClipboard, FiChevronRight, FiX, FiSearch, FiGrid, FiList } from 'react-icons/fi'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import { AutoAd, RelaxedAd } from '../components/GoogleAd'

// ── O Level exact DB category keys ──────────────────────────────────────────
const OLEVEL_MODULES = [
  { key: 'M1-R5 : Information Technology Tools & Network Basics', label: 'M1-R5', desc: 'IT Tools & Network Basics', icon: '🖥️', color: '#4fa3f7' },
  { key: 'M2-R5 : Web Design & Publishing',                       label: 'M2-R5', desc: 'Web Design & Publishing',   icon: '🌐', color: '#a78bfa' },
  { key: 'M3-R5 : Programming and Problem Solving through Python', label: 'M3-R5', desc: 'Programming through Python', icon: '🐍', color: '#34d399' },
  { key: 'M4-R5 : Internet of Things (IoT) and its Applications', label: 'M4-R5', desc: 'Internet of Things (IoT)',   icon: '📡', color: '#f59e0b' },
]
const OLEVEL_KEYS = new Set(OLEVEL_MODULES.map(m => m.key))

// ── A Level exact DB category keys ──────────────────────────────────────────
// Both short prefix AND full names supported
const ALEVEL_KEYS = new Set([
  'A5-R5', 'A6-R5', 'A7-R5', 'A8-R5', 'A10-R5',
  'A5-R5 Data Structure Through Object Oriented Programming Language',
  'A6-R5 Computer Organization and Operating System',
  'A7-R5 Database Technologies',
  'A8-R5 Systems Analysis, Design and Testing',
  'A10-R5 Data Science Using Python',
])

// ── CCC key ──────────────────────────────────────────────────────────────────
const CCC_KEYS = new Set(['CCC : Course on Computer Concepts'])

// ── Programming category keywords ────────────────────────────────────────────
const PROG_KEYWORDS = ['c programming','c++ programming','java programming','php programming','python','javascript','programming']

// ── Government exam keywords ─────────────────────────────────────────────────
const GOVT_KEYWORDS = ['ssc','upsc','railway','bank','rrb','government','govt']

// ── Categorise a test by its _catKey ────────────────────────────────────────
function getTab(catKey) {
  const k  = String(catKey || '').trim()
  const kl = k.toLowerCase()
  if (OLEVEL_KEYS.has(k))  return 'olevel'
  if (CCC_KEYS.has(k))     return 'ccc'
  // A Level: exact set match OR starts with A + digit pattern
  if (ALEVEL_KEYS.has(k) || /^A\d+-R\d+/i.test(k)) return 'alevel'
  if (PROG_KEYWORDS.some(p => kl.includes(p))) return 'programming'
  if (GOVT_KEYWORDS.some(p => kl.includes(p))) return 'government'
  return 'other'
}

// ── Flatten nested Firebase Tests structure ──────────────────────────────────
function flattenTests(data) {
  if (!data) return []
  const result = []
  const items = Array.isArray(data)
    ? data
    : Object.entries(data).map(([k, v]) => ({ ...v, _key: k }))
  items.forEach(item => {
    if (!item) return
    const catKey = item.category || item.subject || item._key || 'Other'
    if (item.title && (item.questions || item.questionsJson)) {
      result.push({ ...item, _id: String(item._key || item.id || 'test'), _catKey: catKey })
      return
    }
    Object.entries(item).forEach(([k, v]) => {
      if (k !== '_key' && v && typeof v === 'object' && !Array.isArray(v) && v.title && (v.questions || v.questionsJson)) {
        result.push({ ...v, _id: String(k), _catKey: String(item.category || item.subject || item._key || 'Other') })
      }
    })
  })
  return result
}

// ── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'all',         label: 'All Tests',    icon: '📋', color: '#6366f1' },
  { id: 'olevel',      label: 'O Level',      icon: '🎓', color: '#4caf50' },
  { id: 'ccc',         label: 'CCC',          icon: '🖱️', color: '#0891b2' },
  { id: 'alevel',      label: 'A Level',      icon: '🅰️', color: '#7c3aed' },
  { id: 'programming', label: 'Programming',  icon: '⌨️', color: '#0284c7' },
  { id: 'government',  label: 'Government',   icon: '🏛️', color: '#b45309' },
  { id: 'other',       label: 'Other',        icon: '📚', color: '#0f766e' },
]

// ── Level config ─────────────────────────────────────────────────────────────
const LEVEL_CONFIG = {
  Easy:   { gradient:'linear-gradient(135deg,#d1fae5,#6ee7b7)', accent:'#10b981', border:'#6ee7b7', icon:'🟢', textColor:'#064e3b', glow:'rgba(16,185,129,0.2)' },
  Medium: { gradient:'linear-gradient(135deg,#fef3c7,#fbbf24)', accent:'#f59e0b', border:'#fcd34d', icon:'🟡', textColor:'#78350f', glow:'rgba(245,158,11,0.2)' },
  Hard:   { gradient:'linear-gradient(135deg,#fee2e2,#fca5a5)', accent:'#ef4444', border:'#fca5a5', icon:'🔴', textColor:'#7f1d1d', glow:'rgba(239,68,68,0.2)' },
}

// ── Category icon/color map ───────────────────────────────────────────────────
const CAT_META = {
  'M1-R5':              { icon:'🖥️', color:'#4fa3f7' },
  'M2-R5':              { icon:'🌐', color:'#a78bfa' },
  'M3-R5':              { icon:'🐍', color:'#34d399' },
  'M4-R5':              { icon:'📡', color:'#f59e0b' },
  'CCC':                { icon:'🖱️', color:'#0891b2' },
  'A5-R5':              { icon:'🏗️', color:'#6d28d9' },
  'A6-R5':              { icon:'⚙️', color:'#5b21b6' },
  'A7-R5':              { icon:'🗄️', color:'#4c1d95' },
  'A8-R5':              { icon:'🔍', color:'#3b0764' },
  'A10-R5':             { icon:'📊', color:'#7c3aed' },
  'C Programming':      { icon:'💻', color:'#0284c7' },
  'C++ Programming':    { icon:'⚡', color:'#0369a1' },
  'Java Programming':   { icon:'☕', color:'#b45309' },
  'PHP Programming':    { icon:'🐘', color:'#7e22ce' },
  'Python':             { icon:'🐍', color:'#15803d' },
}
function catMeta(catKey) {
  const k = String(catKey || '').trim()
  // Exact match first
  if (CAT_META[k]) return CAT_META[k]
  // Prefix match fallback
  for (const [prefix, meta] of Object.entries(CAT_META)) {
    if (k.startsWith(prefix)) return meta
  }
  const tab = getTab(catKey)
  const tabObj = TABS.find(t=>t.id===tab)
  return { icon: tabObj?.icon||'📋', color: tabObj?.color||'#6366f1' }
}

// ── TestCard ──────────────────────────────────────────────────────────────────
function TestCard({ test, onStart, index }) {
  const [hov, setHov] = React.useState(false)
  const lvl  = LEVEL_CONFIG[test.level] || LEVEL_CONFIG.Medium
  const meta = catMeta(test._catKey)
  const shortCat = String(test._catKey||'').split(':')[0].trim()
  return (
    <div
      className={`fade-up stagger-${(index%4)+1}`}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>onStart(test)}
      style={{
        position:'relative', overflow:'hidden', borderRadius:20, cursor:'pointer',
        border:`1.5px solid ${hov ? lvl.accent : 'var(--border)'}`,
        background:'var(--bg-card)',
        boxShadow: hov ? `0 16px 40px ${lvl.glow}` : '0 2px 8px rgba(0,0,0,0.04)',
        transform: hov ? 'translateY(-6px) scale(1.01)' : 'none',
        transition:'all 0.28s cubic-bezier(0.16,1,0.3,1)',
        display:'flex', flexDirection:'column',
      }}
    >
      <div style={{ height:5, background:lvl.gradient }} />
      <div style={{ padding:'18px 20px 20px', display:'flex', flexDirection:'column', gap:12, flex:1 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
          <span style={{ padding:'3px 10px', borderRadius:100, fontSize:'0.72rem', fontWeight:800, background:lvl.gradient, color:lvl.textColor, border:`1px solid ${lvl.border}` }}>
            {lvl.icon} {test.level||'Medium'}
          </span>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            {test.totalQue && <span style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--text-muted)', background:'var(--bg-card2)', padding:'2px 8px', borderRadius:6, border:'1px solid var(--border)' }}>📝 {test.totalQue}Q</span>}
            {test.duration && <span style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--text-muted)', background:'var(--bg-card2)', padding:'2px 8px', borderRadius:6, border:'1px solid var(--border)' }}>⏱️ {test.duration}m</span>}
          </div>
        </div>
        <h3 style={{ fontWeight:800, lineHeight:1.45, fontSize:'0.97rem', color:'var(--text-primary)', margin:0, flex:1 }}>{test.title}</h3>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:'1rem' }}>{meta.icon}</span>
          <span style={{ fontSize:'0.75rem', color:meta.color, fontWeight:700, background:`${meta.color}15`, padding:'2px 8px', borderRadius:999 }}>{shortCat}</span>
        </div>
        <button onClick={e=>{e.stopPropagation();onStart(test)}} style={{ width:'100%', padding:'9px 0', borderRadius:10, border:`1.5px solid ${hov ? lvl.accent : 'var(--border)'}`, background: hov ? lvl.gradient : 'var(--bg-card2)', color: hov ? lvl.textColor : lvl.accent, fontWeight:800, fontSize:'0.85rem', cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          Start Test <FiChevronRight size={14} style={{ transform: hov ? 'translateX(3px)' : 'none', transition:'transform 0.2s' }}/>
        </button>
      </div>
      {hov && <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:`radial-gradient(ellipse at top right, ${lvl.glow} 0%, transparent 60%)`, borderRadius:20 }}/>}
    </div>
  )
}

// ── Category Group Card (shows on tab landing) ────────────────────────────────
function GroupCard({ name, count, icon, color, onSelect, index }) {
  const [hov, setHov] = React.useState(false)
  return (
    <button
      className={`fade-up stagger-${(index%6)+1}`}
      onClick={()=>onSelect(name)}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        padding:'22px 18px', borderRadius:18, width:'100%', cursor:'pointer', textAlign:'center',
        display:'flex', flexDirection:'column', alignItems:'center', gap:12,
        background: hov ? `${color}12` : 'var(--bg-card)',
        border:`1.5px solid ${hov ? color : 'var(--border)'}`,
        boxShadow: hov ? `0 10px 28px ${color}22` : '0 2px 6px rgba(0,0,0,0.04)',
        transform: hov ? 'translateY(-5px)' : 'none',
        transition:'all 0.25s cubic-bezier(0.16,1,0.3,1)',
        position:'relative', overflow:'hidden',
      }}
    >
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${color}, ${color}66)`, borderRadius:'18px 18px 0 0' }}/>
      <div style={{ width:54, height:54, borderRadius:15, background:`${color}18`, border:`2px solid ${color}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight:800, fontSize:'0.95rem', color:'var(--text-primary)', marginBottom:5, lineHeight:1.3 }}>
          {String(name).split(':')[0].trim()}
        </div>
        <span style={{ fontSize:'0.75rem', color, fontWeight:700, background:`${color}15`, padding:'3px 10px', borderRadius:999 }}>
          {count} test{count!==1?'s':''}
        </span>
      </div>
    </button>
  )
}

// ── Selected category tests view ─────────────────────────────────────────────
function CategoryView({ selected, tests, onBack }) {
  const navigate = useNavigate()
  const [search, setSearch] = React.useState('')
  const meta = catMeta(selected)
  const shortName = String(selected).split(':')[0].trim()

  const visible = useMemo(() => {
    return tests.filter(t => {
      const matchCat = String(t._catKey||'').trim() === selected
      const matchSrch = !search || t.title?.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSrch
    })
  }, [tests, selected, search])

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'8px 16px', color:'var(--text-secondary)', cursor:'pointer', fontWeight:600, fontSize:'0.85rem', transition:'all 0.2s' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=meta.color; e.currentTarget.style.color=meta.color}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)'}}
        >
          ← Back
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:'1.4rem' }}>{meta.icon}</span>
          <h2 style={{ fontWeight:900, fontSize:'1.15rem', color:'var(--text-primary)', margin:0 }}>{shortName}</h2>
          <span style={{ fontSize:'0.78rem', color:meta.color, background:`${meta.color}15`, padding:'3px 10px', borderRadius:999, fontWeight:700 }}>{visible.length} tests</span>
        </div>
      </div>

      <div style={{ position:'relative', marginBottom:22 }}>
        <FiSearch size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
        <input
          style={{ width:'100%', padding:'11px 14px 11px 40px', borderRadius:12, border:'1.5px solid var(--border)', background:'var(--bg-card)', color:'var(--text-primary)', fontSize:'0.9rem', outline:'none', boxSizing:'border-box', transition:'border 0.2s' }}
          placeholder={`Search in ${shortName}...`}
          value={search} onChange={e=>setSearch(e.target.value)}
          onFocus={e=>e.target.style.borderColor=meta.color}
          onBlur={e=>e.target.style.borderColor='var(--border)'}
        />
      </div>

      {visible.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-muted)' }}>
          <FiClipboard size={44} style={{ marginBottom:14, opacity:0.35 }}/>
          <p style={{ fontWeight:700, fontSize:'1rem', marginBottom:6 }}>{search ? 'No matches' : 'No tests yet'}</p>
          <p style={{ fontSize:'0.85rem' }}>{search ? 'Try different keywords.' : 'Tests will appear once added by admin.'}</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:18 }}>
          {visible.map((t,i)=><TestCard key={t._id} test={t} onStart={test=>navigate(`/test/${test._id}`)} index={i}/>)}
        </div>
      )}
    </div>
  )
}

// ── Fallback data ─────────────────────────────────────────────────────────────
const fallbackTests = []

// ── MAIN TESTS PAGE ───────────────────────────────────────────────────────────
export default function Tests() {
  const { data: raw, loading, error } = useFirebase('Tests')
  const navigate  = useNavigate()
  const location  = useLocation()

  const [activeTab, setActiveTab] = useState('all')
  const [selected,  setSelected]  = useState(null)   // selected category name
  const [search,    setSearch]    = useState('')
  const [viewMode,  setViewMode]  = useState('grid') // grid | list

  const tests = useMemo(() => flattenTests(error ? fallbackTests : raw), [raw, error])

  // ── Read URL params ────────────────────────────────────────────────────────
  useEffect(() => {
    const p    = new URLSearchParams(location.search)
    const cat  = p.get('category')
    const srch = p.get('search')
    const tab  = p.get('tab')
    if (cat) {
      const decoded = decodeURIComponent(cat)
      setActiveTab(getTab(decoded))
      setSelected(decoded)
      setSearch('')
    } else if (srch) {
      setActiveTab('all')
      setSelected(null)
      setSearch(decodeURIComponent(srch))
    } else if (tab) {
      setActiveTab(tab)
      setSelected(null)
      setSearch('')
    }
  }, [location.search])

  // ── Counts per tab ────────────────────────────────────────────────────────
  const tabCounts = useMemo(() => {
    const counts = { all: tests.length }
    TABS.slice(1).forEach(tab => {
      counts[tab.id] = tests.filter(t => getTab(t._catKey) === tab.id).length
    })
    return counts
  }, [tests])

  // ── Current tab's tests ───────────────────────────────────────────────────
  const tabTests = useMemo(() => {
    if (activeTab === 'all') return tests
    return tests.filter(t => getTab(t._catKey) === activeTab)
  }, [tests, activeTab])

  // ── Unique categories within current tab ─────────────────────────────────
  const tabCategories = useMemo(() => {
    const cats = [...new Set(tabTests.map(t => t._catKey).filter(Boolean))]
    return cats.sort()
  }, [tabTests])

  // ── O Level: show module cards; others: show GroupCards ──────────────────
  const isOLevelTab = activeTab === 'olevel'

  // ── Global search filtered tests ─────────────────────────────────────────
  const searchResults = useMemo(() => {
    if (!search) return []
    return tests.filter(t => t.title?.toLowerCase().includes(search.toLowerCase()))
  }, [tests, search])

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page">
        <div className="fade-up">
          <div className="skeleton" style={{ width:160, height:28, borderRadius:8, marginBottom:16 }}/>
          <div className="skeleton" style={{ width:'45%', height:44, borderRadius:8, marginBottom:10 }}/>
          <div className="skeleton" style={{ width:'65%', height:22, borderRadius:6 }}/>
        </div>
        <div style={{ display:'flex', gap:10, marginTop:32, flexWrap:'wrap' }}>
          {[1,2,3,4,5,6,7].map(i=><div key={i} className="skeleton" style={{ width:110, height:44, borderRadius:12 }}/>)}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:18, marginTop:28 }}>
          {[1,2,3,4,5,6].map(i=><div key={i} className="skeleton" style={{ height:180, borderRadius:18 }}/>)}
        </div>
      </div>
    )
  }

  // ── Selected category view ────────────────────────────────────────────────
  if (selected) {
    return (
      <div className="page">
        <SEO
          title={`${String(selected).split(':')[0].trim()} Tests — Free MCQ Practice | O Level Sarathi`}
          description={`${String(selected).split(':')[0].trim()} ke free mock tests — instant result aur explanation ke saath.`}
          canonical={`https://olevelsarathi.in/tests?category=${encodeURIComponent(selected)}`}
        />
        <Breadcrumbs />
        <CategoryView
          selected={selected}
          tests={tests}
          onBack={() => { setSelected(null); setSearch('') }}
        />
        <RelaxedAd/>
      </div>
    )
  }

  // ── Main view ─────────────────────────────────────────────────────────────
  const activeTabObj = TABS.find(t => t.id === activeTab) || TABS[0]

  return (
    <div className="page">
      <SEO
        title="Free Mock Tests — NIELIT O Level, CCC, A Level, Programming | O Level Sarathi"
        description="O Level, CCC, A Level, Programming, Government exams — free mock tests with instant results and explanations. NIELIT exam preparation 2026."
        keywords="O Level test, CCC mock test, A Level test, NIELIT test, programming MCQ, free mock test 2026"
        canonical="https://olevelsarathi.in/tests"
      />

      {/* ── Page Header ── */}
      <div className="fade-up">
        <span className="badge">📋 Free Mock Tests</span>
        <h1 className="section-title" style={{ marginTop:10 }}>अपना Subject चुनें — Test शुरू करें</h1>
        <p className="section-sub">O Level, CCC, A Level, Programming और Government Exams — सभी के लिए free MCQ tests with instant results।</p>
      </div>

      <AutoAd/>

      {/* ── Tab Bar ──────────────────────────────────────────────────────── */}
      <div style={{ marginTop:28, marginBottom:24 }}>
        {/* Scrollable tab row */}
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4, scrollbarWidth:'none' }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id
            const cnt    = tabCounts[tab.id] || 0
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelected(null); setSearch('') }}
                style={{
                  display:'flex', alignItems:'center', gap:7, whiteSpace:'nowrap',
                  padding:'10px 18px', borderRadius:12, cursor:'pointer', flexShrink:0,
                  fontWeight: active ? 800 : 600, fontSize:'0.87rem',
                  border: `2px solid ${active ? tab.color : 'var(--border)'}`,
                  background: active ? `${tab.color}18` : 'var(--bg-card)',
                  color: active ? tab.color : 'var(--text-secondary)',
                  boxShadow: active ? `0 4px 14px ${tab.color}25` : 'none',
                  transition:'all 0.2s',
                }}
              >
                <span style={{ fontSize:'1rem' }}>{tab.icon}</span>
                {tab.label}
                <span style={{
                  fontSize:'0.72rem', fontWeight:800, minWidth:22, textAlign:'center',
                  padding:'1px 7px', borderRadius:999,
                  background: active ? tab.color : 'var(--bg-card2)',
                  color: active ? '#fff' : 'var(--text-muted)',
                  border: active ? 'none' : '1px solid var(--border)',
                }}>
                  {cnt}
                </span>
              </button>
            )
          })}
        </div>
        {/* Active tab indicator bar */}
        <div style={{ height:3, background:'var(--border)', borderRadius:3, marginTop:8, position:'relative', overflow:'hidden' }}>
          <div style={{
            position:'absolute', left:0, top:0, height:'100%', borderRadius:3,
            background:activeTabObj.color, transition:'width 0.3s ease',
            width: `${Math.min(100, ((tabCounts[activeTab]||0) / Math.max(tests.length,1)) * 100 + 8)}%`,
          }}/>
        </div>
      </div>

      {/* ── Search bar ─────────────────────────────────────────────────────── */}
      <div style={{ position:'relative', marginBottom:24 }}>
        <FiSearch size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
        <input
          style={{ width:'100%', padding:'12px 14px 12px 42px', borderRadius:14, border:'1.5px solid var(--border)', background:'var(--bg-card)', color:'var(--text-primary)', fontSize:'0.92rem', outline:'none', boxSizing:'border-box', transition:'border 0.2s' }}
          placeholder={`🔍 Search tests in ${activeTabObj.label}...`}
          value={search}
          onChange={e => { setSearch(e.target.value); setSelected(null) }}
          onFocus={e=>e.target.style.borderColor=activeTabObj.color}
          onBlur={e=>e.target.style.borderColor='var(--border)'}
        />
        {search && (
          <button onClick={()=>setSearch('')} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'1rem', display:'flex', alignItems:'center' }}>
            <FiX size={16}/>
          </button>
        )}
      </div>

      {/* ── Search results (global) ───────────────────────────────────────── */}
      {search && (
        <div>
          <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:16 }}>
            {searchResults.length} result{searchResults.length!==1?'s':''} for "<strong style={{color:'var(--text-primary)'}}>{search}</strong>"
          </p>
          {searchResults.length === 0 ? (
            <div style={{ textAlign:'center', padding:'50px 20px', color:'var(--text-muted)' }}>
              <FiX size={40} style={{ marginBottom:12, opacity:0.3 }}/>
              <p style={{ fontWeight:700 }}>No tests found.</p>
              <p style={{ fontSize:'0.85rem' }}>Try different keywords.</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:18 }}>
              {searchResults.map((t,i) => <TestCard key={t._id} test={t} onStart={test=>navigate(`/test/${test._id}`)} index={i}/>)}
            </div>
          )}
        </div>
      )}

      {/* ── Tab content (when no search) ─────────────────────────────────── */}
      {!search && (
        <div>
          {/* O Level: show module cards with exact keys */}
          {activeTab === 'olevel' && (
            <div>
              <p style={{ color:'var(--text-secondary)', fontSize:'0.88rem', marginBottom:20 }}>
                NIELIT O Level के 4 modules — module चुनें, सभी tests directly open होंगे।
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:18 }}>
                {OLEVEL_MODULES.map((mod,i) => {
                  const cnt = tests.filter(t => String(t._catKey||'').trim() === mod.key).length
                  return (
                    <button
                      key={mod.key}
                      className={`fade-up stagger-${i+1}`}
                      onClick={() => setSelected(mod.key)}
                      style={{ padding:'26px 20px', borderRadius:20, background:'var(--bg-card)', border:'1px solid var(--border)', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:14, cursor:'pointer', transition:'all 0.28s cubic-bezier(0.16,1,0.3,1)', width:'100%', position:'relative', overflow:'hidden' }}
                      onMouseEnter={e=>{ e.currentTarget.style.borderColor=mod.color; e.currentTarget.style.boxShadow=`0 12px 32px ${mod.color}25`; e.currentTarget.style.transform='translateY(-6px)' }}
                      onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='none' }}
                    >
                      <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,${mod.color},${mod.color}66)` }}/>
                      <div style={{ width:60, height:60, borderRadius:16, background:`${mod.color}18`, border:`2px solid ${mod.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.9rem' }}>
                        {mod.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight:900, fontSize:'1.1rem', color:'var(--text-primary)', marginBottom:4 }}>{mod.label}</div>
                        <div style={{ color:'var(--text-secondary)', fontSize:'0.8rem', marginBottom:8 }}>{mod.desc}</div>
                        <span style={{ fontSize:'0.75rem', color:mod.color, fontWeight:700, background:`${mod.color}15`, padding:'3px 10px', borderRadius:999 }}>{cnt} test{cnt!==1?'s':''}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* All other tabs: show GroupCards of unique categories */}
          {activeTab !== 'olevel' && (
            <div>
              {tabCategories.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-muted)' }}>
                  <FiClipboard size={44} style={{ marginBottom:14, opacity:0.35 }}/>
                  <p style={{ fontWeight:700, fontSize:'1rem', marginBottom:6 }}>No tests yet</p>
                  <p style={{ fontSize:'0.85rem' }}>Tests will appear once admin adds them.</p>
                </div>
              ) : (
                <>
                  <p style={{ color:'var(--text-secondary)', fontSize:'0.88rem', marginBottom:20 }}>
                    {activeTabObj.label} के {tabCategories.length} courses — category चुनें, tests direct open होंगे।
                  </p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:16 }}>
                    {tabCategories.map((cat,i) => {
                      const meta = catMeta(cat)
                      const cnt  = tabTests.filter(t => t._catKey === cat).length
                      return (
                        <GroupCard
                          key={cat} name={cat} count={cnt}
                          icon={meta.icon} color={meta.color}
                          onSelect={setSelected} index={i}
                        />
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <RelaxedAd/>
    </div>
  )
}
