function SteppingStone (radius, color, name, index) {
	this.radius = radius;
	this.color = color;
	this.numPoints = 20;
	this.name = name;
	this.index = parseInt(index) + 1;

	this.frame = new THREE.Object3D();

	this.body = this.makeBody();
	this.frame.add(this.body);

	if (this.index) {
		this.number = this.makeNumber();
		this.number.position.set(0, 1.0 * this.radius, 0.5 * this.radius);
		this.number.rotateX(-Math.PI/2);
		this.frame.add(this.number);
	}
}

SteppingStone.prototype.makeBody = function () {
	var bodyFrame = new THREE.Object3D();
	bodyFrame.name = 'steppingStoneBodyFrame' + this.name;

	var corners = [
		new THREE.Vector3(-this.radius, -this.radius, -this.radius),
		new THREE.Vector3(-this.radius, -this.radius, this.radius),
		new THREE.Vector3(-this.radius, this.radius, -this.radius),
		new THREE.Vector3(-this.radius, this.radius, this.radius),
		new THREE.Vector3(this.radius, -this.radius, -this.radius),
		new THREE.Vector3(this.radius, -this.radius, this.radius),
		new THREE.Vector3(this.radius, this.radius, -this.radius),
		new THREE.Vector3(this.radius, this.radius, this.radius)
	];
	points = [];

	//positive z-plane
	for (var i = 0; i < 4; i++) {
		var x = randomInRange(-this.radius, this.radius);
		var y = randomInRange(-this.radius, this.radius);
		var z = this.radius;
		points.push(new THREE.Vector3(x, y, z));
	}

	//negative z-plane
	for (var j = 0; j < 4; j++) {
		var x = randomInRange(-this.radius, this.radius);
		var y = randomInRange(-this.radius, this.radius);
		var z = -this.radius;
		points.push(new THREE.Vector3(x, y, z));
	}

	//positive x-plane
	for (var k = 0; k < 4; k++) {
		var x = this.radius;
		var y = randomInRange(-this.radius, this.radius);
		var z = randomInRange(-this.radius, this.radius);
		points.push(new THREE.Vector3(x, y, z));
	}

	//negative x-plane
	for (var l = 0; l < 4; l++) {
		var x = -this.radius;
		var y = randomInRange(-this.radius, this.radius);
		var z = randomInRange(-this.radius, this.radius);
		points.push(new THREE.Vector3(x, y, z));
	}

	//positive y-plane
	for (var m = 0; m < 4; m++) {
		var x = randomInRange(-this.radius, this.radius);
		var y = this.radius;
		var z = randomInRange(-this.radius, this.radius);
		points.push(new THREE.Vector3(x, y, z));
	}

	//negative y-plane
	for (var n = 0; n < 4; n++) {
		var x = randomInRange(-this.radius, this.radius);
		var y = -this.radius;
		var z = randomInRange(-this.radius, this.radius);
		points.push(new THREE.Vector3(x, y, z));
	}

	//random inner points
	for (var r = 0; r < this.numPoints; r++) {
		var x = randomInRange(-this.radius, this.radius);
		var y = randomInRange(-this.radius, this.radius);
		var z = randomInRange(-this.radius, this.radius);
		points.push(new THREE.Vector3(x, y, z));
	}

	var hullGeom = new THREE.ConvexGeometry(points);
	var hullMat = new THREE.MeshPhongMaterial({color: this.color, ambient: this.color, transparent: true, opacity: 0.7, side: THREE.DoubleSide});
	var hull = new THREE.Mesh(hullGeom, hullMat);
	hull.name = 'steppingStoneBody' + this.name;

	bodyFrame.add(hull);

	return bodyFrame;
}

SteppingStone.prototype.makeNumber = function () {
	var options = {
    size: this.radius,
    height: 10,
    weight: 'normal',
    font: 'helvetiker',
    style: 'normal',
    bevelThickness: 1,
    bevelSize: 1,
    bevelSegments: 3,
    bevelEnabled: true,
    curveSegments: 12,
    steps: 1
  };
  var geom = new THREE.TextGeometry(this.index, options);

  var mat = new THREE.MeshBasicMaterial({color: 0x0000ff});
  var mesh = new THREE.Mesh(geom, mat);
  mesh.name = 'steppingStoneNumber' + this.name;

  return mesh;
}

SteppingStone.prototype.makeBody2 = function () {
	var bodyFrame = new THREE.Object3D();
	bodyFrame.name = 'steppingStoneBodyFrame' + this.name;

	var sphereGeom = new THREE.SphereGeometry(this.radius, 8, 8);
	var sphereMat = new THREE.MeshPhongMaterial({color: this.color, ambient: this.color, specular: 0xe7e7e7, shading: THREE.FlatShading});
	var sphere = new THREE.Mesh(sphereGeom, sphereMat);
	//sphere.scale.x = 1.5;
	sphere.name = 'steppingStoneBody' + this.name;

	bodyFrame.add(sphere);

	return bodyFrame;
}

SteppingStone.prototype.highlight = function (color) {
	var mesh = this.frame.children[0].children[0];
	mesh.material.color = new THREE.Color(color);
	mesh.material.ambient = new THREE.Color(color);
}

SteppingStone.prototype.unhighlight = function () {
	this.highlight(this.color);
}

