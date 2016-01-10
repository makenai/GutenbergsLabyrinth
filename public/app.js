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
      $('#currentQuestion').text( q.sentence );
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
      this.jumpTo( this.left.id );
    },
    jumpRight: function() {
      this.jumpTo( this.right.id );
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


});