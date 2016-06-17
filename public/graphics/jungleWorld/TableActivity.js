//to control how fast the arrow goes (projectile motion - missing a cylinder)
var Y_ACCEL = -9.8;
var ARROW_TWEEN_TIME = 150;

function TableActivity (width, depth, state) {
	//parameters
	this.width = width;
	this.depth = depth;

	//languages
	this.tableLangs = Nonregulars.find({worldName: 'jungle'}).fetch();

	//state
	var tableStates = TableStates.find({studentId: Meteor.userId()}).fetch();
	tableStates.sort(function (state1, state2) {
		return state1.name > state2.name;
	});
	this.state = tableStates[tableStates.length - 1];

	//frame
	this.frame = new THREE.Object3D();

	//table
	this.addTable();
	this.cylinderIndex = 0;

	//state info
	this.loadState();
}

TableActivity.prototype.loadState = function () {
	this.isLoading = true;
	this.setLanguage(this.state.langIndex);

	var stateName = this.state.name;
	this.currentState = stateName.substring(stateName.indexOf('TableState') + 'TableState'.length, stateName.length);

	this.maxPointsGain -= this.state.penalty;
	this.pointsGain = this.maxPointsGain;
	Session.set('tablePointsDisplay', this.pointsGain);

	Session.set('tableCompletedParsings', this.state.completedParsings);

	this.stringChoice = this.state.stringChoice;
	this.parsingChoice = this.state.parsingChoice;
	this.iChoice = this.state.iChoice;
	this.reasonChoice = this.state.reasonChoice;
	this.penalty = this.state.penalty;

	var mode = this.state.choosingMode;
	Session.set('tableChoosingMode', mode);

	switch (mode) {
		case 'language':
			Session.set('tablePointsDisplay', '');
			break;
		case 'string': 
			break;
		case 'parsing':
			this.chooseString(this.state.stringChoice);
			break;
		case 'i':
			this.chooseString(this.state.stringChoice);
			this.chooseParsing(this.state.parsingChoice);
			break;
		case 'reason': 
			this.chooseString(this.state.stringChoice);
			this.chooseParsing(this.state.parsingChoice);
			this.chooseI(this.state.iChoice);
			break;
	}

	this.cylinderIndex = this.state.completedParsings.length;
	for (var i = 0; i < this.cylinderIndex; i++) {
		if (this.table.cylinders[i]) {
			this.table.flattenCylinder(i);
		}
	}

	if (!this.language) {
		Session.set('tableChoosingMode', 'language');
	}

	this.isLoading = false;
}

TableActivity.prototype.saveState = function () {
	if (this.isLoading) {
		return;
	}

	this.currentState++;

	var state = {
		name: Meteor.user().username + 'TableState' + this.currentState,
		studentId: Meteor.userId(),
		date: new Date(),
		penalty: this.penalty,
		langIndex: this.langIndex,
		completedParsings: Session.get('tableCompletedParsings'),
		choosingMode: Session.get('tableChoosingMode'),
		stringChoice: Session.get('tableStringChoice'),
		parsingChoice: Session.get('tableParsingChoice'),
		iChoice: Session.get('tableIChoice'),
		reasonChoice: Session.get('tableReasonChoice')
	};

	Meteor.call('insertTableState', state);
}

TableActivity.prototype.redoBow = function () {
	this.removeBow();
	this.addBow();
}

TableActivity.prototype.addBow = function () {
	this.bow = new Bow(0.1 * this.width);
	this.bow.frame.position.set(0.2 * this.width, 0.5 * this.bow.height, 0);
	this.frame.add(this.bow.frame);
}

TableActivity.prototype.removeBow = function () {
	if (this.bow) {
		this.frame.remove(this.bow.frame);
	}
}

TableActivity.prototype.addTable = function () {
	this.table = new Table(0.1 * this.width, 0);
	this.table.redoBerry(0.2 * this.table.height);
	this.table.frame.position.set(0, 0, -this.depth);
	this.frame.add(this.table.frame);
}

