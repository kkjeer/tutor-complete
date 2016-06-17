var CORRECT_PROB = 0.9;

/*
Computer()
Purpose: creates a new computer object with states and actions that probabilistically models the solution to a language problem
Parameters:
	langIndex (int): index of the language to model
*/
Computer = function (langIndex) {
	//initialize the states with the state of having no stones and no transitions
	this.computerStates = [
		{
			name: COMP_NAME + 'RiverState0',
			studentId: COMP_NAME,
			date: new Date(),
			'stones': [],
			transitions: {purple: {}, orange: {}},
			testsPassed: 0,
			'langIndex': langIndex
		}
	];
	this.computerStones = [];
	this.computerActions = [];
	this.computerLangIndex = 0;

	//find the languages to model
	var riverLangs = RiverLanguages.find({}).fetch().map(function (langEntry) {
		return new FiniteLanguage(langEntry.language);
	});

	//model the solution to the language at langIndex
	this.addComputerSolution(riverLangs[langIndex], langIndex);

	//mark the final state as correct
	this.computerStates[this.computerStates.length - 1].isCorrect = true;
}

/*
addComputerSolution()
Purpose: updates this.computerStates and this.computerActions
				 by taking either the correct or incorrect transition at each step, according to CORRECT_PROB
Parameters:
	finiteLang (FiniteLanguage): the language to model
	index (int): the index of the language
*/
Computer.prototype.addComputerSolution = function (finiteLang, index) {
	var str = finiteLang.randomString();

	//reset the stones and language index
	this.computerStones = [];
	this.computerLangIndex = index;

	//add the stones
	for (var s = 0; s < str.length + 2; s++) {
		var stoneName = COMP_NAME + 'RiverSS' + s;
		this.computerStones.push(stoneName);
		this.addStone(s);
	}

	//add the transitions
	var transitions = {purple: [], orange: []};
	for (var i in this.computerStones) {
		if (Math.random() < CORRECT_PROB) {
			transitions = this.addCorrectTransition(str, transitions, i);
		} else {
			transitions = this.addRandomTransition(str, transitions, i);
		}
	}
}

/*
addCorrectTransition()
Purpose: adds the correct transition, determined by the position in the string in the language
Parameters:
	str (string): string in the language
	transitions (object): transitions to update
	i (int): current position in the string
*/
Computer.prototype.addCorrectTransition = function (str, transitions, i) {
	var numStones = str.length + 2;
	var stoneName = COMP_NAME + 'RiverSS';
	var currentStone = stoneName + i;
	var nextPurpleIndex = i;
	var nextOrangeIndex = i;

	if (i == str.length) {
		nextPurpleIndex = parseInt(i) + 1;
		nextOrangeIndex = parseInt(i) + 1;
	} else if (i < str.length) {
		//purple to next stone, orange to safety
		if (str[i] == '0') {
			nextPurpleIndex = parseInt(i) + 1;
			nextOrangeIndex = numStones - 1;
		} 
		//purple to safety, orange to next stone
		else {
			nextPurpleIndex = numStones - 1;
			nextOrangeIndex = parseInt(i) + 1;
		}
	}

	transitions['purple'][currentStone] = stoneName + nextPurpleIndex;
	transitions['orange'][currentStone] = stoneName + nextOrangeIndex;
	this.addTransition(currentStone, stoneName + nextPurpleIndex, 'purple', transitions);
	this.addTransition(currentStone, stoneName + nextOrangeIndex, 'orange', transitions);
	return transitions;
}

/*
addRandomTransition()
Purpose: adds a random transition, determined by the position in the string in the language
Parameters:
	str (string): string in the language
	transitions (object): transitions to update
	i (int): current position in the string
*/
Computer.prototype.addRandomTransition = function (str, transitions, i) {
	var numStones = str.length + 2;
	var stoneName = COMP_NAME + 'RiverSS';
	var currentStone = stoneName + i;

	var nextPurpleIndex = Math.floor(Math.random() * numStones);
	var nextOrangeIndex = Math.floor(Math.random() * numStones);

	transitions['purple'][currentStone] = stoneName + nextPurpleIndex;
	transitions['orange'][currentStone] = stoneName + nextOrangeIndex;
	this.addTransition(currentStone, stoneName + nextPurpleIndex, 'purple', transitions);
	this.addTransition(currentStone, stoneName + nextOrangeIndex, 'orange', transitions);
	return transitions;
}

/*
addStone()
Purpose: modifies this.computerActions and this.computerStates to reflect adding one stone
Parameters:
	i (int): index of the stone to add
*/
Computer.prototype.addStone = function (i) {
	var currentState = this.computerStates.length - 1;
	var nextState = currentState + 1;
	var stoneName = COMP_NAME + 'RiverSS' + i;

	//add the action of adding a stone
	var action = {
		fromState: COMP_NAME + 'RiverState' + currentState,
		toState: COMP_NAME + 'RiverState' + nextState,
		studentId: COMP_NAME,
		date: new Date(),
		type: 'add',
		stone1: stoneName,
		stone2: null,
		trans: null
	};
	this.computerActions.push(action);

	var stoneObjects = this.computerStones.map(function (stone) {
		return {name: stone, isFinal: false};
	});

	//add the state of having one more stone
	var nextI = parseInt(currentState) + 1;
	var state = {
		name: COMP_NAME + 'RiverState' + nextI,
		studentId: COMP_NAME,
		date: new Date(),
		stones: stoneObjects,
		transitions: {purple: {}, orange: {}},
		testsPassed: 0,
		langIndex: this.computerLangIndex
	};
	this.computerStates.push(state);
}

/*
addTransition()
Purpose: modifies this.computerActions and this.computerStates to reflect adding one transition between stones
Parameters:
	stone1 (string): name of the first stone
	stone2 (string): name of the second stone
	color (string): color of the transition (purple or orange)
	transitionArr (object): contains all the transitions added so far
*/
Computer.prototype.addTransition = function (stone1, stone2, color, transitionArr) {
	//add the action of adding a transition
	var currentState = this.computerStates.length - 1;
	var nextState = currentState + 1;
	var action = {
		fromState: COMP_NAME + 'RiverState' + currentState,
		toState: COMP_NAME + 'RiverState' + nextState,
		studentId: COMP_NAME,
		date: new Date(),
		type: 'add',
		stone1: stone1,
		stone2: stone2,
		trans: color + 'transition' + stone1 + stone2
	};
	this.computerActions.push(action);

	var stoneObjects = this.computerStones.map(function (stone) {
		return {name: stone, isFinal: false};
	});

	//add the state of having one more transition
	var state = {
		name: COMP_NAME + 'RiverState' + this.computerStates.length,
		studentId: COMP_NAME,
		date: new Date(),
		'stones': stoneObjects,
		transitions: copyObject(transitionArr),
		testsPassed: 0,
		langIndex: this.computerLangIndex
	};
	this.computerStates.push(state);
}

/*
copyObject()
Purpose: returns a deep copy of the given object
				 helper for addTransition()
Parameters:
	obj (object): object to copy
*/
function copyObject (obj) {
	var copy = {purple: {}, orange: {}};
	var purpleKeys = Object.keys(obj.purple);
	for (var p in purpleKeys) {
		var pKey = purpleKeys[p];
		copy.purple[pKey] = obj.purple[pKey];
	}
	var orangeKeys = Object.keys(obj.orange);
	for (var o in orangeKeys) {
		var oKey = orangeKeys[o];
		copy.orange[oKey] = obj.orange[oKey];
	}
	return copy;
}