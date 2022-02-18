
class Overpass {
  constructor(overpass) {
    // this.apiURL = 'https://overpass-api.de/api/interpreter';
    this.apiURL = 'https://overpass.kumi.systems/api/interpreter';
    // this.apiURL = 'http://78.47.57.82:8989/api/interpreter';
    // this.apiURL = 'http://localhost:8989/api/interpreter';

  }

  async query( query, args={} ) {
    var date = null;
    if ( args.timeSpan === '1y' ) {
      date = "2020-04-14T00:00:00Z";
    }
    // [maxsize:2000000000] with local osm
    // [maxsize:1000000000] else?
    const OPquery = `
[maxsize:2000000000]
[out:json][timeout:6000]${date ? `[date:"${date}"]` : ''};
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
        .then( res => { if ( ! res.ok ) { console.error( res ); throw new Error('Network error '); }; return res; } )
        .then( res => res.json() )
        .then( res => {
          if ( res.remark ) {
            throw new Error('Overpass API error: ' + res.remark);
          }
          return res;
        } )
        .catch( error => {
          data = null;
          console.error(error);
        } );
      if ( data == null ) {
        await delay(5000);
      }
    }
    return data;
  };
};

module.exports = Overpass;
