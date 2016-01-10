var db = require('sqlite3-wrapper').open('./database.sqlite3');
var yaml = require('js-yaml');
var async = require('async');
var _ = require('lodash');

module.exports = {
  Book: {
    create: function(data, cb) {
      db.insert('books', data, cb);
    },
    list: function(cb) {
      db.select({ table: 'books'}, cb );
    },
    get: function(id,cb) {
      db.select({ table: 'books', where: { id: id }, limit: 1 }, function(error, book) {
        if (error) {
          return cb(error);
        }
        try {
          // Replace some tags this parser can't handle.
          // https://github.com/gitenberg-dev/metadata/blob/master/gitenberg/metadata/pandata.py#L17
          var noTags = book[0].metadata.replace(/(\!lcc|\!lcsh|\!bisacsh)/g, '')
          var metadata = yaml.safeLoad( noTags );
          book[0].metadata = metadata;
        } catch(e) {
          console.log( e );
        }
        cb(null, book[0]);
      });
    }
  },
  Sentence: {
    create: function(data,cb) {
      db.insert('sentences', data, cb);
    },
    random: function(cb) {
      db.database().get('SELECT * FROM sentences WHERE id >= (abs(random()) % (SELECT max(id) FROM sentences)) LIMIT 1;', cb);
    },
    get: function(params,cb) {
      if (params.number) {
        db.select({
          table: 'sentences',
          where: { bookId: params.bookId, sentenceNumber: params.number },
          limit: 1 }, function(error, sentences) {
            cb(error,sentences[0]);
        });
      } else if (params.id) {
        db.select({
          table: 'sentences',
          where: { id: params.id },
          limit: 1 }, function(error, sentences) {
            cb(error,sentences[0]);
        });
      }
    },
    connection: function(bookId, word,cb) {
      db.select({
        fields: 'id',
        table: 'sentences',
        where: { clause: "bookId != ? AND ( sentence LIKE ? OR sentence LIKE ? OR sentence LIKE ?)", params: [ bookId, '% ' + word + ' %', word + ' %', '% ' + word ] },
        limit: 10
      }, function(error, connections) {
        if (error) {
          return cb(error);
        }
        var connection = _.shuffle(connections)[0];
        if (connection) {
          connection.sourceWord = word;
        }
        cb(null, connection);
      });
    },
    connections: function(sentence, cb) {
      var Sentence = this;
      var importantWords = _.select(sentence.nouns, function(w) {
        return w.length > 3;
      }).slice(5);
      async.map(importantWords, function(word,done) {
        Sentence.connection(sentence.bookId, word, done);
      }, function(err,results) {
        cb( err, _.compact(results) );
      });
    }
  }
};