var UNCHECK = '&#10007';
var CHECK = '&#10003';

Template.Home.helpers({
	worldStatus: function (worldTag) {
		//return Blaze._globalHelpers.worldProgressPercentage(worldTag);
		switch (worldTag) {
			case '#jungleworld':
				return '100%';
			case '#oceanworld':
				return Blaze._globalHelpers.worldProgressPercentage('#jungleworld');
			case '#iceworld':
				return Blaze._globalHelpers.worldProgressPercentage('#oceanworld');
		}
	}
});