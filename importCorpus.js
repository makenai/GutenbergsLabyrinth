var _ = require('lodash');
var fs = require('fs');
var CSVParser = require('csv-parse');
var Tokenizer = require('sentence-tokenizer');

var masterList = 'data/PGCD0803/master_list.csv';

fs.createReadStream(masterList).pipe(CSVParser({
  columns: ["Title","Subtitle","Author-FN","Author-LN","Text","HTML",
    "CatMonth","CatYear","Language"]
}, function(err, data){
  var dataStarted = false;
  _.each(data, function(row) {
    // The CSV file doesn't start on the first row
    if (dataStarted) {
      if ( row['Text'] && !row['Subtitle'].match(/(Vol|Part)/) && !row['Language'] ) {
        addBook( row );
      }
    }
    if (row['Title'] == 'Title')
      dataStarted = true;
  });
}));

function addBook(data) {
  console.log( data['Title'], data['Author-LN'], data['Author-FN'] );
  getSentences( 'data/PGCD0803-all/' + data['Text'] );
  process.exit(0);
}

function getSentences(filename) {
  try {
    var tokenizer = new Tokenizer("book");
    var data = fs.readFileSync(filename, 'utf8');
    var content = stripGutenheader( data );
    var blocks = content.split(/(\r\n){2,}/);
    for (var i=0;i<blocks.length;i++) {
      var block = blocks[i];
      if (!block.match(/^[\r\n\s]*$/)) {
        tokenizer.setEntry(block);
        var sentences = tokenizer.getSentences();
        console.log( sentences );
        console.log('--');
      }
    }
  } catch(e) {
    console.log( e );
  }
}

function stripGutenheader(data) {
  var lines = data.split("\n");
  for (var i=0;i<lines.length;i++) {
    if (lines[i].match(/^\*END\*/)) {
      lines.splice(0,i+1);
      return lines.join("\n");
    }
  }
  return lines.length;
}
