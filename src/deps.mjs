import Store from "./store.mjs";
import NameToSlug from "./geo/name-to-slug.mjs";
import Areas from "./geo/areas.js";
import CityInformation from "./geo/city-information.mjs";
import Filter from "./osm/filter.js";
import Overpass from "./osm/overpass.js";
import Fetcher from "./utils/fetcher.mjs";

var deps = {};

deps["store"] = (app) => {
  return new Store();
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

import osm from "./deps/osm.mjs";
deps = { ...deps, ...osm };

deps["osm.filter"] = (app) => {
  return new Filter();
};

deps["osm.overpass"] = (app) => {
  return new Overpass();
};

import analysis from "./deps/analysis.mjs";
deps = { ...deps, ...analysis };

import commands from "./deps/commands.mjs";
deps = { ...deps, ...commands };

deps["utils.fetcher"] = (app) => {
  return new Fetcher();
};

export default deps;
