/*global require,module*/

const oHierarchicalNav = require('./src/js/ResponsiveNav');
const constructAll = function() {
	oHierarchicalNav.init();
	document.removeEventListener('o.DOMContentLoaded', constructAll);
};
document.addEventListener('o.DOMContentLoaded', constructAll);

module.exports = oHierarchicalNav;
