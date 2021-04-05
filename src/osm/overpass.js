class Overpass {
  constructor(overpass) {
    this.apiURL = 'https://overpass-api.de/api/interpreter';
  }

  query( query, callback ) {
    const OPquery = `
[out:json][timeout:600];
${query}
`;
    console.log( OPquery );
    var queryURL = this.apiURL + '?data=' + encodeURI( OPquery );
    const fetch = require( 'node-fetch' );
    var data = '';
    fetch( queryURL )
      .then( res => res.json() )
      .then( json => callback( json ) );
  };
};

module.exports = Overpass;
