//******//
//GLOBALS//
//******//

//floor colors
var browns = [0xffd39b, 0xcdaa7d];

//colors for transitions
var penColors = {
	purple: 0x8b008b,
	orange: 0xff7f00
};

var starfishLangs = [];

//******//
//END GLOBALS//
//******//

//******//
//CONSTRUCTOR//
//******//

/*
StarfishActivity()
Purpose: constructs a new StarfishActivity with a starfish and shore
Origin: center of front edge
Extends down negative z-axis, up positive y-axis
*/
function StarfishActivity (width, depth, state) {
	//finite languages from the database
	starfishLangs = OceanLanguages.find({}).fetch().map(function (langEntry) {
		return new SimpleLanguage(null, null, langEntry.condition, langEntry.args);
	});

	//directly from parameters
	this.width = width;
	this.depth = depth;
	this.state = state;

	//current state number (0, 1, 2, ...) from state name
	var stateName = this.state.name;
	this.currentState = parseInt(stateName.substring(stateName.indexOf('StarfishState') + 'StarfishState'.length, stateName.length));

	//graphical objects:
	this.frame = new THREE.Object3D();

	//fish
	this.fish = new Fish(0.1 * this.depth, 0.05 * this.depth, 0.05 * this.depth, 'starfishFish');
	this.resetFish();
	this.frame.add(this.fish.frame);

	//ocean floor
	this.floor = this.makeFloor();
	this.floor.position.set(-0.5 * this.width, 0, 0);
	this.frame.add(this.floor);

	//shore
	this.shore = this.makeShore();
	this.shore.position.set(0.5 * this.width - this.shoreWidth, 0, 0);
	this.frame.add(this.shore);

	//stone setup
	var floorPos = this.floor.position;
	this.starfishRadius = 0.075 * this.depth;
	this.starfishName = 'starfishSS';

	//positions for stones - to dictate where new stones are placed
	this.starfishPositions = [
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

	//starfish colors
	//this.starfishColors = [0xEE0000, 0xEE0000, 0xCD0000, 0xCD0000, 0xB0171F, 0xB0171F, 0x8B1A1A, 0x8B1A1A, 0x8B0000, 0x8B0000, 0x800000];
	this.starfishColors = [0xe7e7e7, 0xcccccc, 0x969696, 0x7f7f7f, 0x5c5c5c, 0x424242, 0x3d3d3d, 0x262626, 0x1f1f1f, 0x030303, 0x000000];
	this.finalStarfishColor = 0x00c78c;

	//load stones and transitions from the database state
	this.initStones();
	this.initTransitions();
	
	//pearl properties (for sending out pearls during testing)
	this.pearlName = 'starfishPearl';
	this.pearlRadius = 0.05 * this.depth;

	//jellyfish properties (for sending out jellyfish during testing)
	this.jellyfishName = 'starfishJellyfish';
	this.jellyfishRadius = 0.05 * this.depth;
	this.jellyfishLength = 0.2 * this.depth;

	//set up the language
	this.langIndex = this.state.langIndex;
	this.setLanguage();

	//test cases
	this.testCasesPassed = this.state.testsPassed;
	this.numTestCases = 2;
	this.pointsGain = 10;

	//hints
	this.maxHints = 2;
	this.hintsUsed = BayesFeatures.find({studentId: Meteor.userId(), world: 'ocean'}).fetch()[0].hintsUsed;
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
StarfishActivity.prototype.initStones = function () {
	this.stones = [];
	this.numStones = 0;
	for (var s = 0; s < this.starfishPositions.length; s++) {
		this.stones[s] = null;
	}

	var stateStones = this.state.stones;
	for (var i in stateStones) {
		var stoneIndex = stateStones[i].name.substring(this.starfishName.length, stateStones[i].name.length);
		var starfish = new Starfish(this.starfishRadius, this.starfishColors[stoneIndex], this.starfishName + stoneIndex, stoneIndex);
		starfish.isFinal = stateStones[i].isFinal;
		if (starfish.isFinal) {
			starfish.highlight(this.finalStarfishColor);
		}
		starfish.frame.position.copy(this.starfishPositions[stoneIndex]);
		this.frame.add(starfish.frame);
		this.stones[stoneIndex] = starfish;
		this.numStones++;
	}
}

/*
initTransitions()
Purpose: initializes the transitions and transitionObjects from the database state
*/
StarfishActivity.prototype.initTransitions = function () {
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
StarfishActivity.prototype.save = function (actionType, actionStone1, actionStone2, actionTrans) {
	if (!this.username) {
		return;
	}

	var nextState = this.currentState + 1;
	var action = {
		fromState: this.username + 'StarfishState' + this.currentState,
		toState : this.username + 'StarfishState' + nextState,
		studentId: Meteor.userId(),
		langIndex: this.langIndex,
		date: new Date(),
		type: actionType,
		stone1: actionStone1, 
		stone2: actionStone2,
		trans: actionTrans
	};
	Meteor.call('insertStarfishAction', action);

	this.currentState++;
	var nextStateStones = [];
	for (var i in this.stones) {
		if (this.stones[i]) {
			nextStateStones.push({name: this.stones[i].name, isFinal: this.stones[i].isFinal});
		}
	}
	var correct = this.testCasesPassed >= this.numTestCases;
	var state = {
		name: this.username + 'StarfishState' + this.currentState,
		studentId: Meteor.userId(),
		date: new Date(),
		stones: nextStateStones,
		transitions: this.transitions,
		testsPassed: this.testCasesPassed,
		langIndex: this.langIndex,
		isCorrect: correct
	};
	Meteor.call('insertStarfishState', state);
}

/*
addTimeTaken()
Purpose: adds the time from the most recent start date until now to the time taken on the current patter
*/
StarfishActivity.prototype.addTimeTaken = function () {
	var time = new Date() - this.startDate;
	Meteor.call('addTimeTaken', 'ocean', time);
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
StarfishActivity.prototype.checkHintsUsed = function () {
	if (this.hintsUsed >= this.maxHints) {
		$('#starfishHintButton').prop('disabled', true).addClass('disabled');
	} else {
		$('#starfishHintButton').prop('disabled', false).removeClass('disabled');
	}
}

/*
getHint()
Purpose: gets a list of hints from the server, displays them in the UI, and updates this.hintsUsed
*/
StarfishActivity.prototype.getHint = function () {
	if (this.hintsUsed >= this.maxHints) {
		$('#starfishHintButton').prop('disabled', true).addClass('disabled');
		return;
	}

	$('#starfishHintCover').css('visibility', 'visible');
	var starfishAct = this;
	var currentStateName = this.username + 'StarfishState' + this.currentState;
	Meteor.call('getStarfishHint', currentStateName, function (error, result) {
		if (error || !result) {
			return;
		} 
		$('#starfishHintCover').css('visibility', 'hidden');
		var translations = result.map(function (hint) {
			return starfishAct.translateHint(hint);
		});
		Session.set('starfishInstructions', starfishAct.hintMarkup(uniqueArray(translations)));
		if (hasHint(result)) {
			starfishAct.hintsUsed++;
			starfishAct.checkHintsUsed();
			Meteor.call('updateHints', 'ocean', starfishAct.hintsUsed);
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
StarfishActivity.prototype.hintMarkup = function (hints) {
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
StarfishActivity.prototype.translateHint = function (hint) {
	console.log('translating hint: ', hint);
	if (!hint) {
		return 'Sorry, no hint available!';
	}
	var result = '';

	if (hint.type == 'markFinal') {
		result += 'Mark';
		var stoneNum = hint.stone1.substring(this.starfishName.length, hint.stone1.length);
		stoneNum++;
		result += ' starfish ' + stoneNum;
		result += ' as final';
		return result;
	}

	if (hint.type == 'markNotFinal') {
		result += 'Mark';
		var stoneNum = hint.stone1.substring(this.starfishName.length, hint.stone1.length);
		stoneNum++;
		result += ' starfish ' + stoneNum;
		result += ' as not final';
		return result;
	}

	result += capitalize(hint.type);
	if (result == 'Reset') {
		return result;
	}

	if (!hint.trans) {
		if (!hint.stone1) {
			result += ' a starfish.';
		} else {
			var stoneNum = hint.stone1.substring(this.starfishName.length, hint.stone1.length);
			stoneNum++;
			result += ' starfish ' + stoneNum;
		}
	} else if (hint.stone1 && hint.stone2) {
		var transColor = hint.trans.substring(0, hint.trans.indexOf('transition'));
		var stone1Num = parseInt(hint.stone1.substring(this.starfishName.length, hint.stone1.length));
		stone1Num++;
		var stone2Num = parseInt(hint.stone2.substring(this.starfishName.length, hint.stone2.length));
		stone2Num++;
		var article = transColor == 'purple' ? ' a ' : ' an ';
		result += article + transColor + ' transition from starfish ' + stone1Num + ' to starfish ' + stone2Num;
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
StarfishActivity.prototype.setLanguage = function () {
	if (this.langIndex >= starfishLangs.length) {
		this.langLength = Math.floor(randomInRange(4, this.starfishPositions.length - 2));
		this.langLength = 4; //for testing only!
		this.language = new SimpleLanguage(null, null, null, null);
	} else {
		this.language = starfishLangs[this.langIndex];
	}

	Session.set('starfishHeader', '<p>Your structure can only accept the following patterns:<br>' + 
															this.language.description() + '</p>');
}

/*
nextLanguage()
Purpose: sets the language to the next available one and resets the system
*/
StarfishActivity.prototype.nextLanguage = function () {
	this.hintsUsed = 0;
	this.checkHintsUsed();
	Meteor.call('resetBayesFeatures', 'ocean');
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
StarfishActivity.prototype.reset = function () {
	for (var i in this.stones) {
		if (this.stones[i]) {
			this.removeStone(this.stones[i].name);
		}
	}
	this.stones = [];
	this.testCasesPassed = 0;
	this.resetFish();

	this.firstStone = undefined;
	this.secondStone = undefined;

	Session.set('starfishInstructions', 'Click the buttons to build a structure that will guide the fish across the floor.');
	$('#oceanworldBtnInstruc').show();
	$('#starfishHintText').show();
	$('#nextLangButton').hide();
	$('#oceanworldButtonDiv button').prop('disabled', false).removeClass('disabled');
	this.checkHintsUsed();

	Meteor.call('incrementResets', 'ocean');

	this.save('reset', null, null, null);
}

/*
resetFish()
Purpose: resets the fish to its initial position and rotation (also stops fish's movement)
*/
StarfishActivity.prototype.resetFish = function () {
	this.fish.stopMoving();
	this.fish.frame.position.set(0, 0, -this.fish.length/2);
	this.fish.frame.rotation.set(0, Math.PI, 0);
}

//******//
//END RESET//
//******//

//******//
//GRAPHICS//
//******//

/*
makeFloor()
Purpose: returns a frame containing a planar brown floor
Origin: center of front edge
Extends down negative z-axis, in both x-directions
*/
StarfishActivity.prototype.makeFloor = function () {
	var floorFrame = new THREE.Object3D();

	this.floorWidth = 0.85 * this.width;
	this.floorDepth = 1.0 * this.depth;

	var floorGeom = new THREE.PlaneGeometry(this.width, this.floorDepth);
	var floorMat = fadedMaterial(floorGeom, browns);
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
StarfishActivity.prototype.makeShore = function () {
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
StarfishActivity.prototype.test = function () {
	//build a string in the language and a random string that is (most likely) not in the language
	var goodStr = this.language.randomString();
	//var badStr = numberString(Math.floor(randomInRange(1, 5)));
	var badStr = this.language.badString();

	this.testCasesPassed = 0;

	Meteor.call('incrementTests', 'ocean');
	this.addTimeTaken();

	//test the good string, then test the bad string
	var starfishAct = this;
	starfishAct.testString(goodStr, function () {
		starfishAct.testString(badStr, function () {
			starfishAct.stopTesting();
			starfishAct.endOfTesting();
		});
	});
}

/*
stopTesting()
Purpose: halts the current testing process and resets the buttons and graphics (doesn't reset the DFA!)
*/
StarfishActivity.prototype.stopTesting = function () {
	//re-enable the buttons
	$('#oceanworldHeaderDiv button').prop('disabled', false).removeClass('disabled');
	$('#currentPen').prop('disabled', true);
	$('#testButton').html('TEST').css({'opacity': 0.5});
	if (this.numStones >= this.starfishPositions.length) {
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

	//remove the pearls on the shore, if any
	if (this.purplePearl) {
		this.frame.remove(this.purplePearl.frame);
	}
	if (this.orangePearl) {
		this.frame.remove(this.orangePearl.frame);
	}

	//remove the attacking jellyfish, if any
	if (this.attackJellyfish) {
		this.frame.remove(this.attackJellyfish.frame);
		this.attackJellyfish = undefined;
	}

	//reset the fish
	this.resetFish();

	//update instructions
	Session.set('starfishInstructions', 'Keep building!');
}

/*
testString()
Purpose: runs the user's DFA on the given string by sending out a pearl or jellyfish for each character
				 includes an optional callback
*/
StarfishActivity.prototype.testString = function (str, callback) {
	//update instructions
	Session.set('starfishInstructions', 'Testing: ' + coloredString(numbersToWords(str)))

	//stop any current testing process
	this.stopTesting();	

	//disable all buttons except the testing button
	$('#oceanworldButtonDiv button').prop('disabled', true).addClass('disabled');
	$('#testButton').prop('disabled', false).removeClass('disabled');
	$('#testButton').html('STOP').css({'opacity': 0.5});

	//no stones => fail
	if (this.stones.length == 0 || !this.hasStones()) {
		this.fail('You need at least one starfish in your structure!');
		return;
	}

	//move the fish to the first stone
	var initialStone = this.getStoneByName(this.stones[0].name);
	var initialPosition = initialStone.frame.position;
	this.fish.frame.position.copy(initialStone.frame.position);
	this.fish.frame.position.y += this.starfishRadius;
	this.fish.frame.rotation.x = -Math.PI/3;
	this.currentStoneName = this.stones[0].name;

	this.stepTime = 3000;
	this.testIndex = 0;
	this.testStr = numbersToWords(str);

	//get the info about the test string from the language
	var strMap = this.language.stringMap(str);

	var starfishAct = this;

	//send out an object for each character in the test string
	for (var i in strMap) {
		var obj = strMap[i];
		if (obj.okay) {
			if (obj.color == 'purple') {
				setTimeout(function () {
					starfishAct.sendPurplePearl();
				}, i * starfishAct.stepTime);
			} else {
				setTimeout(function () {
					starfishAct.sendOrangePearl();
				}, i * starfishAct.stepTime);
			}
		} else {
			if (obj.color == 'purple') {
				setTimeout(function () {
					starfishAct.sendPurpleJellyfish();
				}, i * starfishAct.stepTime);
			} else {
				setTimeout(function () {
					starfishAct.sendOrangeJellyfish();
				}, i * starfishAct.stepTime);
			}
		}
	}

	//final check - after the testing is complete
	setTimeout(function () {
		starfishAct.finalCheck(str);
	}, strMap.length * starfishAct.stepTime);

	//optional callback - after the final check
	if (callback) {
		setTimeout(function () {
			callback();
		}, (strMap.length + 1) * starfishAct.stepTime);
	}
}

StarfishActivity.prototype.hasStones = function () {
	for (var s in this.stones) {
		if (this.stones[s]) {
			return true;
		}
	}
	return false;
}

/*
sendPurplePearl()
Purpose: sends out a purple pearl
				 this and the next three functions are used for the setTimeouts in testString to avoid parameter issues
*/
StarfishActivity.prototype.sendPurplePearl = function () {
	this.sendPearl('purple');
}

/*
sendOrangePearl()
Purpose: sends out an orange pearl
*/
StarfishActivity.prototype.sendOrangePearl = function () {
	this.sendPearl('orange');
}

/*
sendPurpleJellyfish()
Purpose: sends out a purple jellyfish
*/
StarfishActivity.prototype.sendPurpleJellyfish = function () {
	this.sendJellyfish('purple');
}

/*
sendOrangeJellyfish()
Purpose: sends out an orange jellyfish
*/
StarfishActivity.prototype.sendOrangeJellyfish = function () {
	this.sendJellyfish('orange');
}

/*
sendPearl()
Purpose: sends out a pearl of the given color
*/
StarfishActivity.prototype.sendPearl = function (color) {
	//remove the current pearl or jellyfish (if it exists)
	if (this.currentSendObj) {
		this.frame.remove(this.currentSendObj.frame);
	}

	//indicate where we are in the test string
	Session.set('starfishInstructions', 'Testing: ' + boldString(this.testStr, this.testIndex));
	$('#oceanworldInstructions').textfill({minFontPixels: 10, maxFontPixels: 18});
	
	//create and add the pearl
	var pearl = new Pearl(this.pearlRadius, color, this.pearlName);
	pearl.frame.position.set(0, this.starfishRadius, 0);
	pearl.frame.rotation.x = -Math.PI/3;
	this.frame.add(pearl.frame);
	this.currentSendObj = pearl;

	//make the next transition
	this.takeTransition(color);
}

/*
sendJellyfish()
Purpose: sends out a jellyfish of the given color
*/
StarfishActivity.prototype.sendJellyfish = function (color) {
	//remove the current pearl or jellyfish (if it exists)
	if (this.currentSendObj) {
		this.frame.remove(this.currentSendObj.frame);
	}

	//indicate where we are in the test string
	Session.set('starfishInstructions', 'Testing: ' + boldString(this.testStr, this.testIndex));
	$('#oceanworldInstructions').textfill({minFontPixels: 10, maxFontPixels: 18});

	//add an attack jellyfish
	this.addAttackJellyfish();

	//create and add the jellyfish
	var jellyfish = new Jellyfish(this.jellyfishRadius, this.jellyfishLength, color, this.jellyfishName);
	jellyfish.frame.position.set(0, this.starfishRadius, -0.5 * this.jellyfishLength);
	jellyfish.frame.rotation.set(Math.PI, 0, 0);
	this.frame.add(jellyfish.frame);
	this.currentSendObj = jellyfish;

	//make the next transition
	this.takeTransition(color);
}

/*
addAttackJellyfish()
Purpose: creates and adds an attack jellyfish at the shore if there isn't one already
*/
StarfishActivity.prototype.addAttackJellyfish = function () {
	if (!this.attackJellyfish) {
		this.attackJellyfish = new Jellyfish(this.jellyfishRadius, this.jellyfishLength, 'green', this.jellyfishName);
		this.attackJellyfish.frame.position.set(0.4 * this.width - this.shoreWidth, this.attackJellyfish.length + 50, -0.3 * this.depth);
		this.attackJellyfish.frame.rotation.set(-Math.PI/2, 0, 0);
		this.frame.add(this.attackJellyfish.frame);
	}
}

/*
takeTransition()
Purpose: moves the fish to the next stone by taking the colored transition from its current stone
*/
StarfishActivity.prototype.takeTransition = function (color) {
	//get the name of the next stone based on the colored transition from the current stone
	var nextStoneName = this.transitions[color][this.currentStoneName];

	//missing transition => fail
	if (!nextStoneName) {
		this.fail('Your structure is missing a transition!');
		return;
	}

	//move to the next stone
	var nextPos = this.getStoneByName(nextStoneName).frame.position.clone();
	nextPos.y += this.starfishRadius;
	this.fish.move(nextPos);
	this.currentStoneName = nextStoneName;

	this.testIndex++;
}

/*
fail()
Purpose: swims the fish away and informs the user of the reason for failure
				 called when the user fails in some way - 
				 missing states or transitions, accepting string not in language, rejecting string in language, etc.
*/
StarfishActivity.prototype.fail = function (reason) {
	var starfishAct = this;

	setTimeout(function () {
		starfishAct.fish.move(new THREE.Vector3(0, 0.25 * starfishAct.depth, -1.0 * starfishAct.depth), 2000, function () {starfishAct.stopTesting()});
	}, 500);

	if (reason) {
		Session.set('starfishInstructions', reason);
	}

	Meteor.call('updateIncorrectDFAScore', 'ocean');
}

/*
finalCheck()
Purpose: compares the final state to what it should be based on whether the string is in the language,
				 and takes the appropriate action (collecting pearls, sending out the attack jellyfish, etc.)
				 called at the end of a test case
*/
StarfishActivity.prototype.finalCheck = function (str) {
	if (this.currentSendObj) {
		this.frame.remove(this.currentSendObj.frame);
	}

	var stone = this.getStoneByName(this.currentStoneName);

	//string in language - should be on final stone
	if (this.language.inLanguage(str)) {
		this.purplePearl = new Pearl(this.pearlRadius, 'purple', this.pearlName);
		this.orangePearl = new Pearl(this.pearlRadius, 'orange', this.pearlName);

		this.purplePearl.frame.position.set(0.5 * this.width - 0.5 * this.shoreWidth, this.pearlRadius, -0.75 * this.depth);
		this.frame.add(this.purplePearl.frame);

		this.orangePearl.frame.position.set(0.5 * this.width - 0.5 * this.shoreWidth, this.pearlRadius, -0.25 * this.depth);
		this.frame.add(this.orangePearl.frame);

		//on final stone => happiness: go get pearls on shore
		if (stone.isFinal) {
			this.testCasesPassed++;
			var congrats = 'Passed ' + this.testCasesPassed + (this.testCasesPassed == 1 ? ' pattern' : ' patterns') + ' out of ' + this.numTestCases + '.';
			Session.set('starfishInstructions', 'Congratulations! You collected the pearls!<br>' + congrats);
			this.fish.move(new THREE.Vector3(0.5 * this.width - 0.5 * this.shoreWidth, 100, -0.5 * this.depth));
		} 

		//not on final stone => sadness
		else {
			this.fail('You need to be on a final (green) starfish to collect the pearls!');
		}
	} 

	//string not in language - should not be on final stone
	else {
		//add an attack jellyfish
		this.addAttackJellyfish();

		//not on final stone => happiness: jellyfish moves away
		if (!stone.isFinal) {
			this.testCasesPassed++;
			var congrats = 'Passed ' + this.testCasesPassed + (this.testCasesPassed == 1 ? ' pattern' : ' patterns') + ' out of ' + this.numTestCases + '.';
			Session.set('starfishInstructions', 'Congratulations! You avoided the jellyfish!<br>' + congrats);
			this.attackJellyfish.move(new THREE.Vector3(this.width, 0, -0.5 * this.depth));
		} 

		//on final stone => sadness: jellyfish attacks
		else {
			Session.set('starfishInstructions', 'Oh no! You\'re on a green stone, so the jellyfish can attack!')
			var starfishAct = this;
			starfishAct.attackJellyfish.move(starfishAct.fish.frame.position, 2000, function () {
				starfishAct.fail();
			});
		}
	}
}

/*
allCasesPassed()
Purpose: returns true iff all test cases for the current language have been passed
				 updates the html if they have been passed
*/
StarfishActivity.prototype.allCasesPassed = function () {
	if (this.testCasesPassed < this.numTestCases) {
		setTimeout(function () {
			$('#starfishHintText').show();
			$('#nextLangButton').hide();
		}, 0);
		return false;
	}

	Session.set('starfishInstructions', 
						'Congratulations! You passed all ' + this.numTestCases + ' test patterns!');
	$('#oceanworldBtnInstruc').hide();
	$('#starfishHintText').hide();
	$('#nextLangButton').show();
	$('#oceanworldButtonDiv button').prop('disabled', true).addClass('disabled');
	$('#backButton').prop('disabled', false).removeClass('disabled');
	return true;
}

/*
endOfTesting()
Purpose: checks whether all test cases are passed, and if so, updates the ocean experience points
				 called at the end of all test cases
*/
StarfishActivity.prototype.endOfTesting = function () {
	if (!this.allCasesPassed()) {
		return;
	}

	this.save('endTesting', null, null, null, null);

	Meteor.call('updateCorrectDFAScore', 'ocean', function (error, result) {
		Session.set('starfishInstructions', 
									Session.get('starfishInstructions') + 
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
StarfishActivity.prototype.handleStoneClick = function (objName) {
	var name = objName.substring(objName.indexOf(this.starfishName), objName.length);

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
StarfishActivity.prototype.handleTransClick = function (objName) {
	if (this.deleteMode) {
		var color = objName.substring(0, objName.indexOf('transition'));

		var stone1 = objName.substring(objName.indexOf(this.starfishName), objName.indexOf(this.starfishName) + this.starfishName.length + 2);
		if (!isNumber(stone1[stone1.length - 1])) {
			stone1 = stone1.substring(0, stone1.length - 1);
		}

		this.removeTransFrom(stone1, color);

		Meteor.call('incrementDeletedTransitions', 'ocean');
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
StarfishActivity.prototype.addStone = function () {
	//don't add too many stones
	if (this.numStones >= this.starfishPositions.length) {
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

	//create and add the new starfish
	var starfish = new Starfish(this.starfishRadius, this.starfishColors[stoneIndex], this.starfishName + stoneIndex, stoneIndex);
	starfish.frame.position.copy(this.starfishPositions[stoneIndex]);
	this.frame.add(starfish.frame);
	this.stones[stoneIndex] = starfish;
	this.numStones++;

	//disable the button if necessary
	if (this.numStones >= this.starfishPositions.length) {
		$('#addStoneButton').prop('disabled', true).addClass('disabled');
	}

	if (this.username) {
		this.save('add', starfish.name, null, null);
	}
}

/*
selectFirstStone()
Purpose: returns the transition object with the given color that goes to the stone with the given name
*/
StarfishActivity.prototype.selectFirstStone = function (name) {
	this.firstStone = this.getStoneByName(name);
	this.firstStone.highlight(this.transitionColor);
	Session.set('starfishInstructions', 'Click to select your second starfish.')
}

/*
addTransition()
Purpose: adds a transition between this.firstStone and this.secondStone (including if they're the same stone)
*/
StarfishActivity.prototype.addTransition = function (name) {
	this.secondStone = this.getStoneByName(name);
	if (!this.secondStone) {
		return;
	}

	var trans = this.getTransFrom(this.firstStone.name, this.transColorName);
	if (trans) {
		Meteor.call('incrementChangedTransitions', 'ocean');
	}

	this.removeTransFrom(this.firstStone.name, this.transColorName);

	if (this.firstStone.name == this.secondStone.name) {
		this.addSameStoneTrans();
	} else {
		var xSign = this.transColorName == 'purple' ? 1 : -1;
		var start = this.firstStone.frame.position.clone();
		start.x += xSign * 0.5 * this.starfishRadius;
		start.y += randomInRange(0.05 * this.starfishRadius, 0.1 * this.starfishRadius);

		var end = this.secondStone.frame.position.clone();
		end.x += xSign * 0.5 * this.starfishRadius;
		end.y += randomInRange(0.05 * this.starfishRadius, 0.1 * this.starfishRadius);

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
		this.firstStone.highlight(this.finalStarfishColor);
	} else {
		this.firstStone.unhighlight();
	}

	this.save('add', this.firstStone.name, this.secondStone.name, this.transitionName());

	this.firstStone = undefined;
	this.secondStone = undefined;
	Session.set('starfishInstructions', 'Click another stone, or select a different button.');
}

/*
addSameStoneTrans()
Purpose: adds a transition loop from a stone to itself
*/
StarfishActivity.prototype.addSameStoneTrans = function () {
	var transFrame = new THREE.Object3D();
	transFrame.name = this.transitionName() + 'Frame';
	transFrame.stone1 = this.firstStone.name;
	transFrame.stone2 = this.secondStone.name;
	transFrame.colorName = this.transColorName;

	var zSign = this.transColorName == 'purple' ? 1 : -1;

	var start = this.firstStone.frame.position.clone();
	start.y += 0.05 * this.starfishRadius;
	start.z -= zSign * 0.5 * this.starfishRadius;

	var points = [
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(-2 * this.starfishRadius, 0, -3 * zSign * this.starfishRadius),
		new THREE.Vector3(2 * this.starfishRadius, 0, -3 * zSign * this.starfishRadius),
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
StarfishActivity.prototype.transitionName = function () {
	return this.transColorName + 'transition' + this.firstStone.name + this.secondStone.name;
}

/*
markStoneAsFinal()
Purpose: if the stone with the given name is already final, marks it as not final; otherwise marks it as final
				 also highlights the stone to the appropriate color
*/
StarfishActivity.prototype.markStoneAsFinal = function (name) {
	var stone = this.getStoneByName(name);
	if (stone.isFinal) {
		stone.unhighlight();
		stone.isFinal = false;
		this.save('markNotFinal', stone.name, null, null);
	} else {
		stone.highlight(this.finalStarfishColor);
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
StarfishActivity.prototype.removeStone = function (name) {
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
StarfishActivity.prototype.removeTransFrom = function (stone1, color) {
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
StarfishActivity.prototype.removeTransTo = function (stone2, color) {
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
StarfishActivity.prototype.getStoneByName = function (name) {
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
StarfishActivity.prototype.getTransFrom = function (stone1, color) {
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
StarfishActivity.prototype.getTransTo = function (stone2, color) {
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

