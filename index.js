var express = require('express');
var app = express();
app.use(
  express.static('public')
);

var api = require('./routes/api');
app.get('/random', api.random);
app.get('/book/:bookId/sentence/:number', api.getSentence);
app.get('/sentence/:id', api.getSentence);

app.listen(3000, function () {
  console.log('Listening on port 3000!');
});