// TODO cycleway opposite beachten! https://www.openstreetmap.org/way/24281756
// TODO wege außerhalb stadtgrenzen nicht mitzählen
// TODO müsste nicht weg mit geteiltem radweg auch zu autos gezählt werden?

class BikeInfrastructure {
  constructor(osmium, filter, store) {
    this.osmium = osmium;
    this.filter = filter;
    this.store = store;
  }

  getBasePath(area) {
    return `areas/${area.getSlug()}/analysis/bike_infrastructure`;
  }

  async refresh(area,timeSpan) {
    var data = await this.osmium.query(
      area.getSlug(),
      'w/highway=unclassified,cycleway,path,tertiary,secondary,primary,trunk,motorway,living_street,residential',
      {
        timeSpan: timeSpan,
      }
    );
    this.store.write(this.getBasePath(area) + `/features${timeSpan ? `.${timeSpan}` : ''}.json`, data);
    console.log('data refreshed');
  }

  async start(area,timeSpan) {
    var data = this.store.read(this.getBasePath(area) + `/features${timeSpan ? `.${timeSpan}` : ''}.json`);
    var processed = this.process(area, data);
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
  getWayFactor(area, feature) {
    var factor = 1;

    const niceSpeedLimit = area.country === 'UK' ?
          "^([1]?[0-9]|20)(?: mph)?$" : "^([1-2]?[0-9]|30)$";

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
    } else if (! this.filter.match(
      feature,
      [
        {
          tag: "access",
          value: "yes",
        },
        {
          tag: "access",
          value: null,
        },
      ] ) ) {
      factor = 0;
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
            valueRegexp: niceSpeedLimit,
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

  process(area, data) {
    var results = {};
    const geojsonLength = require('geojson-length');
    var fullLength = 0;
    var scoredLength = 0;
    var goodLength = 0;
    var acceptableLength = 0;
    var badLength = 0;
    for( const i in data.features ) {
      var score = 0;
      const feature = data.features[i];
      var length = geojsonLength(feature.geometry);
      score = this.getSurfaceFactor(feature)
        * this.getWayFactor(area, feature);
      // console.log( feature, score );
      // if ( feature.id === 'way/80868441' ) {
      //   console.log( feature, score );
      // }
      fullLength += length;
      if ( score > 0 ) {
        if ( score >= 0.75 ) {
          goodLength += length;
        } else if ( score >= 0.5 ) {
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
    results.score = scoredLength/fullLength;
    results.good = goodLength;
    results.bad = badLength;
    results.acceptable = acceptableLength;
    return {
      features: data,
      results,
    };
  }
};

module.exports = BikeInfrastructure;
