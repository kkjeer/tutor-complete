var MIN_SIM = 0.9;
var CORRECT_REWARD = 100;

/*
Cluster()
Purpose: constructs a new cluster object containing an array of cluster arrays containing states
Parameters:
	states (object array): array of student states (DFA graphs)
*/
Cluster = function (states) {
	this.states = states;

	this.clusterArray = [];
	this.stateToClusterMap = {};
	this.clusterRewards = [];

	for (var i = 0; i < this.states.length; i++) {
		this.clusterState(this.states[i]);
	}

	this.setRewards();
}

/*
clusterState()
Purpose: puts the given state into the appropriate cluster array, or creates a new cluster array for the state
Parameters:
	state (object): the state to place
*/
Cluster.prototype.clusterState = function (state) {
	//similarity between state and the most similar state in an existing cluster to it
	var maxSim = 0;

	//index of the most similar cluster
	var clusterIndex = -1;

	//find the cluster whose first state is most similar to state
	for (var i = 0; i < this.clusterArray.length; i++) {
		var testState = this.clusterArray[i][0];
		var graphWrapper = new GraphWrapper(testState.stones, testState.transitions, state.stones, state.transitions);
		var testSim = graphWrapper.getGraphSimilarity();
		if (testSim > maxSim) {
			maxSim = testSim;
			//state can only go in cluster i if testState and state are at least MIN_SIM similar to each other
			if (maxSim >= MIN_SIM) {
				clusterIndex = i;
			}
		}
	}

	//no cluster with minimum similarity => create new cluster array for state
	if (clusterIndex == -1) {
		this.clusterArray.push([state]);
		this.stateToClusterMap[state.name] = this.clusterArray.length - 1;
	} 
	//place the state in the most similar cluster
	else {
		this.clusterArray[clusterIndex].push(state);
		this.stateToClusterMap[state.name] = clusterIndex;
	}
}

/*
setRewards()
Purpose: populates this.clusterRewards with the reward for each cluster, proportional to the percentage of correct states in each cluster
*/
Cluster.prototype.setRewards = function () {
	for (var i = 0; i < this.clusterArray.length; i++) {
		var correctStates = 0;
		for (var j = 0; j < this.clusterArray[i].length; j++) {
			if (this.clusterArray[i][j].isCorrect) {
				correctStates++;
			}
		}
		var reward = CORRECT_REWARD * correctStates/this.clusterArray[i].length;
		this.clusterRewards[i] = reward;
	}
}