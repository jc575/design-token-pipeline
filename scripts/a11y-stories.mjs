// Runs axe against every story in the built Storybook, in both themes.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, extname } from 'node:path';
import { existsSync, statSync } from 'node:fs';

const root = 'storybook-static';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const server = createServer((req, res) => {
  let p = join(root, decodeURIComponent(req.url.split('?')[0]));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
  if (!existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[extname(p)] ?? 'application/octet-stream' });
  res.end(readFileSync(p));
}).listen(0);
const port = server.address().port;
const index = JSON.parse(readFileSync(join(root, 'index.json'), 'utf8'));
const stories = Object.values(index.entries).filter((e) => e.type === 'story');
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let failures = 0;
for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  for (const s of stories) {
    await page.goto(`http://localhost:${port}/iframe.html?id=${s.id}&viewMode=story&globals=theme:${theme}`);
    await page.waitForSelector('#storybook-root > *', { timeout: 15000 });
    await page.waitForTimeout(150);
    const r = await new AxeBuilder({ page }).include('#storybook-root').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    if (r.violations.length) {
      failures += r.violations.length;
      for (const v of r.violations) console.log(`FAIL [${theme}] ${s.id}: ${v.id} (${v.nodes.length}) ${v.help}`);
    } else console.log(`ok   [${theme}] ${s.id}`);
  }
  await ctx.close();
}
await browser.close();
server.close();
console.log(failures ? `\n${failures} violation(s).` : `\nAll ${stories.length} stories x 2 themes passed axe (WCAG 2.2 AA rules).`);
process.exit(failures ? 1 : 0);
