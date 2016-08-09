var Moostaka = function(opts){
    this.routes = [];

    // define the defaults
    this.defaultRoute = '#/';
    this.viewLocation = '/views';

    // redirect to default route if none defined
    if(location.hash === ''){
        window.location = this.defaultRoute;
    }

    // override the defaults
    if(opts){
        this.defaultRoute = typeof opts.defaultRoute !== 'undefined' ? opts.defaultRoute : this.defaultRoute;
        this.viewLocation = typeof opts.viewLocation !== 'undefined' ? opts.viewLocation : this.viewLocation;
    }

    // hook window change events
    var moostaka = this;
    window.onhashchange = function(){
        moostaka.navigate(location.hash);
    };

    // hook onload event
    window.onload = function(){
        moostaka.navigate(location.hash);
    };
};

Moostaka.prototype.navigate = function(hash){
    if(location.hash !== hash){
        // do we need to skip the next event?
        location.hash = hash;
    }

    if(this.onnavigate){
        this.onnavigate(hash);
    }

    var routeMatch = false;
    for(var i = 0; i < this.routes.length; i++){
        var params = {};
        var hashParts = hash.split('/');

        if(typeof this.routes[i].pattern === 'string'){
            var routeParts = this.routes[i].pattern.split('/');
            var thisRouteMatch = true;

            for(var x = 0; x < routeParts.length; x++){
                // A wildcard is found, lets break and return what we have already
                if(routeParts[x] === '*'){
                    break;
                }

                // check if segment length differs for strict matching
                if(routeParts.length !== hashParts.length){
                    thisRouteMatch = false;
                }

                // if not optional params we check it
                if(routeParts[x].substring(0, 1) !== ':'){
                    if(lowerCase(routeParts[x]) !== lowerCase(hashParts[x])){
                        thisRouteMatch = false;
                    }
                }else{
                    // this is an optional param that the user will want
                    var partName = routeParts[x].substring(1);
                    params[partName] = hashParts[x];
                }
            }

            // if route is matched
            if(thisRouteMatch === true){
                routeMatch = true;
                this.routes[i].handler(params);
                return;
            }
        }else{
            if(hash.replace('#/', '').match(this.routes[i].pattern)){
                this.routes[i].handler({'hash': hash.replace('#/', '').split('/')});
                return;
            }
        }
    }

    // no routes were matched. Redirect to a server side 404 for best SEO
    if(routeMatch === false){
        window.location = this.defaultRoute;
    }
};

function lowerCase(value){
    if(value){
        return value.toLowerCase();
    }
    return value;
}

function loadScript(url, callback){
    $.ajax({
        url: url,
        dataType: 'script',
        success: callback,
        cache: true,
        async: true
    });
}

Moostaka.prototype.render = function(element, view, params, callback){
    $.ajax({
        url: this.viewLocation + '/' + view.replace('.mst', '') + '.mst',
        dataType: 'text'
    }).done(function (template){
        $(element).empty();
        $(element).html(window.Mustache.to_html($(template).html(), params));
        if(typeof callback !== 'undefined'){
            callback();
        };
    });
};

Moostaka.prototype.getHtml = function(view, params, markdown, callback){
    $.ajax({
        url: this.viewLocation + '/' + view.replace('.mst', '') + '.mst',
        dataType: 'text'
    }).done(function (template){
        if(typeof markdown !== 'undefined' && markdown === true){
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/markdown-it/7.0.0/markdown-it.min.js', function(){
                var md = window.markdownit();
                var html = '<script id="template" type="text/template">' + md.render(template) + '</script>';
                callback(window.Mustache.to_html($(html).html(), params));
            });
        }else{
            callback(window.Mustache.to_html($(template).html(), params));
        }
    });
};

Moostaka.prototype.route = function(pattern, handler){
    this.routes.push({pattern: pattern, handler: handler});
};
