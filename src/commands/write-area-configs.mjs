export default class WriteAreaConfigs {
  constructor(areas, store) {
    this.areas = areas;
    this.store = store;
  }

  call() {
    console.log('starting');
    var cities = {};
    for(const city of this.store.read(`index.json`).areas) {
      cities[city.slug] = city;
    }
    var areas = this.areas.getAll();
    for (const area of areas) {
      // first to have initial config.
      this.areas.writeAreaConfig(area);
      const indexInfo = cities[area.getSlug()];
      if(indexInfo) {
        area.scores = indexInfo.scores;
        area.scores1Y = indexInfo.scores1Y;
        area.score = indexInfo.score;
        area.score1Y = indexInfo.score1Y;
        area.population = indexInfo.population;
        area.mayorParty = indexInfo.mayorParty;
      }
      this.areas.writeAreaConfig(area);
    }
    console.log('done');
  };
}
