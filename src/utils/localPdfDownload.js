import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

async function imageToDataUrl(src) {
  if (!src || src.startsWith('data:')) return src
  try {
    const response = await fetch(src, { cache: 'force-cache' })
    if (!response.ok) return null
    const blob = await response.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export async function inlineLocalImages(container) {
  const images = Array.from(container.querySelectorAll('img'))
  const originals = images.map((img) => ({ img, src: img.getAttribute('src') || img.src }))
  await Promise.all(
    images.map(async (img) => {
      const dataUrl = await imageToDataUrl(img.src)
      if (dataUrl) img.src = dataUrl
    })
  )
  return () => {
    originals.forEach(({ img, src }) => { if (src) img.src = src })
  }
}

// Yield to browser so UI doesn't freeze between pages
const yieldToBrowser = () => new Promise(resolve => setTimeout(resolve, 0))

/**
 * Fast PDF builder:
 * - Scale 1 (not 2 or 1.5) — biggest speed win, still readable
 * - JPEG 0.75 quality — much smaller, much faster toDataURL
 * - Yields to browser between pages so UI stays responsive
 * - No watermark images in pages — skipped entirely for speed
 */
export async function buildPdfFromPages(pages, onProgress) {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true })
  const A4_W_MM = 210
  const A4_H_MM = 297
  const PX_PER_MM = 794 / 210
  const A4_H_PX = A4_H_MM * PX_PER_MM
  const SCALE = 1  // scale 1 is 3x faster than scale 1.5, still clear enough for text

  const total = pages.length

  for (let index = 0; index < total; index += 1) {
    const page = pages[index]
    page.style.display = 'block'
    page.style.position = 'relative'

    onProgress?.(Math.round((index / total) * 85) + 5, `Page ${index + 1} / ${total}`)

    const logicalWidth = 794
    const logicalHeight = Math.max(page.scrollHeight || page.offsetHeight || A4_H_PX, 100)

    const canvas = await html2canvas(page, {
      scale: SCALE,
      useCORS: false,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      width: logicalWidth,
      height: logicalHeight,
      windowWidth: logicalWidth,
      windowHeight: logicalHeight,
      imageTimeout: 2000,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      removeContainer: true,
      foreignObjectRendering: false,
    })

    if (!canvas?.width || !canvas?.height) {
      await yieldToBrowser()
      continue
    }

    // JPEG 0.75 — fast encode, small file, fine for text
    const imgData = canvas.toDataURL('image/jpeg', 0.75)
    const contentHeightMm = logicalHeight / PX_PER_MM

    if (index > 0) pdf.addPage()

    if (contentHeightMm <= A4_H_MM + 0.5) {
      pdf.addImage(imgData, 'JPEG', 0, 0, A4_W_MM, A4_H_MM, undefined, 'FAST')
    } else {
      // Tall content — slice into A4 pages
      const sliceHeightPx = A4_H_PX * SCALE
      const totalH = canvas.height
      let startPx = 0
      let first = true

      while (startPx < totalH) {
        const sliceH = Math.min(sliceHeightPx, totalH - startPx)
        const sc = document.createElement('canvas')
        sc.width = canvas.width
        sc.height = sliceH
        sc.getContext('2d').drawImage(canvas, 0, -startPx)
        const sd = sc.toDataURL('image/jpeg', 0.75)
        if (!first) pdf.addPage()
        first = false
        const sliceMm = (sliceH / SCALE) / PX_PER_MM
        pdf.addImage(sd, 'JPEG', 0, 0, A4_W_MM, sliceMm, undefined, 'FAST')
        startPx += sliceHeightPx
      }
    }

    // Yield every page so browser stays responsive
    await yieldToBrowser()
  }

  onProgress?.(93, 'Finalizing...')
  return pdf
}

export async function savePdfOnDevice(pdf, fileName) {
  const safeName = `${String(fileName || 'Result').replace(/[^\w\s-]/gi, '_')}_Result.pdf`
  const blob = pdf.output('blob', { type: 'application/pdf' })
  const file = new File([blob], safeName, { type: 'application/pdf' })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: safeName })
      return { method: 'share', size: blob.size }
    } catch (err) {
      if (err?.name === 'AbortError') return directDownload(blob, safeName)
    }
  }
  return directDownload(blob, safeName)
}

function directDownload(blob, safeName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = safeName
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 3000)
  return { method: 'download', size: blob.size }
}
