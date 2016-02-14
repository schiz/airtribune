define(["jquery","knockout"],function($,ko) {

	var DropdownMenu = function(options) {
		var self = this;
		this.options = options;
		this.eventEmitter = options.eventEmitter;
		this.show = ko.observable(false);

		this.parentEl = $(options.domNode).find(".dd-parent");
		this.itemEl = this.parentEl.next();
		this.widthItemClass = this.itemEl.data('widthEl');
		this.widthItemEl = $(options.domNode).find(this.widthItemClass);
		if ( this.widthItemEl == null || !this.widthItemEl.length ) this.widthItemEl = $(this.widthItemClass);

		this.itemWidth = this.widthItemEl.outerWidth();
		this.heightItem = 0;
		this.setStyle();


		this.eventEmitter.addListener("dropdown-menu-collapse-all", function (obj) {
		  if (obj != self.options.domNode) {
		  	self.setCollapse();
		  }
		});

		$('body').click(function (e) {
	    var parentEl = self.parentEl;
	    var itemEl = self.itemEl;

	    if ( e.target != parentEl[0] && $(options.domNode).has(e.target).length === 0 ){
        self.show(false);
      	self.itemEl.height(0);
	    }
		});

	}



	DropdownMenu.prototype.switchCollapse = function() {

		this.show(!this.show());
		if (this.show()) {
			this.eventEmitter.emitEvent('dropdown-menu-collapse-all', [this.options.domNode]);
			this.heightItem = this.itemEl.find('.dd-item-content-inner').outerHeight();
			this.itemEl.height(this.heightItem);
		} else {
			this.itemEl.height(0);
		}

	}



	DropdownMenu.prototype.setCollapse = function() {

		if ( this.show() ) {
			this.show(false);
			this.itemEl.height(0);
		}

	}



	DropdownMenu.prototype.setStyle = function() {
		var self = this;

		var newWidth = this.itemWidth - (2 * 10);

		var relativeOffset = 0;
		var parentOffsetLeft = this.parentEl.offset().left;
		var widthItemOffsetLeft = this.widthItemEl.offset().left;
		if (parentOffsetLeft != widthItemOffsetLeft) {
			relativeOffset = widthItemOffsetLeft - parentOffsetLeft;
		}

		this.itemEl.width(newWidth);
		this.itemEl.css('left', relativeOffset + 10);

	}

	return DropdownMenu;
})
