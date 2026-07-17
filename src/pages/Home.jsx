import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import { AutoAd, RelaxedAd } from '../components/GoogleAd'
import LastUpdated from '../components/LastUpdated'
import ProgressDashboard from '../components/ProgressDashboard'
import { faqItems, faqSchema } from '../data/faqData'
import { useBlogManagement } from '../hooks/useBlogManagement'
import {
  FiClipboard, FiFileText, FiCode, FiArrowRight,
  FiStar, FiUsers, FiTrendingUp, FiCheck, FiPlay,
  FiAward, FiZap, FiDatabase, FiBriefcase
} from 'react-icons/fi'

// ─── DATA ────────────────────────────────────────────────────────────────────
const stats = [
  { value: '15,000+', label: 'Active Students',  icon: '👨‍🎓', color: '#4caf50' },
  { value: '600+',    label: 'MCQ Questions',     icon: '📝',  color: '#388e3c' },
  { value: '100+',    label: 'PDF Notes',         icon: '📄',  color: '#66bb6a' },
  { value: '100%',    label: 'Free Resources',    icon: '🆓',  color: '#2e7d32' },
]

// ── Category cards ───────────────────────────────────────────────────────────
const categories = [
  // ── O Level 4 Modules (individual cards) ──
  {
    id: 'olevel-m1',
    title: 'M1-R5 IT Tools & Network Basics',
    desc: 'Information Technology Tools, Computer basics, MS Office, Internet & Network fundamentals.',
    icon: '🖥️', color: '#4caf50',
    testRoute: '/tests?category=M1-R5+%3A+Information+Technology+Tools+%26+Network+Basics',
    pdfRoute:  '/pdfs?cat=M1-R5',
    tags: ['M1-R5','MS Office','Internet','Networking'],
    testCount: 'Tests', pdfCount: 'PDFs',
  },
  {
    id: 'olevel-m2',
    title: 'M2-R5 Web Design & Publishing',
    desc: 'HTML, CSS, JavaScript, XML, web publishing tools और web design concepts.',
    icon: '🌐', color: '#388e3c',
    testRoute: '/tests?category=M2-R5+%3A+Web+Design+%26+Publishing',
    pdfRoute:  '/pdfs?cat=M2-R5',
    tags: ['M2-R5','HTML','CSS','JavaScript'],
    testCount: 'Tests', pdfCount: 'PDFs',
  },
  {
    id: 'olevel-m3',
    title: 'M3-R5 Programming through Python',
    desc: 'Python programming — variables, loops, functions, OOP, file handling, libraries.',
    icon: '🐍', color: '#2e7d32',
    testRoute: '/tests?category=M3-R5+%3A+Programming+and+Problem+Solving+through+Python',
    pdfRoute:  '/pdfs?cat=M3-R5',
    tags: ['M3-R5','Python','OOP','Functions'],
    testCount: 'Tests', pdfCount: 'PDFs',
  },
  {
    id: 'olevel-m4',
    title: 'M4-R5 Internet of Things (IoT)',
    desc: 'IoT basics, sensors, actuators, Raspberry Pi, Arduino, IoT applications और protocols.',
    icon: '📡', color: '#66bb6a',
    testRoute: '/tests?category=M4-R5+%3A+Internet+of+Things+%28IoT%29+and+its+Applications',
    pdfRoute:  '/pdfs?cat=M4-R5',
    tags: ['M4-R5','IoT','Arduino','Sensors'],
    testCount: 'Tests', pdfCount: 'PDFs',
  },
  // ── CCC ──
  {
    id: 'ccc',
    title: 'CCC (Course on Computer Concepts)',
    desc: 'NIELIT CCC — Computer basics, LibreOffice, Internet, e-mail, e-governance concepts.',
    icon: '🖱️', color: '#0891b2',
    testRoute: '/tests?category=CCC+%3A+Course+on+Computer+Concepts',
    pdfRoute:  '/pdfs?cat=CCC',
    tags: ['CCC','NIELIT','LibreOffice','Internet'],
    testCount: 'Tests', pdfCount: 'PDFs',
  },
  // ── A Level ──
  {
    id: 'alevel-a10',
    title: 'A10-R5 Data Science Using Python',
    desc: 'Data Science with Python — NumPy, Pandas, Matplotlib, ML basics, statistics.',
    icon: '📊', color: '#7c3aed',
    testRoute: '/tests?category=A10-R5+Data+Science+Using+Python',
    pdfRoute:  '/pdfs?cat=A+Level',
    tags: ['A10-R5','Data Science','Python','ML'],
    testCount: '1 Test', pdfCount: 'PDFs',
  },
  {
    id: 'alevel-a5',
    title: 'A5-R5 Data Structure Through OOP',
    desc: 'Data Structures with Object Oriented Programming — Arrays, Trees, Graphs, C++.',
    icon: '🏗️', color: '#6d28d9',
    testRoute: '/tests?category=A5-R5+Data+Structure+Through+Object+Oriented+Programming+Language',
    pdfRoute:  '/pdfs?cat=A+Level',
    tags: ['A5-R5','DSA','OOP','C++'],
    testCount: '1 Test', pdfCount: 'PDFs',
  },
  {
    id: 'alevel-a6',
    title: 'A6-R5 Computer Organization & OS',
    desc: 'Computer Organization, CPU architecture, Memory management, Operating Systems.',
    icon: '⚙️', color: '#5b21b6',
    testRoute: '/tests?category=A6-R5+Computer+Organization+and+Operating+System',
    pdfRoute:  '/pdfs?cat=A+Level',
    tags: ['A6-R5','OS','CPU','Memory'],
    testCount: '1 Test', pdfCount: 'PDFs',
  },
  {
    id: 'alevel-a7',
    title: 'A7-R5 Database Technologies',
    desc: 'Advanced Database — SQL, PL/SQL, normalization, transactions, NoSQL.',
    icon: '🗄️', color: '#4c1d95',
    testRoute: '/tests?category=A7-R5+Database+Technologies',
    pdfRoute:  '/pdfs?cat=A+Level',
    tags: ['A7-R5','SQL','Database','NoSQL'],
    testCount: '1 Test', pdfCount: 'PDFs',
  },
  {
    id: 'alevel-a8',
    title: 'A8-R5 Systems Analysis, Design & Testing',
    desc: 'System Analysis, Software Design, SDLC, Testing methods and quality assurance.',
    icon: '🔍', color: '#3b0764',
    testRoute: '/tests?category=A8-R5+Systems+Analysis%2C+Design+and+Testing',
    pdfRoute:  '/pdfs?cat=A+Level',
    tags: ['A8-R5','SDLC','Testing','Design'],
    testCount: '1 Test', pdfCount: 'PDFs',
  },
  // ── Programming Languages ──
  {
    id: 'c-prog',
    title: 'C Programming',
    desc: 'C language basics to advanced — pointers, arrays, functions, file I/O और MCQ practice.',
    icon: '💻', color: '#0284c7',
    testRoute: '/tests?category=C+Programming',
    pdfRoute:  '/pdfs?cat=C+Programming',
    tags: ['C','Pointers','Arrays','Functions'],
    testCount: 'Tests', pdfCount: 'PDFs',
  },
  {
    id: 'java-prog',
    title: 'Java Programming',
    desc: 'Java OOP, Collections, JDBC, Exception handling — interview & exam preparation.',
    icon: '☕', color: '#b45309',
    testRoute: '/tests?category=Java+Programming',
    pdfRoute:  '/pdfs?cat=Java+Programming',
    tags: ['Java','OOP','JDBC','Collections'],
    testCount: 'Tests', pdfCount: 'PDFs',
  },
  {
    id: 'python-prog',
    title: 'Python Programming',
    desc: 'Python basics to advanced — lists, functions, OOP, file handling, modules.',
    icon: '🐍', color: '#15803d',
    testRoute: '/tests?category=Python',
    pdfRoute:  '/pdfs?cat=Python+Programming',
    tags: ['Python','OOP','Modules','File I/O'],
    testCount: 'Tests', pdfCount: 'PDFs',
  },
  {
    id: 'cpp-prog',
    title: 'C++ Programming',
    desc: 'C++ OOP concepts — classes, inheritance, polymorphism, STL, templates.',
    icon: '⚡', color: '#0369a1',
    testRoute: '/tests?category=C%2B%2B+Programming',
    pdfRoute:  '/pdfs?cat=C%2B%2B+Programming',
    tags: ['C++','OOP','STL','Templates'],
    testCount: 'Tests', pdfCount: 'PDFs',
  },
  {
    id: 'php-prog',
    title: 'PHP Programming',
    desc: 'PHP web development — forms, sessions, MySQL connectivity, CRUD operations.',
    icon: '🐘', color: '#7e22ce',
    testRoute: '/tests?category=PHP+Programming',
    pdfRoute:  '/pdfs?cat=PHP+Programming',
    tags: ['PHP','MySQL','CRUD','Web'],
    testCount: 'Tests', pdfCount: 'PDFs',
  },
  // ── Other Courses ──
  {
    id: 'bcc',
    title: 'BCC (Basic Computer Course)',
    desc: 'NIELIT BCC — Computer basics, MS Office, Internet, typing और fundamentals.',
    icon: '🖥️', color: '#0f766e',
    testRoute: '/tests?search=BCC',
    pdfRoute:  '/pdfs?cat=BCC',
    tags: ['BCC','NIELIT','MS Office','Internet'],
    testCount: 'Tests', pdfCount: 'PDFs',
  },
  {
    id: 'adca',
    title: 'ADCA Course',
    desc: 'Advanced Diploma in Computer Applications — Tally, DTP, MS Office, Programming.',
    icon: '🎖️', color: '#b45309',
    testRoute: '/tests?search=ADCA',
    pdfRoute:  '/pdfs?cat=ADCA',
    tags: ['ADCA','Tally','DTP','MS Office'],
    testCount: 'Tests', pdfCount: 'PDFs',
  },
  {
    id: 'dca',
    title: 'DCA Course',
    desc: 'Diploma in Computer Applications — Computer basics, Office applications, Internet.',
    icon: '📜', color: '#0369a1',
    testRoute: '/tests?search=DCA',
    pdfRoute:  '/pdfs?cat=DCA',
    tags: ['DCA','Office','Internet','Basics'],
    testCount: 'Tests', pdfCount: 'PDFs',
  },
  {
    id: 'ms-office',
    title: 'MS Office',
    desc: 'MS Word, Excel, PowerPoint, Access — shortcuts, formulas और exam questions.',
    icon: '📄', color: '#1d4ed8',
    testRoute: '/tests?search=MS+Office',
    pdfRoute:  '/pdfs?cat=MS+Office',
    tags: ['Word','Excel','PowerPoint','Access'],
    testCount: 'Tests', pdfCount: 'PDFs',
  },
  {
    id: 'database',
    title: 'Database & DBMS',
    desc: 'SQL queries, normalization, ER diagrams, transactions और database concepts।',
    icon: '🗃️', color: '#2e7d32',
    testRoute: '/tests?search=Database',
    pdfRoute:  '/pdfs?cat=Database',
    tags: ['SQL','MySQL','Oracle','MongoDB'],
    testCount: 'Tests', pdfCount: 'PDFs',
  },
  {
    id: 'networking',
    title: 'Network & Internet',
    desc: 'Computer Networks — OSI model, TCP/IP, topologies, protocols, security basics.',
    icon: '🌐', color: '#0369a1',
    testRoute: '/tests?search=Network',
    pdfRoute:  '/pdfs?cat=Network',
    tags: ['OSI','TCP/IP','LAN','WAN'],
    testCount: 'Tests', pdfCount: 'PDFs',
  },
]

