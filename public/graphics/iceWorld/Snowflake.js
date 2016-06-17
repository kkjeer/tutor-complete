function Snowflake (size, color) {
	//from parameters
	this.size = size;
	this.color = color || 'white';

	this.colorRanges = {
		white: {
			red: [0.5, 1.0],
			green: [0.5, 1.0],
			blue: [1.0, 1.0]
		},
		purple: {
			red: [0.75, 1.0],
			green: [0.0, 0.35],
			blue: [0.8, 1.0]
		},
		orange: {
			red: [0.75, 1.0],
			green: [0.25, 0.5],
			blue: [0.0, 0.0]
		},
		blue: {
			red: [0.0, 0.6],
			green: [0.4, 0.8],
			blue: [0.75, 1.0]
		},
		green: {
			red: [0.0, 0.1],
			green: [0.75, 1.0],
			blue: [0.5, 0.75]
		}
	}

	//set up geometry and material
	var geometry = new THREE.BufferGeometry();
	this.material = new THREE.LineBasicMaterial({vertexColors: THREE.VertexColors, linewidth: 0.2 * this.size});

	//geometry attributes
	this.positions = [];
	this.next_positions_index = 0;
	this.colors = [];
	this.indices_array = [];

	//iteration_count controls the 'granularity' of the snowflake - 3 or 4 is good
	this.iteration_count = 4;
	this.rangle = 60 * Math.PI/180.0;

	//make the snowflake
	this.snow1();

	//set up the geometry
	geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(this.positions), 3));
	geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(this.colors), 3));
	geometry.computeBoundingSphere();

	//create the mesh and inner and outer frames
	var mesh = new THREE.Line(geometry, this.material);
	this.innerFrame = new THREE.Object3D();
	this.innerFrame.add(mesh);
	this.frame = new THREE.Object3D();
	this.innerFrame.position.set(this.xOffset * this.size, this.yOffset * this.size, 0);
	this.frame.add(this.innerFrame);

	//mark origin and top left and bottom right corners
	// var origin = new THREE.Mesh(new THREE.SphereGeometry(0.1 * this.size), new THREE.MeshBasicMaterial({color: 0x000000}));
	// var topLeft = origin.clone();
	// var bottomRight = origin.clone();
	// topLeft.position.set(-0.5 * this.size, 0.5 * this.size, 0);
	// bottomRight.position.set(0.5 * this.size, -0.5 * this.size, 0);
	// this.frame.add(origin);
	// this.frame.add(topLeft);
	// this.frame.add(bottomRight);
}

//small and wide
Snowflake.prototype.snow0 = function () {
	var y = 0;
	this.snowflake
	(
		[
			new THREE.Vector3(0, y + 0, 0),
			new THREE.Vector3(this.size, y + 0, 0)
		],
		true, 0
	);
	this.xOffset = 0;
	this.yOffset = 0;
}

//best one
Snowflake.prototype.snow1 = function () {
	var y = 0;
	this.snowflake
	(
		[
			new THREE.Vector3(0, y + 0, 0),
			new THREE.Vector3(0.5 * this.size, y + 0.8 * this.size, 0),
			new THREE.Vector3(this.size, y + 0, 0)
		],
		true, 0
	);
	this.xOffset = -0.5;
	this.yOffset = -0.25;
}

//square-ish
Snowflake.prototype.snow2 = function () {
	var y = 0;
	this.snowflake
	(
		[
			new THREE.Vector3(0, y + 0, 0),
			new THREE.Vector3(this.size, y, 0),
			new THREE.Vector3(this.size, y + this.size, 0),
			new THREE.Vector3(0, y + this.size, 0),
		],
		true, 0
	);
	this.xOffset = -0.5;
	this.yOffset = -0.5;
}

//4-pronged
Snowflake.prototype.snow3 = function () {
	var y = 0;
	this.snowflake
	(
		[
			new THREE.Vector3(0.5 * this.size, y + 0, 0),
			new THREE.Vector3(this.size, y + 0, 0),
			new THREE.Vector3(0.5 * this.size, y + 0, 0),
			new THREE.Vector3(0.5 * this.size, y + 0.5 * this.size, 0),
			new THREE.Vector3(0.5 * this.size, y + 0, 0),
			new THREE.Vector3(0, y, 0),
			new THREE.Vector3(0.5 * this.size, y + 0, 0),
			new THREE.Vector3(0.5 * this.size, y - 0.5 * this.size, 0),
			new THREE.Vector3(0.5 * this.size, y + 0, 0),
		],
		true, 0
	);
	this.xOffset = -0.5;
	this.yOffset = 0;
}

Snowflake.prototype.addVertex = function (v) {
	if (this.next_positions_index == 0xffff) throw new Error("Too many points");

	this.positions.push(v.x, v.y, v.z);
	var red = randomInRange(this.colorRanges[this.color]['red'][0], this.colorRanges[this.color]['red'][1]);
	var green = randomInRange(this.colorRanges[this.color]['green'][0], this.colorRanges[this.color]['green'][1]);
	var blue = randomInRange(this.colorRanges[this.color]['blue'][0], this.colorRanges[this.color]['blue'][1]);
	this.colors.push(red, green, blue);
	return this.next_positions_index++;
}

Snowflake.prototype.snowflakeIteration = function (p0, p4, depth) {
	if (--depth < 0) {
		var i = this.next_positions_index - 1; //p0 already there
		this.addVertex(p4);
		this.indices_array.push(i, i + 1);
		return;
	}

	var v = p4.clone().sub(p0);
	var v_tier = v.clone().multiplyScalar(1.0/3.0);
	var p1 = p0.clone().add(v_tier);

	var angle = Math.atan2(v.y, v.x) + this.rangle;
	var length = v_tier.length();
	var p2 = p1.clone();
	p2.x += Math.cos(angle) * length;
	p2.y += Math.sin(angle) * length;

	var p3 = p0.clone().add(v_tier).add(v_tier);

	this.snowflakeIteration(p0, p1, depth);
	this.snowflakeIteration(p1, p2, depth);
	this.snowflakeIteration(p2, p3, depth);
	this.snowflakeIteration(p3, p4, depth);
}

Snowflake.prototype.snowflake = function (points, loop, x_offset) {
	for (var iteration = this.iteration_count - 1; iteration != this.iteration_count; ++iteration) {
		this.addVertex(points[0]);
		for (var p_index = 0, p_count = points.length - 1; p_index != p_count; ++p_index) {
			this.snowflakeIteration(points[p_index], points[p_index + 1], iteration);
		}

		if (loop) this.snowflakeIteration(points[points.length - 1], points[0], iteration);

		//translate input curve for next iteration
		for (var p_index = 0, p_count = points.length; p_index != p_count; ++p_index) {
			points[p_index].x += x_offset;
		}
	}
}

Snowflake.prototype.move = function (nextPosition, time, completeFcn) {
	var snowflake = this;

	snowflake.moveTime = time || 2000;

	snowflake.moveTween = new TWEEN.Tween(snowflake.frame.position).to({x: nextPosition.x, y: nextPosition.y, z: nextPosition.z}, snowflake.moveTime)
		.onComplete(function () {
			snowflake.stopMoving();
			if (completeFcn) {
				completeFcn();
			}
		});

	snowflake.moveTween.start();
}

Snowflake.prototype.stopMoving = function () {
	if (this.moveTween) {
		this.moveTween.stop();
	}
}

