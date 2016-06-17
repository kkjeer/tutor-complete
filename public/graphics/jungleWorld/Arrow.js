var arrowBrowns = [0x8b4513, 0x8b5742];
var arrowReds = [0xdc143c, 0xb0171f, 0x8b0000];
var arrowGrays = [0x828282, 0x555555, 0x363636];

//origin: center of the head
//extends up the positive z-axis
function Arrow (bow) {
	this.frame = new THREE.Object3D();

	//set the arrow length in terms of the bow width
	this.arrowLength = 2 * bow.width;

	//set the arrow shaft radius in terms of the bow radius
	this.shaftRadius = 0.5 * bow.radius;

	//the shaft - a cylinder
	var shaft = this.makeShaft();
	shaft.position.set(0, 0, this.arrowLength);
	this.frame.add(shaft);

	//the head - a cone
	this.headLength = 0.25 * this.arrowLength;
	this.headRadius = 2.5 * this.shaftRadius;
	var head = this.makeHead();
	head.position.set(0, 0, 0 * -this.arrowLength);
	this.frame.add(head);

	//the feathers
	this.addFeathers();

	this.frame.name = "arrow";
}

Arrow.prototype.makeHead = function () {
	var headGeom = new THREE.CylinderGeometry(0, this.headRadius, this.headLength, 6, 16, false);
	var headMat = speckledMaterial(headGeom, arrowGrays);
	var head = new THREE.Mesh(headGeom, headMat);
	this.headScaleX = 0.85;
	head.scale.x = this.headScaleX;
	head.rotateX(-Math.PI/2);
	return head;
}

Arrow.prototype.makeShaft = function () {
	var shaftFrame = new THREE.Object3D();
	var shaftGeom = new THREE.CylinderGeometry(this.shaftRadius, this.shaftRadius, this.arrowLength, 16, 16, false);
	var shaftMat = new THREE.MeshBasicMaterial({color: 0x000000});
	var shaft = new THREE.Mesh(shaftGeom, shaftMat);
	shaft.position.y = 0.5 * this.arrowLength;
	shaftFrame.add(shaft);
	shaftFrame.rotateX(-Math.PI/2);
	return shaftFrame;
}

Arrow.prototype.addFeathers = function () {
	this.featherLength = 0.25 * this.arrowLength;
	this.featherWidth = 0.3 * this.featherLength;
	this.featherSlope = 0.5;
	this.featherCurvature = 0.5 * this.featherWidth;

	var leftFeather = this.makeFeather();
	leftFeather.position.set(-(this.featherWidth + this.shaftRadius), 0, this.arrowLength);
	this.frame.add(leftFeather);

	var rightFeather = leftFeather.clone();
	rightFeather.position.set(this.featherWidth + this.shaftRadius, 0, this.arrowLength);
	rightFeather.rotateZ(Math.PI);
	this.frame.add(rightFeather);

	var topFeather = leftFeather.clone();
	topFeather.position.set(0, this.featherWidth + this.shaftRadius, this.arrowLength);
	topFeather.rotateZ(-Math.PI/2);
	this.frame.add(topFeather);

	var bottomFeather = leftFeather.clone();
	bottomFeather.position.set(0, -(this.featherWidth + this.shaftRadius), this.arrowLength);
	bottomFeather.rotateZ(Math.PI/2);
	this.frame.add(bottomFeather);
}

/*
makeFeather()
Purpose: returns an Object3D containing a slanted plane used for each feather of an arrow
	origin: bottom left corner
	extends down the negative z-axis and up the positive x-axis
Parameters:
	arrow (object): the arrow to add the feather to
*/
Arrow.prototype.makeFeather = function () {
	var frame = new THREE.Object3D();

	var length = this.featherLength;
	var width = this.featherWidth;
	var slope = this.featherSlope;
	var curvature = this.featherCurvature;

	var featherPoints = [
		//bottom row
		[[0, 0, 0], 
			[0.25 * width, 0, -slope * 0.25*width], 
			[0.75 * width, 0, -slope * 0.75*width], 
			[width, 0, -slope * width]],

		//second from bottom row
		[[0, 0, -0.25 * length], 
			[0.25 * width, curvature, -(slope * 0.25 * width + 0.25 * length)], 
			[0.75 * width, curvature, -(slope * 0.75 * width + 0.25 * length)], 
			[width, 0, -(slope * width + 0.25 * length)]],

		//second from top row
		[[0, 0, -0.75 * length], 
			[0.25 * width, -curvature, -(slope * 0.25 * width + 0.75 * length)], 
			[0.75 * width, -curvature, -(slope * 0.75 * width + 0.75 * length)], 
			[width, 0, -(slope * width + 0.75 * length)]],

		//top row
		[[0, 0, -length], 
			[0.25 * width, 0, -(slope * 0.25 * width + length)], 
			[0.75 * width, 0, -(slope * 0.75 * width + length)], 
			[width, 0, -(slope * width + length)]]
	];
	var featherGeom = new THREE.BezierSurfaceGeometry(featherPoints, 20, 20);
	var featherMat = new THREE.MeshBasicMaterial({color: arrowBrowns[0]});
	var feather = new THREE.Mesh(featherGeom, featherMat);
	frame.add(feather);

	return frame;
}