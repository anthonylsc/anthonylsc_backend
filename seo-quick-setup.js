#!/usr/bin/env node
/**
 * 🚀 SEO QUICK SETUP
 * 
 * Ce script aide à intégrer rapidement le SEO dans tes fichiers
 * Usage: node scripts/seo-quick-setup.js
 * 
 * ⚠️ ATTENTION: Ce script affiche les snippets de code à copier
 * Tu dois les copier manuellement dans tes fichiers!
 */

import { question } from 'readline-sync'

console.clear()
console.log(`
╔════════════════════════════════════════════════════════════╗
║                    🚀 SEO QUICK SETUP                     ║
║              Configuration SEO en quelques minutes         ║
╚════════════════════════════════════════════════════════════╝

⚠️ Ce script affiche le code à copier dans tes fichiers.
Ne modifie pas automatiquement - tu dois le faire manuellement!

`)

// Question 1
console.log(`
════════════════════════════════════════════════════════════

🔹 ÉTAPE 1: Ajouter SEO à Home.jsx

Fichier: src/Pages/Home.jsx

Ajoute en haut du fichier:
`)

console.log(`
┌────────────────────────────────────────────────────────────┐
│ import { useEffect } from 'react'                          │
│ import { useSEO } from '../hooks/useSEO'                   │
└────────────────────────────────────────────────────────────┘
`)

console.log(`
Puis dans le composant, ajoute au début:

┌────────────────────────────────────────────────────────────┐
│ useEffect(() => {                                          │
│   useSEO({                                                 │
│     title: 'anthony.lsc - Philosophy & Thoughts',          │
│     description: 'Explorations philosophiques et pensées', │
│     url: 'https://www.anthonylsc.fr'                       │
│   })                                                       │
│ }, [])                                                     │
└────────────────────────────────────────────────────────────┘
`)

let ready = question('\n✅ Tu as copié le code? (y/n): ')
if (ready.toLowerCase() !== 'y') {
  console.log('\n❌ À bientôt!')
  process.exit(0)
}

// Question 2
console.log(`

════════════════════════════════════════════════════════════

🔹 ÉTAPE 2: Ajouter SEO à WritingModal.jsx (ou WritingsPage)

Fichier: src/components/portfolio/WritingModal.jsx
         ou src/Pages/WritingsPage.jsx

Ajoute en haut du fichier:
`)

console.log(`
┌────────────────────────────────────────────────────────────┐
│ import { useEffect } from 'react'                          │
│ import { useSEO } from '../../hooks/useSEO'                │
│ import {                                                   │
│   getWritingSEOData,                                       │
│   generateArticleStructuredData,                           │
│   injectStructuredData                                     │
│ } from '../../utils/seoHelpers'                            │
└────────────────────────────────────────────────────────────┘
`)

console.log(`
Puis dans le composant WritingModal, ajoute:

┌────────────────────────────────────────────────────────────┐
│ useEffect(() => {                                          │
│   if (isOpen && writing) {                                 │
│     const seoData = getWritingSEOData(writing)             │
│     useSEO({                                               │
│       title: seoData.title,                                │
│       description: seoData.description,                    │
│       url: seoData.url                                     │
│     })                                                     │
│                                                            │
│     const structuredData =                                 │
│       generateArticleStructuredData(writing)               │
│     injectStructuredData(structuredData)                   │
│   }                                                        │
│ }, [isOpen, writing])                                      │
└────────────────────────────────────────────────────────────┘
`)

ready = question('\n✅ Tu as copié le code? (y/n): ')
if (ready.toLowerCase() !== 'y') {
  console.log('\n❌ À bientôt!')
  process.exit(0)
}

// Question 3
console.log(`

════════════════════════════════════════════════════════════

🔹 ÉTAPE 3: Build et Deploy

Exécute dans le terminal:

┌────────────────────────────────────────────────────────────┐
│ npm run build                                              │
└────────────────────────────────────────────────────────────┘

Cela devrait afficher:
  ✅ Sitemap généré: ...
  ✅ RSS Feed généré: ...

Puis:

┌────────────────────────────────────────────────────────────┐
│ npm run deploy                                             │
└────────────────────────────────────────────────────────────┘

Attends que le deploy se termine (~2 minutes).

`)

ready = question('✅ Tu as exécuté npm run build && npm run deploy? (y/n): ')
if (ready.toLowerCase() !== 'y') {
  console.log('\n❌ À bientôt!')
  process.exit(0)
}

// Question 4
console.log(`

════════════════════════════════════════════════════════════

🔹 ÉTAPE 4: Ajouter à Google Search Console

1. Va à: https://search.google.com/search-console/about
2. Clique "Commencer"
3. Sélectionne "Ajouter une propriété"
4. Entre: https://www.anthonylsc.fr
5. Valide (via DNS ou HTML - choisis la plus facile)
6. Une fois validé:
   - Menu → "Sitemaps"
   - Clique "+ Ajouter un sitemap"
   - Entre: sitemap.xml
   - Clique "Envoyer"

`)

ready = question('✅ Tu as ajouté le sitemap à Google? (y/n): ')
if (ready.toLowerCase() !== 'y') {
  console.log('\n⚠️ C\'est important pour que Google indexe ton site!')
  process.exit(0)
}

// Vérifications
console.log(`

════════════════════════════════════════════════════════════

🔹 ÉTAPE 5: Vérifications finales

Ouvre ton site et inspecte (F12):

  1. Va à: https://www.anthonylsc.fr/writings/1
  2. Clique F12 (Inspect)
  3. Cherche: <meta name="description"...>
  4. Tu devrais voir le texte du writing en description

Vérifie aussi:

  📍 https://www.anthonylsc.fr/sitemap.xml → Accessible
  📍 https://www.anthonylsc.fr/feed.xml → Accessible
  📍 https://www.anthonylsc.fr/robots.txt → Accessible

`)

ready = question('✅ Tu as vérifié? (y/n): ')

// Conclusion
console.log(`

════════════════════════════════════════════════════════════

✨ C'EST FAIT! Ton site est maintenant optimisé pour SEO!

📊 Prochaines étapes:

  1. Attendre 2-7 jours que Google indexe tout
  2. Vérifier dans Google Search Console
  3. Partager tes writings sur les réseaux sociaux
  4. Continuer à ajouter du contenu de qualité
  5. Ajouter des backlinks (partages, mentions)

📚 Documentation:

  - QUICK_START_SEO.md (vue rapide)
  - SEO_SETUP_GUIDE.md (documentation complète)
  - FILES_SUMMARY.md (liste des fichiers)

🚀 Si tu ajoutes un nouveau writing:

  1. Ajoute dans src/data/writings.js
  2. npm run build
  3. npm run deploy
  4. Fini! Le script génère le sitemap auto.

════════════════════════════════════════════════════════════

Bonne chance! 🎉

`)

process.exit(0)
