var sceneOcean = new THREE.Scene();
var rendererOcean = new THREE.WebGLRenderer();
var cameraOcean = new THREE.PerspectiveCamera(100, 1.0, 0.1, 4000);

var projectorOcean = new THREE.Projector();
var raycasterOcean = new THREE.Raycaster();
var INTERSECTED;

//background scene
var backgroundSceneOcean = new THREE.Scene();
var backgroundCameraOcean = new THREE.Camera();
var texture = THREE.ImageUtils.loadTexture('images/oceanWater.png');
var backgroundMaterial = new THREE.MeshBasicMaterial({map: texture});
var backgroundMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), backgroundMaterial);
backgroundMesh.material.depthTest = false;
backgroundMesh.material.depthWrite = false;
backgroundSceneOcean.add(backgroundCameraOcean);
backgroundSceneOcean.add(backgroundMesh);
backgroundSceneOcean.add(new THREE.AmbientLight(0xffffff));

//var controls = new THREE.OrbitControls(cameraOcean, rendererOcean.domElement);

function OceanWorld (starfishState) {
	this.canInteract = true;

	this.frame = new THREE.Object3D();

  //starfish
  this.starfish = new Starfish(50, 0x1e90ff, 'oceanWorldStarfish');
  this.starfish.frame.position.set(-100, 0, 0);
  this.starfish.frame.rotateX(Math.PI/2);
  this.frame.add(this.starfish.frame);

  //net
  this.net = new Net(75, 75, 6);
  this.net.frame.position.set(100, 0, 0);
  this.frame.add(this.net.frame);

  //starfish activity
  this.starfishActivity = new StarfishActivity(5000, 2000, starfishState);
  this.starfishActivity.frame.position.set(-5500, 0, -cameraOcean.far);
  this.frame.add(this.starfishActivity.frame);

  //net activity
  this.netActivity = new NetActivity(5000, 1000);
  this.netActivity.frame.position.set(5500, 0, -cameraOcean.far);
  this.frame.add(this.netActivity.frame);

	this.instructions = 'Welcome to Ocean World! Click the starfish to play the starfish activity, or click the net to play the net activity.';

	this.starfishInstructions = 'Welcome to the starfish activity! ' + 
													'Click the buttons to build a structure that will guide the fish across the ocean floor.';

	this.mouse = new THREE.Vector2();

	Session.set('owInstructions', this.instructions);
}

OceanWorld.prototype.drawScene = function () {
	//clear the scene in case it's being drawn after the first time
	for (var i in sceneOcean.children) {
		sceneOcean.remove(sceneOcean.children[i]);
	}

	//color and size the renderer
  rendererOcean.setClearColor($('#oceanworldSceneDiv').css('background-color'));
  rendererOcean.setSize($("#oceanworldSceneDiv").width(), $("#oceanworldSceneDiv").height());

  //fix camera aspect ratio, and position and point the camera
  cameraOcean.aspect = $("#oceanworldSceneDiv").width()/$("#oceanworldSceneDiv").height();
  this.resetCamera();

  //controls = new THREE.OrbitControls(cameraOcean, rendererOcean.domElement);

  //ambient light
  var ambient = new THREE.AmbientLight(0xffffff);
  sceneOcean.add(ambient);

  //directional light
  var dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(100, 100, 70);
  sceneOcean.add(dirLight);

  //oceanWorld frame
	sceneOcean.add(this.frame);

	//add renderer output to the scene
	$("#oceanworldSceneDiv").append(rendererOcean.domElement);

	//render
	renderOcean();
}

OceanWorld.prototype.resetCamera = function () {
  cameraOcean.position.set(0, 0, 100);
  cameraOcean.lookAt(new THREE.Vector3(0, 0, 0));
  cameraOcean.updateProjectionMatrix();
}

OceanWorld.prototype.moveCamera = function (nextPosition, nextTarget, completeFcn) {
  var oceanWorld = this;

  oceanWorld.moveTime = 2000;

  oceanWorld.cameraTween = new TWEEN.Tween(cameraOcean.position).to(nextPosition, oceanWorld.moveTime)
    .onStart(function () {
      oceanWorld.canInteract = false;
    })
    .onUpdate(function () {
      cameraOcean.lookAt(nextTarget);
      cameraOcean.updateProjectionMatrix();
    })
    .onComplete(function () {
      oceanWorld.canInteract = true;
      if (completeFcn) {
        completeFcn();
      }
    });

  oceanWorld.cameraTween.start();
}

