var sceneJungle = new THREE.Scene();
var rendererJungle = new THREE.WebGLRenderer();
var cameraJungle = new THREE.PerspectiveCamera(100, 1.0, 0.1, 4000);

var projectorJungle = new THREE.Projector();
var raycasterJungle = new THREE.Raycaster();
var INTERSECTED;

//background scene
var backgroundSceneJungle = new THREE.Scene();
var backgroundCameraJungle = new THREE.Camera();
var texture = THREE.ImageUtils.loadTexture('images/jungleFerns.png');
var backgroundMaterial = new THREE.MeshBasicMaterial({map: texture});
var backgroundMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), backgroundMaterial);
backgroundMesh.material.depthTest = false;
backgroundMesh.material.depthWrite = false;
backgroundSceneJungle.add(backgroundCameraJungle);
backgroundSceneJungle.add(backgroundMesh);
backgroundSceneJungle.add(new THREE.AmbientLight(0xffffff));

//var controls = new THREE.OrbitControls(cameraJungle, rendererJungle.domElement);

function JungleWorld (riverState) {
	this.canInteract = true;

	this.frame = new THREE.Object3D();

	//stepping stone
	this.steppingStone = new SteppingStone(20, 0x555555, 'jungleWorldSS');
	this.steppingStone.frame.position.set(-100, 0, 0);
	this.frame.add(this.steppingStone.frame);

	//table
	this.table = new Table(50, 1, 'jungleWorldTable');
	this.table.frame.position.set(100, -25, 0);
	this.frame.add(this.table.frame);

	//river activity
	this.riverActivity = new RiverActivity(5000, 2000, riverState);
	this.riverActivity.frame.position.set(-5500, 0, -cameraJungle.far);
	this.frame.add(this.riverActivity.frame);

	//table activity
	this.tableActivity = new TableActivity(5000, 1000);
	this.tableActivity.frame.position.set(5500, 0, -cameraJungle.far);
	this.frame.add(this.tableActivity.frame);

	this.instructions = 'Welcome to Jungle World! Click the stone to play the river activity, or click the table to play the table activity.';

	this.riverInstructions = 'Welcome to the river activity! ' + 
													'Click the buttons to build a structure to guide the butterfly across the river.';

	this.mouse = new THREE.Vector2();

	Session.set('jwInstructions', this.instructions);
}

JungleWorld.prototype.drawScene = function () {
	//clear the scene in case it's being drawn after the first time
	for (var i in sceneJungle.children) {
		sceneJungle.remove(sceneJungle.children[i]);
	}

	//color and size the renderer
  rendererJungle.setClearColor($('#jungleworldSceneDiv').css('background-color'));
  rendererJungle.setSize($("#jungleworldSceneDiv").width(), $("#jungleworldSceneDiv").height());

  //fix camera aspect ratio, and position and point the camera
  cameraJungle.aspect = $("#jungleworldSceneDiv").width()/$("#jungleworldSceneDiv").height();
  this.resetCamera();

  //controls = new THREE.OrbitControls(cameraJungle, rendererJungle.domElement);

  //ambient light
  var ambient = new THREE.AmbientLight(0xffffff);
  sceneJungle.add(ambient);

  //directional light
  var dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(100, 100, 70);
  sceneJungle.add(dirLight);

  //jungleWorld frame
	sceneJungle.add(this.frame);

	//add renderer output to the scene
	$("#jungleworldSceneDiv").append(rendererJungle.domElement);

	//render
	renderJungle();
}

JungleWorld.prototype.resetCamera = function () {
  cameraJungle.position.set(0, 0, 100);
  cameraJungle.lookAt(new THREE.Vector3(0, 0, 0));
  cameraJungle.updateProjectionMatrix();
}

JungleWorld.prototype.moveCamera = function (nextPosition, nextTarget, completeFcn) {
	var jungleWorld = this;

	jungleWorld.moveTime = 2000;

	jungleWorld.cameraTween = new TWEEN.Tween(cameraJungle.position).to(nextPosition, jungleWorld.moveTime)
		.onStart(function () {
			jungleWorld.canInteract = false;
		})
		.onUpdate(function () {
			cameraJungle.lookAt(nextTarget);
			cameraJungle.updateProjectionMatrix();
		})
		.onComplete(function () {
			jungleWorld.canInteract = true;
			if (completeFcn) {
				completeFcn();
			}
		});

	jungleWorld.cameraTween.start();
}

