//******//
//GLOBALS//
//******//

//water colors
var blues = [0x00e5ee, 0x1e90ff];

//colors for transitions
var penColors = {
	purple: 0x8b008b,
	orange: 0xff7f00
};

var icebergLangs = [];

//******//
//END GLOBALS//
//******//

//******//
//CONSTRUCTOR//
//******//

/*
IcebergActivity()
Purpose: constructs a new IcebergActivity with a iceberg and shore
Origin: center of front edge
Extends down negative z-axis, up positive y-axis
*/
function IcebergActivity (width, depth, state) {
	//finite languages from the database
	icebergLangs = IceLanguages.find({}).fetch().map(function (langEntry) {
		return new RegexLanguage(langEntry.regex);
	});

	//directly from parameters
	this.width = width;
	this.depth = depth;
	this.state = state;

	//current state number (0, 1, 2, ...) from state name
	var stateName = this.state.name;
	this.currentState = parseInt(stateName.substring(stateName.indexOf('IcebergState') + 'IcebergState'.length, stateName.length));

	//graphical objects:
	this.frame = new THREE.Object3D();

	//penguin
	this.penguin = new Penguin(0.03 * this.depth, 'icebergPenguin');
	this.resetPenguin();
	this.frame.add(this.penguin.frame);

	//ice water
	this.floor = this.makeFloor();
	this.floor.position.set(-0.5 * this.width, 0, 0);
	this.frame.add(this.floor);

	//shore
	this.shore = this.makeShore();
	this.shore.position.set(0.5 * this.width - this.shoreWidth, 0, 0);
	this.frame.add(this.shore);

	//stone setup
	var floorPos = this.floor.position;
	this.icebergRadius = 0.075 * this.depth;
	this.icebergName = 'icebergSS';

	//positions for stones - to dictate where new stones are placed
	this.icebergPositions = [
		new THREE.Vector3(floorPos.x + 0.0 * this.floorWidth, 0, floorPos.z - 0.5 * this.floorDepth),
		new THREE.Vector3(floorPos.x + 0.1 * this.floorWidth, 0, floorPos.z - 0.2 * this.floorDepth),
		new THREE.Vector3(floorPos.x + 0.15 * this.floorWidth, 0, floorPos.z - 0.7 * this.floorDepth),
		new THREE.Vector3(floorPos.x + 0.25 * this.floorWidth, 0, floorPos.z - 0.4 * this.floorDepth),
		new THREE.Vector3(floorPos.x + 0.35 * this.floorWidth, 0, floorPos.z - 0.6 * this.floorDepth),
		new THREE.Vector3(floorPos.x + 0.4 * this.floorWidth, 0, floorPos.z - 0.2 * this.floorDepth),
		new THREE.Vector3(floorPos.x + 0.5 * this.floorWidth, 0, floorPos.z - 0.5 * this.floorDepth),
		new THREE.Vector3(floorPos.x + 0.6 * this.floorWidth, 0, floorPos.z - 0.7 * this.floorDepth),
		new THREE.Vector3(floorPos.x + 0.7 * this.floorWidth, 0, floorPos.z - 0.3 * this.floorDepth),
		new THREE.Vector3(floorPos.x + 0.8 * this.floorWidth, 0, floorPos.z - 0.6 * this.floorDepth),
		new THREE.Vector3(floorPos.x + 0.85 * this.floorWidth, 0, floorPos.z - 0.2 * this.floorDepth)
	];

	//iceberg colors
	//this.icebergColors = [0xEE0000, 0xEE0000, 0xCD0000, 0xCD0000, 0xB0171F, 0xB0171F, 0x8B1A1A, 0x8B1A1A, 0x8B0000, 0x8B0000, 0x800000];
	this.icebergColors = [0xe7e7e7, 0xcccccc, 0x969696, 0x7f7f7f, 0x5c5c5c, 0x424242, 0x3d3d3d, 0x262626, 0x1f1f1f, 0x030303, 0x000000];
	this.finalIcebergColor = 0x00c78c;

	//load stones and transitions from the database state
	this.initStones();
	this.initTransitions();
	
	//snowflake properties (for sending out snowflakes during testing)
	this.snowflakeName = 'icebergSnowflake';
	this.snowflakeRadius = 0.1 * this.depth;

	//killerwhale properties (for sending out killerwhale during testing)
	this.killerwhaleName = 'icebergKillerWhale';
	this.killerwhaleRadius = 0.05 * this.depth;
	this.killerwhaleLength = 0.15 * this.depth;

	//set up the language
	this.langIndex = this.state.langIndex;
	this.setLanguage();

	//test cases
	this.testCasesPassed = this.state.testsPassed;
	this.numTestCases = 2;
	this.pointsGain = 10;

	//hints
	this.maxHints = 2;
	this.hintsUsed = BayesFeatures.find({studentId: Meteor.userId(), world: 'ice'}).fetch()[0].hintsUsed;
	this.checkHintsUsed();
}

//******//
//END CONSTRUCTOR//
//******//

//******//
//DATABASE//
//******//

