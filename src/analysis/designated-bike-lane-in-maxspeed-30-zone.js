import geojsonLength from "geojson-length";

const zoneFilter = [
  {
    tag: "maxspeed:type",
    valueRegexp: "^DE:zone(20|30)$",
  },
];

// const designatedBicycleFilter = [
//   {
//     tag: "bicycle",
//     value: "useSidepath",
//   },
// ];

const filterConfigs = {
  zoneFilter,
  // designatedBicycleFilter,
};

export { filterConfigs };

/**
 *
 */
export default class DesignatedBikeLaneInMaxspeed30Zone {
  constructor(osmium, filter, store) {
    this.osmium = osmium;
    this.filter = filter;
    this.store = store;
  }

  /**
   * Returns base path of the analysis data for the given area and extract date.
   *
   * @param {Object} area - The area.
   * @param {string} date - The date of the extract, e.g. "200101"
   * "france/ile-de-france".
   */
  getBasePath(area, date) {
    return `areas/${area.getSlug()}/analysis/designated_bike_lane_in_maxspeed_30_zone/${date}/`;
  }

  /**
   * Refreshes the analysis data.
   *
   * @param {string} area - The area slug.
   * @param {Object} params - Command parameters.
   * @param {string} params.extractDate - Date of the extract to use.
   */
  async refresh(area, params) {
    var data = await this.osmium.query(
      area.getSlug(),
      "w/bicycle=use_sidepath",
      {
        extractDate: params.extractDate,
      }
    );
    await this.store.write(
      this.getBasePath(area, params.extractDate) + `/features.json`,
      data
    );
    console.log("data refreshed");
  }

  /**
   * Calculates and writes scores.
   *
   * @param {string} area - The area slug.
   * @param {Object} params - Command parameters.
   * @param {string} params.extractDate - Date of the extract to use.
   */
  async start(area, params) {
    var data = await this.store.read(
      this.getBasePath(area, params.extractDate) + `/features.json`
    );
    var processed = this.process(area, data);
    await this.store.write(
      this.getBasePath(area, params.extractDate) + `/features.json`,
      processed.features
    );
    await this.store.write(
      this.getBasePath(area, params.extractDate) + `/results.json`,
      processed.results
    );
  }

  process(area, data) {
    var results = {};
    var fullLength = 0;
    var scoredLength = 0;
    for (const i in data.features) {
      const feature = data.features[i];
      const length = geojsonLength(feature.geometry);
      const score = this.filter.match(feature, zoneFilter) ? 0 : 1;
      fullLength += length;
      scoredLength += score * length;
      feature.properties.length = length;
      feature.properties.score = score;
      data.features[i] = feature;
    }
    results.score = scoredLength / fullLength;
    return {
      features: data,
      results,
    };
  }
}
