// Creates a dummy "canvas" package in node_modules so esbuild can resolve it.
// pdfjs-dist requires "canvas" for Node.js but it's not needed in the browser.
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const canvasDir = join(__dirname, '..', 'node_modules', 'canvas');

try {
  mkdirSync(canvasDir, { recursive: true });
  writeFileSync(join(canvasDir, 'package.json'), JSON.stringify({
    name: 'canvas',
    version: '0.0.0',
    main: 'index.js'
  }));
  writeFileSync(join(canvasDir, 'index.js'), 'module.exports = {};');
  console.log('✓ Created canvas shim in node_modules');
} catch (e) {
  console.warn('Could not create canvas shim:', e.message);
}
