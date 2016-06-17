var GAMMA = 0.9;

/*
MDP()
Purpose: creates an MDP whose states are groups of states grouped by Cluster.js
Parameters:
	states (object array): array of student states (DFA graphs)
	actions (object array): array of student actions
*/
MDP = function (states, actions) {
	//from parameters
	this.states = states;
	this.actions = actions;
	this.numHints = 3;

	//MDP properties
	this.clusterActions = [];
	this.transitionProbs = [];
	this.clusterValues = [];

	//cluster the given states
	this.cluster = new Cluster(this.states);

	//set the MDP properties
	this.setClusterActions();
	this.setProbabilities();
	this.valueIterations();
}

/*
setClusterActions()
Purpose: populates the this.clusterActions array with, at each index i, an object mapping the name of a cluster (stringified index)
	to an array of actions that lead from cluster i to the cluster containing that state name
*/
MDP.prototype.setClusterActions = function () {
	//get actions from each cluster index i
	for (var i = 0; i < this.cluster.clusterArray.length; i++) {
		//the actions from cluster i
		var actionsFromCluster = {};

		//get the actions from each state in cluster i
		for (var j = 0; j < this.cluster.clusterArray[i].length; j++) {
			//name of state j in cluster i
			var stateName = this.cluster.clusterArray[i][j].name;

			//get all the actions from state j and determine which cluster they lead to
			for (var a = 0; a < this.actions.length; a++) {
				if (this.actions[a].fromState == stateName) {
					//name of state that this.actions[a] leads to
					var toStateName = this.actions[a].toState;

					//name (stringified integer) of cluster that this.actions[a] leads to
					//console.log('toStateName: ', toStateName);
					//console.log('this.cluster: ', this.cluster);
					var toClusterName = this.cluster.stateToClusterMap[toStateName].toString() || '';

					//initialize the array of actions that lead to toStateName if necessary
					if (!actionsFromCluster[toClusterName]) {
						actionsFromCluster[toClusterName] = [];
					}

					//add the action to the object with toStateName as the key
					actionsFromCluster[toClusterName].push(this.actions[a]);
				}
			}
		}

		//actions from cluster i go into this.clusterActions
		this.clusterActions[i] = actionsFromCluster;
	}
}

/*
setProbabilities()
Purpose: populates the this.transitionProbs array with objects each mapping the name of a cluster (stringified index)
	to the probability of reaching that cluster from the cluster at index i in this.cluster.clusterArray
*/
MDP.prototype.setProbabilities = function () {
	//set probability for each cluster index i
	for (var i = 0; i < this.cluster.clusterArray.length; i++) {
		this.transitionProbs[i] = {};
		var actionsFromCluster = this.clusterActions[i];

		//find the total number of actions leading from cluster i
		var totalActions = 0;
		for (var j = 0; j < Object.keys(actionsFromCluster).length; j++) {
			var toCluster = Object.keys(actionsFromCluster)[j];
			totalActions += actionsFromCluster[toCluster].length;
		}

		//for each cluster k that cluster i leads to, set the probability of reaching cluster k from i
		//proportional to the number of actions leading from cluster i to cluster k
		for (var k = 0; k < Object.keys(actionsFromCluster).length; k++) {
			var toCluster = Object.keys(actionsFromCluster)[k];
			this.transitionProbs[i][toCluster] = this.clusterActions[i][toCluster].length/totalActions;
		}
	}
}

/*
valueIterations()
Purpose: populates the this.clusterValues array with the value for each cluster
*/
MDP.prototype.valueIterations = function () {
	//run value iteration a specified number of times
	//for all test examples, values never changed, so keeping only one iteration
	var maxIterations = 1;
	for (var iter = 0; iter < maxIterations; iter++) {
		for (var i = 0; i < this.cluster.clusterArray.length; i++) {
			this.valueIndices = [];
			this.clusterValues[i] = this.computeClusterValue(i);
		}
	}
}

