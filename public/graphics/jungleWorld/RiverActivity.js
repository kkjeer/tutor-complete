//******//
//GLOBALS//
//******//

//river colors
var blues = [0x00e5ee, 0x1e90ff];

//colors for transitions
var penColors = {
	purple: 0x8b008b,
	orange: 0xff7f00
};

var riverLangs = [];

//******//
//END GLOBALS//
//******//

//******//
//CONSTRUCTOR//
//******//

/*
RiverActivity()
Purpose: constructs a new RiverActivity with a river and shore
Origin: center of front edge
Extends down negative z-axis, up positive y-axis
*/
function RiverActivity (width, depth, state) {
	//finite languages from the database
	riverLangs = RiverLanguages.find({}).fetch().map(function (langEntry) {
		return new FiniteLanguage(langEntry.language);
	});

	//directly from parameters
	this.width = width;
	this.depth = depth;
	this.state = state;

	//current state number (0, 1, 2, ...) from state name
	var stateName = this.state.name;
	this.currentState = parseInt(stateName.substring(stateName.indexOf('RiverState') + 'RiverState'.length, stateName.length));

	//graphical objects:
	this.frame = new THREE.Object3D();

	//butterfly
	this.butterfly = new Butterfly(0.1 * this.depth);
	this.resetButterfly();
	this.frame.add(this.butterfly.frame);

	//river
	this.river = this.makeRiver();
	this.river.position.set(-0.5 * this.width, 0, 0);
	this.frame.add(this.river);

	//shore
	this.shore = this.makeShore();
	this.shore.position.set(0.5 * this.width - this.shoreWidth, 0, 0);
	this.frame.add(this.shore);

	//stone setup
	var riverPos = this.river.position;
	this.stoneRadius = 0.05 * this.depth;
	this.stoneName = 'riverSS';

	//positions for stones - to dictate where new stones are placed
	this.stonePositions = [
		new THREE.Vector3(riverPos.x + 0.0 * this.riverWidth, 0, riverPos.z - 0.5 * this.riverDepth),
		new THREE.Vector3(riverPos.x + 0.1 * this.riverWidth, 0, riverPos.z - 0.2 * this.riverDepth),
		new THREE.Vector3(riverPos.x + 0.15 * this.riverWidth, 0, riverPos.z - 0.7 * this.riverDepth),
		new THREE.Vector3(riverPos.x + 0.25 * this.riverWidth, 0, riverPos.z - 0.4 * this.riverDepth),
		new THREE.Vector3(riverPos.x + 0.35 * this.riverWidth, 0, riverPos.z - 0.6 * this.riverDepth),
		new THREE.Vector3(riverPos.x + 0.4 * this.riverWidth, 0, riverPos.z - 0.2 * this.riverDepth),
		new THREE.Vector3(riverPos.x + 0.5 * this.riverWidth, 0, riverPos.z - 0.5 * this.riverDepth),
		new THREE.Vector3(riverPos.x + 0.6 * this.riverWidth, 0, riverPos.z - 0.7 * this.riverDepth),
		new THREE.Vector3(riverPos.x + 0.7 * this.riverWidth, 0, riverPos.z - 0.3 * this.riverDepth),
		new THREE.Vector3(riverPos.x + 0.8 * this.riverWidth, 0, riverPos.z - 0.6 * this.riverDepth),
		new THREE.Vector3(riverPos.x + 0.85 * this.riverWidth, 0, riverPos.z - 0.2 * this.riverDepth)
	];

	//stone colors
	this.stoneColors = [0xe7e7e7, 0xcccccc, 0x969696, 0x7f7f7f, 0x5c5c5c, 0x424242, 0x3d3d3d, 0x262626, 0x1f1f1f, 0x030303, 0x000000];
	this.finalStoneColor = 0x00c78c;

	//load stones and transitions from the database state
	this.initStones();
	this.initTransitions();
	
	//berry properties (for sending out berries during testing)
	this.berryName = 'riverBerry';
	this.berryRadius = 0.05 * this.depth;

	//snake properties (for sending out snakes during testing)
	this.snakeName = 'riverSnake';
	this.snakeLength = 0.2 * this.depth;

	//set up the language
	this.langIndex = this.state.langIndex;
	this.setLanguage();

	//test cases
	this.testCasesPassed = this.state.testsPassed;
	this.numTestCases = 2;
	this.pointsGain = 10;

	//hints
	this.maxHints = 2;
	this.hintsUsed = BayesFeatures.find({studentId: Meteor.userId(), world: 'jungle'}).fetch()[0].hintsUsed;
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
RiverActivity.prototype.initStones = function () {
	this.stones = [];
	this.numStones = 0;
	for (var s = 0; s < this.stonePositions.length; s++) {
		this.stones[s] = null;
	}

	var stateStones = this.state.stones;
	for (var i in stateStones) {
		var stoneIndex = stateStones[i].name.substring(this.stoneName.length, stateStones[i].name.length);
		var stone = new SteppingStone(this.stoneRadius, this.stoneColors[stoneIndex], this.stoneName + stoneIndex, stoneIndex);
		stone.isFinal = stateStones[i].isFinal;
		if (stone.isFinal) {
			stone.highlight(this.finalStoneColor);
		}
		stone.frame.position.copy(this.stonePositions[stoneIndex]);
		this.frame.add(stone.frame);
		this.stones[stoneIndex] = stone;
		this.numStones++;
	}
}

/*
initTransitions()
Purpose: initializes the transitions and transitionObjects from the database state
*/
RiverActivity.prototype.initTransitions = function () {
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
RiverActivity.prototype.save = function (actionType, actionStone1, actionStone2, actionTrans) {
	if (!this.username) {
		return;
	}

	var nextState = this.currentState + 1;
	var action = {
		fromState: this.username + 'RiverState' + this.currentState,
		toState : this.username + 'RiverState' + nextState,
		studentId: Meteor.userId(),
		langIndex: this.langIndex,
		date: new Date(),
		type: actionType,
		stone1: actionStone1, 
		stone2: actionStone2,
		trans: actionTrans
	};
	Meteor.call('insertRiverAction', action);

	this.currentState++;
	var nextStateStones = [];
	for (var i in this.stones) {
		if (this.stones[i]) {
			nextStateStones.push({name: this.stones[i].name, isFinal: this.stones[i].isFinal});
		}
	}
	var correct = this.testCasesPassed >= this.numTestCases;
	var state = {
		name: this.username + 'RiverState' + this.currentState,
		studentId: Meteor.userId(),
		date: new Date(),
		stones: nextStateStones,
		transitions: this.transitions,
		testsPassed: this.testCasesPassed,
		langIndex: this.langIndex,
		isCorrect: correct
	};
	Meteor.call('insertRiverState', state);
}

/*
addTimeTaken()
Purpose: adds the time from the most recent start date until now to the time taken on the current patter
*/
RiverActivity.prototype.addTimeTaken = function () {
	var time = new Date() - this.startDate;
	console.log('time: ', time);
	Meteor.call('addTimeTaken', 'jungle', time);
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
RiverActivity.prototype.checkHintsUsed = function () {
	if (this.hintsUsed >= this.maxHints) {
		$('#riverHintButton').prop('disabled', true).addClass('disabled');
	} else {
		$('#riverHintButton').prop('disabled', false).removeClass('disabled');
	}
}

/*
getHint()
Purpose: gets a list of hints from the server, displays them in the UI, and updates this.hintsUsed
*/
RiverActivity.prototype.getHint = function () {
	if (this.hintsUsed >= this.maxHints) {
		$('#riverHintButton').prop('disabled', true).addClass('disabled');
		return;
	}

	$('#riverHintCover').css('visibility', 'visible');
	var riverAct = this;
	var currentStateName = this.username + 'RiverState' + this.currentState;
	Meteor.call('getRiverHint', currentStateName, function (error, result) {
		if (error || !result) {
			return;
		} 
		$('#riverHintCover').css('visibility', 'hidden');
		var translations = result.map(function (hint) {
			return riverAct.translateHint(hint);
		});
		Session.set('riverInstructions', riverAct.hintMarkup(uniqueArray(translations)));
		if (hasHint(result)) {
			riverAct.hintsUsed++;
			riverAct.checkHintsUsed();
			Meteor.call('updateHints', 'jungle', riverAct.hintsUsed);
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
RiverActivity.prototype.hintMarkup = function (hints) {
	var result = '<ul>';
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
RiverActivity.prototype.translateHint = function (hint) {
	if (!hint) {
		return 'Sorry, no hint available!';
	}
	var result = '';

	if (hint.type == 'markFinal') {
		result += 'Mark';
		var stoneNum = hint.stone1.substring(this.stoneName.length, hint.stone1.length);
		stoneNum++;
		result += ' stone ' + stoneNum;
		result += ' as final';
		return result;
	}

	if (hint.type == 'markNotFinal') {
		result += 'Mark';
		var stoneNum = hint.stone1.substring(this.stoneName.length, hint.stone1.length);
		stoneNum++;
		result += ' stone ' + stoneNum;
		result += ' as not final';
		return result;
	}

	result += capitalize(hint.type);
	if (result == 'Reset') {
		return result;
	}

	if (!hint.trans) {
		if (!hint.stone1) {
			result += ' a stone.';
		} else {
			var stoneNum = hint.stone1.substring(this.stoneName.length, hint.stone1.length);
			stoneNum++;
			result += ' stone ' + stoneNum;
		}
	} else {
		var transColor = hint.trans.substring(0, hint.trans.indexOf('transition'));
		var stone1Num = parseInt(hint.stone1.substring(this.stoneName.length, hint.stone1.length));
		stone1Num++;
		var stone2Num = parseInt(hint.stone2.substring(this.stoneName.length, hint.stone2.length));
		stone2Num++;
		var article = transColor == 'purple' ? ' a ' : ' an ';
		result += article + transColor + ' transition from stone ' + stone1Num + ' to stone ' + stone2Num;
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
RiverActivity.prototype.setLanguage = function () {
	if (this.langIndex >= riverLangs.length) {
		this.langLength = Math.floor(randomInRange(4, this.stonePositions.length - 2));
		this.langLength = 4; //for testing only!
		this.language = new FiniteLanguage(null, this.langLength);
	} else {
		this.language = riverLangs[this.langIndex];
	}

	Session.set('riverHeader', '<p>Your structure can only accept the following pattern:<br>' + 
															this.language.description() + '</p>');
}

/*
nextLanguage()
Purpose: sets the language to the next available one and resets the system
*/
RiverActivity.prototype.nextLanguage = function () {
	this.hintsUsed = 0;
	this.checkHintsUsed();
	Meteor.call('resetBayesFeatures', 'jungle');
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
RiverActivity.prototype.reset = function () {
	for (var i in this.stones) {
		if (this.stones[i]) {
			this.removeStone(this.stones[i].name);
		}
	}
	this.stones = [];
	this.testCasesPassed = 0;
	this.resetButterfly();

	this.firstStone = undefined;
	this.secondStone = undefined;

	Session.set('riverInstructions', 'Click the buttons to build a structure that will guide the butterfly across the river.');
	$('#jungleworldBtnInstruc').show();
	$('#riverHintText').show();
	$('#nextLangButton').hide();
	$('#jungleworldButtonDiv button').prop('disabled', false).removeClass('disabled');
	this.checkHintsUsed();

	Meteor.call('incrementResets', 'jungle');

	this.save('reset', null, null, null);
}

/*
resetButterfly()
Purpose: resets the butterfly to its initial position and rotation (also stops butterfly's movement)
*/
RiverActivity.prototype.resetButterfly = function () {
	this.butterfly.stopMoving();
	this.butterfly.frame.position.set(0, 0, 0);
	this.butterfly.frame.rotation.set(-3 * Math.PI/5, 0, 0);
}

//******//
//END RESET//
//******//

//******//
//GRAPHICS//
//******//

/*
makeRiver()
Purpose: returns a frame containing a planar blue river
Origin: center of front edge
Extends down negative z-axis, in both x-directions
*/
RiverActivity.prototype.makeRiver = function () {
	var riverFrame = new THREE.Object3D();

	this.riverWidth = 0.85 * this.width;
	this.riverDepth = 1.0 * this.depth;

	var riverGeom = new THREE.PlaneGeometry(this.width, this.riverDepth);
	var riverMat = fadedMaterial(riverGeom, blues);
	var river = new THREE.Mesh(riverGeom, riverMat);

	river.rotation.x = -Math.PI/2;
	river.position.set(0.5 * this.riverWidth, 0, -0.5 * this.riverDepth);
	riverFrame.add(river);

	return riverFrame;
}

/*
makeShore()
Purpose: returns a frame containing a brown boxed shore
Origin: Front left corner
Extends along positive x-axis, down negative z-axis
*/
RiverActivity.prototype.makeShore = function () {
	var shoreFrame = new THREE.Object3D();
	shoreFrame.name = 'shoreFrame';

	this.shoreWidth = this.width - this.riverWidth;

	var shoreGeom = new THREE.BoxGeometry(this.shoreWidth, 100, this.depth);
	var shoreMat = new THREE.MeshBasicMaterial({color: 0x8b4513});
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
RiverActivity.prototype.test = function () {
	//build a string in the language and a random string that is (most likely) not in the language
	var goodStr = this.language.randomString();
	var badStr = numberString(Math.floor(randomInRange(this.language.length - 2, this.language.length + 2)));
	//badStr = '0100'; //temporary - for getting thesis screenshots

	this.testCasesPassed = 0;

	Meteor.call('incrementTests', 'jungle');
	this.addTimeTaken();

	//test the good string, then test the bad string
	var riverAct = this;
	riverAct.testString(goodStr, function () {
		riverAct.testString(badStr, function () {
			riverAct.stopTesting();
			riverAct.endOfTesting();
		});
	});
}

/*
stopTesting()
Purpose: halts the current testing process and resets the buttons and graphics (doesn't reset the DFA!)
*/
RiverActivity.prototype.stopTesting = function () {
	//re-enable the buttons
	$('#jungleworldHeaderDiv button').prop('disabled', false).removeClass('disabled');
	$('#currentPen').prop('disabled', true);
	$('#testButton').html('TEST').css({'opacity': 0.5});
	if (this.numStones >= this.stonePositions.length) {
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

	//remove the berries on the shore, if any
	if (this.purpleBerry) {
		this.frame.remove(this.purpleBerry.frame);
	}
	if (this.orangeBerry) {
		this.frame.remove(this.orangeBerry.frame);
	}

	//remove the attacking snake, if any
	if (this.attackSnake) {
		this.frame.remove(this.attackSnake.frame);
		this.attackSnake = undefined;
	}

	//reset the butterfly
	this.resetButterfly();

	//update instructions
	Session.set('riverInstructions', 'Keep building!');
}

/*
testString()
Purpose: runs the user's DFA on the given string by sending out a berry or snake for each character
				 includes an optional callback
*/
RiverActivity.prototype.testString = function (str, callback) {
	//update instructions
	Session.set('riverInstructions', 'Testing: ' + coloredString(numbersToWords(str)))

	//stop any current testing process
	this.stopTesting();	

	//disable all buttons except the testing button
	$('#jungleworldButtonDiv button').prop('disabled', true).addClass('disabled');
	$('#testButton').prop('disabled', false).removeClass('disabled');
	$('#testButton').html('STOP').css({'opacity': 0.5});

	//no stones => fail
	if (this.stones.length == 0 || !this.hasStones()) {
		this.fail('You need at least one stone in your structure!');
		return;
	}

	//move the butterfly to the first stone
	var initialStone = this.getStoneByName(this.stones[0].name);
	var initialPosition = initialStone.frame.position;
	this.butterfly.frame.position.copy(initialStone.frame.position);
	this.butterfly.frame.position.y += this.stoneRadius;
	this.butterfly.frame.rotation.x = -Math.PI/3;
	this.currentStoneName = this.stones[0].name;

	this.stepTime = 3000;
	this.testIndex = 0;
	this.testStr = numbersToWords(str);

	//get the info about the test string from the language
	var strMap = this.language.stringMap(str);

	var riverAct = this;

	//send out an object for each character in the test string
	for (var i in strMap) {
		var obj = strMap[i];
		if (obj.okay) {
			if (obj.color == 'purple') {
				setTimeout(function () {
					riverAct.sendPurpleBerry();
				}, i * riverAct.stepTime);
			} else {
				setTimeout(function () {
					riverAct.sendOrangeBerry();
				}, i * riverAct.stepTime);
			}
		} else {
			if (obj.color == 'purple') {
				setTimeout(function () {
					riverAct.sendPurpleSnake();
				}, i * riverAct.stepTime);
			} else {
				setTimeout(function () {
					riverAct.sendOrangeSnake();
				}, i * riverAct.stepTime);
			}
		}
	}

	//final check - after the testing is complete
	setTimeout(function () {
		riverAct.finalCheck(str);
	}, strMap.length * riverAct.stepTime);

	//optional callback - after the final check
	if (callback) {
		setTimeout(function () {
			callback();
		}, (strMap.length + 1) * riverAct.stepTime);
	}
}

RiverActivity.prototype.hasStones = function () {
	for (var s in this.stones) {
		if (this.stones[s]) {
			return true;
		}
	}
	return false;
}

/*
sendPurpleBerry()
Purpose: sends out a purple berry
				 this and the next three functions are used for the setTimeouts in testString to avoid parameter issues
*/
RiverActivity.prototype.sendPurpleBerry = function () {
	this.sendBerry('purple');
}

/*
sendOrangeBerry()
Purpose: sends out an orange berry
*/
RiverActivity.prototype.sendOrangeBerry = function () {
	this.sendBerry('orange');
}

/*
sendPurpleSnake()
Purpose: sends out a purple snake
*/
RiverActivity.prototype.sendPurpleSnake = function () {
	this.sendSnake('purple');
}

/*
sendOrangeSnake()
Purpose: sends out an orange snake
*/
RiverActivity.prototype.sendOrangeSnake = function () {
	this.sendSnake('orange');
}

/*
sendBerry()
Purpose: sends out a berry of the given color
*/
RiverActivity.prototype.sendBerry = function (color) {
	//remove the current berry or snake (if it exists)
	if (this.currentSendObj) {
		this.frame.remove(this.currentSendObj.frame);
	}

	//indicate where we are in the test string
	Session.set('riverInstructions', 'Testing: ' + boldString(this.testStr, this.testIndex));
	$('#jungleworldInstructions').textfill({minFontPixels: 10, maxFontPixels: 18});
	
	//create and add the berry
	var berry = new Berry(this.berryRadius, color, this.berryName);
	berry.frame.position.set(0, this.stoneRadius, 0);
	berry.frame.rotation.x = -Math.PI/3;
	this.frame.add(berry.frame);
	this.currentSendObj = berry;

	//make the next transition
	this.takeTransition(color);
}

/*
sendSnake()
Purpose: sends out a snake of the given color
*/
RiverActivity.prototype.sendSnake = function (color) {
	//remove the current berry or snake (if it exists)
	if (this.currentSendObj) {
		this.frame.remove(this.currentSendObj.frame);
	}

	//indicate where we are in the test string
	Session.set('riverInstructions', 'Testing: ' + boldString(this.testStr, this.testIndex));
	$('#jungleworldInstructions').textfill({minFontPixels: 10, maxFontPixels: 18});

	//add an attack snake
	this.addAttackSnake();

	//create and add the snake
	var snake = new Snake(this.snakeLength, color, this.snakeName);
	snake.frame.position.set(0, this.stoneRadius, 0);
	snake.frame.rotation.y = Math.PI/2;
	snake.frame.rotation.x = -Math.PI/3;
	this.frame.add(snake.frame);
	this.currentSendObj = snake;

	//make the next transition
	this.takeTransition(color);
}

/*
addAttackSnake()
Purpose: creates and adds an attack snake at the shore if there isn't one already
*/
RiverActivity.prototype.addAttackSnake = function () {
	if (!this.attackSnake) {
		this.attackSnake = new Snake(this.snakeLength, 'green', this.snakeName);
		this.attackSnake.frame.position.set(0.5 * this.width - this.shoreWidth, this.attackSnake.height + 100, -0.3 * this.depth);
		this.attackSnake.frame.rotation.y = -3 * Math.PI/5;
		this.attackSnake.frame.rotation.x = -Math.PI/4;
		this.frame.add(this.attackSnake.frame);
	}
}

/*
takeTransition()
Purpose: moves the butterfly to the next stone by taking the colored transition from its current stone
*/
RiverActivity.prototype.takeTransition = function (color) {
	//get the name of the next stone based on the colored transition from the current stone
	var nextStoneName = this.transitions[color][this.currentStoneName];

	//missing transition => fail
	if (!nextStoneName) {
		this.fail('Your structure is missing a transition!');
		return;
	}

	//move to the next stone
	var nextPos = this.getStoneByName(nextStoneName).frame.position.clone();
	nextPos.y += this.stoneRadius;
	this.butterfly.move(nextPos);
	this.currentStoneName = nextStoneName;

	this.testIndex++;
}

/*
fail()
Purpose: flies the butterfly away and informs the user of the reason for failure
				 called when the user fails in some way - 
				 missing states or transitions, accepting string not in language, rejecting string in language, etc.
*/
RiverActivity.prototype.fail = function (reason) {
	var riverAct = this;

	setTimeout(function () {
		riverAct.butterfly.move(new THREE.Vector3(0, 0.25 * riverAct.depth, -1.0 * riverAct.depth), 2000, function () {riverAct.stopTesting()});
	}, 500);

	if (reason) {
		Session.set('riverInstructions', reason);
	}

	Meteor.call('updateIncorrectDFAScore', 'jungle');
}

/*
finalCheck()
Purpose: compares the final state to what it should be based on whether the string is in the language,
				 and takes the appropriate action (collecting berries, sending out the attack snake, etc.)
				 called at the end of a test case
*/
RiverActivity.prototype.finalCheck = function (str) {
	if (this.currentSendObj) {
		this.frame.remove(this.currentSendObj.frame);
	}

	var stone = this.getStoneByName(this.currentStoneName);

	//string in language - should be on final stone
	if (this.language.inLanguage(str)) {
		this.purpleBerry = new Berry(this.berryRadius, 'purple', this.berryName);
		this.orangeBerry = new Berry(this.berryRadius, 'orange', this.berryName);

		this.purpleBerry.frame.position.set(0.5 * this.width - 0.5 * this.shoreWidth, 0.5 * this.berryRadius, -0.75 * this.depth);
		this.frame.add(this.purpleBerry.frame);

		this.orangeBerry.frame.position.set(0.5 * this.width - 0.5 * this.shoreWidth, 0.5 * this.berryRadius, -0.25 * this.depth);
		this.frame.add(this.orangeBerry.frame);

		//on final stone => happiness: go get berries on shore
		if (stone.isFinal) {
			this.testCasesPassed++;
			var congrats = 'Passed ' + this.testCasesPassed + (this.testCasesPassed == 1 ? ' pattern' : ' patterns') + ' out of ' + this.numTestCases + '.';
			Session.set('riverInstructions', 'Congratulations! You collected the berries!<br>' + congrats);
			this.butterfly.move(new THREE.Vector3(0.5 * this.width - 0.5 * this.shoreWidth, 50, -0.5 * this.depth));
		} 

		//not on final stone => sadness
		else {
			this.fail('You need to be on a final (green) stone to collect the berries!');
		}
	} 

	//string not in language - should not be on final stone
	else {
		//add an attack snake
		this.addAttackSnake();

		//not on final stone => happiness: snake moves away
		if (!stone.isFinal) {
			this.testCasesPassed++;
			var congrats = 'Passed ' + this.testCasesPassed + (this.testCasesPassed == 1 ? ' pattern' : ' patterns') + ' out of ' + this.numTestCases + '.';
			Session.set('riverInstructions', 'Congratulations! You avoided the snake!<br>' + congrats);
			this.attackSnake.move(new THREE.Vector3(this.width, 0, -0.5 * this.depth));
		} 

		//on final stone => sadness: snake attacks
		else {
			Session.set('riverInstructions', 'Oh no! You\'re on a green stone, so the snake can attack!')
			var riverAct = this;
			riverAct.attackSnake.move(riverAct.butterfly.frame.position, 2000, function () {
				riverAct.fail();
			});
		}
	}
}

/*
allCasesPassed()
Purpose: returns true iff all test cases for the current language have been passed
				 updates the html if they have been passed
*/
RiverActivity.prototype.allCasesPassed = function () {
	if (this.testCasesPassed < this.numTestCases) {
		setTimeout(function () {
			$('#riverHintText').show();
			$('#nextLangButton').hide();
		}, 0);
		return false;
	}

	Session.set('riverInstructions', 
						'Congratulations! You passed all ' + this.numTestCases + ' test patterns!');
	$('#jungleworldBtnInstruc').hide();
	$('#riverHintText').hide();
	$('#nextLangButton').show();
	$('#jungleworldButtonDiv button').prop('disabled', true).addClass('disabled');
	$('#backButton').prop('disabled', false).removeClass('disabled');
	return true;
}

/*
endOfTesting()
Purpose: checks whether all test cases are passed, and if so, updates the jungle experience points
				 called at the end of all test cases
*/
RiverActivity.prototype.endOfTesting = function () {
	if (!this.allCasesPassed()) {
		return;
	}

	this.save('endTesting', null, null, null, null);

	Meteor.call('updateCorrectDFAScore', 'jungle', function (error, result) {
		Session.set('riverInstructions', 
									Session.get('riverInstructions') + 
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
RiverActivity.prototype.handleStoneClick = function (objName) {
	var name = objName.substring(objName.indexOf(this.stoneName), objName.length);

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
RiverActivity.prototype.handleTransClick = function (objName) {
	if (this.deleteMode) {
		var color = objName.substring(0, objName.indexOf('transition'));

		var stone1 = objName.substring(objName.indexOf(this.stoneName), objName.indexOf(this.stoneName) + this.stoneName.length + 2);
		if (!isNumber(stone1[stone1.length - 1])) {
			stone1 = stone1.substring(0, stone1.length - 1);
		}

		this.removeTransFrom(stone1, color);

		Meteor.call('incrementDeletedTransitions', 'jungle');
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
RiverActivity.prototype.addStone = function () {
	//don't add too many stones
	if (this.numStones >= this.stonePositions.length) {
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

	//create and add the new stone
	var stone = new SteppingStone(this.stoneRadius, this.stoneColors[stoneIndex], this.stoneName + stoneIndex, stoneIndex);
	stone.frame.position.copy(this.stonePositions[stoneIndex]);
	this.frame.add(stone.frame);
	this.stones[stoneIndex] = stone;
	this.numStones++;

	//disable the button if necessary
	if (this.numStones >= this.stonePositions.length) {
		$('#addStoneButton').prop('disabled', true).addClass('disabled');
	}

	if (this.username) {
		this.save('add', stone.name, null, null);
	}
}

/*
selectFirstStone()
Purpose: returns the transition object with the given color that goes to the stone with the given name
*/
RiverActivity.prototype.selectFirstStone = function (name) {
	this.firstStone = this.getStoneByName(name);
	this.firstStone.highlight(this.transitionColor);
	Session.set('riverInstructions', 'Click to select your second stone.')
}

/*
addTransition()
Purpose: adds a transition between this.firstStone and this.secondStone (including if they're the same stone)
*/
RiverActivity.prototype.addTransition = function (name) {
	this.secondStone = this.getStoneByName(name);
	if (!this.secondStone) {
		return;
	}

	var trans = this.getTransFrom(this.firstStone.name, this.transColorName);
	if (trans) {
		Meteor.call('incrementChangedTransitions', 'jungle');
	}

	this.removeTransFrom(this.firstStone.name, this.transColorName);

	if (this.firstStone.name == this.secondStone.name) {
		this.addSameStoneTrans();
	} else {
		var xSign = this.transColorName == 'purple' ? 1 : -1;
		var start = this.firstStone.frame.position.clone();
		start.x += xSign * this.stoneRadius;
		start.y += randomInRange(0.95 * this.stoneRadius, 1.05 * this.stoneRadius);

		var end = this.secondStone.frame.position.clone();
		end.x += xSign * this.stoneRadius;
		end.y += randomInRange(0.95 * this.stoneRadius, 1.05 * this.stoneRadius);

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
		this.firstStone.highlight(this.finalStoneColor);
	} else {
		this.firstStone.unhighlight();
	}

	this.save('add', this.firstStone.name, this.secondStone.name, this.transitionName());

	this.firstStone = undefined;
	this.secondStone = undefined;
	Session.set('riverInstructions', 'Click another stone, or select a different button.');
}

/*
addSameStoneTrans()
Purpose: adds a transition loop from a stone to itself
*/
RiverActivity.prototype.addSameStoneTrans = function () {
	var transFrame = new THREE.Object3D();
	transFrame.name = this.transitionName() + 'Frame';
	transFrame.stone1 = this.firstStone.name;
	transFrame.stone2 = this.secondStone.name;
	transFrame.colorName = this.transColorName;

	var zSign = this.transColorName == 'purple' ? 1 : -1;

	var start = this.firstStone.frame.position.clone();
	start.y += this.stoneRadius;
	start.z -= zSign * this.stoneRadius;

	var points = [
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(-2 * this.stoneRadius, 0, -3 * zSign * this.stoneRadius),
		new THREE.Vector3(2 * this.stoneRadius, 0, -3 * zSign * this.stoneRadius),
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
RiverActivity.prototype.transitionName = function () {
	return this.transColorName + 'transition' + this.firstStone.name + this.secondStone.name;
}

/*
markStoneAsFinal()
Purpose: if the stone with the given name is already final, marks it as not final; otherwise marks it as final
				 also highlights the stone to the appropriate color
*/
RiverActivity.prototype.markStoneAsFinal = function (name) {
	var stone = this.getStoneByName(name);
	if (stone.isFinal) {
		stone.unhighlight();
		stone.isFinal = false;
		this.save('markNotFinal', stone.name, null, null);
	} else {
		stone.highlight(this.finalStoneColor);
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
RiverActivity.prototype.removeStone = function (name) {
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
RiverActivity.prototype.removeTransFrom = function (stone1, color) {
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
RiverActivity.prototype.removeTransTo = function (stone2, color) {
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
RiverActivity.prototype.getStoneByName = function (name) {
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
RiverActivity.prototype.getTransFrom = function (stone1, color) {
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
RiverActivity.prototype.getTransTo = function (stone2, color) {
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

