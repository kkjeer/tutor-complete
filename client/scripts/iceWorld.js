var iceWorld;

var PEN = '<span>&#9998</span>';
var CHECK = '<span>&#10003</span>';
var ERASER = 'X';

var penColors = {
	purple: 0x8b008b,
	orange: 0xff7f00
};

var currentInstructions = '';

//iceberg Session
Session.set('icebergInstructions', '');
Session.set('icebergPen', '');
Session.set('icebergHeader', '');
Session.set('icebergBtnInstruc', '');

//tower Session
Session.set('iceLang', '');
Session.set('iceChoosingMode', 'language');
Session.set('iceParsings', []);
Session.set('iceCompletedParsings', []);
Session.set('iceErrorMessage', '');
Session.set('icePointsDisplay', '');

//general ice world Session
Session.set('iceLocation', 'iceWorld');

var buttonInstructions = {
	'addStoneButton': 'Click to <span class="gray">add an iceberg</span> to your structure.',
	'finalStoneButton': 'Click to turn your pen green. When your pen is green, you can click an iceberg to <span class="green">mark it as final or not final</span>.',
	'purplePenButton': 'Click to turn your pen purple. When your pen is purple, you can click two icebergs to add a <span class="purple">purple transition</span> between them.',
	'orangePenButton': 'Click to turn your pen orange. When your pen is orange, you can click two icebergs to add an <span class="orange">orange transition</span> between them.',
	'deleteButton': 'Click to turn on <span class="pink">delete mode</span>. In delete mode, you can click an iceberg or transition to delete it.',
	'testButton': 'Click to <span class="yellow">test</span> your structure on two different patterns.',
	'resetButton': 'Click to <span class="blue">clear</span> your structure and start over.',
	'icebergHintButton': 'Click to receive a <span class="red">hint</span>.',
	'backButton': 'Click to return to <span class="black">Ice World</span>.'
}

Template.IceWorld.onRendered(function () {
	Session.set('iceLocation', 'iceWorld');
	$('#currentPen').prop('disabled', true);
	$('#nextLangButton').hide();

	//if iceWorld hasn't already been created, create it
	if (!iceWorld) {
		if (!Meteor.user()) {
			return;
		}
		Meteor.call('getStudentIcebergStates', Meteor.userId(), function (error, icebergStates) {
			var state = icebergStates[icebergStates.length - 1];
	
			iceWorld = new IceWorld(state);
			iceWorld.icebergActivity.username = Meteor.user().username;
			iceWorld.drawScene();
		});
	} else {
		iceWorld.drawScene();
	}
});

