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

function output(options, canvas) {
  return canvas.getSerializedSvg();
}

CRp.svg = function (options) {
  return output(options, CRp.bufferCanvasImage(options, this));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCBmOGMyYzQ4ODVmNTg0MGE3Y2ZkNyIsIndlYnBhY2s6Ly8vLi9zcmMvY29udmVydC10by1zdmcuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vY2FudmFzMnN2Zy9jYW52YXMyc3ZnLmpzIl0sIm5hbWVzIjpbIkMyUyIsInJlcXVpcmUiLCJDUnAiLCJpcyIsIm51bWJlciIsIm9iaiIsImlzTmFOIiwiYnVmZmVyQ2FudmFzSW1hZ2UiLCJvcHRpb25zIiwiY3kiLCJ1c2VQYXRocyIsInJlbmRlcmVyIiwiZWxlbWVudHMiLCJmb3JFYWNoIiwiZWxlIiwiX3ByaXZhdGUiLCJyc2NyYXRjaCIsInBhdGhDYWNoZUtleSIsInBhdGhDYWNoZSIsImVsZXMiLCJtdXRhYmxlRWxlbWVudHMiLCJiYiIsImJvdW5kaW5nQm94IiwiY3RyUmVjdCIsImZpbmRDb250YWluZXJDbGllbnRDb29yZHMiLCJ3aWR0aCIsImZ1bGwiLCJNYXRoIiwiY2VpbCIsInciLCJoZWlnaHQiLCJoIiwic3BlY2RNYXhEaW1zIiwibWF4V2lkdGgiLCJtYXhIZWlnaHQiLCJweFJhdGlvIiwiZ2V0UGl4ZWxSYXRpbyIsInNjYWxlIiwidW5kZWZpbmVkIiwibWF4U2NhbGVXIiwiSW5maW5pdHkiLCJtYXhTY2FsZUgiLCJtaW4iLCJidWZmQ3h0IiwiYnVmZkNhbnZhcyIsImNsZWFyUmVjdCIsImdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiIsInpzb3J0ZWRFbGVzIiwiZ2V0Q2FjaGVkWlNvcnRlZEVsZXMiLCJ0cmFuc2xhdGUiLCJ4MSIsInkxIiwiZHJhd0VsZW1lbnRzIiwicGFuIiwidHJhbnNsYXRpb24iLCJ4IiwieSIsInpvb20iLCJiZyIsImZpbGxTdHlsZSIsInJlY3QiLCJmaWxsIiwib3V0cHV0IiwiY2FudmFzIiwiZ2V0U2VyaWFsaXplZFN2ZyIsInN2ZyIsIm1vZHVsZSIsImV4cG9ydHMiLCJpbXBsIiwicmVnaXN0ZXIiLCJjeXRvc2NhcGUiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPO0FDVkE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLG1EQUEyQyxjQUFjOztBQUV6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7O0FDaEVhOztBQUViOzs7Ozs7O0FBS0EsSUFBSUEsTUFBTSxtQkFBT0MsQ0FBQyxDQUFSLENBQVY7O0FBRUEsSUFBSUMsTUFBTSxFQUFWO0FBQ0EsSUFBSUMsS0FBSyxFQUFUOztBQUVBQSxHQUFHQyxNQUFILEdBQVk7QUFBQSxTQUNWQyxPQUFPLElBQVAsSUFBZSxRQUFPQSxHQUFQLHlDQUFPQSxHQUFQLGVBQXNCLENBQXRCLENBQWYsSUFBMEMsQ0FBQ0MsTUFBT0QsR0FBUCxDQURqQztBQUFBLENBQVo7O0FBR0FILElBQUlLLGlCQUFKLEdBQXdCLFVBQVVDLE9BQVYsRUFBbUJDLEVBQW5CLEVBQXNCOztBQUU1QztBQUNBLE1BQUlDLFdBQVdELEdBQUdFLFFBQUgsR0FBY0QsUUFBN0I7QUFDQUQsS0FBR0UsUUFBSCxHQUFjRCxRQUFkLEdBQXlCLFlBQU07QUFBQyxXQUFPLEtBQVA7QUFBYyxHQUE5QztBQUNBO0FBQ0FELEtBQUdHLFFBQUgsR0FBY0MsT0FBZCxDQUFzQixVQUFTQyxHQUFULEVBQWM7QUFDbENBLFFBQUlDLFFBQUosQ0FBYUMsUUFBYixDQUFzQkMsWUFBdEIsR0FBcUMsSUFBckM7QUFDQUgsUUFBSUMsUUFBSixDQUFhQyxRQUFiLENBQXNCRSxTQUF0QixHQUFrQyxJQUFsQztBQUNELEdBSEQ7O0FBS0EsTUFBSVAsV0FBV0YsR0FBR0UsUUFBSCxFQUFmO0FBQ0EsTUFBSVEsT0FBT1YsR0FBR1csZUFBSCxFQUFYO0FBQ0EsTUFBSUMsS0FBS0YsS0FBS0csV0FBTCxFQUFUO0FBQ0EsTUFBSUMsVUFBVVosU0FBU2EseUJBQVQsRUFBZDtBQUNBLE1BQUlDLFFBQVFqQixRQUFRa0IsSUFBUixHQUFlQyxLQUFLQyxJQUFMLENBQVdQLEdBQUdRLENBQWQsQ0FBZixHQUFtQ04sUUFBUSxDQUFSLENBQS9DO0FBQ0EsTUFBSU8sU0FBU3RCLFFBQVFrQixJQUFSLEdBQWVDLEtBQUtDLElBQUwsQ0FBV1AsR0FBR1UsQ0FBZCxDQUFmLEdBQW1DUixRQUFRLENBQVIsQ0FBaEQ7QUFDQSxNQUFJUyxlQUFlN0IsR0FBR0MsTUFBSCxDQUFXSSxRQUFReUIsUUFBbkIsS0FBaUM5QixHQUFHQyxNQUFILENBQVdJLFFBQVEwQixTQUFuQixDQUFwRDtBQUNBLE1BQUlDLFVBQVV4QixTQUFTeUIsYUFBVCxFQUFkO0FBQ0EsTUFBSUMsUUFBUSxDQUFaOztBQUVBLE1BQUk3QixRQUFRNkIsS0FBUixLQUFrQkMsU0FBdEIsRUFBaUM7QUFDL0JiLGFBQVNqQixRQUFRNkIsS0FBakI7QUFDQVAsY0FBVXRCLFFBQVE2QixLQUFsQjs7QUFFQUEsWUFBUTdCLFFBQVE2QixLQUFoQjtBQUNELEdBTEQsTUFLTyxJQUFJTCxZQUFKLEVBQWtCO0FBQ3ZCLFFBQUlPLFlBQVlDLFFBQWhCO0FBQ0EsUUFBSUMsWUFBWUQsUUFBaEI7O0FBRUEsUUFBSXJDLEdBQUdDLE1BQUgsQ0FBV0ksUUFBUXlCLFFBQW5CLENBQUosRUFBbUM7QUFDakNNLGtCQUFZRixRQUFRN0IsUUFBUXlCLFFBQWhCLEdBQTJCUixLQUF2QztBQUNEOztBQUVELFFBQUl0QixHQUFHQyxNQUFILENBQVdJLFFBQVEwQixTQUFuQixDQUFKLEVBQW9DO0FBQ2xDTyxrQkFBWUosUUFBUTdCLFFBQVEwQixTQUFoQixHQUE0QkosTUFBeEM7QUFDRDs7QUFFRE8sWUFBUVYsS0FBS2UsR0FBTCxDQUFVSCxTQUFWLEVBQXFCRSxTQUFyQixDQUFSOztBQUVBaEIsYUFBU1ksS0FBVDtBQUNBUCxjQUFVTyxLQUFWO0FBQ0Q7O0FBRUQsTUFBSSxDQUFDTCxZQUFMLEVBQW1CO0FBQ2pCUCxhQUFTVSxPQUFUO0FBQ0FMLGNBQVVLLE9BQVY7QUFDQUUsYUFBU0YsT0FBVDtBQUNEOztBQUVELE1BQUlRLFVBQVUsSUFBZDtBQUNBLE1BQUlDLGFBQWFELFVBQVUsSUFBSTNDLEdBQUosQ0FBUXlCLEtBQVIsRUFBZUssTUFBZixDQUEzQjs7QUFFQTtBQUNBLE1BQUlMLFFBQVEsQ0FBUixJQUFhSyxTQUFTLENBQTFCLEVBQTZCOztBQUUzQmEsWUFBUUUsU0FBUixDQUFtQixDQUFuQixFQUFzQixDQUF0QixFQUF5QnBCLEtBQXpCLEVBQWdDSyxNQUFoQzs7QUFFQWEsWUFBUUcsd0JBQVIsR0FBbUMsYUFBbkM7O0FBRUEsUUFBSUMsY0FBY3BDLFNBQVNxQyxvQkFBVCxFQUFsQjs7QUFFQSxRQUFJeEMsUUFBUWtCLElBQVosRUFBa0I7QUFBRTtBQUNsQmlCLGNBQVFNLFNBQVIsQ0FBbUIsQ0FBQzVCLEdBQUc2QixFQUFKLEdBQVNiLEtBQTVCLEVBQW1DLENBQUNoQixHQUFHOEIsRUFBSixHQUFTZCxLQUE1QztBQUNBTSxjQUFRTixLQUFSLENBQWVBLEtBQWYsRUFBc0JBLEtBQXRCOztBQUVBMUIsZUFBU3lDLFlBQVQsQ0FBdUJULE9BQXZCLEVBQWdDSSxXQUFoQzs7QUFFQUosY0FBUU4sS0FBUixDQUFlLElBQUVBLEtBQWpCLEVBQXdCLElBQUVBLEtBQTFCO0FBQ0FNLGNBQVFNLFNBQVIsQ0FBbUI1QixHQUFHNkIsRUFBSCxHQUFRYixLQUEzQixFQUFrQ2hCLEdBQUc4QixFQUFILEdBQVFkLEtBQTFDO0FBQ0QsS0FSRCxNQVFPO0FBQUU7QUFDUCxVQUFJZ0IsTUFBTTVDLEdBQUc0QyxHQUFILEVBQVY7O0FBRUEsVUFBSUMsY0FBYztBQUNoQkMsV0FBR0YsSUFBSUUsQ0FBSixHQUFRbEIsS0FESztBQUVoQm1CLFdBQUdILElBQUlHLENBQUosR0FBUW5CO0FBRkssT0FBbEI7O0FBS0FBLGVBQVM1QixHQUFHZ0QsSUFBSCxFQUFUOztBQUVBZCxjQUFRTSxTQUFSLENBQW1CSyxZQUFZQyxDQUEvQixFQUFrQ0QsWUFBWUUsQ0FBOUM7QUFDQWIsY0FBUU4sS0FBUixDQUFlQSxLQUFmLEVBQXNCQSxLQUF0Qjs7QUFFQTFCLGVBQVN5QyxZQUFULENBQXVCVCxPQUF2QixFQUFnQ0ksV0FBaEM7O0FBRUFKLGNBQVFOLEtBQVIsQ0FBZSxJQUFFQSxLQUFqQixFQUF3QixJQUFFQSxLQUExQjtBQUNBTSxjQUFRTSxTQUFSLENBQW1CLENBQUNLLFlBQVlDLENBQWhDLEVBQW1DLENBQUNELFlBQVlFLENBQWhEO0FBQ0Q7O0FBRUQ7QUFDQSxRQUFJaEQsUUFBUWtELEVBQVosRUFBZ0I7QUFDZGYsY0FBUUcsd0JBQVIsR0FBbUMsa0JBQW5DOztBQUVBSCxjQUFRZ0IsU0FBUixHQUFvQm5ELFFBQVFrRCxFQUE1QjtBQUNBZixjQUFRaUIsSUFBUixDQUFjLENBQWQsRUFBaUIsQ0FBakIsRUFBb0JuQyxLQUFwQixFQUEyQkssTUFBM0I7QUFDQWEsY0FBUWtCLElBQVI7QUFDRDtBQUNGOztBQUVEO0FBQ0FwRCxLQUFHRSxRQUFILEdBQWNELFFBQWQsR0FBeUJBLFFBQXpCO0FBQ0EsU0FBT2tDLFVBQVA7QUFDRCxDQXRHRDs7QUF3R0EsU0FBU2tCLE1BQVQsQ0FBaUJ0RCxPQUFqQixFQUEwQnVELE1BQTFCLEVBQWlDO0FBQzdCLFNBQU9BLE9BQU9DLGdCQUFQLEVBQVA7QUFDSDs7QUFFRDlELElBQUkrRCxHQUFKLEdBQVUsVUFBVXpELE9BQVYsRUFBbUI7QUFDM0IsU0FBT3NELE9BQVF0RCxPQUFSLEVBQWlCTixJQUFJSyxpQkFBSixDQUF1QkMsT0FBdkIsRUFBZ0MsSUFBaEMsQ0FBakIsQ0FBUDtBQUNELENBRkQ7O0FBSUEwRCxPQUFPQyxPQUFQLEdBQWlCakUsR0FBakIsQzs7Ozs7Ozs7O0FDL0hBLElBQU1rRSxPQUFPLG1CQUFPbkUsQ0FBQyxDQUFSLENBQWI7O0FBRUE7QUFDQSxJQUFJb0UsV0FBVyxTQUFYQSxRQUFXLENBQVVDLFNBQVYsRUFBcUI7QUFDbEMsTUFBSSxDQUFDQSxTQUFMLEVBQWdCO0FBQUU7QUFBUyxHQURPLENBQ047O0FBRTVCQSxZQUFXLE1BQVgsRUFBbUIsS0FBbkIsRUFBMEJGLEtBQUtILEdBQS9CLEVBSGtDLENBR0k7QUFDdkMsQ0FKRDs7QUFNQSxJQUFJLE9BQU9LLFNBQVAsS0FBcUIsV0FBekIsRUFBc0M7QUFBRTtBQUN0Q0QsV0FBVUMsU0FBVjtBQUNEOztBQUVESixPQUFPQyxPQUFQLEdBQWlCRSxRQUFqQixDOzs7Ozs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsQ0FBQztBQUNEOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixlQUFlO0FBQ2hDLDZDQUE2QyxrQkFBa0I7QUFDL0Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLFFBQVE7QUFDL0I7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQSxrQ0FBa0M7QUFDbEM7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLGtCQUFrQjtBQUNyQyw0Q0FBNEM7QUFDNUM7QUFDQSwyQ0FBMkM7QUFDM0M7QUFDQSxvRUFBb0U7QUFDcEUsaUNBQWlDO0FBQ2pDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCO0FBQ3ZCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCO0FBQ3ZCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5REFBeUQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUsseUNBQXlDO0FBQ2pIO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQThCLGdEQUFnRDs7QUFFOUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNB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QUNsRTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRDQUE0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyw2QkFBNkI7QUFDcEc7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw4Q0FBOEM7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esa0NBQWtDO0FBQ2xDLHlDQUF5QyxFQUFFLEVBQUUsRUFBRSxJQUFJLFNBQVM7QUFDNUQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQztBQUNsQztBQUNBLDZDQUE2QyxFQUFFLEVBQUUsRUFBRSxJQUFJLFNBQVM7QUFDaEUsU0FBUztBQUNULDZDQUE2QyxFQUFFLEVBQUUsRUFBRSxJQUFJLFNBQVM7QUFDaEU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQztBQUNsQyx5Q0FBeUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFO0FBQzNFLGFBQWEscURBQXFEO0FBQ2xFOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDO0FBQ2xDLHlDQUF5QyxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksMkJBQTJCO0FBQzFGOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxRQUFRO0FBQ25EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhDQUE4QyxJQUFJLHdDQUF3QyxJQUFJLG9DQUFvQyxJQUFJLDJEQUEyRCxJQUFJO0FBQ3JNO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBLHlDQUF5QyxHQUFHLEVBQUUsR0FBRyxFQUFFLGNBQWMsRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxLQUFLO0FBQzFHLGFBQWEsNEdBQTRHOztBQUV6SCxrQ0FBa0M7QUFDbEM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLHNEQUFzRCxHQUFHLEtBQUssTUFBTTs7QUFFcEU7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLENBQUMiLCJmaWxlIjoiY3l0b3NjYXBlLXN2Zy5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcImN5dG9zY2FwZVN2Z1wiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJjeXRvc2NhcGVTdmdcIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiBcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gaWRlbnRpdHkgZnVuY3Rpb24gZm9yIGNhbGxpbmcgaGFybW9ueSBpbXBvcnRzIHdpdGggdGhlIGNvcnJlY3QgY29udGV4dFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5pID0gZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9O1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAxKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBmOGMyYzQ4ODVmNTg0MGE3Y2ZkNyIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNb3N0IG9mIHRoZSBjb2RlIGlzIHRha2VuIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2lWaXMtYXQtQmlsa2VudC9jeXRvc2NhcGUuanNcbiAqIGFuZCBhZGFwdGVkXG4gKi9cblxudmFyIEMyUyA9IHJlcXVpcmUoJ2NhbnZhczJzdmcnKTtcblxudmFyIENScCA9IHt9O1xudmFyIGlzID0ge307XG5cbmlzLm51bWJlciA9IG9iaiA9PlxuICBvYmogIT0gbnVsbCAmJiB0eXBlb2Ygb2JqID09PSB0eXBlb2YgMSAmJiAhaXNOYU4oIG9iaiApO1xuXG5DUnAuYnVmZmVyQ2FudmFzSW1hZ2UgPSBmdW5jdGlvbiggb3B0aW9ucywgY3kpe1xuXG4gIC8vZGlzYWJsZSB1c2VQYXRocyB0ZW1wb3JhcmlseVxuICB2YXIgdXNlUGF0aHMgPSBjeS5yZW5kZXJlcigpLnVzZVBhdGhzO1xuICBjeS5yZW5kZXJlcigpLnVzZVBhdGhzID0gKCkgPT4ge3JldHVybiBmYWxzZTt9XG4gIC8vIGZsdXNoIHBhdGggY2FjaGVcbiAgY3kuZWxlbWVudHMoKS5mb3JFYWNoKGZ1bmN0aW9uKGVsZSkge1xuICAgIGVsZS5fcHJpdmF0ZS5yc2NyYXRjaC5wYXRoQ2FjaGVLZXkgPSBudWxsO1xuICAgIGVsZS5fcHJpdmF0ZS5yc2NyYXRjaC5wYXRoQ2FjaGUgPSBudWxsO1xuICB9KTtcblxuICB2YXIgcmVuZGVyZXIgPSBjeS5yZW5kZXJlcigpO1xuICB2YXIgZWxlcyA9IGN5Lm11dGFibGVFbGVtZW50cygpO1xuICB2YXIgYmIgPSBlbGVzLmJvdW5kaW5nQm94KCk7XG4gIHZhciBjdHJSZWN0ID0gcmVuZGVyZXIuZmluZENvbnRhaW5lckNsaWVudENvb3JkcygpO1xuICB2YXIgd2lkdGggPSBvcHRpb25zLmZ1bGwgPyBNYXRoLmNlaWwoIGJiLncgKSA6IGN0clJlY3RbMl07XG4gIHZhciBoZWlnaHQgPSBvcHRpb25zLmZ1bGwgPyBNYXRoLmNlaWwoIGJiLmggKSA6IGN0clJlY3RbM107XG4gIHZhciBzcGVjZE1heERpbXMgPSBpcy5udW1iZXIoIG9wdGlvbnMubWF4V2lkdGggKSB8fCBpcy5udW1iZXIoIG9wdGlvbnMubWF4SGVpZ2h0ICk7XG4gIHZhciBweFJhdGlvID0gcmVuZGVyZXIuZ2V0UGl4ZWxSYXRpbygpO1xuICB2YXIgc2NhbGUgPSAxO1xuXG4gIGlmKCBvcHRpb25zLnNjYWxlICE9PSB1bmRlZmluZWQgKXtcbiAgICB3aWR0aCAqPSBvcHRpb25zLnNjYWxlO1xuICAgIGhlaWdodCAqPSBvcHRpb25zLnNjYWxlO1xuXG4gICAgc2NhbGUgPSBvcHRpb25zLnNjYWxlO1xuICB9IGVsc2UgaWYoIHNwZWNkTWF4RGltcyApe1xuICAgIHZhciBtYXhTY2FsZVcgPSBJbmZpbml0eTtcbiAgICB2YXIgbWF4U2NhbGVIID0gSW5maW5pdHk7XG5cbiAgICBpZiggaXMubnVtYmVyKCBvcHRpb25zLm1heFdpZHRoICkgKXtcbiAgICAgIG1heFNjYWxlVyA9IHNjYWxlICogb3B0aW9ucy5tYXhXaWR0aCAvIHdpZHRoO1xuICAgIH1cblxuICAgIGlmKCBpcy5udW1iZXIoIG9wdGlvbnMubWF4SGVpZ2h0ICkgKXtcbiAgICAgIG1heFNjYWxlSCA9IHNjYWxlICogb3B0aW9ucy5tYXhIZWlnaHQgLyBoZWlnaHQ7XG4gICAgfVxuXG4gICAgc2NhbGUgPSBNYXRoLm1pbiggbWF4U2NhbGVXLCBtYXhTY2FsZUggKTtcblxuICAgIHdpZHRoICo9IHNjYWxlO1xuICAgIGhlaWdodCAqPSBzY2FsZTtcbiAgfVxuXG4gIGlmKCAhc3BlY2RNYXhEaW1zICl7XG4gICAgd2lkdGggKj0gcHhSYXRpbztcbiAgICBoZWlnaHQgKj0gcHhSYXRpbztcbiAgICBzY2FsZSAqPSBweFJhdGlvO1xuICB9XG5cbiAgdmFyIGJ1ZmZDeHQgPSBudWxsO1xuICB2YXIgYnVmZkNhbnZhcyA9IGJ1ZmZDeHQgPSBuZXcgQzJTKHdpZHRoLCBoZWlnaHQpO1xuXG4gIC8vIFJhc3Rlcml6ZSB0aGUgbGF5ZXJzLCBidXQgb25seSBpZiBjb250YWluZXIgaGFzIG5vbnplcm8gc2l6ZVxuICBpZiggd2lkdGggPiAwICYmIGhlaWdodCA+IDAgKXtcblxuICAgIGJ1ZmZDeHQuY2xlYXJSZWN0KCAwLCAwLCB3aWR0aCwgaGVpZ2h0ICk7XG5cbiAgICBidWZmQ3h0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG5cbiAgICB2YXIgenNvcnRlZEVsZXMgPSByZW5kZXJlci5nZXRDYWNoZWRaU29ydGVkRWxlcygpO1xuXG4gICAgaWYoIG9wdGlvbnMuZnVsbCApeyAvLyBkcmF3IHRoZSBmdWxsIGJvdW5kcyBvZiB0aGUgZ3JhcGhcbiAgICAgIGJ1ZmZDeHQudHJhbnNsYXRlKCAtYmIueDEgKiBzY2FsZSwgLWJiLnkxICogc2NhbGUgKTtcbiAgICAgIGJ1ZmZDeHQuc2NhbGUoIHNjYWxlLCBzY2FsZSApO1xuXG4gICAgICByZW5kZXJlci5kcmF3RWxlbWVudHMoIGJ1ZmZDeHQsIHpzb3J0ZWRFbGVzICk7XG5cbiAgICAgIGJ1ZmZDeHQuc2NhbGUoIDEvc2NhbGUsIDEvc2NhbGUgKTtcbiAgICAgIGJ1ZmZDeHQudHJhbnNsYXRlKCBiYi54MSAqIHNjYWxlLCBiYi55MSAqIHNjYWxlICk7XG4gICAgfSBlbHNlIHsgLy8gZHJhdyB0aGUgY3VycmVudCB2aWV3XG4gICAgICB2YXIgcGFuID0gY3kucGFuKCk7XG5cbiAgICAgIHZhciB0cmFuc2xhdGlvbiA9IHtcbiAgICAgICAgeDogcGFuLnggKiBzY2FsZSxcbiAgICAgICAgeTogcGFuLnkgKiBzY2FsZVxuICAgICAgfTtcblxuICAgICAgc2NhbGUgKj0gY3kuem9vbSgpO1xuXG4gICAgICBidWZmQ3h0LnRyYW5zbGF0ZSggdHJhbnNsYXRpb24ueCwgdHJhbnNsYXRpb24ueSApO1xuICAgICAgYnVmZkN4dC5zY2FsZSggc2NhbGUsIHNjYWxlICk7XG5cbiAgICAgIHJlbmRlcmVyLmRyYXdFbGVtZW50cyggYnVmZkN4dCwgenNvcnRlZEVsZXMgKTtcblxuICAgICAgYnVmZkN4dC5zY2FsZSggMS9zY2FsZSwgMS9zY2FsZSApO1xuICAgICAgYnVmZkN4dC50cmFuc2xhdGUoIC10cmFuc2xhdGlvbi54LCAtdHJhbnNsYXRpb24ueSApO1xuICAgIH1cblxuICAgIC8vIG5lZWQgdG8gZmlsbCBiZyBhdCBlbmQgbGlrZSB0aGlzIGluIG9yZGVyIHRvIGZpbGwgY2xlYXJlZCB0cmFuc3BhcmVudCBwaXhlbHMgaW4ganBnc1xuICAgIGlmKCBvcHRpb25zLmJnICl7XG4gICAgICBidWZmQ3h0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdkZXN0aW5hdGlvbi1vdmVyJztcblxuICAgICAgYnVmZkN4dC5maWxsU3R5bGUgPSBvcHRpb25zLmJnO1xuICAgICAgYnVmZkN4dC5yZWN0KCAwLCAwLCB3aWR0aCwgaGVpZ2h0ICk7XG4gICAgICBidWZmQ3h0LmZpbGwoKTtcbiAgICB9XG4gIH1cblxuICAvLyByZXN0b3JlIHVzZVBhdGhzIHRvIGRlZmF1bHQgdmFsdWVcbiAgY3kucmVuZGVyZXIoKS51c2VQYXRocyA9IHVzZVBhdGhzO1xuICByZXR1cm4gYnVmZkNhbnZhcztcbn07XG5cbmZ1bmN0aW9uIG91dHB1dCggb3B0aW9ucywgY2FudmFzKXtcbiAgICByZXR1cm4gY2FudmFzLmdldFNlcmlhbGl6ZWRTdmcoKTtcbn1cblxuQ1JwLnN2ZyA9IGZ1bmN0aW9uKCBvcHRpb25zICl7XG4gIHJldHVybiBvdXRwdXQoIG9wdGlvbnMsIENScC5idWZmZXJDYW52YXNJbWFnZSggb3B0aW9ucywgdGhpcyApKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ1JwO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2NvbnZlcnQtdG8tc3ZnLmpzIiwiY29uc3QgaW1wbCA9IHJlcXVpcmUoJy4vY29udmVydC10by1zdmcuanMnKTtcblxuLy8gcmVnaXN0ZXJzIHRoZSBleHRlbnNpb24gb24gYSBjeXRvc2NhcGUgbGliIHJlZlxubGV0IHJlZ2lzdGVyID0gZnVuY3Rpb24oIGN5dG9zY2FwZSApe1xuICBpZiggIWN5dG9zY2FwZSApeyByZXR1cm47IH0gLy8gY2FuJ3QgcmVnaXN0ZXIgaWYgY3l0b3NjYXBlIHVuc3BlY2lmaWVkXG5cbiAgY3l0b3NjYXBlKCAnY29yZScsICdzdmcnLCBpbXBsLnN2ZyApOyAvLyByZWdpc3RlciB3aXRoIGN5dG9zY2FwZS5qc1xufTtcblxuaWYoIHR5cGVvZiBjeXRvc2NhcGUgIT09ICd1bmRlZmluZWQnICl7IC8vIGV4cG9zZSB0byBnbG9iYWwgY3l0b3NjYXBlIChpLmUuIHdpbmRvdy5jeXRvc2NhcGUpXG4gIHJlZ2lzdGVyKCBjeXRvc2NhcGUgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSByZWdpc3RlcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9pbmRleC5qcyIsIi8qISFcbiAqICBDYW52YXMgMiBTdmcgdjEuMC4xOVxuICogIEEgbG93IGxldmVsIGNhbnZhcyB0byBTVkcgY29udmVydGVyLiBVc2VzIGEgbW9jayBjYW52YXMgY29udGV4dCB0byBidWlsZCBhbiBTVkcgZG9jdW1lbnQuXG4gKlxuICogIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqICBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICpcbiAqICBBdXRob3I6XG4gKiAgS2VycnkgTGl1XG4gKlxuICogIENvcHlyaWdodCAoYykgMjAxNCBHbGlmZnkgSW5jLlxuICovXG5cbjsoZnVuY3Rpb24gKCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgdmFyIFNUWUxFUywgY3R4LCBDYW52YXNHcmFkaWVudCwgQ2FudmFzUGF0dGVybiwgbmFtZWRFbnRpdGllcztcblxuICAgIC8vaGVscGVyIGZ1bmN0aW9uIHRvIGZvcm1hdCBhIHN0cmluZ1xuICAgIGZ1bmN0aW9uIGZvcm1hdChzdHIsIGFyZ3MpIHtcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhcmdzKSwgaTtcbiAgICAgICAgZm9yIChpPTA7IGk8a2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cChcIlxcXFx7XCIgKyBrZXlzW2ldICsgXCJcXFxcfVwiLCBcImdpXCIpLCBhcmdzW2tleXNbaV1dKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH1cblxuICAgIC8vaGVscGVyIGZ1bmN0aW9uIHRoYXQgZ2VuZXJhdGVzIGEgcmFuZG9tIHN0cmluZ1xuICAgIGZ1bmN0aW9uIHJhbmRvbVN0cmluZyhob2xkZXIpIHtcbiAgICAgICAgdmFyIGNoYXJzLCByYW5kb21zdHJpbmcsIGk7XG4gICAgICAgIGlmICghaG9sZGVyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjYW5ub3QgY3JlYXRlIGEgcmFuZG9tIGF0dHJpYnV0ZSBuYW1lIGZvciBhbiB1bmRlZmluZWQgb2JqZWN0XCIpO1xuICAgICAgICB9XG4gICAgICAgIGNoYXJzID0gXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hUWmFiY2RlZmdoaWtsbW5vcHFyc3R1dnd4eXpcIjtcbiAgICAgICAgcmFuZG9tc3RyaW5nID0gXCJcIjtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgcmFuZG9tc3RyaW5nID0gXCJcIjtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCAxMjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcmFuZG9tc3RyaW5nICs9IGNoYXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNoYXJzLmxlbmd0aCldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IHdoaWxlIChob2xkZXJbcmFuZG9tc3RyaW5nXSk7XG4gICAgICAgIHJldHVybiByYW5kb21zdHJpbmc7XG4gICAgfVxuXG4gICAgLy9oZWxwZXIgZnVuY3Rpb24gdG8gbWFwIG5hbWVkIHRvIG51bWJlcmVkIGVudGl0aWVzXG4gICAgZnVuY3Rpb24gY3JlYXRlTmFtZWRUb051bWJlcmVkTG9va3VwKGl0ZW1zLCByYWRpeCkge1xuICAgICAgICB2YXIgaSwgZW50aXR5LCBsb29rdXAgPSB7fSwgYmFzZTEwLCBiYXNlMTY7XG4gICAgICAgIGl0ZW1zID0gaXRlbXMuc3BsaXQoJywnKTtcbiAgICAgICAgcmFkaXggPSByYWRpeCB8fCAxMDtcbiAgICAgICAgLy8gTWFwIGZyb20gbmFtZWQgdG8gbnVtYmVyZWQgZW50aXRpZXMuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICAgICAgZW50aXR5ID0gJyYnICsgaXRlbXNbaSArIDFdICsgJzsnO1xuICAgICAgICAgICAgYmFzZTEwID0gcGFyc2VJbnQoaXRlbXNbaV0sIHJhZGl4KTtcbiAgICAgICAgICAgIGxvb2t1cFtlbnRpdHldID0gJyYjJytiYXNlMTArJzsnO1xuICAgICAgICB9XG4gICAgICAgIC8vRkYgYW5kIElFIG5lZWQgdG8gY3JlYXRlIGEgcmVnZXggZnJvbSBoZXggdmFsdWVzIGllICZuYnNwOyA9PSBcXHhhMFxuICAgICAgICBsb29rdXBbXCJcXFxceGEwXCJdID0gJyYjMTYwOyc7XG4gICAgICAgIHJldHVybiBsb29rdXA7XG4gICAgfVxuXG4gICAgLy9oZWxwZXIgZnVuY3Rpb24gdG8gbWFwIGNhbnZhcy10ZXh0QWxpZ24gdG8gc3ZnLXRleHRBbmNob3JcbiAgICBmdW5jdGlvbiBnZXRUZXh0QW5jaG9yKHRleHRBbGlnbikge1xuICAgICAgICAvL1RPRE86IHN1cHBvcnQgcnRsIGxhbmd1YWdlc1xuICAgICAgICB2YXIgbWFwcGluZyA9IHtcImxlZnRcIjpcInN0YXJ0XCIsIFwicmlnaHRcIjpcImVuZFwiLCBcImNlbnRlclwiOlwibWlkZGxlXCIsIFwic3RhcnRcIjpcInN0YXJ0XCIsIFwiZW5kXCI6XCJlbmRcIn07XG4gICAgICAgIHJldHVybiBtYXBwaW5nW3RleHRBbGlnbl0gfHwgbWFwcGluZy5zdGFydDtcbiAgICB9XG5cbiAgICAvL2hlbHBlciBmdW5jdGlvbiB0byBtYXAgY2FudmFzLXRleHRCYXNlbGluZSB0byBzdmctZG9taW5hbnRCYXNlbGluZVxuICAgIGZ1bmN0aW9uIGdldERvbWluYW50QmFzZWxpbmUodGV4dEJhc2VsaW5lKSB7XG4gICAgICAgIC8vSU5GTzogbm90IHN1cHBvcnRlZCBpbiBhbGwgYnJvd3NlcnNcbiAgICAgICAgdmFyIG1hcHBpbmcgPSB7XCJhbHBoYWJldGljXCI6IFwiYWxwaGFiZXRpY1wiLCBcImhhbmdpbmdcIjogXCJoYW5naW5nXCIsIFwidG9wXCI6XCJ0ZXh0LWJlZm9yZS1lZGdlXCIsIFwiYm90dG9tXCI6XCJ0ZXh0LWFmdGVyLWVkZ2VcIiwgXCJtaWRkbGVcIjpcImNlbnRyYWxcIn07XG4gICAgICAgIHJldHVybiBtYXBwaW5nW3RleHRCYXNlbGluZV0gfHwgbWFwcGluZy5hbHBoYWJldGljO1xuICAgIH1cblxuICAgIC8vIFVucGFjayBlbnRpdGllcyBsb29rdXAgd2hlcmUgdGhlIG51bWJlcnMgYXJlIGluIHJhZGl4IDMyIHRvIHJlZHVjZSB0aGUgc2l6ZVxuICAgIC8vIGVudGl0eSBtYXBwaW5nIGNvdXJ0ZXN5IG9mIHRpbnltY2VcbiAgICBuYW1lZEVudGl0aWVzID0gY3JlYXRlTmFtZWRUb051bWJlcmVkTG9va3VwKFxuICAgICAgICAnNTAsbmJzcCw1MSxpZXhjbCw1MixjZW50LDUzLHBvdW5kLDU0LGN1cnJlbiw1NSx5ZW4sNTYsYnJ2YmFyLDU3LHNlY3QsNTgsdW1sLDU5LGNvcHksJyArXG4gICAgICAgICAgICAnNWEsb3JkZiw1YixsYXF1byw1Yyxub3QsNWQsc2h5LDVlLHJlZyw1ZixtYWNyLDVnLGRlZyw1aCxwbHVzbW4sNWksc3VwMiw1aixzdXAzLDVrLGFjdXRlLCcgK1xuICAgICAgICAgICAgJzVsLG1pY3JvLDVtLHBhcmEsNW4sbWlkZG90LDVvLGNlZGlsLDVwLHN1cDEsNXEsb3JkbSw1cixyYXF1byw1cyxmcmFjMTQsNXQsZnJhYzEyLDV1LGZyYWMzNCwnICtcbiAgICAgICAgICAgICc1dixpcXVlc3QsNjAsQWdyYXZlLDYxLEFhY3V0ZSw2MixBY2lyYyw2MyxBdGlsZGUsNjQsQXVtbCw2NSxBcmluZyw2NixBRWxpZyw2NyxDY2VkaWwsJyArXG4gICAgICAgICAgICAnNjgsRWdyYXZlLDY5LEVhY3V0ZSw2YSxFY2lyYyw2YixFdW1sLDZjLElncmF2ZSw2ZCxJYWN1dGUsNmUsSWNpcmMsNmYsSXVtbCw2ZyxFVEgsNmgsTnRpbGRlLCcgK1xuICAgICAgICAgICAgJzZpLE9ncmF2ZSw2aixPYWN1dGUsNmssT2NpcmMsNmwsT3RpbGRlLDZtLE91bWwsNm4sdGltZXMsNm8sT3NsYXNoLDZwLFVncmF2ZSw2cSxVYWN1dGUsJyArXG4gICAgICAgICAgICAnNnIsVWNpcmMsNnMsVXVtbCw2dCxZYWN1dGUsNnUsVEhPUk4sNnYsc3psaWcsNzAsYWdyYXZlLDcxLGFhY3V0ZSw3MixhY2lyYyw3MyxhdGlsZGUsNzQsYXVtbCwnICtcbiAgICAgICAgICAgICc3NSxhcmluZyw3NixhZWxpZyw3NyxjY2VkaWwsNzgsZWdyYXZlLDc5LGVhY3V0ZSw3YSxlY2lyYyw3YixldW1sLDdjLGlncmF2ZSw3ZCxpYWN1dGUsN2UsaWNpcmMsJyArXG4gICAgICAgICAgICAnN2YsaXVtbCw3ZyxldGgsN2gsbnRpbGRlLDdpLG9ncmF2ZSw3aixvYWN1dGUsN2ssb2NpcmMsN2wsb3RpbGRlLDdtLG91bWwsN24sZGl2aWRlLDdvLG9zbGFzaCwnICtcbiAgICAgICAgICAgICc3cCx1Z3JhdmUsN3EsdWFjdXRlLDdyLHVjaXJjLDdzLHV1bWwsN3QseWFjdXRlLDd1LHRob3JuLDd2LHl1bWwsY2ksZm5vZixzaCxBbHBoYSxzaSxCZXRhLCcgK1xuICAgICAgICAgICAgJ3NqLEdhbW1hLHNrLERlbHRhLHNsLEVwc2lsb24sc20sWmV0YSxzbixFdGEsc28sVGhldGEsc3AsSW90YSxzcSxLYXBwYSxzcixMYW1iZGEsc3MsTXUsJyArXG4gICAgICAgICAgICAnc3QsTnUsc3UsWGksc3YsT21pY3Jvbix0MCxQaSx0MSxSaG8sdDMsU2lnbWEsdDQsVGF1LHQ1LFVwc2lsb24sdDYsUGhpLHQ3LENoaSx0OCxQc2ksJyArXG4gICAgICAgICAgICAndDksT21lZ2EsdGgsYWxwaGEsdGksYmV0YSx0aixnYW1tYSx0ayxkZWx0YSx0bCxlcHNpbG9uLHRtLHpldGEsdG4sZXRhLHRvLHRoZXRhLHRwLGlvdGEsJyArXG4gICAgICAgICAgICAndHEsa2FwcGEsdHIsbGFtYmRhLHRzLG11LHR0LG51LHR1LHhpLHR2LG9taWNyb24sdTAscGksdTEscmhvLHUyLHNpZ21hZix1MyxzaWdtYSx1NCx0YXUsJyArXG4gICAgICAgICAgICAndTUsdXBzaWxvbix1NixwaGksdTcsY2hpLHU4LHBzaSx1OSxvbWVnYSx1aCx0aGV0YXN5bSx1aSx1cHNpaCx1bSxwaXYsODEyLGJ1bGwsODE2LGhlbGxpcCwnICtcbiAgICAgICAgICAgICc4MWkscHJpbWUsODFqLFByaW1lLDgxdSxvbGluZSw4MjQsZnJhc2wsODhvLHdlaWVycCw4OGgsaW1hZ2UsODhzLHJlYWwsODkyLHRyYWRlLDg5bCxhbGVmc3ltLCcgK1xuICAgICAgICAgICAgJzhjZyxsYXJyLDhjaCx1YXJyLDhjaSxyYXJyLDhjaixkYXJyLDhjayxoYXJyLDhkbCxjcmFyciw4ZWcsbEFyciw4ZWgsdUFyciw4ZWksckFyciw4ZWosZEFyciwnICtcbiAgICAgICAgICAgICc4ZWssaEFyciw4ZzAsZm9yYWxsLDhnMixwYXJ0LDhnMyxleGlzdCw4ZzUsZW1wdHksOGc3LG5hYmxhLDhnOCxpc2luLDhnOSxub3Rpbiw4Z2IsbmksOGdmLHByb2QsJyArXG4gICAgICAgICAgICAnOGdoLHN1bSw4Z2ksbWludXMsOGduLGxvd2FzdCw4Z3EscmFkaWMsOGd0LHByb3AsOGd1LGluZmluLDhoMCxhbmcsOGg3LGFuZCw4aDgsb3IsOGg5LGNhcCw4aGEsY3VwLCcgK1xuICAgICAgICAgICAgJzhoYixpbnQsOGhrLHRoZXJlNCw4aHMsc2ltLDhpNSxjb25nLDhpOCxhc3ltcCw4ajAsbmUsOGoxLGVxdWl2LDhqNCxsZSw4ajUsZ2UsOGsyLHN1Yiw4azMsc3VwLDhrNCwnICtcbiAgICAgICAgICAgICduc3ViLDhrNixzdWJlLDhrNyxzdXBlLDhrbCxvcGx1cyw4a24sb3RpbWVzLDhsNSxwZXJwLDhtNSxzZG90LDhvOCxsY2VpbCw4bzkscmNlaWwsOG9hLGxmbG9vciw4b2IsJyArXG4gICAgICAgICAgICAncmZsb29yLDhwOSxsYW5nLDhwYSxyYW5nLDllYSxsb3osOWowLHNwYWRlcyw5ajMsY2x1YnMsOWo1LGhlYXJ0cyw5ajYsZGlhbXMsYWksT0VsaWcsYWosb2VsaWcsYjAsJyArXG4gICAgICAgICAgICAnU2Nhcm9uLGIxLHNjYXJvbixibyxZdW1sLG02LGNpcmMsbXMsdGlsZGUsODAyLGVuc3AsODAzLGVtc3AsODA5LHRoaW5zcCw4MGMsenduaiw4MGQsendqLDgwZSxscm0sJyArXG4gICAgICAgICAgICAnODBmLHJsbSw4MGosbmRhc2gsODBrLG1kYXNoLDgwbyxsc3F1byw4MHAscnNxdW8sODBxLHNicXVvLDgwcyxsZHF1byw4MHQscmRxdW8sODB1LGJkcXVvLDgxMCxkYWdnZXIsJyArXG4gICAgICAgICAgICAnODExLERhZ2dlciw4MWcscGVybWlsLDgxcCxsc2FxdW8sODFxLHJzYXF1byw4NWMsZXVybycsIDMyKTtcblxuXG4gICAgLy9Tb21lIGJhc2ljIG1hcHBpbmdzIGZvciBhdHRyaWJ1dGVzIGFuZCBkZWZhdWx0IHZhbHVlcy5cbiAgICBTVFlMRVMgPSB7XG4gICAgICAgIFwic3Ryb2tlU3R5bGVcIjp7XG4gICAgICAgICAgICBzdmdBdHRyIDogXCJzdHJva2VcIiwgLy9jb3JyZXNwb25kaW5nIHN2ZyBhdHRyaWJ1dGVcbiAgICAgICAgICAgIGNhbnZhcyA6IFwiIzAwMDAwMFwiLCAvL2NhbnZhcyBkZWZhdWx0XG4gICAgICAgICAgICBzdmcgOiBcIm5vbmVcIiwgICAgICAgLy9zdmcgZGVmYXVsdFxuICAgICAgICAgICAgYXBwbHkgOiBcInN0cm9rZVwiICAgIC8vYXBwbHkgb24gc3Ryb2tlKCkgb3IgZmlsbCgpXG4gICAgICAgIH0sXG4gICAgICAgIFwiZmlsbFN0eWxlXCI6e1xuICAgICAgICAgICAgc3ZnQXR0ciA6IFwiZmlsbFwiLFxuICAgICAgICAgICAgY2FudmFzIDogXCIjMDAwMDAwXCIsXG4gICAgICAgICAgICBzdmcgOiBudWxsLCAvL3N2ZyBkZWZhdWx0IGlzIGJsYWNrLCBidXQgd2UgbmVlZCB0byBzcGVjaWFsIGNhc2UgdGhpcyB0byBoYW5kbGUgY2FudmFzIHN0cm9rZSB3aXRob3V0IGZpbGxcbiAgICAgICAgICAgIGFwcGx5IDogXCJmaWxsXCJcbiAgICAgICAgfSxcbiAgICAgICAgXCJsaW5lQ2FwXCI6e1xuICAgICAgICAgICAgc3ZnQXR0ciA6IFwic3Ryb2tlLWxpbmVjYXBcIixcbiAgICAgICAgICAgIGNhbnZhcyA6IFwiYnV0dFwiLFxuICAgICAgICAgICAgc3ZnIDogXCJidXR0XCIsXG4gICAgICAgICAgICBhcHBseSA6IFwic3Ryb2tlXCJcbiAgICAgICAgfSxcbiAgICAgICAgXCJsaW5lSm9pblwiOntcbiAgICAgICAgICAgIHN2Z0F0dHIgOiBcInN0cm9rZS1saW5lam9pblwiLFxuICAgICAgICAgICAgY2FudmFzIDogXCJtaXRlclwiLFxuICAgICAgICAgICAgc3ZnIDogXCJtaXRlclwiLFxuICAgICAgICAgICAgYXBwbHkgOiBcInN0cm9rZVwiXG4gICAgICAgIH0sXG4gICAgICAgIFwibWl0ZXJMaW1pdFwiOntcbiAgICAgICAgICAgIHN2Z0F0dHIgOiBcInN0cm9rZS1taXRlcmxpbWl0XCIsXG4gICAgICAgICAgICBjYW52YXMgOiAxMCxcbiAgICAgICAgICAgIHN2ZyA6IDQsXG4gICAgICAgICAgICBhcHBseSA6IFwic3Ryb2tlXCJcbiAgICAgICAgfSxcbiAgICAgICAgXCJsaW5lV2lkdGhcIjp7XG4gICAgICAgICAgICBzdmdBdHRyIDogXCJzdHJva2Utd2lkdGhcIixcbiAgICAgICAgICAgIGNhbnZhcyA6IDEsXG4gICAgICAgICAgICBzdmcgOiAxLFxuICAgICAgICAgICAgYXBwbHkgOiBcInN0cm9rZVwiXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2xvYmFsQWxwaGFcIjoge1xuICAgICAgICAgICAgc3ZnQXR0ciA6IFwib3BhY2l0eVwiLFxuICAgICAgICAgICAgY2FudmFzIDogMSxcbiAgICAgICAgICAgIHN2ZyA6IDEsXG4gICAgICAgICAgICBhcHBseSA6ICBcImZpbGwgc3Ryb2tlXCJcbiAgICAgICAgfSxcbiAgICAgICAgXCJmb250XCI6e1xuICAgICAgICAgICAgLy9mb250IGNvbnZlcnRzIHRvIG11bHRpcGxlIHN2ZyBhdHRyaWJ1dGVzLCB0aGVyZSBpcyBjdXN0b20gbG9naWMgZm9yIHRoaXNcbiAgICAgICAgICAgIGNhbnZhcyA6IFwiMTBweCBzYW5zLXNlcmlmXCJcbiAgICAgICAgfSxcbiAgICAgICAgXCJzaGFkb3dDb2xvclwiOntcbiAgICAgICAgICAgIGNhbnZhcyA6IFwiIzAwMDAwMFwiXG4gICAgICAgIH0sXG4gICAgICAgIFwic2hhZG93T2Zmc2V0WFwiOntcbiAgICAgICAgICAgIGNhbnZhcyA6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJzaGFkb3dPZmZzZXRZXCI6e1xuICAgICAgICAgICAgY2FudmFzIDogMFxuICAgICAgICB9LFxuICAgICAgICBcInNoYWRvd0JsdXJcIjp7XG4gICAgICAgICAgICBjYW52YXMgOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwidGV4dEFsaWduXCI6e1xuICAgICAgICAgICAgY2FudmFzIDogXCJzdGFydFwiXG4gICAgICAgIH0sXG4gICAgICAgIFwidGV4dEJhc2VsaW5lXCI6e1xuICAgICAgICAgICAgY2FudmFzIDogXCJhbHBoYWJldGljXCJcbiAgICAgICAgfSxcbiAgICAgICAgXCJsaW5lRGFzaFwiIDoge1xuICAgICAgICAgICAgc3ZnQXR0ciA6IFwic3Ryb2tlLWRhc2hhcnJheVwiLFxuICAgICAgICAgICAgY2FudmFzIDogW10sXG4gICAgICAgICAgICBzdmcgOiBudWxsLFxuICAgICAgICAgICAgYXBwbHkgOiBcInN0cm9rZVwiXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZ3JhZGllbnROb2RlIC0gcmVmZXJlbmNlIHRvIHRoZSBncmFkaWVudFxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIENhbnZhc0dyYWRpZW50ID0gZnVuY3Rpb24gKGdyYWRpZW50Tm9kZSwgY3R4KSB7XG4gICAgICAgIHRoaXMuX19yb290ID0gZ3JhZGllbnROb2RlO1xuICAgICAgICB0aGlzLl9fY3R4ID0gY3R4O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgY29sb3Igc3RvcCB0byB0aGUgZ3JhZGllbnQgcm9vdFxuICAgICAqL1xuICAgIENhbnZhc0dyYWRpZW50LnByb3RvdHlwZS5hZGRDb2xvclN0b3AgPSBmdW5jdGlvbiAob2Zmc2V0LCBjb2xvcikge1xuICAgICAgICB2YXIgc3RvcCA9IHRoaXMuX19jdHguX19jcmVhdGVFbGVtZW50KFwic3RvcFwiKSwgcmVnZXgsIG1hdGNoZXM7XG4gICAgICAgIHN0b3Auc2V0QXR0cmlidXRlKFwib2Zmc2V0XCIsIG9mZnNldCk7XG4gICAgICAgIGlmIChjb2xvci5pbmRleE9mKFwicmdiYVwiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIC8vc2VwYXJhdGUgYWxwaGEgdmFsdWUsIHNpbmNlIHdlYmtpdCBjYW4ndCBoYW5kbGUgaXRcbiAgICAgICAgICAgIHJlZ2V4ID0gL3JnYmFcXChcXHMqKFxcZCspXFxzKixcXHMqKFxcZCspXFxzKixcXHMqKFxcZCspXFxzKixcXHMqKFxcZD9cXC4/XFxkKilcXHMqXFwpL2dpO1xuICAgICAgICAgICAgbWF0Y2hlcyA9IHJlZ2V4LmV4ZWMoY29sb3IpO1xuICAgICAgICAgICAgc3RvcC5zZXRBdHRyaWJ1dGUoXCJzdG9wLWNvbG9yXCIsIGZvcm1hdChcInJnYih7cn0se2d9LHtifSlcIiwge3I6bWF0Y2hlc1sxXSwgZzptYXRjaGVzWzJdLCBiOm1hdGNoZXNbM119KSk7XG4gICAgICAgICAgICBzdG9wLnNldEF0dHJpYnV0ZShcInN0b3Atb3BhY2l0eVwiLCBtYXRjaGVzWzRdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0b3Auc2V0QXR0cmlidXRlKFwic3RvcC1jb2xvclwiLCBjb2xvcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fX3Jvb3QuYXBwZW5kQ2hpbGQoc3RvcCk7XG4gICAgfTtcblxuICAgIENhbnZhc1BhdHRlcm4gPSBmdW5jdGlvbiAocGF0dGVybiwgY3R4KSB7XG4gICAgICAgIHRoaXMuX19yb290ID0gcGF0dGVybjtcbiAgICAgICAgdGhpcy5fX2N0eCA9IGN0eDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVGhlIG1vY2sgY2FudmFzIGNvbnRleHRcbiAgICAgKiBAcGFyYW0gbyAtIG9wdGlvbnMgaW5jbHVkZTpcbiAgICAgKiBjdHggLSBleGlzdGluZyBDb250ZXh0MkQgdG8gd3JhcCBhcm91bmRcbiAgICAgKiB3aWR0aCAtIHdpZHRoIG9mIHlvdXIgY2FudmFzIChkZWZhdWx0cyB0byA1MDApXG4gICAgICogaGVpZ2h0IC0gaGVpZ2h0IG9mIHlvdXIgY2FudmFzIChkZWZhdWx0cyB0byA1MDApXG4gICAgICogZW5hYmxlTWlycm9yaW5nIC0gZW5hYmxlcyBjYW52YXMgbWlycm9yaW5nIChnZXQgaW1hZ2UgZGF0YSkgKGRlZmF1bHRzIHRvIGZhbHNlKVxuICAgICAqIGRvY3VtZW50IC0gdGhlIGRvY3VtZW50IG9iamVjdCAoZGVmYXVsdHMgdG8gdGhlIGN1cnJlbnQgZG9jdW1lbnQpXG4gICAgICovXG4gICAgY3R4ID0gZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgdmFyIGRlZmF1bHRPcHRpb25zID0geyB3aWR0aDo1MDAsIGhlaWdodDo1MDAsIGVuYWJsZU1pcnJvcmluZyA6IGZhbHNlfSwgb3B0aW9ucztcblxuICAgICAgICAvL2tlZXAgc3VwcG9ydCBmb3IgdGhpcyB3YXkgb2YgY2FsbGluZyBDMlM6IG5ldyBDMlMod2lkdGgsaGVpZ2h0KVxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBkZWZhdWx0T3B0aW9ucztcbiAgICAgICAgICAgIG9wdGlvbnMud2lkdGggPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICBvcHRpb25zLmhlaWdodCA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgfSBlbHNlIGlmICggIW8gKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gZGVmYXVsdE9wdGlvbnM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvcHRpb25zID0gbztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBjdHgpKSB7XG4gICAgICAgICAgICAvL2RpZCBzb21lb25lIGNhbGwgdGhpcyB3aXRob3V0IG5ldz9cbiAgICAgICAgICAgIHJldHVybiBuZXcgY3R4KG9wdGlvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9zZXR1cCBvcHRpb25zXG4gICAgICAgIHRoaXMud2lkdGggPSBvcHRpb25zLndpZHRoIHx8IGRlZmF1bHRPcHRpb25zLndpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0IHx8IGRlZmF1bHRPcHRpb25zLmhlaWdodDtcbiAgICAgICAgdGhpcy5lbmFibGVNaXJyb3JpbmcgPSBvcHRpb25zLmVuYWJsZU1pcnJvcmluZyAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5lbmFibGVNaXJyb3JpbmcgOiBkZWZhdWx0T3B0aW9ucy5lbmFibGVNaXJyb3Jpbmc7XG5cbiAgICAgICAgdGhpcy5jYW52YXMgPSB0aGlzOyAgIC8vL3BvaW50IGJhY2sgdG8gdGhpcyBpbnN0YW5jZSFcbiAgICAgICAgdGhpcy5fX2RvY3VtZW50ID0gb3B0aW9ucy5kb2N1bWVudCB8fCBkb2N1bWVudDtcblxuICAgICAgICAvLyBhbGxvdyBwYXNzaW5nIGluIGFuIGV4aXN0aW5nIGNvbnRleHQgdG8gd3JhcCBhcm91bmRcbiAgICAgICAgLy8gaWYgYSBjb250ZXh0IGlzIHBhc3NlZCBpbiwgd2Uga25vdyBhIGNhbnZhcyBhbHJlYWR5IGV4aXN0XG4gICAgICAgIGlmIChvcHRpb25zLmN0eCkge1xuICAgICAgICAgICAgdGhpcy5fX2N0eCA9IG9wdGlvbnMuY3R4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fX2NhbnZhcyA9IHRoaXMuX19kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgICAgICAgdGhpcy5fX2N0eCA9IHRoaXMuX19jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fX3NldERlZmF1bHRTdHlsZXMoKTtcbiAgICAgICAgdGhpcy5fX3N0YWNrID0gW3RoaXMuX19nZXRTdHlsZVN0YXRlKCldO1xuICAgICAgICB0aGlzLl9fZ3JvdXBTdGFjayA9IFtdO1xuXG4gICAgICAgIC8vdGhlIHJvb3Qgc3ZnIGVsZW1lbnRcbiAgICAgICAgdGhpcy5fX3Jvb3QgPSB0aGlzLl9fZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJzdmdcIik7XG4gICAgICAgIHRoaXMuX19yb290LnNldEF0dHJpYnV0ZShcInZlcnNpb25cIiwgMS4xKTtcbiAgICAgICAgdGhpcy5fX3Jvb3Quc2V0QXR0cmlidXRlKFwieG1sbnNcIiwgXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiKTtcbiAgICAgICAgdGhpcy5fX3Jvb3Quc2V0QXR0cmlidXRlTlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3htbG5zL1wiLCBcInhtbG5zOnhsaW5rXCIsIFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiKTtcbiAgICAgICAgdGhpcy5fX3Jvb3Quc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgdGhpcy53aWR0aCk7XG4gICAgICAgIHRoaXMuX19yb290LnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCB0aGlzLmhlaWdodCk7XG5cbiAgICAgICAgLy9tYWtlIHN1cmUgd2UgZG9uJ3QgZ2VuZXJhdGUgdGhlIHNhbWUgaWRzIGluIGRlZnNcbiAgICAgICAgdGhpcy5fX2lkcyA9IHt9O1xuXG4gICAgICAgIC8vZGVmcyB0YWdcbiAgICAgICAgdGhpcy5fX2RlZnMgPSB0aGlzLl9fZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJkZWZzXCIpO1xuICAgICAgICB0aGlzLl9fcm9vdC5hcHBlbmRDaGlsZCh0aGlzLl9fZGVmcyk7XG5cbiAgICAgICAgLy9hbHNvIGFkZCBhIGdyb3VwIGNoaWxkLiB0aGUgc3ZnIGVsZW1lbnQgY2FuJ3QgdXNlIHRoZSB0cmFuc2Zvcm0gYXR0cmlidXRlXG4gICAgICAgIHRoaXMuX19jdXJyZW50RWxlbWVudCA9IHRoaXMuX19kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImdcIik7XG4gICAgICAgIHRoaXMuX19yb290LmFwcGVuZENoaWxkKHRoaXMuX19jdXJyZW50RWxlbWVudCk7XG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyB0aGUgc3BlY2lmaWVkIHN2ZyBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLl9fY3JlYXRlRWxlbWVudCA9IGZ1bmN0aW9uIChlbGVtZW50TmFtZSwgcHJvcGVydGllcywgcmVzZXRGaWxsKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcHJvcGVydGllcyA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcHJvcGVydGllcyA9IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGVsZW1lbnQgPSB0aGlzLl9fZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgZWxlbWVudE5hbWUpLFxuICAgICAgICAgICAga2V5cyA9IE9iamVjdC5rZXlzKHByb3BlcnRpZXMpLCBpLCBrZXk7XG4gICAgICAgIGlmIChyZXNldEZpbGwpIHtcbiAgICAgICAgICAgIC8vaWYgZmlsbCBvciBzdHJva2UgaXMgbm90IHNwZWNpZmllZCwgdGhlIHN2ZyBlbGVtZW50IHNob3VsZCBub3QgZGlzcGxheS4gQnkgZGVmYXVsdCBTVkcncyBmaWxsIGlzIGJsYWNrLlxuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJmaWxsXCIsIFwibm9uZVwiKTtcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwic3Ryb2tlXCIsIFwibm9uZVwiKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGk9MDsgaTxrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCBwcm9wZXJ0aWVzW2tleV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBcHBsaWVzIGRlZmF1bHQgY2FudmFzIHN0eWxlcyB0byB0aGUgY29udGV4dFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5fX3NldERlZmF1bHRTdHlsZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vZGVmYXVsdCAyZCBjYW52YXMgY29udGV4dCBwcm9wZXJ0aWVzIHNlZTpodHRwOi8vd3d3LnczLm9yZy9UUi8yZGNvbnRleHQvXG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoU1RZTEVTKSwgaSwga2V5O1xuICAgICAgICBmb3IgKGk9MDsgaTxrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgICAgICAgdGhpc1trZXldID0gU1RZTEVTW2tleV0uY2FudmFzO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFwcGxpZXMgc3R5bGVzIG9uIHJlc3RvcmVcbiAgICAgKiBAcGFyYW0gc3R5bGVTdGF0ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5fX2FwcGx5U3R5bGVTdGF0ZSA9IGZ1bmN0aW9uIChzdHlsZVN0YXRlKSB7XG4gICAgICAgIGlmKCFzdHlsZVN0YXRlKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHN0eWxlU3RhdGUpLCBpLCBrZXk7XG4gICAgICAgIGZvciAoaT0wOyBpPGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgICB0aGlzW2tleV0gPSBzdHlsZVN0YXRlW2tleV07XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgY3VycmVudCBzdHlsZSBzdGF0ZVxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuX19nZXRTdHlsZVN0YXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaSwgc3R5bGVTdGF0ZSA9IHt9LCBrZXlzID0gT2JqZWN0LmtleXMoU1RZTEVTKSwga2V5O1xuICAgICAgICBmb3IgKGk9MDsgaTxrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgICAgICAgc3R5bGVTdGF0ZVtrZXldID0gdGhpc1trZXldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHlsZVN0YXRlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBcHBsZXMgdGhlIGN1cnJlbnQgc3R5bGVzIHRvIHRoZSBjdXJyZW50IFNWRyBlbGVtZW50LiBPbiBcImN0eC5maWxsXCIgb3IgXCJjdHguc3Ryb2tlXCJcbiAgICAgKiBAcGFyYW0gdHlwZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5fX2FwcGx5U3R5bGVUb0N1cnJlbnRFbGVtZW50ID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICBcdHZhciBjdXJyZW50RWxlbWVudCA9IHRoaXMuX19jdXJyZW50RWxlbWVudDtcbiAgICBcdHZhciBjdXJyZW50U3R5bGVHcm91cCA9IHRoaXMuX19jdXJyZW50RWxlbWVudHNUb1N0eWxlO1xuICAgIFx0aWYgKGN1cnJlbnRTdHlsZUdyb3VwKSB7XG4gICAgXHRcdGN1cnJlbnRFbGVtZW50LnNldEF0dHJpYnV0ZSh0eXBlLCBcIlwiKTtcbiAgICBcdFx0Y3VycmVudEVsZW1lbnQgPSBjdXJyZW50U3R5bGVHcm91cC5lbGVtZW50O1xuICAgIFx0XHRjdXJyZW50U3R5bGVHcm91cC5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgXHRcdFx0bm9kZS5zZXRBdHRyaWJ1dGUodHlwZSwgXCJcIik7XG4gICAgXHRcdH0pXG4gICAgXHR9XG5cbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhTVFlMRVMpLCBpLCBzdHlsZSwgdmFsdWUsIGlkLCByZWdleCwgbWF0Y2hlcztcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHN0eWxlID0gU1RZTEVTW2tleXNbaV1dO1xuICAgICAgICAgICAgdmFsdWUgPSB0aGlzW2tleXNbaV1dO1xuICAgICAgICAgICAgaWYgKHN0eWxlLmFwcGx5KSB7XG4gICAgICAgICAgICAgICAgLy9pcyB0aGlzIGEgZ3JhZGllbnQgb3IgcGF0dGVybj9cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBDYW52YXNQYXR0ZXJuKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vcGF0dGVyblxuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUuX19jdHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY29weSBvdmVyIGRlZnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlKHZhbHVlLl9fY3R4Ll9fZGVmcy5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkID0gdmFsdWUuX19jdHguX19kZWZzLmNoaWxkTm9kZXNbMF0uZ2V0QXR0cmlidXRlKFwiaWRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fX2lkc1tpZF0gPSBpZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9fZGVmcy5hcHBlbmRDaGlsZCh2YWx1ZS5fX2N0eC5fX2RlZnMuY2hpbGROb2Rlc1swXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEVsZW1lbnQuc2V0QXR0cmlidXRlKHN0eWxlLmFwcGx5LCBmb3JtYXQoXCJ1cmwoI3tpZH0pXCIsIHtpZDp2YWx1ZS5fX3Jvb3QuZ2V0QXR0cmlidXRlKFwiaWRcIil9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgQ2FudmFzR3JhZGllbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9ncmFkaWVudFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoc3R5bGUuYXBwbHksIGZvcm1hdChcInVybCgje2lkfSlcIiwge2lkOnZhbHVlLl9fcm9vdC5nZXRBdHRyaWJ1dGUoXCJpZFwiKX0pKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN0eWxlLmFwcGx5LmluZGV4T2YodHlwZSkhPT0tMSAmJiBzdHlsZS5zdmcgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgoc3R5bGUuc3ZnQXR0ciA9PT0gXCJzdHJva2VcIiB8fCBzdHlsZS5zdmdBdHRyID09PSBcImZpbGxcIikgJiYgdmFsdWUuaW5kZXhPZihcInJnYmFcIikgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3NlcGFyYXRlIGFscGhhIHZhbHVlLCBzaW5jZSBpbGx1c3RyYXRvciBjYW4ndCBoYW5kbGUgaXRcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2V4ID0gL3JnYmFcXChcXHMqKFxcZCspXFxzKixcXHMqKFxcZCspXFxzKixcXHMqKFxcZCspXFxzKixcXHMqKFxcZD9cXC4/XFxkKilcXHMqXFwpL2dpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hlcyA9IHJlZ2V4LmV4ZWModmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEVsZW1lbnQuc2V0QXR0cmlidXRlKHN0eWxlLnN2Z0F0dHIsIGZvcm1hdChcInJnYih7cn0se2d9LHtifSlcIiwge3I6bWF0Y2hlc1sxXSwgZzptYXRjaGVzWzJdLCBiOm1hdGNoZXNbM119KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3Nob3VsZCB0YWtlIGdsb2JhbEFscGhhIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvcGFjaXR5ID0gbWF0Y2hlc1s0XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBnbG9iYWxBbHBoYSA9IHRoaXMuZ2xvYmFsQWxwaGE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ2xvYmFsQWxwaGEgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wYWNpdHkgKj0gZ2xvYmFsQWxwaGE7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoc3R5bGUuc3ZnQXR0citcIi1vcGFjaXR5XCIsIG9wYWNpdHkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGF0dHIgPSBzdHlsZS5zdmdBdHRyO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtleXNbaV0gPT09ICdnbG9iYWxBbHBoYScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyID0gdHlwZSsnLScrc3R5bGUuc3ZnQXR0cjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudEVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2ZpbGwtb3BhY2l0eSBvciBzdHJva2Utb3BhY2l0eSBoYXMgYWxyZWFkeSBiZWVuIHNldCBieSBzdHJva2Ugb3IgZmlsbC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy9vdGhlcndpc2Ugb25seSB1cGRhdGUgYXR0cmlidXRlIGlmIHJpZ2h0IHR5cGUsIGFuZCBub3Qgc3ZnIGRlZmF1bHRcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRFbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogV2lsbCByZXR1cm4gdGhlIGNsb3Nlc3QgZ3JvdXAgb3Igc3ZnIG5vZGUuIE1heSByZXR1cm4gdGhlIGN1cnJlbnQgZWxlbWVudC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuX19jbG9zZXN0R3JvdXBPclN2ZyA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIG5vZGUgPSBub2RlIHx8IHRoaXMuX19jdXJyZW50RWxlbWVudDtcbiAgICAgICAgaWYgKG5vZGUubm9kZU5hbWUgPT09IFwiZ1wiIHx8IG5vZGUubm9kZU5hbWUgPT09IFwic3ZnXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX19jbG9zZXN0R3JvdXBPclN2Zyhub2RlLnBhcmVudE5vZGUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHNlcmlhbGl6ZWQgdmFsdWUgb2YgdGhlIHN2ZyBzbyBmYXJcbiAgICAgKiBAcGFyYW0gZml4TmFtZWRFbnRpdGllcyAtIFN0YW5kYWxvbmUgU1ZHIGRvZXNuJ3Qgc3VwcG9ydCBuYW1lZCBlbnRpdGllcywgd2hpY2ggZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUgZW5jb2Rlcy5cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIElmIHRydWUsIHdlIGF0dGVtcHQgdG8gZmluZCBhbGwgbmFtZWQgZW50aXRpZXMgYW5kIGVuY29kZSBpdCBhcyBhIG51bWVyaWMgZW50aXR5LlxuICAgICAqIEByZXR1cm4gc2VyaWFsaXplZCBzdmdcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLmdldFNlcmlhbGl6ZWRTdmcgPSBmdW5jdGlvbiAoZml4TmFtZWRFbnRpdGllcykge1xuICAgICAgICB2YXIgc2VyaWFsaXplZCA9IG5ldyBYTUxTZXJpYWxpemVyKCkuc2VyaWFsaXplVG9TdHJpbmcodGhpcy5fX3Jvb3QpLFxuICAgICAgICAgICAga2V5cywgaSwga2V5LCB2YWx1ZSwgcmVnZXhwLCB4bWxucztcblxuICAgICAgICAvL0lFIHNlYXJjaCBmb3IgYSBkdXBsaWNhdGUgeG1ubHMgYmVjYXVzZSB0aGV5IGRpZG4ndCBpbXBsZW1lbnQgc2V0QXR0cmlidXRlTlMgY29ycmVjdGx5XG4gICAgICAgIHhtbG5zID0gL3htbG5zPVwiaHR0cDpcXC9cXC93d3dcXC53M1xcLm9yZ1xcLzIwMDBcXC9zdmdcIi4reG1sbnM9XCJodHRwOlxcL1xcL3d3d1xcLnczXFwub3JnXFwvMjAwMFxcL3N2Zy9naTtcbiAgICAgICAgaWYgKHhtbG5zLnRlc3Qoc2VyaWFsaXplZCkpIHtcbiAgICAgICAgICAgIHNlcmlhbGl6ZWQgPSBzZXJpYWxpemVkLnJlcGxhY2UoJ3htbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCd4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaXhOYW1lZEVudGl0aWVzKSB7XG4gICAgICAgICAgICBrZXlzID0gT2JqZWN0LmtleXMobmFtZWRFbnRpdGllcyk7XG4gICAgICAgICAgICAvL2xvb3Agb3ZlciBlYWNoIG5hbWVkIGVudGl0eSBhbmQgcmVwbGFjZSB3aXRoIHRoZSBwcm9wZXIgZXF1aXZhbGVudC5cbiAgICAgICAgICAgIGZvciAoaT0wOyBpPGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgICAgICAgICAgIHZhbHVlID0gbmFtZWRFbnRpdGllc1trZXldO1xuICAgICAgICAgICAgICAgIHJlZ2V4cCA9IG5ldyBSZWdFeHAoa2V5LCBcImdpXCIpO1xuICAgICAgICAgICAgICAgIGlmIChyZWdleHAudGVzdChzZXJpYWxpemVkKSkge1xuICAgICAgICAgICAgICAgICAgICBzZXJpYWxpemVkID0gc2VyaWFsaXplZC5yZXBsYWNlKHJlZ2V4cCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZXJpYWxpemVkO1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHJvb3Qgc3ZnXG4gICAgICogQHJldHVyblxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuZ2V0U3ZnID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fX3Jvb3Q7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBXaWxsIGdlbmVyYXRlIGEgZ3JvdXAgdGFnLlxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuc2F2ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGdyb3VwID0gdGhpcy5fX2NyZWF0ZUVsZW1lbnQoXCJnXCIpO1xuICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5fX2Nsb3Nlc3RHcm91cE9yU3ZnKCk7XG4gICAgICAgIHRoaXMuX19ncm91cFN0YWNrLnB1c2gocGFyZW50KTtcbiAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKGdyb3VwKTtcbiAgICAgICAgdGhpcy5fX2N1cnJlbnRFbGVtZW50ID0gZ3JvdXA7XG4gICAgICAgIHRoaXMuX19zdGFjay5wdXNoKHRoaXMuX19nZXRTdHlsZVN0YXRlKCkpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogU2V0cyBjdXJyZW50IGVsZW1lbnQgdG8gcGFyZW50LCBvciBqdXN0IHJvb3QgaWYgYWxyZWFkeSByb290XG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5yZXN0b3JlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9fY3VycmVudEVsZW1lbnQgPSB0aGlzLl9fZ3JvdXBTdGFjay5wb3AoKTtcbiAgICAgICAgdGhpcy5fX2N1cnJlbnRFbGVtZW50c1RvU3R5bGUgPSBudWxsO1xuICAgICAgICAvL0NsZWFyaW5nIGNhbnZhcyB3aWxsIG1ha2UgdGhlIHBvcGVkIGdyb3VwIGludmFsaWQsIGN1cnJlbnRFbGVtZW50IGlzIHNldCB0byB0aGUgcm9vdCBncm91cCBub2RlLlxuICAgICAgICBpZiAoIXRoaXMuX19jdXJyZW50RWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5fX2N1cnJlbnRFbGVtZW50ID0gdGhpcy5fX3Jvb3QuY2hpbGROb2Rlc1sxXTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLl9fc3RhY2sucG9wKCk7XG4gICAgICAgIHRoaXMuX19hcHBseVN0eWxlU3RhdGUoc3RhdGUpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBIZWxwZXIgbWV0aG9kIHRvIGFkZCB0cmFuc2Zvcm1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuX19hZGRUcmFuc2Zvcm0gPSBmdW5jdGlvbiAodCkge1xuICAgICAgICAvL2lmIHRoZSBjdXJyZW50IGVsZW1lbnQgaGFzIHNpYmxpbmdzLCBhZGQgYW5vdGhlciBncm91cFxuICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5fX2Nsb3Nlc3RHcm91cE9yU3ZnKCk7XG4gICAgICAgIGlmIChwYXJlbnQuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIFx0aWYgKHRoaXMuX19jdXJyZW50RWxlbWVudC5ub2RlTmFtZSA9PT0gXCJwYXRoXCIpIHtcbiAgICAgICAgXHRcdGlmICghdGhpcy5fX2N1cnJlbnRFbGVtZW50c1RvU3R5bGUpIHRoaXMuX19jdXJyZW50RWxlbWVudHNUb1N0eWxlID0ge2VsZW1lbnQ6IHBhcmVudCwgY2hpbGRyZW46IFtdfTtcbiAgICAgICAgXHRcdHRoaXMuX19jdXJyZW50RWxlbWVudHNUb1N0eWxlLmNoaWxkcmVuLnB1c2godGhpcy5fX2N1cnJlbnRFbGVtZW50KVxuICAgICAgICBcdFx0dGhpcy5fX2FwcGx5Q3VycmVudERlZmF1bHRQYXRoKCk7XG4gICAgICAgIFx0fVxuXG4gICAgICAgICAgICB2YXIgZ3JvdXAgPSB0aGlzLl9fY3JlYXRlRWxlbWVudChcImdcIik7XG4gICAgICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoZ3JvdXApO1xuICAgICAgICAgICAgdGhpcy5fX2N1cnJlbnRFbGVtZW50ID0gZ3JvdXA7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdHJhbnNmb3JtID0gdGhpcy5fX2N1cnJlbnRFbGVtZW50LmdldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiKTtcbiAgICAgICAgaWYgKHRyYW5zZm9ybSkge1xuICAgICAgICAgICAgdHJhbnNmb3JtICs9IFwiIFwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJhbnNmb3JtID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2Zvcm0gKz0gdDtcbiAgICAgICAgdGhpcy5fX2N1cnJlbnRFbGVtZW50LnNldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiLCB0cmFuc2Zvcm0pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiAgc2NhbGVzIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLnNjYWxlID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgaWYgKHkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgeSA9IHg7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fX2FkZFRyYW5zZm9ybShmb3JtYXQoXCJzY2FsZSh7eH0se3l9KVwiLCB7eDp4LCB5Onl9KSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIHJvdGF0ZXMgdGhlIGN1cnJlbnQgZWxlbWVudFxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUucm90YXRlID0gZnVuY3Rpb24gKGFuZ2xlKSB7XG4gICAgICAgIHZhciBkZWdyZWVzID0gKGFuZ2xlICogMTgwIC8gTWF0aC5QSSk7XG4gICAgICAgIHRoaXMuX19hZGRUcmFuc2Zvcm0oZm9ybWF0KFwicm90YXRlKHthbmdsZX0se2N4fSx7Y3l9KVwiLCB7YW5nbGU6ZGVncmVlcywgY3g6MCwgY3k6MH0pKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogdHJhbnNsYXRlcyB0aGUgY3VycmVudCBlbGVtZW50XG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS50cmFuc2xhdGUgPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICB0aGlzLl9fYWRkVHJhbnNmb3JtKGZvcm1hdChcInRyYW5zbGF0ZSh7eH0se3l9KVwiLCB7eDp4LHk6eX0pKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogYXBwbGllcyBhIHRyYW5zZm9ybSB0byB0aGUgY3VycmVudCBlbGVtZW50XG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS50cmFuc2Zvcm0gPSBmdW5jdGlvbiAoYSwgYiwgYywgZCwgZSwgZikge1xuICAgICAgICB0aGlzLl9fYWRkVHJhbnNmb3JtKGZvcm1hdChcIm1hdHJpeCh7YX0se2J9LHtjfSx7ZH0se2V9LHtmfSlcIiwge2E6YSwgYjpiLCBjOmMsIGQ6ZCwgZTplLCBmOmZ9KSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBQYXRoIEVsZW1lbnRcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLmJlZ2luUGF0aCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHBhdGgsIHBhcmVudDtcblxuICAgICAgICAvLyBOb3RlIHRoYXQgdGhlcmUgaXMgb25seSBvbmUgY3VycmVudCBkZWZhdWx0IHBhdGgsIGl0IGlzIG5vdCBwYXJ0IG9mIHRoZSBkcmF3aW5nIHN0YXRlLlxuICAgICAgICAvLyBTZWUgYWxzbzogaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc2NyaXB0aW5nLmh0bWwjY3VycmVudC1kZWZhdWx0LXBhdGhcbiAgICAgICAgdGhpcy5fX2N1cnJlbnREZWZhdWx0UGF0aCA9IFwiXCI7XG4gICAgICAgIHRoaXMuX19jdXJyZW50UG9zaXRpb24gPSB7fTtcblxuICAgICAgICBwYXRoID0gdGhpcy5fX2NyZWF0ZUVsZW1lbnQoXCJwYXRoXCIsIHt9LCB0cnVlKTtcbiAgICAgICAgcGFyZW50ID0gdGhpcy5fX2Nsb3Nlc3RHcm91cE9yU3ZnKCk7XG4gICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChwYXRoKTtcbiAgICAgICAgdGhpcy5fX2N1cnJlbnRFbGVtZW50ID0gcGF0aDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSGVscGVyIGZ1bmN0aW9uIHRvIGFwcGx5IGN1cnJlbnREZWZhdWx0UGF0aCB0byBjdXJyZW50IHBhdGggZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5fX2FwcGx5Q3VycmVudERlZmF1bHRQYXRoID0gZnVuY3Rpb24gKCkge1xuICAgIFx0dmFyIGN1cnJlbnRFbGVtZW50ID0gdGhpcy5fX2N1cnJlbnRFbGVtZW50O1xuICAgICAgICBpZiAoY3VycmVudEVsZW1lbnQubm9kZU5hbWUgPT09IFwicGF0aFwiKSB7XG5cdFx0XHRjdXJyZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkXCIsIHRoaXMuX19jdXJyZW50RGVmYXVsdFBhdGgpO1xuICAgICAgICB9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5lcnJvcihcIkF0dGVtcHRlZCB0byBhcHBseSBwYXRoIGNvbW1hbmQgdG8gbm9kZVwiLCBjdXJyZW50RWxlbWVudC5ub2RlTmFtZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSGVscGVyIGZ1bmN0aW9uIHRvIGFkZCBwYXRoIGNvbW1hbmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuX19hZGRQYXRoQ29tbWFuZCA9IGZ1bmN0aW9uIChjb21tYW5kKSB7XG4gICAgICAgIHRoaXMuX19jdXJyZW50RGVmYXVsdFBhdGggKz0gXCIgXCI7XG4gICAgICAgIHRoaXMuX19jdXJyZW50RGVmYXVsdFBhdGggKz0gY29tbWFuZDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkcyB0aGUgbW92ZSBjb21tYW5kIHRvIHRoZSBjdXJyZW50IHBhdGggZWxlbWVudCxcbiAgICAgKiBpZiB0aGUgY3VycmVudFBhdGhFbGVtZW50IGlzIG5vdCBlbXB0eSBjcmVhdGUgYSBuZXcgcGF0aCBlbGVtZW50XG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5tb3ZlVG8gPSBmdW5jdGlvbiAoeCx5KSB7XG4gICAgICAgIGlmICh0aGlzLl9fY3VycmVudEVsZW1lbnQubm9kZU5hbWUgIT09IFwicGF0aFwiKSB7XG4gICAgICAgICAgICB0aGlzLmJlZ2luUGF0aCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY3JlYXRlcyBhIG5ldyBzdWJwYXRoIHdpdGggdGhlIGdpdmVuIHBvaW50XG4gICAgICAgIHRoaXMuX19jdXJyZW50UG9zaXRpb24gPSB7eDogeCwgeTogeX07XG4gICAgICAgIHRoaXMuX19hZGRQYXRoQ29tbWFuZChmb3JtYXQoXCJNIHt4fSB7eX1cIiwge3g6eCwgeTp5fSkpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDbG9zZXMgdGhlIGN1cnJlbnQgcGF0aFxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuY2xvc2VQYXRoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5fX2N1cnJlbnREZWZhdWx0UGF0aCkge1xuICAgICAgICAgICAgdGhpcy5fX2FkZFBhdGhDb21tYW5kKFwiWlwiKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbGluZSB0byBjb21tYW5kXG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5saW5lVG8gPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICB0aGlzLl9fY3VycmVudFBvc2l0aW9uID0ge3g6IHgsIHk6IHl9O1xuICAgICAgICBpZiAodGhpcy5fX2N1cnJlbnREZWZhdWx0UGF0aC5pbmRleE9mKCdNJykgPiAtMSkge1xuICAgICAgICAgICAgdGhpcy5fX2FkZFBhdGhDb21tYW5kKGZvcm1hdChcIkwge3h9IHt5fVwiLCB7eDp4LCB5Onl9KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9fYWRkUGF0aENvbW1hbmQoZm9ybWF0KFwiTSB7eH0ge3l9XCIsIHt4OngsIHk6eX0pKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBiZXppZXIgY29tbWFuZFxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuYmV6aWVyQ3VydmVUbyA9IGZ1bmN0aW9uIChjcDF4LCBjcDF5LCBjcDJ4LCBjcDJ5LCB4LCB5KSB7XG4gICAgICAgIHRoaXMuX19jdXJyZW50UG9zaXRpb24gPSB7eDogeCwgeTogeX07XG4gICAgICAgIHRoaXMuX19hZGRQYXRoQ29tbWFuZChmb3JtYXQoXCJDIHtjcDF4fSB7Y3AxeX0ge2NwMnh9IHtjcDJ5fSB7eH0ge3l9XCIsXG4gICAgICAgICAgICB7Y3AxeDpjcDF4LCBjcDF5OmNwMXksIGNwMng6Y3AyeCwgY3AyeTpjcDJ5LCB4OngsIHk6eX0pKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIHF1YWRyYXRpYyBjdXJ2ZSB0byBjb21tYW5kXG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5xdWFkcmF0aWNDdXJ2ZVRvID0gZnVuY3Rpb24gKGNweCwgY3B5LCB4LCB5KSB7XG4gICAgICAgIHRoaXMuX19jdXJyZW50UG9zaXRpb24gPSB7eDogeCwgeTogeX07XG4gICAgICAgIHRoaXMuX19hZGRQYXRoQ29tbWFuZChmb3JtYXQoXCJRIHtjcHh9IHtjcHl9IHt4fSB7eX1cIiwge2NweDpjcHgsIGNweTpjcHksIHg6eCwgeTp5fSkpO1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIFJldHVybiBhIG5ldyBub3JtYWxpemVkIHZlY3RvciBvZiBnaXZlbiB2ZWN0b3JcbiAgICAgKi9cbiAgICB2YXIgbm9ybWFsaXplID0gZnVuY3Rpb24gKHZlY3Rvcikge1xuICAgICAgICB2YXIgbGVuID0gTWF0aC5zcXJ0KHZlY3RvclswXSAqIHZlY3RvclswXSArIHZlY3RvclsxXSAqIHZlY3RvclsxXSk7XG4gICAgICAgIHJldHVybiBbdmVjdG9yWzBdIC8gbGVuLCB2ZWN0b3JbMV0gLyBsZW5dO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBhcmNUbyB0byB0aGUgY3VycmVudCBwYXRoXG4gICAgICpcbiAgICAgKiBAc2VlIGh0dHA6Ly93d3cudzMub3JnL1RSLzIwMTUvV0QtMmRjb250ZXh0LTIwMTUwNTE0LyNkb20tY29udGV4dC0yZC1hcmN0b1xuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuYXJjVG8gPSBmdW5jdGlvbiAoeDEsIHkxLCB4MiwgeTIsIHJhZGl1cykge1xuICAgICAgICAvLyBMZXQgdGhlIHBvaW50ICh4MCwgeTApIGJlIHRoZSBsYXN0IHBvaW50IGluIHRoZSBzdWJwYXRoLlxuICAgICAgICB2YXIgeDAgPSB0aGlzLl9fY3VycmVudFBvc2l0aW9uICYmIHRoaXMuX19jdXJyZW50UG9zaXRpb24ueDtcbiAgICAgICAgdmFyIHkwID0gdGhpcy5fX2N1cnJlbnRQb3NpdGlvbiAmJiB0aGlzLl9fY3VycmVudFBvc2l0aW9uLnk7XG5cbiAgICAgICAgLy8gRmlyc3QgZW5zdXJlIHRoZXJlIGlzIGEgc3VicGF0aCBmb3IgKHgxLCB5MSkuXG4gICAgICAgIGlmICh0eXBlb2YgeDAgPT0gXCJ1bmRlZmluZWRcIiB8fCB0eXBlb2YgeTAgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTmVnYXRpdmUgdmFsdWVzIGZvciByYWRpdXMgbXVzdCBjYXVzZSB0aGUgaW1wbGVtZW50YXRpb24gdG8gdGhyb3cgYW4gSW5kZXhTaXplRXJyb3IgZXhjZXB0aW9uLlxuICAgICAgICBpZiAocmFkaXVzIDwgMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW5kZXhTaXplRXJyb3I6IFRoZSByYWRpdXMgcHJvdmlkZWQgKFwiICsgcmFkaXVzICsgXCIpIGlzIG5lZ2F0aXZlLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRoZSBwb2ludCAoeDAsIHkwKSBpcyBlcXVhbCB0byB0aGUgcG9pbnQgKHgxLCB5MSksXG4gICAgICAgIC8vIG9yIGlmIHRoZSBwb2ludCAoeDEsIHkxKSBpcyBlcXVhbCB0byB0aGUgcG9pbnQgKHgyLCB5MiksXG4gICAgICAgIC8vIG9yIGlmIHRoZSByYWRpdXMgcmFkaXVzIGlzIHplcm8sXG4gICAgICAgIC8vIHRoZW4gdGhlIG1ldGhvZCBtdXN0IGFkZCB0aGUgcG9pbnQgKHgxLCB5MSkgdG8gdGhlIHN1YnBhdGgsXG4gICAgICAgIC8vIGFuZCBjb25uZWN0IHRoYXQgcG9pbnQgdG8gdGhlIHByZXZpb3VzIHBvaW50ICh4MCwgeTApIGJ5IGEgc3RyYWlnaHQgbGluZS5cbiAgICAgICAgaWYgKCgoeDAgPT09IHgxKSAmJiAoeTAgPT09IHkxKSlcbiAgICAgICAgICAgIHx8ICgoeDEgPT09IHgyKSAmJiAoeTEgPT09IHkyKSlcbiAgICAgICAgICAgIHx8IChyYWRpdXMgPT09IDApKSB7XG4gICAgICAgICAgICB0aGlzLmxpbmVUbyh4MSwgeTEpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBpZiB0aGUgcG9pbnRzICh4MCwgeTApLCAoeDEsIHkxKSwgYW5kICh4MiwgeTIpIGFsbCBsaWUgb24gYSBzaW5nbGUgc3RyYWlnaHQgbGluZSxcbiAgICAgICAgLy8gdGhlbiB0aGUgbWV0aG9kIG11c3QgYWRkIHRoZSBwb2ludCAoeDEsIHkxKSB0byB0aGUgc3VicGF0aCxcbiAgICAgICAgLy8gYW5kIGNvbm5lY3QgdGhhdCBwb2ludCB0byB0aGUgcHJldmlvdXMgcG9pbnQgKHgwLCB5MCkgYnkgYSBzdHJhaWdodCBsaW5lLlxuICAgICAgICB2YXIgdW5pdF92ZWNfcDFfcDAgPSBub3JtYWxpemUoW3gwIC0geDEsIHkwIC0geTFdKTtcbiAgICAgICAgdmFyIHVuaXRfdmVjX3AxX3AyID0gbm9ybWFsaXplKFt4MiAtIHgxLCB5MiAtIHkxXSk7XG4gICAgICAgIGlmICh1bml0X3ZlY19wMV9wMFswXSAqIHVuaXRfdmVjX3AxX3AyWzFdID09PSB1bml0X3ZlY19wMV9wMFsxXSAqIHVuaXRfdmVjX3AxX3AyWzBdKSB7XG4gICAgICAgICAgICB0aGlzLmxpbmVUbyh4MSwgeTEpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBsZXQgVGhlIEFyYyBiZSB0aGUgc2hvcnRlc3QgYXJjIGdpdmVuIGJ5IGNpcmN1bWZlcmVuY2Ugb2YgdGhlIGNpcmNsZSB0aGF0IGhhcyByYWRpdXMgcmFkaXVzLFxuICAgICAgICAvLyBhbmQgdGhhdCBoYXMgb25lIHBvaW50IHRhbmdlbnQgdG8gdGhlIGhhbGYtaW5maW5pdGUgbGluZSB0aGF0IGNyb3NzZXMgdGhlIHBvaW50ICh4MCwgeTApIGFuZCBlbmRzIGF0IHRoZSBwb2ludCAoeDEsIHkxKSxcbiAgICAgICAgLy8gYW5kIHRoYXQgaGFzIGEgZGlmZmVyZW50IHBvaW50IHRhbmdlbnQgdG8gdGhlIGhhbGYtaW5maW5pdGUgbGluZSB0aGF0IGVuZHMgYXQgdGhlIHBvaW50ICh4MSwgeTEpLCBhbmQgY3Jvc3NlcyB0aGUgcG9pbnQgKHgyLCB5MikuXG4gICAgICAgIC8vIFRoZSBwb2ludHMgYXQgd2hpY2ggdGhpcyBjaXJjbGUgdG91Y2hlcyB0aGVzZSB0d28gbGluZXMgYXJlIGNhbGxlZCB0aGUgc3RhcnQgYW5kIGVuZCB0YW5nZW50IHBvaW50cyByZXNwZWN0aXZlbHkuXG5cbiAgICAgICAgLy8gbm90ZSB0aGF0IGJvdGggdmVjdG9ycyBhcmUgdW5pdCB2ZWN0b3JzLCBzbyB0aGUgbGVuZ3RoIGlzIDFcbiAgICAgICAgdmFyIGNvcyA9ICh1bml0X3ZlY19wMV9wMFswXSAqIHVuaXRfdmVjX3AxX3AyWzBdICsgdW5pdF92ZWNfcDFfcDBbMV0gKiB1bml0X3ZlY19wMV9wMlsxXSk7XG4gICAgICAgIHZhciB0aGV0YSA9IE1hdGguYWNvcyhNYXRoLmFicyhjb3MpKTtcblxuICAgICAgICAvLyBDYWxjdWxhdGUgb3JpZ2luXG4gICAgICAgIHZhciB1bml0X3ZlY19wMV9vcmlnaW4gPSBub3JtYWxpemUoW1xuICAgICAgICAgICAgdW5pdF92ZWNfcDFfcDBbMF0gKyB1bml0X3ZlY19wMV9wMlswXSxcbiAgICAgICAgICAgIHVuaXRfdmVjX3AxX3AwWzFdICsgdW5pdF92ZWNfcDFfcDJbMV1cbiAgICAgICAgXSk7XG4gICAgICAgIHZhciBsZW5fcDFfb3JpZ2luID0gcmFkaXVzIC8gTWF0aC5zaW4odGhldGEgLyAyKTtcbiAgICAgICAgdmFyIHggPSB4MSArIGxlbl9wMV9vcmlnaW4gKiB1bml0X3ZlY19wMV9vcmlnaW5bMF07XG4gICAgICAgIHZhciB5ID0geTEgKyBsZW5fcDFfb3JpZ2luICogdW5pdF92ZWNfcDFfb3JpZ2luWzFdO1xuXG4gICAgICAgIC8vIENhbGN1bGF0ZSBzdGFydCBhbmdsZSBhbmQgZW5kIGFuZ2xlXG4gICAgICAgIC8vIHJvdGF0ZSA5MGRlZyBjbG9ja3dpc2UgKG5vdGUgdGhhdCB5IGF4aXMgcG9pbnRzIHRvIGl0cyBkb3duKVxuICAgICAgICB2YXIgdW5pdF92ZWNfb3JpZ2luX3N0YXJ0X3RhbmdlbnQgPSBbXG4gICAgICAgICAgICAtdW5pdF92ZWNfcDFfcDBbMV0sXG4gICAgICAgICAgICB1bml0X3ZlY19wMV9wMFswXVxuICAgICAgICBdO1xuICAgICAgICAvLyByb3RhdGUgOTBkZWcgY291bnRlciBjbG9ja3dpc2UgKG5vdGUgdGhhdCB5IGF4aXMgcG9pbnRzIHRvIGl0cyBkb3duKVxuICAgICAgICB2YXIgdW5pdF92ZWNfb3JpZ2luX2VuZF90YW5nZW50ID0gW1xuICAgICAgICAgICAgdW5pdF92ZWNfcDFfcDJbMV0sXG4gICAgICAgICAgICAtdW5pdF92ZWNfcDFfcDJbMF1cbiAgICAgICAgXTtcbiAgICAgICAgdmFyIGdldEFuZ2xlID0gZnVuY3Rpb24gKHZlY3Rvcikge1xuICAgICAgICAgICAgLy8gZ2V0IGFuZ2xlIChjbG9ja3dpc2UpIGJldHdlZW4gdmVjdG9yIGFuZCAoMSwgMClcbiAgICAgICAgICAgIHZhciB4ID0gdmVjdG9yWzBdO1xuICAgICAgICAgICAgdmFyIHkgPSB2ZWN0b3JbMV07XG4gICAgICAgICAgICBpZiAoeSA+PSAwKSB7IC8vIG5vdGUgdGhhdCB5IGF4aXMgcG9pbnRzIHRvIGl0cyBkb3duXG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGguYWNvcyh4KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIC1NYXRoLmFjb3MoeCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZhciBzdGFydEFuZ2xlID0gZ2V0QW5nbGUodW5pdF92ZWNfb3JpZ2luX3N0YXJ0X3RhbmdlbnQpO1xuICAgICAgICB2YXIgZW5kQW5nbGUgPSBnZXRBbmdsZSh1bml0X3ZlY19vcmlnaW5fZW5kX3RhbmdlbnQpO1xuXG4gICAgICAgIC8vIENvbm5lY3QgdGhlIHBvaW50ICh4MCwgeTApIHRvIHRoZSBzdGFydCB0YW5nZW50IHBvaW50IGJ5IGEgc3RyYWlnaHQgbGluZVxuICAgICAgICB0aGlzLmxpbmVUbyh4ICsgdW5pdF92ZWNfb3JpZ2luX3N0YXJ0X3RhbmdlbnRbMF0gKiByYWRpdXMsXG4gICAgICAgICAgICAgICAgICAgIHkgKyB1bml0X3ZlY19vcmlnaW5fc3RhcnRfdGFuZ2VudFsxXSAqIHJhZGl1cyk7XG5cbiAgICAgICAgLy8gQ29ubmVjdCB0aGUgc3RhcnQgdGFuZ2VudCBwb2ludCB0byB0aGUgZW5kIHRhbmdlbnQgcG9pbnQgYnkgYXJjXG4gICAgICAgIC8vIGFuZCBhZGRpbmcgdGhlIGVuZCB0YW5nZW50IHBvaW50IHRvIHRoZSBzdWJwYXRoLlxuICAgICAgICB0aGlzLmFyYyh4LCB5LCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgc3Ryb2tlIHByb3BlcnR5IG9uIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLnN0cm9rZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX19jdXJyZW50RWxlbWVudC5ub2RlTmFtZSA9PT0gXCJwYXRoXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX19jdXJyZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJwYWludC1vcmRlclwiLCBcImZpbGwgc3Ryb2tlIG1hcmtlcnNcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fX2FwcGx5Q3VycmVudERlZmF1bHRQYXRoKCk7XG4gICAgICAgIHRoaXMuX19hcHBseVN0eWxlVG9DdXJyZW50RWxlbWVudChcInN0cm9rZVwiKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0cyBmaWxsIHByb3BlcnRpZXMgb24gdGhlIGN1cnJlbnQgZWxlbWVudFxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX19jdXJyZW50RWxlbWVudC5ub2RlTmFtZSA9PT0gXCJwYXRoXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX19jdXJyZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJwYWludC1vcmRlclwiLCBcInN0cm9rZSBmaWxsIG1hcmtlcnNcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fX2FwcGx5Q3VycmVudERlZmF1bHRQYXRoKCk7XG4gICAgICAgIHRoaXMuX19hcHBseVN0eWxlVG9DdXJyZW50RWxlbWVudChcImZpbGxcIik7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqICBBZGRzIGEgcmVjdGFuZ2xlIHRvIHRoZSBwYXRoLlxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUucmVjdCA9IGZ1bmN0aW9uICh4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIGlmICh0aGlzLl9fY3VycmVudEVsZW1lbnQubm9kZU5hbWUgIT09IFwicGF0aFwiKSB7XG4gICAgICAgICAgICB0aGlzLmJlZ2luUGF0aCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubW92ZVRvKHgsIHkpO1xuICAgICAgICB0aGlzLmxpbmVUbyh4K3dpZHRoLCB5KTtcbiAgICAgICAgdGhpcy5saW5lVG8oeCt3aWR0aCwgeStoZWlnaHQpO1xuICAgICAgICB0aGlzLmxpbmVUbyh4LCB5K2hlaWdodCk7XG4gICAgICAgIHRoaXMubGluZVRvKHgsIHkpO1xuICAgICAgICB0aGlzLmNsb3NlUGF0aCgpO1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIGFkZHMgYSByZWN0YW5nbGUgZWxlbWVudFxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuZmlsbFJlY3QgPSBmdW5jdGlvbiAoeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgICB2YXIgcmVjdCwgcGFyZW50O1xuICAgICAgICByZWN0ID0gdGhpcy5fX2NyZWF0ZUVsZW1lbnQoXCJyZWN0XCIsIHtcbiAgICAgICAgICAgIHggOiB4LFxuICAgICAgICAgICAgeSA6IHksXG4gICAgICAgICAgICB3aWR0aCA6IHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0IDogaGVpZ2h0XG4gICAgICAgIH0sIHRydWUpO1xuICAgICAgICBwYXJlbnQgPSB0aGlzLl9fY2xvc2VzdEdyb3VwT3JTdmcoKTtcbiAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKHJlY3QpO1xuICAgICAgICB0aGlzLl9fY3VycmVudEVsZW1lbnQgPSByZWN0O1xuICAgICAgICB0aGlzLl9fYXBwbHlTdHlsZVRvQ3VycmVudEVsZW1lbnQoXCJmaWxsXCIpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEcmF3cyBhIHJlY3RhbmdsZSB3aXRoIG5vIGZpbGxcbiAgICAgKiBAcGFyYW0geFxuICAgICAqIEBwYXJhbSB5XG4gICAgICogQHBhcmFtIHdpZHRoXG4gICAgICogQHBhcmFtIGhlaWdodFxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuc3Ryb2tlUmVjdCA9IGZ1bmN0aW9uICh4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHZhciByZWN0LCBwYXJlbnQ7XG4gICAgICAgIHJlY3QgPSB0aGlzLl9fY3JlYXRlRWxlbWVudChcInJlY3RcIiwge1xuICAgICAgICAgICAgeCA6IHgsXG4gICAgICAgICAgICB5IDogeSxcbiAgICAgICAgICAgIHdpZHRoIDogd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQgOiBoZWlnaHRcbiAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgIHBhcmVudCA9IHRoaXMuX19jbG9zZXN0R3JvdXBPclN2ZygpO1xuICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQocmVjdCk7XG4gICAgICAgIHRoaXMuX19jdXJyZW50RWxlbWVudCA9IHJlY3Q7XG4gICAgICAgIHRoaXMuX19hcHBseVN0eWxlVG9DdXJyZW50RWxlbWVudChcInN0cm9rZVwiKTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBDbGVhciBlbnRpcmUgY2FudmFzOlxuICAgICAqIDEuIHNhdmUgY3VycmVudCB0cmFuc2Zvcm1zXG4gICAgICogMi4gcmVtb3ZlIGFsbCB0aGUgY2hpbGROb2RlcyBvZiB0aGUgcm9vdCBnIGVsZW1lbnRcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLl9fY2xlYXJDYW52YXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5fX2Nsb3Nlc3RHcm91cE9yU3ZnKCksXG4gICAgICAgICAgICB0cmFuc2Zvcm0gPSBjdXJyZW50LmdldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiKTtcbiAgICAgICAgdmFyIHJvb3RHcm91cCA9IHRoaXMuX19yb290LmNoaWxkTm9kZXNbMV07XG4gICAgICAgIHZhciBjaGlsZE5vZGVzID0gcm9vdEdyb3VwLmNoaWxkTm9kZXM7XG4gICAgICAgIGZvciAodmFyIGkgPSBjaGlsZE5vZGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBpZiAoY2hpbGROb2Rlc1tpXSkge1xuICAgICAgICAgICAgICAgIHJvb3RHcm91cC5yZW1vdmVDaGlsZChjaGlsZE5vZGVzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9fY3VycmVudEVsZW1lbnQgPSByb290R3JvdXA7XG4gICAgICAgIC8vcmVzZXQgX19ncm91cFN0YWNrIGFzIGFsbCB0aGUgY2hpbGQgZ3JvdXAgbm9kZXMgYXJlIGFsbCByZW1vdmVkLlxuICAgICAgICB0aGlzLl9fZ3JvdXBTdGFjayA9IFtdO1xuICAgICAgICBpZiAodHJhbnNmb3JtKSB7XG4gICAgICAgICAgICB0aGlzLl9fYWRkVHJhbnNmb3JtKHRyYW5zZm9ybSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogXCJDbGVhcnNcIiBhIGNhbnZhcyBieSBqdXN0IGRyYXdpbmcgYSB3aGl0ZSByZWN0YW5nbGUgaW4gdGhlIGN1cnJlbnQgZ3JvdXAuXG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5jbGVhclJlY3QgPSBmdW5jdGlvbiAoeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgICAvL2NsZWFyIGVudGlyZSBjYW52YXNcbiAgICAgICAgaWYgKHggPT09IDAgJiYgeSA9PT0gMCAmJiB3aWR0aCA9PT0gdGhpcy53aWR0aCAmJiBoZWlnaHQgPT09IHRoaXMuaGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLl9fY2xlYXJDYW52YXMoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVjdCwgcGFyZW50ID0gdGhpcy5fX2Nsb3Nlc3RHcm91cE9yU3ZnKCk7XG4gICAgICAgIHJlY3QgPSB0aGlzLl9fY3JlYXRlRWxlbWVudChcInJlY3RcIiwge1xuICAgICAgICAgICAgeCA6IHgsXG4gICAgICAgICAgICB5IDogeSxcbiAgICAgICAgICAgIHdpZHRoIDogd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQgOiBoZWlnaHQsXG4gICAgICAgICAgICBmaWxsIDogXCIjRkZGRkZGXCJcbiAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChyZWN0KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpbmVhciBncmFkaWVudCB0byBhIGRlZnMgdGFnLlxuICAgICAqIFJldHVybnMgYSBjYW52YXMgZ3JhZGllbnQgb2JqZWN0IHRoYXQgaGFzIGEgcmVmZXJlbmNlIHRvIGl0J3MgcGFyZW50IGRlZlxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuY3JlYXRlTGluZWFyR3JhZGllbnQgPSBmdW5jdGlvbiAoeDEsIHkxLCB4MiwgeTIpIHtcbiAgICAgICAgdmFyIGdyYWQgPSB0aGlzLl9fY3JlYXRlRWxlbWVudChcImxpbmVhckdyYWRpZW50XCIsIHtcbiAgICAgICAgICAgIGlkIDogcmFuZG9tU3RyaW5nKHRoaXMuX19pZHMpLFxuICAgICAgICAgICAgeDEgOiB4MStcInB4XCIsXG4gICAgICAgICAgICB4MiA6IHgyK1wicHhcIixcbiAgICAgICAgICAgIHkxIDogeTErXCJweFwiLFxuICAgICAgICAgICAgeTIgOiB5MitcInB4XCIsXG4gICAgICAgICAgICBcImdyYWRpZW50VW5pdHNcIiA6IFwidXNlclNwYWNlT25Vc2VcIlxuICAgICAgICB9LCBmYWxzZSk7XG4gICAgICAgIHRoaXMuX19kZWZzLmFwcGVuZENoaWxkKGdyYWQpO1xuICAgICAgICByZXR1cm4gbmV3IENhbnZhc0dyYWRpZW50KGdyYWQsIHRoaXMpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgcmFkaWFsIGdyYWRpZW50IHRvIGEgZGVmcyB0YWcuXG4gICAgICogUmV0dXJucyBhIGNhbnZhcyBncmFkaWVudCBvYmplY3QgdGhhdCBoYXMgYSByZWZlcmVuY2UgdG8gaXQncyBwYXJlbnQgZGVmXG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5jcmVhdGVSYWRpYWxHcmFkaWVudCA9IGZ1bmN0aW9uICh4MCwgeTAsIHIwLCB4MSwgeTEsIHIxKSB7XG4gICAgICAgIHZhciBncmFkID0gdGhpcy5fX2NyZWF0ZUVsZW1lbnQoXCJyYWRpYWxHcmFkaWVudFwiLCB7XG4gICAgICAgICAgICBpZCA6IHJhbmRvbVN0cmluZyh0aGlzLl9faWRzKSxcbiAgICAgICAgICAgIGN4IDogeDErXCJweFwiLFxuICAgICAgICAgICAgY3kgOiB5MStcInB4XCIsXG4gICAgICAgICAgICByICA6IHIxK1wicHhcIixcbiAgICAgICAgICAgIGZ4IDogeDArXCJweFwiLFxuICAgICAgICAgICAgZnkgOiB5MCtcInB4XCIsXG4gICAgICAgICAgICBcImdyYWRpZW50VW5pdHNcIiA6IFwidXNlclNwYWNlT25Vc2VcIlxuICAgICAgICB9LCBmYWxzZSk7XG4gICAgICAgIHRoaXMuX19kZWZzLmFwcGVuZENoaWxkKGdyYWQpO1xuICAgICAgICByZXR1cm4gbmV3IENhbnZhc0dyYWRpZW50KGdyYWQsIHRoaXMpO1xuXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFBhcnNlcyB0aGUgZm9udCBzdHJpbmcgYW5kIHJldHVybnMgc3ZnIG1hcHBpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuX19wYXJzZUZvbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByZWdleCA9IC9eXFxzKig/PSg/Oig/OlstYS16XStcXHMqKXswLDJ9KGl0YWxpY3xvYmxpcXVlKSk/KSg/PSg/Oig/OlstYS16XStcXHMqKXswLDJ9KHNtYWxsLWNhcHMpKT8pKD89KD86KD86Wy1hLXpdK1xccyopezAsMn0oYm9sZCg/OmVyKT98bGlnaHRlcnxbMS05XTAwKSk/KSg/Oig/Om5vcm1hbHxcXDF8XFwyfFxcMylcXHMqKXswLDN9KCg/Onh4Py0pPyg/OnNtYWxsfGxhcmdlKXxtZWRpdW18c21hbGxlcnxsYXJnZXJ8Wy5cXGRdKyg/OlxcJXxpbnxbY2VtXW18ZXh8cFtjdHhdKSkoPzpcXHMqXFwvXFxzKihub3JtYWx8Wy5cXGRdKyg/OlxcJXxpbnxbY2VtXW18ZXh8cFtjdHhdKSkpP1xccyooWy0sXFwnXFxcIlxcc2EtejAtOV0rPylcXHMqJC9pO1xuICAgICAgICB2YXIgZm9udFBhcnQgPSByZWdleC5leGVjKCB0aGlzLmZvbnQgKTtcbiAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgICBzdHlsZSA6IGZvbnRQYXJ0WzFdIHx8ICdub3JtYWwnLFxuICAgICAgICAgICAgc2l6ZSA6IGZvbnRQYXJ0WzRdIHx8ICcxMHB4JyxcbiAgICAgICAgICAgIGZhbWlseSA6IGZvbnRQYXJ0WzZdIHx8ICdzYW5zLXNlcmlmJyxcbiAgICAgICAgICAgIHdlaWdodDogZm9udFBhcnRbM10gfHwgJ25vcm1hbCcsXG4gICAgICAgICAgICBkZWNvcmF0aW9uIDogZm9udFBhcnRbMl0gfHwgJ25vcm1hbCcsXG4gICAgICAgICAgICBocmVmIDogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vY2FudmFzIGRvZXNuJ3Qgc3VwcG9ydCB1bmRlcmxpbmUgbmF0aXZlbHksIGJ1dCB3ZSBjYW4gcGFzcyB0aGlzIGF0dHJpYnV0ZVxuICAgICAgICBpZiAodGhpcy5fX2ZvbnRVbmRlcmxpbmUgPT09IFwidW5kZXJsaW5lXCIpIHtcbiAgICAgICAgICAgIGRhdGEuZGVjb3JhdGlvbiA9IFwidW5kZXJsaW5lXCI7XG4gICAgICAgIH1cblxuICAgICAgICAvL2NhbnZhcyBhbHNvIGRvZXNuJ3Qgc3VwcG9ydCBsaW5raW5nLCBidXQgd2UgY2FuIHBhc3MgdGhpcyBhcyB3ZWxsXG4gICAgICAgIGlmICh0aGlzLl9fZm9udEhyZWYpIHtcbiAgICAgICAgICAgIGRhdGEuaHJlZiA9IHRoaXMuX19mb250SHJlZjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBIZWxwZXIgdG8gbGluayB0ZXh0IGZyYWdtZW50c1xuICAgICAqIEBwYXJhbSBmb250XG4gICAgICogQHBhcmFtIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5fX3dyYXBUZXh0TGluayA9IGZ1bmN0aW9uIChmb250LCBlbGVtZW50KSB7XG4gICAgICAgIGlmIChmb250LmhyZWYpIHtcbiAgICAgICAgICAgIHZhciBhID0gdGhpcy5fX2NyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgICAgICAgICAgYS5zZXRBdHRyaWJ1dGVOUyhcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiwgXCJ4bGluazpocmVmXCIsIGZvbnQuaHJlZik7XG4gICAgICAgICAgICBhLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgICAgICAgICAgcmV0dXJuIGE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEZpbGxzIG9yIHN0cm9rZXMgdGV4dFxuICAgICAqIEBwYXJhbSB0ZXh0XG4gICAgICogQHBhcmFtIHhcbiAgICAgKiBAcGFyYW0geVxuICAgICAqIEBwYXJhbSBhY3Rpb24gLSBzdHJva2Ugb3IgZmlsbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5fX2FwcGx5VGV4dCA9IGZ1bmN0aW9uICh0ZXh0LCB4LCB5LCBhY3Rpb24pIHtcbiAgICAgICAgdmFyIGZvbnQgPSB0aGlzLl9fcGFyc2VGb250KCksXG4gICAgICAgICAgICBwYXJlbnQgPSB0aGlzLl9fY2xvc2VzdEdyb3VwT3JTdmcoKSxcbiAgICAgICAgICAgIHRleHRFbGVtZW50ID0gdGhpcy5fX2NyZWF0ZUVsZW1lbnQoXCJ0ZXh0XCIsIHtcbiAgICAgICAgICAgICAgICBcImZvbnQtZmFtaWx5XCIgOiBmb250LmZhbWlseSxcbiAgICAgICAgICAgICAgICBcImZvbnQtc2l6ZVwiIDogZm9udC5zaXplLFxuICAgICAgICAgICAgICAgIFwiZm9udC1zdHlsZVwiIDogZm9udC5zdHlsZSxcbiAgICAgICAgICAgICAgICBcImZvbnQtd2VpZ2h0XCIgOiBmb250LndlaWdodCxcbiAgICAgICAgICAgICAgICBcInRleHQtZGVjb3JhdGlvblwiIDogZm9udC5kZWNvcmF0aW9uLFxuICAgICAgICAgICAgICAgIFwieFwiIDogeCxcbiAgICAgICAgICAgICAgICBcInlcIiA6IHksXG4gICAgICAgICAgICAgICAgXCJ0ZXh0LWFuY2hvclwiOiBnZXRUZXh0QW5jaG9yKHRoaXMudGV4dEFsaWduKSxcbiAgICAgICAgICAgICAgICBcImRvbWluYW50LWJhc2VsaW5lXCI6IGdldERvbWluYW50QmFzZWxpbmUodGhpcy50ZXh0QmFzZWxpbmUpXG4gICAgICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICB0ZXh0RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9fZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCkpO1xuICAgICAgICB0aGlzLl9fY3VycmVudEVsZW1lbnQgPSB0ZXh0RWxlbWVudDtcbiAgICAgICAgdGhpcy5fX2FwcGx5U3R5bGVUb0N1cnJlbnRFbGVtZW50KGFjdGlvbik7XG4gICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZCh0aGlzLl9fd3JhcFRleHRMaW5rKGZvbnQsdGV4dEVsZW1lbnQpKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHRleHQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB0ZXh0XG4gICAgICogQHBhcmFtIHhcbiAgICAgKiBAcGFyYW0geVxuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuZmlsbFRleHQgPSBmdW5jdGlvbiAodGV4dCwgeCwgeSkge1xuICAgICAgICB0aGlzLl9fYXBwbHlUZXh0KHRleHQsIHgsIHksIFwiZmlsbFwiKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU3Ryb2tlcyB0ZXh0XG4gICAgICogQHBhcmFtIHRleHRcbiAgICAgKiBAcGFyYW0geFxuICAgICAqIEBwYXJhbSB5XG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5zdHJva2VUZXh0ID0gZnVuY3Rpb24gKHRleHQsIHgsIHkpIHtcbiAgICAgICAgdGhpcy5fX2FwcGx5VGV4dCh0ZXh0LCB4LCB5LCBcInN0cm9rZVwiKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTm8gbmVlZCB0byBpbXBsZW1lbnQgdGhpcyBmb3Igc3ZnLlxuICAgICAqIEBwYXJhbSB0ZXh0XG4gICAgICogQHJldHVybiB7VGV4dE1ldHJpY3N9XG4gICAgICovXG4gICAgY3R4LnByb3RvdHlwZS5tZWFzdXJlVGV4dCA9IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgICAgIHRoaXMuX19jdHguZm9udCA9IHRoaXMuZm9udDtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19jdHgubWVhc3VyZVRleHQodGV4dCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqICBBcmMgY29tbWFuZCFcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLmFyYyA9IGZ1bmN0aW9uICh4LCB5LCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBjb3VudGVyQ2xvY2t3aXNlKSB7XG4gICAgICAgIC8vIGluIGNhbnZhcyBubyBjaXJjbGUgaXMgZHJhd24gaWYgbm8gYW5nbGUgaXMgcHJvdmlkZWQuXG4gICAgICAgIGlmIChzdGFydEFuZ2xlID09PSBlbmRBbmdsZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHN0YXJ0QW5nbGUgPSBzdGFydEFuZ2xlICUgKDIqTWF0aC5QSSk7XG4gICAgICAgIGVuZEFuZ2xlID0gZW5kQW5nbGUgJSAoMipNYXRoLlBJKTtcbiAgICAgICAgaWYgKHN0YXJ0QW5nbGUgPT09IGVuZEFuZ2xlKSB7XG4gICAgICAgICAgICAvL2NpcmNsZSB0aW1lISBzdWJ0cmFjdCBzb21lIG9mIHRoZSBhbmdsZSBzbyBzdmcgaXMgaGFwcHkgKHN2ZyBlbGxpcHRpY2FsIGFyYyBjYW4ndCBkcmF3IGEgZnVsbCBjaXJjbGUpXG4gICAgICAgICAgICBlbmRBbmdsZSA9ICgoZW5kQW5nbGUgKyAoMipNYXRoLlBJKSkgLSAwLjAwMSAqIChjb3VudGVyQ2xvY2t3aXNlID8gLTEgOiAxKSkgJSAoMipNYXRoLlBJKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZW5kWCA9IHgrcmFkaXVzKk1hdGguY29zKGVuZEFuZ2xlKSxcbiAgICAgICAgICAgIGVuZFkgPSB5K3JhZGl1cypNYXRoLnNpbihlbmRBbmdsZSksXG4gICAgICAgICAgICBzdGFydFggPSB4K3JhZGl1cypNYXRoLmNvcyhzdGFydEFuZ2xlKSxcbiAgICAgICAgICAgIHN0YXJ0WSA9IHkrcmFkaXVzKk1hdGguc2luKHN0YXJ0QW5nbGUpLFxuICAgICAgICAgICAgc3dlZXBGbGFnID0gY291bnRlckNsb2Nrd2lzZSA/IDAgOiAxLFxuICAgICAgICAgICAgbGFyZ2VBcmNGbGFnID0gMCxcbiAgICAgICAgICAgIGRpZmYgPSBlbmRBbmdsZSAtIHN0YXJ0QW5nbGU7XG5cbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2dsaWZmeS9jYW52YXMyc3ZnL2lzc3Vlcy80XG4gICAgICAgIGlmIChkaWZmIDwgMCkge1xuICAgICAgICAgICAgZGlmZiArPSAyKk1hdGguUEk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY291bnRlckNsb2Nrd2lzZSkge1xuICAgICAgICAgICAgbGFyZ2VBcmNGbGFnID0gZGlmZiA+IE1hdGguUEkgPyAwIDogMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxhcmdlQXJjRmxhZyA9IGRpZmYgPiBNYXRoLlBJID8gMSA6IDA7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxpbmVUbyhzdGFydFgsIHN0YXJ0WSk7XG4gICAgICAgIHRoaXMuX19hZGRQYXRoQ29tbWFuZChmb3JtYXQoXCJBIHtyeH0ge3J5fSB7eEF4aXNSb3RhdGlvbn0ge2xhcmdlQXJjRmxhZ30ge3N3ZWVwRmxhZ30ge2VuZFh9IHtlbmRZfVwiLFxuICAgICAgICAgICAge3J4OnJhZGl1cywgcnk6cmFkaXVzLCB4QXhpc1JvdGF0aW9uOjAsIGxhcmdlQXJjRmxhZzpsYXJnZUFyY0ZsYWcsIHN3ZWVwRmxhZzpzd2VlcEZsYWcsIGVuZFg6ZW5kWCwgZW5kWTplbmRZfSkpO1xuXG4gICAgICAgIHRoaXMuX19jdXJyZW50UG9zaXRpb24gPSB7eDogZW5kWCwgeTogZW5kWX07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlcyBhIENsaXBQYXRoIGZyb20gdGhlIGNsaXAgY29tbWFuZC5cbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLmNsaXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBncm91cCA9IHRoaXMuX19jbG9zZXN0R3JvdXBPclN2ZygpLFxuICAgICAgICAgICAgY2xpcFBhdGggPSB0aGlzLl9fY3JlYXRlRWxlbWVudChcImNsaXBQYXRoXCIpLFxuICAgICAgICAgICAgaWQgPSAgcmFuZG9tU3RyaW5nKHRoaXMuX19pZHMpLFxuICAgICAgICAgICAgbmV3R3JvdXAgPSB0aGlzLl9fY3JlYXRlRWxlbWVudChcImdcIik7XG5cbiAgICAgICAgdGhpcy5fX2FwcGx5Q3VycmVudERlZmF1bHRQYXRoKCk7XG4gICAgICAgIGdyb3VwLnJlbW92ZUNoaWxkKHRoaXMuX19jdXJyZW50RWxlbWVudCk7XG4gICAgICAgIGNsaXBQYXRoLnNldEF0dHJpYnV0ZShcImlkXCIsIGlkKTtcbiAgICAgICAgY2xpcFBhdGguYXBwZW5kQ2hpbGQodGhpcy5fX2N1cnJlbnRFbGVtZW50KTtcblxuICAgICAgICB0aGlzLl9fZGVmcy5hcHBlbmRDaGlsZChjbGlwUGF0aCk7XG5cbiAgICAgICAgLy9zZXQgdGhlIGNsaXAgcGF0aCB0byB0aGlzIGdyb3VwXG4gICAgICAgIGdyb3VwLnNldEF0dHJpYnV0ZShcImNsaXAtcGF0aFwiLCBmb3JtYXQoXCJ1cmwoI3tpZH0pXCIsIHtpZDppZH0pKTtcblxuICAgICAgICAvL2NsaXAgcGF0aHMgY2FuIGJlIHNjYWxlZCBhbmQgdHJhbnNmb3JtZWQsIHdlIG5lZWQgdG8gYWRkIGFub3RoZXIgd3JhcHBlciBncm91cCB0byBhdm9pZCBsYXRlciB0cmFuc2Zvcm1hdGlvbnNcbiAgICAgICAgLy8gdG8gdGhpcyBwYXRoXG4gICAgICAgIGdyb3VwLmFwcGVuZENoaWxkKG5ld0dyb3VwKTtcblxuICAgICAgICB0aGlzLl9fY3VycmVudEVsZW1lbnQgPSBuZXdHcm91cDtcblxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEcmF3cyBhIGNhbnZhcywgaW1hZ2Ugb3IgbW9jayBjb250ZXh0IHRvIHRoaXMgY2FudmFzLlxuICAgICAqIE5vdGUgdGhhdCBhbGwgc3ZnIGRvbSBtYW5pcHVsYXRpb24gdXNlcyBub2RlLmNoaWxkTm9kZXMgcmF0aGVyIHRoYW4gbm9kZS5jaGlsZHJlbiBmb3IgSUUgc3VwcG9ydC5cbiAgICAgKiBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS90aGUtY2FudmFzLWVsZW1lbnQuaHRtbCNkb20tY29udGV4dC0yZC1kcmF3aW1hZ2VcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLmRyYXdJbWFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9jb252ZXJ0IGFyZ3VtZW50cyB0byBhIHJlYWwgYXJyYXlcbiAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLFxuICAgICAgICAgICAgaW1hZ2U9YXJnc1swXSxcbiAgICAgICAgICAgIGR4LCBkeSwgZHcsIGRoLCBzeD0wLCBzeT0wLCBzdywgc2gsIHBhcmVudCwgc3ZnLCBkZWZzLCBncm91cCxcbiAgICAgICAgICAgIGN1cnJlbnRFbGVtZW50LCBzdmdJbWFnZSwgY2FudmFzLCBjb250ZXh0LCBpZDtcblxuICAgICAgICBpZiAoYXJncy5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgIGR4ID0gYXJnc1sxXTtcbiAgICAgICAgICAgIGR5ID0gYXJnc1syXTtcbiAgICAgICAgICAgIHN3ID0gaW1hZ2Uud2lkdGg7XG4gICAgICAgICAgICBzaCA9IGltYWdlLmhlaWdodDtcbiAgICAgICAgICAgIGR3ID0gc3c7XG4gICAgICAgICAgICBkaCA9IHNoO1xuICAgICAgICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09PSA1KSB7XG4gICAgICAgICAgICBkeCA9IGFyZ3NbMV07XG4gICAgICAgICAgICBkeSA9IGFyZ3NbMl07XG4gICAgICAgICAgICBkdyA9IGFyZ3NbM107XG4gICAgICAgICAgICBkaCA9IGFyZ3NbNF07XG4gICAgICAgICAgICBzdyA9IGltYWdlLndpZHRoO1xuICAgICAgICAgICAgc2ggPSBpbWFnZS5oZWlnaHQ7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJncy5sZW5ndGggPT09IDkpIHtcbiAgICAgICAgICAgIHN4ID0gYXJnc1sxXTtcbiAgICAgICAgICAgIHN5ID0gYXJnc1syXTtcbiAgICAgICAgICAgIHN3ID0gYXJnc1szXTtcbiAgICAgICAgICAgIHNoID0gYXJnc1s0XTtcbiAgICAgICAgICAgIGR4ID0gYXJnc1s1XTtcbiAgICAgICAgICAgIGR5ID0gYXJnc1s2XTtcbiAgICAgICAgICAgIGR3ID0gYXJnc1s3XTtcbiAgICAgICAgICAgIGRoID0gYXJnc1s4XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkluYXZsaWQgbnVtYmVyIG9mIGFyZ3VtZW50cyBwYXNzZWQgdG8gZHJhd0ltYWdlOiBcIiArIGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcGFyZW50ID0gdGhpcy5fX2Nsb3Nlc3RHcm91cE9yU3ZnKCk7XG4gICAgICAgIGN1cnJlbnRFbGVtZW50ID0gdGhpcy5fX2N1cnJlbnRFbGVtZW50O1xuICAgICAgICB2YXIgdHJhbnNsYXRlRGlyZWN0aXZlID0gXCJ0cmFuc2xhdGUoXCIgKyBkeCArIFwiLCBcIiArIGR5ICsgXCIpXCI7XG4gICAgICAgIGlmIChpbWFnZSBpbnN0YW5jZW9mIGN0eCkge1xuICAgICAgICAgICAgLy9jYW52YXMyc3ZnIG1vY2sgY2FudmFzIGNvbnRleHQuIEluIHRoZSBmdXR1cmUgd2UgbWF5IHdhbnQgdG8gY2xvbmUgbm9kZXMgaW5zdGVhZC5cbiAgICAgICAgICAgIC8vYWxzbyBJJ20gY3VycmVudGx5IGlnbm9yaW5nIGR3LCBkaCwgc3csIHNoLCBzeCwgc3kgZm9yIGEgbW9jayBjb250ZXh0LlxuICAgICAgICAgICAgc3ZnID0gaW1hZ2UuZ2V0U3ZnKCkuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICAgICAgaWYgKHN2Zy5jaGlsZE5vZGVzICYmIHN2Zy5jaGlsZE5vZGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICBkZWZzID0gc3ZnLmNoaWxkTm9kZXNbMF07XG4gICAgICAgICAgICAgICAgd2hpbGUoZGVmcy5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBpZCA9IGRlZnMuY2hpbGROb2Rlc1swXS5nZXRBdHRyaWJ1dGUoXCJpZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fX2lkc1tpZF0gPSBpZDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fX2RlZnMuYXBwZW5kQ2hpbGQoZGVmcy5jaGlsZE5vZGVzWzBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZ3JvdXAgPSBzdmcuY2hpbGROb2Rlc1sxXTtcbiAgICAgICAgICAgICAgICBpZiAoZ3JvdXApIHtcbiAgICAgICAgICAgICAgICAgICAgLy9zYXZlIG9yaWdpbmFsIHRyYW5zZm9ybVxuICAgICAgICAgICAgICAgICAgICB2YXIgb3JpZ2luVHJhbnNmb3JtID0gZ3JvdXAuZ2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdHJhbnNmb3JtRGlyZWN0aXZlO1xuICAgICAgICAgICAgICAgICAgICBpZiAob3JpZ2luVHJhbnNmb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1EaXJlY3RpdmUgPSBvcmlnaW5UcmFuc2Zvcm0rXCIgXCIrdHJhbnNsYXRlRGlyZWN0aXZlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtRGlyZWN0aXZlID0gdHJhbnNsYXRlRGlyZWN0aXZlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGdyb3VwLnNldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiLCB0cmFuc2Zvcm1EaXJlY3RpdmUpO1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoZ3JvdXApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChpbWFnZS5ub2RlTmFtZSA9PT0gXCJDQU5WQVNcIiB8fCBpbWFnZS5ub2RlTmFtZSA9PT0gXCJJTUdcIikge1xuICAgICAgICAgICAgLy9jYW52YXMgb3IgaW1hZ2VcbiAgICAgICAgICAgIHN2Z0ltYWdlID0gdGhpcy5fX2NyZWF0ZUVsZW1lbnQoXCJpbWFnZVwiKTtcbiAgICAgICAgICAgIHN2Z0ltYWdlLnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIGR3KTtcbiAgICAgICAgICAgIHN2Z0ltYWdlLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBkaCk7XG4gICAgICAgICAgICBzdmdJbWFnZS5zZXRBdHRyaWJ1dGUoXCJvcGFjaXR5XCIsIHRoaXMuZ2xvYmFsQWxwaGEpO1xuICAgICAgICAgICAgc3ZnSW1hZ2Uuc2V0QXR0cmlidXRlKFwicHJlc2VydmVBc3BlY3RSYXRpb1wiLCBcIm5vbmVcIik7XG5cbiAgICAgICAgICAgIGlmIChzeCB8fCBzeSB8fCBzdyAhPT0gaW1hZ2Uud2lkdGggfHwgc2ggIT09IGltYWdlLmhlaWdodCkge1xuICAgICAgICAgICAgICAgIC8vY3JvcCB0aGUgaW1hZ2UgdXNpbmcgYSB0ZW1wb3JhcnkgY2FudmFzXG4gICAgICAgICAgICAgICAgY2FudmFzID0gdGhpcy5fX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG4gICAgICAgICAgICAgICAgY2FudmFzLndpZHRoID0gZHc7XG4gICAgICAgICAgICAgICAgY2FudmFzLmhlaWdodCA9IGRoO1xuICAgICAgICAgICAgICAgIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGltYWdlLCBzeCwgc3ksIHN3LCBzaCwgMCwgMCwgZHcsIGRoKTtcbiAgICAgICAgICAgICAgICBpbWFnZSA9IGNhbnZhcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN2Z0ltYWdlLnNldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiLCB0cmFuc2xhdGVEaXJlY3RpdmUpO1xuICAgICAgICAgICAgc3ZnSW1hZ2Uuc2V0QXR0cmlidXRlTlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIsIFwieGxpbms6aHJlZlwiLFxuICAgICAgICAgICAgICAgIGltYWdlLm5vZGVOYW1lID09PSBcIkNBTlZBU1wiID8gaW1hZ2UudG9EYXRhVVJMKCkgOiBpbWFnZS5nZXRBdHRyaWJ1dGUoXCJzcmNcIikpO1xuICAgICAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKHN2Z0ltYWdlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZXMgYSBwYXR0ZXJuIHRhZ1xuICAgICAqL1xuICAgIGN0eC5wcm90b3R5cGUuY3JlYXRlUGF0dGVybiA9IGZ1bmN0aW9uIChpbWFnZSwgcmVwZXRpdGlvbikge1xuICAgICAgICB2YXIgcGF0dGVybiA9IHRoaXMuX19kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInBhdHRlcm5cIiksIGlkID0gcmFuZG9tU3RyaW5nKHRoaXMuX19pZHMpLFxuICAgICAgICAgICAgaW1nO1xuICAgICAgICBwYXR0ZXJuLnNldEF0dHJpYnV0ZShcImlkXCIsIGlkKTtcbiAgICAgICAgcGF0dGVybi5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBpbWFnZS53aWR0aCk7XG4gICAgICAgIHBhdHRlcm4uc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIGltYWdlLmhlaWdodCk7XG4gICAgICAgIGlmIChpbWFnZS5ub2RlTmFtZSA9PT0gXCJDQU5WQVNcIiB8fCBpbWFnZS5ub2RlTmFtZSA9PT0gXCJJTUdcIikge1xuICAgICAgICAgICAgaW1nID0gdGhpcy5fX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwiaW1hZ2VcIik7XG4gICAgICAgICAgICBpbWcuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgaW1hZ2Uud2lkdGgpO1xuICAgICAgICAgICAgaW1nLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBpbWFnZS5oZWlnaHQpO1xuICAgICAgICAgICAgaW1nLnNldEF0dHJpYnV0ZU5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiLCBcInhsaW5rOmhyZWZcIixcbiAgICAgICAgICAgICAgICBpbWFnZS5ub2RlTmFtZSA9PT0gXCJDQU5WQVNcIiA/IGltYWdlLnRvRGF0YVVSTCgpIDogaW1hZ2UuZ2V0QXR0cmlidXRlKFwic3JjXCIpKTtcbiAgICAgICAgICAgIHBhdHRlcm4uYXBwZW5kQ2hpbGQoaW1nKTtcbiAgICAgICAgICAgIHRoaXMuX19kZWZzLmFwcGVuZENoaWxkKHBhdHRlcm4pO1xuICAgICAgICB9IGVsc2UgaWYgKGltYWdlIGluc3RhbmNlb2YgY3R4KSB7XG4gICAgICAgICAgICBwYXR0ZXJuLmFwcGVuZENoaWxkKGltYWdlLl9fcm9vdC5jaGlsZE5vZGVzWzFdKTtcbiAgICAgICAgICAgIHRoaXMuX19kZWZzLmFwcGVuZENoaWxkKHBhdHRlcm4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgQ2FudmFzUGF0dGVybihwYXR0ZXJuLCB0aGlzKTtcbiAgICB9O1xuXG4gICAgY3R4LnByb3RvdHlwZS5zZXRMaW5lRGFzaCA9IGZ1bmN0aW9uIChkYXNoQXJyYXkpIHtcbiAgICAgICAgaWYgKGRhc2hBcnJheSAmJiBkYXNoQXJyYXkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5saW5lRGFzaCA9IGRhc2hBcnJheS5qb2luKFwiLFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubGluZURhc2ggPSBudWxsO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE5vdCB5ZXQgaW1wbGVtZW50ZWRcbiAgICAgKi9cbiAgICBjdHgucHJvdG90eXBlLmRyYXdGb2N1c1JpbmcgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICBjdHgucHJvdG90eXBlLmNyZWF0ZUltYWdlRGF0YSA9IGZ1bmN0aW9uICgpIHt9O1xuICAgIGN0eC5wcm90b3R5cGUuZ2V0SW1hZ2VEYXRhID0gZnVuY3Rpb24gKCkge307XG4gICAgY3R4LnByb3RvdHlwZS5wdXRJbWFnZURhdGEgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICBjdHgucHJvdG90eXBlLmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9IGZ1bmN0aW9uICgpIHt9O1xuICAgIGN0eC5wcm90b3R5cGUuc2V0VHJhbnNmb3JtID0gZnVuY3Rpb24gKCkge307XG5cbiAgICAvL2FkZCBvcHRpb25zIGZvciBhbHRlcm5hdGl2ZSBuYW1lc3BhY2VcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB3aW5kb3cuQzJTID0gY3R4O1xuICAgIH1cblxuICAgIC8vIENvbW1vbkpTL0Jyb3dzZXJpZnlcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBjdHg7XG4gICAgfVxuXG59KCkpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NhbnZhczJzdmcvY2FudmFzMnN2Zy5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9