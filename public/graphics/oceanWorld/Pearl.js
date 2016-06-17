function Pearl (radius, color, name) {
	this.radius = radius;
	this.name = name || 'myPearl';

	this.colors = {
		purple: 0xe066ff,
		orange: 0xffc125,
		white: 0xffffff
	};
	this.color = this.colors[color] || this.colors['white'];
	this.material = new THREE.MeshPhongMaterial({color: this.color, ambient: this.color, 
																								transparent: true, opacity: 0.7, 
																								side: THREE.DoubleSide, shininess: 100, specular: 0xfffff00});

	this.frame = new THREE.Object3D();
	var ballGeom = new THREE.SphereGeometry(this.radius, 32, 32);
	this.ball = new THREE.Mesh(ballGeom, this.material);
	this.frame.add(this.ball);
}

Pearl.prototype.move = function (nextPosition, time, completeFcn) {
	var pearl = this;

	pearl.moveTime = time || 2000;

	pearl.moveTween = new TWEEN.Tween(pearl.frame.position).to({x: nextPosition.x, y: nextPosition.y, z: nextPosition.z}, pearl.moveTime)
		.onComplete(function () {
			pearl.stopMoving();
			if (completeFcn) {
				completeFcn();
			}
		});

	pearl.moveTween.start();
}

Pearl.prototype.stopMoving = function () {
	if (this.moveTween) {
		this.moveTween.stop();
	}
}