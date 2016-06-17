function Fish (length, width, height, name) {
	this.length = length;
	this.width = width;
	this.height = height;
	this.radius = 0.5 * this.height;
	this.name = name || 'myFish';

	this.bodyColors = [0x0000ff, 0x1e90ff];
	this.finColors = [0xffff00, 0xffd700];

	this.frame = new THREE.Object3D();
	this.innerFrame = new THREE.Object3D();

	this.body = this.makeBody();
	this.innerFrame.add(this.body);

	this.addEyes();
	this.addSideFins();
	this.addTail();
	this.addTopFins();

	this.innerFrame.rotation.y = Math.PI;
	this.frame.add(this.innerFrame);
}

Fish.prototype.addEyes = function () {
	var leftEye = this.makeEye(-1);
	var rightEye = this.makeEye(1);
	this.innerFrame.add(leftEye);
	this.innerFrame.add(rightEye);
}

Fish.prototype.addSideFins = function () {
	var sideWidth = 0.35 * this.length;
	var sideHeight = 0.3 * this.height;
	this.leftFin = this.makeSideFin(-1, sideWidth, sideHeight);
	this.rightFin = this.makeSideFin(1, sideWidth, sideHeight);
	this.leftFin.position.set(-0.5 * this.width, 0, 0);
	this.rightFin.position.set(0.5 * this.width, 0, 0);
	this.innerFrame.add(this.leftFin);
	this.innerFrame.add(this.rightFin);
}

Fish.prototype.addTail = function () {
	var tailWidth = 0.4 * this.length;
	var tailHeight = 0.7 * this.height;
	this.tail = this.makeSideFin(0.1, tailWidth, tailHeight);
	this.tail.position.set(0, 0, 0.5 * this.length);
	this.innerFrame.add(this.tail);
}

Fish.prototype.addTopFins = function () {
	this.topFin = this.makeTopFin();
	this.topFin.position.set(0, 0.3 * this.height, 0);
	this.innerFrame.add(this.topFin);

	// this.bottomFin = this.makeTopFin();
	// this.bottomFin.position.set(0, -0.3 * this.height, 0);
	// this.innerFrame.add(this.bottomFin);
}

Fish.prototype.makeBody = function () {
	var bodyFrame = new THREE.Object3D();
	bodyFrame.name = 'fishBodyFrame' + this.name;

	var bodyGeom = new THREE.SphereGeometry(this.radius, 32, 32);
	var bodyMat = speckledMaterial(bodyGeom, this.bodyColors);
	var body = new THREE.Mesh(bodyGeom, bodyMat);
	body.name + 'fishBody' + this.name;

	body.scale.z = this.length/this.height;
	body.scale.x = this.width/this.height;
	bodyFrame.add(body);

	return bodyFrame;
}

Fish.prototype.makeEye = function (side) {
	var eyeFrame = new THREE.Object3D();
	eyeFrame.name = 'fishEyeFrame' + this.name;

	this.eyeRadius = 0.1 * this.radius;

	var eyeGeom = new THREE.SphereGeometry(this.eyeRadius, 32, 32);
	var eyeMat = new THREE.MeshPhongMaterial({color: 0x000000, ambient: 0x000000});
	var eye = new THREE.Mesh(eyeGeom, eyeMat);
	eye.name = 'fishEye' + this.name;

	eye.position.set(0, 0, -0.43 * this.length);
	eyeFrame.rotation.y = 0.2 * side * Math.PI/2;
	eyeFrame.add(eye);

	return eyeFrame;
}

