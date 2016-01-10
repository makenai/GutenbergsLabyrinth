var _ = require('lodash');
var fs = require('fs');
var CSVParser = require('csv-parse');
var Tokenizer = require('sentence-tokenizer');
var request = require('request');
var async = require('async');
var db = require('./lib/database');

db.Book.list(function(errors, books) {
  _.each(books, function(book) {
    console.log( 'curl ' + book.cover + ' -o ' + book.id + '.jpg');
  });
});