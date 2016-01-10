// Mostly cribbed from https://github.com/chelmi98/JS-Dungeon-Crawler
$( document ).ready(function() {

  var walls = [];

  window.Dungeon = {
    setupRoom: function(s) {
      resetWalls();
      addWall(1, 6);
      addWall(3, 6);
      if (!s.left) {
        addWall(1, 5);
      }
      if (!s.right) {
        addWall(3, 5);
      }
      addWall(1, 4);
      addWall(3, 4);
    }
  };
  // addWall(3, 5);
  // addWall(1, 5);
  // addWall(3, 3);
  // addWall(1, 3);
  // addWall(3, 2);
  // addWall(1, 2);

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
  var wallTex = THREE.ImageUtils.loadTexture('images/cover.jpg');
  wallTex.magFilter = THREE.NearestFilter;
  var wallMat = new THREE.MeshBasicMaterial({map: wallTex});

  function addWall(x, y) {
    var cube = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 1), wallMat);
    cube.position.set(x,0,y);
    walls.push(cube);
    scene.add(cube);
  }

  function resetWalls() {
    while (walls.length) {
      var wall = walls.pop();
      scene.remove(wall);
    }
  }

  function de2ra(degree) {
    return degree*(Math.PI/180);
  }

  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  render();
});