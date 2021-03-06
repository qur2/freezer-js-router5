import sinon from 'sinon';
import test from 'blue-tape';
import freezerPlugin, { actionTypes } from '../';
import { setup, pushRouterCallBack } from './testutils';


test('Sets a routing property in the state on plugin registration', t => {
  const { fridge, router } = setup();
  const plugin = freezerPlugin(fridge, 'theSpot');
  router.usePlugin(plugin);
  t.deepEqual(fridge.get().theSpot, {
    route: null,
    previousRoute: null,
    transitionRoute: null,
    transitionError: null,
  }, 'routing information is there and empty');
  t.end();
});

test('Preserves the initial state on plugin registration', t => {
  const { fridge, router } = setup();
  fridge.get().set('theSpot', {route: {name: 'server-side rendered'}})
  const plugin = freezerPlugin(fridge, 'theSpot');
  router.usePlugin(plugin);
  t.deepEqual(fridge.get().theSpot, {
    route: {name: 'server-side rendered'},
    previousRoute: null,
    transitionRoute: null,
    transitionError: null,
  }, 'original information was not overwritten');
  t.end();
});

test('Syncs router state on start', t => {
  const { fridge, router } = setup();
  const plugin = freezerPlugin(fridge, 'theSpot');
  router.usePlugin(plugin);
  var cb = () => {
    t.deepEqual(fridge.get().theSpot, {
      route: null,
      previousRoute: null,
      transitionRoute: {name: 'home', path: '/home', params: {}, _meta: {home: {}}},
      transitionError: null,
    }, 'with a transition route');
    t.end();
  };
  pushRouterCallBack(router, '$$start', cb);
  router.start();
});

test('Syncs router state on transition success', t => {
  const { fridge, router } = setup();
  const plugin = freezerPlugin(fridge, 'theSpot');
  router.usePlugin(plugin);
  var cb = () => {
    t.deepEqual(fridge.get().theSpot, {
      route: {name: 'home', path: '/home', params: {}, _meta: {home: {}}},
      previousRoute: null,
      transitionRoute: null,
      transitionError: null,
    }, 'with a route');
    t.end();
  };
  pushRouterCallBack(router, '$$success', cb);
  router.start(function (err, state) {
    router.navigate('/home');
  });
});

test('Syncs router state on transition error', t => {
  const { fridge, router } = setup();
  const plugin = freezerPlugin(fridge, 'theSpot');
  router.usePlugin(plugin);
  var cb = () => {
    t.deepEqual(fridge.get().theSpot, {
      route: {name: 'home', path: '/home', params: {}, _meta: {home: {}}},
      previousRoute: null,
      transitionRoute: null,
      transitionError: {code: 'ROUTE_NOT_FOUND'},
    }, 'with a transition error');
    t.end();
  };
  pushRouterCallBack(router, '$$error', cb);
  router.start(function (err, state) {
    router.navigate('nowhere');
  });
});

test('Syncs router state after multiple successful transitions', t => {
  const { fridge, router } = setup();
  const plugin = freezerPlugin(fridge, 'theSpot');
  router.usePlugin(plugin);
  var cb = () => {
    t.deepEqual(fridge.get().theSpot, {
      route: {name: 'index', path: '/', params: {}, _meta: {index: {}}},
      previousRoute: {name: 'home', path: '/home', params: {}, _meta: {home: {}}},
      transitionRoute: null,
      transitionError: null,
    });
    t.end();
  };
  router.start(function (err, state) {
    router.navigate('home', {}, {}, function (err) {
      pushRouterCallBack(router, '$$success', cb);
      router.navigate('index');
    });
  });
});

test('Syncs router state after multiple mixed transitions', t => {
  const { fridge, router } = setup();
  const plugin = freezerPlugin(fridge, 'theSpot');
  router.usePlugin(plugin);
  var cb = () => {
    t.deepEqual(fridge.get().theSpot, {
      route: {name: 'index', path: '/', params: {}, _meta: {index: {}}},
      previousRoute: {name: 'home', path: '/home', params: {}, _meta: {home: {}}},
      transitionRoute: null,
      transitionError: {code: 'ROUTE_NOT_FOUND'},
    });
    t.end();
  };
  router.start(function (err, state) {
    router.navigate('index', {}, {}, function (err) {
      pushRouterCallBack(router, '$$error', cb);
      router.navigate('nowhere');
    });
  });
});

