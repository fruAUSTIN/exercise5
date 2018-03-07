/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
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
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	// Require module
	__webpack_require__(1);
	__webpack_require__(3);
	__webpack_require__(19);
	
	var oTabs = window.oTabs = __webpack_require__(25);
	
	//const oExpanderObjects = window.oExpanderObjects = oExpander.init(document.body, {})
	
	var tabsObjects = window.tabsObjects = oTabs.init(document.body, {
		disablefocus: false
	});
	
	// Wait until the page has loaded
	if (document.readyState === 'interactive' || document.readyState === 'complete') {
		document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
	}
	document.addEventListener('DOMContentLoaded', function () {
		// Dispatch a custom event that will tell all required modules to initialise
		document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
	});

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(2);

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	var define = false;
	
	/*global module*/
	
	/**
	 * Detect IE 8 through injected conditional comments:
	 * no UA detection, no need for conditional compilation or JS check
	 * @return {Bool} true if the browser is IE 8
	 */
	var isIE8 = (function () {
		var b = document.createElement('B');
		var docElem = document.documentElement;
		var isIE = undefined;
	
		b.innerHTML = '<!--[if IE 8]><b id="ie8test"></b><![endif]-->';
		docElem.appendChild(b);
		isIE = !!document.getElementById('ie8test');
		docElem.removeChild(b);
		return isIE;
	})();
	
	/**
	 * Grab grid properties
	 * @return {Object} layout names and gutter widths
	 */
	function getGridProperties() {
		return getGridFromDoc('after');
	}
	
	/**
	 * Get all layout sizes
	 * @return {Object} layout names and sizes
	 */
	function getGridBreakpoints() {
		return getGridFromDoc('before');
	}
	
	/**
	 * Grab grid properties surfaced in html:after and html:before's content
	 * @param {String} position Whether to get all properties in :before, or current properties in :after
	 * @return {Object} layout names and gutter widths
	 */
	function getGridFromDoc(position) {
		// Contained in a try/catch as it should not error if o-grid styles are not (deliberately or accidentally) loaded
		// e.g. o-tracking will always try to read this property, but the page is not obliged to use o-grid for layout
		try {
			var gridProperties = window.getComputedStyle(document.documentElement, ':' + position).getPropertyValue('content');
			// Firefox computes: "{\"foo\": \"bar\"}"
			// We want readable JSON: {"foo": "bar"}
			gridProperties = gridProperties.replace(/'/g, '').replace(/\\/g, '').replace(/^"/, '').replace(/"$/, '');
			return JSON.parse(gridProperties);
		} catch (e) {
			return {};
		}
	}
	
	/**
	 * Grab the current layout
	 * @return {String} Layout name
	 */
	function getCurrentLayout() {
		if (isIE8) {
			return 'L';
		}
	
		return getGridProperties().layout;
	}
	
	/**
	 * Grab the current space between columns
	 * @return {String} Gutter width in pixels
	 */
	function getCurrentGutter() {
		if (isIE8) {
			return '20px';
		}
	
		return getGridProperties().gutter;
	}
	
	/**
	 * This sets MediaQueryListeners on all the o-grid breakpoints
	 * and fires a `o-grid.layoutChange` event on layout change.
	 */
	function enableLayoutChangeEvents() {
		// Create a map containing all breakpoints exposed via html:before
		var gridLayouts = getGridBreakpoints();
		if (gridLayouts.hasOwnProperty('layouts')) {
			(function () {
				var layouts = gridLayouts.layouts;
				var breakpoints = new Map(Object.keys(layouts).map(function (key) {
					return [key, layouts[key]];
				}));
				var decr1 = function decr1(val) {
					return Number(val.replace('px', '') - 1) + 'px';
				};
	
				// Generate media queries for each
				breakpoints.forEach(function (width, size) {
					var queries = [];
					if (size === 'S') {
						queries.push('(max-width: ' + width + ')');
						queries.push('(min-width: ' + width + ') and (max-width: ' + decr1(breakpoints.get('M')) + ')');
					} else if (size === 'M') {
						queries.push('(min-width: ' + width + ') and (max-width: ' + decr1(breakpoints.get('L')) + ')');
					} else if (size === 'L') {
						queries.push('(min-width: ' + width + ') and (max-width: ' + decr1(breakpoints.get('XL')) + ')');
					} else if (size === 'XL') {
						queries.push('(min-width: ' + width + ')');
					}
	
					// matchMedia listener handler: Dispatch `o-grid.layoutChange` event if a match
					var handleMQChange = function handleMQChange(mql) {
						if (mql.matches) {
							window.dispatchEvent(new CustomEvent('o-grid.layoutChange', {
								detail: {
									layout: size
								}
							}));
						}
					};
	
					// Create a new listener for each layout
					queries.forEach(function (mq) {
						var mql = window.matchMedia(mq);
						mql.addListener(handleMQChange);
						handleMQChange(mql);
					});
				});
			})();
		} else {
			console.error('To enable grid layout change events, include oGridSurfaceLayoutSizes in your Sass');
		}
	}
	
	exports['default'] = {
		getCurrentLayout: getCurrentLayout,
		getCurrentGutter: getCurrentGutter,
		getGridBreakpoints: getGridBreakpoints,
		enableLayoutChangeEvents: enableLayoutChangeEvents
	};
	module.exports = exports['default'];

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(4);

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	/*global require,module*/
	
	var oHierarchicalNav = __webpack_require__(5);
	var constructAll = function constructAll() {
		oHierarchicalNav.init();
		document.removeEventListener('o.DOMContentLoaded', constructAll);
	};
	document.addEventListener('o.DOMContentLoaded', constructAll);
	
	module.exports = oHierarchicalNav;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	/*global require,module,document,HTMLElement*/
	
	var SquishyList = __webpack_require__(6);
	var DomDelegate = __webpack_require__(8);
	var oViewport = __webpack_require__(10);
	var Nav = __webpack_require__(15);
	
	function ResponsiveNav(rootEl) {
	
		var rootDelegate = undefined;
		var nav = undefined;
		var contentFilterEl = undefined;
		var contentFilter = undefined;
		var moreEl = undefined;
		var moreListEl = undefined;
		var clonedIdPrefix = 'o-hierarchical-nav__cloned-id-';
		var prefixedNodes = [];
	
		// Check if element is a controller of another DOM element
		function isMegaDropdownControl(el) {
			return el && el.hasAttribute('aria-controls');
		}
	
		// On resize, apply o-squishy-list, and, if it has a sub-level dom, populate more list
		function resize() {
			nav.resize();
	
			if (contentFilter) {
				contentFilter.squish();
				if (!isMegaDropdownControl(moreEl)) {
					populateMoreList(contentFilter.getHiddenItems());
				}
			}
		}
	
		// Empty the more list
		function emptyMoreList() {
			if (moreListEl) {
				moreListEl.innerHTML = '';
			}
		}
	
		// Get the information from the element and create a new li tag with the element's text to append more list
		function addItemToMoreList(text, href) {
			var itemEl = document.createElement('li');
			var aEl = document.createElement('a');
	
			if (typeof aEl.textContent !== 'undefined') {
				aEl.textContent = text;
			} else {
				aEl.innerText = text;
			}
	
			aEl.href = href;
			itemEl.appendChild(aEl);
			moreListEl.appendChild(itemEl);
		}
	
		function cloneItemToMoreList(el) {
			var cloneEl = el.cloneNode(true);
			// remove the attributes that are only applicable to higher level
			cloneEl.removeAttribute('data-priority');
			cloneEl.removeAttribute('aria-hidden');
			cloneEl.removeAttribute('data-o-hierarchical-nav-is-cloneable');
			// recurse through children and amend any id values to maintain uniqueness
			prefixIds(el);
	
			// increase level of nested menus
			incrementMenuDepths(cloneEl);
	
			moreListEl.appendChild(cloneEl);
		}
	
		function resetIds() {
			var nextNode = undefined;
			while (prefixedNodes.length > 0) {
				nextNode = prefixedNodes.pop();
				nextNode.setAttribute('id', nextNode.getAttribute('id').replace(clonedIdPrefix, ''));
			}
		}
	
		function incrementMenuDepths(el) {
			// data-o-hierarchical-nav-level attribute is incremented by one for each
			// of the children recursively. Modifies elements in place, assumes
			// cloned element to be passed in.
			var child = undefined;
			if (el.hasChildNodes()) {
				var children = el.childNodes;
				for (var i = 0, l = children.length; i < l; i++) {
					child = children[i];
					if (child instanceof HTMLElement) {
						if (child.hasAttribute('data-o-hierarchical-nav-level')) {
							// increment nav-level when attribute present
							var origNavLevel = parseInt(child.getAttribute('data-o-hierarchical-nav-level'), 10);
							var updatedNavLevel = (isNaN(origNavLevel) ? 0 : origNavLevel) + 1;
							child.setAttribute('data-o-hierarchical-nav-level', updatedNavLevel);
						}
						incrementMenuDepths(child);
					}
				}
			}
		}
	
		function prefixIds(el) {
			// id's are prefixed to ensure that any id based functionality uses the visible element
			// for example a 'label' tag with a 'for' attribute will not find the correct input it
			// relates to as it uses the first matching id in the document
			var child = undefined;
			if (el.hasChildNodes()) {
				var children = el.childNodes;
				for (var i = 0, l = children.length; i < l; i++) {
					child = children[i];
					if (child instanceof HTMLElement) {
						if (child.hasAttribute('id')) {
							prefixedNodes.push(child); // store to make the cleanup more performant
							child.setAttribute('id', clonedIdPrefix + child.getAttribute('id'));
						}
						prefixIds(child);
					}
				}
			}
		}
	
		// For every hidden item, add it to the more list
		function populateMoreList(hiddenEls) {
			emptyMoreList();
			resetIds();
	
			for (var c = 0, l = hiddenEls.length; c < l; c++) {
				var aEl = hiddenEls[c].querySelector('a');
				var ulEl = hiddenEls[c].querySelector('ul');
	
				if (hiddenEls[c].hasAttribute('data-o-hierarchical-nav-is-cloneable')) {
					cloneItemToMoreList(hiddenEls[c]);
				} else {
					var aText = typeof aEl.textContent !== 'undefined' ? aEl.textContent : aEl.innerText;
					addItemToMoreList(aText, aEl.href, ulEl);
				}
			}
		}
	
		// If all elements are hidden, add the all modifier, if not, the some modifier
		function setMoreElClass(remainingItems) {
			if (!moreEl) {
				return;
			}
	
			if (remainingItems === 0) {
				moreEl.classList.add('o-hierarchical-nav__more--all');
				moreEl.classList.remove('o-hierarchical-nav__more--some');
			} else {
				moreEl.classList.add('o-hierarchical-nav__more--some');
				moreEl.classList.remove('o-hierarchical-nav__more--all');
			}
		}
	
		// When there's an o-squishy-list change, collapse all elements and run the setMoreElClass method with number of non-hidden elements
		function contentFilterChangeHandler(ev) {
			if (ev.target === contentFilterEl && ev.detail.hiddenItems.length > 0) {
				nav.collapseAll();
				setMoreElClass(ev.detail.remainingItems.length);
			}
		}
	
		// If more button is clicked, populate it
		function navExpandHandler(ev) {
			if (ev.target === moreEl) {
				populateMoreList(contentFilter.getHiddenItems());
			}
		}
	
		function init() {
			if (!rootEl) {
				rootEl = document.body;
			} else if (!(rootEl instanceof HTMLElement)) {
				rootEl = document.querySelector(rootEl);
			}
	
			nav = new Nav(rootEl);
			rootDelegate = new DomDelegate(rootEl);
			contentFilterEl = rootEl.querySelector('ul');
			moreEl = rootEl.querySelector('[data-more]');
	
			if (contentFilterEl) {
				contentFilter = new SquishyList(contentFilterEl, { filterOnResize: false });
			}
	
			// If there's a more element, add a ul tag where hidden elements will be appended
			if (moreEl) {
				moreEl.setAttribute('aria-hidden', 'true');
	
				if (!isMegaDropdownControl(moreEl)) {
					moreListEl = document.createElement('ul');
					moreListEl.setAttribute('data-o-hierarchical-nav-level', '2');
					moreEl.appendChild(moreListEl);
					rootDelegate.on('oLayers.new', navExpandHandler);
				}
			}
	
			rootDelegate.on('oSquishyList.change', contentFilterChangeHandler);
	
			var bodyDelegate = new DomDelegate(document.body);
	
			// Force a resize when it loads, in case it loads on a smaller screen
			resize();
	
			oViewport.listenTo('resize');
			bodyDelegate.on('oViewport.resize', resize);
		}
	
		function destroy() {
			prefixedNodes = [];
			rootDelegate.destroy();
			rootEl.removeAttribute('data-o-hierarchical-nav--js');
		}
	
		init();
	
		this.resize = resize;
		this.destroy = destroy;
	}
	
	// Initializes all nav elements in the page or whatever element is passed to it
	ResponsiveNav.init = function (el) {
		if (!el) {
			el = document.body;
		} else if (!(el instanceof HTMLElement)) {
			el = document.querySelector(el);
		}
	
		var navEls = el.querySelectorAll('[data-o-component="o-hierarchical-nav"]');
		var responsiveNavs = [];
	
		for (var c = 0, l = navEls.length; c < l; c++) {
			if (!navEls[c].hasAttribute('data-o-hierarchical-nav--js')) {
				// If it's a vertical nav, we don't need all the responsive methods
				if (navEls[c].getAttribute('data-o-hierarchical-nav-orientiation') === 'vertical') {
					responsiveNavs.push(new Nav(navEls[c]));
				} else {
					responsiveNavs.push(new ResponsiveNav(navEls[c]));
				}
			}
		}
	
		return responsiveNavs;
	};
	
	module.exports = ResponsiveNav;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(7);

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
	
	var define = false;
	
	var SquishyList = (function () {
		function SquishyList(rootEl, opts) {
			_classCallCheck(this, SquishyList);
	
			this.element = rootEl;
			this.moreWidth = 0;
			this.options = opts || { filterOnResize: true };
	
			this.getPrioritySortedChildNodeEls();
			this.moreEl = this.element.querySelector('[data-more]');
			if (this.moreEl) {
				this.showEl(this.moreEl);
				this.moreWidth = this.moreEl.offsetWidth;
				this.hideEl(this.moreEl);
			}
			this.squish();
			if (this.options.filterOnResize) {
				window.addEventListener('resize', this.resizeHandler.bind(this), false);
			}
	
			this.dispatchCustomEvent('oSquishyList.ready');
		}
	
		_createClass(SquishyList, [{
			key: 'dispatchCustomEvent',
			value: function dispatchCustomEvent(name, data) {
				if (document.createEvent && this.element.dispatchEvent) {
					var _event = document.createEvent('Event');
					_event.initEvent(name, true, true);
					if (data) {
						_event.detail = data;
					}
					this.element.dispatchEvent(_event);
				}
			}
		}, {
			key: 'getItemEls',
			value: function getItemEls() {
				var itemEls = [];
				var childNodeEl = undefined;
	
				for (var c = 0, l = this.element.childNodes.length; c < l; c++) {
					childNodeEl = this.element.childNodes[c];
	
					// Make it flexible so that other product and modules can manually hide elements and o-squishy-list won't add it to it's list
					if (childNodeEl.nodeType === 1 && !childNodeEl.hasAttribute('data-more') && !childNodeEl.hasAttribute('data-o-squishy-list--ignore')) {
						itemEls.push(childNodeEl);
					}
				}
				return itemEls;
			}
		}, {
			key: 'showEl',
			value: function showEl(el) {
				// eslint-disable-line class-methods-use-this
				if (el) {
					el.removeAttribute('aria-hidden');
				}
			}
		}, {
			key: 'hideEl',
			value: function hideEl(el) {
				// eslint-disable-line class-methods-use-this
				if (el) {
					el.setAttribute('aria-hidden', 'true');
				}
			}
		}, {
			key: 'getElPriority',
			value: function getElPriority(el) {
				// eslint-disable-line class-methods-use-this
				return parseInt(el.getAttribute('data-priority'), 10);
			}
		}, {
			key: 'getPrioritySortedChildNodeEls',
			value: function getPrioritySortedChildNodeEls() {
				this.allItemEls = this.getItemEls();
				this.prioritySortedItemEls = [];
				var unprioritisedItemEls = [];
				for (var c = 0, l = this.allItemEls.length; c < l; c++) {
					var thisItemEl = this.allItemEls[c];
					var thisItemPriority = this.getElPriority(thisItemEl);
					if (isNaN(thisItemPriority)) {
						unprioritisedItemEls.push(thisItemEl);
					} else if (thisItemPriority >= 0) {
						if (!Array.isArray(this.prioritySortedItemEls[thisItemPriority])) {
							this.prioritySortedItemEls[thisItemPriority] = [];
						}
						this.prioritySortedItemEls[thisItemPriority].push(thisItemEl);
					}
				}
				if (unprioritisedItemEls.length > 0) {
					this.prioritySortedItemEls.push(unprioritisedItemEls);
				}
				this.prioritySortedItemEls = this.prioritySortedItemEls.filter(function (v) {
					return v !== undefined;
				});
			}
		}, {
			key: 'showAllItems',
			value: function showAllItems() {
				this.hiddenItemEls = [];
				for (var c = 0, l = this.allItemEls.length; c < l; c++) {
					this.showEl(this.allItemEls[c]);
				}
			}
		}, {
			key: 'hideItems',
			value: function hideItems(els) {
				// We want highest priority items to be at the beginning of the array
				for (var i = els.length - 1; i > -1; i--) {
					this.hiddenItemEls.unshift(els[i]);
					this.hideEl(els[i]);
				}
			}
		}, {
			key: 'getVisibleContentWidth',
			value: function getVisibleContentWidth() {
				var visibleItemsWidth = 0;
				for (var c = 0, l = this.allItemEls.length; c < l; c++) {
					if (!this.allItemEls[c].hasAttribute('aria-hidden')) {
						visibleItemsWidth += this.allItemEls[c].offsetWidth; // Needs to take into account margins too
					}
				}
				return visibleItemsWidth;
			}
		}, {
			key: 'doesContentFit',
			value: function doesContentFit() {
				return this.getVisibleContentWidth() <= this.element.clientWidth;
			}
		}, {
			key: 'getHiddenItems',
			value: function getHiddenItems() {
				return this.hiddenItemEls;
			}
		}, {
			key: 'getRemainingItems',
			value: function getRemainingItems() {
				var _this = this;
	
				return this.allItemEls.filter(function (el) {
					return _this.hiddenItemEls.indexOf(el) === -1;
				});
			}
		}, {
			key: 'squish',
			value: function squish() {
				this.showAllItems();
				if (this.doesContentFit()) {
					this.hideEl(this.moreEl);
				} else {
					for (var p = this.prioritySortedItemEls.length - 1; p >= 0; p--) {
						this.hideItems(this.prioritySortedItemEls[p]);
						if (this.getVisibleContentWidth() + this.moreWidth <= this.element.clientWidth) {
							this.showEl(this.moreEl);
							break;
						}
					}
				}
				this.dispatchCustomEvent('oSquishyList.change', {
					hiddenItems: this.getHiddenItems(),
					remainingItems: this.getRemainingItems()
				});
			}
		}, {
			key: 'resizeHandler',
			value: function resizeHandler() {
				clearTimeout(this.debounceTimeout);
				this.debounceTimeout = setTimeout(this.squish.bind(this), 50);
			}
		}, {
			key: 'destroy',
			value: function destroy() {
				for (var c = 0, l = this.allItemEls.length; c < l; c++) {
					this.allItemEls[c].removeAttribute('aria-hidden');
				}
				window.removeEventListener('resize', this.resizeHandler, false);
				this.element.removeAttribute('data-o-squishy-list-js');
			}
		}], [{
			key: 'init',
			value: function init(el, opts) {
				if (!el) {
					el = document.body;
				}
				if (!(el instanceof HTMLElement)) {
					el = document.querySelector(el);
				}
				if (/\bo-squishy-list\b/.test(el.getAttribute('data-o-component'))) {
					return new SquishyList(el, opts);
				}
				return [].map.call(el.querySelectorAll('[data-o-component="o-squishy-list"]'), function (el) {
					return new SquishyList(el, opts);
				});
			}
		}]);
	
		return SquishyList;
	})();
	
	exports['default'] = SquishyList;
	
	var constructAll = function constructAll() {
		SquishyList.init();
		document.removeEventListener('o.DOMContentLoaded', constructAll);
	};
	
	if (typeof window !== 'undefined') {
		document.addEventListener('o.DOMContentLoaded', constructAll);
	}
	module.exports = exports['default'];

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(9);

/***/ }),
/* 9 */
/***/ (function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	/*jshint browser:true, node:true*/
	
	'use strict';
	
	module.exports = Delegate;
	
	/**
	 * DOM event delegator
	 *
	 * The delegator will listen
	 * for events that bubble up
	 * to the root node.
	 *
	 * @constructor
	 * @param {Node|string} [root] The root node or a selector string matching the root node
	 */
	function Delegate(root) {
	
	  /**
	   * Maintain a map of listener
	   * lists, keyed by event name.
	   *
	   * @type Object
	   */
	  this.listenerMap = [{}, {}];
	  if (root) {
	    this.root(root);
	  }
	
	  /** @type function() */
	  this.handle = Delegate.prototype.handle.bind(this);
	}
	
	/**
	 * Start listening for events
	 * on the provided DOM element
	 *
	 * @param  {Node|string} [root] The root node or a selector string matching the root node
	 * @returns {Delegate} This method is chainable
	 */
	Delegate.prototype.root = function (root) {
	  var listenerMap = this.listenerMap;
	  var eventType;
	
	  // Remove master event listeners
	  if (this.rootElement) {
	    for (eventType in listenerMap[1]) {
	      if (listenerMap[1].hasOwnProperty(eventType)) {
	        this.rootElement.removeEventListener(eventType, this.handle, true);
	      }
	    }
	    for (eventType in listenerMap[0]) {
	      if (listenerMap[0].hasOwnProperty(eventType)) {
	        this.rootElement.removeEventListener(eventType, this.handle, false);
	      }
	    }
	  }
	
	  // If no root or root is not
	  // a dom node, then remove internal
	  // root reference and exit here
	  if (!root || !root.addEventListener) {
	    if (this.rootElement) {
	      delete this.rootElement;
	    }
	    return this;
	  }
	
	  /**
	   * The root node at which
	   * listeners are attached.
	   *
	   * @type Node
	   */
	  this.rootElement = root;
	
	  // Set up master event listeners
	  for (eventType in listenerMap[1]) {
	    if (listenerMap[1].hasOwnProperty(eventType)) {
	      this.rootElement.addEventListener(eventType, this.handle, true);
	    }
	  }
	  for (eventType in listenerMap[0]) {
	    if (listenerMap[0].hasOwnProperty(eventType)) {
	      this.rootElement.addEventListener(eventType, this.handle, false);
	    }
	  }
	
	  return this;
	};
	
	/**
	 * @param {string} eventType
	 * @returns boolean
	 */
	Delegate.prototype.captureForType = function (eventType) {
	  return ['blur', 'error', 'focus', 'load', 'resize', 'scroll'].indexOf(eventType) !== -1;
	};
	
	/**
	 * Attach a handler to one
	 * event for all elements
	 * that match the selector,
	 * now or in the future
	 *
	 * The handler function receives
	 * three arguments: the DOM event
	 * object, the node that matched
	 * the selector while the event
	 * was bubbling and a reference
	 * to itself. Within the handler,
	 * 'this' is equal to the second
	 * argument.
	 *
	 * The node that actually received
	 * the event can be accessed via
	 * 'event.target'.
	 *
	 * @param {string} eventType Listen for these events
	 * @param {string|undefined} selector Only handle events on elements matching this selector, if undefined match root element
	 * @param {function()} handler Handler function - event data passed here will be in event.data
	 * @param {boolean} [useCapture] see 'useCapture' in <https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener>
	 * @returns {Delegate} This method is chainable
	 */
	Delegate.prototype.on = function (eventType, selector, handler, useCapture) {
	  var root, listenerMap, matcher, matcherParam;
	
	  if (!eventType) {
	    throw new TypeError('Invalid event type: ' + eventType);
	  }
	
	  // handler can be passed as
	  // the second or third argument
	  if (typeof selector === 'function') {
	    useCapture = handler;
	    handler = selector;
	    selector = null;
	  }
	
	  // Fallback to sensible defaults
	  // if useCapture not set
	  if (useCapture === undefined) {
	    useCapture = this.captureForType(eventType);
	  }
	
	  if (typeof handler !== 'function') {
	    throw new TypeError('Handler must be a type of Function');
	  }
	
	  root = this.rootElement;
	  listenerMap = this.listenerMap[useCapture ? 1 : 0];
	
	  // Add master handler for type if not created yet
	  if (!listenerMap[eventType]) {
	    if (root) {
	      root.addEventListener(eventType, this.handle, useCapture);
	    }
	    listenerMap[eventType] = [];
	  }
	
	  if (!selector) {
	    matcherParam = null;
	
	    // COMPLEX - matchesRoot needs to have access to
	    // this.rootElement, so bind the function to this.
	    matcher = matchesRoot.bind(this);
	
	    // Compile a matcher for the given selector
	  } else if (/^[a-z]+$/i.test(selector)) {
	      matcherParam = selector;
	      matcher = matchesTag;
	    } else if (/^#[a-z0-9\-_]+$/i.test(selector)) {
	      matcherParam = selector.slice(1);
	      matcher = matchesId;
	    } else {
	      matcherParam = selector;
	      matcher = matches;
	    }
	
	  // Add to the list of listeners
	  listenerMap[eventType].push({
	    selector: selector,
	    handler: handler,
	    matcher: matcher,
	    matcherParam: matcherParam
	  });
	
	  return this;
	};
	
	/**
	 * Remove an event handler
	 * for elements that match
	 * the selector, forever
	 *
	 * @param {string} [eventType] Remove handlers for events matching this type, considering the other parameters
	 * @param {string} [selector] If this parameter is omitted, only handlers which match the other two will be removed
	 * @param {function()} [handler] If this parameter is omitted, only handlers which match the previous two will be removed
	 * @returns {Delegate} This method is chainable
	 */
	Delegate.prototype.off = function (eventType, selector, handler, useCapture) {
	  var i, listener, listenerMap, listenerList, singleEventType;
	
	  // Handler can be passed as
	  // the second or third argument
	  if (typeof selector === 'function') {
	    useCapture = handler;
	    handler = selector;
	    selector = null;
	  }
	
	  // If useCapture not set, remove
	  // all event listeners
	  if (useCapture === undefined) {
	    this.off(eventType, selector, handler, true);
	    this.off(eventType, selector, handler, false);
	    return this;
	  }
	
	  listenerMap = this.listenerMap[useCapture ? 1 : 0];
	  if (!eventType) {
	    for (singleEventType in listenerMap) {
	      if (listenerMap.hasOwnProperty(singleEventType)) {
	        this.off(singleEventType, selector, handler);
	      }
	    }
	
	    return this;
	  }
	
	  listenerList = listenerMap[eventType];
	  if (!listenerList || !listenerList.length) {
	    return this;
	  }
	
	  // Remove only parameter matches
	  // if specified
	  for (i = listenerList.length - 1; i >= 0; i--) {
	    listener = listenerList[i];
	
	    if ((!selector || selector === listener.selector) && (!handler || handler === listener.handler)) {
	      listenerList.splice(i, 1);
	    }
	  }
	
	  // All listeners removed
	  if (!listenerList.length) {
	    delete listenerMap[eventType];
	
	    // Remove the main handler
	    if (this.rootElement) {
	      this.rootElement.removeEventListener(eventType, this.handle, useCapture);
	    }
	  }
	
	  return this;
	};
	
	/**
	 * Handle an arbitrary event.
	 *
	 * @param {Event} event
	 */
	Delegate.prototype.handle = function (event) {
	  var i,
	      l,
	      type = event.type,
	      root,
	      phase,
	      listener,
	      returned,
	      listenerList = [],
	      target,
	      /** @const */EVENTIGNORE = 'ftLabsDelegateIgnore';
	
	  if (event[EVENTIGNORE] === true) {
	    return;
	  }
	
	  target = event.target;
	
	  // Hardcode value of Node.TEXT_NODE
	  // as not defined in IE8
	  if (target.nodeType === 3) {
	    target = target.parentNode;
	  }
	
	  root = this.rootElement;
	
	  phase = event.eventPhase || (event.target !== event.currentTarget ? 3 : 2);
	
	  switch (phase) {
	    case 1:
	      //Event.CAPTURING_PHASE:
	      listenerList = this.listenerMap[1][type];
	      break;
	    case 2:
	      //Event.AT_TARGET:
	      if (this.listenerMap[0] && this.listenerMap[0][type]) listenerList = listenerList.concat(this.listenerMap[0][type]);
	      if (this.listenerMap[1] && this.listenerMap[1][type]) listenerList = listenerList.concat(this.listenerMap[1][type]);
	      break;
	    case 3:
	      //Event.BUBBLING_PHASE:
	      listenerList = this.listenerMap[0][type];
	      break;
	  }
	
	  // Need to continuously check
	  // that the specific list is
	  // still populated in case one
	  // of the callbacks actually
	  // causes the list to be destroyed.
	  l = listenerList.length;
	  while (target && l) {
	    for (i = 0; i < l; i++) {
	      listener = listenerList[i];
	
	      // Bail from this loop if
	      // the length changed and
	      // no more listeners are
	      // defined between i and l.
	      if (!listener) {
	        break;
	      }
	
	      // Check for match and fire
	      // the event if there's one
	      //
	      // TODO:MCG:20120117: Need a way
	      // to check if event#stopImmediatePropagation
	      // was called. If so, break both loops.
	      if (listener.matcher.call(target, listener.matcherParam, target)) {
	        returned = this.fire(event, target, listener);
	      }
	
	      // Stop propagation to subsequent
	      // callbacks if the callback returned
	      // false
	      if (returned === false) {
	        event[EVENTIGNORE] = true;
	        event.preventDefault();
	        return;
	      }
	    }
	
	    // TODO:MCG:20120117: Need a way to
	    // check if event#stopPropagation
	    // was called. If so, break looping
	    // through the DOM. Stop if the
	    // delegation root has been reached
	    if (target === root) {
	      break;
	    }
	
	    l = listenerList.length;
	    target = target.parentElement;
	  }
	};
	
	/**
	 * Fire a listener on a target.
	 *
	 * @param {Event} event
	 * @param {Node} target
	 * @param {Object} listener
	 * @returns {boolean}
	 */
	Delegate.prototype.fire = function (event, target, listener) {
	  return listener.handler.call(target, event, target);
	};
	
	/**
	 * Check whether an element
	 * matches a generic selector.
	 *
	 * @type function()
	 * @param {string} selector A CSS selector
	 */
	var matches = (function (el) {
	  if (!el) return;
	  var p = el.prototype;
	  return p.matches || p.matchesSelector || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector;
	})(Element);
	
	/**
	 * Check whether an element
	 * matches a tag selector.
	 *
	 * Tags are NOT case-sensitive,
	 * except in XML (and XML-based
	 * languages such as XHTML).
	 *
	 * @param {string} tagName The tag name to test against
	 * @param {Element} element The element to test with
	 * @returns boolean
	 */
	function matchesTag(tagName, element) {
	  return tagName.toLowerCase() === element.tagName.toLowerCase();
	}
	
	/**
	 * Check whether an element
	 * matches the root.
	 *
	 * @param {?String} selector In this case this is always passed through as null and not used
	 * @param {Element} element The element to test with
	 * @returns boolean
	 */
	function matchesRoot(selector, element) {
	  /*jshint validthis:true*/
	  if (this.rootElement === window) return element === document;
	  return this.rootElement === element;
	}
	
	/**
	 * Check whether the ID of
	 * the element in 'this'
	 * matches the given ID.
	 *
	 * IDs are case-sensitive.
	 *
	 * @param {string} id The ID to test against
	 * @param {Element} element The element to test with
	 * @returns boolean
	 */
	function matchesId(id, element) {
	  return id === element.id;
	}
	
	/**
	 * Short hand for off()
	 * and root(), ie both
	 * with no parameters
	 *
	 * @return void
	 */
	Delegate.prototype.destroy = function () {
	  this.off();
	  this.root();
	};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(11);

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	// let debug;
	var utils = __webpack_require__(12);
	var throttle = utils.throttle;
	var debounce = utils.debounce;
	
	var listeners = {};
	var intervals = {
		resize: 100,
		orientation: 100,
		visibility: 100,
		scroll: 100
	};
	
	function setThrottleInterval(eventType, interval) {
		if (typeof arguments[0] === 'number') {
			setThrottleInterval('scroll', arguments[0]);
			setThrottleInterval('resize', arguments[1]);
			setThrottleInterval('orientation', arguments[2]);
			setThrottleInterval('visibility', arguments[3]);
		} else if (interval) {
			intervals[eventType] = interval;
		}
	}
	
	function listenToResize() {
		if (listeners.resize) {
			return;
		}
		var eventType = 'resize';
		var handler = debounce(function (ev) {
			utils.broadcast('resize', {
				viewport: utils.getSize(),
				originalEvent: ev
			});
		}, intervals.resize);
	
		window.addEventListener(eventType, handler);
		listeners.resize = {
			eventType: eventType,
			handler: handler
		};
	}
	
	function listenToOrientation() {
	
		if (listeners.orientation) {
			return;
		}
	
		var eventType = 'orientationchange';
		var handler = debounce(function (ev) {
			utils.broadcast('orientation', {
				viewport: utils.getSize(),
				orientation: utils.getOrientation(),
				originalEvent: ev
			});
		}, intervals.orientation);
	
		window.addEventListener(eventType, handler);
		listeners.orientation = {
			eventType: eventType,
			handler: handler
		};
	}
	
	function listenToVisibility() {
	
		if (listeners.visibility) {
			return;
		}
	
		var eventType = utils.detectVisiblityAPI().eventType;
		var handler = debounce(function (ev) {
			utils.broadcast('visibility', {
				hidden: utils.getVisibility(),
				originalEvent: ev
			});
		}, intervals.visibility);
	
		window.addEventListener(eventType, handler);
	
		listeners.visibility = {
			eventType: eventType,
			handler: handler
		};
	}
	
	function listenToScroll() {
	
		if (listeners.scroll) {
			return;
		}
	
		var eventType = 'scroll';
		var handler = throttle(function (ev) {
			var scrollPos = utils.getScrollPosition();
			utils.broadcast('scroll', {
				viewport: utils.getSize(),
				scrollHeight: scrollPos.height,
				scrollLeft: scrollPos.left,
				scrollTop: scrollPos.top,
				scrollWidth: scrollPos.width,
				originalEvent: ev
			});
		}, intervals.scroll);
	
		window.addEventListener(eventType, handler);
		listeners.scroll = {
			eventType: eventType,
			handler: handler
		};
	}
	
	function listenTo(eventType) {
		if (eventType === 'resize' || eventType === 'all') {
			listenToResize();
		}
	
		if (eventType === 'scroll' || eventType === 'all') {
			listenToScroll();
		}
	
		if (eventType === 'orientation' || eventType === 'all') {
			listenToOrientation();
		}
	
		if (eventType === 'visibility' || eventType === 'all') {
			listenToVisibility();
		}
	}
	
	function stopListeningTo(eventType) {
		if (eventType === 'all') {
			Object.keys(listeners).forEach(stopListeningTo);
		} else if (listeners[eventType]) {
			window.removeEventListener(listeners[eventType].eventType, listeners[eventType].handler);
			delete listeners[eventType];
		}
	}
	
	module.exports = {
		debug: function debug() {
			// debug = true;
			utils.debug();
		},
		listenTo: listenTo,
		stopListeningTo: stopListeningTo,
		setThrottleInterval: setThrottleInterval,
		getOrientation: utils.getOrientation,
		getSize: utils.getSize,
		getScrollPosition: utils.getScrollPosition,
		getVisibility: utils.getVisibility
	};

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	/* jshint devel: true */
	var oUtils = __webpack_require__(13);
	
	var _debug = undefined;
	
	function broadcast(eventType, data, target) {
		target = target || document.body;
	
		if (_debug) {
			console.log('o-viewport', eventType, data);
		}
	
		target.dispatchEvent(new CustomEvent('oViewport.' + eventType, {
			detail: data,
			bubbles: true
		}));
	}
	
	function getHeight(ignoreScrollbars) {
		return ignoreScrollbars ? document.documentElement.clientHeight : Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	}
	
	function getWidth(ignoreScrollbars) {
		return ignoreScrollbars ? document.documentElement.clientWidth : Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	}
	
	function getSize(ignoreScrollbars) {
		return {
			height: module.exports.getHeight(ignoreScrollbars),
			width: module.exports.getWidth(ignoreScrollbars)
		};
	}
	
	function getScrollPosition() {
		var de = document.documentElement;
		var db = document.body;
	
		// adapted from https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY
		var isCSS1Compat = (document.compatMode || '') === 'CSS1Compat';
	
		var ieX = isCSS1Compat ? de.scrollLeft : db.scrollLeft;
		var ieY = isCSS1Compat ? de.scrollTop : db.scrollTop;
		return {
			height: db.scrollHeight,
			width: db.scrollWidth,
			left: window.pageXOffset || window.scrollX || ieX,
			top: window.pageYOffset || window.scrollY || ieY
		};
	}
	
	function getOrientation() {
		var orientation = window.screen.orientation || window.screen.mozOrientation || window.screen.msOrientation || undefined;
		if (orientation) {
			return typeof orientation === 'string' ? orientation.split('-')[0] : orientation.type.split('-')[0];
		} else if (window.matchMedia) {
			return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
		} else {
			return getHeight() >= getWidth() ? 'portrait' : 'landscape';
		}
	}
	
	function detectVisiblityAPI() {
		var hiddenName = undefined;
		var eventType = undefined;
		if (typeof document.hidden !== 'undefined') {
			hiddenName = 'hidden';
			eventType = 'visibilitychange';
		} else if (typeof document.mozHidden !== 'undefined') {
			hiddenName = 'mozHidden';
			eventType = 'mozvisibilitychange';
		} else if (typeof document.msHidden !== 'undefined') {
			hiddenName = 'msHidden';
			eventType = 'msvisibilitychange';
		} else if (typeof document.webkitHidden !== 'undefined') {
			hiddenName = 'webkitHidden';
			eventType = 'webkitvisibilitychange';
		}
	
		return {
			hiddenName: hiddenName,
			eventType: eventType
		};
	}
	
	function getVisibility() {
		var hiddenName = detectVisiblityAPI().hiddenName;
		return document[hiddenName];
	}
	
	module.exports = {
		debug: function debug() {
			_debug = true;
		},
		broadcast: broadcast,
		getWidth: getWidth,
		getHeight: getHeight,
		getSize: getSize,
		getScrollPosition: getScrollPosition,
		getVisibility: getVisibility,
		getOrientation: getOrientation,
		detectVisiblityAPI: detectVisiblityAPI,
		debounce: oUtils.debounce,
		throttle: oUtils.throttle
	};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(14);

/***/ }),
/* 14 */
/***/ (function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var define = false;
	
	/**
	*
	* Debounces function so it is only called after n milliseconds
	* without it not being called
	*
	* @example
	* Utils.debounce(myFunction() {}, 100);
	*
	* @param {Function} func - Function to be debounced
	* @param {number} wait - Time in miliseconds
	*
	* @returns {Function} - Debounced function
	*/
	function debounce(func, wait) {
		var timeout = undefined;
		return function () {
			var _this = this;
	
			var args = arguments;
			var later = function later() {
				timeout = null;
				func.apply(_this, args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	}
	
	/**
	*
	* Throttle function so it is only called once every n milliseconds
	*
	* @example
	* Utils.throttle(myFunction() {}, 100);
	*
	* @param {Function} func - Function to be throttled
	* @param {number} wait - Time in miliseconds
	*
	* @returns {Function} - Throttled function
	*/
	function throttle(func, wait) {
		var timeout = undefined;
		return function () {
			var _this2 = this;
	
			if (timeout) {
				return;
			}
			var args = arguments;
			var later = function later() {
				timeout = null;
				func.apply(_this2, args);
			};
	
			timeout = setTimeout(later, wait);
		};
	}
	
	exports.debounce = debounce;
	exports.throttle = throttle;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	/*global require, module*/
	
	var DomDelegate = __webpack_require__(8);
	var oDom = __webpack_require__(16);
	var utils = __webpack_require__(18);
	
	function Nav(rootEl) {
	
		var bodyDelegate = new DomDelegate(document.body);
		var rootDelegate = new DomDelegate(rootEl);
	
		// Get sub-level element
		function getChildListEl(el) {
			return el.querySelector('ul');
		}
	
		// Check if element has sub-level nav
		function hasChildList(el) {
			return !!getChildListEl(el);
		}
	
		// Get controlled element
		function getMegaDropdownEl(itemEl) {
			if (itemEl.hasAttribute('aria-controls')) {
				return document.getElementById(itemEl.getAttribute('aria-controls'));
			}
		}
	
		// Check if element is a controller of another DOM element
		function isControlEl(el) {
			return !!(getChildListEl(el) || getMegaDropdownEl(el));
		}
	
		// Check if element has been expanded
		function isExpanded(el) {
			return el.getAttribute('aria-expanded') === 'true';
		}
	
		// Check if a certain element is inside the root nav
		function isElementInsideNav(el) {
			var expandedLevel1El = rootEl.querySelector('[data-o-hierarchical-nav-level="1"] > [aria-expanded="true"]');
			var expandedMegaDropdownEl = undefined;
			var allLevel1Els = undefined;
	
			if (expandedLevel1El) {
				expandedMegaDropdownEl = getMegaDropdownEl(expandedLevel1El);
				if (expandedMegaDropdownEl && expandedMegaDropdownEl.contains(el)) {
					return true;
				}
			}
	
			allLevel1Els = rootEl.querySelectorAll('[data-o-hierarchical-nav-level="1"] > li');
	
			for (var c = 0, l = allLevel1Els.length; c < l; c++) {
				if (allLevel1Els[c].contains(el)) {
					return true;
				}
			}
			return false;
		}
	
		// Get the level a nav is in
		function getLevel(el) {
			return parseInt(el.parentNode.getAttribute('data-o-hierarchical-nav-level'), 10);
		}
	
		// Check if a level 2 nav will fit in the window
		function level2ListFitsInWindow(l2El) {
			return l2El.getBoundingClientRect().right < window.innerWidth;
		}
	
		// Check if an element will have enough space to its right
		function elementFitsToRight(el1, el2) {
			return el1.getBoundingClientRect().right + el2.offsetWidth < window.innerWidth;
		}
	
		// Depending on if an element fits to its right or not, change its class to apply correct css
		function positionChildListEl(parentEl, childEl) {
			parentEl.classList.remove('o-hierarchical-nav--align-right');
			parentEl.classList.remove('o-hierarchical-nav__outside-right');
			parentEl.classList.remove('o-hierarchical-nav--left');
	
			if (!childEl) {
				return;
			}
	
			if (getLevel(parentEl) === 1) {
				if (!level2ListFitsInWindow(childEl)) {
					parentEl.classList.add('o-hierarchical-nav--align-right');
				}
			} else {
				if (elementFitsToRight(parentEl, childEl)) {
					parentEl.classList.add('o-hierarchical-nav__outside-right');
				}
			}
		}
	
		// Hide an element
		function hideEl(el) {
			if (el) {
				el.setAttribute('aria-hidden', 'true');
			}
		}
	
		// Display an element
		function showEl(el) {
			if (el) {
				el.removeAttribute('aria-hidden');
			}
		}
	
		// Collapse all items from a certain node list
		function collapseAll(nodeList) {
			if (!nodeList) {
				nodeList = rootEl.querySelectorAll('[data-o-hierarchical-nav-level="1"] > li[aria-expanded=true]');
			}
	
			utils.nodeListToArray(nodeList).forEach(function (childListItemEl) {
				if (isExpanded(childListItemEl)) {
					collapseItem(childListItemEl);
				}
			});
		}
	
		// Set an element as not expanded, and if it has children, do the same to them
		function collapseItem(itemEl) {
			itemEl.setAttribute('aria-expanded', 'false');
	
			if (utils.isIE8) {
				itemEl.classList.add('forceIErepaint');
				itemEl.classList.remove('forceIErepaint');
			}
	
			if (hasChildList(itemEl)) {
				collapseAll(getChildListEl(itemEl).children);
			}
	
			hideEl(getMegaDropdownEl(itemEl));
			dispatchCloseEvent(itemEl);
		}
	
		// Get same level items and collapse them
		function collapseSiblingItems(itemEl) {
			var listLevel = oDom.getClosestMatch(itemEl, 'ul').getAttribute('data-o-hierarchical-nav-level');
			var listItemEls = rootEl.querySelectorAll('[data-o-hierarchical-nav-level="' + listLevel + '"] > li[aria-expanded="true"]');
	
			for (var c = 0, l = listItemEls.length; c < l; c++) {
				collapseItem(listItemEls[c]);
			}
		}
	
		// Expand a nav item
		function expandItem(itemEl) {
			collapseSiblingItems(itemEl);
			itemEl.setAttribute('aria-expanded', 'true');
			positionChildListEl(itemEl, getChildListEl(itemEl));
			showEl(getMegaDropdownEl(itemEl));
			dispatchExpandEvent(itemEl);
		}
	
		// Helper method to dispatch o-layers new event
		function dispatchExpandEvent(itemEl) {
			utils.dispatchCustomEvent(itemEl, 'oLayers.new', { 'zIndex': 10, 'el': itemEl });
		}
	
		// Helper method to dispatch o-layers close event
		function dispatchCloseEvent(itemEl) {
			utils.dispatchCustomEvent(itemEl, 'oLayers.close', { 'zIndex': 10, 'el': itemEl });
		}
	
		// Handle clicks ourselved by expanding or collapsing selected element
		function handleClick(ev) {
			var itemEl = oDom.getClosestMatch(ev.target, 'li');
	
			if (itemEl && isControlEl(itemEl)) {
				ev.preventDefault();
	
				if (!isExpanded(itemEl)) {
					expandItem(itemEl);
				} else {
					collapseItem(itemEl);
				}
			}
		}
	
		// Position a level 3 nav and deeper
		function positionExpandedLevels() {
			// find deepest expanded menu element
			var openMenus = rootEl.querySelectorAll('li[aria-expanded="true"] > ul[data-o-hierarchical-nav-level]');
	
			// find the deepest level currently open
			var deepestLevel = -1;
			for (var c = 0, l = openMenus.length; c < l; c++) {
				deepestLevel = Math.max(deepestLevel, openMenus[c].getAttribute("data-o-hierarchical-nav-level"));
			}
	
			// start checking space / collapsing where needed
			for (var l = 2; l <= deepestLevel; l++) {
				var openLevelParentEl = rootEl.querySelector('[data-o-hierarchical-nav-level="' + l + '"] > [aria-expanded="true"]');
				var openLevelChildEl = rootEl.querySelector('[data-o-hierarchical-nav-level="' + l + '"] > [aria-expanded="true"] > ul');
	
				if (openLevelParentEl && openLevelChildEl) {
					positionChildListEl(openLevelParentEl, openLevelChildEl);
				}
			}
		}
	
		// Position level 3 and below on resize
		function resize() {
			positionExpandedLevels();
		}
	
		// Set all tabIndexes of a tags to 0
		function setTabIndexes() {
			var aEls = rootEl.querySelectorAll('li > a');
	
			for (var c = 0, l = aEls.length; c < l; c++) {
				if (!aEls[c].hasAttribute('href')) {
					if (aEls[c].tabIndex === 0) {
						// Don't override tabIndex if something else has set it, but otherwise set it to zero to make it focusable.
						aEls[c].tabIndex = 0;
					}
				}
			}
		}
	
		function setLayersContext() {
			// We'll use the body as the default context
			bodyDelegate.on('oLayers.new', function (e) {
				if (!isElementInsideNav(e.detail.el)) {
					collapseAll();
				}
			});
		}
	
		function init() {
			if (!rootEl) {
				rootEl = document.body;
			} else if (!(rootEl instanceof HTMLElement)) {
				rootEl = document.querySelector(rootEl);
			}
	
			rootEl.setAttribute('data-o-hierarchical-nav--js', '');
			setTabIndexes();
			setLayersContext();
			rootDelegate.on('click', handleClick);
			rootDelegate.on('keyup', function (ev) {
				// Pressing enter key on anchors without @href won't trigger a click event
				if (!ev.target.hasAttribute('href') && ev.keyCode === 13 && isElementInsideNav(ev.target)) {
					handleClick(ev);
				}
			});
	
			// Collapse all elements if the user clicks outside the nav
			bodyDelegate.on('click', function (ev) {
				if (!isElementInsideNav(ev.target)) {
					collapseAll();
				}
			});
		}
	
		function destroy() {
			rootDelegate.destroy();
			bodyDelegate.destroy();
			rootEl.removeAttribute('data-o-hierarchical-nav--js');
		}
	
		init();
	
		this.resize = resize;
		this.collapseAll = collapseAll;
		this.destroy = destroy;
	}
	
	module.exports = Nav;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(17);

/***/ }),
/* 17 */
/***/ (function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	/*global exports*/
	
	function getClosestMatch(el, selector) {
		while (el) {
			if (el.matches(selector)) {
				return el;
			} else {
				el = el.parentElement;
			}
		}
		return false;
	}
	
	function getIndex(el) {
		var i = 0;
		if (el && typeof el === 'object' && el.nodeType === 1) {
			while (el.previousSibling) {
				el = el.previousSibling;
				if (el.nodeType === 1) {
					++i;
				}
			}
			return i;
		}
	}
	
	exports.getClosestMatch = getClosestMatch;
	exports.getIndex = getIndex;

/***/ }),
/* 18 */
/***/ (function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	/*global exports*/
	
	// Helper function that converts a list of elements into an array
	function nodeListToArray(nl) {
		return [].map.call(nl, function (element) {
			return element;
		});
	}
	
	// Helper function to dispatch events
	function dispatchCustomEvent(el, name, data) {
		if (document.createEvent && el.dispatchEvent) {
			var _event = document.createEvent('Event');
			_event.initEvent(name, true, true);
	
			if (data) {
				_event.detail = data;
			}
	
			el.dispatchEvent(_event);
		}
	}
	
	function isIE8() {
		var b = document.createElement('B');
		var docElem = document.documentElement;
		var isIE = undefined;
	
		b.innerHTML = '<!--[if IE 8]><b id="ie8test"></b><![endif]-->';
		docElem.appendChild(b);
		isIE = !!document.getElementById('ie8test');
		docElem.removeChild(b);
		return isIE;
	}
	
	exports.isIE8 = isIE8();
	exports.nodeListToArray = nodeListToArray;
	exports.dispatchCustomEvent = dispatchCustomEvent;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(20);

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	/*global require, module*/
	'use strict';
	
	var oGallery = __webpack_require__(21);
	var constructAll = function constructAll() {
		oGallery.init();
		document.removeEventListener('o.DOMContentLoaded', constructAll);
	};
	
	document.addEventListener('o.DOMContentLoaded', constructAll);
	
	module.exports = oGallery;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	/*global require, module*/
	'use strict';
	
	var oDom = __webpack_require__(16),
	    DomDelegate = __webpack_require__(8),
	    FTScroller = __webpack_require__(22).FTScroller,
	    oViewport = __webpack_require__(10),
	    galleryDom = __webpack_require__(23),
	    SimpleScroller = __webpack_require__(24);
	
	function Gallery(containerEl, config) {
	
		var viewportEl;
		var titleEl;
		var allItemsEl;
		var itemEls;
		var selectedItemIndex;
		var shownItemIndex;
		var scroller;
		var debounceScroll;
		var prevControlDiv;
		var nextControlDiv;
		var propertyAttributeMap = {
			component: "data-o-component",
			syncID: "data-o-gallery-syncid",
			multipleItemsPerPage: "data-o-gallery-multipleitemsperpage",
			touch: "data-o-gallery-touch",
			captions: "data-o-gallery-captions",
			captionMinHeight: "data-o-gallery-captionminheight",
			captionMaxHeight: "data-o-gallery-captionmaxheight",
			title: "data-o-gallery-title"
		};
		var defaultConfig = {
			component: "o-gallery",
			multipleItemsPerPage: false,
			captions: true,
			captionMinHeight: 24,
			captionMaxHeight: 52,
			touch: false,
			syncID: "o-gallery-" + new Date().getTime()
		};
		var allowTransitions = false;
		var bodyDomDelegate;
		var containerDomDelegate;
	
		function supportsCssTransforms() {
			var b = document.body || document.documentElement,
			    s = b.style,
			    p = 'Transition';
			var v = ['', 'Moz', 'webkit', 'Webkit', 'Khtml', 'O', 'ms'];
	
			for (var i = 0; i < v.length; i++) {
				if (typeof s[v[i] + p] === 'string' || typeof s[v[i] + p.toLowerCase()] === 'string') return true;
			}
			return false;
		}
	
		function isDataSource() {
			return config.items && config.items.length > 0;
		}
	
		function setWidths() {
			var totalWidth = 0;
			var itemWidth;
	
			if (config.multipleItemsPerPage) {
				itemWidth = parseInt(itemEls[selectedItemIndex].clientWidth, 10);
			} else {
				itemWidth = containerEl.clientWidth;
			}
			for (var i = 0; i < itemEls.length; i++) {
				itemEls[i].style.width = itemWidth + "px";
				totalWidth += itemWidth;
			}
			allItemsEl.style.width = totalWidth + "px";
			// Makes sure Scroller know about the width change
			scroller.updateDimensions();
		}
	
		function isValidItem(n) {
			return typeof n === "number" && n > -1 && n < itemEls.length;
		}
	
		function getSelectedItem() {
			var selectedItem = 0;
			for (var i = 0; i < itemEls.length; i++) {
				if (itemEls[i].getAttribute('aria-selected') === 'true') {
					selectedItem = i;
					break;
				}
			}
			return selectedItem;
		}
	
		function selectOnClick(evt) {
			var clickedItemNum = oDom.getIndex(oDom.getClosestMatch(evt.srcElement, ".o-gallery__item"));
			selectItem(clickedItemNum, true, "user");
		}
	
		function addUiControls() {
			prevControlDiv = galleryDom.createElement("div", "", "o-gallery__control o-gallery__control--prev");
			nextControlDiv = galleryDom.createElement("div", "", "o-gallery__control o-gallery__control--next");
			containerEl.appendChild(prevControlDiv);
			containerEl.appendChild(nextControlDiv);
			containerDomDelegate.on('click', '.o-gallery__control--prev', prev);
			containerDomDelegate.on('click', '.o-gallery__control--next', next);
			if (config.multipleItemsPerPage) {
				containerDomDelegate.on('click', '.o-gallery__viewport', selectOnClick);
			}
		}
	
		function updateControlStates() {
			prevControlDiv.setAttribute('aria-hidden', String(scroller.scrollLeft <= 0));
			nextControlDiv.setAttribute('aria-hidden', String(scroller.scrollLeft >= allItemsEl.clientWidth - viewportEl.clientWidth));
		}
	
		function getTitleEl() {
			titleEl = containerEl.querySelector(".o-gallery__title");
			if (config.title) {
				if (titleEl) {
					titleEl.innerHTML = config.title;
				} else {
					titleEl = galleryDom.createElement('div', config.title, 'o-gallery__title');
					containerEl.appendChild(titleEl);
				}
			}
		}
	
		function setCaptionSizes() {
			for (var i = 0; i < itemEls.length; i++) {
				var itemEl = itemEls[i];
				itemEl.style.paddingBottom = config.captionMinHeight + "px";
				var captionEl = itemEl.querySelector(".o-gallery__item__caption");
				if (captionEl) {
					captionEl.style.minHeight = config.captionMinHeight + "px";
					captionEl.style.maxHeight = config.captionMaxHeight + "px";
				}
			}
		}
	
		function insertItemContent(n) {
			var itemNums = n instanceof Array ? n : [n];
			if (config.items) {
				for (var i = 0; i < itemNums.length; i++) {
					var itemNum = itemNums[i];
					if (isValidItem(itemNum) && !config.items[itemNum].inserted) {
						galleryDom.insertItemContent(config, config.items[itemNum], itemEls[itemNum]);
						config.items[itemNum].inserted = true;
						setCaptionSizes();
					}
				}
			}
		}
	
		function isWholeItemInPageView(itemNum, l, r) {
			return itemEls[itemNum].offsetLeft >= l && itemEls[itemNum].offsetLeft + itemEls[itemNum].clientWidth <= r;
		}
	
		function isAnyPartOfItemInPageView(itemNum, l, r) {
			return itemEls[itemNum].offsetLeft >= l - itemEls[itemNum].clientWidth && itemEls[itemNum].offsetLeft <= r;
		}
	
		function getItemsInPageView(l, r, whole) {
			var itemsInView = [];
			var onlyWhole = typeof whole !== "boolean" ? true : whole;
			for (var i = 0; i < itemEls.length; i++) {
				if (onlyWhole && isWholeItemInPageView(i, l, r) || !onlyWhole && isAnyPartOfItemInPageView(i, l, r)) {
					itemsInView.push(i);
				}
			}
			return itemsInView;
		}
	
		function onGalleryCustomEvent(evt) {
			if (evt.srcElement !== containerEl && evt.detail.syncID === config.syncID && evt.detail.source === "user") {
				selectItem(evt.detail.itemID, true);
			}
		}
	
		function listenForSyncEvents() {
			bodyDomDelegate.on('oGallery.itemSelect', onGalleryCustomEvent);
		}
	
		function triggerEvent(name, data) {
			data.syncID = config.syncID;
			var event = new CustomEvent(name, {
				'bubbles': true,
				'cancelable': true,
				'detail': data || {}
			});
			containerEl.dispatchEvent(event);
		}
	
		function moveViewport(left) {
			scroller.scrollTo(left, 0, allowTransitions ? true : 0);
			insertItemContent(getItemsInPageView(left, left + viewportEl.clientWidth, false));
		}
	
		function alignItemLeft(n) {
			moveViewport(itemEls[n].offsetLeft);
		}
	
		function alignItemRight(n) {
			var newScrollLeft = itemEls[n].offsetLeft - (viewportEl.clientWidth - itemEls[n].clientWidth);
			moveViewport(newScrollLeft);
		}
	
		function bringItemIntoView(n) {
			if (!isValidItem(n)) {
				return;
			}
			var viewportL = scroller.scrollLeft;
			var viewportR = viewportL + viewportEl.clientWidth;
			var itemL = itemEls[n].offsetLeft;
			var itemR = itemL + itemEls[n].clientWidth;
			if (itemL > viewportL && itemR < viewportR) {
				return;
			}
			if (itemL < viewportL) {
				alignItemLeft(n);
			} else if (itemR > viewportR) {
				alignItemRight(n);
			}
		}
	
		function showItem(n) {
			if (isValidItem(n)) {
				bringItemIntoView(n);
				shownItemIndex = n;
				updateControlStates();
			}
		}
	
		function showPrevItem() {
			var prev = shownItemIndex - 1 >= 0 ? shownItemIndex - 1 : itemEls.length - 1;
			showItem(prev);
		}
	
		function showNextItem() {
			var next = shownItemIndex + 1 < itemEls.length ? shownItemIndex + 1 : 0;
			showItem(next);
		}
	
		function showPrevPage() {
			if (scroller.scrollLeft > 0) {
				var prevPageWholeItems = getItemsInPageView(scroller.scrollLeft - viewportEl.clientWidth, scroller.scrollLeft);
				var prevPageItem = prevPageWholeItems.pop() || 0;
				alignItemRight(prevPageItem);
			}
		}
	
		function showNextPage() {
			if (scroller.scrollLeft < allItemsEl.clientWidth - viewportEl.clientWidth) {
				var currentWholeItemsInView = getItemsInPageView(scroller.scrollLeft, scroller.scrollLeft + viewportEl.clientWidth);
				var lastWholeItemInView = currentWholeItemsInView.pop();
				alignItemLeft(lastWholeItemInView + 1);
			}
		}
	
		function selectItem(n, show, source) {
			if (!source) {
				source = "api";
			}
			if (isValidItem(n)) {
				if (show) {
					showItem(n);
				}
				if (n !== selectedItemIndex) {
					itemEls[selectedItemIndex].setAttribute('aria-selected', 'false');
					selectedItemIndex = n;
					itemEls[selectedItemIndex].setAttribute('aria-selected', 'true');
					triggerEvent("oGallery.itemSelect", {
						itemID: selectedItemIndex,
						source: source
					});
				}
			}
		}
	
		function selectPrevItem(show, source) {
			var prev = selectedItemIndex - 1 >= 0 ? selectedItemIndex - 1 : itemEls.length - 1;
			selectItem(prev, show, source);
		}
	
		function selectNextItem(show, source) {
			var next = selectedItemIndex + 1 < itemEls.length ? selectedItemIndex + 1 : 0;
			selectItem(next, show, source);
		}
	
		function prev() {
			if (config.multipleItemsPerPage) {
				showPrevPage();
			} else {
				selectPrevItem(true, "user");
			}
		}
	
		function next() {
			if (config.multipleItemsPerPage) {
				showNextPage();
			} else {
				selectNextItem(true, "user");
			}
		}
	
		function onResize() {
			setWidths();
			if (!config.multipleItemsPerPage) {
				// correct the alignment of item in view
				showItem(shownItemIndex);
			} else {
				var newScrollLeft = scroller.scrollLeft;
				insertItemContent(getItemsInPageView(newScrollLeft, newScrollLeft + viewportEl.clientWidth, false));
			}
		}
	
		function extendObjects(objs) {
			var newObj = {};
			for (var i = 0; i < objs.length; i++) {
				var obj = objs[i];
				for (var prop in obj) {
					if (obj.hasOwnProperty(prop)) {
						newObj[prop] = obj[prop];
					}
				}
			}
			return newObj;
		}
	
		function updateDataAttributes() {
			galleryDom.setAttributesFromProperties(containerEl, config, propertyAttributeMap, ["items"]);
		}
	
		function getSyncID() {
			return config.syncID;
		}
	
		function syncWith(galleryInstance) {
			config.syncID = galleryInstance.getSyncID();
			updateDataAttributes();
		}
	
		function onScroll(evt) {
			updateControlStates();
			insertItemContent(getItemsInPageView(evt.scrollLeft, evt.scrollLeft + viewportEl.clientWidth, false));
		}
	
		function destroy() {
			// Destroy objects before manipulating the dom. Order is important for gallery to be destroyed properly
			// It won't instantiate again nicely if it's the other way round
			containerDomDelegate.destroy();
			bodyDomDelegate.destroy();
			window.removeEventListener("oViewport.resize", onResize, false);
			clearTimeout(debounceScroll);
			scroller.destroy(true);
			prevControlDiv.parentNode.removeChild(prevControlDiv);
			prevControlDiv = null;
			nextControlDiv.parentNode.removeChild(nextControlDiv);
			nextControlDiv = null;
			for (var prop in propertyAttributeMap) {
				if (propertyAttributeMap.hasOwnProperty(prop)) {
					containerEl.removeAttribute(propertyAttributeMap[prop]);
				}
			}
			containerEl.removeAttribute('data-o-gallery--js');
		}
	
		if (!containerEl) {
			containerEl = document.body;
		} else if (containerEl.nodeType !== 1) {
			containerEl = document.querySelector(containerEl);
		}
	
		containerEl.setAttribute('data-o-gallery--js', '');
		bodyDomDelegate = new DomDelegate(document.body);
		containerDomDelegate = new DomDelegate(containerEl);
		if (isDataSource()) {
			galleryDom.emptyElement(containerEl);
			containerEl.classList.add("o-gallery");
			allItemsEl = galleryDom.createItemsList(containerEl);
			itemEls = galleryDom.createItems(allItemsEl, config.items);
		}
		config = extendObjects([defaultConfig, galleryDom.getPropertiesFromAttributes(containerEl, propertyAttributeMap), config]);
		updateDataAttributes();
		getTitleEl();
		allItemsEl = allItemsEl || containerEl.querySelector(".o-gallery__items");
		itemEls = itemEls || containerEl.querySelectorAll(".o-gallery__item");
		selectedItemIndex = getSelectedItem();
		shownItemIndex = selectedItemIndex;
	
		// Generate an array of item indexes
		insertItemContent(Object.keys(itemEls));
		setCaptionSizes();
		if (supportsCssTransforms()) {
			scroller = new FTScroller(containerEl, {
				scrollbars: false,
				scrollingY: false,
				updateOnWindowResize: true,
				snapping: !config.multipleItemsPerPage,
				/* Can't use fling/inertial scroll as after user input is finished and scroll continues, scroll events are no
	    longer fired, and value of scrollLeft doesn't change until scrollend. */
				flinging: false,
				disabledInputMethods: {
					touch: !config.touch,
					scroll: true
				}
			});
			scroller.addEventListener("scroll", function (evt) {
				clearTimeout(debounceScroll);
				debounceScroll = setTimeout(function () {
					onScroll(evt);
				}, 50);
			});
			scroller.addEventListener("scrollend", function (evt) {
				onScroll(evt);
				triggerEvent('oGallery.scrollEnd', evt);
			});
			scroller.addEventListener("segmentwillchange", function () {
				if (!config.multipleItemsPerPage) {
					selectItem(scroller.currentSegment.x, false, "user");
				}
			});
		} else {
			scroller = new SimpleScroller(containerEl);
			containerEl.addEventListener("scrollend", function (evt) {
				onScroll(evt);
				triggerEvent('oGallery.scrollEnd', evt);
			});
		}
		viewportEl = scroller.contentContainerNode.parentNode;
		viewportEl.classList.add("o-gallery__viewport");
		if (titleEl && supportsCssTransforms()) {
			// Title needs to be moved into the viewport so it stays visible when pages change
			titleEl.parentNode.removeChild(titleEl);
			viewportEl.appendChild(titleEl);
		}
		addUiControls();
		showItem(selectedItemIndex);
		if (config.multipleItemsPerPage === true) {
			allowTransitions = true;
		}
		updateControlStates();
		listenForSyncEvents();
	
		// If it's the thumbnails gallery, check that the thumbnails' clientwidth has been set before resizing
		// as this takes time in IE8
		var resizeLimit = 50;
		function forceResize() {
			if (!config.multipleItemsPerPage || parseInt(itemEls[selectedItemIndex].clientWidth, 10) !== 0) {
				onResize();
			} else if (resizeLimit > 0) {
				setTimeout(forceResize, 150);
				resizeLimit--;
			}
		}
		oViewport.listenTo('resize');
		window.addEventListener("oViewport.resize", onResize, false);
		// Force an initial resize in case all images are loaded before o.DOMContentLoaded is fired and the resize event hasn't
		forceResize();
	
		this.showItem = showItem;
		this.getSelectedItem = getSelectedItem;
		this.showPrevItem = showPrevItem;
		this.showNextItem = showNextItem;
		this.showPrevPage = showPrevPage;
		this.showNextPage = showNextPage;
		this.selectItem = selectItem;
		this.selectPrevItem = selectPrevItem;
		this.selectNextItem = selectNextItem;
		this.next = next;
		this.prev = prev;
		this.getSyncID = getSyncID;
		this.syncWith = syncWith;
		this.onResize = onResize;
		this.getGalleryElement = function () {
			return containerEl;
		};
		this.destroy = destroy;
	
		triggerEvent("oGallery.ready", {
			gallery: this
		});
	}
	
	Gallery.init = function (el, config) {
		var conf = config || {};
		var gEls;
		var galleries = [];
		if (!el) {
			el = document.body;
		} else if (el.nodeType !== 1) {
			el = document.querySelector(el);
		}
		if (el.querySelectorAll) {
			gEls = el.querySelectorAll("[data-o-component~=o-gallery]");
			for (var i = 0; i < gEls.length; i++) {
				if (!gEls[i].hasAttribute('data-o-gallery--js')) {
					galleries.push(new Gallery(gEls[i], conf));
				}
			}
		}
		return galleries;
	};
	
	module.exports = Gallery;

/***/ }),
/* 22 */
/***/ (function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/'use strict';var define=false; /**
	 * FTScroller: touch and mouse-based scrolling for DOM elements larger than their containers.
	 *
	 * While this is a rewrite, it is heavily inspired by two projects:
	 * 1) Uxebu TouchScroll (https://github.com/davidaurelio/TouchScroll), BSD licensed:
	 *    Copyright (c) 2010 uxebu Consulting Ltd. & Co. KG
	 *    Copyright (c) 2010 David Aurelio
	 * 2) Zynga Scroller (https://github.com/zynga/scroller), MIT licensed:
	 *    Copyright 2011, Zynga Inc.
	 *    Copyright 2011, Deutsche Telekom AG
	 *
	 * Includes CubicBezier:
	 *
	 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
	 * Copyright (C) 2010 David Aurelio. All Rights Reserved.
	 * Copyright (C) 2010 uxebu Consulting Ltd. & Co. KG. All Rights Reserved.
	 *
	 * Redistribution and use in source and binary forms, with or without
	 * modification, are permitted provided that the following conditions
	 * are met:
	 * 1. Redistributions of source code must retain the above copyright
	 *    notice, this list of conditions and the following disclaimer.
	 * 2. Redistributions in binary form must reproduce the above copyright
	 *    notice, this list of conditions and the following disclaimer in the
	 *    documentation and/or other materials provided with the distribution.
	 *
	 * THIS SOFTWARE IS PROVIDED BY APPLE INC., DAVID AURELIO, AND UXEBU
	 * CONSULTING LTD. & CO. KG ``AS IS'' AND ANY EXPRESS OR IMPLIED
	 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
	 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
	 * IN NO EVENT SHALL APPLE INC. OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
	 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
	 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
	 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
	 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
	 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
	 * POSSIBILITY OF SUCH DAMAGE.
	 *
	 * @copyright The Financial Times Ltd [All rights reserved]
	 * @codingstandard ftlabs-jslint
	 * @version 0.6.2
	 */ /**
	 * @license FTScroller is (c) 2012 The Financial Times Ltd [All rights reserved] and licensed under the MIT license.
	 *
	 * Inspired by Uxebu TouchScroll, (c) 2010 uxebu Consulting Ltd. & Co. KG and David Aurelio, which is BSD licensed (https://github.com/davidaurelio/TouchScroll)
	 * Inspired by Zynga Scroller, (c) 2011 Zynga Inc and Deutsche Telekom AG, which is MIT licensed (https://github.com/zynga/scroller)
	 * Includes CubicBezier, (c) 2008 Apple Inc [All rights reserved], (c) 2010 David Aurelio and uxebu Consulting Ltd. & Co. KG. [All rights reserved], which is 2-clause BSD licensed (see above or https://github.com/davidaurelio/TouchScroll).
	 */ /*jslint nomen: true, vars: true, browser: true, continue: true, white: true*/ /*globals FTScrollerOptions*/var FTScroller,CubicBezier;(function(){'use strict'; // Determine the browser engine and prefix, trying to use the unprefixed version where available.
	var _vendorCSSPrefix,_vendorStylePropertyPrefix,_vendorTransformLookup,_pointerEventsPrefixed,_setPointerCapture,_releasePointerCapture,_lostPointerCapture,_trackPointerEvents,_pointerTypeTouch;if(document.createElement('div').style.transform !== undefined){_vendorCSSPrefix = '';_vendorStylePropertyPrefix = '';_vendorTransformLookup = 'transform';}else if(window.opera && Object.prototype.toString.call(window.opera) === '[object Opera]'){_vendorCSSPrefix = '-o-';_vendorStylePropertyPrefix = 'O';_vendorTransformLookup = 'OTransform';}else if(document.documentElement.style.MozTransform !== undefined){_vendorCSSPrefix = '-moz-';_vendorStylePropertyPrefix = 'Moz';_vendorTransformLookup = 'MozTransform';}else if(document.documentElement.style.webkitTransform !== undefined){_vendorCSSPrefix = '-webkit-';_vendorStylePropertyPrefix = 'webkit';_vendorTransformLookup = '-webkit-transform';}else if(typeof navigator.cpuClass === 'string'){_vendorCSSPrefix = '-ms-';_vendorStylePropertyPrefix = 'ms';_vendorTransformLookup = '-ms-transform';} // Pointer Events are unprefixed in IE11
	if('pointerEnabled' in window.navigator){_pointerEventsPrefixed = false;_trackPointerEvents = window.navigator.pointerEnabled;_setPointerCapture = 'setPointerCapture';_releasePointerCapture = 'releasePointerCapture';_lostPointerCapture = 'lostpointercapture';_pointerTypeTouch = 'touch';}else if('msPointerEnabled' in window.navigator){_pointerEventsPrefixed = true;_trackPointerEvents = window.navigator.msPointerEnabled;_setPointerCapture = 'msSetPointerCapture';_releasePointerCapture = 'msReleasePointerCapture';_lostPointerCapture = 'MSLostPointerCapture';_pointerTypeTouch = 2; // PointerEvent.MSPOINTER_TYPE_TOUCH = 2 in IE10
	} // Global flag to determine if any scroll is currently active.  This prevents
	// issues when using multiple scrollers, particularly when they're nested.
	var _ftscrollerMoving=false; // Determine whether pointer events or touch events can be used
	var _trackTouchEvents=!_trackPointerEvents; // Determine whether to use modern hardware acceleration rules or dynamic/toggleable rules.
	// Certain older browsers - particularly Android browsers - have problems with hardware
	// acceleration, so being able to toggle the behaviour dynamically via a CSS cascade is desirable.
	var _useToggleableHardwareAcceleration=false;if('hasOwnProperty' in window){_useToggleableHardwareAcceleration = !window.hasOwnProperty('ArrayBuffer');} // Feature detection
	var _canClearSelection=window.Selection && window.Selection.prototype.removeAllRanges; // If hardware acceleration is using the standard path, but perspective doesn't seem to be supported,
	// 3D transforms likely aren't supported either
	if(!_useToggleableHardwareAcceleration && document.createElement('div').style[_vendorStylePropertyPrefix + (_vendorStylePropertyPrefix?'P':'p') + 'erspective'] === undefined){_useToggleableHardwareAcceleration = true;} // Style prefixes
	var _transformProperty=_vendorStylePropertyPrefix + (_vendorStylePropertyPrefix?'T':'t') + 'ransform';var _transitionProperty=_vendorStylePropertyPrefix + (_vendorStylePropertyPrefix?'T':'t') + 'ransition';var _translateRulePrefix=_useToggleableHardwareAcceleration?'translate(':'translate3d(';var _transformPrefixes={x:'',y:'0,'};var _transformSuffixes={x:',0' + (_useToggleableHardwareAcceleration?')':',0)'),y:_useToggleableHardwareAcceleration?')':',0)'}; // Constants.  Note that the bezier curve should be changed along with the friction!
	var _kFriction=0.998;var _kMinimumSpeed=0.01; // Create a global stylesheet to set up stylesheet rules and track dynamic entries
	(function(){var stylesheetContainerNode=document.getElementsByTagName('head')[0] || document.documentElement;var newStyleNode=document.createElement('style');var hardwareAccelerationRule;var _styleText;newStyleNode.type = 'text/css'; // Determine the hardware acceleration logic to use
	if(_useToggleableHardwareAcceleration){hardwareAccelerationRule = _vendorCSSPrefix + 'transform-style: preserve-3d;';}else {hardwareAccelerationRule = _vendorCSSPrefix + 'transform: translateZ(0);';} // Add our rules
	_styleText = ['.ftscroller_container { overflow: hidden; position: relative; max-height: 100%; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); -ms-touch-action: none }','.ftscroller_hwaccelerated { ' + hardwareAccelerationRule + ' }','.ftscroller_x, .ftscroller_y { position: relative; min-width: 100%; min-height: 100%; overflow: hidden }','.ftscroller_x { display: inline-block }','.ftscroller_scrollbar { pointer-events: none; position: absolute; width: 5px; height: 5px; border: 1px solid rgba(255, 255, 255, 0.3); -webkit-border-radius: 3px; border-radius: 6px; opacity: 0; ' + _vendorCSSPrefix + 'transition: opacity 350ms; z-index: 10; -webkit-box-sizing: content-box; -moz-box-sizing: content-box; box-sizing: content-box }','.ftscroller_scrollbarx { bottom: 2px; left: 2px }','.ftscroller_scrollbary { right: 2px; top: 2px }','.ftscroller_scrollbarinner { height: 100%; background: #000; -webkit-border-radius: 2px; border-radius: 4px / 6px }','.ftscroller_scrollbar.active { opacity: 0.5; ' + _vendorCSSPrefix + 'transition: none; -o-transition: all 0 none }'];if(newStyleNode.styleSheet){newStyleNode.styleSheet.cssText = _styleText.join('\n');}else {newStyleNode.appendChild(document.createTextNode(_styleText.join('\n')));} // Add the stylesheet
	stylesheetContainerNode.insertBefore(newStyleNode,stylesheetContainerNode.firstChild);})(); /**
		 * Master constructor for the scrolling function, including which element to
		 * construct the scroller in, and any scrolling options.
		 * Note that app-wide options can also be set using a global FTScrollerOptions
		 * object.
		 */FTScroller = function(domNode,options){var key;var destroy,setSnapSize,scrollTo,scrollBy,updateDimensions,addEventListener,removeEventListener,setDisabledInputMethods,_startScroll,_updateScroll,_endScroll,_finalizeScroll,_interruptScroll,_flingScroll,_snapScroll,_getSnapPositionForIndexes,_getSnapIndexForPosition,_constrainAndRenderTargetScrollPosition,_limitToBounds,_initializeDOM,_existingDOMValid,_domChanged,_updateDimensions,_updateScrollbarDimensions,_updateElementPosition,_updateSegments,_setAxisPosition,_getPosition,_scheduleAxisPosition,_fireEvent,_childFocused,_modifyDistanceBeyondBounds,_distancesBeyondBounds,_startAnimation,_scheduleRender,_cancelAnimation,_addEventHandlers,_removeEventHandlers,_resetEventHandlers,_onTouchStart,_onTouchMove,_onTouchEnd,_onMouseDown,_onMouseMove,_onMouseUp,_onPointerDown,_onPointerMove,_onPointerUp,_onPointerCancel,_onPointerCaptureEnd,_onClick,_onMouseScroll,_captureInput,_releaseInputCapture,_getBoundingRect; /* Note that actual object instantiation occurs at the end of the closure to avoid jslint errors */ /*                         Options                       */var _instanceOptions={ // Whether to display scrollbars as appropriate
	scrollbars:true, // Enable scrolling on the X axis if content is available
	scrollingX:true, // Enable scrolling on the Y axis if content is available
	scrollingY:true, // The initial movement required to trigger a scroll, in pixels; this is the point at which
	// the scroll is exclusive to this particular FTScroller instance.
	scrollBoundary:1, // The initial movement required to trigger a visual indication that scrolling is occurring,
	// in pixels.  This is enforced to be less than or equal to the scrollBoundary, and is used to
	// define when the scroller starts drawing changes in response to an input, even if the scroll
	// is not treated as having begun/locked yet.
	scrollResponseBoundary:1, // Whether to always enable scrolling, even if the content of the scroller does not
	// require the scroller to function.  This makes the scroller behave more like an
	// element set to "overflow: scroll", with bouncing always occurring if enabled.
	alwaysScroll:false, // The content width to use when determining scroller dimensions.  If this
	// is false, the width will be detected based on the actual content.
	contentWidth:undefined, // The content height to use when determining scroller dimensions.  If this
	// is false, the height will be detected based on the actual content.
	contentHeight:undefined, // Enable snapping of content to 'pages' or a pixel grid
	snapping:false, // Define the horizontal interval of the pixel grid; snapping must be enabled for this to
	// take effect.  If this is not defined, snapping will use intervals based on container size.
	snapSizeX:undefined, // Define the vertical interval of the pixel grid; snapping must be enabled for this to
	// take effect.  If this is not defined, snapping will use intervals based on container size.
	snapSizeY:undefined, // Control whether snapping should be curtailed to only ever flick to the next page
	// and not beyond.  Snapping needs to be enabled for this to take effect.
	singlePageScrolls:false, // Allow scroll bouncing and elasticity near the ends and grid
	bouncing:true, // Allow a fast scroll to continue with momentum when released
	flinging:true, // Automatically detects changes to the contained markup and
	// updates its dimensions whenever the content changes. This is
	// set to false if a contentWidth or contentHeight are supplied.
	updateOnChanges:true, // Automatically catches changes to the window size and updates
	// its dimensions.
	updateOnWindowResize:false, // The alignment to use if the content is smaller than the container;
	// this also applies to initial positioning of scrollable content.
	// Valid alignments are -1 (top or left), 0 (center), and 1 (bottom or right).
	baseAlignments:{x:-1,y:-1}, // Whether to use a window scroll flag, eg window.foo, to control whether
	// to allow scrolling to start or now.  If the window flag is set to true,
	// this element will not start scrolling; this element will also toggle
	// the variable while scrolling
	windowScrollingActiveFlag:undefined, // Instead of always using translate3d for transforms, a mix of translate3d
	// and translate with a hardware acceleration class used to trigger acceleration
	// is used; this is to allow CSS inheritance to be used to allow dynamic
	// disabling of backing layers on older platforms.
	hwAccelerationClass:'ftscroller_hwaccelerated', // While use of requestAnimationFrame is highly recommended on platforms
	// which support it, it can result in the animation being a further half-frame
	// behind the input method, increasing perceived lag slightly.  To disable this,
	// set this property to false.
	enableRequestAnimationFrameSupport:true, // Set the maximum time (ms) that a fling can take to complete; if
	// this is not set, flings will complete instantly
	maxFlingDuration:1000, // Whether to disable any input methods; on some multi-input devices
	// custom behaviour may be desired for some scrollers.  Use with care!
	disabledInputMethods:{mouse:false,touch:false,scroll:false,pointer:false,focus:false}, // Define a scrolling class to be added to the scroller container
	// when scrolling is active.  Note that this can cause a relayout on
	// scroll start if defined, but allows custom styling in response to scrolls
	scrollingClassName:undefined, // Bezier curves defining the feel of the fling (momentum) deceleration,
	// the bounce decleration deceleration (as a fling exceeds the bounds),
	// and the bounce bezier (used for bouncing back).
	flingBezier:new CubicBezier(0.103,0.389,0.307,0.966),bounceDecelerationBezier:new CubicBezier(0,0.5,0.5,1),bounceBezier:new CubicBezier(0.7,0,0.9,0.6), // If the scroller is constrained to an x axis, convert y scroll to allow single-axis scroll
	// wheels to scroll constrained content.
	invertScrollWheel:true}; /*                     Local variables                   */ // Cache the DOM node and set up variables for other nodes
	var _publicSelf;var _self=this;var _scrollableMasterNode=domNode;var _containerNode;var _contentParentNode;var _scrollNodes={x:null,y:null};var _scrollbarNodes={x:null,y:null}; // Dimensions of the container element and the content element
	var _metrics={container:{x:null,y:null},content:{x:null,y:null,rawX:null,rawY:null},scrollEnd:{x:null,y:null}}; // Snapping details
	var _snapGridSize={x:false,y:false,userX:false,userY:false};var _snapIndex={x:0,y:0};var _baseSegment={x:0,y:0};var _activeSegment={x:0,y:0}; // Track the identifier of any input being tracked
	var _inputIdentifier=false;var _inputIndex=0;var _inputCaptured=false; // Current scroll positions and tracking
	var _isScrolling=false;var _isDisplayingScroll=false;var _isAnimating=false;var _baseScrollPosition={x:0,y:0};var _lastScrollPosition={x:0,y:0};var _targetScrollPosition={x:0,y:0};var _scrollAtExtremity={x:null,y:null};var _preventClick=false;var _timeouts=[];var _hasBeenScrolled=false; // Gesture details
	var _baseScrollableAxes={};var _scrollableAxes={x:true,y:true};var _gestureStart={x:0,y:0,t:0};var _cumulativeScroll={x:0,y:0};var _eventHistory=[]; // Allow certain events to be debounced
	var _domChangeDebouncer=false;var _scrollWheelEndDebouncer=false; // Performance switches on browsers supporting requestAnimationFrame
	var _animationFrameRequest=false;var _reqAnimationFrame=window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || false;var _cancelAnimationFrame=window.cancelAnimationFrame || window.cancelRequestAnimationFrame || window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame || window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.msCancelAnimationFrame || window.msCancelRequestAnimationFrame || false; // Event listeners
	var _eventListeners={'scrollstart':[],'scroll':[],'scrollend':[],'segmentwillchange':[],'segmentdidchange':[],'reachedstart':[],'reachedend':[],'scrollinteractionend':[]}; // MutationObserver instance, when supported and if DOM change sniffing is enabled
	var _mutationObserver; /* Parsing supplied options */ // Override default instance options with global - or closure'd - options
	if(typeof FTScrollerOptions === 'object' && FTScrollerOptions){for(key in FTScrollerOptions) {if(FTScrollerOptions.hasOwnProperty(key) && _instanceOptions.hasOwnProperty(key)){_instanceOptions[key] = FTScrollerOptions[key];}}} // Override default and global options with supplied options
	if(options){for(key in options) {if(options.hasOwnProperty(key)){ // If a deprecated flag was passed in, warn, and convert to the new flag name
	if('paginatedSnap' === key){console.warn('FTScroller: "paginatedSnap" is deprecated; converting to "singlePageScrolls"');_instanceOptions.singlePageScrolls = options.paginatedSnap;continue;}if(_instanceOptions.hasOwnProperty(key)){_instanceOptions[key] = options[key];}}} // If snap grid size options were supplied, store them
	if(options.hasOwnProperty('snapSizeX') && !isNaN(options.snapSizeX)){_snapGridSize.userX = _snapGridSize.x = options.snapSizeX;}if(options.hasOwnProperty('snapSizeY') && !isNaN(options.snapSizeY)){_snapGridSize.userY = _snapGridSize.y = options.snapSizeY;} // If content width and height were defined, disable updateOnChanges for performance
	if(options.contentWidth && options.contentHeight){options.updateOnChanges = false;}} // Validate the scroll response parameter
	_instanceOptions.scrollResponseBoundary = Math.min(_instanceOptions.scrollBoundary,_instanceOptions.scrollResponseBoundary); // Update base scrollable axes
	if(_instanceOptions.scrollingX){_baseScrollableAxes.x = true;}if(_instanceOptions.scrollingY){_baseScrollableAxes.y = true;} // Only enable animation frame support if the instance options permit it
	_reqAnimationFrame = _instanceOptions.enableRequestAnimationFrameSupport && _reqAnimationFrame;_cancelAnimationFrame = _reqAnimationFrame && _cancelAnimationFrame; /*                    Scoped Functions                   */ /**
			 * Unbinds all event listeners to prevent circular references preventing items
			 * from being deallocated, and clean up references to dom elements. Pass in
			 * "removeElements" to also remove FTScroller DOM elements for special reuse cases.
			 */destroy = function destroy(removeElements){var i,l;_removeEventHandlers();_cancelAnimation();if(_domChangeDebouncer){window.clearTimeout(_domChangeDebouncer);_domChangeDebouncer = false;}for(i = 0,l = _timeouts.length;i < l;i = i + 1) {window.clearTimeout(_timeouts[i]);}_timeouts.length = 0; // Destroy DOM elements if required
	if(removeElements && _scrollableMasterNode){while(_contentParentNode.firstChild) {_scrollableMasterNode.appendChild(_contentParentNode.firstChild);}_scrollableMasterNode.removeChild(_containerNode);}_scrollableMasterNode = null;_containerNode = null;_contentParentNode = null;_scrollNodes.x = null;_scrollNodes.y = null;_scrollbarNodes.x = null;_scrollbarNodes.y = null;for(i in _eventListeners) {if(_eventListeners.hasOwnProperty(i)){_eventListeners[i].length = 0;}} // If this is currently tracked as a scrolling instance, clear the flag
	if(_ftscrollerMoving && _ftscrollerMoving === _self){_ftscrollerMoving = false;if(_instanceOptions.windowScrollingActiveFlag){window[_instanceOptions.windowScrollingActiveFlag] = false;}}}; /**
			 * Configures the snapping boundaries within the scrolling element if
			 * snapping is active.  If this is never called, snapping defaults to
			 * using the bounding box, eg page-at-a-time.
			 */setSnapSize = function setSnapSize(width,height){_snapGridSize.userX = width;_snapGridSize.userY = height;_snapGridSize.x = width;_snapGridSize.y = height; // Ensure the content dimensions conform to the grid
	_metrics.content.x = Math.ceil(_metrics.content.rawX / width) * width;_metrics.content.y = Math.ceil(_metrics.content.rawY / height) * height;_metrics.scrollEnd.x = _metrics.container.x - _metrics.content.x;_metrics.scrollEnd.y = _metrics.container.y - _metrics.content.y;_updateScrollbarDimensions(); // Snap to the new grid if necessary
	_snapScroll();_updateSegments(true);}; /**
			 * Scroll to a supplied position, including whether or not to animate the
			 * scroll and how fast to perform the animation (pass in true to select a
			 * dynamic duration).  The inputs will be constrained to bounds and snapped.
			 * If false is supplied for a position, that axis will not be scrolled.
			 */scrollTo = function scrollTo(left,top,animationDuration){var targetPosition,duration,positions,axis,maxDuration=0,scrollPositionsToApply={}; // If a manual scroll is in progress, cancel it
	_endScroll(Date.now()); // Move supplied coordinates into an object for iteration, also inverting the values into
	// our coordinate system
	positions = {x:-left,y:-top};for(axis in _baseScrollableAxes) {if(_baseScrollableAxes.hasOwnProperty(axis)){targetPosition = positions[axis];if(targetPosition === false){continue;} // Constrain to bounds
	targetPosition = Math.min(0,Math.max(_metrics.scrollEnd[axis],targetPosition)); // Snap if appropriate
	if(_instanceOptions.snapping && _snapGridSize[axis]){targetPosition = Math.round(targetPosition / _snapGridSize[axis]) * _snapGridSize[axis];} // Get a duration
	duration = animationDuration || 0;if(duration === true){duration = Math.sqrt(Math.abs(_baseScrollPosition[axis] - targetPosition)) * 20;} // Trigger the position change
	_setAxisPosition(axis,targetPosition,duration);scrollPositionsToApply[axis] = targetPosition;maxDuration = Math.max(maxDuration,duration);}} // If the scroll had resulted in a change in position, perform some additional actions:
	if(_baseScrollPosition.x !== positions.x || _baseScrollPosition.y !== positions.y){ // Mark a scroll as having ever occurred
	_hasBeenScrolled = true; // If an animation duration is present, fire a scroll start event and a
	// scroll event for any listeners to act on
	_fireEvent('scrollstart',_getPosition());_fireEvent('scroll',_getPosition());}if(maxDuration){_timeouts.push(setTimeout(function(){var anAxis;for(anAxis in scrollPositionsToApply) {if(scrollPositionsToApply.hasOwnProperty(anAxis)){_lastScrollPosition[anAxis] = scrollPositionsToApply[anAxis];}}_finalizeScroll();},maxDuration));}else {_finalizeScroll();}}; /**
			 * Alter the current scroll position, including whether or not to animate
			 * the scroll and how fast to perform the animation (pass in true to
			 * select a dynamic duration).  The inputs will be checked against the
			 * current position.
			 */scrollBy = function scrollBy(horizontal,vertical,animationDuration){ // Wrap the scrollTo function for simplicity
	scrollTo(parseFloat(horizontal) - _baseScrollPosition.x,parseFloat(vertical) - _baseScrollPosition.y,animationDuration);}; /**
			 * Provide a public method to detect changes in dimensions for either the content or the
			 * container.
			 */updateDimensions = function updateDimensions(contentWidth,contentHeight,ignoreSnapScroll){options.contentWidth = contentWidth || options.contentWidth;options.contentHeight = contentHeight || options.contentHeight; // Currently just wrap the private API
	_updateDimensions(!!ignoreSnapScroll);}; /**
			 * Add an event handler for a supported event.  Current events include:
			 * scroll - fired whenever the scroll position changes
			 * scrollstart - fired when a scroll movement starts
			 * scrollend - fired when a scroll movement ends
			 * segmentwillchange - fired whenever the segment changes, including during scrolling
			 * segmentdidchange - fired when a segment has conclusively changed, after scrolling.
			 */addEventListener = function addEventListener(eventname,eventlistener){ // Ensure this is a valid event
	if(!_eventListeners.hasOwnProperty(eventname)){return false;} // Add the listener
	_eventListeners[eventname].push(eventlistener);return true;}; /**
			 * Remove an event handler for a supported event.  The listener must be exactly the same as
			 * an added listener to be removed.
			 */removeEventListener = function removeEventListener(eventname,eventlistener){var i; // Ensure this is a valid event
	if(!_eventListeners.hasOwnProperty(eventname)){return false;}for(i = _eventListeners[eventname].length;i >= 0;i = i - 1) {if(_eventListeners[eventname][i] === eventlistener){_eventListeners[eventname].splice(i,1);}}return true;}; /**
			 * Set the input methods to disable. No inputs methods are disabled by default.
			 * (object, default { mouse: false, touch: false, scroll: false, pointer: false, focus: false })
			 */setDisabledInputMethods = function setDisabledInputMethods(disabledInputMethods){var i,changed;for(i in _instanceOptions.disabledInputMethods) {disabledInputMethods[i] = !!disabledInputMethods[i];if(_instanceOptions.disabledInputMethods[i] !== disabledInputMethods[i])changed = true;_instanceOptions.disabledInputMethods[i] = disabledInputMethods[i];}if(changed){_resetEventHandlers();}}; /**
			 * Start a scroll tracking input - this could be mouse, webkit-style touch,
			 * or ms-style pointer events.
			 */_startScroll = function _startScroll(inputX,inputY,inputTime,rawEvent){var triggerScrollInterrupt=_isAnimating; // Opera fix
	if(inputTime <= 0){inputTime = Date.now();} // If a window scrolling flag is set, and evaluates to true, don't start checking touches
	if(_instanceOptions.windowScrollingActiveFlag && window[_instanceOptions.windowScrollingActiveFlag]){return false;} // If an animation is in progress, stop the scroll.
	if(triggerScrollInterrupt){_interruptScroll();}else { // Allow clicks again, but only if a scroll was not interrupted
	_preventClick = false;} // Store the initial event coordinates
	_gestureStart.x = inputX;_gestureStart.y = inputY;_gestureStart.t = inputTime;_targetScrollPosition.x = _lastScrollPosition.x;_targetScrollPosition.y = _lastScrollPosition.y; // Clear event history and add the start touch
	_eventHistory.length = 0;_eventHistory.push({x:inputX,y:inputY,t:inputTime});if(triggerScrollInterrupt){_updateScroll(inputX,inputY,inputTime,rawEvent,triggerScrollInterrupt);}return true;}; /**
			 * Continue a scroll as a result of an updated position
			 */_updateScroll = function _updateScroll(inputX,inputY,inputTime,rawEvent,scrollInterrupt){var axis,otherScrollerActive,distancesBeyondBounds;var initialScroll=false;var gesture={x:inputX - _gestureStart.x,y:inputY - _gestureStart.y}; // Opera fix
	if(inputTime <= 0){inputTime = Date.now();} // Update base target positions
	_targetScrollPosition.x = _baseScrollPosition.x + gesture.x;_targetScrollPosition.y = _baseScrollPosition.y + gesture.y; // If scrolling has not yet locked to this scroller, check whether to stop scrolling
	if(!_isScrolling){ // Check the internal flag to determine if another FTScroller is scrolling
	if(_ftscrollerMoving && _ftscrollerMoving !== _self){otherScrollerActive = true;} // Otherwise, check the window scrolling flag to see if anything else has claimed scrolling
	else if(_instanceOptions.windowScrollingActiveFlag && window[_instanceOptions.windowScrollingActiveFlag]){otherScrollerActive = true;} // If another scroller was active, clean up and stop processing.
	if(otherScrollerActive){_releaseInputCapture();_inputIdentifier = false;if(_isDisplayingScroll){_cancelAnimation();if(!_snapScroll(true)){_finalizeScroll(true);}}return;}} // If not yet displaying a scroll, determine whether that triggering boundary
	// has been exceeded
	if(!_isDisplayingScroll){ // Determine scroll distance beyond bounds
	distancesBeyondBounds = _distancesBeyondBounds(_targetScrollPosition); // Determine whether to prevent the default scroll event - if the scroll could still
	// be triggered, prevent the default to avoid problems (particularly on PlayBook)
	if(_instanceOptions.bouncing || scrollInterrupt || _scrollableAxes.x && gesture.x && distancesBeyondBounds.x < 0 || _scrollableAxes.y && gesture.y && distancesBeyondBounds.y < 0){rawEvent.preventDefault();} // Check scrolled distance against the boundary limit to see if scrolling can be triggered.
	// If the scroll has been interrupted, trigger at once
	if(!scrollInterrupt && (!_scrollableAxes.x || Math.abs(gesture.x) < _instanceOptions.scrollResponseBoundary) && (!_scrollableAxes.y || Math.abs(gesture.y) < _instanceOptions.scrollResponseBoundary)){return;} // If bouncing is disabled, and already at an edge and scrolling beyond the edge, ignore the scroll for
	// now - this allows other scrollers to claim if appropriate, allowing nicer nested scrolls.
	if(!_instanceOptions.bouncing && !scrollInterrupt && (!_scrollableAxes.x || !gesture.x || distancesBeyondBounds.x > 0) && (!_scrollableAxes.y || !gesture.y || distancesBeyondBounds.y > 0)){ // Prevent the original click now that scrolling would be triggered
	_preventClick = true;return;} // Trigger the start of visual scrolling
	_startAnimation();_isDisplayingScroll = true;_hasBeenScrolled = true;_isAnimating = true;initialScroll = true;}else { // Prevent the event default.  It is safe to call this in IE10 because the event is never
	// a window.event, always a "true" event.
	rawEvent.preventDefault();} // If not yet locked to a scroll, determine whether to do so
	if(!_isScrolling){ // If the gesture distance has exceeded the scroll lock distance, or snapping is active
	// and the scroll has been interrupted, enter exclusive scrolling.
	if(scrollInterrupt && _instanceOptions.snapping || _scrollableAxes.x && Math.abs(gesture.x) >= _instanceOptions.scrollBoundary || _scrollableAxes.y && Math.abs(gesture.y) >= _instanceOptions.scrollBoundary){_isScrolling = true;_preventClick = true;_ftscrollerMoving = _self;if(_instanceOptions.windowScrollingActiveFlag){window[_instanceOptions.windowScrollingActiveFlag] = _self;}_fireEvent('scrollstart',_getPosition());}} // Capture pointer if necessary
	if(_isScrolling){_captureInput();} // Cancel text selections while dragging a cursor
	if(_canClearSelection){window.getSelection().removeAllRanges();} // Ensure the target scroll position is affected by bounds and render if needed
	_constrainAndRenderTargetScrollPosition(); // To aid render/draw coalescing, perform other one-off actions here
	if(initialScroll){if(gesture.x > 0){_baseScrollPosition.x -= _instanceOptions.scrollResponseBoundary;}else if(gesture.x < 0){_baseScrollPosition.x += _instanceOptions.scrollResponseBoundary;}if(gesture.y > 0){_baseScrollPosition.y -= _instanceOptions.scrollResponseBoundary;}else if(gesture.y < 0){_baseScrollPosition.y += _instanceOptions.scrollResponseBoundary;}_targetScrollPosition.x = _baseScrollPosition.x + gesture.x;_targetScrollPosition.y = _baseScrollPosition.y + gesture.y;if(_instanceOptions.scrollingClassName){_containerNode.className += ' ' + _instanceOptions.scrollingClassName;}if(_instanceOptions.scrollbars){for(axis in _scrollableAxes) {if(_scrollableAxes.hasOwnProperty(axis)){_scrollbarNodes[axis].className += ' active';}}}} // Add an event to the event history, keeping it around twenty events long
	_eventHistory.push({x:inputX,y:inputY,t:inputTime});if(_eventHistory.length > 30){_eventHistory.splice(0,15);}}; /**
			 * Complete a scroll with a final event time if available (it may
			 * not be, depending on the input type); this may continue the scroll
			 * with a fling and/or bounceback depending on options.
			 */_endScroll = function _endScroll(inputTime,rawEvent){_releaseInputCapture();_inputIdentifier = false;_cancelAnimation();_fireEvent('scrollinteractionend',{});if(!_isScrolling){if(!_snapScroll(true) && _isDisplayingScroll){_finalizeScroll(true);}return;} // Modify the last movement event to include the end event time
	_eventHistory[_eventHistory.length - 1].t = inputTime; // Update flags
	_isScrolling = false;_isDisplayingScroll = false;_ftscrollerMoving = false;if(_instanceOptions.windowScrollingActiveFlag){window[_instanceOptions.windowScrollingActiveFlag] = false;} // Stop the event default.  It is safe to call this in IE10 because
	// the event is never a window.event, always a "true" event.
	if(rawEvent){rawEvent.preventDefault();} // Trigger a fling or bounceback if necessary
	if(!_flingScroll() && !_snapScroll()){_finalizeScroll();}}; /**
			 * Remove the scrolling class, cleaning up display.
			 */_finalizeScroll = function _finalizeScroll(scrollCancelled){var i,l,axis,scrollEvent,scrollRegex;_isAnimating = false;_isDisplayingScroll = false; // Remove scrolling class if set
	if(_instanceOptions.scrollingClassName){scrollRegex = new RegExp('(?:^|\\s)' + _instanceOptions.scrollingClassName + '(?!\\S)','g');_containerNode.className = _containerNode.className.replace(scrollRegex,'');}if(_instanceOptions.scrollbars){for(axis in _scrollableAxes) {if(_scrollableAxes.hasOwnProperty(axis)){_scrollbarNodes[axis].className = _scrollbarNodes[axis].className.replace(/ ?active/g,'');}}} // Store final position if scrolling occurred
	_baseScrollPosition.x = _lastScrollPosition.x;_baseScrollPosition.y = _lastScrollPosition.y;scrollEvent = _getPosition();if(!scrollCancelled){_fireEvent('scroll',scrollEvent);_updateSegments(true);} // Always fire the scroll end event, including an argument indicating whether
	// the scroll was cancelled
	scrollEvent.cancelled = scrollCancelled;_fireEvent('scrollend',scrollEvent); // Restore transitions
	for(axis in _scrollableAxes) {if(_scrollableAxes.hasOwnProperty(axis)){_scrollNodes[axis].style[_transitionProperty] = '';if(_instanceOptions.scrollbars){_scrollbarNodes[axis].style[_transitionProperty] = '';}}} // Clear any remaining timeouts
	for(i = 0,l = _timeouts.length;i < l;i = i + 1) {window.clearTimeout(_timeouts[i]);}_timeouts.length = 0;}; /**
			 * Interrupt a current scroll, allowing a start scroll during animation to trigger a new scroll
			 */_interruptScroll = function _interruptScroll(){var axis,i,l;_isAnimating = false; // Update the stored base position
	_updateElementPosition(); // Ensure the parsed positions are set, also clearing transitions
	for(axis in _scrollableAxes) {if(_scrollableAxes.hasOwnProperty(axis)){_setAxisPosition(axis,_baseScrollPosition[axis],16,_instanceOptions.bounceDecelerationBezier);}} // Update segment tracking if snapping is active
	_updateSegments(false); // Clear any remaining timeouts
	for(i = 0,l = _timeouts.length;i < l;i = i + 1) {window.clearTimeout(_timeouts[i]);}_timeouts.length = 0;}; /**
			 * Determine whether a scroll fling or bounceback is required, and set up the styles and
			 * timeouts required.
			 */_flingScroll = function _flingScroll(){var i,axis,movementTime,movementSpeed,lastPosition,comparisonPosition,flingDuration,flingDistance,flingPosition,bounceDelay,bounceDistance,bounceDuration,bounceTarget,boundsBounce,modifiedDistance,flingBezier,timeProportion,boundsCrossDelay,flingStartSegment,beyondBoundsFlingDistance,baseFlingComponent;var maxAnimationTime=0;var moveRequired=false;var scrollPositionsToApply={}; // If we only have the start event available, or flinging is disabled,
	// or the scroll was triggered by a scrollwheel, no action required.
	if(_eventHistory.length === 1 || !_instanceOptions.flinging || _inputIdentifier === 'scrollwheel'){return false;}for(axis in _scrollableAxes) {if(_scrollableAxes.hasOwnProperty(axis)){bounceDuration = 350;bounceDistance = 0;boundsBounce = false;bounceTarget = false;boundsCrossDelay = undefined; // Re-set a default bezier curve for the animation for potential modification
	flingBezier = _instanceOptions.flingBezier; // Get the last movement speed, in pixels per millisecond.  To do this, look at the events
	// in the last 100ms and average out the speed, using a minimum number of two points.
	lastPosition = _eventHistory[_eventHistory.length - 1];comparisonPosition = _eventHistory[_eventHistory.length - 2];for(i = _eventHistory.length - 3;i >= 0;i = i - 1) {if(lastPosition.t - _eventHistory[i].t > 100){break;}comparisonPosition = _eventHistory[i];} // Get the last movement time.  If this is zero - as can happen with
	// some scrollwheel events on some platforms - increase it to 16ms as
	// if the movement occurred over a single frame at 60fps.
	movementTime = lastPosition.t - comparisonPosition.t;if(!movementTime){movementTime = 16;} // Derive the movement speed
	movementSpeed = (lastPosition[axis] - comparisonPosition[axis]) / movementTime; // If there is little speed, no further action required except for a bounceback, below.
	if(Math.abs(movementSpeed) < _kMinimumSpeed){flingDuration = 0;flingDistance = 0;}else { /* Calculate the fling duration.  As per TouchScroll, the speed at any particular
							point in time can be calculated as:
								{ speed } = { initial speed } * ({ friction } to the power of { duration })
							...assuming all values are in equal pixels/millisecond measurements.  As we know the
							minimum target speed, this can be altered to:
								{ duration } = log( { speed } / { initial speed } ) / log( { friction } )
							*/flingDuration = Math.log(_kMinimumSpeed / Math.abs(movementSpeed)) / Math.log(_kFriction); /* Calculate the fling distance (before any bouncing or snapping).  As per
							TouchScroll, the total distance covered can be approximated by summing
							the distance per millisecond, per millisecond of duration - a divergent series,
							and so rather tricky to model otherwise!
							So using values in pixels per millisecond:
								{ distance } = { initial speed } * (1 - ({ friction } to the power
									of { duration + 1 }) / (1 - { friction })
							*/flingDistance = movementSpeed * (1 - Math.pow(_kFriction,flingDuration + 1)) / (1 - _kFriction);} // Determine a target fling position
	flingPosition = Math.floor(_lastScrollPosition[axis] + flingDistance); // If bouncing is disabled, and the last scroll position and fling position are both at a bound,
	// reset the fling position to the bound
	if(!_instanceOptions.bouncing){if(_lastScrollPosition[axis] === 0 && flingPosition > 0){flingPosition = 0;}else if(_lastScrollPosition[axis] === _metrics.scrollEnd[axis] && flingPosition < _lastScrollPosition[axis]){flingPosition = _lastScrollPosition[axis];}} // In single-page-scroll mode, determine the page to snap to - maximum one page
	// in either direction from the *start* page.
	if(_instanceOptions.singlePageScrolls && _instanceOptions.snapping){flingStartSegment = -_lastScrollPosition[axis] / _snapGridSize[axis];if(_baseSegment[axis] < flingStartSegment){flingStartSegment = Math.floor(flingStartSegment);}else {flingStartSegment = Math.ceil(flingStartSegment);} // If the target position will end up beyond another page, target that page edge
	if(flingPosition > -(_baseSegment[axis] - 1) * _snapGridSize[axis]){bounceDistance = flingPosition + (_baseSegment[axis] - 1) * _snapGridSize[axis];}else if(flingPosition < -(_baseSegment[axis] + 1) * _snapGridSize[axis]){bounceDistance = flingPosition + (_baseSegment[axis] + 1) * _snapGridSize[axis]; // Otherwise, if the movement speed was above the minimum velocity, continue
	// in the move direction.
	}else if(Math.abs(movementSpeed) > _kMinimumSpeed){ // Determine the target segment
	if(movementSpeed < 0){flingPosition = Math.floor(_lastScrollPosition[axis] / _snapGridSize[axis]) * _snapGridSize[axis];}else {flingPosition = Math.ceil(_lastScrollPosition[axis] / _snapGridSize[axis]) * _snapGridSize[axis];}flingDuration = Math.min(_instanceOptions.maxFlingDuration,flingDuration * (flingPosition - _lastScrollPosition[axis]) / flingDistance);} // In non-paginated snapping mode, snap to the nearest grid location to the target
	}else if(_instanceOptions.snapping){bounceDistance = flingPosition - Math.round(flingPosition / _snapGridSize[axis]) * _snapGridSize[axis];} // Deal with cases where the target is beyond the bounds
	if(flingPosition - bounceDistance > 0){bounceDistance = flingPosition;boundsBounce = true;}else if(flingPosition - bounceDistance < _metrics.scrollEnd[axis]){bounceDistance = flingPosition - _metrics.scrollEnd[axis];boundsBounce = true;} // Amend the positions and bezier curve if necessary
	if(bounceDistance){ // If the fling moves the scroller beyond the normal scroll bounds, and
	// the bounce is snapping the scroll back after the fling:
	if(boundsBounce && _instanceOptions.bouncing && flingDistance){flingDistance = Math.floor(flingDistance);if(flingPosition > 0){beyondBoundsFlingDistance = flingPosition - Math.max(0,_lastScrollPosition[axis]);}else {beyondBoundsFlingDistance = flingPosition - Math.min(_metrics.scrollEnd[axis],_lastScrollPosition[axis]);}baseFlingComponent = flingDistance - beyondBoundsFlingDistance; // Determine the time proportion the original bound is along the fling curve
	if(!flingDistance || !flingDuration){timeProportion = 0;}else {timeProportion = flingBezier._getCoordinateForT(flingBezier.getTForY((flingDistance - beyondBoundsFlingDistance) / flingDistance,1 / flingDuration),flingBezier._p1.x,flingBezier._p2.x);boundsCrossDelay = timeProportion * flingDuration;} // Eighth the distance beyonds the bounds
	modifiedDistance = Math.ceil(beyondBoundsFlingDistance / 8); // Further limit the bounce to half the container dimensions
	if(Math.abs(modifiedDistance) > _metrics.container[axis] / 2){if(modifiedDistance < 0){modifiedDistance = -Math.floor(_metrics.container[axis] / 2);}else {modifiedDistance = Math.floor(_metrics.container[axis] / 2);}}if(flingPosition > 0){bounceTarget = 0;}else {bounceTarget = _metrics.scrollEnd[axis];} // If the entire fling is a bounce, modify appropriately
	if(timeProportion === 0){flingDuration = flingDuration / 6;flingPosition = _lastScrollPosition[axis] + baseFlingComponent + modifiedDistance;bounceDelay = flingDuration; // Otherwise, take a new curve and add it to the timeout stack for the bounce
	}else { // The new bounce delay is the pre-boundary fling duration, plus a
	// sixth of the post-boundary fling.
	bounceDelay = (timeProportion + (1 - timeProportion) / 6) * flingDuration;_scheduleAxisPosition(axis,_lastScrollPosition[axis] + baseFlingComponent + modifiedDistance,(1 - timeProportion) * flingDuration / 6,_instanceOptions.bounceDecelerationBezier,boundsCrossDelay); // Modify the fling to match, clipping to prevent over-fling
	flingBezier = flingBezier.divideAtX(bounceDelay / flingDuration,1 / flingDuration)[0];flingDuration = bounceDelay;flingPosition = _lastScrollPosition[axis] + baseFlingComponent + modifiedDistance;} // If the fling requires snapping to a snap location, and the bounce needs to
	// reverse the fling direction after the fling completes:
	}else if(flingDistance < 0 && bounceDistance < flingDistance || flingDistance > 0 && bounceDistance > flingDistance){ // Shorten the original fling duration to reflect the bounce
	flingPosition = flingPosition - Math.floor(flingDistance / 2);bounceDistance = bounceDistance - Math.floor(flingDistance / 2);bounceDuration = Math.sqrt(Math.abs(bounceDistance)) * 50;bounceTarget = flingPosition - bounceDistance;flingDuration = 350;bounceDelay = flingDuration * 0.97; // If the bounce is truncating the fling, or continuing the fling on in the same
	// direction to hit the next boundary:
	}else {flingPosition = flingPosition - bounceDistance; // If there was no fling distance originally, use the bounce details
	if(!flingDistance){flingDuration = bounceDuration; // If truncating the fling at a snapping edge:
	}else if(flingDistance < 0 && bounceDistance < 0 || flingDistance > 0 && bounceDistance > 0){timeProportion = flingBezier._getCoordinateForT(flingBezier.getTForY((Math.abs(flingDistance) - Math.abs(bounceDistance)) / Math.abs(flingDistance),1 / flingDuration),flingBezier._p1.x,flingBezier._p2.x);flingBezier = flingBezier.divideAtX(timeProportion,1 / flingDuration)[0];flingDuration = Math.round(flingDuration * timeProportion); // If extending the fling to reach the next snapping boundary, no further
	// action is required.
	}bounceDistance = 0;bounceDuration = 0;}} // If no fling or bounce is required, continue
	if(flingPosition === _lastScrollPosition[axis] && !bounceDistance){continue;}moveRequired = true; // Perform the fling
	_setAxisPosition(axis,flingPosition,flingDuration,flingBezier,boundsCrossDelay); // Schedule a bounce if appropriate
	if(bounceDistance && bounceDuration){_scheduleAxisPosition(axis,bounceTarget,bounceDuration,_instanceOptions.bounceBezier,bounceDelay);}maxAnimationTime = Math.max(maxAnimationTime,bounceDistance?bounceDelay + bounceDuration:flingDuration);scrollPositionsToApply[axis] = bounceTarget === false?flingPosition:bounceTarget;}}if(moveRequired && maxAnimationTime){_timeouts.push(setTimeout(function(){var anAxis; // Update the stored scroll position ready for finalising
	for(anAxis in scrollPositionsToApply) {if(scrollPositionsToApply.hasOwnProperty(anAxis)){_lastScrollPosition[anAxis] = scrollPositionsToApply[anAxis];}}_finalizeScroll();},maxAnimationTime));}return moveRequired;}; /**
			 * Bounce back into bounds if necessary, or snap to a grid location.
			 */_snapScroll = function _snapScroll(scrollCancelled){var axis;var snapDuration=scrollCancelled?100:350;var targetPosition=_lastScrollPosition; // Get the current position and see if a snap is required
	if(_instanceOptions.snapping){ // Store current snap index
	_snapIndex = _getSnapIndexForPosition(targetPosition);targetPosition = _getSnapPositionForIndexes(_snapIndex,targetPosition);}targetPosition = _limitToBounds(targetPosition);var snapRequired=false;for(axis in _baseScrollableAxes) {if(_baseScrollableAxes.hasOwnProperty(axis)){if(targetPosition[axis] !== _lastScrollPosition[axis]){snapRequired = true;}}}if(!snapRequired){return false;} // Perform the snap
	for(axis in _baseScrollableAxes) {if(_baseScrollableAxes.hasOwnProperty(axis)){_setAxisPosition(axis,targetPosition[axis],snapDuration);}}_timeouts.push(setTimeout(function(){ // Update the stored scroll position ready for finalizing
	_lastScrollPosition = targetPosition;_finalizeScroll(scrollCancelled);},snapDuration));return true;}; /**
			 * Get an appropriate snap index for a supplied point.
			 */_getSnapIndexForPosition = function _getSnapIndexForPosition(coordinates){var axis;var indexes={x:0,y:0};for(axis in _scrollableAxes) {if(_scrollableAxes.hasOwnProperty(axis) && _snapGridSize[axis]){indexes[axis] = Math.round(coordinates[axis] / _snapGridSize[axis]);}}return indexes;}; /**
			 * Get an appropriate snap point for a supplied index.
			 */_getSnapPositionForIndexes = function _getSnapPositionForIndexes(indexes,currentCoordinates){var axis;var coordinatesToReturn={x:currentCoordinates.x,y:currentCoordinates.y};for(axis in _scrollableAxes) {if(_scrollableAxes.hasOwnProperty(axis)){coordinatesToReturn[axis] = indexes[axis] * _snapGridSize[axis];}}return coordinatesToReturn;}; /**
			 * Update the scroll position while scrolling is active, checking the position
			 * within bounds and rubberbanding/constraining as appropriate; also triggers a
			 * scroll position render if a requestAnimationFrame loop isn't active
			 */_constrainAndRenderTargetScrollPosition = function _constrainAndRenderTargetScrollPosition(){var axis,upperBound,lowerBound; // Update axes target positions if beyond bounds
	for(axis in _scrollableAxes) {if(_scrollableAxes.hasOwnProperty(axis)){ // Set bounds to the left and right of the container
	upperBound = 0;lowerBound = _metrics.scrollEnd[axis];if(_instanceOptions.singlePageScrolls && _instanceOptions.snapping){ // For a single-page-scroll, set the bounds to the left and right of the
	// current segment
	upperBound = Math.min(upperBound,-(_baseSegment[axis] - 1) * _snapGridSize[axis]);lowerBound = Math.max(lowerBound,-(_baseSegment[axis] + 1) * _snapGridSize[axis]);}if(_targetScrollPosition[axis] > upperBound){_targetScrollPosition[axis] = upperBound + _modifyDistanceBeyondBounds(_targetScrollPosition[axis] - upperBound,axis);}else if(_targetScrollPosition[axis] < lowerBound){_targetScrollPosition[axis] = lowerBound + _modifyDistanceBeyondBounds(_targetScrollPosition[axis] - lowerBound,axis);}}} // Trigger a scroll position update for platforms not using requestAnimationFrames
	if(!_reqAnimationFrame){_scheduleRender();}}; /**
			 * Limit coordinates within the bounds of the scrollable viewport.
			 */_limitToBounds = function _limitToBounds(coordinates){var axis;var coordinatesToReturn={x:coordinates.x,y:coordinates.y};for(axis in _scrollableAxes) {if(_scrollableAxes.hasOwnProperty(axis)){ // If the coordinate is beyond the edges of the scroller, use the closest edge
	if(coordinates[axis] > 0){coordinatesToReturn[axis] = 0;continue;}if(coordinates[axis] < _metrics.scrollEnd[axis]){coordinatesToReturn[axis] = _metrics.scrollEnd[axis];continue;}}}return coordinatesToReturn;}; /**
			 * Sets up the DOM around the node to be scrolled.
			 */_initializeDOM = function _initializeDOM(){var offscreenFragment,offscreenNode,scrollYParent; // Check whether the DOM is already present and valid - if so, no further action required.
	if(_existingDOMValid()){return;} // Otherwise, the DOM needs to be created inside the originally supplied node.  The node
	// has a container inserted inside it - which acts as an anchor element with constraints -
	// and then the scrollable layers as appropriate.
	// Create a new document fragment to temporarily hold the scrollable content
	offscreenFragment = _scrollableMasterNode.ownerDocument.createDocumentFragment();offscreenNode = document.createElement('DIV');offscreenFragment.appendChild(offscreenNode); // Drop in the wrapping HTML
	offscreenNode.innerHTML = FTScroller.prototype.getPrependedHTML(!_instanceOptions.scrollingX,!_instanceOptions.scrollingY,_instanceOptions.hwAccelerationClass) + FTScroller.prototype.getAppendedHTML(!_instanceOptions.scrollingX,!_instanceOptions.scrollingY,_instanceOptions.hwAccelerationClass,_instanceOptions.scrollbars); // Update references as appropriate
	_containerNode = offscreenNode.firstElementChild;scrollYParent = _containerNode;if(_instanceOptions.scrollingX){_scrollNodes.x = _containerNode.firstElementChild;scrollYParent = _scrollNodes.x;if(_instanceOptions.scrollbars){_scrollbarNodes.x = _containerNode.getElementsByClassName('ftscroller_scrollbarx')[0];}}if(_instanceOptions.scrollingY){_scrollNodes.y = scrollYParent.firstElementChild;if(_instanceOptions.scrollbars){_scrollbarNodes.y = _containerNode.getElementsByClassName('ftscroller_scrollbary')[0];}_contentParentNode = _scrollNodes.y;}else {_contentParentNode = _scrollNodes.x;} // Take the contents of the scrollable element, and copy them into the new container
	while(_scrollableMasterNode.firstChild) {_contentParentNode.appendChild(_scrollableMasterNode.firstChild);} // Move the wrapped elements back into the document
	_scrollableMasterNode.appendChild(_containerNode);}; /**
			 * Attempts to use any existing DOM scroller nodes if possible, returning true if so;
			 * updates all internal element references.
			 */_existingDOMValid = function _existingDOMValid(){var scrollerContainer,layerX,layerY,yParent,scrollerX,scrollerY,candidates,i,l; // Check that there's an initial child node, and make sure it's the container class
	scrollerContainer = _scrollableMasterNode.firstElementChild;if(!scrollerContainer || scrollerContainer.className.indexOf('ftscroller_container') === -1){return;} // If x-axis scrolling is enabled, find and verify the x scroller layer
	if(_instanceOptions.scrollingX){ // Find and verify the x scroller layer
	layerX = scrollerContainer.firstElementChild;if(!layerX || layerX.className.indexOf('ftscroller_x') === -1){return;}yParent = layerX; // Find and verify the x scrollbar if enabled
	if(_instanceOptions.scrollbars){candidates = scrollerContainer.getElementsByClassName('ftscroller_scrollbarx');if(candidates){for(i = 0,l = candidates.length;i < l;i = i + 1) {if(candidates[i].parentNode === scrollerContainer){scrollerX = candidates[i];break;}}}if(!scrollerX){return;}}}else {yParent = scrollerContainer;} // If y-axis scrolling is enabled, find and verify the y scroller layer
	if(_instanceOptions.scrollingY){ // Find and verify the x scroller layer
	layerY = yParent.firstElementChild;if(!layerY || layerY.className.indexOf('ftscroller_y') === -1){return;} // Find and verify the y scrollbar if enabled
	if(_instanceOptions.scrollbars){candidates = scrollerContainer.getElementsByClassName('ftscroller_scrollbary');if(candidates){for(i = 0,l = candidates.length;i < l;i = i + 1) {if(candidates[i].parentNode === scrollerContainer){scrollerY = candidates[i];break;}}}if(!scrollerY){return;}}} // Elements found and verified - update the references and return success
	_containerNode = scrollerContainer;if(layerX){_scrollNodes.x = layerX;}if(layerY){_scrollNodes.y = layerY;}if(scrollerX){_scrollbarNodes.x = scrollerX;}if(scrollerY){_scrollbarNodes.y = scrollerY;}if(_instanceOptions.scrollingY){_contentParentNode = layerY;}else {_contentParentNode = layerX;}return true;};_domChanged = function _domChanged(e){ // If the timer is active, clear it
	if(_domChangeDebouncer){window.clearTimeout(_domChangeDebouncer);} // React to resizes at once
	if(e && e.type === 'resize'){_updateDimensions(); // For other changes, which may occur in groups, set up the DOM changed timer
	}else {_domChangeDebouncer = setTimeout(function(){_updateDimensions();},100);}};_updateDimensions = function _updateDimensions(ignoreSnapScroll){var axis; // Only update dimensions if the container node exists (DOM elements can go away if
	// the scroller instance is not destroyed correctly)
	if(!_containerNode || !_contentParentNode){return false;}if(_domChangeDebouncer){window.clearTimeout(_domChangeDebouncer);_domChangeDebouncer = false;}var containerWidth,containerHeight,startAlignments; // Calculate the starting alignment for comparison later
	startAlignments = {x:false,y:false};for(axis in startAlignments) {if(startAlignments.hasOwnProperty(axis)){if(_lastScrollPosition[axis] === 0){startAlignments[axis] = -1;}else if(_lastScrollPosition[axis] <= _metrics.scrollEnd[axis]){startAlignments[axis] = 1;}else if(_lastScrollPosition[axis] * 2 <= _metrics.scrollEnd[axis] + 5 && _lastScrollPosition[axis] * 2 >= _metrics.scrollEnd[axis] - 5){startAlignments[axis] = 0;}}}containerWidth = _containerNode.offsetWidth;containerHeight = _containerNode.offsetHeight; // Grab the dimensions
	var rawScrollWidth=options.contentWidth || _contentParentNode.offsetWidth;var rawScrollHeight=options.contentHeight || _contentParentNode.offsetHeight;var scrollWidth=rawScrollWidth;var scrollHeight=rawScrollHeight;var targetPosition={x:_lastScrollPosition.x,y:_lastScrollPosition.y}; // Update snap grid
	if(!_snapGridSize.userX){_snapGridSize.x = containerWidth;}if(!_snapGridSize.userY){_snapGridSize.y = containerHeight;} // If there is a grid, conform to the grid
	if(_instanceOptions.snapping){if(_snapGridSize.userX){scrollWidth = Math.ceil(scrollWidth / _snapGridSize.userX) * _snapGridSize.userX;}else {scrollWidth = Math.ceil(scrollWidth / _snapGridSize.x) * _snapGridSize.x;}if(_snapGridSize.userY){scrollHeight = Math.ceil(scrollHeight / _snapGridSize.userY) * _snapGridSize.userY;}else {scrollHeight = Math.ceil(scrollHeight / _snapGridSize.y) * _snapGridSize.y;}} // If no details have changed, return.
	if(_metrics.container.x === containerWidth && _metrics.container.y === containerHeight && _metrics.content.x === scrollWidth && _metrics.content.y === scrollHeight){return;} // Update the sizes
	_metrics.container.x = containerWidth;_metrics.container.y = containerHeight;_metrics.content.x = scrollWidth;_metrics.content.rawX = rawScrollWidth;_metrics.content.y = scrollHeight;_metrics.content.rawY = rawScrollHeight;_metrics.scrollEnd.x = containerWidth - scrollWidth;_metrics.scrollEnd.y = containerHeight - scrollHeight;_updateScrollbarDimensions(); // If scrolling is in progress, trigger a scroll update
	if(_isScrolling){_lastScrollPosition.x--;_lastScrollPosition.y--;_constrainAndRenderTargetScrollPosition(); // If scrolling *isn't* in progress, snap and realign.
	}else {if(!ignoreSnapScroll && _instanceOptions.snapping){ // Ensure bounds are correct
	_updateSegments();targetPosition = _getSnapPositionForIndexes(_snapIndex,_lastScrollPosition);} // Apply base alignment if appropriate
	for(axis in targetPosition) {if(targetPosition.hasOwnProperty(axis)){ // If the container is smaller than the content, determine whether to apply the
	// alignment.  This occurs if a scroll has never taken place, or if the position
	// was previously at the correct "end" and can be maintained.
	if(_metrics.container[axis] < _metrics.content[axis]){if(_hasBeenScrolled && _instanceOptions.baseAlignments[axis] !== startAlignments[axis]){continue;}} // Apply the alignment
	if(_instanceOptions.baseAlignments[axis] === 1){targetPosition[axis] = _metrics.scrollEnd[axis];}else if(_instanceOptions.baseAlignments[axis] === 0){targetPosition[axis] = Math.floor(_metrics.scrollEnd[axis] / 2);}else if(_instanceOptions.baseAlignments[axis] === -1){targetPosition[axis] = 0;}}} // Limit to bounds
	targetPosition = _limitToBounds(targetPosition);if(_instanceOptions.scrollingX && targetPosition.x !== _lastScrollPosition.x){_setAxisPosition('x',targetPosition.x,0);_baseScrollPosition.x = targetPosition.x;}if(_instanceOptions.scrollingY && targetPosition.y !== _lastScrollPosition.y){_setAxisPosition('y',targetPosition.y,0);_baseScrollPosition.y = targetPosition.y;}}};_updateScrollbarDimensions = function _updateScrollbarDimensions(){ // Update scrollbar sizes
	if(_instanceOptions.scrollbars){if(_instanceOptions.scrollingX){_scrollbarNodes.x.style.width = Math.max(6,Math.round(_metrics.container.x * (_metrics.container.x / _metrics.content.x) - 4)) + 'px';}if(_instanceOptions.scrollingY){_scrollbarNodes.y.style.height = Math.max(6,Math.round(_metrics.container.y * (_metrics.container.y / _metrics.content.y) - 4)) + 'px';}} // Update scroll caches
	_scrollableAxes = {};if(_instanceOptions.scrollingX && (_metrics.content.x > _metrics.container.x || _instanceOptions.alwaysScroll)){_scrollableAxes.x = true;}if(_instanceOptions.scrollingY && (_metrics.content.y > _metrics.container.y || _instanceOptions.alwaysScroll)){_scrollableAxes.y = true;}};_updateElementPosition = function _updateElementPosition(){var axis,computedStyle,splitStyle; // Retrieve the current position of each active axis.
	// Custom parsing is used instead of native matrix support for speed and for
	// backwards compatibility.
	for(axis in _scrollableAxes) {if(_scrollableAxes.hasOwnProperty(axis)){computedStyle = window.getComputedStyle(_scrollNodes[axis],null)[_vendorTransformLookup];splitStyle = computedStyle.split(', '); // For 2d-style transforms, pull out elements four or five
	if(splitStyle.length === 6){_baseScrollPosition[axis] = parseInt(splitStyle[axis === 'y'?5:4],10); // For 3d-style transforms, pull out elements twelve or thirteen
	}else {_baseScrollPosition[axis] = parseInt(splitStyle[axis === 'y'?13:12],10);}_lastScrollPosition[axis] = _baseScrollPosition[axis];}}};_updateSegments = function _updateSegments(scrollFinalised){var axis;var newSegment={x:0,y:0}; // If snapping is disabled, return without any further action required
	if(!_instanceOptions.snapping){return;} // Calculate the new segments
	for(axis in _scrollableAxes) {if(_scrollableAxes.hasOwnProperty(axis)){newSegment[axis] = Math.max(0,Math.min(Math.ceil(_metrics.content[axis] / _snapGridSize[axis]) - 1,Math.round(-_lastScrollPosition[axis] / _snapGridSize[axis])));}} // In all cases update the active segment if appropriate
	if(newSegment.x !== _activeSegment.x || newSegment.y !== _activeSegment.y){_activeSegment.x = newSegment.x;_activeSegment.y = newSegment.y;_fireEvent('segmentwillchange',{segmentX:newSegment.x,segmentY:newSegment.y});} // If the scroll has been finalised, also update the base segment
	if(scrollFinalised){if(newSegment.x !== _baseSegment.x || newSegment.y !== _baseSegment.y){_baseSegment.x = newSegment.x;_baseSegment.y = newSegment.y;_fireEvent('segmentdidchange',{segmentX:newSegment.x,segmentY:newSegment.y});}}};_setAxisPosition = function _setAxisPosition(axis,position,animationDuration,animationBezier,boundsCrossDelay){var transitionCSSString,newPositionAtExtremity=null; // Only update position if the axis node exists (DOM elements can go away if
	// the scroller instance is not destroyed correctly)
	if(!_scrollNodes[axis]){return false;} // Determine the transition property to apply to both the scroll element and the scrollbar
	if(animationDuration){if(!animationBezier){animationBezier = _instanceOptions.flingBezier;}transitionCSSString = _vendorCSSPrefix + 'transform ' + animationDuration + 'ms ' + animationBezier.toString();}else {transitionCSSString = '';} // Apply the transition property to elements
	_scrollNodes[axis].style[_transitionProperty] = transitionCSSString;if(_instanceOptions.scrollbars){_scrollbarNodes[axis].style[_transitionProperty] = transitionCSSString;} // Update the positions
	_scrollNodes[axis].style[_transformProperty] = _translateRulePrefix + _transformPrefixes[axis] + position + 'px' + _transformSuffixes[axis];if(_instanceOptions.scrollbars){_scrollbarNodes[axis].style[_transformProperty] = _translateRulePrefix + _transformPrefixes[axis] + -position * _metrics.container[axis] / _metrics.content[axis] + 'px' + _transformSuffixes[axis];} // Determine whether the scroll is at an extremity.
	if(position >= 0){newPositionAtExtremity = 'start';}else if(position <= _metrics.scrollEnd[axis]){newPositionAtExtremity = 'end';} // If the extremity status has changed, fire an appropriate event
	if(newPositionAtExtremity !== _scrollAtExtremity[axis]){if(newPositionAtExtremity !== null){if(animationDuration){_timeouts.push(setTimeout(function(){_fireEvent('reached' + newPositionAtExtremity,{axis:axis});},boundsCrossDelay || animationDuration));}else {_fireEvent('reached' + newPositionAtExtremity,{axis:axis});}}_scrollAtExtremity[axis] = newPositionAtExtremity;} // Update the recorded position if there's no duration
	if(!animationDuration){_lastScrollPosition[axis] = position;}}; /**
			 * Retrieve the current position as an object with scrollLeft and scrollTop
			 * properties.
			 */_getPosition = function _getPosition(){return {scrollLeft:-_lastScrollPosition.x,scrollTop:-_lastScrollPosition.y};};_scheduleAxisPosition = function _scheduleAxisPosition(axis,position,animationDuration,animationBezier,afterDelay){_timeouts.push(setTimeout(function(){_setAxisPosition(axis,position,animationDuration,animationBezier);},afterDelay));};_fireEvent = function _fireEvent(eventName,eventObject){var i,l;eventObject.srcObject = _publicSelf; // Iterate through any listeners
	for(i = 0,l = _eventListeners[eventName].length;i < l;i = i + 1) { // Execute each in a try/catch
	try{_eventListeners[eventName][i](eventObject);}catch(error) {if(window.console && window.console.error){if(error.message){window.console.error(error.message + ' (' + error.sourceURL + ', line ' + error.line + ')');}else {window.console.error('Error encountered executing FTScroller event listener callback for [' + eventName + ']. Add a "debugger" statement here to obtain a full backtrace.');if(window.console.dir)window.console.dir(error);}}}}}; /**
			 * Update the scroll position so that the child element is in view.
			 */_childFocused = function _childFocused(event){var offset,axis,visibleChildPortion;var focusedNodeRect=_getBoundingRect(event.target);var containerRect=_getBoundingRect(_containerNode);var edgeMap={x:'left',y:'top'};var opEdgeMap={x:'right',y:'bottom'};var dimensionMap={x:'width',y:'height'}; // If an input is currently being tracked, ignore the focus event
	if(_inputIdentifier !== false){return;}for(axis in _scrollableAxes) {if(_scrollableAxes.hasOwnProperty(axis)){ // If the focussed node is entirely in view, there is no need to center it
	if(focusedNodeRect[edgeMap[axis]] >= containerRect[edgeMap[axis]] && focusedNodeRect[opEdgeMap[axis]] <= containerRect[opEdgeMap[axis]]){continue;} // If the focussed node is larger than the container...
	if(focusedNodeRect[dimensionMap[axis]] > containerRect[dimensionMap[axis]]){visibleChildPortion = focusedNodeRect[dimensionMap[axis]] - Math.max(0,containerRect[edgeMap[axis]] - focusedNodeRect[edgeMap[axis]]) - Math.max(0,focusedNodeRect[opEdgeMap[axis]] - containerRect[opEdgeMap[axis]]); // If more than half a container's portion of the focussed node is visible, there's no need to center it
	if(visibleChildPortion >= containerRect[dimensionMap[axis]] / 2){continue;}} // Set the target offset to be in the middle of the container, or as close as bounds permit
	offset = -Math.round(focusedNodeRect[dimensionMap[axis]] / 2 - _lastScrollPosition[axis] + focusedNodeRect[edgeMap[axis]] - containerRect[edgeMap[axis]] - containerRect[dimensionMap[axis]] / 2);offset = Math.min(0,Math.max(_metrics.scrollEnd[axis],offset)); // Perform the scroll
	_setAxisPosition(axis,offset,0);_baseScrollPosition[axis] = offset;}}_fireEvent('scroll',_getPosition());}; /**
			 * Given a relative distance beyond the element bounds, returns a modified version to
			 * simulate bouncy/springy edges.
			 */_modifyDistanceBeyondBounds = function _modifyDistanceBeyondBounds(distance,axis){if(!_instanceOptions.bouncing){return 0;}var e=Math.exp(distance / _metrics.container[axis]);return Math.round(_metrics.container[axis] * 0.6 * (e - 1) / (e + 1));}; /**
			 * Given positions for each enabled axis, returns an object showing how far each axis is beyond
			 * bounds. If within bounds, -1 is returned; if at the bounds, 0 is returned.
			 */_distancesBeyondBounds = function _distancesBeyondBounds(positions){var axis,position;var distances={};for(axis in positions) {if(positions.hasOwnProperty(axis)){position = positions[axis]; // If the position is to the left/top, no further modification required
	if(position >= 0){distances[axis] = position; // If it's within the bounds, use -1
	}else if(position > _metrics.scrollEnd[axis]){distances[axis] = -1; // Otherwise, amend by the distance of the maximum edge
	}else {distances[axis] = _metrics.scrollEnd[axis] - position;}}}return distances;}; /**
			 * On platforms which support it, use RequestAnimationFrame to group
			 * position updates for speed.  Starts the render process.
			 */_startAnimation = function _startAnimation(){if(_reqAnimationFrame){_cancelAnimation();_animationFrameRequest = _reqAnimationFrame(_scheduleRender);}}; /**
			 * On platforms which support RequestAnimationFrame, provide the rendering loop.
			 * Takes two arguments; the first is the render/position update function to
			 * be called, and the second is a string controlling the render type to
			 * allow previous changes to be cancelled - should be 'pan' or 'scroll'.
			 */_scheduleRender = function _scheduleRender(){var axis,positionUpdated; // If using requestAnimationFrame schedule the next update at once
	if(_reqAnimationFrame){_animationFrameRequest = _reqAnimationFrame(_scheduleRender);} // Perform the draw.
	for(axis in _scrollableAxes) {if(_scrollableAxes.hasOwnProperty(axis) && _targetScrollPosition[axis] !== _lastScrollPosition[axis]){_setAxisPosition(axis,_targetScrollPosition[axis]);positionUpdated = true;}} // If full, locked scrolling has enabled, fire any scroll and segment change events
	if(_isScrolling && positionUpdated){_fireEvent('scroll',_getPosition());_updateSegments(false);}}; /**
			 * Stops the animation process.
			 */_cancelAnimation = function _cancelAnimation(){if(_animationFrameRequest === false || !_cancelAnimationFrame){return;}_cancelAnimationFrame(_animationFrameRequest);_animationFrameRequest = false;}; /**
			 * Remove then re-set event handlers
			 */_resetEventHandlers = function(){_removeEventHandlers();_addEventHandlers();}; /**
			 * Register event handlers
			 */_addEventHandlers = function _addEventHandlers(){var MutationObserver; // Only remove the event if the node exists (DOM elements can go away)
	if(!_containerNode){return;}if(_trackPointerEvents && !_instanceOptions.disabledInputMethods.pointer){if(_pointerEventsPrefixed){_containerNode.addEventListener('MSPointerDown',_onPointerDown);_containerNode.addEventListener('MSPointerMove',_onPointerMove);_containerNode.addEventListener('MSPointerUp',_onPointerUp);_containerNode.addEventListener('MSPointerCancel',_onPointerCancel);}else {_containerNode.addEventListener('pointerdown',_onPointerDown);_containerNode.addEventListener('pointermove',_onPointerMove);_containerNode.addEventListener('pointerup',_onPointerUp);_containerNode.addEventListener('pointercancel',_onPointerCancel);}}else {if(_trackTouchEvents && !_instanceOptions.disabledInputMethods.touch){_containerNode.addEventListener('touchstart',_onTouchStart);_containerNode.addEventListener('touchmove',_onTouchMove);_containerNode.addEventListener('touchend',_onTouchEnd);_containerNode.addEventListener('touchcancel',_onTouchEnd);}if(!_instanceOptions.disabledInputMethods.mouse){_containerNode.addEventListener('mousedown',_onMouseDown);}}if(!_instanceOptions.disabledInputMethods.scroll){_containerNode.addEventListener('DOMMouseScroll',_onMouseScroll);_containerNode.addEventListener('mousewheel',_onMouseScroll);} // If any of the input methods which would eventually trigger a click are
	// enabled, add a click event listener so that phantom clicks can be prevented
	// at the end of a scroll. Otherwise, don't add a listener and don't prevent
	// clicks.
	if(!_instanceOptions.disabledInputMethods.mouse || !_instanceOptions.disabledInputMethods.touch || !_instanceOptions.disabledInputMethods.pointer){ // Add a click listener.  On IE, add the listener to the document, to allow
	// clicks to be cancelled if a scroll ends outside the bounds of the container; on
	// other platforms, add to the container node.
	if(_trackPointerEvents){document.addEventListener('click',_onClick,true);}else {_containerNode.addEventListener('click',_onClick,true);}} // Watch for changes inside the contained element to update bounds - de-bounced slightly.
	if(!_instanceOptions.disabledInputMethods.focus){_contentParentNode.addEventListener('focus',_childFocused);}if(_instanceOptions.updateOnChanges){ // Try and reuse the old, disconnected observer instance if available
	// Otherwise, check for support before proceeding
	if(!_mutationObserver){MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window[_vendorStylePropertyPrefix + 'MutationObserver'];if(MutationObserver){_mutationObserver = new MutationObserver(_domChanged);}}if(_mutationObserver){_mutationObserver.observe(_contentParentNode,{childList:true,characterData:true,subtree:true});}else {_contentParentNode.addEventListener('DOMSubtreeModified',function(e){ // Ignore changes to nested FT Scrollers - even updating a transform style
	// can trigger a DOMSubtreeModified in IE, causing nested scrollers to always
	// favour the deepest scroller as parent scrollers 'resize'/end scrolling.
	if(e && (e.srcElement === _contentParentNode || e.srcElement.className.indexOf('ftscroller_') !== -1)){return;}_domChanged();},true);}_contentParentNode.addEventListener('load',_domChanged);}if(_instanceOptions.updateOnWindowResize){window.addEventListener('resize',_domChanged);}}; /**
			 * Remove event handlers.
			 *
			 * The current flags may not match the state when the event handlers were set up,
			 * so remove all event handlers unconditionally, just in case they're bound.
			 */_removeEventHandlers = function _removeEventHandlers(){if(_containerNode){_containerNode.removeEventListener('MSPointerDown',_onPointerDown);_containerNode.removeEventListener('MSPointerMove',_onPointerMove);_containerNode.removeEventListener('MSPointerUp',_onPointerUp);_containerNode.removeEventListener('MSPointerCancel',_onPointerCancel);_containerNode.removeEventListener('pointerdown',_onPointerDown);_containerNode.removeEventListener('pointermove',_onPointerMove);_containerNode.removeEventListener('pointerup',_onPointerUp);_containerNode.removeEventListener('pointercancel',_onPointerCancel);_containerNode.removeEventListener('touchstart',_onTouchStart);_containerNode.removeEventListener('touchmove',_onTouchMove);_containerNode.removeEventListener('touchend',_onTouchEnd);_containerNode.removeEventListener('touchcancel',_onTouchEnd);_containerNode.removeEventListener('mousedown',_onMouseDown);_containerNode.removeEventListener('DOMMouseScroll',_onMouseScroll);_containerNode.removeEventListener('mousewheel',_onMouseScroll);_containerNode.removeEventListener('click',_onClick,true);}if(_contentParentNode){_contentParentNode.removeEventListener('focus',_childFocused);_contentParentNode.removeEventListener('DOMSubtreeModified',_domChanged);_contentParentNode.removeEventListener('load',_domChanged);}if(_mutationObserver){_mutationObserver.disconnect();}document.removeEventListener('mousemove',_onMouseMove);document.removeEventListener('mouseup',_onMouseUp);document.removeEventListener('click',_onClick,true);window.removeEventListener('resize',_domChanged);}; /**
			 * Touch event handlers
			 */_onTouchStart = function _onTouchStart(startEvent){var i,l,touchEvent; // If a touch is already active, ensure that the index
	// is mapped to the correct finger, and return.
	if(_inputIdentifier){for(i = 0,l = startEvent.touches.length;i < l;i = i + 1) {if(startEvent.touches[i].identifier === _inputIdentifier){_inputIndex = i;}}return;} // Track the new touch's identifier, reset index, and pass
	// the coordinates to the scroll start function.
	touchEvent = startEvent.touches[0];_inputIdentifier = touchEvent.identifier;_inputIndex = 0;_startScroll(touchEvent.clientX,touchEvent.clientY,startEvent.timeStamp,startEvent);};_onTouchMove = function _onTouchMove(moveEvent){if(_inputIdentifier === false){return;} // Get the coordinates from the appropriate touch event and
	// pass them on to the scroll handler
	var touchEvent=moveEvent.touches[_inputIndex];_updateScroll(touchEvent.clientX,touchEvent.clientY,moveEvent.timeStamp,moveEvent);};_onTouchEnd = function _onTouchEnd(endEvent){var i,l; // Check whether the original touch event is still active,
	// if it is, update the index and return.
	if(endEvent.touches){for(i = 0,l = endEvent.touches.length;i < l;i = i + 1) {if(endEvent.touches[i].identifier === _inputIdentifier){_inputIndex = i;return;}}} // Complete the scroll.  Note that touch end events
	// don't capture coordinates.
	_endScroll(endEvent.timeStamp,endEvent);}; /**
			 * Mouse event handlers
			 */_onMouseDown = function _onMouseDown(startEvent){ // Don't track the right mouse buttons, or a context menu
	if(startEvent.button && startEvent.button === 2 || startEvent.ctrlKey){return;} // Capture if possible
	if(_containerNode.setCapture){_containerNode.setCapture();} // Add move & up handlers to the *document* to allow handling outside the element
	document.addEventListener('mousemove',_onMouseMove,true);document.addEventListener('mouseup',_onMouseUp,true);_inputIdentifier = startEvent.button || 1;_inputIndex = 0;_startScroll(startEvent.clientX,startEvent.clientY,startEvent.timeStamp,startEvent);};_onMouseMove = function _onMouseMove(moveEvent){if(!_inputIdentifier){return;}_updateScroll(moveEvent.clientX,moveEvent.clientY,moveEvent.timeStamp,moveEvent);};_onMouseUp = function _onMouseUp(endEvent){if(endEvent.button && endEvent.button !== _inputIdentifier){return;}document.removeEventListener('mousemove',_onMouseMove,true);document.removeEventListener('mouseup',_onMouseUp,true); // Release capture if possible
	if(_containerNode.releaseCapture){_containerNode.releaseCapture();}_endScroll(endEvent.timeStamp,endEvent);}; /**
			 * Pointer event handlers
			 */_onPointerDown = function _onPointerDown(startEvent){ // If there is already a pointer event being tracked, ignore subsequent.
	// However, if this pointer is seen as the primary pointer, override that.
	if(_inputIdentifier && !startEvent.isPrimary){return;} // Disable specific input types if specified in the config.  Separate
	// out touch and other events (eg treat both pen and mouse as "mouse")
	if(startEvent.pointerType === _pointerTypeTouch){if(_instanceOptions.disabledInputMethods.touch){return;}}else if(_instanceOptions.disabledInputMethods.mouse){return;}_inputIdentifier = startEvent.pointerId;_startScroll(startEvent.clientX,startEvent.clientY,startEvent.timeStamp,startEvent);};_onPointerMove = function _onPointerMove(moveEvent){if(_inputIdentifier !== moveEvent.pointerId){return;}_updateScroll(moveEvent.clientX,moveEvent.clientY,moveEvent.timeStamp,moveEvent);};_onPointerUp = function _onPointerUp(endEvent){if(_inputIdentifier !== endEvent.pointerId){return;}_endScroll(endEvent.timeStamp,endEvent);};_onPointerCancel = function _onPointerCancel(endEvent){_endScroll(endEvent.timeStamp,endEvent);};_onPointerCaptureEnd = function _onPointerCaptureEnd(event){ // On pointer capture end - which can happen because of another element
	// releasing pointer capture - don't end scrolling, but do track that
	// input capture has been lost.  This will result in pointers leaving
	// the window possibly being lost, but further interactions will fix
	// the tracking again.
	_inputCaptured = false;}; /**
			 * Prevents click actions if appropriate
			 */_onClick = function _onClick(clickEvent){ // If a scroll action hasn't resulted in the next scroll being prevented, and a scroll
	// isn't currently in progress with a different identifier, allow the click
	if(!_preventClick){return true;} // Prevent clicks using the preventDefault() and stopPropagation() handlers on the event;
	// this is safe even in IE10 as this is always a "true" event, never a window.event.
	clickEvent.preventDefault();clickEvent.stopPropagation();if(!_inputIdentifier){_preventClick = false;}return false;}; /**
			 * Process scroll wheel/input actions as scroller scrolls
			 */_onMouseScroll = function _onMouseScroll(event){var scrollDeltaX,scrollDeltaY;if(_inputIdentifier !== 'scrollwheel'){if(_inputIdentifier !== false){return true;}_inputIdentifier = 'scrollwheel';_cumulativeScroll.x = 0;_cumulativeScroll.y = 0; // Start a scroll event
	if(!_startScroll(event.clientX,event.clientY,Date.now(),event)){return;}} // Convert the scrollwheel values to a scroll value
	if(event.wheelDelta){if(event.wheelDeltaX){scrollDeltaX = event.wheelDeltaX / 2;scrollDeltaY = event.wheelDeltaY / 2;}else {scrollDeltaX = 0;scrollDeltaY = event.wheelDelta / 2;}}else {if(event.axis && event.axis === event.HORIZONTAL_AXIS){scrollDeltaX = event.detail * -10;scrollDeltaY = 0;}else {scrollDeltaX = 0;scrollDeltaY = event.detail * -10;}} // If the scroller is constrained to an x axis, convert y scroll to allow single-axis scroll
	// wheels to scroll constrained content.
	if(_instanceOptions.invertScrollWheel && !_instanceOptions.scrollingY && !scrollDeltaX){scrollDeltaX = scrollDeltaY;scrollDeltaY = 0;}_cumulativeScroll.x = Math.round(_cumulativeScroll.x + scrollDeltaX);_cumulativeScroll.y = Math.round(_cumulativeScroll.y + scrollDeltaY);_updateScroll(_gestureStart.x + _cumulativeScroll.x,_gestureStart.y + _cumulativeScroll.y,event.timeStamp,event); // End scrolling state
	if(_scrollWheelEndDebouncer){clearTimeout(_scrollWheelEndDebouncer);}_scrollWheelEndDebouncer = setTimeout(function(){_releaseInputCapture();_inputIdentifier = false;_isScrolling = false;_preventClick = false;_isDisplayingScroll = false;_ftscrollerMoving = false;if(_instanceOptions.windowScrollingActiveFlag){window[_instanceOptions.windowScrollingActiveFlag] = false;}_cancelAnimation();if(!_snapScroll()){_finalizeScroll();}},300);}; /**
			 * Capture and release input support, particularly allowing tracking
			 * of Metro pointers outside the docked view.  Note that _releaseInputCapture
			 * should be called before the input identifier is cleared.
			 */_captureInput = function _captureInput(){if(_inputCaptured || _inputIdentifier === false || _inputIdentifier === 'scrollwheel'){return;}if(_trackPointerEvents){_containerNode[_setPointerCapture](_inputIdentifier);_containerNode.addEventListener(_lostPointerCapture,_onPointerCaptureEnd,false);}_inputCaptured = true;};_releaseInputCapture = function _releaseInputCapture(){if(!_inputCaptured){return;}if(_trackPointerEvents){_containerNode.removeEventListener(_lostPointerCapture,_onPointerCaptureEnd,false);_containerNode[_releasePointerCapture](_inputIdentifier);}_inputCaptured = false;}; /**
			 * Utility function acting as a getBoundingClientRect polyfill.
			 */_getBoundingRect = function _getBoundingRect(anElement){if(anElement.getBoundingClientRect){return anElement.getBoundingClientRect();}var x=0,y=0,eachElement=anElement;while(eachElement) {x = x + eachElement.offsetLeft - eachElement.scrollLeft;y = y + eachElement.offsetTop - eachElement.scrollTop;eachElement = eachElement.offsetParent;}return {left:x,top:y,width:anElement.offsetWidth,height:anElement.offsetHeight};}; /*                     Instantiation                     */ // Set up the DOM node if appropriate
	_initializeDOM(); // Update sizes
	_updateDimensions(); // Set up the event handlers
	_addEventHandlers(); // Define a public API to be returned at the bottom - this is the public-facing interface.
	_publicSelf = {destroy:destroy,setSnapSize:setSnapSize,scrollTo:scrollTo,scrollBy:scrollBy,updateDimensions:updateDimensions,addEventListener:addEventListener,removeEventListener:removeEventListener,setDisabledInputMethods:setDisabledInputMethods};if(Object.defineProperties){Object.defineProperties(_publicSelf,{'scrollHeight':{get:function get(){return _metrics.content.y;},set:function set(value){throw new SyntaxError('scrollHeight is currently read-only - ignoring ' + value);}},'scrollLeft':{get:function get(){return -_lastScrollPosition.x;},set:function set(value){scrollTo(value,false,false);return -_lastScrollPosition.x;}},'scrollTop':{get:function get(){return -_lastScrollPosition.y;},set:function set(value){scrollTo(false,value,false);return -_lastScrollPosition.y;}},'scrollWidth':{get:function get(){return _metrics.content.x;},set:function set(value){throw new SyntaxError('scrollWidth is currently read-only - ignoring ' + value);}},'segmentCount':{get:function get(){if(!_instanceOptions.snapping){return {x:NaN,y:NaN};}return {x:Math.ceil(_metrics.content.x / _snapGridSize.x),y:Math.ceil(_metrics.content.y / _snapGridSize.y)};},set:function set(value){throw new SyntaxError('segmentCount is currently read-only - ignoring ' + value);}},'currentSegment':{get:function get(){return {x:_activeSegment.x,y:_activeSegment.y};},set:function set(value){throw new SyntaxError('currentSegment is currently read-only - ignoring ' + value);}},'contentContainerNode':{get:function get(){return _contentParentNode;},set:function set(value){throw new SyntaxError('contentContainerNode is currently read-only - ignoring ' + value);}}});} // Return the public interface.
	return _publicSelf;}; /*          Prototype Functions and Properties           */ /**
		 * The HTML to prepend to the scrollable content to wrap it. Used internally,
		 * and may be used to pre-wrap scrollable content.  Axes can optionally
		 * be excluded for speed improvements.
		 */FTScroller.prototype.getPrependedHTML = function(excludeXAxis,excludeYAxis,hwAccelerationClass){if(!hwAccelerationClass){if(typeof FTScrollerOptions === 'object' && FTScrollerOptions.hwAccelerationClass){hwAccelerationClass = FTScrollerOptions.hwAccelerationClass;}else {hwAccelerationClass = 'ftscroller_hwaccelerated';}}var output='<div class="ftscroller_container">';if(!excludeXAxis){output += '<div class="ftscroller_x ' + hwAccelerationClass + '">';}if(!excludeYAxis){output += '<div class="ftscroller_y ' + hwAccelerationClass + '">';}return output;}; /**
		 * The HTML to append to the scrollable content to wrap it; again, used internally,
		 * and may be used to pre-wrap scrollable content.
		 */FTScroller.prototype.getAppendedHTML = function(excludeXAxis,excludeYAxis,hwAccelerationClass,scrollbars){if(!hwAccelerationClass){if(typeof FTScrollerOptions === 'object' && FTScrollerOptions.hwAccelerationClass){hwAccelerationClass = FTScrollerOptions.hwAccelerationClass;}else {hwAccelerationClass = 'ftscroller_hwaccelerated';}}var output='';if(!excludeXAxis){output += '</div>';}if(!excludeYAxis){output += '</div>';}if(scrollbars){if(!excludeXAxis){output += '<div class="ftscroller_scrollbar ftscroller_scrollbarx ' + hwAccelerationClass + '"><div class="ftscroller_scrollbarinner"></div></div>';}if(!excludeYAxis){output += '<div class="ftscroller_scrollbar ftscroller_scrollbary ' + hwAccelerationClass + '"><div class="ftscroller_scrollbarinner"></div></div>';}}output += '</div>';return output;};})();(function(){'use strict';function clamp(value){if(value > 1.0)return 1.0;if(value < 0.0)return 0.0;return value;} /**
		 * Represents a two-dimensional cubic bezier curve with the starting
		 * point (0, 0) and the end point (1, 1). The two control points p1 and p2
		 * have x and y coordinates between 0 and 1.
		 *
		 * This type of bezier curves can be used as CSS transform timing functions.
		 */CubicBezier = function(p1x,p1y,p2x,p2y){ // Control points
	this._p1 = {x:clamp(p1x),y:clamp(p1y)};this._p2 = {x:clamp(p2x),y:clamp(p2y)};};CubicBezier.prototype._getCoordinateForT = function(t,p1,p2){var c=3 * p1,b=3 * (p2 - p1) - c,a=1 - c - b;return ((a * t + b) * t + c) * t;};CubicBezier.prototype._getCoordinateDerivateForT = function(t,p1,p2){var c=3 * p1,b=3 * (p2 - p1) - c,a=1 - c - b;return (3 * a * t + 2 * b) * t + c;};CubicBezier.prototype._getTForCoordinate = function(c,p1,p2,epsilon){if(!isFinite(epsilon) || epsilon <= 0){throw new RangeError('"epsilon" must be a number greater than 0.');}var t2,i,c2,d2; // First try a few iterations of Newton's method -- normally very fast.
	for(t2 = c,i = 0;i < 8;i = i + 1) {c2 = this._getCoordinateForT(t2,p1,p2) - c;if(Math.abs(c2) < epsilon){return t2;}d2 = this._getCoordinateDerivateForT(t2,p1,p2);if(Math.abs(d2) < 1e-6){break;}t2 = t2 - c2 / d2;} // Fall back to the bisection method for reliability.
	t2 = c;var t0=0,t1=1;if(t2 < t0){return t0;}if(t2 > t1){return t1;}while(t0 < t1) {c2 = this._getCoordinateForT(t2,p1,p2);if(Math.abs(c2 - c) < epsilon){return t2;}if(c > c2){t0 = t2;}else {t1 = t2;}t2 = (t1 - t0) * 0.5 + t0;} // Failure.
	return t2;}; /**
		 * Computes the point for a given t value.
		 *
		 * @param {number} t
		 * @returns {Object} Returns an object with x and y properties
		 */CubicBezier.prototype.getPointForT = function(t){ // Special cases: starting and ending points
	if(t === 0 || t === 1){return {x:t,y:t};} // Check for correct t value (must be between 0 and 1)
	if(t < 0 || t > 1){_throwRangeError('t',t);}return {x:this._getCoordinateForT(t,this._p1.x,this._p2.x),y:this._getCoordinateForT(t,this._p1.y,this._p2.y)};};CubicBezier.prototype.getTForX = function(x,epsilon){return this._getTForCoordinate(x,this._p1.x,this._p2.x,epsilon);};CubicBezier.prototype.getTForY = function(y,epsilon){return this._getTForCoordinate(y,this._p1.y,this._p2.y,epsilon);}; /**
		 * Computes auxiliary points using De Casteljau's algorithm.
		 *
		 * @param {number} t must be greater than 0 and lower than 1.
		 * @returns {Object} with members i0, i1, i2 (first iteration),
		 *    j1, j2 (second iteration) and k (the exact point for t)
		 */CubicBezier.prototype._getAuxPoints = function(t){if(t <= 0 || t >= 1){_throwRangeError('t',t);} /* First series of auxiliary points */ // First control point of the left curve
	var i0={x:t * this._p1.x,y:t * this._p1.y},i1={x:this._p1.x + t * (this._p2.x - this._p1.x),y:this._p1.y + t * (this._p2.y - this._p1.y)}, // Second control point of the right curve
	i2={x:this._p2.x + t * (1 - this._p2.x),y:this._p2.y + t * (1 - this._p2.y)}; /* Second series of auxiliary points */ // Second control point of the left curve
	var j0={x:i0.x + t * (i1.x - i0.x),y:i0.y + t * (i1.y - i0.y)}, // First control point of the right curve
	j1={x:i1.x + t * (i2.x - i1.x),y:i1.y + t * (i2.y - i1.y)}; // The division point (ending point of left curve, starting point of right curve)
	var k={x:j0.x + t * (j1.x - j0.x),y:j0.y + t * (j1.y - j0.y)};return {i0:i0,i1:i1,i2:i2,j0:j0,j1:j1,k:k};}; /**
		 * Divides the bezier curve into two bezier functions.
		 *
		 * De Casteljau's algorithm is used to compute the new starting, ending, and
		 * control points.
		 *
		 * @param {number} t must be greater than 0 and lower than 1.
		 *     t === 1 or t === 0 are the starting/ending points of the curve, so no
		 *     division is needed.
		 *
		 * @returns {CubicBezier[]} Returns an array containing two bezier curves
		 *     to the left and the right of t.
		 */CubicBezier.prototype.divideAtT = function(t){if(t < 0 || t > 1){_throwRangeError('t',t);} // Special cases t = 0, t = 1: Curve can be cloned for one side, the other
	// side is a linear curve (with duration 0)
	if(t === 0 || t === 1){var curves=[];curves[t] = CubicBezier.linear();curves[1 - t] = this.clone();return curves;}var left={},right={},points=this._getAuxPoints(t);var i0=points.i0,i2=points.i2,j0=points.j0,j1=points.j1,k=points.k; // Normalize derived points, so that the new curves starting/ending point
	// coordinates are (0, 0) respectively (1, 1)
	var factorX=k.x,factorY=k.y;left.p1 = {x:i0.x / factorX,y:i0.y / factorY};left.p2 = {x:j0.x / factorX,y:j0.y / factorY};right.p1 = {x:(j1.x - factorX) / (1 - factorX),y:(j1.y - factorY) / (1 - factorY)};right.p2 = {x:(i2.x - factorX) / (1 - factorX),y:(i2.y - factorY) / (1 - factorY)};return [new CubicBezier(left.p1.x,left.p1.y,left.p2.x,left.p2.y),new CubicBezier(right.p1.x,right.p1.y,right.p2.x,right.p2.y)];};CubicBezier.prototype.divideAtX = function(x,epsilon){if(x < 0 || x > 1){_throwRangeError('x',x);}var t=this.getTForX(x,epsilon);return this.divideAtT(t);};CubicBezier.prototype.divideAtY = function(y,epsilon){if(y < 0 || y > 1){_throwRangeError('y',y);}var t=this.getTForY(y,epsilon);return this.divideAtT(t);};CubicBezier.prototype.clone = function(){return new CubicBezier(this._p1.x,this._p1.y,this._p2.x,this._p2.y);};CubicBezier.prototype.toString = function(){return "cubic-bezier(" + [this._p1.x,this._p1.y,this._p2.x,this._p2.y].join(", ") + ")";};CubicBezier.linear = function(){return new CubicBezier();};CubicBezier.ease = function(){return new CubicBezier(0.25,0.1,0.25,1.0);};CubicBezier.linear = function(){return new CubicBezier(0.0,0.0,1.0,1.0);};CubicBezier.easeIn = function(){return new CubicBezier(0.42,0,1.0,1.0);};CubicBezier.easeOut = function(){return new CubicBezier(0,0,0.58,1.0);};CubicBezier.easeInOut = function(){return new CubicBezier(0.42,0,0.58,1.0);};})();if(typeof define !== 'undefined' && define.amd){ // AMD. Register as an anonymous module.
	define(function(){'use strict';return {FTScroller:FTScroller,CubicBezier:CubicBezier};});}else if(typeof module !== 'undefined' && module.exports){module.exports = function(domNode,options){'use strict';return new FTScroller(domNode,options);};module.exports.FTScroller = FTScroller;module.exports.CubicBezier = CubicBezier;}

/***/ }),
/* 23 */
/***/ (function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	"use strict";
	
	var define = false;
	
	'use strict';
	
	/*global exports*/
	function emptyElement(targetEl) {
		for (var i = 0; i < targetEl.children.length; i++) {
			targetEl.removeChild(targetEl.children[i]);
		}
	}
	
	function createElement(nodeName, content, classes) {
		var el = document.createElement(nodeName);
		el.innerHTML = content;
		el.setAttribute("class", classes);
		return el;
	}
	
	function wrapElement(targetEl, wrapEl) {
		var parentEl = targetEl.parentNode;
		wrapEl.appendChild(targetEl);
		parentEl.appendChild(wrapEl);
	}
	
	function unwrapElement(targetEl) {
		var wrappingEl = targetEl.parentNode;
		var wrappingElParent = wrappingEl.parentNode;
		while (wrappingEl.childNodes.length > 0) {
			wrappingElParent.appendChild(wrappingEl.childNodes[0]);
		}
		wrappingElParent.removeChild(wrappingEl);
	}
	
	function createItemsList(containerEl) {
		var itemsList = createElement("ol", "", "o-gallery__items");
		containerEl.appendChild(itemsList);
		return itemsList;
	}
	
	function createItems(containerEl, items) {
		var itemEl;
		var itemEls = [];
		for (var i = 0; i < items.length; i++) {
			itemEl = createElement("li", "&nbsp;", "o-gallery__item");
			if (items[i].selected) {
				itemEl.setAttribute('aria-selected', 'true');
			}
			containerEl.appendChild(itemEl);
			itemEls.push(itemEl);
		}
		return itemEls;
	}
	
	function insertItemContent(config, item, itemEl) {
		emptyElement(itemEl);
		var contentEl = createElement("div", item.content, "o-gallery__item__content");
		itemEl.appendChild(contentEl);
		if (config.captions) {
			var captionEl = createElement("div", item.caption || "", "o-gallery__item__caption");
			itemEl.appendChild(captionEl);
		}
	}
	
	function setPropertyIfAttributeExists(obj, propName, el, attrName) {
		var v = el.getAttribute(attrName);
		if (v !== null) {
			if (v === "true") {
				v = true;
			} else if (v === "false") {
				v = false;
			}
			obj[propName] = v;
		}
	}
	
	function getPropertiesFromAttributes(el, map) {
		var obj = {};
		var prop;
		for (prop in map) {
			if (map.hasOwnProperty(prop)) {
				setPropertyIfAttributeExists(obj, prop, el, map[prop]);
			}
		}
		return obj;
	}
	
	function setAttributesFromProperties(el, obj, map, excl) {
		var exclude = excl || [];
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop) && exclude.indexOf(prop) < 0) {
				el.setAttribute(map[prop], obj[prop]);
			}
		}
	}
	
	exports.emptyElement = emptyElement;
	exports.createElement = createElement;
	exports.wrapElement = wrapElement;
	exports.unwrapElement = unwrapElement;
	exports.createItemsList = createItemsList;
	exports.createItems = createItems;
	exports.insertItemContent = insertItemContent;
	exports.setAttributesFromProperties = setAttributesFromProperties;
	exports.getPropertiesFromAttributes = getPropertiesFromAttributes;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	/*global require,module */
	'use strict';
	
	var galleryDom = __webpack_require__(23);
	
	/**
	 * Mimics FTScroller without touch interface, transitions or events
	 * Intended for IE8 or other browsers that lack support for CSS transitions
	 */
	function SimpleScroller(containerEl) {
	
		var scroller = this;
		var allItemsEl;
		var viewportEl;
	
		function updateDimensions() {
			scroller.scrollLeft = viewportEl.scrollLeft;
		}
	
		function scrollTo(n) {
			viewportEl.scrollLeft = n;
			updateDimensions();
			containerEl.dispatchEvent(new CustomEvent('scrollend', {
				x: n
			}));
		}
	
		function destroy() {
			if (containerEl.querySelector('.o-gallery__viewport')) {
				galleryDom.unwrapElement(allItemsEl);
			}
		}
	
		allItemsEl = containerEl.querySelector('.o-gallery__items');
		viewportEl = galleryDom.createElement('div', '', 'o-gallery__viewport');
		galleryDom.wrapElement(allItemsEl, viewportEl);
		updateDimensions();
	
		this.contentContainerNode = allItemsEl;
		this.scrollTo = scrollTo;
		this.updateDimensions = updateDimensions;
		this.destroy = destroy;
	}
	
	module.exports = SimpleScroller;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(26);

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	/*global require, module*/
	
	var Tabs = __webpack_require__(27);
	
	var constructAll = function constructAll() {
		Tabs.init();
		document.removeEventListener('o.DOMContentLoaded', constructAll);
	};
	
	document.addEventListener('o.DOMContentLoaded', constructAll);
	
	module.exports = Tabs;

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
	
	var define = false;
	
	/*global module, require*/
	var oDom = __webpack_require__(16);
	
	var Tabs = (function () {
		function Tabs(rootEl, config) {
			_classCallCheck(this, Tabs);
	
			this.rootEl = rootEl;
			this.rootEl.setAttribute('data-o-tabs--js', '');
	
			this.updateUrl = rootEl.getAttribute('data-o-tabs-update-url') !== null;
			this.selectedTabIndex = -1;
	
			this.tabEls = this.rootEl.querySelectorAll('[role=tab]');
			this.tabEls = [].slice.call(this.tabEls).filter(this.tabHasValidUrl);
			this.tabpanelEls = this.getTabPanelEls(this.tabEls);
	
			this.boundClickHandler = this.clickHandler.bind(this);
			this.rootEl.addEventListener('click', this.boundClickHandler, false);
			this.boundKeyPressHandler = this.keyPressHandler.bind(this);
			this.rootEl.addEventListener('keypress', this.boundKeyPressHandler, false);
			this.boundHashChangeHandler = this.hashChangeHandler.bind(this);
			window.addEventListener('hashchange', this.boundHashChangeHandler, false);
	
			if (!config) {
				config = {};
				Array.prototype.forEach.call(this.rootEl.attributes, function (attr) {
					if (attr.name.includes('data-o-tabs')) {
						// Remove the unnecessary part of the string the first
						// time this is run for each attribute
						var key = attr.name.replace('data-o-tabs-', '');
	
						try {
							// If it's a JSON, a boolean or a number, we want it stored like that,
							// and not as a string. We also replace all ' with " so JSON strings
							// are parsed correctly
							config[key] = JSON.parse(attr.value.replace(/\'/g, '"'));
						} catch (e) {
							config[key] = attr.value;
						}
					}
				});
			}
	
			this.config = config;
			this.dispatchCustomEvent('ready', {
				tabs: this
			});
			this.selectTab(this.getSelectedTabIndex());
		}
	
		_createClass(Tabs, [{
			key: 'getTabTargetId',
			value: function getTabTargetId(tabEl) {
				// eslint-disable-line class-methods-use-this
				var linkEls = tabEl.getElementsByTagName('a');
				return linkEls && linkEls[0] ? linkEls[0].getAttribute('href').replace('#', '') : '';
			}
		}, {
			key: 'getTabPanelEls',
			value: function getTabPanelEls(tabEls) {
				var panelEls = [];
	
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;
	
				try {
					for (var _iterator = tabEls[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var tab = _step.value;
	
						var tabTargetId = this.getTabTargetId(tab);
						var targetEl = document.getElementById(tabTargetId);
	
						if (targetEl) {
							tab.setAttribute('aria-controls', tabTargetId);
							tab.setAttribute('tabindex', '0');
	
							var label = tab.getElementsByTagName('a')[0];
							var labelId = tabTargetId + '-label';
							label.setAttribute('tabindex', '-1');
							label.id = labelId;
							targetEl.setAttribute('aria-labelledby', labelId);
							targetEl.setAttribute('role', 'tabpanel');
							targetEl.setAttribute('tabindex', '0');
							panelEls.push(targetEl);
						}
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator['return']) {
							_iterator['return']();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
	
				return panelEls;
			}
		}, {
			key: 'getTabElementFromHash',
			value: function getTabElementFromHash() {
				var tabLink = this.rootEl.querySelector('[href="' + location.hash + '"]');
				return tabLink && tabLink.parentNode ? tabLink.parentNode : null;
			}
		}, {
			key: 'getTabIndexFromElement',
			value: function getTabIndexFromElement(el) {
				// eslint-disable-line class-methods-use-this
				return oDom.getIndex(el);
			}
		}, {
			key: 'getSelectedTabElement',
			value: function getSelectedTabElement() {
				return this.rootEl.querySelector('[aria-selected=true]');
			}
		}, {
			key: 'getSelectedTabIndex',
			value: function getSelectedTabIndex() {
				var selectedTabElement = this.updateUrl && location.hash ? this.getTabElementFromHash() : this.getSelectedTabElement();
				return selectedTabElement ? this.getTabIndexFromElement(selectedTabElement) : 0;
			}
		}, {
			key: 'isValidTab',
			value: function isValidTab(index) {
				return !isNaN(index) && index >= 0 && index < this.tabEls.length;
			}
		}, {
			key: 'hidePanel',
			value: function hidePanel(panelEl) {
				// eslint-disable-line class-methods-use-this
				panelEl.setAttribute('aria-expanded', 'false');
				panelEl.setAttribute('aria-hidden', 'true');
			}
		}, {
			key: 'showPanel',
			value: function showPanel(panelEl, disableFocus) {
				panelEl.setAttribute('aria-expanded', 'true');
				panelEl.setAttribute('aria-hidden', 'false');
	
				// Remove the focus ring for sighted users
				panelEl.style.outline = 0;
	
				if (disableFocus) {
					return;
				}
	
				// update the url to match the selected tab
				if (panelEl.id && this.updateUrl) {
					location.href = '#' + panelEl.id;
				}
	
				// Get current scroll position
				var x = window.scrollX || window.pageXOffset;
				var y = window.scrollY || window.pageYOffset;
	
				// Give focus to the panel for screen readers
				// This might cause the browser to scroll up or down
				panelEl.focus();
	
				// Scroll back to the original position
				window.scrollTo(x, y);
			}
		}, {
			key: 'dispatchCustomEvent',
			value: function dispatchCustomEvent(event) {
				var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
				var namespace = arguments.length <= 2 || arguments[2] === undefined ? 'oTabs' : arguments[2];
	
				this.rootEl.dispatchEvent(new CustomEvent(namespace + '.' + event, {
					detail: data,
					bubbles: true
				}));
			}
		}, {
			key: 'selectTab',
			value: function selectTab(newIndex) {
				if (this.isValidTab(newIndex) && newIndex !== this.selectedTabIndex) {
					for (var i = 0; i < this.tabEls.length; i++) {
						if (newIndex === i) {
							this.tabEls[i].setAttribute('aria-selected', 'true');
							this.showPanel(this.tabpanelEls[i], this.config.disablefocus);
						} else {
							this.tabEls[i].setAttribute('aria-selected', 'false');
							this.hidePanel(this.tabpanelEls[i]);
						}
					}
	
					this.dispatchCustomEvent('tabSelect', {
						tabs: this,
						selected: newIndex,
						lastSelected: this.selectedTabIndex
					});
	
					this.selectedTabIndex = newIndex;
				}
			}
		}, {
			key: 'clickHandler',
			value: function clickHandler(ev) {
				var tabEl = oDom.getClosestMatch(ev.target, '[role=tab]');
	
				if (tabEl && this.tabHasValidUrl(tabEl)) {
					ev.preventDefault();
					this.updateCurrentTab(tabEl);
				}
			}
		}, {
			key: 'keyPressHandler',
			value: function keyPressHandler(ev) {
				var tabEl = oDom.getClosestMatch(ev.target, '[role=tab]');
				// Only update if key pressed is enter key
				if (tabEl && ev.keyCode === 13 && this.tabHasValidUrl(tabEl)) {
					ev.preventDefault();
					this.updateCurrentTab(tabEl);
				}
			}
		}, {
			key: 'hashChangeHandler',
			value: function hashChangeHandler() {
				if (!this.updateUrl) {
					return;
				}
	
				var tabEl = this.getTabElementFromHash();
	
				if (tabEl) {
					this.updateCurrentTab(tabEl);
				}
			}
		}, {
			key: 'updateCurrentTab',
			value: function updateCurrentTab(tabEl) {
				var index = this.getTabIndexFromElement(tabEl);
				this.selectTab(index);
				this.dispatchCustomEvent('event', {
					category: 'tabs',
					action: 'click',
					tab: tabEl.textContent.trim()
				}, 'oTracking');
			}
		}, {
			key: 'tabHasValidUrl',
			value: function tabHasValidUrl(tabEl) {
				// eslint-disable-line class-methods-use-this
				var linkEls = tabEl.getElementsByTagName('a');
				if (!linkEls || !linkEls[0].hash) {
					return false;
				}
				return linkEls[0].pathname === location.pathname;
			}
		}, {
			key: 'destroy',
			value: function destroy() {
				this.rootEl.removeEventListener('click', this.boundClickHandler, false);
				this.rootEl.removeEventListener('keypress', this.boundKeyPressHandler, false);
				window.removeEventListener('hashchange', this.boundHashChangeHandler, false);
				this.rootEl.removeAttribute('data-o-tabs--js');
	
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;
	
				try {
					for (var _iterator2 = this.tabpanelEls[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var tabPanelEl = _step2.value;
	
						this.showPanel(tabPanelEl);
					}
	
					// unset the bound event handlers
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2['return']) {
							_iterator2['return']();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}
	
				this.boundClickHandler = undefined;
				this.boundKeyPressHandler = undefined;
				this.boundHashChangeHandler = undefined;
				// Destroy ALL the things!
				this.tabEls = undefined;
				this.tabpanelEls = undefined;
				this.updateUrl = undefined;
				this.selectedTabIndex = undefined;
				this.rootEl = undefined;
				this.config = undefined;
			}
		}], [{
			key: 'init',
			value: function init(rootEl, config) {
				if (!rootEl) {
					rootEl = document.body;
				}
				if (!(rootEl instanceof HTMLElement)) {
					rootEl = document.querySelector(rootEl);
				}
	
				if (rootEl instanceof HTMLElement && /\bo-tabs\b/.test(rootEl.getAttribute('data-o-component'))) {
					if (!rootEl.matches('[data-o-tabs-autoconstruct=false]') && !rootEl.hasAttribute('data-o-tabs--js')) {
						return new Tabs(rootEl, config);
					}
				}
	
				if (rootEl.querySelectorAll) {
					var tabElements = rootEl.querySelectorAll('[data-o-component=o-tabs]:not([data-o-tabs-autoconstruct=false]):not([data-o-tabs--js])');
	
					return Array.from(tabElements, function (tabEl) {
						return new Tabs(tabEl, config);
					});
				}
			}
		}]);
	
		return Tabs;
	})();
	
	exports['default'] = Tabs;
	module.exports = exports['default'];

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map
//# sourceMappingURL=bundle.js.map
$('a[href^="#"]').on('click', function(event) {
    var target = $(this.getAttribute('href'));
    if( target.length ) {
        event.preventDefault();
        $('html, body').stop().animate({
            scrollTop: target.offset().top
        }, 1000);
    }
});