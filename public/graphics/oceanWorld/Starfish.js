function Starfish (radius, color, name, index) {
	this.radius = radius;
	this.color = color;
	this.name = name || 'myStarfish';
	this.index = parseInt(index) + 1;

	this.thickness = 0.25 * this.radius;

	this.frame = new THREE.Object3D();
	this.frame.name = 'starfishFrame' + this.name;

	this.body = this.makeBody();
	this.frame.add(this.body);

	if (this.index) {
		this.number = this.makeNumber();
		this.number.position.set(-0.25 * this.radius, this.thickness, 0.25 * this.radius);
		this.number.rotateX(-Math.PI/2);
		this.frame.add(this.number);
	}
}

Starfish.prototype.makeBody = function () {
	var bodyFrame = new THREE.Object3D();
	bodyFrame.name = 'starfishBodyFrame' + this.name;

	this.legs = [];

	for (var i = 0; i < 5; i++) {
		var leg = this.makeLeg();
		leg.rotateY(i * 2 * Math.PI/5);
		bodyFrame.add(leg);
		this.legs.push(leg);
	}

	return bodyFrame;
}

Starfish.prototype.makeLeg = function () {
	var legFrame = new THREE.Object3D();
	legFrame.name = 'starfishLegFrame' + this.name;

	var legRadius = 0.25 * this.radius;

	var points = [
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, 0, -this.radius)
	];
	var curve = new THREE.SplineCurve3(points);
	var radii = [legRadius, 0.3 * legRadius];
	var geom = new THREE.TubeRadialGeometry(curve, 64, radii, 32, false);
	var mat = new THREE.MeshPhongMaterial({color: this.color, ambient: this.color, specular: this.color});
	var leg = new THREE.Mesh(geom, mat);
	leg.name = 'starfishLeg' + this.name;

	legFrame.add(leg);

	return legFrame;
}

Starfish.prototype.makeNumber = function () {
	var options = {
    size: 0.5 * this.radius,
    height: 8,
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
  mesh.name = 'starfishNumber' + this.name;

  return mesh;
}

Starfish.prototype.highlight = function (color) {
	//each ith child of this.body is an Object3D containing a leg mesh
	for (var i = 0; i < this.body.children.length; i++) {
		var mesh = this.body.children[i].children[0];
		mesh.material.color = new THREE.Color(color);
		mesh.material.ambient = new THREE.Color(color);
	}
}

Starfish.prototype.unhighlight = function () {
	this.highlight(this.color);
}