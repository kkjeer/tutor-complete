function Trident (length) {
	this.length = length;
	this.staffLength = 0.75 * this.length;
	this.staffRadius = 0.01 * this.length;

	this.frame = new THREE.Object3D();
	this.material = new THREE.MeshPhongMaterial({color: 0xffff00, ambient: 0xffff00});

	this.innerFrame = new THREE.Object3D();

	var staff = this.makeStaff();
	this.innerFrame.add(staff);

	var middleProng = this.makeMiddleProng();
	middleProng.position.set(0, this.staffLength, 0);
	this.innerFrame.add(middleProng);

	var rightProng = this.makeSideProng();
	rightProng.position.set(0, this.staffLength, 0);
	this.innerFrame.add(rightProng);

	var leftProng = rightProng.clone();
	leftProng.scale.x = -1;
	this.innerFrame.add(leftProng);

	this.innerFrame.position.set(0, -this.length, 0);
	this.innerFrame.rotation.set(-Math.PI/4, 0, 0);
	this.frame.add(this.innerFrame);
}

//origin: bottom of cylinder
//extends up y-axis
Trident.prototype.makeStaff = function () {
	var staffFrame = new THREE.Object3D();

	var staffGeom = new THREE.CylinderGeometry(this.staffRadius, this.staffRadius, this.staffLength, 64, 64);
	var staff = new THREE.Mesh(staffGeom, this.material);

	staff.position.set(0, 0.5 * this.staffLength, 0);
	staffFrame.add(staff);

	return staffFrame;
}

Trident.prototype.makeMiddleProng = function () {
	var middleProngFrame = new THREE.Object3D();

	var middleLength = this.length - this.staffLength;
	var middleCylinLength = 0.8 * middleLength;
	var middleArrowLength = middleLength - middleCylinLength;

	var cylinderGeom = new THREE.CylinderGeometry(this.staffRadius, this.staffRadius, middleCylinLength, 64, 64);
	var cylinder = new THREE.Mesh(cylinderGeom, this.material);

	cylinder.position.set(0, 0.5 * middleCylinLength, 0);
	middleProngFrame.add(cylinder);

	var arrowGeom = new THREE.CylinderGeometry(0, this.staffRadius, middleArrowLength, 64, 64);
	var arrow = new THREE.Mesh(arrowGeom, this.material);
	arrow.scale.x = 2;

	arrow.position.set(0, middleCylinLength + 0.5 * middleArrowLength, 0);
	middleProngFrame.add(arrow);

	return middleProngFrame;
}

Trident.prototype.makeSideProng = function () {
	var sideProngFrame = new THREE.Object3D();

	var sideLength = this.length - this.staffLength;
	var sideCurveLength = 0.8 * sideLength;
	var sideArrowLength = sideLength - sideCurveLength;
	var sideWidth = 0.5 * sideLength;

	var points = [
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0.3 * sideWidth, 0.1 * sideCurveLength, 0),
		new THREE.Vector3(0.8 * sideWidth, 0.2 * sideCurveLength, 0),
		new THREE.Vector3(1.01 * sideWidth, 0.45 * sideCurveLength, 0),
		new THREE.Vector3(0.95 * sideWidth, 0.7 * sideCurveLength, 0),
		new THREE.Vector3(1.0 * sideWidth, sideCurveLength, 0)
	];
	var radii = [this.staffRadius];

	var curveGeom = new THREE.TubeRadialGeometry(new THREE.SplineCurve3(points), 64, radii, 32, false);
	var curve = new THREE.Mesh(curveGeom, this.material);
	sideProngFrame.add(curve);

	var arrowGeom = new THREE.CylinderGeometry(0, this.staffRadius, sideArrowLength, 64, 64);
	var arrow = new THREE.Mesh(arrowGeom, this.material);
	arrow.scale.x = 2;

	arrow.position.set(sideWidth, sideCurveLength + 0.5 * sideArrowLength, 0);
	sideProngFrame.add(arrow);

	return sideProngFrame;
}

Trident.prototype.drawBack = function (deltaZ, time, completeFcn) {
	var trident = this;
	trident.drawTime = time || 1000;

	trident.originalPosition = new THREE.Vector3().copy(trident.frame.position);
	trident.originalRotation = new THREE.Vector3().copy(trident.frame.rotation);

	var newPos = {x: trident.frame.position.x, y: trident.frame.position.y, z: trident.frame.position.z + deltaZ};

	trident.drawTween = new TWEEN.Tween(trident.frame.position).to(newPos, trident.drawTime).onComplete(function () {
		if (completeFcn) {
			completeFcn();
		}
	});

	trident.drawTween.start();
}

Trident.prototype.reset = function () {
	if (this.drawTween) {
		this.drawTween.stop();
	}

	this.frame.position.copy(this.originalPosition);
	this.frame.rotation.copy(this.originalRotation);
}

