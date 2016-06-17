var EPSILON = 0.01;

/*
GraphSimilarity()
Purpose: constructs a new graphsimilarity object that computes the similarity ([0, 1]) between two graphs
         each graph is assumed to only contain one type of transition (purple or orange), since no distinction is made between transition types
         the distinction is done in GraphWrapper.js
Parameters:
  nodes1 (string array): nodes (DFA stone names) of the first graph
  edges1 (object): edges (DFA transitions) of the first graph
  nodes2 (string array): nodes (DFA stone names) of the second graph
  edges2 (object): edges (DFA transitions) of the second graph
*/
GraphSimilarity = function (nodes1, edges1, nodes2, edges2) {
  //graphs from parameters
	this.nodes1 = nodes1;
	this.edges1 = edges1;
	this.nodes2 = nodes2;
	this.edges2 = edges2;

  //map each node to the nodes leading into it
	this.inNodeMap1 = this.inNodeMap(this.nodes1, this.edges1);
	this.inNodeMap2 = this.inNodeMap(this.nodes2, this.edges2);

  //map each node to the nodes coming out from it
	this.outNodeMap1 = this.outNodeMap(this.nodes1, this.edges1);
	this.outNodeMap2 = this.outNodeMap(this.nodes2, this.edges2);

  //initialize node similarity matrices
	this.nodeSimilarity = new Array(this.nodes1.length);
	this.inNodeSimilarity = new Array(this.nodes1.length);
	this.outNodeSimilarity = new Array(this.nodes1.length);
	for (var i = 0; i < this.nodes1.length; i++) {
		this.nodeSimilarity[i] = new Array(this.nodes2.length);
		this.inNodeSimilarity[i] = new Array(this.nodes2.length);
		this.outNodeSimilarity[i] = new Array(this.nodes2.length);
	}

	this.initializeSimilarityMatrices();
}

/*
getGraphSimilarity()
Purpose: returns the similarity score in [0, 1] of the two graphs
*/
GraphSimilarity.prototype.getGraphSimilarity = function () {
  //compute the similarity between the two graphs
	var finalGraphSimilarity = 0.0;
  this.measureSimilarity();

  //neither graph has any stones => identical graphs
  if (this.nodes1.length == 0 && this.nodes2.length == 0) {
    return 1.0;
  }

  //compute finalGraphSimilarity
  if (this.nodes1.length < this.nodes2.length) {
    finalGraphSimilarity = this.enumerationFunction(this.nodes1, this.nodes2, 0) / this.nodes1.length;
  } else {
    finalGraphSimilarity = this.enumerationFunction(this.nodes2, this.nodes1, 1) / this.nodes2.length;
  }

  //no transitions => base score on the difference between the number of stones
  if (Object.keys(this.edges1).length == 0 && Object.keys(this.edges2).length == 0) {
    return 1.0 - 0.5 * Math.abs(this.nodes1.length - this.nodes2.length);
  }
  
  return finalGraphSimilarity;
}

/*
inNodeMap()
Purpose: returns an object mapping each node in nodesArr to the nodes that lead to it
Parameters:
  nodesArr (string array): nodes
  edgesObj (object): edges
*/
GraphSimilarity.prototype.inNodeMap = function (nodesArr, edgesObj) {
	var map = {};
	for (var i in nodesArr) {
		map[nodesArr[i]] = [];
		for (var j in Object.keys(edgesObj)) {
			var key = Object.keys(edgesObj)[j];
			if (edgesObj[key] == nodesArr[i]) {
				map[nodesArr[i]].push(key);
			}
		}
	}
	return map;
}

/*
outNodeMap()
Purpose: returns an object mapping each node in nodesArr to the nodes that it leads to
Parameters:
  nodesArr (string array): nodes
  edgesObj (object): edges
*/
GraphSimilarity.prototype.outNodeMap = function (nodesArr, edgesObj) {
	var map = {};
	for (var i in nodesArr) {
		map[nodesArr[i]] = [];
		if (edgesObj[nodesArr[i]]) {
			map[nodesArr[i]].push(edgesObj[nodesArr[i]]);
		}
	}
	return map;
}

/*
initializeSimilarityMatrices()
Purpose: initializes this.inNodeSimilarity, this.outNodeSimilarity, and this.nodeSimilarity using neighbor matching equations
*/
GraphSimilarity.prototype.initializeSimilarityMatrices = function () {
	for (var i = 0; i < this.nodes1.length; i++) {
    for (var j = 0; j < this.nodes2.length; j++) {
      //in similarity
    	var inLength1 = this.inNodeMap1[this.nodes1[i]].length;
    	var inLength2 = this.inNodeMap2[this.nodes2[j]].length;
      var maxDegree = Math.max(inLength1, inLength2);
      if (maxDegree != 0) {
        this.inNodeSimilarity[i][j] = Math.min(inLength1, inLength2) / maxDegree;
      } else {
        this.inNodeSimilarity[i][j] = 0
      }

      //out similarity
      var outLength1 = this.outNodeMap1[this.nodes1[i]].length;
    	var outLength2 = this.outNodeMap2[this.nodes2[j]].length;
      maxDegree = Math.max(outLength1, outLength2);
      if (maxDegree != 0) {
        this.outNodeSimilarity[i][j] = Math.min(outLength1, outLength2) / maxDegree;
      } else {
        this.outNodeSimilarity[i][j] = 0;
      }
    }
  }

  //node similarity
  for (var i = 0; i < this.nodes1.length; i++) {
    for (var j = 0; j < this.nodes2.length; j++) {
      this.nodeSimilarity[i][j] = (this.inNodeSimilarity[i][j] + this.outNodeSimilarity[i][j]) / 2;
    }
  }
}

