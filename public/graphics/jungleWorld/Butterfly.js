var blues = [0x00e5ee, 0x0000ff];
var greens = [0x00fa9a, 0x7cfc00];
var purples = [0xe066ff, 0x9932cc, 0x9b30ff];
var pinks = [0xff1493];
var golds = [0xff8c00, 0xffd700];

function Butterfly (length) {
	//body parameters
	this.bodyLength = length;
	this.wingLength = 1.25 * this.bodyLength;
	this.wingRadius = 0.3 * this.wingLength;

	//head parameters
	this.headRadius = 0.15 * this.bodyLength;
	this.eyeRadius = 0.15 * this.headRadius;
	this.antennaLength = 0.7 * this.bodyLength;
	this.antennaRadius = 0.1 * this.headRadius;

	this.frame = new THREE.Object3D();
	this.innerFrame = new THREE.Object3D();

	this.head = this.makeHead();
	this.head.position.set(0, 0.95 * this.bodyLength + this.headRadius, 0);
	this.innerFrame.add(this.head);

	this.body = this.makeBody();
	this.body.position.set(0, 0.5 * this.bodyLength, 0);
	this.innerFrame.add(this.body);

	this.innerFrame.rotation.x = Math.PI/3;
	this.frame.add(this.innerFrame);
}

Butterfly.prototype.makeHead = function () {
	var headFrame = new THREE.Object3D();
	headFrame.name = 'butterflyHeadFrame';

	var sphereGeom = new THREE.SphereGeometry(this.headRadius, 32, 32);
	var sphereMat = new THREE.MeshPhongMaterial({color: 0x000000, ambient: 0x000000});
	var sphere = new THREE.Mesh(sphereGeom, sphereMat);
	sphere.name = 'butterflyHead';

	headFrame.add(sphere);

	this.rightEye = this.makeEye(1);
	headFrame.add(this.rightEye);

	this.leftEye = this.makeEye(-1);
	headFrame.add(this.leftEye);

	this.rightAntenna = this.makeAntenna(1);
	this.rightAntenna.position.set(0.35 * this.headRadius, this.headRadius, 0);
	headFrame.add(this.rightAntenna);

	this.leftAntenna = this.makeAntenna(-1);
	this.leftAntenna.position.set(-0.35 * this.headRadius, this.headRadius, 0);
	headFrame.add(this.leftAntenna);

	return headFrame;
}

Butterfly.prototype.makeEye = function (side) {
	var eyeFrame = new THREE.Object3D();
	eyeFrame.name = 'butterflyEyeFrame';

	var eyeGeom = new THREE.SphereGeometry(this.eyeRadius, 32, 32);
	var eyeMat = new THREE.MeshPhongMaterial({color: 0x00e5ee, ambient: 0x00e5ee});
	var eye = new THREE.Mesh(eyeGeom, eyeMat);
	eyeFrame.name = 'butterflyEye';

	eye.position.set(0, 0, this.headRadius);
	eyeFrame.rotation.x = -1.05 * Math.PI/2;
	eyeFrame.rotation.y = side * Math.PI/6;
	eyeFrame.add(eye);

	return eyeFrame;
}

Butterfly.prototype.makeAntenna = function (side) {
	var antennaFrame = new THREE.Object3D();
	antennaFrame.name = 'butterflyAntennaFrame';

	var antennaPoints = [
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(side * 0.3 * this.antennaLength, this.antennaLength, 0)
	];

	var antennaCurve = new THREE.SplineCurve3(antennaPoints);
	var antennaRadii = [this.antennaRadius];

	var antennaGeom = new THREE.TubeRadialGeometry(antennaCurve, 32, antennaRadii, 16, true);
	var antennaMat = new THREE.MeshPhongMaterial({color: 0x000000, ambient: 0x000000});
	var antenna = new THREE.Mesh(antennaGeom, antennaMat);
	antenna.name = 'butterflyAntenna';

	antennaFrame.add(antenna);

	return antennaFrame;
}

Butterfly.prototype.makeBody = function () {
	var bodyFrame = new THREE.Object3D();
	bodyFrame.name = 'butterflyBodyFrame';

	var bezierPoints = [
		new THREE.Vector3(0, 0, -0.5 * this.bodyLength),
		new THREE.Vector3(1.25 * this.headRadius, 0, -0.25 * this.bodyLength),
		new THREE.Vector3(1.25 * this.headRadius, 0, 0.25 * this.bodyLength),
		new THREE.Vector3(0, 0, 0.5 * this.bodyLength)
	];
	var bodyCurve = new THREE.CubicBezierCurve3(bezierPoints[0], bezierPoints[1], bezierPoints[2], bezierPoints[3]);

	var lathePoints = [];
	for (var i = 0; i <= 1; i += 0.1) {
		lathePoints.push(bodyCurve.getPointAt(i));
	}

	var latheGeom = new THREE.LatheGeometry(lathePoints, 64);
	var latheMat = new THREE.MeshPhongMaterial({color: 0x000000, ambient: 0x000000});
	var lathe = new THREE.Mesh(latheGeom, latheMat);

	lathe.rotation.x = Math.PI/2;
	bodyFrame.add(lathe);
	lathe.name = 'butterflyBody';

	this.rightWing = this.makeWing(1);
	this.rightWing.position.set(0.5 * this.headRadius, 0, 0);
	bodyFrame.add(this.rightWing);

	this.leftWing = this.makeWing(-1);
	this.leftWing.position.set(-0.5 * this.headRadius, 0, 0);
	bodyFrame.add(this.leftWing);

	return bodyFrame;
}