// ── Group cards by section ───────────────────────────────────────────────────
const CARD_SECTIONS = [
  {
    id: 'olevel',
    badge: '🎓 NIELIT O Level',
    title: 'O Level Modules',
    sub: 'M1-R5 से M4-R5 — चारों modules के लिए individual Mock Tests और PDF Notes।',
    color: '#4caf50',
    ids: ['olevel-m1','olevel-m2','olevel-m3','olevel-m4'],
  },
  {
    id: 'ccc',
    badge: '🖱️ NIELIT CCC',
    title: 'CCC — Course on Computer Concepts',
    sub: 'NIELIT CCC की तैयारी — Computer basics, LibreOffice, Internet, e-Governance MCQ tests और notes।',
    color: '#0891b2',
    ids: ['ccc'],
  },
  {
    id: 'alevel',
    badge: '🅰️ NIELIT A Level',
    title: 'A Level Subjects',
    sub: 'Advanced IT certification — सभी subjects के Mock Tests और Study Material।',
    color: '#7c3aed',
    ids: ['alevel-a10','alevel-a5','alevel-a6','alevel-a7','alevel-a8'],
  },
  {
    id: 'programming',
    badge: '⌨️ Programming',
    title: 'Programming Languages',
    sub: 'C, Java, Python, C++, PHP — subject-wise practice tests और PDF notes।',
    color: '#0284c7',
    ids: ['c-prog','java-prog','python-prog','cpp-prog','php-prog'],
  },
  {
    id: 'other',
    badge: '📚 Other Courses',
    title: 'Other IT Courses',
    sub: 'BCC, ADCA, DCA, MS Office, Database, Networking — सभी courses की preparation।',
    color: '#0f766e',
    ids: ['bcc','adca','dca','ms-office','database','networking'],
  },
]

