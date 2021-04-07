class BikeInfrastructure {
  constructor( overpass, filter ) {
    this.overpass = overpass;
    this.filter = filter;

    this.car_ways = [
      {
        tag: "highway",
        valueRegexp: "^(?!path).*$",
      },
    ];

    this.acceptable_ways = [
      {
        tag: "maxspeed",
        valueRegexp: "^([1-3]?[0-9])$",
      },
      // way["maxspeed"](if:t["maxspeed"]<=30);
    ];

    this.bicycle_ways = [
      {
        tag: "bicycle_road",
        value: "yes",
      },
      {
        tag: "highway",
        value: "cycleway",
      },
      {
        tagRegexp: "^cycleway:?",
        valueRegexp: "^(lane:exclusive|lane|track|opposite_lane|opposite_track|share_busway)$",
      },
      {
        tag: "bicycle",
        valueRegexp: "^(designated)$",
      },
      // way["maxspeed"](if:t["maxspeed"]<=30);
    ];
  }

  async start(area) {
    const all_ways = [
      {
        tag: "highway",
        // valueRegexp: "^(unclassified|cycleway|residential|living_street|motorway|trunk|primary|secondary|tertiary|footway|path)$",
        valueRegexp: "^(unclassified|cycleway|residential|living_street|motorway|trunk|primary|secondary|tertiary|path)$",
      },
    ];

    // [diff:"2012-09-14T15:00:00Z","2012-09-21T15:00:00Z"]
    // area[name~"^(Frankfurt|Offenbach) am Main$"]->.offenbach;
    const query = `
area[name="${area.name}"]->.offenbach;
(
${this.filter.toQuery(all_ways)}
);
out body;
>;
out skel qt;
`;

    var data = await this.overpass.query( query );
    console.log('data fetched, processing');
    const osmtogeojson = require( 'osmtogeojson' );
    return this.process(osmtogeojson(data));
  };

  process(data) {
    var results = {};
    const geojsonLength = require('geojson-length');
    for( const i in data.features ) {
      const feature = data.features[i];
      var length = geojsonLength(feature.geometry);
      feature.properties.length = length;
      var cat = "unknown";
      if ( this.filter.match( feature, this.bicycle_ways)) {
        cat = "good";
      } else if ( this.filter.match( feature, this.acceptable_ways)) {
        cat = "acceptable";
      } else if ( this.filter.match( feature, this.car_ways)) {
        cat = "car";
      }
      if ( ! results[cat] ) {
        results[cat] = 0;
      }
      results[cat] += length;
      feature.properties.category = cat;
      data.features[i] = feature;
    }
    results.score = (results.acceptable * 0.5 + results.good) / (results.car + results.acceptable + results.good);
    return {
      features: data,
      results: results,
    };
  }
};

module.exports = BikeInfrastructure;
