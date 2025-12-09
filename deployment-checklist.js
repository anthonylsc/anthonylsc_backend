#!/usr/bin/env node
/**
 * 📋 SEO DEPLOYMENT CHECKLIST
 * 
 * Interactive checklist for deploying your site with full SEO setup
 * Run: node scripts/deployment-checklist.js
 */

import * as readline from 'readline'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (q) => new Promise(resolve => rl.question(q, resolve))

const checks = [
  {
    category: '🔍 Vérification des fichiers SEO',
    tasks: [
      { text: 'public/sitemap.xml existe', file: 'public/sitemap.xml' },
      { text: 'public/feed.xml existe', file: 'public/feed.xml' },
      { text: 'public/robots.txt existe', file: 'public/robots.txt' },
      { text: 'public/404.html existe', file: 'public/404.html' },
    ]
  },
  {
    category: '⚙️ Vérification du code',
    tasks: [
      { text: 'useSEO() intégré dans Home.jsx', manual: true },
      { text: 'useSEO() intégré dans WritingModal ou WritingsPage', manual: true },
      { text: 'Pas d\'erreurs dans la console (F12)', manual: true },
    ]
  },
  {
    category: '🚀 Vérification du déploiement',
    tasks: [
      { text: 'npm run build exécuté avec succès', manual: true },
      { text: 'Sitemap et feed générés (voir terminal)', manual: true },
      { text: 'npm run deploy exécuté avec succès', manual: true },
    ]
  },
  {
    category: '🌐 Vérification du site live',
    tasks: [
      { text: 'www.anthonylsc.fr/sitemap.xml accessible', manual: true },
      { text: 'www.anthonylsc.fr/feed.xml accessible', manual: true },
      { text: 'www.anthonylsc.fr/robots.txt accessible', manual: true },
      { text: 'Meta tags visibles en inspectant (F12)', manual: true },
    ]
  },
  {
    category: '📊 Vérification Google Search Console',
    tasks: [
      { text: 'Propriété créée sur Google Search Console', manual: true },
      { text: 'Domaine validé', manual: true },
      { text: 'Sitemap uploadé', manual: true },
      { text: 'Pas d\'erreurs de couverture', manual: true },
    ]
  }
]

async function runChecklist() {
  console.clear()
  console.log('╔' + '═'.repeat(58) + '╗')
  console.log('║' + ' '.repeat(15) + '🎯 SEO DEPLOYMENT CHECKLIST' + ' '.repeat(15) + '║')
  console.log('╚' + '═'.repeat(58) + '╝\n')

  const projectRoot = path.join(__dirname, '..')
  let totalChecks = 0
  let passedChecks = 0

  for (const category of checks) {
    console.log(`\n${category.category}`)
    console.log('─'.repeat(60))

    for (const task of category.tasks) {
      totalChecks++
      let status = '❓'

      if (task.file) {
        const filePath = path.join(projectRoot, task.file)
        if (fs.existsSync(filePath)) {
          status = '✅'
          passedChecks++
        } else {
          status = '❌'
        }
      }

      if (task.manual) {
        const answer = await question(`${status} ${task.text}? (y/n): `)
        if (answer.toLowerCase() === 'y') {
          passedChecks++
          console.log('   ✅ Marqué comme fait\n')
        } else {
          console.log('   ❌ À faire\n')
        }
      } else {
        console.log(`   ${status} ${task.text}\n`)
      }
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60))
  console.log(`\n📊 RÉSULTAT: ${passedChecks}/${totalChecks} vérifications passées\n`)

  if (passedChecks === totalChecks) {
    console.log('✨ PARFAIT! Tout est configuré et prêt!')
    console.log('\n📝 Prochaines étapes:')
    console.log('  1. Attendre 24-48h pour que Google indexe ton site')
    console.log('  2. Vérifier dans Google Search Console')
    console.log('  3. Partager tes writings sur les réseaux sociaux')
    console.log('  4. Continuer à ajouter du contenu de qualité')
  } else {
    const remaining = totalChecks - passedChecks
    console.log(`⚠️  ${remaining} point(s) à vérifier\n`)
    console.log('💡 Conseil: Relis la documentation pour les points non validés')
    console.log('  - QUICK_START_SEO.md (5 min)')
    console.log('  - SEO_SETUP_GUIDE.md (15 min)')
  }

  console.log('\n' + '═'.repeat(60) + '\n')
  rl.close()
}

console.log('⏳ Démarrage de la checklist interactif...\n')
runChecklist().catch(console.error)
