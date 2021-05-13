import app from './app.mjs';

import minimist from 'minimist';

var argv = minimist(process.argv.slice(2));

async function main() {
  const deps = await import('./app.mjs');
  switch ( argv.cmd ) {
  case 'analysis':
    await app('cmd.analysis').call(argv);
    break;
  case 'fetch-car-licenses':
    await app('cmd.fetch-car-licenses').call();
    break;
  case 'fetch-city-information':
    await app('cmd.fetch-city-information').call();
    break;
  case 'fetch-locations':
    await app('cmd.fetch-locations').call(argv);
    break;
  case 'fetch-mayors':
    await app('cmd.fetch-mayors').call();
    break;
  case 'generate-extracts':
    await app('cmd.generate-extracts').call(argv);
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
