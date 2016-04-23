function TimelapseViewModel() {
	var self = this;

	self.template          = ko.observable('timelapse-template');
	self.title             = ko.observable('Camera');
	self.timelapse_running = ko.observable(false);
	self.mainImageSrc      = ko.observable('timelapse/000last.jpg?'+Date.now());

	self.timelapse_btn_text = ko.pureComputed(function () {
		if (self.timelapse_running()) {
			return "Stop timelapse";
		} else {
			return "Start timelapse";
		}
	});

	self.load = function (done) {
		self.timelapse_running(rvm.settings.timelapse_running);
		done();
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
				self.timelapse_running(data.timelapse_running);
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
		self.mainImageSrc('timelapse/000last.jpg?'+Date.now());
	};

	self.take_photo = function (vm, event) {
		var ladda = $(event.target).ladda();

		ladda.ladda('start');

		$.post({
			url: '/api/take',
			success: function (data) {
				self.mainImageSrc(data.src+'?'+Date.now());

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
}
