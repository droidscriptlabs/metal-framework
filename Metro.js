


// Metro  Library For Hybrid Apps
// A set of useful methods, functions
// For building high qaulity apps.

// @license
// MIT

// @version 
// 0.0.2

// @author
// Oarabile Koore

/**
 * returns the system device theme, works in browser environment
 * @returns SystemTheme
 */
$sysTheme = function(){
    const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
    if (darkThemeMq.matches) {
        return "dark";
    } else return "light";
}

/**
 * showIF method allows you to hide or show an element if the restingParameter is truthy
 * @param {Boolean} restingParameter 
 * @param {instanceOf<ui.Control>} onTruthyElement 
 * @param {instanceOf<ui.Control>} onFalseyElement 
 */
$showIF = function(restingParameter, onTruthyElement, onFalseyElement){
    if (onTruthyElement === undefined || onFalseyElement === undefined) {
        ui.showPopup(`showIF not called, one of the elements is undefined`, 'long', 4500)
        return;
    }
    restingParameter ? onTruthyElement.show() : onTruthyElement.hide()
    !restingParameter ? onFalseyElement.show() : onFalseyElement.hide()
}

/**
 * signal Method allows you to use signals, it takes in plain values and gives reactivity
 * @param {any} defaultValue
 */
$signal = function(defaultValue = null){
    let internal_variable = defaultValue;
    let subscriptions = [];
    
    const notify = function(fn){
        for (let subscriber of subscriptions){
            subscriber(internal_variable)
        }
    }
    return {
        set value(val){
            internal_variable = val;
            notify();
        },
        
        get value(){
            return internal_variable;
        },
        
        subscribe : (fn)=> {
            subscriptions.push(fn);
        }
    }
}


let draggingEl;
let isDragging = false;
let draggingElprops = {};
let dqoffsetX, dqoffsetY;
 
/**
 * enable method allows elements to be dragged over others
 * @param {instanceOf<ui.Control>} object 
 * @param {Function} callback Called When Draggig Starts
 * @param {Function} ondragend Called When Dragging Ends
 */
$enableDrag = function(object, callback, ondragend) {
    if (!object._div) {
        console.log(`ui.Control Property Not Mounted`);
        return;
    }
    draggingEl = object._div;
    
    const touchHandler = (e) => {
        draggingElprops.position = object.el.style.position;
        draggingElprops.dragend = ondragend;
        
        object.el.style.position = 'absolute'
        callback ? callback(e) : null
        
        isDragging = true;
        const touch = e.touches[0];
        if (touch) {
            dqoffsetX = touch.clientX - draggingEl.getBoundingClientRect().left;
            dqoffsetY = touch.clientY - draggingEl.getBoundingClientRect().top;
            draggingEl.style.cursor = "grabbing";
        } else {
            console.log("Touch event did not contain touches");  // Debugging
        }
    }
    object.el.addEventListener('touchstart', touchHandler);
    object.el._touchHandler = touchHandler;
};

/**
 * disableDrag method removes the drag eventListenet
 * @param {instanceOf<ui.Control>} object 
 * @param {Boolean} moveToOldPosition 
 */
$disableDrag = function(object, moveToOldPosition){
    object.el.style.position = 'fixed'
    dqoffsetX, dqoffsetY = 0;
    isDragging = false;
    draggingEl = null;
    
    object.el.removeEventListener('touchstart', object.el._touchHandler)
    delete object.el._touchStartHandler;
    
    moveToOldPosition ? object.el.style.position = draggingElprops.position :  null;
}

// Handle touch movement
document.addEventListener("touchmove", (e) => {
    if (isDragging) {
        const touch = e.touches[0];
        if (touch) {
            draggingEl.style.left = `${touch.clientX - dqoffsetX}px`;
            draggingEl.style.top = `${touch.clientY - dqoffsetY}px`;
        } else {
            console.log("Touchmove event did not contain touches");  // Debugging
        }
    }
});

// End drag on touchend
document.addEventListener("touchend", () => {
    isDragging = false;
    if (draggingEl) {
        draggingEl.style.cursor = "grab";
        draggingElprops.dragend ? draggingElprops.dragend() : null
    }
});


