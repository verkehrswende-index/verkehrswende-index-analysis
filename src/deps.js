import Config from "./config";
import Store from "./store";
import NameToSlug from "./geo/name-to-slug";
import Areas from "./geo/areas";
import CityInformation from "./geo/city-information";
import Filter from "./osm/filter";
import Fetcher from "./utils/fetcher";

var deps = {};

deps["store"] = (app) => {
  return new Store();
};

deps["config"] = (app) => {
  console.log(Config);
  return new Config();
};

deps["geo.name-to-slug"] = (app) => {
  return new NameToSlug();
};

deps["geo.areas"] = (app) => {
  return new Areas(app["store"], app["geo.name-to-slug"]);
};

deps["geo.city-information"] = (app) => {
  return new CityInformation(app["geo.areas"], app["store"]);
};

import osm from "./deps/osm";
deps = { ...deps, ...osm };

deps["osm.filter"] = (app) => {
  return new Filter();
};

import analysis from "./deps/analysis";
deps = { ...deps, ...analysis };

import commands from "./deps/commands";
deps = { ...deps, ...commands };

deps["utils.fetcher"] = (app) => {
  return new Fetcher();
};

export default deps;
