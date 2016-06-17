//******//
//LANGUAGE GLOBALS//
//******//
var numbers = ['0', '1'];
var symbols = ['*', '+'];
var parens = ['(', ')'];

var langColors = {
	'0': 'purple',
	'1': 'orange'
};

var conditions = {
	'even 0s': /1*(01*01*)*/,
	'even 1s': /0*(10*10*)*/,
	'odd 0s': /1*0(1*01*0)*1*/,
	'odd 1s': /0*1(0*10*1)*0*/,
	'even length': /^(..)*$/,
	'odd length': /^.(..)*$/,
	'at least one 0': /.*0.*/,
	'at least one 1': /.*1.*/,
	'no 0s': /1+/,
	'no 1s': /0+/,
};

var hardcodedConditions = {
	'even0s':
	function () {
		return {
			description: 'Patterns containing an even number of ' + coloredString('Purple') + 's',
			regex: /1*(01*01*)*/
		}
	},
	'odd0s':
	function () {
		return {
			description: 'Patterns containing an odd number of ' + coloredString('Purple') + 's',
			regex: /1*0(1*01*0)*1*/
		}
	},
	'even1s':
	function () {
		return {
			description: 'Patterns containing an even number of ' + coloredString('Orange') + 's',
			regex: /0*(10*10*)*/
		}
	},
	'odd1s':
	function () {
		return {
			description: 'Patterns containins an odd number of ' + coloredString('Orange') + 's',
			regex: /0*1(0*10*1)*0*/
		}
	},
	'evenLength':
	function () {
		return {
			description: 'Patterns with even length',
			regex: /^(..)*$/
		}
	},
	'oddLength':
	function () {
		return {
			description: 'Patterns with odd length',
			regex: /^.(..)*$/
		}
	}
};

var simpleConditions = {
	'atLeastN':
	function (args) {
		var quantity = args ? args[0] : Math.floor(randomInRange(1, 3));
		var number = args ? args[1] : randomNumber();
		var color = langColors[number.toString()];
		return {
			description: 'Patterns containing at least ' + quantity + ' ' + coloredString(color + (quantity == 1 ? '' : 's')),
			regex: new RegExp(atLeastN(quantity, number)),
			quantity: quantity,
			number: number
		}
	},
	'atMostN':
	function (args) {
		var quantity = args ? args[0] : Math.floor(randomInRange(1, 3));
		var number = args ? args[1] : randomNumber();
		var color = langColors[number.toString()];
		return {
			description: 'Patterns containing at most ' + quantity + ' ' + coloredString(color + (quantity == 1 ? '' : 's')),
			regex: new RegExp(atMostN(quantity, number)),
			quantity: quantity,
			number: number
		}
	},
	'exactlyN':
	function (args) {
		var quantity = args ? args[0] : Math.floor(randomInRange(1, 3));
		var number = args ? args[1] : randomNumber();
		var color = langColors[number.toString()];
		return {
			description: 'Patterns containing exactly ' + quantity + ' ' + coloredString(color + (quantity == 1 ? '' : 's')),
			regex: new RegExp(exactlyN(quantity, number)),
			quantity: quantity,
			number: number
		}
	},
	'containsSubstring':
	function (args) {
		var substring = args ? args[0] : numberString(Math.floor(randomInRange(2, 4)));
		var colors = coloredString(numbersToWords(substring));
		return {
			description: 'Patterns containing the sub-pattern ' + colors,
			regex: new RegExp(containsSubstring(substring)),
			substring: substring
		}
	},
	'noSubstring':
	function (args) {
		var substring = args ? args[0] : numberString(Math.floor(randomInRange(2, 4)));
		var colors = coloredString(numbersToWords(substring));
		return {
			description: 'Patterns not containing the sub-pattern ' + colors,
			regex: new RegExp(noSubstring(substring)),
			substring: substring
		}
	},
	'beginsWith':
	function (args) {
		var substring = args ? args[0] : numberString(Math.floor(randomInRange(2, 4)));
		var colors = coloredString(numbersToWords(substring));
		return {
			description: 'Patterns that begin with ' + colors,
			regex: new RegExp(beginsWith(substring)),
			substring: substring
		}
	},
	'endsWith':
	function (args) {
		var substring = args ? args[0] : numberString(Math.floor(randomInRange(2, 4)));
		var colors = coloredString(numbersToWords(substring));
		return {
			description: 'Patterns that end with ' + colors,
			regex: new RegExp(endsWith(substring)),
			substring: substring
		}
	},
};

