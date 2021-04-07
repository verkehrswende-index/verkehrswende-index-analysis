
class Overpass {
  constructor(overpass) {
    this.apiURL = 'https://overpass-api.de/api/interpreter';
  }

  async query( query ) {
    const OPquery = `
[out:json][timeout:600];
${query}
`;
    console.log( OPquery );
    var queryURL = this.apiURL + '?data=' + encodeURI( OPquery );
    const fetch = require( 'node-fetch' );
    var data = null;
    const delay = require('delay');
    while ( data == null ) {
      data = await fetch( queryURL )
        .then( res => res.json() )
        .catch( error => {
          delay(5000);
        } );
    }
    return data;
  };
};

module.exports = Overpass;
