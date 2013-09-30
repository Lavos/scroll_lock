(function(){
	var ScrollLock = function ScrollLock (params) {
		var self = this;

		var defaults = {
			element: $(),
			barrier: null,
			barrier_padding: 0,
			padding: 0,
			enabled: false,
		};

		_.extend(self.options = {}, defaults, params);

		self.$element = self.options.element.addClass('scroll-lock');
		self.$parent = self.$element.offsetParent();
		self.$scroller = $(document);

		if (self.options.barrier) {
			self.$barrier = self.options.barrier;
		};

		self.enabled = false;
		self.attachment = 'top';
		self.original_position = 0;
		self.handler = null;

		if (self.options.enabled) {
			self.setEnabled(true);
		};
	};

	__.augment(ScrollLock, __.PubSubPattern);
	ScrollLock.prototype.global_name = 'scroll_lock';

	ScrollLock.prototype.setEnabled = function setEnabled (enabled) {
		var self = this;

		if (self.enabled !== enabled) {
			self.enabled = enabled;
			self.fire('enable_change', self.enabled);

			if (enabled) {
				self.fire('enable');
				self.handler = function(){ self.handleScroll(); };
				self.$scroller.on('scroll', self.handler);
				self.$element.addClass('scroll-lock-enabled');
				self.handleScroll();
			} else {
				self.fire('disable');
				if (self.handler) {
					self.$scroller.off('scroll', self.handler);
					self.handler = null;
				};

				self.$element.removeClass('scroll-lock-enabled');
				self.setAttachment('top');
			};
		};
	};

	ScrollLock.prototype.handleScroll = function () {
		var self = this;

		/* console.log('pageYOffset', pageYOffset);
		console.log('parent top', self.$parent.offset().top);
		console.log('position', self.$parent.offset().top - self.options.padding); */

		if (pageYOffset >= self.$parent.offset().top - self.options.padding) {
			if (self.$barrier && self.$barrier.offset().top - pageYOffset <= self.options.padding + self.$element.outerHeight()) {
				self.setAttachment('bottom');
			} else {
				self.setAttachment('fixed');
			};
		} else if (pageYOffset <= self.$parent.offset().top - self.options.padding) {
			self.setAttachment('top');
		};
	};

	ScrollLock.prototype.setAttachment = function setAttachment (attachment) {
		var self = this;

		if (self.attachment !== attachment) {
			self.fire('attachment_change', self.attachment);
			self.attachment = attachment;

			switch (self.attachment) {

			case 'top':
				self.$element.css({
					'position': '',
					'top':	'',
				});

				self.$element.addClass('scroll-lock-attachment-top');
			break;

			case 'fixed':
				self.$element.css({
					'position': 'fixed',
					'top':	self.options.padding,
				});

				self.$element.addClass('scroll-lock-attachment-fixed');
			break;

			case 'bottom':
				self.$element.css({
					'position': 'absolute',
					'top': self.$barrier.offset().top - self.$parent.offset().top - self.$element.outerHeight() - self.options.barrier_padding
				});

				self.$element.addClass('scroll-lock-attachment-bottom');
			break;

			};
		};
	};

	this.provide('Constructors.ScrollLock', ScrollLock);
}).call(this['LUCID'] = this['LUCID'] || new __.ModularNamespace());
