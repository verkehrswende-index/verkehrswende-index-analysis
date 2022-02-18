import osmtogeojson from 'osmtogeojson';
import geojsonLength from 'geojson-length';
import Audit from 'lighthouse/lighthouse-core/audits/audit.js';
import Flatbush from 'flatbush';

const filterConfigs = {
  stop: [
    {
      tag: 'highway',
      value: 'bus_stop',
    },
    {
      tag: 'public_transport',
      valueRegexp: '^(station|stop_position|platform)$',
    },
  ],
  building: [
    {
      tag: 'building',
    },
  ],
};

export { filterConfigs };

export default class StopDistance {
  constructor(osmium, store) {
    this.osmium = osmium;
    this.store = store;
  }

  getBasePath(area) {
    return `areas/${area.getSlug()}/analysis/stop_distance`;
  }

  async refresh(area, timeSpan) {
    var data = await this.osmium.query(
      area.getSlug(),
      'n/highway=bus_stop w/building n/public_transport=station,stop_position,platform',
      {
        centerPoint: true,
        timeSpan: timeSpan,
      }
    );
    await this.store.write(this.getBasePath(area) + `/features${timeSpan ? `.${timeSpan}` : ''}.json`, data);
    console.log('data refreshed');
  }

  async start(area,timeSpan) {
    var data = await this.store.read(this.getBasePath(area) + `/features${timeSpan ? `.${timeSpan}` : ''}.json`);
    var processed = this.process(area, data);
    await this.store.write(this.getBasePath(area) + `/features${timeSpan ? `.${timeSpan}` : ''}.json`, processed.features);
    await this.store.write(this.getBasePath(area) + `/results${timeSpan ? `.${timeSpan}` : ''}.json`, processed.results);
  };

  process(area, data) {
    console.log('processing data');
    var stops = [];

    // const a = 0.6127216848;
    // const b = 5.99146454711;
    // const t = (x) => 1/(1+0.3275911*x);
    // const E = (x) => 1-(((((1.061405429*t(x)-1.453152027)*t(x))+1.421413741)*t(x)-0.284496736)*t(x)+0.254829592)*t(x)*Math.exp(-(x*x));
    // const C = (x) => 1/2*(1+E( (Math.log(x)-b)/(a*Math.sqrt(2))));

    var scoreSum = 0;
    var scoreValues = 0;

    const isTransport = (feature) =>
          "public_transport" in feature.properties
          || ( "highway" in feature.properties
               && feature.properties.highway === "bus_stop" );

    for( const feature of data.features ) {
      if(isTransport(feature)) {
        stops.push(feature);
      }
    }

    console.log(`${data.features.length} features`);
    console.log(`${stops.length} stops`);

    if(stops.length === 0) {
      console.log('no stops');
      var results = {};
      results.score = 0;
      return {
        features: data,
        results: {
          score: 0,
        },
      };
    }

    const stopIndex = new Flatbush(stops.length);
    for( const stop of stops ) {
      stopIndex.add(
        stop.geometry.coordinates[0],
        stop.geometry.coordinates[1],
        stop.geometry.coordinates[0],
        stop.geometry.coordinates[1],
      );
    }
    stopIndex.finish();

    for( const feature of data.features ) {
      if (isTransport(feature)
         || feature.properties.building === "no") {
        continue;
      }
      const nearestIndex = stopIndex.neighbors(
        feature.geometry.coordinates[0],
        feature.geometry.coordinates[1],
        1
      )[0];
      const length = geojsonLength( {
        type: "LineString",
        coordinates: [
          stops[nearestIndex].geometry.coordinates,
          feature.geometry.coordinates,
        ],
      } );
      // console.log(feature);
      // console.log('l',length,nearestIndex);
      feature.properties.stop_distance = length;
      feature.properties.score = Audit.computeLogNormalScore(
        { p10: 120, median: 400},
        length
      );
      // console.log(min,feature.properties.score);
      // console.log(eouaaoeu);
      // feature.properties.score = 1-C(min);
      // if (feature.properties.score > 1 ) {
        // console.log('min',min,'score',feature.properties.score,'C',C(min),'E',E(min),'t',t(min));
        // console.log(aoeuoaeu);
      // }
      scoreSum += feature.properties.score;
      scoreValues++;
    }

    var results = {};
    // for( const i in data.features ) {
    //   const feature = data.features[i];
    //   var length = geojsonLength(feature.geometry);
    //   feature.properties.length = length;
    //   feature.properties.score = score;
    //   feature.properties.surfaceFactor = this.getSurfaceFactor(feature);
    //   feature.properties.wayFactor = this.getWayFactor(area, feature);
    //   data.features[i] = feature;
    // }
    results.score = scoreSum/scoreValues;
    console.log(scoreSum, scoreValues, results.score);
    // results.good = goodLength;
    // results.bad = badLength;
    // results.acceptable = acceptableLength;
    return {
      features: data,
      results,
    };
  }
};
