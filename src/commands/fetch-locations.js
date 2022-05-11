import { DOMParser } from "xmldom";

/**
 * Extracts node tags for all cities to consider from OSM extracts and writes
 * them to data/area.json
 */
export default class FetchLocations {
  constructor(osmium, store, nameToSlug) {
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
   * Returns city relations using osmium.
   *
   * @param {string} params - The osmium command line parameters to use to extract the relations.
   */
  async getCityRelations(params) {
    var cities = await this.osmium.exec(params.split(" "));
    cities = new DOMParser().parseFromString(cities, "text/xml");
    return cities.documentElement.getElementsByTagName("relation");
  }

  /**
   * Runs the command.
   *
   * @param {Object} params - Command parameters.
   * @param {string} params.extractDate - Date of the extract to use.
   */
  async call(params) {
    const extracts = {
      "germany/oberbayern": `getid -f osm ${this.getDataPath(
        params.extractDate,
        "germany/oberbayern"
      )} r62428`, // Munich
      germany: `tags-filter -f osm -R ${this.getDataPath(
        params.extractDate
      )} r/de:place=city,town`,
      denmark: `getid -f osm ${this.getDataPath(
        params.extractDate,
        "denmark"
      )} r2192363`, // Kopenhagen
      "france/ile-de-france": `getid -f osm ${this.getDataPath(
        params.extractDate,
        "france/ile-de-france"
      )} r1641193`, // Paris
    };

    var areas = [];
    var seenAreas = {};
    for (const extract in extracts) {
      const relations = await this.getCityRelations(extracts[extract]);
      for (let i = 0; i < relations.length; i++) {
        let area = {
          extract,
          id: relations[i].getAttribute("id"),
        };
        const tags = relations[i].getElementsByTagName("tag");
        for (let i = 0; i < tags.length; i++) {
          area[tags[i].getAttribute("k")] = tags[i].getAttribute("v");
        }
        const slug = this.nameToSlug.getSlug(area.name);
        if (slug in seenAreas) {
          console.log("Duplicate area slug, ignoring:", slug);
          continue;
        }
        areas.push(area);
        seenAreas[slug] = true;
      }
    }
    await this.store.write(`areas.json`, areas);
  }
}
