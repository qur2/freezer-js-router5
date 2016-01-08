import Freezer from 'freezer-js';
import { Router5 } from 'router5';


export function setup() {
  const router = new Router5()
    .setOption('defaultRoute', 'home')
    .addNode('index', '/')
    .addNode('home', '/home')
    .addNode('admin', '/admin', function canActivate() { return false; });
  const fridge = new Freezer({});
  return {
    router, fridge
  };
}

// This bit is a bit ugly as it relies on the internals of router5.
// I found it needed because of the order in which the navigation callbacks
// and the plugin callbacks are invoked.
// As the goal is to check that the plugin did his duty, the safest way is to
// push a router callback that gets invoked last, *after* our plugin did his
// stuff.
export function pushRouterCallBack (router, name, fn) {
  router._cbs[name].push(fn);
}
