var possibleStrandColors = [0x000080, 0x4169e1, 0x1e90ff, 0x006400, 0x228b22, 0x00ee76];

function Net (netWidth, netHeight, numColors, name) {
	this.width = netWidth;
	this.height = netHeight;
	this.strandThickness = 0.05 * this.width;

	this.numStrands = 6;
	this.strandSpacing = this.width/(this.numStrands - 1);
	this.numColors = numColors;
	this.name = name || 'myNet';

	this.frame = new THREE.Object3D();
	this.strands = [];
	this.addFrontStrands();
	this.addBackStrands();
}

Net.prototype.fall = function (strandColorIndex, pearlDistance, completeFcn) {
	this.destroyColoredStrands(strandColorIndex);

	var net = this;
	var nextPearlPos = {x: net.pearl.frame.position.x, y: net.pearl.frame.position.y, z: net.pearl.frame.position.z + pearlDistance};
	var pearlTween = new TWEEN.Tween(net.pearl.frame.position).to(nextPearlPos, 2000).onComplete(function () {
		if (completeFcn) {
			completeFcn();
		}
	});

	pearlTween.start();
}

Net.prototype.destroyColoredStrands = function (strandColorIndex) {
	if (strandColorIndex < 0 || strandColorIndex >= possibleStrandColors.length) {
		return;
	}

	var front = this.frontStrands[possibleStrandColors[strandColorIndex]];
	var back = this.backStrands[possibleStrandColors[strandColorIndex]];

	if (!front || !back) {
		return;
	}

	for (var i = 0; i < front.length; i++) {
		this.destroyOneStrand(front[i]);
	}
	for (var j = 0; j < back.length; j++) {
		this.destroyOneStrand(back[j]);
	}
}

Net.prototype.destroyOneStrand = function (strand) {
	var bottomY = -0.75 * this.height;
	var nextPos = {x: strand.position.x, y: bottomY, z: strand.position.z};
	var nextRot = {x: strand.rotation.x, y: strand.rotation.y, z: Math.PI/2};
	var time = 2000;

	var strandRotTween = new TWEEN.Tween(strand.rotation).to(nextRot, time);

	var strandPosTween = new TWEEN.Tween(strand.position).to(nextPos, time).onStart(function () {
		strandRotTween.start();
	});

	strandPosTween.start();
}

Net.prototype.redoStrands = function (numColors) {
	//using this.strands
	for (var i = 0; i < this.numStrands * 2; i++) {
		this.frame.remove(this.strands[i]);
	}

	//if not using this.strands
	for (var i = 0; i < possibleStrandColors.length; i++) {
		// var front = this.frontStrands[possibleStrandColors[i]];
		// var back = this.backStrands[possibleStrandColors[i]]
		// for (var j = 0; j < front.length; j++) {
		// 	if (front[j]) {
		// 		this.frame.remove(front[j]);
		// 	}
		// }
		// for (var k = 0; k < back.length; k++) {
		// 	if (back[k]) {
		// 		this.frame.remove(back[k]);
		// 	}
		// }
	}

	this.strands = [];
	this.numColors = numColors;
	this.addFrontStrands();
	this.addBackStrands();
}

Net.prototype.addFrontStrands = function () {
	this.frontStrands = {};
	for (var c = 0; c < possibleStrandColors.length; c++) {
		this.frontStrands[possibleStrandColors[c]] = [];
	}

	for (var i = 0; i < this.numStrands; i++) {
		var colorIndex = i % this.numColors;
		var color = possibleStrandColors[colorIndex];
		var strand = this.makeStrand(color, this.width);
		strand.position.set(0, 0.5 * this.height - i * this.strandSpacing, 2 * this.strandThickness);
		strand.rotateZ(Math.PI/2);
		this.frame.add(strand);
		this.frontStrands[color].push(strand);
		this.strands.push(strand);
	}
}

Net.prototype.addBackStrands = function () {
	this.backStrands = {};
	for (var c = 0; c < possibleStrandColors.length; c++) {
		this.backStrands[possibleStrandColors[c]] = [];
	}

	for (var i = 0; i < this.numStrands; i++) {
		var colorIndex = i % this.numColors;
		var color = possibleStrandColors[colorIndex];
		var strand = this.makeStrand(color, this.width);
		strand.position.set(-0.5 * this.width + i * this.strandSpacing, 0, 0);
		this.frame.add(strand);
		this.backStrands[color].push(strand);
		this.strands.push(strand);
	}
}

Net.prototype.addBackStrands2 = function () {
	this.backStrands = [];
	var bStrand = this.makeStrand(0x0000ff, this.height);
	bStrand.position.set(-0.5 * this.width, 0, 0);
	this.frame.add(bStrand);
	this.backStrands.push(bStrand);

	for (var i = 1; i < this.numStrands; i++) {
		var backStrand = bStrand.clone();
		backStrand.position.set(-0.5 * this.width + i * this.strandSpacing, 0, 0);
		this.frame.add(backStrand);
		this.backStrands.push(backStrand);
	}
}

//origin: center of strand
//extends along positive and negative y-axis
Net.prototype.makeStrand = function (strandColor, strandLength) {
	var strandFrame = new THREE.Object3D();
	strandFrame.name = 'strandFrame' + strandColor + this.name;

	//set up the points:
  var points = [];
  var numStrandPoints = 8;
  var strandCurvature = 0.02 * strandLength;

  //the first point is at the origin of the strand
  points.push(new THREE.Vector3(0, 0, 0));

  //the middle points alternate in the x dimension to create the wiggle curve
  for (var i = 1; i < numStrandPoints; i++) {
    var y = ((2 * i + 1) * strandLength)/(2 * numStrandPoints);
    var sign = (i % 2 == 1) ? 1 : -1;
    points.push(new THREE.Vector3(sign * strandCurvature, y, 0));
  }

  //the last point is at the top of the strand
  points.push(new THREE.Vector3(0, strandLength, 0));

  //create the strand using a tube
  var tubeGeometry = new THREE.TubeGeometry(new THREE.SplineCurve3(points), 64, 0.5 * this.strandThickness, 64, false);
  var mat = new THREE.MeshPhongMaterial({color: strandColor, ambient: strandColor});
  var strand = new THREE.Mesh(tubeGeometry, mat);
  strand.name = 'strand' + strandColor + this.name;

  strand.position.set(0, -0.5 * strandLength, 0);
  strandFrame.add(strand);
	
	return strandFrame;
}

Net.prototype.shrinkPearl = function () {
	this.redoPearl(0.9 * this.pearlRadius);
}

Net.prototype.redoPearl = function (pearlRadius) {
	if (this.pearl) {
		this.frame.remove(this.pearl.frame);
	}

	this.pearlRadius = pearlRadius;
	this.addPearl();
}

Net.prototype.addPearl = function () {
	this.pearl = new Pearl(this.pearlRadius, 'white');
	this.pearl.frame.position.set(0, 0, -2 * this.strandThickness);
	this.frame.add(this.pearl.frame);
}

Net.prototype.strandWorldPosition = function (strandColorIndex) {
	var strand = this.frontStrands[possibleStrandColors[strandColorIndex]][0];
	if (!strand) {
		return this.frame.position;
	}

	var framePos = this.frame.position;
	var strandPos = strand.position;
	return new THREE.Vector3(framePos.x + strandPos.x, framePos.y + strandPos.y, framePos.z + strandPos.z);
}