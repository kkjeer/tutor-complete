Template.Dashboard.helpers({
	worldDFAPercentage: function (worldTag) {
		var worldDFA = globalWorlds[worldTag].minDFA;
		var userDFA = DFAScores.find({studentId: Meteor.userId(), world: globalWorlds[worldTag].prefix}).fetch()[0].dfaScore;

		var amount = 100 * userDFA;
		return amount.toFixed(0) + '%';

		var userDFA = DFAScores.find({studentId: Meteor.userId(), world: globalWorlds[worldTag].prefix}).fetch()[0].dfaScore;
		return userDFA.toFixed(1);
	},

	worldDFAWidth: function (worldTag) {
		var worldDFA = globalWorlds[worldTag].minDFA;
		var userDFA = DFAScores.find({studentId: Meteor.userId(), world: globalWorlds[worldTag].prefix}).fetch()[0].dfaScore;

		var amount = 100 * userDFA;
		return amount.toFixed(0) + '%';
	},

	leftDFAProgress: function (worldTag) {
		return '<p class="dashboardUnlock">0</p>';
	},

	rightDFAProgress: function (worldTag) {
		return '<p class="dashboardUnlock">100%</p>';
		var minDFA = globalWorlds[worldTag].minDFA;
		return '<p class="dashboardUnlock">' + minDFA.toFixed(2) + '</p>';
	},

	worldPLPercentage: function (worldTag) {
		var plScore = 0;
		for (var i = 0; i < globalSkills.length; i++) {
			plScore += plSkillScore(worldTag, globalSkills[i]);
		}

		var world = globalWorlds[worldTag];
		var minPL = world.minString + world.minI + world.minReason;

		var percentage = 100 * plScore/minPL;
		return percentage.toFixed(0) + '%';
	},

	leftPLProgress: function (worldTag) {
		return '<p class="dashboardUnlock">0</p>';
	},

	rightPLProgress: function (worldTag) {
		return '<p class="dashboardUnlock">100%</p>';
		var world = globalWorlds[worldTag];
		var minPL = world.minString + world.minI + world.minReason;
		return '<p class="dashboardUnlock">' + minPL.toFixed(2) + '</p>';
	},

	worldPLSkillPercentage: function (worldTag, skill) {
		var score = plSkillScore(worldTag, skill);
		var min = minPLSkill(worldTag, skill);
		var percentage = 100 * score/min;
		return percentage.toFixed(0) + '%';
		return plSkillScore(worldTag, skill).toFixed(1);
	},

	worldPLSkillWidth: function (worldTag, skill) {
		var score = plSkillScore(worldTag, skill);
		var min = minPLSkill(worldTag, skill);
		var percentage = 100 * score/min;
		return percentage.toFixed(0) + '%';
	},

	leftPLSkillProgress: function (worldTag, skill) {
		return '<p class="dashboardUnlock">0</p>';
	},

	rightPLSkillProgress: function (worldTag, skill) {
		return '<p class="dashboardUnlock">100%</p>';
		var minSkill = minPLSkill(worldTag, skill);
		return '<p class="dashboardUnlock">' + minSkill.toFixed(2) + '</p>';
	},


	experienceLevel: function () {
		if (Blaze._globalHelpers.masteredWorld('#iceworld')) {
			return '<span class="iceText">Ice Master</span>';
		}

		for (var i = Object.keys(globalWorlds).length - 1; i >= 0 ; i--) {
			var worldTag = Object.keys(globalWorlds)[i];

			if (Blaze._globalHelpers.unlockedWorld(worldTag)) {
				var loc = capitalize(globalWorlds[worldTag].title.split(' ')[0]);
				return '<a href="' + loc.toLowerCase() + 'world' + '" class="' + loc.toLowerCase() + 'Text">' + loc + 'World</a>';
			}
		}

		return '<span class="jungleText">JungleWorld</span>';
	},

	unlockedWorldTitles: function () {
		var titles = Object.keys(globalWorlds).filter(function (worldTag) {
			return Blaze._globalHelpers.unlockedWorld(worldTag)
		}).map(function (worldTag) {
			var world = globalWorlds[worldTag];
			return '<span class="' + world.prefix + 'Text">' + world.title + '</span>';
		});

		return titles.length == 0 ? 'You haven\'t unlocked any worlds yet' : 'You\'ve unlocked ' + andString(titles);
	},

	masteredWorldTitles: function () {
		var titles = Object.keys(globalWorlds).filter(function (worldTag) {
			return Blaze._globalHelpers.masteredWorld(worldTag)
		}).map(function (worldTag) {
			var world = globalWorlds[worldTag];
			return '<span class="' + world.prefix + 'Text">' + world.title + '</span>';
		});

		return titles.length == 0 ? 'You haven\'t mastered any worlds yet' : 'You\'ve mastered ' + andString(titles);
	},

	leftProgress: function (worldTag) {
		return '<p class="dashboardUnlock">0</p>';
		if (Blaze._globalHelpers.unlockedWorld(worldTag)) {
			return '<p class="dashboardMaster">0</p>';
		}

		return '<p class="dashboardUnlock">0</p>';
	},

	rightProgress: function (worldTag) {
		return '<p class="dashboardUnlock">100%</p>';
		if (Blaze._globalHelpers.unlockedWorld(worldTag)) {
			return '<p class="dashboardMaster">' + globalWorlds[worldTag].pointsToMaster + ' to master</p>';
		}

		return '<p class="dashboardUnlock">' + globalWorlds[worldTag].pointsToUnlock + ' to unlock</p>';
	},

	favedExplanations: function () {
		var userFaves = ExpFaves.find({fromUser: Meteor.user().username}).fetch().map(function (fave) {
			return Explanations.findOne(fave.toExp);
		});

		var faved = [];
		var numPerRow = 4;

		for (var i = 0, k = -1; i < userFaves.length; i++) {
			if (i % numPerRow == 0) {
				k++;
				faved[k] = {'row': []};
			}

			favedObj = userFaves[i];
			favedObj.faveCount = ExpFaves.find({toExp: favedObj._id}).fetch().length;
			favedObj.tagClass = '';

			setExpTagClass(favedObj);

			faved[k]['row'].push(favedObj);
		}

		return faved;
	},

	writtenExplanations: function () {
		var userWritten = Explanations.find({author: Meteor.user().username}).fetch();

		var written = [];
		var numPerRow = 4;

		for (var i = 0, k = -1; i < userWritten.length; i++) {
			if (i % numPerRow == 0) {
				k++;
				written[k] = {'row': []};
			}

			writtenObj = userWritten[i];
			writtenObj.faveCount = ExpFaves.find({toExp: writtenObj._id}).fetch().length;

			setExpTagClass(writtenObj);

			written[k]['row'].push(writtenObj);
		}

		return written;
	},

	currentExp: function () {
		return Session.get('currentExp');
	}
});

