$( document ).ready(function() {

  var wordList = [
    'shore',
    'things',
    'brother',
    'please',
    'against',
    'people',
    'feather',
    'know',
    'trouble',
    'danger',
    'and'
  ];

  var Game = {
    map: {},
    score: 100,
    foundWords: { feather: 1 },
    setSentence: function(q, direction) {
      this.currentSentence = q;
      if (q.connections) {
        if ( Math.random() > 0.5 ) {
          this.setLeft( q.connections[0] );
          this.setRight( q.connections[1] );
        } else {
          this.setRight( q.connections[0] );
          this.setLeft( q.connections[1] );
        };
      }
      var game = this;
      $('#currentPassage').fadeOut(function() {
        Dungeon.setupRoom(game, direction, function() {
            var highlighted = game.highlightPassage( q.sentence );
            $('#currentPassage').html( highlighted );
            if (!$('#logo').is(':visible')) {
              $('#currentPassage').fadeIn();
              positionPassage();              
            }
        });
      });

    },
    setRight: function(q) {
      this.right = q;
      $('#right').prop('disabled',q==null);
    },
    setLeft: function(q) {
      this.left = q;
      $('#left').prop('disabled',q==null);
    },
    nextSentence: function() {
      var q = this.currentSentence;
      $.get('/book/' + q.bookId + '/sentence/' + (q.sentenceNumber + 1), function(data) {
        Game.setSentence( data, 'forward' );
      });
    },
    prevSentence: function() {
      var q = this.currentSentence;
      $.get('/book/' + q.bookId + '/sentence/' + (q.sentenceNumber - 1), function(data) {
        Game.setSentence( data, 'backward' );
      });
    },
    jumpTo: function(id, direction) {
      $.get('/sentence/' + id, function(data) {
        Game.setSentence( data, direction );
      });
    },
    jumpLeft: function() {
      if (this.left) {
        this.jumpTo( this.left.id, 'left' );
      }
    },
    jumpRight: function() {
      if (this.right) {
        this.jumpTo( this.right.id, 'right' );
      }
    },
    highlightPassage: function(text) {
      var highlighted = text;
      if (this.right) {
        highlighted = highlighted.replace( this.right.sourceWord, '<span class="passage">' + this.right.sourceWord + '</span>' )
      }
      if (this.left) {
        highlighted = highlighted.replace( this.left.sourceWord, '<span class="passage">' + this.left.sourceWord + '</span>' )
      }
      for (var i=0;i<wordList.length;i++) {
        var word = wordList[ i ];
        if (!this.foundWords[ word ]) {
          highlighted = highlighted.replace( word, '<span class="questWord">' + word + '</span>' );
        }
      }
      return highlighted;
    },
    updateList: function() {
      var markup = [];
      for (var i=0;i<wordList.length;i++) {
        var word = wordList[i];
        if (this.foundWords[ word ]) {
          markup.push('<li class="found">' + word + '</li>');
        } else {
          markup.push('<li>' + word + '</li>');
        }
        $('#listItems').html( markup.join("\n") );
      }
    },
    foundWord: function(word) {
      if (!this.foundWords[ word ]) {
        this.score += 100;
        $('#score span').text( this.score );
        this.foundWords[ word ] = 1;
        var game = this;
        $('#list').fadeIn(function() {
          setTimeout(function() {
            game.updateList();
            $('#list').fadeOut();
          }, 1000);
        });
      }
    }
  };
  Game.updateList();

  function positionPassage() {
    var passageHeight = $('#currentPassage').height();
    var windowHeight = $(window).height();
    $('#currentPassage').css({
      top: (windowHeight / 2) - (passageHeight / 2) + 'px'
    });
  }

  function hideLogo() {
    if ( $('#logo').is(':visible') ) {
      $('#logo').fadeOut( function() {
        $('#currentPassage').fadeIn();
        positionPassage();
      });
    }
  }

  $('#currentPassage').on('click', 'span.questWord', function(e) {
    var word = e.target.innerHTML;
    Game.foundWord( word );
  });

  // Load Initial Sentence
  $.get('/random', function(data) {
    Game.setSentence(data);
  });

  $('#forward').on('click', function(e) {
    Game.nextSentence();
    e.preventDefault();
  });

  $('#backward').on('click', function(e) {
    Game.prevSentence();
    e.preventDefault();
  });

  $('#left').on('click', function(e) {
    Game.jumpLeft();
    e.preventDefault();
  });

  $('#right').on('click', function(e) {
    Game.jumpRight();
    e.preventDefault();
  });

  $(window).on('click', hideLogo);

  $(window).on('keydown', function(e) {
    if (e.keyCode == 87 || e.keyCode == 38 ) {
      Game.nextSentence();
      e.preventDefault();
    }
    if (e.keyCode == 83 || e.keyCode == 40 ) {
      Game.prevSentence();
      e.preventDefault();
    }
    if (e.keyCode == 65 || e.keyCode == 37 ) {
      Game.jumpLeft();
      e.preventDefault();
    }
    if (e.keyCode == 68 || e.keyCode == 39 ) {
      Game.jumpRight();
      e.preventDefault();
    }
    if (e.keyCode == 73) {
      if ( $('#list').is(':visible') ) {
        $('#list').fadeOut();
      } else {
        $('#list').fadeIn();
      }
      hideLogo();
    }
    hideLogo();
  });


});