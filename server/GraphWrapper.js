/*
GraphWrapper()
Purpose: constructs a new graphwrapper object that computes the combined purple/orange similarity between two graphs
Parameters:
	nodes1 (object array): array containing the nodes (DFA stones) of the first graph
	edges1 (object): edges (DFA transitions) of the second graph
	nodes2 (object array): array containing the nodes (DFA stones) of the second graph
	edges2 (object): edges (DFA transitions) of the second graph
*/
GraphWrapper = function (nodes1, edges1, nodes2, edges2) {
	//from parameters: construct the two graphs
	this.nodes1 = nodes1.map(function (node) {
		return node.name;
	});
	this.edges1 = edges1;
	this.nodes2 = nodes2.map(function (node) {
		return node.name;
	});
	this.edges2 = edges2;

	//calculate similarity between purple and orange subgraphs
	this.purpleGraphSim = new GraphSimilarity(this.nodes1, this.edges1.purple, this.nodes2, this.edges2.purple);
	this.orangeGraphSim = new GraphSimilarity(this.nodes1, this.edges1.orange, this.nodes2, this.edges2.orange);

	//create node similarity matrix (used to find the most similar nodes between graphs)
	this.nodeSimilarity = new Array(this.nodes1.length);
	for (var i = 0; i < this.nodes1.length; i++) {
		this.nodeSimilarity[i] = new Array(this.nodes2.length);
	}
	this.computeNodeSimilarityMatrix();
}

/*
getGraphSimilarity()
Purpose: returns the similarity score in [0, 1] of the two graphs, based on the similarity of the purple and orange subgraphs
*/
GraphWrapper.prototype.getGraphSimilarity = function () {
	var purpleSimilarity = this.purpleGraphSim.getGraphSimilarity();
	var orangeSimilarity = this.orangeGraphSim.getGraphSimilarity();
	var nodesDifference = Math.abs(this.nodes1.length - this.nodes2.length);
	return 0.5 * purpleSimilarity + 0.5 * orangeSimilarity - 0.1 * nodesDifference;
}

/*
setNodeMap()
Purpose: sets and returns this.nodeMap to an object mapping each node in the first graph to its most similar node in the second graph
*/
GraphWrapper.prototype.setNodeMap = function () {
	this.nodeMap = {};
	for (var i = 0; i < this.nodes1.length; i++) {
		var mostSimilarIndex = maxIndex(this.nodeSimilarity[i], i);
		var mostSimilarNode = this.nodes2[mostSimilarIndex];
		this.nodeMap[this.nodes1[i]] = mostSimilarNode;
	}
	return this.nodeMap;
}

/*
computeNodeSimilarityMatrix()
Purpose: sets this.nodeSimilarity[i][j] to the similarity of node i in the first graph and node j in the second graph for all i and j
*/
GraphWrapper.prototype.computeNodeSimilarityMatrix = function () {
	for (var i = 0; i < this.nodes1.length; i++) {
		for (var j = 0; j < this.nodes2.length; j++) {
			this.nodeSimilarity[i][j] = 0.5 * (this.purpleGraphSim.nodeSimilarity[i][j] + this.orangeGraphSim.nodeSimilarity[i][j]);
		}
	}
}

/*
maxIndex()
Purpose: returns the index of the maximum element in array
				 helper for setNodeMap()
				 starts searching at index, searches in both directions of the array
Parameters:
	array (array): array to search
	index (int): starting value for maxIndex
*/
function maxIndex (array, index) {
	var maxIndex = index;
	for (var i = 0; i < maxIndex; i++) {
		if (array[i] > array[maxIndex]) {
			maxIndex = i;
		}
	}
	for (var j = array.length - 1; j > maxIndex; j--) {
		if (array[j] > array[maxIndex]) {
			maxIndex = j;
		}
	}
	return maxIndex;
}