const howItWorks = [
  { step:'01', title:'Course चुनें',    desc:'O Level, CCC, Programming या अपना पसंदीदा course select करें।', icon:'🎯', color:'#4caf50' },
  { step:'02', title:'PDF Notes पढ़ें',  desc:'Chapter-wise PDF notes download करें — Hindi और English दोनों में।', icon:'📄', color:'#66bb6a' },
  { step:'03', title:'Mock Test दें',   desc:'Subject-wise MCQ test दें, instant result और explanation देखें।', icon:'✅', color:'#388e3c' },
  { step:'04', title:'Exam Crack करें', desc:'PDF revision करें, projects समझें और top grade पाएँ।', icon:'🏆', color:'#2e7d32' },
]

const testimonials = [
  { name:'राहुल कुमार', city:'लखनऊ',   text:'M3-R5 Python mock tests से तैयारी इतनी मज़बूत हुई कि exam में 82% आए।', result:'O Level — 2025', avatar:'RK', color:'#4caf50' },
  { name:'प्रिया सिंह', city:'पटना',    text:'PDF notes पढ़कर उसी दिन MCQ practice — यह strategy काम आई।', result:'CCC + M1-M2 उत्तीर्ण', avatar:'PS', color:'#388e3c' },
  { name:'अमन तिवारी',  city:'दिल्ली',  text:'Projects और PDF notes एक ही जगह मिले। Time और पैसे दोनों बचे।', result:'All Modules Cleared', avatar:'AT', color:'#66bb6a' },
  { name:'स्नेहा वर्मा', city:'भोपाल',  text:'IoT M4-R5 के लिए यहाँ diagrams और examples से सब clear हो गया।', result:'M4-R5 S Grade', avatar:'SV', color:'#2e7d32' },
]

