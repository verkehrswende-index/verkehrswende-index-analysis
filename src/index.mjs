import app from './app.mjs';

import minimist from 'minimist';

var argv = minimist(process.argv.slice(2));

async function main() {
  const deps = await import('./app.mjs');
  switch ( argv.cmd ) {
  case 'analysis':
    await app('cmd.analysis').call();
    break;
  case 'fetch-locations':
    await app('cmd.fetch-locations').call();
    break;
  case 'generate-index':
    await app('cmd.generate-index').call();
    break;
  case 'write-area-configs':
    await app('cmd.write-area-configs').call();
    break;
  }
}

main();