var conditionCombinations = [
	['containsSubstring', 'beginsWith', 'endsWith', 'evenLength', 'even0s', 'even1s'],
	['containsSubstring', 'beginsWith', 'endsWith', 'oddLength', 'odd0s', 'even1s'],
	['containsSubstring', 'beginsWith', 'endsWith', 'oddLength', 'even0s', 'odd1s'],
]

var operators = {
	'AND': function (reg) {
		var regString = reg.toString().substring(1, reg.toString().length - 1);
		return '(?=' + regString + ')';
	},
	'OR': function (reg) {
		var regString = reg.toString().substring(1, reg.toString().length - 1);
		return '|(' + regString + ')';
	}
};

//******//
//END LANGUAGE GLOBALS//
//******//

//******//
//LANGUAGE CLASS//
//******//

/*
Language()
Constructor for the general Language class
*/
Language = function (regex) {
	this.regex = regex;
}

/*
Language.prototype.inLanguage()
Purpose: returns true iff the given string is in the language
Parameters:
	str (String): the string to check
*/
Language.prototype.inLanguage = function (str) {
	//execute the regex on the string to get an array of matches
	var execArray = this.regex.exec(str);

	//at least part of the string matches => check if the whole string does
	if (execArray) {

		//get rid of the input so it doesn't interfere with the search for matches in the execArray
		execArray.input = undefined;

		//search the execArray for an exact match of the input string
		for (var i = 0; i < execArray.length; i++) {
			if (execArray[i] == str) {
				return true;
			}
		}
	}

	//at most a part of the string matches => string isn't in the language
	return false;
}

/*
Language.prototype.randomString()
Purpose: returns a random string in the language
*/
Language.prototype.randomString = function () {
	var randexp = new RandExp(this.regex);
	randexp.max = 2;

	//only generate strings over {0, 1}
	randexp.defaultRange.subtract(0, 47);
	randexp.defaultRange.subtract(50, 127);

	return randexp.gen();
}

/*
Language.prototype.stringMap()
Purpose: returns an array of objects where:
	each object contains the color for a character 
	and a boolean stating whether the character is 'okay',
	i.e. whether an activity should send out an object or a villain
Parameters:
	str (String): the string to get the map for (e.g. 00101)
*/
Language.prototype.stringMap = function (str) {
	var strArray = str.split('');

	//the string is in the language, so every character is okay
	if (this.inLanguage(str)) {
		return strArray.map(function (s) {
			return {color: langColors[s], okay: true};
		});
	}

	//the string isn't in the language, so execute on it to find any parts that are
	var execArray = this.regex.exec(str);

	//the string is bad from the beginning, so no character is okay
	if (!execArray) {
		return strArray.map(function (s) {
			return {color: langColors[s], okay: false};
		});
	}
	
	//the string is okay at the beginning, but there's some point where it goes bad
	var map = [];

	//good characters
	for (var i = 0; i < execArray[0].length; i++) {
		map.push({color: langColors[strArray[i]], okay: true});
	}

	//bad characters
	for (var j = execArray[0].length; j < str.length; j++) {
		map.push({color: langColors[strArray[j]], okay: false});
	}
	return map;
}

//******//
//END LANGUAGE CLASS//
//******//

//******//
//FINITE LANGUAGE CLASS//
//******//

/*
FiniteLanguage()
Constructs a language that only accepts a finite string
Parameters:
	regex (RegExp): optional regex
	length (int): length of a random finite regex
*/
FiniteLanguage = function (regex, length) {
	if (regex) {
		if (typeof regex == 'string') {
			this.regex = new RegExp(regex);
		} else {
			this.regex = regex;
		}
		this.length = this.regex.toString().length - 2;
	} else {
		this.length = length;
		var str = '';
		for (var i = 0; i < length; i++) {
			str += randomNumber();
		}
		this.regex = new RegExp(str);
	}
	var s = this.regex.toString();
	s = s.substring(1, s.length - 1);
	this.descriptionString = coloredString(numbersToWords(str));
}

FiniteLanguage.prototype.inLanguage = Language.prototype.inLanguage;

FiniteLanguage.prototype.description = function () {
	var str = this.regex.toString();
	str = str.substring(1, str.length - 1);

	return coloredString(numbersToWords(str));
}

FiniteLanguage.prototype.stringMap = function (str) {
	var goodStr = this.randomString();

	var mapArray = [];

	for (var i in str) {
		mapArray.push({
			color: langColors[str[i]],
			okay: str[i] == goodStr[i]
		});
	}

	return mapArray;
}

