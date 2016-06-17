function Spear (length, name) {
	//lengths
	this.length = length;
	console.log('this.length: ', this.length);
	this.shaftLength = 0.8 * this.length;
	this.headLength = this.length - this.shaftLength;

	//radii
	this.shaftRadius = 0.025 * this.length;
	this.headRadius = 1.5 * this.shaftRadius;

	//name
	this.name = name || 'mySpear';

	//colors
	this.brown = 0x8b4513;
	this.grays = [0x828282, 0x555555, 0x363636];

	//frame
	this.frame = new THREE.Object3D();
	this.frame.name = 'spearFrame' + this.name;

	this.innerFrame = new THREE.Object3D();
	this.innerFrame.name = 'spearInnerFrame' + this.name;

	//shaft
	this.shaft = this.makeShaft();
	this.innerFrame.add(this.shaft);

	//head
	this.head = this.makeHead();
	this.head.position.set(0, this.shaftLength, 0);
	this.innerFrame.add(this.head);

	this.innerFrame.position.set(0, -this.length, 0);
	this.innerFrame.rotation.set(-Math.PI/4, 0, 0);
	this.frame.add(this.innerFrame);
}

//origin: bottom of cylinder
//extends up y-axis
Spear.prototype.makeShaft = function () {
	var shaftFrame = new THREE.Object3D();
	shaftFrame.name = 'spearShaftFrame' + this.name;

	var shaftGeom = new THREE.CylinderGeometry(this.shaftRadius, this.shaftRadius, this.shaftLength, 32, 128);
	var shaftMat = new THREE.MeshPhongMaterial({color: this.brown, ambient: this.brown});
	var shaft = new THREE.Mesh(shaftGeom, shaftMat);
	shaft.name = 'spearShaft' + this.name;

	shaft.position.set(0, 0.5 * this.shaftLength, 0);
	shaftFrame.add(shaft);

	return shaftFrame;
}

//origin: bottom of cylinder
//extends up y-axis (comes to a point on top)
Spear.prototype.makeHead = function () {
	var headFrame = new THREE.Object3D();
	headFrame.name = 'spearHeadFrame' + this.name;

	var headGeom = new THREE.CylinderGeometry(0, this.headRadius, this.headLength, 32, 128);
	var headMat = speckledMaterial(headGeom, this.grays);
	var head = new THREE.Mesh(headGeom, headMat);
	head.name = 'spearHead' + this.name;

	head.scale.z = this.shaftRadius/this.headRadius;
	head.position.set(0, 0.5 * this.headLength, 0);
	head.rotateY(Math.PI);
	headFrame.add(head);

	return headFrame;
}

Spear.prototype.drawBack = function (deltaZ, time, completeFcn) {
	var spear = this;
	spear.drawTime = time || 1000;

	spear.originalPosition = new THREE.Vector3().copy(spear.frame.position);
	spear.originalRotation = new THREE.Vector3().copy(spear.frame.rotation);

	var newPos = {x: spear.frame.position.x, y: spear.frame.position.y, z: spear.frame.position.z + deltaZ};

	spear.drawTween = new TWEEN.Tween(spear.frame.position).to(newPos, spear.drawTime).onComplete(function () {
		if (completeFcn) {
			completeFcn();
		}
	});

	spear.drawTween.start();
}

Spear.prototype.reset = function () {
	if (this.drawTween) {
		this.drawTween.stop();
	}

	this.frame.position.copy(this.originalPosition);
	this.frame.rotation.copy(this.originalRotation);
}