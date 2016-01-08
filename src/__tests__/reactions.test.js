import sinon from 'sinon';
import test from 'blue-tape';
import { actionTypes } from '../';
import refreezerPlugin from '../reactions';
import { setup, pushRouterCallBack } from './testutils';


test('Calls router.navigate when NAVIGATE_TO is triggered', t => {
  const { fridge, router } = setup();
  const plugin = refreezerPlugin(fridge, 'router');
  router.usePlugin(plugin);
  const spy = sinon.spy(router, 'navigate');
  fridge.trigger(actionTypes.NAVIGATE_TO, 'some', 'params', 'opts');
  t.true(spy.calledOnce);
  t.deepEqual(spy.args[0], ['some', 'params', 'opts']);
  t.end();
});

test('Calls router.cancel when CANCEL_TRANSITION is triggered', t => {
  const { fridge, router } = setup();
  const plugin = refreezerPlugin(fridge, 'router');
  router.usePlugin(plugin);
  const spy = sinon.spy(router, 'cancel');
  fridge.trigger(actionTypes.CANCEL_TRANSITION);
  t.true(spy.calledOnce);
  t.deepEqual(spy.args[0], []);
  t.end();
});

test('clears error when CLEAR_ERROR is triggered', t => {
  const { fridge, router } = setup();
  const plugin = refreezerPlugin(fridge, 'router');
  router.usePlugin(plugin);
  const spy = sinon.spy(router, 'cancel');
  fridge.trigger(actionTypes.CLEAR_ERROR);

  var cb = () => {
    t.deepEqual(fridge.get().router, {
      route: {name: 'index', path: '/', params: {}, _meta: {index: {}}},
      previousRoute: {name: 'home', path: '/home', params: {}, _meta: {home: {}}},
      transitionRoute: {name: 'admin', path: '/admin', params: {}, _meta: {admin: {}}},
      transitionError: {code: 'CANNOT_ACTIVATE', segment: 'admin'},
    });
    fridge.trigger(actionTypes.CLEAR_ERROR);
    t.deepEqual(fridge.get().router, {
      route: {name: 'index', path: '/', params: {}, _meta: {index: {}}},
      previousRoute: {name: 'home', path: '/home', params: {}, _meta: {home: {}}},
      transitionRoute: null,
      transitionError: null,
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
