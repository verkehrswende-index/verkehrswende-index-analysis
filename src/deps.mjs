import Analysis  from './commands/analysis.mjs';
import Store from './store.js';
import NameToSlug from './geo/name-to-slug.mjs';
import Areas from './geo/areas.js';
import Filter from './osm/filter.js';
import Overpass from './osm/overpass.js';
import FetchLocations from './osm/queries/fetch-locations.js';
import BikeInfrastructure from './analysis/bike-infrastructure.js';
import FetchLocationsCmd from './commands/fetch-locations.js';
import FetchMayorsCmd from './commands/fetch-mayors.mjs';
import GenerateIndex from './commands/generate-index.mjs';
import WriteAreaConfigs from './commands/write-area-configs.mjs';
import Fetcher from './utils/fetcher.mjs';

var deps = {};

deps['store'] = ( app ) => {
  return new Store();
};

deps['geo.name-to-slug'] = ( app ) => {
  return new NameToSlug();
};

deps['geo.areas'] = ( app ) => {
  return new Areas(app['store'], app['geo.name-to-slug']);
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
  return new BikeInfrastructure( app['osm.overpass'], app['osm.filter'], app['store'] );
};

deps['utils.fetcher'] = ( app ) => {
  return new Fetcher();
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

deps['cmd.fetch-mayors'] = ( app ) => {
  return new FetchMayorsCmd( app['store'], app['utils.fetcher'], app['geo.name-to-slug']);
}

deps['cmd.generate-index'] = ( app ) => {
  return new GenerateIndex( app['geo.areas'], app['store'] );
}

deps['cmd.write-area-configs'] = ( app ) => {
  return new WriteAreaConfigs( app['geo.areas'] );
}

export default deps;
