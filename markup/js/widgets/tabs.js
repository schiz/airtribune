define(["jquery","knockout"],function($,ko) {

	var Tabs = function(options) {
		var self = this;
		this.options = options;
		this.eventEmitter = options.eventEmitter;
		this.currentRel = ko.observable();

		ko.utils.registerEventHandler($(options.domNode).find(".tabs > li"), 'click', function (e) {
	    var currentRel = $(e.target).attr('rel');
	    var topData = $(e.target).data('top');

	    topData && self.emitTopWiget(topData);
	    self.switchTab( currentRel );
	    // self.currentRel.valueHasMutated();
		});

		if(this.options.active) {
			// this.switchTab( this.options.active );
			// $(options.domNode).find(".tabs > li[rel='"+this.options.active+"']").trigger( "click" );
			var activeEl = $(options.domNode).find(".tabs > li[rel='"+this.options.active+"']");
			ko.utils.triggerEvent(activeEl[0], 'click');
		}

	}

	Tabs.prototype.emitTopWiget = function(params) {
		this.eventEmitter.emitEvent('top.setTypeId', [params]);
	}

	Tabs.prototype.getRel = function(el) {
		return el.attr('rel');
	}

	Tabs.prototype.switchTab = function(id) {
		this.currentRel( id );
	}

	return Tabs;
})
