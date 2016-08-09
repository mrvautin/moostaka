## Installation

[moostaka](https://github.com/mrvautin/moostaka) depends on jQuery and Moustache. They need to be added to your `<head>` tag above moostaka.js

A demo and examples can be found: [http://moostaka.mrvautin.com](http://moostaka.mrvautin.com)

Example:

``` html
<script src='https://cdnjs.cloudflare.com/ajax/libs/mustache.js/2.2.1/mustache.min.js'></script>
<script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.min.js'></script>
<script src='dist/moostaka.js'></script>
```

### Using npm

`npm install moostaka`

### Manually

Download the [moostaka](https://github.com/mrvautin/moostaka) library from [here](https://github.com/mrvautin/moostaka/archive/master.zip).

## Getting started

### Main layout

Your app will use a main HTML file - eg: `index.html`. This will contain all Javascript, CSS and possibly some general layout elements (menus, sidebar, footer etc). An example layout to get started:

``` html
<!DOCTYPE html>
<html lang='en'>
  <head>
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>moostaka template</title>
    <script src='https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js'></script>
    <script src='https://cdnjs.cloudflare.com/ajax/libs/mustache.js/2.2.1/mustache.min.js'></script>
    <script src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js'></script>
    <script src='dist/moostaka.js'></script>
    <link href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css' rel='stylesheet'>
  </head>
  <body>
    <div id='main-body'></div>
  </body>
</html>
```

### Setting up

Create a new instance of moostaka:
``` javascript
var moostaka = new Moostaka();
```

### Options

moostaka allows a few options:

`defaultRoute` = The route which the browser will be redirected too should no route be matched

`viewLocation` = The path to the folder which will contain the view (`.mst`) files

``` javascript
var moostaka = new Moostaka({
    defaultRoute: '#/contact',
    viewLocation: '/my_view_folder'
});
```

**Default options**

`defaultRoute`: '#/'

`viewLocation`: '/views''

### Routing

Setting up a `home` route is as simple as:

``` javascript
moostaka.route('#/', function(params){
  // do stuff
});
```

And a `contact` route like so:

``` javascript
moostaka.route('#/contact', function(params){
  // do stuff
});
```

## Render

### Templates

Views are Mustache template files which are loaded by routes. Each view **must** have the `.mst` file extension.
An example static `home.mst` view:

``` html
<script id='template' type='text/template'>
   <h1>This is a view</h1>
</script>
```

Views can also render data (see 'Rendering a view') by using the double Mustache brackets `{{variable}}`:

``` html
<script id='template' type='text/template'>
   <h1>This is a view</h1>
   <h1>My name is {{name}}</h1>
</script>
```

### Rendering a view

Views are rendered by calling the `render()` function. This can be done with or without a callback.

The function takes the following parameters:

1.  The target element within `index.html` which the view HTML will be appended to using jQuery selectors
2.  The name of the view file (with or without extension)
3.  Parameters or data in the form of a Javascript Object which the view will render

Without a callback:

``` javascript
moostaka.render('#main-body', 'home', params);
```

With a callback:

``` javascript
moostaka.render('#main-body', 'home', params, function(){
   // The rendering is complete and HTML within '#main-body' can be accessed
});
```

### Get HTML

In the instance you simply want the HTML and not wanting to automatically render that to a DIV you can use the `getHtml()` funtion.
This function **must** have a callback in order to return the HTML data.

The function takes the following parameters:

1.  The name of the view file (with or without extension)
2.  Parameters or data in the form of a Javascript Object which the view will render
3.  A boolean value if the data within the template is in Markdown format. Eg: True = convert Markdown to HTML

``` javascript
moostaka.getHtml('markdown', params, true, function(html){
    // Do things with the returned html
});
```

## Advanced routing

### String matching

Routing can be as simple or as complex as you like. You can collect optional parameters, use wildcards and even regex to match your routes. Eg: To match: `http://localhost:8080/#/profile` you would do:

``` javascript
moostaka.route('#/profile', function(params){
  // do stuff
});
```

### Segment parameters

You are able to specify optional parameters by doing:

``` javascript
moostaka.route('#/profile/:name', function(params){
  // do stuff
});
```

This will match route: `http://localhost:8080/#/profile/JohnSmith` (for example) and return the `JohnSmith` value back in the `params` as a named object.

The `params` object will look like:

``` javascript
{
  'name': 'JohnSmith'
}
```

### Regex goodness

You can also specify pure regex in your route.
For example, this will match if only numbers are supplied:

``` javascript
moostaka.route(/^\d+$/, function(params){
  // do stuff
});
```

This will match route: `http://localhost:8080/#/1234` (for example) and return the `1234` value back in the `params` object as an array.

The `params` object will look like:

``` javascript
{
    'hash': [
        '1234'
    ]
}
```