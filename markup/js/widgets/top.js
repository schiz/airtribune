define(["jquery","knockout","EventEmitter"],function($,ko,EventEmitter) {

	var Slide = function(options) {
		this.img = ko.observable(options.img);
		this.thumb = ko.observable(options.thumb);
		this.alt = ko.observable(options.alt);
		this.content = ko.observable(options.content);
		this.copyright = ko.observable(options.copyright);
		this.copyrightLink = ko.observable(options.copyrightLink);
	}

	var Top = function(options) {
		var self = this;
		this.eventEmitter = options.eventEmitter;
		this.dataProvider = options.dataProvider;

		this.type = ko.observable(options.type);
		this.id = ko.observable(options.id);
		this.collapsed = ko.observable(options.collapsed);
		this.mapTitle = ko.observable();
		this.carouselInterval = ko.observable(options.carouselInterval||3000);
		this.slides = ko.observableArray();
		this.slideId = ko.observable();
		this.isReady = ko.observable(false);

		this.eventEmitter.on("top.setType",function(type) {
			self.type(type);
		})
		this.eventEmitter.on("top.setId",function(id) {
			self.id(id);
		});
		this.eventEmitter.on("top.setTypeId",function(str) {
			var ar = str.split(/\|/);
			self.type(ar[0]);
			self.id(ar[1]);
		});

		this.reinitTimeout = null;
		this.reinitRun = ko.computed(function() {
			var type = self.type(), id = self.id();
			if (self.isReady()) {
				self.reinitTimeout && clearTimeout(self.reinitTimeout);
				self.reinitTimeout = setTimeout(function() {
					self.reinitTopWidget();
				},0);
			}
		});

		this.on("domReady",function() {
			self.isReady(true);
			self.reinitTopWidget();
		});
	}

	Top.prototype.reinitTopWidget = function() {
		if (this.prevType!=this.type()) {
			if (this.type() == "map") this.initMap();
			else if (this.type() == "carousel") this.initCarousel();
	 		this.prevType = this.type();
		}
		else {
			if (this.type() == "map") this.updateMap();
			else if (this.type() == "carousel") this.updateCarousel();
		}
	}

	Top.prototype.initMap = function() {
		var self = this;
		require(["gmaps"],function(gmaps) {
			self.gmaps = gmaps;
			self.map = new self.gmaps.Map($(".top-map").get(0));
			self.initCustomInfoWindow();
			self.infoWindow = new self.CustomInfoWindow();
			self.map.setOptions({
				mapTypeControl: false,
				panControl: false,
				zoomControl: false,
				streetViewControl: false,
				mapTypeId: "terrain",
				zoom: 8,
				center: new self.gmaps.LatLng(20,20),
				scrollwheel: false
			});
			gmaps.event.addListenerOnce(self.map,"idle",function() {
				self.updateMap();
			});
			gmaps.event.addListener(self.map,"click",function() {
				self.infoWindow.close();
			});
			gmaps.event.addListenerOnce(self.map,"mousedown",function() {
				self.map.setOptions({scrollwheel:true});
			});
		});
	}

	Top.prototype.initCustomInfoWindow = function() {
		if (!this.gmaps) return;
		this.CustomInfoWindow = function() {
			var self = this;
			this.$container = $("<div class='map-eventList-info-window'></div>");
			this.$content = $("<div class='map-info-content'></div>").appendTo(this.$container);
			this.$arrow = $("<div class='map-info-arrow'></div>").appendTo(this.$container);
			// this.$close = $("<a class='map-info-close'>&times;</a>").appendTo(this.$container).click(function() {
			// 	self.close();
			// }); 
			this.container = this.$container.get(0);
		}
		this.CustomInfoWindow.prototype = new this.gmaps.OverlayView();
		this.CustomInfoWindow.prototype.onAdd = function() {
			this.layer = this.getPanes().floatPane;
			this.layer.appendChild(this.container);
		}
		this.CustomInfoWindow.prototype.draw = function() {
			var yOffset = 5;
			var mapW = this.map.getDiv().offsetWidth;
			var mapH = this.map.getDiv().offsetHeight;
			var iconW = this.marker.getIcon().scaledSize.width;
			var iconH = this.marker.getIcon().scaledSize.height;
			var boundsW = this.container.getBoundingClientRect().width;
			var boundsH = this.container.getBoundingClientRect().height;
			var p = this.getProjection().fromLatLngToContainerPixel(this.marker.getPosition());
			var yPosition = 2*p.y<mapH?"top":"bottom";
			var xPosition = 2*p.x<mapW?"left":"right";
			var p = this.getProjection().fromLatLngToDivPixel(this.marker.getPosition());
			this.$container.removeClass("map-eventList-top map-eventList-bottom map-eventList-left map-eventList-right");
			this.$container.addClass("map-eventList-"+xPosition+" map-eventList-"+yPosition);
			if (yPosition=="top") this.container.style.top = p.y+yOffset+"px";
			else this.container.style.top = p.y-boundsH-iconH-yOffset+"px";
			this.container.style.left = p.x-parseInt(boundsW/2)+"px";
		}
		this.CustomInfoWindow.prototype.onRemove = function() {
			this.layer.removeChild(this.container);
		}
		this.CustomInfoWindow.prototype.setContent = function(content) {
			this.$content.empty().append(content);
		}
		this.CustomInfoWindow.prototype.open = function(map,marker) {
			this.marker = marker;
			this.setMap(map);
		}
		this.CustomInfoWindow.prototype.close = function() {
			this.setMap(null);
		}
	}

	Top.prototype.updateMap = function() {
		var self = this;
		if (!this.map || !this.gmaps) return;
		if (this.mapEvents) {
			this.mapEvents.forEach(function(mapEvent) {
				mapEvent.marker && mapEvent.marker.setMap(null);
			});
		}
		this.mapEvents = [];
		this.infoWindow.close();
		var data = this.dataProvider.get("eventLists",this.id());
		this.mapTitle(data.title);
		var bounds = new this.gmaps.LatLngBounds();
		data.content.forEach(function(item) {
			var position = new self.gmaps.LatLng(item.lat,item.lon);
			var marker = new self.gmaps.Marker({
				map: self.map,
				position: position,
				title: item.title,
				icon: {
					url: "http://a08.rag.lt/img/map_marker.png",
					size: new self.gmaps.Size(14,18),
					scaledSize: new self.gmaps.Size(14,18)
				}
			});
			self.gmaps.event.addListener(marker,"click",function() {
				if (self.infoWindow) {
					self.infoWindow.setContent("<a href='"+item.url+"'><h5>"+item.title+"</h5>"+item.dates+"<br>"+item.location+"</a>");
					self.infoWindow.open(self.map,marker);
				}
			});
			var mapEvent = {
				marker: marker,
				data: item
			}
			bounds.extend(position);
			self.mapEvents.push(mapEvent);
		});
		this.map.fitBounds(bounds);
	}

	Top.prototype.initCarousel = function() {
		this.updateCarousel();
	}

	Top.prototype.updateCarousel = function() {
		var data = this.dataProvider.get("carousels",this.id());
		var ar = [];
		data.forEach(function(rw) {
			ar.push(new Slide(rw));
		});
		this.slideId(0);
		this.slides(ar);
		this.runCarousel();
	}

	Top.prototype.runCarousel = function() {
		var self = this;
		if (this.carouselTimeout) clearTimeout(this.carouselTimeout);
		this.carouselTimeout = setTimeout(function() {
			var i = self.slideId()+1;
			if (i>=self.slides().length) i = 0;
			self.slideId(i);
			self.runCarousel();
		},self.carouselInterval());
	}

	Top.prototype.switchCollapse = function() {
		this.collapsed(!this.collapsed());
	}

	return Top;
})