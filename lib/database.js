var db = require('sqlite3-wrapper').open('./database.sqlite3')

module.exports = {
  Book: {
    create: function(data, cb) {
      db.insert('books', data, cb);
    }
  },
  Sentence: {
    create: function(data,cb) {
      db.insert('sentences', data, cb);
    },
    random: function(data,db) {
    // SELECT * FROM sentences
    //   WHERE id >= (abs(random()) % (SELECT max(id) FROM sentences))
    //   LIMIT 1;
    }
  }
};