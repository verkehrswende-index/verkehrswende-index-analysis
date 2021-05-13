import {DOMParser} from "xmldom";

export default class FetchLocations {
  constructor(osmium, store, nameToSlug) {
    this.osmium = osmium;
    this.store = store;
    this.nameToSlug = nameToSlug;
  }

  getDataPath(args,extract="germany") {
    return `data/raw/osm/${extract}${args.timeSpan?'.1y':''}.osm.pbf`;
  }

  async call(argv) {
    var timeSpan = null;
    if ( argv.timeSpan === '1y' ) {
      timeSpan = '1y';
    }
    var cities = null;
    var cities = await this.osmium.exec(`tags-filter -f osm -R ${this.getDataPath(argv)} r/de:place=city`.split(' ')) ;
    var internationals = await this.osmium.exec(`getid -f osm ${this.getDataPath(argv,'denmark')} r2192363`.split(' ')) ; // Kopenhagen
    internationals = (new DOMParser()).parseFromString(internationals, 'text/xml');
    cities = (new DOMParser()).parseFromString(cities, 'text/xml');
    var areas = [];
    const cityRelations = cities.documentElement.getElementsByTagName('relation');
    const internationalsRelations = internationals.documentElement.getElementsByTagName('relation');
    for(const relations of [cityRelations, internationalsRelations]) {
      relations:
      for(let i = 0; i < relations.length; i++) {
        let area = {
          extract: 'denmark',
          id: relations[i].getAttribute('id'),
        };
        const tags = relations[i].getElementsByTagName('tag');
        for(let i = 0; i < tags.length; i++) {
          area[tags[i].getAttribute('k')] = tags[i].getAttribute('v');
          // if(tags[i].getAttribute('k') === 'name') {
          //   area.slug = this.nameToSlug.getSlug(area.name);
          // }
        }
        areas.push(area);
      };
    }
    this.store.write(`areas.json`, areas);
  };
}
