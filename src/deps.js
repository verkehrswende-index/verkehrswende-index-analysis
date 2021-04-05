var deps = {};

deps['osm.filter'] = ( app ) => {
  const Filter = require('./osm/filter');
  return new Filter();
};

deps['osm.overpass'] = ( app ) => {
  const Overpass = require('./osm/overpass');
  return new Overpass();
};

deps["osm.queries.fetch-locations"] = ( app ) => {
  const FetchLocations = require('./osm/queries/fetch-locations');
  return new FetchLocations( app['osm.overpass'] );
};

deps["analysis.bike-infrastructure"] = ( app ) => {
  const BikeInfrastructure = require('./analysis/bike-infrastructure');
  return new BikeInfrastructure( app['osm.overpass'], app['osm.filter'] );
};

deps['cmd.analysis'] = ( app ) => {
  const Analysis = require('./commands/analysis');
  const list = {
    'bike_infrastructure': app['analysis.bike-infrastructure'],
  };
  return new Analysis( list, app['osm.overpass'] );
}

deps['cmd.fetch-locations'] = ( app ) => {
  const FetchLocations = require('./commands/fetch-locations');
  return new FetchLocations( app['osm.queries.fetch-locations'] );
}

module.exports = deps;