const features = [
  { icon:'⚡', title:'Instant Results',    desc:'Test submit करते ही score, grade और detailed analysis मिलता है।' },
  { icon:'💡', title:'Explanation हर Q में', desc:'हर question के साथ detailed explanation — concept clear रहे।' },
  { icon:'📱', title:'Mobile Friendly',     desc:'Phone, tablet, laptop — सभी devices पर perfectly काम करता है।' },
  { icon:'🔒', title:'100% Free Forever',   desc:'कोई hidden charge नहीं, कोई subscription नहीं — always free।' },
  { icon:'📊', title:'Progress Tracking',   desc:'आपकी progress track होती है — कहाँ हो, कहाँ जाना है।' },
  { icon:'🌐', title:'Hindi + English',     desc:'हिंदी और English दोनों में content — आपकी भाषा में सीखें।' },
]

const homeFaqs = faqItems.slice(0, 5)

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ badge, title, sub, center = true }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', marginBottom: 40 }}>
      {badge && <span className="badge" style={{ marginBottom: 12, display: 'inline-block' }}>{badge}</span>}
      <h2 style={{ fontSize: 'clamp(1.5rem,3.5vw,2.3rem)', fontWeight: 900, lineHeight: 1.2, marginBottom: 10 }}>{title}</h2>
      {sub && <p style={{ color: 'var(--text-secondary)', fontSize: '0.97rem', maxWidth: 620, margin: center ? '0 auto' : '0', lineHeight: 1.75 }}>{sub}</p>}
    </div>
  )
}

