var oceanWorld;

var PEN = '<span>&#9998</span>';
var CHECK = '<span>&#10003</span>';
var ERASER = 'X';

var penColors = {
	purple: 0x8b008b,
	orange: 0xff7f00
};

var currentInstructions = '';

//starfish Session
Session.set('starfishInstructions', '');
Session.set('starfishPen', '');
Session.set('starfishHeader', '');
Session.set('starfishBtnInstruc', '');

//net Session
Session.set('oceanLang', '');
Session.set('oceanChoosingMode', 'language');
Session.set('oceanParsings', []);
Session.set('oceanCompletedParsings', []);
Session.set('oceanErrorMessage', '');
Session.set('oceanPointsDisplay', '');

//general ocean world Session
Session.set('oceanLocation', 'oceanWorld');

var buttonInstructions = {
	'addStoneButton': 'Click to <span class="gray">add a starfish</span> to your structure.',
	'finalStoneButton': 'Click to turn your pen green. When your pen is green, you can click a starfish to <span class="green">mark it as final or not final</span>.',
	'purplePenButton': 'Click to turn your pen purple. When your pen is purple, you can click two starfish to add a <span class="purple">purple transition</span> between them.',
	'orangePenButton': 'Click to turn your pen orange. When your pen is orange, you can click two starfish to add an <span class="orange">orange transition</span> between them.',
	'deleteButton': 'Click to turn on <span class="pink">delete mode</span>. In delete mode, you can click a starfish or transition to delete it.',
	'testButton': 'Click to <span class="yellow">test</span> your structure on two different patterns.',
	'resetButton': 'Click to <span class="blue">clear</span> your structure and start over.',
	'starfishHintButton': 'Click to receive a <span class="red">hint</span>.',
	'backButton': 'Click to return to <span class="blue">Ocean World</span>.'
}

Template.OceanWorld.onRendered(function () {
	Session.set('oceanLocation', 'oceanWorld');
	$('#currentPen').prop('disabled', true);
	$('#nextLangButton').hide();

	//if oceanWorld hasn't already been created, create it
	if (!oceanWorld) {
		if (!Meteor.user()) {
			return;
		}
		Meteor.call('getStudentOceanStarfishStates', Meteor.userId(), function (error, starfishStates) {
			var state = starfishStates[starfishStates.length - 1];
	
			oceanWorld = new OceanWorld(state);
			oceanWorld.starfishActivity.username = Meteor.user().username;
			oceanWorld.drawScene();
		});
	} else {
		oceanWorld.drawScene();
	}
});

