Meteor.methods({
	createExplanation: function (newTitle, newTag, newText) {
		if (this.userId != Meteor.userId()) {
      console.log('error: incorrect user');
      return 'error: incorrect user';
    }

		Explanations.insert({author: Meteor.users.findOne(this.userId).username, title: newTitle, tag: newTag, text: newText, date: new Date()});
	},

	editExplanation: function (expId, newTitle, newTag, newText) {
		if (this.userId != Meteor.userId()) {
      console.log('error: incorrect user');
      return 'error: incorrect user';
    }

		Explanations.update({_id: expId}, {$set: {title: newTitle, tag: newTag, text: newText}});
	},

	faveExplanation: function (expId) {
		if (this.userId != Meteor.userId()) {
      console.log('error: incorrect user');
      return 'error: incorrect user';
    }

    var currentFaves = Students.findOne(this.userId).weeklyFaves;
    if (currentFaves > 0) {
    	Students.update({_id: this.userId}, {$set: {weeklyFaves: currentFaves - 1}});
    }

    ExpFaves.insert({fromUser: Students.findOne(this.userId).name, toUser: Explanations.findOne(expId).author, toExp: expId, date: new Date()});
	},

	unfaveExplanation: function (expId) {
		if (this.userId != Meteor.userId()) {
      console.log('error: incorrect user');
      return 'error: incorrect user';
    }

    var currentFaves = Students.findOne(this.userId).weeklyFaves;
    if (currentFaves < 3) {
    	Students.update({_id: this.userId}, {$set: {weeklyFaves: currentFaves + 1}});
    }

    ExpFaves.remove({fromUser: Students.findOne(this.userId).name, toExp: expId});
	},

	editPoints: function (worldName, deltaPoints) {
		if (this.userId != Meteor.userId()) {
      console.log('error: incorrect user');
      return 'error: incorrect user';
    }

    var currentPoints = Points.findOne(this.userId)[worldName + 'Points'];
    var newPoints = currentPoints + deltaPoints;

    switch (worldName) {
    	case 'jungle':
    		Points.update({_id: this.userId}, {$set: {junglePoints: newPoints}});
    		break;
    	case 'ocean':
    		Points.update({_id: this.userId}, {$set: {oceanPoints: newPoints}});
    		break;
    	case 'ice':
    		Points.update({_id: this.userId}, {$set: {icePoints: newPoints}});
    		break;
    }
	},

	getStudentJungleRiverStates: function (userid) {
		return JungleRiverStates.find({studentId: userid}).fetch();
	},

	getStudentOceanStarfishStates: function (userid) {
		return OceanStarfishStates.find({studentId: userid}).fetch();
	},

	getStudentIcebergStates: function (userid) {
		return IcebergStates.find({studentId: userid}).fetch();
	},

	insertRiverState: function (state) {
		JungleRiverStates.insert(state);
	},

	insertRiverAction: function (action) {
		if (action) {
			JungleRiverActions.insert(action);
		}
	},

	insertStarfishState: function (state) {
		OceanStarfishStates.insert(state);
	},

	insertStarfishAction: function (action) {
		if (action) {
			OceanStarfishActions.insert(action);
		}
	},

	insertIcebergState: function (state) {
		IcebergStates.insert(state);
	},

	insertIcebergAction: function (action) {
		if (action) {
			IcebergActions.insert(action);
		}
	},

	getWorldNonregulars: function (world) {
		return Nonregulars.find({worldName: world}).fetch();
	},

	shrinkLanguagePoints: function (language) {
		var currentPoints = NonregularRewards.find({langId: language, studentId: this.userId}).fetch()[0].reward;
		var newPoints = Math.floor(0.5 * currentPoints);
		NonregularRewards.update({langId: language, studentId: this.userId}, {$set: {reward: newPoints}});
	},

	insertTableState: function (state) {
		TableStates.insert(state);
	},

	insertNetState: function (state) {
		NetStates.insert(state);
	},

	insertTowerState: function (state) {
		TowerStates.insert(state);
	},

	getRiverHint: function (currentStateName) {
		var state = JungleRiverStates.find({name: currentStateName}).fetch()[0];

		var studentStates = JungleRiverStates.find({langIndex: state.langIndex}).fetch();
		var studentActions = JungleRiverActions.find({langIndex: state.langIndex}).fetch();

		var computer = new Computer(state.langIndex);
		var computerStates = computer.computerStates;
		var computerActions = computer.computerActions;

		var allStates = studentStates.concat(computerStates);
		var allActions = studentActions.concat(computerActions);

		var mdp = new MDP(allStates, allActions);
		mdp.getHints(state);
		return mdp.hints;
	},

	getStarfishHint: function (currentStateName) {
		var state = OceanStarfishStates.find({name: currentStateName}).fetch()[0];
		if (!state) {
			return 'Error: no state found for state name ' + currentStateName;
		}

		var studentStates = OceanStarfishStates.find({langIndex: state.langIndex}).fetch();
		var studentActions = OceanStarfishActions.find({langIndex: state.langIndex}).fetch();

		// var computer = new Computer(state.langIndex);
		// var computerStates = computer.computerStates;
		// var computerActions = computer.computerActions;
		var computerStates = [];
		var computerActions = [];

		var allStates = studentStates.concat(computerStates);
		var allActions = studentActions.concat(computerActions);

		var mdp = new MDP(allStates, allActions);
		mdp.getHints(state);
		return mdp.hints;
	},

	getIcebergHint: function (currentStateName) {
		var state = IcebergStates.find({name: currentStateName}).fetch()[0];
		if (!state) {
			return 'Error: no state found for state name ' + currentStateName;
		}

		var studentStates = IcebergStates.find({langIndex: state.langIndex}).fetch();
		var studentActions = IcebergActions.find({langIndex: state.langIndex}).fetch();

		// var computer = new Computer(state.langIndex);
		// var computerStates = computer.computerStates;
		// var computerActions = computer.computerActions;
		var computerStates = [];
		var computerActions = [];

		var allStates = studentStates.concat(computerStates);
		var allActions = studentActions.concat(computerActions);

		var mdp = new MDP(allStates, allActions);
		mdp.getHints(state);
		return mdp.hints;
	},

	updateCorrectPLScore: function (worldName) {
		var currentScore = PLScores.find({studentId: this.userId, world: worldName}).fetch()[0].plScore;
		var correctScore = (currentScore * (1 - SLIP_PL))/(currentScore * (1 - SLIP_PL) + (1 - currentScore) * GUESS_PL);
		var newScore = correctScore + (1 - correctScore) * TRANSITION_PL;
		PLScores.update({studentId: this.userId, world: worldName}, {$set: {plScore: newScore}});
	},

	updateIncorrectPLScore: function (worldName) {
		var currentScore = PLScores.find({studentId: this.userId, world: worldName}).fetch()[0].plScore;
		var incorrectScore = (currentScore * SLIP_PL)/(currentScore * SLIP_PL + (1 - currentScore) * (1 - GUESS_PL));
		var newScore = incorrectScore + (1 - incorrectScore) * TRANSITION_PL;
		PLScores.update({studentId: this.userId, world: worldName}, {$set: {plScore: newScore}});
	},

	updateCorrectPLSkillScore: function (worldName, skill) {
		var currentScore;
		switch (skill) {
			case 'string':
				currentScore = PLScores.find({studentId: this.userId, world: worldName}).fetch()[0].stringScore;
				break;
			case 'i':
				currentScore = PLScores.find({studentId: this.userId, world: worldName}).fetch()[0].iScore;
				break;
			case 'reason':
				currentScore = PLScores.find({studentId: this.userId, world: worldName}).fetch()[0].reasonScore;
				break;
		}

		var correctScore = (currentScore * (1 - SLIP_PL))/(currentScore * (1 - SLIP_PL) + (1 - currentScore) * GUESS_PL);
		var newScore = correctScore + (1 - correctScore) * TRANSITION_PL;

		switch (skill) {
			case 'string':
				PLScores.update({studentId: this.userId, world: worldName}, {$set: {stringScore: newScore}});
				break;
			case 'i':
				PLScores.update({studentId: this.userId, world: worldName}, {$set: {iScore: newScore}});
				break;
			case 'reason':
				PLScores.update({studentId: this.userId, world: worldName}, {$set: {reasonScore: newScore}});
				break;
		}

		return newScore;
	},

	updateIncorrectPLSkillScore: function (worldName, skill) {
		var currentScore;
		switch (skill) {
			case 'string':
				currentScore = PLScores.find({studentId: this.userId, world: worldName}).fetch()[0].stringScore;
				break;
			case 'i':
				currentScore = PLScores.find({studentId: this.userId, world: worldName}).fetch()[0].iScore;
				break;
			case 'reason':
				currentScore = PLScores.find({studentId: this.userId, world: worldName}).fetch()[0].reasonScore;
				break;
		}

		var incorrectScore = (currentScore * SLIP_PL)/(currentScore * SLIP_PL + (1 - currentScore) * (1 - GUESS_PL));
		var newScore = incorrectScore + (1 - incorrectScore) * TRANSITION_PL;

		switch (skill) {
			case 'string':
				PLScores.update({studentId: this.userId, world: worldName}, {$set: {stringScore: newScore}});
				break;
			case 'i':
				PLScores.update({studentId: this.userId, world: worldName}, {$set: {iScore: newScore}});
				break;
			case 'reason':
				PLScores.update({studentId: this.userId, world: worldName}, {$set: {reasonScore: newScore}});
				break;
		}

		return newScore;
	},

	updateCorrectDFAScore: function (worldName) {
		var currentScore = DFAScores.find({studentId: this.userId, world: worldName}).fetch()[0].dfaScore;
		var guess = computeGuess(this.userId, worldName);
		var slip = computeSlip(this.userId, worldName);

		DFAScores.update({studentId: this.userId, world: worldName}, {$set: {dfaGuess: guess, dfaSlip: slip}});

		var correctScore = (currentScore * (1 - slip))/(currentScore * (1 - slip) + (1 - currentScore) * guess);
		var newScore = correctScore + (1 - correctScore) * TRANSITION_DFA;

		DFAScores.update({studentId: this.userId, world: worldName}, {$set: {dfaScore: newScore}});
		return newScore;
	},

	updateIncorrectDFAScore: function (worldName) {
		var currentScore = DFAScores.find({studentId: this.userId, world: worldName}).fetch()[0].dfaScore;
		var guess = computeGuess(this.userId, worldName);
		var slip = computeSlip(this.userId, worldName);

		DFAScores.update({studentId: this.userId, world: worldName}, {$set: {dfaGuess: guess, dfaSlip: slip}});

		var incorrectScore = (currentScore * slip)/(currentScore * slip + (1 - currentScore) * (1 - guess));
		var newScore = incorrectScore + (1 - incorrectScore) * TRANSITION_DFA;

		DFAScores.update({studentId: this.userId, world: worldName}, {$set: {dfaScore: newScore}});
		return newScore;
	},

	resetBayesFeatures: function (worldName) {
		BayesFeatures.update({studentId: this.userId, world: worldName}, {$set: {timeTaken: 0}});
		BayesFeatures.update({studentId: this.userId, world: worldName}, {$set: {hintsUsed: 0}});
		BayesFeatures.update({studentId: this.userId, world: worldName}, {$set: {numResets: 0}});
		BayesFeatures.update({studentId: this.userId, world: worldName}, {$set: {numTests: 0}});
		BayesFeatures.update({studentId: this.userId, world: worldName}, {$set: {numDeletedTransitions: 0}});
		BayesFeatures.update({studentId: this.userId, world: worldName}, {$set: {numChangedTransitions: 0}});
	},

	updateTimeTaken: function (worldName, time) {
		BayesFeatures.update({studentId: this.userId, world: worldName}, {$set: {timeTaken: time}});
	},

	addTimeTaken: function (worldName, time) {
		var currentTime = BayesFeatures.find({studentId: this.userId, world: worldName}).fetch()[0].timeTaken;
		BayesFeatures.update({studentId: this.userId, world: worldName}, {$set: {timeTaken: currentTime + time}});
	},

	updateHints: function (worldName, numHintsUsed) {
		BayesFeatures.update({studentId: this.userId, world: worldName}, {$set: {hintsUsed: numHintsUsed}});
	},

	updateResets: function (worldName, numResetsMade) {
		BayesFeatures.update({studentId: this.userId, world: worldName}, {$set: {numResets: numResetsMade}});
	},

	incrementResets: function (worldName) {
		var currentResets = BayesFeatures.find({studentId: this.userId, world: worldName}).fetch()[0].numResets;
		BayesFeatures.update({studentId: this.userId, world: worldName}, {$set: {numResets: currentResets + 1}});
	},

	updateTests: function (worldName, numTestsMade) {
		BayesFeatures.update({studentId: this.userId, world: worldName}, {$set: {numTests: numTestsMade}});
	},

	incrementTests: function (worldName) {
		var currentTests = BayesFeatures.find({studentId: this.userId, world: worldName}).fetch()[0].numTests;
		BayesFeatures.update({studentId: this.userId, world: worldName}, {$set: {numTests: currentTests + 1}});
	},

	updateDeletedTransitions: function (worldName, numDeletedTrans) {
		BayesFeatures.update({studentId: this.userId, world: worldName}, {$set: {numDeletedTransitions: numDeletedTrans}});
	},

	incrementDeletedTransitions: function (worldName) {
		var currentDeleted = BayesFeatures.find({studentId: this.userId, world: worldName}).fetch()[0].numDeletedTransitions;
		BayesFeatures.update({studentId: this.userId, world: worldName}, {$set: {numDeletedTransitions: currentDeleted + 1}});
	},

	updateChangedTransitions: function (worldName, numChangedTrans) {
		BayesFeatures.update({studentId: this.userId, world: worldName}, {$set: {numChangedTransitions: numChangedTrans}});
	},

	incrementChangedTransitions: function (worldName) {
		var currentChanged = BayesFeatures.find({studentId: this.userId, world: worldName}).fetch()[0].numChangedTransitions;
		BayesFeatures.update({studentId: this.userId, world: worldName}, {$set: {numChangedTransitions: currentChanged + 1}});
	},

	addCompletedLanguage: function (langId) {
		console.log('adding completed language: ' + langId);
		var completedLangs = Students.find({studentId: this.userId}).fetch()[0].completedLanguages;
		completedLangs.push(langId);
		Students.update({studentId: this.userId}, {$set: {completedLanguages: completedLangs}});
	},

	clearDatabase: function () {
		Students.remove({});
		Points.remove({});
		BayesFeatures.remove({});
		DFAScores.remove({});
		PLScores.remove({});
		Explanations.remove({});
		ExpFaves.remove({});
		ActFaves.remove({});
		JungleRiverStates.remove({});
		JungleRiverActions.remove({});
		OceanStarfishStates.remove({});
		OceanStarfishActions.remove({});
		IcebergStates.remove({});
		IcebergActions.remove({});
		RiverLanguages.remove({});
		OceanLanguages.remove({});
		IceLanguages.remove({});
		TableStates.remove({});
		NetStates.remove({});
		TowerStates.remove({});
		Nonregulars.remove({});
		NonregularRewards.remove({});
		HintsUsed.remove({});

		setUpStudents(this.userId);
		setUpBayesFeatures(this.userId);
		setUpDFAScores(this.userId);
		setUpPLScores(this.userId);
		setUpExplanations(this.userId);
		setUpExpFaves(this.userId);
		setUpActFaves(this.userId);
		setUpJungleRiverStates(this.userId);
		setUpJungleRiverActions(this.userId);
		setUpOceanStarfishStates(this.userId);
		setUpOceanStarfishActions(this.userId);
		setUpIcebergStates(this.userId);
		setUpIcebergActions(this.userId);
		setUpRiverLanguages(this.userId);
		setUpOceanLanguages(this.userId);
		setUpIceLanguages(this.userId);
		setUpTableStates(this.userId);
		setUpNetStates(this.userId);
		setUpTowerStates(this.userId);
		setUpNonregulars(this.userId);
	}
});