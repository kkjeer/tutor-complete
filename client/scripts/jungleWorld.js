var jungleWorld;

var PEN = '<span>&#9998</span>';
var CHECK = '<span>&#10003</span>';
var ERASER = 'X';

var penColors = {
	purple: 0x8b008b,
	orange: 0xff7f00
};

var currentInstructions = '';

//river Session
Session.set('riverInstructions', '');
Session.set('riverPen', '');
Session.set('riverHeader', '');
Session.set('riverBtnInstruc', '');

//table Session
Session.set('tableLang', '');
Session.set('tableChoosingMode', 'language');
Session.set('tableParsings', []);
Session.set('tableCompletedParsings', []);
Session.set('tableErrorMessage', '');
Session.set('tablePointsDisplay', '');

//general jungle world Session
Session.set('jungleLocation', 'jungleWorld');

var buttonInstructions = {
	'addStoneButton': 'Click to <span class="gray">add a stone</span> to your structure.',
	'finalStoneButton': 'Click to turn your pen green. When your pen is green, you can click a stone to <span class="green">mark it as final or not final</span>.',
	'purplePenButton': 'Click to turn your pen purple. When your pen is purple, you can click two stones to add a <span class="purple">purple transition</span> between them.',
	'orangePenButton': 'Click to turn your pen orange. When your pen is orange, you can click two stones to add an <span class="orange">orange transition</span> between them.</span>',
	'deleteButton': 'Click to turn on <span class="pink">delete mode</span>. In delete mode, you can click a stone or transition to delete it.',
	'testButton': 'Click to <span class="yellow">test</span> your structure on two different patterns.',
	'resetButton': 'Click to <span class="blue">clear</span> your structure and start over.',
	'riverHintButton': 'Click to receive a <span class="red">hint.</span>',
	'backButton': 'Click to return to <span class="green">Jungle World</span>.'
}

Template.JungleWorld.onRendered(function () {
	Session.set('jungleLocation', 'jungleWorld');
	$('#currentPen').prop('disabled', true);
	$('#nextLangButton').hide();

	//if jungleWorld hasn't already been created, create it
	if (!jungleWorld) {
		if (!Meteor.user()) {
			return;
		}
		Meteor.call('getStudentJungleRiverStates', Meteor.userId(), function (error, riverStates) {
			var state = riverStates[riverStates.length - 1];
	
			jungleWorld = new JungleWorld(state);
			jungleWorld.riverActivity.username = Meteor.user().username;
			jungleWorld.drawScene();
		});
	} else {
		jungleWorld.drawScene();
	}
});

