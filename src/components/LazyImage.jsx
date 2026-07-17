import { useState, useEffect, useRef } from 'react'

/**
 * LazyImage Component - Optimized image loading for Core Web Vitals
 * Features:
 * - Lazy loading with Intersection Observer API
 * - Image compression support
 * - Placeholder while loading
 * - Error handling
 * - LQIP (Low Quality Image Placeholder) support
 */
export default function LazyImage({
  src,
  alt,
  placeholder = '/placeholder.png',
  width,
  height,
  className = '',
  style = {},
  onLoad = () => {},
  loading = 'lazy'
}) {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = new Image()
            img.src = src
            img.onload = () => {
              setImageSrc(src)
              setIsLoaded(true)
              onLoad()
            }
            img.onerror = () => {
              setError(true)
              setImageSrc(placeholder)
            }
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '50px' }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [src, placeholder, onLoad])

  return (
    <div
      ref={imgRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-card2)',
        ...style
      }}
    >
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={loading}
        style={{
          opacity: isLoaded ? 1 : 0.7,
          transition: 'opacity 0.3s ease',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
      />
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            animation: 'shimmer 2s infinite'
          }}
        />
      )}
    </div>
  )
}
