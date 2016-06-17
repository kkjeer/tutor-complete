function Penguin (bodyRadius) {
	this.bodyRadius = bodyRadius;
	this.bodyScale = 1.25;
	this.bodyLength = this.bodyScale * this.bodyRadius;
	this.headRadius = 0.5 * this.bodyRadius;
	this.eyeRadius = 0.125 * this.headRadius;
	this.footLength = 0.65 * this.bodyLength;
	this.wingRadius = 0.7 * this.bodyRadius;
	this.wingLength = 1.1 * this.bodyLength;

	this.frame = new THREE.Object3D();

	this.body = this.makeBody();
	this.body.position.set(0, this.footLength + 0.75 * this.bodyLength, 0);
	this.frame.add(this.body);

	this.head = this.makeHead();
	this.head.position.set(0, this.body.position.y + this.bodyLength + 0.9 * this.headRadius, 0);
	this.frame.add(this.head);

	this.leftLeg = this.makeFoot();
	this.leftLeg.position.set(-0.3 * this.bodyRadius, 0, 0);
	this.frame.add(this.leftLeg);

	this.rightLeg = this.makeFoot();
	this.rightLeg.position.set(0.3 * this.bodyRadius, 0, 0);
	this.frame.add(this.rightLeg);
}

Penguin.prototype.makeHead = function () {
	var headFrame = new THREE.Object3D();

	var sphereGeom = new THREE.SphereGeometry(this.headRadius, 32, 32);
	var sphereMat = new THREE.MeshPhongMaterial({color: 0x000000, ambient: 0x000000});
	var sphereMesh = new THREE.Mesh(sphereGeom, sphereMat);
	headFrame.add(sphereMesh);

	var leftEye = this.makeEye(1);
	headFrame.add(leftEye);

	var rightEye = this.makeEye(-1);
	headFrame.add(rightEye);

	var beak = this.makeBeak();
	beak.position.set(0, 0, 0);
	headFrame.add(beak);

	return headFrame;
}

Penguin.prototype.makeEye = function (side) {
	var eyeFrame = new THREE.Object3D();

	var eyeGeom = new THREE.SphereGeometry(this.eyeRadius, 32, 32);
	var eyeMat = new THREE.MeshPhongMaterial({color: 0xffffff, ambient: 0xffffff});
	var eyeMesh = new THREE.Mesh(eyeGeom, eyeMat);

	var pupilRadius = 0.75 * this.eyeRadius;
	var pupilGeom = new THREE.SphereGeometry(pupilRadius, 32, 32);
	var pupilMat = new THREE.MeshPhongMaterial({color: 0x000000, ambient: 0x000000});
	var pupilMesh = new THREE.Mesh(pupilGeom, pupilMat);
	//pupilMesh.scale.z = 0.95;

	eyeMesh.position.set(0, 0, this.headRadius);
	pupilMesh.position.set(-side * 0.5 * this.eyeRadius, 0, this.headRadius + 2 * (this.eyeRadius - pupilRadius));
	eyeFrame.rotation.x = 0;
	eyeFrame.rotation.y = side * Math.PI/4;
	eyeFrame.add(eyeMesh);
	eyeFrame.add(pupilMesh);

	return eyeFrame;
}

Penguin.prototype.makeBeak = function () {
	var beakFrame = new THREE.Object3D();

	var upperBeakLength = 0.7 * this.headRadius;
	var upperBeakRadius = 0.3 * upperBeakLength;

	var upperBeakPoints = [new THREE.Vector3(0, 0, 0),
													new THREE.Vector3(0, -0.25 * upperBeakLength, 0.3 * upperBeakLength),
													new THREE.Vector3(0, -0.5 * upperBeakLength, 0.6 * upperBeakLength),
													new THREE.Vector3(0, -0.75 * upperBeakLength, 0.8 * upperBeakLength)
												];

	var upperBeakCurve = new THREE.SplineCurve3(upperBeakPoints);

	var upperBeakRadii = [upperBeakRadius, 0];

	var upperBeakGeom = new THREE.TubeRadialGeometry(upperBeakCurve, 32, upperBeakRadii, 16, false);
	var upperBeakMat = new THREE.MeshPhongMaterial({color: 0xffff00, ambient: 0xffff00});
	var upperBeakMesh = new THREE.Mesh(upperBeakGeom, upperBeakMat);

	upperBeakMesh.position.set(0, 0, 0.9 * this.headRadius);
	beakFrame.add(upperBeakMesh);

	var lowerBeakLength = 0.5 * upperBeakLength;
	var lowerBeakRadius = 0.8 * upperBeakRadius;

	var lowerBeakPoints = [new THREE.Vector3(lowerBeakRadius, 0, 0),
													new THREE.Vector3(1.05 * lowerBeakRadius, 0, 0.25 * lowerBeakLength),
													new THREE.Vector3(0.9 * lowerBeakRadius, 0, 0.5 * lowerBeakLength),
													new THREE.Vector3(0.6 * lowerBeakRadius, 0, 0.8 * lowerBeakLength),
													new THREE.Vector3(0.4 * lowerBeakRadius, 0, lowerBeakLength)
												];

	var lowerBeakGeom = new THREE.LatheGeometry(lowerBeakPoints, 32, 0, -Math.PI);
	var lowerBeakMat = new THREE.MeshPhongMaterial({color: 0xffffff, ambient: 0xffffff});
	var lowerBeakMesh = new THREE.Mesh(lowerBeakGeom, lowerBeakMat);

	lowerBeakMesh.position.set(0, -lowerBeakRadius, 0.9 * this.headRadius);
	beakFrame.add(lowerBeakMesh);

	return beakFrame;
}

