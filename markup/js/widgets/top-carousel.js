define(["jquery","knockout"],function($,ko) {

	var TopCarousel = function(options) {
		var self = this;
		this.options = options;
		this.eventEmitter = options.eventEmitter;
		this.collapsed = ko.observable(false);
		this.currentSlideId = ko.observable(0);
		this.slidesCnt = $(options.domNode).find(".item").length;
		this.runSlideShow();

		this.eventEmitter.on("top-carousel.expand",function() {
			self.collapsed(false);
		});
		this.eventEmitter.on("top-carousel.collapse",function() {
			self.collapsed(true);
		});
		this.eventEmitter.on("top-carousel.switchNext",function() {
			self.runSlideShow();
		});
	}

	TopCarousel.prototype.switchCollapse = function() {
		this.collapsed(!this.collapsed());
	}

	TopCarousel.prototype.runSlideShow = function() {
		var self = this;
		this._runTimeout && clearTimeout(this._runTimeout);
		var i = this.currentSlideId() + 1;
		if (i >= this.slidesCnt) i = 0;
		this.currentSlideId(i);
		this._runTimeout = setTimeout(function() {
			self.runSlideShow();
		},this.options.slideShowTimeout||3000);
	}

	return TopCarousel;
})