var n1 = [{name: 'ss0', isFinal: false}, {name: 'ss1', isFinal: false}, {name: 'ss2', isFinal: false}, 
					{name: 'ss3', isFinal: false}, {name: 'ss4', isFinal: false}, {name: 'ss5', isFinal: false}, {name: 'ss6', isFinal: false}];

var n2 = [{name: 'ssE', isFinal: false}, {name: 'ssC', isFinal: false}, {name: 'ssF', isFinal: false}, 
					{name: 'ssB', isFinal: false}, {name: 'ssD', isFinal: false}, {name: 'ssG', isFinal: false}, {name: 'ssA', isFinal: false}];

var n3 = [{name: 'a0', isFinal: false}];

var n4 = [{name: 'bb0', isFinal: false}, {name: 'bb1', isFinal: false}];

var e1 = {
	purple: {
		'ss0': 'ss1',
		'ss1': 'ss6',
		'ss2': 'ss6',
		'ss3': 'ss4',
		'ss4': 'ss6',
		'ss5': 'ss6',
		'ss6': 'ss6'
	},
	orange: {
		'ss0': 'ss6',
		'ss1': 'ss2',
		'ss2': 'ss3',
		'ss3': 'ss6',
		'ss4': 'ss5',
		'ss5': 'ss6',
		'ss6': 'ss6'
	}
};
var e2 = {
	purple: {
		'ssA': 'ssA',
		'ssB': 'ssD',
		'ssC': 'ssA',
		'ssD': 'ssA',
		'ssE': 'ssC',
		'ssF': 'ssA',
		'ssG': 'ssA'
	},
	orange: {
		'ssA': 'ssA',
		'ssB': 'ssA',
		'ssC': 'ssF',
		'ssD': 'ssG',
		'ssE': 'ssA',
		'ssF': 'ssB',
		'ssG': 'ssA'
	}
};
var e3 = {
	purple: {
		'aa0': 'aa0'
	},
	orange: {
		'aa0': 'aa0'
	}
};
var e4 = {
	purple: {
		'bb0': 'bb1',
		'bb1': 'bb0'
	},
	orange: {
		'bb0': 'bb0',
		'bb1': 'bb1'
	}
};

var state1 = {name: 'state1', stones: n1, transitions: e1, isCorrect: false, studentId: 'jaio'};
var state2 = {name: 'state2', stones: n2, transitions: e2, isCorrect: false, studentId: 'zorocy'};
var state3 = {name: 'state3', stones: n3, transitions: e3, isCorrect: false, studentId: 'istoel'};
var state4 = {name: 'state4', stones: n4, transitions: e4, isCorrect: true, studentId: 'ealeaf'};

//cluster 0 => cluster 1
var action1 = {
								fromState: 'state1', toState: 'state3', 
								studentId: 'xelai', date: new Date(), 
								type: 'add', stone1: 'ss0', stone2: 'ss1', trans: 'orangetransitionss0ss1'
							}; 
//cluster 2 => cluster 0
var action2 = {
								fromState: 'state4', toState: 'state2',
								studentId: 'aregae', date: new Date(),
								type: 'add', stone1: 'bb0', stone2: 'bb1', trans: 'purpletransitionbb0bb1'
							}; 
//cluster 0 => cluster 0
var action3 = {
								fromState: 'state2', toState: 'state2',
								studentId: 'taur', date: new Date(),
								stone1: 'ssA', stone2: 'ssB', trans: 'orangetransitionssAssB'
							}; 
//cluster 0 => cluster 0
var action4 = {
								fromState: 'state1', toState: 'state1',
								studentId: 'aleo', date: new Date(),
								type: 'add', stone1: 'ss0', stone2: null, trans: null
							}; 
//cluster 0 => cluster 2
var action5 = {
								fromState: 'state2', toState: 'state4',
								studentId: 'letados', date: new Date(),
								type: 'add', stone1: 'ssA', stone2: null, trans: null
							}; 
//var mdp = new MDP([state1, state2, state3, state4], [action1, action2, action3, action4, action5]);
//mdp.getHints(state2);