Template.OceanWorld.helpers({
	//oceanWorld
	'owInstructions': function () {
		return Session.get('owInstructions');
	},
	'inStarfish': function () {
		return Session.get('oceanLocation') == 'starfish';
	},

	'inNet': function () {
		return Session.get('oceanLocation') == 'net';
	},

	//starfish
	'starfishInstructions': function () {
		return Session.get('starfishInstructions');
	},
	'dfaScoreStarfish': function () {
		var dfaScore = DFAScores.find({studentId: Meteor.userId(), world: 'ocean'}).fetch()[0].dfaScore;
		var minDFA = globalWorlds['#oceanworld'].minDFA;

		var percentage = 100 * dfaScore/minDFA;
		return percentage.toFixed(0) + '%';
	},
	'starfishPen': function () {
		return Session.get('starfishPen');
	},
	'starfishHeader': function () {
		return Session.get('starfishHeader');
	},
	'starfishBtnInstruc': function () {
		return Session.get('starfishBtnInstruc');
	},
	'hintsUsed': function () {
		return BayesFeatures.find({studentId: Meteor.userId(), world: 'ocean'}).fetch()[0].hintsUsed;
	},
	'maxHints': function () {
		return oceanWorld.starfishActivity.maxHints;
	},

	//net
	'netLang': function () {
		return Session.get('netLang');
	},
	'choosingLanguage': function () {
		return Session.get('netChoosingMode') == 'language';
	},
	'choosingString': function () {
		return Session.get('netChoosingMode') == 'string';
	},
	'choosingParsing': function () {
		return Session.get('netChoosingMode') == 'parsing';
	},
	'choosingI': function () {
		return Session.get('netChoosingMode') == 'i';
	},
	'choosingReason': function () {
		return Session.get('netChoosingMode') == 'reason';
	},
	'stringChoice': function () {
		return Session.get('netStringChoice');
	},
	'parsingChoice': function () {
		return Session.get('netParsingChoice');
	},
	'iChoice': function () {
		return Session.get('netIChoice');
	},
	'stringChoices': function () {
		var choices = [];
		var parsings = Session.get('netParsings');
		for (var i in parsings) {
			choices.push({choice: i});
		}
		return choices;
	},
	'parsingChoices': function () {
		return parsingChoices();
	},
	'numParsingChoices': function () {
		var parsings = parsingChoices();
		var numParsings = parsingChoices().length;
		var article = numParsings == 1 ? 'is ' : 'are ';
		var ways = numParsings == 1 ? ' way' : ' ways';
		return article + numParsings + ways;
	},
	'suboptimalParsing': function () {
		var minParsings = oceanWorld.netActivity.minParsingChoices();
		var numParsings = parsingChoices().length;
		return numParsings > minParsings;
	},
	'iChoices': function () {
		var choices = [];
		var iValues = Object.keys(Session.get('netParsings')[Session.get('netStringChoice')][Session.get('netParsingChoice')]);
		for (var i in iValues) {
			choices.push({choice: iValues[i]});
		}
		return choices;
	},
	'reasonChoices': function () {
		var choices = [];
		var reasons = Session.get('netParsings')[Session.get('netStringChoice')][Session.get('netParsingChoice')][Session.get('netIChoice')];
		for (var i = 1; i < reasons.length; i++) {
			choices.push({choice: reasons[i]});
		}
		return choices;
	},
	'netErrorMessage': function () {
		return Session.get('netErrorMessage');
	},
	'netPointsDisplay': function () {
		var scores = PLScores.find({studentId: Meteor.userId(), world: 'ocean'}).fetch()[0];
		var plScore = scores.stringScore + scores.iScore + scores.reasonScore;

		var world = globalWorlds['#oceanworld'];
		var minPL = world.minString + world.minI + world.minReason;

		var percentage = 100 * plScore/minPL;
		return percentage.toFixed(0) + '%';
	},
	'netLanguages': function () {
		var langs = Nonregulars.find({worldName: 'ocean'}).fetch();
		var completedLangs = Students.find({studentId: Meteor.userId()}).fetch()[0].completedLanguages;
		var result = [];

		//check whether all languages have been completed
		var allDone = true;
		for (var i in langs) {
			if (completedLangs.indexOf(langs[i]._id) == -1) {
				allDone = false;
			}
		}

		//if all languages are complete, add them all in (student is starting over)
		if (allDone) {
			for (var j in langs) {
				result.push({description: langs[j].description + ' ' + CHECK, langId: langs[j]._id});
			}
		} 

		//otherwise, only add in languages that haven't already been completed
		else {
			for (var j in langs) {
				if (completedLangs.indexOf(langs[j]._id) == -1) {
					result.push({description: langs[j].description, langId: langs[j]._id});
				}
			}
		}

		return result;
	}
});

