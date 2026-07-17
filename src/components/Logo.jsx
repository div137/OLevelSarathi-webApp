export default function Logo({ size = 42, alt = "O Level Sarathi - NIELIT O Level Exam Preparation Logo", priority = false, style = {} }) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      width={size}
      height={size}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      style={{ width: size, height: size, objectFit: 'contain', borderRadius: 8, ...style }}
    />
  )
}