Penguin.prototype.makeBody = function () {
	var bodyFrame = new THREE.Object3D();

	var sphereGeom = new THREE.SphereGeometry(this.bodyRadius, 32, 32);
	var sphereMat = new THREE.MeshPhongMaterial({color: 0x000000, ambient: 0x000000});
	var sphereMesh = new THREE.Mesh(sphereGeom, sphereMat);
	sphereMesh.scale.y = this.bodyScale;
	bodyFrame.add(sphereMesh);

	var whiteGeom = new THREE.SphereGeometry(this.bodyRadius, 32, 32);
	var whiteMat = new THREE.MeshPhongMaterial({color: 0xffffff, ambient: 0xffffff});
	var whiteSphere = new THREE.Mesh(whiteGeom, whiteMat);
	whiteSphere.scale.set(0.8, this.bodyScale, 1.05);
	whiteSphere.position.set(0, 0, 0.1 * this.bodyRadius);
	bodyFrame.add(whiteSphere);

	this.leftWing = this.makeWing();
	this.rightWing = this.leftWing.clone();

	this.leftWing.position.set(0.7 * this.bodyRadius, 0.5 * this.bodyLength, 0);
	this.leftWing.rotation.z = Math.PI/6;
	bodyFrame.add(this.leftWing);

	this.rightWing.position.set(-0.7 * this.bodyRadius, 0.5 * this.bodyLength, 0);
	this.rightWing.rotation.z = -Math.PI/6;
	bodyFrame.add(this.rightWing);

	return bodyFrame;
}

Penguin.prototype.makeWing = function (side) {
	var wingFrame = new THREE.Object3D();

	var wingGeom = new THREE.SphereGeometry(this.wingRadius, 32, 32);
	var wingMat = new THREE.MeshPhongMaterial({color: 0x000000, ambient: 0x000000});
	var wingMesh = new THREE.Mesh(wingGeom, wingMat);

	wingMesh.scale.y = 0.5 * this.wingLength/this.wingRadius;
	wingMesh.scale.z = 0.1;
	wingMesh.position.y = -0.5 * this.wingLength;

	wingMesh.rotation.y = Math.PI/2;

	wingFrame.add(wingMesh);

	return wingFrame;
}

Penguin.prototype.makeFoot = function () {
	var footFrame = new THREE.Object3D();

	var legGeom = new THREE.CylinderGeometry(0.1 * this.footLength, 0.1 * this.footLength, this.footLength, 32, 32);
	var legMat = new THREE.MeshPhongMaterial({color: 0x000000, ambient: 0x000000});
	var legMesh = new THREE.Mesh(legGeom, legMat);

	legMesh.position.y = 0.5 * this.footLength;
	footFrame.add(legMesh);

	var toe = this.makeToe();
	footFrame.add(toe);

	var leftToe = toe.clone();
	leftToe.rotation.y = Math.PI/6;
	footFrame.add(leftToe);

	var rightToe = toe.clone();
	rightToe.rotation.y = -Math.PI/6;
	footFrame.add(rightToe);

	return footFrame;
}

