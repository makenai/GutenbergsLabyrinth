var db = require('../lib/database');
var pos = require('pos');
var _ = require('lodash');

var Lexer = new pos.Lexer();
var Tagger = new pos.Tagger();

module.exports = {

  random: function(req, res, next) {
    db.Sentence.random(function(error,sentence) {
      if (error) {
        return res.status(500).send(error);
      }
      decorateSentence(sentence, function(sentence) {
        res.send( sentence );
      });
    })
  },

  getSentence: function(req, res, next) {
    db.Sentence.get(req.params, function(error, sentence) {
      if (error) {
        return res.status(500).send(error);
      }
      decorateSentence(sentence, function(sentence) {
        res.send( sentence );
      });
    });
  }

};

/**
 * Add book and other meta information to a bare sentence object
 */
function decorateSentence(sentence, done) {
  db.Book.get( sentence.bookId, function(error,book) {
    sentence.book = book;
    var words = Lexer.lex( sentence.sentence );
    var taggedWords = Tagger.tag( words );
    sentence.nouns = _.select(taggedWords, function(w) { return w[1].match(/^N/) }).map(function(w) { return w[0] });
    sentence.verbs = _.select(taggedWords, function(w) { return w[1].match(/^V/) }).map(function(w) { return w[0] });
    db.Sentence.connections(sentence, function(errors,connections) {
      if (!errors) {
          sentence.connections = connections;
      }
      done( sentence );
    });
  });
};