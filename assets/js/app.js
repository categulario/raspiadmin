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
		$.get('/api/settings', function (data) {
			self.update_attrs(data);

			done();
		});
	}

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
			error: function (a, b, c) {
				console.log(a);
				console.log(b);
				console.log(c);
				ladda.ladda('stop');
				alert('Error while processing request');
			}
		});
	};
}

$(function () {
	var rvm = new RaspiAdmin();

	rvm.load(function () {
		ko.applyBindings(rvm);
	});
});
