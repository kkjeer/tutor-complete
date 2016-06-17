//to control how fast the trident goes (projectile motion - missing a strand)
var Y_ACCEL = -9.8;
var TRIDENT_TWEEN_TIME = 150;

function NetActivity (width, depth, state) {
	//parameters
	this.width = width;
	this.depth = depth;

	//languages
	this.netLangs = Nonregulars.find({worldName: 'ocean'}).fetch();

	//state
	var netStates = NetStates.find({studentId: Meteor.userId()}).fetch();
	netStates.sort(function (state1, state2) {
		return state1.name > state2.name;
	});
	this.state = netStates[netStates.length - 1];

	//frame
	this.frame = new THREE.Object3D();

	//net
	this.addNet();
	this.strandIndex = 0;

	//state info
	this.loadState();
}

NetActivity.prototype.loadState = function () {
	this.isLoading = true;
	this.setLanguage(this.state.langIndex);

	var stateName = this.state.name;
	this.currentState = stateName.substring(stateName.indexOf('NetState') + 'NetState'.length, stateName.length);

	this.maxPointsGain -= this.state.penalty;
	this.pointsGain = this.maxPointsGain;
	Session.set('netPointsDisplay', this.pointsGain);

	Session.set('netCompletedParsings', this.state.completedParsings);

	this.stringChoice = this.state.stringChoice;
	this.parsingChoice = this.state.parsingChoice;
	this.iChoice = this.state.iChoice;
	this.reasonChoice = this.state.reasonChoice;
	this.penalty = this.state.penalty;

	var mode = this.state.choosingMode;
	Session.set('netChoosingMode', mode);

	switch (mode) {
		case 'language':
			Session.set('netPointsDisplay', '');
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
		if (this.net.strands[i]) {
			this.net.destroyColoredStrands(i);
		}
	}

	if (!this.language) {
		Session.set('netChoosingMode', 'language');
	}

	this.isLoading = false;
}

NetActivity.prototype.saveState = function () {
	if (this.isLoading) {
		return;
	}

	this.currentState++;

	var state = {
		name: Meteor.user().username + 'NetState' + this.currentState,
		studentId: Meteor.userId(),
		date: new Date(),
		penalty: this.penalty,
		langIndex: this.langIndex,
		completedParsings: Session.get('netCompletedParsings'),
		choosingMode: Session.get('netChoosingMode'),
		stringChoice: Session.get('netStringChoice'),
		parsingChoice: Session.get('netParsingChoice'),
		iChoice: Session.get('netIChoice'),
		reasonChoice: Session.get('netReasonChoice')
	};

	Meteor.call('insertNetState', state);
}

NetActivity.prototype.redoTrident = function () {
	this.removeTrident();
	this.addTrident();
}

NetActivity.prototype.addTrident = function () {
	this.trident = new Trident(0.1 * this.width);
	this.trident.frame.position.set(0.2 * this.width, 0.5 * this.trident.length, 0);
	this.frame.add(this.trident.frame);
}

NetActivity.prototype.removeTrident = function () {
	if (this.trident) {
		this.frame.remove(this.trident.frame);
	}
}

NetActivity.prototype.addNet = function () {
	this.net = new Net(0.15 * this.width, 0.15 * this.width, 1);
	this.net.redoPearl(0.2 * this.net.height);
	this.net.frame.position.set(0, 0, -this.depth);
	this.frame.add(this.net.frame);
}

NetActivity.prototype.redoNet = function () {
	if (this.net) {
		this.frame.remove(this.net.frame);
	}
	this.addNet();
}

NetActivity.prototype.redoNetStrands = function () {
	var numParsings = Object.keys(Session.get('netParsings')[Session.get('netStringChoice')]).length;
	this.strandIndex = 0;
	this.net.redoStrands(numParsings);
}

NetActivity.prototype.minParsingChoices = function () {
	var parsings = Session.get('netParsings');
	var minParsings = Infinity;
	for (var i in parsings) {
		var numParsings = Object.keys(parsings[i]).length;
		if (numParsings < minParsings) {
			minParsings = numParsings;
		}
	}
	return minParsings;
}

NetActivity.prototype.setLanguage = function (langIndex) {
	if (langIndex < 0 || langIndex >= this.netLangs.length) {
		Session.set('netChoosingMode', 'language');
		return;
	}

	//update the language
	this.langIndex = langIndex;
	this.language = this.netLangs[this.langIndex];
	console.log('this.langIndex: ', this.langIndex, ' this.language: ', this.language);
	this.maxPointsGain = 0;//NonregularRewards.find({langId: this.language._id, studentId: Meteor.userId()}).fetch()[0].reward;
	this.pointsGain = this.maxPointsGain;

	//update the Session language-related things
	Session.set('netLang', this.language.description);
	Session.set('netParsings', this.language.parsings);
	Session.set('netChoosingMode', 'string');
	Session.set('netPointsDisplay', this.pointsGain);
	Session.set('netCompletedParsings', []);

	this.saveState();
}

