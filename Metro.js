// Metro  Library For Hybrid Apps
// A set of useful methods, functions
// For building high qaulity apps.

// @license
// MIT

// @version
// 0.0.5

// @author
// Oarabile Koore

/**
 * returns the system device theme, works in browser environment
 * @returns SystemTheme
 */
$sysTheme = function () {
    const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
    if (darkThemeMq.matches) {
        return "dark";
    } else return "light";
};

/**
 * attach event listeners to the document body.
 * @param {HTMLEventListener} event
 * @param {Function} handlerFn
 */
$on = function (event, handlerFn) {
    document.addEventListener(event, handlerFn);
};

const defaultLanguage = navigator.language || navigator.userLanguage;
const defaultLangCode = defaultLanguage.split("-")[0];
let translations = {};
let currentLang;

$localize = async function (defaultLang = defaultLangCode, jsonSource) {
    currentLang = $signal(defaultLang);

    const response = await fetch(jsonSource);
    if (!response.ok) {
        console.log("Translation File Not Loaded");
        return;
    }

    const loadedTranslations = await response.json();
    translations = { ...translations, ...loadedTranslations };
};

$setLanguage = function (langCode) {
    currentLang.value = langCode;
};

$localizedText = function (key, placeholders, selfA, selfB) {
    if (!currentLang || !currentLang.value) {
        return key;
    }

    const langData =
        translations[currentLang.value] || translations[defaultLangCode] || {};
    let translation = langData[key] || key;
    if (placeholders) {
        Object.keys(placeholders).forEach((placeholder) => {
            translation = translation.replace(
                `{${placeholder}}`,
                placeholders[placeholder]
            );
        });
    }
    return translation;
};

/**
 * Set the text accordingly to the languageCode and provided keys
 * @param {object} localizingFn
 * @param {string} key
 * @param {object} placeholders
 */
ui.Control.prototype.localizedText = async function (key, placeholders) {
    if (!currentLang || !currentLang.value) {
        return key;
    }

    const localizedText = await $localizedText(
        key,
        placeholders,
        this.tag,
        this.text
    );
    if (this.tag) {
        this.textContent = localizedText;
    } else {
        this.text = localizedText;
    }

    currentLang.subscribe(async (code) => {
        const localizedText = await $localizedText(
            key,
            placeholders,
            this.tag,
            this.text
        );
        if (this.tag) {
            this.textContent = localizedText;
        } else {
            this.text = localizedText;
        }
    });
};

/**
 * showIF method allows you to hide or show an element if the restingParameter is truthy
 * @param {Boolean} restingParameter
 * @param {instanceOf<ui.Control>} onTruthyElement
 * @param {instanceOf<ui.Control>} onFalseyElement
 */
$showIF = function (restingParameter, onTruthyElement, onFalseyElement) {
    if (onTruthyElement === undefined || onFalseyElement === undefined) {
        ui.showPopup(
            `showIF not called, one of the elements is undefined`,
            "long",
            4500
        );
        return;
    }
    restingParameter ? onTruthyElement.show() : onTruthyElement.hide();
    !restingParameter ? onFalseyElement.show() : onFalseyElement.hide();
};

/**
 * signal Method allows you to use plain signals, it takes in plain values and gives reactivity.
 * @param {any} defaultValue
 */
$signal = function (defaultValue = null) {
    let internal_variable = defaultValue;
    let subscriptions = [];

    const notify = function (fn) {
        for (let subscriber of subscriptions) {
            subscriber(internal_variable);
        }
    };
    return {
        /**
         * set the signal's value
         * @param {any} val
         */
        set value(val) {
            internal_variable = val;
            notify();
        },

        /**
         * returns the signals value
         * @returns internal_variable
         */
        get value() {
            return internal_variable;
        },

        /**
         * subscribe to the signal
         * @param {Function} fn
         */
        subscribe: (fn) => {
            subscriptions.push(fn);
        },
    };
};

/**
 * safe stringify alternative to JSON.stringify for objects with FiberRootNode (Mostly Found When Dealing With React)
 * will be seen as you extract component info
 * @param {object} obj
 */
$stringify = function (obj) {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return; // Circular reference found
            }
            seen.add(value);
        }
        return value;
    });
};

/**
 * add a signal that takes in the defaultValue as an object
 * @param {Object} initialValue = {}
 */
