$( document ).ready(function() {

  var Game = {
    map: {},
    setSentence: function(q) {
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
      Dungeon.setupRoom(this);
      $('#currentPassage').text( q.sentence );
      var passageHeight = $('#currentPassage').height();
      var windowHeight = $(window).height();
      $('#currentPassage').css({
        top: (windowHeight / 2) - (passageHeight / 2) + 'px'
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
        Game.setSentence( data );
      });
    },
    prevSentence: function() {
      var q = this.currentSentence;
      $.get('/book/' + q.bookId + '/sentence/' + (q.sentenceNumber - 1), function(data) {
        Game.setSentence( data );
      });
    },
    jumpTo: function(id) {
      $.get('/sentence/' + id, function(data) {
        Game.setSentence( data );
      });
    },
    jumpLeft: function() {
      if (this.left) {
        this.jumpTo( this.left.id );
      }
    },
    jumpRight: function() {
      if (this.right) {
        this.jumpTo( this.right.id );
      }
    }
  };

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
  });


});