/*
initStones()
Purpose: initializes the stones from the database state
*/
IcebergActivity.prototype.initStones = function () {
	this.stones = [];
	this.numStones = 0;
	for (var s = 0; s < this.icebergPositions.length; s++) {
		this.stones[s] = null;
	}

	var stateStones = this.state.stones;
	for (var i in stateStones) {
		var stoneIndex = stateStones[i].name.substring(this.icebergName.length, stateStones[i].name.length);
		var iceberg = new Iceberg(this.icebergRadius, this.icebergColors[stoneIndex], this.icebergName + stoneIndex, stoneIndex);
		iceberg.isFinal = stateStones[i].isFinal;
		if (iceberg.isFinal) {
			iceberg.highlight(this.finalIcebergColor);
		}
		iceberg.frame.position.copy(this.icebergPositions[stoneIndex]);
		this.frame.add(iceberg.frame);
		this.stones[stoneIndex] = iceberg;
		this.numStones++;
	}
}

/*
initTransitions()
Purpose: initializes the transitions and transitionObjects from the database state
*/
IcebergActivity.prototype.initTransitions = function () {
	this.transitions = {
		purple: {},
		orange: {}
	};
	this.transitionObjects = [];

	var stateTransitions = this.state.transitions;
	for (var color in stateTransitions) {
		for (var transKey in stateTransitions[color]) {
			var stone1 = transKey;
			var stone2 = stateTransitions[color][transKey];
			this.firstStone = this.getStoneByName(stone1);
			if (this.firstStone && stone2 != '') {
				this.transColorName = color;
				this.transitionColor = penColors[this.transColorName];
				this.addTransition(stone2);
			}
		}
	}
	this.transColorName = undefined;
	this.transitionColor = undefined;
}

/*
save()
Purpose: saves the current state and action into the database, and increments the currentState number
*/
IcebergActivity.prototype.save = function (actionType, actionStone1, actionStone2, actionTrans) {
	if (!this.username) {
		return;
	}

	var nextState = this.currentState + 1;
	var action = {
		fromState: this.username + 'IcebergState' + this.currentState,
		toState : this.username + 'IcebergState' + nextState,
		studentId: Meteor.userId(),
		langIndex: this.langIndex,
		date: new Date(),
		type: actionType,
		stone1: actionStone1, 
		stone2: actionStone2,
		trans: actionTrans
	};
	Meteor.call('insertIcebergAction', action);

	this.currentState++;
	var nextStateStones = [];
	for (var i in this.stones) {
		if (this.stones[i]) {
			nextStateStones.push({name: this.stones[i].name, isFinal: this.stones[i].isFinal});
		}
	}
	var correct = this.testCasesPassed >= this.numTestCases;
	var state = {
		name: this.username + 'IcebergState' + this.currentState,
		studentId: Meteor.userId(),
		date: new Date(),
		stones: nextStateStones,
		transitions: this.transitions,
		testsPassed: this.testCasesPassed,
		langIndex: this.langIndex,
		isCorrect: correct
	};
	Meteor.call('insertIcebergState', state);
}

/*
addTimeTaken()
Purpose: adds the time from the most recent start date until now to the time taken on the current patter
*/
IcebergActivity.prototype.addTimeTaken = function () {
	var time = new Date() - this.startDate;
	Meteor.call('addTimeTaken', 'ice', time);
	this.startDate = new Date();
}

//******//
//END DATABASE//
//******//

//******//
//HINTS//
//******//

/*
checkHintsUsed()
Purpose: enables or disables the hint button based on how many hints have been used on the current pattern
*/
IcebergActivity.prototype.checkHintsUsed = function () {
	if (this.hintsUsed >= this.maxHints) {
		$('#icebergHintButton').prop('disabled', true).addClass('disabled');
	} else {
		$('#icebergHintButton').prop('disabled', false).removeClass('disabled');
	}
}

/*
getHint()
Purpose: gets a list of hints from the server, displays them in the UI, and updates this.hintsUsed
*/
IcebergActivity.prototype.getHint = function () {
	if (this.hintsUsed >= this.maxHints) {
		$('#icebergHintButton').prop('disabled', true).addClass('disabled');
		return;
	}

	$('#icebergHintCover').css('visibility', 'visible');
	var icebergAct = this;
	var currentStateName = this.username + 'IcebergState' + this.currentState;
	Meteor.call('getIcebergHint', currentStateName, function (error, result) {
		if (error || !result) {
			return;
		} 
		$('#icebergHintCover').css('visibility', 'hidden');
		var translations = result.map(function (hint) {
			return icebergAct.translateHint(hint);
		});
		Session.set('icebergInstructions', icebergAct.hintMarkup(uniqueArray(translations)));
		if (hasHint(result)) {
			icebergAct.hintsUsed++;
			icebergAct.checkHintsUsed();
			Meteor.call('updateHints', 'ice', icebergAct.hintsUsed);
		}
	});
}

/*
hasHint()
Purpose: helper function that returns true iff the given hints array contains at least one non-null element
Parameters:
	hints (array): hints to check non-nullness
*/
function hasHint (hints) {
	for (var i in hints) {
		if (hints[i]) {
			return true;
		}
	}
	return false;
}

/*
uniqueArray()
Purpose: helper function that returns a new array with the unique elements of a
Parameters:
	a (array): array to unique-ify
*/
function uniqueArray (a) {
  var seen = {};
  return a.filter(function(item) {
    return seen.hasOwnProperty(item) ? false : (seen[item] = true);
  });
}

