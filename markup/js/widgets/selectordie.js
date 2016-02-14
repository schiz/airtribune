define(["jquery","knockout","selectordie"],function($,ko) {

	var Selectordie = function(options) {
		var self = this;
		this.options = options;
		this.eventEmitter = options.eventEmitter;
		this.placeholder = this.options.placeholder || 'default';
		this.size = this.options.size || 10;

		// console.log( $(this.options.domNode) );

		this.on("domReady",function() {
			self.isReady = true;
			self.init();
		});

	}

	Selectordie.prototype.init = function() {

		$(this.options.domNode).selectOrDie({
      customClass:    "custom",
      // customID:       "custom",
      placeholder:    this.placeholder,
      size:           this.size
    });
    
	}

	return Selectordie;
});