(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["cytoscapeSvg"] = factory();
	else
		root["cytoscapeSvg"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Most of the code is taken from https://github.com/iVis-at-Bilkent/cytoscape.js
 * and adapted
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var C2S = __webpack_require__(2);

var CRp = {};
var is = {};

is.number = function (obj) {
  return obj != null && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === _typeof(1) && !isNaN(obj);
};

CRp.bufferCanvasImage = function (options, cy) {

  //disable usePaths temporarily
  var usePaths = cy.renderer().usePaths;
  cy.renderer().usePaths = function () {
    return false;
  };
  // flush path cache
  cy.elements().forEach(function (ele) {
    ele._private.rscratch.pathCacheKey = null;
    ele._private.rscratch.pathCache = null;
  });

  var renderer = cy.renderer();
  var eles = cy.mutableElements();
  var bb = eles.boundingBox();
  var ctrRect = renderer.findContainerClientCoords();
  var width = options.full ? Math.ceil(bb.w) : ctrRect[2];
  var height = options.full ? Math.ceil(bb.h) : ctrRect[3];
  var specdMaxDims = is.number(options.maxWidth) || is.number(options.maxHeight);
  var pxRatio = renderer.getPixelRatio();
  var scale = 1;

  if (options.scale !== undefined) {
    width *= options.scale;
    height *= options.scale;

    scale = options.scale;
  } else if (specdMaxDims) {
    var maxScaleW = Infinity;
    var maxScaleH = Infinity;

    if (is.number(options.maxWidth)) {
      maxScaleW = scale * options.maxWidth / width;
    }

    if (is.number(options.maxHeight)) {
      maxScaleH = scale * options.maxHeight / height;
    }

    scale = Math.min(maxScaleW, maxScaleH);

    width *= scale;
    height *= scale;
  }

  if (!specdMaxDims) {
    width *= pxRatio;
    height *= pxRatio;
    scale *= pxRatio;
  }

  var buffCxt = null;
  var buffCanvas = buffCxt = new C2S(width, height);

  // Rasterize the layers, but only if container has nonzero size
  if (width > 0 && height > 0) {

    buffCxt.clearRect(0, 0, width, height);

    buffCxt.globalCompositeOperation = 'source-over';

    var zsortedEles = renderer.getCachedZSortedEles();

    if (options.full) {
      // draw the full bounds of the graph
      buffCxt.translate(-bb.x1 * scale, -bb.y1 * scale);
      buffCxt.scale(scale, scale);

      renderer.drawElements(buffCxt, zsortedEles);

      buffCxt.scale(1 / scale, 1 / scale);
      buffCxt.translate(bb.x1 * scale, bb.y1 * scale);
    } else {
      // draw the current view
      var pan = cy.pan();

      var translation = {
        x: pan.x * scale,
        y: pan.y * scale
      };

      scale *= cy.zoom();

      buffCxt.translate(translation.x, translation.y);
      buffCxt.scale(scale, scale);

      renderer.drawElements(buffCxt, zsortedEles);

      buffCxt.scale(1 / scale, 1 / scale);
      buffCxt.translate(-translation.x, -translation.y);
    }

    // need to fill bg at end like this in order to fill cleared transparent pixels in jpgs
    if (options.bg) {
      buffCxt.globalCompositeOperation = 'destination-over';

      buffCxt.fillStyle = options.bg;
      buffCxt.rect(0, 0, width, height);
      buffCxt.fill();
    }
  }

  // restore usePaths to default value
  cy.renderer().usePaths = usePaths;
  return buffCanvas;
};

function output(canvas) {
  return canvas.getSerializedSvg();
}

CRp.svg = function (options) {
  return output(CRp.bufferCanvasImage(options || {}, this));
};

module.exports = CRp;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var impl = __webpack_require__(0);

// registers the extension on a cytoscape lib ref
var register = function register(cytoscape) {
  if (!cytoscape) {
    return;
  } // can't register if cytoscape unspecified

  cytoscape('core', 'svg', impl.svg); // register with cytoscape.js
};

if (typeof cytoscape !== 'undefined') {
  // expose to global cytoscape (i.e. window.cytoscape)
  register(cytoscape);
}

module.exports = register;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

/*!!
 *  Canvas 2 Svg v1.0.19
 *  A low level canvas to SVG converter. Uses a mock canvas context to build an SVG document.
 *
 *  Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  Author:
 *  Kerry Liu
 *
 *  Copyright (c) 2014 Gliffy Inc.
 */

;(function () {
    "use strict";

    var STYLES, ctx, CanvasGradient, CanvasPattern, namedEntities;

    //helper function to format a string
    function format(str, args) {
        var keys = Object.keys(args), i;
        for (i=0; i<keys.length; i++) {
            str = str.replace(new RegExp("\\{" + keys[i] + "\\}", "gi"), args[keys[i]]);
        }
        return str;
    }

    //helper function that generates a random string
    function randomString(holder) {
        var chars, randomstring, i;
        if (!holder) {
            throw new Error("cannot create a random attribute name for an undefined object");
        }
        chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        randomstring = "";
        do {
            randomstring = "";
            for (i = 0; i < 12; i++) {
                randomstring += chars[Math.floor(Math.random() * chars.length)];
            }
        } while (holder[randomstring]);
        return randomstring;
    }

    //helper function to map named to numbered entities
    function createNamedToNumberedLookup(items, radix) {
        var i, entity, lookup = {}, base10, base16;
        items = items.split(',');
        radix = radix || 10;
        // Map from named to numbered entities.
        for (i = 0; i < items.length; i += 2) {
            entity = '&' + items[i + 1] + ';';
            base10 = parseInt(items[i], radix);
            lookup[entity] = '&#'+base10+';';
        }
        //FF and IE need to create a regex from hex values ie &nbsp; == \xa0
        lookup["\\xa0"] = '&#160;';
        return lookup;
    }

    //helper function to map canvas-textAlign to svg-textAnchor
    function getTextAnchor(textAlign) {
        //TODO: support rtl languages
        var mapping = {"left":"start", "right":"end", "center":"middle", "start":"start", "end":"end"};
        return mapping[textAlign] || mapping.start;
    }

    //helper function to map canvas-textBaseline to svg-dominantBaseline
    function getDominantBaseline(textBaseline) {
        //INFO: not supported in all browsers
        var mapping = {"alphabetic": "alphabetic", "hanging": "hanging", "top":"text-before-edge", "bottom":"text-after-edge", "middle":"central"};
        return mapping[textBaseline] || mapping.alphabetic;
    }

    // Unpack entities lookup where the numbers are in radix 32 to reduce the size
    // entity mapping courtesy of tinymce
    namedEntities = createNamedToNumberedLookup(
        '50,nbsp,51,iexcl,52,cent,53,pound,54,curren,55,yen,56,brvbar,57,sect,58,uml,59,copy,' +
            '5a,ordf,5b,laquo,5c,not,5d,shy,5e,reg,5f,macr,5g,deg,5h,plusmn,5i,sup2,5j,sup3,5k,acute,' +
            '5l,micro,5m,para,5n,middot,5o,cedil,5p,sup1,5q,ordm,5r,raquo,5s,frac14,5t,frac12,5u,frac34,' +
            '5v,iquest,60,Agrave,61,Aacute,62,Acirc,63,Atilde,64,Auml,65,Aring,66,AElig,67,Ccedil,' +
            '68,Egrave,69,Eacute,6a,Ecirc,6b,Euml,6c,Igrave,6d,Iacute,6e,Icirc,6f,Iuml,6g,ETH,6h,Ntilde,' +
            '6i,Ograve,6j,Oacute,6k,Ocirc,6l,Otilde,6m,Ouml,6n,times,6o,Oslash,6p,Ugrave,6q,Uacute,' +
            '6r,Ucirc,6s,Uuml,6t,Yacute,6u,THORN,6v,szlig,70,agrave,71,aacute,72,acirc,73,atilde,74,auml,' +
            '75,aring,76,aelig,77,ccedil,78,egrave,79,eacute,7a,ecirc,7b,euml,7c,igrave,7d,iacute,7e,icirc,' +
            '7f,iuml,7g,eth,7h,ntilde,7i,ograve,7j,oacute,7k,ocirc,7l,otilde,7m,ouml,7n,divide,7o,oslash,' +
            '7p,ugrave,7q,uacute,7r,ucirc,7s,uuml,7t,yacute,7u,thorn,7v,yuml,ci,fnof,sh,Alpha,si,Beta,' +
            'sj,Gamma,sk,Delta,sl,Epsilon,sm,Zeta,sn,Eta,so,Theta,sp,Iota,sq,Kappa,sr,Lambda,ss,Mu,' +
            'st,Nu,su,Xi,sv,Omicron,t0,Pi,t1,Rho,t3,Sigma,t4,Tau,t5,Upsilon,t6,Phi,t7,Chi,t8,Psi,' +
            't9,Omega,th,alpha,ti,beta,tj,gamma,tk,delta,tl,epsilon,tm,zeta,tn,eta,to,theta,tp,iota,' +
            'tq,kappa,tr,lambda,ts,mu,tt,nu,tu,xi,tv,omicron,u0,pi,u1,rho,u2,sigmaf,u3,sigma,u4,tau,' +
            'u5,upsilon,u6,phi,u7,chi,u8,psi,u9,omega,uh,thetasym,ui,upsih,um,piv,812,bull,816,hellip,' +
            '81i,prime,81j,Prime,81u,oline,824,frasl,88o,weierp,88h,image,88s,real,892,trade,89l,alefsym,' +
            '8cg,larr,8ch,uarr,8ci,rarr,8cj,darr,8ck,harr,8dl,crarr,8eg,lArr,8eh,uArr,8ei,rArr,8ej,dArr,' +
            '8ek,hArr,8g0,forall,8g2,part,8g3,exist,8g5,empty,8g7,nabla,8g8,isin,8g9,notin,8gb,ni,8gf,prod,' +
            '8gh,sum,8gi,minus,8gn,lowast,8gq,radic,8gt,prop,8gu,infin,8h0,ang,8h7,and,8h8,or,8h9,cap,8ha,cup,' +
            '8hb,int,8hk,there4,8hs,sim,8i5,cong,8i8,asymp,8j0,ne,8j1,equiv,8j4,le,8j5,ge,8k2,sub,8k3,sup,8k4,' +
            'nsub,8k6,sube,8k7,supe,8kl,oplus,8kn,otimes,8l5,perp,8m5,sdot,8o8,lceil,8o9,rceil,8oa,lfloor,8ob,' +
            'rfloor,8p9,lang,8pa,rang,9ea,loz,9j0,spades,9j3,clubs,9j5,hearts,9j6,diams,ai,OElig,aj,oelig,b0,' +
            'Scaron,b1,scaron,bo,Yuml,m6,circ,ms,tilde,802,ensp,803,emsp,809,thinsp,80c,zwnj,80d,zwj,80e,lrm,' +
            '80f,rlm,80j,ndash,80k,mdash,80o,lsquo,80p,rsquo,80q,sbquo,80s,ldquo,80t,rdquo,80u,bdquo,810,dagger,' +
            '811,Dagger,81g,permil,81p,lsaquo,81q,rsaquo,85c,euro', 32);


    //Some basic mappings for attributes and default values.
    STYLES = {
        "strokeStyle":{
            svgAttr : "stroke", //corresponding svg attribute
            canvas : "#000000", //canvas default
            svg : "none",       //svg default
            apply : "stroke"    //apply on stroke() or fill()
        },
        "fillStyle":{
            svgAttr : "fill",
            canvas : "#000000",
            svg : null, //svg default is black, but we need to special case this to handle canvas stroke without fill
            apply : "fill"
        },
        "lineCap":{
            svgAttr : "stroke-linecap",
            canvas : "butt",
            svg : "butt",
            apply : "stroke"
        },
        "lineJoin":{
            svgAttr : "stroke-linejoin",
            canvas : "miter",
            svg : "miter",
            apply : "stroke"
        },
        "miterLimit":{
            svgAttr : "stroke-miterlimit",
            canvas : 10,
            svg : 4,
            apply : "stroke"
        },
        "lineWidth":{
            svgAttr : "stroke-width",
            canvas : 1,
            svg : 1,
            apply : "stroke"
        },
        "globalAlpha": {
            svgAttr : "opacity",
            canvas : 1,
            svg : 1,
            apply :  "fill stroke"
        },
        "font":{
            //font converts to multiple svg attributes, there is custom logic for this
            canvas : "10px sans-serif"
        },
        "shadowColor":{
            canvas : "#000000"
        },
        "shadowOffsetX":{
            canvas : 0
        },
        "shadowOffsetY":{
            canvas : 0
        },
        "shadowBlur":{
            canvas : 0
        },
        "textAlign":{
            canvas : "start"
        },
        "textBaseline":{
            canvas : "alphabetic"
        },
        "lineDash" : {
            svgAttr : "stroke-dasharray",
            canvas : [],
            svg : null,
            apply : "stroke"
        }
    };

    /**
     *
     * @param gradientNode - reference to the gradient
     * @constructor
     */
    CanvasGradient = function (gradientNode, ctx) {
        this.__root = gradientNode;
        this.__ctx = ctx;
    };

    /**
     * Adds a color stop to the gradient root
     */
    CanvasGradient.prototype.addColorStop = function (offset, color) {
        var stop = this.__ctx.__createElement("stop"), regex, matches;
        stop.setAttribute("offset", offset);
        if (color.indexOf("rgba") !== -1) {
            //separate alpha value, since webkit can't handle it
            regex = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d?\.?\d*)\s*\)/gi;
            matches = regex.exec(color);
            stop.setAttribute("stop-color", format("rgb({r},{g},{b})", {r:matches[1], g:matches[2], b:matches[3]}));
            stop.setAttribute("stop-opacity", matches[4]);
        } else {
            stop.setAttribute("stop-color", color);
        }
        this.__root.appendChild(stop);
    };

    CanvasPattern = function (pattern, ctx) {
        this.__root = pattern;
        this.__ctx = ctx;
    };

    /**
     * The mock canvas context
     * @param o - options include:
     * ctx - existing Context2D to wrap around
     * width - width of your canvas (defaults to 500)
     * height - height of your canvas (defaults to 500)
     * enableMirroring - enables canvas mirroring (get image data) (defaults to false)
     * document - the document object (defaults to the current document)
     */
    ctx = function (o) {
        var defaultOptions = { width:500, height:500, enableMirroring : false}, options;

        //keep support for this way of calling C2S: new C2S(width,height)
        if (arguments.length > 1) {
            options = defaultOptions;
            options.width = arguments[0];
            options.height = arguments[1];
        } else if ( !o ) {
            options = defaultOptions;
        } else {
            options = o;
        }

        if (!(this instanceof ctx)) {
            //did someone call this without new?
            return new ctx(options);
        }

        //setup options
        this.width = options.width || defaultOptions.width;
        this.height = options.height || defaultOptions.height;
        this.enableMirroring = options.enableMirroring !== undefined ? options.enableMirroring : defaultOptions.enableMirroring;

        this.canvas = this;   ///point back to this instance!
        this.__document = options.document || document;

        // allow passing in an existing context to wrap around
        // if a context is passed in, we know a canvas already exist
        if (options.ctx) {
            this.__ctx = options.ctx;
        } else {
            this.__canvas = this.__document.createElement("canvas");
            this.__ctx = this.__canvas.getContext("2d");
        }

        this.__setDefaultStyles();
        this.__stack = [this.__getStyleState()];
        this.__groupStack = [];

        //the root svg element
        this.__root = this.__document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.__root.setAttribute("version", 1.1);
        this.__root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        this.__root.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        this.__root.setAttribute("width", this.width);
        this.__root.setAttribute("height", this.height);

        //make sure we don't generate the same ids in defs
        this.__ids = {};

        //defs tag
        this.__defs = this.__document.createElementNS("http://www.w3.org/2000/svg", "defs");
        this.__root.appendChild(this.__defs);

        //also add a group child. the svg element can't use the transform attribute
        this.__currentElement = this.__document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.__root.appendChild(this.__currentElement);
    };


    /**
     * Creates the specified svg element
     * @private
     */
    ctx.prototype.__createElement = function (elementName, properties, resetFill) {
        if (typeof properties === "undefined") {
            properties = {};
        }

        var element = this.__document.createElementNS("http://www.w3.org/2000/svg", elementName),
            keys = Object.keys(properties), i, key;
        if (resetFill) {
            //if fill or stroke is not specified, the svg element should not display. By default SVG's fill is black.
            element.setAttribute("fill", "none");
            element.setAttribute("stroke", "none");
        }
        for (i=0; i<keys.length; i++) {
            key = keys[i];
            element.setAttribute(key, properties[key]);
        }
        return element;
    };

    /**
     * Applies default canvas styles to the context
     * @private
     */
    ctx.prototype.__setDefaultStyles = function () {
        //default 2d canvas context properties see:http://www.w3.org/TR/2dcontext/
        var keys = Object.keys(STYLES), i, key;
        for (i=0; i<keys.length; i++) {
            key = keys[i];
            this[key] = STYLES[key].canvas;
        }
    };

    /**
     * Applies styles on restore
     * @param styleState
     * @private
     */
    ctx.prototype.__applyStyleState = function (styleState) {
        if(!styleState)
            return;
        var keys = Object.keys(styleState), i, key;
        for (i=0; i<keys.length; i++) {
            key = keys[i];
            this[key] = styleState[key];
        }
    };

    /**
     * Gets the current style state
     * @return {Object}
     * @private
     */
    ctx.prototype.__getStyleState = function () {
        var i, styleState = {}, keys = Object.keys(STYLES), key;
        for (i=0; i<keys.length; i++) {
            key = keys[i];
            styleState[key] = this[key];
        }
        return styleState;
    };

    /**
     * Apples the current styles to the current SVG element. On "ctx.fill" or "ctx.stroke"
     * @param type
     * @private
     */
    ctx.prototype.__applyStyleToCurrentElement = function (type) {
    	var currentElement = this.__currentElement;
    	var currentStyleGroup = this.__currentElementsToStyle;
    	if (currentStyleGroup) {
    		currentElement.setAttribute(type, "");
    		currentElement = currentStyleGroup.element;
    		currentStyleGroup.children.forEach(function (node) {
    			node.setAttribute(type, "");
    		})
    	}

        var keys = Object.keys(STYLES), i, style, value, id, regex, matches;
        for (i = 0; i < keys.length; i++) {
            style = STYLES[keys[i]];
            value = this[keys[i]];
            if (style.apply) {
                //is this a gradient or pattern?
                if (value instanceof CanvasPattern) {
                    //pattern
                    if (value.__ctx) {
                        //copy over defs
                        while(value.__ctx.__defs.childNodes.length) {
                            id = value.__ctx.__defs.childNodes[0].getAttribute("id");
                            this.__ids[id] = id;
                            this.__defs.appendChild(value.__ctx.__defs.childNodes[0]);
                        }
                    }
                    currentElement.setAttribute(style.apply, format("url(#{id})", {id:value.__root.getAttribute("id")}));
                }
                else if (value instanceof CanvasGradient) {
                    //gradient
                    currentElement.setAttribute(style.apply, format("url(#{id})", {id:value.__root.getAttribute("id")}));
                } else if (style.apply.indexOf(type)!==-1 && style.svg !== value) {
                    if ((style.svgAttr === "stroke" || style.svgAttr === "fill") && value.indexOf("rgba") !== -1) {
                        //separate alpha value, since illustrator can't handle it
                        regex = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d?\.?\d*)\s*\)/gi;
                        matches = regex.exec(value);
                        currentElement.setAttribute(style.svgAttr, format("rgb({r},{g},{b})", {r:matches[1], g:matches[2], b:matches[3]}));
                        //should take globalAlpha here
                        var opacity = matches[4];
                        var globalAlpha = this.globalAlpha;
                        if (globalAlpha != null) {
                            opacity *= globalAlpha;
                        }
                        currentElement.setAttribute(style.svgAttr+"-opacity", opacity);
                    } else {
                        var attr = style.svgAttr;
                        if (keys[i] === 'globalAlpha') {
                            attr = type+'-'+style.svgAttr;
                            if (currentElement.getAttribute(attr)) {
                                 //fill-opacity or stroke-opacity has already been set by stroke or fill.
                                continue;
                            }
                        }
                        //otherwise only update attribute if right type, and not svg default
                        currentElement.setAttribute(attr, value);
                    }
                }
            }
        }
    };

    /**
     * Will return the closest group or svg node. May return the current element.
     * @private
     */
    ctx.prototype.__closestGroupOrSvg = function (node) {
        node = node || this.__currentElement;
        if (node.nodeName === "g" || node.nodeName === "svg") {
            return node;
        } else {
            return this.__closestGroupOrSvg(node.parentNode);
        }
    };

    /**
     * Returns the serialized value of the svg so far
     * @param fixNamedEntities - Standalone SVG doesn't support named entities, which document.createTextNode encodes.
     *                           If true, we attempt to find all named entities and encode it as a numeric entity.
     * @return serialized svg
     */
    ctx.prototype.getSerializedSvg = function (fixNamedEntities) {
        var serialized = new XMLSerializer().serializeToString(this.__root),
            keys, i, key, value, regexp, xmlns;

        //IE search for a duplicate xmnls because they didn't implement setAttributeNS correctly
        xmlns = /xmlns="http:\/\/www\.w3\.org\/2000\/svg".+xmlns="http:\/\/www\.w3\.org\/2000\/svg/gi;
        if (xmlns.test(serialized)) {
            serialized = serialized.replace('xmlns="http://www.w3.org/2000/svg','xmlns:xlink="http://www.w3.org/1999/xlink');
        }

        if (fixNamedEntities) {
            keys = Object.keys(namedEntities);
            //loop over each named entity and replace with the proper equivalent.
            for (i=0; i<keys.length; i++) {
                key = keys[i];
                value = namedEntities[key];
                regexp = new RegExp(key, "gi");
                if (regexp.test(serialized)) {
                    serialized = serialized.replace(regexp, value);
                }
            }
        }

        return serialized;
    };


    /**
     * Returns the root svg
     * @return
     */
    ctx.prototype.getSvg = function () {
        return this.__root;
    };
    /**
     * Will generate a group tag.
     */
    ctx.prototype.save = function () {
        var group = this.__createElement("g");
        var parent = this.__closestGroupOrSvg();
        this.__groupStack.push(parent);
        parent.appendChild(group);
        this.__currentElement = group;
        this.__stack.push(this.__getStyleState());
    };
    /**
     * Sets current element to parent, or just root if already root
     */
    ctx.prototype.restore = function () {
        this.__currentElement = this.__groupStack.pop();
        this.__currentElementsToStyle = null;
        //Clearing canvas will make the poped group invalid, currentElement is set to the root group node.
        if (!this.__currentElement) {
            this.__currentElement = this.__root.childNodes[1];
        }
        var state = this.__stack.pop();
        this.__applyStyleState(state);
    };

    /**
     * Helper method to add transform
     * @private
     */
    ctx.prototype.__addTransform = function (t) {
        //if the current element has siblings, add another group
        var parent = this.__closestGroupOrSvg();
        if (parent.childNodes.length > 0) {
        	if (this.__currentElement.nodeName === "path") {
        		if (!this.__currentElementsToStyle) this.__currentElementsToStyle = {element: parent, children: []};
        		this.__currentElementsToStyle.children.push(this.__currentElement)
        		this.__applyCurrentDefaultPath();
        	}

            var group = this.__createElement("g");
            parent.appendChild(group);
            this.__currentElement = group;
        }

        var transform = this.__currentElement.getAttribute("transform");
        if (transform) {
            transform += " ";
        } else {
            transform = "";
        }
        transform += t;
        this.__currentElement.setAttribute("transform", transform);
    };

    /**
     *  scales the current element
     */
    ctx.prototype.scale = function (x, y) {
        if (y === undefined) {
            y = x;
        }
        this.__addTransform(format("scale({x},{y})", {x:x, y:y}));
    };

    /**
     * rotates the current element
     */
    ctx.prototype.rotate = function (angle) {
        var degrees = (angle * 180 / Math.PI);
        this.__addTransform(format("rotate({angle},{cx},{cy})", {angle:degrees, cx:0, cy:0}));
    };

    /**
     * translates the current element
     */
    ctx.prototype.translate = function (x, y) {
        this.__addTransform(format("translate({x},{y})", {x:x,y:y}));
    };

    /**
     * applies a transform to the current element
     */
    ctx.prototype.transform = function (a, b, c, d, e, f) {
        this.__addTransform(format("matrix({a},{b},{c},{d},{e},{f})", {a:a, b:b, c:c, d:d, e:e, f:f}));
    };

    /**
     * Create a new Path Element
     */
    ctx.prototype.beginPath = function () {
        var path, parent;

        // Note that there is only one current default path, it is not part of the drawing state.
        // See also: https://html.spec.whatwg.org/multipage/scripting.html#current-default-path
        this.__currentDefaultPath = "";
        this.__currentPosition = {};

        path = this.__createElement("path", {}, true);
        parent = this.__closestGroupOrSvg();
        parent.appendChild(path);
        this.__currentElement = path;
    };

    /**
     * Helper function to apply currentDefaultPath to current path element
     * @private
     */
    ctx.prototype.__applyCurrentDefaultPath = function () {
    	var currentElement = this.__currentElement;
        if (currentElement.nodeName === "path") {
			currentElement.setAttribute("d", this.__currentDefaultPath);
        } else {
			console.error("Attempted to apply path command to node", currentElement.nodeName);
        }
    };

    /**
     * Helper function to add path command
     * @private
     */
    ctx.prototype.__addPathCommand = function (command) {
        this.__currentDefaultPath += " ";
        this.__currentDefaultPath += command;
    };

    /**
     * Adds the move command to the current path element,
     * if the currentPathElement is not empty create a new path element
     */
    ctx.prototype.moveTo = function (x,y) {
        if (this.__currentElement.nodeName !== "path") {
            this.beginPath();
        }

        // creates a new subpath with the given point
        this.__currentPosition = {x: x, y: y};
        this.__addPathCommand(format("M {x} {y}", {x:x, y:y}));
    };

    /**
     * Closes the current path
     */
    ctx.prototype.closePath = function () {
        if (this.__currentDefaultPath) {
            this.__addPathCommand("Z");
        }
    };

    /**
     * Adds a line to command
     */
    ctx.prototype.lineTo = function (x, y) {
        this.__currentPosition = {x: x, y: y};
        if (this.__currentDefaultPath.indexOf('M') > -1) {
            this.__addPathCommand(format("L {x} {y}", {x:x, y:y}));
        } else {
            this.__addPathCommand(format("M {x} {y}", {x:x, y:y}));
        }
    };

    /**
     * Add a bezier command
     */
    ctx.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y) {
        this.__currentPosition = {x: x, y: y};
        this.__addPathCommand(format("C {cp1x} {cp1y} {cp2x} {cp2y} {x} {y}",
            {cp1x:cp1x, cp1y:cp1y, cp2x:cp2x, cp2y:cp2y, x:x, y:y}));
    };

    /**
     * Adds a quadratic curve to command
     */
    ctx.prototype.quadraticCurveTo = function (cpx, cpy, x, y) {
        this.__currentPosition = {x: x, y: y};
        this.__addPathCommand(format("Q {cpx} {cpy} {x} {y}", {cpx:cpx, cpy:cpy, x:x, y:y}));
    };


    /**
     * Return a new normalized vector of given vector
     */
    var normalize = function (vector) {
        var len = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
        return [vector[0] / len, vector[1] / len];
    };

    /**
     * Adds the arcTo to the current path
     *
     * @see http://www.w3.org/TR/2015/WD-2dcontext-20150514/#dom-context-2d-arcto
     */
    ctx.prototype.arcTo = function (x1, y1, x2, y2, radius) {
        // Let the point (x0, y0) be the last point in the subpath.
        var x0 = this.__currentPosition && this.__currentPosition.x;
        var y0 = this.__currentPosition && this.__currentPosition.y;

        // First ensure there is a subpath for (x1, y1).
        if (typeof x0 == "undefined" || typeof y0 == "undefined") {
            return;
        }

        // Negative values for radius must cause the implementation to throw an IndexSizeError exception.
        if (radius < 0) {
            throw new Error("IndexSizeError: The radius provided (" + radius + ") is negative.");
        }

        // If the point (x0, y0) is equal to the point (x1, y1),
        // or if the point (x1, y1) is equal to the point (x2, y2),
        // or if the radius radius is zero,
        // then the method must add the point (x1, y1) to the subpath,
        // and connect that point to the previous point (x0, y0) by a straight line.
        if (((x0 === x1) && (y0 === y1))
            || ((x1 === x2) && (y1 === y2))
            || (radius === 0)) {
            this.lineTo(x1, y1);
            return;
        }

        // Otherwise, if the points (x0, y0), (x1, y1), and (x2, y2) all lie on a single straight line,
        // then the method must add the point (x1, y1) to the subpath,
        // and connect that point to the previous point (x0, y0) by a straight line.
        var unit_vec_p1_p0 = normalize([x0 - x1, y0 - y1]);
        var unit_vec_p1_p2 = normalize([x2 - x1, y2 - y1]);
        if (unit_vec_p1_p0[0] * unit_vec_p1_p2[1] === unit_vec_p1_p0[1] * unit_vec_p1_p2[0]) {
            this.lineTo(x1, y1);
            return;
        }

        // Otherwise, let The Arc be the shortest arc given by circumference of the circle that has radius radius,
        // and that has one point tangent to the half-infinite line that crosses the point (x0, y0) and ends at the point (x1, y1),
        // and that has a different point tangent to the half-infinite line that ends at the point (x1, y1), and crosses the point (x2, y2).
        // The points at which this circle touches these two lines are called the start and end tangent points respectively.

        // note that both vectors are unit vectors, so the length is 1
        var cos = (unit_vec_p1_p0[0] * unit_vec_p1_p2[0] + unit_vec_p1_p0[1] * unit_vec_p1_p2[1]);
        var theta = Math.acos(Math.abs(cos));

        // Calculate origin
        var unit_vec_p1_origin = normalize([
            unit_vec_p1_p0[0] + unit_vec_p1_p2[0],
            unit_vec_p1_p0[1] + unit_vec_p1_p2[1]
        ]);
        var len_p1_origin = radius / Math.sin(theta / 2);
        var x = x1 + len_p1_origin * unit_vec_p1_origin[0];
        var y = y1 + len_p1_origin * unit_vec_p1_origin[1];

        // Calculate start angle and end angle
        // rotate 90deg clockwise (note that y axis points to its down)
        var unit_vec_origin_start_tangent = [
            -unit_vec_p1_p0[1],
            unit_vec_p1_p0[0]
        ];
        // rotate 90deg counter clockwise (note that y axis points to its down)
        var unit_vec_origin_end_tangent = [
            unit_vec_p1_p2[1],
            -unit_vec_p1_p2[0]
        ];
        var getAngle = function (vector) {
            // get angle (clockwise) between vector and (1, 0)
            var x = vector[0];
            var y = vector[1];
            if (y >= 0) { // note that y axis points to its down
                return Math.acos(x);
            } else {
                return -Math.acos(x);
            }
        };
        var startAngle = getAngle(unit_vec_origin_start_tangent);
        var endAngle = getAngle(unit_vec_origin_end_tangent);

        // Connect the point (x0, y0) to the start tangent point by a straight line
        this.lineTo(x + unit_vec_origin_start_tangent[0] * radius,
                    y + unit_vec_origin_start_tangent[1] * radius);

        // Connect the start tangent point to the end tangent point by arc
        // and adding the end tangent point to the subpath.
        this.arc(x, y, radius, startAngle, endAngle);
    };

    /**
     * Sets the stroke property on the current element
     */
    ctx.prototype.stroke = function () {
        if (this.__currentElement.nodeName === "path") {
            this.__currentElement.setAttribute("paint-order", "fill stroke markers");
        }
        this.__applyCurrentDefaultPath();
        this.__applyStyleToCurrentElement("stroke");
    };

    /**
     * Sets fill properties on the current element
     */
    ctx.prototype.fill = function () {
        if (this.__currentElement.nodeName === "path") {
            this.__currentElement.setAttribute("paint-order", "stroke fill markers");
        }
        this.__applyCurrentDefaultPath();
        this.__applyStyleToCurrentElement("fill");
    };

    /**
     *  Adds a rectangle to the path.
     */
    ctx.prototype.rect = function (x, y, width, height) {
        if (this.__currentElement.nodeName !== "path") {
            this.beginPath();
        }
        this.moveTo(x, y);
        this.lineTo(x+width, y);
        this.lineTo(x+width, y+height);
        this.lineTo(x, y+height);
        this.lineTo(x, y);
        this.closePath();
    };


    /**
     * adds a rectangle element
     */
    ctx.prototype.fillRect = function (x, y, width, height) {
        var rect, parent;
        rect = this.__createElement("rect", {
            x : x,
            y : y,
            width : width,
            height : height
        }, true);
        parent = this.__closestGroupOrSvg();
        parent.appendChild(rect);
        this.__currentElement = rect;
        this.__applyStyleToCurrentElement("fill");
    };

    /**
     * Draws a rectangle with no fill
     * @param x
     * @param y
     * @param width
     * @param height
     */
    ctx.prototype.strokeRect = function (x, y, width, height) {
        var rect, parent;
        rect = this.__createElement("rect", {
            x : x,
            y : y,
            width : width,
            height : height
        }, true);
        parent = this.__closestGroupOrSvg();
        parent.appendChild(rect);
        this.__currentElement = rect;
        this.__applyStyleToCurrentElement("stroke");
    };


    /**
     * Clear entire canvas:
     * 1. save current transforms
     * 2. remove all the childNodes of the root g element
     */
    ctx.prototype.__clearCanvas = function () {
        var current = this.__closestGroupOrSvg(),
            transform = current.getAttribute("transform");
        var rootGroup = this.__root.childNodes[1];
        var childNodes = rootGroup.childNodes;
        for (var i = childNodes.length - 1; i >= 0; i--) {
            if (childNodes[i]) {
                rootGroup.removeChild(childNodes[i]);
            }
        }
        this.__currentElement = rootGroup;
        //reset __groupStack as all the child group nodes are all removed.
        this.__groupStack = [];
        if (transform) {
            this.__addTransform(transform);
        }
    };

    /**
     * "Clears" a canvas by just drawing a white rectangle in the current group.
     */
    ctx.prototype.clearRect = function (x, y, width, height) {
        //clear entire canvas
        if (x === 0 && y === 0 && width === this.width && height === this.height) {
            this.__clearCanvas();
            return;
        }
        var rect, parent = this.__closestGroupOrSvg();
        rect = this.__createElement("rect", {
            x : x,
            y : y,
            width : width,
            height : height,
            fill : "#FFFFFF"
        }, true);
        parent.appendChild(rect);
    };

    /**
     * Adds a linear gradient to a defs tag.
     * Returns a canvas gradient object that has a reference to it's parent def
     */
    ctx.prototype.createLinearGradient = function (x1, y1, x2, y2) {
        var grad = this.__createElement("linearGradient", {
            id : randomString(this.__ids),
            x1 : x1+"px",
            x2 : x2+"px",
            y1 : y1+"px",
            y2 : y2+"px",
            "gradientUnits" : "userSpaceOnUse"
        }, false);
        this.__defs.appendChild(grad);
        return new CanvasGradient(grad, this);
    };

    /**
     * Adds a radial gradient to a defs tag.
     * Returns a canvas gradient object that has a reference to it's parent def
     */
    ctx.prototype.createRadialGradient = function (x0, y0, r0, x1, y1, r1) {
        var grad = this.__createElement("radialGradient", {
            id : randomString(this.__ids),
            cx : x1+"px",
            cy : y1+"px",
            r  : r1+"px",
            fx : x0+"px",
            fy : y0+"px",
            "gradientUnits" : "userSpaceOnUse"
        }, false);
        this.__defs.appendChild(grad);
        return new CanvasGradient(grad, this);

    };

    /**
     * Parses the font string and returns svg mapping
     * @private
     */
    ctx.prototype.__parseFont = function () {
        var regex = /^\s*(?=(?:(?:[-a-z]+\s*){0,2}(italic|oblique))?)(?=(?:(?:[-a-z]+\s*){0,2}(small-caps))?)(?=(?:(?:[-a-z]+\s*){0,2}(bold(?:er)?|lighter|[1-9]00))?)(?:(?:normal|\1|\2|\3)\s*){0,3}((?:xx?-)?(?:small|large)|medium|smaller|larger|[.\d]+(?:\%|in|[cem]m|ex|p[ctx]))(?:\s*\/\s*(normal|[.\d]+(?:\%|in|[cem]m|ex|p[ctx])))?\s*([-,\'\"\sa-z0-9]+?)\s*$/i;
        var fontPart = regex.exec( this.font );
        var data = {
            style : fontPart[1] || 'normal',
            size : fontPart[4] || '10px',
            family : fontPart[6] || 'sans-serif',
            weight: fontPart[3] || 'normal',
            decoration : fontPart[2] || 'normal',
            href : null
        };

        //canvas doesn't support underline natively, but we can pass this attribute
        if (this.__fontUnderline === "underline") {
            data.decoration = "underline";
        }

        //canvas also doesn't support linking, but we can pass this as well
        if (this.__fontHref) {
            data.href = this.__fontHref;
        }

        return data;
    };

    /**
     * Helper to link text fragments
     * @param font
     * @param element
     * @return {*}
     * @private
     */
    ctx.prototype.__wrapTextLink = function (font, element) {
        if (font.href) {
            var a = this.__createElement("a");
            a.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", font.href);
            a.appendChild(element);
            return a;
        }
        return element;
    };

    /**
     * Fills or strokes text
     * @param text
     * @param x
     * @param y
     * @param action - stroke or fill
     * @private
     */
    ctx.prototype.__applyText = function (text, x, y, action) {
        var font = this.__parseFont(),
            parent = this.__closestGroupOrSvg(),
            textElement = this.__createElement("text", {
                "font-family" : font.family,
                "font-size" : font.size,
                "font-style" : font.style,
                "font-weight" : font.weight,
                "text-decoration" : font.decoration,
                "x" : x,
                "y" : y,
                "text-anchor": getTextAnchor(this.textAlign),
                "dominant-baseline": getDominantBaseline(this.textBaseline)
            }, true);

        textElement.appendChild(this.__document.createTextNode(text));
        this.__currentElement = textElement;
        this.__applyStyleToCurrentElement(action);
        parent.appendChild(this.__wrapTextLink(font,textElement));
    };

    /**
     * Creates a text element
     * @param text
     * @param x
     * @param y
     */
    ctx.prototype.fillText = function (text, x, y) {
        this.__applyText(text, x, y, "fill");
    };

    /**
     * Strokes text
     * @param text
     * @param x
     * @param y
     */
    ctx.prototype.strokeText = function (text, x, y) {
        this.__applyText(text, x, y, "stroke");
    };

    /**
     * No need to implement this for svg.
     * @param text
     * @return {TextMetrics}
     */
    ctx.prototype.measureText = function (text) {
        this.__ctx.font = this.font;
        return this.__ctx.measureText(text);
    };

    /**
     *  Arc command!
     */
    ctx.prototype.arc = function (x, y, radius, startAngle, endAngle, counterClockwise) {
        // in canvas no circle is drawn if no angle is provided.
        if (startAngle === endAngle) {
            return;
        }
        startAngle = startAngle % (2*Math.PI);
        endAngle = endAngle % (2*Math.PI);
        if (startAngle === endAngle) {
            //circle time! subtract some of the angle so svg is happy (svg elliptical arc can't draw a full circle)
            endAngle = ((endAngle + (2*Math.PI)) - 0.001 * (counterClockwise ? -1 : 1)) % (2*Math.PI);
        }
        var endX = x+radius*Math.cos(endAngle),
            endY = y+radius*Math.sin(endAngle),
            startX = x+radius*Math.cos(startAngle),
            startY = y+radius*Math.sin(startAngle),
            sweepFlag = counterClockwise ? 0 : 1,
            largeArcFlag = 0,
            diff = endAngle - startAngle;

        // https://github.com/gliffy/canvas2svg/issues/4
        if (diff < 0) {
            diff += 2*Math.PI;
        }

        if (counterClockwise) {
            largeArcFlag = diff > Math.PI ? 0 : 1;
        } else {
            largeArcFlag = diff > Math.PI ? 1 : 0;
        }

        this.lineTo(startX, startY);
        this.__addPathCommand(format("A {rx} {ry} {xAxisRotation} {largeArcFlag} {sweepFlag} {endX} {endY}",
            {rx:radius, ry:radius, xAxisRotation:0, largeArcFlag:largeArcFlag, sweepFlag:sweepFlag, endX:endX, endY:endY}));

        this.__currentPosition = {x: endX, y: endY};
    };

    /**
     * Generates a ClipPath from the clip command.
     */
    ctx.prototype.clip = function () {
        var group = this.__closestGroupOrSvg(),
            clipPath = this.__createElement("clipPath"),
            id =  randomString(this.__ids),
            newGroup = this.__createElement("g");

        this.__applyCurrentDefaultPath();
        group.removeChild(this.__currentElement);
        clipPath.setAttribute("id", id);
        clipPath.appendChild(this.__currentElement);

        this.__defs.appendChild(clipPath);

        //set the clip path to this group
        group.setAttribute("clip-path", format("url(#{id})", {id:id}));

        //clip paths can be scaled and transformed, we need to add another wrapper group to avoid later transformations
        // to this path
        group.appendChild(newGroup);

        this.__currentElement = newGroup;

    };

    /**
     * Draws a canvas, image or mock context to this canvas.
     * Note that all svg dom manipulation uses node.childNodes rather than node.children for IE support.
     * http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-drawimage
     */
    ctx.prototype.drawImage = function () {
        //convert arguments to a real array
        var args = Array.prototype.slice.call(arguments),
            image=args[0],
            dx, dy, dw, dh, sx=0, sy=0, sw, sh, parent, svg, defs, group,
            currentElement, svgImage, canvas, context, id;

        if (args.length === 3) {
            dx = args[1];
            dy = args[2];
            sw = image.width;
            sh = image.height;
            dw = sw;
            dh = sh;
        } else if (args.length === 5) {
            dx = args[1];
            dy = args[2];
            dw = args[3];
            dh = args[4];
            sw = image.width;
            sh = image.height;
        } else if (args.length === 9) {
            sx = args[1];
            sy = args[2];
            sw = args[3];
            sh = args[4];
            dx = args[5];
            dy = args[6];
            dw = args[7];
            dh = args[8];
        } else {
            throw new Error("Inavlid number of arguments passed to drawImage: " + arguments.length);
        }

        parent = this.__closestGroupOrSvg();
        currentElement = this.__currentElement;
        var translateDirective = "translate(" + dx + ", " + dy + ")";
        if (image instanceof ctx) {
            //canvas2svg mock canvas context. In the future we may want to clone nodes instead.
            //also I'm currently ignoring dw, dh, sw, sh, sx, sy for a mock context.
            svg = image.getSvg().cloneNode(true);
            if (svg.childNodes && svg.childNodes.length > 1) {
                defs = svg.childNodes[0];
                while(defs.childNodes.length) {
                    id = defs.childNodes[0].getAttribute("id");
                    this.__ids[id] = id;
                    this.__defs.appendChild(defs.childNodes[0]);
                }
                group = svg.childNodes[1];
                if (group) {
                    //save original transform
                    var originTransform = group.getAttribute("transform");
                    var transformDirective;
                    if (originTransform) {
                        transformDirective = originTransform+" "+translateDirective;
                    } else {
                        transformDirective = translateDirective;
                    }
                    group.setAttribute("transform", transformDirective);
                    parent.appendChild(group);
                }
            }
        } else if (image.nodeName === "CANVAS" || image.nodeName === "IMG") {
            //canvas or image
            svgImage = this.__createElement("image");
            svgImage.setAttribute("width", dw);
            svgImage.setAttribute("height", dh);
            svgImage.setAttribute("opacity", this.globalAlpha);
            svgImage.setAttribute("preserveAspectRatio", "none");

            if (sx || sy || sw !== image.width || sh !== image.height) {
                //crop the image using a temporary canvas
                canvas = this.__document.createElement("canvas");
                canvas.width = dw;
                canvas.height = dh;
                context = canvas.getContext("2d");
                context.drawImage(image, sx, sy, sw, sh, 0, 0, dw, dh);
                image = canvas;
            }
            svgImage.setAttribute("transform", translateDirective);
            svgImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href",
                image.nodeName === "CANVAS" ? image.toDataURL() : image.getAttribute("src"));
            parent.appendChild(svgImage);
        }
    };

    /**
     * Generates a pattern tag
     */
    ctx.prototype.createPattern = function (image, repetition) {
        var pattern = this.__document.createElementNS("http://www.w3.org/2000/svg", "pattern"), id = randomString(this.__ids),
            img;
        pattern.setAttribute("id", id);
        pattern.setAttribute("width", image.width);
        pattern.setAttribute("height", image.height);
        if (image.nodeName === "CANVAS" || image.nodeName === "IMG") {
            img = this.__document.createElementNS("http://www.w3.org/2000/svg", "image");
            img.setAttribute("width", image.width);
            img.setAttribute("height", image.height);
            img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href",
                image.nodeName === "CANVAS" ? image.toDataURL() : image.getAttribute("src"));
            pattern.appendChild(img);
            this.__defs.appendChild(pattern);
        } else if (image instanceof ctx) {
            pattern.appendChild(image.__root.childNodes[1]);
            this.__defs.appendChild(pattern);
        }
        return new CanvasPattern(pattern, this);
    };

    ctx.prototype.setLineDash = function (dashArray) {
        if (dashArray && dashArray.length > 0) {
            this.lineDash = dashArray.join(",");
        } else {
            this.lineDash = null;
        }
    };

    /**
     * Not yet implemented
     */
    ctx.prototype.drawFocusRing = function () {};
    ctx.prototype.createImageData = function () {};
    ctx.prototype.getImageData = function () {};
    ctx.prototype.putImageData = function () {};
    ctx.prototype.globalCompositeOperation = function () {};
    ctx.prototype.setTransform = function () {};

    //add options for alternative namespace
    if (typeof window === "object") {
        window.C2S = ctx;
    }

    // CommonJS/Browserify
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = ctx;
    }

}());