/*
hintMarkup()
Purpose: returns the HTML for an array of hint strings
Parameters:
	hints (array): hints to get markup for
*/
IcebergActivity.prototype.hintMarkup = function (hints) {
	var result = 'Try any of the following actions, in any order:';
	result += '<ul>';
	for (var i in hints) {
		result += '<li>' + hints[i] + '</li>';
	}
	result += '</ul>';
	return result;
}

/*
translateHint()
Purpose: translates the given hint object into a user-readable string
Parameters:
	hint (object): hint to translate
*/
IcebergActivity.prototype.translateHint = function (hint) {
	if (!hint) {
		return 'Sorry, no hint available!';
	}
	var result = '';

	if (hint.type == 'markFinal') {
		result += 'Mark';
		var stoneNum = hint.stone1.substring(this.icebergName.length, hint.stone1.length);
		stoneNum++;
		result += ' iceberg ' + stoneNum;
		result += ' as final';
		return result;
	}

	if (hint.type == 'markNotFinal') {
		result += 'Mark';
		var stoneNum = hint.stone1.substring(this.icebergName.length, hint.stone1.length);
		stoneNum++;
		result += ' iceberg ' + stoneNum;
		result += ' as not final';
		return result;
	}

	result += capitalize(hint.type);
	if (result == 'Reset') {
		return result;
	}

	if (!hint.trans) {
		if (!hint.stone1) {
			result += ' an iceberg';
		} else {
			var stoneNum = hint.stone1.substring(this.icebergName.length, hint.stone1.length);
			stoneNum++;
			result += ' iceberg ' + stoneNum;
		}
	} else if (hint.stone1 && hint.stone2) {
		var transColor = hint.trans.substring(0, hint.trans.indexOf('transition'));
		var stone1Num = parseInt(hint.stone1.substring(this.icebergName.length, hint.stone1.length));
		stone1Num++;
		var stone2Num = parseInt(hint.stone2.substring(this.icebergName.length, hint.stone2.length));
		stone2Num++;
		var article = transColor == 'purple' ? ' a ' : ' an ';
		result += article + transColor + ' transition from iceberg ' + stone1Num + ' to iceberg ' + stone2Num;
	}
	
	return result;
}

//******//
//END HINTS//
//******//

//******//
//LANGUAGE//
//******//

/*
setLanguage()
Purpose: sets the language to either:
				 the global language at this.langIndex, or:
				 a random FiniteLangugae (if the system ran out of global languages)
*/
IcebergActivity.prototype.setLanguage = function () {
	if (this.langIndex >= icebergLangs.length) {
		this.langLength = Math.floor(randomInRange(4, this.icebergPositions.length - 2));
		this.langLength = 4; //for testing only!
		this.language = new RegexLanguage(null, langLength);
	} else {
		this.language = icebergLangs[this.langIndex];
	}

	Session.set('icebergHeader', '<p>Your structure can only accept the following patterns:<br>' + 
															this.language.description() + '</p>');
}

/*
nextLanguage()
Purpose: sets the language to the next available one and resets the system
*/
IcebergActivity.prototype.nextLanguage = function () {
	this.hintsUsed = 0;
	this.checkHintsUsed();
	Meteor.call('resetBayesFeatures', 'ice');
	this.langIndex++;
	this.setLanguage();
	this.reset();
}

//******//
//END LANGUAGE//
//******//

//******//
//RESET//
//******//

/*
reset()
Purpose: clears the current DFA and prepares the system for a new language
*/
IcebergActivity.prototype.reset = function () {
	for (var i in this.stones) {
		if (this.stones[i]) {
			this.removeStone(this.stones[i].name);
		}
	}
	this.stones = [];
	this.testCasesPassed = 0;
	this.resetPenguin();

	this.firstStone = undefined;
	this.secondStone = undefined;

	Session.set('icebergInstructions', 'Click the buttons to build a structure that will guide the penguin across the floor.');
	$('#iceworldBtnInstruc').show();
	$('#icebergHintText').show();
	$('#nextLangButton').hide();
	$('#iceworldButtonDiv button').prop('disabled', false).removeClass('disabled');
	this.checkHintsUsed();

	Meteor.call('incrementResets', 'ice');

	this.save('reset', null, null, null);
}

/*
resetPenguin()
Purpose: resets the penguin to its initial position and rotation (also stops penguin's movement)
*/
IcebergActivity.prototype.resetPenguin = function () {
	this.penguin.stopMoving();
	this.penguin.frame.position.set(0, 0, -this.penguin.bodyLength/2);
	this.penguin.frame.rotation.set(-Math.PI/5, 0, 0);
}

//******//
//END RESET//
//******//

//******//
//GRAPHICS//
//******//

/*
makeFloor()
Purpose: returns a frame containing a planar blue floor
Origin: center of front edge
Extends down negative z-axis, in both x-directions
*/
IcebergActivity.prototype.makeFloor = function () {
	var floorFrame = new THREE.Object3D();

	this.floorWidth = 0.85 * this.width;
	this.floorDepth = 1.0 * this.depth;

	var floorGeom = new THREE.PlaneGeometry(this.width, this.floorDepth);
	var floorMat = fadedMaterial(floorGeom, blues);
	floorMat.transparent = true;
	floorMat.opacity = 0.5;
	var floor = new THREE.Mesh(floorGeom, floorMat);

	floor.rotation.x = -Math.PI/2;
	floor.position.set(0.5 * this.floorWidth, 0, -0.5 * this.floorDepth);
	floorFrame.add(floor);

	return floorFrame;
}

