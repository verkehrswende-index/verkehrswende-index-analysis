var deps = {};

import Osmium from "~/osm/osmium";
deps["osm.osmium"] = (app) => {
  return new Osmium();
};

export default deps;