$store = function (initialValue = {}) {
    let state = { ...initialValue };
    const listeners = new Set();

    return {
        /**
         * set the signal's value
         * @param {any} val
         */
        set(key, value) {
            state[key] = value;
            listeners.forEach((listener) => listener(state));
        },

        /**
         * returns the signals value
         * @returns internal_variable
         */
        get(key) {
            return state[key];
        },

        /**
         * subscribe to the signal
         * @param {Function} fn
         */
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
};

// // Usage
// const appStore = $store({ theme: 'light', language: 'en' });
// appStore.subscribe((newState) => console.log('State updated:', JSON.stringify(newState)));
// appStore.set('theme', 'dark')

/**
 * show a fallback view during an async operation, then swap it out when done.
 * @param {asyncFunction} resource
 * @param {instanceOf<ui.Control>} fallback
 * @param {instanceOf<ui.Control>} controlInSuspension
 */
const $suspense = (resource, fallback, controlInSuspension) => {
    const subscriptions = [];

    const notify = () => subscriptions.forEach((subscriber) => subscriber());

    if (controlInSuspension.type === "Layout") {
        if (!controlInSuspension.hasChild(fallback)) {
            ui.showPopup(
                `FallBack is not a child of ${controlInSuspension}`,
                "Long",
                "4500"
            );
            return;
        }

        const fallback_id = fallback._id;
        const incremented_children_array = Object.keys(
            controlInSuspension.children
        )
            .map(Number)
            .map((childId) => childId + 1);

        const hideChildren = () => {
            incremented_children_array.forEach((child_id) => {
                if (child_id !== fallback_id) {
                    const element = document.getElementById("d" + child_id);
                    if (element) element.style.display = "none";
                }
            });
        };

        const showChildren = () => {
            fallback.hide();
            incremented_children_array.forEach((child_id) => {
                if (child_id !== fallback_id) {
                    const element = document.getElementById("d" + child_id);
                    if (element) element.style.display = "block";
                }
            });
        };

        hideChildren();

        Promise.resolve(resource())
            .then(() => {
                showChildren();
                notify();
            })
            .catch(() => hideChildren());
    } else {
        fallback.show();
        controlInSuspension.hide();

        Promise.resolve(resource())
            .then(() => {
                fallback.hide();
                controlInSuspension.show();
                notify();
            })
            .catch(() => {
                fallback.show();
                controlInSuspension.hide();
            });
    }

    return {
        /**
         * call a function after the new view is added
         * @param {Function} fn
         */
        effects: (fn) => subscriptions.push(fn),
    };
};

/**
 * create your own ui control without having verbose code to write.
 * @param {instanceOf<ui.Control>} parent
 * @param {HTMLElement} tag
 * @param {number} width
 * @param {number} height
 * @param {Object} properties
 * @param {String} options = ''
 */
$component = function (parent, tag, width, height, properties, options = "") {
    return new uiComponent(parent, tag, width, height, properties, options);
};

class uiComponent extends ui.Control {
    constructor(parent, tag, width, height, properties = {}, options = "") {
        super(parent, width, height, options);

        this._ctl = document.createElement(tag);

        this._div.appendChild(this._ctl);
        this.batch(properties);
    }

    // call the cssParser Function
    css(styles) {
        const className = cssParser(styles);
        this._ctl.classList.add(className);
        return this;
    }

    batch(updatesAsObject = {}) {
        Object.entries(updatesAsObject).forEach(([key, value]) => {
            requestAnimationFrame(() => {
                if (this) {
                    this._ctl[key] = value;
                }
            });
        });
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
$enableDrag = function (object, callback, ondragend) {
    if (!object._div) {
        console.log(`ui.Control Property Not Mounted`);
        return;
    }
    draggingEl = object._div;

    const touchHandler = (e) => {
        draggingElprops.position = object.el.style.position;
        draggingElprops.dragend = ondragend;

        object.el.style.position = "absolute";
        callback ? callback(e) : null;

        isDragging = true;
        const touch = e.touches[0];
        if (touch) {
            dqoffsetX = touch.clientX - draggingEl.getBoundingClientRect().left;
            dqoffsetY = touch.clientY - draggingEl.getBoundingClientRect().top;
            draggingEl.style.cursor = "grabbing";
        } else {
            console.log("Touch event did not contain touches"); // Debugging
        }
    };
    object.el.addEventListener("touchstart", touchHandler);
    object.el._touchHandler = touchHandler;
};

/**
 * disableDrag method removes the drag eventListenet
 * @param {instanceOf<ui.Control>} object
 * @param {Boolean} moveToOldPosition
 */
$disableDrag = function (object, moveToOldPosition) {
    object.el.style.position = "fixed";
    dqoffsetX, (dqoffsetY = 0);
    isDragging = false;
    draggingEl = null;

    object.el.removeEventListener("touchstart", object.el._touchHandler);
    delete object.el._touchStartHandler;

    moveToOldPosition
        ? (object.el.style.position = draggingElprops.position)
        : null;
};

// Handle touch movement
document.addEventListener("touchmove", (e) => {
    if (isDragging) {
        const touch = e.touches[0];
        if (touch) {
            draggingEl.style.left = `${touch.clientX - dqoffsetX}px`;
            draggingEl.style.top = `${touch.clientY - dqoffsetY}px`;
        } else {
            console.log("Touchmove event did not contain touches"); // Debugging
        }
    }
});

// End drag on touchend
document.addEventListener("touchend", () => {
    isDragging = false;
    if (draggingEl) {
        draggingEl.style.cursor = "grab";
        draggingElprops.dragend ? draggingElprops.dragend() : null;
    }
});

/**
 * create an animation sequence on the control
 */
ui.Control.prototype.createAnimSequence = function () {
    if (!this._div) {
        console.log(`ui.Control Property Not Mounted`);
        return;
    }

    this._onStart = null;
    this._onCompleted = null;
    this._isAnimating = false;
    this._animationQueue = [];
    this._currentAnimation = null;
    this._computedAnimation = null;
    return this;
};

/**
 * Ends the current animation.
 */
ui.Control.prototype.end = function () {
    this._isAnimating = false;
    this._div.style.transition = "";
    this._animationQueue = [];
    this._currentAnimation = null;
};

/**
 * Checks if the animation is currently running.
 * @returns {boolean} - Returns true if the animation is running, otherwise false.
 */
ui.Control.prototype.isRunning = function () {
    return this._isAnimating;
};

/**
 * Moves the element to a new position.
 * @param {number} left - The new left position.
 * @param {number} top - The new top position.
 * @param {number} duration - The duration of the animation in milliseconds.
 * @param {number} [delay=0] - The delay before the animation starts in milliseconds.
 * @returns {ui.Control} - The instance for chaining.
 */
ui.Control.prototype.move = function (left, top, duration, delay = 0) {
    this._animationQueue.push(() => {
        return new Promise((resolve) => {
            setTimeout(() => {
                this._div.style.position = `absolute`;
                this._div.style.transform = `translate(${left}px, ${top}px)`;
                this._div.style.transition = `transform ${duration}ms`;
                this._div.addEventListener("transitionend", () => resolve(), {
                    once: true,
                });
            }, delay);
        });
    });
    return this;
};

/**
 * Moves the element horizontally.
 * @param {number} left - The new left position.
 * @param {number} duration - The duration of the animation in milliseconds.
 * @param {number} [delay=0] - The delay before the animation starts in milliseconds.
 * @returns {ui.Control} - The instance for chaining.
 */
ui.Control.prototype.positionX = function (left, duration, delay = 0) {
    this._animationQueue.push(() => {
        return new Promise((resolve) => {
            setTimeout(() => {
                this._div.style.transform = `translateX(${left}px)`;
                this._div.style.transition = `transform ${duration}ms`;
                this._div.addEventListener("transitionend", () => resolve(), {
                    once: true,
                });
            }, delay);
        });
    });
    return this;
};

/**
 * Moves the element vertically.
 * @param {number} top - The new top position.
 * @param {number} duration - The duration of the animation in milliseconds.
 * @param {number} [delay=0] - The delay before the animation starts in milliseconds.
 * @returns {ui.Control} - The instance for chaining.
 */
ui.Control.prototype.positionY = function (top, duration, delay = 0) {
    this._animationQueue.push(() => {
        return new Promise((resolve) => {
            setTimeout(() => {
                this._div.style.transform = `translateY(${top}px)`;
                this._div.style.transition = `transform ${duration}ms`;
                this._div.addEventListener("transitionend", () => resolve(), {
                    once: true,
                });
            }, delay);
        });
    });
    return this;
};

/**
 * Rotates the element.
 * @param {number} angle - The rotation angle in degrees.
 * @param {number} duration - The duration of the animation in milliseconds.
 * @param {number} [delay=0] - The delay before the animation starts in milliseconds.
 * @returns {ui.Control} - The instance for chaining.
 */
ui.Control.prototype.rotate = function (angle, duration, delay = 0) {
    this._animationQueue.push(() => {
        return new Promise((resolve) => {
            setTimeout(() => {
                this._div.style.transform = `rotate(${angle}deg)`;
                this._div.style.transition = `transform ${duration}ms`;
                this._div.addEventListener("transitionend", () => resolve(), {
                    once: true,
                });
            }, delay);
        });
    });
    return this;
};

/**
 * Rotates the element around the X axis.
 * @param {number} angle - The rotation angle in degrees.
 * @param {number} duration - The duration of the animation in milliseconds.
 * @param {number} [delay=0] - The delay before the animation starts in milliseconds.
 * @returns {ui.Control} - The instance for chaining.
 */
ui.Control.prototype.rotateX = function (angle, duration, delay = 0) {
    this._animationQueue.push(() => {
        return new Promise((resolve) => {
            setTimeout(() => {
                this._div.style.transform = `rotateX(${angle}deg)`;
                this._div.style.transition = `transform ${duration}ms`;
                this._div.addEventListener("transitionend", () => resolve(), {
                    once: true,
                });
            }, delay);
        });
    });
    return this;
};

/**
 * Rotates the element around the Y axis.
 * @param {number} angle - The rotation angle in degrees.
 * @param {number} duration - The duration of the animation in milliseconds.
 * @param {number} [delay=0] - The delay before the animation starts in milliseconds.
 * @returns {ui.Control} - The instance for chaining.
 */
ui.Control.prototype.rotateY = function (angle, duration, delay = 0) {
    this._animationQueue.push(() => {
        return new Promise((resolve) => {
            setTimeout(() => {
                this._div.style.transform = `rotateY(${angle}deg)`;
                this._div.style.transition = `transform ${duration}ms`;
                this._div.addEventListener("transitionend", () => resolve(), {
                    once: true,
                });
            }, delay);
        });
    });
    return this;
};

/**
 * Scales the element in both X and Y directions.
 * @param {number} x - The scale factor in the X direction.
 * @param {number} y - The scale factor in the Y direction.
 * @param {number} duration - The duration of the animation in milliseconds.
 * @param {number} [delay=0] - The delay before the animation starts in milliseconds.
 * @returns {ui.Control} - The instance for chaining.
 */
ui.Control.prototype.scale = function (x, y, duration, delay = 0) {
    this._animationQueue.push(() => {
        return new Promise((resolve) => {
            setTimeout(() => {
                this._div.style.transform = `scale(${x}, ${y})`;
                this._div.style.transition = `transform ${duration}ms`;
                this._div.addEventListener("transitionend", () => resolve(), {
                    once: true,
                });
            }, delay);
        });
    });
    return this;
};

/**
 * Scales the element in the X direction.
 * @param {number} x - The scale factor in the X direction.
 * @param {number} duration - The duration of the animation in milliseconds.
 * @param {number} [delay=0] - The delay before the animation starts in milliseconds.
 * @returns {ui.Control} - The instance for chaining.
 */
ui.Control.prototype.scaleX = function (x, duration, delay = 0) {
    this._animationQueue.push(() => {
        return new Promise((resolve) => {
            setTimeout(() => {
                this._div.style.transform = `scaleX(${x})`;
                this._div.style.transition = `transform ${duration}ms`;
                this._div.addEventListener("transitionend", () => resolve(), {
                    once: true,
                });
            }, delay);
        });
    });
    return this;
};

/**
 * Scales the element in the Y direction.
 * @param {number} y - The scale factor in the Y direction.
 * @param {number} duration - The duration of the animation in milliseconds.
 * @param {number} [delay=0] - The delay before the animation starts in milliseconds.
 * @returns {ui.Control} - The instance for chaining.
 */
ui.Control.prototype.scaleY = function (y, duration, delay = 0) {
    this._animationQueue.push(() => {
        return new Promise((resolve) => {
            setTimeout(() => {
                this._div.style.transform = `scaleY(${y})`;
                this._div.style.transition = `transform ${duration}ms`;
                this._div.addEventListener("transitionend", () => resolve(), {
                    once: true,
                });
            }, delay);
        });
    });
    return this;
};

/**
 * Sets the callback function to be called when the animation starts.
 * @param {Function} callback - The callback function to be called when the animation starts.
 */
ui.Control.prototype.setOnStart = function (callback) {
    this._onStart = callback;
};

/**
 * Sets the callback function to be called when the animation ends.
 * @param {Function} callback - The callback function to be called when the animation ends.
 */
ui.Control.prototype.setOnCompleted = function (callback) {
    this._onCompleted = callback;
};

/**
 * Starts the animation queue.
 * @returns {ui.Control} - The instance for chaining.
 */
ui.Control.prototype.start = function () {
    if (this._onStart) {
        this._onStart();
    }
    this._isAnimating = true;
    this._executeNextAnimation();
    return this;
};

/**
 * Executes the next animation in the queue.
 * @private
 */
ui.Control.prototype._executeNextAnimation = function () {
    if (this._animationQueue.length > 0) {
        this._currentAnimation = this._animationQueue.shift();
        this._currentAnimation().then(() => {
            this._executeNextAnimation();
        });
    } else {
        this.end();
    }
};

/**
 * Executes a function after the current animation finishes.
 * @returns {ui.Control} - The instance for chaining.
 */
ui.Control.prototype.then = function () {
    this._animationQueue.push(() => Promise.resolve());
    return this;
};

/**
 * Translates the element to a new position.
 * @param {number} left - The new left position.
 * @param {number} top - The new top position.
 * @param {number} duration - The duration of the animation in milliseconds.
 * @param {number} [delay=0] - The delay before the animation starts in milliseconds.
 * @returns {ui.Control} - The instance for chaining.
 */
ui.Control.prototype.translate = function (left, top, duration, delay = 0) {
    this._animationQueue.push(() => {
        return new Promise((resolve) => {
            setTimeout(() => {
                this._div.style.transform = `translate(${left}px, ${top}px)`;
                this._div.style.transition = `transform ${duration}ms`;
                this._div.addEventListener("transitionend", () => resolve(), {
                    once: true,
                });
            }, delay);
        });
    });
    return this;
};

/**
 * Translates the element horizontally.
 * @param {number} left - The new left position.
 * @param {number} duration - The duration of the animation in milliseconds.
 * @param {number} [delay=0] - The delay before the animation starts in milliseconds.
 * @returns {instanceOf<ui.Control>} - The instance for chaining.
 */
ui.Control.prototype.translateX = function (left, duration, delay = 0) {
    this._animationQueue.push(() => {
        return new Promise((resolve) => {
            setTimeout(() => {
                this._div.style.transform = `translateX(${left}px)`;
                this._div.style.transition = `transform ${duration}ms`;
                this._div.addEventListener("transitionend", () => resolve(), {
                    once: true,
                });
            }, delay);
        });
    });
    return this;
};

/**
 * Translates the element vertically.
 * @param {number} top - The new top position.
 * @param {number} duration - The duration of the animation in milliseconds.
 * @param {number} [delay=0] - The delay before the animation starts in milliseconds.
 * @returns {ui.Control} - The instance for chaining.
 */
ui.Control.prototype.translateY = function (top, duration, delay = 0) {
    this._animationQueue.push(() => {
        return new Promise((resolve) => {
            setTimeout(() => {
                this._div.style.transform = `translateY(${top}px)`;
                this._div.style.transition = `transform ${duration}ms`;
                this._div.addEventListener("transitionend", () => resolve(), {
                    once: true,
                });
            }, delay);
        });
    });
    return this;
};

/**
 * Handles the end of an animation.
 * @private
 */
ui.Control.prototype._onAnimationEnd = function () {
    this._isAnimating = false;
    if (this._animationQueue.length > 0) {
        this._executeNextAnimation();
    } else if (this._onCompleted) {
        this._onCompleted();
    }
};

/**
 * batch method calls all your effects at one shot in an optimized manner
 * @param {Object} updatesAsObject
 */
ui.Control.prototype.batch = function (updatesAsObject) {
    if (!this._div) {
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
};

/**
 * add an event listener to your element
 * @param {HTMLEventListener} event
 * @param {Function} handlerFn
 */
ui.Control.prototype.on = function (event, handlerFn) {
    if (!this._div) {
        console.log(`ui.Control Property Not Mounted`);
        return;
    }
    this._div?.addEventListener(event, handlerFn);
    return this;
};

/**
 * remove an event listener to your element
 * @param {HTMLEventListener} event
 * @param {Function} handlerFn
 */
ui.Control.prototype.off = function (event, handlerFn) {
    this._div.removeEventListener(event, handlerFn);
    return this;
};
/**
 * add styles to an element as a template literal or an object
 * @param {object | TemplateStringsArray} styles
 * @returns {this}
 */
ui.Control.prototype.css = function (styles) {
    if (!this._div) {
        console.log(`ui.Control Property Not Mounted`);
        return;
    }
    const className = cssParser(styles);

    if (this.tag) this.classList.add(className);
    else {
        ui.showPopup(
            "Cannot add css any to ui Object, use ui.addHTMLElement",
            "Long",
            4500
        );
        return;
    }
    return this;
};

function generateClassName() {
    let count = 0;
    return `metro-class-${count++}`;
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
    const styleSheet = document.head.appendChild(
        document.createElement("style")
    ).sheet;

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