/*
makeShore()
Purpose: returns a frame containing a brown boxed shore
Origin: Front left corner
Extends along positive x-axis, down negative z-axis
*/
IcebergActivity.prototype.makeShore = function () {
	var shoreFrame = new THREE.Object3D();
	shoreFrame.name = 'shoreFrame';

	this.shoreWidth = this.width - this.floorWidth;

	var shoreGeom = new THREE.BoxGeometry(this.shoreWidth, 100, this.depth);
	var shoreMat = new THREE.MeshBasicMaterial({color: 0x8b7355});
	var shore = new THREE.Mesh(shoreGeom, shoreMat);
	shore.name = 'shore';

	shore.position.set(0.5 * this.shoreWidth, 0, -0.5 * this.depth);
	shoreFrame.add(shore);

	return shoreFrame;
}

//******//
//END GRAPHICS//
//******//

//******//
//TESTING//
//******//

/*
test()
Purpose: tests the user's DFA on two strings - one in the language and one not in the language
*/
IcebergActivity.prototype.test = function () {
	//build a string in the language and a random string that is (most likely) not in the language
	var goodStr = this.language.randomString();
	//var badStr = numberString(Math.floor(randomInRange(1, 5)));
	var badStr = this.language.badString();

	this.testCasesPassed = 0;

	Meteor.call('incrementTests', 'ice');
	this.addTimeTaken();

	//test the good string, then test the bad string
	var icebergAct = this;
	icebergAct.testString(goodStr, function () {
		icebergAct.testString(badStr, function () {
			icebergAct.stopTesting();
			icebergAct.endOfTesting();
		});
	});
}

/*
stopTesting()
Purpose: halts the current testing process and resets the buttons and graphics (doesn't reset the DFA!)
*/
IcebergActivity.prototype.stopTesting = function () {
	//re-enable the buttons
	$('#iceworldHeaderDiv button').prop('disabled', false).removeClass('disabled');
	$('#currentPen').prop('disabled', true);
	$('#testButton').html('TEST').css({'opacity': 0.5});
	if (this.numStones >= this.icebergPositions.length) {
		$('#addStoneButton').prop('disabled', true).addClass('disabled');
	}
	this.checkHintsUsed();

	//reset the startDate (throw away the time used for testing)
	this.startDate = new Date();

	//cancel all timed out functions to stop the testing process
	var highestTimeoutId = setTimeout(";");
	for (var i = 0 ; i < highestTimeoutId ; i++) {
	  clearTimeout(i); 
	}

	//remove the current 'send' object, if any
	if (this.currentSendObj) {
		this.frame.remove(this.currentSendObj.frame);
	}

	//remove the snowflakes on the shore, if any
	if (this.purpleSnowflake) {
		this.frame.remove(this.purpleSnowflake.frame);
	}
	if (this.orangeSnowflake) {
		this.frame.remove(this.orangeSnowflake.frame);
	}

	//remove the attacking killerwhale, if any
	if (this.attackKillerWhale) {
		this.frame.remove(this.attackKillerWhale.frame);
		this.attackKillerWhale = undefined;
	}

	//reset the penguin
	this.resetPenguin();

	//update instructions
	Session.set('icebergInstructions', 'Keep building!');
}

/*
testString()
Purpose: runs the user's DFA on the given string by sending out a snowflake or killerwhale for each character
				 includes an optional callback
*/
IcebergActivity.prototype.testString = function (str, callback) {
	//update instructions
	Session.set('icebergInstructions', 'Testing: ' + coloredString(numbersToWords(str)))

	//stop any current testing process
	this.stopTesting();	

	//disable all buttons except the testing button
	$('#iceworldButtonDiv button').prop('disabled', true).addClass('disabled');
	$('#testButton').prop('disabled', false).removeClass('disabled');
	$('#testButton').html('STOP').css({'opacity': 0.5});

	//no stones => fail
	if (this.stones.length == 0 || !this.hasStones()) {
		this.fail('You need at least one iceberg in your structure!');
		return;
	}

	//move the penguin to the first stone
	var initialStone = this.getStoneByName(this.stones[0].name);
	var initialPosition = initialStone.frame.position;
	this.penguin.frame.position.copy(initialStone.frame.position);
	this.penguin.frame.position.y += this.icebergRadius;
	this.penguin.frame.rotation.x = -Math.PI/3;
	this.currentStoneName = this.stones[0].name;

	this.stepTime = 3000;
	this.testIndex = 0;
	this.testStr = numbersToWords(str);

	//get the info about the test string from the language
	var strMap = this.language.stringMap(str);

	var icebergAct = this;

	//send out an object for each character in the test string
	for (var i in strMap) {
		var obj = strMap[i];
		if (obj.okay) {
			if (obj.color == 'purple') {
				setTimeout(function () {
					icebergAct.sendPurpleSnowflake();
				}, i * icebergAct.stepTime);
			} else {
				setTimeout(function () {
					icebergAct.sendOrangeSnowflake();
				}, i * icebergAct.stepTime);
			}
		} else {
			if (obj.color == 'purple') {
				setTimeout(function () {
					icebergAct.sendPurpleKillerWhale();
				}, i * icebergAct.stepTime);
			} else {
				setTimeout(function () {
					icebergAct.sendOrangeKillerWhale();
				}, i * icebergAct.stepTime);
			}
		}
	}

	//final check - after the testing is complete
	setTimeout(function () {
		icebergAct.finalCheck(str);
	}, strMap.length * icebergAct.stepTime);

	//optional callback - after the final check
	if (callback) {
		setTimeout(function () {
			callback();
		}, (strMap.length + 1) * icebergAct.stepTime);
	}
}

