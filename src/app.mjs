import deps from "./deps.mjs";
var deps_instances = {};

for (const dep in deps) {
  deps_instances[dep] = deps[dep](deps_instances);
  if (deps_instances[dep].run) {
    deps_instances[dep].run();
  }
}

export default function app(dep) {
  return deps_instances[dep];
}
