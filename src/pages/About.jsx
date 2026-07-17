import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import LastUpdated from '../components/LastUpdated'
import { AutoAd, RelaxedAd } from '../components/GoogleAd'

export default function About() {
  return (
    <div className="page" style={{ maxWidth: 860, margin: '0 auto', padding: '120px 24px 80px' }}>
      <SEO
        title="O Level Sarathi के बारे में | NIELIT O Level Free Preparation Platform"
        description="O Level Sarathi — भारत का विश्वसनीय निःशुल्क मंच NIELIT O Level, CCC aur ADCA परीक्षा तैयारी के लिए। 15,000+ विद्यार्थी, 600+ MCQ, हिंदी/अंग्रेज़ी नोट्स। OLevelSarathi.in"
        keywords="O Level Sarathi, OLevelSarathi, NIELIT O Level free, O Level exam preparation, O Level coaching free, NIELIT preparation platform, O Level Sarathi about, NIELIT O Level 2026"
        canonical="https://olevelsarathi.in/about"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'About', url: '/about' },
        ]}
      />
      <LastUpdated date="June 2026" />

      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: 20 }}>O Level Sarathi के बारे में</h1>

      <div style={{ lineHeight: 1.85, color: 'var(--text-secondary)', fontSize: '1rem' }}>
        <p style={{ marginBottom: 20 }}>
          <strong style={{ color: 'var(--text-primary)' }}>O Level Sarathi</strong> एक समर्पित शैक्षिक मंच है जो NIELIT O Level, CCC, ADCA और संबंधित IT प्रमाणन परीक्षाओं की तैयारी विद्यार्थियों के लिए पूरी तरह निःशुल्क प्रदान करता है। हमारा उद्देश्य सरल है — <em>प्रत्येक विद्यार्थी को गुणवत्तापूर्ण परीक्षा तैयारी सुलभ हो</em>, चाहे वे किसी भी शहर या गाँव से हों, हिंदी माध्यम हों या अंग्रेज़ी माध्यम।
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: 36, marginBottom: 12, fontSize: '1.4rem' }}>हमारी दृष्टि</h2>
        <p style={{ marginBottom: 20 }}>
          भारत में प्रतिवर्ष लाखों विद्यार्थी NIELIT O Level परीक्षा देते हैं, लेकिन कई विद्यार्थियों के पास कोचिंग संस्थान जाने का समय या पैसा नहीं होता। O Level Sarathi इसी अंतर को पाटता है — आप घर बैठे सिद्धांत पढ़ सकते हैं, मॉक टेस्ट दे सकते हैं, प्रायोगिक परियोजनाओं का अभ्यास कर सकते हैं और अपनी प्रगति ट्रैक कर सकते हैं। हमारी दृष्टि है कि डिजिटल शिक्षा के माध्यम से प्रत्येक विद्यार्थी अपना IT करियर शुरू कर सके।
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: 36, marginBottom: 12, fontSize: '1.4rem' }}>इस मंच पर क्या मिलेगा?</h2>
        <ul style={{ paddingLeft: 24, marginBottom: 20 }}>
          <li style={{ marginBottom: 10 }}><strong>O Level मॉक टेस्ट:</strong> M1-R5 IT Tools, M2-R5 वेब डिज़ाइनिंग, M3-R5 Python, M4-R5 IoT — प्रत्येक मॉड्यूल के MCQ परीक्षण तत्काल परिणाम के साथ।</li>
          <li style={{ marginBottom: 10 }}><strong>सिद्धांत नोट्स:</strong> NIELIT R5.1 पाठ्यक्रम के अनुसार अध्यायवार विस्तृत नोट्स — हिंदी और अंग्रेज़ी दोनों में।</li>
          <li style={{ marginBottom: 10 }}><strong>PDF अध्ययन सामग्री:</strong> त्वरित पुनरावृत्ति नोट्स और महत्वपूर्ण विषयों की PDF डाउनलोड करें।</li>
          <li style={{ marginBottom: 10 }}><strong>प्रायोगिक परियोजनाएँ:</strong> O Level प्रायोगिक परीक्षा के लिए LibreOffice, HTML/CSS, Python और IoT पर चरणबद्ध असाइनमेंट।</li>
          <li style={{ marginBottom: 10 }}><strong>ब्लॉग और अपडेट:</strong> NIELIT परीक्षा तिथियाँ, पाठ्यक्रम परिवर्तन और तैयारी के सुझाव।</li>
        </ul>

        <h2 style={{ color: 'var(--text-primary)', marginTop: 36, marginBottom: 12, fontSize: '1.4rem' }}>NIELIT O Level पाठ्यक्रम (R5.1) — संक्षिप्त विवरण</h2>
        <p style={{ marginBottom: 16 }}>
          NIELIT O Level पाठ्यक्रम में चार सिद्धांत मॉड्यूल और एक प्रायोगिक परीक्षा होती है। प्रत्येक मॉड्यूल अलग कौशल सेट को कवर करता है:
        </p>
        <p style={{ marginBottom: 10 }}><strong>M1-R5 — IT Tools और नेटवर्क मूल बातें:</strong> कंप्यूटर की मूल अवधारणाएँ, ऑपरेटिंग सिस्टम, LibreOffice (Writer, Calc, Impress), इंटरनेट और नेटवर्किंग।</p>
        <p style={{ marginBottom: 10 }}><strong>M2-R5 — वेब डिज़ाइनिंग और प्रकाशन:</strong> HTML5, CSS3, JavaScript, वेब प्रकाशन टूल और उत्तरदायी डिज़ाइन।</p>
        <p style={{ marginBottom: 10 }}><strong>M3-R5 — Python में प्रोग्रामिंग:</strong> एल्गोरिदम, फ्लोचार्ट, Python सिंटैक्स, डेटा संरचनाएँ, फ़ंक्शन और फ़ाइल हैंडलिंग।</p>
        <p style={{ marginBottom: 20 }}><strong>M4-R5 — इंटरनेट ऑफ़ थिंग्स:</strong> IoT पारिस्थितिकी तंत्र, सेंसर, Arduino की मूल बातें, अनुप्रयोग और सुरक्षा अवधारणाएँ।</p>

        <h2 style={{ color: 'var(--text-primary)', marginTop: 36, marginBottom: 12, fontSize: '1.4rem' }}>तैयारी रणनीति — हमारी अनुशंसा</h2>
        <ol style={{ paddingLeft: 24, marginBottom: 20 }}>
          <li style={{ marginBottom: 10 }}>पहले NIELIT का आधिकारिक पाठ्यक्रम डाउनलोड करें और प्रत्येक मॉड्यूल के विषयों की सूची बनाएँ।</li>
          <li style={{ marginBottom: 10 }}>सिद्धांत अनुभाग से अध्याय पढ़ें — एक अध्याय पढ़ने के बाद उसी विषय के MCQ तुरंत हल करें।</li>
          <li style={{ marginBottom: 10 }}>प्रत्येक सप्ताह कम से कम दो पूर्ण-लंबाई वाले मॉक टेस्ट दें और कमज़ोर क्षेत्रों को नोट करें।</li>
          <li style={{ marginBottom: 10 }}>प्रायोगिक अनुभाग से असाइनमेंट का अभ्यास करें — O Level में प्रायोगिक भी उतना ही महत्वपूर्ण है।</li>
          <li style={{ marginBottom: 10 }}>परीक्षा से दो सप्ताह पहले केवल पुनरावृत्ति और पिछले मॉक टेस्ट दोहराएँ।</li>
        </ol>

        <h2 style={{ color: 'var(--text-primary)', marginTop: 36, marginBottom: 12, fontSize: '1.4rem' }}>O Level Sarathi क्यों चुनें?</h2>
        <ul style={{ paddingLeft: 24, marginBottom: 20 }}>
          <li style={{ marginBottom: 8 }}><strong>100% निःशुल्क:</strong> कोई छिपी हुई फ़ीस नहीं, कोई सदस्यता नहीं।</li>
          <li style={{ marginBottom: 8 }}><strong>अद्यतन सामग्री:</strong> 2026 पाठ्यक्रम के अनुसार सामग्री नियमित रूप से अद्यतन होती है।</li>
          <li style={{ marginBottom: 8 }}><strong>मोबाइल अनुकूल:</strong> फ़ोन से परीक्षण, नोट्स और PDF सब कुछ एक्सेस करें।</li>
          <li style={{ marginBottom: 8 }}><strong>तत्काल परिणाम:</strong> मॉक टेस्ट जमा करते ही स्कोर और व्याख्या मिलती है।</li>
          <li style={{ marginBottom: 8 }}><strong>विशेषज्ञ सामग्री:</strong> अनुभवी शिक्षकों और IT पेशेवरों द्वारा तैयार की गई सामग्री।</li>
        </ul>

        <h2 style={{ color: 'var(--text-primary)', marginTop: 36, marginBottom: 12, fontSize: '1.4rem' }}>हमारा समुदाय</h2>
        <p style={{ marginBottom: 20 }}>
          15,000 से अधिक विद्यार्थी O Level Sarathi पर सक्रिय हैं। YouTube चैनल <a href="https://youtube.com/@er.div_sir" style={{ color: 'var(--accent)' }}>@er.div_sir</a> पर
          वीडियो ट्यूटोरियल भी उपलब्ध हैं। यदि आपके कोई प्रश्न हैं तो <Link to="/contact" style={{ color: 'var(--accent)' }}>संपर्क पृष्ठ</Link> पर संदेश भेजें
          या <Link to="/faq" style={{ color: 'var(--accent)' }}>FAQ अनुभाग</Link> देखें।
        </p>

        <p style={{ marginTop: 32, fontWeight: 700, color: 'var(--text-primary)' }}>
          O Level Sarathi — NIELIT सफलता के लिए आपका विश्वसनीय साथी। चलिए, आज से ही तैयारी शुरू करते हैं!
        </p>
      </div>

      <AutoAd />
      <RelaxedAd />

      <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {[
          { to: '/tests',   label: 'Start Mock Test' },
          { to: '/faq',     label: 'Read FAQ' },
          { to: '/contact', label: 'Contact Us' },
        ].map(link => (
          <Link key={link.label} to={link.to} style={{ padding: '10px 16px', borderRadius: 999, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--accent)', fontWeight: 700, fontSize: '0.88rem', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>
            {link.label} →
          </Link>
        ))}
      </div>
    </div>
  )
}
