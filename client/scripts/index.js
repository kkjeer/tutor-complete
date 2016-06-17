var HEART = '&#9829';

Accounts.ui.config({
	passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
});

Students = new Meteor.Collection('students');
Points = new Meteor.Collection('points');
Explanations = new Meteor.Collection('explanations');
ExpFaves = new Meteor.Collection('expfaves');
JungleRiverStates = new Meteor.Collection('jungleriverstates');
JungleRiverActions = new Meteor.Collection('jungleriveractions');
OceanStarfishStates = new Meteor.Collection('oceanstarfishstates');
OceanStarfishActions = new Meteor.Collection('oceanstarfishactions');
IcebergStates = new Meteor.Collection('icebergstates');
IcebergActions = new Meteor.Collection('icebergactions');
RiverLanguages = new Meteor.Collection('riverlanguages');
OceanLanguages = new Meteor.Collection('oceanlanguages');
IceLanguages = new Meteor.Collection('icelanguages');
Nonregulars = new Meteor.Collection('nonregulars');
NonregularRewards = new Meteor.Collection('nonregularrewards');
TableStates = new Meteor.Collection('tablestates');
NetStates = new Meteor.Collection('netstates');
TowerStates = new Meteor.Collection('towerstates');
HintsUsed = new Meteor.Collection('hintsused');
DFAScores = new Meteor.Collection('dfascores');
PLScores = new Meteor.Collection('plscores');
BayesFeatures = new Meteor.Collection('bayesfeatures');

Template.body.onRendered(function () {
	$('[data-toggle="tooltip"]').tooltip();
});

Template.registerHelper('userName', function () {
	return capitalize(Meteor.user().username) || '';
});

Template.registerHelper('weeklyFaves', function () {
	var currentStudent = Students.find({_id: Meteor.userId()}).fetch()[0];
	var faves =  currentStudent ? currentStudent.weeklyFaves : 0;
	var result = '<span>';
	for (var i = 0; i < faves; i++) {
		result += HEART;
	}
	result += '</span>';
	return result;
});

Template.registerHelper('worldKeys', function () {
	return Object.keys(globalWorlds);
});

Template.registerHelper('worldObjects', function () {
	var worldArray = [];
	for (var o in globalWorlds) {
    	worldArray.push(globalWorlds[o]);
	}
	return worldArray;
});

Template.registerHelper('worldHref', function (worldTag) {
	return '/worlds' + worldTag;
});

Template.registerHelper('worldTitle', function (worldTag) {
	return globalWorlds[worldTag].title;
});

Template.registerHelper('userPoints', function () {
	var pointsObject = Points.find({_id: Meteor.userId()}).fetch()[0];
	return pointsObject.junglePoints + pointsObject.oceanPoints + pointsObject.icePoints;
});

Template.registerHelper('pointsForWorld', function (worldPrefix) {
	return Points.find({_id: Meteor.userId()}).fetch()[0][worldPrefix + 'Points'];
});

Template.registerHelper('pointOrPoints', function (worldPrefix) {
	return Blaze._globalHelpers.pointsForWorld(worldPrefix) == 1 ? 'Point' : 'Points';
});

Template.registerHelper('unlockedWorld', function (worldTag) {
	switch (worldTag) {
		case '#jungleworld':
			return true;
		case '#oceanworld':
			return Blaze._globalHelpers.masteredWorld('#jungleworld');
		case '#iceworld':
			return Blaze._globalHelpers.masteredWorld('#oceanworld');
	}

	var world = globalWorlds[worldTag];

	var minDFA = globalWorlds[worldTag].minDFA;
	var dfaScore = DFAScores.find({studentId: Meteor.userId(), world: globalWorlds[worldTag].prefix}).fetch()[0].dfaScore;
	var unlockedDFA = dfaScore >= minDFA;

	var scores = PLScores.find({studentId: Meteor.userId(), world: globalWorlds[worldTag].prefix}).fetch()[0];
	var unlockedPL = scores.stringScore >= world.minString && scores.iScore >= world.minI && scores.reasonScore >= world.minReason;

	return unlockedDFA && unlockedPL;

	return Blaze._globalHelpers.userPoints() >= globalWorlds[worldTag].pointsToUnlock;
});

Template.registerHelper('masteredWorld', function (worldTag) {
	var world = globalWorlds[worldTag];

	var minDFA = globalWorlds[worldTag].minDFA;
	var dfaScore = DFAScores.find({studentId: Meteor.userId(), world: globalWorlds[worldTag].prefix}).fetch()[0].dfaScore;
	var masteredDFA = dfaScore >= minDFA;

	var scores = PLScores.find({studentId: Meteor.userId(), world: globalWorlds[worldTag].prefix}).fetch()[0];
	var masteredPL = scores.stringScore >= world.minString && scores.iScore >= world.minI && scores.reasonScore >= world.minReason;

	return masteredDFA && masteredPL;

	return Blaze._globalHelpers.pointsForWorld(globalWorlds[worldTag].prefix) >= globalWorlds[worldTag].pointsToMaster;
});

Template.registerHelper('formattedDate', function (date) {
	return date.toLocaleDateString('en-us', {month: 'long', day: 'numeric', weekday: 'long'});
});

Template.registerHelper('worldProgressPercentage', function (worldTag) {
	var world = globalWorlds[worldTag];
	var dfaScore = DFAScores.find({studentId: Meteor.userId(), world: globalWorlds[worldTag].prefix}).fetch()[0].dfaScore;
	var minDFA = world.minDFA;

	var plScore = 0;
	for (var i = 0; i < globalSkills.length; i++) {
		plScore += plSkillScore(worldTag, globalSkills[i]);
	}

	var minPL = world.minString + world.minI + world.minReason;

	var percentage = 100 * (dfaScore + plScore)/(minDFA + minPL);
	return percentage.toFixed(0) + '%';

	var unlocked = Blaze._globalHelpers.unlockedWorld(worldTag)
	var worldPoints = unlocked ? globalWorlds[worldTag].pointsToMaster : globalWorlds[worldTag].pointsToUnlock;
	var userPoints = unlocked ? Blaze._globalHelpers.pointsForWorld(globalWorlds[worldTag].prefix) : Blaze._globalHelpers.userPoints(worldTag);

	if (worldPoints == 0 || userPoints > worldPoints) {
		return '100%';
	}

	percentage = 100 * userPoints/worldPoints;
	return percentage.toFixed(0) + '%';
});

function plSkillScore (worldTag, skill) {
	switch (skill) {
		case globalSkills[0]:
			var stringScore = PLScores.find({studentId: Meteor.userId(), world: globalWorlds[worldTag].prefix}).fetch()[0].stringScore;
			return stringScore;
			break;
		case globalSkills[1]:
			var iScore = PLScores.find({studentId: Meteor.userId(), world: globalWorlds[worldTag].prefix}).fetch()[0].iScore;
			return iScore;
			break;
		case globalSkills[2]:
			var reasonScore = PLScores.find({studentId: Meteor.userId(), world: globalWorlds[worldTag].prefix}).fetch()[0].reasonScore;
			return reasonScore;
			break;
	}
}

function minPLSkill (worldTag, skill) {
	var world = globalWorlds[worldTag];
	switch (skill) {
		case globalSkills[0]:
			return world.minString;
			break;
		case globalSkills[1]:
			return world.minI;
			break;
		case globalSkills[2]:
			return world.minReason;
			break;
	}
}


