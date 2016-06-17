setUpStudents = function (userid) {
	Students.insert({_id: userid, studentId: userid, name: Meteor.users.findOne(userid).username, weeklyFaves: 3, completedLanguages: []});
}

setUpPoints = function (userid) {
	Points.insert({_id: userid, junglePoints: 50, oceanPoints: 25, icePoints: 10});
}

setUpBayes = function (userid) {

}

setUpPerceptron = function (userid) {
	Perceptron.insert({timeTakenWeight: 0, hintsUsedWeight: 0, numResetsWeight: 0, numTestsWeight: 0,
											numDeletedTransitionsWeight: 0, numChangedTransitionsWeight: 0});
	trainPerceptron();
}

setUpBayesFeatures = function (userid) {
	BayesFeatures.insert({studentId: userid, world: 'jungle', 
														timeTaken: 0, hintsUsed: 0, numResets: 0, numTests: 0, 
														numDeletedTransitions: 0, numChangedTransitions: 0});
	BayesFeatures.insert({studentId: userid, world: 'ocean', 
														timeTaken: 0, hintsUsed: 0, numResets: 0, numTests: 0, 
														numDeletedTransitions: 0, numChangedTransitions: 0});
	BayesFeatures.insert({studentId: userid, world: 'ice', 
														timeTaken: 0, hintsUsed: 0, numResets: 0, numTests: 0, 
														numDeletedTransitions: 0, numChangedTransitions: 0});
}

setUpDFAScores = function (userid) {
	DFAScores.insert({studentId: userid, world: 'jungle', dfaScore: INIT_DFA, dfaGuess: GUESS_PL, dfaSlip: SLIP_PL});
	DFAScores.insert({studentId: userid, world: 'ocean', dfaScore: INIT_DFA, dfaGuess: GUESS_PL, dfaSlip: SLIP_PL});
	DFAScores.insert({studentId: userid, world: 'ice', dfaScore: INIT_DFA, dfaGuess: GUESS_PL, dfaSlip: SLIP_PL});
}

setUpPLScores = function (userid) {
	PLScores.insert({studentId: userid, world: 'jungle', plScore: INIT_PL, stringScore: INIT_PL, iScore: INIT_PL, reasonScore: INIT_PL});
	PLScores.insert({studentId: userid, world: 'ocean', plScore: INIT_PL, stringScore: INIT_PL, iScore: INIT_PL, reasonScore: INIT_PL});
	PLScores.insert({studentId: userid, world: 'ice', plScore: INIT_PL, stringScore: INIT_PL, iScore: INIT_PL, reasonScore: INIT_PL});
}

setUpExplanations = function (userid) {
	var username = Meteor.users.findOne(userid).username;
	Explanations.insert({author: username, title: 'Study Habits', text: 'Studying for this class is different from CS 111.', tag: '#other', date: new Date()});
	Explanations.insert({author: 'wwellesley', title: 'Finite Patterns', text: 'There is a pattern to building structures in the river.', tag: '#river', date: new Date('2015-10-25')});
	Explanations.insert({author: 'wethreegraphics', title: 'Choosing Strings', text: 'When choosing a string to pump, it is important to keep the pumping length in mind.', tag: '#table', date: new Date('2015-11-17')});
	Explanations.insert({author: 'meteorshower', title: 'Final Thoughts', text: 'Over the course of the semester I have learned several important things about how to learn abstract concepts.', tag: '#other', date: new Date('2015-12-12')});
}

setUpExpFaves = function (userid) {
	var username = Meteor.users.findOne(userid).username;
	ExpFaves.insert({fromUser: username, toUser: 'wethreegraphics', toExp: Explanations.findOne({author: 'wethreegraphics'})._id, date: new Date()});
	ExpFaves.insert({fromUser: username, toUser: 'meteorshower', toExp: Explanations.findOne({author: 'meteorshower'})._id, date: new Date()});
	ExpFaves.insert({fromUser: 'wethreegraphics', toUser: 'meteorshower', toExp: Explanations.findOne({author: 'meteorshower'})._id, date: new Date()});
}

setUpActFaves = function (userid) {
	var username = Meteor.users.findOne(userid).username;
}

setUpJungleRiverStates = function (userid) {
	var username = Meteor.users.findOne(userid).username;

	JungleRiverStates.insert({
		name: username + 'RiverState0',
		studentId: userid, 
		date: new Date(), 
		stones: [], 
		transitions: {purple: {}, orange: {}}, 
		testsPassed: 0, langIndex: 0, isCorrect: false, explanationWritten: false
	});
}

setUpJungleRiverActions = function (userid) {

}

setUpOceanStarfishStates = function (userid) {
	var username = Meteor.users.findOne(userid).username;

	OceanStarfishStates.insert({
		name: username + 'StarfishState0',
		studentId: userid, 
		date: new Date(), 
		stones: [], 
		transitions: {purple: {}, orange: {}}, 
		testsPassed: 0, langIndex: 0, isCorrect: false, explanationWritten: false
	});
}

setUpOceanStarfishActions = function (userid) {

}

setUpIcebergStates = function (userid) {
	var username = Meteor.users.findOne(userid).username;

	IcebergStates.insert({
		name: username + 'IcebergState0',
		studentId: userid, 
		date: new Date(), 
		stones: [], 
		transitions: {purple: {}, orange: {}}, 
		testsPassed: 0, langIndex: 0, isCorrect: false, explanationWritten: false
	});
}