Template.JungleWorld.helpers({
	//jungleWorld
	'jwInstructions': function () {
		return Session.get('jwInstructions');
	},
	'inRiver': function () {
		return Session.get('jungleLocation') == 'river';
	},

	'inTable': function () {
		return Session.get('jungleLocation') == 'table';
	},

	//river
	'riverInstructions': function () {
		return Session.get('riverInstructions');
	},
	'dfaScore': function () {
		var dfaScore = DFAScores.find({studentId: Meteor.userId(), world: 'jungle'}).fetch()[0].dfaScore;
		var minDFA = globalWorlds['#jungleworld'].minDFA;

		var percentage = 100 * dfaScore/minDFA;
		return percentage.toFixed(0) + '%';
	},
	'riverPen': function () {
		return Session.get('riverPen');
	},
	'riverHeader': function () {
		return Session.get('riverHeader');
	},
	'riverBtnInstruc': function () {
		return Session.get('riverBtnInstruc');
	},
	'hintsUsed': function () {
		return BayesFeatures.find({studentId: Meteor.userId(), world: 'jungle'}).fetch()[0].hintsUsed;
	},
	'maxHints': function () {
		return jungleWorld.riverActivity.maxHints;
	},

	//table
	'tableLang': function () {
		return Session.get('tableLang');
	},
	'choosingLanguage': function () {
		return Session.get('tableChoosingMode') == 'language';
	},
	'choosingString': function () {
		return Session.get('tableChoosingMode') == 'string';
	},
	'choosingParsing': function () {
		return Session.get('tableChoosingMode') == 'parsing';
	},
	'choosingI': function () {
		return Session.get('tableChoosingMode') == 'i';
	},
	'choosingReason': function () {
		return Session.get('tableChoosingMode') == 'reason';
	},
	'stringChoice': function () {
		return Session.get('tableStringChoice');
	},
	'parsingChoice': function () {
		return Session.get('tableParsingChoice');
	},
	'iChoice': function () {
		return Session.get('tableIChoice');
	},
	'stringChoices': function () {
		var choices = [];
		var parsings = Session.get('tableParsings');
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
		var minParsings = jungleWorld.tableActivity.minParsingChoices();
		var numParsings = parsingChoices().length;
		return numParsings > minParsings;
	},
	'iChoices': function () {
		var choices = [];
		var iValues = Object.keys(Session.get('tableParsings')[Session.get('tableStringChoice')][Session.get('tableParsingChoice')]);
		for (var i in iValues) {
			choices.push({choice: iValues[i]});
		}
		return choices;
	},
	'reasonChoices': function () {
		var choices = [];
		var reasons = Session.get('tableParsings')[Session.get('tableStringChoice')][Session.get('tableParsingChoice')][Session.get('tableIChoice')];
		for (var i = 1; i < reasons.length; i++) {
			choices.push({choice: reasons[i]});
		}
		return choices;
	},
	'tableErrorMessage': function () {
		return Session.get('tableErrorMessage');
	},
	'tablePointsDisplay': function () {
		var scores = PLScores.find({studentId: Meteor.userId(), world: 'jungle'}).fetch()[0];
		var plScore = scores.stringScore + scores.iScore + scores.reasonScore;

		var world = globalWorlds['#jungleworld'];
		var minPL = world.minString + world.minI + world.minReason;

		var percentage = 100 * plScore/minPL;
		return percentage.toFixed(0) + '%';
	},
	'tableLanguages': function () {
		var langs = Nonregulars.find({worldName: 'jungle'}).fetch();
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

Template.JungleWorld.events({
	//jungleWorld
	'mousemove': function (event) {
		if (jungleWorld) {
			//jungleWorld.mouseInteraction(event, false);
		}
	},

	'click #jungleworldSceneDiv': function (event) {
		if (jungleWorld) {
			jungleWorld.mouseInteraction(event, true);
		}
	},

	//river
	'click #jungleworldHeaderDiv button': function (event) {
		$(event.target).blur();
	},

	'click #testButton': function (event) {
		var testHtml = $(event.target).html();
		var newTestHtml = testHtml == 'TEST' ? 'STOP' : 'TEST';
		$(event.target).html(newTestHtml);

		if (testHtml == 'TEST') {
			jungleWorld.riverActivity.test();
		} else {
			jungleWorld.riverActivity.stopTesting();
		}
	},

	'click #addStoneButton': function (event) {
		jungleWorld.riverActivity.deleteMode = false;
		jungleWorld.riverActivity.addStone();
		Session.set('riverPen', '');
	},

	'click #finalStoneButton': function (event) {
		jungleWorld.riverActivity.transColorName = undefined;
		jungleWorld.riverActivity.deleteMode = false;
		jungleWorld.riverActivity.markStoneFinal = true;
		Session.set('riverInstructions', 'Click a stone to mark it as final or not final. Final stones are colored green.');
		Session.set('riverPen', CHECK);
		$('#currentPen').removeClass('purpleFlip orangeFlip pink').addClass('green');
	},

	'click #purplePenButton': function (event) {
		jungleWorld.riverActivity.transColorName = 'purple';
		jungleWorld.deleteMode = false;
		jungleWorld.riverActivity.markStoneFinal = false;
		Session.set('riverInstructions', 'Your pen is now purple. Click to select your first stone.');
		Session.set('riverPen', PEN);
		$('#currentPen').removeClass('orangeFlip green pink').addClass('purpleFlip');
	},

	'click #orangePenButton': function (event) {
		jungleWorld.riverActivity.transColorName = 'orange';
		jungleWorld.deleteMode = false;
		jungleWorld.riverActivity.markStoneFinal = false;
		Session.set('riverInstructions', 'Your pen is now orange. Click to select your first stone.');
		Session.set('riverPen', PEN);
		$('#currentPen').removeClass('purpleFlip green pink').addClass('orangeFlip');
	},

	'click #deleteButton': function (event) {
		jungleWorld.riverActivity.transColorName = undefined;
		jungleWorld.riverActivity.deleteMode = true;
		jungleWorld.riverActivity.markStoneFinal = false;
		Session.set('riverInstructions', 'Click on a stone or transition to delete it.');
		Session.set('riverPen', ERASER);
		$('#currentPen').removeClass('purpleFlip orangeFlip green').addClass('pink');
	},

	'click #resetButton': function (event) {
		jungleWorld.riverActivity.transColorName = undefined;
		jungleWorld.riverActivity.deleteMode = false;
		jungleWorld.riverActivity.markStoneFinal = false;
		jungleWorld.riverActivity.reset();
		Session.set('riverPen', '');
	},

	'click #riverHintButton': function (event) {
		jungleWorld.riverActivity.getHint();
	},

	'click #backButton': function (event) {
		jungleWorld.riverActivity.transColorName = undefined;
		jungleWorld.riverActivity.deleteMode = false;
		jungleWorld.riverActivity.markStoneFinal = false;
		jungleWorld.backToJungleWorld();
		Session.set('riverPen', '');
	},

	'click #nextLangButton': function (event) {
		$(event.target).blur();
		jungleWorld.riverActivity.nextLanguage();
	},

	'mouseenter #jungleworldHeaderDiv button': function (event) {
		$('#riverHintText').hide();
		var id = event.target.id;
		if ($(event.target).html() == 'STOP') {
			Session.set('riverBtnInstruc', 'Click to <span class="yellow">stop testing</span>.');
		} else {
			Session.set('riverBtnInstruc', buttonInstructions[id]);
		}
		if ($(event.target).css('opacity') < 1.0) {
			$(event.target).css({'opacity': 0.75});
		}
	},

	'mouseleave #jungleworldHeaderDiv button': function (event) {
		$('#riverHintText').show();
		Session.set('riverBtnInstruc', '');
		if ($(event.target).css('opacity') < 1.0) {
			$(event.target).css({'opacity': 0.5});
		}
	},


	//table
	'click #tableBackButton': function (event) {
		jungleWorld.backToJungleWorld();
	},

	'click #changeStringButton': function (event) {
		jungleWorld.tableActivity.changeString();
	},

	'click .stringChoiceButton': function (event) {
		jungleWorld.tableActivity.chooseString($(event.target).html());
	},

	'click .parsingChoiceButton': function (event) {
		jungleWorld.tableActivity.chooseParsing($(event.target).html());
	},

	'click .iChoiceButton': function (event) {
		jungleWorld.tableActivity.chooseI($(event.target).html());
	},

	'click .reasonChoiceButton': function (event) {
		jungleWorld.tableActivity.chooseReason($(event.target).html());
	},

	'click #nextTableLangButton': function (event) {
		jungleWorld.tableActivity.reset();
	},

	'change #tableLangSelect': function (event) {
		$(event.target).blur();
		var select = document.getElementById('tableLangSelect');
		var value = select.value;
		console.log('value: ', value);
		var langIndex = 0;
		for (var l in jungleWorld.tableActivity.tableLangs) {
			if (jungleWorld.tableActivity.tableLangs[l]._id == value) {
				langIndex = l;
			}
		}
		if (langIndex >= 0) {
			jungleWorld.tableActivity.setLanguage(langIndex);
		}
	},
});

function parsingChoices () {
	var choices = [];
	var parsings = Session.get('tableParsings')[Session.get('tableStringChoice')];
	for (var i in parsings) {
		var disabled = Session.get('tableCompletedParsings').indexOf(i) != -1;
		var cName = disabled ? 'parsingChoiceButton disabledTable' : 'parsingChoiceButton';
		var extra = disabled ? ' ' + CHECK : '';
		choices.push({choice: i + extra, isDisabled: disabled, className: cName});
	}
	return choices;
}