Session.setDefault('expSort', 'faveCount');
Session.setDefault('expFilter', '');

Template.Explanations.onRendered(function () {
	var tags = ['#jungle', '#ocean', '#ice', '#other', '#river', '#table', '#starfish', '#net', '#iceberg', '#tower'];

	var authors = Array.from(new Set(Explanations.find({}).fetch().map(function (exp) {
		return exp.author;
	})));

	var titles = Array.from(new Set(Explanations.find({}).fetch().map(function (exp) {
		return exp.title;
	})));

	var filters = tags.concat(authors).concat(titles);

	$('#expFilterAutocomplete').typeahead(
		{
  		hint: true,
  		highlight: true,
  		minLength: 1
		},
		{
  		name: 'filters',
  		source: substringMatcher(filters)
		}
	);

	$('#expFilterAutocomplete').on('typeahead:selected', function (e, datum) {
    Session.set('expFilter', datum);
	}).on('typeahead:autocompleted', function (e, datum) {
    Session.set('expFilter', datum);
	});

	$('[data-toggle="tooltip"]').tooltip();
});

Template.Explanations.helpers({
	sortedExplanations: function () {
		var explanationsDB = Explanations.find({}).fetch().map(function (exp) {
			var expObj = exp;

			expObj.faveCount = ExpFaves.find({toExp: expObj._id}).fetch().length;
			setExpTagClass(expObj);

			var userWrote = expObj.author == Meteor.user().username;
			var favesGone = Students.findOne(Meteor.userId()).weeklyFaves < 1;
			var alreadyFaved = ExpFaves.find({fromUser: Meteor.user().username, toExp: expObj._id}).fetch().length > 0;

			expObj.faveButtonClass = 'clickToFave';
			expObj.faveButtonText = 'Click to fave';
			if (alreadyFaved) {
				expObj.faveButtonClass = 'alreadyFaved';
				expObj.faveButtonText = 'You faved this';
			}
			if (favesGone) {
				expObj.faveButtonClass = 'favesGone';
				expObj.faveButtonText = 'All faves used';
			}
			if (userWrote) {
				expObj.faveButtonClass = 'userWrote';
				expObj.faveButtonText = 'You wrote this';
			}

			expObj.noFave = userWrote || favesGone || alreadyFaved;
			return expObj;
		});

		var explanations = explanationsDB.filter(function (exp) {
			var filter = Session.get('expFilter').toLowerCase();
			if (filter == '') {
				return true;
			}
			return exp.title.toLowerCase().indexOf(filter) != -1 || 
						 exp.tag.toLowerCase().indexOf(filter) != -1 || 
						 exp.author.toLowerCase().indexOf(filter) != -1;
		})
		.sort(function (exp1, exp2) {
			var sort = Session.get('expSort');
			if (exp1[sort] == exp2[sort]) {
				if (sort == 'faveCount') {
					return exp1.date < exp2.date;
				}
				return exp1.faveCount < exp2.faveCount;
			}
			return exp1[sort] < exp2[sort];
		});

		var exps = [];
		var numPerRow = 4;

		for (var i = 0, k = -1; i < explanations.length; i++) {
			if (i % numPerRow == 0) {
				k++;
				exps[k] = {'row': []};
			}

			var expObj = explanations[i];
			exps[k]['row'].push(expObj);
		}

		return exps;
	},

	sortFactors: function () {
		return [
			{
				factor: 'faveCount',
				name: 'Faves'
			},

			{
				factor: 'date',
				name: 'Date'
			}
		];
	},

	currentExp: function () {
		return Session.get('currentExp');
	}
});

Template.Explanations.events({
	'change #expSortSelect': function (event) {
		event.target.blur();
		event.preventDefault();
		var select = document.getElementById('expSortSelect');
		var sortFactor = select[select.selectedIndex].value;
		Session.set('expSort', sortFactor);
	},

	'keyup #expFilterAutocomplete': function (event) {
		Session.set('expFilter', event.target.value);
	},

	'click .expCard': function (event) {
		if ($(event.target).hasClass('faveButton')) {
			return;
		}

		var id = $(event.target).closest('.expCard').attr('id');
		var currentExp = Explanations.findOne(id);
		Session.set('currentExp', currentExp);

		$('#viewExpLightbox').lightbox_me({
			centered: true,
			overlayCSS: {
				background: 'white',
				opacity: 0.6
			}
		});
	},

	'click #createExpButton': function (event) {
		event.target.blur();

		$('#createExpLightbox').lightbox_me({
			centered: true,
			overlayCSS: {
				background: 'white',
				opacity: 0.6
			},
			closeSelector: '.closeButton',
			onLoad: function () {
				$('#saveNewExp').unbind('click');
				$('#saveNewExp').click(function (event) {
					console.log('saving new explanation');
					$(this).blur();
					var newTitle = $('#createExpTitle').val();
					var newTag = $('#createExpTag').val();
					if (newTag.substring(0, 1) != '#') {
						newTag = '#' + newTag;
					}
					var newText = $('#createExpText').val();
					Meteor.call('createExplanation', newTitle, newTag, newText);
					$('#createExpTitle').val('');
					$('#createExpTag').val('');
					$('#createExpText').val('');
				});

				$('#cancelNewExp').click(function (event) {
					$(this).blur();
				});
			}
		});
	},

	'click .faveButton': function (event) {
		event.target.blur();

		var id = $(event.target).closest('.expCard').attr('id');
		var currentExp = Explanations.findOne(id);

		var alreadyFaved = ExpFaves.find({fromUser: Meteor.user().username, toExp: id}).fetch().length > 0;
		console.log('already faved ' + currentExp.title + '? ' + alreadyFaved);
		var currentFaves = Students.findOne(Meteor.userId()).weeklyFaves;

		// if (alreadyFaved) {
		// 	Meteor.call('unfaveExplanation', id);
		// } else {
			var userWrote = currentExp.author == Meteor.user().username;

			if (userWrote || currentExp < 1) {
				return;
			}

			Meteor.call('faveExplanation', id);
		//}
	}
});

