# o-tabs [![Build Status](https://circleci.com/gh/Financial-Times/o-tabs.png?style=shield&circle-token=a2788d79ccb1fe983aa41c739f4e4129ed81a3f4)](https://circleci.com/gh/Financial-Times/o-tabs)

Tabs component for dividing content into meaningful sections.

- [Usage](#usage)
	- [Markup](#markup)
	- [JavaScript](#javascript)
	- [Sass](#sass)
- [Migration guide](#migration-guide)
- [Contact](#contact)
- [Licence](#licence)

## Usage

### Markup

The _tablist_, _tabs_ and _tabpanels_ must be identified by [ARIA](http://www.w3.org/TR/wai-aria/) `role` attributes.

The _tab_ elements must contain a link whose `href` attribute points to the ID of a _tabpanel_ element.

The _tabpanel_ elements must have a `o-tabs__tabpanel` class added to them.

This is an example of an HTML structure that __o-tabs__ will accept:

```html
<ul data-o-component="o-tabs" class="o-tabs" role="tablist">
	<li role="tab"><a href="#tabContent1">Tab 1</a></li>
	<li role="tab"><a href="#tabContent2">Tab 2</a></li>
	<li role="tab"><a href="#tabContent3">Tab 3</a></li>
</ul>
<div id="tabContent1" class="o-tabs__tabpanel">
	Tab content 1
</div>
<div id="tabContent2" class="o-tabs__tabpanel">
	Tab content 2
</div>
<div id="tabContent3" class="o-tabs__tabpanel">
	<div>Note: first elements of each tab will get focused when it is selected. In this case, this div will receive focus.</div>
	Tab content 3
</div>
```

To set the initially selected tab, add an `aria-selected="true"` attribute to a tab element, otherwise the first tab will be selected automatically.

#### Config

You can set config options declaratively by using `[data-o-tabs-]` prefixed data attributes.

Options consist of:

* `data-o-tabs-disablefocus="true"` - prevent the tabpanel being focused when selected.
* `data-o-tabs-update-url="true"` - update the URL with the `#` of the selected panel.

#### Core experience

Without the accompanying JavaScript, the _tabs_ will receive no styling, and all _tabpanels_ will remain visible. It's recommended that the default styling is to have each of the _tabpanels_ displayed one below the other.

A product may choose to hide the tabs like this:

```css
.o-tabs { display: none; }
.o-tabs--js { display: block; }
```

#### ARIA

ARIA attributes will be set on elements as follows:

__On init__, `aria-controls` is added to each tab element, with value being the ID of the associated tabpanel.

__On init and selected tab change__ these attributes are set and updated as appropriate:

* `aria-selected` is set on the tab elements
* `aria-hidden` and `aria-expanded` are set on the tabpanels

These state attributes are used by the __o-tabs__ CSS.


### JavaScript

#### Declarative

A `o.DOMContentLoaded` event can be dispatched on the `document` to auto-construct a __o-tabs__ object for each element with a `data-o-component="o-tabs"` attribute:

```javascript
document.addEventListener("DOMContentLoaded", function() {
	document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
});
```

Auto-construction can be disabled for a specific element via another data attribute (`data-o-tabs-autoconstruct="false"`).

Note that for browsers that do not support `DOMContentLoaded` (IE8 etc), the event could be polyfilled, or construction can be manually invoked:

```javascript
const Tabs = require('o-tabs');
const tabsObjects = Tabs.init(document.body, {
	disablefocus: false
});
```

An array of any constructed Tabs objects will be returned.

`Tabs.init(config)` will not create Tabs objects for elements that already have Tabs objects constructed on them, therefore it's safe to call more than once on the same page region.

#### Imperative

```javascript
const Tabs = require('o-tabs');
const myTabs = new Tabs(document.getElementById('myTabsRootElement'), {
	disablefocus: false
});
```

#### Events

The following events will be dispatched on the Tabs' root DOM element:

* `oTabs.ready`: The Tabs object has initialised. Event detail:
	* `tabs`: The __o-tabs__ object.
* `oTabs.tabSelect`: A tab has been selected. Event detail:
	* `tabs`: The __o-tabs__ object.
	* `selected`: The index of the selected tab.
	* `lastSelected`: The index of the last selected tab.

#### API

Tabs are indexed starting from 0.

The following API methods are provided:

* `init(config)`: Set attributes/classes, bind events. Called automatically on construction. Does nothing if already been called. `config` object accepts:
	- `disablefocus`: If set to `true`, it will stop the aria-selected tab from receiving focus.
* `selectTab(idx)`: Select tab `idx`. Does nothing if tab `idx` does not exist or is already selected.
* `destroy()`: Unbind events, remove `o-tabs--js` class. After calling this, `init()` can be called again to re-initialise the tabs.

### Sass

__o-tabs__ comes with either _base styling_, which should be used as a base for you to add your own styling. Or _full styling_ called __buttontabs__; based on the buttons from [o-buttons](https://github.com/Financial-Times/o-buttons)).

To apply the __buttontabs__ styling, add a `o-tabs--buttontabs` class to the root element:

```html
<ul data-o-component="o-tabs" class="o-tabs o-tabs--buttontabs" role="tablist">
```

or use the mixin:

```sass
@include oTabsButtonTabs;
```

The __buttontabs__ style comes in two sizes that conform to the `o-buttons` sizes: medium and big. Medium is the default size and big can be applied by adding the class `o-tabs--big`.

#### Options

* __Align right__: Add `o-tabs--alignright` to the root element.

#### Mixins

o-tabs styles are also available via mixins. The base styles and buttontabs styles are available using the `oTabs` and `oTabsButtonTabs` mixins.

If you're using the Sass mixins, you can also theme o-tabs using the `oTabsButtonTabsTheme` mixin, which can be set to any of the [`o-buttons` themes](https://github.com/Financial-Times/o-buttons#quick-start) by passing the name as a parameter:

```sass
@include oTabsButtonTabsTheme('inverse');
```

## Migration Guide

### Migrating from v3 to v4

This major includes the new o-colors and o-buttons, and updates the themes and sizes of button tabs.

The following changes have been made to the **themes**:

- `Standout` is now `Primary`: use `oTabsButtonTabsTheme('primary')`
- `Uncolored` is now `Mono`: use `oTabsButtonTabsTheme('mono')`

As well as this, the JavaScript for o-tabs now relies on `String.prototype.trim`. This is present in modern browsers and can be polyfilled in others.

---

## Contact

If you have any questions or comments about this component, or need help using it, please either [raise an issue](https://github.com/Financial-Times/o-tabs/issues), visit [#ft-origami](https://financialtimes.slack.com/messages/ft-origami/) or email [Origami Support](mailto:origami-support@ft.com).

----

## Licence

This software is published by the Financial Times under the [MIT licence](http://opensource.org/licenses/MIT).
