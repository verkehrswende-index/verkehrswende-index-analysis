// TODO cycleway opposite beachten! https://www.openstreetmap.org/way/24281756

class BikeInfrastructure {
  constructor( overpass, filter, store ) {
    this.overpass = overpass;
    this.filter = filter;
    this.store = store;
  }

  getBasePath(area) {
    return `areas/${area.getSlug()}/analysis/bike_infrastructure`;
  }

  async refresh(area,timeSpan) {
    const all_ways = [
      {
        tag: "highway",
        valueRegexp: "^(unclassified|cycleway|residential|living_street|motorway|trunk|primary|secondary|tertiary|path)$",
      },
    ];
    const query = `
(
${this.filter.toQuery(all_ways,area.id)}
);
out body;
>;
out skel qt;
`;
    var data = await this.overpass.query( query, { timeSpan: timeSpan } );
    console.log('data fetched, processing');
    const osmtogeojson = require( 'osmtogeojson' );
    this.store.write(this.getBasePath(area) + `/features${timeSpan ? `.${timeSpan}` : ''}.json`, osmtogeojson(data));
  }

  async start(area,timeSpan) {
    var data = this.store.read(this.getBasePath(area) + `/features${timeSpan ? `.${timeSpan}` : ''}.json`);
    var processed = this.process(data);
    this.store.write(this.getBasePath(area) + `/features${timeSpan ? `.${timeSpan}` : ''}.json`, processed.features);
    this.store.write(this.getBasePath(area) + `/results${timeSpan ? `.${timeSpan}` : ''}.json`, processed.results);
  };

  /**
   * Calculates the surface factor for the given feature.
   */
  getSurfaceFactor(feature) {
    var factor = 1;
    if ( this.filter.match(
      feature,
      [
        {
          tag: "surface",
          valueRegexp: "^(gravel|concrete:lanes|concrete:plates|paving_stones|compacted|fine_gravel)$",
        },
      ] ) ) {
      factor = 0.7;
    } else if ( this.filter.match(
      feature,
      [
        {
          tag: "surface",
          value: "sett",
        },
      ] ) ) {
      factor = 0.5;
    } else if ( this.filter.match(
      feature,
      [
        {
          tag: "surface",
          valueRegexp: "cobblestone$",
        },
        {
          tag: "surface",
          valueRegexp: "^(metal|wood|unpaved|gravel|pebblestone|ground|earth|dirt|grass|grass_paver|mud|sand|woodchips)$",
        },
      ] ) ) {
      factor = 0.25;
    }
    return factor;
  }

  /**
   * Calculates the general way factor for the given feature.
   */
  getWayFactor(feature) {
    var factor = 1;
    if (this.filter.match(
      feature,
      [
        {
          tag: "bicycle_road",
          value: "yes",
        },
      ] ) ) {
      if (this.filter.match(feature, [{tag: "motor_vehicle", value: "no"}])) {
        factor = 1;
      } else {
        factor = 0.75;
      }
    } else if (this.filter.match(
      feature,
      [
        {
          tag: "highway",
          value: "cycleway",
        },
        {
          tagRegexp: "^cycleway:?",
          valueRegexp: "^(lane:exclusive|track)$",
        },
      ] ) ) {
      factor = 1;
    } else if (this.filter.match(
      feature,
      [
        {
          tagRegexp: "^cycleway:?",
          valueRegexp: "^(opposite_track)$",
        },
      ] ) ) {
      factor = 0.9;
    } else if (this.filter.match(
      feature,
      [
        {
          tag: "highway",
          value: "path",
        },
      ] ) ) {
      if ( this.filter.match(
        feature,
        [
          {
            tag: "bicycle",
            valueRegexp: "^(yes|designated)$",
          },
        ])) {
        factor = 1;
      } else {
        factor = 0;
      }
    } else if (this.filter.match(
      feature,
      [
        {
          tagRegexp: "^cycleway:?",
          valueRegexp: "^(lane|opposite_lane|share_busway)$",
        },
      ])) {
      if ( this.filter.match(
        feature,
        [
          {
            tag: "maxspeed",
            valueRegexp: "^([1-3]?[0-9])$",
          },
        ])) {
        factor = 0.8;
      } else {
        factor = 0.7;
      }
    } else if ( this.filter.match(
      feature,
      [
        {
          tag: "maxspeed",
          valueRegexp: "^([1-3]?[0-9])$",
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
      ])) {
      factor = 0.5;
    } else if ( this.filter.match(
      feature,
      [
        {
          tag: "highway",
          valueRegexp: "^(?!path).*$",
        },
      ])) {
      factor = 0.1;
    } else {
      factor = 0;
    }
    return factor;
  }

  process(data) {
    var results = {};
    const geojsonLength = require('geojson-length');
    var fullLength = 0;
    var goodLength = 0;
    for( const i in data.features ) {
      var score = 0;
      const feature = data.features[i];
      var length = geojsonLength(feature.geometry);
      score = this.getSurfaceFactor(feature)
        * this.getWayFactor(feature);
      if ( score === 0 ) {
        // ignore this way
        continue;
      }
      fullLength += length;
      goodLength += score * length;
      feature.properties.length = length;
      feature.properties.score = score;
      feature.properties.surfaceFactor = this.getSurfaceFactor(feature);
      feature.properties.wayFactor = this.getWayFactor(feature);
      data.features[i] = feature;
    }
    results.score = goodLength/fullLength;
    return {
      features: data,
      results,
    };
  }
};

module.exports = BikeInfrastructure;