IcebergActivity.prototype.hasStones = function () {
	for (var s in this.stones) {
		if (this.stones[s]) {
			return true;
		}
	}
	return false;
}

/*
sendPurpleSnowflake()
Purpose: sends out a purple snowflake
				 this and the next three functions are used for the setTimeouts in testString to avoid parameter issues
*/
IcebergActivity.prototype.sendPurpleSnowflake = function () {
	this.sendSnowflake('purple');
}

/*
sendOrangeSnowflake()
Purpose: sends out an orange snowflake
*/
IcebergActivity.prototype.sendOrangeSnowflake = function () {
	this.sendSnowflake('orange');
}

/*
sendPurpleKillerWhale()
Purpose: sends out a purple killerwhale
*/
IcebergActivity.prototype.sendPurpleKillerWhale = function () {
	this.sendKillerWhale('purple');
}

/*
sendOrangeKillerWhale()
Purpose: sends out an orange killerwhale
*/
IcebergActivity.prototype.sendOrangeKillerWhale = function () {
	this.sendKillerWhale('orange');
}

/*
sendSnowflake()
Purpose: sends out a snowflake of the given color
*/
IcebergActivity.prototype.sendSnowflake = function (color) {
	//remove the current snowflake or killerwhale (if it exists)
	if (this.currentSendObj) {
		this.frame.remove(this.currentSendObj.frame);
	}

	//indicate where we are in the test string
	Session.set('icebergInstructions', 'Testing: ' + boldString(this.testStr, this.testIndex));
	$('#iceworldInstructions').textfill({minFontPixels: 10, maxFontPixels: 18});
	
	//create and add the snowflake
	var snowflake = new Snowflake(this.snowflakeRadius, color, this.snowflakeName);
	snowflake.frame.position.set(0, this.icebergRadius, 0);
	snowflake.frame.rotation.x = -Math.PI/3;
	this.frame.add(snowflake.frame);
	this.currentSendObj = snowflake;

	//make the next transition
	this.takeTransition(color);
}

/*
sendKillerWhale()
Purpose: sends out a killerwhale of the given color
*/
IcebergActivity.prototype.sendKillerWhale = function (color) {
	//remove the current snowflake or killerwhale (if it exists)
	if (this.currentSendObj) {
		this.frame.remove(this.currentSendObj.frame);
	}

	//indicate where we are in the test string
	Session.set('icebergInstructions', 'Testing: ' + boldString(this.testStr, this.testIndex));
	$('#iceworldInstructions').textfill({minFontPixels: 10, maxFontPixels: 18});

	//add an attack killerwhale
	this.addAttackKillerWhale();

	//create and add the killerwhale
	var killerwhale = new KillerWhale(this.killerwhaleLength, color, this.killerwhaleName);
	killerwhale.frame.position.set(0, this.icebergRadius, -0.5 * this.killerwhaleLength);
	killerwhale.frame.rotation.set(Math.PI, 0, 0);
	this.frame.add(killerwhale.frame);
	this.currentSendObj = killerwhale;

	//make the next transition
	this.takeTransition(color);
}

/*
addAttackKillerWhale()
Purpose: creates and adds an attack killerwhale at the shore if there isn't one already
*/
IcebergActivity.prototype.addAttackKillerWhale = function () {
	if (!this.attackKillerWhale) {
		this.attackKillerWhale = new KillerWhale(this.killerwhaleLength, 'green', this.killerwhaleName);
		this.attackKillerWhale.frame.position.set(0.4 * this.width - this.shoreWidth, this.attackKillerWhale.length + 50, -0.3 * this.depth);
		this.attackKillerWhale.frame.rotation.set(-Math.PI/2, 0, 0);
		this.frame.add(this.attackKillerWhale.frame);
	}
}

/*
takeTransition()
Purpose: moves the penguin to the next stone by taking the colored transition from its current stone
*/
IcebergActivity.prototype.takeTransition = function (color) {
	//get the name of the next stone based on the colored transition from the current stone
	var nextStoneName = this.transitions[color][this.currentStoneName];

	//missing transition => fail
	if (!nextStoneName) {
		this.fail('Your structure is missing a transition!');
		return;
	}

	//move to the next stone
	var nextPos = this.getStoneByName(nextStoneName).frame.position.clone();
	nextPos.y += this.icebergRadius;
	this.penguin.move(nextPos);
	this.currentStoneName = nextStoneName;

	this.testIndex++;
}

/*
fail()
Purpose: swims the penguin away and informs the user of the reason for failure
				 called when the user fails in some way - 
				 missing states or transitions, accepting string not in language, rejecting string in language, etc.
*/
IcebergActivity.prototype.fail = function (reason) {
	var icebergAct = this;

	setTimeout(function () {
		icebergAct.penguin.move(new THREE.Vector3(0, 0.25 * icebergAct.depth, -1.0 * icebergAct.depth), 2000, function () {icebergAct.stopTesting()});
	}, 500);

	if (reason) {
		Session.set('icebergInstructions', reason);
	}

	Meteor.call('updateIncorrectDFAScore', 'ice');
}

