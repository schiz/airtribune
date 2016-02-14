define(["jquery","knockout","EventEmitter","gmaps"],function($,ko,EventEmitter,gmaps) {

	var Minimap = function(options) {
		var self = this;
		this.eventEmitter = options.eventEmitter;
		this.dataProvider = options.dataProvider;
		this.id = ko.observable(options.id);
		this.isReady = ko.observable(false);
		this.eventEmitter.on("top.setId",function(id) {
			self.id(id);
		});
		this.reinitRun = ko.computed(function() {
			var id = self.id();
			if (self.isReady()) {
				self.reinit();
			}
		});
		this.on("domReady",function() {
			self.isReady(true);
			self.reinit();
		});
	}

	Minimap.prototype.reinit = function() {
		if (!this.map) this.initMap();
		else this.updateMap();
	}

	Minimap.prototype.initMap = function() {
		var self = this;
		this.map = new gmaps.Map($(".minimap").get(0));
		this.map.setOptions({
			mapTypeControl: false,
			panControl: false,
			zoomControl: false,
			streetViewControl: false,
			mapTypeId: "hybrid",
			zoom: 8,
			center: new gmaps.LatLng(20,20),
			scrollwheel: false
		});
		gmaps.event.addListenerOnce(self.map,"idle",function() {
			self.updateMap();
		});
		gmaps.event.addListenerOnce(self.map,"mousedown",function() {
			self.map.setOptions({scrollwheel:true});
		});
	}

	Minimap.prototype.updateMap = function() {
		var self = this;
		if (!this.map) return;
		if (this.mapMarkers) {
			this.mapMarkers.forEach(function(marker) {
				marker.setMap(null);
			});
		}
		this.mapMarkers = [];
		var data = this.dataProvider.get("minimap",this.id());
		var bounds = new gmaps.LatLngBounds();
		data.forEach(function(rw) {
			var position = new gmaps.LatLng(rw.lat,rw.lon);
			var marker = new gmaps.Marker({
				map: self.map,
				position: position,
				title: rw.title,
				icon: {
					url: "http://a08.rag.lt/img/map_marker.png",
					size: new gmaps.Size(14,18),
					scaledSize: new gmaps.Size(14,18)
				}
			});
			bounds.extend(position);
			self.mapMarkers.push(marker);
		});
		this.map.fitBounds(bounds);
	}

	return Minimap;
});