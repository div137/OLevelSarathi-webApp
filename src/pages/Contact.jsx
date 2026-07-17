import SEO from '../components/SEO'
import LastUpdated from '../components/LastUpdated'
import { FiMail, FiMessageCircle, FiGlobe, FiPhone } from 'react-icons/fi'

export default function Contact() {
  return (
    <div className="page" style={{ maxWidth: 800, margin: '0 auto', padding: '120px 24px 80px' }}>
      <SEO 
        title="संपर्क करें | O Level Sarathi — NIELIT O Level Exam Help"
        description="O Level Sarathi से संपर्क करें — O Level exam guidance, technical support, feedback. Email, phone aur Telegram support available. OLevelSarathi.in"
        keywords="O Level Sarathi contact, OLevelSarathi support, NIELIT O Level help, O Level exam guidance, O Level Sarathi email, O Level support"
        canonical="https://olevelsarathi.in/contact"
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Contact', url: '/contact' }]}
      />
      <LastUpdated date="June 2026" />
      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: 16 }}>संपर्क करें</h1>
      <div style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>
        <p style={{ marginBottom: 16 }}>आपके प्रश्न, सुझाव या सहायता की आवश्यकता है? हम आपसे सुनना चाहते हैं!</p>
        <p style={{ marginBottom: 20 }}>O Level Sarathi में हम अपने उपयोगकर्ताओं को सर्वोत्तम शैक्षिक अनुभव प्रदान करने के लिए प्रतिबद्ध हैं। चाहे आपकी अध्ययन सामग्री के बारे में कोई जिज्ञासा हो, वेबसाइट या Android ऐप से संबंधित तकनीकी सहायता चाहिए हो, या NIELIT परीक्षा उत्तीर्ण करने के बाद अपनी सफलता की कहानी साझा करनी हो — हमारी टीम हमेशा आपकी सहायता के लिए तैयार है। आपकी प्रतिक्रिया हमें बेहतर बनने में मदद करती है।</p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: 30, marginBottom: 12 }}>हम कैसे सहायता कर सकते हैं?</h2>
        <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
          <li style={{ marginBottom: 8 }}><strong>शैक्षणिक संदेह:</strong> Python कोड या वेब डिज़ाइन की अवधारणा में अटक गए हैं? हमारे शिक्षकों से संपर्क करें।</li>
          <li style={{ marginBottom: 8 }}><strong>तकनीकी सहायता:</strong> मॉक टेस्ट देते समय कोई त्रुटि, टूटे लिंक या समस्या आने पर हमें बताएँ।</li>
          <li style={{ marginBottom: 8 }}><strong>व्यावसायिक पूछताछ:</strong> साझेदारी, सहयोग या विज्ञापन के अवसरों के लिए ईमेल से संपर्क करें।</li>
          <li style={{ marginBottom: 8 }}><strong>सामान्य प्रतिक्रिया:</strong> बताएँ कि हम O Level Sarathi को आपके लिए और बेहतर कैसे बना सकते हैं।</li>
        </ul>

        <h2 style={{ color: 'var(--text-primary)', marginTop: 30, marginBottom: 16 }}>संपर्क विवरण</h2>
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiMail size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Email</div>
              <div>er.divsir@gmail.com</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiPhone size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Phone / WhatsApp</div>
              <div>+91 9532595992</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiMessageCircle size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Telegram Community</div>
              <div>@OLevelSarathiSupport</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiGlobe size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Website</div>
              <div>olevelsarathi.in</div>
            </div>
          </div>
        </div>

        <p style={{ marginTop: 40, fontWeight: 'bold' }}>हम 24-48 घंटों में उत्तर देते हैं। पहले <a href="/faq" style={{ color: 'var(--accent)' }}>FAQ पृष्ठ</a> अवश्य देखें।</p>
      </div>
      <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {[
          { to: '/faq',   label: 'FAQ' },
          { to: '/tests', label: 'Mock Tests' },
          { to: '/about', label: 'About Us' },
        ].map(link => (
          <a key={link.label} href={link.to} style={{ padding: '10px 16px', borderRadius: 999, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--accent)', fontWeight: 700, fontSize: '0.88rem', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>
            {link.label} →
          </a>
        ))}
      </div>
    </div>
  )
}
