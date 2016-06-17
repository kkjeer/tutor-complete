var tableBrowns = [0x8b4513, 0x8b5742];
var tableGrays = [0x828282, 0x555555, 0x363636];

function Table (tableHeight, numCylinders, name) {
	this.height = tableHeight;
	this.width = 1.82 * this.height;
	this.depth = 0.227 * this.height;
	this.numCylinders = numCylinders;
	this.name = name;

	this.frame = new THREE.Object3D();

	//add the table top
	this.tableTop = this.makeTableTop();
	this.frame.add(this.tableTop);

	//add the cylinders
	this.addCylinders();
}

Table.prototype.fall = function (berryDistance, completeFcn) {
	var table = this;
	var newTopPos = this.tableTop.position.clone();
	newTopPos.y -= this.height;
	table.topTween = new TWEEN.Tween(table.tableTop.position).to(newTopPos, 1000);

	var newBerryPos = this.berry.frame.position.clone();
	newBerryPos.y -= 0.5 * this.height;
	newBerryPos.z += berryDistance;
	table.berryTween = new TWEEN.Tween(table.berry.frame.position).to(newBerryPos, 1000).onStart(function () {
		table.topTween.start();
	}).onComplete(function () {
		if (completeFcn) {
			completeFcn();
		}
	}).start();
}

Table.prototype.makeTableTop = function () {
	var boxThickness = 0.15 * this.height;
	this.boxThickness = boxThickness;
	var tableGeom = new THREE.BoxGeometry(this.width, boxThickness, this.depth);
	var tableMat = new THREE.MeshPhongMaterial({color: tableBrowns[0], ambient: tableBrowns[0]});
	var tableMesh = new THREE.Mesh(tableGeom, tableMat);
	tableMesh.position.set(0, this.height, 0);
	tableMesh.name = 'tableSurface' + this.name;
	return tableMesh;
}

Table.prototype.flattenCylinder = function (i) {
	this.cylinders[i].rotateX(-Math.PI/2);
}

Table.prototype.redoCylinders = function (numCylinders) {
	for (var i = 0; i < this.numCylinders; i++) {
		this.frame.remove(this.cylinders[i]);
	}
	this.cylinders = [];
	this.numCylinders = numCylinders;
	this.addCylinders();
}

Table.prototype.addCylinders = function () {
	if (this.numCylinders % 2 == 1) {
		this.addOddCylinders();
	} else {
		this.addEvenCylinders();
	}
}

Table.prototype.addOddCylinders = function () {
	var cylinderFrame = this.makeCylinder();
	this.cylinders = [];

	var halfCylinders = Math.floor(this.numCylinders/2);
	if (halfCylinders % 2 == 0) {
		halfCylinders++;
	}

	var cylinderSpace = (0.5 * this.width - 2 * this.cylinderRadius)/halfCylinders;

	for (var i = 0; i < this.numCylinders; i++) {
		var sign = i % 2 == 0 ? 1 : -1;
		var index = Math.ceil(i/2);
		var cylinder = cylinderFrame.clone();
		cylinder.position.set(sign * index * cylinderSpace, 0, 0);
		cylinder.name = 'tableCylinder' + i + this.name;
		this.cylinders.push(cylinder);
		this.frame.add(cylinder);
	}
}

Table.prototype.addEvenCylinders = function () {
	var cylinderFrame = this.makeCylinder();
	this.cylinders = [];

	var cylinderSpace = (this.width - 2 * this.cylinderRadius)/this.numCylinders;

	for (var i = 1; i <= this.numCylinders; i++) {
		var sign = i % 2 == 0 ? 1 : -1;
		var index = Math.ceil(i/2);
		var cylinder = cylinderFrame.clone();
		cylinder.position.set(sign * index * cylinderSpace, 0, 0);
		cylinder.name = 'tableCylinder' + i + this.name;
		this.cylinders.push(cylinder);
		this.frame.add(cylinder);
	}
}

Table.prototype.makeCylinder = function () {
	this.cylinderRadius = 0.05 * this.width;
	this.cylinderHeight = 1.0 * this.height;

	//create the cylinder mesh
	var cylinderGeom = new THREE.CylinderGeometry(this.cylinderRadius, this.cylinderRadius, this.cylinderHeight, 16, 16);
	var cylinderMat = speckledMaterial(cylinderGeom, tableGrays);
	var cylinderMesh = new THREE.Mesh(cylinderGeom, cylinderMat);
	cylinderMesh.name = 'cylinderMesh' + this.name;

	//create the cylinder frame
	//origin: bottom center of the cylinder
	var cylinderFrame = new THREE.Object3D();
	cylinderMesh.position.set(0, 0.5 * this.cylinderHeight, 0);
	cylinderMesh.rotateY(Math.PI);
	cylinderFrame.add(cylinderMesh);

	return cylinderFrame;
}

Table.prototype.shrinkBerry = function () {
	this.redoBerry(0.9 * this.berryRadius);
}

Table.prototype.redoBerry = function (radius) {
	if (this.berry) {
		this.frame.remove(this.berry.frame);
	}

	this.berryRadius = radius;
	this.addBerry();
}

Table.prototype.addBerry = function () {
	this.berry = new Berry(this.berryRadius, 'blue');
	this.berry.frame.position.set(0, this.height + 0.5 * this.berryRadius + this.boxThickness, 0);
	this.frame.add(this.berry.frame);
}

Table.prototype.cylinderWorldPosition = function (index) {
	if (index >= this.cylinders.length) {
		return new THREE.Vector3(this.frame.position.x, this.frame.position.y + 0.5 * this.cylinderHeight, this.frame.position.z);
	}

	var framePos = this.frame.position;
	var localPos = this.cylinders[index].position;

	var x = framePos.x + localPos.x;
	var y = framePos.y + localPos.y + 0.5 * this.cylinderHeight;
	var z = framePos.z + localPos.z;

	return new THREE.Vector3(x, y, z);
}

