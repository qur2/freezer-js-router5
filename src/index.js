const pluginName = 'FREEZER';

const initialState = {
  route: null,
  previousRoute: null,
  transitionRoute: null,
  transitionError: null,
};

export default function freezerPlugin(fridge, fridgeSpot='router') {
  	let router, getSpot;

  	function init(target) {
    router = target;
    fridge.get().set(fridgeSpot, initialState);
    getSpot = () => fridge.get()[fridgeSpot];
  }

  function onTransitionStart(toState, fromState) {
    return getSpot().set({
      transitionRoute: toState,
      transitionError: null,
    });
  }

  function onTransitionSuccess(toState, fromState, opts) {
    return getSpot().set({
      transitionRoute: null,
      transitionError: null,
      previousRoute: fromState,
      route: toState,
    });
  }

  function onTransitionError(toState, fromState, err) {
    return getSpot().set({
      transitionRoute: toState,
      transitionError: err,
    });
  }

  return { name: pluginName, init, onTransitionStart, onTransitionSuccess, onTransitionError };
}
