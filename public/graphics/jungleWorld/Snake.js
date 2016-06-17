var colors = {
	purple: [0xe066ff, 0x9932cc, 0x9b30ff, 0x551a8b],
	orange: [0xffc125, 0xffa500, 0xff7f00],
	green: [0x00fa9a, 0x7cfc00, 0x2e8b57],
	red: [0xb0171f, 0xdc143c, 0xcd0000, 0x8b0000]
}

//frame origin: center of head
//body extends down the negative z-axis and the negative y-axis
function Snake (length, color, name) {
	this.length = length;
	this.height = 0.2 * this.length;
	this.colorArray = colors[color];
	if (!this.colorArray) {
		this.colorArray = colors['green'];
	}
	this.name = name;

	//head parameters
	this.headLength = 0.2 * this.length;
	this.headScale = 1.5;
	this.headRadius = this.headLength/this.headScale;

	//body parameters
	this.bodyLength = this.length - this.headLength;
	this.bodyRadius = 0.6 * this.headRadius;
	this.bodyCurve = 0.4 * this.bodyLength;

	this.frame = new THREE.Object3D();

	this.head = this.makeHead();
	this.frame.add(this.head);

	this.body = this.makeBody();
	this.frame.add(this.body);
}

//origin: center of head
//extends along the z-axis
Snake.prototype.makeHead = function () {
	var headFrame = new THREE.Object3D();
	headFrame.name = 'snakeHeadFrame' + this.name;

	var sphereGeom = new THREE.SphereGeometry(this.headRadius, 32, 32);
	var sphereMat = speckledMaterial(sphereGeom, this.colorArray);
	var sphere = new THREE.Mesh(sphereGeom, sphereMat);
	sphere.rotation.y = -Math.PI/2;
	sphere.scale.x = this.headScale;
	sphere.name = 'snakeHead' + this.name;

	headFrame.add(sphere);

	this.leftEye = this.makeEye(1);
	headFrame.add(this.leftEye);

	this.rightEye = this.makeEye(-1);
	headFrame.add(this.rightEye);

	this.tongue = this.makeTongue();
	this.tongue.position.set(0, 0, 1.0 * this.headLength);
	headFrame.add(this.tongue);

	return headFrame;
}

//origin: corresponds to the head center
Snake.prototype.makeEye = function (side) {
	var eyeFrame = new THREE.Object3D();
	eyeFrame.name = 'snakeEyeFrame' + this.name;

	this.eyeRadius = 0.15 * this.headRadius;

	var eyeGeom = new THREE.SphereGeometry(this.eyeRadius, 32, 32);
	var eyeMat = new THREE.MeshPhongMaterial({color: 0x000000, ambient: 0x000000});
	var eye = new THREE.Mesh(eyeGeom, eyeMat);
	eye.name = 'snakeEye' + this.name;

	eye.position.set(0, 0, this.headRadius);
	eyeFrame.rotation.y = 0.85 * side * Math.PI/2;
	eyeFrame.add(eye);

	return eyeFrame;
}

//origin: middle of flat edge of tongue
//extends along the positive z-axis
Snake.prototype.makeTongue = function () {
	var tongueFrame = new THREE.Object3D();
	tongueFrame.name = 'snakeTongueFrame' + this.name;

	this.tongueLength = 0.75 * this.headLength;
	this.tongueCurvature = 0.25 * this.tongueLength;
	this.tongueWidth = 0.3 * this.tongueLength;

	var points = [
		//bottom row
		[[-0.5 * this.tongueWidth, 0, 0],
		 [-0.25 * this.tongueWidth, 0, 0],
		 [0.25 * this.tongueWidth, 0, 0],
		 [0.5 * this.tongueWidth, 0, 0]],

		//second from bottom row
		[[-0.5 * this.tongueWidth, this.tongueCurvature, 0.33 * this.tongueLength],
		 [-0.25 * this.tongueWidth, this.tongueCurvature, 0.33 * this.tongueLength],
		 [0.25 * this.tongueWidth, this.tongueCurvature, 0.33 * this.tongueLength],
		 [0.5 * this.tongueWidth, this.tongueCurvature, 0.33 * this.tongueLength]],

		//second from top row
		[[-0.5 * this.tongueWidth, -this.tongueCurvature, 0.66 * this.tongueLength],
		 [-0.25 * this.tongueWidth, -this.tongueCurvature, 0.66 * this.tongueLength],
		 [0.25 * this.tongueWidth, -this.tongueCurvature, 0.66 * this.tongueLength],
		 [0.5 * this.tongueWidth, -this.tongueCurvature, 0.66 * this.tongueLength]],

		//top row
		[[-0.5 * this.tongueWidth, -0.5 * this.tongueCurvature, this.tongueLength],
		 [0, -0.5 * this.tongueCurvature, 0.8 * this.tongueLength],
		 [0, -0.5 * this.tongueCurvature, 0.8 * this.tongueLength],
		 [0.5 * this.tongueWidth, -0.5 * this.tongueCurvature, this.tongueLength]]
	];

	var tongueGeom = new THREE.BezierSurfaceGeometry(points, 20, 20);
	var tongueMat = new THREE.MeshBasicMaterial({color: 0xff82ab, side: THREE.DoubleSide});
	var tongue = new THREE.Mesh(tongueGeom, tongueMat);
	tongue.name = 'snakeTongue' + this.name;

	tongueFrame.add(tongue);

	return tongueFrame;
}

