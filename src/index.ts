import app from "./app.js";

import minimist from "minimist";

function fail(msg, suggestHelp = true) {
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
      --help                       display this help and exit

      --analysis=ANALYSIS          analysis to start
      --areas=AREAS                areas to consider, AREAS is a comma
                                   seperated list of area slugs
      --extractDate=EXTRACT_DATE   date of extracts to use
      --use-cache                  use cache for some expensive operations

COMMAND is one of the available commands:
  analysis                runs analysis. Requires --analysis
  fetch-car-licenses
  fetch-city-information
  fetch-locations         extracts node tags for all cities to consider from OSM
                          extracts and writes them to data/area.json. Requires
                          --extractDate
  fetch-mayors
  generate-extracts       generates city extracts of OSM data. Requires
                          --extractDate
  generate-index
  write-area-configs      writes each area config to data/areas

EXTRACT_DATE is specified as yymmdd, e.g. 200101
`);
  process.exit();
}

var argv = minimist(process.argv.slice(2), {
  string: ["analysis", "areas", "cmd", "extractDate"],
  boolean: ["help", "use-cache"],
  unknown: (param) => {
    fail(`Unrecognized option '${param}'`);
  },
});

async function main() {
  if (argv.help || !argv.cmd) {
    printHelpAndExit();
  }
  switch (argv.cmd) {
    case "analysis":
      if (!argv.analysis) {
        fail(`Missing --analysis option`);
      }
      await app("cmd.analysis").call({
        analysis: argv.analysis,
        areas: argv.areas ? argv.areas.split(",") : null,
        extractDate: argv.extractDate,
        useCache: argv["use-cache"] ? true : false,
      });
      break;
    case "fetch-car-licenses":
      await app("cmd.fetch-car-licenses").call();
      break;
    case "fetch-city-information":
      await app("cmd.fetch-city-information").call();
      break;
    case "fetch-locations":
      if (!argv.extractDate) {
        fail(`Missing --extractDate option`);
      }
      await app("cmd.fetch-locations").call({
        extractDate: argv.extractDate,
      });
      break;
    case "fetch-mayors":
      await app("cmd.fetch-mayors").call();
      break;
    case "generate-extracts":
      if (!argv.extractDate) {
        fail(`Missing --extractDate option`);
      }
      await app("cmd.generate-extracts").call({
        areas: argv.areas ? argv.areas.split(",") : null,
        extractDate: argv.extractDate,
      });
      break;
    case "generate-index":
      await app("cmd.generate-index").call();
      break;
    case "write-area-configs":
      await app("cmd.write-area-configs").call();
      break;
    default:
      fail(`Unrecognized command '${argv.cmd}'`);
  }
}

main();
