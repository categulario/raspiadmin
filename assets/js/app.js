function RaspiAdmin() {
	var self = this;

	self.vmpool = {
		'timelapse': new TimelapseViewModel(),
		'gallery'  : new GalleryViewModel(),
		'loading'  : new LoadingViewModel(),
		'settings' : new SettingsViewModel(),
	};
	self.viewmodel = ko.observable(self.vmpool.loading);
	self.title     = ko.observable('');
	self.settings  = {};

	self.load = function (done) {
		self.viewmodel().load();

		$.get({
			url: '/api/timelapse',
			success: function (data) {
				self.settings = data;
				done();
			},
			error: function (xhr) {
				if (xhr.status == 502) {
					alert('Server not running');
				}
				done();
			}
		});
	};

	self.reload = function (vm, event) {
		$(event.currentTarget).find('i').addClass('fa-spin');
		self.viewmodel().load(function () {
			$(event.currentTarget).find('i').removeClass('fa-spin');
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

	self.hide_menu = function () {
		$('#navigation').animate({
			left: '-100%',
		}, 500);
		$('#overlay').animate({
			opacity: 0,
		}, 500, function () {
			$('#overlay').css({left: '-100%'});
		});
	};

	self.show_menu = function () {
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
	var rvm = window.rvm = new RaspiAdmin();

	ko.applyBindings(rvm);

	rvm.load(function () {
		applyRoutes();
	});
});