FiniteLanguage.prototype.randomString = function () {
	var str = this.regex.toString();
	str = str.substring(1, str.length - 1);
	return str;
}

//******//
//END FINITE LANGUAGE CLASS//
//******//

//******//
//SIMPLE LANGUAGE CLASS//
//******//

/*
SimpleLanguage()
Constructs a language that consists of a condition with an English description (odd length, at most two 1s, etc)
Parameters:
	regex (RegExp): optional regex
	description: (string): optional string description of regex parameters
	key (string): optional simple condition
	conditionArguments (array): optional arguments to pass into the condition function
*/

SimpleLanguage = function (regex, description, key, conditionArguments) {
	if (regex) {
		this.regex = regex;
		this.descriptionString = description;
	} else {
		var condKeys = Object.keys(simpleConditions);
		if (!key) {
			key = condKeys[Math.floor(Math.random() * condKeys.length)];
		}
		var condition = simpleConditions[key](conditionArguments);
		this.regex = condition.regex;
		this.descriptionString = condition.description;
		this.condition = condition;
		this.key = key;
	}
}

SimpleLanguage.prototype = Language.prototype;

SimpleLanguage.prototype.description = function () {
	return this.descriptionString;
}

SimpleLanguage.prototype.badString = function () {
	switch (this.key) {
		case 'atLeastN':
			// return new SimpleLanguage(null, null, 'atMostN', [this.condition.quantity - 1, this.condition.number]).randomString();
			// break;
			var quantity = this.condition.quantity;
			var number = this.condition.number;
			var otherNumber = number == '0' ? '1' : '0';
			var str = '';
			var length = Math.floor(randomInRange(1, 5));
			var numNumber = 0;
			for (var i = 0; i < length; i++) {
				if (numNumber >= quantity - 1) {
					str += otherNumber;
				} else {
					if (Math.random() < 0.5) {
						str += number;
						numNumber++;
					} else {
						str += otherNumber;
					}
				}
			}
			return str;
			break;
		case 'atMostN':
			// return new SimpleLanguage(null, null, 'atLeastN', [this.condition.quantity + 1, this.condition.number]).randomString();
			// break;
			var quantity = this.condition.quantity;
			var number = this.condition.number;
			var otherNumber = number == '0' ? '1' : '0';
			var str = '';
			var length = Math.floor(randomInRange(quantity + 1, quantity + 3));
			var numNumber = 0;
			for (var i = 0; i < length; i++) {
				if (numNumber > quantity) {
					if (Math.random() < 0.5) {
						str += number;
						numNumber++;
					} else {
						str += otherNumber;
					}
				} else {
					if (length - i <= quantity + 1 - numNumber) {
						str += number;
						numNumber++;
					} else {
						if (Math.random() < 0.5) {
							str += number;
							numNumber++;
						} else {
							str += otherNumber;
						}
					}
				}
			}
			return str;
			break;
		case 'exactlyN':
			// if (Math.random() < 0.5) {
			// 	return new SimpleLanguage(null, null, 'atLeastN', [this.condition.quantity + 1, this.condition.number]).randomString();
			// } else {
			// 	return new SimpleLanguage(null, null, 'atMostN', [this.condition.quantity - 1, this.condition.number]).randomString();
			// }
			// break;
			var quantity = this.condition.quantity;
			var number = this.condition.number;
			var otherNumber = number == '0' ? '1' : '0';
			var str = '';
			var length = Math.floor(randomInRange(quantity, quantity + 3));
			var numNumber = 0;
			for (var i = 0; i < length - 1; i++) {
				if (Math.random() < 0.5) {
					str += number;
					numNumber++;
				} else {
					str += otherNumber;
				}
			}
			if (numNumber == quantity) {
				str += number;
			}
			return str;
			break;
		case 'containsSubstring':
			return new SimpleLanguage(null, null, 'noSubstring', [this.condition.substring]).randomString();
			break;
		case 'noSubstring':
			return new SimpleLanguage(null, null, 'containsSubstring', [this.condition.substring]).randomString();
			break;
		case 'beginsWith':
			var substring = this.condition.substring;
			var start = substring.substring(0, 1);
			var other = start == '0' ? '1' : '0';
			var length = Math.floor(randomInRange(1, 5));
			var str = other;
			for (var i = 1; i < length; i++) {
				str += randomNumber();
			}
			return str;
			break;
		case 'endsWith':
			var substring = this.condition.substring;
			var end = substring.substring(substring.length - 1, substring.length);
			var other = end == '0' ? '1' : '0';
			var length = Math.floor(randomInRange(1, 5));
			var str = '';
			for (var i = 0; i < length - 1; i++) {
				str += randomNumber();
			}
			str += other;
			return str;
			break;
		default: 
			return '0';
	}
}

