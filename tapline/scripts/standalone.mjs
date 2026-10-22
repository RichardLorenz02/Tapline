import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

let html = await readFile('dist/index.html', 'utf8');
const js = html.match(/<script[^>]*src="([^"]+)"[^>]*><\/script>/);
const css = html.match(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/);
if (!js || !css) throw new Error('Could not locate the built JavaScript and stylesheet.');
const bundle = await readFile(path.join('dist', js[1]), 'utf8');
const styles = await readFile(path.join('dist', css[1]), 'utf8');
html = html.replace(js[0], () => `<script type="module">${bundle.replaceAll('</script', '<\\/script')}</script>`);
html = html.replace(css[0], () => `<style>${styles.replaceAll('</style', '<\\/style')}</style>`);
const icon = await readFile('public/favicon.svg', 'utf8');
html = html.replace('./favicon.svg', `data:image/svg+xml,${encodeURIComponent(icon)}`);
await writeFile('tapline-demo.html', html);
console.log('Standalone offline demo created: tapline-demo.html');