TableActivity.prototype.redoTable = function () {
	if (this.table) {
		this.frame.remove(this.table.frame);
	}
	this.addTable();
}

TableActivity.prototype.redoTableCylinders = function () {
	var numParsings = Object.keys(Session.get('tableParsings')[Session.get('tableStringChoice')]).length;
	this.cylinderIndex = 0;
	this.table.redoCylinders(numParsings);
}

TableActivity.prototype.minParsingChoices = function () {
	var parsings = Session.get('tableParsings');
	var minParsings = Infinity;
	for (var i in parsings) {
		var numParsings = Object.keys(parsings[i]).length;
		if (numParsings < minParsings) {
			minParsings = numParsings;
		}
	}
	return minParsings;
}

TableActivity.prototype.setLanguage = function (langIndex) {
	if (langIndex < 0 || langIndex >= this.tableLangs.length) {
		Session.set('tableChoosingMode', 'language');
		return;
	}

	//update the language
	this.langIndex = langIndex;
	this.language = this.tableLangs[this.langIndex];
	this.maxPointsGain = NonregularRewards.find({langId: this.language._id, studentId: Meteor.userId()}).fetch()[0].reward;
	this.pointsGain = this.maxPointsGain;

	//update the Session language-related things
	Session.set('tableLang', this.language.description);
	Session.set('tableParsings', this.language.parsings);
	Session.set('tableChoosingMode', 'string');
	Session.set('tablePointsDisplay', this.pointsGain);
	Session.set('tableCompletedParsings', []);

	this.saveState();
}

TableActivity.prototype.chooseString = function (string) {
	this.stringChoice = string;
	Session.set('tableStringChoice', string);
	Session.set('tableChoosingMode', 'parsing');
	this.redoTableCylinders();
	var minParsings = this.minParsingChoices();
	var parsings = Session.get('tableParsings')[Session.get('tableStringChoice')];
	var numParsings = Object.keys(parsings).length;
	if (!this.isLoading) {
		if (numParsings > minParsings) {
			Meteor.call('updateIncorrectPLSkillScore', 'jungle', 'string');
		} else {
			Meteor.call('updateCorrectPLSkillScore', 'jungle', 'string');
		}
	}
	this.saveState();
}

TableActivity.prototype.changeString = function () {
	Session.set('tableChoosingMode', 'string');
	this.removeBow();
	//this.shrinkReward();
}

TableActivity.prototype.chooseParsing = function (parsing) {
	Session.set('tableErrorMessage', '');
	Session.set('tableIChoice', '');
	this.parsingChoice = parsing;
	Session.set('tableParsingChoice', this.parsingChoice);
	Session.set('tableChoosingMode', 'i');
	this.removeBow();
	this.saveState();
}

TableActivity.prototype.chooseI = function (i) {
	Session.set('tableErrorMessage', '');
	this.iChoice = i;
	Session.set('tableIChoice', this.iChoice);
	var reasons = this.language.parsings[this.stringChoice][this.parsingChoice][this.iChoice];
	if (reasons.length > 0) {
		Session.set('tableChoosingMode', 'reason');

		var parsings = Session.get('tableParsings')[Session.get('tableStringChoice')];
		var numParsings = Object.keys(parsings).length;
		if (numParsings == 1) {
			Meteor.call('updateCorrectPLSkillScore', 'jungle', 'i');
		}

		this.redoBow();
		this.saveState();
	} else {
		Meteor.call('updateIncorrectPLSkillScore', 'jungle', 'i');
		Session.set('tableChoosingMode', 'i');
		Session.set('tableErrorMessage', 'xy<sup><em>' + i + '</em></sup>z could still be in the language, depending on y. Pick a different <em>i</em>.');
		this.removeBow();
		this.shrinkReward();
	}
}

