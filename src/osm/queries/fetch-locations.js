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

  updateStore() {
    console.log('update store');
  }
};

module.exports = FetchLocations;
