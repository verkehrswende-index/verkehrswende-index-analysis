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
      console.log( results);

      index.areas.push(
        {
          name: area.name,
          slug: area.getSlug(),
          scores: {
            'bike_infrastructure': results.score,
          },
          score: results.score,
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
