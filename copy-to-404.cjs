const fs = require('fs');
const path = require('path');

const distIndex = path.join(__dirname, '..', 'dist', 'index.html');
const dist404 = path.join(__dirname, '..', 'dist', '404.html');

if (fs.existsSync(distIndex)) {
  try {
    fs.copyFileSync(distIndex, dist404);
    console.log('Copied dist/index.html -> dist/404.html');
  } catch (e) {
    console.error('Failed to copy index.html to 404.html', e);
    process.exit(1);
  }
} else {
  console.warn('dist/index.html not found. Run build first.');
}