Template.IceWorld.helpers({
	//iceWorld
	'iwInstructions': function () {
		return Session.get('iwInstructions');
	},
	'inIceberg': function () {
		return Session.get('iceLocation') == 'iceberg';
	},

	'inTower': function () {
		return Session.get('iceLocation') == 'tower';
	},

	//iceberg
	'icebergInstructions': function () {
		return Session.get('icebergInstructions');
	},
	'dfaScoreIceberg': function () {
		var dfaScore = DFAScores.find({studentId: Meteor.userId(), world: 'ice'}).fetch()[0].dfaScore;
		var minDFA = globalWorlds['#iceworld'].minDFA;

		var percentage = 100 * dfaScore/minDFA;
		return percentage.toFixed(0) + '%';
	},
	'icebergPen': function () {
		return Session.get('icebergPen');
	},
	'icebergHeader': function () {
		return Session.get('icebergHeader');
	},
	'icebergBtnInstruc': function () {
		return Session.get('icebergBtnInstruc');
	},
	'hintsUsed': function () {
		return BayesFeatures.find({studentId: Meteor.userId(), world: 'ice'}).fetch()[0].hintsUsed;
	},
	'maxHints': function () {
		return iceWorld.icebergActivity.maxHints;
	},

	//tower
	'towerLang': function () {
		return Session.get('towerLang');
	},
	'choosingLanguage': function () {
		return Session.get('towerChoosingMode') == 'language';
	},
	'choosingString': function () {
		return Session.get('towerChoosingMode') == 'string';
	},
	'choosingParsing': function () {
		return Session.get('towerChoosingMode') == 'parsing';
	},
	'choosingI': function () {
		return Session.get('towerChoosingMode') == 'i';
	},
	'choosingReason': function () {
		return Session.get('towerChoosingMode') == 'reason';
	},
	'stringChoice': function () {
		return Session.get('towerStringChoice');
	},
	'parsingChoice': function () {
		return Session.get('towerParsingChoice');
	},
	'iChoice': function () {
		return Session.get('towerIChoice');
	},
	'stringChoices': function () {
		var choices = [];
		var parsings = Session.get('towerParsings');
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
		var minParsings = iceWorld.towerActivity.minParsingChoices();
		var numParsings = parsingChoices().length;
		return numParsings > minParsings;
	},
	'iChoices': function () {
		var choices = [];
		var iValues = Object.keys(Session.get('towerParsings')[Session.get('towerStringChoice')][Session.get('towerParsingChoice')]);
		for (var i in iValues) {
			choices.push({choice: iValues[i]});
		}
		return choices;
	},
	'reasonChoices': function () {
		var choices = [];
		var reasons = Session.get('towerParsings')[Session.get('towerStringChoice')][Session.get('towerParsingChoice')][Session.get('towerIChoice')];
		for (var i = 1; i < reasons.length; i++) {
			choices.push({choice: reasons[i]});
		}
		return choices;
	},
	'towerErrorMessage': function () {
		return Session.get('towerErrorMessage');
	},
	'towerPointsDisplay': function () {
		var scores = PLScores.find({studentId: Meteor.userId(), world: 'ice'}).fetch()[0];
		var plScore = scores.stringScore + scores.iScore + scores.reasonScore;

		var world = globalWorlds['#iceworld'];
		var minPL = world.minString + world.minI + world.minReason;

		var percentage = 100 * plScore/minPL;
		return percentage.toFixed(0) + '%';
	},
	'towerLanguages': function () {
		var langs = Nonregulars.find({worldName: 'ice'}).fetch();
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

Template.IceWorld.events({
	//iceWorld
	'mousemove': function (event) {
		if (iceWorld) {
			//iceWorld.mouseInteraction(event, false);
		}
	},

	'click #iceworldSceneDiv': function (event) {
		if (iceWorld) {
			iceWorld.mouseInteraction(event, true);
		}
	},

	//iceberg
	'click #iceworldHeaderDiv button': function (event) {
		$(event.target).blur();
	},

	'click #testButton': function (event) {
		var testHtml = $(event.target).html();
		var newTestHtml = testHtml == 'TEST' ? 'STOP' : 'TEST';
		$(event.target).html(newTestHtml);

		if (testHtml == 'TEST') {
			iceWorld.icebergActivity.test();
		} else {
			iceWorld.icebergActivity.stopTesting();
		}
	},

	'click #addStoneButton': function (event) {
		iceWorld.icebergActivity.deleteMode = false;
		iceWorld.icebergActivity.addStone();
		Session.set('icebergPen', '');
	},

	'click #finalStoneButton': function (event) {
		iceWorld.icebergActivity.transColorName = undefined;
		iceWorld.icebergActivity.deleteMode = false;
		iceWorld.icebergActivity.markStoneFinal = true;
		Session.set('icebergInstructions', 'Click an iceberg to mark it as final or not final. Final icebergs are colored green.');
		Session.set('icebergPen', CHECK);
		$('#currentPen').removeClass('purpleFlip orangeFlip pink').addClass('green');
	},

	'click #purplePenButton': function (event) {
		iceWorld.icebergActivity.transColorName = 'purple';
		iceWorld.deleteMode = false;
		iceWorld.icebergActivity.markStoneFinal = false;
		Session.set('icebergInstructions', 'Your pen is now purple. Click to select your first iceberg.');
		Session.set('icebergPen', PEN);
		$('#currentPen').removeClass('orangeFlip green pink').addClass('purpleFlip');
	},

	'click #orangePenButton': function (event) {
		iceWorld.icebergActivity.transColorName = 'orange';
		iceWorld.deleteMode = false;
		iceWorld.icebergActivity.markStoneFinal = false;
		Session.set('icebergInstructions', 'Your pen is now orange. Click to select your first iceberg.');
		Session.set('icebergPen', PEN);
		$('#currentPen').removeClass('purpleFlip green pink').addClass('orangeFlip');
	},

	'click #deleteButton': function (event) {
		iceWorld.icebergActivity.transColorName = undefined;
		iceWorld.icebergActivity.deleteMode = true;
		iceWorld.icebergActivity.markStoneFinal = false;
		Session.set('icebergInstructions', 'Click on an iceberg or transition to delete it.');
		Session.set('icebergPen', ERASER);
		$('#currentPen').removeClass('purpleFlip orangeFlip green').addClass('pink');
	},

	'click #resetButton': function (event) {
		iceWorld.icebergActivity.transColorName = undefined;
		iceWorld.icebergActivity.deleteMode = false;
		iceWorld.icebergActivity.markStoneFinal = false;
		iceWorld.icebergActivity.reset();
		Session.set('icebergPen', '');
	},

	'click #icebergHintButton': function (event) {
		iceWorld.icebergActivity.getHint();
	},

	'click #backButton': function (event) {
		iceWorld.icebergActivity.transColorName = undefined;
		iceWorld.icebergActivity.deleteMode = false;
		iceWorld.icebergActivity.markStoneFinal = false;
		iceWorld.backToOceanWorld();
		Session.set('icebergPen', '');
	},

	'click #nextLangButton': function (event) {
		$(event.target).blur();
		iceWorld.icebergActivity.nextLanguage();
	},

	'mouseenter #iceworldHeaderDiv button': function (event) {
		$('#icebergHintText').hide();
		var id = event.target.id;
		if ($(event.target).html() == 'STOP') {
			Session.set('icebergBtnInstruc', 'Click to <span class="yellow">stop testing</span>.');
		} else {
			Session.set('icebergBtnInstruc', buttonInstructions[id]);
		}
		if ($(event.target).css('opacity') < 1.0) {
			$(event.target).css({'opacity': 0.75});
		}
	},

	'mouseleave #iceworldHeaderDiv button': function (event) {
		$('#icebergHintText').show();
		Session.set('icebergBtnInstruc', '');
		if ($(event.target).css('opacity') < 1.0) {
			$(event.target).css({'opacity': 0.5});
		}
	},


	//tower
	'click #towerBackButton': function (event) {
		iceWorld.backToIceWorld();
	},

	'click #changeStringButton': function (event) {
		iceWorld.towerActivity.changeString();
	},

	'click .stringChoiceButton': function (event) {
		iceWorld.towerActivity.chooseString($(event.target).html());
	},

	'click .parsingChoiceButton': function (event) {
		iceWorld.towerActivity.chooseParsing($(event.target).html());
	},

	'click .iChoiceButton': function (event) {
		iceWorld.towerActivity.chooseI($(event.target).html());
	},

	'click .reasonChoiceButton': function (event) {
		iceWorld.towerActivity.chooseReason($(event.target).html());
	},

	'click #nextTowerLangButton': function (event) {
		iceWorld.towerActivity.reset();
	},

	'change #towerLangSelect': function (event) {
		$(event.target).blur();
		var select = document.getElementById('towerLangSelect');
		var value = select.value;
		console.log('value: ', value);
		var langIndex = 0;
		for (var l in iceWorld.towerActivity.towerLangs) {
			if (iceWorld.towerActivity.towerLangs[l]._id == value) {
				langIndex = l;
			}
		}
		if (langIndex >= 0) {
			iceWorld.towerActivity.setLanguage(langIndex);
		}
	},
});

function parsingChoices () {
	var choices = [];
	var parsings = Session.get('towerParsings')[Session.get('towerStringChoice')];
	for (var i in parsings) {
		var disabled = Session.get('towerCompletedParsings').indexOf(i) != -1;
		var cName = disabled ? 'parsingChoiceButton disabledTower' : 'parsingChoiceButton';
		var extra = disabled ? ' ' + CHECK : '';
		choices.push({choice: i + extra, isDisabled: disabled, className: cName});
	}
	return choices;
}

