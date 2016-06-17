var sceneIce = new THREE.Scene();
var rendererIce = new THREE.WebGLRenderer();
var cameraIce = new THREE.PerspectiveCamera(100, 1.0, 0.1, 4000);

var projectorIce = new THREE.Projector();
var raycasterIce = new THREE.Raycaster();
var INTERSECTED;

//background scene
var backgroundSceneIce = new THREE.Scene();
var backgroundCameraIce = new THREE.Camera();
var texture = THREE.ImageUtils.loadTexture('images/iceWorld.png');
var backgroundMaterial = new THREE.MeshBasicMaterial({map: texture});
var backgroundMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), backgroundMaterial);
backgroundMesh.material.depthTest = false;
backgroundMesh.material.depthWrite = false;
backgroundSceneIce.add(backgroundCameraIce);
backgroundSceneIce.add(backgroundMesh);
backgroundSceneIce.add(new THREE.AmbientLight(0xffffff));

//var controls = new THREE.OrbitControls(cameraIce, rendererIce.domElement);

function IceWorld (icebergState) {
	this.canInteract = true;

	this.frame = new THREE.Object3D();

  //iceberg
  this.iceberg = new Iceberg(40, 0xffffff, 'iceWorldIceberg');
  this.iceberg.frame.position.set(-100, 10, 0);
  this.frame.add(this.iceberg.frame);

  //tower
  this.tower = new IceTower(100, 3, 'iceworldTower');
  this.tower.redoSnowflake(40);
  this.tower.frame.position.set(100, 0, 0);
  this.frame.add(this.tower.frame);

  //iceberg activity
  this.icebergActivity = new IcebergActivity(5000, 2000, icebergState);
  this.icebergActivity.frame.position.set(-5500, 0, -cameraIce.far);
  this.frame.add(this.icebergActivity.frame);

  //tower activity
  this.towerActivity = new TowerActivity(5000, 1000);
  this.towerActivity.frame.position.set(5500, 0, -cameraIce.far);
  this.frame.add(this.towerActivity.frame);

	this.instructions = 'Welcome to Ice World! Click the iceberg to play the iceberg activity, or click the tower to play the tower activity.';

	this.icebergInstructions = 'Welcome to the iceberg activity! ' + 
													'Click the buttons to build a structure that will guide the penguin across the water.';

	this.mouse = new THREE.Vector2();

	Session.set('iwInstructions', this.instructions);
}

IceWorld.prototype.drawScene = function () {
	//clear the scene in case it's being drawn after the first time
	for (var i in sceneIce.children) {
		sceneIce.remove(sceneIce.children[i]);
	}

	//color and size the renderer
  rendererIce.setClearColor($('#iceworldSceneDiv').css('background-color'));
  rendererIce.setSize($("#iceworldSceneDiv").width(), $("#iceworldSceneDiv").height());

  //fix camera aspect ratio, and position and point the camera
  cameraIce.aspect = $("#iceworldSceneDiv").width()/$("#iceworldSceneDiv").height();
  this.resetCamera();

  //controls = new THREE.OrbitControls(cameraIce, rendererIce.domElement);

  //ambient light
  var ambient = new THREE.AmbientLight(0xffffff);
  sceneIce.add(ambient);

  //directional light
  var dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(100, 100, 70);
  sceneIce.add(dirLight);

  //iceWorld frame
	sceneIce.add(this.frame);

	//add renderer output to the scene
	$("#iceworldSceneDiv").append(rendererIce.domElement);

	//render
	renderIce();
}

IceWorld.prototype.resetCamera = function () {
  cameraIce.position.set(0, 0, 100);
  cameraIce.lookAt(new THREE.Vector3(0, 0, 0));
  cameraIce.updateProjectionMatrix();
}

IceWorld.prototype.moveCamera = function (nextPosition, nextTarget, completeFcn) {
  var iceWorld = this;

  iceWorld.moveTime = 2000;

  iceWorld.cameraTween = new TWEEN.Tween(cameraIce.position).to(nextPosition, iceWorld.moveTime)
    .onStart(function () {
      iceWorld.canInteract = false;
    })
    .onUpdate(function () {
      cameraIce.lookAt(nextTarget);
      cameraIce.updateProjectionMatrix();
    })
    .onComplete(function () {
      iceWorld.canInteract = true;
      if (completeFcn) {
        completeFcn();
      }
    });

  iceWorld.cameraTween.start();
}

