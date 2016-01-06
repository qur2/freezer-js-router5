# freezer-router5

Router5 plugin for using [freezer-js](https://github.com/arqex/freezer) along
with [router5](http://router5.github.io/). The plugin will sync routing state
in a freezer instance.

Loosely based on [redux-router5 plugin](https://github.com/router5/redux-router5).


# example

```js
import Freezer from 'freezer-js';
import { Router5 } from 'router5';
import freezerPlugin from 'freezer-router5';


const router = new Router5()
  .setOption('defaultRoute', 'home')
  .addNode('index', '/')
  .addNode('home', '/home')
  .addNode('admin', '/admin', function canActivate() { return false; });
const fridge = new Freezer({});
const plugin = freezerPlugin(fridge, 'fridgeSpot'); // second argument defaults to 'router'
router.usePlugin(plugin);

// from now on, router state is kept fresh in the fridge
router.start(function (err, state) {
  router.navigate('/home' /* ... */);
});
```


## install

```sh
npm i freezer-js-router5 -S
```

Note that router5 and freezer-js are peer dependencies. Depending on you
package manager, you might have to provide them yourself.


## extra notes

The bundling scripts are from https://github.com/gilbox/react-derive.
