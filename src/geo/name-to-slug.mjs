export default class NameToSlug {
  getSlug(name) {
    return name
      .toLowerCase()
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ä/g, 'ae')
      .replace(/[()]/g, '')
      .replace(/ /g, '_');
  }
}
