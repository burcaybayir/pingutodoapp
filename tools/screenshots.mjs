/**
 * Renders the app in a phone-sized browser and writes docs/screenshots/*.png.
 *
 *   npx expo export --platform web --output-dir dist
 *   node tools/screenshots.mjs
 *
 * Each scene seeds localStorage before the app boots — on web AsyncStorage is
 * localStorage, so the saved state is all it takes to put Pingu in a given mood
 * without clicking through the UI. Set PINGU_CHROME to use a specific Chromium.
 */
import { createReadStream, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright';

const DIST = 'dist';
const OUT = 'docs/screenshots';
const PORT = 4173;
const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

if (!existsSync(DIST)) {
  console.error(`No ${DIST}/ — run: npx expo export --platform web --output-dir ${DIST}`);
  process.exit(1);
}

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
};

// Static file server with an SPA fallback to index.html.
const server = createServer((req, res) => {
  const path = normalize(decodeURI(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  let file = join(DIST, path);
  if (!existsSync(file) || path === '/') file = join(DIST, 'index.html');
  res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
  createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(PORT, resolve));

let n = 0;
const task = (title, opts = {}) => ({
  id: `t${++n}`,
  title,
  done: opts.done ?? false,
  createdAt: opts.createdAt ?? now - 60_000,
  completedAt: opts.done ? now - 30_000 : null,
});

const state = (over) => ({
  name: 'Burçay',
  greeted: true,
  fish: 0,
  lastSeenAt: now,
  voiceOn: true,
  todos: [],
  ...over,
});

const BACKLOG = [
  'Renew passport',
  'Book dentist',
  'Finish the slide deck',
  'Call mum',
  'Fix the leaking tap',
  'Water the plants',
  'Taxes. The taxes.',
  'Learn to make börek',
  'Cancel the gym I never visit',
  'Back up the laptop',
  'Buy a birthday present',
  'Read one chapter',
];

const scenes = [
  { file: '01-hello', state: null },
  {
    file: '02-note',
    state: state({
      fish: 3,
      todos: [
        task('Buy fish (the real kind)'),
        task('Reply to Deniz about the flat'),
        task('Stretch for 5 minutes', { done: true }),
      ],
    }),
  },
  {
    file: '03-worried',
    state: state({
      fish: 2,
      todos: [...BACKLOG.slice(0, 6).map((t) => task(t)), task('Return the parcel', { done: true })],
    }),
  },
  { file: '04-panic', state: state({ fish: 9, todos: BACKLOG.map((t) => task(t)) }) },
  {
    file: '05-nagging',
    state: state({
      fish: 4,
      todos: [
        task('Fix the leaking tap', { createdAt: now - 6 * DAY }),
        task('Water the plants'),
        task('Buy stamps'),
      ],
    }),
  },
  {
    file: '06-alldone',
    state: state({
      fish: 12,
      todos: [
        task('Renew passport', { done: true }),
        task('Book dentist', { done: true }),
        task('Water the plants', { done: true }),
      ],
    }),
  },
  {
    // Ticked mid-run so Pingu is caught cheering: eyes shut, flippers up, mid-hop.
    file: '07-cheering',
    state: state({
      fish: 5,
      todos: [task('Ship the Pingu app'), task('Water the plants'), task('Buy stamps')],
    }),
    async act(page) {
      await page.getByRole('checkbox', { name: 'Ship the Pingu app' }).click();
      await page.waitForTimeout(400);
    },
  },
];

const browser = await chromium.launch(
  process.env.PINGU_CHROME ? { executablePath: process.env.PINGU_CHROME } : {}
);
for (const scene of scenes) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  if (scene.state) {
    await context.addInitScript((s) => {
      window.localStorage.setItem('pingu.state.v1', s);
    }, JSON.stringify(scene.state));
  }
  const page = await context.newPage();
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  if (scene.act) await scene.act(page);
  await page.screenshot({ path: `${OUT}/${scene.file}.png` });
  console.log('shot', scene.file);
  await context.close();
}
await browser.close();
server.close();
