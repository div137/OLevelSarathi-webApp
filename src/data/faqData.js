export const faqItems = [
  {
    q: 'NIELIT O Level exam kab hota hai?',
    a: 'NIELIT O Level exam har year January aur July cycle mein hota hai. Registration dates NIELIT official website student.nielit.gov.in par announce hoti hain. O Level Sarathi par aap kisi bhi time mock tests aur notes se practice kar sakte hain.',
  },
  {
    q: 'O Level exam fees kitni hai?',
    a: 'NIELIT O Level registration fees module ke hisaab se alag hoti hai aur time-to-time update ho sakti hai. Latest fee structure ke liye official NIELIT portal check karein. Hamari website par study material aur mock tests bilkul free hain.',
  },
  {
    q: 'O Level registration kaise karein?',
    a: 'student.nielit.gov.in par account banayein, O Level course select karein, apne modules (M1-R5, M2-R5, M3-R5, M4-R5) choose karein, documents upload karein aur fees pay karein. Registration complete hone ke baad admit card exam se pehle download hota hai.',
  },
  {
    q: 'O Level mein kitne papers hote hain?',
    a: 'NIELIT O Level (R5.1 syllabus) mein 4 theory modules aur practical exam hota hai: M1-R5 IT Tools, M2-R5 Web Designing, M3-R5 Python, M4-R5 IoT. Har module ke theory aur practical dono important hain.',
  },
  {
    q: 'O Level pass hone ke liye kitne marks chahiye?',
    a: 'Generally har module mein minimum 50% marks required hote hain practical aur theory dono mein. Grade system S, A, B, C, D, F ke form mein hota hai. Mock tests se aap apna score estimate kar sakte hain.',
  },
  {
    q: 'Kya O Level Sarathi ka content free hai?',
    a: 'Haan. Mock tests, theory notes, PDF material aur practical project guides free hain. Hamara goal hai har student ko quality NIELIT preparation accessible ho, chahe wo Hindi medium ho ya English medium.',
  },
  {
    q: 'M1-R5 IT Tools mein kya padhna hai?',
    a: 'M1-R5 mein computer fundamentals, operating system (Windows/Linux), LibreOffice Writer/Calc/Impress, internet aur networking basics cover hote hain. Hamari Theory section mein chapter-wise notes aur Tests section mein MCQs available hain.',
  },
  {
    q: 'M3-R5 Python programming kaise prepare karein?',
    a: 'Pehle Python basics (variables, loops, functions, lists) samjhein, phir flowcharts aur algorithms practice karein, uske baad NIELIT pattern ke MCQs solve karein.',
  },
  {
    q: 'CCC aur O Level mein kya difference hai?',
    a: 'CCC (Course on Computer Concepts) basic computer literacy course hai. O Level advanced IT certification hai jisme programming, web design aur IoT jaise subjects hote hain. Dono NIELIT ke under hain lekin level alag hai.',
  },
  {
    q: 'Practical exam ki taiyari kaise karein?',
    a: 'Projects section mein step-by-step practical assignments hain. LibreOffice, HTML/CSS, Python aur IoT ke tasks practice karein. Practical mein time management aur exact steps follow karna important hai.',
  },
  {
    q: 'Notes Hindi mein available hain?',
    a: 'Haan, kai topics Hindi aur English dono mein samjhaye gaye hain taaki Hindi medium students ko bhi asaani ho. Theory page par modules ke hisaab se notes browse karein.',
  },
  {
    q: 'Mock test ka result kaise milega?',
    a: 'Test submit karte hi instant result milega — correct, wrong, skipped answers aur grade ke saath. Aap apna result PDF bhi download kar sakte hain jo aapke phone par locally generate hoti hai, server se download nahi hoti.',
  },
  {
    q: 'O Level certificate valid kitne time tak hai?',
    a: 'NIELIT O Level certificate ki validity generally lifetime hoti hai kyunki ye government recognized qualification hai. Job aur further studies dono mein use hoti hai.',
  },
  {
    q: 'Website mobile par kaam karti hai?',
    a: 'Haan, website fully mobile responsive hai. Aap phone se tests de sakte hain, notes padh sakte hain aur PDF download kar sakte hain. Android app bhi available hai.',
  },
  {
    q: 'Agar koi question ya error ho to kahan contact karein?',
    a: 'Contact page par email (er.divsir@gmail.com) aur phone number diya gaya hai. Aap Telegram ya Instagram par bhi message kar sakte hain. Hamari team 24-48 hours mein reply karti hai.',
  },
  {
    q: 'O Level ke baad A Level kar sakte hain?',
    a: 'Haan, O Level complete karne ke baad aap NIELIT A Level pursue kar sakte hain jo advanced modules cover karta hai. A Level content hamari website par jald add ho raha hai.',
  },
]

export function faqSchema(items = faqItems) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
}