//******//
//END SIMPLE LANGUAGE CLASS//
//******//

//******//
//REGEX LANGUAGE CLASS//
//******//

/*
RegexLanguage()
Constructs a language that only consists of repeated number sequences
Parameters:
	regex (RegExp): optional regex
	length (int): length of a random simple regex
*/

RegexLanguage = function (regex, length) {
	if (regex) {
		this.regex = new RegExp(regex);
	} else {
		var str = '';
		var i = 0;
		while (i < length) {
			var strAndLen = Math.random() < 0.5 ? parenExp(length - i) : numberSymbolString(length - i);
			str += strAndLen[0];
			i += strAndLen[1];
		}
		if (str.indexOf('*') == -1 && str.indexOf('+') == -1) {
			var index = Math.floor(randomInRange(1, str.length));
			str = str.substring(0, index) + (Math.random() < 0.5 ? '*' : '+') + str.substring(index, str.length);
		}
		this.regex = new RegExp(str);
	}
	var s = this.regex.toString();
	this.descriptionString = coloredString(numbersToWords(s.substring(1, s.length - 1)));
}

RegexLanguage.prototype = Language.prototype;

RegexLanguage.prototype.description = function () {
	return this.descriptionString;
}

//******//
//END REGEX LANGUAGE CLASS//
//******//

//******//
//LANGUAGE HELPERS//
//******//

function getCondition (key) {
	if (Object.keys(hardcodedConditions).indexOf(key) != -1) {
		return hardcodedConditions[key]();
	} else if (Object.keys(simpleConditions).indexOf(key) != -1) {
		return simpleConditions[key]();
	}
	return {regex: /./, description: ''};
}

function atLeastN (quantity, number) {
	var other = number == 0 ? 1 : 0;
	var base = '(' + other + '*' + number + '+' + other + '*' + ')';
	return base + '{' + quantity + ',}';
}

function atMostN (quantity, number) {
	var other = number == 0 ? 1 : 0;
	var base = '(' + other + '*' + number + '?' + other + '*' + ')';
	return base + '{1,' + quantity + '}';
}

function exactlyN (quantity, number) {
	var other = number == 0 ? 1 : 0;
	var base = '(' + other + '*' + number + other + '*' + ')';
	return base + '{' + quantity + '}';
}

function containsSubstring (substring) {
	return '([01]*' + substring + '[01]*)+';
}

function noSubstring (substring) {
	return '^((?!' + substring + ')[01])*';
}

function beginsWith (substring) {
	return substring + '[01]*';
}

function endsWith (substring) {
	return '[01]*' + substring;
}

function randomNumber () {
	return Math.random() < 0.5 ? '0' : '1';
}

function randomSymbol () {
	return Math.random() < 0.5 ? '*' : '+';
}

function randomNumberOrSymbol () {
	return Math.random() < 0.66 ? randomNumber() : randomSymbol();
}

//returns a parenthesized expression followed by a symbol
//examples: (001)*, (1010)+, etc. 
//with a random length in [1, maxLength]
function parenExp (maxLength) {
	if (maxLength < 2) {
		return ['', 100 * maxLength];
	}

	var length = Math.floor(randomInRange(2, maxLength));

	var str = '(';
	for (var i = 1; i < length + 1; i++) {
		if (str[i - 1] in numbers && !(str[i - 1] in parens)) {
			str += randomNumberOrSymbol();
		} else {
			str += randomNumber();
		}
	}

	str += ')' + randomSymbol();
	return [str, length];
}

//returns a string consisting of only numbers and symbols (no parentheses)
//with a random length in [1, maxLength]
function numberSymbolString (maxLength) {
	var length = Math.floor(Math.random() * (maxLength - 1)) + 1;

	var str = randomNumber();
	for (var i = 1; i < length; i++) {
		if (str[i - 1] in numbers) {
			str += randomNumberOrSymbol();
		} else {
			str += randomNumber();
		}
	}

	return [str, length];
}

function numberString (length) {
	var str = '';
	for (var i = 0; i < length; i++) {
		str += randomNumber();
	}
	return str;
}
