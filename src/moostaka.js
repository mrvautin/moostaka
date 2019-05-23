/**
 * Moostaka is a simple single page web application (SPA) framework handling
 * routing and rendering of templates.
 * 
 * @see https://github.com/mrvautin/moostaka
 */
class Moostaka {
    /**
     * Instantiate the SPA
     * 
     * @param {Object} opts - a dictionary of options. Supported keys are:
     *          {string} defaultRoute - the default route. defaults to '/'
     *          {string} viewLocation - a url fragment for locating page
     *                  templates. defaults to '/views'
     */
    constructor(opts) {
        this.routes = [];

        // define the defaults
        this.defaultRoute = '/';
        this.viewLocation = '/views';

        // redirect to default route if none defined
        if(location.pathname === '') {
            history.pushState('data', this.defaultRoute, this.defaultRoute);
        }

        // override the defaults
        if(opts) {
            this.defaultRoute = typeof opts.defaultRoute !== 'undefined' ? opts.defaultRoute : this.defaultRoute;
            this.viewLocation = typeof opts.viewLocation !== 'undefined' ? opts.viewLocation : this.viewLocation;
        }

        let self = this;
        // hook up events
        document.addEventListener('click', (event) => {
            if(event.target.matches('a[href], a[href] *')) {
                // walk up the tree until we find the href
                let element = event.target;
                while(element instanceof HTMLElement) {
                    if(element.href) {
                        if(element.href.startsWith(location.host) || element.href.startsWith(location.protocol + '//' + location.host)) {
                            // staying in application
                            event.preventDefault();
                            let url = element.href.replace('http://', '').replace('https://', '').replace(location.host, '');
                            let text = document.title;
                            if(element.title instanceof String && element.title != "") {
                                text = element.title;
                            } else if(event.target.title instanceof String && event.target.title != "") {
                                text = event.target.title;
                            }
                            history.pushState({}, text, element.href);
                            self.navigate(url);
                        } // else do nothing so browser does the default thing ie browse to new location
                        return;
                    } else {
                        element = element.parentElement;
                    }
                }
            } // else not a link; ignore
        }, false);

        // pop state
        window.onpopstate = (e) => {
            self.navigate(location.pathname);
        };
    }

    /**
     * handle navigation events routing to a "route" if one is defined which
     * matches the specified pathname
     *  
     * @param {string} pathname the uri to change to
     */
    navigate(pathname) {
        if(this.onnavigate) {
            this.onnavigate(pathname);
        }

        // if no path, go to default
        if(!pathname || pathname === '/') {
            pathname = this.defaultRoute;
        }

        let hashParts = pathname.split('/');
        let params = {};
        for(let i = 0, len = this.routes.length; i < len; i++) {
            if(typeof this.routes[i].pattern === 'string') {
                let routeParts = this.routes[i].pattern.split('/');
                let thisRouteMatch = true;

                // if segment count is not equal the pattern will not match
                if(routeParts.length !== hashParts.length) {
                    thisRouteMatch = false;
                } else {
                    for(let x = 0; x < routeParts.length; x++) {
                        // A wildcard is found, lets break and return what we have already
                        if(routeParts[x] === '*') {
                            break;
                        }
    
                        // if not optional params we check it
                        if(routeParts[x].substring(0, 1) !== ':') {
                            if(lowerCase(routeParts[x]) !== lowerCase(hashParts[x])) {
                                thisRouteMatch = false;
                            }
                        } else {
                            // this is an optional param that the user will want
                            let partName = routeParts[x].substring(1);
                            params[partName] = hashParts[x];
                        }
                    }
                }

                // if route is matched
                if(thisRouteMatch === true) {
                    return this.routes[i].handler(params);
                }
            } else {
                if(pathname.substring(1).match(this.routes[i].pattern)) {
                    return this.routes[i].handler({'hash': pathname.substring(1).split('/')});
                }
            }
        }

        // no routes were matched. try defaultRoute if that is not the route being attempted
        if(this.defaultRoute != pathname) {
            history.pushState('data', 'home', this.defaultRoute);
            this.navigate(this.defaultRoute);
        } // else we should perhaps implement an error route?
    }

