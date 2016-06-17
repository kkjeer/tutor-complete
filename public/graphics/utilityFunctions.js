var colorRanges = {
	red: [0, 15, 345, 360],
	orange: [15, 35],
	yellow: [35, 75],
	green: [75, 165],
	blue: [165, 265],
	purple: [265, 305],
	pink: [305, 345]
};

var IMAGE_PATH = 'images/';
var IMAGE_FORMAT = '.png';

function randomInRange (min, max) {
  return Math.random()*(max - min) + min;
}

function randomSign () {
	return Math.random() < 0.5 ? -1 : 1;
}


function degreesToRadians (deg) {
  return deg*Math.PI/180;
}


function radiansToDegrees (rad) {
  return rad*180/Math.PI;
}

function randomArrayElement (array) {
	return array[Math.floor(Math.random() * array.length)];
}

function randomObjectValue (object) {
	return object[Object.keys(object)[Math.floor(Math.random() * Object.keys(object).length)]];
}

/*
randomColorInRange()
Purpose: returns a random color in the range of startColor and endColor
  used to generate a random color for the stem in makeLeaf()
Parameters:
startColor (THREE.Color) - the color at one end of the range
endColor (THREE.Color) - the color and the other end of the range
*/
function randomColorInRange (startColor, endColor) {
  var startHSL = startColor.getHSL();
  var endHSL = endColor.getHSL();
  var hueDifference = Math.abs(endHSL.h - startHSL.h);
  var saturationDifference = Math.abs(endHSL.s - startHSL.s);
  var lightnessDifference = Math.abs(endHSL.l - startHSL.l);

  //create a random color in the range of startColor and endColor
  var hue = Math.random()*hueDifference + startHSL.h; //range: startHSL.h to endHSL.h
  var saturation = Math.random()*saturationDifference + startHSL.s; //range: startHSL.s to endHSL.s
  var lightness = 0.75*Math.random()*lightnessDifference + endHSL.l; //range: endHSL.l to 0.75*lightnessDifference
  var color = new THREE.Color();
  color.setHSL(hue, saturation, lightness);

  return color;
}

function randomColor () {
	var color = new THREE.Color();
	color.setHSL(Math.random(), 1.0, 0.5);
	return color;
}

function randomColorFromSeed (seed) {
	var color = new THREE.Color();
	var colorMin, colorMax;
	var range = colorRanges[seed];

	if (seed == 'red') {
		var rand = Math.random();
		colorMin = rand < 0.5 ? range[0] : range[2];
		colorMax = rand < 0.5 ? range[1] : range[3];
	} else {
		colorMin = range[0];
		colorMax = range[1];
	}

	color.setHSL(randomInRange(colorMin, colorMax)/360, 1.0, 0.5);
	return color;
}

function randomFlowerColor () {
	var colorSeeds = ['red', 'blue', 'purple', 'pink'];
	var seed = colorSeeds[Math.floor(Math.random() * colorSeeds.length)];
	return randomColorFromSeed(seed);
}

function randomStemColor () {
	var green = randomColorFromSeed('green');
	green.setHSL(green.getHSL().h, green.getHSL().s, randomInRange(0.2, 0.4));
	return green;
}

function textureMaterial (url) {
  //load the texture from the given url
  var texture = new THREE.ImageUtils.loadTexture(IMAGE_PATH + url, new THREE.UVMapping());
  texture.wrapS = THREE.MirroredRepeatWrapping;
  texture.wrapT = THREE.MirroredRepeatWrapping;
  texture.needsUpdate = true;

  //create and return the material
  var mat = new THREE.MeshPhongMaterial({color: 0xffffff, ambient: 0xffffff, side: THREE.DoubleSide});
  mat.map = texture;
  return mat;
}

function speckledMaterial (geom, colorArray) {
	geom.vertexColors = [];
	for (var i = 0; i < geom.vertices.length; i++) {
		geom.vertexColors.push(new THREE.Color(colorArray[Math.floor(Math.random() * colorArray.length)]));
	}
	geom.computeFaceNormals();
	TW.computeFaceColors(geom);

	return new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors});
}

function fadedMaterial (geom, colorArray) {
	geom.vertexColors = [];
	for (var i = 0; i < geom.vertices.length/2; i++) {
		geom.vertexColors.push(new THREE.Color(colorArray[0]));
	}
	for (var i = 0; i < geom.vertices.length/2; i++) {
		geom.vertexColors.push(new THREE.Color(colorArray[colorArray.length - 1]));
	}
	geom.computeFaceNormals();
	TW.computeFaceColors(geom);

	return new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors});
}

function isNumber (str) {
	str == '0' || str == '1' || str == '2' || str == '3' || str == '4' ||
	str == '5' || str == '6' || str == '7' || str == '8' || str == '9';
}

function numberString (length) {
	var str = '';
	for (var i = 0; i < length; i++) {
		str += randomNumber();
	}
	return str;
}

function randomNumber () {
	return Math.random() < 0.5 ? '0' : '1';
}

function boldString (str, index) {
	var arr = str.split(' ');

	var result = '';
	for (var i in arr) {
		if (i == index) {
			result += '<strong><em class="' + arr[i].toLowerCase() + '">' + 
									utilShorts[arr[i].toLowerCase()] + 
									(i == arr.length - 1 ? '' : ' ') + 
								'</em></strong>';
		} else {
			result += '<span class="' + arr[i].toLowerCase() + '">' + 
									utilShorts[arr[i].toLowerCase()] + 
									(i == arr.length - 1 ? '' : ' ') + 
								'</span>';
		}
	}
	return result;
}