
class Overpass {
  constructor(overpass) {
    // this.apiURL = 'https://overpass-api.de/api/interpreter';
    this.apiURL = 'https://overpass.kumi.systems/api/interpreter';
  }

  async query( query, args={} ) {
    var date = null;
    if ( args.timeSpan === '1y' ) {
      date = "2020-04-14T00:00:00Z";
    }
    const OPquery = `
[out:json][timeout:600]${date ? `[date:"${date}"]` : ''};
${query}
`;
    console.log( OPquery );
    var queryURL = this.apiURL + '?data=' + encodeURI( OPquery );
    const fetch = require( 'node-fetch' );
    var data = null;
    const delay = require('delay');
    while ( data == null ) {
      data = await fetch( queryURL, {
        headers: {
          'User-Agent': 'Verkehrswende-Index Analyser / https://verkehrswende-index.de/'
        },
      } )
        .then( res => res.json() )
        .catch( error => {
          delay(5000);
        } );
    }
    return data;
  };
};

module.exports = Overpass;
