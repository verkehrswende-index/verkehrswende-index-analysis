export default class CityInformation {
  constructor( areas, store ) {
    this.areas = areas;
    this.store = store;
  };

  getPopulation(slug, year) {
    const information = this.store.read(`cache/city_information/data.2020.json`);
    const area = this.areas.getArea(slug);
    const key = area['de:regionalschluessel'];
    if (key && information[key]) {
      return information[key].population;
    }
    return null;
  };
}
