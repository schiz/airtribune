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

	var Slide = function(options) {
		var self = this;
		this.id = ko.observable(0);
		this.img = ko.observable(options.img);
		this.thumb = ko.observable(options.thumb);
		this.alt = ko.observable(options.alt);
		this.content = ko.observable(options.content);
		this.copyright = ko.observable(options.copyright);
		this.copyrightLink = ko.observable(options.copyrightLink);
		this.isVideo = ko.computed(function() {
			return /youtube.com|vimeo.com/.test(self.img());
		});
		this.isVimeo = ko.computed(function() {
			return /vimeo.com/.test(self.img());
		});
		this.isYoutube = ko.computed(function() {
			return /youtube.com/.test(self.img());
		});
	}

	var Carousel = function(options) {
		var self = this;
		this.domNode = options.domNode;
		this.eventEmitter = options.eventEmitter;
		this.dataProvider = options.dataProvider;
		this.widgetId = options.widgetId || "carousel";
		this.id = ko.observable(options.id);
		this.isReady = ko.observable(false);
		this.offset = options.offset || 118+234;
		this.step = options.step || 234;
		this.lightboxPic = ko.observable();

		this.imgs = ko.computed(function() {
			var out = [];
			var data = self.dataProvider.get("carousels",self.id());
			data.forEach(function(img) {
				var slide = new Slide(img);
				slide.id(out.length);
				out.push(slide);
			});
			return out;
		});

		this.imgIndex = ko.observable(-2);
		this.carouselImgs = ko.computed(function() {
			var out = [], l = self.imgs().length;
			for (var ii=self.imgIndex(); ii<self.imgIndex()+l; ii++) {
				var i = ii;
				while (i >=l) i-=l;
				while (i < 0) i+=l;
				out.push(self.imgs()[i]);
			}
			return out;
		});

		this.lineOffset = ko.observable();
		this.lineOffset.subscribe(function(v) {
			if (self.line) {
				self.line.css("left",-v+"px");
			}
		});

		this.eventEmitter.on(this.widgetId+".setId",function(id) {
			self.id(id);
		});
		this.eventEmitter.on(this.widgetId+".openNextPic",function() {
			var id = self.lightboxPic().id()+1;
			if (id>=self.imgs().length) id = 0;
			self.openPic(self.imgs()[id]);
			self.moveForward();
		});
		this.eventEmitter.on(this.widgetId+".openPrevPic",function() {
			var id = self.lightboxPic().id()-1;
			if (id<0) id = self.imgs().length-1;
			self.openPic(self.imgs()[id]);
			self.moveBack();
		});

		this.on("domReady",function() {
			self.container = $(options.domNode).find(".carousel");
			self.line = $(options.domNode).find(".carousel-line");
			self.lineOffset(this.offset);
		});

		this.isReady(true);
	}

	Carousel.prototype.moveBack = function() {
		var self = this;
		if (this.disableClick) return;
		this.disableClick = true;
		this.imgIndex(this.imgIndex()-1);
		this.lineOffset(this.offset+this.step);
		this.runAnim(function() {
			self.disableClick = false;
		});
	}

	Carousel.prototype.moveForward = function() {
		var self = this;
		if (this.disableClick) return;
		this.disableClick = true;
		this.imgIndex(this.imgIndex()+1);
		this.lineOffset(this.offset-this.step);
		this.runAnim(function() {
			self.disableClick = false;
		});
	}

	Carousel.prototype.runAnim = function(callback) {
		var self = this;
		requestAnimationFrame(function() {
			if (self.lineOffset() != self.offset) {
				var dt = (new Date).getTime();
				if (self.prevDt) {
					var s = Math.floor((dt-self.prevDt)/300*self.step);
					if (Math.abs(self.lineOffset()-self.offset)<s) self.lineOffset(self.offset);
					else if (self.lineOffset()>self.offset) self.lineOffset(self.lineOffset()-s);
					else if (self.lineOffset()<self.offset) self.lineOffset(self.lineOffset()+s);
				}
				self.prevDt = dt;
				self.runAnim(callback);
			}
			else {
				self.prevDt = null;
				callback && callback();
			}
		});
	}

	Carousel.prototype.openPic = function(data) {
		var self = this;
		this.lightboxPic(data);
		this.eventEmitter.emit("lightbox.open",{
			img: data,
			next: {
				enabled: true,
				click: function() {
					self.eventEmitter.emit(self.widgetId+".openNextPic");
				}
			},
			prev: {
				enabled: true,
				click: function() {
					self.eventEmitter.emit(self.widgetId+".openPrevPic");
				}
			},
			close: {
				click: function() {
					self.lightboxPic(null);
				}
			}
		});
	}

	return Carousel;
});