var deps = {};

import FetchLocations from "~/commands/fetch-locations";
deps["cmd.fetch-locations"] = (app) => {
  return new FetchLocations(
    app["osm.osmium"],
    app["store"],
    app["geo.name-to-slug"]
  );
};

import Analysis from "~/commands/analysis";
deps["cmd.analysis"] = (app) => {
  const list = {};
  [
    'bike_infrastructure',
    'cars_per_resident',
    'stop_distance',
    'designated_bike_lane_in_maxspeed_30_zone',
  ].forEach((v) => { list[v] = v.replace(/_/g, '-'); });
  return new Analysis(list, app["store"], app["geo.areas"]);
};

import FetchCarLicenses from "~/commands/fetch-car-licenses";
deps["cmd.fetch-car-licenses"] = (app) => {
  return new FetchCarLicenses(app["store"]);
};

import FetchCityInformation from "~/commands/fetch-city-information";
deps["cmd.fetch-city-information"] = (app) => {
  return new FetchCityInformation(app["store"]);
};

import FetchMayorsCmd from "~/commands/fetch-mayors";
deps["cmd.fetch-mayors"] = (app) => {
  return new FetchMayorsCmd(
    app["store"],
    app["utils.fetcher"],
    app["geo.name-to-slug"]
  );
};

import GenerateExtracts from "~/commands/generate-extracts";
deps["cmd.generate-extracts"] = (app) => {
  return new GenerateExtracts(
    app["geo.areas"],
    app["osm.osmium"],
    app["store"],
    app["geo.name-to-slug"]
  );
};

import GenerateIndex from "~/commands/generate-index";
deps["cmd.generate-index"] = (app) => {
  return new GenerateIndex(
    app["geo.areas"],
    app["store"],
    app["geo.city-information"]
  );
};

import WriteAreaConfigs from "~/commands/write-area-configs";
deps["cmd.write-area-configs"] = (app) => {
  return new WriteAreaConfigs(app["geo.areas"], app["store"]);
};

export default deps;
