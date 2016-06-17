function KillerWhale (length, color, name) {
	this.length = length;
	this.width = 0.4 * this.length;
	this.height = 0.25 * this.length;
	this.radius = 0.5 * this.height;
	this.colorName = color || 'white';
	this.name = name || 'myKillerWhale';

	this.colors = {
		purple: 0x800080,
		orange: 0xff7f00,
		blue: 0x0000ff,
		white: 0xffffff
	};
	this.color = this.colors[this.colorName];
	this.finMat = new THREE.MeshPhongMaterial({color: this.color, ambient: this.color, side: THREE.DoubleSide});

	this.frame = new THREE.Object3D();
	this.innerFrame = new THREE.Object3D();

	this.body = this.makeBody();
	this.innerFrame.add(this.body);

	this.addEyes();
	this.addTopFin();
	this.addSideFins();
	this.addTail();

	this.innerFrame.rotation.y = Math.PI;
	this.frame.add(this.innerFrame);
}

KillerWhale.prototype.addEyes = function () {
	var leftEye = this.makeEye(-1);
	var rightEye = this.makeEye(1);
	this.innerFrame.add(leftEye);
	this.innerFrame.add(rightEye);
}

KillerWhale.prototype.addTopFin = function () {
	var topFinInner = this.makeTopFin(0.2 * this.length, 0.55 * this.height, 0.2, 1);
	this.topFin = new THREE.Object3D();
	this.topFin.add(topFinInner);
	this.topFin.position.set(0, 0.475 * this.height, 0);
	this.innerFrame.add(this.topFin);
}

KillerWhale.prototype.addSideFins = function () {
	var leftFinInner = this.makeTopFin(0.3 * this.length, 0.65 * this.height, 0.1, 1);
	var rightFinInner = leftFinInner.clone();

	this.leftFin = new THREE.Object3D();
	leftFinInner.rotation.z = Math.PI/2;
	this.leftFin.add(leftFinInner);
	this.leftFin.position.set(-0.475 * this.width, 0, 0);
	this.leftFin.rotation.z = 0.05 * Math.PI;
	this.innerFrame.add(this.leftFin);

	this.rightFin = new THREE.Object3D();
	rightFinInner.rotation.z = -Math.PI/2;
	this.rightFin.add(rightFinInner);
	this.rightFin.position.set(0.475 * this.width, 0, 0);
	this.rightFin.rotation.z = -0.05 * Math.PI;
	this.innerFrame.add(this.rightFin);
}

KillerWhale.prototype.addTail = function () {
	this.tailWidth = 0.3 * this.length;
	var tailInner = this.makeTail();
	this.tail = new THREE.Object3D();
	tailInner.position.set(0, 0, 0.15 * this.width);
	this.tail.add(tailInner);
	this.tail.position.set(0, 0, 0.475 * this.length);
	this.tail.rotation.x = Math.PI/8;
	this.innerFrame.add(this.tail);
}

KillerWhale.prototype.makeBody = function () {
	var bodyFrame = new THREE.Object3D();
	bodyFrame.name = 'whaleBodyFrame' + this.name;

	var bodyGeom = new THREE.SphereGeometry(this.radius, 32, 32);
	var bodyMat = new THREE.MeshPhongMaterial({color: 0x000000, ambient: 0x000000});
	var body = new THREE.Mesh(bodyGeom, bodyMat);
	body.name + 'whaleBody' + this.name;

	body.scale.z = this.length/this.height;
	body.scale.x = this.width/this.height;
	bodyFrame.add(body);

	return bodyFrame;
}

KillerWhale.prototype.makeEye = function (side) {
	var eyeFrame = new THREE.Object3D();
	eyeFrame.name = 'whaleEyeFrame' + this.name;

	this.eyeRadius = 0.15 * this.radius;

	var eyeGeom = new THREE.SphereGeometry(this.eyeRadius, 32, 32);
	var eyeMat = new THREE.MeshPhongMaterial({color: 0xffffff, ambient: 0xffffff});
	var eye = new THREE.Mesh(eyeGeom, eyeMat);
	eye.name = 'whaleEye' + this.name;

	var pupilRadius = 0.75 * this.eyeRadius;
	var pupilGeom = new THREE.SphereGeometry(pupilRadius, 32, 32);
	var pupilMat = new THREE.MeshPhongMaterial({color: 0x000000, ambient: 0x000000});
	var pupilMesh = new THREE.Mesh(pupilGeom, pupilMat);
	pupilMesh.position.set(-side * 0.1 * this.eyeRadius, 0, -(0.43 * this.length + 2 * (this.eyeRadius - pupilRadius)));
	eyeFrame.add(pupilMesh);

	eye.position.set(0, 0, -0.43 * this.length);
	eyeFrame.rotation.y = 0.15 * side * Math.PI/2;
	eyeFrame.add(eye);

	return eyeFrame;
}

