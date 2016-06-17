var berryColors = {
	'purple': 0x800080,
	'orange': 0xff7f00,
	'blue': 0x0000ff
};

function Berry (radius, color, name) {
	this.radius = radius;
	this.bodyColor = berryColors[color] || 0xff0000;
	this.stemHeight = 0.75 * this.radius;
	this.leafLength = 0.9 * this.radius;
	this.name = name;

	this.frame = new THREE.Object3D();

	this.body = this.makeBody();
	this.frame.add(this.body);
}

Berry.prototype.makeBody = function () {
	var bodyFrame = new THREE.Object3D();
	bodyFrame.name = 'berryBodyFrame' + this.name;

	var sphereGeom = new THREE.SphereGeometry(this.radius, 32, 32);
	var sphereMat = new THREE.MeshPhongMaterial({color: this.bodyColor, ambient: this.bodyColor});
	var sphere = new THREE.Mesh(sphereGeom, sphereMat);
	sphere.name = 'berryBody' + this.name;

	bodyFrame.add(sphere);

	this.stem = this.makeStem();
	bodyFrame.add(this.stem);

	return bodyFrame;
}

Berry.prototype.makeStem = function () {
	var stemFrame = new THREE.Object3D();
	stemFrame.name = 'berryStemFrame' + this.name;

	this.stemXCurve = 0.5 * this.stemHeight;
	this.stemRadius = 0.2 * this.stemHeight;

	var stemPoints = [
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, 0.25 * this.stemHeight, 0),
		new THREE.Vector3(0.75 * this.stemXCurve, 0.8 * this.stemHeight, 0),
		new THREE.Vector3(0.9 * this.stemXCurve, this.stemHeight, 0),
		new THREE.Vector3(this.stemXCurve, this.stemHeight, 0)
	];

	var stemCurve = new THREE.SplineCurve3(stemPoints);
	var stemGeom = new THREE.TubeRadialGeometry(stemCurve, 32, [this.stemRadius, 0], 16, false);
	var stemMat = new THREE.MeshPhongMaterial({color: 0x006400, ambient: 0x006400, side: THREE.DoubleSide});
	var stem = new THREE.Mesh(stemGeom, stemMat);
	stem.name = 'berryStem' + this.name;

	stem.position.y = this.radius;
	stemFrame.add(stem);

	return stemFrame;
}

Berry.prototype.move = function (nextPosition, time, completeFcn) {
	var berry = this;

	berry.moveTime = time || 2000;

	berry.moveTween = new TWEEN.Tween(berry.frame.position).to({x: nextPosition.x, y: nextPosition.y, z: nextPosition.z}, berry.moveTime)
		.onComplete(function () {
			berry.stopMoving();
			if (completeFcn) {
				completeFcn();
			}
		});

	berry.moveTween.start();
}

Berry.prototype.stopMoving = function () {
	if (this.moveTween) {
		this.moveTween.stop();
	}
}