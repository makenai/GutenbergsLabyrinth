var _ = require('lodash');
var fs = require('fs');
var CSVParser = require('csv-parse');
var Tokenizer = require('sentence-tokenizer');
var request = require('request');
var async = require('async');
var db = require('./lib/database');

var masterList = 'gitenberg.csv';
fs.createReadStream(masterList).pipe(CSVParser({
  columns: ['Title','Author','Gitenberg Status','Gitenberg URL','Status','Epub']
}, function(err, data){
  async.eachSeries(data, function(row, done) {
    var baseUrl = row['Gitenberg URL'];
    if (!baseUrl)
      return done();
    async.auto({
      'getMetaData': function(callback) {
        getGitenburgMetadata( baseUrl, callback );
      },
      'getText': [ 'getMetaData', function(callback) {
        getGitenburgText( baseUrl, callback );
      }],
      'createBook': [ 'getText', function(callback, results) {
        var gutenbergId = baseUrl.match(/\d+$/)[0];
        var cover = getCover( baseUrl );
        db.Book.create({
          id: gutenbergId,
          title: row['Title'],
          author: row['Author'],
          url: row['Gitenberg URL'],
          cover: cover,
          metadata: results.getMetaData
        }, callback);
      }],
      'createSentences': [ 'createBook', function(callback, results) {
        var blocks = getSentences( results.getText )
        var blockNumber=0;
        var sentenceNumber=0;
        for (var b=0;b<blocks.length;b++) {
          var block = blocks[b];
          blockNumber++;
          for (var s=0;s<block.length;s++) {
            var sentence = block[s];
            sentenceNumber++;
            db.Sentence.create({
              bookId: results.createBook,
              blockNumber: blockNumber,
              sentenceNumber: sentenceNumber,
              sentence: sentence
            });
          }
        }
        callback();
      }]
    }, function(errors,results) {
      if (!errors) {
          console.log('Processed ' + baseUrl);
      }
      done();
    });
  });
}));

function getSentences(data) {
  try {
    var returnedBlocks = [];
    var tokenizer = new Tokenizer();
    var content = removeAsciiDoc(data);
    var blocks = content.replace('\r\n','\n').split(/\n{2,}/);
    for (var i=0;i<blocks.length;i++) {
      var block = blocks[i];
      if (!block.match(/^[\r\n\s]*$/)) {
        tokenizer.setEntry(block);
        var sentences = tokenizer.getSentences();
        returnedBlocks.push( sentences );
      }
    }
    return returnedBlocks;
  } catch(e) {
    console.log( e );
  }
}

function removeAsciiDoc(content) {
  return _.reject(content.split("\n"), function(line) {
    return line.match(/^(image:|=|\.|-|#|\*|\[|\+)/);
  }).join('\n');
}

function getCover(baseUrl, callback) {
  var url = baseUrl.replace(/^https?:\/\/github\.com\//,'https://raw.githubusercontent.com/') + '/master/cover.jpg';
  return url;
}

function getGitenburgMetadata(baseUrl, callback) {
  var url = baseUrl.replace(/^https?:\/\/github\.com\//,'https://raw.githubusercontent.com/') + '/master/metadata.yaml';
  request(url, function (error, response, body) {
    if (error || response.statusCode != 200) {
      return callback(error||response.body);
    }
    callback(null, body);
  });
}

function getGitenburgText(baseUrl, callback) {
  var url = baseUrl.replace(/^https?:\/\/github\.com\//,'https://raw.githubusercontent.com/') + '/master/book.asciidoc';
  request(url, function (error, response, body) {
    if (error || response.statusCode != 200) {
      return callback(error||response.body);
    }
    callback(null, body);
  });
}
