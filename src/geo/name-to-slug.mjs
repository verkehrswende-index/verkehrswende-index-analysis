export default class NameToSlug {
  getSlug(name) {
    return name
      .toLowerCase()
      .replace(/ö/, 'oe')
      .replace(/ü/, 'ue')
      .replace(/ä/, 'ae')
      .replace(/ /, '_');
  }
}
