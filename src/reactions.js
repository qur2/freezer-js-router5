import * as actionTypes from './actionTypes';
import plugin from './';


const pluginName = 'REFREEZER';

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

// Simple wrapper to the original plugin that adds reactions to the freezer
// state. It is done in that way so that using the simple version does not
// pull in unneeded dependencies.
export default function refreezerPlugin(fridge, fridgeSpot='router') {
  const delegate = plugin(fridge, fridgeSpot);
  const getSpot = () => fridge.get()[fridgeSpot];
  return router => ({
    ...delegate(router),
    onStart() {
      onClearError(fridge, router, getSpot);
      onNavigateTo(fridge, router);
    },
    onStop() {
      // should clear freezer reactions
    },
    name: pluginName,
  })
}
