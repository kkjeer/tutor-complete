bayesTestData = {
	'guess': {
		timeTaken: [0.05, 0.15, 0.2, 0.25, 0.35],
		hintsUsed: [0.1, 0.35, 0.55],
		numResets: [0.05, 0.2, 0.3, 0.45],
		numTests: [0.1, 0.2, 0.3, 0.4],
		numDeletedTransitions: [0.1, 0.2, 0.3, 0.4],
		numChangedTransitions: [0.1, 0.2, 0.3, 0.4]
	},

	'slip': {
		timeTaken: [0.4, 0.3, 0.2, 0.1, 0.05],
		hintsUsed: [0.6, 0.3, 0.1],
		numResets: [0.4, 0.35, 0.15, 0.1],
		numTests: [0.4, 0.3, 0.2, 0.1],
		numDeletedTransitions: [0.4, 0.3, 0.2, 0.1],
		numChangedTransitions: [0.4, 0.3, 0.2, 0.1]
	},

	'total': {
		timeTaken: [0.2, 0.2, 0.2, 0.2, 0.2],
		hintsUsed: [0.33, 0.33, 0.33],
		numResets: [0.25, 0.25, 0.25, 0.25],
		numTests: [0.25, 0.25, 0.25, 0.25],
		numDeletedTransitions: [0.25, 0.25, 0.25, 0.25],
		numChangedTransitions: [0.25, 0.25, 0.25, 0.25]
	}
};

var minute = 60000;
bayesRanges = {
	'timeTaken': [0, 3 * minute, 6 * minute, 9 * minute, 12 * minute, Infinity],
	'hintsUsed': [0, 1, 2, Infinity],
	'numResets': [0, 1, 2, 3, Infinity],
	'numTests': [0, 2, 4, 6, Infinity],
	'numDeletedTransitions': [0, 2, 4, 6, Infinity],
	'numChangedTransitions': [0, 2, 4, 6, Infinity]
};