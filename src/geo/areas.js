class Area {
  constructor(nameToSlug) {
    this.nameToSlug = nameToSlug;
  }
  getSlug() {
    return this.nameToSlug.getSlug(this.name);
  }
};

class Areas {
  constructor(store, nameToSlug) {
    this.store = store;
    this.nameToSlug = nameToSlug;
  }
  getAll() {
    var elements = this.store.read('kreisfreie_staedte.json').elements;
    // var elements = this.store.read('gemeinden_auswahl.json').elements;
    var areas = [];
    for (const element of elements) {
      var area = new Area(this.nameToSlug);
      area.id = element.id;
      for ( const tag in element.tags ) {
        area[tag] = element.tags[tag];
      }
      areas.push(area);
    }
    return areas;
  }

  writeAreaConfig(area) {
    this.store.write(
      `areas/${area.getSlug()}/config.json`,
      area
    );
  }
}

module.exports = Areas;
