export default class CityInformation {
  constructor(areas, store) {
    this.areas = areas;
    this.store = store;
  }

  async getPopulation(slug, year) {
    const information = await this.store.read(
      `cache/city_information/data.2020.json`
    );
    const area = await this.areas.getArea(slug);
    const key = area["de:regionalschluessel"];
    if (key && information[key]) {
      return information[key].population;
    }
    return null;
  }
}
