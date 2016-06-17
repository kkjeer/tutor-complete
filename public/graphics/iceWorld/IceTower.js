function IceTower (width, numBlocks, name) {
	this.width = width;
	this.numBlocks = numBlocks;
	this.name = name || 'myIceTower';

	this.blockSize = 0.2 * this.width;
	this.snowflakeSize = 0.3 * this.width;

	this.frame = new THREE.Object3D();
	this.addBlocks(this.numBlocks);
}

IceTower.prototype.fall = function (snowflakeDistance, completeFcn) {
	var tower = this;

	var newSnowflakePos = this.snowflake.frame.position.clone();
	newSnowflakePos.y -= 0.5 * this.blockSize;
	newSnowflakePos.z += snowflakeDistance;
	tower.snowflakeTween = new TWEEN.Tween(tower.snowflake.frame.position).to(newSnowflakePos, 1000).onComplete(function () {
		if (completeFcn) {
			completeFcn();
		}
	}).start();
}

IceTower.prototype.destroyBlock = function (index) {
	var smallBlock = new Iceberg(0.25 * this.blockSize, 0xffffff).frame;
	var difference = this.blockSize - 0.25 * this.blockSize;
	smallBlock.position.set(this.blocks[index].position.x, this.blocks[index].position.y - 0.5 * difference, this.blocks[index].position.z);
	this.frame.remove(this.blocks[index]);
	this.frame.add(smallBlock);
}

IceTower.prototype.redoBlocks = function (numBlocks) {
	for (var i = 0; i < this.blocks.length; i++) {
		this.frame.remove(this.blocks[i]);
	}
	this.blocks = [];
	this.numBlocks = numBlocks;
	this.addBlocks();
}

IceTower.prototype.addBlocks = function () {
	if (this.numBlocks % 2 == 0) {
		this.addEvenBlocks();
	} else {
		this.addOddBlocks();
	}
}

IceTower.prototype.addOddBlocks = function () {
	var blockFrame = new Iceberg(this.blockSize, 0xffffff, this.name + 'Iceberg').frame;
	this.blocks = [];

	var halfBlocks = Math.floor(this.numBlocks/2);
	if (halfBlocks % 2 == 0) {
		halfBlocks++;
	}

	var blockSpace = (0.5 * this.width - this.blockSize)/halfBlocks;

	for (var i = 0; i < this.numBlocks; i++) {
		var sign = i % 2 == 0 ? 1 : -1;
		var index = Math.ceil(i/2);
		var block = blockFrame.clone();
		block.position.set(sign * index * blockSpace, 0, 0);
		block.name = 'towerBlock' + i + this.name;
		this.blocks.push(block);
		this.frame.add(block);
	}
}

IceTower.prototype.addEvenBlocks = function () {
	var blockFrame = new Iceberg(this.blockSize, 0xffffff, this.name + 'Iceberg').frame;
	this.blocks = [];

	var blockSpace = (this.width - this.blockSize)/this.numBlocks;

	for (var i = 1; i <= this.numBlocks; i++) {
		var sign = i % 2 == 0 ? 1 : -1;
		var index = Math.ceil(i/2);
		var offset = (i == 1 || i == 2) ? 0.33 * blockSpace : 0;
		var block = blockFrame.clone();
		block.position.set(sign * index * blockSpace - sign * offset, 0, 0);
		block.name = 'towerBlock' + i + this.name;
		this.blocks.push(block);
		this.frame.add(block);
	}
}

IceTower.prototype.shrinkSnowflake = function () {
	this.redoSnowflake(0.9 * this.snowflakeSize);
}

IceTower.prototype.redoSnowflake = function (size) {
	if (this.snowflake) {
		this.frame.remove(this.snowflake.frame);
	}
	this.snowflakeSize = size;
	this.addSnowflake();
}

IceTower.prototype.addSnowflake = function () {
	this.snowflake = new Snowflake(this.snowflakeSize, 'blue');
	this.snowflake.frame.position.set(0, 0.75 * this.blockSize + 0.5 * this.snowflakeSize, 0);
	this.frame.add(this.snowflake.frame);
}

IceTower.prototype.blockWorldPosition = function (index) {
	if (index >= this.blocks.length) {
		return new THREE.Vector3(this.frame.position.x, this.frame.position.y + 0.5 * this.blockSize, this.frame.position.z);
	}

	var framePos = this.frame.position;
	var localPos = this.blocks[index].position;

	var x = framePos.x + localPos.x;
	var y = framePos.y + localPos.y + 0.5 * this.blockSize;
	var z = framePos.z + localPos.z;

	return new THREE.Vector3(x, y, z);
}