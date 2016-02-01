import * as actionTypes from './actionTypes';


const pluginName = 'FREEZER';

const initialState = {
  route: null,
  previousRoute: null,
  transitionRoute: null,
  transitionError: null,
};

export default function freezerPlugin(fridge, fridgeSpot='router') {
  const getSpot = function () {
    return fridge.get()[fridgeSpot];
  };
  const currentSpot = Object.assign({}, initialState, getSpot())
  fridge.get().set(fridgeSpot, currentSpot);

  return router => ({
    name: pluginName,

    onTransitionStart (toState, fromState) {
      fridge.trigger(actionTypes.TRANSITION_START, toState, fromState);
      return getSpot().set({
        transitionRoute: toState,
        transitionError: null,
      });
    },

    onTransitionSuccess (toState, fromState, opts) {
      fridge.trigger(actionTypes.TRANSITION_SUCCESS, toState, fromState, opts);
      return getSpot().set({
        transitionRoute: null,
        transitionError: null,
        previousRoute: fromState,
        route: toState,
      });
    },

    onTransitionError (toState, fromState, err) {
      fridge.trigger(actionTypes.TRANSITION_ERROR, toState, fromState, err);
      return getSpot().set({
        transitionRoute: toState,
        transitionError: err,
      });
    },
  })
}

export { actionTypes };