Penguin.prototype.makeToe = function () {
	var toeFrame = new THREE.Object3D();

	var toeLength = 0.4 * this.footLength;
	var toeHeight = 0.2 * toeLength;
	var maxToeRadius = 0.15 * toeLength;

	var toePoints = [new THREE.Vector3(0, 0, 0),
										new THREE.Vector3(0, 0.5 * toeHeight, 0.25 * toeLength),
										new THREE.Vector3(0, toeHeight, 0.5 * toeLength),
										new THREE.Vector3(0, 0.5 * toeHeight, 0.75 * toeLength),
										new THREE.Vector3(0, 0, toeLength)
									];

	var toeCurve = new THREE.SplineCurve3(toePoints);

	var toeRadii = [0, maxToeRadius, 0];

	var toeGeom = new THREE.TubeRadialGeometry(toeCurve, 32, toeRadii, 16, false);
	var toeMat = new THREE.MeshPhongMaterial({color: 0x000000, ambient: 0x000000});
	var toeMesh = new THREE.Mesh(toeGeom, toeMat);

	toeFrame.add(toeMesh);

	return toeFrame;
}

Penguin.prototype.move = function (nextPosition, time, completeFcn) {
	var penguin = this;
	penguin.wingTime = 0.5 * time || 1000;
	penguin.legTime = 0.5 * time || 1000;
	penguin.moveTime = time || 2000;

	var wingRot = {z: Math.PI/6};

	//tween to flap wings up
	penguin.wingUpTween = new TWEEN.Tween(wingRot).to({z: Math.PI/3}, penguin.wingTime).onUpdate(function () {
		penguin.rightWing.rotation.z = -wingRot.z;
		penguin.leftWing.rotation.z = wingRot.z;
	}).onStop(function () {
		penguin.rightWing.rotation.z = -Math.PI/6;
		penguin.leftWing.rotation.z = Math.PI/6;
	});

	//tween to flap wings down
	penguin.wingDownTween = new TWEEN.Tween(wingRot).to({z: Math.PI/6}, penguin.wingTime).onUpdate(function () {
		penguin.rightWing.rotation.z = -wingRot.z;
		penguin.leftWing.rotation.z = wingRot.z;
	}).onStop(function () {
		penguin.rightWing.rotation.z = -Math.PI/6;
		penguin.leftWing.rotation.z = Math.PI/6;
	});

	//infinitely chain the wing up and wing down tweens
	penguin.wingUpTween.chain(penguin.wingDownTween);
	penguin.wingDownTween.chain(penguin.wingUpTween);

	var legRot = {x: 0};

	//initial tween to move left leg forward - in half the time since the wings are starting from 0 rotation
	penguin.legInitTween = new TWEEN.Tween(legRot).to({x: Math.PI/6}, 0.5 * penguin.legTime).onUpdate(function () {
		penguin.leftLeg.rotation.x = legRot.x;
		penguin.rightLeg.rotation.x = -legRot.x;
	}).onStop(function () {
		penguin.leftLeg.rotation.x = 0;
		penguin.rightLeg.rotation = 0;
	});

	//tween to move left leg forward
	penguin.legForwardTween = new TWEEN.Tween(legRot).to({x: Math.PI/6}, penguin.legTime).onUpdate(function () {
		penguin.leftLeg.rotation.x = legRot.x;
		penguin.rightLeg.rotation.x = -legRot.x;
	}).onStop(function () {
		penguin.leftLeg.rotation.x = 0;
		penguin.rightLeg.rotation = 0;
	});

	//tween to move left leg backward
	penguin.legBackwardTween = new TWEEN.Tween(legRot).to({x: -Math.PI/6}, penguin.legTime).onUpdate(function () {
		penguin.leftLeg.rotation.x = legRot.x;
		penguin.rightLeg.rotation.x = -legRot.x;
	}).onStop(function () {
		penguin.leftLeg.rotation.x = 0;
		penguin.rightLeg.rotation.x = 0;
	});

	//infinitely chain the leg forward and backward tweens, and chain the backward tween to the initial forward tween
	penguin.legForwardTween.chain(penguin.legBackwardTween);
	penguin.legBackwardTween.chain(penguin.legForwardTween);
	penguin.legInitTween.chain(penguin.legBackwardTween);

	//tween to move to the next position
	penguin.moveTween = new TWEEN.Tween(penguin.frame.position).to({x: nextPosition.x, y: nextPosition.y, z: nextPosition.z}, penguin.moveTime)
		.onStart(function () {
			penguin.frame.lookAt(nextPosition);
			penguin.wingUpTween.start();
			penguin.legInitTween.start();
		})
		.onComplete(function () {
			penguin.stopMoving();
			if (completeFcn) {
				completeFcn();
			}
		});

	penguin.moveTween.start();
}

Penguin.prototype.stopMoving = function () {
	if (this.moveTween) {
		this.moveTween.stop();
		this.wingUpTween.stop();
		this.wingDownTween.stop();
		this.legInitTween.stop();
		this.legForwardTween.stop();
		this.legBackwardTween.stop();
	}
}