/*
computeClusterValue()
Purpose: returns the value for the cluster located at clusterIndex
	recursively computes the value based on values for the clusters that the cluster leads to
	watches for cycles in the MDP
Parameters:
	clusterIndex (integer): index in this.cluster.clusterArray of the cluster to compute the value for
*/
MDP.prototype.computeClusterValue = function (clusterIndex) {
	//mark this cluster index as visited (cycle detection)
	this.valueIndices.push(clusterIndex);
	var value = 0;

	//get an object mapping cluster names to values of each cluster that the current cluster has actions to
	var actionsFromCluster = this.clusterActions[clusterIndex];
	var nextValues = {};
	for (var i = 0; i < Object.keys(actionsFromCluster).length; i++) {
		//name of next cluster
		var clusterName = Object.keys(actionsFromCluster)[i];

		//index of next cluster
		var nextClusterIndex = parseInt(clusterName);

		//value of next cluster: only recursively compute if the next cluster index hasn't already been visited during this iteration
		var valuePrime = 0;
		if (this.valueIndices.indexOf(nextClusterIndex) == -1) {
			valuePrime = this.computeClusterValue(nextClusterIndex);
		}

		//map cluster name to its value
		nextValues[clusterName] = valuePrime;
	}

	//compute the maximum of the nextValues
	var maxValue = 0;
	for (var j = 0; j < Object.keys(nextValues).length; j++) {
		//name of the next cluster
		var clusterPrimeName = Object.keys(nextValues)[j];

		//probability of reaching the next cluster from the current one * value of next cluster
		var possibleValue = this.transitionProbs[clusterIndex][clusterPrimeName] * nextValues[clusterPrimeName];

		//update maxValue if applicable
		if (possibleValue > maxValue) {
			maxValue = possibleValue;
		}
	}

	//reward for current cluster + GAMMA * maximum of values of next clusters
	value = this.cluster.clusterRewards[clusterIndex] + GAMMA * maxValue;
	return value;
}

/*
getHints()
Purpose: sets this.hints to an array of the top actions from the currentState, mapped to currentState
	returns this.hints
Parameters:
	currentState (object): the user's current state
*/
MDP.prototype.getHints = function (currentState) {
	this.setTopActions(currentState.name);
	this.hints = [];
	for (var i = 0; i < this.topActions.length; i++) {
		this.hints.push(this.mappedAction(currentState, i));
	}
	return this.hints;
}

/*
mappedAction()
Purpose: returns an action transformed from the top action at the given index to match the given state
Parameters:
	currentState (object): the user's current state
	actionIndex (integer): index in this.topActions of the action to transform
*/
MDP.prototype.mappedAction = function (currentState, actionIndex) {
	var action = this.topActions[actionIndex];
	if (!action) {
		return null;
	}

	var mappedAction = {
		fromState: 'hint' + currentState.name,
		toState: 'hint' + action.toState,
		studentId: currentState.studentId,
		date: new Date(),
		type: action.type,
		stone1: action.stone1,
		stone2: action.stone2,
		trans: action.trans
	};

	//state that action leads from
	var actionState = this.getStateByName(action.fromState);

	//map stones in actionState to their most similar stones in currentState
	var actionCurrentSim = new GraphWrapper(actionState.stones, actionState.transitions, currentState.stones, currentState.transitions);
	actionCurrentSim.setNodeMap();

	//set the mappedAction stones and transition using the counterparts of actionStone in currentStone
	if (action.stone1) {
		mappedAction.stone1 = actionCurrentSim.nodeMap[action.stone1];
	}
	if (action.stone2) {
		mappedAction.stone2 = actionCurrentSim.nodeMap[action.stone2];
	}
	if (action.trans) {
		var transStart = action.trans.substring(0, action.trans.indexOf('transition') + 'transition'.length);
		mappedAction.trans = transStart + mappedAction.stone1 + mappedAction.stone2;
	}
	return mappedAction;
}

/*
getStateByName()
Purpose: returns the state with the given name, or null if no state exists with the given name
Parameters:
	stateName (string): name of the state to return 
*/
MDP.prototype.getStateByName = function (stateName) {
	for (var i = 0; i < this.states.length; i++) {
		if (this.states[i].name == stateName) {
			return this.states[i];
		}
	}
	return null;
}

