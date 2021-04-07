import Analysis  from './commands/analysis.mjs';
import Store from './store.js';
import Areas from './geo/areas.js';
import Filter from './osm/filter.js';
import Overpass from './osm/overpass.js';
import FetchLocations from './osm/queries/fetch-locations.js';
import BikeInfrastructure from './analysis/bike-infrastructure.js';
import FetchLocationsCmd from './commands/fetch-locations.js';

var deps = {};

deps['store'] = ( app ) => {
  return new Store();
};

deps['geo.areas'] = ( app ) => {
  return new Areas(app['store']);
};

deps['osm.filter'] = ( app ) => {
  return new Filter();
};

deps['osm.overpass'] = ( app ) => {
  return new Overpass();
};

deps["osm.queries.fetch-locations"] = ( app ) => {
  return new FetchLocations( app['osm.overpass'] );
};

deps["analysis.bike-infrastructure"] = ( app ) => {
  return new BikeInfrastructure( app['osm.overpass'], app['osm.filter'] );
};

deps['cmd.analysis'] = ( app ) => {
  const list = {
    'bike_infrastructure': app['analysis.bike-infrastructure'],
  };
  return new Analysis( list, app['store'], app['geo.areas'] );
}

deps['cmd.fetch-locations'] = ( app ) => {
  return new FetchLocationsCmd( app['osm.queries.fetch-locations'] );
}

export default deps;