NetActivity.prototype.chooseString = function (string) {
	this.stringChoice = string;
	Session.set('netStringChoice', string);
	Session.set('netChoosingMode', 'parsing');
	this.redoNetStrands();
	var minParsings = this.minParsingChoices();
	var parsings = Session.get('netParsings')[Session.get('netStringChoice')];
	var numParsings = Object.keys(parsings).length;
	if (!this.isLoading) {
		if (numParsings > minParsings) {
			Meteor.call('updateIncorrectPLSkillScore', 'ocean', 'string');
		} else {
			Meteor.call('updateCorrectPLSkillScore', 'ocean', 'string');
		}
	}
	this.saveState();
}

NetActivity.prototype.changeString = function () {
	Session.set('netChoosingMode', 'string');
	this.removeTrident();
	//this.shrinkReward();
}

NetActivity.prototype.chooseParsing = function (parsing) {
	Session.set('netErrorMessage', '');
	Session.set('netIChoice', '');
	this.parsingChoice = parsing;
	Session.set('netParsingChoice', this.parsingChoice);
	Session.set('netChoosingMode', 'i');
	this.removeTrident();
	this.saveState();
}

NetActivity.prototype.chooseI = function (i) {
	Session.set('netErrorMessage', '');
	this.iChoice = i;
	Session.set('netIChoice', this.iChoice);
	var reasons = this.language.parsings[this.stringChoice][this.parsingChoice][this.iChoice];
	if (reasons.length > 0) {
		Session.set('netChoosingMode', 'reason');

		var parsings = Session.get('netParsings')[Session.get('netStringChoice')];
		var numParsings = Object.keys(parsings).length;
		if (numParsings == 1) {
			Meteor.call('updateCorrectPLSkillScore', 'ocean', 'i');
		}

		this.redoTrident();
		this.saveState();
	} else {
		Meteor.call('updateIncorrectPLSkillScore', 'ocean', 'i');
		Session.set('netChoosingMode', 'i');
		Session.set('netErrorMessage', 'xy<sup><em>' + i + '</em></sup>z could still be in the language, depending on y. Pick a different <em>i</em>.');
		this.removeTrident();
		this.shrinkReward();
	}
}

NetActivity.prototype.chooseReason = function (reason) {
	Session.set('netErrorMessage', '');
	this.reasonChoice = reason;
	Session.set('netReasonChoice', this.reasonChoice);
	var reasons = this.language.parsings[this.stringChoice][this.parsingChoice][this.iChoice];
	var correctReason = reasons[0];
	if (this.reasonChoice == correctReason) {
		Session.set('netChoosingMode', '');
		var parsings = Session.get('netParsings')[Session.get('netStringChoice')];
		var numParsings = Object.keys(parsings).length;
		if (numParsings == 1) {
			Meteor.call('updateCorrectPLSkillScore', 'ocean', 'reason');
		}

		this.shootStrand();
	} else {
		this.shootAndMiss();
		Meteor.call('updateIncorrectPLSkillScore', 'ocean', 'reason');
	}
}

NetActivity.prototype.collectReward = function () {
	Session.set('netPointsDisplay', '');
	var netAct = this;

	//inform the user of their new score
	var scores = PLScores.find({studentId: Meteor.userId(), world: 'ocean'}).fetch()[0];
	var plScore = scores.stringScore + scores.iScore + scores.reasonScore;
	var world = globalWorlds['#oceanworld'];
	var minPL = world.minString + world.minI + world.minReason;
	var percentage = 100 * plScore/minPL;
	Session.set('netErrorMessage',
							'You win! You now have a mastery level of ' + percentage.toFixed(0) + '% for this activity.');
	netAct.saveState();

	//mark the current language as complete
	Meteor.call('addCompletedLanguage', netAct.language._id);

	netAct.net.fall(-1, netAct.depth, function () {
		setTimeout(function () {
			netAct.reset();
		}, 3000);
	});
}

NetActivity.prototype.shrinkReward = function () {
	if (this.isLoading) {
		return;
	}

	this.pointsGain -= 5;
	this.penalty += 5;
	if (this.pointsGain < 0) {
		this.pointsGain = 0;
	}
	Session.set('netPointsDisplay', this.pointsGain);
	this.net.shrinkPearl();
	this.saveState();
}

