import { spawnSync } from 'node:child_process';
for (const file of ['server.mjs', 'src/game.js', 'src/render.js', 'src/audio.js', 'src/main.js']) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log('All JavaScript syntax checks passed.');