Fish.prototype.makeSideFin = function (finRot, finWidth, finHeight) {
	var finFrame = new THREE.Object3D();
	finFrame.name = 'fishFinFrame' + this.name;

	var finPoints = [
		//bottom row
		[[0, -0.15 * finHeight, 0.1 * finWidth],
		 [0, -0.3 * finHeight, 0.25 * finWidth],
		 [0, -0.5 * finHeight, 0.5 * finWidth],
		 [0, -0.4 * finHeight, 0.75 * finWidth]],

		//second from bottom row
		[[0, -0.2 * finHeight, 0],
		 [finRot * 0.2 * finWidth, -0.2 * finHeight, 0.25 * finWidth],
		 [finRot * 0.2 * finWidth, -0.3 * finHeight, 0.75 * finWidth],
		 [0, -0.35 * finHeight, 0.95 * finWidth]],

		//second from top row
		[[0, 0.15 * finHeight, 0],
		 [-finRot * 0.2 * finWidth, 0.2 * finHeight, 0.25 * finWidth],
		 [-finRot * 0.2 * finWidth, 0.25 * finHeight, 0.75 * finWidth],
		 [0, 0.225 * finHeight, 0.9 * finWidth]],

		//top row
		[[0, 0.4 * finHeight, 0.1 * finWidth],
		 [0, 0.7 * finHeight, 0.25 * finWidth],
		 [0, 0.8 * finHeight, 0.5 * finWidth],
		 [0, 0.7 * finHeight, 0.75 * finWidth]]
	];

	var finGeom = new THREE.BezierSurfaceGeometry(finPoints, 20, 20);
	var finMat = speckledMaterial(finGeom, this.finColors);
	finMat.side = THREE.DoubleSide;
	var fin = new THREE.Mesh(finGeom, finMat);
	fin.name = 'fishFin' + this.name;

	fin.rotation.y = 0.2 * finRot * Math.PI/2;
	finFrame.add(fin);

	return finFrame;
}

Fish.prototype.makeTopFin = function () {
	var topFrame = new THREE.Object3D();
	topFrame.name = 'fishTopFinFrame' + this.name;

	var topLength = 0.8 * this.length;
	var topHeight = 0.5 * this.height;

	var topGeom = new THREE.CircleGeometry(0.5 * topHeight, 32, 32);
	var topMat = speckledMaterial(topGeom, this.finColors);
	topMat.side = THREE.DoubleSide;
	var top = new THREE.Mesh(topGeom, topMat);
	top.name = 'fishTopFin' + this.name;

	top.scale.x = topLength/(topHeight);
	top.rotation.y = Math.PI/2;

	topFrame.add(top);

	return topFrame;
}

Fish.prototype.move = function (nextPosition, time, completeFcn) {
	var fish = this;
	fish.finTime = 0.5 * time || 1000;
	fish.moveTime = time || 2000;

	var finRot = {y: 0.1 * Math.PI};

	fish.finOutTween = new TWEEN.Tween(finRot).to({y: 0.7 * Math.PI}, fish.finTime).onUpdate(function () {
		fish.rightFin.rotation.y = finRot.y;
		fish.leftFin.rotation.y = -finRot.y;
		fish.tail.rotation.y = 0.5 * (finRot.y - 0.4 * Math.PI);
	}).onStop(function () {
		fish.rightFin.rotation.y = 0;
		fish.leftFin.rotation.y = 0;
		fish.tail.rotation.y = 0;
	});

	fish.finInTween = new TWEEN.Tween(finRot).to({y: 0.1 * Math.PI}, fish.finTime).onUpdate(function () {
		fish.rightFin.rotation.y = finRot.y;
		fish.leftFin.rotation.y = -finRot.y;
		fish.tail.rotation.y = 0.5 * (finRot.y - 0.4 * Math.PI);
	}).onStop(function () {
		fish.rightFin.rotation.y = 0;
		fish.leftFin.rotation.y = 0;
		fish.tail.rotation.y = 0;
	});

	fish.finOutTween.chain(fish.finInTween);
	fish.finInTween.chain(fish.finOutTween);

	fish.moveTween = new TWEEN.Tween(fish.frame.position).to({x: nextPosition.x, y: nextPosition.y, z: nextPosition.z}, fish.moveTime)
		.onStart(function () {
			fish.frame.lookAt(nextPosition);
			fish.finOutTween.start();
		}).onComplete(function () {
			fish.stopMoving();
			if (completeFcn) {
				completeFcn();
			}
		});

	fish.moveTween.start();
}

Fish.prototype.stopMoving = function () {
	if (this.moveTween) {
		this.moveTween.stop();
		this.finOutTween.stop();
		this.finInTween.stop();
	}
}

