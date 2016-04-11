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
				alert('Request failed, sorry');
				ladda.ladda('stop');
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
