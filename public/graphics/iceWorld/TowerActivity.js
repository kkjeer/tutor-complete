//to control how fast the spear goes (projectile motion - missing a strand)
var Y_ACCEL = -9.8;
var SPEAR_TWEEN_TIME = 150;

function TowerActivity (width, depth, state) {
	//parameters
	this.width = width;
	this.depth = depth;

	//languages
	this.towerLangs = Nonregulars.find({worldName: 'ice'}).fetch();

	//state
	var towerStates = TowerStates.find({studentId: Meteor.userId()}).fetch();
	towerStates.sort(function (state1, state2) {
		return state1.name > state2.name;
	});
	this.state = towerStates[towerStates.length - 1];

	//frame
	this.frame = new THREE.Object3D();

	//tower
	this.addTower();
	this.strandIndex = 0;

	//state info
	this.loadState();
}

TowerActivity.prototype.loadState = function () {
	this.isLoading = true;
	this.setLanguage(this.state.langIndex);

	var stateName = this.state.name;
	this.currentState = stateName.substring(stateName.indexOf('TowerState') + 'TowerState'.length, stateName.length);

	this.maxPointsGain -= this.state.penalty;
	this.pointsGain = this.maxPointsGain;
	Session.set('towerPointsDisplay', this.pointsGain);

	Session.set('towerCompletedParsings', this.state.completedParsings);

	this.stringChoice = this.state.stringChoice;
	this.parsingChoice = this.state.parsingChoice;
	this.iChoice = this.state.iChoice;
	this.reasonChoice = this.state.reasonChoice;
	this.penalty = this.state.penalty;

	var mode = this.state.choosingMode;
	Session.set('towerChoosingMode', mode);

	switch (mode) {
		case 'language':
			Session.set('towerPointsDisplay', '');
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

	this.strandIndex = this.state.completedParsings.length;
	for (var i = 0; i < this.strandIndex; i++) {
		if (this.tower.blocks[i]) {
			this.tower.destroyBlock(i);
		}
	}

	if (!this.language) {
		Session.set('towerChoosingMode', 'language');
	}

	this.isLoading = false;
}

TowerActivity.prototype.saveState = function () {
	if (this.isLoading) {
		return;
	}

	this.currentState++;

	var state = {
		name: Meteor.user().username + 'TowerState' + this.currentState,
		studentId: Meteor.userId(),
		date: new Date(),
		penalty: this.penalty,
		langIndex: this.langIndex,
		completedParsings: Session.get('towerCompletedParsings'),
		choosingMode: Session.get('towerChoosingMode'),
		stringChoice: Session.get('towerStringChoice'),
		parsingChoice: Session.get('towerParsingChoice'),
		iChoice: Session.get('towerIChoice'),
		reasonChoice: Session.get('towerReasonChoice')
	};

	Meteor.call('insertTowerState', state);
}

TowerActivity.prototype.redoSpear = function () {
	this.removeSpear();
	this.addSpear();
}

TowerActivity.prototype.addSpear = function () {
	this.spear = new Spear(0.1 * this.width);
	this.spear.frame.position.set(0.2 * this.width, 0.5 * this.spear.length, 0);
	console.log('this.spear.frame.position: ', this.spear.frame.position);
	this.frame.add(this.spear.frame);
}

TowerActivity.prototype.removeSpear = function () {
	if (this.spear) {
		this.frame.remove(this.spear.frame);
	}
}

TowerActivity.prototype.addTower = function () {
	this.tower = new IceTower(0.4 * this.width, 0);
	this.tower.redoSnowflake(0.3 * this.tower.width);
	this.tower.frame.position.set(0, 0, -this.depth);
	this.frame.add(this.tower.frame);
}

TowerActivity.prototype.redoTower = function () {
	if (this.tower) {
		this.frame.remove(this.tower.frame);
	}
	this.addTower();
}

TowerActivity.prototype.redoTowerBlocks = function () {
	var numParsings = Object.keys(Session.get('towerParsings')[Session.get('towerStringChoice')]).length;
	this.strandIndex = 0;
	this.tower.redoBlocks(numParsings);
}

TowerActivity.prototype.minParsingChoices = function () {
	var parsings = Session.get('towerParsings');
	var minParsings = Infinity;
	for (var i in parsings) {
		var numParsings = Object.keys(parsings[i]).length;
		if (numParsings < minParsings) {
			minParsings = numParsings;
		}
	}
	return minParsings;
}

TowerActivity.prototype.setLanguage = function (langIndex) {
	if (langIndex < 0 || langIndex >= this.towerLangs.length) {
		Session.set('towerChoosingMode', 'language');
		return;
	}

	//update the language
	this.langIndex = langIndex;
	this.language = this.towerLangs[this.langIndex];
	this.maxPointsGain = 0;//NonregularRewards.find({langId: this.language._id, studentId: Meteor.userId()}).fetch()[0].reward;
	this.pointsGain = this.maxPointsGain;

	//update the Session language-related things
	Session.set('towerLang', this.language.description);
	Session.set('towerParsings', this.language.parsings);
	Session.set('towerChoosingMode', 'string');
	Session.set('towerPointsDisplay', this.pointsGain);
	Session.set('towerCompletedParsings', []);

	this.saveState();
}

TowerActivity.prototype.chooseString = function (string) {
	this.stringChoice = string;
	Session.set('towerStringChoice', string);
	Session.set('towerChoosingMode', 'parsing');
	this.redoTowerBlocks();
	var minParsings = this.minParsingChoices();
	var parsings = Session.get('towerParsings')[Session.get('towerStringChoice')];
	var numParsings = Object.keys(parsings).length;
	if (!this.isLoading) {
		if (numParsings > minParsings) {
			Meteor.call('updateIncorrectPLSkillScore', 'ice', 'string');
		} else {
			Meteor.call('updateCorrectPLSkillScore', 'ice', 'string');
		}
	}
	this.saveState();
}

TowerActivity.prototype.changeString = function () {
	Session.set('towerChoosingMode', 'string');
	this.removeSpear();
	//this.shrinkReward();
}

TowerActivity.prototype.chooseParsing = function (parsing) {
	Session.set('towerErrorMessage', '');
	Session.set('towerIChoice', '');
	this.parsingChoice = parsing;
	Session.set('towerParsingChoice', this.parsingChoice);
	Session.set('towerChoosingMode', 'i');
	this.removeSpear();
	this.saveState();
}

TowerActivity.prototype.chooseI = function (i) {
	Session.set('towerErrorMessage', '');
	this.iChoice = i;
	Session.set('towerIChoice', this.iChoice);
	var reasons = this.language.parsings[this.stringChoice][this.parsingChoice][this.iChoice];
	if (reasons.length > 0) {
		Session.set('towerChoosingMode', 'reason');

		var parsings = Session.get('towerParsings')[Session.get('towerStringChoice')];
		var numParsings = Object.keys(parsings).length;
		if (numParsings == 1) {
			Meteor.call('updateCorrectPLSkillScore', 'ice', 'i');
		}

		this.redoSpear();
		this.saveState();
	} else {
		Meteor.call('updateIncorrectPLSkillScore', 'ice', 'i');
		Session.set('towerChoosingMode', 'i');
		Session.set('towerErrorMessage', 'xy<sup><em>' + i + '</em></sup>z could still be in the language, depending on y. Pick a different <em>i</em>.');
		this.removeSpear();
		this.shrinkReward();
	}
}

TowerActivity.prototype.chooseReason = function (reason) {
	Session.set('towerErrorMessage', '');
	this.reasonChoice = reason;
	Session.set('towerReasonChoice', this.reasonChoice);
	var reasons = this.language.parsings[this.stringChoice][this.parsingChoice][this.iChoice];
	var correctReason = reasons[0];
	if (this.reasonChoice == correctReason) {
		Session.set('towerChoosingMode', '');
		var parsings = Session.get('towerParsings')[Session.get('towerStringChoice')];
		var numParsings = Object.keys(parsings).length;
		if (numParsings == 1) {
			Meteor.call('updateCorrectPLSkillScore', 'ice', 'reason');
		}

		this.shootStrand();
	} else {
		this.shootAndMiss();
		Meteor.call('updateIncorrectPLSkillScore', 'ice', 'reason');
	}
}

TowerActivity.prototype.collectReward = function () {
	Session.set('towerPointsDisplay', '');
	var towerAct = this;

	//inform the user of their new score
	var scores = PLScores.find({studentId: Meteor.userId(), world: 'ice'}).fetch()[0];
	var plScore = scores.stringScore + scores.iScore + scores.reasonScore;
	var world = globalWorlds['#iceworld'];
	var minPL = world.minString + world.minI + world.minReason;
	var percentage = 100 * plScore/minPL;
	Session.set('towerErrorMessage',
							'You win! You now have a mastery level of ' + percentage.toFixed(0) + '% for this activity.');
	towerAct.saveState();

	//mark the current language as complete
	Meteor.call('addCompletedLanguage', towerAct.language._id);

	towerAct.tower.fall(-1, function () {
		setTimeout(function () {
			towerAct.reset();
		}, 3000);
	});
}

TowerActivity.prototype.shrinkReward = function () {
	if (this.isLoading) {
		return;
	}

	this.pointsGain -= 5;
	this.penalty += 5;
	if (this.pointsGain < 0) {
		this.pointsGain = 0;
	}
	Session.set('towerPointsDisplay', this.pointsGain);
	this.tower.shrinkSnowflake();
	this.saveState();
}

TowerActivity.prototype.checkFinishedParsings = function () {
	if (this.strandIndex >= this.tower.numBlocks) {
		this.collectReward();
	} else {
		Session.set('towerChoosingMode', 'parsing');
		this.removeSpear();
		this.saveState();
	}
}

TowerActivity.prototype.reset = function () {
	//reset the activity
	this.removeSpear();
	this.strandIndex = 0;
	this.redoTower();

	//reset Session things
	Session.set('towerChoosingMode', 'language');
	Session.set('towerStringChoice', '');
	Session.set('towerParsingChoice', '');
	Session.set('towerIChoice', '');
	Session.set('towerReasonChoice', '');
	Session.set('towerErrorMessage', '');

	//save
	this.saveState();
}

TowerActivity.prototype.shootStrand = function () {
	//update message
	Session.set('towerErrorMessage', 'Correct! I can\'t pump this parsing and stay in the language.');

	//mark the current parsing as complete so the parsing button gets disabled
	var completedParsings = Session.get('towerCompletedParsings');
	completedParsings.push(Session.get('towerParsingChoice'));
	Session.set('towerCompletedParsings', completedParsings);

	//hit the strand
	var towerAct = this;
	towerAct.spear.drawBack(50, 1000, function () {
		towerAct.hitStrand();
	});
}

TowerActivity.prototype.shootAndMiss = function () {
	//update message
	Session.set('towerErrorMessage', 'Either this isn\'t true, or this wouldn\'t cause xy<sup><em>' + Session.get('towerIChoice') + 
																		'</em></sup>z to not be in the language. Pick a different reason.');
	
	//miss the strand
	var towerAct = this;
	towerAct.spear.drawBack(100, 1000, function () {
		towerAct.missStrand();
	});
}

TowerActivity.prototype.hitStrand = function () {
	//calculate the position of the target strand and the distance to it
	var targetPos = this.tower.blockWorldPosition(this.strandIndex);
	var distance = new THREE.Vector3().subVectors(targetPos, this.spear.frame.position).length();

	//tween the spear to the target position, then knock the target strand backwards
	var towerAct = this;
	towerAct.spear.launchTween = new TWEEN.Tween(towerAct.spear.frame.position).to(targetPos, distance).onComplete(function () {
		towerAct.tower.destroyBlock(towerAct.strandIndex);
		towerAct.strandIndex++;
		towerAct.spear.reset();
		towerAct.checkFinishedParsings();
	}).start();
}

TowerActivity.prototype.missStrand = function () {
	//stop drawing the spear
	if (this.spear.drawTween) {
		this.spear.drawTween.stop();
	}
	
	//find the angle to the horizontal at which the spear is launched
	var launchAngle = this.spear.frame.rotation.x;

	//break the velocity down into horizontal and vertical (z and y) components
	var velocity = 450;
	var zVelocity = velocity * Math.cos(launchAngle);
	var yVelocity = velocity * Math.sin(launchAngle);

	//find the total time of flight
	var flightTime;
	if (yVelocity != 0) {
		flightTime = Math.abs(-2 * yVelocity/Y_ACCEL);
	} else {
		flightTime = Math.sqrt(2 * this.spear.frame.position.y/-Y_ACCEL); 
	}
	
	//tween between 0 and flightTime, updating the spear's position based on projectile motion at each point in time
	var towerAct = this;
	var spear = towerAct.spear;
	var time = {t: 0}
	var finalTime = {t: flightTime};
	spear.launchTween = new TWEEN.Tween(time).to(finalTime, flightTime).start();

	var tween = new TWEEN.Tween(time).to(finalTime, flightTime * SPEAR_TWEEN_TIME).onUpdate(function () {
		var y = yVelocity * time.t + 0.5 * Y_ACCEL * time.t * time.t;
		var z = -zVelocity * time.t;
		spear.frame.position.set(spear.frame.position.x, y, z);

		//rotate the tangent to follow the tangent of its trajectory:
		//find the derivative of y w.r.t time.t
		var yPrime = yVelocity + Y_ACCEL * time.t;

		//the angle of x-rotation is the inverse tangent of the y-derivative, scaled by 1/(2PI)
		var angle = Math.atan(yPrime)/(2 * Math.PI);
		spear.frame.rotation.x = angle;
	}).onComplete(function () {
		spear.reset();
	}).start();
}

TowerActivity.prototype.strandWorldPosition = function (index) {
	this.frame.updateMatrixWorld();
	var vector = new THREE.Vector3();
	vector.setFromMatrixPosition(this.tower.blocks[index].matrixWorld);
	return vector;
}