// ─── Coming Soon Modal ────────────────────────────────────────────────────────
function ComingSoonModal({ item, onClose }) {
  if (!item) return null
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(6px)' }} onClick={onClose}>
      <div style={{ background:'var(--bg-card)', border:'2px solid var(--accent)', borderRadius:20, maxWidth:400, width:'100%', padding:'36px 28px', textAlign:'center', boxShadow:'0 20px 60px rgba(76,175,80,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize:'3rem', marginBottom:14 }}>🚧</div>
        <h2 style={{ fontSize:'1.5rem', fontWeight:900, marginBottom:10, color:'var(--text-primary)' }}>जल्द आ रहा है!</h2>
        <p style={{ color:'var(--text-secondary)', marginBottom:22, lineHeight:1.7 }}>
          <strong style={{ color:'var(--accent)' }}>{item}</strong> की सामग्री जल्द ही उपलब्ध होगी।
        </p>
        <button className="btn btn-primary" onClick={onClose} style={{ width:'100%' }}>ठीक है 👍</button>
      </div>
    </div>
  )
}

// ─── Category Card ────────────────────────────────────────────────────────────
function CategoryCard({ cat, index, onComingSoon }) {
  const navigate = useNavigate()
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`fade-up stagger-${(index%4)+1}`}
      style={{
        background: hov ? `linear-gradient(135deg, ${cat.color}10, ${cat.color}1a)` : 'var(--bg-card)',
        border: `1.5px solid ${hov ? cat.color : 'var(--border)'}`,
        borderRadius: 18, padding: '24px 22px',
        boxShadow: hov ? `0 12px 32px ${cat.color}28` : '0 2px 8px rgba(0,0,0,0.04)',
        transform: hov ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'all 0.28s cubic-bezier(0.16,1,0.3,1)',
        display: 'flex', flexDirection: 'column', gap: 14,
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Top accent line */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:`linear-gradient(90deg, ${cat.color}, ${cat.color}88)`, borderRadius:'18px 18px 0 0' }} />

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:4 }}>
        <div style={{ width:48, height:48, borderRadius:14, background:`${cat.color}18`, border:`2px solid ${cat.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0 }}>
          {cat.icon}
        </div>
        <div>
          <h3 style={{ fontWeight:900, fontSize:'1rem', color:'var(--text-primary)', marginBottom:2 }}>{cat.title}</h3>
          {cat.soon && <span style={{ fontSize:'0.68rem', fontWeight:800, color:'#f59e0b', background:'#fef3c7', padding:'2px 8px', borderRadius:999 }}>🔜 Coming Soon</span>}
        </div>
      </div>

      {/* Desc */}
      <p style={{ color:'var(--text-secondary)', fontSize:'0.85rem', lineHeight:1.65, flex:1 }}>{cat.desc}</p>

      {/* Tags */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
        {cat.tags.map(t => (
          <span key={t} style={{ fontSize:'0.7rem', padding:'2px 9px', borderRadius:999, background:`${cat.color}15`, color:cat.color, fontWeight:700 }}>{t}</span>
        ))}
      </div>

      {/* Stats */}
      {(cat.testCount || cat.pdfCount) && (
        <div style={{ display:'flex', gap:8 }}>
          {cat.testCount && <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontWeight:600 }}>📋 {cat.testCount}</span>}
          {cat.pdfCount  && <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontWeight:600 }}>📄 {cat.pdfCount}</span>}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:4 }}>
        <button
          style={{ padding:'9px 0', borderRadius:10, border:`1.5px solid ${cat.color}55`, background: hov ? cat.color : `${cat.color}12`, color: hov ? '#fff' : cat.color, fontWeight:800, fontSize:'0.78rem', cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}
          onClick={() => cat.soon ? onComingSoon(cat.title) : navigate(cat.testRoute)}
        >
          <FiClipboard size={13}/> Mock Test
        </button>
        <button
          onClick={() => navigate(cat.pdfRoute)}
          style={{ padding:'9px 0', borderRadius:10, border:`1.5px solid var(--border)`, background:'var(--bg-card2)', color:'var(--text-secondary)', fontWeight:700, fontSize:'0.78rem', cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}
        >
          <FiFileText size={13}/> PDF Notes
        </button>
      </div>
    </div>
  )
}

// ─── Latest Blogs ─────────────────────────────────────────────────────────────
function LatestBlogs() {
  const { blogs, loading } = useBlogManagement()
  const latest = blogs.slice(0, 4)
  const placeholders = [
    { title:'NIELIT O Level Exam Pattern 2026 — Complete Guide', cat:'O Level', date:'June 2026', read:'5 min', icon:'🎓', color:'#4caf50' },
    { title:'M3-R5 Python: Top 50 MCQs जो बार-बार आते हैं',   cat:'Python',  date:'June 2026', read:'8 min', icon:'🐍', color:'#388e3c' },
    { title:'CCC Exam Strategy — 30 Days Preparation Plan',    cat:'CCC',     date:'May 2026',  read:'6 min', icon:'💻', color:'#66bb6a' },
    { title:'M1-R5 LibreOffice Shortcuts — Must Know',        cat:'Tips',    date:'May 2026',  read:'4 min', icon:'⚡', color:'#2e7d32' },
  ]
  const items = latest.length > 0 ? latest : null

  return (
    <section style={{ padding:'70px 24px', background:'var(--bg-card2)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <SectionHeader badge="✍️ Latest Articles" title="Blog & Study Tips" sub="Exam preparation tips, Python tutorials, career guidance — regularly updated." />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20 }}>
          {loading ? [1,2,3,4].map(i=>(
            <div key={i} className="skeleton" style={{ height:280, borderRadius:16 }} />
          )) : items ? items.map((p,i)=>(
            <Link key={p.id} to={`/blog/${p.slug||p.id}`} style={{ textDecoration:'none' }}>
              <div className={`card fade-up stagger-${(i%4)+1}`} style={{ overflow:'hidden', borderRadius:16, cursor:'pointer' }}>
                <div style={{ height:120, background: p.image ? undefined : `linear-gradient(135deg, #4caf5022, #4caf5044)`, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem' }}>
                  {p.image ? <img src={p.image} alt={p.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : '✍️'}
                </div>
                <div style={{ padding:'16px 18px' }}>
                  <h3 style={{ fontWeight:800, fontSize:'0.9rem', color:'var(--text-primary)', lineHeight:1.45, marginBottom:8, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.title}</h3>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'0.72rem', color:'var(--text-muted)' }}>
                    <span>{p.date}</span>
                    <span style={{ color:'var(--accent)', fontWeight:700 }}>Read →</span>
                  </div>
                </div>
              </div>
            </Link>
          )) : placeholders.map((p,i)=>(
            <Link key={i} to="/blog" style={{ textDecoration:'none' }}>
              <div className={`card fade-up stagger-${(i%4)+1}`} style={{ overflow:'hidden', borderRadius:16, cursor:'pointer' }}>
                <div style={{ height:120, background:`linear-gradient(135deg, ${p.color}18, ${p.color}33)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem' }}>{p.icon}</div>
                <div style={{ padding:'16px 18px' }}>
                  <span style={{ fontSize:'0.68rem', fontWeight:700, color:p.color, background:`${p.color}15`, padding:'2px 8px', borderRadius:999, display:'inline-block', marginBottom:8 }}>{p.cat}</span>
                  <h3 style={{ fontWeight:800, fontSize:'0.9rem', color:'var(--text-primary)', lineHeight:1.45, marginBottom:8 }}>{p.title}</h3>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', color:'var(--text-muted)' }}>
                    <span>{p.date} • {p.read}</span>
                    <span style={{ color:'var(--accent)', fontWeight:700 }}>Read →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ textAlign:'center', marginTop:28 }}>
          <Link to="/blog" className="btn btn-primary" style={{ textDecoration:'none', gap:8 }}>
            All Articles <FiArrowRight size={14}/>
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── MAIN HOME ────────────────────────────────────────────────────────────────
export default function Home() {
  const [comingSoon, setComingSoon] = useState(null)

  return (
    <main style={{ overflowX:'hidden' }}>
      <SEO
        title="O Level Sarathi — NIELIT O Level, CCC Free Preparation 2026"
        description="NIELIT O Level (M1-R5 to M4-R5), CCC, Programming Languages, Database, Govt Jobs — free mock tests, Hindi/English notes, PDF material. 15,000+ students trust us."
        keywords="NIELIT O Level 2026, O Level mock test free, M1-R5 notes Hindi, CCC preparation, programming MCQ, government job computer test"
        canonical="https://olevelsarathi.in/"
        schema={[{ '@context':'https://schema.org', '@type':'WebSite', name:'O Level Sarathi', url:'https://olevelsarathi.in/' }, faqSchema(homeFaqs)]}
      />



      {/* ── HERO SECTION ── */}
      <section style={{
        paddingTop: 96, paddingBottom: 60,
        background: 'linear-gradient(160deg, #0a0f1e 0%, #0d1a2e 50%, #0a0f1e 100%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow blobs */}
        <div style={{ position:'absolute', top:'-10%', left:'5%',  width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(76,175,80,0.09) 0%, transparent 65%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'-5%',  right:'5%', width:450, height:450, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'0', left:'35%', width:400, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)', pointerEvents:'none' }}/>

        <div style={{ maxWidth:860, margin:'0 auto', padding:'0 24px', position:'relative', zIndex:1 }}>

          {/* Top badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:22, padding:'7px 18px', borderRadius:999, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.3)', backdropFilter:'blur(8px)' }}>
            <span>🚀</span>
            <span style={{ fontSize:'0.72rem', fontWeight:800, color:'#a5b4fc', letterSpacing:'0.07em', textTransform:'uppercase' }}>India's #1 Free NIELIT Preparation Platform</span>
          </div>

          {/* Main Heading */}
          <h1 style={{
            fontSize: 'clamp(2rem, 6vw, 3.8rem)',
            fontWeight: 900,
            lineHeight: 1.12,
            marginBottom: 18,
            letterSpacing: '-0.025em',
          }}>
            <span style={{ color: '#f1f5f9', display:'block' }}>NIELIT O Level &amp; CCC</span>
            <span style={{
              background: 'linear-gradient(90deg, #4ade80 0%, #22d3ee 45%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'block',
            }}>
              Free Exam Preparation 2026 🎯
            </span>
          </h1>

          {/* Sub text */}
          <p style={{
            fontSize: 'clamp(0.95rem, 2.3vw, 1.15rem)',
            color: 'rgba(226,232,240,0.7)',
            lineHeight: 1.8,
            maxWidth: 640,
            margin: '0 auto 32px',
          }}>
            O Level (M1–M4), CCC, A Level, Programming Languages — सभी courses के लिए
            {' '}<strong style={{ color:'#4ade80' }}>Free Mock Tests</strong>,
            {' '}<strong style={{ color:'#818cf8' }}>PDF Material</strong> और Projects।
            <br/>सब कुछ एक जगह — Zero Cost।
          </p>

          {/* CTA Buttons */}
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:36 }}>
            <Link to="/tests" style={{
              display:'inline-flex', alignItems:'center', gap:9,
              padding:'15px 32px', borderRadius:14,
              background:'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              color:'#fff', fontWeight:800, fontSize:'0.97rem',
              textDecoration:'none',
              boxShadow:'0 8px 24px rgba(76,175,80,0.4)',
              transition:'all 0.22s',
            }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 14px 32px rgba(76,175,80,0.5)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 8px 24px rgba(76,175,80,0.4)'}}
            >
              <FiPlay size={16}/> Free Mock Test Start Karo
            </Link>
            <Link to="/pdfs" style={{
              display:'inline-flex', alignItems:'center', gap:9,
              padding:'15px 32px', borderRadius:14,
              background:'rgba(255,255,255,0.07)',
              border:'1.5px solid rgba(255,255,255,0.18)',
              color:'#e2e8f0', fontWeight:700, fontSize:'0.97rem',
              textDecoration:'none', backdropFilter:'blur(8px)',
              transition:'all 0.22s',
            }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.13)';e.currentTarget.style.borderColor='rgba(255,255,255,0.32)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.07)';e.currentTarget.style.borderColor='rgba(255,255,255,0.18)'}}
            >
              <FiFileText size={16}/> PDF Notes
            </Link>
            <Link to="/projects" style={{
              display:'inline-flex', alignItems:'center', gap:9,
              padding:'15px 32px', borderRadius:14,
              background:'rgba(99,102,241,0.12)',
              border:'1.5px solid rgba(99,102,241,0.3)',
              color:'#a5b4fc', fontWeight:700, fontSize:'0.97rem',
              textDecoration:'none', backdropFilter:'blur(8px)',
              transition:'all 0.22s',
            }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(99,102,241,0.22)';e.currentTarget.style.borderColor='rgba(99,102,241,0.5)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(99,102,241,0.12)';e.currentTarget.style.borderColor='rgba(99,102,241,0.3)'}}
            >
              <FiCode size={16}/> Projects
            </Link>
          </div>

          {/* Stats pills row */}
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            {[
              { v:'15,000+', l:'Active Students', e:'👨‍🎓', c:'#4ade80' },
              { v:'600+',    l:'MCQ Questions',   e:'📝',   c:'#22d3ee' },
              { v:'100+',    l:'PDF Notes',        e:'📄',   c:'#818cf8' },
              { v:'100%',    l:'Free Forever',     e:'🆓',   c:'#f59e0b' },
            ].map(s => (
              <div key={s.l} style={{
                display:'flex', alignItems:'center', gap:8,
                padding:'10px 18px', borderRadius:14,
                background:'rgba(255,255,255,0.05)',
                border:`1px solid ${s.c}33`,
                backdropFilter:'blur(6px)',
              }}>
                <span style={{ fontSize:'1.1rem' }}>{s.e}</span>
                <div>
                  <div style={{ fontWeight:900, fontSize:'1rem', color: s.c, lineHeight:1.1 }}>{s.v}</div>
                  <div style={{ fontSize:'0.68rem', color:'rgba(226,232,240,0.5)', fontWeight:600 }}>{s.l}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background:'var(--bg-card)', borderBottom:'1px solid var(--border)', borderTop:'1px solid var(--border)', padding:'14px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:10 }}>
          {stats.map(s => (
            <div key={s.label} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12, background:'var(--bg-card2)', border:'1px solid var(--border)' }}>
              <span style={{ fontSize:'1.5rem' }}>{s.icon}</span>
              <div>
                <div style={{ fontWeight:900, fontSize:'1.1rem', color:s.color }}>{s.value}</div>
                <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontWeight:600 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ProgressDashboard />

      {/* ════════════════════════════════════════
          CATEGORY SECTIONS — Tests + PDFs
      ════════════════════════════════════════ */}
      {CARD_SECTIONS.map((section, si) => {
        const sectionCats = categories.filter(c => section.ids.includes(c.id))
        return (
          <section key={section.id} style={{ padding:'60px 24px', background: si % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-card2)' }}>
            <div style={{ maxWidth:1200, margin:'0 auto' }}>
              {/* Section header with colored left border */}
              <div style={{ display:'flex', alignItems:'flex-start', gap:16, marginBottom:32 }}>
                <div style={{ width:4, minHeight:60, borderRadius:4, background:`linear-gradient(180deg, ${section.color}, ${section.color}44)`, flexShrink:0, marginTop:4 }} />
                <div>
                  <span style={{ fontSize:'0.75rem', fontWeight:800, color:section.color, letterSpacing:'0.08em', textTransform:'uppercase', display:'block', marginBottom:6 }}>{section.badge}</span>
                  <h2 style={{ fontSize:'clamp(1.25rem,3vw,1.8rem)', fontWeight:900, color:'var(--text-primary)', marginBottom:6, lineHeight:1.2 }}>{section.title}</h2>
                  <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem', lineHeight:1.65, maxWidth:600 }}>{section.sub}</p>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:20 }}>
                {sectionCats.map((cat, i) => (
                  <CategoryCard key={cat.id} cat={cat} index={i} onComingSoon={setComingSoon} />
                ))}
              </div>
            </div>
          </section>
        )
      })}

      <section style={{ padding:'0 24px', maxWidth:1200, margin:'0 auto' }}><AutoAd/></section>

      {/* ════════════════════════════════════════
          FEATURES GRID
      ════════════════════════════════════════ */}
      <section style={{ padding:'70px 24px', background:'var(--bg-card2)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <SectionHeader badge="✨ Features" title="क्यों O Level Sarathi?" sub="हज़ारों students हमें choose करते हैं — जानिए क्यों।" />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:18 }}>
            {features.map((f,i) => (
              <div key={f.title} className={`card fade-up stagger-${(i%3)+1}`} style={{ padding:'22px 20px', display:'flex', gap:14, alignItems:'flex-start' }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'var(--accent-glow)', border:'1.5px solid var(--border-hover)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>{f.icon}</div>
                <div>
                  <h3 style={{ fontWeight:800, fontSize:'0.95rem', color:'var(--text-primary)', marginBottom:5 }}>{f.title}</h3>
                  <p style={{ color:'var(--text-secondary)', fontSize:'0.83rem', lineHeight:1.65 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════ */}
      <section style={{ padding:'70px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <SectionHeader badge="🔄 Process" title="तैयारी कैसे करें?" sub="केवल 4 steps में NIELIT exam की preparation complete करें।" />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))', gap:20 }}>
            {howItWorks.map((step,i) => (
              <div key={step.step} className={`card fade-up stagger-${i+1}`} style={{ padding:'28px 22px', position:'relative', overflow:'visible', borderTop:`3px solid ${step.color}` }}>
                <div style={{ position:'absolute', top:-14, left:20, width:30, height:30, borderRadius:8, background:step.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:'0.8rem', color:'#fff', boxShadow:`0 4px 12px ${step.color}55` }}>
                  {step.step}
                </div>
                <div style={{ fontSize:'2rem', marginTop:10, marginBottom:12 }}>{step.icon}</div>
                <h3 style={{ fontWeight:800, fontSize:'0.97rem', marginBottom:7, color:'var(--text-primary)' }}>{step.title}</h3>
                <p style={{ color:'var(--text-secondary)', fontSize:'0.85rem', lineHeight:1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════ */}
      <section style={{ padding:'70px 24px', background:'var(--bg-card2)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <SectionHeader badge="⭐ Student Reviews" title="Students क्या कहते हैं?" sub="Real feedback from students who cleared NIELIT exams using O Level Sarathi." />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:18 }}>
            {testimonials.map((t,i) => (
              <div key={t.name} className={`card fade-up stagger-${(i%4)+1}`} style={{ padding:'22px 20px', borderLeft:`3px solid ${t.color}` }}>
                <div style={{ display:'flex', gap:3, marginBottom:10 }}>
                  {[1,2,3,4,5].map(s => <FiStar key={s} size={13} fill={t.color} color={t.color}/>)}
                </div>
                <p style={{ color:'var(--text-secondary)', fontSize:'0.87rem', lineHeight:1.7, marginBottom:16, fontStyle:'italic' }}>"{t.text}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:10, paddingTop:12, borderTop:'1px solid var(--border)' }}>
                  <div style={{ width:36, height:36, borderRadius:999, background:`${t.color}22`, border:`2px solid ${t.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'0.78rem', color:t.color, flexShrink:0 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight:800, fontSize:'0.88rem', color:'var(--text-primary)' }}>{t.name}</div>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{t.city} • {t.result}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          LATEST BLOGS
      ════════════════════════════════════════ */}
      <LatestBlogs />

      {/* ════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════ */}
      <section style={{ padding:'70px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ background:'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)', borderRadius:24, padding:'56px 40px', textAlign:'center', boxShadow:'0 16px 48px rgba(76,175,80,0.35)', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-40, right:-40, width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.08)' }}/>
            <div style={{ position:'absolute', bottom:-30, left:-30, width:140, height:140, borderRadius:'50%', background:'rgba(255,255,255,0.06)' }}/>
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ fontSize:'2.5rem', marginBottom:14 }}>🎓</div>
              <h2 style={{ fontSize:'clamp(1.4rem,3.5vw,2rem)', fontWeight:900, color:'#fff', marginBottom:12, lineHeight:1.25 }}>
                आज ही शुरू करें — यह Free है!
              </h2>
              <p style={{ color:'rgba(255,255,255,0.88)', fontSize:'0.97rem', marginBottom:28, lineHeight:1.7, maxWidth:540, margin:'0 auto 28px' }}>
                15,000+ students already तैयारी कर रहे हैं। अपनी O Level journey आज शुरू करें।
              </p>
              <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
                <Link to="/tests" style={{ padding:'13px 28px', borderRadius:12, background:'#fff', color:'#2e7d32', fontWeight:800, fontSize:'0.92rem', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:7, boxShadow:'0 4px 14px rgba(0,0,0,0.12)' }}>
                  <FiPlay size={15}/> Mock Test Start Karo
                </Link>
                <Link to="/pdfs" style={{ padding:'13px 28px', borderRadius:12, background:'rgba(255,255,255,0.15)', color:'#fff', fontWeight:700, fontSize:'0.92rem', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:7, border:'1.5px solid rgba(255,255,255,0.4)', backdropFilter:'blur(4px)' }}>
                  <FiFileText size={15}/> PDF Download Karo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding:'0 24px 40px', maxWidth:1200, margin:'0 auto' }}><RelaxedAd/></section>

      <ComingSoonModal item={comingSoon} onClose={() => setComingSoon(null)} />
    </main>
  )
}
