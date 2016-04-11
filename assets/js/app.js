function RaspiAdmin() {
	var self = this;

	self.timelapse_running = ko.observable(false);

	self.timelapse_btn_text = ko.pureComputed(function () {
		if (self.timelapse_running()) {
			return "Stop timelapse";
		} else {
			return "Start timelapse";
		}
	});

	self.update_attrs = function (data) {
		for (var key in data) {
			if (key in self && typeof self[key] == 'function') {
				self[key](data[key]);
			}
		}
	};

	self.load = function (done) {
		$.get({
			url: '/api/settings',
			success: function (data) {
				self.update_attrs(data);

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

	self.toggle_timelapse = function (vm, event) {
		var ladda = $(event.target).ladda();

		ladda.ladda('start');

		$.post({
			url: '/api/timelapse',
			data: {
				'set_running': !self.timelapse_running()
			},
			success: function (data) {
				ladda.ladda('stop');
				self.update_attrs(data);
			},
			error: function (xhr) {
				ladda.ladda('stop');

				if (xhr.status == 502) {
					alert('Server not running');
					return;
				}

				alert('Error while processing request: '+xhr.status);
			}
		});
	};

	self.preview_reload = function (vm, event) {
		event.target.src = '/timelapse/000last.jpg?'+Date.now();
	};

	self.take_photo = function (vm, event) {
		var ladda = $(event.target).ladda();

		ladda.ladda('start');

		$.post({
			url: '/api/take',
			success: function (data) {
				var img = $('#main-image')[0];

				img.src = data.src+'?'+Date.now();

				ladda.ladda('stop');
			},
			error: function (xhr, text, reason) {
				ladda.ladda('stop');

				if (xhr.status == 502) {
					alert('Server not running');
					return;
				}

				if (xhr.responseJSON) {
					alert(xhr.responseJSON.msg);
					return;
				}

				alert('Upsi, something is not working...');
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

	rvm.load(function () {
		ko.applyBindings(rvm);
	});
});
