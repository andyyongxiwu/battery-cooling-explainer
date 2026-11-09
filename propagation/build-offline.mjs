import {readFile, writeFile} from 'node:fs/promises';

const directory = new URL('./', import.meta.url);
const [html, css, lab, solver, worker, suite] = await Promise.all(
  ['index.html', 'lab.css', 'lab.mjs', 'solver.mjs', 'worker.mjs', '../suite.css']
    .map(file => readFile(new URL(file, directory), 'utf8')),
);

let inlineSuite = suite;
for (const filename of ['Lato-Regular.ttf', 'Lato-Bold.ttf']) {
  const font = await readFile(new URL('../assets/' + filename, directory));
  inlineSuite = inlineSuite.replace('./assets/' + filename, 'data:font/ttf;base64,' + font.toString('base64'));
}

const core = solver.replace(/^export /gm, '');
const workerCode = core + '\n' + worker.replace(/^import .*\r?\n/, '');
const entry = lab.replace(/^import .*\r?\n/, '');
const hostedWorker = /function createWorker\(\) \{[\s\S]*?\n\}/;
if (!hostedWorker.test(entry)) throw new Error('Could not find the hosted Worker entry.');
const browserCode = entry.replace(hostedWorker, () => `let offlineWorkerUrl;
function createWorker() {
  offlineWorkerUrl ??= URL.createObjectURL(new Blob([${JSON.stringify(workerCode)}], {type: 'text/javascript'}));
  return new Worker(offlineWorkerUrl);
}`);
const offline = html
  .replace('<link rel="stylesheet" href="../suite.css">', () => `<style>${inlineSuite}</style>`)
  .replace('<link rel="stylesheet" href="./lab.css">', () => `<style>${css}</style>`)
  .replaceAll('href="../cooling/"', 'href="https://andyyongxiwu.github.io/battery-cooling-explainer/cooling/"')
  .replaceAll('href="./model-audit.md"', 'href="https://andyyongxiwu.github.io/battery-cooling-explainer/propagation/model-audit.md"')
  .replaceAll('href="./"', 'href="#"')
  .replaceAll('href="../"', 'href="https://andyyongxiwu.github.io/battery-cooling-explainer/"')
  .replace('<script type="module" src="./lab.mjs"></script>',
    () => `<script>(() => {\n'use strict';\n${core}\n${browserCode}\n})();</script>`);
await writeFile(new URL('../../Propagation Lab.html', directory), offline);
