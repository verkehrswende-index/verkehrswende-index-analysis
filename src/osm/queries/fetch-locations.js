class FetchLocations {
  constructor(overpass) {
    this.overpass = overpass;
  }

  fetch( callback) {
    this.overpass.query(`
(
area['de:regionalschluessel']["de:place"="city"];
area["admin_level"="8"]['de:regionalschluessel'];
);
out;
`, callback ) ;
  }
};

module.exports = FetchLocations;