Template.Dashboard.events({
	'click .dashboardFavedExpCard': function (event) {
		var id = $(event.target).closest('.dashboardFavedExpCard').attr('id');
		var currentExp = Explanations.findOne(id);
		Session.set('currentExp', currentExp);

		$('#dashboardFavedExpLightbox').lightbox_me({
			centered: true,
			overlayCSS: {
				background: 'white',
				opacity: 0.6
			}
		});
	},

	'click .dashboardWrittenExpCard': function (event) {
		var id = $(event.target).closest('.dashboardWrittenExpCard').attr('id');
		var currentExp = Explanations.findOne(id);
		Session.set('currentExp', currentExp);

		$('#dashboardWrittenExpLightbox').lightbox_me({
			centered: true,
			overlayCSS: {
				background: 'white',
				opacity: 0.6
			},
			closeSelector: '.closeButton',
			onLoad: function () {
				$('#saveExpEdits').click(function (event) {
					$(this).blur();
					var newTitle = $('#editExpTitle').val();
					var newTag = $('#editExpTag').val();
					if (newTag.substring(0, 1) != '#') {
						newTag = '#' + newTag;
					}
					var newText = $('#editExpText').val();
					Meteor.call('editExplanation', Session.get('currentExp')._id, newTitle, newTag, newText);
				});

				$('#cancelExpEdits').click(function (event) {
					$(this).blur();
					var currentExp = Session.get('currentExp');
					$('#editExpTitle').val(currentExp.title);
					$('#editExpTag').val(currentExp.tag);
					$('#editExpText').val(currentExp.text);
				});
			}
		});
	}
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