Template.OceanWorld.events({
	//oceanWorld
	'mousemove': function (event) {
		if (oceanWorld) {
			//oceanWorld.mouseInteraction(event, false);
		}
	},

	'click #oceanworldSceneDiv': function (event) {
		if (oceanWorld) {
			oceanWorld.mouseInteraction(event, true);
		}
	},

	//starfish
	'click #oceanworldHeaderDiv button': function (event) {
		$(event.target).blur();
	},

	'click #testButton': function (event) {
		var testHtml = $(event.target).html();
		var newTestHtml = testHtml == 'TEST' ? 'STOP' : 'TEST';
		$(event.target).html(newTestHtml);

		if (testHtml == 'TEST') {
			oceanWorld.starfishActivity.test();
		} else {
			oceanWorld.starfishActivity.stopTesting();
		}
	},

	'click #addStoneButton': function (event) {
		oceanWorld.starfishActivity.deleteMode = false;
		oceanWorld.starfishActivity.addStone();
		Session.set('starfishPen', '');
	},

	'click #finalStoneButton': function (event) {
		oceanWorld.starfishActivity.transColorName = undefined;
		oceanWorld.starfishActivity.deleteMode = false;
		oceanWorld.starfishActivity.markStoneFinal = true;
		Session.set('starfishInstructions', 'Click a starfish to mark it as final or not final. Final starfish are colored green.');
		Session.set('starfishPen', CHECK);
		$('#currentPen').removeClass('purpleFlip orangeFlip pink').addClass('green');
	},

	'click #purplePenButton': function (event) {
		oceanWorld.starfishActivity.transColorName = 'purple';
		oceanWorld.deleteMode = false;
		oceanWorld.starfishActivity.markStoneFinal = false;
		Session.set('starfishInstructions', 'Your pen is now purple. Click to select your first starfish.');
		Session.set('starfishPen', PEN);
		$('#currentPen').removeClass('orangeFlip green pink').addClass('purpleFlip');
	},

	'click #orangePenButton': function (event) {
		oceanWorld.starfishActivity.transColorName = 'orange';
		oceanWorld.deleteMode = false;
		oceanWorld.starfishActivity.markStoneFinal = false;
		Session.set('starfishInstructions', 'Your pen is now orange. Click to select your first starfish.');
		Session.set('starfishPen', PEN);
		$('#currentPen').removeClass('purpleFlip green pink').addClass('orangeFlip');
	},

	'click #deleteButton': function (event) {
		oceanWorld.starfishActivity.transColorName = undefined;
		oceanWorld.starfishActivity.deleteMode = true;
		oceanWorld.starfishActivity.markStoneFinal = false;
		Session.set('starfishInstructions', 'Click on a starfish or transition to delete it.');
		Session.set('starfishPen', ERASER);
		$('#currentPen').removeClass('purpleFlip orangeFlip green').addClass('pink');
	},

	'click #resetButton': function (event) {
		oceanWorld.starfishActivity.transColorName = undefined;
		oceanWorld.starfishActivity.deleteMode = false;
		oceanWorld.starfishActivity.markStoneFinal = false;
		oceanWorld.starfishActivity.reset();
		Session.set('starfishPen', '');
	},

	'click #starfishHintButton': function (event) {
		oceanWorld.starfishActivity.getHint();
	},

	'click #backButton': function (event) {
		oceanWorld.starfishActivity.transColorName = undefined;
		oceanWorld.starfishActivity.deleteMode = false;
		oceanWorld.starfishActivity.markStoneFinal = false;
		oceanWorld.backToOceanWorld();
		Session.set('starfsihPen', '');
	},

	'click #nextLangButton': function (event) {
		$(event.target).blur();
		oceanWorld.starfishActivity.nextLanguage();
	},

	'mouseenter #oceanworldHeaderDiv button': function (event) {
		$('#starfishHintText').hide();
		var id = event.target.id;
		if ($(event.target).html() == 'STOP') {
			Session.set('starfishBtnInstruc', 'Click to <span class="yellow">stop testing</span>.');
		} else {
			Session.set('starfishBtnInstruc', buttonInstructions[id]);
		}
		if ($(event.target).css('opacity') < 1.0) {
			$(event.target).css({'opacity': 0.75});
		}
	},

	'mouseleave #oceanworldHeaderDiv button': function (event) {
		$('#starfishHintText').show();
		Session.set('starfishBtnInstruc', '');
		if ($(event.target).css('opacity') < 1.0) {
			$(event.target).css({'opacity': 0.5});
		}
	},


	//net
	'click #netBackButton': function (event) {
		oceanWorld.backToOceanWorld();
	},

	'click #changeStringButton': function (event) {
		oceanWorld.netActivity.changeString();
	},

	'click .stringChoiceButton': function (event) {
		oceanWorld.netActivity.chooseString($(event.target).html());
	},

	'click .parsingChoiceButton': function (event) {
		oceanWorld.netActivity.chooseParsing($(event.target).html());
	},

	'click .iChoiceButton': function (event) {
		oceanWorld.netActivity.chooseI($(event.target).html());
	},

	'click .reasonChoiceButton': function (event) {
		oceanWorld.netActivity.chooseReason($(event.target).html());
	},

	'click #nextNetLangButton': function (event) {
		oceanWorld.netActivity.reset();
	},

	'change #netLangSelect': function (event) {
		$(event.target).blur();
		var select = document.getElementById('netLangSelect');
		var value = select.value;
		console.log('value: ', value);
		var langIndex = 0;
		for (var l in oceanWorld.netActivity.netLangs) {
			if (oceanWorld.netActivity.netLangs[l]._id == value) {
				langIndex = l;
			}
		}
		if (langIndex >= 0) {
			oceanWorld.netActivity.setLanguage(langIndex);
		}
	},
});

function parsingChoices () {
	var choices = [];
	var parsings = Session.get('netParsings')[Session.get('netStringChoice')];
	for (var i in parsings) {
		var disabled = Session.get('netCompletedParsings').indexOf(i) != -1;
		var cName = disabled ? 'parsingChoiceButton disabledNet' : 'parsingChoiceButton';
		var extra = disabled ? ' ' + CHECK : '';
		choices.push({choice: i + extra, isDisabled: disabled, className: cName});
	}
	return choices;
}