/*
measureSimilarity()
Purpose: calculates the similarity between nodes until there is little change (< EPSILON) in the node similarity space
*/
GraphSimilarity.prototype.measureSimilarity = function () {
	var maxDifference = 0.0;
  var terminate = false;

  while (!terminate) {
    maxDifference = 0.0;
    for (var i = 0; i < this.nodes1.length; i++) {
      for (var j = 0; j < this.nodes2.length; j++) {
      	var inLength1 = this.inNodeMap1[this.nodes1[i]].length;
				var inLength2 = this.inNodeMap2[this.nodes2[j]].length;
        //calculate in-degree similarities
        var similaritySum = 0.0;
        var maxDegree = Math.max(inLength1, inLength2);
        var minDegree = Math.min(inLength1, inLength2);
        if (minDegree == inLength1) {
          similaritySum = this.enumerationFunction(this.inNodeMap1[this.nodes1[i]], this.inNodeMap2[this.nodes2[j]], 0);
        } else {
          similaritySum = this.enumerationFunction(this.inNodeMap2[this.nodes2[j]], this.inNodeMap1[this.nodes1[i]], 1);
        }
        if (maxDegree == 0.0 && similaritySum == 0.0) {
          this.inNodeSimilarity[i][j] = 1.0;
        } else if (maxDegree == 0.0) {
          this.inNodeSimilarity[i][j] = 0.0;
        } else {
          this.inNodeSimilarity[i][j] = similaritySum / maxDegree;
        }

        var outLength1 = this.outNodeMap1[this.nodes1[i]].length;
				var outLength2 = this.outNodeMap2[this.nodes2[j]].length;
        //calculate out-degree similarities
        similaritySum = 0.0;
        maxDegree = Math.max(outLength1, outLength2);
        minDegree = Math.min(outLength1, outLength2);
        if (minDegree == outLength1) {
          similaritySum = this.enumerationFunction(this.outNodeMap1[this.nodes1[i]], this.outNodeMap2[this.nodes2[j]], 0);
        } else {
          similaritySum = this.enumerationFunction(this.outNodeMap2[this.nodes2[j]], this.outNodeMap1[this.nodes1[i]], 1);
        }
        if (maxDegree == 0.0 && similaritySum == 0.0) {
          this.outNodeSimilarity[i][j] = 1.0;
        } else if (maxDegree == 0.0) {
          this.outNodeSimilarity[i][j] = 0.0;
        } else {
          this.outNodeSimilarity[i][j] = similaritySum / maxDegree;
        }
      }
    }

    //calculate node similarity
    for (var i = 0; i < this.nodes1.length; i++) {
      for (var j = 0; j < this.nodes2.length; j++) {
        var temp = (this.inNodeSimilarity[i][j] + this.outNodeSimilarity[i][j]) / 2;
        if (Math.abs(this.nodeSimilarity[i][j] - temp) > maxDifference) {
          maxDifference = Math.abs(this.nodeSimilarity[i][j] - temp);
        }
        this.nodeSimilarity[i][j] = temp;
      }
    }

    //little change over all similarities => stop calculating
    if (maxDifference < EPSILON) {
      terminate = true;
    }
  }
}

/*
enumerationFunction()
Purpose: calculates the similarity between two graphs
Parameters:
  neighborMapMin (object): map between nodes
  neighborMapMax (object): map between nodes
  graph (int): flag to determine how the calculation is performed
*/
GraphSimilarity.prototype.enumerationFunction = function (neighborMapMin, neighborMapMax, graph) {
	var similaritySum = 0.0;
  var valueMap = {};
  var minKeys = Object.keys(neighborMapMin);
  var maxKeys = Object.keys(neighborMapMax);
  if (graph == 0) {
    for (var i = 0; i < minKeys.length; i++) {
    	var minKey = minKeys[i];
      var node = neighborMapMin[minKey];
      var max = 0;
      var maxIndex = -1;
      for (var j = 0; j < maxKeys.length; j++) {
      	var maxKey = maxKeys[j];
        var key = neighborMapMax[maxKey];
        if (Object.keys(valueMap).indexOf(key) == -1) {
          if (max < this.nodeSimilarity[minKey][maxKey]) {
            max = this.nodeSimilarity[minKey][maxKey];
            maxIndex = key;
          }
        }
      }
      valueMap[maxIndex] = max;
    }
  } else {
    for (var i = 0; i < minKeys.length; i++) {
    	var minKey = minKeys[i];
      var node = neighborMapMin[minKeys];
      var max = 0;
      var maxIndex = -1;
      for (var j = 0; j < neighborMapMax.length; j++) {
      	var maxKey = maxKeys[j];
        var key = neighborMapMax[maxKey];
        if (Object.keys(valueMap).indexOf(key) == -1) {
          if (max < this.nodeSimilarity[maxKey][minKey]) {
            max = this.nodeSimilarity[maxKey][minKey];
            maxIndex = key;
          }
        }
      }
      valueMap[maxIndex] = max;
    }
  }

  for (var k in Object.keys(valueMap)) {
    similaritySum += valueMap[Object.keys(valueMap)[k]];
  }
  return similaritySum;
}