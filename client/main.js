// Require module
require('o-grid');
require('o-hierarchical-nav');

const oTabs = window.oTabs = require('o-tabs');

//const oExpanderObjects = window.oExpanderObjects = oExpander.init(document.body, {})

const tabsObjects = window.tabsObjects = oTabs.init(document.body, {
	disablefocus: false
});

// Wait until the page has loaded
if (document.readyState === 'interactive' || document.readyState === 'complete') {
	document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
}
document.addEventListener('DOMContentLoaded', function() {
	// Dispatch a custom event that will tell all required modules to initialise
	document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
});
