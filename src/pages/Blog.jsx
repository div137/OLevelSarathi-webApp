import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { useBlogManagement } from '../hooks/useBlogManagement'
import { FiArrowRight, FiCalendar, FiClock } from 'react-icons/fi'
import { AutoAd } from '../components/GoogleAd'

export default function Blog() {
  const { blogs, loading, error, useLocal } = useBlogManagement()

  return (
    <main className="page" style={{ paddingTop: 120 }}>
      <SEO 
        title="O Level Exam Blog | NIELIT O Level Tips & Guide — OLevelSarathi"
        description="O Level exam tips, NIELIT O Level study guides, Python tutorials, CCC preparation strategies aur IT career guidance. OLevelSarathi.in ka official blog — regular updates ke saath."
        keywords="O Level exam blog, O Level tips, NIELIT O Level guide, OLevelSarathi blog, O Level preparation, M3-R5 Python tips, CCC guide, O Level exam 2026, NIELIT study tips, O Level study strategies"
        canonical="https://olevelsarathi.in/blog"
      />
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <span className="badge" style={{ marginBottom: 16, display: 'inline-block' }}>✍️ O Level Blog</span>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: 16 }}>O Level Sarathi — ब्लॉग और अध्ययन मार्गदर्शिका</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 640, margin: '0 auto' }}>
          NIELIT O Level परीक्षा, CCC, Python और IT करियर से जुड़े विशेषज्ञ लेख — नियमित अपडेट के साथ।
        </p>
        <div style={{ margin: '24px auto 0', maxWidth: 800, padding: '20px 24px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)', lineHeight: '1.8', color: 'var(--text-secondary)', textAlign: 'left', fontSize: '0.95rem' }}>
          <p style={{ marginBottom: 14 }}>O Level Sarathi के ब्लॉग में आपका स्वागत है। यह ब्लॉग NIELIT O Level परीक्षा की तैयारी, CCC, ADCA और IT क्षेत्र में करियर मार्गदर्शन के लिए आपका सबसे विश्वसनीय स्रोत है। यहाँ M1-R5 से M4-R5 तक के सभी मॉड्यूल के लिए विशेषज्ञ-लिखित लेख मिलेंगे।</p>
          <p>Python एल्गोरिदम, IoT परियोजना सेटअप, वेब डेवलपमेंट फ्रेमवर्क, डेटाबेस प्रबंधन और NIELIT परीक्षा के नवीनतम पैटर्न — सभी विषयों पर गहन जानकारी पाएँ। हमारे लेख भारतीय विद्यार्थियों की ज़रूरतों को ध्यान में रखकर हिंदी और अंग्रेज़ी दोनों में तैयार किए गए हैं।</p>
        </div>
      </div>

      {/* Ad — top of blog */}
      <div style={{ maxWidth: 900, margin: '0 auto 40px' }}>
        <AutoAd />
      </div>

      {useLocal && (
        <div style={{ marginBottom: 20, padding: 20, borderRadius: 12, background: 'rgba(250, 204, 21, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: 'var(--text-primary)' }}>
          Firestore connection temporary unavailable. Blog posts are working from local mode.
        </div>
      )}

      {error && (
        <div style={{ marginBottom: 20, padding: 20, borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#b91c1c' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div>Loading blogs...</div>
        </div>
      ) : blogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          No blogs published yet
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {blogs.map((post, i) => (
            <Link key={post.id} to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}
              className={`card fade-up stagger-${(i%4)+1}`}>
              <article style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                {/* Image */}
                <div style={{ height: 200, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    />
                  ) : (
                    <div style={{ height: '100%', background: 'linear-gradient(135deg, #4caf5022, #4caf5040)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                      ✍️
                    </div>
                  )}
                  {post.category && (
                    <span style={{ position: 'absolute', top: 12, left: 14, fontSize: '0.7rem', fontWeight: 800, color: '#fff', background: '#4caf50', padding: '3px 10px', borderRadius: 999, letterSpacing: '0.04em' }}>
                      {post.category}
                    </span>
                  )}
                </div>
                {/* Body */}
                <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {post.date && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiCalendar size={11}/> {post.date}</span>}
                    {post.readTime && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock size={11}/> {post.readTime}</span>}
                  </div>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.4, color: 'var(--text-primary)', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.title}</h2>
                  {post.excerpt && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>By {post.author || 'Admin'}</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      Read More <FiArrowRight size={13}/>
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      {/* Ad — bottom of blog listing */}
      <div style={{ maxWidth: 900, margin: '40px auto 0' }}>
        <AutoAd />
      </div>
    </main>
  )
}