/*
finalCheck()
Purpose: compares the final state to what it should be based on whether the string is in the language,
				 and takes the appropriate action (collecting snowflakes, sending out the attack killerwhale, etc.)
				 called at the end of a test case
*/
IcebergActivity.prototype.finalCheck = function (str) {
	if (this.currentSendObj) {
		this.frame.remove(this.currentSendObj.frame);
	}

	var stone = this.getStoneByName(this.currentStoneName);

	//string in language - should be on final stone
	if (this.language.inLanguage(str)) {
		this.purpleSnowflake = new Snowflake(this.snowflakeRadius, 'purple', this.snowflakeName);
		this.orangeSnowflake = new Snowflake(this.snowflakeRadius, 'orange', this.snowflakeName);

		this.purpleSnowflake.frame.position.set(0.5 * this.width - 0.5 * this.shoreWidth, this.snowflakeRadius, -0.75 * this.depth);
		this.frame.add(this.purpleSnowflake.frame);

		this.orangeSnowflake.frame.position.set(0.5 * this.width - 0.5 * this.shoreWidth, this.snowflakeRadius, -0.25 * this.depth);
		this.frame.add(this.orangeSnowflake.frame);

		//on final stone => happiness: go get snowflakes on shore
		if (stone.isFinal) {
			this.testCasesPassed++;
			var congrats = 'Passed ' + this.testCasesPassed + (this.testCasesPassed == 1 ? ' pattern' : ' patterns') + ' out of ' + this.numTestCases + '.';
			Session.set('icebergInstructions', 'Congratulations! You collected the snowflakes!<br>' + congrats);
			this.penguin.move(new THREE.Vector3(0.5 * this.width - 0.5 * this.shoreWidth, 100, -0.5 * this.depth));
		} 

		//not on final stone => sadness
		else {
			this.fail('You need to be on a final (green) iceberg to collect the snowflakes!');
		}
	} 

	//string not in language - should not be on final stone
	else {
		//add an attack killerwhale
		this.addAttackKillerWhale();

		//not on final stone => happiness: killerwhale moves away
		if (!stone.isFinal) {
			this.testCasesPassed++;
			var congrats = 'Passed ' + this.testCasesPassed + (this.testCasesPassed == 1 ? ' pattern' : ' patterns') + ' out of ' + this.numTestCases + '.';
			Session.set('icebergInstructions', 'Congratulations! You avoided the killerwhale!<br>' + congrats);
			this.attackKillerWhale.move(new THREE.Vector3(this.width, 0, -0.5 * this.depth));
		} 

		//on final stone => sadness: killerwhale attacks
		else {
			Session.set('icebergInstructions', 'Oh no! You\'re on a green stone, so the killerwhale can attack!')
			var icebergAct = this;
			icebergAct.attackKillerWhale.move(icebergAct.penguin.frame.position, 2000, function () {
				icebergAct.fail();
			});
		}
	}
}

/*
allCasesPassed()
Purpose: returns true iff all test cases for the current language have been passed
				 updates the html if they have been passed
*/
IcebergActivity.prototype.allCasesPassed = function () {
	if (this.testCasesPassed < this.numTestCases) {
		setTimeout(function () {
			$('#icebergHintText').show();
			$('#nextLangButton').hide();
		}, 0);
		return false;
	}

	Session.set('icebergInstructions', 
						'Congratulations! You passed all ' + this.numTestCases + ' test patterns!');
	$('#iceworldBtnInstruc').hide();
	$('#icebergHintText').hide();
	$('#nextLangButton').show();
	$('#iceworldButtonDiv button').prop('disabled', true).addClass('disabled');
	$('#backButton').prop('disabled', false).removeClass('disabled');
	return true;
}

/*
endOfTesting()
Purpose: checks whether all test cases are passed, and if so, updates the ice experience points
				 called at the end of all test cases
*/
IcebergActivity.prototype.endOfTesting = function () {
	if (!this.allCasesPassed()) {
		return;
	}

	this.save('endTesting', null, null, null, null);

	Meteor.call('updateCorrectDFAScore', 'ice', function (error, result) {
		Session.set('icebergInstructions', 
									Session.get('icebergInstructions') + 
									'<br>Click "Next Pattern" to continue.');
	});
}

//******//
//END TESTING//
//******//

//******//
//EVENT HANDLERS//
//******//

/*
handleStoneClick()
Purpose: works on a transition between stones (selecting first stone or adding transition),
				 deletes the clicked stone, 
				 or marks the clicked stone as final, depending on the mode and transColorName
*/
IcebergActivity.prototype.handleStoneClick = function (objName) {
	var name = objName.substring(objName.indexOf(this.icebergName), objName.length);

	//working on a transition between two stones
	if (this.transColorName) {
		this.transitionColor = penColors[this.transColorName];
		if (!this.firstStone) {
			this.selectFirstStone(name);
		} else {
			this.addTransition(name);
		}
	} 

	//deleting a stone
	else if (this.deleteMode) {
		this.removeStone(name);
	} 

	//marking a stone as final
	else if (this.markStoneFinal) {
		this.markStoneAsFinal(name);
	}
}

