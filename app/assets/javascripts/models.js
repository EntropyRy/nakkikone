define([
  'jquery',
  'backbone',
  'moment'
], function($, bb, moment) {

  var PartyResource = bb.Model.extend({
    partyId: 'noparties',
    resource: 'noresource',
    urlRoot: function() {
      return 'parties/' + this.partyId + '/' + this.resource;
    }
  });

  var Person = PartyResource.extend({
    resource: 'parcipitants',

    defaults: {
      name: "nakkilainen",
      email: "nakki@email.com",
      number: "0401234567",
      role: "user"
    }
  });

  var Nakki = bb.Model.extend({
    defaults: {
      assign: null,
      type: null,
      slot: null
    },

    parse: function(resp, options) {
      resp.assign = resp.assign && resp.assign.name;
      return resp;
    },

    validate: function(attr, options) {
      if (!attr['slot'] && attr['slot'] != 0) {
	return "Nakki slot is undefined";
      }
      if (!attr['type']) {
	return "Nakki type is undefined";
      }
      return null;
    }
  });

  var NakkiType = bb.Model.extend({
    defaults: {
      start_time: 0,
      end_time: 5,
      info: {}
    },

    //TODO remove after UI refactoring
    toJSONWithClientID: function() {
      var data = this.toJSON();
      data.cid = this.cid;
      return data;
    },

    validate: function(attr, options) {
      if ((!attr['start_time'] && attr['start_time'] != 0) || !attr['end_time']) {
	return "Range for nakkitype is invalid.";
      };
      if (attr['start_time'] >= attr['end_time']) {
	return "Range start can't be after ending.";
      };
      return null;
    }
  });

  var NakkitypeInfo = bb.Model.extend({
    defaults: {
      title: "Name of the nakki",
      description: "Nakin kuvaus tähän."
    },

    toJSONWithClientID: function() {
      var data = this.toJSON();
      data.cid = this.cid;
      return data;
    },

    validate: function(attr, options) {
      if (!attr['title']) {
	return "info type title is missing";
      }
      if (!attr['description']) {
	return "info type description is missing";
      }
      return null;
    }
  });

  var Party = bb.Model.extend({
    defaults: {
      title: "Party Title",
      description: "Osallistumalla nakkiin pääset maksutta bileisiin.",
      date: moment().add('days', 14).hours(22).minutes(0).toDate(),
      info_date: moment().add('days', 14).hours(21).minutes(0).toDate(),
      aux_jobs_enabled: true
    },

    //TODO remove after UI refactoring
    toJSONWithClientID: function() {
      var data = this.toJSON();
      data.cid = this.cid;
      return data;
    },

    parse: function(response, options) {
      response.date = new Date(response.date);
      response.info_date = new Date(response.info_date);
      return response;
    },

    validate: function(attr, options) {
      if (!attr['title']) {
	return "party title is missing";
      };
      if (!attr['date'] || !attr['info_date']) {
	return "Important dates are missing";
      }
      var title = attr['title'];
      if (title.match(/[./]/i)) {
	return "party title malformed (no dots(.) or slashes allowed(/))";
      };
      return null;
    }
  });

  var PartyFinder = Party.extend({
    defaults: {},

    urlRoot: '/parties/',

    url: function() {
      var id = this.get('title');
      return this.urlRoot + id;
    }
  });

  return {
    Person: Person,
    Nakkitype: NakkiType,
    NakkitypeInfo: NakkitypeInfo,
    Nakki: Nakki,
    Party: Party,
    PartyFinder: PartyFinder,
    PartyResource: PartyResource
  };
});
