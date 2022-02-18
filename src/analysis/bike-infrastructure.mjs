// TODO cycleway opposite beachten! https://www.openstreetmap.org/way/24281756
// TODO wege außerhalb stadtgrenzen nicht mitzählen
// TODO müsste nicht weg mit geteiltem radweg auch zu autos gezählt werden?
// TODO https://www.openstreetmap.org/way/111565212#map=15/51.9512/7.7172 motorcar=destination, motorcycle=destination wird noch nicht beachtet
import geojsonLength from "geojson-length";

const cycleLaneFilter = [
  {
    tag: "highway",
    value: "cycleway",
  },
  {
    tagRegexp: "^cycleway:?",
    valueRegexp: "^(lane:exclusive|track)$",
  },
];

const oppositeCycleWayFilter = [
  {
    tagRegexp: "^cycleway:?",
    valueRegexp: "^(opposite_track)$",
  },
];

const pathFilter = [
  {
    tag: "highway",
    value: "path",
  },
];

const designatedBicycleFilter = [
  {
    tag: "bicycle",
    valueRegexp: "^(yes|designated)$",
  },
];

const designatedCycleWayOnPathFilter = [
  {
    and: [pathFilter, designatedBicycleFilter],
  },
];

const miscCycleWaysFilter = [
  {
    tagRegexp: "^cycleway:?",
    valueRegexp: "^(lane|opposite_lane|share_busway)$",
  },
];

const filterConfigs = {
  bicycleRoad: [
    {
      tag: "bicycle_road",
      value: "yes",
    },
  ],
  cycleWay: [].concat(
    cycleLaneFilter,
    oppositeCycleWayFilter,
    designatedCycleWayOnPathFilter,
    miscCycleWaysFilter,
    [
      {
        tag: "highway",
        value: "path",
      },
    ]
  ),
};

export { filterConfigs };

/**
 * Analysis of the bike infrastructure.
 */
export default class BikeInfrastructure {
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
    return `areas/${area.getSlug()}/analysis/bike_infrastructure/${date}/`;
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
      "w/highway=unclassified,cycleway,path,tertiary,secondary,primary,trunk,motorway,living_street,residential",
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

  /**
   * Calculates the surface factor for the given feature.
   */
  getSurfaceFactor(feature) {
    var factor = 1;
    if (
      this.filter.match(feature, [
        {
          tag: "surface",
          valueRegexp:
            "^(gravel|concrete:lanes|concrete:plates|paving_stones|compacted|fine_gravel)$",
        },
      ])
    ) {
      factor = 0.7;
    } else if (
      this.filter.match(feature, [
        {
          tag: "surface",
          value: "sett",
        },
      ])
    ) {
      factor = 0.5;
    } else if (
      this.filter.match(feature, [
        {
          tag: "surface",
          valueRegexp: "cobblestone$",
        },
        {
          tag: "surface",
          valueRegexp:
            "^(metal|wood|unpaved|gravel|pebblestone|ground|earth|dirt|grass|grass_paver|mud|sand|woodchips)$",
        },
      ])
    ) {
      factor = 0.25;
    }
    return factor;
  }

  /**
   * Calculates the general way factor for the given feature.
   */
  getWayFactor(area, feature) {
    var factor = 1;

    const niceSpeedLimit =
      area.country === "UK"
        ? "^([1]?[0-9]|20)(?: mph)?$"
        : "^([1-2]?[0-9]|30)$";

    if (this.filter.match(feature, filterConfigs.bicycleRoad)) {
      if (this.filter.match(feature, [{ tag: "motor_vehicle", value: "no" }])) {
        factor = 1;
      } else {
        factor = 0.75;
      }
    } else if (
      !this.filter.match(feature, [
        {
          tag: "access",
          value: "yes",
        },
        {
          tag: "access",
          value: null,
        },
      ])
    ) {
      factor = 0;
    } else if (this.filter.match(feature, cycleLaneFilter)) {
      factor = 1;
    } else if (this.filter.match(feature, oppositeCycleWayFilter)) {
      factor = 0.9;
    } else if (this.filter.match(feature, pathFilter)) {
      if (this.filter.match(feature, designatedBicycleFilter)) {
        factor = 1;
      } else {
        factor = 0;
      }
    } else if (this.filter.match(feature, miscCycleWaysFilter)) {
      if (
        this.filter.match(feature, [
          {
            tag: "maxspeed",
            valueRegexp: niceSpeedLimit,
          },
        ])
      ) {
        factor = 0.8;
      } else {
        factor = 0.7;
      }
    } else if (
      this.filter.match(feature, [
        {
          tag: "maxspeed",
          valueRegexp: niceSpeedLimit,
        },
        {
          tag: "highway",
          value: "residential",
        },
        {
          tag: "highway",
          value: "living_street",
        },
        // way["maxspeed"](if:t["maxspeed"]<=30);
      ])
    ) {
      factor = 0.5;
    } else if (
      this.filter.match(feature, [
        {
          tag: "highway",
          valueRegexp: "^(?!path).*$",
        },
      ])
    ) {
      factor = 0.1;
    } else {
      factor = 0;
    }
    return factor;
  }

  process(area, data) {
    var results = {};
    var fullLength = 0;
    var scoredLength = 0;
    var goodLength = 0;
    var acceptableLength = 0;
    var badLength = 0;
    for (const i in data.features) {
      var score = 0;
      const feature = data.features[i];
      var length = geojsonLength(feature.geometry);
      score = this.getSurfaceFactor(feature) * this.getWayFactor(area, feature);
      // console.log( feature, score );
      // if ( feature.id === 'way/80868441' ) {
      //   console.log( feature, score );
      // }
      fullLength += length;
      if (score > 0) {
        if (score >= 0.75) {
          goodLength += length;
        } else if (score >= 0.5) {
          acceptableLength += length;
        } else {
          badLength += length;
        }
        scoredLength += score * length;
      }
      feature.properties.length = length;
      feature.properties.score = score;
      feature.properties.surfaceFactor = this.getSurfaceFactor(feature);
      feature.properties.wayFactor = this.getWayFactor(area, feature);
      data.features[i] = feature;
    }
    results.score = scoredLength / fullLength;
    results.good = goodLength;
    results.bad = badLength;
    results.acceptable = acceptableLength;
    return {
      features: data,
      results,
    };
  }
}