setUpIcebergActions = function (userid) {

}

setUpRiverLanguages = function () {
	RiverLanguages.insert({language: '01101'});
	RiverLanguages.insert({language: '1110'});
	RiverLanguages.insert({language: '010110'});
	RiverLanguages.insert({language: '111'});
	RiverLanguages.insert({language: '100011'});
}

setUpOceanLanguages = function () {
	OceanLanguages.insert({condition: 'atMostN', args: [2, '0']});
	OceanLanguages.insert({condition: 'containsSubstring', args: ['011']});
	OceanLanguages.insert({condition: 'exactlyN', args: [3, '0']});
	OceanLanguages.insert({condition: 'beginsWith', args: ['01']});
	OceanLanguages.insert({condition: 'noSubstring', args: ['100']});
	OceanLanguages.insert({condition: 'atLeastN', args: [1, '1']});
	OceanLanguages.insert({condition: 'endsWith', args: ['1010']});
}

setUpIceLanguages = function () {
	IceLanguages.insert({regex: '10*'});
	IceLanguages.insert({regex: '01*'});
	IceLanguages.insert({regex: '0(10)*1+'});
	IceLanguages.insert({regex: '101|010'});
	IceLanguages.insert({regex: '000|111'});
}

setUpTableStates = function (userid) {
	var username = Meteor.users.findOne(userid).username;

	TableStates.insert({
		name: username + 'TableState0',
		studentId: userid,
		date: new Date(),
		penalty: 0,
		langIndex: 0,
		completedParsings: [],
		choosingMode: 'language',
		stringChoice: '',
		parsingChoice: '',
		iChoice: '',
		reasonChoice: ''
	});
}

setUpNetStates = function (userid) {
	var username = Meteor.users.findOne(userid).username;

	NetStates.insert({
		name: username + 'NetState0',
		studentId: userid,
		date: new Date(),
		penalty: 0,
		langIndex: 0,
		completedParsings: [],
		choosingMode: 'language',
		stringChoice: '',
		parsingChoice: '',
		iChoice: '',
		reasonChoice: ''
	});
}

setUpTowerStates = function (userid) {
	var username = Meteor.users.findOne(userid).username;

	TowerStates.insert({
		name: username + 'TowerState0',
		studentId: userid,
		date: new Date(),
		penalty: 0,
		langIndex: 0,
		completedParsings: [],
		choosingMode: 'language',
		stringChoice: '',
		parsingChoice: '',
		iChoice: '',
		reasonChoice: ''
	});
}

setUpNonregulars = function () {
	for (var i in nonRegularLanguages) {
		Nonregulars.insert(nonRegularLanguages[i]);
	}
}

setUpNonregularRewards = function (userid) {
	NonregularRewards.insert({
		studentId: userid,
		langId: '0n1n',
		reward: 10
	});

	NonregularRewards.insert({
		studentId: userid,
		langId: '0i1ji<j',
		reward: 20
	});

	NonregularRewards.insert({
		studentId: userid,
		langId: '0i1ji>j',
		reward: 20
	});

	NonregularRewards.insert({
		studentId: userid,
		langId: '0i1ji!=j',
		reward: 20
	});
}

setUpHintsUsed = function (userid) {
	HintsUsed.insert({studentId: userid, riverHints: 0});
	HintsUsed.insert({studentId: userid, starfishHints: 0});
}

computeGuess = function (userid, worldName) {
	var prior = 0.3;
	var likelihood = getLikelihood('guess', userid, worldName);
	var evidence = getEvidence(userid, worldName);
	var guess = prior * likelihood/evidence;
	if (guess < 0.1) guess = 0.1;
	if (guess > 0.5) guess = 0.5;
	return guess;
}

computeSlip = function (userid, worldName) {
	var prior = 0.1;
	var likelihood = getLikelihood('slip', userid, worldName);
	var evidence = getEvidence(userid, worldName);
	var slip = prior * likelihood/evidence;
	if (slip < 0.1) slip = 0.1;
	if (slip > 0.5) slip = 0.5;
	return slip;
}

getLikelihood = function (guessOrSlip, userid, worldName) {
	var features = BayesFeatures.find({studentId: userid, world: worldName}).fetch()[0];
	var featureNames = Object.keys(features);

	var likelihood = 1;
	var numFeatures = 0;

	for (var i in featureNames) {
		var name = featureNames[i];
		var bData = bayesTestData[guessOrSlip][name];
		if (bData) {
			//console.log(name, ' mult by ', bData[getRangeIndex(name, features[name])]);
			likelihood = likelihood + bData[getRangeIndex(name, features[name])];
			numFeatures++;
		}
	}

	return likelihood/numFeatures;
}

getEvidence = function (userid, worldName) {
	var features = BayesFeatures.find({studentId: userid, world: worldName}).fetch()[0];
	var featureNames = Object.keys(features);

	var evidence = 1;
	var numFeatures = 0;

	for (var i in featureNames) {
		var name = featureNames[i];
		var bData = bayesTestData['total'][name];
		if (bData) {
			evidence = evidence + bData[getRangeIndex(name, features[name])];
			numFeatures++;
		}
	}

	return evidence/numFeatures;
}

function getRangeIndex (feature, value) {
	var range = bayesRanges[feature];
	for (var i = 0; i < range.length - 1; i++) {
		if (value >= range[i] && value < range[i + 1]) {
			return i;
		}
	}
	return 0;
}