NetActivity.prototype.checkFinishedParsings = function () {
	if (this.strandIndex >= this.net.numColors) {
		this.collectReward();
	} else {
		Session.set('netChoosingMode', 'parsing');
		this.removeTrident();
		this.saveState();
	}
}

NetActivity.prototype.reset = function () {
	//reset the activity
	this.removeTrident();
	this.strandIndex = 0;
	this.redoNet();

	//reset Session things
	Session.set('netChoosingMode', 'language');
	Session.set('netStringChoice', '');
	Session.set('netParsingChoice', '');
	Session.set('netIChoice', '');
	Session.set('netReasonChoice', '');
	Session.set('netErrorMessage', '');

	//save
	this.saveState();
}

NetActivity.prototype.shootStrand = function () {
	//update message
	Session.set('netErrorMessage', 'Correct! I can\'t pump this parsing and stay in the language.');

	//mark the current parsing as complete so the parsing button gets disabled
	var completedParsings = Session.get('netCompletedParsings');
	completedParsings.push(Session.get('netParsingChoice'));
	Session.set('netCompletedParsings', completedParsings);

	//hit the strand
	var netAct = this;
	netAct.trident.drawBack(50, 1000, function () {
		netAct.hitStrand();
	});
}

NetActivity.prototype.shootAndMiss = function () {
	//update message
	Session.set('netErrorMessage', 'Either this isn\'t true, or this wouldn\'t cause xy<sup><em>' + Session.get('netIChoice') + 
																		'</em></sup>z to not be in the language. Pick a different reason.');
	
	//miss the strand
	var netAct = this;
	netAct.trident.drawBack(100, 1000, function () {
		netAct.missStrand();
	});
}

NetActivity.prototype.hitStrand = function () {
	//calculate the position of the target strand and the distance to it
	var targetPos = this.net.strandWorldPosition(this.strandIndex);
	var distance = new THREE.Vector3().subVectors(targetPos, this.trident.frame.position).length();

	//tween the trident to the target position, then knock the target strand backwards
	var netAct = this;
	netAct.trident.launchTween = new TWEEN.Tween(netAct.trident.frame.position).to(targetPos, distance).onComplete(function () {
		netAct.net.destroyColoredStrands(netAct.strandIndex);
		netAct.strandIndex++;
		netAct.trident.reset();
		netAct.checkFinishedParsings();
	}).start();
}

NetActivity.prototype.missStrand = function () {
	//stop drawing the trident
	if (this.trident.drawTween) {
		this.trident.drawTween.stop();
	}
	
	//find the angle to the horizontal at which the trident is launched
	var launchAngle = this.trident.frame.rotation.x;

	//break the velocity down into horizontal and vertical (z and y) components
	var velocity = 450;
	var zVelocity = velocity * Math.cos(launchAngle);
	var yVelocity = velocity * Math.sin(launchAngle);

	//find the total time of flight
	var flightTime;
	if (yVelocity != 0) {
		flightTime = Math.abs(-2 * yVelocity/Y_ACCEL);
	} else {
		flightTime = Math.sqrt(2 * this.trident.frame.position.y/-Y_ACCEL); 
	}
	
	//tween between 0 and flightTime, updating the trident's position based on projectile motion at each point in time
	var netAct = this;
	var trident = netAct.trident;
	var time = {t: 0}
	var finalTime = {t: flightTime};
	trident.launchTween = new TWEEN.Tween(time).to(finalTime, flightTime).start();

	var tween = new TWEEN.Tween(time).to(finalTime, flightTime * TRIDENT_TWEEN_TIME).onUpdate(function () {
		var y = yVelocity * time.t + 0.5 * Y_ACCEL * time.t * time.t;
		var z = -zVelocity * time.t;
		trident.frame.position.set(trident.frame.position.x, y, z);

		//rotate the tangent to follow the tangent of its trajectory:
		//find the derivative of y w.r.t time.t
		var yPrime = yVelocity + Y_ACCEL * time.t;

		//the angle of x-rotation is the inverse tangent of the y-derivative, scaled by 1/(2PI)
		var angle = Math.atan(yPrime)/(2 * Math.PI);
		trident.frame.rotation.x = angle;
	}).onComplete(function () {
		trident.reset();
		//netAct.shrinkReward();
	}).start();
}

NetActivity.prototype.strandWorldPosition = function (index) {
	this.frame.updateMatrixWorld();
	var vector = new THREE.Vector3();
	vector.setFromMatrixPosition(this.net.strands[index].matrixWorld);
	return vector;
}