Snake.prototype.makeBody = function () {
	var bodyFrame = new THREE.Object3D();
	bodyFrame.name = 'snakeBodyFrame' + this.name;

	var neckPoints = [
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0.5 * this.bodyCurve, 0, -0.3 * this.bodyLength),
		new THREE.Vector3(-this.bodyCurve, -this.height, -0.4 * this.bodyLength),
		new THREE.Vector3(0, -this.height, -0.5 * this.bodyLength)
	];

	var tailPoints = [
		new THREE.Vector3(0, -this.height, -0.5 * this.bodyLength),
		new THREE.Vector3(this.bodyCurve, -this.height, -0.65 * this.bodyLength),
		new THREE.Vector3(-this.bodyCurve, -this.height, -0.8 * this.bodyLength),
		new THREE.Vector3(0, -this.height, -this.bodyLength)
	];

	var neckCuve = new THREE.CubicBezierCurve3(neckPoints[0], neckPoints[1], neckPoints[2], neckPoints[3]);
	var tailCurve = new THREE.CubicBezierCurve3(tailPoints[0], tailPoints[1], tailPoints[2], tailPoints[3]);

	var bodyPoints = [];
	for (var i = 0; i <= 1.0; i += 0.1) {
		bodyPoints.push(neckCuve.getPointAt(i));
	}
	for (var j = 0.1; j <= 1.0; j += 0.1) {
		bodyPoints.push(tailCurve.getPointAt(j));
	}

	var bodyCurve = new THREE.SplineCurve3(bodyPoints);
	var bodyGeom = new THREE.TubeRadialGeometry(bodyCurve, 32, [this.bodyRadius, 0.25 * this.bodyRadius], 16, false);
	var bodyMat = speckledMaterial(bodyGeom, this.colorArray);
	var body = new THREE.Mesh(bodyGeom, bodyMat);
	body.name = 'snakeBody' + this.name;

	body.position.z = -0.5 * this.headLength;
	bodyFrame.add(body);

	//cap off the tail so the user can't see inside the body
	var capGeom = new THREE.SphereGeometry(0.25 * this.bodyRadius, 8, 8);
	var capMat = speckledMaterial(capGeom, this.colorArray);
	var cap = new THREE.Mesh(capGeom, capMat);
	cap.name = 'snakeTailCap' + this.name;

	cap.position.set(0, -this.height, -0.5 * this.headLength - this.bodyLength);
	bodyFrame.add(cap);

	return bodyFrame;
}

Snake.prototype.move = function (nextPosition, time, completeFcn) {
	var snake = this;
	snake.coilTime = 0.25 * time || 1000;
	snake.moveTime = time || 4000;

	var slitherScale = {z: 1};

	snake.contractTween = new TWEEN.Tween(slitherScale).to({z: 0.7}, snake.coilTime).onUpdate(function () {
		snake.body.scale.z = slitherScale.z;
	}).onStop(function () {
		snake.body.scale.z = 1;
	});

	snake.expandTween = new TWEEN.Tween(slitherScale).to({z: 1}, snake.coilTime).onUpdate(function () {
		snake.body.scale.z = slitherScale.z;
	}).onStop(function () {
		snake.body.scale.z = 1;
	});

	snake.contractTween.chain(snake.expandTween);
	snake.expandTween.chain(snake.contractTween);

	snake.moveTween = new TWEEN.Tween(snake.frame.position).to({x: nextPosition.x, y: nextPosition.y, z: nextPosition.z}, snake.moveTime)
		.onStart(function () {
			snake.frame.lookAt(nextPosition);
			snake.contractTween.start();
		}).onComplete(function () {
			snake.stopMoving();
			if (completeFcn) {
				completeFcn();
			}
		});

	snake.moveTween.start();
}

Snake.prototype.stopMoving = function () {
	if (this.moveTween) {
		this.moveTween.stop();
		this.contractTween.stop();
		this.expandTween.stop();
	}
}