/**
 * batch method calls all your effects at one shot in an optimized manner
 * @param {Object} updatesAsObject 
 */
ui.Control.prototype.batch = function(updatesAsObject){
    if (!this._div){
        console.log(`ui.Control Property Not Mounted`);
        return;
    }
    Object.entries(updatesAsObject).forEach(([key, value]) => {
        requestAnimationFrame(() => {
            if (this) {
                this[key] = value;
            }
        });
     });
    return this;
}

/**
 * add styles to an element as a template literal or an object
 * @param {object | TemplateStringsArray} styles
 * @returns {this}
 */
ui.Control.prototype.css = function(styles){
    if (!this._div){
        console.log(`ui.Control Property Not Mounted`);
        return;
    }
    const className = cssParser(styles);
    
    if (this.tag) this.classList.add(className);
    else {
        ui.showPopup('Cannot add css any to ui Object, use ui.addHTMLElement', 'Long', 4500)
        return;
    }
    return this;
}

function generateClassName() {
    let count = 0;
    return `metro-class-${count++}`
}

/**
 * Add CSS properties, works with both template literals
 * and objects (like Emotion in React).
 * Automatically detects the type of
 * input and returns a class name.
 *
 * @param {TemplateStringsArray | object} styles - CSS styles as either a template literal or an object.
 * @param {...any} values - Optional values for template literals.
 * @returns {string} ClassName - The generated class name.
 */
const cssParser = (styles, ...values) => {
    const className = generateClassName();
    const styleSheet = document.head.appendChild(document.createElement("style")).sheet;

    let cssString = "";

    /**
     * @type {Array<any> | null}
     */
    let nestedCssRules = [];

    /**
     * @type {Array<any> | null}
     */
    let mediaQueryRules = [];

    /**
     * Parses a style object and generates a CSS string.
     * Handles nested selectors, pseudo-classes, and media queries.
     *
     * @param {object} styles - An object representing CSS properties and values.
     * @param {string} selector - The CSS selector to apply the styles to.
     * @returns {string} - A string representing the base CSS styles for the selector.
     */
    const parseStyles = (styles, selector) => {
        let baseStyles = "";
        Object.entries(styles).forEach(([key, value]) => {
            if (typeof value === "object") {
                if (key.startsWith("@")) {
                    mediaQueryRules.push({
                        media: key,
                        selector,
                        styles: value,
                    });
                } else if (key.startsWith("&:")) {
                    // Handle pseudo-classes prefixed with "&:"
                    const pseudoClass = key.replace("&", selector);
                    nestedCssRules.push({
                        selector: pseudoClass,
                        styles: value,
                    });
                } else {
                    // Handle other nested selectors
                    nestedCssRules.push({
                        selector: `${selector} ${key}`,
                        styles: value,
                    });
                }
            } else {
                baseStyles += `${key
                    .replace(/([A-Z])/g, "-$1")
                    .toLowerCase()}: ${value}; `;
            }
        });
        return baseStyles;
    };

    // Check if 'styles' is a template literal or an object
    if (typeof styles === "object" && !Array.isArray(styles)) {
        // It's an object, so we parse it
        cssString = parseStyles(styles, `.${className}`);
    } else if (Array.isArray(styles)) {
        // It's a template literal, combine strings and values into CSS string
        cssString = styles.reduce((result, str, i) => {
            return result + str + (values[i] || "");
        }, "");
    }

    // Insert base class CSS rule
    if (cssString) {
        styleSheet.insertRule(
            `.${className} { ${cssString} }`,
            styleSheet.cssRules.length
        );
    }
    

    // Insert nested CSS rules
    nestedCssRules.forEach(({ selector, styles }) => {
        const nestedCssString = parseStyles(styles, selector);
        if (nestedCssString) {
            const rule = `${selector} { ${nestedCssString} }`;
            styleSheet.insertRule(rule, styleSheet.cssRules.length);
        }
    });

    // Insert media query rules
    mediaQueryRules.forEach(({ media, selector, styles }) => {
        const nestedCssString = parseStyles(styles, selector);
        if (nestedCssString) {
            const rule = `${media} { ${selector} { ${nestedCssString} } }`;
            styleSheet.insertRule(rule, styleSheet.cssRules.length);
        }
    });

    return className;
};