/*
setTopActions()
Purpose: sets this.topActions to an array of actions that lead to the highest-valued clusters from the given state
Parameters:
	currentStateName (string): name of the user's current state
*/
MDP.prototype.setTopActions = function (currentStateName) {
	this.setTopClusters(currentStateName);
	this.topActions = [];
	for (var i = 0; i < this.numHints; i++) {
		this.topActions.push(this.getActionToCluster(currentStateName, i));
	}
}

/*
getActionToCluster()
Purpose: returns an action from the given state to the cluster at the given index
	cycles through the possible actions based on the number of actions that have been accessed for a given topCluster so far
Parameters:
	currentStateName (string): name of the user's current state
	topClusterIndex (integer): index in this.topClusters to get an action to
*/
MDP.prototype.getActionToCluster = function (currentStateName, topClusterIndex) {
	//index of the cluster that contains the current state
	var currentClusterIndex = parseInt(this.cluster.stateToClusterMap[currentStateName]);

	//the top cluster
	var topCluster = this.topClusters[topClusterIndex];

	//number of times an action has been chosen for topCluster so far
	var topClusterOccur = this.topClusterCount(topCluster, topClusterIndex);

	//array of actions from the current cluster to the topCluster
	var actionsFromCurrentToTop = this.clusterActions[currentClusterIndex][topCluster];

	if (!actionsFromCurrentToTop || actionsFromCurrentToTop.length == 0) {
		return null;
	}

	//cycle through the actions according to topClusterOccur
	return actionsFromCurrentToTop[topClusterOccur % actionsFromCurrentToTop.length];
}

/*
topClusterCount()
Purpose: returns the number of occurrences of the given cluster, up to the given index
	helper for getActionToCluster()
Parameters:
	topCluster (string): name (stringified integer) of the cluster to search for
	topClusterIndex (integer): index to search up to
*/
MDP.prototype.topClusterCount = function (topCluster, topClusterIndex) {
	var count = 0;
	for (var i = 0; i < topClusterIndex; i++) {
		if (this.topClusters[i] == topCluster) {
			count++;
		}
	}
	return count;
}

/*
setTopClusters()
Purpose: sets this.topClusters to the highest-valued clusters that the cluster containing the given state lead to
	cycles through the sorted clusters in case the given state leads to less than this.numHints clusters
Parameters:
	currentStateName (string): name of the user's current state
*/
MDP.prototype.setTopClusters = function (currentStateName) {
	var currentCluster = this.cluster.stateToClusterMap[currentStateName];
	this.topClusters = [];
	var sortedClusters = this.sortedClusters(currentStateName);

	//in case the given state is already in the best cluster, but has no actions leading to itself, the highest ranked action should actually be null
	if (this.clusterValues[parseInt(currentCluster)] > this.clusterValues[parseInt(sortedClusters[0])]) {
		sortedClusters.unshift(currentCluster.toString());
	}

	for (var i = 0; i < this.numHints; i++) {
		this.topClusters.push(sortedClusters[i % sortedClusters.length]);
	}
}

/*
sortedClusters()
Purpose: returns an array of clusters that the given state leads to, sorted first by value and then by numerical order
Parameters:
	currentStateName (string): name of the user's current state
*/
MDP.prototype.sortedClusters = function (currentStateName) {
	var mdp = this;
	var actionsFromCluster = this.clusterActions[this.cluster.stateToClusterMap[currentStateName]];

	//array containing the clusters that the given state leads to
	var actionKeys = Object.keys(actionsFromCluster).slice();

	//in case the given state doesn't lead to any clusters, return an array with the cluster containing the given state
	if (actionKeys.length == 0) {
		return[this.cluster.stateToClusterMap[currentStateName].toString()];
	}

	//sort the clusters the given state leads to
	actionKeys.sort(function (toCluster1, toCluster2) {
		var valueDifference = mdp.clusterValues[parseInt(toCluster2)] - mdp.clusterValues[parseInt(toCluster1)];

		//same value => sort numerically
		if (valueDifference == 0) {
			return parseInt(toCluster1) < parseInt(toCluster2);
		}

		//sort by value
		return valueDifference;
	});
	return actionKeys;
}

