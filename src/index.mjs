import app from './app.mjs';

import minimist from 'minimist';

function fail(msg, suggestHelp=true) {
  console.error(msg);
  if (suggestHelp) {
    console.error(`Try '--help' for more information.`);
  }
  process.exit(1);
}

function printHelpAndExit() {
  console.log(`
Options:
      --cmd=COMMAND                execute COMMAND
      --extractDate=EXTRACT_DATE   date of extracts to use
      --help                       display this help and exit

COMMAND is one of the available commands:
  analysis
  fetch-car-licenses
  fetch-city-information
  fetch-locations         extracts node tags for all cities to consider from OSM
                          extracts and writes them to data/area.json. Requires
                          --extractDate
  fetch-mayors
  generate-extracts       generates city extracts of OSM data. Requires
                          --extractDate
  generate-index
  write-area-configs

EXTRACT_DATE is specified as yymmdd, e.g. 200101
`);
  process.exit();
}

var argv = minimist(
  process.argv.slice(2),
  {
    string: [
      "extractDate",
      "cmd",
    ],
    boolean: [
      "help",
    ],
    unknown: (param) => {
      fail(`Unrecognized option '${param}'`);
    }
  }
);

async function main() {
  const deps = await import('./app.mjs');
  if ( argv.help || ! argv.cmd ) {
    printHelpAndExit();
  }
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
    if (! argv.extractDate) {
      fail(`Missing --extractDate option`);
    }
    await app('cmd.fetch-locations').call({
      extractDate: argv.extractDate,
    });
    break;
  case 'fetch-mayors':
    await app('cmd.fetch-mayors').call();
    break;
  case 'generate-extracts':
    if (! argv.extractDate) {
      fail(`Missing --extractDate option`);
    }
    await app('cmd.generate-extracts').call({
      extractDate: argv.extractDate,
    });
    break;
  case 'generate-index':
    await app('cmd.generate-index').call();
    break;
  case 'write-area-configs':
    await app('cmd.write-area-configs').call();
    break;
  default:
    fail(`Unrecognized command '${argv.cmd}'`);
  }
}

main();
