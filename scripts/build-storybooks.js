import { spawn } from 'child_process';
import { promisify } from 'util';
import { readdir as readdirRaw, writeFile as writeFileRaw, readFileSync, existsSync } from 'fs';
import { join } from 'path';

import { getDeployables } from './utils/list-examples';
import { filterDataForCurrentCircleCINode } from './utils/concurrency';

const readdir = promisify(readdirRaw);
const writeFile = promisify(writeFileRaw);

const p = (l) => join(__dirname, '..', ...l);
const logger = console;

const exec = async (command, args = [], options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { ...options, stdio: 'inherit', shell: true });

    child
      .on('close', (code) => {
        if (code) {
          reject();
        } else {
          resolve();
        }
      })
      .on('error', (e) => {
        logger.error(e);
        reject();
      });
  });

const hasBuildScript = (l) => {
  const text = readFileSync(l, 'utf8');
  const json = JSON.parse(text);

  return !!json.scripts['build-storybook'];
};

const createContent = (deployables) => `
    <style>
      body {
        background: black;
        color: white;
      }
      #frame {
        position: absolute;
        left: 0;
        right: 0;
        width: 100vw;
        height: calc(100vh - 30px);
        bottom: 0;
        top: 30px;
        border: 0 none;
        margin: 0;
        padding: 0;
      }
      #select {
        position: absolute;
        top: 0;
        right: 100px;
        left: 10px;
        height: 30px;
        width: calc(100vw - 120px);
        background: black;
        color: white;
        border: 0 none;
        border-radius: 0;
        padding: 10px;
        box-sizing: border-box;
      }
      #open {
        position: absolute;
        top: 0;
        right: 0;
        width: 100px;
        height: 30px;
        background: black;
        color: white;
        border: 0 none;
        border-radius: 0;
        padding: 10px;
        box-sizing: border-box;
      }
    </style>

    <script>
      function handleClick() {
        var value = document.getElementById("select").value;
        window.location = document.location.origin + value;
      }
      function handleSelect() {
        var value = document.getElementById("select").value;
        var frame = document.getElementById("frame");

        sessionStorage.clear();
        localStorage.clear();

        frame.setAttribute('src', value);
      }
    </script>

    <button id="open" onclick="handleClick()">open</button>

    <select id="select" onchange="handleSelect()">
      ${deployables.map((i) => `<option value="/${i}/">${i}</option>`).join('\n')}
    </select>

    <iframe id="frame" src="/${deployables[0]}/" />
  `;

const handleExamples = async (deployables) => {
  await deployables.reduce(async (acc, d) => {
    await acc;

    logger.log('');
    logger.log(`-----------------${Array(d.length).fill('-').join('')}`);
    logger.log(`▶️  building: ${d}`);
    logger.log(`-----------------${Array(d.length).fill('-').join('')}`);
    const out = p(['built-storybooks', d]);
    const cwd = p(['examples', d]);

    if (existsSync(join(cwd, 'yarn.lock'))) {
      await exec(`yarn`, [`install`], { cwd });
    }

    await exec(`yarn`, [`build-storybook`, `--output-dir=${out}`, '--quiet'], { cwd });
    await exec(`npx`, [`sb`, 'extract', out, `${out}/stories.json`], { cwd });

    logger.log('-------');
    logger.log(`✅ ${d} built`);
    logger.log('-------');
  }, Promise.resolve());
};

const run = async () => {
  const list = getDeployables(await readdir(p(['examples'])), hasBuildScript);
  const deployables = filterDataForCurrentCircleCINode(list);

  if (deployables.length) {
    logger.log(`🏗 Will build Storybook for: ${deployables.join(', ')}`);
    await handleExamples(deployables);
  }

  if (
    deployables.length &&
    (process.env.CIRCLE_NODE_INDEX === undefined ||
      process.env.CIRCLE_NODE_INDEX === '0' ||
      process.env.CIRCLE_NODE_INDEX === 0)
  ) {
    const indexLocation = p(['built-storybooks', 'index.html']);
    logger.log('');
    logger.log(`📑 creating index at: ${indexLocation}`);
    logger.log('');
    await writeFile(indexLocation, createContent(deployables));

    logger.log('-------');
    logger.log('✅ done');
    logger.log('-------');
  }
};

run().catch((e) => {
  logger.error(e);
  process.exit(1);
});
