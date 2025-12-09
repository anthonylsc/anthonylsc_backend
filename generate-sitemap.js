#!/usr/bin/env node
/**
 * Generate SEO Files: sitemap.xml and feed.xml
 * Usage: node scripts/generate-sitemap.js
 * 
 * This script:
 * - Reads writings data from src/data/writings.js
 * - Generates sitemap.xml for search engines
 * - Generates feed.xml (RSS) for content distribution
 * - Both files are placed in public/ for deployment
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '../public')

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

const BASE_URL = 'https://www.anthonylsc.fr'
const SITE_TITLE = 'anthony.lsc - Philosophy & Thoughts'
const SITE_DESCRIPTION = 'Explorations philosophiques, pensées et réflexions sur la vie, l\'esprit et l\'existence.'

/**
 * Escape XML special characters
 */
function escapeXml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Generate sitemap.xml
 */
async function generateSitemap() {
  const { writings } = await import('../src/data/writings.js')

  const urlset = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
    `        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`,
    `  <!-- Homepage -->`,
    `  <url>`,
    `    <loc>${BASE_URL}/</loc>`,
    `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`,
    `    <changefreq>monthly</changefreq>`,
    `    <priority>1.0</priority>`,
    `  </url>`,
    `  <!-- Writings list page -->`,
    `  <url>`,
    `    <loc>${BASE_URL}/writings</loc>`,
    `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`,
    `    <changefreq>weekly</changefreq>`,
    `    <priority>0.9</priority>`,
    `  </url>`
  ]

  // Add individual writing pages
  writings.forEach(writing => {
    const date = writing.date || new Date().toISOString().split('T')[0]
    const category = writing.category ? ` - ${writing.category}` : ''
    
    urlset.push(
      `  <!-- ${escapeXml(writing.title)}${escapeXml(category)} -->`,
      `  <url>`,
      `    <loc>${BASE_URL}/writings/${writing.id}</loc>`,
      `    <lastmod>${date}</lastmod>`,
      `    <changefreq>monthly</changefreq>`,
      `    <priority>0.85</priority>`,
      `    <news:news>`,
      `      <news:publication>`,
      `        <news:name>${escapeXml(SITE_TITLE)}</news:name>`,
      `        <news:language>fr</news:language>`,
      `      </news:publication>`,
      `      <news:publication_date>${new Date(date).toISOString()}</news:publication_date>`,
      `      <news:title>${escapeXml(writing.title)}</news:title>`,
      `      <news:keywords>${escapeXml(writing.category || 'philosophie, réflexion')}</news:keywords>`,
      `    </news:news>`,
      `  </url>`
    )
  })

  urlset.push(`</urlset>`)

  const sitemapPath = path.join(publicDir, 'sitemap.xml')
  fs.writeFileSync(sitemapPath, urlset.join('\n'), 'utf-8')

  console.log(`✅ Sitemap généré: ${sitemapPath}`)
  console.log(`   ${writings.length} writings indexés`)
}

/**
 * Generate feed.xml (RSS Feed)
 */
async function generateFeed() {
  const { writings } = await import('../src/data/writings.js')

  const items = writings.map(writing => {
    const date = writing.date || new Date().toISOString()
    const description = writing.excerpt || writing.content?.substring(0, 200) || 'Lecture recommandée'
    
    return `  <item>
    <title>${escapeXml(writing.title)}</title>
    <link>${BASE_URL}/writings/${writing.id}</link>
    <guid isPermaLink="true">${BASE_URL}/writings/${writing.id}</guid>
    <description>${escapeXml(description)}</description>
    <category>${escapeXml(writing.category || 'Philosophie')}</category>
    <pubDate>${new Date(date).toUTCString()}</pubDate>
  </item>`
  }).join('\n')

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${BASE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>fr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`

  const feedPath = path.join(publicDir, 'feed.xml')
  fs.writeFileSync(feedPath, feed, 'utf-8')

  console.log(`✅ RSS Feed généré: ${feedPath}`)
  console.log(`   ${writings.length} articles dans le flux`)
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🔄 Génération des fichiers SEO...\n')
    await generateSitemap()
    await generateFeed()
    console.log('\n✨ Tous les fichiers SEO ont été générés avec succès!')
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error)
    process.exit(1)
  }
}

main()
