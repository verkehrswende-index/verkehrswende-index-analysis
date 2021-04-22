import { JSDOM } from 'jsdom';

export default class FetchMayors {
  constructor(store, fetcher, nameToSlug) {
    this.store = store;
    this.fetcher = fetcher;
    this.nameToSlug = nameToSlug;
    this.source = "https://de.wikipedia.org/wiki/Liste_der_deutschen_Oberb%C3%BCrgermeister";
  }

  async call() {
    const data = await this.fetcher.fetch(this.source)
      .then( res => { if ( ! res.ok ) { console.error( res ); throw new Error('Network error '); }; return res; } )
        .then( res => res.text() )
      .catch( error => {
        data = null;
        console.error(error);
      } );
    const { document } = (new JSDOM(data)).window;
    var parties = {};
    for( const table of document.querySelectorAll( ".wikitable" ) ) {
      if ( table.querySelector( 'th' ).textContent.trim() !== 'Name' ) {
        // console.log(table.querySelector( 'th' ).textContent);
        continue;
      }
      for( const row of table.querySelectorAll( "tr" ) ) {
        if ( row.querySelector( "td:nth-child(3)" ) === null ) {
          continue;
        }
        const city = row.querySelector( "td:nth-child(3)" ).textContent.trim();
        const party = row.querySelector( "td:nth-child(4)" ).textContent.trim();
        parties[this.nameToSlug.getSlug(city)] = party;
      }
    }
    this.store.write('/mayors.json', parties);
  };
}
