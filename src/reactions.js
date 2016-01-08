import * as actionTypes from './actionTypes';
import plugin from './';


function onClearError(fridge, router, getSpot) {
  fridge.on(actionTypes.CLEAR_ERROR, function clearError() {
    getSpot().set({
      transitionRoute: null,
      transitionError: null
    });
  });
}

function onNavigateTo(fridge, router) {
  fridge.on(actionTypes.NAVIGATE_TO, function navigateTo(node, params, opts) {
    router.navigate(node, params, opts);
  });
}

function onCancelTransition(fridge, router) {
  fridge.on(actionTypes.CANCEL_TRANSITION, function cancelTransition() {
    router.cancel();
  });
}

// Simple wrapper to the original plugin that adds reactions to the freezer
// state. It is done in that way so that using the simple version does not
// pull in unneeded dependencies.
export default function refreezerPlugin(fridge, fridgeSpot) {
  let router, getSpot;
  let delegate = plugin(fridge, fridgeSpot);

	function init(target) {
    router = target;
    getSpot = () => fridge.get()[fridgeSpot];
    onClearError(fridge, router, getSpot);
    onNavigateTo(fridge, router);
    onCancelTransition(fridge, router);
    return delegate.init(target);
  }

  return { ...delegate, init };
}