    /**
     * Render a template into a specified HTMLElement node
     * 
     * @param {HTMLElement|string} an element node or a string specifiying an
     *      HTMLElement node e.g. '#content' for <div id="content"></div> 
     * @param {string} view - the name of an .mst file in the views location
     *      to use as a template
     * @param {?object} params - additional parameters for the Mustache template
     *      renderer
     * @param {?object} options - a dictionary of options. supported keys:
     *      {array<string>} tags - a list of delimiters for Mustache to use
     *      {bool} append - if true then new content to the element's contents
     *            otherwise replace the contents of element with the render
     *            output. Default: false
     * @param {?function} callback - a callback function to invoke once the
     *      template has been rendered into place
     */
    render(element, view, params, options, callback) {
        let destination = null;
        if(element instanceof HTMLElement) {
            destination = element;
        } else {
            destination = document.querySelector(element);
        }
        if(!params) {
            params = {};
        }
        if(!options) {
            options = {};
        }
        if(typeof options.tags === 'undefined') {
            Mustache.tags = [ '{{', '}}' ];
        } else {
            Mustache.tags = options.tags;
        }
        if(typeof options.append === 'undefined') {
            options.append = false;
        }

        let url = this.viewLocation + '/' + view.replace('.mst', '') + '.mst';
        fetch(url).then((response) => {
            return response.text();
        }).then(template => {
            if(options.append === true) {
                destination.innerHTML += Mustache.render(template, params);
            } else {
                while(destination.firstChild) {
                    destination.removeChild(destination.firstChild);
                }
                destination.innerHTML = Mustache.render(template, params);
            }
            if(callback instanceof Function) {
                callback();
            }
        });
    }

    /**
     * Render a template and the as rendered template to the callback as a
     * string parameter
     * 
     * @param {string} view - the name of an .mst file in the views location
     *      to use as a template
     * @param {?object} params - additional parameters for the Mustache template
     *      renderer
     * @param {?object} options - a dictionary of options. supported keys:
     *      {array<string>} tags - a list of delimiters for Mustache to use
     *      {bool} markdown - if true and window.markdownit exists call
     *          window.markdownit.render() on the template data before
     *          rendering content with Mustache.
     * @param {function} callback - a callback function to invoke once the
     *      template has been rendered. The string value of the rendered
     *      template will be passed to the function as its first and only
     *      paramter
     */
    getHtml(view, params, options, callback) {
        if(!(callback instanceof Function)) {
            throw new TypeError("callback is not a function");
        }
        if(!params) {
            params = {};
        }
        if(!options) {
            options = {};
        }
        if(typeof options.tags === 'undefined') {
            Mustache.tags = [ '{{', '}}' ];
        } else {
            Mustache.tags = options.tags;
        }
        if(typeof options.markdown === 'undefined') {
            options.markdown = false;
        }

        let url = this.viewLocation + '/' + view.replace('.mst', '') + '.mst';
        fetch(url).then(response => {
            return response.text();
        }).then(template => {
            if(window.markdownit && options.markdown === true) {
                let md = window.markdownit();
                callback(Mustache.render(md.render(template), params));
            } else {
                callback(Mustache.render(template, params));
            }
        });
    }

    /**
     * Add a route to the SPA
     * 
     * @param {string} pattern - a pattern string that if matched to the URI
     *      will cause the specified handler to be invoked 
     * @param {function} handler - a callback function to invoke when the user
     *      navigates to this route.
     */
    route(pattern, handler) {
        // should check if pattern is already routed and if so
        // throw error or overwrite?
        this.routes.push({pattern: pattern, handler: handler});
    }

    /**
     * clear all routes currently configured useful if transitioning between 
     * authenticated and unauthenticated states
     */
    flush() {
        this.routes = [];
    }
}

/*
 * In Javascript NULL and undefined values do not respond to .toLowerCase()
 * in fact calling .toLowerCase() on NULL will raise an error stopping
 * script execution which is problematic. lowerCase() is therefore a cover
 * for .toLowerCase() which checks that the value is not falsy before invoking
 * .toLowerCase()
 */
function lowerCase(value){
    if(value){
        return value.toLowerCase();
    }
    return value;
}
