"use strict";
define([
    'jquery',
    'underscore',
    'backbone',
    'collections',
    'models',
    'bootstrapDatepicker',
    'bootstrapTimepicker',
    'hbs!templates/admin-screen',
    'hbs!templates/users',
    'hbs!templates/nakit',
    'hbs!templates/edit-nakkis',
    'hbs!templates/selector',
    'hbs!templates/party-description',
    'hbs!templates/party-editor-form',
    'hbs!templates/alert'
], function($, _, bb, collections, models, bootstarpDP, bootstarpTP, adminScreen, userlist, nakkilist, nakkilist_edit, selector, party_description, party_edit, alertTmpl) {

    //TODO fix party creation refresh for nakkitypes editor.

    var vent = {};
    _.extend(vent, bb.Events);

    var parties = new collections.Parties();
    
    var users = new collections.Users();

    var auxUsers = new collections.AuxUsers();

    var nakkitypes = new collections.Nakkitypes();

    //todo move to separate error-handling-module
    var _error = function(col, error) {
	alert('Failure: ' + error.statusText);
	//todo proper delegatation to router
	location.href = '/';
    };
    
    //TODO refactor to common-module
    var NotificationArea = bb.View.extend({
	initialize: function() {
	    _.bindAll(this);
	    vent.on('detach', this.remove);
	    this.listenTo(vent, 'alert', this.showAlert);
	    this.listenTo(vent, 'notify', this.showNotify);
	    this.render();
	},

	showAlert: function(message) {
	    message.type = 'error';
	    this.appendAlert(message);
	},

	showNotify: function(message) {
	    message.type = 'success';
	    this.appendAlert(message);
	},	

	appendAlert: function(message) {
	    this.$el.append(alertTmpl({message: message}));
	}
    });

    var Party_Selector = bb.View.extend({
	events: {
	    "change .selector" : "select",
	    "click .creator"  : "create",
	    "click .deletor"  : "destroy"
	},

	initialize: function() {
	    _.bindAll(this);
	    parties.on('add', this.render);
	    vent.on('partyEdited', this.render);
	    vent.on('detach', this.remove);
	    this.render();
	},

	render: function(partyTitle){
	    this.$el.html(selector({parties:parties.toJSONWithClientID(), selected:partyTitle}));
	    return this.$el;
	},
	
	select: function(target) {
	    var partyId = this.$('form').serializeArray()[0].value;
	    vent.trigger('changeParty', partyId);
	},

	create: function() {
	    var partyTitle = prompt("Give name to the party (cannot be changed afterwards)","party");
	    var party = new models.Party({title:partyTitle});
	    parties.add(party);
	    vent.trigger('createdParty', party.cid);
	    this.render(partyTitle);
	},

	destroy: function(){
	    var self = this;
	    var partyId = this.$('form').serializeArray()[0].value;
	    var model = parties.get(partyId);
	    var r = confirm("Are you sure to want to delete party " + model.get('title') + " ?");
	    if (r) {
		model.destroy({
		    wait: true, 
		    success: this.notify,
		    error: this.alert
		});
	    }
	},
	
	notify: function(model, options) {
	    var message = {
		title: 'Success',
		text: "Party " + model.get('title') + " successfully removed."
	    };
	    vent.trigger('notify', message);
	    vent.trigger('changeParty', parties.at(0));
	    this.render();
	},

	alert: function(model, xhr, options) {
	    var message = {
		title: "Failure (Something went wrong in server)!",
		text: "Your assignment request failed because: " + xhr.responseText
	    }
	    vent.trigger('alert', message);
	}
    });

    var User_List = bb.View.extend({
	collection: users, //TODO maybe as an constructor parameter

	events: {
	    'click .unassign': 'unassign'
	},

	initialize: function(){
	    _.bindAll(this);
	    vent.on('changeParty', this.refresh);
	    vent.on('detach', this.remove);
	    this.listenTo(this.collection, 'remove', this.render);
	    this.render();
	},
	
	refresh: function(partyId) {
	    var self = this;
	    var party = parties.get(partyId);

	    this.collection.partyId = party.get('id');
	    this.collection.fetch({
		success: this.render, 
		
		error: function(){
		    this.collection.reset();
		    self.$el.html('none');
		}
	    });
	},

	render: function() {
	    this.$el.html(userlist({persons:this.collection.toJSON()}));
	    return this;
	},
	
	unassign: function(event) {
	    var self = this;
	    var cancelledUser = this.collection.get($(event.target).data('id'));
	    cancelledUser.partyId = this.collection.partyId;
	    cancelledUser.destroy({
		success: this.notify,
		error: this.error
	    });
	},

	notify: function(model, options) {
	    var message = {
		title: 'Success',
		text: "User " + model.get('name') + " successfully removed from parcipitants list."
	    };
	    vent.trigger('notify', message);
	    vent.trigger('changeParty', parties.at(0));
	    this.collection.remove(model);
	    this.render();
	},

	alert: function(model, xhr, options) {
	    var message = {
		title: "Failure (Something went wrong in server)!",
		text: "Your assignment request failed because: " + xhr.responseText
	    }
	    vent.trigger('alert', message);
	}
    });

    var Constructors_List = User_List.extend({
	collection: auxUsers,
	filterRules: {type: 'const'},

	render: function(){
	    this.$el.html(userlist({persons: new bb.Collection().add(this.collection.where(this.filterRules)).toJSON()})); //TODO please kill me now
	    return this;
	}
    });

    var Cleaners_List = Constructors_List.extend({
	filterRules: {type: 'clean'}
    });

    //TODO refactor to use maybe subviews for each models 
    var Nakki_List = bb.View.extend({
	events: {
	    'click .editor' : 'edit',
	    'click .setter' : 'saveCollection',
	    'click .creator' : 'create',
	    'click .deletor' : 'delete'
	},

	initialize: function(){
	    _.bindAll(this);
	    vent.on('changeParty', this.refresh);
	    this.collection.on('add', this.edit);
	    this.collection.on('remove', this.edit);
	    vent.on('detach', this.remove);
	    this.render();
	},
	
	refresh: function(partyId) {
	    var self = this;
	    this.model = parties.get(partyId);

	    this.collection.partyId = this.model.get('id');
	    this.collection.fetch({
		success: this.render, 
		
		error: function() {
		    self.collection.reset();
		    self.$el.html(nakkilist({nakit:{}}));
		}
	    });
	},

	render: function(){
	    this.$el.html(nakkilist({nakit:this.collection.toJSONWithClientID(), party: this.model.toJSON()}));
	    return this;
	},

	create: function(){
	    nakkitypes.add(new models.Nakkitype({type:'<define type>'}));
	},

	edit: function(){
	    this.$el.html(nakkilist_edit({nakkitypes:this.collection.toJSONWithClientID(), party: this.model.toJSON() }));
	    $('.time-picker',this.$el).timepicker({
		showMeridian: false,
		showSeconds: false,
		minuteStep: 60
	    });
	    return this;
	},

	delete: function(target){
	    var self = this;
	    var removeId = target.currentTarget.attributes['value'].nodeValue;
	    var model = this.collection.get(removeId);
	    model.destroy({
		wait:true,
		
		success: function() {
		    self.notify();
		    self.render();
		},
		
		error: this.alert 
	    });
	    return false;
	},
	
	parseSlotFromTime: function(timeString, date) {
	    var time = timeString.split(":");
	    return (Number(time[0]) + 24 - date.getHours()) % 24;
	},

	parseData: function(data) {
	    data.start = this.parseSlotFromTime(data.start, this.model.get('date')); 
	    data.end = this.parseSlotFromTime(data.end, this.model.get('date'));
	    return data;
	},

	saveCollection: function() {
	    var self = this;
	    //TODO here we would reset whole collection based on input of the edit table.
	    $('#nakit form').each(function() {
		var arr = $(this).serializeArray();
		var data = _(arr).reduce(function(acc, field) {
		    acc[field.name] = field.value;
		    return acc;
		}, {});
		var model = self.collection.get(data["cid"]);
		delete data['cid'];
		model.save(self.parseData(data), {
		    success: self.notify,
		    error: self.alert
		});
	    });
	    var errors = _.reduce(this.collection.models, function(memo, model) {
		if (!!model.validationError) {
		    memo[model.cid] = model.validationError;
		};
		return memo;
	    }, {});
	    if (!_.isEmpty(errors)) {
		_.each(_.keys(errors), function(el) {
		    var message = {
			title: "Validation failed in nakkitype id=" + el,
			text: errors[el]
		    };
		    vent.trigger('alert', message);
		});
	    } else {
		this.render();
	    }
	},

	notify: function(model, options) {
	    var message = {
		title: 'Success',
		text: "Nakki " + model.get('type') + " successfully created/modified/removed."
	    };
	    vent.trigger('notify', message);
	    vent.trigger('changeParty', parties.at(0));
	    this.render();
	},

	alert: function(model, xhr, options) {
	    var message = {
		title: "Failure in nakkitype "+ model.get('type') + " (Something went wrong in server)!",
		text: "Your assignment request failed because: " + xhr.responseText
	    }
	    vent.trigger('alert', message);
	}
    });
    
    var Party_Viewer = bb.View.extend({
	events: {
	    'change .selector' : 'select',
	    'click .editor'    : 'edit',
	    'submit'           : 'save',
	    'click .cancel'    : 'render',
	},
	
	initialize: function(){
	    _.bindAll(this);
	    vent.on('changeParty', this.select);
	    vent.on('createdParty', this.creationEdit);
	    vent.on('detach', this.remove);
	    this.listenTo(this.model, 'invalid', this.notifyValidity);
	    this.render();
	},

	changeModel: function(newModel) {
	    this.stopListening(this.model);
	    this.model = newModel;
	    this.listenTo(this.model, 'invalid', this.notifyValidity);
	},

	notifyValidity: function() {
	    var message = {
		title: "Party edit validation",
		text: "Input is invalid, " + this.model.validationError
	    }
	    vent.trigger('alert', message);
	},
	
	render: function(){
	    this.$el.html(party_description({party: this.model.toJSON(), editable: true}));
	    return this;
	},

	select: function(partyId) {
	    this.model = parties.get(partyId);
	    this.render();
	},

	edit: function() {
	    this.$el.html(party_edit({party:this.model.toJSON()}));
	    $('.datepicker', this.$el).datepicker({
		startDate: new Date(),
		autoclose: true
	    });
	    $('.timepicker', this.$el).timepicker({
		showMeridian: false,
		showSeconds: false,
		minuteStep: 30
	    });
	},

	creationEdit: function(partyId){
	    this.changeModel(parties.get(partyId));
	    this.edit();
	},
	
	//todo move to time/date parsing module
	parseData: function(data) {
	    var parseDate = function(dateString, timeString) {
		var date = new Date(dateString);
		var time = timeString.split(":");
		date.setHours(time[0]);
		date.setMinutes(time[1]);
		return date;
	    };

	    var parsed = {};
	    parsed.title = data.title;
	    parsed.description = data.description;
	    parsed.date = parseDate(data.date, data.startTime);
	    parsed.infoDate = parseDate(data.date, data.infoTime);
	    
	    return parsed;
	},

	save: function() {
	    var arr = this.$("#edit_party").serializeArray();
	    var input_data = _(arr).reduce(function(acc, field) {
		acc[field.name] = field.value;
		return acc;
	    }, {});
	    var data = this.parseData(input_data);
	    this.model.save(data, {
		success: this.notify, 
		error: this.alert,
		wait:true
	    });
	    return false;
	},

	notify: function(model, options) {
	    var message = {
		title: 'Success',
		text: "Party " + model.get('title') + " successfully modified."
	    };
	    vent.trigger('notify', message);
	    vent.trigger('partyEdited', model.get('title'));
	    this.render();
	},

	alert: function(model, xhr, options) {
	    var message = {
		title: "Failure in Party modification "+ model.get('title') + " (Something went wrong in server)!",
		text: "Your request failed because: " + xhr.responseText
	    }
	    vent.trigger('alert', message);
	}
    });

    var initialize = function(options) {
	var latestParty;
	var rootel = options.el;
	rootel.html(adminScreen);
	vent.off(); //hard reset!

	new NotificationArea({el: $('#admin-alert-area', rootel)});

	parties.fetch( {
	    success: function() {
		//TODO remove this stuff
		if (parties.length > 0) {
		    latestParty = parties.at(0);
		    users.partyId = latestParty.get('id');
		    auxUsers.partyId = latestParty.get('id');
		    nakkitypes.partyId = latestParty.get('id');
		    
		    var _ready = _.after(3, function(){
			new Party_Selector({el: $('#party-selector',rootel), selected: latestParty.title});
			new Party_Viewer({el: $('#party', rootel), model: latestParty});
			new Nakki_List({el: $('#nakit', rootel), model: latestParty, collection: nakkitypes});

			new Constructors_List({el: $('#constructors', rootel)});
			new User_List({el: $('#users', rootel)});
			new Cleaners_List({el: $('#cleaners', rootel)});
		    });

		    auxUsers.fetch({success: _ready, error: _error}); 
		    users.fetch({success: _ready, error: _error}); 
		    nakkitypes.fetch({success: _ready, error: _error}); 
		} else {
		    new Party_Selector({el:$('#party-selector',rootel)});
		    new Party_Viewer({el:$('#party',rootel), model: new models.Party({title:'No parties yet'})});
		    new Nakki_List({el:$('#nakit',rootel), model: latestParty, collection: nakkitypes});
		    new User_List({el:$('#users',rootel)});
		}
	    },
	    error: _error
	});
    };

    return { 
	initialize: initialize,
	detach: function() {
	    vent.trigger('detach');
	}
    };
});
