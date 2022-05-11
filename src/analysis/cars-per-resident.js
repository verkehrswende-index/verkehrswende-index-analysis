export default class CarsPerResident {
  constructor(store, nameToSlug, cityInformation) {
    this.store = store;
    this.nameToSlug = nameToSlug;
    this.cityInformation = cityInformation;
  }

  getBasePath(area) {
    return `areas/${area.getSlug()}/analysis/cars_per_resident`;
  }

  async start(area, timeSpan) {
    const year = timeSpan ? "2019" : "2020";
    var licenses = await this.store.read(
      `cache/car_licenses/data.${year}.json`
    );
    var found = false;
    var doubleMatch = false;
    var cars = 0;
    for (let entry of licenses) {
      const city = this.nameToSlug.getSlug(this.cleanCityName(entry.city));
      // console.log( '?', city );
      if (area.getSlug() === city) {
        if (found) {
          doubleMatch = true;
          console.log("double match", city);
          break;
        }
        found = true;
        cars = entry.cars;
      }
    }
    if (!found) {
      console.log("no match found", area.getSlug());
    }
    const population = await this.cityInformation.getPopulation(
      area.getSlug(),
      year
    );
    const valid = found && !doubleMatch && population !== null;
    const results = {
      cars_per_resident: valid ? cars / population : null,
      score: valid ? Math.max(0, 1 - cars / population) : null,
    };
    await this.store.write(
      this.getBasePath(area) + `/results${timeSpan ? `.${timeSpan}` : ""}.json`,
      results
    );
  }

  cleanCityName(name) {
    name = name.replace(/,ST$/g, "");
    name = name.replace(/,ST.$/g, "");
    name = name.replace(/A\.RH\.$/g, "AM RHEIN");
    name = name.replace(/,LANDESHAUPTSTADT$/g, "");
    name = name.replace(/,STADT$/g, "");
    name = name.replace(/, STADT$/g, "");
    name = name.replace(/-STADT$/g, "");
    return name;
  }

  process(data) {}
}
