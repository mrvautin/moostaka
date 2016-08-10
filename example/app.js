var express = require('express');
var app = express();
var path = require('path');

// serving static content
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/dist')));

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(7979);

module.exports = app;
