var deps = {};

import Osmium from "../osm/osmium.mjs";
deps["osm.osmium"] = (app) => {
  return new Osmium();
};

export default deps;
