cytoscape-svg
================================================================================


## Description

Export the current graph view as an SVG image. ([demo](https://kinimesi.github.io/cytoscape-svg))

The exported SVG can be saved as a PDF with [svg2pdf.js](https://github.com/yWorks/svg2pdf.js) libary. See an example in `demo.html`

## Dependencies

 * Cytoscape.js ^3.2.0
 * canvas2svg


## Usage instructions

Download the library:
 * via npm: `npm install cytoscape-svg`,
 * via bower: `bower install cytoscape-svg`, or
 * via direct download in the repository (probably from a tag).

Import the library as appropriate for your project:

ES import:

```js
import cytoscape from 'cytoscape';
import svg from 'cytoscape-svg';

cytoscape.use( svg );
```

CommonJS require:

```js
let cytoscape = require('cytoscape');
let svg = require('cytoscape-svg');

cytoscape.use( svg ); // register extension
```

AMD:

```js
require(['cytoscape', 'cytoscape-svg'], function( cytoscape, svg ){
  svg( cytoscape ); // register extension
});
```

Plain HTML/JS has the extension registered for you automatically, because no `require()` is needed.


## API

```js
cy.svg(options)
```
* **options**: the export options
    * **full**: Whether to export the current viewport view (false, default) or the entire graph (true).
    * **scale**: This value specifies a positive number that scales the size of the resultant image.
    * **bg**: The background color of the SVG (transparent by default).


## Build targets

* `npm run test` : Run Mocha tests in `./test`
* `npm run build` : Build `./src/**` into `cytoscape-svg.js`
* `npm run watch` : Automatically build on changes with live reloading (N.b. you must already have an HTTP server running)
* `npm run dev` : Automatically build on changes with live reloading with webpack dev server
* `npm run lint` : Run eslint on the source

N.b. all builds use babel, so modern ES features can be used in the `src`.


## Publishing instructions

This project is set up to automatically be published to npm and bower.  To publish:

1. Build the extension : `npm run build:release`
1. Commit the build : `git commit -am "Build for release"`
1. Bump the version number and tag: `npm version major|minor|patch`
1. Push to origin: `git push && git push --tags`
1. Publish to npm: `npm publish .`
1. If publishing to bower for the first time, you'll need to run `bower register cytoscape-svg https://github.com/kinimesi/cytoscape-svg.git`
1. [Make a new release](https://github.com/kinimesi/cytoscape-svg/releases/new) for Zenodo.
