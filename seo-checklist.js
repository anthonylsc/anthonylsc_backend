#!/usr/bin/env node
/**
 * 📋 SEO SETUP CHECKLIST
 * 
 * Utilise ce fichier pour vérifier que tout est bien configuré
 * Exécution: node scripts/seo-checklist.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, '..')

const checks = [
  {
    name: 'scripts/generate-sitemap.js existe',
    path: 'scripts/generate-sitemap.js',
    type: 'file'
  },
  {
    name: 'public/sitemap.xml existe',
    path: 'public/sitemap.xml',
    type: 'file'
  },
  {
    name: 'public/feed.xml existe',
    path: 'public/feed.xml',
    type: 'file'
  },
  {
    name: 'public/robots.txt existe',
    path: 'public/robots.txt',
    type: 'file'
  },
  {
    name: 'public/404.html existe',
    path: 'public/404.html',
    type: 'file'
  },
  {
    name: 'src/components/SEOHead.jsx existe',
    path: 'src/components/SEOHead.jsx',
    type: 'file'
  },
  {
    name: 'src/hooks/useSEO.js existe',
    path: 'src/hooks/useSEO.js',
    type: 'file'
  },
  {
    name: 'src/utils/seoHelpers.js existe',
    path: 'src/utils/seoHelpers.js',
    type: 'file'
  },
  {
    name: 'package.json build script includes generate-sitemap.js',
    path: 'package.json',
    type: 'content',
    search: 'generate-sitemap.js'
  }
]

console.log('🔍 SEO Setup Checklist\n' + '='.repeat(50) + '\n')

let passedCount = 0
let totalCount = checks.length

checks.forEach((check, index) => {
  const fullPath = path.join(projectRoot, check.path)
  let passed = false
  let message = '✅'

  try {
    if (check.type === 'file') {
      passed = fs.existsSync(fullPath)
      if (!passed) {
        message = '❌'
      }
    } else if (check.type === 'content') {
      const content = fs.readFileSync(fullPath, 'utf-8')
      passed = content.includes(check.search)
      if (!passed) {
        message = '❌'
      }
    }

    if (passed) passedCount++
    
    console.log(`${message} ${index + 1}. ${check.name}`)
    if (!passed) {
      console.log(`   Path: ${check.path}`)
    }
  } catch (error) {
    console.log(`❌ ${index + 1}. ${check.name}`)
    console.log(`   Error: ${error.message}`)
  }
})

console.log('\n' + '='.repeat(50))
console.log(`\n📊 Results: ${passedCount}/${totalCount} checks passed\n`)

if (passedCount === totalCount) {
  console.log('✨ Toute la configuration SEO est OK!')
  console.log('\n📝 Prochaines étapes:')
  console.log('  1. Intégrer useSEO() dans tes pages (Home, Writings)')
  console.log('  2. Exécuter: npm run build')
  console.log('  3. Exécuter: npm run deploy')
  console.log('  4. Ajouter ton sitemap à Google Search Console')
  process.exit(0)
} else {
  console.log(`⚠️  ${totalCount - passedCount} check(s) échoué(s)`)
  console.log('\n📝 Vérifications nécessaires:')
  console.log('  - Tous les fichiers sont créés')
  console.log('  - Le package.json est bien mis à jour')
  process.exit(1)
}
