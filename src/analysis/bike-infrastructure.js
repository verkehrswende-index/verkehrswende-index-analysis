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

  run( callback ) {
    const area = {
      north: 50.115,
      south: 50.1,
      east: 8.76,
      west: 8.74,
    };

    const all_ways = [
      {
        tag: "highway",
        // valueRegexp: "^(unclassified|cycleway|residential|living_street|motorway|trunk|primary|secondary|tertiary|footway|path)$",
        valueRegexp: "^(unclassified|cycleway|residential|living_street|motorway|trunk|primary|secondary|tertiary|path)$",
      },
    ];

    // [diff:"2012-09-14T15:00:00Z","2012-09-21T15:00:00Z"]
    // [out:json][timeout:30][bbox:${area.south},${area.west},${area.north},${area.east}];
    const query = `
area[name~"^(Frankfurt|Offenbach) am Main$"]->.offenbach;
(
${this.filter.toQuery(all_ways)}
);
out body;
>;
out skel qt;
`;

    console.log( query );

    const osmtogeojson = require( 'osmtogeojson' );

    this.overpass.query( query, ( data ) => {
      this.print( osmtogeojson( data ), callback );
    } );
  };

  print (data, callback) {
    var stats = {};
    const geojsonLength = require('geojson-length');
    console.log( 'got', data.features.length, 'features');
    for( const i in data.features ) {
      const feature = data.features[i];
      var length = geojsonLength(feature.geometry);
      feature.properties.length = length;
      // console.log( feature );
      // console.log( area );
      var cat = "unknown";
      if ( this.filter.match( feature, this.bicycle_ways)) {
        cat = "good";
      } else if ( this.filter.match( feature, this.acceptable_ways)) {
        cat = "acceptable";
      } else if ( this.filter.match( feature, this.car_ways)) {
        cat = "car";
      }
      if ( ! stats[cat] ) {
        stats[cat] = 0;
      }
      stats[cat] += length;
      feature.properties.category = cat;
      data.features[i] = feature;
    }
    console.log('calling callback');
    callback(data);
    // console.log( data.features );
  }
};

module.exports = BikeInfrastructure;
