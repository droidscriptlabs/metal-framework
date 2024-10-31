# 🔥 Metro

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.0.3-brightgreen.svg)](CHANGELOG.md)
[![Platform](https://img.shields.io/badge/platform-Android-blue.svg)](https://developer.android.com/)

Metro is a DroidScript plugin for Enjine.IO Apps, It is a support plugin for hybrid apps, it is a collection of useful functions to enhance your hybrid apps.

## Installation

To install the project, follow these steps:

- Download the plugin package at [Metro Plugin](https://ds.justplayer.de/projects/metro)
- Install the plugin in DroidScript

You can check out the Metro Sample App here :

[Metro Sample App](https://ds.justplayer.de/projects/metro-app)

## Features

**It is advised not to change the default element id given to your element by enjine-io.**

### Reactivity Using Signals

Metro comes with an in-built `$signal` function, this function takes in a parameter and returns a setter/getter function and a subscriber.

```javascript
let theme = $signal("light");

theme.subscribe((mode) => {
    console.log(mode);
});
// If we change the value the subscriber function will run
// output will be logged to console
theme.value = "dark";
```

### Reactivity using showIF

Metro comes with this function, it takes in a restingParameter and based on the truthiness of it, an element will be shown.

```javascript
/**
 * @param {Boolean} restingParameter
 * @param {instanceOf<ui.Control>} onTruthyElement
 * @param {instanceOf<ui.Control>} onFalslyElement
 */
$showIF(restingParameter, onTruthyElement, onFalslyElement);
```

### Suspense In Metro

The concept of suspense is to show an element whilst an async function runs, once completed with positive feedback the other is shown.

Suspense can be used for splashscreens and loadingscreens while data is being fetched.

```javascript
/**
 * show a fallback view during an async operation, then swap out when done.
 * @param {asyncFunction} resource 
 * @param {instanceOf<ui.Control>} fallback 
 * @param {instanceOf<ui.Control>} controlInSuspension 
 */
$suspense(resource, fallback, controlInSuspension)
```

If your controlInSuspension is a layout, all elements of that layout are hidden and only the fallback is shown, and once operation is done the fallback is hidden and the elements are made visible.

### Dealing With Circular Objects

For a circular object using JSON.stringify will not work, therefore Metro introduces a `$stringify` function.

This is useful when debugging hybrid apps, which also rely on React, you may encounter ReactFiberRoot along your debug.

```javascript
$stringify(object)
```

### Faster Component Authoring Model

Instead of having to extend a class and use document.createElement, Metro offers the `$component` function.

```javascript
$component(parent, tag, width, height, properties, options = '')
```

Your properties parameter is an object, that will set the elements properties, can be used in this manner :

```javascript
let properties = {
    textContent: 'Hello World',
    onclick: (e)=>{
        e.stopPropagation()
        alert('I was clicked on')
    }
}
```

This function also has the `.css` method and `.batch` method, continue reading to find out more.

### Scoped Css To Your Elments

Metro extends the `ui.Control` property to add the method `.css` to all ui. Functions, css can be added in form of an object - similar to how Emotion works and can be added as a template literal.

```javascript
let btn = ui.addHTMLElement()
btn.css``

let btn2 = $component(parent, 'button', -1, -1, {
    textContent: 'Hello World',
}).css``
```

Note, that the css method only works when you use the `ui.addHTMLElement` function or the `$component` function.

### Optimized DOM Updates Using batch

The batch method is exposed similarly to the `css` method, it uses `requestAnimationFrame` to do effecient DOM updates.

In ui. Functions batch works with the available methods to the function, an example:

```javascript
let text = ui.addText(parent, ...)
text.batch({
    text: 'Hello World',
    backColor: 'green'
})
```

In `$component` functions it takes the DOM Api's instead:

```javascript
$component(parent, tag, ...).batch({
textContent: 'Howdy 🔥'
})
```

### Event Managment

You can set event-listeners for your elements in this manner:

```javascript
let btn = ui.addButton()

btn.on('touchstart', (e)=>{
    e.stopPropagation()
    //... Always stopPropagation
    //... Function Logic Here
})
```

Furthermore you can set document based event listeners by using the `$on` function, an example:

```javascript
$on('visibilitychange', (e)=>{
    e.stopPropagation();
    document.hidden ? alert('You Are Locked Out') : null
})
```

## Contributing

We welcome contributions! To contribute, please follow these steps:

- Fork the repository.
- Create a new branch (git checkout -b feature-branch).
- Make your changes and commit (git commit -am 'Add new feature').
- Push to the branch (git push origin feature-branch).
- Create a Pull Request.

You can also suggest features that you want that i should add into the plugin.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