/*
handleTransClick()
Purpose: deletes the clicked transition if this.deleteMode allows it
*/
IcebergActivity.prototype.handleTransClick = function (objName) {
	if (this.deleteMode) {
		var color = objName.substring(0, objName.indexOf('transition'));

		var stone1 = objName.substring(objName.indexOf(this.icebergName), objName.indexOf(this.icebergName) + this.icebergName.length + 2);
		if (!isNumber(stone1[stone1.length - 1])) {
			stone1 = stone1.substring(0, stone1.length - 1);
		}

		this.removeTransFrom(stone1, color);

		Meteor.call('incrementDeletedTransitions', 'ice');
	}
}

//******//
//END EVENT HANDLERS//
//******//

//******//
//ADDING//
//******//

/*
addStone()
Purpose: adds a stone at the next available position and color
*/
IcebergActivity.prototype.addStone = function () {
	//don't add too many stones
	if (this.numStones >= this.icebergPositions.length) {
		return;
	}

	//get the index of the first null element in stones - this is where the next stone will be added
	var stoneIndex = this.stones.length;
	for (var i in this.stones) {
		if (!this.stones[i]) {
			stoneIndex = i;
			break;
		}
	}

	//create and add the new iceberg
	var iceberg = new Iceberg(this.icebergRadius, this.icebergColors[stoneIndex], this.icebergName + stoneIndex, stoneIndex);
	iceberg.frame.position.copy(this.icebergPositions[stoneIndex]);
	this.frame.add(iceberg.frame);
	this.stones[stoneIndex] = iceberg;
	this.numStones++;

	//disable the button if necessary
	if (this.numStones >= this.icebergPositions.length) {
		$('#addStoneButton').prop('disabled', true).addClass('disabled');
	}

	if (this.username) {
		this.save('add', iceberg.name, null, null);
	}
}

/*
selectFirstStone()
Purpose: returns the transition object with the given color that goes to the stone with the given name
*/
IcebergActivity.prototype.selectFirstStone = function (name) {
	this.firstStone = this.getStoneByName(name);
	this.firstStone.highlight(this.transitionColor);
	Session.set('icebergInstructions', 'Click to select your second iceberg.')
}

/*
addTransition()
Purpose: adds a transition between this.firstStone and this.secondStone (including if they're the same stone)
*/
IcebergActivity.prototype.addTransition = function (name) {
	this.secondStone = this.getStoneByName(name);
	if (!this.secondStone) {
		return;
	}

	var trans = this.getTransFrom(this.firstStone.name, this.transColorName);
	if (trans) {
		Meteor.call('incrementChangedTransitions', 'ice');
	}

	this.removeTransFrom(this.firstStone.name, this.transColorName);

	if (this.firstStone.name == this.secondStone.name) {
		this.addSameStoneTrans();
	} else {
		var xSign = this.transColorName == 'purple' ? 1 : -1;
		var start = this.firstStone.frame.position.clone();
		start.x += xSign * 0.5 * this.icebergRadius;
		start.y += randomInRange(0.05 * this.icebergRadius, 0.1 * this.icebergRadius);

		var end = this.secondStone.frame.position.clone();
		end.x += xSign * 0.5 * this.icebergRadius;
		end.y += randomInRange(0.05 * this.icebergRadius, 0.1 * this.icebergRadius);

		var dir = new THREE.Vector3().subVectors(end, start);
		var length = dir.length();
		dir.normalize();
	
		var arrowHelper = new THREE.ArrowHelper(dir, start, length, this.transitionColor, 150, 75);
		arrowHelper.name = this.transitionName() + 'Arrow';
		arrowHelper.children[0].name = arrowHelper.name + 'Line';
		arrowHelper.children[1].name = arrowHelper.name + 'Cone';
		arrowHelper.line.material = new THREE.LineBasicMaterial({color: this.transitionColor, linewidth: 30});
		arrowHelper.stone1 = this.firstStone.name;
		arrowHelper.stone2 = this.secondStone.name;
		arrowHelper.colorName = this.transColorName;
		this.frame.add(arrowHelper);
		this.transitionObjects.push(arrowHelper);
	}

	this.transitions[this.transColorName][this.firstStone.name] = this.secondStone.name;

	if (this.firstStone.isFinal) {
		this.firstStone.highlight(this.finalIcebergColor);
	} else {
		this.firstStone.unhighlight();
	}

	this.save('add', this.firstStone.name, this.secondStone.name, this.transitionName());

	this.firstStone = undefined;
	this.secondStone = undefined;
	Session.set('icebergInstructions', 'Click another stone, or select a different button.');
}

