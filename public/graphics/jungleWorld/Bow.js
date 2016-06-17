var bowBrowns = [0x8b4513, 0x8b5742];
var bowReds = [0xdc143c, 0xb0171f, 0x8b0000];
var bowGrays = [0x828282, 0x555555, 0x363636];

/*
Bow()
Purpose: constructs a new Bow object
	the frame is a curved bow struct with an initially linear tube for the bowstring
	the bowstring can be animated to draw back and release
	the Bow also has an arrow attached to it, created using makeArrow()
	frame origin: center of the bowstring
	the bow extends along the negative z-axis by bowWidth, and along the positive and negative y-axes by half the bowHeight
Parameters:
	bowHeight (number): the height of the bow 
*/
function Bow (bowHeight) {
	this.maxVelocity = 450;
	this.maxCurvature = 130;

	this.frame = new THREE.Object3D();

	this.height = bowHeight;
	this.width = 0.25 * this.height;
	this.radius = 0.036 * this.height;
	this.stringRadiusF = 0.3;
	this.velocity = 0;

	var upperHalf = this.makeHalfBow();
	upperHalf.position.set(0, 0, -this.width);
	this.frame.add(upperHalf);

	var lowerHalf = upperHalf.clone();
	lowerHalf.position.set(0, 0, -this.width);
	lowerHalf.rotateZ(Math.PI);
	this.frame.add(lowerHalf);

	this.curvature = 0;
	this.stringImage = 0x000000;

	this.arrow = new Arrow(this);
	this.arrow.frame.position.set(this.getArrowX(), 0, this.getArrowZ());
	this.frame.add(this.arrow.frame);

	this.addBowstring();
}

/*
Bow.prototype.makeHalfBow()
Purpose: returns an Object3D containing half a bow
	creates half a bow using Bezier curves and TubeRadialGeometry
	origin: the bottom of the curve
	curves away from the y-axis, in the +y, +z quadrant of the x-y plane
*/
Bow.prototype.makeHalfBow = function () {
	var bowHeight = 0.5 * this.height;
	var bowPoints = [new THREE.Vector3(0, 0, 0),
										new THREE.Vector3(0, 0.25 * bowHeight, 0),
										new THREE.Vector3(0, 0.75 * bowHeight, this.width),
										new THREE.Vector3(0, bowHeight, this.width)];
	var bowCurve = new THREE.CubicBezierCurve3(bowPoints[0], bowPoints[1], bowPoints[2], bowPoints[3]);

	var bowRadii = [this.radius, this.stringRadiusF * this.radius];

	var bowGeom = new THREE.TubeRadialGeometry(bowCurve, 32, bowRadii, 16, false);
	var bowMat = speckledMaterial(bowGeom, bowReds);
	var bowMesh = new THREE.Mesh(bowGeom, bowMat);
	return bowMesh;
}

/*
Bow.prototype.addBowstring()
Purpose: removes the current bowstring from the Bow's frame
	and adds a new bowstring to the Bow's frame based on the Bow's new curvature
	used to adjust the curvature of the bowstring in drawing and releasing arrows
*/
Bow.prototype.addBowstring = function () {
	var stringRadius = this.stringRadiusF * this.radius;
	var stringLength = (0.5 - 0.05) * this.height - (-0.5 + 0.05) * this.height;
	this.frame.remove(this.frame.getObjectByName("string"));

	//create the string using two linear Spline curves
	var stringFrame = new THREE.Object3D();
	var stringPointsUpper = [new THREE.Vector3(0, stringLength, 0),
														new THREE.Vector3(this.getArrowX(), 0.5 * stringLength, this.curvature)]
	var stringCurveUpper = new THREE.SplineCurve3(stringPointsUpper);
	var stringGeomUpper = new THREE.TubeGeometry(stringCurveUpper, 32, stringRadius, 16, false);
	var stringMat = new THREE.MeshBasicMaterial({color: 0x000000});
	var stringUpper = new THREE.Mesh(stringGeomUpper, stringMat);
	stringFrame.add(stringUpper);

	var stringPointsLower = [new THREE.Vector3(0, 0, 0),
														new THREE.Vector3(this.getArrowX(), 0.5 * stringLength, this.curvature)]
	var stringCurveLower = new THREE.SplineCurve3(stringPointsLower);
	var stringGeomLower = new THREE.TubeGeometry(stringCurveLower, 32, stringRadius, 16, false);
	var stringLower = new THREE.Mesh(stringGeomLower, stringMat);
	stringFrame.add(stringLower);

	var join = this.makeLinearJoin(stringPointsUpper, stringPointsLower);
	stringFrame.add(join);

	//add the string to the bow's frame
	stringFrame.position.set(0, (-0.5 + 0.05) * this.height, 0);
	stringFrame.name = "string";
	this.frame.add(stringFrame);
}

