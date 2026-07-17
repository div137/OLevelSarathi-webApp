import { Helmet } from 'react-helmet-async'

const siteUrl = 'https://olevelsarathi.in'
const siteName = 'O Level Sarathi'
const defaultDesc = 'Master NIELIT O-Level (M1-R5, M2-R5, M3-R5, M4-R5), CCC, ADCA with free mock tests, Hindi & English notes, Python practicals and IT tools guides.'
const defaultKeywords = 'NIELIT O Level, O Level mock test, M1-R5 notes, O Level syllabus 2026'

export default function SEO({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = 'website',
  schema,
  author = siteName,
  robots = 'index, follow',
  breadcrumbs,
}) {
  const pageTitle = title?.includes(siteName) ? title : `${title} | ${siteName}`

  const breadcrumbSchema = breadcrumbs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`,
        })),
      }
    : null

  return (
    <Helmet>
      <html lang="en" />
      <title>{pageTitle}</title>
      <meta name="description" content={description || defaultDesc} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={robots} />
      {canonical && <link rel="canonical" href={canonical} />}

      <link rel="alternate" hreflang="en" href={canonical || `${siteUrl}/`} />
      <link rel="alternate" hreflang="hi" href={canonical || `${siteUrl}/`} />
      <link rel="alternate" hreflang="x-default" href={canonical || `${siteUrl}/`} />

      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical || `${siteUrl}/`} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description || defaultDesc} />
      <meta property="og:image" content={ogImage || `${siteUrl}/logo.png`} />
      <meta property="og:site_name" content={siteName} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description || defaultDesc} />
      <meta name="twitter:image" content={ogImage || `${siteUrl}/logo.png`} />

      {schema && (Array.isArray(schema) ? schema : [schema]).map((item, index) => (
        <script key={index} type="application/ld+json">{JSON.stringify(item)}</script>
      ))}

      {breadcrumbSchema && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      )}
    </Helmet>
  )
}
