'use strict';

/**
 * Most of the code is taken from https://github.com/iVis-at-Bilkent/cytoscape.js
 * and adapted
 */

var C2S = require('canvas2svg');

var CRp = {};
var is = {};

is.number = obj =>
  obj != null && typeof obj === typeof 1 && !isNaN( obj );

CRp.bufferCanvasImage = function( options, cy){

  //disable usePaths temporarily
  var usePaths = cy.renderer().usePaths;
  cy.renderer().usePaths = () => {return false;}
  // flush path cache
  cy.elements().forEach(function(ele) {
    ele._private.rscratch.pathCacheKey = null;
    ele._private.rscratch.pathCache = null;
  });

  var renderer = cy.renderer();
  var eles = cy.mutableElements();
  var bb = eles.boundingBox();
  var ctrRect = renderer.findContainerClientCoords();
  var width = options.full ? Math.ceil( bb.w ) : ctrRect[2];
  var height = options.full ? Math.ceil( bb.h ) : ctrRect[3];
  var specdMaxDims = is.number( options.maxWidth ) || is.number( options.maxHeight );
  var pxRatio = renderer.getPixelRatio();
  var scale = 1;

  if( options.scale !== undefined ){
    width *= options.scale;
    height *= options.scale;

    scale = options.scale;
  } else if( specdMaxDims ){
    var maxScaleW = Infinity;
    var maxScaleH = Infinity;

    if( is.number( options.maxWidth ) ){
      maxScaleW = scale * options.maxWidth / width;
    }

    if( is.number( options.maxHeight ) ){
      maxScaleH = scale * options.maxHeight / height;
    }

    scale = Math.min( maxScaleW, maxScaleH );

    width *= scale;
    height *= scale;
  }

  if( !specdMaxDims ){
    width *= pxRatio;
    height *= pxRatio;
    scale *= pxRatio;
  }

  var buffCxt = null;
  var buffCanvas = buffCxt = new C2S(width, height);

  // Rasterize the layers, but only if container has nonzero size
  if( width > 0 && height > 0 ){

    buffCxt.clearRect( 0, 0, width, height );

    buffCxt.globalCompositeOperation = 'source-over';

    var zsortedEles = renderer.getCachedZSortedEles();

    if( options.full ){ // draw the full bounds of the graph
      buffCxt.translate( -bb.x1 * scale, -bb.y1 * scale );
      buffCxt.scale( scale, scale );

      renderer.drawElements( buffCxt, zsortedEles );

      buffCxt.scale( 1/scale, 1/scale );
      buffCxt.translate( bb.x1 * scale, bb.y1 * scale );
    } else { // draw the current view
      var pan = cy.pan();

      var translation = {
        x: pan.x * scale,
        y: pan.y * scale
      };

      scale *= cy.zoom();

      buffCxt.translate( translation.x, translation.y );
      buffCxt.scale( scale, scale );

      renderer.drawElements( buffCxt, zsortedEles );

      buffCxt.scale( 1/scale, 1/scale );
      buffCxt.translate( -translation.x, -translation.y );
    }

    // need to fill bg at end like this in order to fill cleared transparent pixels in jpgs
    if( options.bg ){
      buffCxt.globalCompositeOperation = 'destination-over';

      buffCxt.fillStyle = options.bg;
      buffCxt.rect( 0, 0, width, height );
      buffCxt.fill();
    }
  }

  // restore usePaths to default value
  cy.renderer().usePaths = usePaths;
  return buffCanvas;
};

function output( options, canvas){
    return canvas.getSerializedSvg();
}

CRp.svg = function( options ){
  return output( options, CRp.bufferCanvasImage( options, this ));
};

module.exports = CRp;