TableActivity.prototype.chooseReason = function (reason) {
	Session.set('tableErrorMessage', '');
	this.reasonChoice = reason;
	Session.set('tableReasonChoice', this.reasonChoice);
	var reasons = this.language.parsings[this.stringChoice][this.parsingChoice][this.iChoice];
	var correctReason = reasons[0];
	if (this.reasonChoice == correctReason) {
		var parsings = Session.get('tableParsings')[Session.get('tableStringChoice')];
		var numParsings = Object.keys(parsings).length;
		if (numParsings == 1) {
			Meteor.call('updateCorrectPLSkillScore', 'jungle', 'reason');
		}

		this.shootCylinder();
	} else {
		this.shootAndMiss();
		Meteor.call('updateIncorrectPLSkillScore', 'jungle', 'reason');
	}
}

TableActivity.prototype.collectReward = function () {
	Session.set('tablePointsDisplay', '');
	var tableAct = this;

	//inform the user of their new score
	var scores = PLScores.find({studentId: Meteor.userId(), world: 'jungle'}).fetch()[0];
	var plScore = scores.stringScore + scores.iScore + scores.reasonScore;
	var world = globalWorlds['#jungleworld'];
	var minPL = world.minString + world.minI + world.minReason;
	var percentage = 100 * plScore/minPL;
	Session.set('tableErrorMessage',
							'You win! You now have a mastery level of ' + percentage.toFixed(0) + '% for this activity.');
	tableAct.saveState();

	//mark the current language as complete
	Meteor.call('addCompletedLanguage', tableAct.language._id);

	tableAct.table.fall(tableAct.depth, function () {
		setTimeout(function () {
			tableAct.reset();
		}, 3000);
	});
}

TableActivity.prototype.shrinkReward = function () {
	if (this.isLoading) {
		return;
	}

	this.pointsGain -= 5;
	this.penalty += 5;
	if (this.pointsGain < 0) {
		this.pointsGain = 0;
	}
	Session.set('tablePointsDisplay', this.pointsGain);
	this.table.shrinkBerry();
	this.saveState();
}

TableActivity.prototype.checkFinishedParsings = function () {
	if (this.cylinderIndex >= this.table.numCylinders) {
		this.collectReward();
	} else {
		Session.set('tableChoosingMode', 'parsing');
		this.removeBow();
		this.saveState();
	}
}

TableActivity.prototype.reset = function () {
	//reset the activity
	this.removeBow();
	this.cylinderIndex = 0;
	this.redoTable();

	//reset Session things
	Session.set('tableChoosingMode', 'language');
	Session.set('tableStringChoice', '');
	Session.set('tableParsingChoice', '');
	Session.set('tableIChoice', '');
	Session.set('tableReasonChoice', '');
	Session.set('tableErrorMessage', '');

	//save
	this.saveState();
}

TableActivity.prototype.shootCylinder = function () {
	//update message
	Session.set('tableErrorMessage', 'Correct! I can\'t pump this parsing and stay in the language.');

	//mark the current parsing as complete so the parsing button gets disabled
	var completedParsings = Session.get('tableCompletedParsings');
	completedParsings.push(Session.get('tableParsingChoice'));
	Session.set('tableCompletedParsings', completedParsings);

	//hit the cylinder
	var tableAct = this;
	this.bow.drawArrow();
	this.bow.drawTween.onComplete(function () {
		tableAct.hitCylinder();
	}).start();
}

TableActivity.prototype.shootAndMiss = function () {
	//update message
	Session.set('tableErrorMessage', 'Either this isn\'t true, or this wouldn\'t cause xy<sup><em>' + Session.get('tableIChoice') + 
																		'</em></sup>z to not be in the language. Pick a different reason.');
	
	//miss the cylinder
	var tableAct = this;
	this.bow.drawArrow();
	this.bow.drawTween.onComplete(function () {
		tableAct.missCylinder();
	}).start();
}

