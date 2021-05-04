export default class WriteAreaConfigs {
  constructor( areas, cityInformation ) {
    this.areas = areas;
    this.cityInformation = cityInformation;
  }

  call() {
    console.log('starting');
    var areas = this.areas.getAll();
    for (const area of areas) {
      // first to have initial config.
      this.areas.writeAreaConfig(area);
      const population = this.cityInformation.getPopulation(
        area.getSlug(), '2020' );
      if (population !== null) {
        area.population = population;
      }
      this.areas.writeAreaConfig(area);
    }
    console.log('done');
  };
}