/*
addSameStoneTrans()
Purpose: adds a transition loop from a stone to itself
*/
IcebergActivity.prototype.addSameStoneTrans = function () {
	var transFrame = new THREE.Object3D();
	transFrame.name = this.transitionName() + 'Frame';
	transFrame.stone1 = this.firstStone.name;
	transFrame.stone2 = this.secondStone.name;
	transFrame.colorName = this.transColorName;

	var zSign = this.transColorName == 'purple' ? 1 : -1;

	var start = this.firstStone.frame.position.clone();
	start.y += 0.05 * this.icebergRadius;
	start.z -= zSign * 0.5 * this.icebergRadius;

	var points = [
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(-2 * this.icebergRadius, 0, -3 * zSign * this.icebergRadius),
		new THREE.Vector3(2 * this.icebergRadius, 0, -3 * zSign * this.icebergRadius),
		new THREE.Vector3(0, 0, 0)
	];

	var curve = new THREE.CubicBezierCurve3(points[0], points[1], points[2], points[3]);
	var geom = new THREE.TubeGeometry(curve, 32, 10, 16, true);
	var mat = new THREE.MeshBasicMaterial({color: this.transitionColor});
	var mesh = new THREE.Mesh(geom, mat);
	mesh.name = this.transitionName() + 'Mesh';

	transFrame.add(mesh);

	transFrame.position.copy(start);
	this.frame.add(transFrame);
	this.transitionObjects.push(transFrame);
}

/*
transitionName()
Purpose: returns the base name for a transition
*/
IcebergActivity.prototype.transitionName = function () {
	return this.transColorName + 'transition' + this.firstStone.name + this.secondStone.name;
}

/*
markStoneAsFinal()
Purpose: if the stone with the given name is already final, marks it as not final; otherwise marks it as final
				 also highlights the stone to the appropriate color
*/
IcebergActivity.prototype.markStoneAsFinal = function (name) {
	var stone = this.getStoneByName(name);
	if (stone.isFinal) {
		stone.unhighlight();
		stone.isFinal = false;
		this.save('markNotFinal', stone.name, null, null);
	} else {
		stone.highlight(this.finalIcebergColor);
		stone.isFinal = true;
		this.save('markFinal', stone.name, null, null);
	}
}

//******//
//END ADDING//
//******//

//******//
//REMOVING//
//******//

/*
removeStone()
Purpose: returns the stone object with the given name, as well as all transitions from and to the stone
*/
IcebergActivity.prototype.removeStone = function (name) {
	var stone = this.getStoneByName(name);

	if (!stone) {
		return;
	}

	//remove the graphical stone
	this.frame.remove(stone.frame);

	//remove the transitions from the stone
	this.removeTransFrom(stone.name, 'purple');
	this.removeTransFrom(stone.name, 'orange');

	//remove the transitions to the stone
	this.removeTransTo(stone.name, 'purple');
	this.removeTransTo(stone.name, 'orange');

	//remove the stone from the array
	this.stones[this.stones.indexOf(stone)] = null;
	this.numStones--;

	$('#addStoneButton').prop('disabled', false).removeClass('disabled');

	this.save('delete', stone.name, null, null);
 }

/*
removeTransFrom()
Purpose: removes the transition object with the given color that comes from the stone with the given name
*/
IcebergActivity.prototype.removeTransFrom = function (stone1, color) {
	var trans = this.getTransFrom(stone1, color);
	if (!trans) {
		return;
	}

	var stone2 = this.transitions[color][stone1];

	//remove the graphical object from the frame
	this.frame.remove(trans);

	//remove the string from the transition object
	this.transitions[color][stone1] = '';

	//remove the object from the transitionObjects array
	this.transitionObjects.splice(this.transitionObjects.indexOf(trans), 1);

	this.save('delete', stone1, stone2, color + 'transition' + stone1.name + stone2);
}

/*
removeTransTo()
Purpose: removes the transition object with the given color that goes to the stone with the given name
*/
IcebergActivity.prototype.removeTransTo = function (stone2, color) {
	var trans = this.getTransTo(stone2, color);
	if (!trans) {
		return;
	}

	//remove the graphical object from the frame
	this.frame.remove(trans);

	//remove the string from the transition object
	var stone1 = '';
	for (var key in Object.keys(this.transitions[color])) {
		if (this.transitions[color][key] == stone2) {
			stone1 = key;
			this.transitions[color][key] = '';
		}
	}

	//remove the object from the transitionObjects array
	if (trans) {
		this.transitionObjects.splice(this.transitionObjects.indexOf(trans), 1);
	}

	this.save('delete', stone1, stone2, color + 'transition' + stone1 + stone2);
}

//******//
//END REMOVING//
//******//

//******//
//GETTERS//
//******//

/*
getStoneByName()
Purpose: returns the stone object with the given name
*/
IcebergActivity.prototype.getStoneByName = function (name) {
	for (var i in this.stones) {
		if (this.stones[i] && this.stones[i].name.indexOf(name) != -1) {
			return this.stones[i];
		}
	}
	return undefined;
}

/*
getTransFrom()
Purpose: returns the transition object with the given color that comes from the stone with the given name
*/
IcebergActivity.prototype.getTransFrom = function (stone1, color) {
	for (var i in this.transitionObjects) {
		if (this.transitionObjects[i].stone1 == stone1 && this.transitionObjects[i].colorName == color) {
			return this.transitionObjects[i];
		}
	}
	return undefined;
}

/*
getTransTo()
Purpose: returns the transition object with the given color that goes to the stone with the given name
*/
IcebergActivity.prototype.getTransTo = function (stone2, color) {
	for (var i in this.transitionObjects) {
		if (this.transitionObjects[i].stone2 == stone2 && this.transitionObjects[i].colorName == color) {
			var result = this.transitionObjects[i];
			return result;
		}
	}
	return undefined;
}

//******//
//END GETTERS//
//******//