TableActivity.prototype.hitCylinder = function () {
	//remove the arrow from the bow and attach it to the activity
	this.bow.frame.remove(this.bow.arrow.frame);
	this.bow.arrow.frame.position.copy(this.bow.frame.position);
	this.bow.arrow.frame.position.z += this.bow.curvature - this.bow.arrow.arrowLength;
	this.frame.add(this.bow.arrow.frame);

	//calculate the position of the target cylinder and the distance to it
	var targetPos = this.table.cylinderWorldPosition(this.cylinderIndex);
	var distance = new THREE.Vector3().subVectors(targetPos, this.bow.arrow.frame.position).length();

	//tween the arrow to the target position, then knock the target cylinder backwards
	var tableAct = this;
	tableAct.bow.arrowLaunchTween = new TWEEN.Tween(tableAct.bow.arrow.frame.position).to(targetPos, distance).onComplete(function () {
		tableAct.knockCylinderBack();
	}).start();

	//tween the bowstring curvature back to 0
	var initialCurvature = tableAct.bow.curvature;
	var finalCurvature = {curvature: 0};
	tableAct.bow.stringTween = new TWEEN.Tween(tableAct.bow).to(finalCurvature, distance).onUpdate(function () {
		tableAct.bow.addBowstring();
	}).start();
}

TableActivity.prototype.missCylinder = function () {
	//stop drawing the bow
	this.bow.drawTween.stop();

	//find the angle to the horizontal at which the arrow is launched
	var launchAngle = this.bow.frame.rotation.x;

	//break the velocity down into horizontal and vertical (z and y) components
	var zVelocity = this.bow.velocity * Math.cos(launchAngle);
	var yVelocity = this.bow.velocity * Math.sin(launchAngle);

	//find the total time of flight
	var flightTime;
	if (yVelocity != 0) {
		flightTime = Math.abs(-2 * yVelocity/Y_ACCEL);
	} else {
		flightTime = Math.sqrt(2 * this.bow.frame.position.y/-Y_ACCEL); 
	}
	
	//tween between 0 and flightTime, updating the arrow's position based on projectile motion at each point in time
	var tableAct = this;
	var bow = tableAct.bow;
	var time = {t: 0}
	var finalTime = {t: flightTime};
	bow.arrowLaunchTween = new TWEEN.Tween(time).to(finalTime, flightTime).start();

	var tween = new TWEEN.Tween(time).to(finalTime, flightTime * ARROW_TWEEN_TIME).onUpdate(function () {
		var y = yVelocity * time.t + 0.5 * Y_ACCEL * time.t * time.t;
		var z = -zVelocity * time.t;
		bow.arrow.frame.position.set(bow.arrow.frame.position.x, y, z);

		//rotate the arrow to follow the tangent of its trajectory:
		//find the derivative of y w.r.t time.t
		var yPrime = yVelocity + Y_ACCEL * time.t;

		//the angle of x-rotation is the inverse tangent of the y-derivative, scaled by 1/(2PI)
		var angle = Math.atan(yPrime)/(2 * Math.PI);
		bow.arrow.frame.rotation.x = angle;
	}).onComplete(function () {
		bow.reset();
		tableAct.shrinkReward();
	}).start();

	//tween the bowstring curvature back to 0
	var initialCurvature = bow.curvature;
	var finalCurvature = {curvature: 0};
	bow.stringTween = new TWEEN.Tween(this.bow).to(finalCurvature, flightTime * 100).onUpdate(function () {
		bow.addBowstring();
	}).start();
}

TableActivity.prototype.knockCylinderBack = function () {
	//temporarily put the arrow out of sight (will reappear when the bow is reset)
	this.bow.arrow.frame.position.z = 100000;

	//tween the current cylinder backwards onto the ground
	var tableAct = this;
	tableAct.knockTween = new TWEEN.Tween(tableAct.table.cylinders[tableAct.cylinderIndex].rotation).to({x: -Math.PI/2}, 1000).onComplete(function () {
		tableAct.cylinderIndex++;
		tableAct.bow.reset();
		tableAct.checkFinishedParsings();
	}).start();
}

TableActivity.prototype.arrowWorldPosition = function () {
	this.frame.updateMatrixWorld();
	var vector = new THREE.Vector3();
	vector.setFromMatrixPosition(this.bow.arrow.frame.matrixWorld);
	return vector;
}

TableActivity.prototype.cylinderWorldPosition = function (index) {
	this.frame.updateMatrixWorld();
	var vector = new THREE.Vector3();
	vector.setFromMatrixPosition(this.table.cylinders[index].matrixWorld);
	return vector;
}