import osmtogeojson from 'osmtogeojson';
import polygonCenter from 'geojson-polygon-center';
import {spawnSync} from "child_process";
import {DOMParser} from "xmldom";

export default class Osmium {
  constructor() {
  }

  async query(area, query, args={} ) {
    var spanInfix = '';
    if ( args.timeSpan === '1y' ) {
      spanInfix = '1y.';
    }
    const out = await this.exec(
      (`tags-filter -t -f osm data/cache/osm/extracts/${area}.${spanInfix}osm.pbf ${query}`).split(' ')
    );
    const parsed = (new DOMParser()).parseFromString(out, 'text/xml');
    var geojson = osmtogeojson(parsed);
    geojson.features = geojson.features.map(feature => {
      if (feature.geometry.type === "Polygon") {
        feature.geometry = polygonCenter(feature.geometry);
      }
      return feature;
    });
    return geojson;
  };

  async exec(args) {
    var data = null;
    const command = 'osmium';
    console.log(command,args);
    var data = spawnSync(command, args, {maxBuffer: 1 * 1024 * 1024 * 1024 });
    if(data.error) {
      throw Error(data.error);
    }
    if(data.status !== 0) {
      throw Error(`Osmium (${args.join(' ')}) failed: ` + data.status + ': ' + data.stderr);
    }
    return data.stdout.toString();
  };
};
