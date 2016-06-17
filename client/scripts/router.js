var subscriptions = [
	Meteor.subscribe('students'), 
	Meteor.subscribe('points'), 
	Meteor.subscribe('explanations'), 
	Meteor.subscribe('expfaves'),
	Meteor.subscribe('jungleriverstates'),
	Meteor.subscribe('jungleriveractions'),
	Meteor.subscribe('oceanstarfishstates'),
	Meteor.subscribe('oceanstarfishactions'),
	Meteor.subscribe('icebergstates'),
	Meteor.subscribe('icebergactions'),
	Meteor.subscribe('riverlanguages'),
	Meteor.subscribe('oceanlanguages'),
	Meteor.subscribe('icelanguages'),
	Meteor.subscribe('nonregulars'),
	Meteor.subscribe('nonregularrewards'),
	Meteor.subscribe('tablestates'),
	Meteor.subscribe('netstates'),
	Meteor.subscribe('towerstates'),
	Meteor.subscribe('hintsused'),
	Meteor.subscribe('dfascores'),
	Meteor.subscribe('plscores'),
	Meteor.subscribe('bayesfeatures')
];

Router.route('/', {
	waitOn: function () {
		return subscriptions;
	},
	action: function () {
		if (this.ready()) {
			this.render('Home');
		} else {
			this.render('Loading');
		}
	}
});

Router.route('/jungleworld', {
	action: function () {
		if (this.ready()) {
			this.render('JungleWorld');
		} else {
			this.render('Loading');
		}
	}
});

Router.route('/oceanworld', {
	action: function () {
		if (this.ready()) {
			this.render('OceanWorld');
		} else {
			this.render('Loading');
		}
	}
});

Router.route('/iceworld', {
	action: function () {
		if (this.ready()) {
			this.render('IceWorld');
		} else {
			this.render('Loading');
		}
	}
});

Router.route('/dashboard', {
	waitOn: function () {
		return subscriptions;
	},

	action: function () {
		if (this.ready()) {
			this.render('Dashboard');
		} else {
			this.render('Loading');
		}
	}
});

Router.route('/explanations', {
	waitOn: function () {
		return subscriptions;
	},
	
	action: function () {
		if (this.ready()) {
			this.render('Explanations');
		} else {
			this.render('Loading');
		}
	}
});

Router.route('/createactivity', {
	action: function () {
		if (this.ready()) {
			this.render('CreateActivity');
		} else {
			this.render('Loading');
		}
	}
});

Router.route('/customactivities', {
	action: function () {
		if (this.ready()) {
			this.render('CustomActivities');
		} else {
			this.render('Loading');
		}
	}
});

Router.route('/tutorials', {
	action: function () {
		if (this.ready()) {
			this.render('Tutorials');
		} else {
			this.render('Loading');
		}
	}
});

Router.route('/about', {
	action: function () {
		if (this.ready()) {
			this.render('About');
		} else {
			this.render('Loading');
		}
	}
});