/*
Bow.prototype.makeLinearJoin
Purpose: returns a mesh that is a curve to smoothly join two linear meshes
Parameters:
	points1: THREE.Vector3 array: contains the two points that define the curve of the first linear mesh
	points2: THREE.Vector3 array: contains the two points that define the curve of the second linear mesh
*/
Bow.prototype.makeLinearJoin = function (points1, points2) {
	//endpoints: last point of first curve, first point of second curve
  var r0 = points1[1];
  var r3 = points2[0];

  //middle points: point slightly beyond end of first curve, point slightly beyond first point of second curve
  var r1 = new THREE.SplineCurve3(points1).getPoint(1.01);
  var r2 = new THREE.SplineCurve3(points2).getPoint(0.01);

  //make the curve, geometry, and mesh
  var smoothCurve = new THREE.CubicBezierCurve3(r0, r1, r2, r3);
  var smoothGeom = new THREE.TubeGeometry(smoothCurve, 32, this.stringRadiusF * this.radius, 16, false);
  var smoothMesh = new THREE.Mesh(smoothGeom, new THREE.MeshBasicMaterial({color: 0x000000}));
  return smoothMesh;
}

/*
Bow.prototype.drawArrow()
Purpose: draws the arrow back all the way
	increases the curvature and velocity of the bow, up until their maximum values
	draws the arrow back all the way, all at once
	used in the mouse and swipe usage of archery training
*/
Bow.prototype.drawArrow = function () {
	var properties = {velocity: this.maxVelocity, curvature: this.maxCurvature};
	var bow = this;
	bow.drawTween = new TWEEN.Tween(bow).to(properties, 1000).onUpdate(function () {
		bow.arrow.frame.position.z = bow.curvature - bow.arrow.arrowLength;
		bow.addBowstring();
	}).easing(TWEEN.Easing.Quadratic.Out);
}

/*
Bow.prototype.reset()
Purpose: resets the bow back to its original state
*/
Bow.prototype.reset = function () {
	this.frame.remove(this.arrow.frame);

	//stop the tweens that are launching the arrow
	this.arrowLaunchTween.stop();
	this.stringTween.stop();

	//reset the curvature and velocity
	this.curvature = 0;
	this.velocity = 0;

	//reset the rotation so the bow is exactly back in its original state
	this.frame.rotation.x = 0;
	this.frame.rotation.y = 0;
	this.frame.rotation.z = 0;

	//reset the arrow rotation
	this.arrow.frame.rotation.x = 0;

	//reset the bowstring and arrow
	this.curvature = 0;
	this.addBowstring();

	this.arrow.frame.position.set(this.getArrowX(), 0, this.getArrowZ());
	this.frame.add(this.arrow.frame);
}

Bow.prototype.getArrowX = function () {
	return -(this.radius + this.arrow.headScaleX * this.arrow.headRadius);
}

Bow.prototype.getArrowZ = function () {
	return -this.arrow.arrowLength;
}

