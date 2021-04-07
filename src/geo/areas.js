class Area {
  getSlug() {
    return this.name
      .toLowerCase()
      .replace(/ö/, 'oe')
      .replace(/ü/, 'ue')
      .replace(/ä/, 'ae')
      .replace(/ /, '_');
  }
};

class Areas {
  constructor(store) {
    this.store = store;
  }
  getAll() {
    // var areas = this.store.read('kreisfreie_staedte.json').elements;
    var areas = this.store.read('gemeinden_auswahl.json').elements;
    for (const i in areas) {
      areas[i].tags.id = areas[i].id;
      areas[i] = areas[i].tags;
      areas[i].getSlug = Area.prototype.getSlug;
    }
    return areas;
  }
}

module.exports = Areas;