test('Syncs router state on inactivable transition', t => {
  const { fridge, router } = setup();
  const plugin = freezerPlugin(fridge, 'theSpot');
  router.usePlugin(plugin);
  var cb = () => {
    t.deepEqual(fridge.get().theSpot, {
      route: {name: 'index', path: '/', params: {}, _meta: {index: {}}},
      previousRoute: {name: 'home', path: '/home', params: {}, _meta: {home: {}}},
      transitionRoute: {name: 'admin', path: '/admin', params: {}, _meta: {admin: {}}},
      transitionError: {code: 'CANNOT_ACTIVATE', segment: 'admin'},
    });
    t.end();
  };
  router.start(function (err, state) {
    router.navigate('index', {}, {}, function (err) {
      pushRouterCallBack(router, '$$error', cb);
      router.navigate('admin');
    });
  });
});

test('Triggers event on router start', t => {
  const { fridge, router } = setup();
  const plugin = freezerPlugin(fridge, 'theSpot');
  router.usePlugin(plugin);
  const spy = sinon.spy();
  fridge.on(actionTypes.TRANSITION_START, spy);
  router.start((err, state) => {
    t.true(spy.calledOnce);
    t.deepEqual(spy.args[0], [
      {name: 'home', path: '/home', params: {}, _meta: {home: {}}},
      null
    ]);
    t.end();
  });
});

test('Triggers event on router success', t => {
  const { fridge, router } = setup();
  const plugin = freezerPlugin(fridge, 'theSpot');
  router.usePlugin(plugin);
  const spy = sinon.spy();
  fridge.on(actionTypes.TRANSITION_SUCCESS, spy);
  router.start(function (err, state) {
    router.navigate('home', {}, {}, err => {
      router.navigate('index', {}, {}, err => {
        t.deepEqual(spy.args[0], [
          {name: 'home', path: '/home', params: {}, _meta: {home: {}}},
          null,
          {replace: true}
        ]);
        t.deepEqual(spy.args[1], [
          {name: 'index', path: '/', params: {}, _meta: {index: {}}},
          {name: 'home', path: '/home', params: {}, _meta: {home: {}}},
          {}
        ]);
        t.end();
      });
    });
  });
});

test('Triggers event on router error', t => {
  const { fridge, router } = setup();
  const plugin = freezerPlugin(fridge, 'theSpot');
  router.usePlugin(plugin);
  const spy = sinon.spy();
  fridge.on(actionTypes.TRANSITION_ERROR, spy);
  var cb = () => {
    t.deepEqual(spy.args[0], [
      null,
      {name: 'index', path: '/', params: {}, _meta: {index: {}}},
      {code: 'ROUTE_NOT_FOUND'}
    ]);
    t.end();
  };
  router.start(function (err, state) {
    router.navigate('index', {}, {}, function (err) {
      pushRouterCallBack(router, '$$error', cb);
      router.navigate('nowhere');
    });
  });
});

test('Triggers event on inactivable route', t => {
  const { fridge, router } = setup();
  const plugin = freezerPlugin(fridge, 'theSpot');
  router.usePlugin(plugin);
  const spy = sinon.spy();
  fridge.on(actionTypes.TRANSITION_ERROR, spy);
  var cb = () => {
    t.deepEqual(spy.args[0], [
      {name: 'admin', path: '/admin', params: {}, _meta: {admin: {}}},
      {name: 'index', path: '/', params: {}, _meta: {index: {}}},
      {code: 'CANNOT_ACTIVATE', segment: 'admin'}
    ]);
    t.end();
  };
  router.start(function (err, state) {
    router.navigate('index', {}, {}, function (err) {
      pushRouterCallBack(router, '$$error', cb);
      router.navigate('admin');
    });
  });
});
