import osmtogeojson from "osmtogeojson";
import polygonCenter from "geojson-polygon-center";
import { spawnSync } from "child_process";
import xmlParser from "./parse-osmxml.js";

export default class Osmium {
  constructor() {}

  /**
   * Runs a query.
   *
   * @param {string} area - Area slug.
   * @param {string} query - The query to execute.
   * @param {Object} args - Query arguments.
   * @param {bool} args.centerPoint
   * @param {string} args.extractDate - Date of the extract to use.
   * @returs {Object} A GeoJSON object.
   */
  async query(area, query, args = {}) {
    var spanInfix = "";
    const out = await this.exec(
      `tags-filter -t -f osm data/cache/osm/extracts/${args.extractDate}/${area}.osm.pbf ${query}`.split(
        " "
      )
    );
    console.log(out.length, "out");
    const parsed = xmlParser.parseFromString(out);
    console.log("parsed");
    var geojson = osmtogeojson(parsed);
    console.log("converted to json");
    if (args.centerPoint) {
      geojson.features = geojson.features
        .map((feature) => {
          if (feature.geometry.type === "Polygon") {
            feature.geometry = polygonCenter(feature.geometry);
          } else if (feature.geometry.type !== "Point") {
            console.log("not a point or polygon:", feature);
            return undefined;
          }
          return feature;
        })
        .filter((x) => x !== undefined);
      console.log("mapped features");
    }
    console.log("#features", geojson.features.length);
    return geojson;
  }

  async exec(args) {
    var data = null;
    const command = "osmium";
    console.log(command, args.join(" "));
    var data = spawnSync(command, args, { maxBuffer: 1 * 1024 * 1024 * 1024 });
    if (data.error) {
      throw Error(data.error);
    }
    if (data.status !== 0) {
      throw Error(
        `Osmium (${args.join(" ")}) failed: ` + data.status + ": " + data.stderr
      );
    }
    console.log("finished osmium command");
    return data.stdout.toString();
  }
}
