function LoadingViewModel() {
	var self = this;

	self.template = ko.observable('loading-template');

	self.load = function () {
		var opts = {
		  lines: 13 // The number of lines to draw
		, length: 0 // The length of each line
		, width: 34 // The line thickness
		, radius: 39 // The radius of the inner circle
		, scale: 2 // Scales overall size of the spinner
		, corners: 0 // Corner roundness (0..1)
		, color: '#6C9BD3' // #rgb or #rrggbb or array of colors
		, opacity: 0.25 // Opacity of the lines
		, rotate: 0 // The rotation offset
		, direction: 1 // 1: clockwise, -1: counterclockwise
		, speed: 1 // Rounds per second
		, trail: 60 // Afterglow percentage
		, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
		, zIndex: 2e9 // The z-index (defaults to 2000000000)
		, className: 'spinner' // The CSS class to assign to the spinner
		, top: '50%' // Top position relative to parent
		, left: '50%' // Left position relative to parent
		, shadow: false // Whether to render a shadow
		, hwaccel: false // Whether to use hardware acceleration
		, position: 'absolute' // Element positioning
		}
		var target = $('#spinner')[0];
		var spinner = new Spinner(opts).spin(target);
	};
}

function RaspiAdmin() {
	var self = this;

	self.viewmodel = ko.observable(new LoadingViewModel());
	self.settings  = {};

	self.load = function (done) {
		$.get({
			url: '/api/settings',
			success: function (data) {
				self.settings = data;

				self.viewmodel(new TimelapseViewModel(self.settings));
			},
			error: function (xhr) {
				if (xhr.status == 502) {
					alert('Server not running');
				}
			}
		});
	};

	self.shut_down = function (vm, event) {
		if (!confirm('Do you really want to shutdown the rasp?')) {
			return;
		}

		$.post({
			url: '/api/shutdown',
			success: function (data) {
				alert('You may now close this window');
			},
			error: function (xhr) {
				if (xhr.status == 502) {
					alert('Server not running');
					return;
				}

				alert('Upsi, something is not working...');
			}
		});
	};

	self.hide_menu = function (vm, event) {
		$('#navigation').animate({
			left: '-100%',
		}, 500);
		$('#overlay').animate({
			opacity: 0,
		}, 500, function () {
			$('#overlay').css({left: '-100%'});
		});
	};

	self.show_menu = function (vm, event) {
		$('#overlay').css({left: '0'});
		$('#navigation').animate({
			left: '0px',
		}, 500);
		$('#overlay').animate({
			opacity: .5,
		}, 500);
	};
}

$(function () {
	var rvm = new RaspiAdmin();

	ko.applyBindings(rvm);

	rvm.load();
});
