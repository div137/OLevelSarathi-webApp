import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFirebase } from '../hooks/useFirebase'
import { FiX, FiCheck, FiArrowLeft, FiClock, FiGrid, FiAward, FiDownload, FiInfo, FiAlertCircle, FiList, FiLoader, FiExternalLink } from 'react-icons/fi'
import { buildPdfFromPages, inlineLocalImages, savePdfOnDevice } from '../utils/localPdfDownload'
import { trackProgress } from '../components/ProgressDashboard'
import { events } from '../utils/analytics'
import SEO from '../components/SEO'
import { AutoAd, RelaxedAd } from '../components/GoogleAd'

const OPTION_KEYS = ['a', 'b', 'c', 'd']

// --- HELPER: Universal Flattening ---
function flattenTests(data) {
  if (!data) return []
  const result = []
  const items = Array.isArray(data) ? data : Object.entries(data).map(([k, v]) => ({ ...v, _key: k }))
  items.forEach(item => {
    if (!item) return
    const catId = String(item._key || 'Other')
    if (item.title && (item.questions || item.questionsJson)) {
      result.push({ ...item, _id: String(item._key || item.id || 'test'), _catKey: 'Direct' })
    }
    Object.entries(item).forEach(([k, v]) => {
      if (k !== '_key' && v && typeof v === 'object' && v.title) {
        if (v.questions || v.questionsJson || v.totalQue) {
          result.push({ ...v, _id: String(k), _catKey: catId })
        }
      }
    })
  })
  return result
}

const normalizeText = (value) => String(value ?? '').replace(/\r\n/g, '\n').replace(/\t/g, '    ')
const normalizeAnswer = (value) => String(value ?? '').trim().toLowerCase()

const getOptionText = (q, opt) => {
  if (!q || !opt) return ''
  return q[opt] ?? q[opt.toUpperCase()] ?? ''
}

const getQuestionText = (q) => q?.question ?? q?.que ?? q?.title ?? ''
const getExplanation = (q) => q?.exp ?? q?.explanation ?? q?.explain ?? q?.solution ?? ''

const extractOptionLetter = (value) => {
  const text = normalizeAnswer(value)
  const direct = text.match(/^(?:option\s*)?[\[(]?([a-d])[\])\].:-]?$/i)
  if (direct) return direct[1].toLowerCase()

  const prefixed = text.match(/^(?:option\s*)?[\[(]?([a-d])[\])\].:-]\s+/i)
  return prefixed ? prefixed[1].toLowerCase() : ''
}

const getCorrectOption = (q) => {
  if (!q) return ''
  const answer = normalizeAnswer(q.ans ?? q.correct ?? q.answer ?? q.correctAnswer)
  const answerLetter = extractOptionLetter(answer)
  if (answerLetter) return answerLetter

  return OPTION_KEYS.find((opt) => normalizeAnswer(getOptionText(q, opt)) === answer) || ''
}

const checkCorrect = (optLetter, q) => {
  if (!q || !optLetter) return false
  return normalizeAnswer(optLetter) === getCorrectOption(q)
}

const getAvailableOptions = (q) => OPTION_KEYS.filter((opt) => String(getOptionText(q, opt)).trim())

