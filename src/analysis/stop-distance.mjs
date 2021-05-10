import osmtogeojson from 'osmtogeojson';
import geojsonLength from 'geojson-length';
import Audit from 'lighthouse/lighthouse-core/audits/audit.js';

export default class StopDistance {
  constructor( overpass, filter, store ) {
    this.overpass = overpass;
    this.filter = filter;
    this.store = store;
  }

  getBasePath(area) {
    return `areas/${area.getSlug()}/analysis/stop_distance`;
  }

  async refresh(area, timeSpan) {
    const query = `
(
  way(area:${area.id})[building];
  node(area:${area.id})[highway="bus_stop"];
  node(area:${area.id})[public_transport~"^(station|stop_position|platform)$"];
);
out center qt;
`;
    var data = await this.overpass.query(query, { timeSpan: timeSpan });
    console.log('data fetched, processing');
    this.store.write(this.getBasePath(area) + `/features${timeSpan ? `.${timeSpan}` : ''}.json`, osmtogeojson(data));
  }

  async start(area,timeSpan) {
    var data = this.store.read(this.getBasePath(area) + `/features${timeSpan ? `.${timeSpan}` : ''}.json`);
    var processed = this.process(area, data);
    this.store.write(this.getBasePath(area) + `/features${timeSpan ? `.${timeSpan}` : ''}.json`, processed.features);
    this.store.write(this.getBasePath(area) + `/results${timeSpan ? `.${timeSpan}` : ''}.json`, processed.results);
  };

  process(area, data) {
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
    for( const feature of data.features ) {
      if (isTransport(feature)) {
        continue;
      }
      var min = Infinity;
      for( const stop of stops ) {
        const length = geojsonLength( {
          type: "LineString",
          coordinates: [
            stop.geometry.coordinates,
            feature.geometry.coordinates,
          ],

        } );
        if(length < min) {
          min = length;
        }
      }
      feature.properties.stop_distance = min;
      feature.properties.score = Audit.computeLogNormalScore(
        { p10: 120, median: 400},
        min
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
