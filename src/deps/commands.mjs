var deps = {};

import FetchLocations from '../commands/fetch-locations.mjs';
deps["cmd.fetch-locations"] = (app) => {
  return new FetchLocations(
    app['osm.osmium'],
    app['store'],
    app['geo.name-to-slug'],
  );
};

import Analysis from '../commands/analysis.mjs';
deps['cmd.analysis'] = ( app ) => {
  const list = {
    'bike_infrastructure': app['analysis.bike-infrastructure'],
    'cars_per_resident': app['analysis.cars-per-resident'],
    'stop_distance': app['analysis.stop-distance'],
  };
  return new Analysis(list, app['store'], app['geo.areas']);
}

import FetchCarLicenses from '../commands/fetch-car-licenses.mjs';
deps["cmd.fetch-car-licenses"] = ( app ) => {
  return new FetchCarLicenses( app['store'] );
};

import FetchCityInformation from '../commands/fetch-city-information.mjs';
deps["cmd.fetch-city-information"] = ( app ) => {
  return new FetchCityInformation( app['store'] );
};

import FetchMayorsCmd from '../commands/fetch-mayors.mjs';
deps['cmd.fetch-mayors'] = ( app ) => {
  return new FetchMayorsCmd( app['store'], app['utils.fetcher'], app['geo.name-to-slug']);
}

import GenerateExtracts from '../commands/generate-extracts.mjs';
deps["cmd.generate-extracts"] = (app) => {
  return new GenerateExtracts(
    app['geo.areas'],
    app['osm.osmium'],
    app['store'],
    app['geo.name-to-slug'],
  );
};

import GenerateIndex from '../commands/generate-index.mjs';
deps['cmd.generate-index'] = (app) => {
  return new GenerateIndex(
    app['geo.areas'],
    app['store'],
    app['geo.city-information'],
  );
}

import WriteAreaConfigs from '../commands/write-area-configs.mjs';
deps['cmd.write-area-configs'] = ( app ) => {
  return new WriteAreaConfigs(
    app['geo.areas'],
    app['store'],
  );
}

export default deps;
