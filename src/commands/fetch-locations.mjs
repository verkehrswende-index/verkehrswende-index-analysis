import {DOMParser} from "xmldom";
import {existsSync} from "fs";

export default class FetchLocations {
  constructor(osmium, store, nameToSlug) {
    this.osmium = osmium;
    this.store = store;
    this.nameToSlug = nameToSlug;
  }

  getDataPath(args) {
    return `data/raw/osm/germany${args.timeSpan?'.1y':''}.osm.pbf`;
  }

  async getAreas(args) {
    var cities = await this.osmium.exec(`tags-filter -f osm -R ${this.getDataPath(args)} r/de:place=city`.split(' ')) ;
    cities = (new DOMParser()).parseFromString(cities, 'text/xml');
    var areas = [];
    const relations = cities.documentElement.getElementsByTagName('relation');
    relations:
    for(let i = 0; i < relations.length; i++) {
      const id = relations[i].getAttribute('id');
      const tags = relations[i].getElementsByTagName('tag');
      for(let i = 0; i < tags.length; i++) {
        if(tags[i].getAttribute('k') === 'name') {
          const name = this.nameToSlug.getSlug(tags[i].getAttribute('v'));
          areas.push( { id, name } );
          continue relations;
        }
      }
    };
    return areas;
  }

  async call(argv) {
    var timeSpan = null;
    if ( argv.timeSpan === '1y' ) {
      timeSpan = '1y';
    }
    const areas = await this.getAreas({timeSpan});
    // TODO don't rewrite for 1y?
    this.store.write(`areas.json`, areas);
    for(const area of areas) {
      const extractPath = `data/cache/osm/extracts/${area.name}${timeSpan?'.1y':''}.osm.pbf`;
      if(existsSync(extractPath)) {
        continue;
      }
      const dataPath = this.getDataPath({timeSpan});
      const boundaryPath = `data/cache/osm/boundaries/${area.name}${timeSpan?'.1y':''}.osm.pbf`;
      await this.osmium.exec(`getid -O -r -t ${dataPath} r${area.id} -o ${boundaryPath}`.split(' ')) ;
      await this.osmium.exec(`extract -p ${boundaryPath} ${dataPath} -o ${extractPath}`.split(' ')) ;
    }
  };
}