Butterfly.prototype.makeWing = function (side) {
	var wingFrame = new THREE.Object3D();
	wingFrame.name = 'butterflyWingFrame';

	var topWingGeom = bezierBalloonGeom(this.wingLength, this.wingRadius);
	var topWingColors = blues.concat(greens).concat(purples);
	var topWingMat = speckledMaterial(topWingGeom, topWingColors);
	//var topWingMat = new THREE.MeshBasicMaterial({color: 0xff0000});
	topWingMat.side = THREE.DoubleSide;
	var topWing = new THREE.Mesh(topWingGeom, topWingMat);
	topWing.name = 'butterflyTopWing';

	topWing.rotation.z = side * -Math.PI/4;
	wingFrame.add(topWing);

	var bottomWingGeom = bezierBalloonGeom(0.75 * this.wingLength, 0.8 * this.wingRadius);
	var bottomWingColors = pinks.concat(golds);
	var bottomWingMat = speckledMaterial(bottomWingGeom, topWingColors);
	//var bottomWingMat = new THREE.MeshNormalMaterial();
	bottomWingMat.side = THREE.DoubleSide;
	var bottomWing = new THREE.Mesh(bottomWingGeom, bottomWingMat);
	bottomWing.name = 'butterflyBottomWing';

	bottomWing.rotation.z = side * -3*Math.PI/4;
	wingFrame.add(bottomWing);

	return wingFrame;
}

Butterfly.prototype.move = function (nextPosition, time, completeFcn) {
	var butterfly = this;
	butterfly.flapTime = 0.5 * time || 1000;
	butterfly.moveTime = time || 2000;

	var flapRot = {y: 0};

	//initial tween to flap wings up - in half the time since the wings are starting from 0 rotation
	butterfly.flapInitTween = new TWEEN.Tween(flapRot).to({y: -Math.PI/5}, 0.5 * butterfly.flapTime).onUpdate(function () {
		butterfly.rightWing.rotation.y = flapRot.y;
		butterfly.leftWing.rotation.y = -flapRot.y;
	}).onStop(function () {
		butterfly.rightWing.rotation.y = 0;
		butterfly.leftWing.rotation.y = 0;
	});

	//tween to flap wings up
	butterfly.flapUpTween = new TWEEN.Tween(flapRot).to({y: -Math.PI/5}, butterfly.flapTime).onUpdate(function () {
		butterfly.rightWing.rotation.y = flapRot.y;
		butterfly.leftWing.rotation.y = -flapRot.y;
	}).onStop(function () {
		butterfly.rightWing.rotation.y = 0;
		butterfly.leftWing.rotation.y = 0;
	});

	//tween to flap wings down
	butterfly.flapDownTween = new TWEEN.Tween(flapRot).to({y: Math.PI/5}, butterfly.flapTime).onUpdate(function () {
		butterfly.rightWing.rotation.y = flapRot.y;
		butterfly.leftWing.rotation.y = -flapRot.y;
	}).onStop(function () {
		butterfly.rightWing.rotation.y = 0;
		butterfly.leftWing.rotation.y = 0;
	});

	//infinitely chain the up and down tweens, and chain the down tween to the initial up tween
	butterfly.flapUpTween.chain(butterfly.flapDownTween);
	butterfly.flapDownTween.chain(butterfly.flapUpTween);
	butterfly.flapInitTween.chain(butterfly.flapDownTween);

	//tween the butterfly to the next position while flapping
	butterfly.moveTween = new TWEEN.Tween(butterfly.frame.position).to({x: nextPosition.x, y: nextPosition.y, z: nextPosition.z}, butterfly.moveTime)
		.onStart(function () {
			butterfly.frame.lookAt(nextPosition);
			butterfly.flapInitTween.start();
		}).onComplete(function () {
			butterfly.stopMoving();
			if (completeFcn) {
				completeFcn();
			}
		});

	//start flying
	butterfly.moveTween.start();
}

Butterfly.prototype.stopMoving = function () {
	if (this.moveTween) {
		this.moveTween.stop();
		this.flapInitTween.stop();
		this.flapUpTween.stop();
		this.flapDownTween.stop();
	}
}

function bezierBalloonGeom (length, radius) {
	var points = [
		//bottom row
		[[0, 0, 0],
		 [0, 0, 0],
		 [0, 0, 0],
		 [0, 0, 0]],

		//second from bottom row
		[[-0.75 * radius, 0.25 * length, 0],
		 [-0.3 * radius, 0.25 * length, 0],
		 [0.3 * radius, 0.25 * length, 0],
		 [0.75 * radius, 0.25 * length, 0]],

		//second from top row
		[[-radius, 0.75 * length, 0],
		 [-0.5 * radius, 0.75 * length, 0],
		 [0.5 * radius, 0.75 * length, 0],
		 [radius, 0.75 * length, 0]],

		//top row
		[[-0.75 * radius, 0.8 * length, 0],
		 [-0.3 * radius, 0.95 * length, 0],
		 [0.3 * radius, 0.95 * length, 0],
		 [0.75 * radius, 0.8 * length, 0]]
	];

	var surface = new THREE.BezierSurfaceGeometry(points, 20, 20);
	//var extrude = new THREE.BezierExtrudeGeometry(surface);
	return surface;
}

