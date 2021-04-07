import app from './app.mjs';

import minimist from 'minimist';

var argv = minimist(process.argv.slice(2));

async function main() {
  const deps = await import('./app.mjs');
  switch ( argv.cmd ) {
  case 'fetch-locations':
    await app('cmd.fetch-locations').call();
    break;
  case 'analysis':
    await app('cmd.analysis').call();
    break;
  }
}

main();
