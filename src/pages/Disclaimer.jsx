import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import LastUpdated from '../components/LastUpdated'

export default function Disclaimer() {
  const sectionStyle = {
    color: 'var(--text-primary)',
    marginTop: 40,
    marginBottom: 14,
    fontSize: '1.25rem',
    fontWeight: 700,
    letterSpacing: '-0.01em',
  }

  const subSectionStyle = {
    color: 'var(--text-primary)',
    marginTop: 24,
    marginBottom: 10,
    fontSize: '1.08rem',
    fontWeight: 600,
  }

  const paraStyle = { marginBottom: 18 }

  const listStyle = {
    paddingLeft: 24,
    marginBottom: 18,
    listStyleType: 'disc',
  }

  const listItemStyle = {
    marginBottom: 8,
    lineHeight: 1.8,
  }

  return (
    <div className="page" style={{ maxWidth: 860, margin: '0 auto', padding: '120px 24px 80px' }}>
      <SEO
        title="Disclaimer — O Level Sarathi | NIELIT O Level Free Preparation"
        description="O Level Sarathi का विस्तृत अस्वीकरण (Disclaimer) पढ़ें। हमारी वेबसाइट पर उपलब्ध सामग्री केवल शैक्षिक उद्देश्यों के लिए है। NIELIT O Level, CCC परीक्षा तैयारी — सामग्री सटीकता, बाहरी लिंक, विज्ञापन, बौद्धिक संपदा और उपयोगकर्ता दायित्व की पूरी जानकारी।"
        keywords="O Level Sarathi disclaimer, NIELIT disclaimer, O Level exam disclaimer, olevelsarathi disclaimer, educational disclaimer India, O Level Sarathi अस्वीकरण, NIELIT O Level terms, educational website disclaimer Hindi"
        canonical="https://olevelsarathi.in/disclaimer"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Disclaimer', url: '/disclaimer' },
        ]}
      />
      <Breadcrumbs />
      <LastUpdated date="July 2026" />

      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: 12 }}>
        अस्वीकरण (Disclaimer)
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 28, fontStyle: 'italic' }}>
        अंतिम अपडेट: जुलाई 2026 &nbsp;|&nbsp; Last Updated: July 2026
      </p>

      <div style={{ lineHeight: 1.9, color: 'var(--text-secondary)', fontSize: '1rem' }}>

        {/* ── Introduction ── */}
        <div style={{ padding: '20px 24px', background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)', marginBottom: 32 }}>
          <p style={{ margin: 0 }}>
            <strong style={{ color: 'var(--text-primary)' }}>olevelsarathi.in</strong> (इसके बाद "O Level Sarathi", "हम", "हमारा" या "वेबसाइट" के रूप में संदर्भित) पर आपका स्वागत है।
            यह अस्वीकरण पृष्ठ (Disclaimer Page) इस वेबसाइट के उपयोग से संबंधित सभी महत्वपूर्ण शर्तों, सीमाओं और जिम्मेदारियों को स्पष्ट करता है।
            कृपया इस पृष्ठ को पूरा और ध्यानपूर्वक पढ़ें।
            <strong style={{ color: 'var(--text-primary)' }}> इस वेबसाइट का उपयोग जारी रखकर आप नीचे दिए गए सभी नियमों और शर्तों से पूर्ण सहमति प्रदान करते हैं।</strong>
            {' '}यदि आप इन शर्तों से सहमत नहीं हैं, तो कृपया इस वेबसाइट का उपयोग तुरंत बंद करें।
          </p>
        </div>

        {/* ── 1. Website Overview ── */}
        <h2 style={sectionStyle}>1. वेबसाइट का परिचय (Website Overview)</h2>
        <p style={paraStyle}>
          O Level Sarathi एक <strong style={{ color: 'var(--text-primary)' }}>निःशुल्क ऑनलाइन शैक्षिक मंच</strong> है
          जो NIELIT O Level, CCC (Course on Computer Concepts) और अन्य IT प्रमाणपत्र परीक्षाओं की तैयारी करने वाले
          विद्यार्थियों के लिए बनाया गया है। इस वेबसाइट पर निम्नलिखित सेवाएँ और संसाधन उपलब्ध हैं:
        </p>
        <ul style={listStyle}>
          <li style={listItemStyle}><strong>Theory Notes (सिद्धांत नोट्स):</strong> NIELIT O Level के सभी विषयों — M1-R5 (IT Tools & Network Basics), M2-R5 (Web Designing & Publishing), M3-R5 (Programming & Problem Solving through Python), M4-R5 (IoT & Applications) — के विस्तृत हिंदी-अंग्रेज़ी में नोट्स।</li>
          <li style={listItemStyle}><strong>Mock Tests & Quizzes (मॉक टेस्ट):</strong> अध्याय-वार और विषय-वार ऑनलाइन अभ्यास टेस्ट जो वास्तविक परीक्षा पैटर्न पर आधारित हैं।</li>
          <li style={listItemStyle}><strong>PDF Study Material (PDF अध्ययन सामग्री):</strong> डाउनलोड करने योग्य PDF नोट्स, चीट शीट्स, और रिवीज़न गाइड।</li>
          <li style={listItemStyle}><strong>Practical Projects (प्रायोगिक परियोजनाएँ):</strong> HTML, Python, IoT आदि विषयों के प्रैक्टिकल प्रोजेक्ट और सोर्स कोड।</li>
          <li style={listItemStyle}><strong>Code Lab (कोड लैब):</strong> ब्राउज़र-आधारित कोड एडिटर जहाँ आप HTML, CSS, JavaScript और Python कोड लिखकर अभ्यास कर सकते हैं।</li>
          <li style={listItemStyle}><strong>Blog & Updates:</strong> NIELIT परीक्षा से संबंधित नवीनतम समाचार, सिलेबस अपडेट, और तैयारी टिप्स।</li>
        </ul>
        <p style={paraStyle}>
          यह सभी सेवाएँ और सामग्री <strong style={{ color: 'var(--text-primary)' }}>पूर्णतः निःशुल्क</strong> उपलब्ध कराई जाती हैं
          और इनका उद्देश्य विद्यार्थियों की परीक्षा तैयारी में सहायता करना है। हम किसी भी प्रकार का शुल्क, फीस या भुगतान नहीं लेते हैं।
        </p>

        {/* ── 2. Content Accuracy ── */}
        <h2 style={sectionStyle}>2. सामग्री की सटीकता और विश्वसनीयता (Content Accuracy & Reliability)</h2>
        <p style={paraStyle}>
          O Level Sarathi पर प्रकाशित सभी अध्ययन सामग्री — जिसमें Theory Notes, MCQ प्रश्न, PDF नोट्स,
          प्रायोगिक परियोजनाएँ, Code Lab उदाहरण और Blog लेख शामिल हैं — हमारी टीम द्वारा
          <strong style={{ color: 'var(--text-primary)' }}> केवल शैक्षिक सहायता (educational assistance)</strong> के
          उद्देश्य से तैयार की गई हैं।
        </p>
        <h3 style={subSectionStyle}>हम क्या प्रयास करते हैं:</h3>
        <ul style={listStyle}>
          <li style={listItemStyle}>सामग्री को NIELIT के नवीनतम पाठ्यक्रम (Latest Syllabus 2024-2026) के अनुसार अद्यतन रखना।</li>
          <li style={listItemStyle}>MCQ प्रश्नों को पिछले वर्षों के प्रश्नपत्रों और अनुमानित पैटर्न के आधार पर तैयार करना।</li>
          <li style={listItemStyle}>Technical concepts को सरल हिंदी और अंग्रेज़ी दोनों भाषाओं में समझाना।</li>
          <li style={listItemStyle}>सामग्री में त्रुटियाँ (errors) मिलने पर उन्हें यथाशीघ्र सुधारना।</li>
        </ul>
        <h3 style={subSectionStyle}>हम क्या गारंटी नहीं दे सकते:</h3>
        <ul style={listStyle}>
          <li style={listItemStyle}>सामग्री की <strong>100% सटीकता, संपूर्णता या त्रुटि-मुक्तता</strong> की गारंटी नहीं दी जा सकती।</li>
          <li style={listItemStyle}>NIELIT समय-समय पर अपना पाठ्यक्रम, परीक्षा पैटर्न और मूल्यांकन मानदंड बदल सकता है — ऐसे में हमारी सामग्री तुरंत अपडेट न हो पाए।</li>
          <li style={listItemStyle}>MCQ प्रश्नों के उत्तर में मानवीय त्रुटि (human error) की संभावना रहती है।</li>
          <li style={listItemStyle}>तकनीकी विषयों में अलग-अलग संदर्भ पुस्तकों (reference books) में भिन्न-भिन्न व्याख्याएँ हो सकती हैं।</li>
        </ul>
        <p style={paraStyle}>
          <strong style={{ color: 'var(--text-primary)' }}>महत्वपूर्ण:</strong> विद्यार्थियों को सलाह दी जाती है कि वे
          हमारी सामग्री के साथ-साथ NIELIT की आधिकारिक अध्ययन सामग्री, प्रमाणित पाठ्यपुस्तकें और
          अन्य विश्वसनीय स्रोतों का भी उपयोग करें। किसी भी संदेह की स्थिति में NIELIT की आधिकारिक
          वेबसाइट से जानकारी सत्यापित करें।
        </p>

        {/* ── 3. No Affiliation ── */}
        <h2 style={sectionStyle}>3. NIELIT / सरकार से कोई संबद्धता नहीं (No Official Affiliation)</h2>
        <p style={paraStyle}>
          O Level Sarathi एक <strong style={{ color: 'var(--text-primary)' }}>पूर्णतः स्वतंत्र और निजी शैक्षिक पहल</strong> है।
          यह वेबसाइट किसी भी प्रकार से निम्नलिखित संस्थाओं से संबद्ध, प्रायोजित, अनुमोदित या मान्यता प्राप्त नहीं है:
        </p>
        <ul style={listStyle}>
          <li style={listItemStyle}><strong>NIELIT</strong> (National Institute of Electronics and Information Technology) — भारत सरकार के इलेक्ट्रॉनिक्स और सूचना प्रौद्योगिकी मंत्रालय (MeitY) के अंतर्गत एक स्वायत्त संस्थान।</li>
          <li style={listItemStyle}><strong>भारत सरकार</strong> या किसी भी केंद्रीय/राज्य सरकारी विभाग, एजेंसी या आयोग।</li>
          <li style={listItemStyle}>कोई भी <strong>विश्वविद्यालय, कॉलेज, कोचिंग संस्थान</strong> या अन्य शैक्षणिक संस्था।</li>
          <li style={listItemStyle}>कोई भी <strong>परीक्षा बोर्ड, प्रमाणन निकाय</strong> या आधिकारिक मूल्यांकन एजेंसी।</li>
        </ul>
        <p style={paraStyle}>
          NIELIT O Level, CCC, BCC और अन्य परीक्षाओं से संबंधित सभी <strong style={{ color: 'var(--text-primary)' }}>आधिकारिक जानकारी</strong> —
          जैसे परीक्षा तिथि, प्रवेश पत्र (Admit Card), परिणाम (Result), शुल्क (Fee), पाठ्यक्रम (Syllabus) और
          प्रमाणपत्र (Certificate) — के लिए कृपया केवल NIELIT की आधिकारिक वेबसाइट पर जाएँ:
        </p>
        <div style={{ padding: '14px 20px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 18, textAlign: 'center' }}>
          <a href="https://www.nielit.gov.in" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1.05rem' }}>
            🔗 www.nielit.gov.in (NIELIT Official Website)
          </a>
          <br />
          <a href="https://student.nielit.gov.in" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.95rem' }}>
            🎓 student.nielit.gov.in (Student Portal)
          </a>
        </div>

        {/* ── 4. No Guarantee ── */}
        <h2 style={sectionStyle}>4. परीक्षा परिणाम की कोई गारंटी नहीं (No Guarantee of Results)</h2>
        <p style={paraStyle}>
          O Level Sarathi पर उपलब्ध अध्ययन सामग्री, मॉक टेस्ट और अन्य संसाधनों का उपयोग करने से
          NIELIT O Level, CCC या किसी भी अन्य परीक्षा में <strong style={{ color: 'var(--text-primary)' }}>सफलता की कोई गारंटी नहीं</strong> दी जा सकती।
          परीक्षा में सफलता कई कारकों पर निर्भर करती है:
        </p>
        <ul style={listStyle}>
          <li style={listItemStyle}>विद्यार्थी की <strong>व्यक्तिगत मेहनत, लगन और नियमित अभ्यास</strong>।</li>
          <li style={listItemStyle}>विषय की <strong>गहरी समझ और अवधारणाओं की स्पष्टता</strong>।</li>
          <li style={listItemStyle}><strong>परीक्षा के दिन का प्रदर्शन</strong> — समय प्रबंधन, तनाव प्रबंधन आदि।</li>
          <li style={listItemStyle}>NIELIT द्वारा निर्धारित <strong>कठिनाई स्तर (difficulty level)</strong> और प्रश्न पैटर्न।</li>
          <li style={listItemStyle}><strong>पाठ्यक्रम में परिवर्तन</strong> जो परीक्षा से पहले हो सकते हैं।</li>
        </ul>
        <p style={paraStyle}>
          हमारी सामग्री एक <strong style={{ color: 'var(--text-primary)' }}>पूरक शैक्षिक सहायता (supplementary study aid)</strong> है।
          यह किसी आधिकारिक पाठ्यपुस्तक, NIELIT-अनुमोदित अध्ययन सामग्री, कक्षा शिक्षण या
          प्रमाणित कोचिंग संस्थान का <strong>विकल्प (replacement) नहीं</strong> है।
          विद्यार्थियों को सलाह दी जाती है कि वे विभिन्न स्रोतों से पढ़ाई करें और केवल एक स्रोत पर निर्भर न रहें।
        </p>

        {/* ── 5. External Links ── */}
        <h2 style={sectionStyle}>5. बाहरी लिंक और तृतीय-पक्ष वेबसाइटें (External Links & Third-Party Websites)</h2>
        <p style={paraStyle}>
          इस वेबसाइट पर कुछ स्थानों पर बाहरी वेबसाइटों (external/third-party websites) के लिंक
          (hyperlinks) दिए गए हो सकते हैं। ये लिंक निम्नलिखित उद्देश्यों से प्रदान किए जाते हैं:
        </p>
        <ul style={listStyle}>
          <li style={listItemStyle}>अतिरिक्त शैक्षिक संसाधनों तक पहुँच प्रदान करना।</li>
          <li style={listItemStyle}>NIELIT, सरकारी पोर्टल या अन्य उपयोगी वेबसाइटों का संदर्भ देना।</li>
          <li style={listItemStyle}>तकनीकी documentation या official resources की ओर मार्गदर्शन करना।</li>
        </ul>
        <p style={paraStyle}>
          <strong style={{ color: 'var(--text-primary)' }}>स्पष्टीकरण:</strong> O Level Sarathi उन बाहरी वेबसाइटों की
          <strong> सामग्री (content), सटीकता (accuracy), गोपनीयता नीतियों (privacy policies), सेवाओं (services)
          या किसी भी अन्य पहलू</strong> के लिए किसी भी प्रकार से उत्तरदायी नहीं है।
          बाहरी लिंक पर क्लिक करके आप अपनी स्वयं की जिम्मेदारी पर उन वेबसाइटों पर जाते हैं।
          कृपया किसी भी बाहरी वेबसाइट पर अपनी व्यक्तिगत जानकारी (personal information) साझा करने से
          पहले उसकी गोपनीयता नीति (Privacy Policy) और शर्तें (Terms) अवश्य पढ़ें।
        </p>

        {/* ── 6. Advertisements ── */}
        <h2 style={sectionStyle}>6. विज्ञापन और प्रायोजित सामग्री (Advertisements & Sponsored Content)</h2>
        <p style={paraStyle}>
          O Level Sarathi एक निःशुल्क शैक्षिक मंच है और वेबसाइट के संचालन, होस्टिंग और रखरखाव
          (maintenance) की लागत को पूरा करने के लिए हम विज्ञापनों (advertisements) का उपयोग कर सकते हैं।
        </p>
        <h3 style={subSectionStyle}>विज्ञापन नेटवर्क:</h3>
        <ul style={listStyle}>
          <li style={listItemStyle}>यह वेबसाइट <strong>Google AdSense</strong> और/या अन्य तृतीय-पक्ष विज्ञापन नेटवर्क (third-party ad networks) का उपयोग कर सकती है।</li>
          <li style={listItemStyle}>ये विज्ञापन <strong>स्वचालित रूप से (automatically)</strong> उपयोगकर्ता की रुचियों, ब्राउज़िंग इतिहास और अन्य कारकों के आधार पर प्रदर्शित होते हैं।</li>
          <li style={listItemStyle}>विज्ञापनों की सामग्री (ad content), उत्पाद (products) या सेवाएँ (services) <strong>O Level Sarathi द्वारा नियंत्रित नहीं</strong> होती हैं।</li>
        </ul>
        <h3 style={subSectionStyle}>हमारी स्थिति:</h3>
        <ul style={listStyle}>
          <li style={listItemStyle}>विज्ञापनों में दिखाए गए किसी भी उत्पाद, सेवा या वेबसाइट का उल्लेख <strong>हमारी सिफारिश (endorsement) या अनुमोदन (approval) नहीं</strong> माना जाना चाहिए।</li>
          <li style={listItemStyle}>विज्ञापनदाताओं (advertisers) के साथ किसी भी लेनदेन (transaction) के लिए O Level Sarathi उत्तरदायी नहीं है।</li>
          <li style={listItemStyle}>यदि कोई विज्ञापन अनुचित (inappropriate) या भ्रामक (misleading) लगता है, तो कृपया हमें सूचित करें।</li>
        </ul>

        {/* ── 7. Intellectual Property ── */}
        <h2 style={sectionStyle}>7. बौद्धिक संपदा अधिकार (Intellectual Property Rights)</h2>
        <p style={paraStyle}>
          इस वेबसाइट पर प्रकाशित सभी <strong style={{ color: 'var(--text-primary)' }}>मूल सामग्री (original content)</strong> — जिसमें
          निम्नलिखित शामिल हैं लेकिन इन्हीं तक सीमित नहीं हैं — O Level Sarathi की बौद्धिक संपदा (intellectual property) है:
        </p>
        <ul style={listStyle}>
          <li style={listItemStyle}>पाठ्य सामग्री (text content), Theory Notes, और लेख (articles)।</li>
          <li style={listItemStyle}>MCQ प्रश्न, उत्तर और उनकी व्याख्याएँ (explanations)।</li>
          <li style={listItemStyle}>HTML, CSS, JavaScript और Python कोड उदाहरण (code examples)।</li>
          <li style={listItemStyle}>PDF नोट्स, चीट शीट्स और अध्ययन गाइड।</li>
          <li style={listItemStyle}>वेबसाइट का डिज़ाइन (design), लेआउट (layout), लोगो (logo) और ग्राफ़िक्स (graphics)।</li>
          <li style={listItemStyle}>प्रायोगिक परियोजनाओं (practical projects) का सोर्स कोड।</li>
        </ul>
        <h3 style={subSectionStyle}>अनुमत उपयोग (Permitted Use):</h3>
        <ul style={listStyle}>
          <li style={listItemStyle}>✅ व्यक्तिगत शैक्षिक उपयोग (personal educational use) — पढ़ना, सीखना, नोट्स बनाना।</li>
          <li style={listItemStyle}>✅ परीक्षा तैयारी के लिए प्रिंटआउट लेना (केवल व्यक्तिगत उपयोग हेतु)।</li>
          <li style={listItemStyle}>✅ सोशल मीडिया पर लिंक शेयर करना (उचित क्रेडिट के साथ)।</li>
        </ul>
        <h3 style={subSectionStyle}>प्रतिबंधित उपयोग (Prohibited Use):</h3>
        <ul style={listStyle}>
          <li style={listItemStyle}>❌ बिना लिखित अनुमति के सामग्री को <strong>कॉपी, पुनर्प्रकाशित (republish) या पुनर्वितरित (redistribute)</strong> करना।</li>
          <li style={listItemStyle}>❌ सामग्री का <strong>व्यावसायिक उपयोग (commercial use)</strong> — बेचना, लाइसेंस देना या पैसे कमाने के लिए उपयोग करना।</li>
          <li style={listItemStyle}>❌ सामग्री को <strong>अपने नाम से प्रकाशित</strong> करना या स्रोत (source) का उल्लेख किए बिना उपयोग करना।</li>
          <li style={listItemStyle}>❌ वेबसाइट की सामग्री को <strong>स्क्रैप (scrape)</strong> करना या स्वचालित उपकरणों (automated tools) से डाउनलोड करना।</li>
          <li style={listItemStyle}>❌ किसी अन्य वेबसाइट, ऐप या YouTube चैनल पर <strong>बिना अनुमति के प्रकाशित</strong> करना।</li>
        </ul>
        <p style={paraStyle}>
          यदि आप हमारी सामग्री का उपयोग किसी विशेष उद्देश्य के लिए करना चाहते हैं, तो कृपया पहले
          <Link to="/contact" style={{ color: 'var(--accent)', fontWeight: 600 }}> हमसे संपर्क करें</Link> और लिखित अनुमति प्राप्त करें।
        </p>

        {/* ── 8. Limitation of Liability ── */}
        <h2 style={sectionStyle}>8. दायित्व की सीमा (Limitation of Liability)</h2>
        <p style={paraStyle}>
          कानून द्वारा अनुमत अधिकतम सीमा तक, O Level Sarathi और इसके संस्थापक, लेखक, योगदानकर्ता
          और सहयोगी निम्नलिखित किसी भी प्रकार की क्षति (damage) के लिए
          <strong style={{ color: 'var(--text-primary)' }}> उत्तरदायी नहीं</strong> होंगे:
        </p>
        <ul style={listStyle}>
          <li style={listItemStyle}><strong>प्रत्यक्ष क्षति (Direct Damages):</strong> सामग्री में त्रुटि, गलत उत्तर या पुरानी जानकारी के कारण होने वाली कोई भी हानि।</li>
          <li style={listItemStyle}><strong>अप्रत्यक्ष क्षति (Indirect Damages):</strong> परीक्षा में असफलता, अवसर की हानि या किसी भी अप्रत्यक्ष नुकसान।</li>
          <li style={listItemStyle}><strong>विशेष या परिणामी क्षति (Special/Consequential Damages):</strong> डेटा हानि, समय की बर्बादी, मानसिक तनाव या कोई भी अन्य परिणामी नुकसान।</li>
          <li style={listItemStyle}><strong>तकनीकी क्षति (Technical Damages):</strong> वायरस, मैलवेयर, सर्वर डाउनटाइम, या तकनीकी गड़बड़ी से होने वाली कोई भी समस्या।</li>
        </ul>
        <p style={paraStyle}>
          उपयोगकर्ता स्वीकार करता है कि इस वेबसाइट का उपयोग पूर्णतः <strong style={{ color: 'var(--text-primary)' }}>अपने स्वयं के जोखिम (at your own risk)</strong> पर है।
          सामग्री "जैसी है (as is)" और "जैसी उपलब्ध है (as available)" के आधार पर प्रदान की जाती है,
          बिना किसी व्यक्त (express) या निहित (implied) वारंटी के।
        </p>

        {/* ── 9. User Responsibilities ── */}
        <h2 style={sectionStyle}>9. उपयोगकर्ता की जिम्मेदारियाँ (User Responsibilities)</h2>
        <p style={paraStyle}>
          इस वेबसाइट का उपयोग करते समय, आप (उपयोगकर्ता) निम्नलिखित बातों से सहमत होते हैं:
        </p>
        <ul style={listStyle}>
          <li style={listItemStyle}>आप इस वेबसाइट का उपयोग <strong>केवल वैध शैक्षिक उद्देश्यों</strong> के लिए करेंगे।</li>
          <li style={listItemStyle}>आप किसी भी <strong>अवैध, अनैतिक या हानिकारक गतिविधि</strong> के लिए इस वेबसाइट का उपयोग नहीं करेंगे।</li>
          <li style={listItemStyle}>आप वेबसाइट की सुरक्षा (security) को नुकसान पहुँचाने का प्रयास नहीं करेंगे — जैसे हैकिंग, DDoS अटैक, SQL इंजेक्शन आदि।</li>
          <li style={listItemStyle}>आप किसी अन्य उपयोगकर्ता की पहचान (identity) का दुरुपयोग नहीं करेंगे।</li>
          <li style={listItemStyle}>आप वेबसाइट पर स्पैम (spam), अपमानजनक टिप्पणियाँ (abusive comments) या अनुचित सामग्री पोस्ट नहीं करेंगे।</li>
          <li style={listItemStyle}>यदि आपको सामग्री में कोई त्रुटि, अनुचित जानकारी या कॉपीराइट उल्लंघन मिलता है, तो कृपया हमें तुरंत सूचित करें।</li>
        </ul>

        {/* ── 10. Technical Disclaimer ── */}
        <h2 style={sectionStyle}>10. तकनीकी अस्वीकरण (Technical Disclaimer)</h2>
        <p style={paraStyle}>
          O Level Sarathi एक ऑनलाइन वेब एप्लिकेशन है जो इंटरनेट कनेक्टिविटी पर निर्भर करता है।
          हम वेबसाइट की निर्बाध (uninterrupted) और त्रुटि-मुक्त (error-free) उपलब्धता की
          <strong style={{ color: 'var(--text-primary)' }}> कोई गारंटी नहीं</strong> दे सकते।
        </p>
        <h3 style={subSectionStyle}>संभावित तकनीकी समस्याएँ:</h3>
        <ul style={listStyle}>
          <li style={listItemStyle}><strong>सर्वर डाउनटाइम (Server Downtime):</strong> रखरखाव (maintenance), अपग्रेड या तकनीकी समस्याओं के कारण वेबसाइट कुछ समय के लिए अनुपलब्ध हो सकती है।</li>
          <li style={listItemStyle}><strong>ब्राउज़र संगतता (Browser Compatibility):</strong> वेबसाइट का डिज़ाइन और कार्यक्षमता अलग-अलग ब्राउज़रों और उपकरणों (devices) पर भिन्न हो सकती है। हम Chrome, Firefox, Edge और Safari के नवीनतम संस्करणों पर सर्वोत्तम अनुभव प्रदान करने का प्रयास करते हैं।</li>
          <li style={listItemStyle}><strong>डेटा हानि (Data Loss):</strong> ब्राउज़र में सहेजे गए Quiz प्रगति, बुकमार्क या अन्य स्थानीय डेटा — ब्राउज़र कैश/कुकीज़ साफ़ करने, डिवाइस बदलने या अन्य कारणों से खो सकता है।</li>
          <li style={listItemStyle}><strong>Code Lab:</strong> ब्राउज़र-आधारित Code Lab एक शैक्षिक उपकरण है और इसे उत्पादन-स्तर (production-level) विकास वातावरण नहीं माना जाना चाहिए।</li>
        </ul>

        {/* ── 11. Age Requirement ── */}
        <h2 style={sectionStyle}>11. आयु आवश्यकता (Age Requirement)</h2>
        <p style={paraStyle}>
          यह वेबसाइट सभी आयु वर्ग के विद्यार्थियों के लिए उपलब्ध है। हालाँकि, <strong style={{ color: 'var(--text-primary)' }}>13 वर्ष से कम आयु</strong> के
          उपयोगकर्ताओं को माता-पिता या अभिभावक (parent/guardian) की देखरेख में ही इस वेबसाइट का उपयोग
          करना चाहिए। हम जानबूझकर 13 वर्ष से कम आयु के बच्चों से कोई व्यक्तिगत जानकारी एकत्र नहीं करते।
          यह COPPA (Children's Online Privacy Protection Act) और भारतीय IT अधिनियम के दिशानिर्देशों के अनुरूप है।
        </p>

        {/* ── 12. Cookies & Tracking ── */}
        <h2 style={sectionStyle}>12. कुकीज़ और ट्रैकिंग तकनीकें (Cookies & Tracking Technologies)</h2>
        <p style={paraStyle}>
          यह वेबसाइट आपके ब्राउज़िंग अनुभव को बेहतर बनाने के लिए <strong style={{ color: 'var(--text-primary)' }}>कुकीज़ (cookies)</strong> और
          इसी प्रकार की ट्रैकिंग तकनीकों का उपयोग कर सकती है:
        </p>
        <ul style={listStyle}>
          <li style={listItemStyle}><strong>आवश्यक कुकीज़ (Essential Cookies):</strong> वेबसाइट की बुनियादी कार्यक्षमता — जैसे थीम सेटिंग (डार्क/लाइट मोड), Quiz प्रगति संग्रहण — के लिए आवश्यक।</li>
          <li style={listItemStyle}><strong>एनालिटिक्स कुकीज़ (Analytics Cookies):</strong> Google Analytics या समान सेवाओं के माध्यम से विज़िटर ट्रैफ़िक, पेज व्यू और उपयोगकर्ता व्यवहार को समझने के लिए उपयोग की जा सकती हैं। यह डेटा अनाम (anonymous) और समग्र (aggregated) रूप में होता है।</li>
          <li style={listItemStyle}><strong>विज्ञापन कुकीज़ (Advertising Cookies):</strong> Google AdSense जैसे विज्ञापन नेटवर्क व्यक्तिगत विज्ञापन (personalized ads) दिखाने के लिए कुकीज़ का उपयोग करते हैं।</li>
        </ul>
        <p style={paraStyle}>
          आप अपने ब्राउज़र की सेटिंग में जाकर कुकीज़ को अक्षम (disable) या हटा (delete) सकते हैं।
          हालाँकि, कुकीज़ अक्षम करने से वेबसाइट की कुछ सुविधाएँ सही ढंग से काम नहीं कर सकतीं।
          अधिक जानकारी के लिए कृपया हमारी <Link to="/privacy-policy" style={{ color: 'var(--accent)', fontWeight: 600 }}>गोपनीयता नीति (Privacy Policy)</Link> पढ़ें।
        </p>

        {/* ── 13. Copyright Infringement / DMCA ── */}
        <h2 style={sectionStyle}>13. कॉपीराइट शिकायत प्रक्रिया (Copyright Complaint / DMCA Notice)</h2>
        <p style={paraStyle}>
          O Level Sarathi बौद्धिक संपदा अधिकारों (Intellectual Property Rights) का पूर्ण सम्मान करता है।
          यदि आपको लगता है कि इस वेबसाइट पर प्रकाशित कोई सामग्री आपके कॉपीराइट का उल्लंघन करती है,
          तो कृपया हमें निम्नलिखित जानकारी के साथ ईमेल करें:
        </p>
        <ul style={listStyle}>
          <li style={listItemStyle}>आपका पूरा नाम और संपर्क जानकारी।</li>
          <li style={listItemStyle}>उल्लंघनकारी सामग्री (infringing content) का विवरण और उसका URL/लिंक।</li>
          <li style={listItemStyle}>मूल सामग्री (original content) का प्रमाण — जैसे URL, प्रकाशन तिथि, लेखक का नाम।</li>
          <li style={listItemStyle}>एक लिखित बयान कि आप स्वामी (owner) हैं या स्वामी के अधिकृत प्रतिनिधि (authorized representative) हैं।</li>
        </ul>
        <p style={paraStyle}>
          वैध शिकायत प्राप्त होने पर, हम उल्लंघनकारी सामग्री को <strong style={{ color: 'var(--text-primary)' }}>72 घंटे के भीतर</strong> समीक्षा
          करेंगे और आवश्यक कार्रवाई (जैसे सामग्री हटाना या संशोधित करना) करेंगे।
          कॉपीराइट शिकायतें भेजें:{' '}
          <a href="mailto:er.divsir@gmail.com" style={{ color: 'var(--accent)', fontWeight: 600 }}>er.divsir@gmail.com</a>
        </p>

        {/* ── 14. Governing Law ── */}
        <h2 style={sectionStyle}>14. लागू कानून और क्षेत्राधिकार (Governing Law & Jurisdiction)</h2>
        <p style={paraStyle}>
          यह अस्वीकरण और इस वेबसाइट के उपयोग से संबंधित सभी विवाद (disputes)
          <strong style={{ color: 'var(--text-primary)' }}> भारत के कानूनों (Laws of India)</strong> द्वारा शासित और व्याख्यायित होंगे।
          किसी भी विवाद के मामले में, <strong style={{ color: 'var(--text-primary)' }}>भारतीय न्यायालयों</strong> का
          विशेष क्षेत्राधिकार (exclusive jurisdiction) होगा।
        </p>
        <p style={paraStyle}>
          विशेष रूप से, निम्नलिखित भारतीय कानून और विनियम इस वेबसाइट पर लागू होते हैं:
        </p>
        <ul style={listStyle}>
          <li style={listItemStyle}><strong>सूचना प्रौद्योगिकी अधिनियम, 2000</strong> (Information Technology Act, 2000) और इसके संशोधन।</li>
          <li style={listItemStyle}><strong>IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021।</strong></li>
          <li style={listItemStyle}><strong>भारतीय कॉपीराइट अधिनियम, 1957</strong> (Indian Copyright Act, 1957)।</li>
          <li style={listItemStyle}><strong>डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023</strong> (Digital Personal Data Protection Act, 2023)।</li>
        </ul>

        {/* ── 15. Changes to Disclaimer ── */}
        <h2 style={sectionStyle}>15. अस्वीकरण में परिवर्तन (Changes to This Disclaimer)</h2>
        <p style={paraStyle}>
          O Level Sarathi <strong style={{ color: 'var(--text-primary)' }}>बिना किसी पूर्व सूचना</strong> के इस अस्वीकरण को
          किसी भी समय संशोधित (modify), अपडेट (update) या परिवर्तित (change) करने का अधिकार सुरक्षित रखता है।
          परिवर्तन इस पृष्ठ पर प्रकाशित होने के तुरंत बाद प्रभावी हो जाएंगे।
        </p>
        <p style={paraStyle}>
          हम अनुशंसा करते हैं कि आप इस पृष्ठ को <strong>नियमित रूप से (periodically)</strong> देखते रहें ताकि
          किसी भी परिवर्तन से अवगत रह सकें। परिवर्तन के बाद वेबसाइट का निरंतर उपयोग जारी रखना
          इन परिवर्तनों की <strong style={{ color: 'var(--text-primary)' }}>स्वचालित स्वीकृति (automatic acceptance)</strong> माना जाएगा।
        </p>
        <p style={paraStyle}>
          पृष्ठ के शीर्ष पर "अंतिम अपडेट (Last Updated)" तिथि देखकर आप जान सकते हैं कि
          यह अस्वीकरण अंतिम बार कब संशोधित किया गया था।
        </p>

        {/* ── FAQ Section ── */}
        <h2 style={sectionStyle}>अक्सर पूछे जाने वाले प्रश्न (Frequently Asked Questions)</h2>

        <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)', padding: '24px', marginBottom: 20 }}>
          <h3 style={{ ...subSectionStyle, marginTop: 0 }}>प्रश्न: क्या O Level Sarathi NIELIT की आधिकारिक वेबसाइट है?</h3>
          <p style={{ marginBottom: 16 }}>
            <strong>उत्तर:</strong> नहीं। O Level Sarathi एक स्वतंत्र शैक्षिक मंच है जो NIELIT O Level और CCC
            परीक्षा की तैयारी में विद्यार्थियों की सहायता करता है। यह NIELIT से किसी भी प्रकार से संबद्ध नहीं है।
            आधिकारिक जानकारी के लिए <a href="https://www.nielit.gov.in" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--accent)' }}>www.nielit.gov.in</a> पर जाएँ।
          </p>

          <h3 style={subSectionStyle}>प्रश्न: क्या इस वेबसाइट की सामग्री का उपयोग निःशुल्क है?</h3>
          <p style={{ marginBottom: 16 }}>
            <strong>उत्तर:</strong> हाँ। O Level Sarathi पर सभी अध्ययन सामग्री, मॉक टेस्ट, PDF नोट्स और अन्य
            संसाधन पूर्णतः निःशुल्क (100% free) उपलब्ध हैं। हम कोई शुल्क, सदस्यता (subscription) या
            भुगतान (payment) नहीं लेते। यदि कोई व्यक्ति हमारे नाम से पैसे माँगता है, तो वह धोखाधड़ी (fraud) है।
          </p>

          <h3 style={subSectionStyle}>प्रश्न: क्या मैं इस वेबसाइट की सामग्री को अपने YouTube चैनल/ब्लॉग पर उपयोग कर सकता/सकती हूँ?</h3>
          <p style={{ marginBottom: 16 }}>
            <strong>उत्तर:</strong> सामग्री का उपयोग केवल व्यक्तिगत शैक्षिक उद्देश्यों के लिए अनुमत है।
            YouTube चैनल, ब्लॉग या अन्य प्लेटफ़ॉर्म पर प्रकाशन के लिए कृपया पहले हमसे लिखित अनुमति प्राप्त करें।
            उचित क्रेडिट (credit) और लिंक देना अनिवार्य है।
          </p>

          <h3 style={subSectionStyle}>प्रश्न: मुझे सामग्री में कोई त्रुटि मिली है। क्या करूँ?</h3>
          <p style={{ marginBottom: 16 }}>
            <strong>उत्तर:</strong> कृपया हमें <a href="mailto:er.divsir@gmail.com"
            style={{ color: 'var(--accent)' }}>er.divsir@gmail.com</a> पर ईमेल करें या
            हमारे <Link to="/contact" style={{ color: 'var(--accent)' }}>संपर्क पृष्ठ</Link> के
            माध्यम से सूचित करें। हम त्रुटि की समीक्षा करके यथाशीघ्र सुधार करेंगे। आपकी प्रतिक्रिया (feedback) हमारे लिए अत्यंत मूल्यवान है।
          </p>

          <h3 style={subSectionStyle}>प्रश्न: क्या इस वेबसाइट से पढ़कर O Level पास किया जा सकता है?</h3>
          <p style={{ margin: 0 }}>
            <strong>उत्तर:</strong> O Level Sarathi एक सहायक शैक्षिक मंच है जो आपकी तैयारी को मजबूत बनाने में
            मदद करता है। हालाँकि, परीक्षा में सफलता आपकी व्यक्तिगत मेहनत, समर्पण और तैयारी पर निर्भर करती है।
            हम अनुशंसा करते हैं कि आप हमारी सामग्री के साथ-साथ NIELIT की आधिकारिक पुस्तकें और अन्य
            विश्वसनीय संसाधन भी पढ़ें।
          </p>
        </div>

        {/* ── Contact Box ── */}
        <div style={{ marginTop: 40, padding: '24px 28px', background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary, var(--bg-card)))', borderRadius: 16, border: '1px solid var(--border)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginTop: 0, marginBottom: 12, fontSize: '1.1rem' }}>
            📬 संपर्क करें (Contact Us)
          </h3>
          <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.9 }}>
            इस अस्वीकरण, वेबसाइट की सामग्री, कॉपीराइट शिकायत या किसी भी अन्य प्रश्न के लिए हमसे संपर्क करें:
          </p>
          <ul style={{ ...listStyle, marginTop: 12, marginBottom: 0, listStyleType: 'none', paddingLeft: 0 }}>
            <li style={listItemStyle}>
              🌐 <strong>वेबसाइट:</strong>{' '}
              <a href="https://olevelsarathi.in" style={{ color: 'var(--accent)', fontWeight: 600 }}>olevelsarathi.in</a>
            </li>
            <li style={listItemStyle}>
              📧 <strong>ईमेल:</strong>{' '}
              <a href="mailto:er.divsir@gmail.com" style={{ color: 'var(--accent)', fontWeight: 600 }}>er.divsir@gmail.com</a>
            </li>
            <li style={listItemStyle}>
              📝 <strong>संपर्क फ़ॉर्म:</strong>{' '}
              <Link to="/contact" style={{ color: 'var(--accent)', fontWeight: 600 }}>संपर्क पृष्ठ पर जाएँ</Link>
            </li>
          </ul>
        </div>

        {/* ── Related Pages ── */}
        <div style={{ marginTop: 24, padding: '16px 24px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>संबंधित पृष्ठ (Related Pages):</strong>{' '}
            <Link to="/privacy-policy" style={{ color: 'var(--accent)', fontWeight: 600 }}>गोपनीयता नीति (Privacy Policy)</Link>{' · '}
            <Link to="/terms" style={{ color: 'var(--accent)', fontWeight: 600 }}>नियम और शर्तें (Terms & Conditions)</Link>{' · '}
            <Link to="/about" style={{ color: 'var(--accent)', fontWeight: 600 }}>हमारे बारे में (About Us)</Link>{' · '}
            <Link to="/contact" style={{ color: 'var(--accent)', fontWeight: 600 }}>संपर्क करें (Contact Us)</Link>
          </p>
        </div>

      </div>
    </div>
  )
}
