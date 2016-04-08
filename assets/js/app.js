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

	self.load = function (done) {
		$.get('/api/settings', function (data) {
			for (var key in data) {
				if (key in self && typeof self[key] == 'function') {
					self[key](data[key]);
				}
			}

			done();
		});
	}

	self.toggle_timelapse = function (vm, event) {
		$.post('/api/timelapse', {
			'set_running': self.timelapse_running()
		}, function (data) {
			console.log(data);
		});
	};
}

$(function () {
	var rvm = new RaspiAdmin();

	rvm.load(function () {
		ko.applyBindings(rvm);
	});
});
