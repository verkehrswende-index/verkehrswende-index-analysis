export default class GenerateIndex {
  constructor(areas, store, cityInformation) {
    this.areas = areas;
    this.store = store;
    this.cityInformation = cityInformation;
  }

  async call() {
    console.log('starting');
    var areas = await this.areas.getAll();
    var index = {
      areas: [],
    };
    const mayors = await this.store.read('mayors.json');

    for (const areaX of areas) {
      var area = await this.areas.getArea(areaX.getSlug());
      console.log(area);
      // var area = areaX;

      var scores = {}
      var scores1Y = {}
//      this.areas.writeAreaConfig(area);
      console.log( 'read', area.getSlug());

      const analysises = {
        'bike_infrastructure': {
          weight: 1,
        },
        'cars_per_resident': {
          weight: 0.25,
        },
        'stop_distance': {
          weight: 0.125,
        },
      };

      var score = 0;
      var score1Y = 0;
      var sumWeight = 0;
      var sumWeight1Y = 0;

      for (var key in analysises) {
        console.log(key);
        let analysis = analysises[key];
        const results = await this.store.read(
          `areas/${area.getSlug()}/analysis/${key}/results.json`,
        );
        var results1Y = null;
        try {
          results1Y = await this.store.read(
            `areas/${area.getSlug()}/analysis/${key}/results.1y.json`,
          );
        } catch(e) {
        }
        scores[key] = {
          score: results.score,
          weight: analysis.weight,
        };
        scores1Y[key] = {
          score: results1Y ? results1Y.score : 0,
          weight: analysis.weight,
        }
        if ( results.score !== null ) {
          sumWeight += analysis.weight;
          score += analysis.weight * results.score;
        }
        if ( results1Y && results1Y.score !== null ) {
          sumWeight1Y += analysis.weight;
          score1Y += analysis.weight * results1Y.score;
        }
      }

      const population = await this.cityInformation.getPopulation(
        area.getSlug(),
        2020
      );
      index.areas.push(
        {
          name: area.name,
          international: area.international,
          slug: area.getSlug(),
          population: population || area.population,
          mayorParty: mayors[area.getSlug()] || null,
          scores,
          scores1Y,
          score: score / sumWeight,
          score1Y: score1Y / sumWeight1Y,
        }
      );
    }
    index.areas.sort((a,b) => b.score - a.score);
    await this.store.write(
      `index.json`,
      index
    );
    console.log('done');
  };
}