/***/ })
/******/ ]);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCA0NjJjNzM2MTc0NzRlOTBmMjk4NiIsIndlYnBhY2s6Ly8vLi9zcmMvY29udmVydC10by1zdmcuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vY2FudmFzMnN2Zy9jYW52YXMyc3ZnLmpzIl0sIm5hbWVzIjpbIkMyUyIsInJlcXVpcmUiLCJDUnAiLCJpcyIsIm51bWJlciIsIm9iaiIsImlzTmFOIiwiYnVmZmVyQ2FudmFzSW1hZ2UiLCJvcHRpb25zIiwiY3kiLCJ1c2VQYXRocyIsInJlbmRlcmVyIiwiZWxlbWVudHMiLCJmb3JFYWNoIiwiZWxlIiwiX3ByaXZhdGUiLCJyc2NyYXRjaCIsInBhdGhDYWNoZUtleSIsInBhdGhDYWNoZSIsImVsZXMiLCJtdXRhYmxlRWxlbWVudHMiLCJiYiIsImJvdW5kaW5nQm94IiwiY3RyUmVjdCIsImZpbmRDb250YWluZXJDbGllbnRDb29yZHMiLCJ3aWR0aCIsImZ1bGwiLCJNYXRoIiwiY2VpbCIsInciLCJoZWlnaHQiLCJoIiwic3BlY2RNYXhEaW1zIiwibWF4V2lkdGgiLCJtYXhIZWlnaHQiLCJweFJhdGlvIiwiZ2V0UGl4ZWxSYXRpbyIsInNjYWxlIiwidW5kZWZpbmVkIiwibWF4U2NhbGVXIiwiSW5maW5pdHkiLCJtYXhTY2FsZUgiLCJtaW4iLCJidWZmQ3h0IiwiYnVmZkNhbnZhcyIsImNsZWFyUmVjdCIsImdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiIsInpzb3J0ZWRFbGVzIiwiZ2V0Q2FjaGVkWlNvcnRlZEVsZXMiLCJ0cmFuc2xhdGUiLCJ4MSIsInkxIiwiZHJhd0VsZW1lbnRzIiwicGFuIiwidHJhbnNsYXRpb24iLCJ4IiwieSIsInpvb20iLCJiZyIsImZpbGxTdHlsZSIsInJlY3QiLCJmaWxsIiwib3V0cHV0IiwiY2FudmFzIiwiZ2V0U2VyaWFsaXplZFN2ZyIsInN2ZyIsIm1vZHVsZSIsImV4cG9ydHMiLCJpbXBsIiwicmVnaXN0ZXIiLCJjeXRvc2NhcGUiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPO0FDVkE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLG1EQUEyQyxjQUFjOztBQUV6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7O0FDaEVhOztBQUViOzs7Ozs7O0FBS0EsSUFBSUEsTUFBTSxtQkFBT0MsQ0FBQyxDQUFSLENBQVY7O0FBRUEsSUFBSUMsTUFBTSxFQUFWO0FBQ0EsSUFBSUMsS0FBSyxFQUFUOztBQUVBQSxHQUFHQyxNQUFILEdBQVk7QUFBQSxTQUNWQyxPQUFPLElBQVAsSUFBZSxRQUFPQSxHQUFQLHlDQUFPQSxHQUFQLGVBQXNCLENBQXRCLENBQWYsSUFBMEMsQ0FBQ0MsTUFBT0QsR0FBUCxDQURqQztBQUFBLENBQVo7O0FBR0FILElBQUlLLGlCQUFKLEdBQXdCLFVBQVVDLE9BQVYsRUFBbUJDLEVBQW5CLEVBQXNCOztBQUU1QztBQUNBLE1BQUlDLFdBQVdELEdBQUdFLFFBQUgsR0FBY0QsUUFBN0I7QUFDQUQsS0FBR0UsUUFBSCxHQUFjRCxRQUFkLEdBQXlCLFlBQU07QUFBQyxXQUFPLEtBQVA7QUFBYyxHQUE5QztBQUNBO0FBQ0FELEtBQUdHLFFBQUgsR0FBY0MsT0FBZCxDQUFzQixVQUFTQyxHQUFULEVBQWM7QUFDbENBLFFBQUlDLFFBQUosQ0FBYUMsUUFBYixDQUFzQkMsWUFBdEIsR0FBcUMsSUFBckM7QUFDQUgsUUFBSUMsUUFBSixDQUFhQyxRQUFiLENBQXNCRSxTQUF0QixHQUFrQyxJQUFsQztBQUNELEdBSEQ7O0FBS0EsTUFBSVAsV0FBV0YsR0FBR0UsUUFBSCxFQUFmO0FBQ0EsTUFBSVEsT0FBT1YsR0FBR1csZUFBSCxFQUFYO0FBQ0EsTUFBSUMsS0FBS0YsS0FBS0csV0FBTCxFQUFUO0FBQ0EsTUFBSUMsVUFBVVosU0FBU2EseUJBQVQsRUFBZDtBQUNBLE1BQUlDLFFBQVFqQixRQUFRa0IsSUFBUixHQUFlQyxLQUFLQyxJQUFMLENBQVdQLEdBQUdRLENBQWQsQ0FBZixHQUFtQ04sUUFBUSxDQUFSLENBQS9DO0FBQ0EsTUFBSU8sU0FBU3RCLFFBQVFrQixJQUFSLEdBQWVDLEtBQUtDLElBQUwsQ0FBV1AsR0FBR1UsQ0FBZCxDQUFmLEdBQW1DUixRQUFRLENBQVIsQ0FBaEQ7QUFDQSxNQUFJUyxlQUFlN0IsR0FBR0MsTUFBSCxDQUFXSSxRQUFReUIsUUFBbkIsS0FBaUM5QixHQUFHQyxNQUFILENBQVdJLFFBQVEwQixTQUFuQixDQUFwRDtBQUNBLE1BQUlDLFVBQVV4QixTQUFTeUIsYUFBVCxFQUFkO0FBQ0EsTUFBSUMsUUFBUSxDQUFaOztBQUVBLE1BQUk3QixRQUFRNkIsS0FBUixLQUFrQkMsU0FBdEIsRUFBaUM7QUFDL0JiLGFBQVNqQixRQUFRNkIsS0FBakI7QUFDQVAsY0FBVXRCLFFBQVE2QixLQUFsQjs7QUFFQUEsWUFBUTdCLFFBQVE2QixLQUFoQjtBQUNELEdBTEQsTUFLTyxJQUFJTCxZQUFKLEVBQWtCO0FBQ3ZCLFFBQUlPLFlBQVlDLFFBQWhCO0FBQ0EsUUFBSUMsWUFBWUQsUUFBaEI7O0FBRUEsUUFBSXJDLEdBQUdDLE1BQUgsQ0FBV0ksUUFBUXlCLFFBQW5CLENBQUosRUFBbUM7QUFDakNNLGtCQUFZRixRQUFRN0IsUUFBUXlCLFFBQWhCLEdBQTJCUixLQUF2QztBQUNEOztBQUVELFFBQUl0QixHQUFHQyxNQUFILENBQVdJLFFBQVEwQixTQUFuQixDQUFKLEVBQW9DO0FBQ2xDTyxrQkFBWUosUUFBUTdCLFFBQVEwQixTQUFoQixHQUE0QkosTUFBeEM7QUFDRDs7QUFFRE8sWUFBUVYsS0FBS2UsR0FBTCxDQUFVSCxTQUFWLEVBQXFCRSxTQUFyQixDQUFSOztBQUVBaEIsYUFBU1ksS0FBVDtBQUNBUCxjQUFVTyxLQUFWO0FBQ0Q7O0FBRUQsTUFBSSxDQUFDTCxZQUFMLEVBQW1CO0FBQ2pCUCxhQUFTVSxPQUFUO0FBQ0FMLGNBQVVLLE9BQVY7QUFDQUUsYUFBU0YsT0FBVDtBQUNEOztBQUVELE1BQUlRLFVBQVUsSUFBZDtBQUNBLE1BQUlDLGFBQWFELFVBQVUsSUFBSTNDLEdBQUosQ0FBUXlCLEtBQVIsRUFBZUssTUFBZixDQUEzQjs7QUFFQTtBQUNBLE1BQUlMLFFBQVEsQ0FBUixJQUFhSyxTQUFTLENBQTFCLEVBQTZCOztBQUUzQmEsWUFBUUUsU0FBUixDQUFtQixDQUFuQixFQUFzQixDQUF0QixFQUF5QnBCLEtBQXpCLEVBQWdDSyxNQUFoQzs7QUFFQWEsWUFBUUcsd0JBQVIsR0FBbUMsYUFBbkM7O0FBRUEsUUFBSUMsY0FBY3BDLFNBQVNxQyxvQkFBVCxFQUFsQjs7QUFFQSxRQUFJeEMsUUFBUWtCLElBQVosRUFBa0I7QUFBRTtBQUNsQmlCLGNBQVFNLFNBQVIsQ0FBbUIsQ0FBQzVCLEdBQUc2QixFQUFKLEdBQVNiLEtBQTVCLEVBQW1DLENBQUNoQixHQUFHOEIsRUFBSixHQUFTZCxLQUE1QztBQUNBTSxjQUFRTixLQUFSLENBQWVBLEtBQWYsRUFBc0JBLEtBQXRCOztBQUVBMUIsZUFBU3lDLFlBQVQsQ0FBdUJULE9BQXZCLEVBQWdDSSxXQUFoQzs7QUFFQUosY0FBUU4sS0FBUixDQUFlLElBQUVBLEtBQWpCLEVBQXdCLElBQUVBLEtBQTFCO0FBQ0FNLGNBQVFNLFNBQVIsQ0FBbUI1QixHQUFHNkIsRUFBSCxHQUFRYixLQUEzQixFQUFrQ2hCLEdBQUc4QixFQUFILEdBQVFkLEtBQTFDO0FBQ0QsS0FSRCxNQVFPO0FBQUU7QUFDUCxVQUFJZ0IsTUFBTTVDLEdBQUc0QyxHQUFILEVBQVY7O0FBRUEsVUFBSUMsY0FBYztBQUNoQkMsV0FBR0YsSUFBSUUsQ0FBSixHQUFRbEIsS0FESztBQUVoQm1CLFdBQUdILElBQUlHLENBQUosR0FBUW5CO0FBRkssT0FBbEI7O0FBS0FBLGVBQVM1QixHQUFHZ0QsSUFBSCxFQUFUOztBQUVBZCxjQUFRTSxTQUFSLENBQW1CSyxZQUFZQyxDQUEvQixFQUFrQ0QsWUFBWUUsQ0FBOUM7QUFDQWIsY0FBUU4sS0FBUixDQUFlQSxLQUFmLEVBQXNCQSxLQUF0Qjs7QUFFQTFCLGVBQVN5QyxZQUFULENBQXVCVCxPQUF2QixFQUFnQ0ksV0FBaEM7O0FBRUFKLGNBQVFOLEtBQVIsQ0FBZSxJQUFFQSxLQUFqQixFQUF3QixJQUFFQSxLQUExQjtBQUNBTSxjQUFRTSxTQUFSLENBQW1CLENBQUNLLFlBQVlDLENBQWhDLEVBQW1DLENBQUNELFlBQVlFLENBQWhEO0FBQ0Q7O0FBRUQ7QUFDQSxRQUFJaEQsUUFBUWtELEVBQVosRUFBZ0I7QUFDZGYsY0FBUUcsd0JBQVIsR0FBbUMsa0JBQW5DOztBQUVBSCxjQUFRZ0IsU0FBUixHQUFvQm5ELFFBQVFrRCxFQUE1QjtBQUNBZixjQUFRaUIsSUFBUixDQUFjLENBQWQsRUFBaUIsQ0FBakIsRUFBb0JuQyxLQUFwQixFQUEyQkssTUFBM0I7QUFDQWEsY0FBUWtCLElBQVI7QUFDRDtBQUNGOztBQUVEO0FBQ0FwRCxLQUFHRSxRQUFILEdBQWNELFFBQWQsR0FBeUJBLFFBQXpCO0FBQ0EsU0FBT2tDLFVBQVA7QUFDRCxDQXRHRDs7QUF3R0EsU0FBU2tCLE1BQVQsQ0FBZ0JDLE1BQWhCLEVBQXVCO0FBQ25CLFNBQU9BLE9BQU9DLGdCQUFQLEVBQVA7QUFDSDs7QUFFRDlELElBQUkrRCxHQUFKLEdBQVUsVUFBVXpELE9BQVYsRUFBbUI7QUFDM0IsU0FBT3NELE9BQU81RCxJQUFJSyxpQkFBSixDQUFzQkMsV0FBVyxFQUFqQyxFQUFxQyxJQUFyQyxDQUFQLENBQVA7QUFDRCxDQUZEOztBQUlBMEQsT0FBT0MsT0FBUCxHQUFpQmpFLEdBQWpCLEM7Ozs7Ozs7OztBQy9IQSxJQUFNa0UsT0FBTyxtQkFBT25FLENBQUMsQ0FBUixDQUFiOztBQUVBO0FBQ0EsSUFBSW9FLFdBQVcsU0FBWEEsUUFBVyxDQUFVQyxTQUFWLEVBQXFCO0FBQ2xDLE1BQUksQ0FBQ0EsU0FBTCxFQUFnQjtBQUFFO0FBQVMsR0FETyxDQUNOOztBQUU1QkEsWUFBVyxNQUFYLEVBQW1CLEtBQW5CLEVBQTBCRixLQUFLSCxHQUEvQixFQUhrQyxDQUdJO0FBQ3ZDLENBSkQ7O0FBTUEsSUFBSSxPQUFPSyxTQUFQLEtBQXFCLFdBQXpCLEVBQXNDO0FBQUU7QUFDdENELFdBQVVDLFNBQVY7QUFDRDs7QUFFREosT0FBT0MsT0FBUCxHQUFpQkUsUUFBakIsQzs7Ozs7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLENBQUM7QUFDRDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsZUFBZTtBQUNoQyw2Q0FBNkMsa0JBQWtCO0FBQy9EO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixRQUFRO0FBQy9CO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esa0NBQWtDO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixrQkFBa0I7QUFDckMsNENBQTRDO0FBQzVDO0FBQ0EsMkNBQTJDO0FBQzNDO0FBQ0Esb0VBQW9FO0FBQ3BFLGlDQUFpQztBQUNqQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QjtBQUN2QjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QjtBQUN2QjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseURBQXlELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLHlDQUF5QztBQUNqSDtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QixnREFBZ0Q7O0FBRTlFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSwyQkFBMkI7QUFDM0I7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixlQUFlO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsZUFBZTtBQUNoQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsZUFBZTtBQUNoQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QjtBQUM5QixpQkFBaUIsZUFBZTtBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBO0FBQ0EsbUJBQW1CLGlCQUFpQjtBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkVBQTJFLEdBQUcsS0FBSyxtQ0FBbUM7QUFDdEg7QUFDQTtBQUNBO0FBQ0EsMkVBQTJFLEdBQUcsS0FBSyxtQ0FBbUM7QUFDdEgsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0ZBQWdGLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLHlDQUF5QztBQUN4STtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLGVBQWU7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrRUFBK0U7QUFDL0U7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLEVBQUUsRUFBRSxFQUFFLEtBQUssU0FBUztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNENBQTRDLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxLQUFLLDBCQUEwQjtBQUMzRjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtDQUErQyxFQUFFLEVBQUUsRUFBRSxLQUFLLFFBQVE7QUFDbEU7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssNkJBQTZCO0FBQ3BHOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsOENBQThDO0FBQzlDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGtDQUFrQztBQUNsQyx5Q0FBeUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxTQUFTO0FBQzVEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0M7QUFDbEM7QUFDQSw2Q0FBNkMsRUFBRSxFQUFFLEVBQUUsSUFBSSxTQUFTO0FBQ2hFLFNBQVM7QUFDVCw2Q0FBNkMsRUFBRSxFQUFFLEVBQUUsSUFBSSxTQUFTO0FBQ2hFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0M7QUFDbEMseUNBQXlDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRTtBQUMzRSxhQUFhLHFEQUFxRDtBQUNsRTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQztBQUNsQyx5Q0FBeUMsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLDJCQUEyQjtBQUMxRjs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMsUUFBUTtBQUNuRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEMsSUFBSSx3Q0FBd0MsSUFBSSxvQ0FBb0MsSUFBSSwyREFBMkQsSUFBSTtBQUNyTTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQSx5Q0FBeUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsS0FBSztBQUMxRyxhQUFhLDRHQUE0Rzs7QUFFekgsa0NBQWtDO0FBQ2xDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxzREFBc0QsR0FBRyxLQUFLLE1BQU07O0FBRXBFO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxDQUFDIiwiZmlsZSI6ImN5dG9zY2FwZS1zdmcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJjeXRvc2NhcGVTdmdcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wiY3l0b3NjYXBlU3ZnXCJdID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24oKSB7XG5yZXR1cm4gXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGlkZW50aXR5IGZ1bmN0aW9uIGZvciBjYWxsaW5nIGhhcm1vbnkgaW1wb3J0cyB3aXRoIHRoZSBjb3JyZWN0IGNvbnRleHRcbiBcdF9fd2VicGFja19yZXF1aXJlX18uaSA9IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfTtcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMSk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgNDYyYzczNjE3NDc0ZTkwZjI5ODYiLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTW9zdCBvZiB0aGUgY29kZSBpcyB0YWtlbiBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9pVmlzLWF0LUJpbGtlbnQvY3l0b3NjYXBlLmpzXG4gKiBhbmQgYWRhcHRlZFxuICovXG5cbnZhciBDMlMgPSByZXF1aXJlKCdjYW52YXMyc3ZnJyk7XG5cbnZhciBDUnAgPSB7fTtcbnZhciBpcyA9IHt9O1xuXG5pcy5udW1iZXIgPSBvYmogPT5cbiAgb2JqICE9IG51bGwgJiYgdHlwZW9mIG9iaiA9PT0gdHlwZW9mIDEgJiYgIWlzTmFOKCBvYmogKTtcblxuQ1JwLmJ1ZmZlckNhbnZhc0ltYWdlID0gZnVuY3Rpb24oIG9wdGlvbnMsIGN5KXtcblxuICAvL2Rpc2FibGUgdXNlUGF0aHMgdGVtcG9yYXJpbHlcbiAgdmFyIHVzZVBhdGhzID0gY3kucmVuZGVyZXIoKS51c2VQYXRocztcbiAgY3kucmVuZGVyZXIoKS51c2VQYXRocyA9ICgpID0+IHtyZXR1cm4gZmFsc2U7fVxuICAvLyBmbHVzaCBwYXRoIGNhY2hlXG4gIGN5LmVsZW1lbnRzKCkuZm9yRWFjaChmdW5jdGlvbihlbGUpIHtcbiAgICBlbGUuX3ByaXZhdGUucnNjcmF0Y2gucGF0aENhY2hlS2V5ID0gbnVsbDtcbiAgICBlbGUuX3ByaXZhdGUucnNjcmF0Y2gucGF0aENhY2hlID0gbnVsbDtcbiAgfSk7XG5cbiAgdmFyIHJlbmRlcmVyID0gY3kucmVuZGVyZXIoKTtcbiAgdmFyIGVsZXMgPSBjeS5tdXRhYmxlRWxlbWVudHMoKTtcbiAgdmFyIGJiID0gZWxlcy5ib3VuZGluZ0JveCgpO1xuICB2YXIgY3RyUmVjdCA9IHJlbmRlcmVyLmZpbmRDb250YWluZXJDbGllbnRDb29yZHMoKTtcbiAgdmFyIHdpZHRoID0gb3B0aW9ucy5mdWxsID8gTWF0aC5jZWlsKCBiYi53ICkgOiBjdHJSZWN0WzJdO1xuICB2YXIgaGVpZ2h0ID0gb3B0aW9ucy5mdWxsID8gTWF0aC5jZWlsKCBiYi5oICkgOiBjdHJSZWN0WzNdO1xuICB2YXIgc3BlY2RNYXhEaW1zID0gaXMubnVtYmVyKCBvcHRpb25zLm1heFdpZHRoICkgfHwgaXMubnVtYmVyKCBvcHRpb25zLm1heEhlaWdodCApO1xuICB2YXIgcHhSYXRpbyA9IHJlbmRlcmVyLmdldFBpeGVsUmF0aW8oKTtcbiAgdmFyIHNjYWxlID0gMTtcblxuICBpZiggb3B0aW9ucy5zY2FsZSAhPT0gdW5kZWZpbmVkICl7XG4gICAgd2lkdGggKj0gb3B0aW9ucy5zY2FsZTtcbiAgICBoZWlnaHQgKj0gb3B0aW9ucy5zY2FsZTtcblxuICAgIHNjYWxlID0gb3B0aW9ucy5zY2FsZTtcbiAgfSBlbHNlIGlmKCBzcGVjZE1heERpbXMgKXtcbiAgICB2YXIgbWF4U2NhbGVXID0gSW5maW5pdHk7XG4gICAgdmFyIG1heFNjYWxlSCA9IEluZmluaXR5O1xuXG4gICAgaWYoIGlzLm51bWJlciggb3B0aW9ucy5tYXhXaWR0aCApICl7XG4gICAgICBtYXhTY2FsZVcgPSBzY2FsZSAqIG9wdGlvbnMubWF4V2lkdGggLyB3aWR0aDtcbiAgICB9XG5cbiAgICBpZiggaXMubnVtYmVyKCBvcHRpb25zLm1heEhlaWdodCApICl7XG4gICAgICBtYXhTY2FsZUggPSBzY2FsZSAqIG9wdGlvbnMubWF4SGVpZ2h0IC8gaGVpZ2h0O1xuICAgIH1cblxuICAgIHNjYWxlID0gTWF0aC5taW4oIG1heFNjYWxlVywgbWF4U2NhbGVIICk7XG5cbiAgICB3aWR0aCAqPSBzY2FsZTtcbiAgICBoZWlnaHQgKj0gc2NhbGU7XG4gIH1cblxuICBpZiggIXNwZWNkTWF4RGltcyApe1xuICAgIHdpZHRoICo9IHB4UmF0aW87XG4gICAgaGVpZ2h0ICo9IHB4UmF0aW87XG4gICAgc2NhbGUgKj0gcHhSYXRpbztcbiAgfVxuXG4gIHZhciBidWZmQ3h0ID0gbnVsbDtcbiAgdmFyIGJ1ZmZDYW52YXMgPSBidWZmQ3h0ID0gbmV3IEMyUyh3aWR0aCwgaGVpZ2h0KTtcblxuICAvLyBSYXN0ZXJpemUgdGhlIGxheWVycywgYnV0IG9ubHkgaWYgY29udGFpbmVyIGhhcyBub256ZXJvIHNpemVcbiAgaWYoIHdpZHRoID4gMCAmJiBoZWlnaHQgPiAwICl7XG5cbiAgICBidWZmQ3h0LmNsZWFyUmVjdCggMCwgMCwgd2lkdGgsIGhlaWdodCApO1xuXG4gICAgYnVmZkN4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLW92ZXInO1xuXG4gICAgdmFyIHpzb3J0ZWRFbGVzID0gcmVuZGVyZXIuZ2V0Q2FjaGVkWlNvcnRlZEVsZXMoKTtcblxuICAgIGlmKCBvcHRpb25zLmZ1bGwgKXsgLy8gZHJhdyB0aGUgZnVsbCBib3VuZHMgb2YgdGhlIGdyYXBoXG4gICAgICBidWZmQ3h0LnRyYW5zbGF0ZSggLWJiLngxICogc2NhbGUsIC1iYi55MSAqIHNjYWxlICk7XG4gICAgICBidWZmQ3h0LnNjYWxlKCBzY2FsZSwgc2NhbGUgKTtcblxuICAgICAgcmVuZGVyZXIuZHJhd0VsZW1lbnRzKCBidWZmQ3h0LCB6c29ydGVkRWxlcyApO1xuXG4gICAgICBidWZmQ3h0LnNjYWxlKCAxL3NjYWxlLCAxL3NjYWxlICk7XG4gICAgICBidWZmQ3h0LnRyYW5zbGF0ZSggYmIueDEgKiBzY2FsZSwgYmIueTEgKiBzY2FsZSApO1xuICAgIH0gZWxzZSB7IC8vIGRyYXcgdGhlIGN1cnJlbnQgdmlld1xuICAgICAgdmFyIHBhbiA9IGN5LnBhbigpO1xuXG4gICAgICB2YXIgdHJhbnNsYXRpb24gPSB7XG4gICAgICAgIHg6IHBhbi54ICogc2NhbGUsXG4gICAgICAgIHk6IHBhbi55ICogc2NhbGVcbiAgICAgIH07XG5cbiAgICAgIHNjYWxlICo9IGN5Lnpvb20oKTtcblxuICAgICAgYnVmZkN4dC50cmFuc2xhdGUoIHRyYW5zbGF0aW9uLngsIHRyYW5zbGF0aW9uLnkgKTtcbiAgICAgIGJ1ZmZDeHQuc2NhbGUoIHNjYWxlLCBzY2FsZSApO1xuXG4gICAgICByZW5kZXJlci5kcmF3RWxlbWVudHMoIGJ1ZmZDeHQsIHpzb3J0ZWRFbGVzICk7XG5cbiAgICAgIGJ1ZmZDeHQuc2NhbGUoIDEvc2NhbGUsIDEvc2NhbGUgKTtcbiAgICAgIGJ1ZmZDeHQudHJhbnNsYXRlKCAtdHJhbnNsYXRpb24ueCwgLXRyYW5zbGF0aW9uLnkgKTtcbiAgICB9XG5cbiAgICAvLyBuZWVkIHRvIGZpbGwgYmcgYXQgZW5kIGxpa2UgdGhpcyBpbiBvcmRlciB0byBmaWxsIGNsZWFyZWQgdHJhbnNwYXJlbnQgcGl4ZWxzIGluIGpwZ3NcbiAgICBpZiggb3B0aW9ucy5iZyApe1xuICAgICAgYnVmZkN4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnZGVzdGluYXRpb24tb3Zlcic7XG5cbiAgICAgIGJ1ZmZDeHQuZmlsbFN0eWxlID0gb3B0aW9ucy5iZztcbiAgICAgIGJ1ZmZDeHQucmVjdCggMCwgMCwgd2lkdGgsIGhlaWdodCApO1xuICAgICAgYnVmZkN4dC5maWxsKCk7XG4gICAgfVxuICB9XG5cbiAgLy8gcmVzdG9yZSB1c2VQYXRocyB0byBkZWZhdWx0IHZhbHVlXG4gIGN5LnJlbmRlcmVyKCkudXNlUGF0aHMgPSB1c2VQYXRocztcbiAgcmV0dXJuIGJ1ZmZDYW52YXM7XG59O1xuXG5mdW5jdGlvbiBvdXRwdXQoY2FudmFzKXtcbiAgICByZXR1cm4gY2FudmFzLmdldFNlcmlhbGl6ZWRTdmcoKTtcbn1cblxuQ1JwLnN2ZyA9IGZ1bmN0aW9uKCBvcHRpb25zICl7XG4gIHJldHVybiBvdXRwdXQoQ1JwLmJ1ZmZlckNhbnZhc0ltYWdlKG9wdGlvbnMgfHwge30sIHRoaXMgKSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENScDtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb252ZXJ0LXRvLXN2Zy5qcyIsImNvbnN0IGltcGwgPSByZXF1aXJlKCcuL2NvbnZlcnQtdG8tc3ZnLmpzJyk7XG5cbi8vIHJlZ2lzdGVycyB0aGUgZXh0ZW5zaW9uIG9uIGEgY3l0b3NjYXBlIGxpYiByZWZcbmxldCByZWdpc3RlciA9IGZ1bmN0aW9uKCBjeXRvc2NhcGUgKXtcbiAgaWYoICFjeXRvc2NhcGUgKXsgcmV0dXJuOyB9IC8vIGNhbid0IHJlZ2lzdGVyIGlmIGN5dG9zY2FwZSB1bnNwZWNpZmllZFxuXG4gIGN5dG9zY2FwZSggJ2NvcmUnLCAnc3ZnJywgaW1wbC5zdmcgKTsgLy8gcmVnaXN0ZXIgd2l0aCBjeXRvc2NhcGUuanNcbn07XG5cbmlmKCB0eXBlb2YgY3l0b3NjYXBlICE9PSAndW5kZWZpbmVkJyApeyAvLyBleHBvc2UgdG8gZ2xvYmFsIGN5dG9zY2FwZSAoaS5lLiB3aW5kb3cuY3l0b3NjYXBlKVxuICByZWdpc3RlciggY3l0b3NjYXBlICk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVnaXN0ZXI7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvaW5kZXguanMiLCIvKiEhXG4gKiAgQ2FudmFzIDIgU3ZnIHYxLjAuMTlcbiAqICBBIGxvdyBsZXZlbCBjYW52YXMgdG8gU1ZHIGNvbnZlcnRlci4gVXNlcyBhIG1vY2sgY2FudmFzIGNvbnRleHQgdG8gYnVpbGQgYW4gU1ZHIGRvY3VtZW50LlxuICpcbiAqICBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiAgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAqXG4gKiAgQXV0aG9yOlxuICogIEtlcnJ5IExpdVxuICpcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTQgR2xpZmZ5IEluYy5cbiAqL1xuXG47KGZ1bmN0aW9uICgpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciBTVFlMRVMsIGN0eCwgQ2FudmFzR3JhZGllbnQsIENhbnZhc1BhdHRlcm4sIG5hbWVkRW50aXRpZXM7XG5cbiAgICAvL2hlbHBlciBmdW5jdGlvbiB0byBmb3JtYXQgYSBzdHJpbmdcbiAgICBmdW5jdGlvbiBmb3JtYXQoc3RyLCBhcmdzKSB7XG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYXJncyksIGk7XG4gICAgICAgIGZvciAoaT0wOyBpPGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKG5ldyBSZWdFeHAoXCJcXFxce1wiICsga2V5c1tpXSArIFwiXFxcXH1cIiwgXCJnaVwiKSwgYXJnc1trZXlzW2ldXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG5cbiAgICAvL2hlbHBlciBmdW5jdGlvbiB0aGF0IGdlbmVyYXRlcyBhIHJhbmRvbSBzdHJpbmdcbiAgICBmdW5jdGlvbiByYW5kb21TdHJpbmcoaG9sZGVyKSB7XG4gICAgICAgIHZhciBjaGFycywgcmFuZG9tc3RyaW5nLCBpO1xuICAgICAgICBpZiAoIWhvbGRlcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2Fubm90IGNyZWF0ZSBhIHJhbmRvbSBhdHRyaWJ1dGUgbmFtZSBmb3IgYW4gdW5kZWZpbmVkIG9iamVjdFwiKTtcbiAgICAgICAgfVxuICAgICAgICBjaGFycyA9IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYVFphYmNkZWZnaGlrbG1ub3BxcnN0dXZ3eHl6XCI7XG4gICAgICAgIHJhbmRvbXN0cmluZyA9IFwiXCI7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIHJhbmRvbXN0cmluZyA9IFwiXCI7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTI7IGkrKykge1xuICAgICAgICAgICAgICAgIHJhbmRvbXN0cmluZyArPSBjaGFyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjaGFycy5sZW5ndGgpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSB3aGlsZSAoaG9sZGVyW3JhbmRvbXN0cmluZ10pO1xuICAgICAgICByZXR1cm4gcmFuZG9tc3RyaW5nO1xuICAgIH1cblxuICAgIC8vaGVscGVyIGZ1bmN0aW9uIHRvIG1hcCBuYW1lZCB0byBudW1iZXJlZCBlbnRpdGllc1xuICAgIGZ1bmN0aW9uIGNyZWF0ZU5hbWVkVG9OdW1iZXJlZExvb2t1cChpdGVtcywgcmFkaXgpIHtcbiAgICAgICAgdmFyIGksIGVudGl0eSwgbG9va3VwID0ge30sIGJhc2UxMCwgYmFzZTE2O1xuICAgICAgICBpdGVtcyA9IGl0ZW1zLnNwbGl0KCcsJyk7XG4gICAgICAgIHJhZGl4ID0gcmFkaXggfHwgMTA7XG4gICAgICAgIC8vIE1hcCBmcm9tIG5hbWVkIHRvIG51bWJlcmVkIGVudGl0aWVzLlxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgICAgIGVudGl0eSA9ICcmJyArIGl0ZW1zW2kgKyAxXSArICc7JztcbiAgICAgICAgICAgIGJhc2UxMCA9IHBhcnNlSW50KGl0ZW1zW2ldLCByYWRpeCk7XG4gICAgICAgICAgICBsb29rdXBbZW50aXR5XSA9ICcmIycrYmFzZTEwKyc7JztcbiAgICAgICAgfVxuICAgICAgICAvL0ZGIGFuZCBJRSBuZWVkIHRvIGNyZWF0ZSBhIHJlZ2V4IGZyb20gaGV4IHZhbHVlcyBpZSAmbmJzcDsgPT0gXFx4YTBcbiAgICAgICAgbG9va3VwW1wiXFxcXHhhMFwiXSA9ICcmIzE2MDsnO1xuICAgICAgICByZXR1cm4gbG9va3VwO1xuICAgIH1cblxuICAgIC8vaGVscGVyIGZ1bmN0aW9uIHRvIG1hcCBjYW52YXMtdGV4dEFsaWduIHRvIHN2Zy10ZXh0QW5jaG9yXG4gICAgZnVuY3Rpb24gZ2V0VGV4dEFuY2hvcih0ZXh0QWxpZ24pIHtcbiAgICAgICAgLy9UT0RPOiBzdXBwb3J0IHJ0bCBsYW5ndWFnZXNcbiAgICAgICAgdmFyIG1hcHBpbmcgPSB7XCJsZWZ0XCI6XCJzdGFydFwiLCBcInJpZ2h0XCI6XCJlbmRcIiwgXCJjZW50ZXJcIjpcIm1pZGRsZVwiLCBcInN0YXJ0XCI6XCJzdGFydFwiLCBcImVuZFwiOlwiZW5kXCJ9O1xuICAgICAgICByZXR1cm4gbWFwcGluZ1t0ZXh0QWxpZ25dIHx8IG1hcHBpbmcuc3RhcnQ7XG4gICAgfVxuXG4gICAgLy9oZWxwZXIgZnVuY3Rpb24gdG8gbWFwIGNhbnZhcy10ZXh0QmFzZWxpbmUgdG8gc3ZnLWRvbWluYW50QmFzZWxpbmVcbiAgICBmdW5jdGlvbiBnZXREb21pbmFudEJhc2VsaW5lKHRleHRCYXNlbGluZSkge1xuICAgICAgICAvL0lORk86IG5vdCBzdXBwb3J0ZWQgaW4gYWxsIGJyb3dzZXJzXG4gICAgICAgIHZhciBtYXBwaW5nID0ge1wiYWxwaGFiZXRpY1wiOiBcImFscGhhYmV0aWNcIiwgXCJoYW5naW5nXCI6IFwiaGFuZ2luZ1wiLCBcInRvcFwiOlwidGV4dC1iZWZvcmUtZWRnZVwiLCBcImJvdHRvbVwiOlwidGV4dC1hZnRlci1lZGdlXCIsIFwibWlkZGxlXCI6XCJjZW50cmFsXCJ9O1xuICAgICAgICByZXR1cm4gbWFwcGluZ1t0ZXh0QmFzZWxpbmVdIHx8IG1hcHBpbmcuYWxwaGFiZXRpYztcbiAgICB9XG5cbiAgICAvLyBVbnBhY2sgZW50aXRpZXMgbG9va3VwIHdoZXJlIHRoZSBudW1iZXJzIGFyZSBpbiByYWRpeCAzMiB0byByZWR1Y2UgdGhlIHNpemVcbiAgICAvLyBlbnRpdHkgbWFwcGluZyBjb3VydGVzeSBvZiB0aW55bWNlXG4gICAgbmFtZWRFbnRpdGllcyA9IGNyZWF0ZU5hbWVkVG9OdW1iZXJlZExvb2t1cChcbiAgICAgICAgJzUwLG5ic3AsNTEsaWV4Y2wsNTIsY2VudCw1Myxwb3VuZCw1NCxjdXJyZW4sNTUseWVuLDU2LGJydmJhciw1NyxzZWN0LDU4LHVtbCw1OSxjb3B5LCcgK1xuICAgICAgICAgICAgJzVhLG9yZGYsNWIsbGFxdW8sNWMsbm90LDVkLHNoeSw1ZSxyZWcsNWYsbWFjciw1ZyxkZWcsNWgscGx1c21uLDVpLHN1cDIsNWosc3VwMyw1ayxhY3V0ZSwnICtcbiAgICAgICAgICAgICc1bCxtaWNybyw1bSxwYXJhLDVuLG1pZGRvdCw1byxjZWRpbCw1cCxzdXAxLDVxLG9yZG0sNXIscmFxdW8sNXMsZnJhYzE0LDV0LGZyYWMxMiw1dSxmcmFjMzQsJyArXG4gICAgICAgICAgICAnNXYsaXF1ZXN0LDYwLEFncmF2ZSw2MSxBYWN1dGUsNjIsQWNpcmMsNjMsQXRpbGRlLDY0LEF1bWwsNjUsQXJpbmcsNjYsQUVsaWcsNjcsQ2NlZGlsLCcgK1xuICAgICAgICAgICAgJzY4LEVncmF2ZSw2OSxFYWN1dGUsNmEsRWNpcmMsNmIsRXVtbCw2YyxJZ3JhdmUsNmQsSWFjdXRlLDZlLEljaXJjLDZmLEl1bWwsNmcsRVRILDZoLE50aWxkZSwnICtcbiAgICAgICAgICAgICc2aSxPZ3JhdmUsNmosT2FjdXRlLDZrLE9jaXJjLDZsLE90aWxkZSw2bSxPdW1sLDZuLHRpbWVzLDZvLE9zbGFzaCw2cCxVZ3JhdmUsNnEsVWFjdXRlLCcgK1xuICAgICAgICAgICAgJzZyLFVjaXJjLDZzLFV1bWwsNnQsWWFjdXRlLDZ1LFRIT1JOLDZ2LHN6bGlnLDcwLGFncmF2ZSw3MSxhYWN1dGUsNzIsYWNpcmMsNzMsYXRpbGRlLDc0LGF1bWwsJyArXG4gICAgICAgICAgICAnNzUsYXJpbmcsNzYsYWVsaWcsNzcsY2NlZGlsLDc4LGVncmF2ZSw3OSxlYWN1dGUsN2EsZWNpcmMsN2IsZXVtbCw3YyxpZ3JhdmUsN2QsaWFjdXRlLDdlLGljaXJjLCcgK1xuICAgICAgICAgICAgJzdmLGl1bWwsN2csZXRoLDdoLG50aWxkZSw3aSxvZ3JhdmUsN2osb2FjdXRlLDdrLG9jaXJjLDdsLG90aWxkZSw3bSxvdW1sLDduLGRpdmlkZSw3byxvc2xhc2gsJyArXG4gICAgICAgICAgICAnN3AsdWdyYXZlLDdxLHVhY3V0ZSw3cix1Y2lyYyw3cyx1dW1sLDd0LHlhY3V0ZSw3dSx0aG9ybiw3dix5dW1sLGNpLGZub2Ysc2gsQWxwaGEsc2ksQmV0YSwnICtcbiAgICAgICAgICAgICdzaixHYW1tYSxzayxEZWx0YSxzbCxFcHNpbG9uLHNtLFpldGEsc24sRXRhLHNvLFRoZXRhLHNwLElvdGEsc3EsS2FwcGEsc3IsTGFtYmRhLHNzLE11LCcgK1xuICAgICAgICAgICAgJ3N0LE51LHN1LFhpLHN2LE9taWNyb24sdDAsUGksdDEsUmhvLHQzLFNpZ21hLHQ0LFRhdSx0NSxVcHNpbG9uLHQ2LFBoaSx0NyxDaGksdDgsUHNpLCcgK1xuICAgICAgICAgICAgJ3Q5LE9tZWdhLHRoLGFscGhhLHRpLGJldGEsdGosZ2FtbWEsdGssZGVsdGEsdGwsZXBzaWxvbix0bSx6ZXRhLHRuLGV0YSx0byx0aGV0YSx0cCxpb3RhLCcgK1xuICAgICAgICAgICAgJ3RxLGthcHBhLHRyLGxhbWJkYSx0cyxtdSx0dCxudSx0dSx4aSx0dixvbWljcm9uLHUwLHBpLHUxLHJobyx1MixzaWdtYWYsdTMsc2lnbWEsdTQsdGF1LCcgK1xuICAgICAgICAgICAgJ3U1LHVwc2lsb24sdTYscGhpLHU3LGNoaSx1OCxwc2ksdTksb21lZ2EsdWgsdGhldGFzeW0sdWksdXBzaWgsdW0scGl2LDgxMixidWxsLDgxNixoZWxsaXAsJyArXG4gICAgICAgICAgICAnODFpLHByaW1lLDgxaixQcmltZSw4MXUsb2xpbmUsODI0LGZyYXNsLDg4byx3ZWllcnAsODhoLGltYWdlLDg4cyxyZWFsLDg5Mix0cmFkZSw4OWwsYWxlZnN5bSwnICtcbiAgICAgICAgICAgICc4Y2csbGFyciw4Y2gsdWFyciw4Y2kscmFyciw4Y2osZGFyciw4Y2ssaGFyciw4ZGwsY3JhcnIsOGVnLGxBcnIsOGVoLHVBcnIsOGVpLHJBcnIsOGVqLGRBcnIsJyArXG4gICAgICAgICAgICAnOGVrLGhBcnIsOGcwLGZvcmFsbCw4ZzIscGFydCw4ZzMsZXhpc3QsOGc1LGVtcHR5LDhnNyxuYWJsYSw4ZzgsaXNpbiw4Zzksbm90aW4sOGdiLG5pLDhnZixwcm9kLCcgK1xuICAgICAgICAgICAgJzhnaCxzdW0sOGdpLG1pbnVzLDhnbixsb3dhc3QsOGdxLHJhZGljLDhndCxwcm9wLDhndSxpbmZpbiw4aDAsYW5nLDhoNyxhbmQsOGg4LG9yLDhoOSxjYXAsOGhhLGN1cCwnICtcbiAgICAgICAgICAgICc4aGIsaW50LDhoayx0aGVyZTQsOGhzLHNpbSw4aTUsY29uZyw4aTgsYXN5bXAsOGowLG5lLDhqMSxlcXVpdiw4ajQsbGUsOGo1LGdlLDhrMixzdWIsOGszLHN1cCw4azQsJyArXG4gICAgICAgICAgICAnbnN1Yiw4azYsc3ViZSw4azcsc3VwZSw4a2wsb3BsdXMsOGtuLG90aW1lcyw4bDUscGVycCw4bTUsc2RvdCw4bzgsbGNlaWwsOG85LHJjZWlsLDhvYSxsZmxvb3IsOG9iLCcgK1xuICAgICAgICAgICAgJ3JmbG9vciw4cDksbGFuZyw4cGEscmFuZyw5ZWEsbG96LDlqMCxzcGFkZXMsOWozLGNsdWJzLDlqNSxoZWFydHMsOWo2LGRpYW1zLGFpLE9FbGlnLGFqLG9lbGlnLGIwLCcgK1xuICAgICAgICAgICAgJ1NjYXJvbixiMSxzY2Fyb24sYm8sWXVtbCxtNixjaXJjLG1zLHRpbGRlLDgwMixlbnNwLDgwMyxlbXNwLDgwOSx0aGluc3AsODBjLHp3bmosODBkLHp3aiw4MGUsbHJtLCcgK1xuICAgICAgICAgICAgJzgwZixybG0sODBqLG5kYXNoLDgwayxtZGFzaCw4MG8sbHNxdW8sODBwLHJzcXVvLDgwcSxzYnF1byw4MHMsbGRxdW8sODB0LHJkcXVvLDgwdSxiZHF1byw4MTAsZGFnZ2VyLCcgK1xuICAgICAgICAgICAgJzgxMSxEYWdnZXIsODFnLHBlcm1pbCw4MXAsbHNhcXVvLDgxcSxyc2FxdW8sODVjLGV1cm8nLCAzMik7XG5cblxuICAgIC8vU29tZSBiYXNpYyBtYXBwaW5ncyBmb3IgYXR0cmlidXRlcyBhbmQgZGVmYXVsdCB2YWx1ZXMuXG4gICAgU1RZTEVTID0ge1xuICAgICAgICBcInN0cm9rZVN0eWxlXCI6e1xuICAgICAgICAgICAgc3ZnQXR0ciA6IFwic3Ryb2tlXCIsIC8vY29ycmVzcG9uZGluZyBzdmcgYXR0cmlidXRlXG4gICAgICAgICAgICBjYW52YXMgOiBcIiMwMDAwMDBcIiwgLy9jYW52YXMgZGVmYXVsdFxuICAgICAgICAgICAgc3ZnIDogXCJub25lXCIsICAgICAgIC8vc3ZnIGRlZmF1bHRcbiAgICAgICAgICAgIGFwcGx5IDogXCJzdHJva2VcIiAgICAvL2FwcGx5IG9uIHN0cm9rZSgpIG9yIGZpbGwoKVxuICAgICAgICB9LFxuICAgICAgICBcImZpbGxTdHlsZVwiOntcbiAgICAgICAgICAgIHN2Z0F0dHIgOiBcImZpbGxcIixcbiAgICAgICAgICAgIGNhbnZhcyA6IFwiIzAwMDAwMFwiLFxuICAgICAgICAgICAgc3ZnIDogbnVsbCwgLy9zdmcgZGVmYXVsdCBpcyBibGFjaywgYnV0IHdlIG5lZWQgdG8gc3BlY2lhbCBjYXNlIHRoaXMgdG8gaGFuZGxlIGNhbnZhcyBzdHJva2Ugd2l0aG91dCBmaWxsXG4gICAgICAgICAgICBhcHBseSA6IFwiZmlsbFwiXG4gICAgICAgIH0sXG4gICAgICAgIFwibGluZUNhcFwiOntcbiAgICAgICAgICAgIHN2Z0F0dHIgOiBcInN0cm9rZS1saW5lY2FwXCIsXG4gICAgICAgICAgICBjYW52YXMgOiBcImJ1dHRcIixcbiAgICAgICAgICAgIHN2ZyA6IFwiYnV0dFwiLFxuICAgICAgICAgICAgYXBwbHkgOiBcInN0cm9rZVwiXG4gICAgICAgIH0sXG4gICAgICAgIFwibGluZUpvaW5cIjp7XG4gICAgICAgICAgICBzdmdBdHRyIDogXCJzdHJva2UtbGluZWpvaW5cIixcbiAgICAgICAgICAgIGNhbnZhcyA6IFwibWl0ZXJcIixcbiAgICAgICAgICAgIHN2ZyA6IFwibWl0ZXJcIixcbiAgICAgICAgICAgIGFwcGx5IDogXCJzdHJva2VcIlxuICAgICAgICB9LFxuICAgICAgICBcIm1pdGVyTGltaXRcIjp7XG4gICAgICAgICAgICBzdmdBdHRyIDogXCJzdHJva2UtbWl0ZXJsaW1pdFwiLFxuICAgICAgICAgICAgY2FudmFzIDogMTAsXG4gICAgICAgICAgICBzdmcgOiA0LFxuICAgICAgICAgICAgYXBwbHkgOiBcInN0cm9rZVwiXG4gICAgICAgIH0sXG4gICAgICAgIFwibGluZVdpZHRoXCI6e1xuICAgICAgICAgICAgc3ZnQXR0ciA6IFwic3Ryb2tlLXdpZHRoXCIsXG4gICAgICAgICAgICBjYW52YXMgOiAxLFxuICAgICAgICAgICAgc3ZnIDogMSxcbiAgICAgICAgICAgIGFwcGx5IDogXCJzdHJva2VcIlxuICAgICAgICB9LFxuICAgICAgICBcImdsb2JhbEFscGhhXCI6IHtcbiAgICAgICAgICAgIHN2Z0F0dHIgOiBcIm9wYWNpdHlcIixcbiAgICAgICAgICAgIGNhbnZhcyA6IDEsXG4gICAgICAgICAgICBzdmcgOiAxLFxuICAgICAgICAgICAgYXBwbHkgOiAgXCJmaWxsIHN0cm9rZVwiXG4gICAgICAgIH0sXG4gICAgICAgIFwiZm9udFwiOntcbiAgICAgICAgICAgIC8vZm9udCBjb252ZXJ0cyB0byBtdWx0aXBsZSBzdmcgYXR0cmlidXRlcywgdGhlcmUgaXMgY3VzdG9tIGxvZ2ljIGZvciB0aGlzXG4gICAgICAgICAgICBjYW52YXMgOiBcIjEwcHggc2Fucy1zZXJpZlwiXG4gICAgICAgIH0sXG4gICAgICAgIFwic2hhZG93Q29sb3JcIjp7XG4gICAgICAgICAgICBjYW52YXMgOiBcIiMwMDAwMDBcIlxuICAgICAgICB9LFxuICAgICAgICBcInNoYWRvd09mZnNldFhcIjp7XG4gICAgICAgICAgICBjYW52YXMgOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwic2hhZG93T2Zmc2V0WVwiOntcbiAgICAgICAgICAgIGNhbnZhcyA6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJzaGFkb3dCbHVyXCI6e1xuICAgICAgICAgICAgY2FudmFzIDogMFxuICAgICAgICB9LFxuICAgICAgICBcInRleHRBbGlnblwiOntcbiAgICAgICAgICAgIGNhbnZhcyA6IFwic3RhcnRcIlxuICAgICAgICB9LFxuICAgICAgICBcInRleHRCYXNlbGluZVwiOntcbiAgICAgICAgICAgIGNhbnZhcyA6IFwiYWxwaGFiZXRpY1wiXG4gICAgICAgIH0sXG4gICAgICAgIFwibGluZURhc2hcIiA6IHtcbiAgICAgICAgICAgIHN2Z0F0dHIgOiBcInN0cm9rZS1kYXNoYXJyYXlcIixcbiAgICAgICAgICAgIGNhbnZhcyA6IFtdLFxuICAgICAgICAgICAgc3ZnIDogbnVsbCxcbiAgICAgICAgICAgIGFwcGx5IDogXCJzdHJva2VcIlxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGdyYWRpZW50Tm9kZSAtIHJlZmVyZW5jZSB0byB0aGUgZ3JhZGllbnRcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBDYW52YXNHcmFkaWVudCA9IGZ1bmN0aW9uIChncmFkaWVudE5vZGUsIGN0eCkge1xuICAgICAgICB0aGlzLl9fcm9vdCA9IGdyYWRpZW50Tm9kZTtcbiAgICAgICAgdGhpcy5fX2N0eCA9IGN0eDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGNvbG9yIHN0b3AgdG8gdGhlIGdyYWRpZW50IHJvb3RcbiAgICAgKi9cbiAgICBDYW52YXNHcmFkaWVudC5wcm90b3R5cGUuYWRkQ29sb3JTdG9wID0gZnVuY3Rpb24gKG9mZnNldCwgY29sb3IpIHtcbiAgICAgICAgdmFyIHN0b3AgPSB0aGlzLl9fY3R4Ll9fY3JlYXRlRWxlbWVudChcInN0b3BcIiksIHJlZ2V4LCBtYXRjaGVzO1xuICAgICAgICBzdG9wLnNldEF0dHJpYnV0ZShcIm9mZnNldFwiLCBvZmZzZXQpO1xuICAgICAgICBpZiAoY29sb3IuaW5kZXhPZihcInJnYmFcIikgIT09IC0xKSB7XG4gICAgICAgICAgICAvL3NlcGFyYXRlIGFscGhhIHZhbHVlLCBzaW5jZSB3ZWJraXQgY2FuJ3QgaGFuZGxlIGl0XG4gICAgICAgICAgICByZWdleCA9IC9yZ2JhXFwoXFxzKihcXGQrKVxccyosXFxzKihcXGQrKVxccyosXFxzKihcXGQrKVxccyosXFxzKihcXGQ/XFwuP1xcZCopXFxzKlxcKS9naTtcbiAgICAgICAgICAgIG1hdGNoZXMgPSByZWdleC5leGVjKGNvbG9yKTtcbiAgICAgICAgICAgIHN0b3Auc2V0QXR0cmlidXRlKFwic3RvcC1jb2xvclwiLCBmb3JtYXQoXCJyZ2Ioe3J9LHtnfSx7Yn0pXCIsIHtyOm1hdGNoZXNbMV0sIGc6bWF0Y2hlc1syXSwgYjptYXRjaGVzWzNdfSkpO1xuICAgICAgICAgICAgc3RvcC5zZXRBdHRyaWJ1dGUoXCJzdG9wLW9wYWNpdHlcIiwgbWF0Y2hlc1s0XSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdG9wLnNldEF0dHJpYnV0ZShcInN0b3AtY29sb3JcIiwgY29sb3IpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX19yb290LmFwcGVuZENoaWxkKHN0b3ApO1xuICAgIH07XG5cbiAgICBDYW52YXNQYXR0ZXJuID0gZnVuY3Rpb24gKHBhdHRlcm4sIGN0eCkge1xuICAgICAgICB0aGlzLl9fcm9vdCA9IHBhdHRlcm47XG4gICAgICAgIHRoaXMuX19jdHggPSBjdHg7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBtb2NrIGNhbnZhcyBjb250ZXh0XG4gICAgICogQHBhcmFtIG8gLSBvcHRpb25zIGluY2x1ZGU6XG4gICAgICogY3R4IC0gZXhpc3RpbmcgQ29udGV4dDJEIHRvIHdyYXAgYXJvdW5kXG4gICAgICogd2lkdGggLSB3aWR0aCBvZiB5b3VyIGNhbnZhcyAoZGVmYXVsdHMgdG8gNTAwKVxuICAgICAqIGhlaWdodCAtIGhlaWdodCBvZiB5b3VyIGNhbnZhcyAoZGVmYXVsdHMgdG8gNTAwKVxuICAgICAqIGVuYWJsZU1pcnJvcmluZyAtIGVuYWJsZXMgY2FudmFzIG1pcnJvcmluZyAoZ2V0IGltYWdlIGRhdGEpIChkZWZhdWx0cyB0byBmYWxzZSlcbiAgICAgKiBkb2N1bWVudCAtIHRoZSBkb2N1bWVudCBvYmplY3QgKGRlZmF1bHRzIHRvIHRoZSBjdXJyZW50IGRvY3VtZW50KVxuICAgICAqL1xuICAgIGN0eCA9IGZ1bmN0aW9uIChvKSB7XG4gICAgICAgIHZhciBkZWZhdWx0T3B0aW9ucyA9IHsgd2lkdGg6NTAwLCBoZWlnaHQ6NTAwLCBlbmFibGVNaXJyb3JpbmcgOiBmYWxzZX0sIG9wdGlvbnM7XG5cbiAgICAgICAgLy9rZWVwIHN1cHBvcnQgZm9yIHRoaXMgd2F5IG9mIGNhbGxpbmcgQzJTOiBuZXcgQzJTKHdpZHRoLGhlaWdodClcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gZGVmYXVsdE9wdGlvbnM7XG4gICAgICAgICAgICBvcHRpb25zLndpZHRoID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgb3B0aW9ucy5oZWlnaHQgPSBhcmd1bWVudHNbMV07XG4gICAgICAgIH0gZWxzZSBpZiAoICFvICkge1xuICAgICAgICAgICAgb3B0aW9ucyA9IGRlZmF1bHRPcHRpb25zO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3B0aW9ucyA9IG87XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgY3R4KSkge1xuICAgICAgICAgICAgLy9kaWQgc29tZW9uZSBjYWxsIHRoaXMgd2l0aG91dCBuZXc/XG4gICAgICAgICAgICByZXR1cm4gbmV3IGN0eChvcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vc2V0dXAgb3B0aW9uc1xuICAgICAgICB0aGlzLndpZHRoID0gb3B0aW9ucy53aWR0aCB8fCBkZWZhdWx0T3B0aW9ucy53aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBvcHRpb25zLmhlaWdodCB8fCBkZWZhdWx0T3B0aW9ucy5oZWlnaHQ7XG4gICAgICAgIHRoaXMuZW5hYmxlTWlycm9yaW5nID0gb3B0aW9ucy5lbmFibGVNaXJyb3JpbmcgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuZW5hYmxlTWlycm9yaW5nIDogZGVmYXVsdE9wdGlvbnMuZW5hYmxlTWlycm9yaW5nO1xuXG4gICAgICAgIHRoaXMuY2FudmFzID0gdGhpczsgICAvLy9wb2ludCBiYWNrIHRvIHRoaXMgaW5zdGFuY2UhXG4gICAgICAgIHRoaXMuX19kb2N1bWVudCA9IG9wdGlvbnMuZG9jdW1lbnQgfHwgZG9jdW1lbnQ7XG5cbiAgICAgICAgLy8gYWxsb3cgcGFzc2luZyBpbiBhbiBleGlzdGluZyBjb250ZXh0IHRvIHdyYXAgYXJvdW5kXG4gICAgICAgIC8vIGlmIGEgY29udGV4dCBpcyBwYXNzZWQgaW4sIHdlIGtub3cgYSBjYW52YXMgYWxyZWFkeSBleGlzdFxuICAgICAgICBpZiAob3B0aW9ucy5jdHgpIHtcbiAgICAgICAgICAgIHRoaXMuX19jdHggPSBvcHRpb25zLmN0eDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX19jYW52YXMgPSB0aGlzLl9fZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICAgICAgICAgIHRoaXMuX19jdHggPSB0aGlzLl9fY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX19zZXREZWZhdWx0U3R5bGVzKCk7XG4gICAgICAgIHRoaXMuX19zdGFjayA9IFt0aGlzLl9fZ2V0U3R5bGVTdGF0ZSgpXTtcbiAgICAgICAgdGhpcy5fX2dyb3VwU3RhY2sgPSBbXTtcblxuICAgICAgICAvL3RoZSByb290IHN2ZyBlbGVtZW50XG4gICAgICAgIHRoaXMuX19yb290ID0gdGhpcy5fX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwic3ZnXCIpO1xuICAgICAgICB0aGlzLl9fcm9vdC5zZXRBdHRyaWJ1dGUoXCJ2ZXJzaW9uXCIsIDEuMSk7XG4gICAgICAgIHRoaXMuX19yb290LnNldEF0dHJpYnV0ZShcInhtbG5zXCIsIFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIik7XG4gICAgICAgIHRoaXMuX19yb290LnNldEF0dHJpYnV0ZU5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC94bWxucy9cIiwgXCJ4bWxuczp4bGlua1wiLCBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIik7XG4gICAgICAgIHRoaXMuX19yb290LnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIHRoaXMud2lkdGgpO1xuICAgICAgICB0aGlzLl9fcm9vdC5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgdGhpcy5oZWlnaHQpO1xuXG4gICAgICAgIC8vbWFrZSBzdXJlIHdlIGRvbid0IGdlbmVyYXRlIHRoZSBzYW1lIGlkcyBpbiBkZWZzXG4gICAgICAgIHRoaXMuX19pZHMgPSB7fTtcblxuICAgICAgICAvL2RlZnMgdGFnXG4gICAgICAgIHRoaXMuX19kZWZzID0gdGhpcy5fX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwiZGVmc1wiKTtcbiAgICAgICAgdGhpcy5fX3Jvb3QuYXBwZW5kQ2hpbGQodGhpcy5fX2RlZnMpO1xuXG4gICAgICAgIC8vYWxzbyBhZGQgYSBncm91cCBjaGlsZC4gdGhlIHN2ZyBlbGVtZW50IGNhbid0IHVzZSB0aGUgdHJhbnNmb3JtIGF0dHJpYnV0ZVxuICAgICAgICB0aGlzLl9fY3VycmVudEVsZW1lbnQgPSB0aGlzLl9fZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJnXCIpO1xuICAgICAgICB0aGlzLl9fcm9vdC5hcHBlbmRDaGlsZCh0aGlzLl9fY3VycmVudEVsZW1lbnQpO1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGhlIHNwZWNpZmllZCBzdmcgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5fX2NyZWF0ZUVsZW1lbnQgPSBmdW5jdGlvbiAoZWxlbWVudE5hbWUsIHByb3BlcnRpZXMsIHJlc2V0RmlsbCkge1xuICAgICAgICBpZiAodHlwZW9mIHByb3BlcnRpZXMgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHByb3BlcnRpZXMgPSB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBlbGVtZW50ID0gdGhpcy5fX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIGVsZW1lbnROYW1lKSxcbiAgICAgICAgICAgIGtleXMgPSBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKSwgaSwga2V5O1xuICAgICAgICBpZiAocmVzZXRGaWxsKSB7XG4gICAgICAgICAgICAvL2lmIGZpbGwgb3Igc3Ryb2tlIGlzIG5vdCBzcGVjaWZpZWQsIHRoZSBzdmcgZWxlbWVudCBzaG91bGQgbm90IGRpc3BsYXkuIEJ5IGRlZmF1bHQgU1ZHJ3MgZmlsbCBpcyBibGFjay5cbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZmlsbFwiLCBcIm5vbmVcIik7XG4gICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcInN0cm9rZVwiLCBcIm5vbmVcIik7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpPTA7IGk8a2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGtleSwgcHJvcGVydGllc1trZXldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQXBwbGllcyBkZWZhdWx0IGNhbnZhcyBzdHlsZXMgdG8gdGhlIGNvbnRleHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuX19zZXREZWZhdWx0U3R5bGVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvL2RlZmF1bHQgMmQgY2FudmFzIGNvbnRleHQgcHJvcGVydGllcyBzZWU6aHR0cDovL3d3dy53My5vcmcvVFIvMmRjb250ZXh0L1xuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKFNUWUxFUyksIGksIGtleTtcbiAgICAgICAgZm9yIChpPTA7IGk8a2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICAgIHRoaXNba2V5XSA9IFNUWUxFU1trZXldLmNhbnZhcztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBcHBsaWVzIHN0eWxlcyBvbiByZXN0b3JlXG4gICAgICogQHBhcmFtIHN0eWxlU3RhdGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuX19hcHBseVN0eWxlU3RhdGUgPSBmdW5jdGlvbiAoc3R5bGVTdGF0ZSkge1xuICAgICAgICBpZighc3R5bGVTdGF0ZSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhzdHlsZVN0YXRlKSwgaSwga2V5O1xuICAgICAgICBmb3IgKGk9MDsgaTxrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgICAgICAgdGhpc1trZXldID0gc3R5bGVTdGF0ZVtrZXldO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGN1cnJlbnQgc3R5bGUgc3RhdGVcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLl9fZ2V0U3R5bGVTdGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGksIHN0eWxlU3RhdGUgPSB7fSwga2V5cyA9IE9iamVjdC5rZXlzKFNUWUxFUyksIGtleTtcbiAgICAgICAgZm9yIChpPTA7IGk8a2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICAgIHN0eWxlU3RhdGVba2V5XSA9IHRoaXNba2V5XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3R5bGVTdGF0ZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQXBwbGVzIHRoZSBjdXJyZW50IHN0eWxlcyB0byB0aGUgY3VycmVudCBTVkcgZWxlbWVudC4gT24gXCJjdHguZmlsbFwiIG9yIFwiY3R4LnN0cm9rZVwiXG4gICAgICogQHBhcmFtIHR5cGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuX19hcHBseVN0eWxlVG9DdXJyZW50RWxlbWVudCA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgXHR2YXIgY3VycmVudEVsZW1lbnQgPSB0aGlzLl9fY3VycmVudEVsZW1lbnQ7XG4gICAgXHR2YXIgY3VycmVudFN0eWxlR3JvdXAgPSB0aGlzLl9fY3VycmVudEVsZW1lbnRzVG9TdHlsZTtcbiAgICBcdGlmIChjdXJyZW50U3R5bGVHcm91cCkge1xuICAgIFx0XHRjdXJyZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUodHlwZSwgXCJcIik7XG4gICAgXHRcdGN1cnJlbnRFbGVtZW50ID0gY3VycmVudFN0eWxlR3JvdXAuZWxlbWVudDtcbiAgICBcdFx0Y3VycmVudFN0eWxlR3JvdXAuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuICAgIFx0XHRcdG5vZGUuc2V0QXR0cmlidXRlKHR5cGUsIFwiXCIpO1xuICAgIFx0XHR9KVxuICAgIFx0fVxuXG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoU1RZTEVTKSwgaSwgc3R5bGUsIHZhbHVlLCBpZCwgcmVnZXgsIG1hdGNoZXM7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzdHlsZSA9IFNUWUxFU1trZXlzW2ldXTtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpc1trZXlzW2ldXTtcbiAgICAgICAgICAgIGlmIChzdHlsZS5hcHBseSkge1xuICAgICAgICAgICAgICAgIC8vaXMgdGhpcyBhIGdyYWRpZW50IG9yIHBhdHRlcm4/XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQ2FudmFzUGF0dGVybikge1xuICAgICAgICAgICAgICAgICAgICAvL3BhdHRlcm5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLl9fY3R4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NvcHkgb3ZlciBkZWZzXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSh2YWx1ZS5fX2N0eC5fX2RlZnMuY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZCA9IHZhbHVlLl9fY3R4Ll9fZGVmcy5jaGlsZE5vZGVzWzBdLmdldEF0dHJpYnV0ZShcImlkXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX19pZHNbaWRdID0gaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fX2RlZnMuYXBwZW5kQ2hpbGQodmFsdWUuX19jdHguX19kZWZzLmNoaWxkTm9kZXNbMF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRFbGVtZW50LnNldEF0dHJpYnV0ZShzdHlsZS5hcHBseSwgZm9ybWF0KFwidXJsKCN7aWR9KVwiLCB7aWQ6dmFsdWUuX19yb290LmdldEF0dHJpYnV0ZShcImlkXCIpfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIENhbnZhc0dyYWRpZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vZ3JhZGllbnRcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEVsZW1lbnQuc2V0QXR0cmlidXRlKHN0eWxlLmFwcGx5LCBmb3JtYXQoXCJ1cmwoI3tpZH0pXCIsIHtpZDp2YWx1ZS5fX3Jvb3QuZ2V0QXR0cmlidXRlKFwiaWRcIil9KSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzdHlsZS5hcHBseS5pbmRleE9mKHR5cGUpIT09LTEgJiYgc3R5bGUuc3ZnICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKHN0eWxlLnN2Z0F0dHIgPT09IFwic3Ryb2tlXCIgfHwgc3R5bGUuc3ZnQXR0ciA9PT0gXCJmaWxsXCIpICYmIHZhbHVlLmluZGV4T2YoXCJyZ2JhXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9zZXBhcmF0ZSBhbHBoYSB2YWx1ZSwgc2luY2UgaWxsdXN0cmF0b3IgY2FuJ3QgaGFuZGxlIGl0XG4gICAgICAgICAgICAgICAgICAgICAgICByZWdleCA9IC9yZ2JhXFwoXFxzKihcXGQrKVxccyosXFxzKihcXGQrKVxccyosXFxzKihcXGQrKVxccyosXFxzKihcXGQ/XFwuP1xcZCopXFxzKlxcKS9naTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoZXMgPSByZWdleC5leGVjKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRFbGVtZW50LnNldEF0dHJpYnV0ZShzdHlsZS5zdmdBdHRyLCBmb3JtYXQoXCJyZ2Ioe3J9LHtnfSx7Yn0pXCIsIHtyOm1hdGNoZXNbMV0sIGc6bWF0Y2hlc1syXSwgYjptYXRjaGVzWzNdfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9zaG91bGQgdGFrZSBnbG9iYWxBbHBoYSBoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3BhY2l0eSA9IG1hdGNoZXNbNF07XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZ2xvYmFsQWxwaGEgPSB0aGlzLmdsb2JhbEFscGhhO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdsb2JhbEFscGhhICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGFjaXR5ICo9IGdsb2JhbEFscGhhO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEVsZW1lbnQuc2V0QXR0cmlidXRlKHN0eWxlLnN2Z0F0dHIrXCItb3BhY2l0eVwiLCBvcGFjaXR5KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhdHRyID0gc3R5bGUuc3ZnQXR0cjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrZXlzW2ldID09PSAnZ2xvYmFsQWxwaGEnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0ciA9IHR5cGUrJy0nK3N0eWxlLnN2Z0F0dHI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRFbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9maWxsLW9wYWNpdHkgb3Igc3Ryb2tlLW9wYWNpdHkgaGFzIGFscmVhZHkgYmVlbiBzZXQgYnkgc3Ryb2tlIG9yIGZpbGwuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vb3RoZXJ3aXNlIG9ubHkgdXBkYXRlIGF0dHJpYnV0ZSBpZiByaWdodCB0eXBlLCBhbmQgbm90IHN2ZyBkZWZhdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoYXR0ciwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFdpbGwgcmV0dXJuIHRoZSBjbG9zZXN0IGdyb3VwIG9yIHN2ZyBub2RlLiBNYXkgcmV0dXJuIHRoZSBjdXJyZW50IGVsZW1lbnQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLl9fY2xvc2VzdEdyb3VwT3JTdmcgPSBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICBub2RlID0gbm9kZSB8fCB0aGlzLl9fY3VycmVudEVsZW1lbnQ7XG4gICAgICAgIGlmIChub2RlLm5vZGVOYW1lID09PSBcImdcIiB8fCBub2RlLm5vZGVOYW1lID09PSBcInN2Z1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9fY2xvc2VzdEdyb3VwT3JTdmcobm9kZS5wYXJlbnROb2RlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBzZXJpYWxpemVkIHZhbHVlIG9mIHRoZSBzdmcgc28gZmFyXG4gICAgICogQHBhcmFtIGZpeE5hbWVkRW50aXRpZXMgLSBTdGFuZGFsb25lIFNWRyBkb2Vzbid0IHN1cHBvcnQgbmFtZWQgZW50aXRpZXMsIHdoaWNoIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlIGVuY29kZXMuXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBJZiB0cnVlLCB3ZSBhdHRlbXB0IHRvIGZpbmQgYWxsIG5hbWVkIGVudGl0aWVzIGFuZCBlbmNvZGUgaXQgYXMgYSBudW1lcmljIGVudGl0eS5cbiAgICAgKiBAcmV0dXJuIHNlcmlhbGl6ZWQgc3ZnXG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5nZXRTZXJpYWxpemVkU3ZnID0gZnVuY3Rpb24gKGZpeE5hbWVkRW50aXRpZXMpIHtcbiAgICAgICAgdmFyIHNlcmlhbGl6ZWQgPSBuZXcgWE1MU2VyaWFsaXplcigpLnNlcmlhbGl6ZVRvU3RyaW5nKHRoaXMuX19yb290KSxcbiAgICAgICAgICAgIGtleXMsIGksIGtleSwgdmFsdWUsIHJlZ2V4cCwgeG1sbnM7XG5cbiAgICAgICAgLy9JRSBzZWFyY2ggZm9yIGEgZHVwbGljYXRlIHhtbmxzIGJlY2F1c2UgdGhleSBkaWRuJ3QgaW1wbGVtZW50IHNldEF0dHJpYnV0ZU5TIGNvcnJlY3RseVxuICAgICAgICB4bWxucyA9IC94bWxucz1cImh0dHA6XFwvXFwvd3d3XFwudzNcXC5vcmdcXC8yMDAwXFwvc3ZnXCIuK3htbG5zPVwiaHR0cDpcXC9cXC93d3dcXC53M1xcLm9yZ1xcLzIwMDBcXC9zdmcvZ2k7XG4gICAgICAgIGlmICh4bWxucy50ZXN0KHNlcmlhbGl6ZWQpKSB7XG4gICAgICAgICAgICBzZXJpYWxpemVkID0gc2VyaWFsaXplZC5yZXBsYWNlKCd4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywneG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZml4TmFtZWRFbnRpdGllcykge1xuICAgICAgICAgICAga2V5cyA9IE9iamVjdC5rZXlzKG5hbWVkRW50aXRpZXMpO1xuICAgICAgICAgICAgLy9sb29wIG92ZXIgZWFjaCBuYW1lZCBlbnRpdHkgYW5kIHJlcGxhY2Ugd2l0aCB0aGUgcHJvcGVyIGVxdWl2YWxlbnQuXG4gICAgICAgICAgICBmb3IgKGk9MDsgaTxrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IG5hbWVkRW50aXRpZXNba2V5XTtcbiAgICAgICAgICAgICAgICByZWdleHAgPSBuZXcgUmVnRXhwKGtleSwgXCJnaVwiKTtcbiAgICAgICAgICAgICAgICBpZiAocmVnZXhwLnRlc3Qoc2VyaWFsaXplZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VyaWFsaXplZCA9IHNlcmlhbGl6ZWQucmVwbGFjZShyZWdleHAsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2VyaWFsaXplZDtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSByb290IHN2Z1xuICAgICAqIEByZXR1cm5cbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLmdldFN2ZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19yb290O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogV2lsbCBnZW5lcmF0ZSBhIGdyb3VwIHRhZy5cbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLnNhdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBncm91cCA9IHRoaXMuX19jcmVhdGVFbGVtZW50KFwiZ1wiKTtcbiAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMuX19jbG9zZXN0R3JvdXBPclN2ZygpO1xuICAgICAgICB0aGlzLl9fZ3JvdXBTdGFjay5wdXNoKHBhcmVudCk7XG4gICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChncm91cCk7XG4gICAgICAgIHRoaXMuX19jdXJyZW50RWxlbWVudCA9IGdyb3VwO1xuICAgICAgICB0aGlzLl9fc3RhY2sucHVzaCh0aGlzLl9fZ2V0U3R5bGVTdGF0ZSgpKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFNldHMgY3VycmVudCBlbGVtZW50IHRvIHBhcmVudCwgb3IganVzdCByb290IGlmIGFscmVhZHkgcm9vdFxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUucmVzdG9yZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fX2N1cnJlbnRFbGVtZW50ID0gdGhpcy5fX2dyb3VwU3RhY2sucG9wKCk7XG4gICAgICAgIHRoaXMuX19jdXJyZW50RWxlbWVudHNUb1N0eWxlID0gbnVsbDtcbiAgICAgICAgLy9DbGVhcmluZyBjYW52YXMgd2lsbCBtYWtlIHRoZSBwb3BlZCBncm91cCBpbnZhbGlkLCBjdXJyZW50RWxlbWVudCBpcyBzZXQgdG8gdGhlIHJvb3QgZ3JvdXAgbm9kZS5cbiAgICAgICAgaWYgKCF0aGlzLl9fY3VycmVudEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuX19jdXJyZW50RWxlbWVudCA9IHRoaXMuX19yb290LmNoaWxkTm9kZXNbMV07XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5fX3N0YWNrLnBvcCgpO1xuICAgICAgICB0aGlzLl9fYXBwbHlTdHlsZVN0YXRlKHN0YXRlKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSGVscGVyIG1ldGhvZCB0byBhZGQgdHJhbnNmb3JtXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLl9fYWRkVHJhbnNmb3JtID0gZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgLy9pZiB0aGUgY3VycmVudCBlbGVtZW50IGhhcyBzaWJsaW5ncywgYWRkIGFub3RoZXIgZ3JvdXBcbiAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMuX19jbG9zZXN0R3JvdXBPclN2ZygpO1xuICAgICAgICBpZiAocGFyZW50LmNoaWxkTm9kZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBcdGlmICh0aGlzLl9fY3VycmVudEVsZW1lbnQubm9kZU5hbWUgPT09IFwicGF0aFwiKSB7XG4gICAgICAgIFx0XHRpZiAoIXRoaXMuX19jdXJyZW50RWxlbWVudHNUb1N0eWxlKSB0aGlzLl9fY3VycmVudEVsZW1lbnRzVG9TdHlsZSA9IHtlbGVtZW50OiBwYXJlbnQsIGNoaWxkcmVuOiBbXX07XG4gICAgICAgIFx0XHR0aGlzLl9fY3VycmVudEVsZW1lbnRzVG9TdHlsZS5jaGlsZHJlbi5wdXNoKHRoaXMuX19jdXJyZW50RWxlbWVudClcbiAgICAgICAgXHRcdHRoaXMuX19hcHBseUN1cnJlbnREZWZhdWx0UGF0aCgpO1xuICAgICAgICBcdH1cblxuICAgICAgICAgICAgdmFyIGdyb3VwID0gdGhpcy5fX2NyZWF0ZUVsZW1lbnQoXCJnXCIpO1xuICAgICAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKGdyb3VwKTtcbiAgICAgICAgICAgIHRoaXMuX19jdXJyZW50RWxlbWVudCA9IGdyb3VwO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRyYW5zZm9ybSA9IHRoaXMuX19jdXJyZW50RWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIik7XG4gICAgICAgIGlmICh0cmFuc2Zvcm0pIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybSArPSBcIiBcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNmb3JtICs9IHQ7XG4gICAgICAgIHRoaXMuX19jdXJyZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIiwgdHJhbnNmb3JtKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogIHNjYWxlcyB0aGUgY3VycmVudCBlbGVtZW50XG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5zY2FsZSA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgIGlmICh5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHkgPSB4O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX19hZGRUcmFuc2Zvcm0oZm9ybWF0KFwic2NhbGUoe3h9LHt5fSlcIiwge3g6eCwgeTp5fSkpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiByb3RhdGVzIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLnJvdGF0ZSA9IGZ1bmN0aW9uIChhbmdsZSkge1xuICAgICAgICB2YXIgZGVncmVlcyA9IChhbmdsZSAqIDE4MCAvIE1hdGguUEkpO1xuICAgICAgICB0aGlzLl9fYWRkVHJhbnNmb3JtKGZvcm1hdChcInJvdGF0ZSh7YW5nbGV9LHtjeH0se2N5fSlcIiwge2FuZ2xlOmRlZ3JlZXMsIGN4OjAsIGN5OjB9KSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIHRyYW5zbGF0ZXMgdGhlIGN1cnJlbnQgZWxlbWVudFxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUudHJhbnNsYXRlID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgdGhpcy5fX2FkZFRyYW5zZm9ybShmb3JtYXQoXCJ0cmFuc2xhdGUoe3h9LHt5fSlcIiwge3g6eCx5Onl9KSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIGFwcGxpZXMgYSB0cmFuc2Zvcm0gdG8gdGhlIGN1cnJlbnQgZWxlbWVudFxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUudHJhbnNmb3JtID0gZnVuY3Rpb24gKGEsIGIsIGMsIGQsIGUsIGYpIHtcbiAgICAgICAgdGhpcy5fX2FkZFRyYW5zZm9ybShmb3JtYXQoXCJtYXRyaXgoe2F9LHtifSx7Y30se2R9LHtlfSx7Zn0pXCIsIHthOmEsIGI6YiwgYzpjLCBkOmQsIGU6ZSwgZjpmfSkpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgUGF0aCBFbGVtZW50XG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5iZWdpblBhdGggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBwYXRoLCBwYXJlbnQ7XG5cbiAgICAgICAgLy8gTm90ZSB0aGF0IHRoZXJlIGlzIG9ubHkgb25lIGN1cnJlbnQgZGVmYXVsdCBwYXRoLCBpdCBpcyBub3QgcGFydCBvZiB0aGUgZHJhd2luZyBzdGF0ZS5cbiAgICAgICAgLy8gU2VlIGFsc286IGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3NjcmlwdGluZy5odG1sI2N1cnJlbnQtZGVmYXVsdC1wYXRoXG4gICAgICAgIHRoaXMuX19jdXJyZW50RGVmYXVsdFBhdGggPSBcIlwiO1xuICAgICAgICB0aGlzLl9fY3VycmVudFBvc2l0aW9uID0ge307XG5cbiAgICAgICAgcGF0aCA9IHRoaXMuX19jcmVhdGVFbGVtZW50KFwicGF0aFwiLCB7fSwgdHJ1ZSk7XG4gICAgICAgIHBhcmVudCA9IHRoaXMuX19jbG9zZXN0R3JvdXBPclN2ZygpO1xuICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQocGF0aCk7XG4gICAgICAgIHRoaXMuX19jdXJyZW50RWxlbWVudCA9IHBhdGg7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEhlbHBlciBmdW5jdGlvbiB0byBhcHBseSBjdXJyZW50RGVmYXVsdFBhdGggdG8gY3VycmVudCBwYXRoIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuX19hcHBseUN1cnJlbnREZWZhdWx0UGF0aCA9IGZ1bmN0aW9uICgpIHtcbiAgICBcdHZhciBjdXJyZW50RWxlbWVudCA9IHRoaXMuX19jdXJyZW50RWxlbWVudDtcbiAgICAgICAgaWYgKGN1cnJlbnRFbGVtZW50Lm5vZGVOYW1lID09PSBcInBhdGhcIikge1xuXHRcdFx0Y3VycmVudEVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZFwiLCB0aGlzLl9fY3VycmVudERlZmF1bHRQYXRoKTtcbiAgICAgICAgfSBlbHNlIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoXCJBdHRlbXB0ZWQgdG8gYXBwbHkgcGF0aCBjb21tYW5kIHRvIG5vZGVcIiwgY3VycmVudEVsZW1lbnQubm9kZU5hbWUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEhlbHBlciBmdW5jdGlvbiB0byBhZGQgcGF0aCBjb21tYW5kXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLl9fYWRkUGF0aENvbW1hbmQgPSBmdW5jdGlvbiAoY29tbWFuZCkge1xuICAgICAgICB0aGlzLl9fY3VycmVudERlZmF1bHRQYXRoICs9IFwiIFwiO1xuICAgICAgICB0aGlzLl9fY3VycmVudERlZmF1bHRQYXRoICs9IGNvbW1hbmQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgdGhlIG1vdmUgY29tbWFuZCB0byB0aGUgY3VycmVudCBwYXRoIGVsZW1lbnQsXG4gICAgICogaWYgdGhlIGN1cnJlbnRQYXRoRWxlbWVudCBpcyBub3QgZW1wdHkgY3JlYXRlIGEgbmV3IHBhdGggZWxlbWVudFxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUubW92ZVRvID0gZnVuY3Rpb24gKHgseSkge1xuICAgICAgICBpZiAodGhpcy5fX2N1cnJlbnRFbGVtZW50Lm5vZGVOYW1lICE9PSBcInBhdGhcIikge1xuICAgICAgICAgICAgdGhpcy5iZWdpblBhdGgoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNyZWF0ZXMgYSBuZXcgc3VicGF0aCB3aXRoIHRoZSBnaXZlbiBwb2ludFxuICAgICAgICB0aGlzLl9fY3VycmVudFBvc2l0aW9uID0ge3g6IHgsIHk6IHl9O1xuICAgICAgICB0aGlzLl9fYWRkUGF0aENvbW1hbmQoZm9ybWF0KFwiTSB7eH0ge3l9XCIsIHt4OngsIHk6eX0pKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2xvc2VzIHRoZSBjdXJyZW50IHBhdGhcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLmNsb3NlUGF0aCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX19jdXJyZW50RGVmYXVsdFBhdGgpIHtcbiAgICAgICAgICAgIHRoaXMuX19hZGRQYXRoQ29tbWFuZChcIlpcIik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpbmUgdG8gY29tbWFuZFxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUubGluZVRvID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgdGhpcy5fX2N1cnJlbnRQb3NpdGlvbiA9IHt4OiB4LCB5OiB5fTtcbiAgICAgICAgaWYgKHRoaXMuX19jdXJyZW50RGVmYXVsdFBhdGguaW5kZXhPZignTScpID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuX19hZGRQYXRoQ29tbWFuZChmb3JtYXQoXCJMIHt4fSB7eX1cIiwge3g6eCwgeTp5fSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fX2FkZFBhdGhDb21tYW5kKGZvcm1hdChcIk0ge3h9IHt5fVwiLCB7eDp4LCB5Onl9KSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkIGEgYmV6aWVyIGNvbW1hbmRcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLmJlemllckN1cnZlVG8gPSBmdW5jdGlvbiAoY3AxeCwgY3AxeSwgY3AyeCwgY3AyeSwgeCwgeSkge1xuICAgICAgICB0aGlzLl9fY3VycmVudFBvc2l0aW9uID0ge3g6IHgsIHk6IHl9O1xuICAgICAgICB0aGlzLl9fYWRkUGF0aENvbW1hbmQoZm9ybWF0KFwiQyB7Y3AxeH0ge2NwMXl9IHtjcDJ4fSB7Y3AyeX0ge3h9IHt5fVwiLFxuICAgICAgICAgICAge2NwMXg6Y3AxeCwgY3AxeTpjcDF5LCBjcDJ4OmNwMngsIGNwMnk6Y3AyeSwgeDp4LCB5Onl9KSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBxdWFkcmF0aWMgY3VydmUgdG8gY29tbWFuZFxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUucXVhZHJhdGljQ3VydmVUbyA9IGZ1bmN0aW9uIChjcHgsIGNweSwgeCwgeSkge1xuICAgICAgICB0aGlzLl9fY3VycmVudFBvc2l0aW9uID0ge3g6IHgsIHk6IHl9O1xuICAgICAgICB0aGlzLl9fYWRkUGF0aENvbW1hbmQoZm9ybWF0KFwiUSB7Y3B4fSB7Y3B5fSB7eH0ge3l9XCIsIHtjcHg6Y3B4LCBjcHk6Y3B5LCB4OngsIHk6eX0pKTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gYSBuZXcgbm9ybWFsaXplZCB2ZWN0b3Igb2YgZ2l2ZW4gdmVjdG9yXG4gICAgICovXG4gICAgdmFyIG5vcm1hbGl6ZSA9IGZ1bmN0aW9uICh2ZWN0b3IpIHtcbiAgICAgICAgdmFyIGxlbiA9IE1hdGguc3FydCh2ZWN0b3JbMF0gKiB2ZWN0b3JbMF0gKyB2ZWN0b3JbMV0gKiB2ZWN0b3JbMV0pO1xuICAgICAgICByZXR1cm4gW3ZlY3RvclswXSAvIGxlbiwgdmVjdG9yWzFdIC8gbGVuXTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkcyB0aGUgYXJjVG8gdG8gdGhlIGN1cnJlbnQgcGF0aFxuICAgICAqXG4gICAgICogQHNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi8yMDE1L1dELTJkY29udGV4dC0yMDE1MDUxNC8jZG9tLWNvbnRleHQtMmQtYXJjdG9cbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLmFyY1RvID0gZnVuY3Rpb24gKHgxLCB5MSwgeDIsIHkyLCByYWRpdXMpIHtcbiAgICAgICAgLy8gTGV0IHRoZSBwb2ludCAoeDAsIHkwKSBiZSB0aGUgbGFzdCBwb2ludCBpbiB0aGUgc3VicGF0aC5cbiAgICAgICAgdmFyIHgwID0gdGhpcy5fX2N1cnJlbnRQb3NpdGlvbiAmJiB0aGlzLl9fY3VycmVudFBvc2l0aW9uLng7XG4gICAgICAgIHZhciB5MCA9IHRoaXMuX19jdXJyZW50UG9zaXRpb24gJiYgdGhpcy5fX2N1cnJlbnRQb3NpdGlvbi55O1xuXG4gICAgICAgIC8vIEZpcnN0IGVuc3VyZSB0aGVyZSBpcyBhIHN1YnBhdGggZm9yICh4MSwgeTEpLlxuICAgICAgICBpZiAodHlwZW9mIHgwID09IFwidW5kZWZpbmVkXCIgfHwgdHlwZW9mIHkwID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5lZ2F0aXZlIHZhbHVlcyBmb3IgcmFkaXVzIG11c3QgY2F1c2UgdGhlIGltcGxlbWVudGF0aW9uIHRvIHRocm93IGFuIEluZGV4U2l6ZUVycm9yIGV4Y2VwdGlvbi5cbiAgICAgICAgaWYgKHJhZGl1cyA8IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkluZGV4U2l6ZUVycm9yOiBUaGUgcmFkaXVzIHByb3ZpZGVkIChcIiArIHJhZGl1cyArIFwiKSBpcyBuZWdhdGl2ZS5cIik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGUgcG9pbnQgKHgwLCB5MCkgaXMgZXF1YWwgdG8gdGhlIHBvaW50ICh4MSwgeTEpLFxuICAgICAgICAvLyBvciBpZiB0aGUgcG9pbnQgKHgxLCB5MSkgaXMgZXF1YWwgdG8gdGhlIHBvaW50ICh4MiwgeTIpLFxuICAgICAgICAvLyBvciBpZiB0aGUgcmFkaXVzIHJhZGl1cyBpcyB6ZXJvLFxuICAgICAgICAvLyB0aGVuIHRoZSBtZXRob2QgbXVzdCBhZGQgdGhlIHBvaW50ICh4MSwgeTEpIHRvIHRoZSBzdWJwYXRoLFxuICAgICAgICAvLyBhbmQgY29ubmVjdCB0aGF0IHBvaW50IHRvIHRoZSBwcmV2aW91cyBwb2ludCAoeDAsIHkwKSBieSBhIHN0cmFpZ2h0IGxpbmUuXG4gICAgICAgIGlmICgoKHgwID09PSB4MSkgJiYgKHkwID09PSB5MSkpXG4gICAgICAgICAgICB8fCAoKHgxID09PSB4MikgJiYgKHkxID09PSB5MikpXG4gICAgICAgICAgICB8fCAocmFkaXVzID09PSAwKSkge1xuICAgICAgICAgICAgdGhpcy5saW5lVG8oeDEsIHkxKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE90aGVyd2lzZSwgaWYgdGhlIHBvaW50cyAoeDAsIHkwKSwgKHgxLCB5MSksIGFuZCAoeDIsIHkyKSBhbGwgbGllIG9uIGEgc2luZ2xlIHN0cmFpZ2h0IGxpbmUsXG4gICAgICAgIC8vIHRoZW4gdGhlIG1ldGhvZCBtdXN0IGFkZCB0aGUgcG9pbnQgKHgxLCB5MSkgdG8gdGhlIHN1YnBhdGgsXG4gICAgICAgIC8vIGFuZCBjb25uZWN0IHRoYXQgcG9pbnQgdG8gdGhlIHByZXZpb3VzIHBvaW50ICh4MCwgeTApIGJ5IGEgc3RyYWlnaHQgbGluZS5cbiAgICAgICAgdmFyIHVuaXRfdmVjX3AxX3AwID0gbm9ybWFsaXplKFt4MCAtIHgxLCB5MCAtIHkxXSk7XG4gICAgICAgIHZhciB1bml0X3ZlY19wMV9wMiA9IG5vcm1hbGl6ZShbeDIgLSB4MSwgeTIgLSB5MV0pO1xuICAgICAgICBpZiAodW5pdF92ZWNfcDFfcDBbMF0gKiB1bml0X3ZlY19wMV9wMlsxXSA9PT0gdW5pdF92ZWNfcDFfcDBbMV0gKiB1bml0X3ZlY19wMV9wMlswXSkge1xuICAgICAgICAgICAgdGhpcy5saW5lVG8oeDEsIHkxKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE90aGVyd2lzZSwgbGV0IFRoZSBBcmMgYmUgdGhlIHNob3J0ZXN0IGFyYyBnaXZlbiBieSBjaXJjdW1mZXJlbmNlIG9mIHRoZSBjaXJjbGUgdGhhdCBoYXMgcmFkaXVzIHJhZGl1cyxcbiAgICAgICAgLy8gYW5kIHRoYXQgaGFzIG9uZSBwb2ludCB0YW5nZW50IHRvIHRoZSBoYWxmLWluZmluaXRlIGxpbmUgdGhhdCBjcm9zc2VzIHRoZSBwb2ludCAoeDAsIHkwKSBhbmQgZW5kcyBhdCB0aGUgcG9pbnQgKHgxLCB5MSksXG4gICAgICAgIC8vIGFuZCB0aGF0IGhhcyBhIGRpZmZlcmVudCBwb2ludCB0YW5nZW50IHRvIHRoZSBoYWxmLWluZmluaXRlIGxpbmUgdGhhdCBlbmRzIGF0IHRoZSBwb2ludCAoeDEsIHkxKSwgYW5kIGNyb3NzZXMgdGhlIHBvaW50ICh4MiwgeTIpLlxuICAgICAgICAvLyBUaGUgcG9pbnRzIGF0IHdoaWNoIHRoaXMgY2lyY2xlIHRvdWNoZXMgdGhlc2UgdHdvIGxpbmVzIGFyZSBjYWxsZWQgdGhlIHN0YXJ0IGFuZCBlbmQgdGFuZ2VudCBwb2ludHMgcmVzcGVjdGl2ZWx5LlxuXG4gICAgICAgIC8vIG5vdGUgdGhhdCBib3RoIHZlY3RvcnMgYXJlIHVuaXQgdmVjdG9ycywgc28gdGhlIGxlbmd0aCBpcyAxXG4gICAgICAgIHZhciBjb3MgPSAodW5pdF92ZWNfcDFfcDBbMF0gKiB1bml0X3ZlY19wMV9wMlswXSArIHVuaXRfdmVjX3AxX3AwWzFdICogdW5pdF92ZWNfcDFfcDJbMV0pO1xuICAgICAgICB2YXIgdGhldGEgPSBNYXRoLmFjb3MoTWF0aC5hYnMoY29zKSk7XG5cbiAgICAgICAgLy8gQ2FsY3VsYXRlIG9yaWdpblxuICAgICAgICB2YXIgdW5pdF92ZWNfcDFfb3JpZ2luID0gbm9ybWFsaXplKFtcbiAgICAgICAgICAgIHVuaXRfdmVjX3AxX3AwWzBdICsgdW5pdF92ZWNfcDFfcDJbMF0sXG4gICAgICAgICAgICB1bml0X3ZlY19wMV9wMFsxXSArIHVuaXRfdmVjX3AxX3AyWzFdXG4gICAgICAgIF0pO1xuICAgICAgICB2YXIgbGVuX3AxX29yaWdpbiA9IHJhZGl1cyAvIE1hdGguc2luKHRoZXRhIC8gMik7XG4gICAgICAgIHZhciB4ID0geDEgKyBsZW5fcDFfb3JpZ2luICogdW5pdF92ZWNfcDFfb3JpZ2luWzBdO1xuICAgICAgICB2YXIgeSA9IHkxICsgbGVuX3AxX29yaWdpbiAqIHVuaXRfdmVjX3AxX29yaWdpblsxXTtcblxuICAgICAgICAvLyBDYWxjdWxhdGUgc3RhcnQgYW5nbGUgYW5kIGVuZCBhbmdsZVxuICAgICAgICAvLyByb3RhdGUgOTBkZWcgY2xvY2t3aXNlIChub3RlIHRoYXQgeSBheGlzIHBvaW50cyB0byBpdHMgZG93bilcbiAgICAgICAgdmFyIHVuaXRfdmVjX29yaWdpbl9zdGFydF90YW5nZW50ID0gW1xuICAgICAgICAgICAgLXVuaXRfdmVjX3AxX3AwWzFdLFxuICAgICAgICAgICAgdW5pdF92ZWNfcDFfcDBbMF1cbiAgICAgICAgXTtcbiAgICAgICAgLy8gcm90YXRlIDkwZGVnIGNvdW50ZXIgY2xvY2t3aXNlIChub3RlIHRoYXQgeSBheGlzIHBvaW50cyB0byBpdHMgZG93bilcbiAgICAgICAgdmFyIHVuaXRfdmVjX29yaWdpbl9lbmRfdGFuZ2VudCA9IFtcbiAgICAgICAgICAgIHVuaXRfdmVjX3AxX3AyWzFdLFxuICAgICAgICAgICAgLXVuaXRfdmVjX3AxX3AyWzBdXG4gICAgICAgIF07XG4gICAgICAgIHZhciBnZXRBbmdsZSA9IGZ1bmN0aW9uICh2ZWN0b3IpIHtcbiAgICAgICAgICAgIC8vIGdldCBhbmdsZSAoY2xvY2t3aXNlKSBiZXR3ZWVuIHZlY3RvciBhbmQgKDEsIDApXG4gICAgICAgICAgICB2YXIgeCA9IHZlY3RvclswXTtcbiAgICAgICAgICAgIHZhciB5ID0gdmVjdG9yWzFdO1xuICAgICAgICAgICAgaWYgKHkgPj0gMCkgeyAvLyBub3RlIHRoYXQgeSBheGlzIHBvaW50cyB0byBpdHMgZG93blxuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLmFjb3MoeCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAtTWF0aC5hY29zKHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB2YXIgc3RhcnRBbmdsZSA9IGdldEFuZ2xlKHVuaXRfdmVjX29yaWdpbl9zdGFydF90YW5nZW50KTtcbiAgICAgICAgdmFyIGVuZEFuZ2xlID0gZ2V0QW5nbGUodW5pdF92ZWNfb3JpZ2luX2VuZF90YW5nZW50KTtcblxuICAgICAgICAvLyBDb25uZWN0IHRoZSBwb2ludCAoeDAsIHkwKSB0byB0aGUgc3RhcnQgdGFuZ2VudCBwb2ludCBieSBhIHN0cmFpZ2h0IGxpbmVcbiAgICAgICAgdGhpcy5saW5lVG8oeCArIHVuaXRfdmVjX29yaWdpbl9zdGFydF90YW5nZW50WzBdICogcmFkaXVzLFxuICAgICAgICAgICAgICAgICAgICB5ICsgdW5pdF92ZWNfb3JpZ2luX3N0YXJ0X3RhbmdlbnRbMV0gKiByYWRpdXMpO1xuXG4gICAgICAgIC8vIENvbm5lY3QgdGhlIHN0YXJ0IHRhbmdlbnQgcG9pbnQgdG8gdGhlIGVuZCB0YW5nZW50IHBvaW50IGJ5IGFyY1xuICAgICAgICAvLyBhbmQgYWRkaW5nIHRoZSBlbmQgdGFuZ2VudCBwb2ludCB0byB0aGUgc3VicGF0aC5cbiAgICAgICAgdGhpcy5hcmMoeCwgeSwgcmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHN0cm9rZSBwcm9wZXJ0eSBvbiB0aGUgY3VycmVudCBlbGVtZW50XG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5zdHJva2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl9fY3VycmVudEVsZW1lbnQubm9kZU5hbWUgPT09IFwicGF0aFwiKSB7XG4gICAgICAgICAgICB0aGlzLl9fY3VycmVudEVsZW1lbnQuc2V0QXR0cmlidXRlKFwicGFpbnQtb3JkZXJcIiwgXCJmaWxsIHN0cm9rZSBtYXJrZXJzXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX19hcHBseUN1cnJlbnREZWZhdWx0UGF0aCgpO1xuICAgICAgICB0aGlzLl9fYXBwbHlTdHlsZVRvQ3VycmVudEVsZW1lbnQoXCJzdHJva2VcIik7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNldHMgZmlsbCBwcm9wZXJ0aWVzIG9uIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl9fY3VycmVudEVsZW1lbnQubm9kZU5hbWUgPT09IFwicGF0aFwiKSB7XG4gICAgICAgICAgICB0aGlzLl9fY3VycmVudEVsZW1lbnQuc2V0QXR0cmlidXRlKFwicGFpbnQtb3JkZXJcIiwgXCJzdHJva2UgZmlsbCBtYXJrZXJzXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX19hcHBseUN1cnJlbnREZWZhdWx0UGF0aCgpO1xuICAgICAgICB0aGlzLl9fYXBwbHlTdHlsZVRvQ3VycmVudEVsZW1lbnQoXCJmaWxsXCIpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiAgQWRkcyBhIHJlY3RhbmdsZSB0byB0aGUgcGF0aC5cbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLnJlY3QgPSBmdW5jdGlvbiAoeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgICBpZiAodGhpcy5fX2N1cnJlbnRFbGVtZW50Lm5vZGVOYW1lICE9PSBcInBhdGhcIikge1xuICAgICAgICAgICAgdGhpcy5iZWdpblBhdGgoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1vdmVUbyh4LCB5KTtcbiAgICAgICAgdGhpcy5saW5lVG8oeCt3aWR0aCwgeSk7XG4gICAgICAgIHRoaXMubGluZVRvKHgrd2lkdGgsIHkraGVpZ2h0KTtcbiAgICAgICAgdGhpcy5saW5lVG8oeCwgeStoZWlnaHQpO1xuICAgICAgICB0aGlzLmxpbmVUbyh4LCB5KTtcbiAgICAgICAgdGhpcy5jbG9zZVBhdGgoKTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBhZGRzIGEgcmVjdGFuZ2xlIGVsZW1lbnRcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLmZpbGxSZWN0ID0gZnVuY3Rpb24gKHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgdmFyIHJlY3QsIHBhcmVudDtcbiAgICAgICAgcmVjdCA9IHRoaXMuX19jcmVhdGVFbGVtZW50KFwicmVjdFwiLCB7XG4gICAgICAgICAgICB4IDogeCxcbiAgICAgICAgICAgIHkgOiB5LFxuICAgICAgICAgICAgd2lkdGggOiB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodCA6IGhlaWdodFxuICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgcGFyZW50ID0gdGhpcy5fX2Nsb3Nlc3RHcm91cE9yU3ZnKCk7XG4gICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChyZWN0KTtcbiAgICAgICAgdGhpcy5fX2N1cnJlbnRFbGVtZW50ID0gcmVjdDtcbiAgICAgICAgdGhpcy5fX2FwcGx5U3R5bGVUb0N1cnJlbnRFbGVtZW50KFwiZmlsbFwiKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRHJhd3MgYSByZWN0YW5nbGUgd2l0aCBubyBmaWxsXG4gICAgICogQHBhcmFtIHhcbiAgICAgKiBAcGFyYW0geVxuICAgICAqIEBwYXJhbSB3aWR0aFxuICAgICAqIEBwYXJhbSBoZWlnaHRcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLnN0cm9rZVJlY3QgPSBmdW5jdGlvbiAoeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgICB2YXIgcmVjdCwgcGFyZW50O1xuICAgICAgICByZWN0ID0gdGhpcy5fX2NyZWF0ZUVsZW1lbnQoXCJyZWN0XCIsIHtcbiAgICAgICAgICAgIHggOiB4LFxuICAgICAgICAgICAgeSA6IHksXG4gICAgICAgICAgICB3aWR0aCA6IHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0IDogaGVpZ2h0XG4gICAgICAgIH0sIHRydWUpO1xuICAgICAgICBwYXJlbnQgPSB0aGlzLl9fY2xvc2VzdEdyb3VwT3JTdmcoKTtcbiAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKHJlY3QpO1xuICAgICAgICB0aGlzLl9fY3VycmVudEVsZW1lbnQgPSByZWN0O1xuICAgICAgICB0aGlzLl9fYXBwbHlTdHlsZVRvQ3VycmVudEVsZW1lbnQoXCJzdHJva2VcIik7XG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgZW50aXJlIGNhbnZhczpcbiAgICAgKiAxLiBzYXZlIGN1cnJlbnQgdHJhbnNmb3Jtc1xuICAgICAqIDIuIHJlbW92ZSBhbGwgdGhlIGNoaWxkTm9kZXMgb2YgdGhlIHJvb3QgZyBlbGVtZW50XG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5fX2NsZWFyQ2FudmFzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY3VycmVudCA9IHRoaXMuX19jbG9zZXN0R3JvdXBPclN2ZygpLFxuICAgICAgICAgICAgdHJhbnNmb3JtID0gY3VycmVudC5nZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIik7XG4gICAgICAgIHZhciByb290R3JvdXAgPSB0aGlzLl9fcm9vdC5jaGlsZE5vZGVzWzFdO1xuICAgICAgICB2YXIgY2hpbGROb2RlcyA9IHJvb3RHcm91cC5jaGlsZE5vZGVzO1xuICAgICAgICBmb3IgKHZhciBpID0gY2hpbGROb2Rlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgaWYgKGNoaWxkTm9kZXNbaV0pIHtcbiAgICAgICAgICAgICAgICByb290R3JvdXAucmVtb3ZlQ2hpbGQoY2hpbGROb2Rlc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fX2N1cnJlbnRFbGVtZW50ID0gcm9vdEdyb3VwO1xuICAgICAgICAvL3Jlc2V0IF9fZ3JvdXBTdGFjayBhcyBhbGwgdGhlIGNoaWxkIGdyb3VwIG5vZGVzIGFyZSBhbGwgcmVtb3ZlZC5cbiAgICAgICAgdGhpcy5fX2dyb3VwU3RhY2sgPSBbXTtcbiAgICAgICAgaWYgKHRyYW5zZm9ybSkge1xuICAgICAgICAgICAgdGhpcy5fX2FkZFRyYW5zZm9ybSh0cmFuc2Zvcm0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFwiQ2xlYXJzXCIgYSBjYW52YXMgYnkganVzdCBkcmF3aW5nIGEgd2hpdGUgcmVjdGFuZ2xlIGluIHRoZSBjdXJyZW50IGdyb3VwLlxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuY2xlYXJSZWN0ID0gZnVuY3Rpb24gKHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgLy9jbGVhciBlbnRpcmUgY2FudmFzXG4gICAgICAgIGlmICh4ID09PSAwICYmIHkgPT09IDAgJiYgd2lkdGggPT09IHRoaXMud2lkdGggJiYgaGVpZ2h0ID09PSB0aGlzLmhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5fX2NsZWFyQ2FudmFzKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlY3QsIHBhcmVudCA9IHRoaXMuX19jbG9zZXN0R3JvdXBPclN2ZygpO1xuICAgICAgICByZWN0ID0gdGhpcy5fX2NyZWF0ZUVsZW1lbnQoXCJyZWN0XCIsIHtcbiAgICAgICAgICAgIHggOiB4LFxuICAgICAgICAgICAgeSA6IHksXG4gICAgICAgICAgICB3aWR0aCA6IHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0IDogaGVpZ2h0LFxuICAgICAgICAgICAgZmlsbCA6IFwiI0ZGRkZGRlwiXG4gICAgICAgIH0sIHRydWUpO1xuICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQocmVjdCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBsaW5lYXIgZ3JhZGllbnQgdG8gYSBkZWZzIHRhZy5cbiAgICAgKiBSZXR1cm5zIGEgY2FudmFzIGdyYWRpZW50IG9iamVjdCB0aGF0IGhhcyBhIHJlZmVyZW5jZSB0byBpdCdzIHBhcmVudCBkZWZcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLmNyZWF0ZUxpbmVhckdyYWRpZW50ID0gZnVuY3Rpb24gKHgxLCB5MSwgeDIsIHkyKSB7XG4gICAgICAgIHZhciBncmFkID0gdGhpcy5fX2NyZWF0ZUVsZW1lbnQoXCJsaW5lYXJHcmFkaWVudFwiLCB7XG4gICAgICAgICAgICBpZCA6IHJhbmRvbVN0cmluZyh0aGlzLl9faWRzKSxcbiAgICAgICAgICAgIHgxIDogeDErXCJweFwiLFxuICAgICAgICAgICAgeDIgOiB4MitcInB4XCIsXG4gICAgICAgICAgICB5MSA6IHkxK1wicHhcIixcbiAgICAgICAgICAgIHkyIDogeTIrXCJweFwiLFxuICAgICAgICAgICAgXCJncmFkaWVudFVuaXRzXCIgOiBcInVzZXJTcGFjZU9uVXNlXCJcbiAgICAgICAgfSwgZmFsc2UpO1xuICAgICAgICB0aGlzLl9fZGVmcy5hcHBlbmRDaGlsZChncmFkKTtcbiAgICAgICAgcmV0dXJuIG5ldyBDYW52YXNHcmFkaWVudChncmFkLCB0aGlzKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIHJhZGlhbCBncmFkaWVudCB0byBhIGRlZnMgdGFnLlxuICAgICAqIFJldHVybnMgYSBjYW52YXMgZ3JhZGllbnQgb2JqZWN0IHRoYXQgaGFzIGEgcmVmZXJlbmNlIHRvIGl0J3MgcGFyZW50IGRlZlxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuY3JlYXRlUmFkaWFsR3JhZGllbnQgPSBmdW5jdGlvbiAoeDAsIHkwLCByMCwgeDEsIHkxLCByMSkge1xuICAgICAgICB2YXIgZ3JhZCA9IHRoaXMuX19jcmVhdGVFbGVtZW50KFwicmFkaWFsR3JhZGllbnRcIiwge1xuICAgICAgICAgICAgaWQgOiByYW5kb21TdHJpbmcodGhpcy5fX2lkcyksXG4gICAgICAgICAgICBjeCA6IHgxK1wicHhcIixcbiAgICAgICAgICAgIGN5IDogeTErXCJweFwiLFxuICAgICAgICAgICAgciAgOiByMStcInB4XCIsXG4gICAgICAgICAgICBmeCA6IHgwK1wicHhcIixcbiAgICAgICAgICAgIGZ5IDogeTArXCJweFwiLFxuICAgICAgICAgICAgXCJncmFkaWVudFVuaXRzXCIgOiBcInVzZXJTcGFjZU9uVXNlXCJcbiAgICAgICAgfSwgZmFsc2UpO1xuICAgICAgICB0aGlzLl9fZGVmcy5hcHBlbmRDaGlsZChncmFkKTtcbiAgICAgICAgcmV0dXJuIG5ldyBDYW52YXNHcmFkaWVudChncmFkLCB0aGlzKTtcblxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBQYXJzZXMgdGhlIGZvbnQgc3RyaW5nIGFuZCByZXR1cm5zIHN2ZyBtYXBwaW5nXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLl9fcGFyc2VGb250ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcmVnZXggPSAvXlxccyooPz0oPzooPzpbLWEtel0rXFxzKil7MCwyfShpdGFsaWN8b2JsaXF1ZSkpPykoPz0oPzooPzpbLWEtel0rXFxzKil7MCwyfShzbWFsbC1jYXBzKSk/KSg/PSg/Oig/OlstYS16XStcXHMqKXswLDJ9KGJvbGQoPzplcik/fGxpZ2h0ZXJ8WzEtOV0wMCkpPykoPzooPzpub3JtYWx8XFwxfFxcMnxcXDMpXFxzKil7MCwzfSgoPzp4eD8tKT8oPzpzbWFsbHxsYXJnZSl8bWVkaXVtfHNtYWxsZXJ8bGFyZ2VyfFsuXFxkXSsoPzpcXCV8aW58W2NlbV1tfGV4fHBbY3R4XSkpKD86XFxzKlxcL1xccyoobm9ybWFsfFsuXFxkXSsoPzpcXCV8aW58W2NlbV1tfGV4fHBbY3R4XSkpKT9cXHMqKFstLFxcJ1xcXCJcXHNhLXowLTldKz8pXFxzKiQvaTtcbiAgICAgICAgdmFyIGZvbnRQYXJ0ID0gcmVnZXguZXhlYyggdGhpcy5mb250ICk7XG4gICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgc3R5bGUgOiBmb250UGFydFsxXSB8fCAnbm9ybWFsJyxcbiAgICAgICAgICAgIHNpemUgOiBmb250UGFydFs0XSB8fCAnMTBweCcsXG4gICAgICAgICAgICBmYW1pbHkgOiBmb250UGFydFs2XSB8fCAnc2Fucy1zZXJpZicsXG4gICAgICAgICAgICB3ZWlnaHQ6IGZvbnRQYXJ0WzNdIHx8ICdub3JtYWwnLFxuICAgICAgICAgICAgZGVjb3JhdGlvbiA6IGZvbnRQYXJ0WzJdIHx8ICdub3JtYWwnLFxuICAgICAgICAgICAgaHJlZiA6IG51bGxcbiAgICAgICAgfTtcblxuICAgICAgICAvL2NhbnZhcyBkb2Vzbid0IHN1cHBvcnQgdW5kZXJsaW5lIG5hdGl2ZWx5LCBidXQgd2UgY2FuIHBhc3MgdGhpcyBhdHRyaWJ1dGVcbiAgICAgICAgaWYgKHRoaXMuX19mb250VW5kZXJsaW5lID09PSBcInVuZGVybGluZVwiKSB7XG4gICAgICAgICAgICBkYXRhLmRlY29yYXRpb24gPSBcInVuZGVybGluZVwiO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9jYW52YXMgYWxzbyBkb2Vzbid0IHN1cHBvcnQgbGlua2luZywgYnV0IHdlIGNhbiBwYXNzIHRoaXMgYXMgd2VsbFxuICAgICAgICBpZiAodGhpcy5fX2ZvbnRIcmVmKSB7XG4gICAgICAgICAgICBkYXRhLmhyZWYgPSB0aGlzLl9fZm9udEhyZWY7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSGVscGVyIHRvIGxpbmsgdGV4dCBmcmFnbWVudHNcbiAgICAgKiBAcGFyYW0gZm9udFxuICAgICAqIEBwYXJhbSBlbGVtZW50XG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuX193cmFwVGV4dExpbmsgPSBmdW5jdGlvbiAoZm9udCwgZWxlbWVudCkge1xuICAgICAgICBpZiAoZm9udC5ocmVmKSB7XG4gICAgICAgICAgICB2YXIgYSA9IHRoaXMuX19jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICAgICAgICAgIGEuc2V0QXR0cmlidXRlTlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIsIFwieGxpbms6aHJlZlwiLCBmb250LmhyZWYpO1xuICAgICAgICAgICAgYS5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICAgICAgICAgIHJldHVybiBhO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBGaWxscyBvciBzdHJva2VzIHRleHRcbiAgICAgKiBAcGFyYW0gdGV4dFxuICAgICAqIEBwYXJhbSB4XG4gICAgICogQHBhcmFtIHlcbiAgICAgKiBAcGFyYW0gYWN0aW9uIC0gc3Ryb2tlIG9yIGZpbGxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuX19hcHBseVRleHQgPSBmdW5jdGlvbiAodGV4dCwgeCwgeSwgYWN0aW9uKSB7XG4gICAgICAgIHZhciBmb250ID0gdGhpcy5fX3BhcnNlRm9udCgpLFxuICAgICAgICAgICAgcGFyZW50ID0gdGhpcy5fX2Nsb3Nlc3RHcm91cE9yU3ZnKCksXG4gICAgICAgICAgICB0ZXh0RWxlbWVudCA9IHRoaXMuX19jcmVhdGVFbGVtZW50KFwidGV4dFwiLCB7XG4gICAgICAgICAgICAgICAgXCJmb250LWZhbWlseVwiIDogZm9udC5mYW1pbHksXG4gICAgICAgICAgICAgICAgXCJmb250LXNpemVcIiA6IGZvbnQuc2l6ZSxcbiAgICAgICAgICAgICAgICBcImZvbnQtc3R5bGVcIiA6IGZvbnQuc3R5bGUsXG4gICAgICAgICAgICAgICAgXCJmb250LXdlaWdodFwiIDogZm9udC53ZWlnaHQsXG4gICAgICAgICAgICAgICAgXCJ0ZXh0LWRlY29yYXRpb25cIiA6IGZvbnQuZGVjb3JhdGlvbixcbiAgICAgICAgICAgICAgICBcInhcIiA6IHgsXG4gICAgICAgICAgICAgICAgXCJ5XCIgOiB5LFxuICAgICAgICAgICAgICAgIFwidGV4dC1hbmNob3JcIjogZ2V0VGV4dEFuY2hvcih0aGlzLnRleHRBbGlnbiksXG4gICAgICAgICAgICAgICAgXCJkb21pbmFudC1iYXNlbGluZVwiOiBnZXREb21pbmFudEJhc2VsaW5lKHRoaXMudGV4dEJhc2VsaW5lKVxuICAgICAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgdGV4dEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fX2RvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpKTtcbiAgICAgICAgdGhpcy5fX2N1cnJlbnRFbGVtZW50ID0gdGV4dEVsZW1lbnQ7XG4gICAgICAgIHRoaXMuX19hcHBseVN0eWxlVG9DdXJyZW50RWxlbWVudChhY3Rpb24pO1xuICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5fX3dyYXBUZXh0TGluayhmb250LHRleHRFbGVtZW50KSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSB0ZXh0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gdGV4dFxuICAgICAqIEBwYXJhbSB4XG4gICAgICogQHBhcmFtIHlcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLmZpbGxUZXh0ID0gZnVuY3Rpb24gKHRleHQsIHgsIHkpIHtcbiAgICAgICAgdGhpcy5fX2FwcGx5VGV4dCh0ZXh0LCB4LCB5LCBcImZpbGxcIik7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFN0cm9rZXMgdGV4dFxuICAgICAqIEBwYXJhbSB0ZXh0XG4gICAgICogQHBhcmFtIHhcbiAgICAgKiBAcGFyYW0geVxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuc3Ryb2tlVGV4dCA9IGZ1bmN0aW9uICh0ZXh0LCB4LCB5KSB7XG4gICAgICAgIHRoaXMuX19hcHBseVRleHQodGV4dCwgeCwgeSwgXCJzdHJva2VcIik7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE5vIG5lZWQgdG8gaW1wbGVtZW50IHRoaXMgZm9yIHN2Zy5cbiAgICAgKiBAcGFyYW0gdGV4dFxuICAgICAqIEByZXR1cm4ge1RleHRNZXRyaWNzfVxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUubWVhc3VyZVRleHQgPSBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICB0aGlzLl9fY3R4LmZvbnQgPSB0aGlzLmZvbnQ7XG4gICAgICAgIHJldHVybiB0aGlzLl9fY3R4Lm1lYXN1cmVUZXh0KHRleHQpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiAgQXJjIGNvbW1hbmQhXG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5hcmMgPSBmdW5jdGlvbiAoeCwgeSwgcmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgY291bnRlckNsb2Nrd2lzZSkge1xuICAgICAgICAvLyBpbiBjYW52YXMgbm8gY2lyY2xlIGlzIGRyYXduIGlmIG5vIGFuZ2xlIGlzIHByb3ZpZGVkLlxuICAgICAgICBpZiAoc3RhcnRBbmdsZSA9PT0gZW5kQW5nbGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzdGFydEFuZ2xlID0gc3RhcnRBbmdsZSAlICgyKk1hdGguUEkpO1xuICAgICAgICBlbmRBbmdsZSA9IGVuZEFuZ2xlICUgKDIqTWF0aC5QSSk7XG4gICAgICAgIGlmIChzdGFydEFuZ2xlID09PSBlbmRBbmdsZSkge1xuICAgICAgICAgICAgLy9jaXJjbGUgdGltZSEgc3VidHJhY3Qgc29tZSBvZiB0aGUgYW5nbGUgc28gc3ZnIGlzIGhhcHB5IChzdmcgZWxsaXB0aWNhbCBhcmMgY2FuJ3QgZHJhdyBhIGZ1bGwgY2lyY2xlKVxuICAgICAgICAgICAgZW5kQW5nbGUgPSAoKGVuZEFuZ2xlICsgKDIqTWF0aC5QSSkpIC0gMC4wMDEgKiAoY291bnRlckNsb2Nrd2lzZSA/IC0xIDogMSkpICUgKDIqTWF0aC5QSSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGVuZFggPSB4K3JhZGl1cypNYXRoLmNvcyhlbmRBbmdsZSksXG4gICAgICAgICAgICBlbmRZID0geStyYWRpdXMqTWF0aC5zaW4oZW5kQW5nbGUpLFxuICAgICAgICAgICAgc3RhcnRYID0geCtyYWRpdXMqTWF0aC5jb3Moc3RhcnRBbmdsZSksXG4gICAgICAgICAgICBzdGFydFkgPSB5K3JhZGl1cypNYXRoLnNpbihzdGFydEFuZ2xlKSxcbiAgICAgICAgICAgIHN3ZWVwRmxhZyA9IGNvdW50ZXJDbG9ja3dpc2UgPyAwIDogMSxcbiAgICAgICAgICAgIGxhcmdlQXJjRmxhZyA9IDAsXG4gICAgICAgICAgICBkaWZmID0gZW5kQW5nbGUgLSBzdGFydEFuZ2xlO1xuXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9nbGlmZnkvY2FudmFzMnN2Zy9pc3N1ZXMvNFxuICAgICAgICBpZiAoZGlmZiA8IDApIHtcbiAgICAgICAgICAgIGRpZmYgKz0gMipNYXRoLlBJO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvdW50ZXJDbG9ja3dpc2UpIHtcbiAgICAgICAgICAgIGxhcmdlQXJjRmxhZyA9IGRpZmYgPiBNYXRoLlBJID8gMCA6IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsYXJnZUFyY0ZsYWcgPSBkaWZmID4gTWF0aC5QSSA/IDEgOiAwO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5saW5lVG8oc3RhcnRYLCBzdGFydFkpO1xuICAgICAgICB0aGlzLl9fYWRkUGF0aENvbW1hbmQoZm9ybWF0KFwiQSB7cnh9IHtyeX0ge3hBeGlzUm90YXRpb259IHtsYXJnZUFyY0ZsYWd9IHtzd2VlcEZsYWd9IHtlbmRYfSB7ZW5kWX1cIixcbiAgICAgICAgICAgIHtyeDpyYWRpdXMsIHJ5OnJhZGl1cywgeEF4aXNSb3RhdGlvbjowLCBsYXJnZUFyY0ZsYWc6bGFyZ2VBcmNGbGFnLCBzd2VlcEZsYWc6c3dlZXBGbGFnLCBlbmRYOmVuZFgsIGVuZFk6ZW5kWX0pKTtcblxuICAgICAgICB0aGlzLl9fY3VycmVudFBvc2l0aW9uID0ge3g6IGVuZFgsIHk6IGVuZFl9O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZXMgYSBDbGlwUGF0aCBmcm9tIHRoZSBjbGlwIGNvbW1hbmQuXG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5jbGlwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZ3JvdXAgPSB0aGlzLl9fY2xvc2VzdEdyb3VwT3JTdmcoKSxcbiAgICAgICAgICAgIGNsaXBQYXRoID0gdGhpcy5fX2NyZWF0ZUVsZW1lbnQoXCJjbGlwUGF0aFwiKSxcbiAgICAgICAgICAgIGlkID0gIHJhbmRvbVN0cmluZyh0aGlzLl9faWRzKSxcbiAgICAgICAgICAgIG5ld0dyb3VwID0gdGhpcy5fX2NyZWF0ZUVsZW1lbnQoXCJnXCIpO1xuXG4gICAgICAgIHRoaXMuX19hcHBseUN1cnJlbnREZWZhdWx0UGF0aCgpO1xuICAgICAgICBncm91cC5yZW1vdmVDaGlsZCh0aGlzLl9fY3VycmVudEVsZW1lbnQpO1xuICAgICAgICBjbGlwUGF0aC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBpZCk7XG4gICAgICAgIGNsaXBQYXRoLmFwcGVuZENoaWxkKHRoaXMuX19jdXJyZW50RWxlbWVudCk7XG5cbiAgICAgICAgdGhpcy5fX2RlZnMuYXBwZW5kQ2hpbGQoY2xpcFBhdGgpO1xuXG4gICAgICAgIC8vc2V0IHRoZSBjbGlwIHBhdGggdG8gdGhpcyBncm91cFxuICAgICAgICBncm91cC5zZXRBdHRyaWJ1dGUoXCJjbGlwLXBhdGhcIiwgZm9ybWF0KFwidXJsKCN7aWR9KVwiLCB7aWQ6aWR9KSk7XG5cbiAgICAgICAgLy9jbGlwIHBhdGhzIGNhbiBiZSBzY2FsZWQgYW5kIHRyYW5zZm9ybWVkLCB3ZSBuZWVkIHRvIGFkZCBhbm90aGVyIHdyYXBwZXIgZ3JvdXAgdG8gYXZvaWQgbGF0ZXIgdHJhbnNmb3JtYXRpb25zXG4gICAgICAgIC8vIHRvIHRoaXMgcGF0aFxuICAgICAgICBncm91cC5hcHBlbmRDaGlsZChuZXdHcm91cCk7XG5cbiAgICAgICAgdGhpcy5fX2N1cnJlbnRFbGVtZW50ID0gbmV3R3JvdXA7XG5cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRHJhd3MgYSBjYW52YXMsIGltYWdlIG9yIG1vY2sgY29udGV4dCB0byB0aGlzIGNhbnZhcy5cbiAgICAgKiBOb3RlIHRoYXQgYWxsIHN2ZyBkb20gbWFuaXB1bGF0aW9uIHVzZXMgbm9kZS5jaGlsZE5vZGVzIHJhdGhlciB0aGFuIG5vZGUuY2hpbGRyZW4gZm9yIElFIHN1cHBvcnQuXG4gICAgICogaHR0cDovL3d3dy53aGF0d2cub3JnL3NwZWNzL3dlYi1hcHBzL2N1cnJlbnQtd29yay9tdWx0aXBhZ2UvdGhlLWNhbnZhcy1lbGVtZW50Lmh0bWwjZG9tLWNvbnRleHQtMmQtZHJhd2ltYWdlXG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5kcmF3SW1hZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vY29udmVydCBhcmd1bWVudHMgdG8gYSByZWFsIGFycmF5XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSxcbiAgICAgICAgICAgIGltYWdlPWFyZ3NbMF0sXG4gICAgICAgICAgICBkeCwgZHksIGR3LCBkaCwgc3g9MCwgc3k9MCwgc3csIHNoLCBwYXJlbnQsIHN2ZywgZGVmcywgZ3JvdXAsXG4gICAgICAgICAgICBjdXJyZW50RWxlbWVudCwgc3ZnSW1hZ2UsIGNhbnZhcywgY29udGV4dCwgaWQ7XG5cbiAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICBkeCA9IGFyZ3NbMV07XG4gICAgICAgICAgICBkeSA9IGFyZ3NbMl07XG4gICAgICAgICAgICBzdyA9IGltYWdlLndpZHRoO1xuICAgICAgICAgICAgc2ggPSBpbWFnZS5oZWlnaHQ7XG4gICAgICAgICAgICBkdyA9IHN3O1xuICAgICAgICAgICAgZGggPSBzaDtcbiAgICAgICAgfSBlbHNlIGlmIChhcmdzLmxlbmd0aCA9PT0gNSkge1xuICAgICAgICAgICAgZHggPSBhcmdzWzFdO1xuICAgICAgICAgICAgZHkgPSBhcmdzWzJdO1xuICAgICAgICAgICAgZHcgPSBhcmdzWzNdO1xuICAgICAgICAgICAgZGggPSBhcmdzWzRdO1xuICAgICAgICAgICAgc3cgPSBpbWFnZS53aWR0aDtcbiAgICAgICAgICAgIHNoID0gaW1hZ2UuaGVpZ2h0O1xuICAgICAgICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09PSA5KSB7XG4gICAgICAgICAgICBzeCA9IGFyZ3NbMV07XG4gICAgICAgICAgICBzeSA9IGFyZ3NbMl07XG4gICAgICAgICAgICBzdyA9IGFyZ3NbM107XG4gICAgICAgICAgICBzaCA9IGFyZ3NbNF07XG4gICAgICAgICAgICBkeCA9IGFyZ3NbNV07XG4gICAgICAgICAgICBkeSA9IGFyZ3NbNl07XG4gICAgICAgICAgICBkdyA9IGFyZ3NbN107XG4gICAgICAgICAgICBkaCA9IGFyZ3NbOF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbmF2bGlkIG51bWJlciBvZiBhcmd1bWVudHMgcGFzc2VkIHRvIGRyYXdJbWFnZTogXCIgKyBhcmd1bWVudHMubGVuZ3RoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBhcmVudCA9IHRoaXMuX19jbG9zZXN0R3JvdXBPclN2ZygpO1xuICAgICAgICBjdXJyZW50RWxlbWVudCA9IHRoaXMuX19jdXJyZW50RWxlbWVudDtcbiAgICAgICAgdmFyIHRyYW5zbGF0ZURpcmVjdGl2ZSA9IFwidHJhbnNsYXRlKFwiICsgZHggKyBcIiwgXCIgKyBkeSArIFwiKVwiO1xuICAgICAgICBpZiAoaW1hZ2UgaW5zdGFuY2VvZiBjdHgpIHtcbiAgICAgICAgICAgIC8vY2FudmFzMnN2ZyBtb2NrIGNhbnZhcyBjb250ZXh0LiBJbiB0aGUgZnV0dXJlIHdlIG1heSB3YW50IHRvIGNsb25lIG5vZGVzIGluc3RlYWQuXG4gICAgICAgICAgICAvL2Fsc28gSSdtIGN1cnJlbnRseSBpZ25vcmluZyBkdywgZGgsIHN3LCBzaCwgc3gsIHN5IGZvciBhIG1vY2sgY29udGV4dC5cbiAgICAgICAgICAgIHN2ZyA9IGltYWdlLmdldFN2ZygpLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgICAgIGlmIChzdmcuY2hpbGROb2RlcyAmJiBzdmcuY2hpbGROb2Rlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgZGVmcyA9IHN2Zy5jaGlsZE5vZGVzWzBdO1xuICAgICAgICAgICAgICAgIHdoaWxlKGRlZnMuY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWQgPSBkZWZzLmNoaWxkTm9kZXNbMF0uZ2V0QXR0cmlidXRlKFwiaWRcIik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX19pZHNbaWRdID0gaWQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX19kZWZzLmFwcGVuZENoaWxkKGRlZnMuY2hpbGROb2Rlc1swXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGdyb3VwID0gc3ZnLmNoaWxkTm9kZXNbMV07XG4gICAgICAgICAgICAgICAgaWYgKGdyb3VwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vc2F2ZSBvcmlnaW5hbCB0cmFuc2Zvcm1cbiAgICAgICAgICAgICAgICAgICAgdmFyIG9yaWdpblRyYW5zZm9ybSA9IGdyb3VwLmdldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRyYW5zZm9ybURpcmVjdGl2ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9yaWdpblRyYW5zZm9ybSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtRGlyZWN0aXZlID0gb3JpZ2luVHJhbnNmb3JtK1wiIFwiK3RyYW5zbGF0ZURpcmVjdGl2ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybURpcmVjdGl2ZSA9IHRyYW5zbGF0ZURpcmVjdGl2ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBncm91cC5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIiwgdHJhbnNmb3JtRGlyZWN0aXZlKTtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKGdyb3VwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaW1hZ2Uubm9kZU5hbWUgPT09IFwiQ0FOVkFTXCIgfHwgaW1hZ2Uubm9kZU5hbWUgPT09IFwiSU1HXCIpIHtcbiAgICAgICAgICAgIC8vY2FudmFzIG9yIGltYWdlXG4gICAgICAgICAgICBzdmdJbWFnZSA9IHRoaXMuX19jcmVhdGVFbGVtZW50KFwiaW1hZ2VcIik7XG4gICAgICAgICAgICBzdmdJbWFnZS5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBkdyk7XG4gICAgICAgICAgICBzdmdJbWFnZS5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgZGgpO1xuICAgICAgICAgICAgc3ZnSW1hZ2Uuc2V0QXR0cmlidXRlKFwib3BhY2l0eVwiLCB0aGlzLmdsb2JhbEFscGhhKTtcbiAgICAgICAgICAgIHN2Z0ltYWdlLnNldEF0dHJpYnV0ZShcInByZXNlcnZlQXNwZWN0UmF0aW9cIiwgXCJub25lXCIpO1xuXG4gICAgICAgICAgICBpZiAoc3ggfHwgc3kgfHwgc3cgIT09IGltYWdlLndpZHRoIHx8IHNoICE9PSBpbWFnZS5oZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAvL2Nyb3AgdGhlIGltYWdlIHVzaW5nIGEgdGVtcG9yYXJ5IGNhbnZhc1xuICAgICAgICAgICAgICAgIGNhbnZhcyA9IHRoaXMuX19kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IGR3O1xuICAgICAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSBkaDtcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgICAgICAgICBjb250ZXh0LmRyYXdJbWFnZShpbWFnZSwgc3gsIHN5LCBzdywgc2gsIDAsIDAsIGR3LCBkaCk7XG4gICAgICAgICAgICAgICAgaW1hZ2UgPSBjYW52YXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdmdJbWFnZS5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIiwgdHJhbnNsYXRlRGlyZWN0aXZlKTtcbiAgICAgICAgICAgIHN2Z0ltYWdlLnNldEF0dHJpYnV0ZU5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiLCBcInhsaW5rOmhyZWZcIixcbiAgICAgICAgICAgICAgICBpbWFnZS5ub2RlTmFtZSA9PT0gXCJDQU5WQVNcIiA/IGltYWdlLnRvRGF0YVVSTCgpIDogaW1hZ2UuZ2V0QXR0cmlidXRlKFwic3JjXCIpKTtcbiAgICAgICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChzdmdJbWFnZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGVzIGEgcGF0dGVybiB0YWdcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLmNyZWF0ZVBhdHRlcm4gPSBmdW5jdGlvbiAoaW1hZ2UsIHJlcGV0aXRpb24pIHtcbiAgICAgICAgdmFyIHBhdHRlcm4gPSB0aGlzLl9fZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJwYXR0ZXJuXCIpLCBpZCA9IHJhbmRvbVN0cmluZyh0aGlzLl9faWRzKSxcbiAgICAgICAgICAgIGltZztcbiAgICAgICAgcGF0dGVybi5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBpZCk7XG4gICAgICAgIHBhdHRlcm4uc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgaW1hZ2Uud2lkdGgpO1xuICAgICAgICBwYXR0ZXJuLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBpbWFnZS5oZWlnaHQpO1xuICAgICAgICBpZiAoaW1hZ2Uubm9kZU5hbWUgPT09IFwiQ0FOVkFTXCIgfHwgaW1hZ2Uubm9kZU5hbWUgPT09IFwiSU1HXCIpIHtcbiAgICAgICAgICAgIGltZyA9IHRoaXMuX19kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImltYWdlXCIpO1xuICAgICAgICAgICAgaW1nLnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIGltYWdlLndpZHRoKTtcbiAgICAgICAgICAgIGltZy5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgaW1hZ2UuaGVpZ2h0KTtcbiAgICAgICAgICAgIGltZy5zZXRBdHRyaWJ1dGVOUyhcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiwgXCJ4bGluazpocmVmXCIsXG4gICAgICAgICAgICAgICAgaW1hZ2Uubm9kZU5hbWUgPT09IFwiQ0FOVkFTXCIgPyBpbWFnZS50b0RhdGFVUkwoKSA6IGltYWdlLmdldEF0dHJpYnV0ZShcInNyY1wiKSk7XG4gICAgICAgICAgICBwYXR0ZXJuLmFwcGVuZENoaWxkKGltZyk7XG4gICAgICAgICAgICB0aGlzLl9fZGVmcy5hcHBlbmRDaGlsZChwYXR0ZXJuKTtcbiAgICAgICAgfSBlbHNlIGlmIChpbWFnZSBpbnN0YW5jZW9mIGN0eCkge1xuICAgICAgICAgICAgcGF0dGVybi5hcHBlbmRDaGlsZChpbWFnZS5fX3Jvb3QuY2hpbGROb2Rlc1sxXSk7XG4gICAgICAgICAgICB0aGlzLl9fZGVmcy5hcHBlbmRDaGlsZChwYXR0ZXJuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IENhbnZhc1BhdHRlcm4ocGF0dGVybiwgdGhpcyk7XG4gICAgfTtcblxuICAgIGN0eC5wcm90b3R5cGUuc2V0TGluZURhc2ggPSBmdW5jdGlvbiAoZGFzaEFycmF5KSB7XG4gICAgICAgIGlmIChkYXNoQXJyYXkgJiYgZGFzaEFycmF5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMubGluZURhc2ggPSBkYXNoQXJyYXkuam9pbihcIixcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxpbmVEYXNoID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBOb3QgeWV0IGltcGxlbWVudGVkXG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5kcmF3Rm9jdXNSaW5nID0gZnVuY3Rpb24gKCkge307XG4gICAgY3R4LnByb3RvdHlwZS5jcmVhdGVJbWFnZURhdGEgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICBjdHgucHJvdG90eXBlLmdldEltYWdlRGF0YSA9IGZ1bmN0aW9uICgpIHt9O1xuICAgIGN0eC5wcm90b3R5cGUucHV0SW1hZ2VEYXRhID0gZnVuY3Rpb24gKCkge307XG4gICAgY3R4LnByb3RvdHlwZS5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSBmdW5jdGlvbiAoKSB7fTtcbiAgICBjdHgucHJvdG90eXBlLnNldFRyYW5zZm9ybSA9IGZ1bmN0aW9uICgpIHt9O1xuXG4gICAgLy9hZGQgb3B0aW9ucyBmb3IgYWx0ZXJuYXRpdmUgbmFtZXNwYWNlXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgd2luZG93LkMyUyA9IGN0eDtcbiAgICB9XG5cbiAgICAvLyBDb21tb25KUy9Ccm93c2VyaWZ5XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gY3R4O1xuICAgIH1cblxufSgpKTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jYW52YXMyc3ZnL2NhbnZhczJzdmcuanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==