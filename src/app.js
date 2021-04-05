var deps = require('./deps');
var deps_instances = {};

for ( dep in deps ) {
  deps_instances[dep] = deps[dep](deps_instances);
  if ( deps_instances[dep].run ) {
    deps_instances[dep].run();
  }
}

module.exports = function app(dep) {
  return deps_instances[dep];
}
