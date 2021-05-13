import {DOMParser} from "xmldom";
import {existsSync} from "fs";

export default class GenerateExtracts {
  constructor(areas, osmium, store, nameToSlug) {
    this.areas = areas;
    this.osmium = osmium;
    this.store = store;
    this.nameToSlug = nameToSlug;
  }

  getDataPath(timeSpan,extract) {
    return `data/raw/osm/${extract}${timeSpan?'.1y':''}.osm.pbf`;
  }

  async call(argv) {
    var timeSpan = null;
    if ( argv.timeSpan === '1y' ) {
      timeSpan = '1y';
    }
    const areas = this.areas.getAll();
    for(const area of areas) {
      if( argv.areas
           && ! argv.areas.split(',').includes(area.getSlug()) ) {
        continue;
      }
      console.log(area.getSlug());
      const extractPath = `data/cache/osm/extracts/${area.getSlug()}${timeSpan?'.1y':''}.osm.pbf`;
      if(existsSync(extractPath)) {
        continue;
      }
      console.log("create", extractPath);
      const extract = area.extract || "germany";
      const dataPath = this.getDataPath(timeSpan,extract);
      const boundaryPath = `data/cache/osm/boundaries/${area.getSlug()}${timeSpan?'.1y':''}.osm.pbf`;
      await this.osmium.exec(`getid -O -r -t ${dataPath} r${area.id} -o ${boundaryPath}`.split(' ')) ;
      await this.osmium.exec(`extract -O -p ${boundaryPath} ${dataPath} -o ${extractPath}`.split(' ')) ;
    }
  };
}
