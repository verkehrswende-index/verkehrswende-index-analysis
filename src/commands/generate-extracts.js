import { DOMParser } from "xmldom";
import { promisify } from "util";
import { dirname } from "path";
import fs from "fs";
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);

/**
 * Generates city extracts of OSM data.
 */
export default class GenerateExtracts {
  constructor(areas, osmium, store, nameToSlug) {
    this.areas = areas;
    this.osmium = osmium;
    this.store = store;
    this.nameToSlug = nameToSlug;
  }

  /**
   * Returns path to the raw extract data.
   *
   * @param {string} date - The date of the extract, e.g. "200101".
   * @param {string} extract - The extract to use, e.g. "germany" or
   * "france/ile-de-france".
   */
  getDataPath(date, extract = "germany") {
    return `data/raw/osm/${extract}-${date}.osm.pbf`;
  }

  /**
   * Runs the command.
   *
   * @param {Object} params - Command parameters.
   * @param {string[]} [params.areas] - Areas to consider.
   * @param {string} params.extractDate - Date of the extract to use.
   */
  async call(params) {
    const areas = await this.areas.getAll();
    for (const area of areas) {
      if (params.areas && !params.areas.includes(area.getSlug())) {
        continue;
      }
      console.log(area.getSlug());
      const extractPath = `data/cache/osm/extracts/${
        params.extractDate
      }/${area.getSlug()}.osm.pbf`;
      if (await exists(extractPath)) {
        console.log("extract already exists:", extractPath);
        continue;
      }
      console.log("create", extractPath);
      const dataPath = this.getDataPath(params.extractDate, area.extract);
      const boundaryPath = `data/cache/osm/boundaries/${
        params.extractDate
      }/${area.getSlug()}.osm.pbf`;
      await mkdir(dirname(boundaryPath), { recursive: true });
      await this.osmium.exec(
        `getid -O -r -t ${dataPath} r${area.id} -o ${boundaryPath}`.split(" ")
      );
      await mkdir(dirname(extractPath), { recursive: true });
      await this.osmium.exec(
        `extract -O -p ${boundaryPath} ${dataPath} -o ${extractPath}`.split(" ")
      );
    }
  }
}
