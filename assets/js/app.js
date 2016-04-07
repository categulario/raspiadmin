function RaspiAdmin() {
	var self = this;

	self.load = function (done) {
		$.get('/api/settings', function (data) {
			console.log(data);
			done();
		});
	}
}

$(function () {
	var rvm = new RaspiAdmin();

	rvm.load(function () {
		ko.applyBindings(rvm);
	});
});
