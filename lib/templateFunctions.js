utilColors = {
	'0': 'purple',
	'1': 'orange'
};

utilShorts = {
	'purple': 'Purple',
	'orange': 'Orange',
};

capitalize = function (str) {
	return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1);});
}

numbersToWords = function (str) {
	var result = '';
	for (var i in str) {
		if (str[i] == '0' || str[i] == '1') {
			result += ' ' + capitalize(utilColors[str[i]]);
		} else {
			result += str[i];
		}
	}
	if (result[0] == '(' && result[1] == ' ') {
		result = result[0] + result.substring(2, result.length);
	}
	return result.trim();
}

coloredString = function (str) {
	var arr = str.split(' ');

	var result = '';
	for (var i in arr) {
		result += '<span class="' + arr[i].toLowerCase() + '">' + 
								utilShorts[arr[i].toLowerCase()] + 
								(i == arr.length - 1 ? '' : ' ') + 
							'</span>';
	}
	return result;
}

coloredString = function (str) {
	return str.replace(/Purple/ig, '<span class="purple">Purple</span>').replace(/Orange/ig, '<span class="orange">Orange</span>')
							.replace(/Purples/ig, '<span class="purple">Purples</span>').replace(/Oranges/ig, '<span class="orange">Oranges</span>');
}

andString = function (strArray) {
	if (strArray.length == 0) {
		return '';
	}
	
	if (strArray.length == 1) {
		return strArray[0];
	}

	if (strArray.length == 2) {
		return strArray[0] + ' and ' + strArray[1];
	}

	var result = '';
	for (var i = 0; i < strArray.length - 1; i++) {
		result += strArray[i] + ', ';
	}
	result += 'and ' + strArray[strArray.length - 1];
	return result;
}

setExpTagClass = function (expObj) {
	expObj.tagClass = '';
	if (expObj.tag.indexOf('jungle') != -1 || expObj.tag.indexOf('river') != -1 || expObj.tag.indexOf('table') != -1) {
		expObj.tagClass = 'jungleText';
	}
	if (expObj.tag.indexOf('ocean') != -1 || expObj.tag.indexOf('starfish') != -1 || expObj.tag.indexOf('net') != -1) {
		expObj.tagClass = 'oceanText';
	}
	if (expObj.tag.indexOf('ice') != -1 || expObj.tag.indexOf('iceberg') != -1 || expObj.tag.indexOf('tower') != -1) {
		expObj.tagClass = 'iceText';
	}
}

substringMatcher = function (strs) {
  return function findMatches (q, cb) {
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        matches.push(str);
      }
    });

    cb(matches);
  };
};