JungleWorld.prototype.backToJungleWorld = function () {
	var nextCameraPos = new THREE.Vector3(0, 0, 100);
	var nextCameraTarget = new THREE.Vector3(0, 0, 0);

	Session.set('jwInstructions', this.instructions);
	Session.set('jungleLocation', 'jungleWorld');
	this.riverActivity.addTimeTaken();

	this.resetCamera();
	this.inRiverActivity = false;
}

JungleWorld.prototype.playRiverActivity = function () {
	Session.set('jwInstructions', '');
	var jungleWorld = this;

	var riverActPos = this.riverActivity.frame.position;
	var nextCameraPos = new THREE.Vector3(riverActPos.x, 800, riverActPos.z - 100);
	var nextCameraTarget = new THREE.Vector3(riverActPos.x, 0, riverActPos.z - 400);

	jungleWorld.moveCamera(nextCameraPos, nextCameraTarget, function () {
		jungleWorld.inRiverActivity = true;
		Session.set('riverInstructions', jungleWorld.riverInstructions);
		Session.set('riverHeader', '<p>Your structure can only accept the following pattern:<br>' + 
															jungleWorld.riverActivity.language.description() + '</p>');
		Session.set('jungleLocation', 'river');

		//WHY JAVASCRIPT WHY
		setTimeout(function () {
			$('#nextLangButton').hide();
			$('#currentPen').prop('disabled', true);
			jungleWorld.riverActivity.checkHintsUsed();
			jungleWorld.riverActivity.startDate = new Date();
			jungleWorld.riverActivity.allCasesPassed();
		}, 0);
		
	});
}

JungleWorld.prototype.playTableActivity = function () {
	Session.set('jwInstructions', '');
	var jungleWorld = this;

	var tableActPos = this.tableActivity.frame.position;
	var nextCameraPos = new THREE.Vector3(tableActPos.x, 200, tableActPos.z + 500);
	var nextCameraTarget = new THREE.Vector3(tableActPos.x, 0, tableActPos.z - 400);

	jungleWorld.moveCamera(nextCameraPos, nextCameraTarget, function () {
		jungleWorld.inTableActivity = true;
		Session.set('tableInstructions', 'In table activity');
		Session.set('jungleLocation', 'table');
		//jungleWorld.tableActivity.shootCylinder();
	});
}

JungleWorld.prototype.mouseInteraction = function (event, isClick) {
	if (!this.canInteract) {
		return;
	}

	event.preventDefault();

	var offsetLeft = $('#jungleworldSceneDiv').offset().left;
	var offsetTop = $('#jungleworldSceneDiv').offset().top;

  this.mouse.x = ((event.clientX - offsetLeft)/$('#jungleworldSceneDiv').width()) * 2 - 1;
  this.mouse.y = - ((event.clientY - offsetTop)/$('#jungleworldSceneDiv').height()) * 2 + 1;

  this.findIntersections(isClick);
}

JungleWorld.prototype.findIntersections = function (isClick) {
	//set up stuff to find intersections
  var vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 1);
  projectorJungle.unprojectVector(vector, cameraJungle);
  raycasterJungle.set(cameraJungle.position, vector.sub(cameraJungle.position).normalize());

  //find all the scene children that the raycaster intersects with
  var intersects = raycasterJungle.intersectObjects(sceneJungle.children, true);

  //reset html of various things
  if (!this.inRiverActivity && !this.inTableActivity) {
  	Session.set('jwInstructions', this.instructions);
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

JungleWorld.prototype.handleClick = function (objName) {
	if (objName.indexOf(this.steppingStone.name) != -1) {
  	this.playRiverActivity();
  } 
  if (objName.indexOf(this.table.name) != -1) {
  	this.playTableActivity();
  }
  if (objName.indexOf(this.riverActivity.stoneName) != -1) {
  	if (objName.indexOf('transition') == -1) {
  		this.riverActivity.handleStoneClick(objName);
  	}
  } 
  if (objName.indexOf('transition') != -1) {
  	this.riverActivity.handleTransClick(objName);
  }
  if (objName.indexOf('shore') != -1) {
  	this.riverActivity.handleShoreClick(objName);
  }
}

JungleWorld.prototype.handleMouseMove = function (objName) {
	if (objName.indexOf(this.steppingStone.name) != -1) {
    Session.set('jwInstructions', 'Click to play the river activity!');
  }
}

function renderJungle () {
	requestAnimationFrame(renderJungle);
  TWEEN.update();

  //controls.update();

  //render the background scene
  rendererJungle.autoClear = false;
  rendererJungle.clear();
  rendererJungle.render(backgroundSceneJungle, backgroundCameraJungle);

  //render the actual scene
  rendererJungle.render(sceneJungle, cameraJungle);

  //remove the annoying loading div
  $('.ui-loader').remove();
}