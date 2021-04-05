class Filter {
  toQuery( filter ) {
    var query = '';
    filter.forEach( (v) => {
      query += 'way(area.offenbach)[';
      if ( 'tagRegexp' in v ) {
        query += `~"${v.tagRegexp}"`;
      } else {
        query += `"${v.tag}"`;
      }
      if ( 'valueRegexp' in v ) {
        query += `~"${v.valueRegexp}"`;
      } else {
        query += `="${v.value}"`;
      }
      query += "];\n";
    });
    return query;
  }

  match(way,filters) {
    for( let filter of filters ) {
      for(var [name,value] of Object.entries(way.properties)) {
        // console.log( filter );
        if ( 'tagRegexp' in filter ) {
          // console.log('nomatch?');
          if (! name.match(new RegExp(filter.tagRegexp))) {
            // console.log('nomatch');
            continue;
          }
        } else if (name !== filter.tag) {
          // console.log('nomatch2');
          continue;
        }
        if ( 'valueRegexp' in filter ) {
          // console.log( way );
          // console.log( filter );
          if (! value.match(new RegExp(filter.valueRegexp))) {
            // console.log('nomatch3');
            continue;
          }
          return true;
        } else {
          if (value !== filter.value) {
            // console.log('nomatch4');
            continue;
          }
          // console.log( way );
          // console.log( filter );
          return true;
        }
      };
    };
    return false;
  }
};

module.exports = Filter;