OceanWorld.prototype.backToOceanWorld = function () {
  var nextCameraPos = new THREE.Vector3(0, 0, 100);
  var nextCameraTarget = new THREE.Vector3(0, 0, 0);

  Session.set('owInstructions', this.instructions);
  Session.set('oceanLocation', 'oceanWorld');
  this.starfishActivity.addTimeTaken();

  this.resetCamera();
  this.inStarfishActivity = false;
}

OceanWorld.prototype.playStarfishActivity = function () {
  Session.set('owInstructions', '');
  var oceanWorld = this;

  var starfishActPos = this.starfishActivity.frame.position;
  var nextCameraPos = new THREE.Vector3(starfishActPos.x, 800, starfishActPos.z - 100);
  var nextCameraTarget = new THREE.Vector3(starfishActPos.x, 0, starfishActPos.z - 400);

  oceanWorld.moveCamera(nextCameraPos, nextCameraTarget, function () {
    oceanWorld.inStarfishActivity = true;
    Session.set('starfishInstructions', oceanWorld.starfishInstructions);
    Session.set('oceanHeader', '<p>Your structure can only accept the following pattern:<br>' + 
                              oceanWorld.starfishActivity.language.description() + '</p>');
    Session.set('oceanLocation', 'starfish');

    //WHY JAVASCRIPT WHY
    setTimeout(function () {
      $('#nextLangButton').hide();
      $('#currentPen').prop('disabled', true);
      oceanWorld.starfishActivity.checkHintsUsed();
      oceanWorld.starfishActivity.startDate = new Date();
      oceanWorld.starfishActivity.allCasesPassed();
    }, 0);
    
  });
}

OceanWorld.prototype.playNetActivity = function () {
  Session.set('owInstructions', '');
  var oceanWorld = this;

  var netActPos = this.netActivity.frame.position;
  var nextCameraPos = new THREE.Vector3(netActPos.x, 200, netActPos.z + 500);
  var nextCameraTarget = new THREE.Vector3(netActPos.x, 0, netActPos.z - 400);

  oceanWorld.moveCamera(nextCameraPos, nextCameraTarget, function () {
    oceanWorld.inNetActivity = true;
    Session.set('netInstructions', 'In net activity');
    Session.set('oceanLocation', 'net');
  });
}

OceanWorld.prototype.mouseInteraction = function (event, isClick) {
  if (!this.canInteract) {
    return;
  }

  event.preventDefault();

  var offsetLeft = $('#oceanworldSceneDiv').offset().left;
  var offsetTop = $('#oceanworldSceneDiv').offset().top;

  this.mouse.x = ((event.clientX - offsetLeft)/$('#oceanworldSceneDiv').width()) * 2 - 1;
  this.mouse.y = - ((event.clientY - offsetTop)/$('#oceanworldSceneDiv').height()) * 2 + 1;

  this.findIntersections(isClick);
}

OceanWorld.prototype.findIntersections = function (isClick) {
  //set up stuff to find intersections
  var vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 1);
  projectorOcean.unprojectVector(vector, cameraOcean);
  raycasterOcean.set(cameraOcean.position, vector.sub(cameraOcean.position).normalize());

  //find all the scene children that the raycaster intersects with
  var intersects = raycasterOcean.intersectObjects(sceneOcean.children, true);

  //reset html of various things
  if (!this.inStarfishActivity && !this.inNetActivity) {
    Session.set('owInstructions', this.instructions);
  }

  //if there are any intersected objects
  if (intersects.length > 0) {
    //get the first (closest) intersected object
    INTERSECTED = intersects[0].object;

    if (isClick) {
      this.handleClick(INTERSECTED.name);
    } else {
      this.handleMouseMove(INTERSECTED.name);
    }
  }
}

OceanWorld.prototype.handleClick = function (objName) {
  if (objName.indexOf(this.starfish.name) != -1) {
    this.playStarfishActivity();
  } 
  if (objName.indexOf(this.net.name) != -1) {
    this.playNetActivity();
  }
  if (objName.indexOf(this.starfishActivity.starfishName) != -1) {
    if (objName.indexOf('transition') == -1) {
      this.starfishActivity.handleStoneClick(objName);
    }
  } 
  if (objName.indexOf('transition') != -1) {
    this.starfishActivity.handleTransClick(objName);
  }
  if (objName.indexOf('shore') != -1) {
    this.starfishActivity.handleShoreClick(objName);
  }
}

function renderOcean () {
	requestAnimationFrame(renderOcean);
  TWEEN.update();

  //controls.update();

  //render the background scene
  rendererOcean.autoClear = false;
  rendererOcean.clear();
  rendererOcean.render(backgroundSceneOcean, backgroundCameraOcean);

  //render the actual scene
  rendererOcean.render(sceneOcean, cameraOcean);

  //remove the annoying loading div
  $('.ui-loader').remove();
}


