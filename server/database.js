COMP_NAME = 'computer';
INIT_DFA = 0.1;
INIT_PL = 0.05;
GUESS_PL = 0.3;
SLIP_PL = 0.1;
TRANSITION_DFA = 0.1;
TRANSITION_PL = 0.1;

Students = new Meteor.Collection('students');
Meteor.publish('students', function () {
	var id = this.userId;

	//Students.remove({});

	if (Students.find({studentId: id}).count() == 0 && id != null) {
		setUpStudents(id);
	}

	return Students.find({_id: id});
});

Points = new Meteor.Collection('points');
Meteor.publish('points', function () {
	var id = this.userId;

	Points.remove({});

	if (Points.find({_id: id}).count() == 0 && id != null) {
		setUpPoints(id);
	}

	return Points.find({_id: id});
});

Explanations = new Meteor.Collection('explanations');
Meteor.publish('explanations', function () {
	var id = this.userId;

	if (Explanations.find({}).count() == 0 && id != null) {
		setUpExplanations(id);
	}

	return Explanations.find({});
});

ExpFaves = new Meteor.Collection('expfaves');
Meteor.publish('expfaves', function () {
	var id = this.userId;

	if (ExpFaves.find({}).count() == 0 && id != null) {
		setUpExpFaves(id);
	}

	return ExpFaves.find({});
});

ActFaves = new Meteor.Collection('actfaves');
Meteor.publish('actfaves', function () {
	var id = this.userId;

	if (ActFaves.find({}).count() == 0 && id != null) {
		setUpActFaves(id);
	}

	return ActFaves.find({});
});

JungleRiverStates = new Meteor.Collection('jungleriverstates');
Meteor.publish('jungleriverstates', function () {
	var id = this.userId;

	if (JungleRiverStates.find({studentId: id}).count() == 0 && id != null) {
		setUpJungleRiverStates(id);
	}

	return JungleRiverStates.find({studentId: id});
});

JungleRiverActions = new Meteor.Collection('jungleriveractions');
Meteor.publish('jungleriveractions', function () {
	var id = this.userId;

	if (JungleRiverActions.find({studentId: id}).count() == 0 && id != null) {
		setUpJungleRiverActions(id);
	}

	return JungleRiverActions.find({studentId: id});
});

OceanStarfishStates = new Meteor.Collection('oceanstarfishstates');
Meteor.publish('oceanstarfishstates', function () {
	var id = this.userId;

	if (OceanStarfishStates.find({studentId: id}).count() == 0 && id != null) {
		setUpOceanStarfishStates(id);
	}

	return OceanStarfishStates.find({studentId: id});
});

OceanStarfishActions = new Meteor.Collection('oceanstarfishactions');
Meteor.publish('oceanstarfishactions', function () {
	var id = this.userId;

	if (OceanStarfishActions.find({studentId: id}).count() == 0 && id != null) {
		setUpOceanStarfishActions(id);
	}

	return OceanStarfishActions.find({studentId: id});
});

IcebergStates = new Meteor.Collection('icebergstates');
Meteor.publish('icebergstates', function () {
	var id = this.userId;

	if (IcebergStates.find({studentId: id}).count() == 0 && id != null) {
		setUpIcebergStates(id);
	}

	return IcebergStates.find({studentId: id});
});

IcebergActions = new Meteor.Collection('icebergactions');
Meteor.publish('icebergactions', function () {
	var id = this.userId;

	if (IcebergActions.find({studentId: id}).count() == 0 && id != null) {
		setUpIcebergActions(id);
	}

	return IcebergActions.find({studentId: id});
});

RiverLanguages = new Meteor.Collection('riverlanguages');
Meteor.publish('riverlanguages', function () {
	var id = this.userId;

	if (RiverLanguages.find({}).count() == 0 && id != null) {
		setUpRiverLanguages();
	}

	return RiverLanguages.find({});
});

OceanLanguages = new Meteor.Collection('oceanlanguages');
Meteor.publish('oceanlanguages', function () {
	var id = this.userId;

	if (OceanLanguages.find({}).count() == 0 && id != null) {
		setUpOceanLanguages();
	}

	return OceanLanguages.find({});
});

IceLanguages = new Meteor.Collection('icelanguages');
Meteor.publish('icelanguages', function () {
	var id = this.userId;

	if (IceLanguages.find({}).count() == 0 && id != null) {
		setUpIceLanguages();
	}

	return IceLanguages.find({});
});

TableStates = new Meteor.Collection('tablestates');
Meteor.publish('tablestates', function () {
	var id = this.userId;

	if (TableStates.find({studentId: id}).count() == 0 && id != null) {
		setUpTableStates(id);
	}

	return TableStates.find({studentId: id});
});

NetStates = new Meteor.Collection('netstates');
Meteor.publish('netstates', function () {
	var id = this.userId;

	if (NetStates.find({studentId: id}).count() == 0 && id != null) {
		setUpNetStates(id);
	}

	return NetStates.find({studentId: id});
});

TowerStates = new Meteor.Collection('towerstates');
Meteor.publish('towerstates', function () {
	var id = this.userId;

	if (TowerStates.find({studentId: id}).count() == 0 && id != null) {
		setUpTowerStates(id);
	}

	return TowerStates.find({studentId: id});
});

Nonregulars = new Meteor.Collection('nonregulars');
Meteor.publish('nonregulars', function () {
	var id = this.userId;

	Nonregulars.remove({});

	if (Nonregulars.find({}).count() == 0 && id != null) {
		setUpNonregulars(id);
	}

	return Nonregulars.find({});
});

NonregularRewards = new Meteor.Collection('nonregularrewards');
Meteor.publish('nonregularrewards', function () {
	var id = this.userId;

	if (NonregularRewards.find({studentId: id}).count() == 0 && id != null) {
		setUpNonregularRewards(id);
	}

	return NonregularRewards.find({studentId: id});
});

HintsUsed = new Meteor.Collection('hintsused');
Meteor.publish('hintsused', function () {
	var id = this.userId;

	if (HintsUsed.find({studentId: id}).count() == 0 && id != null) {
		setUpHintsUsed(id);
	}

	return HintsUsed.find({studentId: id});
});

Perceptron = new Meteor.Collection('perceptron');
Meteor.publish('perceptron', function () {
	var id = this.userId;

	if (Perceptron.find({}).count() == 0 && id != null) {
		setUpPerceptron(id);
	}

	return Perceptron.find({});
});

BayesFeatures = new Meteor.Collection('bayesfeatures');
Meteor.publish('bayesfeatures', function () {
	var id = this.userId;

	if (BayesFeatures.find({studentId: id}).count() == 0 && id != null) {
		setUpBayesFeatures(id);
	}

	return BayesFeatures.find({studentId: id});
});

DFAScores = new Meteor.Collection('dfascores');
Meteor.publish('dfascores', function () {
	var id = this.userId;

	if (DFAScores.find({studentId: id}).count() == 0 && id != null) {
		setUpDFAScores(id);
	}

	return DFAScores.find({studentId: id});
});

PLScores = new Meteor.Collection('plscores');
Meteor.publish('plscores', function () {
	var id = this.userId;

	if (PLScores.find({studentId: id}).count() == 0 && id != null) {
		setUpPLScores(id);
	}

	return PLScores.find({studentId: id});
});

