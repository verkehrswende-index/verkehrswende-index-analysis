export default class NameToSlug {
  getSlug(name) {
    return name
      .toLowerCase()
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ä/g, "ae")
      .replace(/ß/g, "ss")
      .replace(/ /g, "_")
      .replace(/\//g, "_")
      .replace(/ø/g, "o")
      .replace(/[^a-z_-]/g, "");
  }
}
