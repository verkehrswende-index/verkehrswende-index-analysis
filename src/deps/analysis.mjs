var deps = {};

import BikeInfrastructure from "../analysis/bike-infrastructure.mjs";
deps["analysis.bike-infrastructure"] = (app) => {
  return new BikeInfrastructure(
    app["osm.osmium"],
    app["osm.filter"],
    app["store"]
  );
};

import CarsPerResident from "../analysis/cars-per-resident.mjs";
deps["analysis.cars-per-resident"] = (app) => {
  return new CarsPerResident(
    app["store"],
    app["geo.name-to-slug"],
    app["geo.city-information"]
  );
};

import StopDistance from "../analysis/stop-distance.mjs";
deps["analysis.stop-distance"] = (app) => {
  return new StopDistance(app["osm.osmium"], app["store"]);
};

export default deps;
