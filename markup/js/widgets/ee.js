define(["jquery","knockout"],function($,ko) {

	var EE = function(options) {
		this.eventEmitter = options.eventEmitter;
	}

	EE.prototype.send = function(eventName,options) {
		this.eventEmitter.emit(eventName,options);
	}

	return EE;
});