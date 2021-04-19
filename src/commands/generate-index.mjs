export default class GenerateIndex {
  constructor( areas, store ) {
    this.areas = areas;
    this.store = store;
  }

  call() {
    console.log('starting');
    var areas = this.areas.getAll();
    var index = {
      areas: [],
    };
    for (const area of areas) {
//      this.areas.writeAreaConfig(area);

      console.log( 'read', area.getSlug());
      const results = this.store.read(
        `areas/${area.getSlug()}/analysis/bike_infrastructure/results.json`,
      );
      var results1Y = null;
      try {
        results1Y = this.store.read(
          `areas/${area.getSlug()}/analysis/bike_infrastructure/results.1y.json`,
        );
      } catch(e) {
      }

      index.areas.push(
        {
          name: area.name,
          slug: area.getSlug(),
          scores: {
            'bike_infrastructure': results.score,
          },
          scores1Y: {
            'bike_infrastructure': results1Y ? results1Y.score : 0,
          },
          score: results.score,
          score1Y: results1Y ? results1Y.score : 0,
        }
      );
    }
    index.areas.sort((a,b) => b.score - a.score);
    this.store.write(
      `index.json`,
      index
    );
    console.log('done');
  };
}
