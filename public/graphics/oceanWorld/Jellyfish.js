function Jellyfish (radius, length, color, name) {
	this.radius = radius;
	this.length = length;
	this.squiggleLength = this.length - this.radius;
	this.name = name || 'myJellyfish';

	this.colors = {
		purple: 0xe066ff,
		orange: 0xffc125,
		green: 0x00fa9a
	};
	this.color = this.colors[color] || this.colors['green'];
	this.material = new THREE.MeshPhongMaterial({color: this.color, ambient: this.color, transparent: true, opacity: 0.5, side: THREE.DoubleSide});

	this.frame = new THREE.Object3D();
	this.innerFrame = new THREE.Object3D();

	this.body = this.makeBody();
	this.innerFrame.add(this.body);

	this.addSquiggles();

	this.innerFrame.rotateX(0.4 * Math.PI);
	this.frame.add(this.innerFrame);
}

Jellyfish.prototype.addSquiggles = function () {
	this.squiggles = [];

	this.squigglePositions = [
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(-0.5 * this.radius, -0.1 * this.radius, 0.3 * this.radius),
		new THREE.Vector3(0.2 * this.radius, -0.05 * this.radius, -0.4 * this.radius),
		new THREE.Vector3(0.6 * this.radius, 0, 0.1 * this.radius),
		new THREE.Vector3(-0.3 * this.radius, -0.05 * this.radius, -0.7 * this.radius)
	];

	for (var i in this.squigglePositions) {
		var squiggle = this.makeSquiggle();
		squiggle.position.copy(this.squigglePositions[i]);
		this.innerFrame.add(squiggle);
		this.squiggles.push(squiggle);
	}
}

Jellyfish.prototype.makeBody = function () {
	var bodyFrame = new THREE.Object3D();
	bodyFrame.name = 'jellyfishBodyFrame' + this.name;

	var bodyGeom = new THREE.SphereGeometry(this.radius, 32, 32, 0, 2 * Math.PI, 0, 0.6 * Math.PI);
	var body = new THREE.Mesh(bodyGeom, this.material);
	body.name = 'jellyfishBody' + this.name;

	bodyFrame.add(body);

	return bodyFrame;
}

Jellyfish.prototype.makeSquiggle = function () {
	var squiggleFrame = new THREE.Object3D();
	squiggleFrame.name = 'jellyfishSquiggleFrame' + this.name;

	var sLength = randomInRange(0.8, 1.2) * this.squiggleLength;
	var sCurvature = 0.05 * sLength;
	var numPoints = Math.floor(randomInRange(6, 8));
	var sRadius = 0.1 * this.radius;
	var sign = Math.random() < 0.5 ? -1 : 1;

  var points = [];
  points.push(new THREE.Vector3(0, 0, 0));
  for (var i = 1; i < numPoints; i++) {
    var y = -((2 * i + 1) * sLength)/(2 * numPoints);
    if (i % 2 == 1) {
      points.push(new THREE.Vector3(sign * sCurvature, y, 0));
    } else {
      points.push(new THREE.Vector3(-sign * sCurvature, y, 0));
    }
  }
  points.push(new THREE.Vector3(0, -sLength, 0));

  var squiggleGeom = new THREE.TubeGeometry(new THREE.SplineCurve3(points), 64, sRadius, 64, false);
  var squiggle = new THREE.Mesh(squiggleGeom, this.material);

  squiggleFrame.add(squiggle);

	return squiggleFrame;
}

Jellyfish.prototype.move = function (nextPosition, time, completeFcn) {
	var jellyfish = this;
	jellyfish.coilTime = 0.25 * time || 1000;
	jellyfish.moveTime = time || 4000;

	var slitherScale = {y: 1};

	jellyfish.contractTween = new TWEEN.Tween(slitherScale).to({y: 0.7}, jellyfish.coilTime).onUpdate(function () {
		for (var i in jellyfish.squiggles) {
			jellyfish.squiggles[i].scale.y = slitherScale.y;
		}
	}).onStop(function () {
		for (var i in jellyfish.squiggles) {
			jellyfish.squiggles[i].scale.y = 1;
		}
	});

	jellyfish.expandTween = new TWEEN.Tween(slitherScale).to({y: 1}, jellyfish.coilTime).onUpdate(function () {
		for (var i in jellyfish.squiggles) {
			jellyfish.squiggles[i].scale.y = slitherScale.y;
		}
	}).onStop(function () {
		for (var i in jellyfish.squiggles) {
			jellyfish.squiggles[i].scale.y = 1;
		}
	});

	jellyfish.contractTween.chain(jellyfish.expandTween);
	jellyfish.expandTween.chain(jellyfish.contractTween);

	jellyfish.moveTween = new TWEEN.Tween(jellyfish.frame.position).to({x: nextPosition.x, y: nextPosition.y, z: nextPosition.z}, jellyfish.moveTime)
		.onStart(function () {
			jellyfish.frame.lookAt(nextPosition);
			jellyfish.contractTween.start();
		}).onComplete(function () {
			jellyfish.stopMoving();
			if (completeFcn) {
				completeFcn();
			}
		});

	jellyfish.moveTween.start();
}

Jellyfish.prototype.stopMoving = function () {
	if (this.moveTween) {
		this.moveTween.stop();
		this.contractTween.stop();
		this.expandTween.stop();
	}
}