const looksLikeCode = (value) => {
  const text = normalizeText(value)
  if (!text) return false
  // Any line that starts with 2+ spaces of indentation (Python blocks)
  if (/(^|\n)[ \t]{2,}\S/.test(text)) return true
  // Common Python / shell / JS keywords at start of line
  if (/(^|\n)\s*(def|class|for|while|if|elif|else|try|except|finally|with|import|from|print|return|console\.log|var|let|const|public|static|void)\b/.test(text)) return true
  // Python interactive prompt or common built-in calls
  if (/>>>|\b(range|input|len|append|extend|split|join|format|print|enumerate|zip|map|filter)\s*\(/.test(text)) return true
  // Block-ending colon followed by indented body
  if (/:\s*\n\s+/.test(text)) return true
  return false
}

// Render a value preserving indentation exactly. Detects Python/code and uses
// a monospace code block; otherwise renders as rich prose.
function FormattedContent({ value, as: Tag = 'div', className = '', style = {}, pdf = false }) {
  const text = normalizeText(value)
  const isCode = looksLikeCode(text)

  if (isCode) {
    // Code path: monospace, preserve EVERY space and newline, tab = 4 spaces
    return (
      <Tag
        className={`mcq-code-text ${className}`.trim()}
        style={{
          display: 'block',
          width: '100%',
          whiteSpace: 'pre',
          overflowX: 'auto',
          overflowWrap: 'normal',
          wordBreak: 'normal',
          tabSize: 4,
          fontFamily: pdf ? '"Courier New", Consolas, monospace' : 'var(--font-mono)',
          fontSize: pdf ? '0.84rem' : '0.84rem',
          lineHeight: 1.5,
          background: pdf ? '#f1f5f9' : 'var(--bg-card2)',
          color: pdf ? '#1e293b' : 'var(--text-primary)',
          border: pdf ? '1.5px solid #cbd5e1' : '1px solid var(--border)',
          borderRadius: pdf ? 6 : 10,
          padding: pdf ? '10px 12px' : '12px 14px',
          ...style,
        }}
      >
        {text}
      </Tag>
    )
  }

  // Prose path
  return (
    <Tag
      className={`mcq-rich-text ${className}`.trim()}
      style={{
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
        ...style,
      }}
    >
      {text}
    </Tag>
  )
}

function AnswerSummary({ question, selected }) {
  const correctOption = getCorrectOption(question)
  const selectedIsCorrect = selected && checkCorrect(selected, question)

  return (
    <div className="answer-summary">
      {selected && (
        <div className={`answer-chip ${selectedIsCorrect ? 'is-correct' : 'is-wrong'}`}>
          <strong>Your answer:</strong>
          <FormattedContent as="span" value={`${selected.toUpperCase()}. ${getOptionText(question, selected)}`} />
        </div>
      )}
      {correctOption && (
        <div className="answer-chip is-correct">
          <strong>Correct answer:</strong>
          <FormattedContent as="span" value={`${correctOption.toUpperCase()}. ${getOptionText(question, correctOption)}`} />
        </div>
      )}
    </div>
  )
}

function ExplanationPanel({ question, selected }) {
  const explanation = getExplanation(question)
  if (!selected && !explanation) return null
  const isWrong = selected && !checkCorrect(selected, question)

  return (
    <div className={`fade-in quiz-explanation ${isWrong ? 'is-wrong' : ''}`}>
      <div className="quiz-explanation-header">
        <h4><FiInfo /> Explanation</h4>
        {selected && (
          <span className={`quiz-explanation-verdict ${isWrong ? 'is-wrong' : 'is-correct'}`}>
            {isWrong ? <><FiX /> Incorrect</> : <><FiCheck /> Correct</>}
          </span>
        )}
      </div>
      {selected && <AnswerSummary question={question} selected={selected} />}
      {explanation ? (
        <FormattedContent value={explanation} className="quiz-explanation-text" />
      ) : (
        <p className="quiz-explanation-empty">No explanation available for this question.</p>
      )}
    </div>
  )
}

function ReviewQuestion({ question, index, selected }) {
  const hasAnswer = Boolean(selected)
  const isCorrect = hasAnswer && checkCorrect(selected, question)
  const isWrong = hasAnswer && !isCorrect
  const correctOption = getCorrectOption(question)
  const options = getAvailableOptions(question)

  return (
    <div className={`quiz-review-card ${isWrong ? 'is-wrong' : isCorrect ? 'is-correct' : 'is-skipped'}`}>
      <div className="quiz-review-head">
        <span className="badge">Q.{index + 1}</span>
        <span className={`quiz-status ${isWrong ? 'is-wrong' : isCorrect ? 'is-correct' : 'is-skipped'}`}>
          {isWrong ? 'Wrong' : isCorrect ? 'Correct' : 'Skipped'}
        </span>
      </div>
      <FormattedContent value={getQuestionText(question)} className="quiz-review-question" />
      <div className="quiz-review-options">
        {options.map((opt) => {
          const isSelected = selected === opt
          const isCorrectOption = correctOption === opt
          const isSelectedWrong = isSelected && isWrong
          return (
            <div
              key={`${question._qid}-review-${opt}`}
              className={`quiz-review-option ${isCorrectOption ? 'is-correct' : ''} ${isSelectedWrong ? 'is-wrong' : ''}`}
            >
              <span>{opt.toUpperCase()}.</span>
              <FormattedContent as="span" value={getOptionText(question, opt)} />
            </div>
          )
        })}
      </div>
      <ExplanationPanel question={question} selected={selected} />
    </div>
  )
}

export default function QuizPage() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const { data: raw, loading } = useFirebase('Tests')
  const pdfRef = useRef()

  const test = useMemo(() => {
    if (!raw) return null
    const tests = flattenTests(raw)
    return tests.find(t => String(t._id).toLowerCase() === String(testId).toLowerCase())
  }, [raw, testId])

  const questions = useMemo(() => {
    if (!test) return []
    let rawData = test.questionsJson || test.questions || []
    if (typeof rawData === 'string') {
      try { rawData = JSON.parse(rawData) } catch { rawData = [] }
    }

    const normalizeItem = (item, index, key) => ({
      ...item,
      _qid: String(item?._qid || item?.id || key || index || `q-${index}`),
    })

    const list = Array.isArray(rawData)
      ? rawData.map((item, index) => normalizeItem(item, index, index))
      : rawData && typeof rawData === 'object'
        ? Object.entries(rawData)
            .sort(([a], [b]) => {
              const na = Number(a)
              const nb = Number(b)
              if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb
              return String(a).localeCompare(String(b))
            })
            .map(([key, item], index) => normalizeItem(item, index, key))
        : []

    // Filter out hidden questions
    const visible = list.filter(q => !q.hidden)

    // ── Options shuffle (admin controlled) ──
    // Shuffle each question's options, keeping correct answer mapping intact
    const withOptions = visible.map(item => {
      if (!test.shuffleOptions) return item
      const opts = ['a','b','c','d']
      // Build original pairs
      const pairs = opts.map(k => ({ key: k, text: item[k] ?? '' })).filter(p => p.text !== '')
      // Fisher-Yates shuffle of pairs
      const sp = [...pairs]
      for (let i = sp.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sp[i], sp[j]] = [sp[j], sp[i]]
      }
      // Original correct answer text
      const origAns = String(item.ans || '').toLowerCase().trim()
      // Find correct text before shuffle
      const origPair = pairs.find(p => p.key === origAns)
      const correctText = origPair ? origPair.text : ''
      // Map shuffled pairs back to a/b/c/d
      const newItem = { ...item }
      sp.forEach((p, i) => { newItem[opts[i]] = p.text })
      // Find which new key holds the correct text
      const newAnsKey = origPair
        ? opts[sp.findIndex(p => p.text === correctText && p.key === origPair.key)]
        : origAns
      newItem.ans = newAnsKey || origAns
      return newItem
    })

    // ── Questions shuffle (admin controlled) ──
    const shuffled = [...withOptions]
    if (test.shuffleQuestions) {
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
    }

    return shuffled
  }, [test?._id])

  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [status, setStatus] = useState('playing')
  const [timeLeft, setTimeLeft] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pdfStatus, setPdfStatus] = useState({ active: false, progress: 0, message: '', mode: 'download' })

  // Shared PDF build pipeline — builds the PDF and returns the jsPDF object
  const buildPdf = async (mode) => {
    const el = pdfRef.current
    if (!el || pdfStatus.active) return null

    const originalStyles = {
      display: el.style.display,
      position: el.style.position,
      left: el.style.left,
      top: el.style.top,
      opacity: el.style.opacity,
      zIndex: el.style.zIndex,
      visibility: el.style.visibility,
      pointerEvents: el.style.pointerEvents,
    }

    el.style.display = 'block'
    el.style.position = 'absolute'
    el.style.left = '-10000px'
    el.style.top = '0'
    el.style.opacity = '1'
    el.style.zIndex = '-9999'
    el.style.visibility = 'visible'
    el.style.pointerEvents = 'none'

    setPdfStatus({ active: true, progress: 5, message: 'PDF prepare ho raha hai...', mode })

    let restoreImages = () => {}

    try {
      const pages = Array.from(el.querySelectorAll('.pdf-page'))
      if (!pages.length) {
        setPdfStatus({ active: false, progress: 0, message: '', mode })
        return null
      }

      setPdfStatus({ active: true, progress: 12, message: 'Logo & images load ho rahe hain...', mode })
      restoreImages = await inlineLocalImages(el)

      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

      const pdf = await buildPdfFromPages(pages, (progress, message) => {
        setPdfStatus({ active: true, progress, message, mode })
      })

      return pdf
    } catch (err) {
      console.error('PDF build failed:', err)
      setPdfStatus({ active: true, progress: 0, message: 'PDF build fail ho gaya. Dubara try karein.', mode })
      setTimeout(() => setPdfStatus({ active: false, progress: 0, message: '', mode: 'download' }), 3500)
      return null
    } finally {
      restoreImages()
      el.style.display = originalStyles.display
      el.style.position = originalStyles.position
      el.style.left = originalStyles.left
      el.style.top = originalStyles.top
      el.style.opacity = originalStyles.opacity
      el.style.zIndex = originalStyles.zIndex
      el.style.visibility = originalStyles.visibility
      el.style.pointerEvents = originalStyles.pointerEvents
    }
  }

  useEffect(() => {
    const shouldBlock = status === 'playing'
    if (!shouldBlock) return undefined

    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
      return ''
    }

    const handlePopState = () => {
      if (!window.confirm('Leave this test? Your current answers will be lost if you leave before submitting.')) {
        window.history.pushState(null, '', window.location.href)
      }
    }

    window.history.pushState(null, '', window.location.href)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [status])

  useEffect(() => {
    if (test) setTimeLeft(3600) // Fixed 60-minute duration for all tests
  }, [test])

  useEffect(() => {
    if (!test) return
    setIdx(0)
    setAnswers({})
    setStatus('playing')
  }, [test?._id])

  useEffect(() => {
    if (status !== 'playing' || timeLeft <= 0) return
    const t = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearInterval(t)
  }, [timeLeft, status])

  const scoreStats = useMemo(() => {
    const correctCount = questions.reduce((count, question) => {
      const answer = answers[question._qid]
      return answer && checkCorrect(answer, question) ? count + 1 : count
    }, 0)
    const totalCount = questions.length
    const percent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
    const skipped = totalCount - Object.keys(answers).length
    const wrong = Object.keys(answers).length - correctCount
    
    let grade = 'F', color = '#ef4444'
    if (percent >= 90) { grade = 'S'; color = '#10b981' }
    else if (percent >= 80) { grade = 'A'; color = '#10b981' }
    else if (percent >= 70) { grade = 'B'; color = '#f59e0b' }
    else if (percent >= 60) { grade = 'C'; color = '#f59e0b' }
    else if (percent >= 50) { grade = 'D'; color = '#f59e0b' }
    return { correctCount, totalCount, percent, grade, color, wrongCount: wrong, skipped }
  }, [answers, questions])

  useEffect(() => {
    if (status !== 'result' || !test) return
    trackProgress('tests', test._id || testId)
    events.testCompleted(testId, scoreStats.percent)
  }, [status, test?._id, testId, scoreStats.percent])

  const handlePDF = async () => {
    const pdf = await buildPdf('download')
    if (!pdf) return

    try {
      setPdfStatus({ active: true, progress: 95, message: 'PDF aapke device mein save ho raha hai...', mode: 'download' })
      await savePdfOnDevice(pdf, test.title)
      setPdfStatus({ active: true, progress: 100, message: '✓ PDF download ho gaya!', mode: 'download' })
      setTimeout(() => setPdfStatus({ active: false, progress: 0, message: '', mode: 'download' }), 2000)
    } catch (err) {
      console.error('PDF download failed:', err)
      setPdfStatus({ active: true, progress: 0, message: 'PDF download fail ho gaya. Dubara try karein.', mode: 'download' })
      setTimeout(() => setPdfStatus({ active: false, progress: 0, message: '', mode: 'download' }), 3500)
    }
  }

  const handlePdfOpen = async () => {
    const pdf = await buildPdf('open')
    if (!pdf) return

    try {
      setPdfStatus({ active: true, progress: 95, message: 'PDF browser mein open ho raha hai...', mode: 'open' })
      const blob = pdf.output('blob', { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
      // Revoke after a delay so the new tab has time to load it
      setTimeout(() => URL.revokeObjectURL(url), 30000)
      setPdfStatus({ active: true, progress: 100, message: '✓ PDF new tab mein open ho gaya!', mode: 'open' })
      setTimeout(() => setPdfStatus({ active: false, progress: 0, message: '', mode: 'download' }), 2000)
    } catch (err) {
      console.error('PDF open failed:', err)
      setPdfStatus({ active: true, progress: 0, message: 'PDF open fail ho gaya. Dubara try karein.', mode: 'open' })
      setTimeout(() => setPdfStatus({ active: false, progress: 0, message: '', mode: 'download' }), 3500)
    }
  }

  const handleQuit = () => {
    if (status === 'playing' && !window.confirm('Leave this test? Your current answers will be lost if you leave before submitting.')) return
    navigate('/tests')
  }

  if (loading && !test) return <div className="page" style={{textAlign:'center', paddingTop:100}}><h3>Loading Test...</h3></div>
  if (!test) return <div className="page" style={{textAlign:'center', paddingTop:100}}><h3>Quiz Not Found</h3><button onClick={()=>navigate('/tests')} className="btn btn-primary">Back</button></div>

  if (status === 'result') {
    return (
      <div className="page" style={{paddingTop:60, paddingBottom:60, paddingLeft:16, paddingRight:16}}>
        {pdfStatus.active && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
            background: '#0f172a', color: '#fff', padding: '10px 18px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 600 }}>
              <FiLoader style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
              <span>{pdfStatus.mode === 'open' ? 'PDF open ho raha hai...' : 'PDF ban raha hai, rukein...'}</span>
            </div>
            <div style={{ height: 3, background: '#334155', borderRadius: 999, overflow: 'hidden', marginTop: 6 }}>
              <div style={{ height: '100%', width: `${pdfStatus.progress}%`, background: '#2563eb', transition: 'width 0.3s ease', borderRadius: 999 }} />
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>{pdfStatus.message}</div>
          </div>
        )}

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .result-card { max-width: 560px; margin: 0 auto; width: 100%; text-align: center; }
          .result-stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 28px; }
          .result-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 8px; }
          .result-actions .btn { flex: 1 1 140px; min-width: 130px; max-width: 220px; height: 48px; font-size: 0.88rem; display: flex; align-items: center; justify-content: center; gap: 7px; }
          @media (max-width: 480px) {
            .result-stats-grid { grid-template-columns: repeat(2,1fr); }
            .result-actions .btn { flex: 1 1 100%; max-width: 100%; }
          }
          .quiz-review-section { max-width: 760px; margin: 40px auto 0; text-align: left; }
          .quiz-review-list { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
          .quiz-review-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 18px; }
          .quiz-review-card.is-wrong { border-color: #fca5a5; }
          .quiz-review-card.is-correct { border-color: #86efac; }
          .quiz-review-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
          .quiz-review-question { font-size: 0.98rem; font-weight: 600; margin-bottom: 12px; line-height: 1.6; }
          .quiz-review-options { display: flex; flex-direction: column; gap: 7px; margin-bottom: 12px; }
          .quiz-review-option { display: flex; gap: 8px; padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border); font-size: 0.88rem; }
          .quiz-review-option.is-correct { background: rgba(16,185,129,0.1); border-color: #10b981; color: #10b981; }
          .quiz-review-option.is-wrong { background: rgba(239,68,68,0.1); border-color: #ef4444; color: #ef4444; }
          .answer-summary { display: flex; flex-direction: column; gap: 8px; margin: 10px 0; }
          .answer-chip { padding: 8px 12px; border-radius: 8px; font-size: 0.88rem; background: var(--bg-card2); display: flex; gap: 8px; flex-wrap: wrap; }
          .answer-chip.is-correct { background: rgba(16,185,129,0.1); color: #10b981; }
          .answer-chip.is-wrong { background: rgba(239,68,68,0.1); color: #ef4444; }
          .quiz-explanation { background: var(--bg-card2); border-radius: 10px; padding: 14px; border: 1px solid var(--border); margin-top: 10px; }
          .quiz-explanation-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; font-weight: 700; gap: 8px; flex-wrap: wrap; }
          .quiz-explanation-verdict { font-size: 0.82rem; padding: 3px 10px; border-radius: 999px; }
          .quiz-explanation-verdict.is-correct { background: rgba(16,185,129,0.15); color: #10b981; }
          .quiz-explanation-verdict.is-wrong { background: rgba(239,68,68,0.15); color: #ef4444; }
          .quiz-explanation-text { font-size: 0.9rem; line-height: 1.65; color: var(--text-secondary); }
          .quiz-explanation-empty { font-size: 0.85rem; color: var(--text-muted); font-style: italic; }
        `}</style>

        <div className="result-card">
          <FiAward size={64} color={scoreStats.color} style={{marginBottom:12}} />
          <h2 style={{fontSize:'2.2rem', fontWeight:900, marginBottom:6}}>{scoreStats.percent}%</h2>
          <p style={{color:'var(--text-secondary)', marginBottom:28, fontSize:'0.95rem'}}>{test.title}</p>

          <div className="result-stats-grid">
            {[
              {label:'CORRECT', val:scoreStats.correctCount, color:'#10b981'},
              {label:'WRONG', val:scoreStats.wrongCount, color:'#ef4444'},
              {label:'SKIPPED', val:scoreStats.skipped, color:'#6b7280'},
              {label:'GRADE', val:scoreStats.grade, color:scoreStats.color},
            ].map(s => (
              <div key={s.label} style={{background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 8px', textAlign:'center'}}>
                <div style={{fontSize:'0.65rem', opacity:0.6, fontWeight:700, marginBottom:4}}>{s.label}</div>
                <div style={{fontSize:'1.6rem', fontWeight:900, color:s.color}}>{s.val}</div>
              </div>
            ))}
          </div>

          <div className="result-actions">
            <button
              className="btn btn-primary"
              onClick={handlePDF}
              disabled={pdfStatus.active}
              style={{background:'#10b981', opacity: pdfStatus.active ? 0.7 : 1}}
            >
              {pdfStatus.active && pdfStatus.mode === 'download'
                ? <><FiLoader style={{animation:'spin 1s linear infinite'}}/> Generating...</>
                : <><FiDownload /> Download PDF</>}
            </button>
            <button
              className="btn btn-primary"
              onClick={handlePdfOpen}
              disabled={pdfStatus.active}
              style={{background:'#2563eb', opacity: pdfStatus.active ? 0.7 : 1}}
            >
              {pdfStatus.active && pdfStatus.mode === 'open'
                ? <><FiLoader style={{animation:'spin 1s linear infinite'}}/> Opening...</>
                : <><FiExternalLink /> Open PDF</>}
            </button>
            <button className="btn btn-ghost" onClick={()=>navigate('/tests')}>Exit</button>
          </div>
        </div>

        <div className="quiz-review-section">
          <h3 style={{fontSize:'1.2rem', fontWeight:800}}>Question Review</h3>
          <div className="quiz-review-list">
            {questions.map((question, index) => (
              <ReviewQuestion
                key={`review-${question._qid}`}
                question={question}
                index={index}
                selected={answers[question._qid]}
              />
            ))}
          </div>
        </div>

        {/* --- PROFESSIONAL PDF RENDERER --- */}
        <div ref={pdfRef} style={{display:'none', background:'#fff', color:'#111827', width:794, textAlign:'left', fontFamily:'Arial, sans-serif'}}>

          {/* ── Cover Page ── */}
          <div className="pdf-page" style={{width:794, minHeight:1123, height:1123, padding:48, boxSizing:'border-box', position:'relative', background:'#ffffff', overflow:'hidden'}}>
            {/* Outer decorative border */}
            <div style={{position:'absolute', inset:18, border:'6px double #7c3aed', borderRadius:12, pointerEvents:'none'}} />
            {/* Inner border */}
            <div style={{position:'absolute', inset:28, border:'1.5px solid #c4b5fd', borderRadius:8, pointerEvents:'none'}} />

            {/* Watermark */}
            <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none', zIndex:0}}>
              <img src="/logo.png" alt="" width={440} height={440} aria-hidden="true" style={{width:440, height:440, objectFit:'contain', opacity:0.04}} />
            </div>

            <div style={{position:'relative', zIndex:1, height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-between'}}>
              {/* Header */}
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:10, marginTop:30}}>
                <img src="/logo.png" alt="O Level Sarathi Logo" width={110} height={110} style={{width:110, height:110, objectFit:'contain', borderRadius:16}} />
                <div style={{fontSize:'2.4rem', color:'#7c3aed', fontWeight:900, letterSpacing:'-0.02em', marginTop:6}}>O Level Sarathi</div>
                <div style={{fontSize:'1rem', color:'#6b7280', fontWeight:600, letterSpacing:'0.12em'}}>TEST RESULT REPORT</div>
              </div>

              {/* Test title */}
              <div style={{textAlign:'center', padding:'18px 40px', background:'#f5f3ff', border:'1px solid #ddd6fe', borderRadius:12, maxWidth:580, width:'100%'}}>
                <div style={{fontSize:'0.75rem', color:'#7c3aed', fontWeight:800, letterSpacing:'0.1em', marginBottom:6}}>TEST NAME</div>
                <div style={{fontSize:'1.35rem', fontWeight:800, color:'#1e1b4b', lineHeight:1.3}}>{test.title}</div>
              </div>

              {/* Score grid */}
              <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, width:'100%', maxWidth:600}}>
                {[
                  {label:'TOTAL', value:scoreStats.totalCount, bg:'#eff6ff', border:'#bfdbfe', labelColor:'#1d4ed8', valueColor:'#1e3a8a'},
                  {label:'CORRECT', value:scoreStats.correctCount, bg:'#f0fdf4', border:'#bbf7d0', labelColor:'#15803d', valueColor:'#14532d'},
                  {label:'WRONG', value:scoreStats.wrongCount, bg:'#fff1f2', border:'#fecdd3', labelColor:'#be123c', valueColor:'#9f1239'},
                  {label:'SKIPPED', value:scoreStats.skipped, bg:'#f8fafc', border:'#e2e8f0', labelColor:'#475569', valueColor:'#334155'},
                ].map(s => (
                  <div key={s.label} style={{padding:'14px 10px', background:s.bg, border:`1px solid ${s.border}`, borderRadius:10, textAlign:'center'}}>
                    <div style={{fontSize:'0.65rem', color:s.labelColor, fontWeight:800, letterSpacing:'0.08em'}}>{s.label}</div>
                    <div style={{fontSize:'2rem', fontWeight:900, color:s.valueColor, lineHeight:1.1, marginTop:4}}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Grade badge */}
              <div style={{padding:'22px 60px', borderRadius:16, background:scoreStats.color+'18', border:`2px solid ${scoreStats.color}`, textAlign:'center'}}>
                <div style={{fontSize:'0.75rem', color:'#6b7280', fontWeight:700, letterSpacing:'0.1em'}}>FINAL GRADE &amp; SCORE</div>
                <div style={{fontSize:'4rem', fontWeight:900, color:scoreStats.color, lineHeight:1}}>{scoreStats.grade}</div>
                <div style={{fontSize:'1.5rem', fontWeight:800, color:'#111827'}}>{scoreStats.percent}%</div>
              </div>

              {/* Footer */}
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'1rem', fontWeight:800, color:'#7c3aed'}}>Developer: Er. Divyanshu</div>
                <div style={{fontSize:'0.85rem', color:'#6b7280', marginTop:4}}>www.olevelsarathi.in</div>
              </div>
            </div>
          </div>

          {/* ── Question Pages ── */}
          {questions.map((qD, qI) => {
            const uAns = answers[qD._qid]
            const isAnswered = Boolean(uAns)
            const isCorrect = isAnswered && checkCorrect(uAns, qD)
            const isWrong = isAnswered && !isCorrect
            const correctOption = getCorrectOption(qD)
            const explanation = getExplanation(qD)
            const PDF_FONT = "'Segoe UI', Arial, Helvetica, sans-serif"

            // Option coloring:
            // - User correct choice → green bg + border
            // - User wrong choice → red bg + border
            // - Correct option when user was wrong → green
            // - Others → plain white
            const getOptStyle = (opt) => {
              const isThisCorrect = correctOption === opt
              const isStudentChoice = uAns === opt
              const isStudentWrong = isStudentChoice && isWrong

              if (isStudentWrong) {
                return { bg: '#fff0f0', border: '#f87171', color: '#b91c1c', fontWeight: 600 }
              }
              if (isThisCorrect) {
                return { bg: '#f0fdf4', border: '#4ade80', color: '#15803d', fontWeight: 600 }
              }
              return { bg: '#ffffff', border: '#e5e7eb', color: '#374151', fontWeight: 400 }
            }

            return (
              <div key={`pdf-${qD._qid}`} className="pdf-page" style={{
                width: 794,
                minHeight: 1123,
                padding: '36px 52px 28px 52px',
                boxSizing: 'border-box',
                background: '#ffffff',
                fontFamily: PDF_FONT,
              }}>

                {/* ── Header ── */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: 8,
                  borderBottom: '1.5px solid #cbd5e1',
                }}>
                  <div style={{display:'flex', alignItems:'center', gap:7}}>
                    <img src="/logo.png" alt="" width={22} height={22} style={{width:22, height:22, objectFit:'contain', borderRadius:4}} />
                    <span style={{fontSize:'0.74rem', fontWeight:700, color:'#1e293b', fontFamily: PDF_FONT}}>O Level Sarathi</span>
                  </div>
                  <span style={{fontSize:'0.7rem', color:'#94a3b8', fontFamily: PDF_FONT}}>
                    {qI + 1} / {questions.length}
                  </span>
                </div>

                {/* Space below divider */}
                <div style={{height: 40}} />

                {/* Question number */}
                <div style={{
                  fontSize: '0.7rem',
                  color: '#94a3b8',
                  fontWeight: 600,
                  fontFamily: PDF_FONT,
                  letterSpacing: '0.06em',
                  marginBottom: 10,
                }}>
                  Q. {qI + 1}
                </div>

                {/* Question text */}
                <div style={{marginBottom: 22}}>
                  <FormattedContent
                    value={getQuestionText(qD)}
                    pdf
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#111827',
                      lineHeight: 1.7,
                      fontFamily: PDF_FONT,
                    }}
                  />
                </div>

                {/* Options */}
                <div style={{display:'flex', flexDirection:'column', gap:8, marginBottom:24}}>
                  {getAvailableOptions(qD).map((opt) => {
                    const s = getOptStyle(opt)
                    return (
                      <div key={`pdf-${qD._qid}-${opt}`} style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                        padding: '9px 14px',
                        border: `1.5px solid ${s.border}`,
                        background: s.bg,
                        borderRadius: 6,
                        boxSizing: 'border-box',
                      }}>
                        <span style={{
                          flexShrink: 0,
                          minWidth: 22,
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: s.color,
                          fontFamily: PDF_FONT,
                        }}>{opt.toUpperCase()}.</span>
                        <FormattedContent
                          as="span"
                          value={getOptionText(qD, opt)}
                          pdf
                          style={{
                            fontSize: '0.9rem',
                            color: s.color,
                            fontWeight: s.fontWeight,
                            lineHeight: 1.5,
                            fontFamily: PDF_FONT,
                          }}
                        />
                      </div>
                    )
                  })}
                </div>

                {/* Explanation */}
                {explanation ? (
                  <div style={{
                    padding: '11px 14px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderLeft: '3px solid #6366f1',
                    borderRadius: 5,
                  }}>
                    <div style={{fontSize:'0.65rem', color:'#6366f1', fontWeight:700, fontFamily: PDF_FONT, letterSpacing:'0.06em', marginBottom:5}}>EXPLANATION</div>
                    <FormattedContent
                      value={explanation}
                      pdf
                      style={{fontSize:'0.87rem', lineHeight:1.6, color:'#1e293b', fontFamily: PDF_FONT}}
                    />
                  </div>
                ) : null}

                {/* Footer */}
                <div style={{position:'absolute', bottom:24, left:52, right:52, display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #f1f5f9', paddingTop:8}}>
                  <span style={{fontSize:'0.65rem', color:'#cbd5e1', fontFamily: PDF_FONT}}>O Level Sarathi</span>
                  <span style={{fontSize:'0.65rem', color:'#cbd5e1', fontFamily: PDF_FONT}}>www.olevelsarathi.in</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const q_ = questions[idx]
  const opts_ = getAvailableOptions(q_)
  const currentQuestionAnswer = answers[q_?._qid]

  return (
    <div className="page quiz-page" style={{minHeight:'100vh'}}>
      <SEO
        title={`${test?.title || 'O Level Test'} — NIELIT O Level Mock Test | OLevelSarathi`}
        description={`${test?.title || 'NIELIT O Level'} mock test attempt karein — instant results, detailed explanations aur performance analysis. OLevelSarathi.in par free O Level test.`}
        keywords={`${test?.title || 'O Level test'}, O Level mock test, NIELIT O Level test, OLevelSarathi, O Level exam test online, NIELIT mock test free`}
        canonical={`https://olevelsarathi.in/test/${testId}`}
        robots="noindex"
      />
      <div style={{ marginBottom: 24, padding: '0 4px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 12 }}>{test.title}</h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: 760 }}>
          Practice this timed mock test to strengthen your preparation for NIELIT O-Level exams. Answer each question carefully, review your progress, and submit only when you are ready.
        </p>
      </div>
      <div className="quiz-shell">
        <div className="quiz-ads">
          <div className="card" style={{padding:20, border:'1px solid var(--border)'}}>
            <AutoAd />
          </div>
          <div className="card" style={{padding:20, border:'1px solid var(--border)'}}>
            <RelaxedAd />
          </div>
        </div>

        <div className="quiz-main">
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:16}}>
            <button className="btn btn-ghost" onClick={handleQuit} style={{padding:0, fontSize:'0.85rem'}}>Quit</button>
            <div style={{fontSize:'1rem', fontWeight:900, color:timeLeft<60?'#ef4444':'var(--accent)'}}><FiClock /> {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>
          </div>

          <div className="card quiz-question-card">
            <span className="badge" style={{marginBottom:12, fontSize:'0.72rem'}}>Q.{idx+1} / {questions.length}</span>
            <FormattedContent value={getQuestionText(q_) || 'Question loading...'} className="quiz-question-text" />
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              {opts_.map(o=>{
                const currentAnswer = currentQuestionAnswer
                const hasAnswered = Boolean(currentAnswer)
                const isC = checkCorrect(o, q_)
                const isU = currentAnswer === o
                let b='var(--border)', bg='var(--bg-primary)', c='var(--text-primary)'
                if(hasAnswered){
                  // Only highlight the correct option — do NOT highlight user's wrong pick
                  if(isC){ b='#10b981'; bg='rgba(16,185,129,0.12)'; c='#10b981' }
                }
                return (
                  <button key={`${q_?._qid}-${o}`} onClick={() => !hasAnswered && q_?._qid && setAnswers(a=>({...a, [q_._qid]:o}))} disabled={hasAnswered} style={{
                    padding:'12px 16px', borderRadius:10, border:`2px solid ${b}`, background:bg, color:c,
                    textAlign:'left', cursor:hasAnswered?'default':'pointer', display:'flex', justifyContent:'space-between',
                    alignItems:'flex-start', gap:10, fontWeight:600, fontSize:'0.85rem', opacity: hasAnswered ? 0.95 : 1, minHeight: 58
                  }}>
                    <span style={{flexShrink:0, fontWeight:800}}>{o.toUpperCase()}.</span>
                    <FormattedContent as="span" value={getOptionText(q_, o)} className="quiz-option-text" />
                    {hasAnswered && isC && <FiCheck style={{flexShrink:0, marginTop:2}} />}
                  </button>
                )
              })}
            </div>
            {currentQuestionAnswer && <ExplanationPanel question={q_} selected={currentQuestionAnswer} />}
          </div>

          <div style={{display:'flex', justifyContent:'space-between', marginTop:18}}>
            <button className="btn btn-ghost" onClick={()=>setIdx(i=>i-1)} disabled={idx === 0} style={{fontSize:'0.85rem'}}>Prev</button>
            {idx<questions.length-1 ? <button className="btn btn-primary" onClick={()=>setIdx(i=>i+1)} style={{fontSize:'0.85rem'}}>Next</button> : <button className="btn btn-primary" onClick={()=>setShowConfirm(true)} style={{background:'#10b981', fontSize:'0.85rem'}}>Finish</button>}
          </div>
        </div>

        <div className="palette-container">
           <div className="card" style={{padding:18, position:'sticky', top:100, border:'1px solid var(--border)'}}>
              <h4 style={{marginBottom:12, fontSize:'0.85rem'}}> <FiGrid /> Palette</h4>
              <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:5, marginBottom:16}}>
                {questions.map((question,i)=>(
                  <button key={question._qid} onClick={() => setIdx(i)} style={{
                    aspectRatio:'1/1', borderRadius:8, border:i===idx?'2px solid var(--accent)':'1px solid var(--border)',
                    background:!!answers[question._qid]?'rgba(37, 99, 235,0.1)':'transparent', color:!!answers[question._qid]?'var(--accent)':'var(--text-secondary)',
                    fontWeight:800, fontSize:'0.7rem', cursor:'pointer', minWidth:24, minHeight:24, padding:0
                  }}>{i+1}</button>
                ))}
              </div>
              <button className="btn btn-primary" onClick={()=>setShowConfirm(true)} style={{width:'100%', background:'#10b981', fontSize:'0.82rem', padding:'10px 0'}}>Submit</button>

              {/* AdSense Advertisement in Sidebar */}
              <div style={{marginTop: 18}}>
                <AutoAd />
              </div>
           </div>
        </div>
      </div>

      <style>{`
        .palette-container {
          width: 220px;
          flex-shrink: 0;
        }
        @media (max-width: 1000px) {
          .palette-container {
            width: 100%;
            display: flex;
            justify-content: center;
          }
          .palette-container .card {
            position: static;
            width: 100%;
            max-width: 400px;
          }
        }
      `}</style>

      {showConfirm && (
        <div className="modal-overlay" style={{position:'fixed', inset:0, zIndex:1001, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.55)', padding:'20px'}}>
           <div className="modal-box glass" style={{maxWidth:380, width:'100%', textAlign:'center', padding:32}}>
              <FiAlertCircle size={48} color="#f59e0b" style={{marginBottom:15}} />
              <h3 style={{fontWeight:900}}>Submit Test?</h3>
              <p style={{margin:'10px 0 24px', color:'var(--text-secondary)'}}>Questions Answered: {Object.keys(answers).length} / {questions.length}</p>
              <div style={{display:'flex', gap:10}}>
                <button className="btn btn-primary" onClick={()=>setStatus('result')} style={{flex:1, background:'#10b981'}}>Submit</button>
                <button className="btn btn-ghost" onClick={()=>setShowConfirm(false)} style={{flex:1}}>Review</button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