IceWorld.prototype.backToIceWorld = function () {
  var nextCameraPos = new THREE.Vector3(0, 0, 100);
  var nextCameraTarget = new THREE.Vector3(0, 0, 0);

  Session.set('iwInstructions', this.instructions);
  Session.set('iceLocation', 'iceWorld');
  this.icebergActivity.addTimeTaken();

  this.resetCamera();
  this.inIcebergActivity = false;
}

IceWorld.prototype.playIcebergActivity = function () {
  Session.set('iwInstructions', '');
  var iceWorld = this;

  var icebergActPos = this.icebergActivity.frame.position;
  var nextCameraPos = new THREE.Vector3(icebergActPos.x, 800, icebergActPos.z - 100);
  var nextCameraTarget = new THREE.Vector3(icebergActPos.x, 0, icebergActPos.z - 400);

  iceWorld.moveCamera(nextCameraPos, nextCameraTarget, function () {
    iceWorld.inIcebergActivity = true;
    Session.set('icebergInstructions', iceWorld.icebergInstructions);
    Session.set('iceHeader', '<p>Your structure can only accept the following pattern:<br>' + 
                              iceWorld.icebergActivity.language.description() + '</p>');
    Session.set('iceLocation', 'iceberg');

    //WHY JAVASCRIPT WHY
    setTimeout(function () {
      $('#nextLangButton').hide();
      $('#currentPen').prop('disabled', true);
      iceWorld.icebergActivity.checkHintsUsed();
      iceWorld.icebergActivity.startDate = new Date();
      iceWorld.icebergActivity.allCasesPassed();
    }, 0);
    
  });
}

IceWorld.prototype.playTowerActivity = function () {
  Session.set('iwInstructions', '');
  var iceWorld = this;

  var towerActPos = this.towerActivity.frame.position;
  var nextCameraPos = new THREE.Vector3(towerActPos.x, 200, towerActPos.z + 500);
  var nextCameraTarget = new THREE.Vector3(towerActPos.x, 0, towerActPos.z - 400);

  iceWorld.moveCamera(nextCameraPos, nextCameraTarget, function () {
    iceWorld.inTowerActivity = true;
    Session.set('towerInstructions', 'In tower activity');
    Session.set('iceLocation', 'tower');
  });
}

IceWorld.prototype.mouseInteraction = function (event, isClick) {
  if (!this.canInteract) {
    return;
  }

  event.preventDefault();

  var offsetLeft = $('#iceworldSceneDiv').offset().left;
  var offsetTop = $('#iceworldSceneDiv').offset().top;

  this.mouse.x = ((event.clientX - offsetLeft)/$('#iceworldSceneDiv').width()) * 2 - 1;
  this.mouse.y = - ((event.clientY - offsetTop)/$('#iceworldSceneDiv').height()) * 2 + 1;

  this.findIntersections(isClick);
}

IceWorld.prototype.findIntersections = function (isClick) {
  //set up stuff to find intersections
  var vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 1);
  projectorIce.unprojectVector(vector, cameraIce);
  raycasterIce.set(cameraIce.position, vector.sub(cameraIce.position).normalize());

  //find all the scene children that the raycaster intersects with
  var intersects = raycasterIce.intersectObjects(sceneIce.children, true);

  //reset html of various things
  if (!this.inIcebergActivity && !this.inTowerActivity) {
    Session.set('iwInstructions', this.instructions);
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

IceWorld.prototype.handleClick = function (objName) {
  if (objName.indexOf(this.iceberg.name) != -1) {
    this.playIcebergActivity();
  } 
  if (objName.indexOf(this.tower.name) != -1) {
    this.playTowerActivity();
  }
  if (objName.indexOf(this.icebergActivity.icebergName) != -1) {
    if (objName.indexOf('transition') == -1) {
      this.icebergActivity.handleStoneClick(objName);
    }
  } 
  if (objName.indexOf('transition') != -1) {
    this.icebergActivity.handleTransClick(objName);
  }
  if (objName.indexOf('shore') != -1) {
    this.icebergActivity.handleShoreClick(objName);
  }
}

function renderIce () {
	requestAnimationFrame(renderIce);
  TWEEN.update();

  //controls.update();

  //render the background scene
  rendererIce.autoClear = false;
  rendererIce.clear();
  rendererIce.render(backgroundSceneIce, backgroundCameraIce);

  //render the actual scene
  rendererIce.render(sceneIce, cameraIce);

  //remove the annoying loading div
  $('.ui-loader').remove();
}


