// Mostly cribbed from https://github.com/chelmi98/JS-Dungeon-Crawler
$( document ).ready(function() {

  var walls = [];
  var oldWalls = [];
  var currentWallId=null;

  window.Dungeon = {

    setupRoom: function(game, direction, callback) {
      // Install new wall texture
      if (game.currentSentence.bookId !== currentWallId) {
        currentWallId = game.currentSentence.bookId;
        retextureWalls('images/covers/' + game.currentSentence.bookId + '.jpg');
      }
      // Install new walls
      addNextRoom(direction, game);
      animateWalls(direction, function() {
        removeOldWalls();
        if (callback)
          callback();
      });
    }
  };

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 0.1, 3);

  var dungeon = document.getElementById('dungeon');
  var aspect = dungeon.offsetWidth / dungeon.offsetHeight;

  var camera = new THREE.PerspectiveCamera(70, aspect, 0.01, 30);
  camera.position.set(2, 0.2, 6);

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(dungeon.offsetWidth, dungeon.offsetHeight);
  dungeon.appendChild(renderer.domElement);

  function maximize() {
    $('#dungeon').width( $(window).width() );
    $('#dungeon').height( $(window).height() );
    camera.aspect = dungeon.offsetWidth/dungeon.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(dungeon.offsetWidth, dungeon.offsetHeight);
  }
  maximize();
  $(window).on('resize', function() {
    maximize();
  });

  // Floor
  var floorTex = THREE.ImageUtils.loadTexture('images/floor.jpg');
  floorTex.magFilter = THREE.NearestFilter;
  floorTex.wrapS = THREE.RepeatWrapping;
  floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(35, 35);
  var floorMat = new THREE.MeshBasicMaterial({map: floorTex});
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(35, 35), floorMat);
  floor.position.set(0,-0.5,0);
  floor.rotation.x = de2ra(-90);
  scene.add(floor)

  // Walls
  var wallText, wallMat;
  function retextureWalls(texture) {
    wallTex = THREE.ImageUtils.loadTexture( texture );
    wallTex.magFilter = THREE.NearestFilter;
    wallMat = new THREE.MeshBasicMaterial({map: wallTex});
  }
  retextureWalls('images/wall.jpg');

  function addNextRoom( direction, game ) {
    if (direction == 'forward') {
      addNewWalls(0, -2, game);
    }
    if (direction == 'backward') {
      addNewWalls(0, 2, game);
    }
    if (direction == 'right') {
      addNewWalls(3, 0,game);
    }
    if (direction == 'left') {
      addNewWalls(-3, 0,game);
    }
    if (!direction) {
      addNewWalls(0,0,game);
    }
  }

  function addNewWalls(xOffset, zOffset, game) {
    oldWalls = walls;
    walls = [];
    // Two Walls
    addWall(xOffset + 1, zOffset + 6);
    addWall(xOffset + 3, zOffset + 6);
    // Left and Right Passages
    if (!game.left) {
      addWall(xOffset + 1, zOffset + 5);
    }
    if (!game.right) {
      addWall(xOffset + 3, zOffset + 5);
    }
    // Frontmost Two Walls
    addWall(xOffset + 1, zOffset + 4);
    addWall(xOffset + 3, zOffset + 4);
  }

  function addWall(x, y) {
    var cube = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 1), wallMat);
    cube.position.set(x,0,y);
    walls.push(cube);
    scene.add(cube);
  }

  function removeOldWalls() {
    while (oldWalls.length) {
      var wall = oldWalls.pop();
      scene.remove(wall);
    }
  }

  var doneMoving = null;
  function animateWalls(direction, callback) {
    if (direction == 'forward') {
      toMove.z = 2;
    }
    if (direction == 'backward') {
      toMove.z = -2;
    }
    if (direction == 'right') {
      toMove.x = -3;
    }
    if (direction == 'left') {
      toMove.x = 3;
    }
    doneMoving = callback;
  };

  function nudgeWalls(plane, amount) {
    for (var i=0;i<walls.length;i++) {
      walls[i].position[plane] += amount;
    }
    for (var i=0;i<oldWalls.length;i++) {
      oldWalls[i].position[plane] += amount;
    }
  }

  var movementRate = 0.1;
  var toMove = { x: 0, z: 0 };
  function updateMovement() {
    var movedX = false;
    if (toMove.x > 0) {
      toMove.x -= movementRate;
      nudgeWalls('x', movementRate);
      movedX = true;
    }
    if (toMove.x < 0) {
      toMove.x += movementRate;
      if (movedX) toMove.x = 0;
      nudgeWalls('x', -movementRate);
    }
    var movedZ = false;
    if (toMove.z > 0) {
      toMove.z -= movementRate;
      movedZ = true;
      nudgeWalls('z', movementRate);
    }
    if (toMove.z < 0) {
      toMove.z += movementRate;
      if (movedZ) toMove.z = 0;
      nudgeWalls('z', -movementRate);
    }
    if (toMove.x == 0 && toMove.z == 0) {
      if (doneMoving) {
        doneMoving();
        doneMoving = null;
      }
    }
  }

  function de2ra(degree) {
    return degree*(Math.PI/180);
  }

  function render() {
    requestAnimationFrame(render);
    updateMovement();
    renderer.render(scene, camera);
  }
  render();
});