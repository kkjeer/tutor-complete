function Iceberg (size, color, name, index) {
	//size
	this.size = size;
	this.height = randomInRange(0.9, 1.0) * this.size;
	this.width = randomInRange(0.9, 1.0) * this.size;
	this.depth = randomInRange(0.9, 1.0) * this.size;

	//other parameters
	this.color = color;
	this.name = name || 'myIceberg';
	this.index = parseInt(index) + 1;

	//frame
	this.frame = new THREE.Object3D();
	this.frame.name = 'icebergFrame' + this.name;

	//body
	this.body = this.makeBody();
	this.frame.add(this.body);

	if (this.index) {
		this.number = this.makeNumber();
		this.number.position.set(-0.25 * this.width, 0.5 * this.height, 0.25 * this.depth);
		this.number.rotateX(-Math.PI/2);
		this.frame.add(this.number);
	}
}

Iceberg.prototype.makeBody = function () {
	var bodyFrame = new THREE.Object3D();
	bodyFrame.name = 'icebergBodyFrame' + this.name;

	var geom = new THREE.BoxGeometry(this.width, this.height, this.depth);
	var mat = new THREE.MeshPhongMaterial({color: this.color, ambient: this.color, transparent: true, opacity: 0.7, side: THREE.DoubleSide});
	var mesh = new THREE.Mesh(geom, mat);
	mesh.name = 'icebergBody' + this.name;

	bodyFrame.add(mesh);

	return bodyFrame;
}

Iceberg.prototype.makeNumber = function () {
	var options = {
    size: 0.5 * this.size,
    height: 8,
    weight: 'normal',
    font: 'helvetiker',
    style: 'normal',
    bevelThickness: 1,
    bevelSize: 1,
    bevelSegments: 3,
    bevelEnabled: true,
    curveSegments: 12,
    steps: 1
  };
  var geom = new THREE.TextGeometry(this.index, options);

  var mat = new THREE.MeshBasicMaterial({color: 0x0000ff});
  var mesh = new THREE.Mesh(geom, mat);
  mesh.name = 'icebergNumber' + this.name;

  return mesh;
}

Iceberg.prototype.highlight = function (color) {
	this.body.children[0].material.color = new THREE.Color(color);
	this.body.children[0].material.ambient = new THREE.Color(color);
}

Iceberg.prototype.unhighlight = function () {
	this.highlight(this.color);
}

