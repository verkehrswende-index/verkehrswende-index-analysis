class Filter {
  // 'and' not supported
  toQuery( filter, areaId ) {
    var query = '';
    filter.forEach( (v) => {
      query += `way(area:${areaId})[`;
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
    filterLoop:
    for( const filter of filters ) {
      if ( 'and' in filter ) {
        if (filter.and.every((f) => this.match(way, f))) {
          return true;
        }
        continue;
      }
      const tagMustNotExist = 'value' in filter && filter.value === null;
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
        } else if (tagMustNotExist) {
          continue filterLoop;
        }
        if ( 'valueRegexp' in filter ) {
          // console.log( way );
          // console.log( filter );
          if (! value.match(new RegExp(filter.valueRegexp))) {
            // console.log('nomatch3');
            continue;
          }
          return true;
        } else if ( 'value' in filter ) {
          if (value !== filter.value) {
            // console.log('nomatch4');
            continue;
          }
          // console.log( way );
          // console.log( filter );
          return true;
        } else {
          return true;
        }
      };
      if (tagMustNotExist) {
        return true;
      }
    };
    return false;
  }
};

module.exports = Filter;
