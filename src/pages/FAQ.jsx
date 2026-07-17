import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import LastUpdated from '../components/LastUpdated'
import { faqItems, faqSchema } from '../data/faqData'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { AutoAd, RelaxedAd } from '../components/GoogleAd'

function FaqItem({ item, open, onToggle }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '20px 24px',
          background: open ? 'var(--accent-glow)' : 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          alignItems: 'center',
          minHeight: 44,
          fontWeight: 800,
          fontSize: '1rem',
        }}
      >
        <span>{item.q}</span>
        {open ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      {open && (
        <div style={{ padding: '0 24px 24px', color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}>
          {item.a}
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="page" style={{ maxWidth: 900, margin: '0 auto', padding: '120px 24px 80px' }}>
      <SEO
        title="O Level Exam FAQ 2026 | NIELIT O Level Questions & Answers — OLevelSarathi"
        description="NIELIT O Level exam se related 16+ important questions ke answers — registration, fees, syllabus M1-R5 se M4-R5 tak, pass marks, practical exam aur free mock tests. OLevelSarathi.in"
        keywords="O Level exam FAQ, O Level exam questions, NIELIT O Level 2026, O Level registration, O Level fees, O Level pass marks, OLevelSarathi, O Level exam date 2026, O Level syllabus questions, NIELIT exam guide"
        canonical="https://olevelsarathi.in/faq"
        schema={faqSchema()}
      />
      <LastUpdated date="June 2026" />

      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: 16 }}>NIELIT O Level परीक्षा — अक्सर पूछे जाने वाले प्रश्न</h1>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 32 }}>
        NIELIT O Level परीक्षा, CCC और ADCA से जुड़े सबसे सामान्य प्रश्नों के उत्तर यहाँ दिए गए हैं।
        यदि आपका प्रश्न यहाँ नहीं है तो <Link to="/contact" style={{ color: 'var(--accent)' }}>संपर्क पृष्ठ</Link> पर संदेश भेजें।
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 48 }}>
        {faqItems.map((item, index) => (
          <FaqItem
            key={item.q}
            item={item}
            open={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
          />
        ))}
      </div>

      <AutoAd />
      <RelaxedAd />

      <div style={{ marginTop: 40, padding: 24, background: 'var(--bg-card2)', borderRadius: 16, border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16 }}>Related Resources</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[
            { to: '/tests',    label: 'Free O Level Mock Tests' },
            { to: '/pdfs',     label: 'M3-R5 Python PDF Notes' },
            { to: '/pdfs',     label: 'M1-R5 IT Tools PDF Notes' },
            { to: '/projects', label: 'Practical Project Guides' },
          ].map(link => (
            <Link key={link.label} to={link.to} style={{ padding: '10px 16px', borderRadius: 999, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--accent)', fontWeight: 700, fontSize: '0.88rem', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>
              {link.label} →
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
