define(["jquery"],function($) {

	// Эта штука нужна, чтобы в будущем делать запросы за данными, которых не оказалось в кеше
	// Типа если есть данные в DataProvider - отдаем их, нет - запрашиваем, сохраняем себе и отдаем

	var DataProvider = function(startData) {
		this.data = $.extend({},startData);
		this.prepare();
	}

	DataProvider.prototype.prepare = function() {
		var getDateString = function(date1,date2) {
			var m = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(/ /);
			var ar1 = date1.split(/-/);
			var ar2 = date2.split(/-/);
			if (ar1[0]==ar2[0] && ar1[1]==ar2[1]) {
				return ar1[2] + " - " + ar2[2] + " " + m[parseInt(ar1[1])-1] + ", " + ar1[0];
			}
			else if (ar1[0]==ar2[0]) {
				return ar1[2] + " " + m[parseInt(ar1[1])-1] + " - " + ar2[2] + " " + m[parseInt(ar2[1])-1] + ", " + ar1[0];
			}
			else {
				return ar1[2] + " " + m[parseInt(ar1[1]-1)] + ", " + ar1[0] + " - " + ar2[2] + " " + m[parseInt(ar2[1])-1] + ", " + ar2[0];
			}
		}

		if (this.data.eventLists) {
			for (var i in this.data.eventLists) {
				if (this.data.eventLists.hasOwnProperty(i)) {
					for (var eventId in this.data.eventLists[i].content) {
						if (this.data.eventLists[i].content.hasOwnProperty(eventId)) {
							var rw = this.data.eventLists[i].content[eventId];
							rw.dates = getDateString(rw.start_time,rw.end_time);
							rw.location = rw.city + ", " + rw.country.name;
						}
					}
				}
			}
		}

		if (this.data.carousels) {
			for (var i in this.data.carousels) {
				if (this.data.carousels.hasOwnProperty(i)) {
					for (var slideId=0; slideId<this.data.carousels[i].length; slideId++) {
						var rw = this.data.carousels[i][slideId];
						rw.content = rw.alt;
					}
				}
			}
		}
	}

	DataProvider.prototype.get = function() {
		var out = this.data;
		for (var i = 0; i < arguments.length; i++) {
			if (typeof out == "object")
				out = out[arguments[i]];
			else return null;
		}
		return out;
	}

	return DataProvider;
});