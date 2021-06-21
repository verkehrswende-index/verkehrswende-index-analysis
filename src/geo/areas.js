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

  async getAll() {
    var elements = await this.store.read('areas.json');
    var areas = [];
    for (const element of elements) {
      for ( const tag in element.tags ) {
        element[tag] = element.tags[tag];
      }
      areas.push(this.createArea(element));
    }
    return areas;
  }

  createArea(data) {
    // console.log('before', data);
    var area = new Area(this.nameToSlug);
    // console.log('before2', area);
    for ( const tag in data ) {
      // console.log(tag);
      if ( area[tag] === undefined ) {
        // console.log('ok');
        area[tag] = data[tag];
      }
    }
    // console.log('after',area );
    return area;
  }

  async getArea(slug) {
    const data = await this.store.read(`areas/${slug}/config.json`);
    if ( ! data ) {
      return null;
    }
    var ret = this.createArea(data);
    return ret;
  }

  async writeAreaConfig(area) {
    await this.store.write(
      `areas/${area.getSlug()}/config.json`,
      area
    );
  }
}

module.exports = Areas;
