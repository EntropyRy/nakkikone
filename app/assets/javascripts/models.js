define(['jquery','backbone'],function($,bb){

    var PartyResource = bb.Model.extend({
	partyId: 'noparties',
	resource: 'noresource',
	urlRoot: function() {
	     return 'parties/' + this.partyId + '/' + this.resource;
	}
    });

    var Person = PartyResource.extend({
	resource: 'parcipitant',

	defaults: {
	    name: "nakkilainen",
	    email: "nakki@email.com",
	    number: "0401234567"
	}
    });

    var Nakki = bb.Model.extend({
	defaults: {
	    assign: null,
	    type: null,
	    slot: null
	},

	parse: function(resp, options){
	    resp.assign = resp.assign && resp.assign.name;
	    return resp;
	}
    });

    var NakkiType = bb.Model.extend({
	defaults: {
	    type: "Name of Nakki",
	    start: 0,
	    end: 0
	},

	//TODO remove after UI refactoring
	toJSONWithClientID: function() {
	    data = this.toJSON();
	    data.cid = this.cid;
	    return data;
	}
    });

    var Party = bb.Model.extend({
	defaults: {
	    title: "Party title",
	    description: "Osallistumalla nakkiin pääset maksutta bileisiin",
	    date: new Date(),
	    infoDate: new Date()
	},

	//TODO remove after UI refactoring
	toJSONWithClientID: function() {
	    data = this.toJSON();
	    data.cid = this.cid;
	    return data;
	},

	parse: function(response, options) {
	    response.date = new Date(response.date);
	    response.infoDate = new Date(response.infoDate);
	    return response;
	}
    });

    return {
	Person: Person, 
	Nakkitype: NakkiType,
	Nakki: Nakki,
	Party: Party,
	PartyResource: PartyResource
    };
});
