define(["jquery","knockout","EventEmitter"],function($,ko,EventEmitter) {

	var requestAnimFrame = (function() {
	    return window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame || 
        window.oRequestAnimationFrame || 
        window.msRequestAnimationFrame || 
        function(/* function */ callback, /* DOMElement */ element) {
            return window.setTimeout(callback,1000/60);
        };
	})();

	var Lightbox = function(options) {
		var self = this;
		this.domNode = options.domNode;
		this.eventEmitter = options.eventEmitter;
		this.dataProvider = options.dataProvider;
		this.prevEnabled = ko.observable(false);
		this.nextEnabled = ko.observable(false);
		this.img = ko.observable();
		this.isReady = ko.observable(true);
		this.isVisible = ko.observable(false);
		this.isLoading = ko.observable(false);

		this._defaultImgWidth = 800;
		this._defaultImgHeight = 600;

		this.imgWidth = ko.observable(this._defaultImgWidth);
		this.imgHeight = ko.observable(this._defaultImgHeight);
		this.containerTop = ko.observable();
		this.containerLeft = ko.observable();

		this._prevClick = null;
		this._nextClick = null;
		this._closeClick = null;

		this.on("domReady",function() {
			var ar = self.recalcImageSize(self.imgWidth(),self.imgHeight());
			self.imgWidth(ar.width);
			self.imgHeight(ar.height);
			self.recalcPosition();
		});

		this.eventEmitter.on("lightbox.open",function(data) {
			if (data.img) {
				self.isVisible(true);
				self.isLoading(true);
				if (data.img.isVimeo() || data.img.isYoutube()) {
					if (data.img.isVimeo())
						var ar = self.recalcImageSize(640,390);
					else if (data.img.isYoutube())
						var ar = self.recalcImageSize(640,360);
					self.animImageSize(ar,function() {
						self.isLoading(false);
						self.setData(data);
					});
				}
				else if (!data.img.isVideo()) {
					setTimeout(function() {
						self.recalcPosition();
					},0);
					var img = document.createElement("img");
					img.onload = function() {
						var ar = self.recalcImageSize(this.width,this.height);
						self.animImageSize(ar,function() {
							self.isLoading(false);
							self.setData(data);
						});
					}
					img.onerror = function() {
						self.isLoading(false);
						self.setData(data);
						var ar = self.recalcImageSize(800,600);
						self.animImageSize(ar,function() {
							self.isLoading(false);
							self.setData(data);
						});
					}
					img.src = data.img.img();
				}
			}
		});

	}

	Lightbox.prototype.recalcPosition = function() {
		var self = this;
			var c = $(self.domNode).find(".lightbox-window");
			var left = parseInt(($(window).width()-c.outerWidth())/2);
			var top = parseInt(($(window).height()-c.outerHeight())/2);
			self.containerTop(top);
			self.containerLeft(left);
	}

	Lightbox.prototype.recalcImageSize = function(w,h) {
		w = parseInt(w);
		h = parseInt(h);
		var maxW = $(window).width()-50;
		var maxH = $(window).height()-100;
		if (isNaN(w) || isNaN(h) || !w || !h) return {width:0,height:0};
		if (w<=maxW && h<=maxH) return {width:w,height:h};
		if (w/h<maxW/maxH) return {width:parseInt(maxH/h*w),height:maxH};
		else return {width:maxW,height:parseInt(maxW/w*h)};
	}

	Lightbox.prototype.runAnim = function(size,stepW,stepH,callback) {
		var self = this;
		requestAnimFrame(function() {
			if (self.imgWidth()!=size.width || self.imgHeight()!=size.height) {
				var dt = (new Date).getTime();
				if (self.prevDt) {
					var sw = Math.floor((dt-self.prevDt)/500*stepW);
					var sh = Math.floor((dt-self.prevDt)/500*stepH);
					if (Math.abs(self.imgWidth()-size.width)<Math.abs(sw) || Math.abs(self.imgHeight()-size.height)<Math.abs(sh)) {
						self.imgWidth(size.width);
						self.imgHeight(size.height);
					}
					else {
						self.imgWidth(self.imgWidth()+sw);
						self.imgHeight(self.imgHeight()+sh);
					}
				}
				self.prevDt = dt;
				self.recalcPosition();
				self.runAnim(size,stepW,stepH,callback);
			} else {
				self.prevDt = null;
				callback();
			}
		});
	}

	Lightbox.prototype.animImageSize = function(size,callback) {
		var stepW = size.width-this.imgWidth();
		var stepH = size.height-this.imgHeight();
		this.runAnim(size,stepW,stepH,callback);
	}

	Lightbox.prototype.setData = function(data) {
		this.img(data.img||null);
		this.prevEnabled(data.prev?data.prev.enabled:false);
		this.nextEnabled(data.next?data.next.enabled:false);
		this._prevClick = data.prev?data.prev.click:null;
		this._nextClick = data.next?data.next.click:null;
		this._closeClick = data.close?data.close.click:null;
	}

	Lightbox.prototype.next = function() {
		if (this.nextEnabled() && this._nextClick) this._nextClick(this);
	}

	Lightbox.prototype.prev = function() {
		if (this.prevEnabled() && this._prevClick) this._prevClick(this);
	}

	Lightbox.prototype.close = function() {
		if (this._closeClick) this._closeClick(this);
		this.isVisible(false);
		this.img(null);
		this.nextEnabled(false);
		this.prevEnabled(false);
	}

	return Lightbox;
});