KillerWhale.prototype.makeTopFin = function (width, height, zFactor, bottomScale) {
	var topFinFrame = new THREE.Object3D();
	topFinFrame.name = 'whaleTopFinFrame' + this.name;

	var zOffset = zFactor * width;

	var points = [
		//bottom row
		[
			[0, 0, -0.5 * bottomScale * width],
			[0, 0, -0.25 * bottomScale * width],
			[0, 0, 0.25 * bottomScale * width],
			[0, 0, 0.5 * bottomScale * width]
		],
		//second from bottom row
		[
			[0, 0.15 * height, -0.25 * width + zOffset],
			[0, 0.15 * height, -0.125 * width + zOffset],
			[0, 0.15 * height, 0.125 * width + zOffset],
			[0, 0.15 * height, 0.25 * width + zOffset]
		],
		//second from top row
		[
			[0, 0.75 * height, -0.15 * width - zOffset],
			[0, 0.75 * height, -0.075 * width - zOffset],
			[0, 0.75 * height, 0.075 * width - zOffset],
			[0, 0.75 * height, 0.15 * width - zOffset]
		],
		//top row
		[
			[0, 0.95 * height, -0.075 * width + zOffset],
			[0, height, -0.05 * width + zOffset],
			[0, height, 0.05 * width + zOffset],
			[0, 0.95 * height, 0.075 * width + zOffset]
		]
	];

	var geom = new THREE.BezierSurfaceGeometry(points, 20, 20);
	var mesh = new THREE.Mesh(geom, this.finMat);

	topFinFrame.add(mesh);

	return topFinFrame;
}

KillerWhale.prototype.makeSideFin = function () {
	var finFrame = new THREE.Object3D();
	finFrame.name = 'whaleFinFrame' + this.name;

	return finFrame;
}

KillerWhale.prototype.makeTail = function () {
	var tailFrame = new THREE.Object3D();
	tailFrame.name = 'whaleTailFrame' + this.name;

	var leftTail = this.makeTopFin(this.tailWidth, 1.2 * this.height, 0.2, 0.5);
	var rightTail = leftTail.clone();

	leftTail.position.set(-0.025 * this.width, 0, 0);
	rightTail.position.set(0.025 * this.width, 0, 0);

	leftTail.rotation.set(0, -Math.PI/10, Math.PI/2);
	rightTail.rotation.set(0, Math.PI/10, -Math.PI/2);

	tailFrame.add(leftTail);
	tailFrame.add(rightTail);

	return tailFrame;
}

KillerWhale.prototype.move = function (nextPosition, time, completeFcn) {
	var whale = this;
	whale.moveTime = time || 2000;
	whale.finTime = 0.5 * whale.moveTime;

	//tail
	var tailRot = {x: Math.PI/8};

	//tail up
	whale.tailUpTween = new TWEEN.Tween(tailRot).to({x: -Math.PI/6}, whale.finTime).onUpdate(function () {
		whale.tail.rotation.x = tailRot.x;
	}).onStop(function () {
		whale.tail.rotation.x = Math.PI/8;
	});

	//tail down
	whale.tailDownTween = new TWEEN.Tween(tailRot).to({x: Math.PI/6}, whale.finTime).onUpdate(function () {
		whale.tail.rotation.x = tailRot.x;
	}).onStop(function () {
		whale.tail.rotation.x = Math.PI/8;
	});

	//chain tail tweens
	whale.tailUpTween.chain(whale.tailDownTween);
	whale.tailDownTween.chain(whale.tailUpTween);

	//fin
	var finRot = {z: 0.05 * Math.PI};

	//fin up
	whale.finUpTween = new TWEEN.Tween(finRot).to({z: -Math.PI/4}, whale.finTime).onUpdate(function () {
		whale.leftFin.rotation.z = finRot.z;
		whale.rightFin.rotation.z = -finRot.z;
	}).onStop(function () {
		whale.leftFin.rotation.z = 0.1 * Math.PI;
		whale.rightFin.rotation.z =  -0.1 * Math.PI;
	});

	//fin down
	whale.finDownTween = new TWEEN.Tween(finRot).to({z: Math.PI/4}, whale.finTime).onUpdate(function () {
		whale.leftFin.rotation.z = finRot.z;
		whale.rightFin.rotation.z = -finRot.z;
	}).onStop(function () {
		whale.leftFin.rotation.z = 0.1 * Math.PI;
		whale.rightFin.rotation.z = -0.1 * Math.PI;
	});

	//chain fin tweens
	whale.finUpTween.chain(whale.finDownTween);
	whale.finDownTween.chain(whale.finUpTween);

	//move tween
	whale.moveTween = new TWEEN.Tween(whale.frame.position).to(nextPosition, whale.moveTime).onStart(function () {
		whale.frame.lookAt(nextPosition);
		whale.tailUpTween.start();
		whale.finDownTween.start();
	}).onComplete(function () {
		whale.stopMoving();
		if (completeFcn) {
			completeFcn();
		}
	});

	whale.moveTween.start();
}

KillerWhale.prototype.stopMoving = function () {
	if (this.moveTween) {
		this.moveTween.stop();
		this.tailUpTween.stop();
		this.tailDownTween.stop();
		this.finUpTween.stop();
		this.finDownTween.stop();
	}
}

